# SmartBelanja Kos - Smart Grocery & Budget Safety Tracker (PWA)

Aplikasi Web Progresif (PWA) bergaya *native mobile* yang dirancang khusus untuk mahasiswa kos (seperti **Rian**) yang berbelanja kebutuhan bulanan di supermarket grosir sambil mendorong troli belanja dengan satu tangan.

---

## 📱 Mobile Architecture & Display Standards

1. **Format Layar Ponsel Murni (Max-Width 430px):**
   - Tampilan dibatasi maksimal lebar smartphone modern (430px) dan terpusat rapi saat dibuka di browser desktop/laptop.
   - Menggunakan viewport mobile: `viewport-fit=cover, user-scalable=no`.
2. **Bottom Navigation Bar Ergonomis:**
   - Menu navigasi melayang di bagian bawah layar yang mudah dijangkau oleh ibu jari tangan (*thumb zone*) saat mendorong troli.
   - 3 Tab Utama:
     - 🛒 **Belanja:** Daftar barang di troli, indikator fluktuasi harga, live stepper, dan status Safety Cap.
     - 📊 **Riwayat & Acuan:** Struk belanja digital anti-luntur dan katalog harga acuan bulanan.
     - 👛 **Budget & Promo:** Pengaturan uang saku, kalkulator diskon bertingkat, dan komparator harga per unit (*bulk comparison*).
3. **Ergonomi Sentuhan & Numeric Input:**
   - Stepper jumlah barang (`+` / `-`) berukuran besar (target sentuh 44px+).
   - Chip autofill cepat untuk kebutuhan pokok mahasiswa (*Beras 5kg, Minyak 2L, Telur 1kg, Indomie, Rinso, Pepsodent*).
   - Tidak ada tabel desktop yang bergeser ke samping (*no side-scrolling*).
4. **PWA Standalone & Dukungan Offline:**
   - Dilengkapi `manifest.json` dan `sw.js` (*Service Worker*) untuk caching aset.
   - Siap dipasang langsung ke layar utama (*Add to Home Screen*) tanpa melalui App Store/Play Store.
   - Tetap bekerja optimal di area basement supermarket yang minim sinyal internet.

---

## 📋 Pemenuhan Spesifikasi Kebutuhan Sistem (SRS Checklist)

| Kode | Nama Fitur Target | Spesifikasi & Perilaku Sistem | Status Implementasi |
|---|---|---|:---:|
| **F-01** | **Pencatatan Lengkap Barang Belanja** | Menyimpan nama produk, kategori barang (Beras & Pokok, Minyak & Bumbu, Sabun & Mandi, Mie Instan, dll.), satuan (kg, liter, pcs, pack, botol), kuantitas, dan harga satuan. | ✅ **Terpenuhi** |
| **F-02** | **Kalkulasi Kuantitas Otomatis** | Perubahan angka Qty (+ / -) seketika mengalikan harga satuan dan diskon secara real-time ke subtotal item dan total troli tanpa perlu menekan tombol kalkulator manual. | ✅ **Terpenuhi** |
| **F-03** | **Kalkulator Diskon Bertingkat** | Menghitung promo bertingkat (*stacked promo* seperti `50% + 20%`) dengan formula presisi matematis: $P_{akhir} = P \times (1 - D_1) \times (1 - D_2)$, bukan sekadar penjumlahan 70%. Dilengkapi kalkulator pembanding volume (contoh: 3x1L vs 5L). | ✅ **Terpenuhi** |
| **F-04** | **Deteksi Fluktuasi Harga vs Bulan Lalu** | Menampilkan indikator visual seketika saat nama barang atau harga diinput:<br>• 🔴 **Panah Atas Merah (↑):** Harga naik dibanding bulan lalu.<br>• 🟢 **Panah Bawah Hijau (↓):** Harga turun / promo asli dibanding bulan lalu.<br>• ⚪ **Tanda Sama Dengan (=):** Harga stabil / tetap.<br>• ✨ **Item Baru:** Belum ada data acuan. | ✅ **Terpenuhi** |
| **F-05** | **Budget Safety Cap (Monitoring Saku)** | Memantau akumulasi total belanja terhadap uang saku dengan *progress bar* dinamis dan status visual (Aman / Waspada / Bahaya). Dilengkapi fitur darurat *"Cegah Malu di Kasir"* yang merekomendasikan barang yang dapat ditunda jika melebihi budget. | ✅ **Terpenuhi** |
| **F-06** | **Riwayat Belanja & Database Acuan** | Menyimpan data belanja dan struk digital ke penyimpanan lokal (*LocalStorage*) dan memperbarui database acuan harga untuk pembanding belanja bulan berikutnya. | ✅ **Terpenuhi** |

---

## 🛠️ Cara Menjalankan Aplikasi

Aplikasi dibangun menggunakan **HTML5, Vanilla CSS, dan JavaScript murni** sehingga sangat ringan, cepat, dan tidak memerlukan instalasi runtime yang rumit.

### Opsi 1: Menjalankan dengan Python (Rekomendasi)
Buka terminal/PowerShell di folder proyek dan jalankan:
```bash
python -m http.server 8080
```
Buka browser di:
`http://localhost:8080`

### Opsi 2: Langsung Membuka File di Ponsel / Laptop
Buka file `index.html` langsung di browser Chrome, Edge, Safari, atau Firefox di smartphone Anda.

---

## 💡 Alur Penggunaan oleh Rian di Supermarket

1. **Di Pintu Masuk:**
   - Buka aplikasi di smartphone.
   - Uang saku default (Rp 400.000) sudah terpasang pada **Budget Safety Cap**.
2. **Di Depan Rak Beras & Minyak:**
   - Tekan tombol **Tambah** (+) di bagian bawah.
   - Pilih chip cepat **🍚 Beras 5kg** atau ketik nama barang.
   - Sistem seketika mendeteksi: `🔴 ↑ +Rp 6.000 (+9%) vs bln lalu (Rp 62.000)`. Rian langsung tahu beras sedang naik!
3. **Di Depan Rak Promo Sabun (50% + 20%):**
   - Centang *"Ada Promo Diskon Rak?"* dan pilih *"Bertingkat (50%+20%)"*.
   - Sistem membongkar matematika diskon: dari Rp 28.000 didiskon 50% menjadi Rp 14.000, lalu didiskon lagi 20% menjadi **Rp 11.200** (hemat 60%, bukan 70%).
4. **Di Depan Rak Minyak Goreng (3x1L vs 5L Jerigen):**
   - Buka tab **Budget & Promo**, masukkan data pada fitur *"Cek Mana Lebih Hemat?"*.
   - Sistem langsung membandingkan: 3L seharga Rp 54.000 (Rp 18.000/L) vs 5L seharga Rp 85.000 (Rp 17.000/L) → Menampilkan banner hijau: *"Pilihan B lebih hemat Rp 1.000/liter!"*.
5. **Saat Total Mendekati Kasir:**
   - Indikator Safety Cap memperingatkan jika belanjaan mendekati uang saku.
   - Jika melebihi uang saku, tombol *"Cegah Malu di Kasir"* akan menunda item non-pokok dengan 1 sentuhan sehingga Rian melangkah ke kasir dengan tenang dan percaya diri.
6. **Selesai Belanja:**
   - Tekan *"Selesai & Catat"*, struk digital tersimpan otomatis, dan harga barang hari ini resmi menjadi harga acuan untuk belanja bulan depan.