/* mdesume service worker
 * Runtime caching for offline use and resilient static hosting.
 * Plain JS — copied verbatim into /out by `next build` (output: "export").
 * No build step, no server runtime required.
 */
const CACHE = "mdesume-v1";
const FALLBACK = "mdesume-offline-fallback";

self.addEventListener("install", () => {
    // Activate the new SW immediately instead of waiting for old clients to close.
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
            await self.clients.claim();
        })()
    );
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;

    const url = new URL(req.url);
    // Only handle same-origin requests; let cross-origin (fonts/CDNs) pass through.
    if (url.origin !== self.location.origin) return;

    // Page navigations: network-first, fall back to cache, then offline page.
    if (req.mode === "navigate") {
        event.respondWith(
            (async () => {
                try {
                    const res = await fetch(req);
                    const cache = await caches.open(CACHE);
                    cache.put(req, res.clone());
                    cache.put(FALLBACK, res.clone());
                    return res;
                } catch (e) {
                    const cached = (await caches.match(req)) || (await caches.match(FALLBACK));
                    if (cached) return cached;
                    return (await caches.match("/")) || Response.error();
                }
            })()
        );
        return;
    }

    // Static assets (JS/CSS/fonts/images): stale-while-revalidate.
    event.respondWith(
        (async () => {
            const cached = await caches.match(req);
            const network = fetch(req)
                .then((res) => {
                    if (res && res.status === 200 && res.type === "basic") {
                        const copy = res.clone();
                        caches.open(CACHE).then((c) => c.put(req, copy));
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || network;
        })()
    );
});
