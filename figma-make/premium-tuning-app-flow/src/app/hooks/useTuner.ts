import { useCallback, useEffect, useRef, useState } from "react";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const A4_PITCH = 440;
const TUNED_OFFSET_THRESHOLD = 0.15; // semitones
const TUNED_SUSTAIN_TIME = 900; // ms
const LOWEST_NOTE_HZ = 36.7; // D1
const HIGHEST_NOTE_HZ = 493.9; // B4

export interface TunerString {
  note: string;
  frequency: number;
}

interface UseTunerArgs {
  enabled: boolean;
  preferredDeviceId?: string;
  chromatic: boolean;
  strings: TunerString[];
  autoDetect?: boolean;
  lockedStringIndex?: number;
}

interface TunerState {
  isSupported: boolean;
  isListening: boolean;
  hasSignal: boolean;
  signalLevel: number;
  frequency: number | null;
  selectedStringIndex: number;
  selectedNoteIndex: number;
  noteOffsetSemitone: number | null;
  tuned: boolean;
  error: string | null;
}

function getOffsetFromA4(pitch: number): number {
  return 12 * (Math.log(pitch / A4_PITCH) / Math.log(2));
}

function getIndex(pitch: number): number {
  return Math.round(getOffsetFromA4(pitch));
}

function getSymbol(noteIndex: number): string {
  const octave = 4 + Math.floor((noteIndex + 9) / 12);
  const root = NOTE_NAMES[((noteIndex + 9) % 12 + 12) % 12];
  return `${root}${octave}`;
}

function semitoneDistance(fromHz: number, toHz: number): number {
  return Math.abs(12 * Math.log2(fromHz / toHz));
}

function resolveToTargetFundamental(rawHz: number, targetHz: number): number {
  // Saw/square waves often bias to harmonics. Fold candidates to nearest target fundamental.
  const candidates = [rawHz / 4, rawHz / 3, rawHz / 2, rawHz, rawHz * 2, rawHz * 3, rawHz * 4].filter(
    (f) => f >= LOWEST_NOTE_HZ && f <= HIGHEST_NOTE_HZ
  );
  if (!candidates.length) return rawHz;
  return candidates.reduce((best, candidate) =>
    semitoneDistance(candidate, targetHz) < semitoneDistance(best, targetHz) ? candidate : best
  );
}

function resolveToNearestString(rawHz: number, strings: TunerString[]) {
  return strings.map((target, idx) => {
    const resolved = resolveToTargetFundamental(rawHz, target.frequency);
    return {
      idx,
      resolved,
      distance: semitoneDistance(resolved, target.frequency),
    };
  });
}

function detectPitchAMDF(buffer: Float32Array, sampleRate: number): number | null {
  const minLag = Math.floor(sampleRate / HIGHEST_NOTE_HZ);
  const maxLag = Math.floor(sampleRate / LOWEST_NOTE_HZ);
  if (maxLag >= buffer.length - 4) return null;

  const amdfValues: number[] = [];
  let bestLag = -1;
  let bestValue = Number.POSITIVE_INFINITY;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let sum = 0;
    const limit = buffer.length - lag;
    for (let i = 0; i < limit; i += 1) {
      sum += Math.abs(buffer[i] - buffer[i + lag]);
    }
    const amdf = sum / limit;
    amdfValues.push(amdf);
    if (amdf < bestValue) {
      bestValue = amdf;
      bestLag = lag;
    }
  }

  if (bestLag <= 0) return null;

  // Use the best acceptable local minimum (not first), which reduces octave-up misreads.
  const acceptance = bestValue * 1.12;
  let localBestLag = -1;
  let localBestValue = Number.POSITIVE_INFINITY;
  for (let i = 1; i < amdfValues.length - 1; i += 1) {
    if (amdfValues[i] < acceptance && amdfValues[i] <= amdfValues[i - 1] && amdfValues[i] <= amdfValues[i + 1]) {
      if (amdfValues[i] < localBestValue) {
        localBestValue = amdfValues[i];
        localBestLag = minLag + i;
      }
    }
  }
  if (localBestLag > 0) return sampleRate / localBestLag;

  // Crude confidence guard to avoid random pitch spikes in noise.
  let rms = 0;
  for (let i = 0; i < buffer.length; i += 1) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.0025) return null;

  return sampleRate / bestLag;
}

export function useTuner({
  enabled,
  preferredDeviceId,
  chromatic,
  strings,
  autoDetect = true,
  lockedStringIndex,
}: UseTunerArgs) {
  const [state, setState] = useState<TunerState>({
    isSupported: typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
    isListening: false,
    hasSignal: false,
    signalLevel: 0,
    frequency: null,
    selectedStringIndex: 0,
    selectedNoteIndex: getIndex(440),
    noteOffsetSemitone: null,
    tuned: false,
    error: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const tunedSinceRef = useRef<number | null>(null);
  const stableFreqRef = useRef<number | null>(null);
  const freqHistoryRef = useRef<number[]>([]);
  const noteCandidateRef = useRef<number | null>(null);
  const noteCandidateFramesRef = useRef(0);
  const stringCandidateRef = useRef<number | null>(null);
  const stringCandidateFramesRef = useRef(0);
  const offsetHistoryRef = useRef<number[]>([]);
  const displayFreqRef = useRef<number | null>(null);
  const outlierFramesRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    analyserRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    tunedSinceRef.current = null;
    stableFreqRef.current = null;
    freqHistoryRef.current = [];
    noteCandidateRef.current = null;
    noteCandidateFramesRef.current = 0;
    stringCandidateRef.current = null;
    stringCandidateFramesRef.current = 0;
    offsetHistoryRef.current = [];
    displayFreqRef.current = null;
    outlierFramesRef.current = 0;
    setState((prev) => ({
      ...prev,
      isListening: false,
      hasSignal: false,
      signalLevel: 0,
      frequency: null,
      noteOffsetSemitone: null,
      tuned: false,
    }));
  }, []);

  const start = useCallback(async () => {
    if (!state.isSupported) {
      setState((prev) => ({ ...prev, error: "Microphone is not supported in this browser." }));
      return;
    }

    const strict = preferredDeviceId
      ? { audio: { deviceId: { exact: preferredDeviceId }, channelCount: 1 } }
      : { audio: { channelCount: 1 } };
    const fallback = preferredDeviceId
      ? { audio: { deviceId: { ideal: preferredDeviceId } } }
      : { audio: true };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(strict as MediaStreamConstraints).catch(() =>
        navigator.mediaDevices.getUserMedia(fallback as MediaStreamConstraints)
      );
      const context = new AudioContext();
      if (context.state === "suspended") await context.resume();

      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      context.createMediaStreamSource(stream).connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = context;
      analyserRef.current = analyser;

      setState((prev) => ({ ...prev, isListening: true, error: null }));

      const data = new Float32Array(analyser.fftSize);
      const sensitivity = Math.min(Math.max(Number(localStorage.getItem("audioSensitivity") || 50), 0), 100);
      const signalThreshold = 0.0048 - (sensitivity / 100) * 0.0033;

      const tick = () => {
        if (!analyserRef.current || !audioContextRef.current) return;
        analyserRef.current.getFloatTimeDomainData(data);

        let rms = 0;
        for (let i = 0; i < data.length; i += 1) rms += data[i] * data[i];
        rms = Math.sqrt(rms / data.length);

        const freq = detectPitchAMDF(data, audioContextRef.current.sampleRate);
        if (freq && rms > signalThreshold) {
          const previousStable = stableFreqRef.current;
          let corrected = freq;

          if (!chromatic && lockedStringIndex !== undefined && strings[lockedStringIndex]) {
            corrected = resolveToTargetFundamental(freq, strings[lockedStringIndex].frequency);
          } else if (!chromatic && previousStable) {
            const harmonicCandidates = [freq / 2, freq, freq * 2].filter(
              (f) => f >= LOWEST_NOTE_HZ && f <= HIGHEST_NOTE_HZ
            );
            corrected = harmonicCandidates.reduce((best, candidate) => {
              const bestDist = Math.abs(Math.log2(best / previousStable));
              const dist = Math.abs(Math.log2(candidate / previousStable));
              return dist < bestDist ? candidate : best;
            }, freq);
          } else if (chromatic) {
            const reference = previousStable ?? freq;
            const harmonicCandidates = [freq, freq / 2, freq * 2].filter(
              (f) => f >= LOWEST_NOTE_HZ && f <= HIGHEST_NOTE_HZ
            );
            corrected = harmonicCandidates.reduce((best, candidate) => {
              const bestDist = Math.abs(Math.log2(best / reference));
              const dist = Math.abs(Math.log2(candidate / reference));
              return dist < bestDist ? candidate : best;
            }, freq);
          }

          // If pitch suddenly jumps by nearly half an octave, reset smoothing baseline.
          const stabilized =
            previousStable && Math.abs(Math.log2(corrected / previousStable)) <= 0.45
              ? previousStable + (corrected - previousStable) * 0.2
              : corrected;
          stableFreqRef.current = stabilized;

          freqHistoryRef.current.push(stabilized);
          if (freqHistoryRef.current.length > 5) freqHistoryRef.current.shift();
          const sorted = [...freqHistoryRef.current].sort((a, b) => a - b);
          const medianFreq = sorted[Math.floor(sorted.length / 2)];
          const prevDisplay = displayFreqRef.current;
          let displayFreq = medianFreq;
          if (prevDisplay) {
            const jumpSemitones = Math.abs(12 * Math.log2(displayFreq / prevDisplay));
            const suspiciousJump = jumpSemitones > 1.2 && rms < signalThreshold * 4.8;
            if (suspiciousJump) {
              outlierFramesRef.current += 1;
              if (outlierFramesRef.current < 4) displayFreq = prevDisplay;
            } else {
              outlierFramesRef.current = 0;
            }
            const smoothing = chromatic ? 0.32 : 0.2;
            displayFreq = prevDisplay + (displayFreq - prevDisplay) * smoothing;
          }
          displayFreqRef.current = displayFreq;

          setState((prev) => {
            let selectedStringIndex = prev.selectedStringIndex;
            let selectedNoteIndex = prev.selectedNoteIndex;
            let resolvedFrequency = displayFreq;
            const notePlaying = getOffsetFromA4(displayFreq);

            if (!chromatic && lockedStringIndex !== undefined && strings.length > 0) {
              selectedStringIndex = Math.max(0, Math.min(lockedStringIndex, strings.length - 1));
              stringCandidateRef.current = null;
              stringCandidateFramesRef.current = 0;
            } else if (autoDetect) {
              if (chromatic) {
                const candidate = Math.round(notePlaying);
                const diffToCurrent = Math.abs(notePlaying - selectedNoteIndex);
                if (candidate !== selectedNoteIndex && diffToCurrent > 0.52) {
                  if (noteCandidateRef.current === candidate) noteCandidateFramesRef.current += 1;
                  else {
                    noteCandidateRef.current = candidate;
                    noteCandidateFramesRef.current = 1;
                  }
                  if (noteCandidateFramesRef.current >= 3) {
                    selectedNoteIndex = candidate;
                    noteCandidateRef.current = null;
                    noteCandidateFramesRef.current = 0;
                  }
                } else {
                  noteCandidateRef.current = null;
                  noteCandidateFramesRef.current = 0;
                }
              } else if (strings.length > 0) {
                const candidates = resolveToNearestString(displayFreq, strings);
                const nearest = candidates.reduce((best, candidate) =>
                  candidate.distance < best.distance ? candidate : best
                );
                const currentCandidate = candidates[selectedStringIndex] ?? nearest;
                if (nearest.idx !== selectedStringIndex) {
                  const significantlyBetter =
                    nearest.distance + 0.12 < currentCandidate.distance && nearest.distance <= 1.4;
                  if (significantlyBetter) {
                    if (stringCandidateRef.current === nearest.idx) stringCandidateFramesRef.current += 1;
                    else {
                      stringCandidateRef.current = nearest.idx;
                      stringCandidateFramesRef.current = 1;
                    }
                    if (stringCandidateFramesRef.current >= 3) {
                      selectedStringIndex = nearest.idx;
                      stringCandidateRef.current = null;
                      stringCandidateFramesRef.current = 0;
                    }
                  } else {
                    stringCandidateRef.current = null;
                    stringCandidateFramesRef.current = 0;
                  }
                } else {
                  stringCandidateRef.current = null;
                  stringCandidateFramesRef.current = 0;
                }
              }
            }

            if (!chromatic && strings[selectedStringIndex]) {
              resolvedFrequency = resolveToTargetFundamental(displayFreq, strings[selectedStringIndex].frequency);
            }

            const resolvedNotePlaying = getOffsetFromA4(resolvedFrequency); // target-aware note offset
            const noteIndex = chromatic
              ? selectedNoteIndex
              : strings[selectedStringIndex]
                ? getOffsetFromA4(strings[selectedStringIndex].frequency)
                : selectedNoteIndex;
            const rawOffset = resolvedNotePlaying - noteIndex;
            offsetHistoryRef.current.push(rawOffset);
            if (offsetHistoryRef.current.length > 7) offsetHistoryRef.current.shift();
            const sortedOffsets = [...offsetHistoryRef.current].sort((a, b) => a - b);
            let noteOffsetSemitone = sortedOffsets[Math.floor(sortedOffsets.length / 2)];

            // Clamp violent frame-to-frame jumps (often harmonic toggles on square/saw signals).
            if (prev.noteOffsetSemitone !== null) {
              const delta = noteOffsetSemitone - prev.noteOffsetSemitone;
              if (Math.abs(delta) > 0.28) {
                noteOffsetSemitone = prev.noteOffsetSemitone + Math.sign(delta) * 0.28;
              }
            }
            const now = Date.now();
            const withinThreshold = Math.abs(noteOffsetSemitone) <= TUNED_OFFSET_THRESHOLD;

            if (withinThreshold) {
              if (!tunedSinceRef.current) tunedSinceRef.current = now;
            } else {
              tunedSinceRef.current = null;
            }

            const tuned =
              tunedSinceRef.current !== null && now - tunedSinceRef.current >= TUNED_SUSTAIN_TIME;

            return {
              ...prev,
              hasSignal: true,
              signalLevel: rms,
              // Show actual detected/stabilized pitch in UI, not target-forced corrected pitch.
              frequency: displayFreq,
              selectedStringIndex,
              selectedNoteIndex,
              noteOffsetSemitone,
              tuned,
            };
          });
        } else {
          tunedSinceRef.current = null;
          stableFreqRef.current = null;
          freqHistoryRef.current = [];
          noteCandidateRef.current = null;
          noteCandidateFramesRef.current = 0;
          stringCandidateRef.current = null;
          stringCandidateFramesRef.current = 0;
          offsetHistoryRef.current = [];
          displayFreqRef.current = null;
          outlierFramesRef.current = 0;
          setState((prev) => ({
            ...prev,
            hasSignal: false,
            signalLevel: rms,
            frequency: null,
            noteOffsetSemitone: null,
            tuned: false,
          }));
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      tick();
    } catch {
      setState((prev) => ({
        ...prev,
        isListening: false,
        error: "Microphone unavailable. Check browser and system input settings.",
      }));
    }
  }, [autoDetect, chromatic, lockedStringIndex, preferredDeviceId, state.isSupported, strings]);

  useEffect(() => {
    if (chromatic) return;
    if (!strings.length) return;
    if (lockedStringIndex === undefined) return;
    const clamped = Math.max(0, Math.min(lockedStringIndex, strings.length - 1));
    setState((prev) => (prev.selectedStringIndex === clamped ? prev : { ...prev, selectedStringIndex: clamped }));
  }, [chromatic, lockedStringIndex, strings]);

  useEffect(() => {
    if (enabled) start();
    else stop();
    return stop;
  }, [enabled, start, stop]);

  return { ...state, start, stop, getSymbol };
}
