# PRD — Polindo Utama e-Learning Center (PULC)

Versi 0.2. Berdasarkan kebutuhan dan PRD yang disepakati pada percakapan proyek. Dokumen ini membedakan kebutuhan produk dari cakupan implementasi awal.

## Tujuan

Menyediakan pusat onboarding dan pembelajaran internal untuk karyawan Polindo Utama. Karyawan mengetahui materi yang perlu dipelajari; HR dapat mengelola konten, menugaskan pembelajaran, dan memantau hasil secara konsisten.

Dua area utama adalah dashboard admin dan portal karyawan. Pengalaman katalog, detail kelas, daftar materi, dan progres mengambil inspirasi dari platform pembelajaran seperti Udemy/Skillshare, disesuaikan untuk penugasan internal perusahaan.

## Pengguna

| Peran             | Kebutuhan                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| Admin HR/Learning | Mengelola akun, kelas, onboarding, penugasan, hasil, dan laporan                                       |
| Pengelola materi  | Menyusun materi bersama pemilik konten departemen; pada versi awal memakai peran admin                 |
| Karyawan          | Mengikuti kelas wajib/pilihan, melihat tenggat dan progres, mengerjakan kuis, melanjutkan pembelajaran |
| Supervisor        | Pemantauan anggota tim; direncanakan setelah MVP                                                       |

Versi awal mempunyai dua peran teknis: `admin` dan `employee`. Pemisahan Super Admin, editor materi, dan supervisor ditunda.

## Struktur dan contoh program

Program → kelas → pre-test opsional → materi berurutan dengan label modul/bagian → post-test opsional.

Program awal: Pengenalan Perusahaan, Safety Conduct, dan Alur Kerja Pabrik. Kelas tambahan mencakup Quality Control, Komunikasi/Kolaborasi, dan Literasi Digital. Semua konten seed adalah demonstrasi; HR/HSE/departemen wajib menyediakan atau meninjau isi resmi.

Penyelesaian kelas keselamatan tidak menggantikan validasi praktik, izin kerja, atau prosedur perusahaan.

## Kebutuhan versi awal

| ID      | Kebutuhan                                        | Implementasi                                                                                                                          |
| ------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-01 | Akun internal, login, logout, akses sesuai peran | Sesi HttpOnly, kata sandi scrypt, pembatasan percobaan login                                                                          |
| AUTH-02 | Akun baru dan pemulihan melalui admin            | Kata sandi awal wajib diganti; reset oleh admin                                                                                       |
| ADM-01  | Mengelola akun dan departemen                    | CRUD akun tanpa penghapusan riwayat; departemen pada profil akun                                                                      |
| ADM-02  | Impor karyawan                                   | CSV, maksimal 500 baris, pratinjau, validasi, penolakan duplikat atomik                                                               |
| CLS-01  | Membuat dan menyusun kelas                       | Informasi, kategori, durasi, tema sampul, label modul, urutan materi                                                                  |
| CLS-02  | Materi multimedia                                | Teks, gambar, video upload/YouTube, audio, PDF/Word, Canva; deskripsi multimedia dan unduhan dokumen; unggahan privat maksimal 100 MB |
| CLS-03  | Publikasi dan revisi                             | Draft, terbit, arsip, duplikasi, pratinjau admin tanpa progres                                                                        |
| CLS-04  | Audiens                                          | Seluruh karyawan atau departemen; penugasan eksplisit memberi akses                                                                   |
| PRG-01  | Program onboarding                               | Program dengan daftar kelas yang dipilih sesuai urutan                                                                                |
| ASN-01  | Penugasan dan tenggat                            | Per karyawan/departemen; program diturunkan menjadi penugasan kelas                                                                   |
| LRN-01  | Beranda dan katalog                              | Penugasan, lanjut belajar, pencarian, kategori                                                                                        |
| LRN-02  | Progres tersimpan                                | Materi, posisi video, rentang tontonan, kelulusan kelas/program                                                                       |
| LRN-03  | Urutan materi                                    | Penguncian materi berdasarkan penyelesaian materi wajib sebelumnya                                                                    |
| QZ-01   | Kuis                                             | Pre-test diagnostik satu kali; post-test pilihan ganda, penilaian server, nilai minimum, batas percobaan                              |
| QZ-02   | Kesempatan tambahan                              | Admin menambah satu percobaan dengan alasan dan audit log                                                                             |
| RPT-01  | Pemantauan                                       | Progres, status, tenggat, skor terbaik, percobaan, penyelesaian                                                                       |
| RPT-02  | Ekspor dan audit                                 | CSV laporan, 100 aktivitas terbaru pada API audit                                                                                     |
| UX-01   | Ponsel dan aksesibilitas dasar                   | Responsif, label input, keyboard, fokus modal, dukungan reduced motion                                                                |
| NOT-01  | Pengingat                                        | Daftar penugasan wajib belum selesai di notifikasi aplikasi                                                                           |

## Aturan bisnis

1. Progres kelas menghitung materi wajib, pre-test jika tersedia, serta post-test jika tersedia.
2. Materi teks/gambar/PDF/Word/Canva diselesaikan melalui pengakuan peserta. Video dan audio membutuhkan cakupan 90% rentang unik yang diputar.
3. Materi opsional tidak menghalangi kelulusan. Urutan wajib berlaku pada materi di dalam kelas bila diaktifkan.
4. Pre-test opsional dikerjakan sekali sebelum materi untuk mencatat kemampuan awal; nilai rendah tetap membuka pembelajaran. Post-test terbuka setelah seluruh materi wajib selesai. Nilai minimum dan batas percobaan post-test dapat diatur; usulan awal 80 dan tiga percobaan.
5. Jawaban benar tidak dikirim ke karyawan; server menghitung nilai. Admin melihat kunci pada editor/pratinjau.
6. Kelas selesai setelah pre-test dikumpulkan jika tersedia, materi wajib selesai, dan post-test lulus jika tersedia. Program selesai setelah semua kelasnya selesai.
7. Status: belum dimulai, sedang dipelajari, selesai. Terlambat berarti belum selesai dan tenggat terlewati berdasarkan tanggal Asia/Jakarta.
8. Penugasan ulang mempertahankan progres; tenggat terdekat berlaku jika beberapa penugasan bertemu pada kelas yang sama.
9. Penugasan departemen berlaku untuk anggota aktif saat itu. Karyawan baru perlu penugasan tambahan.
10. Revisi materi/kuis pada kelas berpeserta menggunakan salinan draft baru. Metadata/status dapat diperbarui; riwayat penyelesaian dipertahankan.
11. Penonaktifan akun menutup akses, tanpa menghapus riwayat.
12. Kelas arsip tersedia bagi peserta lama; tidak menerima pendaftaran baru.
13. Timestamp penyelesaian pertama dipertahankan saat peserta mengulang bacaan.

## Alur utama

**Onboarding:** admin membuat/impor akun → menyusun program → menetapkan peserta/tenggat → karyawan login dan mengganti kata sandi awal → mempelajari materi → mengerjakan kuis → HR memantau hasil.

**Kelas perusahaan:** admin menyiapkan draft → meninjau materi → menerbitkan kelas → menugaskan atau menyediakan dalam katalog → karyawan belajar → hasil tersedia pada laporan.

## Indikator keberhasilan pilot

- Aktivasi: proporsi akun yang berhasil digunakan untuk login.
- Penyelesaian tepat waktu: penugasan selesai sebelum tenggat dibanding penugasan yang jatuh tempo.
- Durasi onboarding: waktu dari penugasan sampai seluruh kelas selesai.
- Hasil evaluasi: kelulusan pertama, pengulangan, dan kebutuhan pendampingan.
- Partisipasi kelas pilihan dan waktu administrasi HR.

Laporan dasar tersedia. Agregasi aktivasi, durasi onboarding, dan analitik lanjutan perlu pengembangan berikutnya. Target angka ditetapkan setelah baseline pilot.

## Kriteria penerimaan

- Admin dapat menerbitkan kelas multimedia dan menugaskannya ke kelompok yang tepat.
- Karyawan dapat melanjutkan progres setelah login ulang.
- Kuis mematuhi prasyarat, penilaian server, dan batas percobaan.
- Penyelesaian muncul pada laporan dan ekspor.
- Akun karyawan tidak dapat mengakses API admin/data karyawan lain.
- Materi yang dibatasi departemen tidak muncul bagi pengguna tanpa hak akses.
- Revisi materi tidak menghapus riwayat versi lama.
- Alur utama berfungsi pada ponsel tanpa halaman melebar.
- Unggahan, kegagalan validasi, dan penyimpanan menampilkan pesan yang jelas.

Pengujian otomatis proyek memverifikasi API, migrasi data lama, pre/post-test, unduhan, serta alur browser termasuk video/audio aktual. Integrasi layanan YouTube/Canva disimulasikan di tes browser agar deterministik; ketersediaan konten eksternal perlu verifikasi dengan izin embed dan jaringan yang sesuai. Uji penerimaan menggunakan materi dan kelompok karyawan sebenarnya tetap diperlukan.

## Tahapan selanjutnya

1. Evaluasi versi ini bersama HR/HSE; lengkapi brand dan materi resmi.
2. Jalankan pilot satu kelompok karyawan baru pada satu departemen.
3. Siapkan hosting HTTPS, backup/pemulihan, kapasitas penyimpanan, dan pemantauan.
4. Perbaiki alur berdasarkan hasil pilot dan sepakati target keberhasilan.
5. Kembangkan peran editor/supervisor, HRIS/SSO, notifikasi email/WhatsApp, jadwal kelas/presensi, sertifikat, pembelajaran ulang berkala, subtitle khusus, offline, dan analitik lanjutan sesuai prioritas.

Pembayaran, marketplace kelas publik, dan penjualan kelas tidak termasuk kebutuhan awal.

## Revisi materi dan evaluasi (v0.2)

- Video menyediakan pilihan unggahan, URL HTTPS langsung, atau link YouTube resmi.
- Setiap multimedia mempunyai kolom deskripsi/teks arahan yang ditampilkan di bawah materi.
- PDF dan dokumen Word menyediakan unduhan dengan otorisasi akses kelas.
- Presentasi Canva memakai URL view/embed resmi, bukan iframe HTML bebas atau link edit.
- Audio merupakan format materi tersendiri dengan pemutar, resume, dan pencatatan progres.
- Pre-test dan post-test dapat diaktifkan terpisah. Laporan memisahkan nilai awal, nilai akhir terbaik, dan perubahan nilai.
- Database lama mempertahankan kuis sebagai post-test dan seluruh hasil/progresnya. Revisi kelas yang telah berpeserta menggunakan duplikasi draft.

## Penyempurnaan editor artikel

Admin menulis dan memformat artikel menggunakan rich text, tanpa memasukkan kode HTML. Format yang tersedia mengikuti konten yang didukung server: paragraf, judul/subjudul, tebal, miring, garis bawah, daftar, kutipan, dan tautan HTTPS/email. Artikel lama ditampilkan sebagai konten terformat dan tidak ditulis ulang hanya karena editor dibuka.

Tombol Tambah materi tersedia di bagian atas serta setelah materi terakhir. Keduanya menambahkan materi di akhir daftar dan mengarahkan fokus ke judul materi baru, sehingga admin tidak perlu kembali ke atas halaman. Alur ini harus berfungsi pada ponsel dan mendukung navigasi keyboard.
