/**
 * SSR One AI – Component-Level Permission Guard
 * Enforces Role-Based Access Control (RBAC) on UI components and actions.
 */
import React, { ReactNode } from "react";
import { useAuthStore } from "./index";

export interface PermissionGuardProps {
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

  if (
    user?.is_superadmin ||
    user?.role === "SUPER_ADMIN" ||
    selected_role?.name === "SUPER_ADMIN" ||
    selected_role?.permissions?.includes("*")
  ) {
    return <>{children}</>;
  }

  const permissions: string[] = selected_role?.permissions || (user as any)?.permissions || [];
  const hasPermission = permissions.includes(permission) || permissions.includes("*");

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
