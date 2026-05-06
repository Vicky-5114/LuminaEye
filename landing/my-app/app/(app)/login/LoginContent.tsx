"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRole, UserRole } from "../context/RoleContext";
import { useToast } from "../context/ToastContext";

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
      <div className="w-full max-w-md bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-sm p-8 transition-colors duration-300 dark:shadow-[0_0_20px_rgba(0,240,255,0.08)]">
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
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!glassesId.trim()) { setError("Please enter glasses ID"); return; }
    if (!/^GL-\d{4}-\d{3}$/.test(glassesId)) { setError("Invalid glasses ID format (e.g., GL-2025-001)"); return; }
    if (!name.trim()) { setError("Please enter your name"); return; }
    success(`Welcome, ${name.trim()}!`);
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
          className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 dark:focus:shadow-[0_0_8px_rgba(0,240,255,0.2)] transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 dark:focus:shadow-[0_0_8px_rgba(0,240,255,0.2)] transition-colors"
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
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (isLogin) {
      const found = MOCK_VOLUNTEERS[email];
      if (!found) { setError("Email not registered"); return; }
      if (found.password !== password) { setError("Incorrect password"); return; }
      success(`Welcome back, ${found.name}!`);
      login({ id: email, name: found.name, role: "volunteer", email });
    } else {
      if (!name.trim()) { setError("Please enter your name"); return; }
      if (MOCK_VOLUNTEERS[email]) { setError("Email already registered, please log in"); return; }
      MOCK_VOLUNTEERS[email] = { password, name: name.trim() };
      success(`Welcome, ${name.trim()}!`);
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
          className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 dark:focus:shadow-[0_0_8px_rgba(0,240,255,0.2)] transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 dark:focus:shadow-[0_0_8px_rgba(0,240,255,0.2)] transition-colors"
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
            className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/30 dark:focus:shadow-[0_0_8px_rgba(0,240,255,0.2)] transition-colors"
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
