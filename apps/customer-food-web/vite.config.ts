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
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ssr-one-ai/navigation": path.resolve(__dirname, "../../packages/navigation/src"),
      "@ssr-one-ai/tables": path.resolve(__dirname, "../../packages/tables/src"),
      "@ssr-one-ai/forms": path.resolve(__dirname, "../../packages/forms/src"),
      "@ssr-one-ai/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@ssr-one-ai/theme": path.resolve(__dirname, "../../packages/theme/src"),
      "@ssr-one-ai/auth": path.resolve(__dirname, "../../packages/auth/src"),
      "@ssr-one-ai/hooks": path.resolve(__dirname, "../../packages/hooks/src"),
      "@ssr-one-ai/utils": path.resolve(__dirname, "../../packages/utils/src"),
      "@ssr-one-ai/icons": path.resolve(__dirname, "../../packages/icons/src"),
      "@ssr-one-ai/api-client": path.resolve(__dirname, "../../packages/api-client/src"),
      "@ssr-one-ai/types": path.resolve(__dirname, "../../packages/types/src"),
      "@ssr-one-ai/config": path.resolve(__dirname, "../../packages/config/src"),
    },
  },
}));
