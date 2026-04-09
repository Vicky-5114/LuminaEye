"use client";

import { motion } from "framer-motion";

interface BoundingBoxProps {
  label: string;
  confidence?: number;
  className?: string;
  delay?: number;
}

export default function BoundingBox({
  label,
  confidence = 95,
  className,
  delay = 0,
}: BoundingBoxProps) {
  return (
    <motion.div
      className={`absolute border-2 border-cyan pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, delay }}
    >
      {/* Label */}
      <div className="absolute -top-6 left-0 bg-cyan text-void px-2 py-0.5 text-xs font-rajdhani font-medium">
        {label}
      </div>
      {/* Confidence indicator */}
      <div className="absolute -bottom-4 left-0 right-0 h-1 bg-void/50">
        <motion.div
          className="h-full bg-cyan"
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
        />
      </div>
      {/* Corner accents */}
      <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan" />
      <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan" />
    </motion.div>
  );
}
