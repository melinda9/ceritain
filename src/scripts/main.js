
import App from './pages/app';
import '../styles/style.css';
import { withViewTransition } from './utils/view-transition.js';
import { requestNotificationPermission } from './utils/notification-helper.js';

window.addEventListener('hashchange', () => {
  withViewTransition(() => App.renderPage());
});
window.addEventListener('load', () => App.renderPage());

// Minta izin notifikasi saat aplikasi pertama kali load, hanya jika Notification API tersedia
window.addEventListener('DOMContentLoaded', async () => {
  if ('Notification' in window) {
    const granted = await requestNotificationPermission();
    if (granted) {
      const title = 'Cerita baru masuk!';
      new Notification(title);
    }
  }
});

// PWA: Register service worker, push notification, and custom install prompt
let deferredPrompt;
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', reg.scope);

      // Push Notification: Request permission
      if ('PushManager' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Replace with your VAPID public key from API
          const VAPID_PUBLIC_KEY = 'YBCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
          const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
          // Kirim subscription ke server API jika diperlukan
          // await fetch('/api/save-subscription', { method: 'POST', body: JSON.stringify(subscription), headers: { 'Content-Type': 'application/json' } });
          console.log('Push subscription:', subscription);
        }
      }
    } catch (err) {
      console.error('Service Worker registration or Push failed:', err);
    }
  });

  // Custom install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });
}

// Langkah 1: Meminta izin notifikasi
if ('Notification' in window && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notifikasi diizinkan oleh pengguna.');
    } else {
      console.log('Notifikasi ditolak oleh pengguna.');
    }
  });
}

function showInstallButton() {
  let btn = document.getElementById('installPwaBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'installPwaBtn';
    btn.innerText = 'Install Aplikasi StoryIn';
    btn.style.position = 'fixed';
    btn.style.bottom = '24px';
    btn.style.right = '24px';
    btn.style.zIndex = '9999';
    btn.style.background = '#ffd700';
    btn.style.color = '#232a34';
    btn.style.fontWeight = 'bold';
    btn.style.padding = '1em 2em';
    btn.style.borderRadius = '8px';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.13)';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    document.body.appendChild(btn);
    btn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          btn.remove();
        }
        deferredPrompt = null;
      }
    });
  }
}

// Helper: Convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Skip to content handler untuk aksesibilitas SPA
const mainContent = document.querySelector('#main-content'); // Seleksi elemen id="main-content"
const skipLink = document.querySelector('.skip-link'); // Seleksi elemen class="skip-link"
if (mainContent && skipLink) {
  skipLink.addEventListener('click', function (event) {
    event.preventDefault(); // Mencegah refresh halaman
    skipLink.blur(); // Menghilangkan fokus skip to content
    mainContent.focus(); // Fokus ke konten utama
    mainContent.scrollIntoView(); // Halaman scroll ke konten utama
  });
}