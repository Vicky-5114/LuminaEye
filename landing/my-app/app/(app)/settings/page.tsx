"use client";

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { success } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("lumina_sound_enabled") !== "false";
  });

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("lumina_sound_enabled", String(next));
  };

  const handleClearData = () => {
    localStorage.removeItem("lumina_posts");
    localStorage.removeItem("lumina_comments");
    localStorage.removeItem("lumina_likes");
    localStorage.removeItem("lumina_bookmarks");
    success("Local data cleared successfully");
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Settings</h1>

      <section className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6 transition-colors">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <span className="text-[var(--color-text-secondary)]">Theme</span>
          <div className="flex bg-[var(--color-bg)] rounded-lg p-1">
            <button
              onClick={() => theme === "dark" && toggleTheme()}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                theme === "light"
                  ? "bg-[var(--color-card)] text-[var(--color-text)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => theme === "light" && toggleTheme()}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                theme === "dark"
                  ? "bg-[var(--color-card)] text-[var(--color-text)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6 transition-colors">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Notifications</h2>
        <div className="flex items-center justify-between">
          <span className="text-[var(--color-text-secondary)]">Sound effects</span>
          <button
            onClick={handleSoundToggle}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              soundEnabled ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
            }`}
            aria-pressed={soundEnabled}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                soundEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      <section className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6 transition-colors">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Data</h2>
        <button
          onClick={handleClearData}
          className="px-4 py-2 bg-[var(--color-danger)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-danger-hover)] transition-colors"
        >
          Clear Local Data
        </button>
        <p className="text-xs text-[var(--color-text-secondary)] mt-2">
          This will remove all posts, comments, likes, and bookmarks stored in your browser.
        </p>
      </section>
    </div>
  );
}
