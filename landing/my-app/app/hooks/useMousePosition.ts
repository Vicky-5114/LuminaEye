"use client";

import { useState, useEffect, useRef } from "react";

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const rafIdRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scheduleUpdate = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (pendingUpdateRef.current) {
          setMousePosition(pendingUpdateRef.current);
          pendingUpdateRef.current = null;
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      pendingUpdateRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
      scheduleUpdate();
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return mousePosition;
}
