"use client";

import { motion } from "framer-motion";

export default function DevelopmentTimeline() {
  return (
    <motion.div
      className="w-full flex justify-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <img
        src="/images/development-timeline.png"
        alt="Development Timeline: Project milestones from March to May 2026"
        className="w-full max-w-5xl rounded-xl"
        style={{
          boxShadow: "0 0 40px rgba(255, 0, 160, 0.08), 0 4px 24px rgba(0,0,0,0.4)",
        }}
      />
    </motion.div>
  );
}
