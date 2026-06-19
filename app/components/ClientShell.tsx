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
import { usePathname } from "next/navigation";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <SettingsProvider>
      <AuthProvider>
        <ToastProvider>
          <AppProvider>
            {isLoginPage ? (
              children
            ) : (
              <div className="h-[100dvh] w-full overflow-hidden flex flex-row bg-background text-foreground">
                <Sidebar
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                />

                <div className="flex-1 flex flex-col h-[100dvh]">
                  <Navbar onToggleSidebar={() => setSidebarOpen((p) => !p)} />

                  <main className="flex-1 overflow-y-auto relative bg-background">
                    {/* Ambient background effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                      <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
                      <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px]" />
                      <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-violet-500/5 blur-[120px]" />
                    </div>
                    
                    <div className="relative z-10">
                      {children}
                    </div>
                  </main>
                </div>
              </div>
            )}

            <ToastContainer />
          </AppProvider>
        </ToastProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
