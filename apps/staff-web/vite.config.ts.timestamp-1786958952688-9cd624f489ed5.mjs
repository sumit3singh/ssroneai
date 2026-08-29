// vite.config.ts
import { defineConfig } from "file:///E:/2026/ssr_one_ai/node_modules/.pnpm/vite@5.4.21_@types+node@22.20.1/node_modules/vite/dist/node/index.js";
import react from "file:///E:/2026/ssr_one_ai/node_modules/.pnpm/@vitejs+plugin-react-swc@3.11.0_vite@5.4.21_@types+node@22.20.1_/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
var __vite_injected_original_dirname = "E:\\2026\\ssr_one_ai\\apps\\staff-web";
var vite_config_default = defineConfig({
  server: {
    port: 3003
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@ssrone/navigation": path.resolve(__vite_injected_original_dirname, "../../packages/navigation/src"),
      "@ssrone/tables": path.resolve(__vite_injected_original_dirname, "../../packages/tables/src"),
      "@ssrone/forms": path.resolve(__vite_injected_original_dirname, "../../packages/forms/src"),
      "@ssrone/ui": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src"),
      "@ssrone/theme": path.resolve(__vite_injected_original_dirname, "../../packages/theme/src"),
      "@ssrone/auth": path.resolve(__vite_injected_original_dirname, "../../packages/auth/src"),
      "@ssrone/hooks": path.resolve(__vite_injected_original_dirname, "../../packages/hooks/src"),
      "@ssrone/utils": path.resolve(__vite_injected_original_dirname, "../../packages/utils/src"),
      "@ssrone/icons": path.resolve(__vite_injected_original_dirname, "../../packages/icons/src"),
      "@ssrone/api-client": path.resolve(__vite_injected_original_dirname, "../../packages/api-client/src"),
      "@ssrone/types": path.resolve(__vite_injected_original_dirname, "../../packages/types/src"),
      "@ssrone/config": path.resolve(__vite_injected_original_dirname, "../../packages/config/src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFwyMDI2XFxcXHNzcl9vbmVfYWlcXFxcYXBwc1xcXFxzdGFmZi13ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXDIwMjZcXFxcc3NyX29uZV9haVxcXFxhcHBzXFxcXHN0YWZmLXdlYlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovMjAyNi9zc3Jfb25lX2FpL2FwcHMvc3RhZmYtd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAzLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgICBcIkBzc3JvbmUvbmF2aWdhdGlvblwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3BhY2thZ2VzL25hdmlnYXRpb24vc3JjXCIpLFxuICAgICAgXCJAc3Nyb25lL3RhYmxlc1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3BhY2thZ2VzL3RhYmxlcy9zcmNcIiksXG4gICAgICBcIkBzc3JvbmUvZm9ybXNcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmNcIiksXG4gICAgICBcIkBzc3JvbmUvdWlcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uLi9wYWNrYWdlcy91aS9zcmNcIiksXG4gICAgICBcIkBzc3JvbmUvdGhlbWVcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uLi9wYWNrYWdlcy90aGVtZS9zcmNcIiksXG4gICAgICBcIkBzc3JvbmUvYXV0aFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3BhY2thZ2VzL2F1dGgvc3JjXCIpLFxuICAgICAgXCJAc3Nyb25lL2hvb2tzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vLi4vcGFja2FnZXMvaG9va3Mvc3JjXCIpLFxuICAgICAgXCJAc3Nyb25lL3V0aWxzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vLi4vcGFja2FnZXMvdXRpbHMvc3JjXCIpLFxuICAgICAgXCJAc3Nyb25lL2ljb25zXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vLi4vcGFja2FnZXMvaWNvbnMvc3JjXCIpLFxuICAgICAgXCJAc3Nyb25lL2FwaS1jbGllbnRcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uLi9wYWNrYWdlcy9hcGktY2xpZW50L3NyY1wiKSxcbiAgICAgIFwiQHNzcm9uZS90eXBlc1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3BhY2thZ2VzL3R5cGVzL3NyY1wiKSxcbiAgICAgIFwiQHNzcm9uZS9jb25maWdcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uLi9wYWNrYWdlcy9jb25maWcvc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1IsU0FBUyxvQkFBb0I7QUFDNVQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUNwQyxzQkFBc0IsS0FBSyxRQUFRLGtDQUFXLCtCQUErQjtBQUFBLE1BQzdFLGtCQUFrQixLQUFLLFFBQVEsa0NBQVcsMkJBQTJCO0FBQUEsTUFDckUsaUJBQWlCLEtBQUssUUFBUSxrQ0FBVywwQkFBMEI7QUFBQSxNQUNuRSxjQUFjLEtBQUssUUFBUSxrQ0FBVyx1QkFBdUI7QUFBQSxNQUM3RCxpQkFBaUIsS0FBSyxRQUFRLGtDQUFXLDBCQUEwQjtBQUFBLE1BQ25FLGdCQUFnQixLQUFLLFFBQVEsa0NBQVcseUJBQXlCO0FBQUEsTUFDakUsaUJBQWlCLEtBQUssUUFBUSxrQ0FBVywwQkFBMEI7QUFBQSxNQUNuRSxpQkFBaUIsS0FBSyxRQUFRLGtDQUFXLDBCQUEwQjtBQUFBLE1BQ25FLGlCQUFpQixLQUFLLFFBQVEsa0NBQVcsMEJBQTBCO0FBQUEsTUFDbkUsc0JBQXNCLEtBQUssUUFBUSxrQ0FBVywrQkFBK0I7QUFBQSxNQUM3RSxpQkFBaUIsS0FBSyxRQUFRLGtDQUFXLDBCQUEwQjtBQUFBLE1BQ25FLGtCQUFrQixLQUFLLFFBQVEsa0NBQVcsMkJBQTJCO0FBQUEsSUFDdkU7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
