/**
 * PG Management Constants
 */

export const AVATAR_COLORS = [
  "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "bg-rose-500/10 text-rose-600 border-rose-500/20",
];

export const STATUS_VARIANT = {
  paid: "success" as const,
  partial: "warning" as const,
  overdue: "danger" as const,
};

export const ROOM_CATEGORIES = [
  "AC Single",
  "AC Double",
  "AC Triple",
  "Non-AC Double",
  "Non-AC Triple",
];

export const FLOORS = [
  "Ground Floor",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
  "4th Floor",
];
