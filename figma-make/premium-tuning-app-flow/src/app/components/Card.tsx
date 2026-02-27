import { motion } from "motion/react";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "elevated" | "glow";
  className?: string;
}

export function Card({
  children,
  onClick,
  variant = "default",
  className = "",
}: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "elevated":
        return {
          background: "var(--tuner-bg-elevated)",
          border: "1px solid var(--tuner-bg-elevated)",
        };
      case "glow":
        return {
          background: "var(--tuner-bg-card)",
          border: "1px solid var(--tuner-accent-blue)",
          boxShadow: "0 0 30px var(--tuner-accent-blue-glow)",
        };
      default:
        return {
          background: "var(--tuner-bg-card)",
          border: "1px solid var(--tuner-bg-elevated)",
        };
    }
  };

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`rounded-2xl p-6 ${className}`}
      style={getVariantStyles()}
    >
      {children}
    </Component>
  );
}
