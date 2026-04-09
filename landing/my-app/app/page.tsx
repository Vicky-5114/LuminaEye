"use client";

import { useScrollSnap } from "./hooks/useScrollSnap";
import ProgressDots from "./components/ProgressDots";
import Hero from "./sections/Hero";
import Problem from "./sections/Problem";
import Solution from "./sections/Solution";
import Technology from "./sections/Technology";
import Demo from "./sections/Demo";
import Impact from "./sections/Impact";
import Story from "./sections/Story";
import CTA from "./sections/CTA";

const sections = [
  Hero,
  Problem,
  Solution,
  Technology,
  Demo,
  Impact,
  Story,
  CTA,
];

export default function Home() {
  const { containerRef, currentSection, scrollToSection } = useScrollSnap(
    sections.length
  );

  return (
    <main className="relative">
      {/* Progress Dots Navigation */}
      <ProgressDots
        total={sections.length}
        current={currentSection}
        onDotClick={scrollToSection}
      />

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {sections.map((Section, index) => (
          <div key={index} className="snap-always snap-start">
            <Section
              onScrollDown={() =>
                scrollToSection(Math.min(index + 1, sections.length - 1))
              }
            />
          </div>
        ))}
      </div>
    </main>
  );
}
