import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";
import { useState } from "react";

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [
  { id: "chromatic", name: "Chromatic", description: "All notes (A-G#)" },
  { id: "guitar-standard", name: "Guitar - Standard", description: "E A D G B E" },
  { id: "guitar-drop-d", name: "Guitar - Drop D", description: "D A D G B E" },
  { id: "bass-4", name: "Bass (4-string)", description: "E A D G" },
  { id: "bass-5", name: "Bass (5-string)", description: "B E A D G" },
  { id: "violin", name: "Violin", description: "G D A E" },
  { id: "ukulele", name: "Ukulele", description: "G C E A" },
  { id: "mandolin", name: "Mandolin", description: "G D A E" },
];

export function PresetsModal({ isOpen, onClose }: PresetsModalProps) {
  const [selectedPreset, setSelectedPreset] = useState(
    localStorage.getItem("selectedPreset") || "chromatic"
  );

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    localStorage.setItem("selectedPreset", presetId);
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
              <h2 className="text-2xl font-bold text-gray-900">Instrument Presets</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-120px)] px-6 py-4">
              <div className="space-y-3">
                {PRESETS.map((preset) => (
                  <motion.button
                    key={preset.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${
                      selectedPreset === preset.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">{preset.name}</div>
                        <div
                          className={`text-sm ${
                            selectedPreset === preset.id ? "text-white/80" : "text-gray-500"
                          }`}
                        >
                          {preset.description}
                        </div>
                      </div>
                      {selectedPreset === preset.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-4"
                        >
                          <Check size={24} className="text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
