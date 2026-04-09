"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export default function SecondaryButton({
  children,
  onClick,
  href,
  className,
}: SecondaryButtonProps) {
  const baseStyles =
    "relative px-8 py-4 border-2 border-gray text-gray font-rajdhani font-semibold text-sm uppercase tracking-wider transition-all duration-300 hover:border-white hover:text-white";

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseStyles, "inline-block", className)}
        whileHover={{ boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)" }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className={cn(baseStyles, className)}
      whileHover={{ boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)" }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
