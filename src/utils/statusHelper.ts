import { SessionStatus, StudySession } from '../types';

export const calculateSessionStatus = (
  session: StudySession,
  now = new Date(),
  activePomodoroSessionId?: string | null
): SessionStatus => {
  if (session.isCompleted) {
    return 'Selesai';
  }

  if (activePomodoroSessionId && activePomodoroSessionId === session.id) {
    return 'Sedang Berjalan';
  }

  try {
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const [startH, startM] = session.startTime.split(':').map(Number);
    const [endH, endM] = session.endTime.split(':').map(Number);

    const sessionStartDate = new Date(`${session.date}T${session.startTime}:00`);
    const sessionEndDate = new Date(`${session.date}T${session.endTime}:00`);

    if (isNaN(sessionStartDate.getTime()) || isNaN(sessionEndDate.getTime())) {
      return 'Belum Dimulai';
    }

    if (now > sessionEndDate) {
      return 'Terlambat';
    }

    if (now >= sessionStartDate && now <= sessionEndDate) {
      return 'Sedang Berjalan';
    }

    return 'Belum Dimulai';
  } catch {
    return 'Belum Dimulai';
  }
};

export const getStatusBadgeStyle = (status: SessionStatus): { bg: string; text: string; border: string; dotBg: string } => {
  switch (status) {
    case 'Selesai':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        dotBg: 'bg-emerald-500',
      };
    case 'Sedang Berjalan':
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        dotBg: 'bg-blue-500 animate-pulse',
      };
    case 'Terlambat':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        dotBg: 'bg-rose-500',
      };
    case 'Belum Dimulai':
    default:
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-500/20',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        dotBg: 'bg-slate-400',
      };
  }
};

export const getSessionTypeBadge = (sessionType: string): { bg: string; text: string; iconName: string } => {
  switch (sessionType) {
    case 'Belajar Mendalam':
      return { bg: 'bg-indigo-100 dark:bg-indigo-950/80', text: 'text-indigo-800 dark:text-indigo-300', iconName: 'Brain' };
    case 'Retrieval Practice':
      return { bg: 'bg-purple-100 dark:bg-purple-950/80', text: 'text-purple-800 dark:text-purple-300', iconName: 'RotateCcw' };
    case 'Review Ringan':
      return { bg: 'bg-cyan-100 dark:bg-cyan-950/80', text: 'text-cyan-800 dark:text-cyan-300', iconName: 'Eye' };
    case 'Latihan Soal':
      return { bg: 'bg-amber-100 dark:bg-amber-950/80', text: 'text-amber-800 dark:text-amber-300', iconName: 'PenTool' };
    case 'Flashcard':
      return { bg: 'bg-rose-100 dark:bg-rose-950/80', text: 'text-rose-800 dark:text-rose-300', iconName: 'Layers' };
    case 'Mind Mapping':
      return { bg: 'bg-emerald-100 dark:bg-emerald-950/80', text: 'text-emerald-800 dark:text-emerald-300', iconName: 'GitBranch' };
    case 'Simulasi Ujian':
      return { bg: 'bg-red-100 dark:bg-red-950/80', text: 'text-red-800 dark:text-red-300', iconName: 'GraduationCap' };
    default:
      return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-300', iconName: 'BookOpen' };
  }
};
