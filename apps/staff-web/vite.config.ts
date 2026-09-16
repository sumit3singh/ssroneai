import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    port: 3003,
  },
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react/jsx-runtime", "zustand"],
    alias: [
      { find: /^react$/, replacement: path.resolve(__dirname, "./node_modules/react") },
      { find: /^react-dom$/, replacement: path.resolve(__dirname, "./node_modules/react-dom") },
      { find: /^react\/jsx-runtime$/, replacement: path.resolve(__dirname, "./node_modules/react/jsx-runtime") },
      { find: /^zustand\/middleware$/, replacement: path.resolve(__dirname, "../admin-web/node_modules/zustand/esm/middleware.mjs") },
      { find: /^zustand\/vanilla$/, replacement: path.resolve(__dirname, "../admin-web/node_modules/zustand/esm/vanilla.mjs") },
      { find: /^zustand\/react$/, replacement: path.resolve(__dirname, "../admin-web/node_modules/zustand/esm/react.mjs") },
      { find: /^zustand\/shallow$/, replacement: path.resolve(__dirname, "../admin-web/node_modules/zustand/esm/shallow.mjs") },
      { find: /^zustand$/, replacement: path.resolve(__dirname, "../admin-web/node_modules/zustand/esm/index.mjs") },
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
});
