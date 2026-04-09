"use client";

import { motion } from "framer-motion";
import HUDPanel from "../components/HUDPanel";

const teamMembers = [
  { role: "Founder", initials: "JD" },
  { role: "Tech Lead", initials: "AL" },
  { role: "AI Engineer", initials: "MK" },
  { role: "UX Designer", initials: "SR" },
];

export default function Story() {
  return (
    <section id="story" className="snap-section relative min-h-screen flex items-center justify-center bg-void px-4 sm:px-6 lg:px-8 py-20">
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-rajdhani text-cyan text-sm tracking-[0.3em] uppercase mb-4 block">
            Our Story
          </span>
          <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            WHY WE
            <span className="text-cyan"> BUILT THIS</span>
          </h2>
        </motion.div>

        {/* Story Content */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <HUDPanel color="cyan">
            <div className="prose prose-invert max-w-none">
              <p className="font-inter text-gray leading-relaxed mb-4">
                LuminaEye began with a simple question: What if technology could help the
                visually impaired navigate the world with the same confidence as everyone else?
              </p>
              <p className="font-inter text-gray leading-relaxed mb-4">
                Our team came together through a shared belief that AI should empower, not
                replace, human capability. We spent months researching, prototyping, and
                testing with real users to create a system that truly understands the
                challenges of navigation for the visually impaired.
              </p>
              <p className="font-inter text-gray leading-relaxed">
                Today, LuminaEye represents the convergence of cutting-edge computer vision,
                natural language processing, and thoughtful design—all in service of a simple
                mission: Technology should empower everyone to navigate the world with confidence.
              </p>
            </div>
          </HUDPanel>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <blockquote className="font-orbitron text-xl sm:text-2xl text-white italic">
            "Technology should empower everyone to navigate the world with confidence."
          </blockquote>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="font-rajdhani text-cyan text-sm tracking-[0.2em] uppercase text-center mb-8">
            Meet The Team
          </h3>
          <div className="flex justify-center gap-6 flex-wrap">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.role}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="w-16 h-16 rounded-full bg-panel border-2 border-cyan/50 flex items-center justify-center mb-2 mx-auto">
                  <span className="font-orbitron text-cyan text-lg">{member.initials}</span>
                </div>
                <div className="font-rajdhani text-gray text-xs">{member.role}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Section transition text */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-rajdhani text-cyan text-sm tracking-wider"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
      >
        ACCESSING ORIGIN FILES...
      </motion.div>
    </section>
  );
}
