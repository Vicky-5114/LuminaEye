"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext";

const typeStyles: Record<import("../context/ToastContext").ToastType, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  error: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export default function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2" role="region" aria-label="Notifications" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center justify-between gap-4 px-4 py-3 min-w-[280px] max-w-[400px] rounded-lg border shadow-lg bg-[var(--color-card)] ${typeStyles[toast.type]}`}
            role={toast.type === "error" ? "alert" : "status"}
          >
            <span className="text-sm font-medium text-[var(--color-text)]">{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              aria-label="Dismiss notification"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
