const CACHE_NAME = "ultittt-cache-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/images/logo192.png",
  "/images/logo512.png",
  "/images/cross.svg",
  "/images/learn/learn_1.png",
  "/images/learn/learn_2.png",
  "/images/learn/learn_3.png",
  "/images/learn/learn_any.png",
  "/images/learn/learn_tie.png",
  "/images/learn/learn_win.png",
  "/images/unavailable-image.jpg",
  "/sounds/GameFinished.mp3",
  "/sounds/GameFound.mp3",
  "/sounds/Move.mp3",
];

const OFFLINE_PAGE = "/maintenance.html";
const OFFLINE_IMAGE = "/images/unavailable-image.jpg";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of [...urlsToCache, OFFLINE_PAGE, OFFLINE_IMAGE]) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn(`Failed to cache ${url}:`, err);
        }
      }
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await clients.claim();

      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Skip non-GET or unsupported requests
  if (
    request.method !== "GET" ||
    !request.url.startsWith("http") ||
    request.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  // Google Fonts with cache-then-network strategy
  if (
    request.url.startsWith("https://fonts.googleapis.com") ||
    request.url.startsWith("https://fonts.gstatic.com")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch {
          return cache.match(request);
        }
      }),
    );
    return;
  }

  // // For navigation requests (HTML pages), do network first, fallback to cache, then offline page
  // if (request.mode === "navigate") {
  //   event.respondWith(
  //     (async () => {
  //       try {
  //         const networkResponse = await fetch(request);
  //         const cache = await caches.open(CACHE_NAME);
  //         cache.put(request, networkResponse.clone());
  //         return networkResponse;
  //       } catch {
  //         const cachedResponse = await caches.match(request);
  //         return cachedResponse || caches.match(OFFLINE_PAGE);
  //       }
  //     })(),
  //   );
  //   return;
  // }

  // For images, try cache first, fallback to network, fallback to offline image
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(request)
            .then((networkResponse) =>
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
              }),
            )
            .catch(() => caches.match(OFFLINE_IMAGE))
        );
      }),
    );
    return;
  }

  // // For other requests (JS, CSS, sounds, etc.), stale-while-revalidate
  //   const shouldCache = (request) => {
  //       return request.method === "GET" && /\.(css|png|jpg|svg|woff2)$/.test(request.url);
  //   };
  //
  //   event.respondWith(
  //       caches.open(CACHE_NAME).then(async (cache) => {
  //           const cachedResponse = await cache.match(request);
  //
  //           const fetchPromise = fetch(request)
  //               .then((networkResponse) => {
  //                   if (shouldCache(request)) {
  //                       cache.put(request, networkResponse.clone()).catch(console.warn);
  //                   }
  //                   return networkResponse;
  //               })
  //               .catch(() => cachedResponse);
  //
  //           return cachedResponse || fetchPromise;
  //       }),
  //   );

});
