"use client";

import { motion } from "framer-motion";

interface ProgressDotsProps {
  total: number;
  current: number;
  onDotClick?: (index: number) => void;
}

export default function ProgressDots({
  total,
  current,
  onDotClick,
}: ProgressDotsProps) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {Array.from({ length: total }).map((_, index) => (
        <motion.button
          key={index}
          onClick={() => onDotClick?.(index)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            index === current
              ? "bg-cyan scale-125 shadow-[0_0_10px_rgba(0,240,255,0.8)]"
              : "bg-gray/40 hover:bg-gray/60"
          }`}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Go to section ${index + 1}`}
        />
      ))}
    </div>
  );
}
