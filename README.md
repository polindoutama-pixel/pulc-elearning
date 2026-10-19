# PULC — Polindo Utama e-Learning Center

Aplikasi web internal untuk onboarding karyawan dan pembelajaran perusahaan. Versi pertama menyediakan portal karyawan, dashboard admin, materi multimedia, penugasan, progres belajar, kuis, dan laporan. Antarmuka menggunakan Bahasa Indonesia dan mendukung ponsel.

## Mulai pengembangan

Diperlukan **Node.js 24 atau lebih baru** dan npm. SQLite menggunakan modul bawaan Node, sehingga tidak memerlukan server database tambahan.

```bash
cd /workspace/pulc-elearning
npm ci --cache /workspace/.npm-cache
npm run dev
```

Server pengembangan frontend menggunakan port **5173**, API menggunakan **3001**. Vite meneruskan permintaan `/api` ke API. Untuk instalasi di komputer lain, jalankan perintah dari root checkout dan gunakan lokasi cache npm yang dapat ditulis.

Pada login, gunakan tombol **Sebagai karyawan** atau **Sebagai admin** untuk mencoba aplikasi. Untuk masuk manual pada database demo baru:

| Peran    | NIK         | Kata sandi demo    |
| -------- | ----------- | ------------------ |
| Admin    | `ADMIN001`  | `BelajarPULC!2026` |
| Karyawan | `PU2026001` | `BelajarPULC!2026` |

Kredensial tersebut khusus demo. Data contoh dibuat hanya pada database kosong dan tidak direset saat server dimulai ulang. Semua materi contoh perlu diganti atau ditinjau HR/HSE sebelum pemakaian perusahaan.

## Fitur yang tersedia

**Portal karyawan**

- Beranda dengan penugasan, progres, dan akses melanjutkan belajar.
- Program onboarding dengan susunan kelas dan tenggat.
- Katalog dengan pencarian serta filter kategori.
- Materi teks, video upload/link langsung/YouTube, audio, gambar, PDF, dokumen Word (DOC/DOCX), dan embed presentasi Canva.
- Deskripsi, transkrip, atau arahan teks di bawah setiap materi multimedia; PDF dan Word dapat diunduh dengan nama file aslinya.
- Urutan materi opsional, label modul/bagian, serta materi wajib/opsional.
- Posisi dan rentang pemutaran unik video/audio tersimpan; penyelesaian membutuhkan cakupan 90%.
- Pre-test opsional, sekali sebelum materi untuk mengukur kemampuan awal tanpa syarat nilai lulus.
- Post-test opsional, setelah materi dengan nilai minimum, batas percobaan, dan penilaian server. Nilai awal dan akhir tersimpan terpisah.
- Riwayat penyelesaian, pengingat penugasan dalam aplikasi, profil, dan perubahan kata sandi.

**Dashboard admin**

- Ringkasan pembelajaran, progres departemen, dan penugasan terlambat.
- Membuat/edit kelas, menyusun materi, mengunggah file, membuat kuis, dan pratinjau tanpa mencatat progres.
- Draft, publikasi, arsip, duplikasi, dan pembatasan akses kelas berdasarkan departemen.
- Membuat program dengan memilih kelas sesuai urutan.
- Penugasan kelas/program berdasarkan departemen atau pilihan karyawan.
- Membuat/edit/nonaktifkan akun, reset kata sandi, dan impor CSV dengan pratinjau serta validasi per baris.
- Laporan progres, nilai pre-test/post-test, perubahan nilai, pencarian/filter, ekspor CSV, dan pemberian kesempatan post-test tambahan dengan alasan.
- Audit log perubahan penting.

Akun baru wajib mengganti kata sandi awal. Kelas yang sudah memiliki peserta mempertahankan isi materi/kuis; gunakan duplikasi draft untuk revisi substansial. Arsip mempertahankan akses peserta lama dan riwayatnya. Penugasan ulang tidak mereset progres dan mempertahankan tenggat terdekat.

## Build dan menjalankan hasil build

```bash
npm run build
npm start
```

Perintah ini menyajikan frontend dan API melalui port 3001 dalam mode pengembangan/demo, kecuali variabel lingkungan menentukan sebaliknya. `npm start` sendiri **tidak** mengaktifkan mode produksi.

## Pengujian

```bash
npm test
npm run build
npm run test:e2e
npm run format:check
```

Pengujian API memakai database sementara yang terisolasi. Pengujian browser memulai server tersendiri pada port 3011 dan Vite pada 5181 dengan database demo sementara; tidak mengubah `data/pulc.sqlite` pengembangan. Jalankan build terlebih dahulu karena pengujian browser memakai hasil build.

Playwright memakai `/usr/bin/chromium` bila tersedia. Di komputer lain, instal browser dengan `npx playwright install chromium`, atau atur `PLAYWRIGHT_CHROMIUM_PATH` ke executable yang tersedia. Pengunduhan browser membutuhkan akses ke domain distribusi Playwright. Fixture media sudah disimpan di `tests/fixtures`; ffmpeg tidak diperlukan untuk menjalankan tes.

Cakupan pengujian mencakup autentikasi, hak akses, sanitasi konten/link embed, pre-test/post-test, impor, penugasan, unggahan, pembatasan departemen, migrasi hasil lama, mode produksi, alur admin/karyawan, pemutaran video/audio aktual, unduhan PDF/Word, dan navigasi ponsel. YouTube SDK dan Canva disimulasikan pada tes browser agar deterministik; tes tersebut tidak membuktikan ketersediaan atau izin embed konten pihak ketiga.

## Struktur proyek

```text
src/main.jsx          Antarmuka React dan alur admin/karyawan
src/styles.css        Desain responsif
src/ui.jsx            Komponen UI bersama
src/editor-fields.jsx Editor materi multimedia dan evaluasi
src/lesson-content.jsx Pemutar native/YouTube, embed Canva, dokumen, dan deskripsi
src/api.js            Klien API dan navigasi
shared/media.js       Validasi link provider dan metadata format
server/index.js       Inisialisasi dan lifecycle server
server/app.js         API, sesi, otorisasi, unggahan, dan aturan belajar
server/course-content.js Validasi dan sanitasi materi/evaluasi
server/db.js          Skema, migrasi aditif, dan hashing kata sandi
server/seed.js        Data demo atau inisialisasi admin produksi
tests/api.test.js     Pengujian API/database
tests/e2e/           Pengujian browser
tests/fixtures/      Media kecil untuk pengujian
docs/PRD.md          Spesifikasi produk dan batas versi awal
docs/OPERATIONS.md   Konfigurasi, backup, dan kebutuhan peluncuran
```

Data SQLite, WAL, dan unggahan berada di `data/` secara default serta diabaikan Git. Gunakan checkout yang sudah tersedia; setiap tugas cloud sudah terisolasi sehingga tidak perlu membuat Git worktree baru.

## Pembaruan kelas dan evaluasi

Kuis pada database versi lama otomatis dipertahankan sebagai **post-test**. Migrasi menambahkan pre-test dan jenis percobaan secara aditif; nilai lama, progres, dan kesempatan tambahan tidak direset. Cadangkan data sebelum memperbarui deployment sesuai petunjuk operasional.

Admin dapat mengaktifkan pre-test dan post-test secara independen melalui tab **Kuis**. Materi dibuka setelah pre-test dikumpulkan jika pre-test diaktifkan. Pre-test bernilai rendah tetap membuka materi; kelulusan kelas mengikuti materi wajib serta post-test jika diaktifkan. Untuk kelas yang telah memiliki peserta, gunakan **Duplikasikan ke draft** saat menambah/mengubah materi atau evaluasi.

Video YouTube harus mengizinkan embed. Canva menggunakan link lihat/sematkan `https://www.canva.com/design/…/view`; peserta harus mempunyai izin melihat presentasinya. Embed eksternal membutuhkan koneksi ke provider. Lihat rincian domain jaringan pada [petunjuk operasional](docs/OPERATIONS.md).

## Status penggunaan

Versi ini siap untuk **evaluasi internal dengan data contoh**. Peluncuran ke karyawan memerlukan hosting HTTPS, penyimpanan persisten beserta backup, penggantian materi resmi, dan uji penerimaan HR/HSE. Integrasi HRIS/SSO, email/WhatsApp, kelas langsung, sertifikat, offline, dan validasi praktik belum termasuk.

Lihat [PRD](docs/PRD.md) dan [petunjuk operasional](docs/OPERATIONS.md).
