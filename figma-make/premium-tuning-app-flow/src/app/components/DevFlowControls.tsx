import { useLocation, useNavigate } from "react-router";
import { useLayoutMode } from "../hooks/useLayoutMode";

const FLOW_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/mic-permission", label: "Mic" },
  { path: "/tuner", label: "Tuner" },
];

export function DevFlowControls() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode, effectiveMode } = useLayoutMode();
  const currentIndex = FLOW_ROUTES.findIndex((route) => route.path === location.pathname);

  if (!import.meta.env.DEV) return null;

  const goBack = () => {
    if (currentIndex <= 0) return;
    navigate(FLOW_ROUTES[currentIndex - 1].path);
  };

  const goForward = () => {
    if (currentIndex < 0 || currentIndex >= FLOW_ROUTES.length - 1) return;
    navigate(FLOW_ROUTES[currentIndex + 1].path);
  };

  return (
    <div className="fixed right-4 bottom-4 z-[1000]">
      <div
        className="rounded-2xl p-3 text-xs text-white"
        style={{
          background: "rgba(0,0,0,0.52)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.24)",
        }}
      >
        <div className="mb-2 text-white/80">Dev Flow</div>
        <div className="mb-2 flex gap-2">
          <button
            onClick={goBack}
            disabled={currentIndex <= 0}
            className="rounded-lg bg-white/20 px-2 py-1 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={goForward}
            disabled={currentIndex < 0 || currentIndex >= FLOW_ROUTES.length - 1}
            className="rounded-lg bg-white/20 px-2 py-1 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Forward
          </button>
        </div>
        <div className="mb-2">
          <div className="mb-1 text-white/75">Layout ({effectiveMode})</div>
          <div className="flex gap-2">
            {(["auto", "desktop", "ios"] as const).map((layoutMode) => (
              <button
                key={layoutMode}
                onClick={() => setMode(layoutMode)}
                className="rounded-lg px-2 py-1"
                style={{
                  background: mode === layoutMode ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                  color: mode === layoutMode ? "#0f172a" : "#ffffff",
                }}
              >
                {layoutMode}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {FLOW_ROUTES.map((route) => {
            const active = location.pathname === route.path;
            return (
              <button
                key={route.path}
                onClick={() => navigate(route.path)}
                className="rounded-lg px-2 py-1"
                style={{
                  background: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                  color: active ? "#0f172a" : "#ffffff",
                }}
              >
                {route.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
