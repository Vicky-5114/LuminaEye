"use client";

import { motion } from "framer-motion";

interface ScanLineProps {
  className?: string;
  duration?: number;
}

export default function ScanLine({ className, duration = 4 }: ScanLineProps) {
  return (
    <motion.div
      className={`absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent pointer-events-none ${className}`}
      initial={{ top: "-2px" }}
      animate={{ top: ["-2px", "100vh", "-2px"] }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        boxShadow: "0 0 10px rgba(0, 240, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.4)",
      }}
    />
  );
}
