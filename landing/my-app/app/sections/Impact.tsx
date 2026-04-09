"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "../components/AnimatedCounter";
import HUDPanel from "../components/HUDPanel";

const useCases = [
  {
    title: "Daily Commute",
    description: "Navigate familiar routes with confidence, knowing exactly where the safe paths are.",
    icon: "🚶",
  },
  {
    title: "New Places",
    description: "Explore unfamiliar environments independently with real-time guidance.",
    icon: "🗺️",
  },
  {
    title: "Shopping",
    description: "Find and identify items in stores using voice-activated search.",
    icon: "🛒",
  },
];

const milestones = [
  { year: "2023", event: "Project Initiated" },
  { year: "2024 Q1", event: "Prototype Development" },
  { year: "2024 Q2", event: "First Field Tests" },
  { year: "2024 Q3", event: "Beta Program Launch" },
  { year: "2025", event: "Pilot Program Expansion" },
];

export default function Impact() {
  return (
    <section id="impact" className="snap-section relative min-h-screen flex items-center justify-center bg-void px-4 sm:px-6 lg:px-8 py-20">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-rajdhani text-magenta text-sm tracking-[0.3em] uppercase mb-4 block">
            Real World Impact
          </span>
          <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            THE
            <span className="text-magenta"> NUMBERS</span>
          </h2>
        </motion.div>

        {/* Large Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
          {[
            { value: 500, suffix: "+", label: "Hours of Real-World Testing" },
            { value: 50, suffix: "+", label: "Beta Participants" },
            { value: 15, suffix: "", label: "Cities Represented" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            >
              <div className="font-orbitron text-5xl sm:text-6xl font-bold text-white mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="font-inter text-gray">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Use Case Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <HUDPanel color="magenta">
                <div className="text-center">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h3 className="font-orbitron text-xl font-bold text-white mb-2">
                    {useCase.title}
                  </h3>
                  <p className="font-inter text-gray text-sm">{useCase.description}</p>
                </div>
              </HUDPanel>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3 className="font-orbitron text-xl font-bold text-white text-center mb-8">
            DEVELOPMENT TIMELINE
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-magenta/30 -translate-y-1/2" />

            <div className="flex justify-between items-center relative">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <div className="w-4 h-4 rounded-full bg-magenta border-4 border-void mx-auto mb-2" />
                  <div className="font-rajdhani text-magenta text-xs font-bold">
                    {milestone.year}
                  </div>
                  <div className="font-inter text-gray text-xs hidden sm:block max-w-[100px]">
                    {milestone.event}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section transition text */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-rajdhani text-magenta text-sm tracking-wider"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
      >
        CALCULATING IMPACT METRICS...
      </motion.div>
    </section>
  );
}
