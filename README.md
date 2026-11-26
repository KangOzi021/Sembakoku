# SembakoKu – Inventory & Sales Management

Project UAS Pemrograman Web 1 untuk studi kasus toko sembako (absen 20).

## Fitur
1. Dashboard ringkasan jumlah produk, stok, transaksi, pendapatan, dan stok menipis.
2. CRUD produk: tambah, edit, hapus, dan pencarian produk.
3. Transaksi penjualan dengan keranjang dan perhitungan total otomatis.
4. Validasi input produk, jumlah, stok, dan nama pembeli.
5. Pengurangan stok otomatis setelah transaksi disimpan.
6. Laporan riwayat transaksi, detail transaksi, dan cetak laporan.
7. Penyimpanan data menggunakan LocalStorage browser.

## Teknologi
HTML5 semantic, CSS3 responsive, JavaScript (function, object, array, looping, DOM, EventListener), jQuery (pencarian produk), Bootstrap 5.

## Cara menjalankan
- Ekstrak ZIP.
- Buka folder di VS Code.
- Jalankan `index.html` dengan Live Server, atau buka langsung di browser.
- Koneksi internet diperlukan untuk memuat Bootstrap, jQuery, dan Google Fonts dari CDN.

## Struktur
- `index.html` – dashboard
- `produk.html` – manajemen produk
- `transaksi.html` – kasir/penjualan
- `laporan.html` – laporan transaksi
- `assets/style.css` – styling
- `assets/app.js` – logika aplikasi

## Catatan
Data disimpan pada LocalStorage browser, bukan database server. Data tersimpan pada browser/perangkat yang sama. Hapus data demo atau ubah data produk sesuai kebutuhan toko saat demonstrasi.
