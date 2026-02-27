import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { ParticleField } from "../components/ParticleField";
import { IPhoneFrame } from "../components/iPhoneFrame";
import { FluidGlass } from "../components/FluidGlass";
import { GlassSurface } from "../components/GlassSurface";
import { APPLE_COLOR_CYCLE_CHROMATIC, APPLE_TUNING_COLORS, interpolateRgb } from "../theme/appleColors";
import { TUNING_PRESETS, type TuningPreset, type TuningString } from "../theme/tuningPresets";
import { useTuner } from "../hooks/useTuner";

type TuningState = "listening" | "transitional" | "inTune";

function getTuningDirection(
  centsDeviation: number,
  hasNote: boolean,
  signalLevel: number
): { label: string; symbol: string; color: string } {
  if (!hasNote || signalLevel < 0.003) {
    return { label: "Listening...", symbol: "•", color: "rgba(255,255,255,0.75)" };
  }

  const abs = Math.abs(centsDeviation);
  if (abs <= 3) return { label: "In Tune", symbol: "•", color: "rgba(74,217,104,0.95)" };
  if (abs <= 10) {
    if (centsDeviation < 0) return { label: "Slightly Up", symbol: "↑", color: "rgba(255,255,255,0.92)" };
    return { label: "Slightly Down", symbol: "↓", color: "rgba(255,255,255,0.92)" };
  }
  if (centsDeviation < 0) return { label: "Tune Up", symbol: "↑", color: "rgba(255,255,255,0.92)" };
  return { label: "Tune Down", symbol: "↓", color: "rgba(255,255,255,0.92)" };
}

function getTuningColor(centsDeviation: number, isStable: boolean): string {
  const absCents = Math.abs(centsDeviation);
  const { RED, ORANGE, YELLOW, GREEN, MINT } = APPLE_TUNING_COLORS;

  if (absCents > 30) {
    const index = Math.floor(Math.random() * RED.length);
    const nextIndex = (index + 1) % RED.length;
    return interpolateRgb(RED[index], RED[nextIndex], Math.random());
  }
  if (absCents > 20) return interpolateRgb(RED[0], ORANGE[0], (30 - absCents) / 10);
  if (absCents > 10) return interpolateRgb(ORANGE[1], YELLOW[0], (20 - absCents) / 10);
  if (absCents > 5) return interpolateRgb(YELLOW[1], GREEN[0], (10 - absCents) / 5);
  if (isStable && absCents < 2) return interpolateRgb(GREEN[1], MINT[0], Math.random() * 0.3);

  const index = Math.floor(Math.random() * GREEN.length);
  const nextIndex = (index + 1) % GREEN.length;
  return interpolateRgb(GREEN[index], GREEN[nextIndex], Math.random() * 0.5);
}

export function MainTunerScreen() {
  const [backgroundColor, setBackgroundColor] = useState(APPLE_COLOR_CYCLE_CHROMATIC[0]);
  const [moodCycleIndex, setMoodCycleIndex] = useState(0);
  const [colorTransitionMs, setColorTransitionMs] = useState(6200);
  const [liveEnabled, setLiveEnabled] = useState(localStorage.getItem("micPermissionGranted") === "true");
  const [selectedPresetId, setSelectedPresetId] = useState(localStorage.getItem("selectedPreset") || "chromatic");
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedInputId, setSelectedInputId] = useState(localStorage.getItem("selectedInputId") || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [particlePhase, setParticlePhase] = useState<"normal" | "smile">("normal");
  const [tuneHoldProgress, setTuneHoldProgress] = useState(0);
  const [displayHasNote, setDisplayHasNote] = useState(false);
  const hasNoteRef = useRef(false);
  const tunedRef = useRef(false);
  const tuneHoldMsRef = useRef(0);
  const noteLossTimerRef = useRef<number | null>(null);
  const phaseTickTimerRef = useRef<number | null>(null);
  const lastPhaseTickRef = useRef<number>(performance.now());

  const selectedPreset: TuningPreset =
    TUNING_PRESETS.find((preset) => preset.id === selectedPresetId) ?? TUNING_PRESETS[0];
  const chromatic = selectedPreset.id === "chromatic";

  const {
    isSupported,
    isListening,
    hasSignal,
    signalLevel,
    selectedStringIndex,
    selectedNoteIndex,
    noteOffsetSemitone,
    tuned,
    error,
    start,
    getSymbol,
  } = useTuner({
    enabled: liveEnabled,
    preferredDeviceId: selectedInputId || undefined,
    chromatic,
    strings: selectedPreset.strings,
    autoDetect: true,
  });

  const centsDeviation = (noteOffsetSemitone ?? 0) * 100;
  const hasNote = hasSignal && noteOffsetSemitone !== null;
  const tuningState: TuningState = displayHasNote ? (tuned ? "inTune" : "transitional") : "listening";
  const targetString: TuningString | null = chromatic ? null : selectedPreset.strings[selectedStringIndex] ?? null;

  const currentNote = useMemo(() => {
    if (!hasNote) return "--";
    if (chromatic) return getSymbol(selectedNoteIndex).replace(/[0-9]/g, "");
    return targetString?.note ?? "--";
  }, [chromatic, getSymbol, hasNote, selectedNoteIndex, targetString]);

  const tuningDirection = getTuningDirection(centsDeviation, hasNote, signalLevel);

  const refreshAudioInputs = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputs = devices.filter((device) => device.kind === "audioinput");
    setAudioInputs(inputs);
    if (!selectedInputId && inputs[0]?.deviceId) {
      setSelectedInputId(inputs[0].deviceId);
      localStorage.setItem("selectedInputId", inputs[0].deviceId);
    }
  };

  useEffect(() => {
    refreshAudioInputs();
  }, []);

  useEffect(() => {
    hasNoteRef.current = displayHasNote;
    tunedRef.current = tuned;

    if (hasNote) {
      if (noteLossTimerRef.current) {
        window.clearTimeout(noteLossTimerRef.current);
        noteLossTimerRef.current = null;
      }
      setDisplayHasNote(true);
      return;
    }

    if (!noteLossTimerRef.current) {
      // Tolerate short detection dropouts to avoid "looking for note" flicker.
      noteLossTimerRef.current = window.setTimeout(() => {
        setDisplayHasNote(false);
        noteLossTimerRef.current = null;
      }, 850);
    }
  }, [hasNote, tuned, displayHasNote, centsDeviation]);

  useEffect(() => {
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(220, now - lastPhaseTickRef.current);
      lastPhaseTickRef.current = now;

      const has = hasNoteRef.current;
      const isTuned = tunedRef.current;

      if (has && isTuned) {
        tuneHoldMsRef.current = Math.min(5000, tuneHoldMsRef.current + dt);
        const progress = tuneHoldMsRef.current / 5000;
        setTuneHoldProgress(progress);
        if (progress >= 1 && particlePhase !== "smile") {
          setParticlePhase("smile");
        }
      } else {
        // Smile is only allowed for continuous in-tune hold.
        tuneHoldMsRef.current = 0;
        setTuneHoldProgress(0);
        if (particlePhase !== "normal") setParticlePhase("normal");
      }
    };

    phaseTickTimerRef.current = window.setInterval(tick, 120);
    return () => {
      if (phaseTickTimerRef.current) window.clearInterval(phaseTickTimerRef.current);
      if (noteLossTimerRef.current) window.clearTimeout(noteLossTimerRef.current);
    };
  }, [particlePhase]);

  useEffect(() => {
    if (hasNote) {
      const color = getTuningColor(centsDeviation, tuned);
      setBackgroundColor(color);
      setColorTransitionMs(420);
      return;
    }
    setColorTransitionMs(6200);
    const interval = setInterval(() => {
      setMoodCycleIndex((prev) => {
        const nextIndex = (prev + 1) % APPLE_COLOR_CYCLE_CHROMATIC.length;
        setBackgroundColor(APPLE_COLOR_CYCLE_CHROMATIC[nextIndex]);
        return nextIndex;
      });
    }, 7000);
    return () => clearInterval(interval);
  }, [centsDeviation, hasNote, tuned]);

  const enableLiveTuner = async () => {
    localStorage.setItem("micPermissionGranted", "true");
    setLiveEnabled(true);
    await start();
    await refreshAudioInputs();
  };

  const changePreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    localStorage.setItem("selectedPreset", presetId);
  };

  const changeInput = (inputId: string) => {
    setSelectedInputId(inputId);
    localStorage.setItem("selectedInputId", inputId);
  };

  return (
    <IPhoneFrame>
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor }}
        transition={{ duration: colorTransitionMs / 1000, ease: "easeInOut" }}
      />
      <FluidGlass color={backgroundColor} />

      <div className="absolute inset-0">
        <ParticleField
          tuningState={tuningState}
          particleCount={500}
          centsDeviation={centsDeviation}
          hasNote={displayHasNote}
          formation={
            particlePhase === "smile" ? "smile" : "cloud"
          }
          sizeScale={2.6}
          formationStrength={0.4}
          spreadMultiplier={1.7}
          backgroundColor={backgroundColor}
          tuneHoldProgress={tuneHoldProgress}
          morphRingToCloudOnTune={true}
        />
      </div>

      <div className="absolute top-6 left-5 z-30">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="h-12 w-12 rounded-2xl border border-white/25 bg-white/16 backdrop-blur-sm flex items-center justify-center"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? (
            <X size={20} className="text-white" />
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="block h-[2px] w-5 rounded-full bg-white/95" />
              <span className="block h-[2px] w-5 rounded-full bg-white/95" />
              <span className="block h-[2px] w-5 rounded-full bg-white/95" />
            </div>
          )}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="absolute top-20 left-5 right-5 z-20 max-w-sm"
          >
            <GlassSurface className="rounded-2xl p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-white/80 text-xs uppercase tracking-[0.2em]">Instrument</div>
                <select
                  value={selectedPresetId}
                  onChange={(event) => changePreset(event.target.value)}
                  className="rounded-lg border border-white/20 bg-white/20 px-3 py-1.5 text-sm text-white outline-none"
                >
                  {TUNING_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id} className="text-black">
                      {preset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-white/75 text-[11px] uppercase tracking-[0.18em]">Mic Input</div>
                <button
                  onClick={refreshAudioInputs}
                  className="text-[11px] px-2 py-1 rounded-md border border-white/25 bg-white/10 text-white/90"
                >
                  Refresh
                </button>
              </div>
              <select
                value={selectedInputId}
                onChange={(event) => changeInput(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/20 bg-white/20 px-3 py-2 text-xs text-white outline-none"
              >
                {audioInputs.length === 0 && <option className="text-black">No mic devices found</option>}
                {audioInputs.map((input, idx) => (
                  <option key={input.deviceId || `${idx}`} value={input.deviceId} className="text-black">
                    {input.label || `Microphone ${idx + 1}`}
                  </option>
                ))}
              </select>

              {!chromatic && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedPreset.strings.map((stringTarget, idx) => (
                    <span
                      key={stringTarget.label}
                      className="rounded-full px-2 py-0.5 text-[11px]"
                      style={{
                        background: idx === selectedStringIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                        color: idx === selectedStringIndex ? "#0f172a" : "#ffffff",
                      }}
                    >
                      {stringTarget.label}
                    </span>
                  ))}
                </div>
              )}
            </GlassSurface>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {displayHasNote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 pb-28 flex flex-col items-center px-6"
          >
            <div className="px-8 py-7 w-full max-w-sm">
              <div
                className="text-white/78 text-[124px] font-extralight tracking-tight leading-none text-center"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                  fontWeight: 200,
                  textShadow: "0 2px 20px rgba(0,0,0,0.2)",
                }}
              >
                {currentNote}
              </div>

              <div className="mt-2 flex justify-center">
                <div
                  className="rounded-full px-3 py-1 text-[11px] tracking-[0.14em] uppercase"
                  style={{
                    color: tuningDirection.color,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.16)",
                  }}
                >
                  {tuningDirection.symbol} {tuningDirection.label}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!displayHasNote && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            className="absolute bottom-0 left-0 right-0 pb-20 px-6"
          >
            <GlassSurface className="rounded-3xl p-5 w-full max-w-sm mx-auto">
              <div className="text-white text-center space-y-3">
                <div className="text-base font-medium">
                  {liveEnabled ? "Listening for a stable note..." : "Enable live tuning"}
                </div>
                <div className="text-sm opacity-85">
                  {error
                    ? error
                    : isSupported
                      ? isListening
                        ? "Play a sustained note near your microphone."
                        : "Tap Start Live Tuner to initialize the microphone."
                      : "This browser does not support microphone tuning."}
                </div>
                {isSupported && (!isListening || !liveEnabled || !!error) && (
                  <button
                    onClick={enableLiveTuner}
                    className="mt-2 rounded-full px-5 py-2 text-sm font-semibold text-black bg-white/90"
                  >
                    {isListening ? "Restart Live Tuner" : "Start Live Tuner"}
                  </button>
                )}
              </div>
            </GlassSurface>
          </motion.div>
        )}
      </AnimatePresence>
    </IPhoneFrame>
  );
}
