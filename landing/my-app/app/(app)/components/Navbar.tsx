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
