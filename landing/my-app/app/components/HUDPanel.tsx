"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface HUDPanelProps {
  children: React.ReactNode;
  className?: string;
  color?: "cyan" | "magenta" | "lime" | "yellow";
}

export default function HUDPanel({
  children,
  className,
  color = "cyan",
}: HUDPanelProps) {
  const colorMap = {
    cyan: "rgba(0, 240, 255, 0.3)",
    magenta: "rgba(255, 0, 160, 0.3)",
    lime: "rgba(0, 255, 136, 0.3)",
    yellow: "rgba(255, 221, 0, 0.3)",
  };

  return (
    <motion.div
      className={cn(
        "relative bg-panel/80 backdrop-blur-md rounded-lg p-6",
        className
      )}
      style={{
        border: `1px solid ${colorMap[color]}`,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Corner brackets */}
      <div
        className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2"
        style={{ borderColor: colorMap[color].replace("0.3", "1") }}
      />
      <div
        className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2"
        style={{ borderColor: colorMap[color].replace("0.3", "1") }}
      />
      <div
        className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2"
        style={{ borderColor: colorMap[color].replace("0.3", "1") }}
      />
      <div
        className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2"
        style={{ borderColor: colorMap[color].replace("0.3", "1") }}
      />
      {children}
    </motion.div>
  );
}
