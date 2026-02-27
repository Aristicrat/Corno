import { useEffect, useState } from "react";
import { APPLE_COLOR_CYCLE_CHROMATIC } from "./appleColors";

interface UseZenColorCycleOptions {
  stepMs?: number;
  startIndex?: number;
  cycleKey?: string;
}

type CycleState = {
  index: number;
  timestamp: number;
};

const cycleStore: Record<string, CycleState> = {};

function getState(cycleKey: string, startIndex: number): CycleState {
  if (!cycleStore[cycleKey]) {
    cycleStore[cycleKey] = { index: startIndex, timestamp: Date.now() };
  }
  return cycleStore[cycleKey];
}

export function useZenColorCycle(options: UseZenColorCycleOptions = {}) {
  const { stepMs = 7000, startIndex = 0, cycleKey = "global" } = options;
  const safeStart =
    ((startIndex % APPLE_COLOR_CYCLE_CHROMATIC.length) + APPLE_COLOR_CYCLE_CHROMATIC.length) %
    APPLE_COLOR_CYCLE_CHROMATIC.length;
  const initialState = getState(cycleKey, safeStart);
  const [bgColor, setBgColor] = useState(APPLE_COLOR_CYCLE_CHROMATIC[initialState.index]);

  useEffect(() => {
    const state = getState(cycleKey, safeStart);
    const elapsedSteps = Math.floor((Date.now() - state.timestamp) / stepMs);
    if (elapsedSteps > 0) {
      state.index = (state.index + elapsedSteps) % APPLE_COLOR_CYCLE_CHROMATIC.length;
      state.timestamp += elapsedSteps * stepMs;
      setBgColor(APPLE_COLOR_CYCLE_CHROMATIC[state.index]);
    }

    const interval = setInterval(() => {
      state.index = (state.index + 1) % APPLE_COLOR_CYCLE_CHROMATIC.length;
      state.timestamp = Date.now();
      setBgColor(APPLE_COLOR_CYCLE_CHROMATIC[state.index]);
    }, stepMs);

    return () => clearInterval(interval);
  }, [cycleKey, safeStart, stepMs]);

  return bgColor;
}
