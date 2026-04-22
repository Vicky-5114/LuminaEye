"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Viewport from "../components/Viewport";
import HUDPanel from "../components/HUDPanel";
import { useMousePosition } from "../hooks/useMousePosition";

export default function Demo() {
  const mousePosition = useMousePosition();

  const detectedObjects = useMemo(() => {
    const objects: string[] = [];

    if (mousePosition.x < 0.3) {
      objects.push("PEDESTRIAN DETECTED LEFT");
    } else if (mousePosition.x > 0.7) {
      objects.push("PATH CLEAR RIGHT");
    } else {
      objects.push("CROSSWALK AHEAD");
    }

    if (mousePosition.y < 0.3) {
      objects.push("TRAFFIC LIGHT: RED");
    } else if (mousePosition.y > 0.7) {
      objects.push("SIDEWALK EDGE");
    }

    return objects;
  }, [mousePosition.x, mousePosition.y]);

  const overlayAnimate = useMemo(() => ({ opacity: 1 }), []);
  const itemAnimate = useMemo(() => ({ opacity: 1, x: 0 }), []);

  return (
    <section id="demo" className="snap-section relative min-h-screen flex items-center justify-center bg-void px-4 sm:px-6 lg:px-8 py-20">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-rajdhani text-yellow text-sm tracking-[0.3em] uppercase mb-4 block">
            Interactive Demo
          </span>
          <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            TRY IT
            <span className="text-yellow"> YOURSELF</span>
          </h2>
        </motion.div>

        {/* Instructions */}
        <motion.p
          className="text-center font-inter text-gray mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Move your cursor to look around. Experience how LuminaEye sees your world.
        </motion.p>

        {/* Interactive Viewport */}
        <motion.div
          className="relative aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden border border-yellow/30"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Viewport
            mode="default"
            interactive
            mousePosition={mousePosition}
            className="w-full h-full"
          />

          {/* Detection overlay */}
          <div className="absolute top-4 left-4 right-4">
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={overlayAnimate}
            >
              {detectedObjects.map((obj, index) => (
                <motion.div
                  key={`${obj}-${index}`}
                  className="px-3 py-1 bg-yellow/20 border border-yellow/50 text-yellow font-rajdhani text-xs rounded"
                  initial={{ opacity: 0, x: -10 }}
                  animate={itemAnimate}
                  exit={{ opacity: 0 }}
                >
                  {obj}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Crosshair */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              className="w-8 h-8 border border-yellow/50 rounded-full"
              style={{
                transform: `translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px)`,
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-yellow rounded-full" />
            </motion.div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
          {[
            { label: "Move Left", desc: "Detects pedestrians and obstacles" },
            { label: "Move Center", desc: "Identifies crosswalks and paths" },
            { label: "Move Right", desc: "Checks for clear pathways" },
          ].map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <HUDPanel color="yellow">
                <div className="font-rajdhani text-yellow text-sm font-bold mb-1">{card.label}</div>
                <div className="font-inter text-gray text-xs">{card.desc}</div>
              </HUDPanel>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section transition text */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-rajdhani text-yellow text-sm tracking-wider"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
      >
        ENTERING SIMULATION MODE...
      </motion.div>
    </section>
  );
}
