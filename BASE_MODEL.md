# Study Planner Base Model (v1.0 - Stable Release)

Dokumen ini berfungsi sebagai acuan **Base Model** resmi untuk aplikasi **StudyPlanner & Progress Tracker**. Semua fitur mendasar, skema data, koneksi Firestore realtime, serta pengurutan kronologis jadwal telah teruji dan berjalan normal pada versi ini.

---

## 📌 Rangkuman Sistem Base Model

### 1. **Data & Persistence**
* **Local Storage**: Fallback penyimpanan otomatis menggunakan `study_planner_subjects_v7`, `study_planner_sessions_v7`, dan `study_planner_target_v7`.
* **Firebase Cloud Sync**: Terhubung secara *realtime* ke Firestore database `ai-studio-studyplannerprog-25387589-18dc-4eea-814e-11e8f67a33ee`. Setiap perubahan (tambah/edit/hapus/ceklis) pada sesi dan mata kuliah langsung tersinkronisasi antar perangkat.
* **Pengurutan Jadwal Kronologis**: Seluruh sesi belajar diurutkan secara otomatis dari awal bulan (Agustus) hingga pertengahan September berdasarkan tanggal, jam mulai, dan urutan item (`date -> startTime -> order`).

### 2. **Fitur Inti yang Sudah Stabil**
1. **Dashboard & Metric Overview**:
   * Total jam belajar minggu ini vs Target Mingguan.
   * Ringkasan status sesi (Selesai, Terjadwal, Terlewat, Hari Ini).
   * Streak counter hari belajar berturut-turut.
2. **Jadwal Belajar (Schedule Table)**:
   * Filter berdasarkan Pencarian, Mata Kuliah, Jenis Sesi (Tatap Muka, Mandiri, Quiz, Ujian, Tugas), Status, dan Rentang Waktu (Hari Ini, Minggu Ini, Bulan Ini).
   * Fitur Ceklis/Selesai dengan efek suara dan konfeti perayaan.
   * Fitur Duplikasi, Edit, Hapus, dan Tambah Sesi.
3. **Manajemen Mata Kuliah (Subject Manager)**:
   * Pengaturan kode, nama, warna, jam target, Dosen/Tutor, SKS, dan daftar topik.
4. **Visualisasi Progress Ring & Analytics**:
   * Progress ring per mata kuliah.
   * Grafik statistik jam belajar mingguan dan distribusi jenis sesi (Recharts).
5. **Kalender Interaktif (Calendar View)**:
   * Tampilan bulanan dengan penanda sesi belajar per tanggal.
6. **Ekspor / Impor & Backup Data**:
   * Fitur ekspor/impor file JSON untuk backup manual atau pemulihan data.

---

## 🎓 Rangkuman Studi Tuton (Tutorial Online) Universitas Terbuka (UT)

Berdasarkan hasil analisis sistem **Tuton Universitas Terbuka (UT)**, berikut adalah struktur standar pembelajaran yang dapat dijadikan panduan pengembangan jadwal/fitur Tuton mendatang:

1. **Struktur Sesi Tuton (8 Sesi Utama)**:
   * **Sesi 1 & 2**: Pengenalan, Inisiasi Materi, & Forum Diskusi Sesi 1 & 2.
   * **Sesi 3**: Inisiasi + **Tugas 1** (Rentang pengerjaan ~2 minggu).
   * **Sesi 4**: Inisiasi Materi & Forum Diskusi Sesi 4.
   * **Sesi 5**: Inisiasi + **Tugas 2** (Rentang pengerjaan ~2 minggu).
   * **Sesi 6**: Inisiasi Materi & Forum Diskusi Sesi 6.
   * **Sesi 7**: Inisiasi + **Tugas 3** (Rentang pengerjaan ~2 minggu).
   * **Sesi 8**: Inisiasi Materi, Diskusi Penutup, & Persiapan UAS.

2. **Skema Penilaian Tuton UT**:
   * **Kehadiran / Partisipasi**: 20%
   * **Aktif Diskusi (Sesi 1–8)**: 30%
   * **Tugas Tutorial (Tugas 1, 2, 3)**: 50%
   * *Kontribusi ke Nilai Akhir Mata Kuliah*: Maksimal **30%** (berlaku jika nilai UAS $\ge 30\%$).

---

## 🔄 Prosedur Pemulihan ke Base Model
Jika pengembangan fitur selanjutnya mengalami masalah, versi aplikasi saat ini telah di-snapshot pada **Study Planner Base Model v1.0** dan terdaftar di Firestore database project.
