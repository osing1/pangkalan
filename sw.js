const CACHE_NAME = 'rm-pangkalan-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './pos.html',
  './dashboard.html',
  './manifest.json'
];

// Install Service Worker dengan pengecekan satu per satu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Membuka cache...');
      // Menggunakan map untuk mencoba cache satu per satu agar tidak gagal total jika 1 file hilang
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.warn(`Gagal memuat aset ke cache: ${url}`, err));
        })
      );
    })
  );
});

// Aktivasi & Pembersihan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Strategi: Network First, Fallback to Cache (Bagus untuk data yang sering berubah seperti POS)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
