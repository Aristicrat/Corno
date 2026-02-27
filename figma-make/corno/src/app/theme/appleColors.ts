export const APPLE_COLOR_FAMILIES = [
  {
    name: "default",
    tones: [
      "rgb(242,242,247)",
      "rgb(28,28,30)",
      "rgb(255,255,255)",
      "rgb(0,0,0)",
    ],
  },
  {
    name: "red",
    tones: [
      "rgb(255,56,60)",
      "rgb(255,66,69)",
      "rgb(233,21,45)",
      "rgb(255,97,101)",
    ],
  },
  {
    name: "orange",
    tones: [
      "rgb(255,141,40)",
      "rgb(255,146,48)",
      "rgb(197,83,0)",
      "rgb(255,160,86)",
    ],
  },
  {
    name: "yellow",
    tones: [
      "rgb(255,204,0)",
      "rgb(255,214,0)",
      "rgb(161,106,0)",
      "rgb(254,223,67)",
    ],
  },
  {
    name: "green",
    tones: [
      "rgb(52,199,89)",
      "rgb(48,209,88)",
      "rgb(0,137,50)",
      "rgb(74,217,104)",
    ],
  },
  {
    name: "mint",
    tones: [
      "rgb(0,200,179)",
      "rgb(0,218,195)",
      "rgb(0,133,117)",
      "rgb(84,223,203)",
    ],
  },
  {
    name: "teal",
    tones: [
      "rgb(0,195,208)",
      "rgb(0,210,224)",
      "rgb(0,129,152)",
      "rgb(59,221,236)",
    ],
  },
  {
    name: "cyan",
    tones: [
      "rgb(0,192,232)",
      "rgb(60,211,254)",
      "rgb(0,126,174)",
      "rgb(109,217,255)",
    ],
  },
  {
    name: "blue",
    tones: [
      "rgb(0,136,255)",
      "rgb(0,145,255)",
      "rgb(30,110,244)",
      "rgb(92,184,255)",
    ],
  },
  {
    name: "indigo",
    tones: [
      "rgb(97,85,245)",
      "rgb(109,124,255)",
      "rgb(86,74,222)",
      "rgb(167,170,255)",
    ],
  },
  {
    name: "purple",
    tones: [
      "rgb(203,48,224)",
      "rgb(219,52,242)",
      "rgb(176,47,194)",
      "rgb(234,141,255)",
    ],
  },
] as const;

export const APPLE_COLOR_CYCLE = APPLE_COLOR_FAMILIES.flatMap((family) => family.tones);
export const APPLE_COLOR_CYCLE_CHROMATIC = APPLE_COLOR_FAMILIES
  .filter((family) => family.name !== "default")
  .flatMap((family) => family.tones);

export const APPLE_TUNING_COLORS = {
  RED: APPLE_COLOR_FAMILIES.find((f) => f.name === "red")!.tones,
  ORANGE: APPLE_COLOR_FAMILIES.find((f) => f.name === "orange")!.tones,
  YELLOW: APPLE_COLOR_FAMILIES.find((f) => f.name === "yellow")!.tones,
  GREEN: APPLE_COLOR_FAMILIES.find((f) => f.name === "green")!.tones,
  MINT: APPLE_COLOR_FAMILIES.find((f) => f.name === "mint")!.tones,
} as const;

function parseRgb(color: string): [number, number, number] {
  const channels = color.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
  return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0];
}

export function interpolateRgb(from: string, to: string, amount: number): string {
  const [r1, g1, b1] = parseRgb(from);
  const [r2, g2, b2] = parseRgb(to);
  const r = Math.round(r1 + (r2 - r1) * amount);
  const g = Math.round(g1 + (g2 - g1) * amount);
  const b = Math.round(b1 + (b2 - b1) * amount);
  return `rgb(${r},${g},${b})`;
}
