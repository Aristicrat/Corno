import { motion, AnimatePresence } from "motion/react";
import { X, Circle, Target, Waves } from "lucide-react";

interface TuningGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TuningGuide({ isOpen, onClose }: TuningGuideProps) {
  const guides = [
    {
      icon: Waves,
      state: "Out of Tune",
      color: "#64748b",
      description: "Particles drift chaotically with no pattern",
    },
    {
      icon: Target,
      state: "Approaching",
      color: "#00d4ff",
      description: "Particles begin to converge toward the center",
    },
    {
      icon: Circle,
      state: "In Tune",
      color: "#10b981",
      description: "Particles form a stable, symmetrical pattern",
    },
  ];

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
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0, 0, 0, 0.8)" }}
          />

          {/* Guide Panel */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl p-6"
            style={{ background: "var(--tuner-bg-secondary)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--tuner-text-primary)" }}
              >
                How It Works
              </h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--tuner-bg-card)" }}
              >
                <X size={20} style={{ color: "var(--tuner-text-primary)" }} />
              </motion.button>
            </div>

            {/* Guide Items */}
            <div className="space-y-4 mb-6">
              {guides.map((guide, index) => {
                const Icon = guide.icon;
                return (
                  <motion.div
                    key={guide.state}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ background: "var(--tuner-bg-card)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${guide.color}22`,
                        border: `1px solid ${guide.color}44`,
                      }}
                    >
                      <Icon size={24} style={{ color: guide.color }} />
                    </div>

                    <div className="flex-1">
                      <h3
                        className="font-semibold mb-1"
                        style={{ color: guide.color }}
                      >
                        {guide.state}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--tuner-text-secondary)" }}
                      >
                        {guide.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pro Tip */}
            <div
              className="p-4 rounded-xl"
              style={{
                background: "rgba(0, 212, 255, 0.1)",
                border: "1px solid rgba(0, 212, 255, 0.2)",
              }}
            >
              <p
                className="text-sm"
                style={{ color: "var(--tuner-accent-blue)" }}
              >
                <strong>Pro Tip:</strong> Watch the cents meter for fine-tuning.
                Aim for ±3 cents for professional accuracy.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
