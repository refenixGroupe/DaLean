/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

// Ensure this script runs only in Service Worker context
if (typeof self !== "undefined" && self instanceof ServiceWorkerGlobalScope) {
  const CACHE_NAME = "dalean-v1.0.0";
  const urlsToCache = [
    "/",
    "/static/js/bundle.js",
    "/static/css/main.css",
    "/manifest.json",
    "/logo192.png",
    "/logo512.png",
    "/upload",
    "/preview",
    "/clean",
    "/data-quality-demo",
  ];

  // Install event - cache resources
  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => {
          console.log("DaLean: Cache opened, caching resources...");
          return cache.addAll(urlsToCache);
        })
        .catch((error) => {
          console.error("DaLean: Cache installation failed:", error);
        })
    );
    self.skipWaiting();
  });

  // Activate event - clean up old caches
  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("DaLean: Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
    );
    self.clients.claim();
  });

  // Fetch event - serve cached content when offline
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }

            // Clone the response because it's a stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.destination === "document") {
              return caches.match("/");
            }
          });
      })
    );
  });

  // Background sync for data uploads when back online
  self.addEventListener("sync", (event) => {
    if (event.tag === "background-sync") {
      console.log("DaLean: Background sync triggered");
      // Handle background sync for data uploads
    }
  });

  // Push notifications (for future use)
  self.addEventListener("push", (event) => {
    const options = {
      body: event.data.text(),
      icon: "/logo192.png",
      badge: "/logo192.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    event.waitUntil(
      self.registration.showNotification("DaLean Notification", options)
    );
  });
}
