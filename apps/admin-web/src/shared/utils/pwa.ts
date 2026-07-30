/**
 * The Baithak – Service Worker Registration
 * Blueprint §7.1: PWA offline-first capability.
 * Caches assets for completely offline page initialization.
 */
export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[Baithak PWA] Service Worker registered:", reg.scope);
          // Check for updates
          reg.addEventListener("updatefound", () => {
            const worker = reg.installing;
            if (worker) {
              worker.addEventListener("statechange", () => {
                if (worker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[Baithak PWA] New update available — refresh to apply");
                }
              });
            }
          });
        })
        .catch((err) => console.warn("[Baithak PWA] SW registration failed:", err));
    });
  }
}

/** Check if running in offline mode */
export function isOffline(): boolean {
  return !navigator.onLine;
}
