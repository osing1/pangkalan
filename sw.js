const CACHE_NAME = 'rm-pangkalan-v4'; // Update versi karena ada aset baru
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './pos.html',
  './dashboard.html',
  './pelanggan.html', // Halaman pelanggan baru
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Service Worker dengan pengecekan satu per satu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Membuka cache...');
      // Menggunakan allSettled agar tidak gagal total jika salah satu file belum dibuat
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.warn(`Gagal memuat aset ke cache: ${url}`, err));
        })
      );
    })
  );
});

// Aktivasi & Pembersihan Cache Lama
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

// Strategi: Network First, Fallback to Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
