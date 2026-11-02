import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pos: {
          bg: "#F8FAFC",              // Clean Slate-50 background
          surface: "#FFFFFF",         // Crisp White
          primary: "#059669",         // Vibrant Hospitality Emerald-600
          "primary-hover": "#047857", // Emerald-700
          "primary-light": "#ECFDF5", // Soft Emerald-50
          secondary: "#10B981",       // Emerald-500
          accent: "#F59E0B",          // Warm Kitchen Gold / Amber-500
          "accent-light": "#FFFBEB",  // Soft Amber-50
          text: "#0F172A",            // Slate-900 (High-contrast, razor-sharp)
          muted: "#64748B",           // Slate-500
          border: "#E2E8F0",          // Slate-200 (Crisp 1px border)
          danger: "#EF4444",          // Red-500
          success: "#10B981",         // Emerald-500
        },
        border: "hsl(var(--border, 214.3 31.8% 91.4%))",
        input: "hsl(var(--input, 214.3 31.8% 91.4%))",
        ring: "hsl(var(--ring, 142.1 76.2% 36.3%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 222.2 84% 4.9%))",
        primary: {
          DEFAULT: "#059669", // Vibrant Emerald
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#F59E0B", // Warm Amber
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "pos-card": "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "pos-hover": "0 6px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)",
        "pos-active": "0 2px 4px -1px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
