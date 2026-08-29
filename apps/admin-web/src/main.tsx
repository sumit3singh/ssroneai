/**
 * The ssrone – Application Entry Point
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { registerServiceWorker } from "@/shared/utils/pwa";
import "@/theme/globals.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found.");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register PWA service worker for offline POS capability
registerServiceWorker();
