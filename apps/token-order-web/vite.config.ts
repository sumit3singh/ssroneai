import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    port: 3003,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ssrone/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@ssrone/api-client": path.resolve(__dirname, "../../packages/api-client/src"),
      "@ssrone/types": path.resolve(__dirname, "../../packages/types/src"),
      "@ssrone/utils": path.resolve(__dirname, "../../packages/utils/src"),
    },
  },
});
