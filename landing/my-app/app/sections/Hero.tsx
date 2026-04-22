"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";

interface HeroProps {
  onScrollDown?: () => void;
}

export default function Hero({ onScrollDown }: HeroProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  // Character-by-character typing animation for headline
  const headline = "SEE WHAT WE SEE";
  const headlineChars = headline.split("");

  return (
    <section className="relative h-screen w-full overflow-hidden bg-void">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Main Content Container - Split Layout */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-12 xl:px-20">

        {/* Left Side - Concept Image */}
        <motion.div
          className="w-full lg:w-[42%] flex items-center justify-center lg:justify-start lg:pl-4 mb-8 lg:mb-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative">
            {/* Floating animation wrapper */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-cyan/20 blur-[60px] rounded-full scale-75" />

              {/* Image container with border */}
              <div className="relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.15)]">
                <Image
                  src="/images/LuminaEye_Concept.jpg"
                  alt="LuminaEye Smart Glasses Concept"
                  width={500}
                  height={500}
                  className="w-auto h-auto max-w-[280px] sm:max-w-[350px] lg:max-w-[450px] xl:max-w-[500px] object-contain"
                  priority
                />

                {/* Corner brackets overlay */}
                <motion.div
                  className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-cyan"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                />
                <motion.div
                  className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-cyan"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                />
                <motion.div
                  className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-cyan"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                />
                <motion.div
                  className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-cyan"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                />

                {/* Scan line effect */}
                <motion.div
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent"
                  initial={{ top: "0%" }}
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{
                    boxShadow: "0 0 10px rgba(0, 240, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.4)",
                  }}
                />

                {/* Prototype label */}
                <motion.div
                  className="absolute top-4 right-4 px-2 py-1 bg-cyan/20 border border-cyan/50 rounded text-xs font-rajdhani text-cyan"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.4 }}
                >
                  PROTOTYPE v2.0
                </motion.div>

                {/* REC indicator */}
                <motion.div
                  className="absolute top-4 left-4 flex items-center gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-red-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-red-500 text-xs font-rajdhani font-medium">REC</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Content */}
        <motion.div
          className="w-full lg:w-[58%] flex flex-col justify-center lg:pl-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Content Container */}
            {/* Brand name */}
            <motion.div
              className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-cyan mb-6 tracking-wider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.75, ease: "easeOut" }}
            >
              LuminaEye
            </motion.div>

            {/* Headline with character animation */}
            <motion.h1
              className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-wider"
            >
              {headlineChars.map((char, index) => (
                <motion.span
                  key={index}
                  className={char === " " ? "mr-3" : "inline-block glow-cyan-text"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.1,
                    delay: 0.8 + index * 0.05,
                    ease: "easeOut",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="font-inter text-base sm:text-lg md:text-xl text-gray max-w-lg mb-8"
              variants={itemVariants}
            >
              AI-powered navigation for the visually impaired.
              <br />
              Real-time guidance through your world.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              variants={itemVariants}
            >
              <PrimaryButton href="#cta" onClick={onScrollDown}>
                Join Pilot Program
              </PrimaryButton>
              <SecondaryButton href="https://github.com/EXPLORER41/LuminaEye">
                View on GitHub
              </SecondaryButton>
            </motion.div>

            {/* Feature badges */}
            <motion.div
              className="flex flex-wrap gap-3"
              variants={itemVariants}
            >
              {["YOLO Vision", "Real-time", "Voice Control"].map((badge, index) => (
                <span
                  key={badge}
                  className="px-3 py-1 border border-cyan/30 rounded-full text-xs font-rajdhani text-cyan/80"
                >
                  {badge}
                </span>
              ))}
            </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.6 }}
      >
        <span className="font-rajdhani text-xs text-gray tracking-wider">
          SCROLL TO EXPLORE
        </span>
        <motion.div
          className="w-5 h-8 border-2 border-gray rounded-full flex justify-center pt-1.5"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-1 bg-cyan rounded-full"
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>

      {/* Top HUD Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.4 }}
      >
        <div className="flex justify-between items-center font-rajdhani text-sm">
          <div className="flex items-center gap-2">
            <span className="text-cyan font-bold text-base sm:text-lg tracking-wider">
              LUMINAEYE
            </span>
            <span className="text-gray text-xs">v2.0.1</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 lg:gap-6">
            <a
              href="#problem"
              className="text-gray hover:text-white transition-colors"
            >
              Problem
            </a>
            <a
              href="#solution"
              className="text-gray hover:text-white transition-colors"
            >
              Solution
            </a>
            <a
              href="#technology"
              className="text-gray hover:text-white transition-colors"
            >
              Technology
            </a>
            <a
              href="#cta"
              className="text-cyan hover:text-white transition-colors"
            >
              Join Pilot
            </a>
          </div>
        </div>
      </motion.div>

      {/* Decorative corner elements */}
      <motion.div
        className="absolute top-20 left-4 sm:left-6 w-12 h-12 sm:w-16 sm:h-16 border-t-2 border-l-2 border-cyan/50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      />
      <motion.div
        className="absolute top-20 right-4 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 border-t-2 border-r-2 border-cyan/50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      />
      <motion.div
        className="absolute bottom-20 left-4 sm:left-6 w-12 h-12 sm:w-16 sm:h-16 border-b-2 border-l-2 border-cyan/50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      />
      <motion.div
        className="absolute bottom-20 right-4 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 border-b-2 border-r-2 border-cyan/50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      />
    </section>
  );
}
