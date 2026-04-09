"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export function useScrollSnap(totalSections: number) {
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const scrollToSection = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSections || isScrolling.current) return;

      isScrolling.current = true;
      setCurrentSection(index);

      const container = containerRef.current;
      if (container) {
        const sections = container.querySelectorAll(".snap-section");
        if (sections[index]) {
          sections[index].scrollIntoView({ behavior: "smooth" });
        }
      }

      setTimeout(() => {
        isScrolling.current = false;
      }, 800);
    },
    [totalSections]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling.current) return;

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          scrollToSection(currentSection + 1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          scrollToSection(currentSection - 1);
          break;
        case "Home":
          e.preventDefault();
          scrollToSection(0);
          break;
        case "End":
          e.preventDefault();
          scrollToSection(totalSections - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSection, scrollToSection, totalSections]);

  // Intersection observer for scroll tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(
              container.querySelectorAll(".snap-section")
            ).indexOf(entry.target as Element);
            if (index !== -1) {
              setCurrentSection(index);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = container.querySelectorAll(".snap-section");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return { containerRef, currentSection, scrollToSection };
}
