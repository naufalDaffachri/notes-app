const CACHE_NAME = "catatan-shell-v1";
const SHELL_FILES = [
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon.svg",
];

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch("/");

  if (!response.ok) {
    throw new Error("Could not cache the app shell");
  }

  await cache.put("/", response.clone());
  const html = await response.text();
  const assetPaths = Array.from(html.matchAll(/(?:src|href)=["']([^"']+)["']/g), ([, path]) => (
    new URL(path, self.location.origin)
  ))
    .filter((url) => url.origin === self.location.origin && url.pathname.startsWith("/assets/"))
    .map((url) => url.href);

  await cache.addAll([...SHELL_FILES, ...assetPaths]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    cacheAppShell().then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((name) => name.startsWith("catatan-shell-") && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request, {
      ignoreSearch: true,
      ignoreVary: true,
    });

    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      if (request.mode === "navigate") {
        return (await cache.match("/")) ?? Response.error();
      }
      return Response.error();
    }
  })());
});
