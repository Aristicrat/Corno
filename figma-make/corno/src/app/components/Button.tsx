import { motion } from "motion/react";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  fullWidth = false,
  disabled = false,
  icon,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          background: "var(--tuner-accent-blue)",
          color: "var(--tuner-bg-primary)",
          boxShadow: "0 0 30px var(--tuner-accent-blue-glow)",
        };
      case "secondary":
        return {
          background: "var(--tuner-bg-card)",
          color: "var(--tuner-text-primary)",
          border: "1px solid var(--tuner-bg-elevated)",
        };
      case "ghost":
        return {
          background: "transparent",
          color: "var(--tuner-text-secondary)",
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "py-2 px-4 text-sm";
      case "md":
        return "py-3 px-6";
      case "lg":
        return "py-4 px-8 text-lg";
    }
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        rounded-2xl font-medium transition-all
        ${getSizeStyles()}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        flex items-center justify-center gap-2
      `}
      style={getVariantStyles()}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
