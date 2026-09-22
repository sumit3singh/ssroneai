/**
 * ssrone ERP - Component-Level Permission Guard
 * Wraps sensitive buttons and UI sections to enforce RBAC permissions.
 */

import React, { ReactNode } from "react";
import { useAuthStore } from "@/modules/auth";

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { user, selected_role } = useAuthStore();

  // Super Admin bypasses permission checks
  if (user?.is_superadmin || (selected_role as any)?.code === "SUPER_ADMIN" || (selected_role as any)?.code === "PLATFORM_ADMIN" || selected_role?.name === "Super Admin") {
    return <>{children}</>;
  }

  const userPermissions: string[] = (user as any)?.permissions ?? [];
  const hasPermission = userPermissions.includes(permission) || userPermissions.includes("*");

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
