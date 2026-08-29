/**
 * The ssrone – Service Worker (sw.js)
 * Caches static assets for offline POS operation.
 * Blueprint §7.1: Service Workers cache HTML/CSS/JS/icons.
 */
const CACHE_NAME = "ssrone-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.svg",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always go to network for API calls
  if (url.pathname.startsWith("/api/")) return;

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.method === "GET") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match("/index.html"));
    })
  );
});

// Background Sync: process queued offline orders when online
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-orders") {
    console.log("[SW] Background sync triggered — processing offline queue");
    // The main app handles actual sync via processSyncQueue()
  }
});
