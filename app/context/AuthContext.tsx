"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

interface User {
  name: string;
  email: string;
  role: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: { name?: string; image?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const loading = status === "loading";
  const router = useRouter();

  const rawRole = session?.user ? (session.user as any).role || "student" : "student";
  const userRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

  const user = session?.user ? {
    name: session.user.name || "",
    email: session.user.email || "",
    role: userRole,
    image: session.user.image || undefined,
  } : null;

  async function login(data: Record<string, unknown>) {
    // Left for compatibility, but the actual login page uses signIn directly.
    await signIn("credentials", { ...data, redirect: false });
    router.push("/dashboard");
  }

  async function logout() {
    await signOut({ callbackUrl: "/login" });
  }

  async function updateUser(data: { name?: string; image?: string }) {
    await update(data);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
