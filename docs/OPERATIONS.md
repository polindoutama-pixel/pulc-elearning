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
- Gambar: PNG, JPEG, WebP. Presentasi: PDF atau embed Canva. Dokumen: DOC/DOCX (diunduh untuk dibuka di aplikasi Word).
- Audio: MP3, WAV, OGG/Opus, M4A, FLAC, WebM audio. Video: MP4/WebM upload, link video langsung HTTPS, atau YouTube. Dukungan codec mengikuti browser peserta.
- PDF/DOC/DOCX menyediakan tombol unduh. Endpoint unduhan memeriksa autentikasi dan akses kelas yang sama dengan pembukaan materi, serta mempertahankan nama file asli.
- Semua format multimedia memiliki deskripsi/arahannya sendiri di bawah media. HTML disanitasi; iframe HTML bebas tidak diterima.
- Unggahan diperiksa berdasarkan signature awal; ini bukan antivirus atau pemeriksaan konten menyeluruh. Akses unggah terbatas pada admin.
- YouTube mendukung link watch, youtu.be, shorts, dan embed. URL dinormalisasi ke ID video dan dimainkan melalui IFrame Player API dengan host `www.youtube-nocookie.com`. Video harus tersedia dan mengizinkan embed; bila gagal, aplikasi menampilkan pesan serta link ke sumber. Pemutaran di luar PULC tidak mencatat progres.
- Canva hanya menerima link lihat/sematkan berakhiran `/view` dari domain Canva resmi; aplikasi menambahkan `?embed`. Link edit dan domain lain ditolak. Pemilik presentasi harus mengatur izin lihat untuk peserta.
- Link langsung video HTTPS tetap didukung. Akses konten eksternal mengikuti kebijakan jaringan browser/lingkungan. Media rahasia perusahaan sebaiknya diunggah untuk memperoleh pemeriksaan akses API PULC.
- Isi durasi video/audio dalam detik sesuai media sebenarnya. Untuk unggahan, editor mencoba mengisi durasi dari metadata. Untuk YouTube/link langsung, durasi diisi admin. Durasi salah dapat membuat pengukuran penyelesaian 90% tidak sesuai.
- Pelacakan video/audio menggunakan heartbeat dari browser dan penggabungan rentang unik; bagian yang dilompati melalui seek tidak dianggap diputar. Ini mengukur aktivitas pemutaran, bukan bukti perhatian atau penguasaan materi. Bacaan/PDF/gambar/Canva/Word menggunakan pengakuan penyelesaian oleh peserta.
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
- Jika post-test gagal tiga kali atau sesuai batas yang disetel, admin dapat menambah satu kesempatan dengan alasan melalui laporan/penugasan. Pre-test hanya satu kali untuk menjaga nilai awal dan tidak memakai jatah percobaan post-test.
- Gunakan `npm test` untuk diagnosis API; gunakan `npm run build` lalu `npm run test:e2e` untuk diagnosis antarmuka.
- Data demo tidak direset otomatis. Untuk percobaan bersih, gunakan `DATA_DIR` baru; jangan menghapus data yang belum dibackup.
- Startup layanan dan koneksi aktif tidak bertahan setelah pemulihan snapshot cloud. Jalankan ulang `npm run dev` atau `npm start` sesuai alur yang diperlukan.

## Pre-test, post-test, dan migrasi versi lama

`courses.quiz` tetap menyimpan post-test untuk kompatibilitas; `courses.pre_quiz` menyimpan evaluasi awal. Tabel attempts mendapat kolom `phase`, dengan data lama otomatis bernilai `post`. Tidak ada penghapusan atau reset riwayat. Migrasi dapat dijalankan berulang saat startup.

Pre-test bersifat opsional. Jika diaktifkan, peserta wajib mengumpulkannya sebelum mencatat penyelesaian materi. Pre-test hanya satu kali, dinilai server untuk baseline, dan tidak memiliki ambang lulus. Post-test dibuka setelah pre-test serta semua materi wajib selesai; post-test mengendalikan kelulusan bila tersedia. Laporan menampilkan kedua nilai secara terpisah dan perubahan nilai (post-test terbaik dikurangi pre-test).

Perubahan materi/evaluasi pada kelas yang telah memiliki peserta tetap memerlukan salinan draft baru, sehingga peserta lama tidak mendadak mendapat prasyarat baru dan riwayatnya tetap berlaku.

## Jaringan embed eksternal

Pada lingkungan dengan egress terbatas, domain berikut diperlukan untuk materi eksternal:

- `www.youtube.com`: SDK IFrame Player API dan aset pemutar.
- `www.youtube-nocookie.com`: iframe pemutar.
- `*.ytimg.com`: aset gambar/player YouTube.
- `*.googlevideo.com`: streaming video/audio YouTube.
- `*.canva.com`: iframe presentasi dan aset Canva.

Aplikasi memakai referrer policy `strict-origin-when-cross-origin` agar YouTube menerima asal embed tanpa mengirim path aplikasi. Firewall perusahaan, pengaturan browser, dan izin konten tetap dapat membatasi pemutaran. Aset/kebutuhan provider dapat berubah; diagnosis error aktual sebelum menambah domain lain.

Pada sesi pengembangan revisi ini, akses langsung YouTube/Canva menghasilkan HTTP 403 dari kebijakan jaringan cloud. Penambahan domain disimpan sebagai draft lingkungan; belum diterapkan atau dipublikasikan otomatis. Tinjau/simpan pengaturan dan Publish lingkungan untuk mengaktifkannya, lalu verifikasi lagi dengan link materi yang memiliki izin embed. Pengujian otomatis menguji kontrak SDK/embed melalui stub layanan; video/audio lokal memakai berkas fixture sungguhan.
