"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Viewport from "../components/Viewport";
import HUDPanel from "../components/HUDPanel";

type Mode = "blindpath" | "crossing" | "search" | "traffic";

interface ModeConfig {
  id: Mode;
  label: string;
  title: string;
  description: string;
  color: "lime" | "yellow" | "magenta" | "cyan";
}

const modes: ModeConfig[] = [
  {
    id: "blindpath",
    label: "BLIND PATH",
    title: "Follow the Path",
    description: "Real-time sidewalk detection with turn-by-turn guidance. The system identifies safe walking paths and alerts you to upcoming turns.",
    color: "lime",
  },
  {
    id: "crossing",
    label: "CROSSING",
    title: "Cross with Confidence",
    description: "Zebra crossing detection and alignment guidance. Know when it's safe to cross and stay centered on the crosswalk.",
    color: "yellow",
  },
  {
    id: "search",
    label: "ITEM SEARCH",
    title: "Find What You Need",
    description: "Voice-activated item search with hand-tracking guidance. Ask for any object and receive audio directions to locate it.",
    color: "magenta",
  },
  {
    id: "traffic",
    label: "TRAFFIC",
    title: "Read the Lights",
    description: "Traffic light color detection with safety alerts. Know exactly when it's safe to cross based on real-time signal analysis.",
    color: "cyan",
  },
];

export default function Solution() {
  const [activeMode, setActiveMode] = useState<Mode>("blindpath");

  const currentMode = modes.find((m) => m.id === activeMode)!;

  return (
    <section id="solution" className="snap-section relative min-h-screen flex items-center bg-void px-4 sm:px-6 lg:px-8 py-20">
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-rajdhani text-cyan text-sm tracking-[0.3em] uppercase mb-4 block">
            The Solution
          </span>
          <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            FOUR MODES.
            <span className="text-cyan"> ONE MISSION.</span>
          </h2>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Viewport - takes 3 columns */}
          <motion.div
            className="lg:col-span-3 relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="aspect-video relative rounded-lg overflow-hidden border border-white/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Viewport mode={activeMode} className="w-full h-full" />
                </motion.div>
              </AnimatePresence>

              {/* Mode indicator overlay */}
              <div className="absolute top-4 left-4 font-rajdhani text-sm">
                <span
                  className={`px-3 py-1 rounded ${
                    activeMode === "blindpath"
                      ? "bg-lime/20 text-lime border border-lime/50"
                      : activeMode === "crossing"
                      ? "bg-yellow/20 text-yellow border border-yellow/50"
                      : activeMode === "search"
                      ? "bg-magenta/20 text-magenta border border-magenta/50"
                      : "bg-cyan/20 text-cyan border border-cyan/50"
                  }`}
                >
                  {currentMode.label}
                </span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex justify-center gap-2 mt-6">
              {modes.map((mode) => (
                <motion.button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`px-4 py-2 font-rajdhani text-sm font-medium border transition-all duration-300 ${
                    activeMode === mode.id
                      ? mode.id === "blindpath"
                        ? "border-lime text-lime shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                        : mode.id === "crossing"
                        ? "border-yellow text-yellow shadow-[0_0_15px_rgba(255,221,0,0.3)]"
                        : mode.id === "search"
                        ? "border-magenta text-magenta shadow-[0_0_15px_rgba(255,0,160,0.3)]"
                        : "border-cyan text-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                      : "border-gray/30 text-gray hover:border-white/50 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {mode.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Description Panel - takes 2 columns */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <HUDPanel color={currentMode.color}>
                  <h3 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mb-4">
                    {currentMode.title}
                  </h3>
                  <p className="font-inter text-gray leading-relaxed">
                    {currentMode.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <span className="font-rajdhani text-xs text-gray uppercase tracking-wider">
                          Accuracy
                        </span>
                        <div className="font-orbitron text-2xl text-white">97.5%</div>
                      </div>
                      <div className="flex-1">
                        <span className="font-rajdhani text-xs text-gray uppercase tracking-wider">
                          Latency
                        </span>
                        <div className="font-orbitron text-2xl text-white">&lt; 100ms</div>
                      </div>
                    </div>
                  </div>
                </HUDPanel>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Section transition text */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-rajdhani text-cyan text-sm tracking-wider"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
      >
        LOADING SOLUTION MATRIX...
      </motion.div>
    </section>
  );
}
