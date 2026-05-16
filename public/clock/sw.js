/* Word Clock service worker — hand-rolled, no Workbox.
 *
 * Strategy:
 *   - HTML (`<BASE>`, `<BASE>index.html`) → network-first, cache fallback.
 *     Lets users get new builds without a hard reload.
 *   - Hashed assets under `<BASE>assets/*` → cache-first, immutable. Vite
 *     content-hashes them so the filename is the cache key.
 *
 * BASE is derived from the SW's own scope so the same code works whether the
 * app is mounted at /clock/, /, /preview/clock/, etc. (M3).
 *
 * Hashed assets are precached opportunistically when the page posts a
 * 'precache' message with the resource URLs it actually loaded (M4) — that
 * way the first offline open after install succeeds even if the user lost
 * the network before the SW could lazy-cache them via runtime fetch.
 *
 * CACHE_VERSION is stamped at build time by swVersionPlugin in vite.config.ts
 * — every build produces a unique sw.js byte stream, forcing the browser to
 * re-register the SW and trigger skipWaiting/clients.claim. In dev the literal
 * 'mp8mac8l' is fine (dev SW is rarely registered). Old caches are deleted
 * on activate regardless.
 */
const CACHE_VERSION = 'wc-mp8mac8l';
const BASE = new URL('./', self.location).pathname;
// apple-touch-icon.png is referenced by index.html but isn't shipped yet
// (CODING_NOTES §2). Listed here so the day someone drops it into public/, the
// Add-to-Home-Screen first-offline-open hits the cache. The per-URL .catch in
// install makes the missing-file case a no-op today (M3 + M4 from review).
const SHELL = ['', 'index.html', 'manifest.webmanifest', 'favicon.svg', 'apple-touch-icon.png']
  .map((p) => BASE + p);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    // Per-URL add so one 404 (e.g. apple-touch-icon.png pre-ship) doesn't
    // reject the whole install promise and leave the user with no SW.
    await Promise.all(SHELL.map((u) => cache.add(u).catch(() => null)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n)),
      ))
      .then(() => self.clients.claim()),
  );
});

// Page → SW: post the hashed asset URLs we just loaded so the SW can cache
// them for the next offline open. URLs are filtered to our own origin and
// to the assets/ subpath; everything else is ignored.
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'precache' || !Array.isArray(data.urls)) return;
  const targets = data.urls
    .filter((u) => typeof u === 'string')
    .map((u) => {
      try { return new URL(u, self.location.origin); } catch { return null; }
    })
    .filter((u) => u && u.origin === self.location.origin)
    .filter((u) => u.pathname.startsWith(BASE + 'assets/'))
    .map((u) => u.href);
  if (targets.length === 0) return;
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      // Only fetch+store ones we don't already have, to keep this idempotent.
      for (const href of targets) {
        const hit = await cache.match(href);
        if (hit) continue;
        try {
          const res = await fetch(href, { credentials: 'same-origin' });
          if (res.ok) await cache.put(href, res);
        } catch { /* offline / 404 — ignore */ }
      }
    }),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isHtml =
    req.mode === 'navigate' ||
    url.pathname === BASE ||
    url.pathname === BASE + 'index.html';

  const isHashedAsset = url.pathname.startsWith(BASE + 'assets/');

  if (isHtml) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match(BASE))),
    );
    return;
  }

  if (isHashedAsset) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        return res;
      })),
    );
  }
});
