const NavbarView = {
  render() {
    return `
      <nav class="navbar" role="navigation" aria-label="Navigasi Utama">
        <ul class="navbar-list">
          <li><a href="#/home">Beranda</a></li>
          <li><a href="#/offline">Cerita Offline</a></li>
          <li><a href="#/add">Tambah Cerita</a></li>
          <li><a href="#/notification">Notifikasi</a></li>
          <li><a href="#/about">Tentang</a></li>
        </ul>
        <button id="logoutButton" class="logout-button" aria-label="Keluar dari akun">Logout</button>
      </nav>
    `;
  },
  showLogoutButton(show) {
    const logoutBtn = document.getElementById("logoutButton");
    if (logoutBtn) logoutBtn.style.display = show ? "inline-block" : "none";
  }
};

export default NavbarView;
