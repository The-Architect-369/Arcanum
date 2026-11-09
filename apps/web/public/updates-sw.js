// Updates-only worker. Private pages, APIs and APK/release files are never cached.
const CACHE = "arcanum-updates-v3";
const START = "/updates?source=pwa";
const SHELL = [
  START,
  "/updates",
  "/updates?view=app",
  "/updates?view=ahead",
  "/updates/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];
const isAsset = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith("/_next/static/") ||
    /^\/icons\/(?:icon|maskable)-(?:192|512)\.png$/.test(url.pathname));
async function saveAsset(cache, url) {
  if (await cache.match(url)) return;
  const response = await fetch(url);
  if (
    response.ok &&
    !response.headers.get("content-type")?.includes("text/html")
  )
    await cache.put(url, response);
}
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(
        SHELL.map(async (path) => {
          const response = await fetch(path, {
            cache: "no-store",
            headers: { Accept: "text/html" },
          });
          if (!response.ok) return;
          if (path.endsWith(".png") || path.endsWith("offline.html")) {
            await cache.put(path, response);
            return;
          }
          const html = await response.clone().text();
          // Do not cache a provider login/protection wrapper in place of the app.
          if (!html.includes('data-updates-shell="true"')) return;
          await cache.put(path, response);
          const assets = Array.from(
            html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g),
          )
            .map((match) => new URL(match[1], self.location.origin))
            .filter(isAsset);
          await Promise.allSettled(assets.map((url) => saveAsset(cache, url)));
        }),
      ),
    ),
  );
});
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("arcanum-updates-") && key !== CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (isAsset(url)) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const saved = await cache.match(request);
        if (saved) return saved;
        const response = await fetch(request);
        if (
          response.ok &&
          !response.headers.get("content-type")?.includes("text/html")
        ) {
          await cache.put(request, response.clone());
          const assets = (await cache.keys()).filter((key) =>
            isAsset(new URL(key.url)),
          );
          for (const key of assets.slice(0, Math.max(0, assets.length - 100)))
            await cache.delete(key);
        }
        return response;
      }),
    );
    return;
  }
  const editorial =
    url.pathname === "/updates" || /^\/updates\/[a-z0-9-]+$/.test(url.pathname);
  if (request.mode !== "navigate" || !editorial) return;
  event.respondWith(
    fetch(request, { cache: "no-store" })
      .then(async (response) => {
        if (
          response.ok &&
          (await response.clone().text()).includes('data-updates-shell="true"')
        ) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
          const pages = (await cache.keys()).filter(
            (key) =>
              !isAsset(new URL(key.url)) &&
              !SHELL.includes(
                new URL(key.url).pathname + new URL(key.url).search,
              ),
          );
          for (const key of pages.slice(0, Math.max(0, pages.length - 20)))
            await cache.delete(key);
        }
        return response;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE);
        return (
          (await cache.match(request)) ||
          (await cache.match("/updates/offline.html")) ||
          new Response("Updates is offline. Reconnect to load the page.", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          })
        );
      }),
  );
});
