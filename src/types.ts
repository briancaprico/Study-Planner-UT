export type SessionType = 
  | 'Belajar Mendalam'
  | 'Retrieval Practice'
  | 'Review Ringan'
  | 'Latihan Soal'
  | 'Flashcard'
  | 'Mind Mapping'
  | 'Simulasi Ujian';

export type SessionStatus = 
  | 'Belum Dimulai'
  | 'Sedang Berjalan'
  | 'Selesai'
  | 'Terlambat';

export interface Subject {
  id: string;
  code: string;
  name: string;
  color: string; // Hex color e.g., #3B82F6
  targetHours: number;
  lecturer?: string;
  sks?: number;
  icon?: string;
  topics?: string[];
}

export interface StudySession {
  id: string;
  subjectId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number; // Calculated or manual
  sessionType: SessionType;
  isCompleted: boolean;
  notes?: string;
  completedAt?: string; // ISO date string
  order?: number;
}

export interface WeeklyTarget {
  targetHours: number;
  streakDays: number;
  lastStudiedDate?: string;
}

export interface FilterOptions {
  searchQuery: string;
  subjectId: string; // 'ALL' or specific ID
  sessionType: string; // 'ALL' or specific type
  status: string; // 'ALL' or specific status
  dateRange: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Sen"
  hours: number;
  completedCount: number;
}
