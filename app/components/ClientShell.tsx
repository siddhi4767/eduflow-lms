"use client";

// =============================================================================
// ClientShell.tsx  — EduFlow LMS  |  Client-Side Layout Shell
//
// The root layout.tsx is a Server Component (needed for <Metadata>).
// This client component wraps all providers + manages sidebar toggle state.
// =============================================================================

import { useState } from "react";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import { ToastProvider } from "../context/ToastContext";
import { SettingsProvider } from "../context/SettingsContext";
import Sidebar from "./sidebar";
import Navbar from "./Navbar";
import ToastContainer from "./ToastContainer";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SettingsProvider>
      <AuthProvider>
        <ToastProvider>
          <AppProvider>
            <div className="min-h-screen flex flex-row bg-slate-950 text-white">
              <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />

              <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <Navbar onToggleSidebar={() => setSidebarOpen((p) => !p)} />

                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>

            <ToastContainer />
          </AppProvider>
        </ToastProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
