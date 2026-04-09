# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LuminaEye landing page - A high-end, tech-focused marketing site for AI-powered smart glasses that assist visually impaired individuals with navigation. Built with Next.js 16, Tailwind CSS 4, and Framer Motion.

**Design System**: "The Operator's View" - immersive cyberpunk/data-flow aesthetic with cyan/magenta accents and HUD-style UI elements.

## Common Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production (static export to dist/)
npm run start        # Start production server
npm run lint         # Run ESLint

# No test runner configured - tests would need to be added via jest or vitest
```

## Architecture

### Tech Stack
- **Next.js 16** with App Router and static export (`output: 'export'`)
- **React 19** with TypeScript
- **Tailwind CSS 4** with custom CSS variables for theming
- **Framer Motion** for animations
- **Google Fonts**: Orbitron, Rajdhani, Inter (loaded via CSS in layout.tsx)

### Project Structure

```
app/
├── page.tsx           # Main page with scroll-snap container, renders 8 sections
├── layout.tsx         # Root layout with Google Fonts CSS import
├── globals.css        # Design system: colors, animations, glow effects
├── sections/          # 8 full-screen sections (Hero, Problem, Solution, etc.)
├── components/        # Reusable UI: HUDPanel, Viewport, Buttons, etc.
├── hooks/             # useScrollSnap (keyboard nav + intersection observer)
└── lib/utils.ts       # cn() utility for tailwind-merge
public/
└── images/            # LuminaEye_Concept.jpg and other assets
```

### Design System (globals.css)

**Colors**:
- `--color-void`: #0a0a0f (background)
- `--color-panel`: #111118 (cards/panels)
- `--color-cyan`: #00f0ff (primary)
- `--color-magenta`: #ff00a0 (alerts/highlights)
- `--color-lime`: #00ff88 (success/blindpath mode)
- `--color-yellow`: #ffdd00 (warning/crossing mode)
- `--color-gray`: #8a8a9a (secondary text)

**Key Patterns**:
- Glow effects via `glow-cyan`, `glow-magenta`, `glow-lime` classes
- HUD corner brackets using absolute positioned borders
- Scan line animation (4s cycle) for cyberpunk aesthetic
- `snap-section` class for scroll-snap behavior

### Scroll-Snap Navigation

The main page implements section-based navigation:
- **Container**: `h-screen overflow-y-scroll snap-y snap-mandatory`
- **Sections**: Full viewport (`min-h-screen`) with `snap-start`
- **Progress Dots**: Right-edge indicators showing current section
- **Keyboard**: Arrow keys, Page Up/Down, Home/End for navigation
- **Cooldown**: 800ms between scrolls to prevent rapid firing

### Viewport Component

Simulates the glasses' AI vision with:
- Mode-based object detection (blindpath, crossing, search, traffic)
- Animated bounding boxes with confidence scores
- Parallax effect responding to mouse position (Demo section)
- HUD overlays: REC indicator, FPS counter, confidence %

### Key Implementation Notes

1. **Static Export**: `next.config.ts` uses `output: 'export'` with `images: { unoptimized: true }` for static hosting
2. **Fonts**: Loaded via `<link>` in layout.tsx head (not next/font/google due to build issues)
3. **Animations**: Framer Motion variants with `staggerChildren` for sequential reveals
4. **Responsive**: Mobile-first with lg: breakpoint for desktop layouts
5. **Reduced Motion**: Respects `prefers-reduced-motion` in CSS

### Framer Motion Patterns

```typescript
// Container with staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.4 }
  }
};

// Fade up item
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};
```

### Section-Specific Behavior

- **Hero**: Split layout (55% image, 45% content), concept image with floating animation
- **Solution**: Interactive mode switcher (tabs) with crossfade Viewport transitions
- **Demo**: Mouse-controlled parallax viewport
- **CTA**: Form with success state, no actual submission (demo only)

## Known Constraints

- No backend API - form submission is simulated
- Static export means no server-side features
- Images must be in `public/` directory
- Build output goes to `dist/` (configured in next.config.ts)
