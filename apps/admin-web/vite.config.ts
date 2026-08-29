import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-query", "@tanstack/react-router"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ssrone/navigation": path.resolve(__dirname, "../../packages/navigation/src"),
      "@ssrone/tables": path.resolve(__dirname, "../../packages/tables/src"),
      "@ssrone/forms": path.resolve(__dirname, "../../packages/forms/src"),
      "@ssrone/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@ssrone/theme": path.resolve(__dirname, "../../packages/theme/src"),
      "@ssrone/auth": path.resolve(__dirname, "../../packages/auth/src"),
      "@ssrone/hooks": path.resolve(__dirname, "../../packages/hooks/src"),
      "@ssrone/utils": path.resolve(__dirname, "../../packages/utils/src"),
      "@ssrone/icons": path.resolve(__dirname, "../../packages/icons/src"),
      "@ssrone/api-client": path.resolve(__dirname, "../../packages/api-client/src"),
      "@ssrone/types": path.resolve(__dirname, "../../packages/types/src"),
      "@ssrone/config": path.resolve(__dirname, "../../packages/config/src"),
    },
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
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || process.env.BACKEND_URL || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          query: ["@tanstack/react-query"],
          charts: ["recharts"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
        },
      },
    },
  },
});
