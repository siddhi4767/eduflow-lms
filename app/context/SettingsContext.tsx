"use client";

// =============================================================================
// context/SettingsContext.tsx  — EduFlow LMS  |  Settings Provider
//
// Manages user-configurable preferences: LMS name and theme (dark/light).
// Persists to localStorage. The sidebar reads lmsName, the layout reads theme.
//
// REACT CONCEPTS:
//   • Multiple contexts composed together (App, Toast, Settings)
//   • Lazy useState initializer for localStorage hydration
//   • useEffect for persistence + DOM side-effects (theme class on <html>)
// =============================================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import type { Settings } from "../data/types";

// ── Context shape ────────────────────────────────────────────────────────────

interface SettingsContextType {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = {
  lmsName: "EduFlow LMS",
  theme: "dark",
  profileName: "Admin User",
  profileEmail: "admin@eduflow.com",
  profileRole: "Administrator",
};

const STORAGE_KEY = "eduflow-settings";

// ── Provider ─────────────────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    Promise.resolve().then(() => {
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) });
          }
        } catch { /* ignore */ }
      }
      setHydrated(true);
    });
  }, []);

  // Persist on change
  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch { /* ignore */ }
    }
  }, [settings, hydrated]);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.theme]);

  function updateSettings(partial: Partial<Settings>): void {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  function resetSettings(): void {
    setSettings(DEFAULT_SETTINGS);
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

// ── Custom hook ──────────────────────────────────────────────────────────────

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings() must be used inside <SettingsProvider>");
  }
  return ctx;
}
