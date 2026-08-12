const CACHE_NAME = "inkverse-studio-v4";

const FILES_TO_CACHE = [
  "./",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});


/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});


/* FETCH */
self.addEventListener("fetch", event => {

  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  /* Don't interfere with external files */
  if (url.origin !== self.location.origin) {
    return;
  }

  /*
   * HTML/navigation:
   * ALWAYS try network first.
   * This prevents old index.html from being served.
   */
  if (
    request.mode === "navigate" ||
    request.destination === "document"
  ) {

    event.respondWith(
      fetch(request)
        .then(response => {

          return response;

        })
        .catch(() => {
          return caches.match("./");
        })
    );

    return;
  }


  /*
   * Other local files:
   * Network first, cache as fallback.
   */
  event.respondWith(

    fetch(request)

      .then(response => {

        if (response.ok) {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, copy);
            });

        }

        return response;

      })

      .catch(() => {

        return caches.match(request);

      })

  );

});
