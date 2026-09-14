const CACHE_NAME = 'masteronline-static-v1'

// Only cache static, hashed build assets and icons — never API responses or
// HTML pages, so users always see fresh data/auth state. This exists mainly
// to satisfy PWA installability criteria and speed up repeat asset loads,
// not to provide full offline browsing of dynamic content.
const CACHEABLE_PATH_PREFIXES = ['/_next/static/', '/icon-', '/apple-touch-icon']

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  const isCacheable = CACHEABLE_PATH_PREFIXES.some((p) => url.pathname.startsWith(p))
  if (!isCacheable) return

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok) cache.put(request, response.clone())
      return response
    })
  )
})
