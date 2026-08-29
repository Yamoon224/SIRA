/* Goriya PWA service worker — hand-rolled, no build step.
 * Strategy:
 *  - navigations: network-first, fall back to cache, then /offline
 *  - static assets (_next/static, icons, images, fonts): stale-while-revalidate
 *  - everything else (API, auth, dynamic): not intercepted (network as usual)
 */

const VERSION = "v1"
const PRECACHE = `goriya-precache-${VERSION}`
const RUNTIME = `goriya-runtime-${VERSION}`

const PRECACHE_URLS = [
    "/",
    "/offline",
    "/manifest.webmanifest",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/goriya-logo.png",
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(PRECACHE)
            .then((cache) =>
                Promise.allSettled(
                    PRECACHE_URLS.map((url) => cache.add(url)),
                ),
            )
            .then(() => self.skipWaiting()),
    )
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== PRECACHE && key !== RUNTIME)
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    )
})

function isStaticAsset(url) {
    return (
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/icons/") ||
        url.pathname.startsWith("/images/") ||
        /\.(?:css|js|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|webp|avif|ico)$/.test(url.pathname)
    )
}

self.addEventListener("fetch", (event) => {
    const { request } = event

    if (request.method !== "GET") return

    const url = new URL(request.url)
    if (url.origin !== self.location.origin) return

    // Never cache API or auth traffic.
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return

    // App navigations: network-first with offline fallback.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone()
                    caches.open(RUNTIME).then((cache) => cache.put(request, copy))
                    return response
                })
                .catch(async () => {
                    const cached = await caches.match(request)
                    return cached || caches.match("/offline")
                }),
        )
        return
    }

    // Static assets: stale-while-revalidate.
    if (isStaticAsset(url)) {
        event.respondWith(
            caches.open(RUNTIME).then(async (cache) => {
                const cached = await cache.match(request)
                const network = fetch(request)
                    .then((response) => {
                        if (response.ok && response.type === "basic") {
                            cache.put(request, response.clone())
                        }
                        return response
                    })
                    .catch(() => cached)
                return cached || network
            }),
        )
    }
})

self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") self.skipWaiting()
})
