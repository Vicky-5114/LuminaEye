"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  type?: "button" | "submit";
}

export default function PrimaryButton({
  children,
  onClick,
  href,
  className,
  type = "button",
}: PrimaryButtonProps) {
  const baseStyles =
    "relative px-8 py-4 border-2 border-cyan text-cyan font-rajdhani font-semibold text-sm uppercase tracking-wider transition-all duration-300 overflow-hidden group";

  const content = (
    <>
      <span className="relative z-10 transition-colors duration-300 group-hover:text-void">
        {children}
      </span>
      <motion.div
        className="absolute inset-0 bg-cyan"
        initial={{ x: "-100%" }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={cn(baseStyles, "inline-block", className)}
        whileHover={{ boxShadow: "0 0 20px rgba(0, 240, 255, 0.5)" }}
        whileTap={{ scale: 0.98 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={cn(baseStyles, className)}
      whileHover={{ boxShadow: "0 0 20px rgba(0, 240, 255, 0.5)" }}
      whileTap={{ scale: 0.98 }}
    >
      {content}
    </motion.button>
  );
}
