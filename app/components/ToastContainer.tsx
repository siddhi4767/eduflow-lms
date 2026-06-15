"use client";

// =============================================================================
// ToastContainer.tsx  — EduFlow LMS  |  Toast Notification Display
//
// Renders toast notifications in the bottom-right corner.
// Each toast slides in, shows for 3 seconds, then fades out.
// Color-coded: green (success), red (error), blue (info).
// =============================================================================

import { useToast, type ToastType } from "../context/ToastContext";

const TYPE_STYLES: Record<ToastType, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-slate-800/90 dark:border-emerald-500/30 dark:text-emerald-400",
  error:   "bg-red-50 border-red-200 text-red-900 dark:bg-slate-800/90 dark:border-red-500/30 dark:text-red-400",
  info:    "bg-blue-50 border-blue-200 text-blue-900 dark:bg-slate-800/90 dark:border-blue-500/30 dark:text-blue-400",
};

const TYPE_ICONS: Record<ToastType, string> = {
  success: "✅",
  error:   "❌",
  info:    "ℹ️",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md text-sm font-medium animate-slide-in-right ${TYPE_STYLES[toast.type]}`}
        >
          <span className="flex-shrink-0 text-lg">
            {TYPE_ICONS[toast.type]}
          </span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
