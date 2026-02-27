import { motion } from "motion/react";

interface StatusIndicatorProps {
  status: "listening" | "processing" | "inTune" | "error";
  label?: string;
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case "inTune":
        return "var(--tuner-color-perfect)";
      case "error":
        return "#EF4444";
      case "processing":
        return "var(--tuner-color-approaching)";
      default:
        return "var(--tuner-color-perfect)";
    }
  };

  const getStatusLabel = () => {
    if (label) return label;
    switch (status) {
      case "inTune":
        return "Perfect pitch";
      case "error":
        return "No input detected";
      case "processing":
        return "Analyzing...";
      default:
        return "Listening...";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{
            background: getStatusColor(),
            boxShadow: `0 0 8px ${getStatusColor()}80`,
          }}
          animate={{
            opacity: status === "processing" ? [1, 0.3, 1] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: status === "processing" ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
        {status === "listening" && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: getStatusColor(),
            }}
            animate={{
              scale: [1, 2, 2],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </div>
      <span className="text-xs font-medium" style={{ color: "var(--tuner-text-tertiary)" }}>
        {getStatusLabel()}
      </span>
    </div>
  );
}