"use client";

import { motion } from "framer-motion";

interface TimelineItem {
  step: string;
  date: string;
  title: string;
  items: string[];
  side: "left" | "right";
}

const timelineData: TimelineItem[] = [
  {
    step: "01",
    date: "Mid-March 2026",
    title: "Project Initiated",
    items: ["Problem definition", "User needs analysis", "Feasibility analysis"],
    side: "left",
  },
  {
    step: "02",
    date: "Late March to Mid-April 2026",
    title: "Prototype Development",
    items: ["ESP32-CAM setup", "Video streaming", "UI/UX prototype"],
    side: "right",
  },
  {
    step: "03",
    date: "Mid-April 2026",
    title: "First Field Tests",
    items: ["Tactile paving detection", "Obstacle warning", "Voice guidance"],
    side: "left",
  },
  {
    step: "04",
    date: "Late April 2026",
    title: "Beta Program Launch",
    items: ["Road crossing", "Object search", "Hand guidance", "AI dialogue"],
    side: "right",
  },
  {
    step: "05",
    date: "Early May 2026",
    title: "Pilot Program Expansion",
    items: ["System integration", "User testing", "Optimization", "Deployment"],
    side: "left",
  },
];

/* ─────────── Animation variants ─────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const rightCardVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

/* ─────────── Shared sub-components ─────────── */

function TimelineNode({ step, delay = 0 }: { step: string; delay?: number }) {
  return (
    <motion.div
      className="relative z-10 flex items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {/* Outer glow */}
      <div className="absolute w-14 h-14 rounded-full bg-magenta/10" />
      <div
        className="absolute w-10 h-10 rounded-full"
        style={{
          boxShadow:
            "0 0 20px rgba(255,0,160,0.3), 0 0 40px rgba(255,0,160,0.15)",
        }}
      />
      {/* Ring */}
      <div className="relative w-10 h-10 rounded-full border-2 border-magenta flex items-center justify-center bg-void">
        <span className="font-orbitron text-base font-bold text-magenta">
          {step}
        </span>
      </div>
    </motion.div>
  );
}

function TimelineCard({ item }: { item: TimelineItem }) {
  return (
    <motion.div
      variants={item.side === "left" ? cardVariants : rightCardVariants}
      className="relative rounded-xl p-5 sm:p-6 max-w-md"
      style={{
        backgroundColor: "rgba(17, 17, 24, 0.6)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 0, 160, 0.2)",
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.3), 0 0 20px rgba(255,0,160,0.05)",
      }}
    >
      {/* Date */}
      <div className="font-rajdhani text-magenta text-sm sm:text-base font-bold tracking-wider uppercase mb-1.5">
        {item.date}
      </div>

      {/* Title */}
      <h4 className="font-orbitron text-white text-lg sm:text-xl font-bold mb-3 leading-snug">
        {item.title}
      </h4>

      {/* Items as chips */}
      <div className="flex flex-wrap gap-2">
        {item.items.map((chip, i) => (
          <span
            key={i}
            className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-inter"
            style={{
              backgroundColor: "rgba(255, 0, 160, 0.08)",
              border: "1px solid rgba(255, 0, 160, 0.15)",
              color: "#b7b7c7",
            }}
          >
            {chip}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────── Desktop: alternating left / right ─────────── */

function DesktopTimeline() {
  return (
    <div className="hidden lg:block relative max-w-5xl mx-auto">
      {/* Vertical center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-magenta/30 -translate-x-1/2" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {timelineData.map((item, index) => {
          const isLeft = item.side === "left";
          return (
            <motion.div
              key={item.step}
              className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-10 py-10"
            >
              {/* ── Left column ── */}
              <div
                className={`flex ${
                  isLeft ? "justify-end" : "justify-start"
                }`}
              >
                {isLeft && <TimelineCard item={item} />}
              </div>

              {/* ── Center column (node + connector) ── */}
              <div className="relative flex justify-center w-10">
                {/* Connector line */}
                {isLeft ? (
                  <div className="absolute top-1/2 right-1/2 h-px bg-magenta/40 w-10 -translate-y-1/2" />
                ) : (
                  <div className="absolute top-1/2 left-1/2 h-px bg-magenta/40 w-10 -translate-y-1/2" />
                )}
                <TimelineNode step={item.step} delay={index * 0.1} />
              </div>

              {/* ── Right column ── */}
              <div
                className={`flex ${
                  !isLeft ? "justify-start" : "justify-end"
                }`}
              >
                {!isLeft && <TimelineCard item={item} />}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ─────────── Mobile: single column, line on left ─────────── */

function MobileTimeline() {
  return (
    <div className="lg:hidden relative max-w-lg mx-auto pl-10">
      {/* Vertical line on the left */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-magenta/30" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {timelineData.map((item, index) => (
          <motion.div
            key={item.step}
            variants={cardVariants}
            className="relative pb-12 last:pb-0"
          >
            {/* Node on the line */}
            <div className="absolute left-4 top-3 -translate-x-1/2">
              <TimelineNode step={item.step} delay={index * 0.1} />
            </div>

            {/* Connector line */}
            <div className="absolute left-4 top-[26px] w-6 h-px bg-magenta/40" />

            {/* Card */}
            <div className="pl-10">
              <TimelineCard item={item} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────── Main export ─────────── */

export default function DevelopmentTimeline() {
  return (
    <div className="w-full">
      {/* Section Title */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="font-orbitron text-white text-3xl md:text-4xl font-bold tracking-wide">
          DEVELOPMENT TIMELINE
        </h3>
        <div className="mt-4 mx-auto w-16 h-0.5 bg-magenta/60" />
      </motion.div>

      <DesktopTimeline />
      <MobileTimeline />
    </div>
  );
}
