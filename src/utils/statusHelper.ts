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
        bg: 'bg-[#E8F8F2] dark:bg-emerald-950/40',
        text: 'text-[#0D7A57] dark:text-emerald-300',
        border: 'border-[#A7E8CD] dark:border-emerald-800',
        dotBg: 'bg-[#10B981]',
      };
    case 'Sedang Berjalan':
      return {
        bg: 'bg-[#E8F8F2] dark:bg-emerald-950/60',
        text: 'text-[#0D7A57] dark:text-emerald-300',
        border: 'border-[#10B981] dark:border-emerald-600',
        dotBg: 'bg-[#10B981] animate-pulse',
      };
    case 'Terlambat':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        dotBg: 'bg-rose-500',
      };
    case 'Belum Dimulai':
    default:
      return {
        bg: 'bg-[#F4EFE6] dark:bg-stone-800',
        text: 'text-stone-700 dark:text-stone-300',
        border: 'border-[#E5DDD0] dark:border-stone-700',
        dotBg: 'bg-[#8D6A47]',
      };
  }
};

export const getSessionTypeBadge = (sessionType: string): { bg: string; text: string; iconName: string } => {
  switch (sessionType) {
    case 'Belajar Mendalam':
      return { bg: 'bg-[#E8F8F2] dark:bg-emerald-950/80', text: 'text-[#0D7A57] dark:text-emerald-300', iconName: 'Brain' };
    case 'Retrieval Practice':
      return { bg: 'bg-[#FDF6EC] dark:bg-amber-950/80', text: 'text-[#8D6A47] dark:text-amber-300', iconName: 'RotateCcw' };
    case 'Review Ringan':
      return { bg: 'bg-[#F4EFE6] dark:bg-stone-800', text: 'text-stone-800 dark:text-stone-300', iconName: 'Eye' };
    case 'Latihan Soal':
      return { bg: 'bg-[#FBF4EB] dark:bg-amber-950/80', text: 'text-[#A77B50] dark:text-amber-300', iconName: 'PenTool' };
    case 'Flashcard':
      return { bg: 'bg-amber-100/70 dark:bg-amber-950/80', text: 'text-amber-900 dark:text-amber-300', iconName: 'Layers' };
    case 'Mind Mapping':
      return { bg: 'bg-teal-50 dark:bg-teal-950/80', text: 'text-teal-800 dark:text-teal-300', iconName: 'GitBranch' };
    case 'Simulasi Ujian':
      return { bg: 'bg-orange-100/70 dark:bg-orange-950/80', text: 'text-orange-900 dark:text-orange-300', iconName: 'GraduationCap' };
    default:
      return { bg: 'bg-[#F4EFE6] dark:bg-stone-800', text: 'text-stone-800 dark:text-stone-300', iconName: 'BookOpen' };
  }
};
