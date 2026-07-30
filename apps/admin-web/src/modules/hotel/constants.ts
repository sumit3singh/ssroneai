/**
 * Hotel PMS Constants
 */

export const ROOM_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "#10B981", bg: "#10B98112" },
  occupied: { label: "Occupied", color: "#8B5CF6", bg: "#8B5CF612" },
  checked_out: { label: "Checked Out", color: "#6B7280", bg: "#6B728012" },
  maintenance: { label: "Maintenance", color: "#EF4444", bg: "#EF444412" },
  cleaning: { label: "Cleaning", color: "#3B82F6", bg: "#3B82F612" },
  blocked: { label: "Blocked", color: "#F59E0B", bg: "#F59E0B12" },
};
