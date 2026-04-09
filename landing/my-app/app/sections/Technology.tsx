"use client";

import { motion } from "framer-motion";
import HUDPanel from "../components/HUDPanel";

const techStack = [
  {
    name: "YOLO",
    fullName: "You Only Look Once",
    description: "Real-time object detection",
    stat: "30 FPS",
    color: "cyan" as const,
  },
  {
    name: "MEDIAPIPE",
    fullName: "Hand Tracking",
    description: "Precise gesture recognition",
    stat: "\u003c50ms",
    color: "magenta" as const,
  },
  {
    name: "QWEN-OMNI",
    fullName: "Multimodal AI",
    description: "Natural language understanding",
    stat: "\u003c100ms",
    color: "lime" as const,
  },
  {
    name: "DASHSCOPE",
    fullName: "Speech Recognition",
    description: "Real-time voice commands",
    stat: "95% acc",
    color: "yellow" as const,
  },
];

export default function Technology() {
  return (
    <section id="technology" className="snap-section relative min-h-screen flex items-center justify-center bg-void px-4 sm:px-6 lg:px-8 py-20">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-cyan/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-cyan/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
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
          <span className="font-rajdhani text-lime text-sm tracking-[0.3em] uppercase mb-4 block">
            Under The Hood
          </span>
          <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            THE
            <span className="text-lime"> STACK</span>
          </h2>
        </motion.div>

        {/* Pipeline Visualization */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <HUDPanel color="lime">
            <div className="flex flex-wrap justify-center items-center gap-4 py-4">
              {["CAMERA", "YOLO", "MEDIAPIPE", "QWEN-OMNI", "AUDIO"].map((node, index, arr) => (
                <div key={node} className="flex items-center gap-4">
                  <motion.div
                    className="px-4 py-2 bg-panel border border-lime/50 text-lime font-rajdhani font-bold text-sm rounded"
                    animate={{
                      boxShadow: [
                        "0 0 5px rgba(0,255,136,0.2)",
                        "0 0 20px rgba(0,255,136,0.5)",
                        "0 0 5px rgba(0,255,136,0.2)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  >
                    {node}
                  </motion.div>
                  {index < arr.length - 1 && (
                    <motion.div
                      className="w-8 h-0.5 bg-gradient-to-r from-lime/50 to-lime"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.3 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </HUDPanel>
        </motion.div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <HUDPanel color={tech.color}>
                <div className="text-center">
                  <div className={`font-orbitron text-2xl font-bold mb-1 ${
                    tech.color === "cyan" ? "text-cyan" :
                    tech.color === "magenta" ? "text-magenta" :
                    tech.color === "lime" ? "text-lime" : "text-yellow"
                  }`}>
                    {tech.name}
                  </div>
                  <div className="font-rajdhani text-xs text-gray uppercase tracking-wider mb-3">
                    {tech.fullName}
                  </div>
                  <p className="font-inter text-gray text-sm mb-4">{tech.description}</p>
                  <div className={`font-orbitron text-3xl font-bold ${
                    tech.color === "cyan" ? "text-cyan" :
                    tech.color === "magenta" ? "text-magenta" :
                    tech.color === "lime" ? "text-lime" : "text-yellow"
                  }`}>
                    {tech.stat}
                  </div>
                </div>
              </HUDPanel>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          className="mt-12 grid grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {[
            { label: "Processing Speed", value: "30 FPS" },
            { label: "Response Latency", value: "\u003c 100ms" },
            { label: "Detection Accuracy", value: "99.2%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-orbitron text-2xl sm:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="font-rajdhani text-xs text-gray uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Section transition text */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-rajdhani text-lime text-sm tracking-wider"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
      >
        INITIALIZING TECH STACK...
      </motion.div>
    </section>
  );
}
