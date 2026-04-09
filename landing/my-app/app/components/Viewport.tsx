"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BoundingBox from "./BoundingBox";

interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  position: { x: string; y: string; width: string; height: string };
}

interface ViewportProps {
  className?: string;
  mode?: "default" | "blindpath" | "crossing" | "search" | "traffic";
  interactive?: boolean;
  mousePosition?: { x: number; y: number };
}

export default function Viewport({
  className,
  mode = "default",
  interactive = false,
  mousePosition,
}: ViewportProps) {
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [confidence, setConfidence] = useState(94);
  const [scanY, setScanY] = useState(-10);

  // Simulate detected objects based on mode
  useEffect(() => {
    const objectsByMode: Record<string, DetectedObject[]> = {
      default: [
        { id: "1", label: "PERSON", confidence: 96, position: { x: "20%", y: "30%", width: "15%", height: "40%" } },
        { id: "2", label: "TRAFFIC_LIGHT", confidence: 92, position: { x: "65%", y: "15%", width: "8%", height: "12%" } },
        { id: "3", label: "CROSSWALK", confidence: 88, position: { x: "30%", y: "70%", width: "40%", height: "15%" } },
      ],
      blindpath: [
        { id: "1", label: "SIDEWALK", confidence: 98, position: { x: "25%", y: "60%", width: "50%", height: "30%" } },
        { id: "2", label: "TURN_LEFT", confidence: 94, position: { x: "35%", y: "35%", width: "20%", height: "20%" } },
      ],
      crossing: [
        { id: "1", label: "ZEBRA_CROSSING", confidence: 97, position: { x: "20%", y: "65%", width: "60%", height: "25%" } },
        { id: "2", label: "WAIT", confidence: 99, position: { x: "70%", y: "20%", width: "15%", height: "15%" } },
      ],
      search: [
        { id: "1", label: "WATER_BOTTLE", confidence: 91, position: { x: "40%", y: "40%", width: "15%", height: "20%" } },
        { id: "2", label: "HAND", confidence: 95, position: { x: "30%", y: "60%", width: "25%", height: "25%" } },
      ],
      traffic: [
        { id: "1", label: "GREEN_LIGHT", confidence: 99, position: { x: "55%", y: "20%", width: "10%", height: "15%" } },
        { id: "2", label: "SAFE", confidence: 97, position: { x: "75%", y: "30%", width: "15%", height: "10%" } },
      ],
    };

    setDetectedObjects(objectsByMode[mode] || objectsByMode.default);
  }, [mode]);

  // Simulate confidence fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setConfidence((prev) => Math.max(90, Math.min(98, prev + (Math.random() - 0.5) * 4)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Interactive parallax effect
  const getParallaxStyle = () => {
    if (!interactive || !mousePosition) return {};
    const x = (mousePosition.x - 0.5) * 20;
    const y = (mousePosition.y - 0.5) * 20;
    return {
      transform: `translate(${-x}px, ${-y}px) scale(1.1)`,
    };
  };

  // Mode-specific overlay colors
  const modeColors = {
    default: "border-cyan/30",
    blindpath: "border-lime/30",
    crossing: "border-yellow/30",
    search: "border-magenta/30",
    traffic: "border-cyan/30",
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Viewport background - abstract street scene */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-void via-[#0d0d14] to-[#111118]"
        style={getParallaxStyle()}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      >
        {/* Building silhouettes */}
        <div className="absolute bottom-0 left-0 w-32 h-64 bg-gradient-to-t from-[#1a1a24] to-transparent opacity-60" />
        <div className="absolute bottom-0 left-24 w-24 h-48 bg-gradient-to-t from-[#15151c] to-transparent opacity-50" />
        <div className="absolute bottom-0 right-0 w-40 h-72 bg-gradient-to-t from-[#1a1a24] to-transparent opacity-60" />
        <div className="absolute bottom-0 right-32 w-28 h-56 bg-gradient-to-t from-[#15151c] to-transparent opacity-50" />

        {/* Sidewalk lines */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl">
          <div className="flex justify-center gap-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-32 bg-gradient-to-t from-cyan/20 to-transparent"
              />
            ))}
          </div>
        </div>

        {/* Pedestrian silhouettes */}
        <motion.div
          className="absolute bottom-20 left-1/4 w-8 h-20 bg-[#2a2a34]/80 rounded-full"
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-16 right-1/3 w-6 h-16 bg-[#25252c]/70 rounded-full"
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Traffic light */}
        <div className="absolute top-20 right-1/4 w-4 h-16 bg-[#1a1a24] rounded">
          <motion.div
            className="w-3 h-3 rounded-full mx-auto mt-1"
            animate={{
              backgroundColor: mode === "traffic" ? "#00ff88" : ["#ff4444", "#ffdd00", "#00ff88", "#ffdd00", "#ff4444"],
              boxShadow: mode === "traffic"
                ? "0 0 15px #00ff88"
                : ["0 0 15px #ff4444", "0 0 15px #ffdd00", "0 0 15px #00ff88", "0 0 15px #ffdd00", "0 0 15px #ff4444"],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <div className="w-2 h-2 rounded-full bg-[#333] mx-auto mt-1" />
          <div className="w-2 h-2 rounded-full bg-[#333] mx-auto mt-1" />
        </div>
      </motion.div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,15,0.4)_100%)]" />

      {/* Film grain effect */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* HUD frame */}
      <div className={`absolute inset-4 border ${modeColors[mode]} rounded-lg pointer-events-none`}>
        {/* Corner brackets */}
        <div className="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2 border-cyan" />
        <div className="absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-cyan" />
        <div className="absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-cyan" />
        <div className="absolute -bottom-px -right-px w-8 h-8 border-b-2 border-r-2 border-cyan" />
      </div>

      {/* Detected objects with bounding boxes */}
      <AnimatePresence>
        {detectedObjects.map((obj, index) => (
          <div
            key={obj.id}
            className="absolute"
            style={{
              left: obj.position.x,
              top: obj.position.y,
              width: obj.position.width,
              height: obj.position.height,
            }}
          >
            <BoundingBox
              label={obj.label}
              confidence={obj.confidence}
              delay={index * 0.3}
              className="w-full h-full"
            />
          </div>
        ))}
      </AnimatePresence>

      {/* Top HUD bar */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center font-rajdhani text-sm">
        <div className="flex items-center gap-4">
          <span className="text-cyan font-bold tracking-wider">LUMINAEYE</span>
          <span className="text-gray text-xs">v2.0.1</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-red-500 text-xs font-medium">REC</span>
        </div>
      </div>

      {/* Bottom HUD bar */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center font-rajdhani text-sm">
        <div className="text-gray">
          <span className="text-cyan">{Math.round(confidence)}%</span> CONFIDENCE
        </div>
        <div className="text-gray">
          MODE: <span className="text-cyan uppercase">{mode}</span>
        </div>
        <div className="text-gray">
          <span className="text-cyan">30</span> FPS
        </div>
      </div>

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent pointer-events-none"
        initial={{ top: "-2px" }}
        animate={{ top: ["-2px", "100%", "-2px"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          boxShadow: "0 0 10px rgba(0, 240, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.4)",
        }}
      />
    </div>
  );
}
