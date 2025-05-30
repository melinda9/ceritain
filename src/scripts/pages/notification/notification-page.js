const NotificationPage = {
  render(container) {
    container.innerHTML = this.getTemplate();
    this.showNotifications();
  },

  getTemplate() {
    return `
      <section class="notification-section">
        <h2>Notifikasi</h2>
        <ul id="notification-list" class="notification-list"></ul>
        <button id="clearNotificationsBtn">Hapus Semua Notifikasi</button>
      </section>
    `;
  },

  showNotifications() {
    const list = document.getElementById('notification-list');
    let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    // Hapus notifikasi contoh jika ada
    notifications = notifications.filter(n =>
      !(n.title === "Notifikasi Contoh" && n.body === "ada 1/2 yang masuk")
    );
    localStorage.setItem('notifications', JSON.stringify(notifications));
    if (!notifications.length) {
      list.innerHTML = '<li>Tidak ada notifikasi.</li>';
    } else {
      list.innerHTML = notifications.map(n => `<li><strong>${n.title}</strong><br>${n.body}<br><small>${n.time}</small></li>`).join('');
    }
    const clearBtn = document.getElementById('clearNotificationsBtn');
    clearBtn.onclick = () => {
      localStorage.removeItem('notifications');
      this.showNotifications();
    };
  },

  saveNotification({ title, body }) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift({ title, body, time: new Date().toLocaleString() });
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }
};

export default NotificationPage;
