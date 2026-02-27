import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ParticleField } from "../components/ParticleField";
import { FluidGlass } from "../components/FluidGlass";
import { IPhoneFrame } from "../components/iPhoneFrame";
import { interpolateRgb } from "../theme/appleColors";

const HOME_PALETTE = [
  "rgb(0,200,179)",
  "rgb(0,195,208)",
  "rgb(0,192,232)",
  "rgb(84,223,203)",
  "rgb(59,221,236)",
];

export function SplashScreen() {
  const navigate = useNavigate();
  const [, setMoodCycleIndex] = useState(0);
  const [bgColor, setBgColor] = useState(HOME_PALETTE[0]);
  const [transitionMs, setTransitionMs] = useState(6200);

  useEffect(() => {
    const interval = setInterval(() => {
      setMoodCycleIndex((prev) => {
        const next = (prev + 1) % HOME_PALETTE.length;
        setBgColor(interpolateRgb(HOME_PALETTE[prev], HOME_PALETTE[next], 0.35));
        return next;
      });
      setTransitionMs(6400);
    }, 7200);
    return () => clearInterval(interval);
  }, []);

  const advance = useCallback(() => {
    navigate("/mic-permission");
  }, [navigate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        advance();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advance]);

  return (
    <IPhoneFrame>
      <div className="relative w-full h-full overflow-hidden cursor-pointer" onClick={advance}>
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundColor: bgColor }}
          transition={{ duration: transitionMs / 1000, ease: "easeInOut" }}
        />
        <FluidGlass color={bgColor} />
        <ParticleField
          tuningState="listening"
          centsDeviation={4}
          hasNote={false}
          particleCount={520}
          formation="cloud"
          sizeScale={3.2}
          formationStrength={0.4}
          spreadMultiplier={1.7}
          backgroundColor={bgColor}
        />

        <div className="absolute inset-x-0 top-[62%] z-20 flex justify-center pointer-events-none">
          <div
            className="text-white/90 text-[44px] tracking-[-0.04em] font-light"
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
              textShadow: "0 10px 28px rgba(0,0,0,0.24), 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            Corno
          </div>
        </div>
      </div>
    </IPhoneFrame>
  );
}
