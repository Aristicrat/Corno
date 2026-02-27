import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

interface IPhoneFrameProps {
  children: ReactNode;
}

const SOFTWARE_VERSION = "v1.0.0";
const FLOW_ROUTES = ["/", "/mic-permission", "/tuner"] as const;

function normalizePath(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = normalizePath(location.pathname);
  const currentIndex = FLOW_ROUTES.indexOf(currentPath as (typeof FLOW_ROUTES)[number]);
  const showEdgeNav = currentIndex >= 0;

  const goBack = () => {
    if (currentIndex <= 0) return;
    navigate(FLOW_ROUTES[currentIndex - 1]);
  };

  const goForward = () => {
    if (currentIndex >= FLOW_ROUTES.length - 1) return;
    navigate(FLOW_ROUTES[currentIndex + 1]);
  };

  return (
    <div className="relative h-screen min-h-[100dvh] w-screen overflow-hidden bg-[#030b0e]">
      {children}
      {showEdgeNav && (
        <div className="pointer-events-none absolute inset-0 z-[65]">
          <button
            type="button"
            aria-label="Go Back"
            onClick={goBack}
            className="pointer-events-auto absolute left-0 top-0 bottom-0 w-[12vw] min-w-14 max-w-28 bg-transparent"
          />
          <button
            type="button"
            aria-label="Go Forward"
            onClick={goForward}
            className="pointer-events-auto absolute right-0 top-0 bottom-0 w-[12vw] min-w-14 max-w-28 bg-transparent"
          />
        </div>
      )}
      <div
        className="pointer-events-none absolute z-[70] select-none text-[10px] tracking-[0.02em] text-white/55"
        style={{
          left: "max(0.75rem, env(safe-area-inset-left))",
          bottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        {SOFTWARE_VERSION}
      </div>
    </div>
  );
}
