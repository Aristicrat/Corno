import { type CSSProperties, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mic, AlertCircle } from "lucide-react";
import { ParticleField } from "../components/ParticleField";
import { FluidGlass } from "../components/FluidGlass";
import { IPhoneFrame } from "../components/iPhoneFrame";
const MIC_BG = "rgb(10,12,16)";
const MIC_PARTICLE_CYAN = "rgb(0,160,185)";

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
          animate={{ backgroundColor: MIC_BG }}
          transition={{ duration: 1.1, ease: "easeOut" }}
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
