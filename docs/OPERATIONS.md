# Operasional PULC

## Konfigurasi

| Variabel         | Perilaku                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| `PORT`           | Port server, default `3001`                                                                           |
| `DATA_DIR`       | Lokasi SQLite dan unggahan, default `./data` relatif direktori kerja                                  |
| `NODE_ENV`       | `production` mengaktifkan cookie Secure dan menonaktifkan demo secara default                         |
| `PULC_DEMO`      | `true` mengaktifkan demo pada non-produksi; `false` menginisialisasi akun admin tanpa materi contoh   |
| `ADMIN_NIK`      | NIK admin awal untuk database non-demo baru; default `ADMIN`                                          |
| `ADMIN_PASSWORD` | Kata sandi awal admin non-demo, minimal 12 karakter, diberikan melalui konfigurasi rahasia deployment |

`.env.example` hanya contoh konfigurasi. File `.env` tidak otomatis dibaca; injeksikan variabel lewat process manager atau gunakan dukungan `node --env-file=.env server/index.js` untuk pengembangan lokal. Jangan commit kata sandi, database, atau unggahan ke Git.

## Inisialisasi produksi

1. Siapkan build dengan `npm ci` dan `npm run build` pada Node.js 24+.
2. Gunakan direktori persisten **baru**, terpisah dari database demo, melalui `DATA_DIR`.
3. Atur `NODE_ENV=production`, `PULC_DEMO=false`, dan `ADMIN_NIK`. Masukkan `ADMIN_PASSWORD` melalui pengaturan rahasia deployment, bukan kode atau argumen shell.
4. Jalankan `npm start` di belakang reverse proxy HTTPS yang mempertahankan Host/Origin yang konsisten. Cookie Secure membutuhkan HTTPS.
5. Login sebagai admin awal lalu ganti kata sandi. Hapus binding bootstrap `ADMIN_PASSWORD` setelah akun berhasil diinisialisasi dan simpan kredensial operasional sesuai prosedur perusahaan.
6. Tambahkan karyawan, materi resmi, kuis, program, dan penugasan. Uji penerimaan bersama HR dan HSE sebelum peluncuran.

Server menolak mode demo dalam produksi dan menolak database demo yang dibuka sebagai produksi. Jangan mengubah penanda database untuk melewati pembatasan ini. Pertahankan demo untuk evaluasi; gunakan database baru untuk penggunaan perusahaan.

Versi ini menggunakan satu proses aplikasi dengan SQLite. Jangan menyebarkan beberapa replika di atas filesystem yang tidak mendukung locking SQLite. Kebutuhan multi-site, kapasitas besar, atau beberapa replika perlu evaluasi PostgreSQL dan object storage tersendiri.

## File dan pembelajaran

- Batas unggahan 100 MB per file; sesuaikan batas reverse proxy agar konsisten.
- Gambar: PNG, JPEG, WebP. Presentasi: PDF. Video: MP4 atau WebM yang didukung browser.
- Unggahan diperiksa berdasarkan signature awal; ini bukan antivirus atau pemeriksaan konten menyeluruh. Akses unggah terbatas pada admin.
- Video eksternal harus berupa URL HTTPS langsung yang mengizinkan playback browser, bukan halaman berbagi YouTube. Akses URL eksternal tunduk pada kebijakan jaringan lingkungan. Video privat sebaiknya diunggah agar aksesnya diperiksa API.
- Isi durasi video dalam detik sesuai berkas asli. Ketidaksesuaian durasi dapat menghambat penyelesaian 90%.
- Pelacakan video menggunakan heartbeat dari browser dan penggabungan rentang unik. Ini mengukur aktivitas pemutaran, bukan bukti perhatian atau penguasaan materi. Bacaan/PDF/gambar menggunakan pengakuan penyelesaian oleh peserta.
- Subtitle/transkrip dapat disediakan sebagai materi teks pendamping. Editor subtitle terpisah belum tersedia.
- Label modul mengelompokkan konteks materi dalam daftar berurutan; modul belum mempunyai persyaratan kelulusan terpisah.
- Pemilihan kelas pada program menentukan urutan tampilan. Penguncian urutan berlaku pada materi di dalam kelas; penguncian antar kelas belum diterapkan.
- Penugasan departemen menggunakan keanggotaan saat dibuat. Karyawan yang bergabung kemudian perlu ditugaskan tersendiri.
- Pembatasan departemen mengatur penemuan kelas. Penugasan eksplisit memberi akses kepada penerima, termasuk setelah pindah departemen. Arsip hanya tersedia bagi admin dan peserta yang sudah terdaftar.
- Perubahan materi/kuis pada kelas yang telah memiliki peserta ditolak. Duplikasikan kelas, revisi, lalu tugaskan salinan; riwayat versi lama tetap utuh.

## Backup dan pemulihan

SQLite berada di `$DATA_DIR/pulc.sqlite`; mode WAL juga dapat membuat berkas `-wal` dan `-shm`. Unggahan berada di `$DATA_DIR/uploads`.

Untuk backup konsisten versi awal:

1. Hentikan proses PULC secara normal dan pastikan tidak ada proses yang menulis database.
2. Salin seluruh `DATA_DIR` ke penyimpanan backup berakses terbatas, termasuk database dan unggahan. Jangan hanya menyalin file `.sqlite` saat server aktif.
3. Mulai ulang layanan dan verifikasi `/api/health`, login, serta pembukaan satu materi.
4. Uji pemulihan berkala pada lingkungan terpisah: pulihkan seluruh direktori, jalankan versi aplikasi yang sesuai, lalu periksa akun, progres, laporan, dan file.

Otomasi jadwal backup, retensi, pemantauan, dan uji pemulihan deployment belum disediakan. Semuanya perlu disiapkan sesuai infrastruktur yang dipilih.

## Kesiapan dan troubleshooting

- `/api/health` mengembalikan status server dan indikator demo. Login lalu akses `/api/bootstrap` untuk memverifikasi database dan sesi secara fungsional.
- Jika port 3001 dipakai, hentikan hanya proses PULC yang Anda mulai. Vite proxy mengarah ke 3001. Jika API memakai port lain, atur `PULC_API_TARGET` pada proses Vite. Proxy harus mempertahankan Host agar pemeriksaan Origin tetap berlaku.
- Jika akun dinonaktifkan atau kata sandi direset, sesi lama tidak dapat dipakai. Admin memberikan akses awal baru melalui kanal perusahaan, bukan fitur pendaftaran publik.
- Jika kuis gagal tiga kali atau sesuai batas yang disetel, admin dapat menambah satu kesempatan dengan alasan melalui laporan/penugasan.
- Gunakan `npm test` untuk diagnosis API; gunakan `npm run build` lalu `npm run test:e2e` untuk diagnosis antarmuka.
- Data demo tidak direset otomatis. Untuk percobaan bersih, gunakan `DATA_DIR` baru; jangan menghapus data yang belum dibackup.
- Startup layanan dan koneksi aktif tidak bertahan setelah pemulihan snapshot cloud. Jalankan ulang `npm run dev` atau `npm start` sesuai alur yang diperlukan.
