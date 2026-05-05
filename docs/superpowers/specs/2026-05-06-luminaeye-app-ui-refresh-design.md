# LuminaEye App UI Refresh Design

## Overview

Redesign the LuminaEye post-login web application (forum, map, video, login pages) from the current cyberpunk/HUD aesthetic to a clean, minimal, elegant style inspired by Outlook and GitHub. The landing page (`app/page.tsx`) remains unchanged.

**Scope**: Only files under `app/(app)/` and shared components used by those pages.
**Branch**: All work on `ui-beautify`.
**Theme**: Manual light/dark toggle with smooth transitions.

---

## Design System

### Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--bg-page` | `#fafbfc` | `#1e293b` | Page background |
| `--bg-card` | `#ffffff` | `#334155` | Card/panel background |
| `--bg-input` | `#ffffff` | `#475569` | Input field background |
| `--border` | `#e5e7eb` | `#475569` | Borders, dividers |
| `--text-primary` | `#111827` | `#e2e8f0` | Headings, primary text |
| `--text-secondary` | `#6b7280` | `#94a3b8` | Labels, captions, metadata |
| `--accent` | `#0ea5e9` | `#38bdf8` | Primary accent (buttons, links, active states) |
| `--accent-hover` | `#0284c7` | `#0ea5e9` | Accent hover state |
| `--success` | `#10b981` | `#34d399` | Online, success states |
| `--warning` | `#f59e0b` | `#fbbf24` | Requesting, pending states |
| `--danger` | `#ef4444` | `#f87171` | SOS, error, end call |
| `--danger-hover` | `#dc2626` | `#ef4444` | Danger hover |

### Typography

- **Font family**: Inter (already loaded), remove Orbitron/Rajdhani references
- **Headings**: `font-semibold` or `font-bold`, standard sizes
- **Body**: `font-normal`, `text-base` (`16px`)
- **Labels/captions**: `font-medium`, `text-sm` (`14px`), `tracking-wide`

### Spacing & Shape

- **Card radius**: `rounded-xl` (`12px`)
- **Button radius**: `rounded-lg` (`8px`)
- **Pill radius**: `rounded-full`
- **Card shadow (light)**: `0 1px 3px rgba(0,0,0,0.05)`
- **Card shadow (dark)**: `0 1px 3px rgba(0,0,0,0.2)`
- **Hover shadow**: slightly deeper, `0 4px 12px`
- **Section padding**: `px-4 py-6` inside `max-w-7xl mx-auto`

### Transitions

Global transition for theme switching:
```css
transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
```

---

## Theme System

### Architecture

- **ThemeContext**: React Context wrapping the app, stores `"light" | "dark"` in React state
- **Persistence**: Read/write `localStorage` key `"lumina-theme"` on mount and on change
- **Default**: `"light"` (fresh visit)
- **Data attribute**: `<html data-theme="light">` or `<html data-theme="dark">`
- **CSS variables**: Defined in `globals.css` using `data-theme` selector; Tailwind v4 `@theme inline` maps to these variables

### ThemeToggle Component

- **Location**: Fixed inside `Navbar` on the far right
- **Style**: Circular button, `w-9 h-9`, neutral background, subtle border
- **Icon**: Sun icon when dark mode active, Moon icon when light mode active
- **Animation**: 200ms rotation transition on icon swap
- **Hover**: Background darkens/lightens slightly

### Tailwind Integration

Replace the current cyberpunk CSS variables in `globals.css` with theme-aware variables:

```css
html[data-theme="light"] {
  --color-bg: #fafbfc;
  --color-card: #ffffff;
  --color-border: #e5e7eb;
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-accent: #0ea5e9;
}

html[data-theme="dark"] {
  --color-bg: #1e293b;
  --color-card: #334155;
  --color-border: #475569;
  --color-text: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-accent: #38bdf8;
}
```

---

## Shared Layout

### `(app)/layout.tsx`

- **Page background**: Use `bg-[var(--color-bg)]` (not `bg-[var(--color-void)]`)
- **Text color**: Use `text-[var(--color-text)]`
- **Status bar**: Light mode = white bg + `border-b` `#e5e7eb`, dark mode = `#334155` bg + `border-b` `#475569`
- **Status text**: Use secondary text color instead of neon cyan/green
- **SOS button**: Keep red, but soften to a gradient circle with softer shadow (`shadow-lg shadow-red-500/20`)
- **Remove**: No HUD-style decorative elements

### `Navbar.tsx`

- **Background**: Light = white with `border-b`; Dark = `#1e293b` with `border-b`
- **Backdrop blur**: Keep `backdrop-blur` for modern feel
- **Logo**: Remove neon glow. Plain bold text in accent color
- **Nav links**:
  - Default: `text-[var(--color-text-secondary)]`
  - Hover: `text-[var(--color-text)]`
  - Active: `text-[var(--color-accent)]` with `border-b-2 border-[var(--color-accent)]`
  - Blind video link: Remove `animate-pulse` on the link itself; use a subtle red dot indicator instead
- **User info**: Add a small avatar circle (initials) next to the name
- **Logout**: Plain text button, hover turns `text-red-500`
- **ThemeToggle**: Insert at far right of navbar

---

## Page-by-Page Design

### Login Page `login/LoginContent.tsx`

- **Card container**: `bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-sm`
- **Remove**: All 4 corner HUD border decorations
- **Title**: Normal weight, no glow. Can use a small Lumina icon above text
- **Role tabs (Blind/Volunteer)**:
  - Style: Segmented control / pill switcher
  - Active: Filled with accent color, white text
  - Inactive: Transparent, `text-[var(--color-text-secondary)]`, hover bg subtle
- **Input fields**:
  - `bg-[var(--color-bg)]` or `bg-transparent`
  - `border border-[var(--color-border)] rounded-lg`
  - `focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30`
  - Placeholder: `text-[var(--color-text-secondary)]/50`
- **Submit button**: `bg-[var(--color-accent)] text-white rounded-lg font-medium`, hover darkens
- **Error text**: `text-red-500` + optional left border accent
- **Toggle link** (Login/Register): `text-[var(--color-accent)]` with underline on hover

### Forum Page `forum/page.tsx`

- **Title**: `text-2xl font-bold text-[var(--color-text)]` (no cyan color)
- **New Post button**: `bg-[var(--color-accent)] text-white rounded-lg px-4 py-2`, with `+` icon
- **Category filter pills**:
  - Active: `bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded-full px-4 py-1.5`
  - Inactive: `bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-full px-4 py-1.5`, hover adds subtle bg
- **Post list**: `space-y-3` gap between cards

#### Post Modal

- **Overlay**: `bg-black/50` backdrop
- **Modal card**: `bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-xl max-w-lg`
- **Remove**: All 4 corner HUD decorations
- **Header**: `text-xl font-semibold mb-4`
- **Form inputs**: Same style as login inputs
- **Actions**: Cancel (border button) + Post (accent solid button), side by side

### Post Card `PostCard.tsx`

- **Card**: `bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-5`
  - Hover: `shadow-md` + slight translateY (`-translate-y-0.5`)
  - Remove left colored border accent; rely on role badge instead
- **Author avatar**: `w-8 h-8 rounded-full` with soft background
  - Blind: `bg-emerald-100 text-emerald-700` (light) / `bg-emerald-900/30 text-emerald-400` (dark)
  - Volunteer: `bg-sky-100 text-sky-700` (light) / `bg-sky-900/30 text-sky-400` (dark)
- **Role badge**: Small pill
  - Blind: `bg-emerald-100 text-emerald-700` / dark equivalent
  - Volunteer: `bg-sky-100 text-sky-700` / dark equivalent
- **Title**: `text-lg font-semibold text-[var(--color-text)]`
- **Summary**: `text-sm text-[var(--color-text-secondary)]`
- **Meta row**: Comments + likes with outline icons, smaller text. Category as a subtle border pill on the right.

### Map Page `map/page.tsx`

- **Title**: Standard heading, no cyan
- **View toggle (Map/List)**: Same segmented control style as forum category pills
- **Filter buttons**: Same pill style as forum categories
- **Map container**: `rounded-xl border border-[var(--color-border)] overflow-hidden`
- **Map legend (bottom-left counters)**:
  - Light: white bg cards with subtle shadow
  - Dark: `#334155` bg cards
  - Rounded, small padding
- **List view items**:
  - `bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4`
  - Hover: `bg-[var(--color-bg)]` subtle change
  - Type badge uses soft colors (same as post card role badges)
- **Location detail modal**:
  - Same modal style as forum post modal
  - Remove corner decorations
  - Buttons: Navigate (accent solid) + Video Assist (success/emerald solid)

### Video Page `video/page.tsx`

#### Blind View

- **VideoPlayer**: Wrap in `rounded-xl border border-[var(--color-border)] overflow-hidden`
- **Voice command card**: Standard card style
- **Status indicator**:
  - Idle: Green dot (`w-2 h-2 rounded-full bg-emerald-500`) + "Online"
  - Requesting: Yellow spinner or pulse dot + "Searching..."
  - Connected: Green dot + "Connected with [Name]"
- **Request Help button**:
  - `bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium w-full py-3`
  - Add SOS icon (🆘 or SVG)
- **End button**: `bg-gray-200 text-gray-800` (light) / `bg-gray-700 text-white` (dark)

#### Volunteer View

- **Active call info bar**: Standard card, left = user info, right = "Live" pill badge
  - Live badge: `bg-emerald-100 text-emerald-700` / dark equivalent, with small green dot
- **Control buttons**:
  - End: `bg-red-500 hover:bg-red-600 text-white rounded-lg`
  - Mute: `border border-[var(--color-border)] text-[var(--color-text)] rounded-lg`, hover bg subtle
- **Empty state**: Centered card with camera icon, muted text
- **Help request list items**:
  - Standard card style
  - Left: Avatar circle with soft color bg + initial
  - Middle: Name (bold), Glasses ID (small gray), Live badge
  - Right: Accept (`bg-emerald-500 text-white rounded-lg`) + Decline (`border button`)
  - Remove the bright `bg-[var(--color-lime)]/20` circle; use softer tones

### Help Notification `HelpNotification.tsx`

- **Card**: `bg-[var(--color-card)] rounded-xl shadow-xl border-t-4 border-red-500`
  - Remove the thick red border around entire card; use top accent bar instead
- **Title**: `font-semibold`
- **Buttons**: Same rounded style as elsewhere

---

## Component Inventory

### Modified Components

| Component | Key Changes |
|-----------|-------------|
| `(app)/layout.tsx` | Theme data-attribute on wrapper, new bg/text colors, status bar restyle, SOS button soften |
| `Navbar.tsx` | New bg/border, nav link styles, user avatar, theme toggle integration |
| `HelpNotification.tsx` | Card restyle, top accent border, rounded buttons |
| `LoginContent.tsx` | Card restyle, remove HUD corners, input/button restyle, tab switcher redesign |
| `forum/page.tsx` | Title, button, filter pills, modal restyle |
| `PostCard.tsx` | Card restyle, avatar/badge soft colors, meta row restyle |
| `map/page.tsx` | Title, toggles, filter pills, map container, list items, modal |
| `video/page.tsx` | Cards, status indicators, buttons, request list items |
| `app/globals.css` | Replace cyberpunk vars with theme-aware CSS variables |

### New Components

| Component | Purpose |
|-----------|---------|
| `ThemeContext.tsx` | React Context for theme state + localStorage persistence |
| `ThemeToggle.tsx` | Navbar button with sun/moon icon and rotation animation |

---

## Implementation Notes

### Git Workflow

All work on `ui-beautify` branch. Do not commit to `main`.

### Tailwind v4 Compatibility

The project uses Tailwind CSS v4 with `@import "tailwindcss"` and `@theme inline`. The theme variables should be defined as CSS custom properties and referenced in `@theme inline` so Tailwind generates the utility classes.

### Accessibility

- Maintain existing `aria-label`, `aria-current`, and `role` attributes
- Ensure color contrast meets WCAG AA in both light and dark modes
- Focus rings: `focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2`

### Testing Checklist

- [ ] Light mode renders correctly on all pages
- [ ] Dark mode renders correctly on all pages
- [ ] Theme toggle switches instantly with smooth transition
- [ ] Refresh page remembers selected theme
- [ ] All interactive elements have visible focus states
- [ ] No console errors after changes

---

## Out of Scope

- Landing page (`app/page.tsx` and `app/sections/*`) — unchanged
- Core functionality (WebSocket, video streaming, form submission logic) — unchanged
- Backend API — unchanged
- New features (search, pagination, etc.) — not included
