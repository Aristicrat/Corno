import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface FlowNode {
  id: string;
  title: string;
  subtitle: string;
  color: string;
}

const flowNodes: FlowNode[] = [
  {
    id: "splash",
    title: "Splash",
    subtitle: "Brand intro",
    color: "#00d4ff",
  },
  {
    id: "onboarding",
    title: "Onboarding",
    subtitle: "3 steps",
    color: "#a855f7",
  },
  {
    id: "tuner",
    title: "Main Tuner",
    subtitle: "Core experience",
    color: "#10b981",
  },
];

const secondaryNodes: FlowNode[] = [
  {
    id: "presets",
    title: "Presets",
    subtitle: "Library",
    color: "#f59e0b",
  },
  {
    id: "settings",
    title: "Settings",
    subtitle: "Customization",
    color: "#ec4899",
  },
];

export function FlowDiagram() {
  return (
    <div className="p-8">
      <h3
        className="text-xl font-semibold mb-6 text-center"
        style={{ color: "var(--tuner-text-primary)" }}
      >
        User Flow
      </h3>

      {/* Primary Flow */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {flowNodes.map((node, index) => (
          <div key={node.id} className="flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2 mx-auto"
                style={{
                  background: `${node.color}22`,
                  border: `2px solid ${node.color}`,
                  boxShadow: `0 0 20px ${node.color}44`,
                }}
              >
                <div
                  className="text-xs font-bold"
                  style={{ color: node.color }}
                >
                  {index + 1}
                </div>
              </div>
              <div
                className="text-xs font-semibold"
                style={{ color: "var(--tuner-text-primary)" }}
              >
                {node.title}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--tuner-text-secondary)" }}
              >
                {node.subtitle}
              </div>
            </motion.div>

            {index < flowNodes.length - 1 && (
              <ArrowRight
                size={16}
                className="mx-2"
                style={{ color: "var(--tuner-text-tertiary)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Secondary Navigation */}
      <div className="flex items-center justify-center gap-6">
        {secondaryNodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="text-center"
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mb-2 mx-auto"
              style={{
                background: `${node.color}22`,
                border: `1px solid ${node.color}`,
              }}
            >
              <div className="text-xs" style={{ color: node.color }}>
                •
              </div>
            </div>
            <div
              className="text-xs font-semibold"
              style={{ color: "var(--tuner-text-primary)" }}
            >
              {node.title}
            </div>
            <div
              className="text-xs"
              style={{ color: "var(--tuner-text-secondary)" }}
            >
              {node.subtitle}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
