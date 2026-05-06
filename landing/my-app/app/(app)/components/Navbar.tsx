"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRole } from "../context/RoleContext";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { role, user, logout } = useRole();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { href: "/forum", blind: "Community", volunteer: "Community" },
    { href: "/video", blind: "Video Help", volunteer: "Video Assist" },
    { href: "/map", blind: "Nearby Help", volunteer: "Assistance Map" },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-card)]/90 backdrop-blur border-b border-[var(--color-border)] transition-colors duration-300 dark:bg-[#0a0a0f]/80 dark:border-cyan-500/20"
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
                    ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10 dark:text-cyan-400 dark:bg-cyan-400/10"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] dark:hover:bg-[#111118]"
                } ${isVideoHelp && !isActive ? "text-[var(--color-danger)]" : ""}`}
              >
                {role === "blind" ? item.blind : item.volunteer}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 rounded-lg px-2 py-1"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center text-sm font-semibold">
                  {user.name[0]}
                </div>
                <span className="text-sm text-[var(--color-text-secondary)] hidden sm:inline max-w-[80px] truncate">
                  {user.name}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-[var(--color-border)]">
                    <div className="font-medium text-[var(--color-text)]">{user.name}</div>
                    <div className="text-xs text-[var(--color-text-secondary)] capitalize">
                      {role} {role === "blind" && user.glassesId ? `· ${user.glassesId}` : ""}
                    </div>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-[var(--color-bg)] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
