import { useCallback, useEffect, useMemo, useState } from "react";

export type LayoutMode = "auto" | "desktop" | "ios";
const LAYOUT_MODE_KEY = "layoutMode";
const LAYOUT_MODE_EVENT = "layout-mode-change";

function detectIOSRuntime() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator;
  const ua = nav.userAgent || "";
  const iOSUA = /iPhone|iPad|iPod/i.test(ua);
  const iPadOSDesktopUA = nav.platform === "MacIntel" && nav.maxTouchPoints > 1;
  const capacitorPlatform =
    (window as Window & { Capacitor?: { getPlatform?: () => string } }).Capacitor?.getPlatform?.() === "ios";
  return iOSUA || iPadOSDesktopUA || capacitorPlatform;
}

function readLayoutMode(): LayoutMode {
  if (typeof window === "undefined") return "auto";
  const stored = window.localStorage.getItem(LAYOUT_MODE_KEY);
  return stored === "desktop" || stored === "ios" || stored === "auto" ? stored : "auto";
}

export function useLayoutMode() {
  const [mode, setModeState] = useState<LayoutMode>(readLayoutMode);

  const setMode = useCallback((next: LayoutMode) => {
    setModeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LAYOUT_MODE_KEY, next);
      window.dispatchEvent(new CustomEvent(LAYOUT_MODE_EVENT, { detail: next }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const sync = () => setModeState(readLayoutMode());
    const onCustom = (event: Event) => {
      const next = (event as CustomEvent<LayoutMode>).detail;
      if (next === "auto" || next === "desktop" || next === "ios") setModeState(next);
      else sync();
    };

    window.addEventListener("storage", sync);
    window.addEventListener(LAYOUT_MODE_EVENT, onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(LAYOUT_MODE_EVENT, onCustom as EventListener);
    };
  }, []);

  const effectiveMode = useMemo<Exclude<LayoutMode, "auto">>(() => {
    if (mode === "desktop" || mode === "ios") return mode;
    return detectIOSRuntime() ? "ios" : "desktop";
  }, [mode]);

  return { mode, setMode, effectiveMode };
}
