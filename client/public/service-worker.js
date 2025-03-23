const CACHE_NAME = "ultittt-cache-v1";

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
  "/sounds/GameFinished.mp3",
  "/sounds/GameFound.mp3",
  "/sounds/Move.mp3",
  "https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
});
