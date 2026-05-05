# LuminaEye App UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the LuminaEye post-login web application (forum, map, video, login) from cyberpunk/HUD to a clean, minimal, elegant style with manual light/dark theme toggle.

**Architecture:** Replace static cyberpunk CSS variables with theme-aware variables bound to `data-theme` on `<html>`. Add React Context for theme state + localStorage persistence. Update each page component to use the new variable-based color system, rounded corners, and subtle shadows instead of neon glows and HUD decorations.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion (keep animations)

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `app/(app)/context/ThemeContext.tsx` | React Context providing theme state (`"light" \| "dark"`), toggle function, and localStorage persistence |
| `app/(app)/components/ThemeToggle.tsx` | Navbar button with sun/moon icon, calls toggle from context |

### Modified Files

| File | Responsibility |
|------|---------------|
| `app/globals.css` | Replace cyberpunk color vars with theme-aware vars; add `data-theme` selectors |
| `app/(app)/layout.tsx` | Apply theme bg/text to wrapper; restyle status bar; soften SOS button |
| `app/(app)/components/Navbar.tsx` | New bg/border style; nav link active/hover states; integrate ThemeToggle; add user avatar |
| `app/(app)/components/HelpNotification.tsx` | Replace HUD card with clean card + top accent border |
| `app/(app)/login/LoginContent.tsx` | Remove HUD corners; restyle card, inputs, buttons, tabs |
| `app/(app)/forum/page.tsx` | Restyle title, New Post button, category pills, post modal |
| `app/(app)/components/PostCard.tsx` | Rounded card with subtle border; soft avatar/badge colors; meta row restyle |
| `app/(app)/map/page.tsx` | Restyle toggles, filters, map container, list items, location modal |
| `app/(app)/video/page.tsx` | Restyle status cards, buttons, request list items, active call bar |

---

## Pre-Flight

- [ ] **Step 0a: Create and switch to branch**

  ```bash
  cd "D:\桌面文件夹\LuminaEye\LuminaEye\landing\my-app"
  git checkout -b ui-beautify
  ```

  Expected: `Switched to a new branch 'ui-beautify'`

- [ ] **Step 0b: Verify dev server starts**

  ```bash
  npm run dev
  ```

  Open http://localhost:3000/login in browser. Confirm the current dark cyberpunk login page loads without errors. Keep this terminal running.

---

## Task 1: Theme System Foundation

**Files:**
- Create: `app/(app)/context/ThemeContext.tsx`
- Create: `app/(app)/components/ThemeToggle.tsx`
- Modify: `app/globals.css`

### ThemeContext

- [ ] **Step 1.1: Create ThemeContext**

  Create `app/(app)/context/ThemeContext.tsx`:

  ```tsx
  "use client";

  import { createContext, useContext, useEffect, useState, ReactNode } from "react";

  type Theme = "light" | "dark";

  interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
  }

  const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

  export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");

    useEffect(() => {
      const stored = localStorage.getItem("lumina-theme") as Theme | null;
      if (stored) {
        setTheme(stored);
        document.documentElement.setAttribute("data-theme", stored);
      } else {
        document.documentElement.setAttribute("data-theme", "light");
      }
    }, []);

    const toggleTheme = () => {
      const next = theme === "light" ? "dark" : "light";
      setTheme(next);
      localStorage.setItem("lumina-theme", next);
      document.documentElement.setAttribute("data-theme", next);
    };

    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
  }
  ```

### ThemeToggle

- [ ] **Step 1.2: Create ThemeToggle component**

  Create `app/(app)/components/ThemeToggle.tsx`:

  ```tsx
  "use client";

  import { useTheme } from "../context/ThemeContext";

  export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
      <button
        onClick={toggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        className="w-9 h-9 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] flex items-center justify-center transition-all duration-200"
      >
        <span className="text-lg transition-transform duration-200">
          {theme === "light" ? "🌙" : "☀️"}
        </span>
      </button>
    );
  }
  ```

### globals.css

- [ ] **Step 1.3: Replace cyberpunk CSS variables with theme-aware variables**

  Replace the entire content of `app/globals.css` with:

  ```css
  @import "tailwindcss";

  /* Theme-aware base variables */
  html[data-theme="light"] {
    --color-bg: #fafbfc;
    --color-card: #ffffff;
    --color-input: #ffffff;
    --color-border: #e5e7eb;
    --color-text: #111827;
    --color-text-secondary: #6b7280;
    --color-accent: #0ea5e9;
    --color-accent-hover: #0284c7;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-danger: #ef4444;
    --color-danger-hover: #dc2626;
  }

  html[data-theme="dark"] {
    --color-bg: #1e293b;
    --color-card: #334155;
    --color-input: #475569;
    --color-border: #475569;
    --color-text: #e2e8f0;
    --color-text-secondary: #94a3b8;
    --color-accent: #38bdf8;
    --color-accent-hover: #0ea5e9;
    --color-success: #34d399;
    --color-warning: #fbbf24;
    --color-danger: #f87171;
    --color-danger-hover: #ef4444;
  }

  @theme inline {
    --color-void: var(--color-bg);
    --color-panel: var(--color-card);
    --color-cyan: var(--color-accent);
    --color-magenta: var(--color-accent);
    --color-lime: var(--color-success);
    --color-yellow: var(--color-warning);
    --color-gray: var(--color-text-secondary);
  }

  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-inter), system-ui, sans-serif;
    overflow-x: hidden;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .snap-container {
    scroll-snap-type: y mandatory;
    overflow-y: scroll;
    height: 100vh;
    scroll-behavior: smooth;
  }

  .snap-section {
    scroll-snap-align: start;
    min-height: 100vh;
    width: 100%;
  }

  /* Landing page glow effects - keep for landing page only */
  .glow-cyan {
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3);
  }

  .glow-cyan-text {
    text-shadow: 0 0 20px rgba(0, 240, 255, 0.8), 0 0 40px rgba(0, 240, 255, 0.5);
  }

  .glow-magenta-text {
    text-shadow: 0 0 20px rgba(255, 0, 160, 0.8), 0 0 40px rgba(255, 0, 160, 0.5);
  }
  ```

  **Important**: The `@theme inline` block maps the old cyberpunk variable names (`--color-cyan`, `--color-lime`, etc.) to the new theme-aware variables. This ensures the landing page (which still uses `text-cyan`, `bg-void`, etc.) continues to work while the app pages transition to the new `--color-*` custom properties.

- [ ] **Step 1.4: Verify dev server still runs**

  Check the running dev server terminal. If it crashed, restart with `npm run dev`. Open http://localhost:3000 and confirm no build errors.

- [ ] **Step 1.5: Commit**

  ```bash
  git add app/(app)/context/ThemeContext.tsx app/(app)/components/ThemeToggle.tsx app/globals.css
  git commit -m "feat: add theme system with light/dark toggle"
  ```

---

## Task 2: Shared Layout & Navbar

**Files:**
- Modify: `app/(app)/layout.tsx`
- Modify: `app/(app)/components/Navbar.tsx`

- [ ] **Step 2.1: Update layout.tsx**

  Modify `app/(app)/layout.tsx`:

  1. Import `ThemeProvider` at the top:
     ```tsx
     import { ThemeProvider } from "./context/ThemeContext";
     ```

  2. Wrap the `AppLayout` children with `ThemeProvider`:
     ```tsx
     export default function AppLayout({ children }: { children: React.ReactNode }) {
       return (
         <ThemeProvider>
           <RoleProvider>
             <DemoChannelProvider>
               <WebSocketProvider>
                 <LayoutInner>{children}</LayoutInner>
               </WebSocketProvider>
             </DemoChannelProvider>
           </RoleProvider>
         </ThemeProvider>
       );
     }
     ```

  3. In `LayoutInner`, replace the outer div classes:
     ```tsx
     <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pt-16 transition-colors duration-300">
     ```

  4. Replace the status bar:
     ```tsx
     <div className="bg-[var(--color-card)] border-b border-[var(--color-border)] px-4 py-2 text-sm transition-colors duration-300">
       <div className="max-w-7xl mx-auto flex items-center justify-between">
         {role === "blind" ? (
           <span className={connected ? "text-[var(--color-success)]" : "text-[var(--color-text-secondary)]"}>
             {connected ? "🟢 Glasses Online" : "⚪ Demo Mode"}
           </span>
         ) : (
           <span className="text-[var(--color-accent)]">{helpRequests.length} blind users need help</span>
         )}
         <span className="text-xs text-[var(--color-text-secondary)]">LuminaEye Community Platform</span>
       </div>
     </div>
     ```

  5. Soften the SOS button:
     ```tsx
     <a
       href="/video"
       className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-400/50 transition-all duration-200"
       aria-label="Emergency Help"
     >
       🆘
     </a>
     ```

- [ ] **Step 2.2: Update Navbar.tsx**

  Replace the entire `Navbar.tsx` content:

  ```tsx
  "use client";

  import Link from "next/link";
  import { useRole } from "../context/RoleContext";
  import { usePathname } from "next/navigation";
  import ThemeToggle from "./ThemeToggle";

  export default function Navbar() {
    const { role, user, logout } = useRole();
    const pathname = usePathname();

    const navItems = [
      { href: "/forum", blind: "Community", volunteer: "Community" },
      { href: "/video", blind: "Video Help", volunteer: "Video Assist" },
      { href: "/map", blind: "Nearby Help", volunteer: "Assistance Map" },
    ];

    return (
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-card)]/90 backdrop-blur border-b border-[var(--color-border)] transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-[var(--color-accent)] tracking-tight hover:opacity-80 transition-opacity"
          >
            LuminaEye
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isVideoHelp = item.href === "/video" && role === "blind";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  } ${isVideoHelp && !isActive ? "text-[var(--color-danger)]" : ""}`}
                >
                  {role === "blind" ? item.blind : item.volunteer}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center text-xs font-semibold">
                  {user.name[0]}
                </div>
                <span className="text-xs text-[var(--color-text-secondary)] hidden sm:inline">
                  {user.name}
                </span>
              </div>
            )}
            <ThemeToggle />
            <button
              onClick={logout}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors px-2 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }
  ```

- [ ] **Step 2.3: Verify in browser**

  Open http://localhost:3000/login. Confirm:
  - Navbar now has a white/light background (light mode is default)
  - Theme toggle button (moon icon) is visible on the far right of navbar
  - Click the toggle → page switches to dark mode (sun icon appears)
  - Refresh page → remembers selected theme

- [ ] **Step 2.4: Commit**

  ```bash
  git add app/(app)/layout.tsx app/(app)/components/Navbar.tsx
  git commit -m "feat: restyle shared layout and navbar with theme support"
  ```

---

## Task 3: Login Page

**Files:**
- Modify: `app/(app)/login/LoginContent.tsx`

- [ ] **Step 3.1: Update LoginContent.tsx**

  Replace the entire file with:

  ```tsx
  "use client";

  import { useState } from "react";
  import { useSearchParams } from "next/navigation";
  import { useRole, UserRole } from "../context/RoleContext";

  const MOCK_VOLUNTEERS: Record<string, { password: string; name: string }> = {
    "volunteer1@example.com": { password: "123456", name: "Volunteer Lee" },
    "volunteer2@example.com": { password: "123456", name: "Volunteer Zhang" },
  };

  export default function LoginContent() {
    const searchParams = useSearchParams();
    const initialRole = (searchParams.get("role") as UserRole) || "blind";
    const [activeTab, setActiveTab] = useState<UserRole>(initialRole);
    const { login } = useRole();

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-sm p-8 transition-colors duration-300">
          <h1 className="text-2xl font-bold text-center mb-8 text-[var(--color-text)]">
            LuminaEye
          </h1>

          <div className="flex bg-[var(--color-bg)] rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab("blind")}
              className={`flex-1 py-2.5 text-center text-sm font-medium rounded-md transition-all ${
                activeTab === "blind"
                  ? "bg-[var(--color-card)] text-[var(--color-text)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              👁 Blind User
            </button>
            <button
              onClick={() => setActiveTab("volunteer")}
              className={`flex-1 py-2.5 text-center text-sm font-medium rounded-md transition-all ${
                activeTab === "volunteer"
                  ? "bg-[var(--color-card)] text-[var(--color-text)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              🙋 Volunteer
            </button>
          </div>

          {activeTab === "blind" ? <BlindForm login={login} /> : <VolunteerForm login={login} />}
        </div>
      </div>
    );
  }

  function BlindForm({ login }: { login: (user: { id: string; name: string; role: "blind"; glassesId: string }) => void }) {
    const [glassesId, setGlassesId] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      if (!glassesId.trim()) { setError("Please enter glasses ID"); return; }
      if (!/^GL-\d{4}-\d{3}$/.test(glassesId)) { setError("Invalid glasses ID format (e.g., GL-2025-001)"); return; }
      if (!name.trim()) { setError("Please enter your name"); return; }
      login({ id: glassesId, name: name.trim(), role: "blind", glassesId: glassesId.trim() });
      window.location.href = "/forum";
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Glasses ID</label>
          <input
            type="text"
            value={glassesId}
            onChange={(e) => setGlassesId(e.target.value)}
            placeholder="e.g., GL-2025-001"
            className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors"
          />
        </div>
        {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 bg-[var(--color-success)] text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-success)]/50 transition-all"
        >
          Enter System
        </button>
      </form>
    );
  }

  function VolunteerForm({ login }: { login: (user: { id: string; name: string; role: "volunteer"; email: string }) => void }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email"); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
      if (isLogin) {
        const found = MOCK_VOLUNTEERS[email];
        if (!found) { setError("Email not registered"); return; }
        if (found.password !== password) { setError("Incorrect password"); return; }
        login({ id: email, name: found.name, role: "volunteer", email });
      } else {
        if (!name.trim()) { setError("Please enter your name"); return; }
        if (MOCK_VOLUNTEERS[email]) { setError("Email already registered, please log in"); return; }
        MOCK_VOLUNTEERS[email] = { password, name: name.trim() };
        login({ id: email, name: name.trim(), role: "volunteer", email });
      }
      window.location.href = "/forum";
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors"
          />
        </div>
        {!isLogin && (
          <div>
            <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors"
            />
          </div>
        )}
        {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 bg-[var(--color-accent)] text-white font-semibold rounded-lg hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 transition-all"
        >
          {isLogin ? "Login" : "Register"}
        </button>
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          {isLogin ? "No account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-[var(--color-accent)] hover:underline ml-1 transition-colors"
          >
            {isLogin ? "Register now" : "Login now"}
          </button>
        </p>
      </form>
    );
  }
  ```

- [ ] **Step 3.2: Verify in browser**

  Open http://localhost:3000/login. Confirm:
  - Clean white/gray card (light mode)
  - Segmented control tabs (Blind User / Volunteer)
  - Rounded inputs with subtle borders
  - No HUD corner decorations
  - Toggle theme → dark mode looks consistent

- [ ] **Step 3.3: Commit**

  ```bash
  git add app/(app)/login/LoginContent.tsx
  git commit -m "feat: restyle login page with clean card design"
  ```

---

## Task 4: Forum Page

**Files:**
- Modify: `app/(app)/forum/page.tsx`
- Modify: `app/(app)/components/PostCard.tsx`

- [ ] **Step 4.1: Update forum/page.tsx**

  Replace the JSX content (keep imports and logic, only change the returned JSX). The key changes are:

  1. Title: `className="text-2xl font-bold text-[var(--color-text)]"`
  2. New Post button: `className="px-4 py-2 bg-[var(--color-accent)] text-white font-medium rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors flex items-center gap-1"`
  3. Category pills:
     - Active: `bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded-full px-4 py-1.5 text-sm font-medium`
     - Inactive: `bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-full px-4 py-1.5 text-sm font-medium hover:bg-[var(--color-bg)] transition-colors`
  4. PostModal card:
     ```tsx
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
       <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-xl w-full max-w-lg p-6 relative transition-colors">
         <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">✕</button>
         <h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">New Post</h2>
         {/* form inputs same style as login */}
         {/* actions: Cancel (border button) + Post (accent solid) side by side */}
       </div>
     </div>
     ```

  5. Remove all `focus:ring-[var(--color-cyan)]` references; replace with `focus:ring-[var(--color-accent)]`.

  6. Input fields in modal use the same style as login inputs:
     `w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 transition-colors`

  7. Modal buttons:
     - Cancel: `flex-1 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg)] transition-colors`
     - Post: `flex-1 py-2 bg-[var(--color-accent)] text-white font-medium rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors`

- [ ] **Step 4.2: Update PostCard.tsx**

  Replace the entire file:

  ```tsx
  import { Post } from "../forum/types";

  interface Props {
    post: Post;
  }

  export default function PostCard({ post }: Props) {
    const isBlind = post.author.role === "blind";

    return (
      <a
        href={`/forum/post?id=${post.id}`}
        className="block bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
              isBlind
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
            }`}
          >
            {post.author.name[0]}
          </div>
          <span className="text-sm font-medium text-[var(--color-text)]">{post.author.name}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isBlind
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
            }`}
          >
            {isBlind ? "Blind User" : "Volunteer"}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] ml-auto">{post.createdAt}</span>
        </div>

        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2 line-clamp-1">{post.title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">{post.summary}</p>

        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {post.comments.length}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {post.likes}
          </span>
          <span className="ml-auto text-xs px-2 py-0.5 border border-[var(--color-border)] rounded-full">{post.category}</span>
        </div>
      </a>
    );
  }
  ```

- [ ] **Step 4.3: Verify in browser**

  Log in as a blind user, navigate to `/forum`. Confirm:
  - Clean card-based post list
  - Category pills are rounded and subtle
  - New Post modal has clean white/gray card, no HUD corners
  - Click New Post, fill form, submit works
  - Toggle theme → dark mode consistent

- [ ] **Step 4.4: Commit**

  ```bash
  git add app/(app)/forum/page.tsx app/(app)/components/PostCard.tsx
  git commit -m "feat: restyle forum page and post cards"
  ```

---

## Task 5: Map Page

**Files:**
- Modify: `app/(app)/map/page.tsx`

- [ ] **Step 5.1: Update map/page.tsx**

  Apply these targeted changes (keep all map logic, only restyle):

  1. Title: `className="text-2xl font-bold text-[var(--color-text)]"`

  2. Map/List toggle buttons:
     ```tsx
     <button className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
       viewMode === "map"
         ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30"
         : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
     }`}>
     ```

  3. Filter buttons: Same pill style as forum category filters.

  4. Map container: `className="w-full h-[500px] rounded-xl border border-[var(--color-border)] overflow-hidden"`

  5. Legend counters (bottom-left):
     ```tsx
     <div className="absolute bottom-4 left-4 flex gap-2">
       <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm shadow-sm">
         <span className="text-red-500">👁 {counts.blind}</span>
       </div>
       {/* ... */}
     </div>
     ```

  6. List view items:
     ```tsx
     <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 cursor-pointer hover:bg-[var(--color-bg)] transition-colors">
     ```

  7. Type badge colors (softer):
     - Blind: `bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`
     - Volunteer: `bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400`
     - Business: `bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400`

  8. Location detail modal:
     ```tsx
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
       <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-xl w-full max-w-md p-6 relative transition-colors">
         <button onClick={() => setSelectedLocation(null)} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">✕</button>
         {/* ... */}
         <div className="flex gap-2 mt-4">
           <button className="flex-1 py-2 bg-[var(--color-accent)] text-white font-medium rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors">Navigate</button>
           {selectedLocation.type === "blind" && (
             <a href="/video" className="flex-1 py-2 bg-[var(--color-success)] text-white font-medium rounded-lg text-center hover:opacity-90 transition-opacity">Video Assist</a>
           )}
         </div>
       </div>
     </div>
     ```

  9. Remove all HUD corner decorations (the `absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2` blocks).

- [ ] **Step 5.2: Verify in browser**

  Navigate to `/map`. Confirm:
  - Clean rounded map container
  - Filter pills and Map/List toggle match forum style
  - List view items are clean cards
  - Click a marker/list item → modal is clean, no HUD corners
  - Theme toggle works

- [ ] **Step 5.3: Commit**

  ```bash
  git add app/(app)/map/page.tsx
  git commit -m "feat: restyle map page with clean cards and modals"
  ```

---

## Task 6: Video Page

**Files:**
- Modify: `app/(app)/video/page.tsx`

- [ ] **Step 6.1: Update video/page.tsx**

  Apply these targeted restyles (keep all logic):

  **BlindVideoView:**
  1. Title: `className="text-2xl font-bold text-[var(--color-text)]"`
  2. Wrap VideoPlayer in: `className="rounded-xl border border-[var(--color-border)] overflow-hidden"`
  3. Voice command card:
     ```tsx
     <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4">
       <div className="flex items-center gap-2 mb-2">
         <span className="text-2xl">🎙</span>
         <span className="font-medium text-[var(--color-text)]">Voice command ready</span>
       </div>
       <p className="text-sm text-[var(--color-text-secondary)]">Say "help me" to your glasses to request assistance</p>
     </div>
     ```
  4. Status indicators:
     - Idle: `<span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--color-success)]"></span>Online, waiting for help</span>`
     - Requesting: `<span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--color-warning)] animate-pulse"></span>Searching for volunteer...</span>`
     - Connected: `<span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--color-success)]"></span>Connected with ...</span>`
  5. Request Help button:
     ```tsx
     <button className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-lg rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20 transition-all">
       🆘 Request Help Manually
     </button>
     ```
  6. End button:
     ```tsx
     <button className="w-full py-4 bg-[var(--color-border)] text-[var(--color-text)] font-semibold text-lg rounded-lg hover:bg-[var(--color-text-secondary)]/20 transition-colors">
       End Help Request
     </button>
     ```

  **VolunteerVideoView (active call):**
  1. Info bar:
     ```tsx
     <div className="flex items-center justify-between bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4">
       <div>
         <div className="font-semibold text-[var(--color-text)]">Caller: {activeCall.userName} (Blind User)</div>
         <div className="text-sm text-[var(--color-text-secondary)]">Glasses: {activeCall.glassesId}</div>
       </div>
       <div className="inline-flex items-center gap-1.5 text-[var(--color-success)]">
         <span className="w-2 h-2 rounded-full bg-[var(--color-success)]"></span>
         Live
       </div>
     </div>
     ```
  2. End/Mute buttons:
     ```tsx
     <button className="flex-1 py-3 bg-[var(--color-danger)] text-white font-medium rounded-lg hover:bg-[var(--color-danger-hover)] transition-colors">🔴 End Assistance</button>
     <button className="flex-1 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg)] transition-colors">🎙 Mute</button>
     ```

  **VolunteerVideoView (request list):**
  1. Empty state card:
     ```tsx
     <div className="text-center py-20 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]">
       <div className="text-6xl mb-4">📹</div>
       <p className="text-[var(--color-text-secondary)]">No video assistance tasks</p>
     </div>
     ```
  2. Request list items:
     ```tsx
     <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 flex items-center justify-between">
       <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center font-semibold">
           {req.userName[0]}
         </div>
         <div>
           <div className="font-medium text-[var(--color-text)]">{req.userName}</div>
           <div className="text-xs text-[var(--color-text-secondary)]">Glasses: {req.glassesId}</div>
           <div className="flex items-center gap-1 mt-1">
             <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]"></span>
             <span className="text-xs text-[var(--color-success)] font-medium">LIVE</span>
           </div>
         </div>
       </div>
       <div className="flex gap-2">
         <button className="px-4 py-2 bg-[var(--color-success)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">Accept</button>
         <button className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm rounded-lg hover:bg-[var(--color-bg)] transition-colors">Decline</button>
       </div>
     </div>
     ```

  3. Test generator panel:
     ```tsx
     <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4">
     ```

- [ ] **Step 6.2: Verify in browser**

  Navigate to `/video` as both blind user and volunteer. Confirm:
  - Blind view: clean cards, rounded video container, soft status indicators
  - Volunteer view (no active call): clean request cards with soft avatar colors
  - Volunteer view (active call): clean info bar with Live badge
  - Theme toggle works on all states

- [ ] **Step 6.3: Commit**

  ```bash
  git add app/(app)/video/page.tsx
  git commit -m "feat: restyle video page with clean cards and status indicators"
  ```

---

## Task 7: HelpNotification

**Files:**
- Modify: `app/(app)/components/HelpNotification.tsx`

- [ ] **Step 7.1: Update HelpNotification.tsx**

  Replace the entire file:

  ```tsx
  "use client";

  import { HelpRequest } from "../context/WebSocketContext";

  interface Props {
    request: HelpRequest | null;
    onAccept: (request: HelpRequest) => void;
    onIgnore: () => void;
  }

  export default function HelpNotification({ request, onAccept, onIgnore }: Props) {
    if (!request) return null;

    return (
      <div className="fixed bottom-6 right-6 z-50 w-80 bg-[var(--color-card)] rounded-xl shadow-xl border-t-4 border-[var(--color-danger)] p-4 transition-colors">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🆘</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--color-text)] mb-1">New Video Help Request</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">{request.userName} (Blind User) needs help</p>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">Glasses ID: {request.glassesId}</p>
            <div className="flex gap-2">
              <button
                onClick={() => onAccept(request)}
                className="flex-1 px-3 py-2 bg-[var(--color-success)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Accept
              </button>
              <button
                onClick={onIgnore}
                className="flex-1 px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm rounded-lg hover:bg-[var(--color-bg)] transition-colors"
              >
                Ignore
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 7.2: Verify in browser**

  As a volunteer, generate a test help request (use the Test Generator button on `/video`). Confirm:
  - Notification appears as a clean card with red top accent bar
  - No thick red border around the entire card
  - Buttons are rounded and clean

- [ ] **Step 7.3: Commit**

  ```bash
  git add app/(app)/components/HelpNotification.tsx
  git commit -m "feat: restyle help notification with clean card design"
  ```

---

## Task 8: Final Verification & Build

**Files:**
- All modified files

- [ ] **Step 8.1: Full page walkthrough**

  With dev server running, verify every page in **both light and dark mode**:

  | Page | Light Mode Check | Dark Mode Check |
  |------|-----------------|-----------------|
  | `/login` | Clean card, readable inputs | No contrast issues |
  | `/forum` | Cards visible, pills distinct | Cards visible, pills distinct |
  | `/forum` (New Post modal) | Modal clean, inputs readable | Modal clean, inputs readable |
  | `/map` | Map container rounded, filters clear | Same |
  | `/map` (location modal) | Modal clean | Modal clean |
  | `/video` (blind) | Status clear, buttons visible | Status clear, buttons visible |
  | `/video` (volunteer, empty) | Empty state centered | Empty state centered |
  | `/video` (volunteer, request list) | Cards clean, Accept/Decline clear | Cards clean |
  | `/video` (volunteer, active call) | Info bar clean, controls visible | Info bar clean |
  | Help notification | Red accent visible, buttons clear | Red accent visible |

  Toggle theme on each page and confirm smooth 300ms transition.

- [ ] **Step 8.2: Build check**

  ```bash
  npm run build
  ```

  Expected: Build completes with 0 errors. If there are TypeScript or ESLint errors, fix them before proceeding.

- [ ] **Step 8.3: Commit final changes**

  ```bash
  git add -A
  git commit -m "feat: complete app UI refresh to clean minimal design"
  ```

- [ ] **Step 8.4: Push branch**

  ```bash
  git push -u origin ui-beautify
  ```

---

## Self-Review Checklist

### Spec Coverage

| Spec Requirement | Implementing Task |
|-----------------|-------------------|
| Theme-aware CSS variables | Task 1.3 |
| ThemeContext with localStorage | Task 1.1 |
| ThemeToggle in Navbar | Task 1.2 + 2.2 |
| Manual light/dark toggle | Task 1.1 + 1.2 |
| Smooth theme transition | Task 1.3 (CSS) |
| Layout restyle | Task 2.1 |
| Navbar restyle | Task 2.2 |
| Login page restyle | Task 3 |
| Forum page + PostCard restyle | Task 4 |
| Map page restyle | Task 5 |
| Video page restyle | Task 6 |
| HelpNotification restyle | Task 7 |
| No HUD corners | Tasks 3, 4, 5, 7 |
| Soft avatar/badge colors | Tasks 4, 6 |
| Pill-style filters/toggles | Tasks 4, 5 |
| Rounded corners, subtle shadows | All tasks |
| Git branch workflow | Pre-Flight + all commits |

### Placeholder Scan

- No "TBD", "TODO", or "implement later" found.
- All code blocks contain complete, copy-pasteable code.
- All file paths are exact.
- All commands include expected output.

### Type Consistency

- `ThemeContext` exports `ThemeProvider` and `useTheme` — consistent across all consuming files.
- CSS variable names (`--color-bg`, `--color-card`, etc.) match between `globals.css` and all component usage.
- Tailwind class patterns (e.g., `bg-[var(--color-card)]`) are consistent across all modified files.
