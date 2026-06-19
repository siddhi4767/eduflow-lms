"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import { AppRole, hasRole } from "../../lib/rbac";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  fallback?: React.ReactNode;
}

/**
 * A wrapper component that conditionally renders its children based on the current user's role.
 * Useful for hiding buttons or sections of a page from unauthorized users.
 * 
 * @example
 * <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.INSTRUCTOR]}>
 *   <button>Delete Course</button>
 * </RoleGuard>
 */
export default function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user, loading } = useAuth();

  // If auth is still loading, we can optionally return null to prevent flickering, 
  // or return the fallback. For safety, we return null while loading.
  if (loading) {
    return null;
  }

  // user object from AuthContext should have the standardized role string.
  const userRole = user?.role as AppRole | undefined;

  if (hasRole(userRole, allowedRoles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
