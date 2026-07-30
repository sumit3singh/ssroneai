import type { Role } from "@ssr-one-ai/types";

export const permissionEngine = {
  hasPermission: (roles: Role[], permission: string): boolean => {
    if (!permission) return true;
    return roles.some((role) => role.permissions?.includes(permission));
  },

  hasAnyPermission: (roles: Role[], permissions: string[]): boolean => {
    if (!permissions?.length) return true;
    return roles.some((role) =>
      role.permissions?.some((permission) => permissions.includes(permission)),
    );
  },

  hasAllPermissions: (roles: Role[], permissions: string[]): boolean => {
    if (!permissions?.length) return true;
    const userPermissions = new Set(roles.flatMap((r) => r.permissions || []));
    return permissions.every((p) => userPermissions.has(p));
  },

  canAccessItem: (roles: Role[], itemPermissions?: string[]): boolean => {
    if (!itemPermissions || itemPermissions.length === 0) return true;
    return permissionEngine.hasAnyPermission(roles, itemPermissions);
  },
};
