# LuminaEye App UI Polish & Cyberpunk Dark Mode

## Overview

Refine the post-login app pages with two goals:
1. **Night mode redesign** — transform from clean dark-slate into a cyberpunk HUD aesthetic that matches the landing page's high-contrast black background and neon accents.
2. **Feature & polish additions** — add toast notifications, user profile dropdown, settings page, online status, post bookmarking, page transitions, loading skeletons, and improved empty states.

**Scope**: Files under `app/(app)/` only. Landing page remains untouched.
**Branch**: Continue on `ui-beautify`.

---

## Design System

### Light Mode (Current, Refined)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#fafbfc` | Page background |
| `--color-card` | `#ffffff` | Card/panel background |
| `--color-border` | `#e5e7eb` | Borders |
| `--color-text` | `#111827` | Primary text |
| `--color-text-secondary` | `#6b7280` | Secondary text |
| `--color-accent` | `#0ea5e9` | Primary accent |
| `--color-accent-hover` | `#0284c7` | Accent hover |
| `--color-success` | `#10b981` | Success |
| `--color-warning` | `#f59e0b` | Warning |
| `--color-danger` | `#ef4444` | Danger |

**Light mode additions**:
- Card hover: `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`
- Button active: `active:scale-[0.98]`
- Focus ring: `focus:ring-2 focus:ring-[var(--color-accent)]/50`

### Night Mode (Cyberpunk HUD)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0a0a0f` | Page background (matches landing page) |
| `--color-card` | `#111118` | Card/panel with glassmorphism |
| `--color-border` | `rgba(0, 240, 255, 0.1)` | Subtle cyan borders |
| `--color-text` | `#ffffff` | Primary text |
| `--color-text-secondary` | `#8a8a9a` | Secondary text |
| `--color-accent` | `#00f0ff` | Neon cyan (matches landing page) |
| `--color-accent-hover` | `#33f3ff` | Cyan hover (brighter) |
| `--color-success` | `#00ff88` | Neon lime |
| `--color-warning` | `#ffdd00` | Neon yellow |
| `--color-danger` | `#ff00a0` | Neon magenta |
| `--color-danger-hover` | `#ff33b3` | Magenta hover |

**Night mode atmosphere**:
- Cards: `bg-[#111118]/80 backdrop-blur border border-[rgba(0,240,255,0.1)]`
- Accent glow on hover: `hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] hover:border-cyan-500/30`
- Navbar: `bg-[#0a0a0f]/80 backdrop-blur border-b border-cyan-500/20`
- Optional subtle scan-line overlay (very low opacity CSS background pattern)

### CSS Architecture

In `globals.css`, the `html[data-theme="dark"]` block is updated to use the cyberpunk palette above. The `html[data-theme="light"]` block stays as-is.

The `@theme inline` block keeps the original landing-page cyberpunk static values (already restored), so the landing page continues to work correctly.

App pages use `var(--color-*)` custom properties directly for both themes.

---

## Shared Components

### Toast Notification System

**Component**: `app/(app)/components/ToastContainer.tsx`
- Mounted once in `layout.tsx` at the root level
- Consumes a new `ToastContext` for global toast state
- Position: `fixed top-4 right-4 z-[60]`
- Stacked vertically with `gap-2`
- Auto-dismiss after 3 seconds with a thin top progress bar

**Toast types**:
| Type | Background | Border | Icon |
|------|-----------|--------|------|
| Success | `bg-emerald-500/10` | `border-emerald-500/30` | Checkmark |
| Error | `bg-red-500/10` | `border-red-500/30` | X mark |
| Info | `bg-sky-500/10` | `border-sky-500/30` | Info circle |

**Toast card style**:
```
bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg
px-4 py-3 min-w-[280px] max-w-[400px]
transform transition-all duration-300
```

**Animation**: Slide in from right (`translateX(100%) → translateX(0)`) + fade in. Exit: slide right + fade out.

**Usage examples**:
- Login success: `toast.success('Welcome back, ' + user.name)`
- Post created: `toast.success('Post published')`
- Help request sent: `toast.info('Help request sent')`
- Comment posted: `toast.success('Comment added')`
- Error: `toast.error('Invalid glasses ID format')`

### User Profile Dropdown (Navbar)

**Location**: Replaces the plain text logout button in `Navbar.tsx`
- Clicking the avatar circle opens a dropdown card
- Click-outside to close

**Dropdown content**:
```
┌────────────────────────────┐
│ [Avatar] John Doe          │
│ Blind User                 │
│ GL-2025-001                │
├────────────────────────────┤
│ Profile          →         │
│ Settings         →         │
├────────────────────────────┤
│ Logout                     │
└────────────────────────────┘
```

**Dropdown style**:
```
bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-xl
w-56 py-2 mt-2
```

**Items**:
- Profile: placeholder link (`#`, shows "Coming soon" toast)
- Settings: link to `/settings`
- Logout: red text on hover, calls existing `logout()`

### Page Transition Wrapper

**Component**: `app/(app)/components/PageTransition.tsx`
- Wraps `{children}` in `layout.tsx`
- Uses `framer-motion` with `AnimatePresence` keyed on `usePathname()`
- Animation: `opacity: 0→1`, `y: 12→0`, `duration: 0.25s`, `ease: easeOut`

### Loading Skeleton

**Component**: `app/(app)/components/Skeleton.tsx`
- Reusable shimmer skeleton
- Props: `width`, `height`, `rounded` (`sm` | `md` | `lg` | `full`)
- Light mode shimmer: `#e5e7eb` → `#f3f4f6`
- Dark mode shimmer: `#1a1a2e` → `#2a2a3e`
- CSS animation: `shimmer` keyframe, 1.5s infinite

**Instances**:
- `ForumSkeleton`: 3 rows of post card skeletons
- `MapListSkeleton`: 4 list item skeletons

---

## New Pages

### Settings Page (`/settings`)

**File**: `app/(app)/settings/page.tsx`

A simple settings panel with theme-aware styling:

```
┌─────────────────────────────────────┐
│ Settings                            │
├─────────────────────────────────────┤
│ Appearance                          │
│ [Light] [Dark]  (segmented control) │
├─────────────────────────────────────┤
│ Notifications                       │
│ Sound effects  [toggle]             │
├─────────────────────────────────────┤
│ Data                                │
│ [Clear Local Data] (danger button)  │
└─────────────────────────────────────┘
```

**Settings**:
- Theme toggle: segmented control (Light / Dark), synced with `ThemeContext`
- Sound effects toggle: `localStorage` key `lumina_sound_enabled`, default `true`
- Clear local data: button that removes `lumina_posts`, `lumina_comments`, `lumina_likes`, `lumina_bookmarks` from localStorage, then shows success toast

---

## Page-by-Page Changes

### Navbar (`Navbar.tsx`)

- Add user profile dropdown (replaces plain logout button)
- Theme toggle stays in place
- Night mode: `bg-[#0a0a0f]/80 backdrop-blur border-b border-cyan-500/20`
- Active nav link in night mode: `text-cyan-400 bg-cyan-400/10 border-b-2 border-cyan-400`

### Login Page (`login/LoginContent.tsx`)

- Add page transition wrapper
- Add toast on login success/error
- Night mode: card becomes glassmorphism HUD panel with cyan border glow
- Inputs in night mode: `bg-[#0a0a0f] border-cyan-500/20 focus:border-cyan-400 focus:shadow-[0_0_8px_rgba(0,240,255,0.2)]`

### Forum Page (`forum/page.tsx`)

- Add page transition
- Add loading skeleton while posts load
- Add bookmark icon to each post card (outline → filled)
- Add "Bookmarked" filter pill
- Empty state: centered icon + "No posts yet. Be the first to share!" + "New Post" CTA
- Toast on post creation
- Night mode: cards get glassmorphism + cyan border glow on hover

### Post Detail (`forum/post/PostContent.tsx`)

- Add bookmark button in post header
- Add page transition
- Toast on comment submission
- Night mode: comment cards get glassmorphism

### Map Page (`map/page.tsx`)

- Add page transition
- Add loading skeleton for list view
- Empty state: map icon + "No locations match your filter"
- Online status badge for volunteers in list view: green pulsing dot + "Online"
- Night mode: map container border becomes cyan-500/20, legend cards become glassmorphism

### Video Page (`video/page.tsx`)

- Add page transition
- Empty state for volunteer (no requests): camera icon + "Waiting for help requests..." with pulse
- Toast on help request sent / accepted / ended
- Night mode: video container gets cyan border glow, status cards become glassmorphism HUD panels

### HelpNotification (`HelpNotification.tsx`)

- Night mode: card becomes glassmorphism with magenta top accent glow
- Add toast when request is accepted: "Connected with [Name]"

---

## Implementation Notes

### Framer Motion

Already in `package.json` (used by landing page). Use for:
- Page transitions (`AnimatePresence` + `motion.div`)
- Toast enter/exit animations
- Skeleton shimmer (optional, can be CSS-only)

### Toast Context

New context `app/(app)/context/ToastContext.tsx`:
```typescript
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toasts: Toast[];
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
  removeToast: (id: string) => void;
}
```

### Accessibility

- Toast container has `role="region" aria-label="Notifications"`
- Each toast has `role="alert"` (for errors) or `role="status"` (for success/info)
- Profile dropdown: `aria-expanded`, `aria-haspopup="menu"`, arrow key navigation
- All new interactive elements maintain visible focus states

### Performance

- Page transition uses `layout` prop sparingly to avoid layout thrashing
- Skeletons are pure CSS (no JS animation frames)
- Toast auto-dismiss uses `setTimeout` with cleanup on unmount

---

## Out of Scope

- Landing page changes
- Backend API changes
- Real online status (uses mock/randomized data)
- Direct messaging / chat (social expansion, not in this scope)
- Volunteer leaderboard (social expansion, not in this scope)
- Sound effect files (toggle UI only, actual sounds not included)
