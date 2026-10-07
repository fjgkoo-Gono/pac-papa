'use strict';
// Service worker: permite instalar Pac-Papa y jugar sin conexión.
// Estrategia "primero la red": siempre usa la versión más reciente y,
// si no hay conexión, la última guardada.
const CACHE = 'pac-papa-v1';
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.json',
  'css/estilos.css',
  'js/constantes.js',
  'js/util.js',
  'js/laberinto.js',
  'js/pacpapa.js',
  'js/controles.js',
  'js/audio.js',
  'js/fantasmas.js',
  'js/juego.js',
  'js/render/piedras.js',
  'js/render/items.js',
  'js/render/personajes.js',
  'js/render/fantasmas.js',
  'js/render/frutas.js',
  'js/render/hud.js',
  'js/render/escenas.js',
  'js/main.js',
  'iconos/icono-192.png',
  'iconos/icono-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return resp;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
