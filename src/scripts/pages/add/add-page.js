import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const AddPage = {
  getTemplate() {
    return `
      <section class="add-story">
        <h2>Tambah Cerita Baru</h2>
        <form id="storyForm">
          <label for="description">Deskripsi Cerita</label>
          <textarea id="description" name="description" placeholder="Tulis cerita kamu di sini..." required></textarea>

          <label for="photo">Unggah Gambar (opsional jika tidak pakai kamera)</label>
          <input type="file" id="photo" name="photo" accept="image/*" aria-describedby="photo-desc" />
          <p id="photo-desc" class="visually-hidden">Pilih satu gambar dari file atau gunakan kamera</p>

          <div class="camera-section">
            <video id="camera" autoplay aria-label="Tampilkan kamera langsung"></video>
            <canvas id="snapshot" style="display: none;"></canvas>
            <button type="button" id="captureButton" aria-label="Ambil foto dari kamera">Ambil Foto</button>
          </div>

          <div id="image-preview" style="margin-top:1em;">
            <h4>Preview Gambar:</h4>
            <img id="preview-img" src="" alt="Preview gambar hasil kamera atau upload" style="max-width: 100%; display: none;" />
          </div>

          <button type="submit" id="submitButton">Kirim</button>
        </form>

        <figure>
          <div id="map" style="height: 300px; margin-top: 1em;"></div>
          <figcaption>Peta lokasi cerita</figcaption>
        </figure>

        <label for="lat" class="visually-hidden">Latitude</label>
        <input type="hidden" id="lat" name="lat">

        <label for="lon" class="visually-hidden">Longitude</label>
        <input type="hidden" id="lon" name="lon">

        <div id="message" class="message"></div>
      </section>
    `;
  },

  initView({ onSubmit, onCapture, onMapClick }) {
    const form = document.getElementById("storyForm");
    const fileInput = document.getElementById("photo");
    const captureButton = document.getElementById("captureButton");
    const previewImg = document.getElementById("preview-img");

    let selectedFile = null;

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      selectedFile = file;
      this.setImagePreview(file);
    });

    captureButton?.addEventListener("click", () => {
      onCapture();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const description = document.getElementById("description").value.trim();
      const lat = document.getElementById("lat").value;
      const lon = document.getElementById("lon").value;

      // Validasi form
      if (!description) {
        this.showMessage("Deskripsi tidak boleh kosong.");
        return;
      }
      if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        this.showMessage("Silakan pilih lokasi pada peta.");
        return;
      }

      onSubmit({
        description,
        photo: selectedFile,
        lat,
        lon,
      });
    });

    const map = L.map("map").setView([-6.2, 106.816666], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    let marker = null;

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
      this.setLatLon(lat, lng);
      onMapClick(lat, lng);
    });
  },

  setImagePreview(fileOrBlob) {
    const previewImg = document.getElementById("preview-img");
    previewImg.src = URL.createObjectURL(fileOrBlob);
    previewImg.style.display = "block";
  },

  setLatLon(lat, lon) {
    document.getElementById("lat").value = lat;
    document.getElementById("lon").value = lon;
  },

  showMessage(text) {
    document.getElementById("message").innerText = text;
  },

  resetForm() {
    const form = document.getElementById("storyForm");
    form.reset();
    const previewImg = document.getElementById("preview-img");
    previewImg.src = "";
    previewImg.style.display = "none";
  },
};

export default AddPage;