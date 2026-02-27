import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [audioSensitivity, setAudioSensitivity] = useState(
    Number(localStorage.getItem("audioSensitivity") || 50)
  );
  const [particleDensity, setParticleDensity] = useState(
    Number(localStorage.getItem("particleDensity") || 75)
  );
  const [refractionIntensity, setRefractionIntensity] = useState(
    Number(localStorage.getItem("refractionIntensity") || 70)
  );
  const [hapticsEnabled, setHapticsEnabled] = useState(
    localStorage.getItem("hapticsEnabled") !== "false"
  );

  useEffect(() => {
    if (isOpen) {
      // Load current values when modal opens
      setAudioSensitivity(Number(localStorage.getItem("audioSensitivity") || 50));
      setParticleDensity(Number(localStorage.getItem("particleDensity") || 75));
      setRefractionIntensity(Number(localStorage.getItem("refractionIntensity") || 70));
      setHapticsEnabled(localStorage.getItem("hapticsEnabled") !== "false");
    }
  }, [isOpen]);

  const handleAudioSensitivityChange = (value: number) => {
    setAudioSensitivity(value);
    localStorage.setItem("audioSensitivity", value.toString());
  };

  const handleParticleDensityChange = (value: number) => {
    setParticleDensity(value);
    localStorage.setItem("particleDensity", value.toString());
  };

  const handleRefractionIntensityChange = (value: number) => {
    setRefractionIntensity(value);
    localStorage.setItem("refractionIntensity", value.toString());
  };

  const handleHapticsToggle = () => {
    const newValue = !hapticsEnabled;
    setHapticsEnabled(newValue);
    localStorage.setItem("hapticsEnabled", newValue.toString());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-120px)] px-6 py-6">
              <div className="space-y-8">
                {/* Audio Sensitivity */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-base font-semibold text-gray-900">
                      Audio Sensitivity
                    </label>
                    <span className="text-sm font-medium text-gray-500">
                      {audioSensitivity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audioSensitivity}
                    onChange={(e) => handleAudioSensitivityChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Adjust how sensitive the tuner is to quiet notes
                  </p>
                </div>

                {/* Particle Density */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-base font-semibold text-gray-900">
                      Glass Shard Density
                    </label>
                    <span className="text-sm font-medium text-gray-500">
                      {particleDensity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={particleDensity}
                    onChange={(e) => handleParticleDensityChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Control the number of floating glass shards
                  </p>
                </div>

                {/* Refraction Intensity */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-base font-semibold text-gray-900">
                      Refraction Intensity
                    </label>
                    <span className="text-sm font-medium text-gray-500">
                      {refractionIntensity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={refractionIntensity}
                    onChange={(e) => handleRefractionIntensityChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Adjust the visual intensity of glass refraction effects
                  </p>
                </div>

                {/* Haptics Toggle */}
                <div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <div className="text-base font-semibold text-gray-900 mb-1">
                        Haptic Feedback
                      </div>
                      <p className="text-xs text-gray-500">
                        Vibrate when reaching perfect pitch
                      </p>
                    </div>
                    <button
                      onClick={handleHapticsToggle}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        hapticsEnabled ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      <motion.div
                        animate={{ x: hapticsEnabled ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                </div>

                {/* App Info */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center text-sm text-gray-500 space-y-1">
                    <p className="font-semibold text-gray-900">Corno</p>
                    <p>Version 1.0.0</p>
                    <p className="text-xs">Premium Liquid-Glass Tuning System</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
