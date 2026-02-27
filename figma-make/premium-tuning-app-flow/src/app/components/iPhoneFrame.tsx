import { ReactNode } from "react";
import { useLayoutMode } from "../hooks/useLayoutMode";

interface IPhoneFrameProps {
  children: ReactNode;
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  const { effectiveMode } = useLayoutMode();
  const iosLayout = effectiveMode === "ios";

  if (!iosLayout) {
    return <div className="relative h-screen w-screen overflow-hidden bg-[#030b0e]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030b0e] p-6">
      <div className="relative w-full max-w-[393px] aspect-[9/19.5] overflow-hidden rounded-[55px] border-[14px] border-[#0a1217] bg-black shadow-[0_40px_120px_rgba(0,0,0,0.62)]">
        <div className="absolute left-1/2 top-0 z-50 h-[37px] w-[126px] -translate-x-1/2 rounded-b-[20px] bg-black" />
        <div className="absolute inset-0 overflow-hidden rounded-[41px]">
          {children}
        </div>
      </div>
    </div>
  );
}
