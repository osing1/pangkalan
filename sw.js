/**
 * RM PANGKALAN - Service Worker v8
 * Pembaruan: Sinkronisasi penuh untuk semua modul (Admin, POS, Dapur, Stok, Pegawai).
 */

const CACHE_NAME = 'rm-pangkalan-v8';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './admin.html',
  './dashboard.html',
  './pos.html',
  './dapur.html',
  './admin_menu.html',
  './laporan.html',
  './stok.html',
  './pegawai.html',
  './manifest.json',
  // Library Eksternal
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Tahap Install: Mengunduh semua aset ke dalam cache browser
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Menyiapkan cache sistem v8...');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.warn(`Gagal memuat ke cache: ${url}`, err));
        })
      );
    })
  );
});

// Tahap Aktivasi: Menghapus cache versi lama (v7 ke bawah)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Membersihkan cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Strategi Fetch: Network First, Fallback to Cache
self.addEventListener('fetch', (event) => {
  // PENTING: Jangan cache permintaan POST (API Google Sheets)
  if (event.request.method === 'POST') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Jika berhasil ambil dari network, simpan salinan terbaru ke cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Jika network gagal (offline), ambil dari cache
        return caches.match(event.request);
      })
  );
});
