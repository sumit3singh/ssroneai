/**
 * The Baithak Design Language (TBDL) v1.0
 * Design tokens — single source of truth for all visual values.
 * Import these instead of hardcoding hex values.
 */

export const colors = {
  primary: {
    DEFAULT: "#1F4E5F",
    50: "#f0f7f5",
    600: "#1F4E5F",
    foreground: "#ffffff",
  },
  accent: {
    DEFAULT: "#C58B3A",
    foreground: "#ffffff",
  },
  ai: {
    DEFAULT: "#7C3AED",
    light: "#8B5CF6",
    dark: "#5b21b6",
  },
  background: {
    DEFAULT: "#F7F8FA",
    dark: "#171A1F",
  },
  surface: "#FFFFFF",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  info: "#3B82F6",
} as const;

export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, sans-serif",
    display: "'Outfit', 'Inter', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
} as const;

export const spacing = {
  grid: 8,       // 8px grid system
  sidebar: 260,
  sidebarCollapsed: 68,
  header: 60,
} as const;

export const zIndex = {
  base: 0,
  raised: 1,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1400px",
} as const;

export const animation = {
  fast: "150ms",
  normal: "250ms",
  slow: "350ms",
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const MODULE_COLORS: Record<string, string> = {
  pos: "#E67E22",
  restaurant: "#E67E22",
  hotel_pms: "#3B82F6",
  reservations: "#3B82F6",
  pg_management: "#8B5CF6",
  inventory: "#10B981",
  billing: "#1A3C34",
  finance: "#1A3C34",
  crm: "#EC4899",
  loyalty: "#EC4899",
  hr: "#F59E0B",
  payroll: "#F59E0B",
  ai_copilot: "#7C3AED",
  reports: "#6366F1",
  dashboard: "#6366F1",
} as const;
