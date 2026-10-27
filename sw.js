/* =====================================================================
   sw.js — the "service worker": lets the game work OFFLINE once installed

   It only runs when the game is on a website (https://...). When you
   double-click index.html it is simply ignored, so that still works.

   How it works ("network first"):
     - Online:  always get the newest files from the website, and keep a copy.
     - Offline: use the saved copy instead.
   So when you upload a new version, players get it automatically.

   If you ADD a new file to the game (e.g. a picture), add its name to FILES.

   License: MIT (see the LICENSE file)
   ===================================================================== */

const CACHE_NAME = "toilet-trouble-v2";

// The files saved for offline play
const FILES = [
  "./",
  "index.html",
  "style.css",
  "config.js",
  "sounds.js",
  "game.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

// When first installed: save all the files
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

// When a new version takes over: delete old saved copies
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Every time the game asks for a file: try the internet first, then the saved copy
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Keep a copy for next time we're offline (this also saves the font)
        if (response.ok || response.type === "opaque") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((saved) => saved || caches.match("index.html"))
      )
  );
});
