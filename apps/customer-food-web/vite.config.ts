import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
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
}));
