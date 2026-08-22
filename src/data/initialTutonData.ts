import { TutonTaskItem } from '../types';

export const getInitialTutonTasks = (): TutonTaskItem[] => {
  return [
    {
      id: 'tuton-1',
      subjectId: 'sub-1',
      subjectCode: 'EKMA4116',
      subjectName: 'Manajemen Risiko',
      sessionNumber: 1,
      title: 'Sesi 1: Konfirmasi Kehadiran & Diskusi 1 (Konsep Risiko)',
      taskType: 'DISKUSI',
      dueDate: '2026-09-20',
      time: '23:59',
      isCompleted: true,
      score: 85,
      notes: 'Jadwal Diskusi: 14 – 20 September 2026. Konfirmasi kehadiran & jawab diskusi.'
    },
    {
      id: 'tuton-2',
      subjectId: 'sub-1',
      subjectCode: 'EKMA4116',
      subjectName: 'Manajemen Risiko',
      sessionNumber: 2,
      title: 'Sesi 2: Konfirmasi Kehadiran & Diskusi 2 (Pengukuran Risiko)',
      taskType: 'DISKUSI',
      dueDate: '2026-09-27',
      time: '23:59',
      isCompleted: true,
      score: 90,
      notes: 'Jadwal Diskusi: 21 – 27 September 2026. Analisis probabilitas risiko.'
    },
    {
      id: 'tuton-3',
      subjectId: 'sub-1',
      subjectCode: 'EKMA4116',
      subjectName: 'Manajemen Risiko',
      sessionNumber: 3,
      title: 'Sesi 3: TUGAS TUTORIAL 1 (Analisis Kasus Risiko PT ABC)',
      taskType: 'TUGAS_1',
      dueDate: '2026-10-12',
      time: '15:00',
      isCompleted: false,
      score: 88,
      notes: 'Masa Pengerjaan: 28 Sept – 12 Okt 2026 (Batas akhir 15.00 WIB). Format PDF/Word.'
    },
    {
      id: 'tuton-4',
      subjectId: 'sub-1',
      subjectCode: 'EKMA4116',
      subjectName: 'Manajemen Risiko',
      sessionNumber: 4,
      title: 'Sesi 4: Konfirmasi Kehadiran & Diskusi 4 (Pengendalian Risiko)',
      taskType: 'DISKUSI',
      dueDate: '2026-10-11',
      time: '23:59',
      isCompleted: false,
      notes: 'Jadwal Diskusi: 05 – 11 Oktober 2026. Forum diskusi mitigasi operasional.'
    },
    {
      id: 'tuton-5',
      subjectId: 'sub-1',
      subjectCode: 'EKMA4116',
      subjectName: 'Manajemen Risiko',
      sessionNumber: 5,
      title: 'Sesi 5: TUGAS TUTORIAL 2 (Perhitungan Value at Risk / VaR)',
      taskType: 'TUGAS_2',
      dueDate: '2026-10-26',
      time: '15:00',
      isCompleted: false,
      notes: 'Masa Pengerjaan: 12 Okt – 26 Okt 2026 (Batas akhir 15.00 WIB). Bobot 50% nilai Tuton.'
    },
    {
      id: 'tuton-6',
      subjectId: 'sub-1',
      subjectCode: 'EKMA4116',
      subjectName: 'Manajemen Risiko',
      sessionNumber: 6,
      title: 'Sesi 6: Konfirmasi Kehadiran & Diskusi 6 (Diversifikasi Portofolio)',
      taskType: 'DISKUSI',
      dueDate: '2026-10-25',
      time: '23:59',
      isCompleted: false,
      notes: 'Jadwal Diskusi: 19 – 25 Oktober 2026. Aktif diskusi sebelum deadline.'
    },
    {
      id: 'tuton-7',
      subjectId: 'sub-1',
      subjectCode: 'EKMA4116',
      subjectName: 'Manajemen Risiko',
      sessionNumber: 7,
      title: 'Sesi 7: TUGAS TUTORIAL 3 (Audit & Evaluasi Manajemen Risiko)',
      taskType: 'TUGAS_3',
      dueDate: '2026-11-09',
      time: '15:00',
      isCompleted: false,
      notes: 'Masa Pengerjaan: 26 Okt – 09 Nov 2026 (Batas akhir 15.00 WIB). Tugas terakhir Tuton UT.'
    },
    {
      id: 'tuton-8',
      subjectId: 'sub-1',
      subjectCode: 'EKMA4116',
      subjectName: 'Manajemen Risiko',
      sessionNumber: 8,
      title: 'Sesi 8: Refleksi Akhir, Diskusi 8 & Persiapan Latihan Mandiri UAS',
      taskType: 'UAS',
      dueDate: '2026-11-08',
      time: '23:59',
      isCompleted: false,
      notes: 'Jadwal Diskusi: 02 – 08 November 2026. Penutup Tuton & Latihan Mandiri UAS.'
    }
  ];
};
