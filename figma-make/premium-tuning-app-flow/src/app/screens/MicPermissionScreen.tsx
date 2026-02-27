import { type CSSProperties, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mic, AlertCircle } from "lucide-react";
import { ParticleField } from "../components/ParticleField";
import { FluidGlass } from "../components/FluidGlass";
import { IPhoneFrame } from "../components/iPhoneFrame";
const MIC_BG = "rgb(7,8,10)";
const MIC_PARTICLE_CYAN = "rgb(0,160,185)";
const MIC_BG_ANIMATION = ["rgb(6,7,9)", "rgb(9,10,12)", "rgb(12,13,15)", "rgb(8,9,11)", "rgb(6,7,9)"];

export function MicPermissionScreen() {
  const navigate = useNavigate();
  const [permissionState, setPermissionState] = useState<"prompt" | "denied" | "granted">("prompt");
  const [isRequesting, setIsRequesting] = useState(false);

  const requestMicrophonePermission = async () => {
    setIsRequesting(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Permission granted
      stream.getTracks().forEach(track => track.stop()); // Stop the stream
      setPermissionState("granted");
      
      // Save permission state
      localStorage.setItem("micPermissionGranted", "true");
      
      // Navigate to tuner
      setTimeout(() => {
        navigate("/tuner");
      }, 600);
      
    } catch (error) {
      // Permission denied
      setPermissionState("denied");
      setIsRequesting(false);
    }
  };

  const refractiveTitleStyle: CSSProperties = {
    color: "rgba(255,255,255,0.96)",
    textShadow: "0 1px 0 rgba(255,255,255,0.35), 0 12px 28px rgba(0,0,0,0.28)",
    letterSpacing: "-0.02em",
  };

  return (
    <IPhoneFrame>
      <div className="relative w-full h-full overflow-hidden flex flex-col">
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundColor: MIC_BG_ANIMATION }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(125% 98% at 18% 12%, rgba(255,255,255,0.15) 0%, rgba(210,214,223,0.08) 23%, rgba(0,0,0,0) 58%), radial-gradient(100% 86% at 82% 80%, rgba(190,196,209,0.14) 0%, rgba(144,150,163,0.06) 30%, rgba(0,0,0,0) 66%)",
          }}
          animate={{
            opacity: [0.48, 0.72, 0.6, 0.68, 0.48],
            scale: [1, 1.035, 1.01, 1.04, 1],
          }}
          transition={{ duration: 10.5, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-[-20%] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 35%, rgba(255,255,255,0.12) 0%, rgba(202,206,216,0.05) 34%, rgba(0,0,0,0) 70%)",
          }}
          animate={{ x: ["-6%", "5%", "-4%", "2%"], y: ["-4%", "3%", "-1%", "2%"], scale: [1, 1.06, 1.02, 1] }}
          transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-[-25%] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 72% 66%, rgba(224,228,236,0.1) 0%, rgba(173,178,189,0.038) 30%, rgba(0,0,0,0) 68%)",
            mixBlendMode: "screen",
          }}
          animate={{ x: ["5%", "-6%", "3%"], y: ["3%", "-4%", "1%"], scale: [1.03, 0.99, 1.04] }}
          transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "conic-gradient(from 120deg at 50% 50%, rgba(255,255,255,0.05), rgba(0,0,0,0) 18%, rgba(210,214,222,0.06) 44%, rgba(0,0,0,0) 62%, rgba(164,170,182,0.05) 82%, rgba(0,0,0,0) 100%)",
            mixBlendMode: "screen",
            filter: "blur(28px)",
          }}
          animate={{ rotate: [0, 16, -12, 0], opacity: [0.13, 0.23, 0.18, 0.13] }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
        />
        <FluidGlass color={MIC_BG} />
        <ParticleField
          tuningState="listening"
          centsDeviation={5}
          hasNote={false}
          formation="cloud"
          particleCount={520}
          sizeScale={3.2}
          formationStrength={0.4}
          spreadMultiplier={1.7}
          backgroundColor={MIC_PARTICLE_CYAN}
          opacityMultiplier={0.74}
        />

        {/* Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 md:px-10">
        {permissionState === "prompt" || permissionState === "granted" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm text-center"
          >
            <motion.div
              animate={
                permissionState === "granted"
                  ? { scale: 1.1, opacity: 0.8 }
                  : { scale: 1 }
              }
              transition={{ duration: 0.4 }}
              className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center border border-white/30 bg-white/10 backdrop-blur-sm"
            >
              <Mic size={32} className="text-white" />
            </motion.div>

            <h1 className="text-3xl font-semibold mb-2" style={refractiveTitleStyle}>
              {permissionState === "granted" ? "All Set!" : "Enable Microphone"}
            </h1>

            <p className="text-sm text-white/85 leading-relaxed mb-5">
              {permissionState === "granted"
                ? "Starting your tuning experience..."
                : "Corno uses microphone input only for real-time pitch detection."}
            </p>

            <p className="text-[11px] text-white/70 mb-5">
              Audio stays local on this device.{" "}
              <Link to="/privacy" className="underline underline-offset-2">
                Privacy Policy
              </Link>
            </p>

            {permissionState === "prompt" && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={requestMicrophonePermission}
                disabled={isRequesting}
                className="px-8 py-3 text-white rounded-full font-semibold text-base border border-white/30 bg-white/20 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequesting ? "Requesting..." : "Enable Microphone"}
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm text-center"
          >
            <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center border border-white/30 bg-white/10 backdrop-blur-sm">
              <AlertCircle size={32} className="text-white" />
            </div>

            <h1 className="text-2xl font-semibold mb-3" style={refractiveTitleStyle}>
              Microphone Access Required
            </h1>

            <div className="text-sm text-white/85 mb-6 leading-relaxed text-left">
              <p className="mb-3 font-medium">To enable microphone access:</p>
              <ol className="space-y-2 pl-5 list-decimal">
                <li>Open your browser settings</li>
                <li>Navigate to Privacy & Security → Site Settings</li>
                <li>Find Microphone permissions</li>
                <li>Allow access for this site</li>
                <li>Reload the page</li>
              </ol>
            </div>

            <div className="space-y-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={requestMicrophonePermission}
                className="w-full px-8 py-3 text-white rounded-full font-semibold text-base border border-white/30 bg-white/20 backdrop-blur-sm"
              >
                Try Again
              </motion.button>

              <button
                onClick={() => navigate("/tuner")}
                className="w-full py-3 text-white/80 text-sm rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
              >
                Continue without microphone (demo mode)
              </button>
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </IPhoneFrame>
  );
}
