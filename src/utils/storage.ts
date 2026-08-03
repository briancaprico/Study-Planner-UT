import { Subject, StudySession, WeeklyTarget } from '../types';
import { INITIAL_SUBJECTS, getInitialSessions } from '../data/initialData';

const KEYS = {
  SUBJECTS: 'study_planner_subjects_v7',
  SESSIONS: 'study_planner_sessions_v7',
  TARGET: 'study_planner_target_v3',
  THEME: 'study_planner_theme_v1',
};

export const loadSubjects = (): Subject[] => {
  try {
    const raw = localStorage.getItem(KEYS.SUBJECTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse subjects from localStorage', e);
  }
  return INITIAL_SUBJECTS;
};

export const saveSubjects = (subjects: Subject[]): void => {
  try {
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects to localStorage', e);
  }
};

export const loadSessions = (): StudySession[] => {
  try {
    const raw = localStorage.getItem(KEYS.SESSIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse sessions from localStorage', e);
  }
  return getInitialSessions();
};

export const saveSessions = (sessions: StudySession[]): void => {
  try {
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage', e);
  }
};

export const loadWeeklyTarget = (): WeeklyTarget => {
  try {
    const raw = localStorage.getItem(KEYS.TARGET);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse target from localStorage', e);
  }
  return {
    targetHours: 15,
    streakDays: 4,
  };
};

export const saveWeeklyTarget = (target: WeeklyTarget): void => {
  try {
    localStorage.setItem(KEYS.TARGET, JSON.stringify(target));
  } catch (e) {
    console.error('Failed to save target to localStorage', e);
  }
};

export interface ExportData {
  version: string;
  exportedAt: string;
  subjects: Subject[];
  sessions: StudySession[];
  weeklyTarget: WeeklyTarget;
}

export const exportAppData = (subjects: Subject[], sessions: StudySession[], target: WeeklyTarget): string => {
  const data: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    subjects,
    sessions,
    weeklyTarget: target,
  };
  return JSON.stringify(data, null, 2);
};

export const importAppData = (jsonString: string): { subjects: Subject[]; sessions: StudySession[]; target: WeeklyTarget } => {
  const parsed = JSON.parse(jsonString);
  if (!parsed.subjects || !Array.isArray(parsed.subjects) || !parsed.sessions || !Array.isArray(parsed.sessions)) {
    throw new Error('Format JSON tidak valid. Pastikan data memiliki array "subjects" dan "sessions".');
  }
  const subjects = parsed.subjects;
  const sessions = parsed.sessions;
  const target = parsed.weeklyTarget || { targetHours: 15, streakDays: 1 };

  saveSubjects(subjects);
  saveSessions(sessions);
  saveWeeklyTarget(target);

  return { subjects, sessions, target };
};

export const resetToDefaultData = (): { subjects: Subject[]; sessions: StudySession[]; target: WeeklyTarget } => {
  const subjects = INITIAL_SUBJECTS;
  const sessions = getInitialSessions();
  const target = { targetHours: 15, streakDays: 4 };

  saveSubjects(subjects);
  saveSessions(sessions);
  saveWeeklyTarget(target);

  return { subjects, sessions, target };
};
