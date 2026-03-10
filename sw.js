/* ═══════════════════════════════════════════════════════════
   Levels App — Service Worker v2.0
   - Cache offline (PWA)
   - Notifications push planifiées
═══════════════════════════════════════════════════════════ */

const SW_VERSION = '2.0.0';
const CACHE_NAME = 'levels-v2';
const CACHE_URLS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];
const _timers = {};

/* ── Installation : mettre en cache les assets clés ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

/* ── Activation : nettoyer les anciens caches ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch : network-first, cache fallback ── */
self.addEventListener('fetch', e => {
  /* Ne cacher que les requêtes GET vers notre domaine */
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        /* Mettre à jour le cache avec la réponse fraîche */
        if(res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

/* ── Messages depuis l'app ── */
self.addEventListener('message', e => {
  const data = e.data;
  if(!data || !data.type) return;

  if(data.type === 'SCHEDULE') {
    if(_timers[data.id]) clearTimeout(_timers[data.id]);
    _timers[data.id] = setTimeout(() => {
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: data.tag || data.id,
        requireInteraction: false,
        silent: false
      });
      delete _timers[data.id];
    }, data.delay);
  }

  if(data.type === 'CANCEL_ALL') {
    Object.keys(_timers).forEach(id => { clearTimeout(_timers[id]); delete _timers[id]; });
  }
});

/* ── Clic sur notification ── */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => clients.length > 0 ? clients[0].focus() : self.clients.openWindow('/'))
  );
});
