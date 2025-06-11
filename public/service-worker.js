/* global workbox */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  // Cache halaman utama dan shell
  workbox.routing.registerRoute(
    ({request}) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages-cache',
    })
  );

  // Cache file statis (js, css, images)
  workbox.routing.registerRoute(
    ({request}) =>
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'assets-cache',
    })
  );

  // Cache API (opsional, sesuaikan endpoint)
  workbox.routing.registerRoute(
    /\/api\//,
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
    })
  );
} else {
  console.log('Workbox gagal dimuat');
}

// Langkah 2: Menangani push notifikasi di service worker
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (event.data) {
    event.waitUntil(
      event.data.text().then(textData => {
        let notificationData = {};
        let url = '/';
        try {
          notificationData = JSON.parse(textData);
          url = notificationData.url || '/';
        } catch (e) {
          notificationData = { title: 'Notifikasi', body: textData };
        }
        self.registration.showNotification(
          notificationData.title || 'Ada cerita baru untuk Anda!',
          {
            body: notificationData.body || 'cerita baru masuk nih',
            icon: notificationData.icon || '/images/icons/icon-192x192.png',
            badge: notificationData.badge || '/images/icons/icon-72x72.png',
            data: { url }
          }
        );
      }).catch(e => {
        self.registration.showNotification('Notifikasi Error', {
          body: 'Data notifikasi tidak valid.'
        });
      })
    );
  } else {
    event.waitUntil(
      self.registration.showNotification('Ada cerita baru untuk Anda!', {
        body: 'cerita baru masuk nih',
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/icon-72x72.png',
        data: { url: '/' }
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  event.notification.close();

  const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});
