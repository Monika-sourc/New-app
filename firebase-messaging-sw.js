// ============================================================
// firebase-messaging-sw.js
// Service Worker pour Firebase Cloud Messaging (FCM)
// ⚠️ DOIT être à la racine du projet (à côté de index.html)
// ============================================================

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// ⚠️ Config Firebase identique à firebase-config.js
firebase.initializeApp({
  apiKey: "AIzaSyCXaxTRKURvL7jLh9bmIz0TZyvciaPpQzs",
  authDomain: "new-app-e6401.firebaseapp.com",
  projectId: "new-app-e6401",
  storageBucket: "new-app-e6401.firebasestorage.app",
  messagingSenderId: "1005248947843",
  appId: "1:1005248947843:web:f6708f80b03d9fd7835db6"
});

const messaging = firebase.messaging();

// ============================================================
// Notification reçue quand l'app est FERMÉE / en arrière-plan
// ============================================================
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notification reçue (app fermée) :', payload);

  const notif = payload.notification || {};
  const data = payload.data || {};

  const title = notif.title || data.title || 'YOUNITED';
  const body = notif.body || data.body || 'Nouvelle notification';

  self.registration.showNotification(title, {
    body: body,
    icon: notif.icon || data.icon || '/logo-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'younited-' + Date.now(),
    renotify: true,
    requireInteraction: false,
    data: {
      click_action: data.click_action || '/'
    }
  });
});

// ============================================================
// Clic sur la notification → ouvre l'app
// ============================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.click_action || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================================
// Fermeture de notification (log uniquement)
// ============================================================
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification fermée :', event.notification);
});
