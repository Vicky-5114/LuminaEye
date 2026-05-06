"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PrimaryButton from "../components/PrimaryButton";
import HUDPanel from "../components/HUDPanel";

export default function CTA() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="cta" className="snap-section relative min-h-screen flex items-center justify-center bg-void px-4 sm:px-6 lg:px-8 py-20">
      <div className="relative z-10 max-w-2xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-rajdhani text-lime text-sm tracking-[0.3em] uppercase mb-4 block">
            Get Involved
          </span>
          <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            HELP US BUILD
            <span className="text-lime"> THE FUTURE</span>
          </h2>
          <p className="font-inter text-gray max-w-xl mx-auto">
            Join our pilot program. Be among the first to experience AI-guided navigation.
          </p>
        </motion.div>

        {/* Form or Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {isSubmitted ? (
            <HUDPanel color="lime">
              <div className="text-center py-8">
                <motion.div
                  className="text-6xl mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  ✓
                </motion.div>
                <h3 className="font-orbitron text-2xl font-bold text-lime mb-2">
                  APPLICATION RECEIVED
                </h3>
                <p className="font-inter text-gray">
                  Thank you for your interest! We'll be in touch soon.
                </p>
              </div>
            </HUDPanel>
          ) : (
            <HUDPanel color="lime">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block font-rajdhani text-sm text-gray uppercase tracking-wider mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-void border border-gray/30 rounded px-4 py-3 font-inter text-white placeholder:text-gray/50 focus:border-lime focus:outline-none focus:ring-1 focus:ring-lime transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block font-rajdhani text-sm text-gray uppercase tracking-wider mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-void border border-gray/30 rounded px-4 py-3 font-inter text-white placeholder:text-gray/50 focus:border-lime focus:outline-none focus:ring-1 focus:ring-lime transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block font-rajdhani text-sm text-gray uppercase tracking-wider mb-2"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full bg-void border border-gray/30 rounded px-4 py-3 font-inter text-white placeholder:text-gray/50 focus:border-lime focus:outline-none focus:ring-1 focus:ring-lime transition-colors"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block font-rajdhani text-sm text-gray uppercase tracking-wider mb-2"
                  >
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-void border border-gray/30 rounded px-4 py-3 font-inter text-white placeholder:text-gray/50 focus:border-lime focus:outline-none focus:ring-1 focus:ring-lime transition-colors resize-none"
                    placeholder="Tell us why you're interested in LuminaEye..."
                  />
                </div>

                <PrimaryButton type="submit" className="w-full">
                  JOIN PILOT PROGRAM
                </PrimaryButton>
              </form>
            </HUDPanel>
          )}
        </motion.div>

        {/* Registration CTAs */}
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <a
            href="/login?role=blind"
            className="px-6 py-3 border border-[var(--color-lime)] text-[var(--color-lime)] hover:bg-[var(--color-lime)] hover:text-black transition-colors font-rajdhani"
          >
            Blind User Sign Up
          </a>
          <a
            href="/login?role=volunteer"
            className="px-6 py-3 border border-[var(--color-cyan)] text-[var(--color-cyan)] hover:bg-[var(--color-cyan)] hover:text-black transition-colors font-rajdhani"
          >
            Volunteer Sign Up
          </a>
        </motion.div>

        {/* Secondary CTAs */}
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <a
            href="https://github.com/EXPLORER41/LuminaEye"
            target="_blank"
            rel="noopener noreferrer"
            className="font-rajdhani text-gray hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>

          <a
            href="mailto:invest@luminaeye.com"
            className="font-rajdhani text-gray hover:text-white transition-colors"
          >
            Investment Inquiries
          </a>

          <a
            href="mailto:contact@luminaeye.com"
            className="font-rajdhani text-gray hover:text-white transition-colors"
          >
            Contact Us
          </a>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-16 pt-8 border-t border-white/10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-inter text-gray text-sm">
            © 2024 LuminaEye. Built with passion for accessibility.
          </p>
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
        INITIATING CONTACT PROTOCOL...
      </motion.div>
    </section>
  );
}
