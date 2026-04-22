"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "../components/AnimatedCounter";
import HUDPanel from "../components/HUDPanel";

// Deterministic pseudo-random values based on index to avoid hydration mismatch
const PARTICLE_CONFIG = [
  { left: 12, top: 23, duration: 3.5, delay: 0.2 },
  { left: 45, top: 67, duration: 4.2, delay: 1.1 },
  { left: 78, top: 34, duration: 3.8, delay: 0.7 },
  { left: 23, top: 89, duration: 4.5, delay: 1.5 },
  { left: 56, top: 12, duration: 3.2, delay: 0.3 },
  { left: 89, top: 45, duration: 4.0, delay: 1.8 },
  { left: 34, top: 78, duration: 3.7, delay: 0.9 },
  { left: 67, top: 56, duration: 4.3, delay: 0.5 },
];

export default function Problem() {
  return (
    <section id="problem" className="snap-section relative min-h-screen flex items-center justify-center bg-void px-4 sm:px-6 lg:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric obstacles */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 border border-magenta/20 rotate-45"
          animate={{ y: [0, 20, 0], rotate: [45, 50, 45] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-24 h-24 border border-magenta/20"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-16 h-16 border border-magenta/20 rotate-12"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Particle drift - use deterministic values to avoid hydration mismatch */}
        {PARTICLE_CONFIG.map((config, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gray/30 rounded-full"
            style={{
              left: `${config.left}%`,
              top: `${config.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              delay: config.delay,
            }}
          />
        ))}
      </div>

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
            The Challenge
          </span>
          <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            NAVIGATION IS A DAILY
            <br />
            <span className="text-magenta">OBSTACLE COURSE</span>
          </h2>
        </motion.div>

        {/* Main Stat */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="font-orbitron text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-4">
            <AnimatedCounter value={285} suffix="M" />
          </div>
          <p className="font-inter text-gray text-lg">
            people worldwide live with visual impairment
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { value: 90, suffix: "%", label: "report navigation as their top concern" },
            { value: 70, suffix: "%", label: "avoid unfamiliar routes due to uncertainty" },
            { value: 10, suffix: "%", label: "of cities have adequate accessibility" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <HUDPanel color="magenta">
                <div className="text-center">
                  <div className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="font-inter text-gray text-sm">{stat.label}</p>
                </div>
              </HUDPanel>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <HUDPanel color="magenta">
            <blockquote className="text-center">
              <p className="font-inter text-lg sm:text-xl text-white italic mb-4">
                "Every unfamiliar street feels like an obstacle course."
              </p>
              <cite className="font-rajdhani text-gray text-sm not-italic">
                — Potential LuminaEye User
              </cite>
            </blockquote>
          </HUDPanel>
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
        ANALYZING PROBLEM SPACE...
      </motion.div>
    </section>
  );
}
