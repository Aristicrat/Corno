export interface TuningString {
  label: string;
  note: string;
  frequency: number;
}

export interface TuningPreset {
  id: string;
  name: string;
  strings: TuningString[];
}

export const TUNING_PRESETS: TuningPreset[] = [
  { id: "chromatic", name: "Chromatic", strings: [] },
  {
    id: "guitar-standard",
    name: "Guitar Standard",
    strings: [
      { label: "E2", note: "E", frequency: 82.41 },
      { label: "A2", note: "A", frequency: 110.0 },
      { label: "D3", note: "D", frequency: 146.83 },
      { label: "G3", note: "G", frequency: 196.0 },
      { label: "B3", note: "B", frequency: 246.94 },
      { label: "E4", note: "E", frequency: 329.63 },
    ],
  },
  {
    id: "ukulele-standard",
    name: "Ukulele Standard",
    strings: [
      { label: "G4", note: "G", frequency: 392.0 },
      { label: "C4", note: "C", frequency: 261.63 },
      { label: "E4", note: "E", frequency: 329.63 },
      { label: "A4", note: "A", frequency: 440.0 },
    ],
  },
  {
    id: "bass-4",
    name: "Bass 4-String",
    strings: [
      { label: "E1", note: "E", frequency: 41.2 },
      { label: "A1", note: "A", frequency: 55.0 },
      { label: "D2", note: "D", frequency: 73.42 },
      { label: "G2", note: "G", frequency: 98.0 },
    ],
  },
  {
    id: "violin",
    name: "Violin",
    strings: [
      { label: "G3", note: "G", frequency: 196.0 },
      { label: "D4", note: "D", frequency: 293.66 },
      { label: "A4", note: "A", frequency: 440.0 },
      { label: "E5", note: "E", frequency: 659.25 },
    ],
  },
];

export function centsBetweenFrequencies(from: number, to: number): number {
  return 1200 * Math.log2(from / to);
}

export function findNearestTargetString(frequency: number, strings: TuningString[]) {
  if (!strings.length) return null;
  return strings.reduce((closest, candidate) => {
    const prevDelta = Math.abs(centsBetweenFrequencies(frequency, closest.frequency));
    const nextDelta = Math.abs(centsBetweenFrequencies(frequency, candidate.frequency));
    return nextDelta < prevDelta ? candidate : closest;
  });
}
