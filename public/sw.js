// App shell only: the API is never cached here, so nothing personal stays on the device.
const CACHE = "noshy-shell-v1";
const MAX_ASSETS = 120;

self.addEventListener("install", (event) => {
      event.waitUntil(caches.open(CACHE).then((cache) => cache.add("/")).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
      event.waitUntil(
            caches
                  .keys()
                  .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
                  .then(() => self.clients.claim()),
      );
});

async function trim(cache) {
      const keys = (await cache.keys()).filter((r) => new URL(r.url).pathname.startsWith("/assets/"));
      await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_ASSETS)).map((k) => cache.delete(k)));
}

self.addEventListener("fetch", (event) => {
      const { request } = event;
      const url = new URL(request.url);
      if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

      // Pages: the network first, so a deploy shows at once; the last shell when there is none.
      if (request.mode === "navigate") {
            event.respondWith(
                  fetch(request)
                        .then(async (response) => {
                              if (response.ok) await (await caches.open(CACHE)).put("/", response.clone());
                              return response;
                        })
                        .catch(async () => (await caches.match("/")) ?? Response.error()),
            );
            return;
      }

      // Hashed files never change.
      if (url.pathname.startsWith("/assets/")) {
            event.respondWith(
                  caches.match(request).then(
                        (hit) =>
                              hit ??
                              fetch(request).then(async (response) => {
                                    // A missing file answered with the page would break the app until the cache is cleared.
                                    if (response.ok && !(response.headers.get("content-type") ?? "").includes("text/html")) {
                                          const cache = await caches.open(CACHE);
                                          await cache.put(request, response.clone());
                                          await trim(cache);
                                    }
                                    return response;
                              }),
                  ),
            );
      }
});
