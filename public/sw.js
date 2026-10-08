// Offline support. Bump VERSION to force every client to drop old caches.
const VERSION = 'v2'
const CACHE = `hf-${VERSION}`
// Servers often send `Vary: Origin`; module scripts then never match a cached copy unless Vary is ignored.
const MATCH = { ignoreVary: true }
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']

// Cache the page plus the hashed JS/CSS it references, so the very first visit works offline too.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      const res = await fetch('/', { cache: 'reload' })
      const html = await res.clone().text()
      const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
      await cache.put('/', res)
      await cache.addAll(['/favicon.svg', '/icon-192.png', '/icon-512.png', '/manifest.webmanifest', ...assets])
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

async function networkFirst(request, fallbackKey) {
  const cache = await caches.open(CACHE)
  try {
    const res = await fetch(request)
    if (res.ok) cache.put(fallbackKey, res.clone())
    return res
  } catch {
    const cached = await cache.match(fallbackKey, MATCH)
    if (cached) return cached
    throw new Error('offline and not cached')
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request, MATCH)
  const refresh = fetch(request)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(request, res.clone())
      return res
    })
    .catch(() => cached)
  return cached || refresh
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    // Always try the network first so a new deploy is picked up; fall back to the cached page offline.
    event.respondWith(networkFirst(request, '/'))
  } else if (url.origin === self.location.origin) {
    // Hashed build assets never change, other files are tiny: serve from cache, refresh in background.
    event.respondWith(staleWhileRevalidate(request))
  } else if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request))
  }
})
