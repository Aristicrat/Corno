import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { useLayoutMode } from "../hooks/useLayoutMode";

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
  const { effectiveMode } = useLayoutMode();
  const location = useLocation();
  const navigate = useNavigate();
  const iosLayout = effectiveMode === "ios";
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

  if (!iosLayout) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-[#030b0e]">
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
        <div className="pointer-events-none absolute bottom-3 left-3 z-[70] select-none text-[10px] tracking-[0.02em] text-white/55">
          {SOFTWARE_VERSION}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030b0e] p-6">
      <div className="relative w-full max-w-[393px] aspect-[9/19.5] overflow-hidden rounded-[55px] border-[14px] border-[#0a1217] bg-black shadow-[0_40px_120px_rgba(0,0,0,0.62)]">
        <div className="absolute left-1/2 top-0 z-50 h-[37px] w-[126px] -translate-x-1/2 rounded-b-[20px] bg-black" />
        <div className="absolute inset-0 overflow-hidden rounded-[41px]">
          {children}
          {showEdgeNav && (
            <div className="pointer-events-none absolute inset-0 z-[65]">
              <button
                type="button"
                aria-label="Go Back"
                onClick={goBack}
                className="pointer-events-auto absolute left-0 top-0 bottom-0 w-[18%] min-w-12 max-w-24 bg-transparent"
              />
              <button
                type="button"
                aria-label="Go Forward"
                onClick={goForward}
                className="pointer-events-auto absolute right-0 top-0 bottom-0 w-[18%] min-w-12 max-w-24 bg-transparent"
              />
            </div>
          )}
          <div className="pointer-events-none absolute bottom-3 left-3 z-[70] select-none text-[10px] tracking-[0.02em] text-white/55">
            {SOFTWARE_VERSION}
          </div>
        </div>
      </div>
    </div>
  );
}
