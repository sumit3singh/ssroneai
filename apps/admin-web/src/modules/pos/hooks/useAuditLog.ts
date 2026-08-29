/**
 * ssrone ERP - POS Audit Logging Hook
 * Captures user actions (create, update, delete, void, print) for enterprise audit compliance.
 */

import { useCallback } from "react";
import { api } from "@ssrone/api-client";
import { useAuthStore } from "@/modules/auth";

export interface AuditLogPayload {
  action: "CREATE" | "UPDATE" | "DELETE" | "VOID" | "REFUND" | "PRINT" | "OVERRIDE";
  entity: string;
  entityId: string | number;
  details?: Record<string, any>;
}

export function useAuditLog() {
  const { user, selected_role } = useAuthStore();

  const logAction = useCallback(
    async (payload: AuditLogPayload) => {
      const userName = user
        ? user.display_name || `${user.first_name} ${user.last_name}`.trim() || user.email
        : "Unknown";

      const logEntry = {
        timestamp: new Date().toISOString(),
        user_id: user?.id ?? "ANONYMOUS",
        user_name: userName,
        user_role: selected_role?.name ?? "GUEST",
        module: "POS",
        action: payload.action,
        entity: payload.entity,
        entity_id: String(payload.entityId),
        details: payload.details ?? {},
      };

      console.info("[AUDIT LOG]", logEntry);

      try {
        await api.post("/audit-logs", logEntry);
      } catch (err) {
        // Silent capture error to keep UI responsive
        console.warn("[AUDIT LOG ERROR] Failed to send audit payload to server", err);
      }
    },
    [user]
  );

  return { logAction };
}
