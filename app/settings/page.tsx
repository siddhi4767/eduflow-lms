"use client";

// =============================================================================
// settings/page.tsx  — EduFlow LMS  |  Settings Page
//
// Full settings page with:
//   • LMS Name customisation (updates sidebar)
//   • Theme toggle (dark/light)
//   • Data management — reset to defaults
//   • All changes auto-saved to localStorage
// =============================================================================

import { useSettings } from "../context/SettingsContext";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { resetAll } = useApp();
  const { addToast } = useToast();

  function handleResetData() {
    resetAll();
    addToast("All data reset to defaults", "info");
  }

  function handleResetSettings() {
    resetSettings();
    addToast("Settings reset to defaults", "info");
  }

  return (
    <div className="p-4 sm:p-8 flex-1 max-w-3xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">Settings</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Manage your LMS preferences — changes save automatically
        </p>
      </div>

      {/* ── Profile Settings ── */}
      <div className="bg-slate-800/50 border border-white/[0.06] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center text-sm">
            👤
          </span>
          Profile Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={settings.profileName}
              onChange={(e) => updateSettings({ profileName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-400
                         rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500
                         focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={settings.profileEmail}
              onChange={(e) => updateSettings({ profileEmail: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-400
                         rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500
                         focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <select
              value={settings.profileRole}
              onChange={(e) => updateSettings({ profileRole: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 text-white
                         rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500
                         focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="Administrator">Administrator</option>
              <option value="Instructor">Instructor</option>
              <option value="Student">Student</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── General Settings ── */}
      <div className="bg-slate-800/50 border border-white/[0.06] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-sm">
            🏷️
          </span>
          General
        </h2>

        {/* LMS Name */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            LMS Name
          </label>
          <input
            type="text"
            value={settings.lmsName}
            onChange={(e) => updateSettings({ lmsName: e.target.value })}
            placeholder="Enter LMS name"
            className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-400
                       rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500
                       focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            This name appears in the sidebar and footer
          </p>
        </div>
      </div>

      {/* ── Appearance ── */}
      <div className="bg-slate-800/50 border border-white/[0.06] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm">
            🎨
          </span>
          Appearance
        </h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">Theme</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch between dark and light mode
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {settings.theme === "dark" ? "🌙 Dark" : "☀️ Light"}
            </span>
            <button
              onClick={() =>
                updateSettings({
                  theme: settings.theme === "dark" ? "light" : "dark",
                })
              }
              className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
                settings.theme === "dark"
                  ? "bg-indigo-600"
                  : "bg-slate-500"
              }`}
              aria-label="Toggle theme"
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  settings.theme === "dark"
                    ? "translate-x-0.5"
                    : "translate-x-[1.375rem]"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Data Management ── */}
      <div className="bg-slate-800/50 border border-white/[0.06] rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm">
            🗄️
          </span>
          Data Management
        </h2>

        <div className="space-y-4">
          {/* Reset Data */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-300">Reset All Data</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Restore students, courses, and enrollments to defaults
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30
                         px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Reset Data
            </button>
          </div>

          {/* Reset Settings */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-300">Reset Settings</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Restore LMS name and theme to defaults
              </p>
            </div>
            <button
              onClick={handleResetSettings}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600
                         px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Reset Settings
            </button>
          </div>
        </div>
      </div>

      {/* ── Storage Info ── */}
      <div className="bg-slate-800/50 border border-white/[0.06] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm">
            💾
          </span>
          Storage
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          All data is stored in your browser&apos;s{" "}
          <code className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">localStorage</code>.
          Refreshing the page will not lose your changes. Clearing browser data will reset everything.
        </p>
      </div>
    </div>
  );
}
