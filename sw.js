const CACHE_NAME = "inkverse-studio-v3";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];


/* =========================
   INSTALL
========================= */

self.addEventListener(
    "install",
    function(event){

        event.waitUntil(

            caches.open(
                CACHE_NAME
            ).then(
                function(cache){

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                }
            )

        );

        /*
         * Activate the new Service Worker
         * immediately.
         */

        self.skipWaiting();

    }
);


/* =========================
   ACTIVATE
========================= */

self.addEventListener(
    "activate",
    function(event){

        event.waitUntil(

            caches.keys().then(
                function(cacheNames){

                    return Promise.all(

                        cacheNames
                        .filter(
                            function(name){

                                return name !==
                                    CACHE_NAME;

                            }
                        )
                        .map(
                            function(name){

                                return caches.delete(
                                    name
                                );

                            }
                        )

                    );

                }
            )

        );

        /*
         * Take control of the app immediately.
         */

        self.clients.claim();

    }
);


/* =========================
   FETCH
========================= */

self.addEventListener(
    "fetch",
    function(event){

        /*
         * Only handle GET requests.
         */

        if(
            event.request.method !== "GET"
        ){

            return;

        }


        event.respondWith(

            fetch(
                event.request
            )
            .then(
                function(networkResponse){

                    /*
                     * Save a fresh copy of
                     * successful responses.
                     */

                    if(
                        networkResponse &&
                        networkResponse.status === 200 &&
                        networkResponse.type === "basic"
                    ){

                        const responseClone =
                            networkResponse.clone();


                        caches.open(
                            CACHE_NAME
                        ).then(
                            function(cache){

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            }
                        );

                    }


                    return networkResponse;

                }
            )
            .catch(
                function(){

                    /*
                     * If there is no internet,
                     * use the cached version.
                     */

                    return caches.match(
                        event.request
                    );

                }
            )

        );

    }
);
