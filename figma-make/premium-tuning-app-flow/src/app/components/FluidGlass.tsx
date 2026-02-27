import { motion } from "motion/react";

interface FluidGlassProps {
  color: string;
}

export function FluidGlass({ color }: FluidGlassProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute -top-24 -left-16 w-72 h-72 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.62), ${color})`,
          filter: "blur(56px)",
          opacity: 0.62,
        }}
        animate={{ x: [0, 24, -16, 0], y: [0, 32, 8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 w-80 h-80 rounded-full"
        style={{
          background: `radial-gradient(circle at 60% 40%, rgba(255,255,255,0.5), ${color})`,
          filter: "blur(66px)",
          opacity: 0.48,
        }}
        animate={{ x: [0, -28, 12, 0], y: [0, -22, 18, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 50%, rgba(255,255,255,0.45), rgba(255,255,255,0.1))",
          filter: "blur(72px)",
          opacity: 0.42,
        }}
        animate={{ x: [0, 20, -20, 0], y: [0, -18, 12, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-x-6 top-10 h-28 rounded-[999px]"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.04))",
          filter: "blur(18px)",
          opacity: 0.55,
        }}
        animate={{ opacity: [0.38, 0.58, 0.38] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
