import { StudySession } from '../types';

export interface WeekRange {
  startOfWeek: Date;
  endOfWeek: Date;
  label: string;
}

export const SEMESTER_WEEKS = [
  { label: 'Minggu 1', start: '2026-08-02', end: '2026-08-08' },
  { label: 'Minggu 2', start: '2026-08-09', end: '2026-08-15' },
  { label: 'Minggu 3', start: '2026-08-16', end: '2026-08-22' },
  { label: 'Minggu 4', start: '2026-08-23', end: '2026-08-29' },
  { label: 'Minggu 5', start: '2026-08-30', end: '2026-09-05' },
  { label: 'Minggu 6', start: '2026-09-06', end: '2026-09-13' },
];

export function getWeekRange(dateObj: Date = new Date()): WeekRange {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const foundSemWeek = SEMESTER_WEEKS.find(
    (w) => dateStr >= w.start && dateStr <= w.end
  );

  if (foundSemWeek) {
    const startOfWeek = new Date(foundSemWeek.start + 'T00:00:00');
    const endOfWeek = new Date(foundSemWeek.end + 'T23:59:59.999');
    return { startOfWeek, endOfWeek, label: foundSemWeek.label };
  }

  // Standard Monday-Sunday calendar week
  const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
  const startOfWeek = new Date(dateObj);
  startOfWeek.setDate(dateObj.getDate() - (dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek, label: 'Minggu Ini' };
}

export function isDateInWeek(dateStr?: string, weekRange?: WeekRange): boolean {
  if (!dateStr) return false;
  const range = weekRange || getWeekRange();
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return d >= range.startOfWeek && d <= range.endOfWeek;
}

export function sortSessionsByDate(sessionsList: StudySession[]): StudySession[] {
  return [...sessionsList].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    return (a.order || 0) - (b.order || 0);
  });
}

