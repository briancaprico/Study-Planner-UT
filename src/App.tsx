import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Subject, StudySession, WeeklyTarget, FilterOptions } from './types';
import {
  loadSubjects,
  saveSubjects,
  loadSessions,
  saveSessions,
  loadWeeklyTarget,
  saveWeeklyTarget,
} from './utils/storage';
import { playCompletionChime, requestNotificationPermission, sendBrowserNotification } from './utils/notifications';
import { calculateSessionStatus } from './utils/statusHelper';

import { Navbar } from './components/Navbar';
import { OverviewCards } from './components/OverviewCards';
import { SubjectProgressRings } from './components/SubjectProgressRings';
import { ScheduleTable } from './components/ScheduleTable';
import { CalendarView } from './components/CalendarView';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { SubjectManager } from './components/SubjectManager';
import { SessionModal } from './components/SessionModal';
import { ImportExportModal } from './components/ImportExportModal';
import { PomodoroOverlay } from './components/PomodoroOverlay';
import { QuickQuizModal } from './components/QuickQuizModal';

export default function App() {
  // State Initialization
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects);
  const [sessions, setSessions] = useState<StudySession[]>(loadSessions);
  const [weeklyTarget, setWeeklyTarget] = useState<WeeklyTarget>(loadWeeklyTarget);

  // Active view
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SUBJECTS' | 'CALENDAR' | 'ANALYTICS'>('DASHBOARD');

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('study_planner_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Filters state
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    subjectId: 'ALL',
    sessionType: 'ALL',
    status: 'ALL',
    dateRange: 'ALL',
  });

  // Notification status
  const [hasNotifPermission, setHasNotifPermission] = useState<boolean>(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  });

  // Modals state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [activePomodoroSession, setActivePomodoroSession] = useState<StudySession | null>(null);
  const [quickQuizSession, setQuickQuizSession] = useState<StudySession | null>(null);

  // Apply dark mode class to root html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('study_planner_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('study_planner_theme', 'light');
    }
  }, [isDarkMode]);

  // Save to LocalStorage on state changes
  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveWeeklyTarget(weeklyTarget);
  }, [weeklyTarget]);

  // Periodic Reminder Checker (checks if any session starts in the next 15 minutes)
  useEffect(() => {
    const checkUpcomingReminders = () => {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      sessions.forEach((s) => {
        if (s.isCompleted || s.date !== todayStr) return;

        try {
          const sessionStart = new Date(`${s.date}T${s.startTime}:00`);
          const diffMs = sessionStart.getTime() - now.getTime();
          const diffMins = diffMs / (1000 * 60);

          // If session starts in 0 to 15 mins
          if (diffMins > 0 && diffMins <= 15) {
            const subj = subjects.find((sub) => sub.id === s.subjectId);
            const title = `📚 Pengingat Belajar: ${s.title}`;
            const body = `Mata kuliah ${subj?.name || ''} akan dimulai pukul ${s.startTime}. Persiapkan materi Anda!`;
            sendBrowserNotification(title, body);
          }
        } catch (e) {
          console.warn('Reminder error', e);
        }
      });
    };

    const interval = setInterval(checkUpcomingReminders, 5 * 60 * 1000); // Every 5 mins
    return () => clearInterval(interval);
  }, [sessions, subjects]);

  // Toggle Completion of a Session
  const handleToggleComplete = (sessionId: string) => {
    let newlyCompleted = false;

    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        const nextState = !s.isCompleted;
        if (nextState) {
          newlyCompleted = true;
        }
        return {
          ...s,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return s;
    });

    setSessions(updated);

    if (newlyCompleted) {
      // Play celebratory chime & burst confetti!
      playCompletionChime();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }
  };

  // Add / Save Session
  const handleSaveSession = (sessionData: Omit<StudySession, 'id'> | StudySession) => {
    if ('id' in sessionData) {
      // Edit existing
      setSessions((prev) => prev.map((s) => (s.id === sessionData.id ? (sessionData as StudySession) : s)));
    } else {
      // Create new
      const newSession: StudySession = {
        ...sessionData,
        id: `sess-${Date.now()}`,
        order: sessions.length + 1,
      };
      setSessions((prev) => [newSession, ...prev]);
    }
  };

  // Duplicate Session
  const handleDuplicateSession = (session: StudySession) => {
    const duplicated: StudySession = {
      ...session,
      id: `sess-${Date.now()}`,
      title: `${session.title} (Salinan)`,
      isCompleted: false,
      completedAt: undefined,
    };
    setSessions((prev) => [duplicated, ...prev]);
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus sesi belajar ini?')) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Subject Handlers
  const handleAddSubject = (newSubj: Omit<Subject, 'id'>) => {
    const created: Subject = {
      ...newSubj,
      id: `subj-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, created]);
  };

  const handleUpdateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSubject = (id: string) => {
    if (sessions.some((s) => s.subjectId === id)) {
      if (!window.confirm('Mata kuliah ini memiliki sesi terdaftar. Menghapusnya akan menghapus seluruh sesi terkait. Lanjutkan?')) {
        return;
      }
    }
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setSessions((prev) => prev.filter((s) => s.subjectId !== id));
  };

  // Notification Handler
  const handleRequestNotification = async () => {
    const granted = await requestNotificationPermission();
    setHasNotifPermission(granted);
    if (granted) {
      sendBrowserNotification('Notifikasi Aktif!', 'Anda akan menerima pengingat jadwal belajar tepat waktu.');
    } else {
      alert('Izin notifikasi tidak diberikan atau diblokir browser.');
    }
  };

  // Restore Data Handler
  const handleRestoreData = (newSubjs: Subject[], newSess: StudySession[], newTarget: WeeklyTarget) => {
    setSubjects(newSubjs);
    setSessions(newSess);
    setWeeklyTarget(newTarget);
  };

  // Handle tab change with deferred requestAnimationFrame scroll and modal cleanup to prevent UI lock
  const handleTabChange = (tab: 'DASHBOARD' | 'SUBJECTS' | 'CALENDAR' | 'ANALYTICS') => {
    setActiveTab(tab);
    setIsSubjectModalOpen(false);
    setIsSessionModalOpen(false);
    setIsBackupModalOpen(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById('tab-content-area');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        hasNotificationPermission={hasNotifPermission}
        onRequestNotification={handleRequestNotification}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenAddSession={() => {
          setEditingSession(null);
          setModalDefaultDate(undefined);
          setIsSessionModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Summary Stats & Target */}
        <OverviewCards
          sessions={sessions}
          subjects={subjects}
          weeklyTarget={weeklyTarget}
          onUpdateTarget={setWeeklyTarget}
        />

        {/* Tab Content Area Container */}
        <div id="tab-content-area" className="scroll-mt-24 space-y-6">
          {/* Tab 1: Dashboard & Schedule */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              {/* Subject Progress Rings (Model 2 reference) */}
              <SubjectProgressRings
                subjects={subjects}
                sessions={sessions}
                selectedSubjectId={filters.subjectId}
                onSelectSubject={(subjId) => setFilters((prev) => ({ ...prev, subjectId: subjId }))}
                onOpenAddSubject={() => handleTabChange('SUBJECTS')}
              />

              {/* Main Schedule Table (Model 1 reference) */}
              <ScheduleTable
                sessions={sessions}
                subjects={subjects}
                filters={filters}
                activePomodoroSessionId={activePomodoroSession?.id}
                onFilterChange={setFilters}
                onToggleComplete={handleToggleComplete}
                onDeleteSession={handleDeleteSession}
                onDuplicateSession={handleDuplicateSession}
                onEditSession={(sess) => {
                  setEditingSession(sess);
                  setIsSessionModalOpen(true);
                }}
                onStartPomodoro={(sess) => setActivePomodoroSession(sess)}
                onOpenQuickQuiz={(sess) => setQuickQuizSession(sess)}
                onOpenAddModal={() => {
                  setEditingSession(null);
                  setModalDefaultDate(undefined);
                  setIsSessionModalOpen(true);
                }}
                onReorderSessions={setSessions}
              />
            </div>
          )}

          {/* Tab 2: Manage Subjects */}
          {activeTab === 'SUBJECTS' && (
            <div className="space-y-6">
              <SubjectProgressRings
                subjects={subjects}
                sessions={sessions}
                selectedSubjectId={filters.subjectId}
                onSelectSubject={(subjId) => setFilters((prev) => ({ ...prev, subjectId: subjId }))}
                onOpenAddSubject={() => setIsSubjectModalOpen(true)}
              />
              <SubjectManager
                isInline
                subjects={subjects}
                onAddSubject={handleAddSubject}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleDeleteSubject}
              />
            </div>
          )}

          {/* Tab 3: Calendar View */}
          {activeTab === 'CALENDAR' && (
            <div>
              <CalendarView
                sessions={sessions}
                subjects={subjects}
                activePomodoroSessionId={activePomodoroSession?.id}
                onToggleComplete={handleToggleComplete}
                onOpenAddModalForDate={(dateStr) => {
                  setEditingSession(null);
                  setModalDefaultDate(dateStr);
                  setIsSessionModalOpen(true);
                }}
                onEditSession={(sess) => {
                  setEditingSession(sess);
                  setIsSessionModalOpen(true);
                }}
                onStartPomodoro={(sess) => setActivePomodoroSession(sess)}
                onOpenQuickQuiz={(sess) => setQuickQuizSession(sess)}
              />
            </div>
          )}

          {/* Tab 4: Analytics & Charts */}
          {activeTab === 'ANALYTICS' && (
            <div>
              <AnalyticsCharts
                sessions={sessions}
                subjects={subjects}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 StudyPlanner — Aplikasi Manajemen & Tracking Progres Belajar Mahasiswa.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Export / Import Data
            </button>
            <span>•</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Ke Atas ↑
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SessionModal
        isOpen={isSessionModalOpen}
        editingSession={editingSession}
        defaultDate={modalDefaultDate}
        subjects={subjects}
        onSave={handleSaveSession}
        onClose={() => {
          setIsSessionModalOpen(false);
          setEditingSession(null);
        }}
      />

      {isSubjectModalOpen && (
        <SubjectManager
          subjects={subjects}
          onAddSubject={handleAddSubject}
          onUpdateSubject={handleUpdateSubject}
          onDeleteSubject={handleDeleteSubject}
          onClose={() => setIsSubjectModalOpen(false)}
        />
      )}

      <ImportExportModal
        isOpen={isBackupModalOpen}
        subjects={subjects}
        sessions={sessions}
        weeklyTarget={weeklyTarget}
        onRestoreData={handleRestoreData}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {activePomodoroSession && (
        <PomodoroOverlay
          session={activePomodoroSession}
          subject={subjects.find((s) => s.id === activePomodoroSession.subjectId)}
          onClose={() => setActivePomodoroSession(null)}
          onCompleteSession={(sessionId) => {
            handleToggleComplete(sessionId);
            setActivePomodoroSession(null);
          }}
          onOpenQuickQuiz={(sess) => setQuickQuizSession(sess)}
        />
      )}

      {quickQuizSession && (
        <QuickQuizModal
          session={quickQuizSession}
          subject={subjects.find((s) => s.id === quickQuizSession.subjectId)}
          onClose={() => setQuickQuizSession(null)}
        />
      )}
    </div>
  );
}
