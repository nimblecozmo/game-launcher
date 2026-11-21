// Game Launcher service worker - caches the shell + thumbnails so the hub
// opens instantly, but always goes to the network for the games themselves.
const SHELL = 'games-launcher-shell-v1';
const ASSETS = 'games-launcher-assets-v1';
const SHELL_FILES = [
  './', './index.html', './manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== ASSETS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;          // let other games load normally

  // thumbnails: cache-first
  if (url.pathname.includes('/thumbs/')) {
    e.respondWith(
      caches.open(ASSETS).then(c =>
        c.match(req).then(hit =>
          hit || fetch(req).then(res => { c.put(req, res.clone()); return res; })
        )
      )
    );
    return;
  }

  // games + everything else: network-first so new builds show up
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(ASSETS).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req))
  );
});
