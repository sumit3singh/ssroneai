// SSR One AI - Token Order Service Worker
const CACHE_NAME = "ssrone-token-v1";
const STATIC_ASSETS = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.url.includes("/api/") || e.request.url.includes("/ws")) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then((res) => res || caches.match("/")))
  );
});
