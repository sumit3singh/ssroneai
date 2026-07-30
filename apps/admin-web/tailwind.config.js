/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      // ── TBDL Design Tokens ─────────────────────────────────
      colors: {
        // Brand
        primary: {
          DEFAULT: "#1A3C34",
          50: "#f0f7f5",
          100: "#d6ece6",
          200: "#aed9cf",
          300: "#7ebfb1",
          400: "#4fa08f",
          500: "#2d7d6c",
          600: "#1A3C34",
          700: "#163229",
          800: "#11271f",
          900: "#0c1c15",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#E67E22",
          50: "#fef9f0",
          100: "#fef0d6",
          200: "#fddda8",
          300: "#fbc36a",
          400: "#f9a02e",
          500: "#E67E22",
          600: "#c9621a",
          700: "#a64a14",
          800: "#823712",
          900: "#5e2610",
          foreground: "#ffffff",
        },
        // AI Brand Color
        ai: {
          DEFAULT: "#7C3AED",
          light: "#a855f7",
          dark: "#5b21b6",
          foreground: "#ffffff",
        },
        // Backgrounds
        background: "hsl(var(--background))",
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#1C1E24",
          subtle: "#F2EFE9",
        },
        // Semantic
        success: { DEFAULT: "#10B981", light: "#D1FAE5", dark: "#065F46" },
        warning: { DEFAULT: "#F59E0B", light: "#FEF3C7", dark: "#92400E" },
        danger:  { DEFAULT: "#EF4444", light: "#FEE2E2", dark: "#991B1B" },
        info:    { DEFAULT: "#3B82F6", light: "#DBEAFE", dark: "#1E3A8A" },
        // Neutral
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      // ── Typography ─────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      // ── Spacing (8px grid) ─────────────────────────────────
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      // ── Border Radius ──────────────────────────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // ── Shadows ────────────────────────────────────────────
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)",
        "card-hover": "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)",
        modal: "0 20px 60px rgba(0,0,0,0.15)",
        "inner-sm": "inset 0 1px 2px rgba(0,0,0,0.06)",
      },
      // ── Animations ─────────────────────────────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "shimmer": {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "shimmer": "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
