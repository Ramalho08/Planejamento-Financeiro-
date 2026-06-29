const CACHE='rf-v142_force_2026';
const ASSETS=['./','./index.html?v142_force_2026','./style.css?v142_force_2026','./app-v142_force_2026.js?v142_force_2026','./manifest.json?v142_force_2026','./assets/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html?v142_force_2026'))));});
