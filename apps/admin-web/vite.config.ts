import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-query", "@tanstack/react-router", "zustand"],
    alias: [
      { find: /^react$/, replacement: path.resolve(__dirname, "./node_modules/react") },
      { find: /^react-dom$/, replacement: path.resolve(__dirname, "./node_modules/react-dom") },
      { find: /^react\/jsx-runtime$/, replacement: path.resolve(__dirname, "./node_modules/react/jsx-runtime") },
      { find: /^@tanstack\/react-query$/, replacement: path.resolve(__dirname, "./node_modules/@tanstack/react-query") },
      { find: /^@tanstack\/react-router$/, replacement: path.resolve(__dirname, "./node_modules/@tanstack/react-router") },
      { find: /^zustand$/, replacement: path.resolve(__dirname, "./node_modules/zustand") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "@ssrone/navigation", replacement: path.resolve(__dirname, "../../packages/navigation/src") },
      { find: "@ssrone/tables", replacement: path.resolve(__dirname, "../../packages/tables/src") },
      { find: "@ssrone/forms", replacement: path.resolve(__dirname, "../../packages/forms/src") },
      { find: "@ssrone/ui", replacement: path.resolve(__dirname, "../../packages/ui/src") },
      { find: "@ssrone/theme", replacement: path.resolve(__dirname, "../../packages/theme/src") },
      { find: "@ssrone/auth", replacement: path.resolve(__dirname, "../../packages/auth/src") },
      { find: "@ssrone/hooks", replacement: path.resolve(__dirname, "../../packages/hooks/src") },
      { find: "@ssrone/utils", replacement: path.resolve(__dirname, "../../packages/utils/src") },
      { find: "@ssrone/icons", replacement: path.resolve(__dirname, "../../packages/icons/src") },
      { find: "@ssrone/api-client", replacement: path.resolve(__dirname, "../../packages/api-client/src") },
      { find: "@ssrone/types", replacement: path.resolve(__dirname, "../../packages/types/src") },
      { find: "@ssrone/config", replacement: path.resolve(__dirname, "../../packages/config/src") },
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@tanstack/react-query",
      "@tanstack/react-router",
    ],
    exclude: [
      "@ssrone/ui",
      "@ssrone/auth",
      "@ssrone/api-client",
      "@ssrone/navigation",
      "@ssrone/theme",
      "@ssrone/hooks",
      "@ssrone/utils",
      "@ssrone/icons",
      "@ssrone/types",
      "@ssrone/config",
    ],
  },
  server: {
    port: 5173,
    fs: {
      allow: [".."],
    },
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || process.env.BACKEND_URL || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "es2022",
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          query: ["@tanstack/react-query"],
          charts: ["recharts"],
          dexie: ["dexie", "dexie-react-hooks"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
});
