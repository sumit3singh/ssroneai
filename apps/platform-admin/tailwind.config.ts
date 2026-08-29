import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border, 240 5.9% 90%))",
        input: "hsl(var(--input, 240 5.9% 90%))",
        ring: "hsl(var(--ring, 262.1 83.3% 57.8%))",
        background: "hsl(var(--background, 224 71.4% 4.1%))",
        foreground: "hsl(var(--foreground, 210 20% 98%))",
        primary: {
          DEFAULT: "hsl(263.4 70% 50.4%)", // Enterprise Violet
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "hsl(215 27.9% 16.9%)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "hsl(215 27.9% 16.9%)",
          foreground: "hsl(215.4 16.3% 56.9%)",
        },
        card: {
          DEFAULT: "hsl(224 71.4% 4.1%)",
          foreground: "hsl(210 20% 98%)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
