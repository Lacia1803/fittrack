const STATIC_CACHE = "fittrack-static-v2";
const RUNTIME_CACHE = "fittrack-runtime-v2";

const APP_SHELL = [
  "/",
  "/dashboard",
  "/dashboard/sessions",
  "/dashboard/nutrition",
  "/manifest.json",
  "/icon.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

const cacheFirst = async (request) => {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
};

const networkFirst = async (request) => {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return caches.match("/dashboard");
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/icon")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
