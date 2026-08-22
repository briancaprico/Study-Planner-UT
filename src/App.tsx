import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Subject, StudySession, WeeklyTarget, FilterOptions, TutonTaskItem } from './types';
import {
  loadSubjects,
  saveSubjects,
  loadSessions,
  saveSessions,
  loadWeeklyTarget,
  saveWeeklyTarget,
  loadTutonTasks,
  saveTutonTasks,
} from './utils/storage';
import {
  subscribeToSubjects,
  subscribeToSessions,
  subscribeToTarget,
  subscribeToTutonTasks,
  saveSubjectToCloud,
  deleteSubjectFromCloud,
  saveSessionToCloud,
  deleteSessionFromCloud,
  saveTargetToCloud,
  saveTutonTaskToCloud,
  deleteTutonTaskFromCloud,
  initializeCloudDataIfEmpty,
  overwriteAllCloudData,
} from './services/cloudSync';
import { playCompletionChime, requestNotificationPermission, sendBrowserNotification } from './utils/notifications';
import { calculateSessionStatus } from './utils/statusHelper';

import { Navbar, CloudStatus } from './components/Navbar';
import { OverviewCards } from './components/OverviewCards';
import { SubjectProgressRings } from './components/SubjectProgressRings';
import { ScheduleTable } from './components/ScheduleTable';
import { CalendarView } from './components/CalendarView';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TutonView } from './components/TutonView';
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
  const [tutonTasks, setTutonTasks] = useState<TutonTaskItem[]>(loadTutonTasks);

  // Cloud Sync Status state
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>({
    isConnected: false,
    isSyncing: true,
    lastSynced: null,
    error: null,
  });

  // Active view
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SUBJECTS' | 'CALENDAR' | 'ANALYTICS' | 'TUTON'>('DASHBOARD');

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

  // Real-time Cloud Sync Subscriptions via Firestore
  useEffect(() => {
    let unsubSubjects: (() => void) | undefined;
    let unsubSessions: (() => void) | undefined;
    let unsubTarget: (() => void) | undefined;
    let unsubTuton: (() => void) | undefined;

    // Seed Firestore if empty with local data
    initializeCloudDataIfEmpty(subjects, sessions, weeklyTarget).then(() => {
      setCloudStatus((prev) => ({ ...prev, isSyncing: false, isConnected: true }));
    });

    unsubSubjects = subscribeToSubjects(
      (cloudSubjects) => {
        if (cloudSubjects.length > 0) {
          setSubjects(cloudSubjects);
          saveSubjects(cloudSubjects);
        }
        setCloudStatus((prev) => ({ ...prev, isConnected: true, isSyncing: false, lastSynced: new Date() }));
      },
      (err) => setCloudStatus((prev) => ({ ...prev, isConnected: false, isSyncing: false, error: err.message }))
    );

    unsubSessions = subscribeToSessions(
      (cloudSessions) => {
        if (cloudSessions.length > 0) {
          setSessions(cloudSessions);
          saveSessions(cloudSessions);
        }
        setCloudStatus((prev) => ({ ...prev, isConnected: true, isSyncing: false, lastSynced: new Date() }));
      },
      (err) => setCloudStatus((prev) => ({ ...prev, isConnected: false, isSyncing: false, error: err.message }))
    );

    unsubTarget = subscribeToTarget(
      (cloudTarget) => {
        if (cloudTarget) {
          setWeeklyTarget(cloudTarget);
          saveWeeklyTarget(cloudTarget);
        }
        setCloudStatus((prev) => ({ ...prev, isConnected: true, isSyncing: false, lastSynced: new Date() }));
      },
      (err) => setCloudStatus((prev) => ({ ...prev, isConnected: false, isSyncing: false, error: err.message }))
    );

    unsubTuton = subscribeToTutonTasks(
      (cloudTutonTasks) => {
        if (cloudTutonTasks.length > 0) {
          setTutonTasks(cloudTutonTasks);
          saveTutonTasks(cloudTutonTasks);
        }
      },
      (err) => console.error('Tuton subscription error:', err)
    );

    return () => {
      if (unsubSubjects) unsubSubjects();
      if (unsubSessions) unsubSessions();
      if (unsubTarget) unsubTarget();
      if (unsubTuton) unsubTuton();
    };
  }, []);

  // Save to LocalStorage fallback on state changes
  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveWeeklyTarget(weeklyTarget);
  }, [weeklyTarget]);

  useEffect(() => {
    saveTutonTasks(tutonTasks);
  }, [tutonTasks]);

  // Tuton Specific Handlers (Completely separate from Dashboard sessions)
  const handleToggleTutonTaskCompleted = (taskId: string) => {
    const updated = tutonTasks.map((t) => {
      if (t.id === taskId) {
        const updatedItem = { ...t, isCompleted: !t.isCompleted };
        saveTutonTaskToCloud(updatedItem);
        return updatedItem;
      }
      return t;
    });
    setTutonTasks(updated);
    saveTutonTasks(updated);
  };

  const handleAddTutonTask = (newTask: TutonTaskItem) => {
    const updated = [...tutonTasks, newTask];
    setTutonTasks(updated);
    saveTutonTasks(updated);
    saveTutonTaskToCloud(newTask);
  };

  const handleDeleteTutonTask = (taskId: string) => {
    const updated = tutonTasks.filter((t) => t.id !== taskId);
    setTutonTasks(updated);
    saveTutonTasks(updated);
    deleteTutonTaskFromCloud(taskId);
  };

  const handleGenerate8TutonTasks = (subjectId: string, startDate: string) => {
    const selectedSubj = subjects.find(s => s.id === subjectId);
    const code = selectedSubj?.code || 'UT';
    const name = selectedSubj?.name || 'Mata Kuliah UT';

    // If startDate matches default official start '2026-09-14', use exact official dates
    const isOfficial2026Ganjil = startDate === '2026-09-14';

    const officialSchedule = [
      {
        sessionNumber: 1,
        title: `Sesi 1: Konfirmasi Kehadiran & Forum Diskusi 1 (${code})`,
        taskType: 'DISKUSI' as const,
        dueDate: isOfficial2026Ganjil ? '2026-09-20' : '',
        time: '23:59',
        offsetDays: 6,
        notes: 'Jadwal Forum Diskusi Sesi 1: 14 – 20 September 2026. Konfirmasi kehadiran & jawab diskusi.',
      },
      {
        sessionNumber: 2,
        title: `Sesi 2: Konfirmasi Kehadiran & Forum Diskusi 2 (${code})`,
        taskType: 'DISKUSI' as const,
        dueDate: isOfficial2026Ganjil ? '2026-09-27' : '',
        time: '23:59',
        offsetDays: 13,
        notes: 'Jadwal Forum Diskusi Sesi 2: 21 – 27 September 2026. Aktif menanggapi topik.',
      },
      {
        sessionNumber: 3,
        title: `Sesi 3: Forum Diskusi 3 & TUGAS TUTORIAL 1 (${code})`,
        taskType: 'TUGAS_1' as const,
        dueDate: isOfficial2026Ganjil ? '2026-10-12' : '',
        time: '15:00',
        offsetDays: 28,
        notes: 'Masa Pengerjaan Tugas 1: 28 Sept – 12 Okt 2026 (BATAS AKHIR: Pukul 15.00 WIB). Bobot 50%.',
      },
      {
        sessionNumber: 4,
        title: `Sesi 4: Konfirmasi Kehadiran & Forum Diskusi 4 (${code})`,
        taskType: 'DISKUSI' as const,
        dueDate: isOfficial2026Ganjil ? '2026-10-11' : '',
        time: '23:59',
        offsetDays: 27,
        notes: 'Jadwal Forum Diskusi Sesi 4: 05 – 11 Oktober 2026.',
      },
      {
        sessionNumber: 5,
        title: `Sesi 5: Forum Diskusi 5 & TUGAS TUTORIAL 2 (${code})`,
        taskType: 'TUGAS_2' as const,
        dueDate: isOfficial2026Ganjil ? '2026-10-26' : '',
        time: '15:00',
        offsetDays: 42,
        notes: 'Masa Pengerjaan Tugas 2: 12 Okt – 26 Okt 2026 (BATAS AKHIR: Pukul 15.00 WIB). Bobot 50%.',
      },
      {
        sessionNumber: 6,
        title: `Sesi 6: Konfirmasi Kehadiran & Forum Diskusi 6 (${code})`,
        taskType: 'DISKUSI' as const,
        dueDate: isOfficial2026Ganjil ? '2026-10-25' : '',
        time: '23:59',
        offsetDays: 41,
        notes: 'Jadwal Forum Diskusi Sesi 6: 19 – 25 Oktober 2026.',
      },
      {
        sessionNumber: 7,
        title: `Sesi 7: Forum Diskusi 7 & TUGAS TUTORIAL 3 (${code})`,
        taskType: 'TUGAS_3' as const,
        dueDate: isOfficial2026Ganjil ? '2026-11-09' : '',
        time: '15:00',
        offsetDays: 56,
        notes: 'Masa Pengerjaan Tugas 3: 26 Okt – 09 Nov 2026 (BATAS AKHIR: Pukul 15.00 WIB). Tugas terakhir.',
      },
      {
        sessionNumber: 8,
        title: `Sesi 8: Forum Diskusi 8, Refleksi & Persiapan Latihan Mandiri UAS (${code})`,
        taskType: 'UAS' as const,
        dueDate: isOfficial2026Ganjil ? '2026-11-08' : '',
        time: '23:59',
        offsetDays: 55,
        notes: 'Jadwal Forum Diskusi Sesi 8: 02 – 08 November 2026. Penutup Tuton & Latihan Mandiri UAS UT.',
      },
    ];

    const baseDate = new Date(startDate + 'T00:00:00');

    const generatedItems: TutonTaskItem[] = officialSchedule.map((item, idx) => {
      let dateStr = item.dueDate;
      if (!dateStr) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + item.offsetDays);
        dateStr = d.toISOString().split('T')[0];
      }

      const newTask: TutonTaskItem = {
        id: `tuton-gen-${Date.now()}-${idx}`,
        subjectId,
        subjectCode: code,
        subjectName: name,
        sessionNumber: item.sessionNumber,
        title: item.title,
        taskType: item.taskType,
        dueDate: dateStr,
        time: item.time,
        isCompleted: false,
        notes: item.notes,
      };

      saveTutonTaskToCloud(newTask);
      return newTask;
    });

    const updated = [...tutonTasks, ...generatedItems];
    setTutonTasks(updated);
    saveTutonTasks(updated);
  };

  // Update target handler
  const handleUpdateTarget = (target: WeeklyTarget) => {
    setWeeklyTarget(target);
    saveTargetToCloud(target);
  };

  // Periodic Reminder Checker
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

    const interval = setInterval(checkUpcomingReminders, 5 * 60 * 1000);
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
        const updatedSess = {
          ...s,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
        saveSessionToCloud(updatedSess);
        return updatedSess;
      }
      return s;
    });

    setSessions(updated);

    if (newlyCompleted) {
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
      const updatedSess = sessionData as StudySession;
      setSessions((prev) => prev.map((s) => (s.id === updatedSess.id ? updatedSess : s)));
      saveSessionToCloud(updatedSess);
    } else {
      const newSession: StudySession = {
        ...sessionData,
        id: `sess-${Date.now()}`,
        order: sessions.length + 1,
      };
      setSessions((prev) => [newSession, ...prev]);
      saveSessionToCloud(newSession);
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
    saveSessionToCloud(duplicated);
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus sesi belajar ini?')) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      deleteSessionFromCloud(id);
    }
  };

  // Subject Handlers
  const handleAddSubject = (newSubj: Omit<Subject, 'id'>) => {
    const created: Subject = {
      ...newSubj,
      id: `subj-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, created]);
    saveSubjectToCloud(created);
  };

  const handleUpdateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    saveSubjectToCloud(updated);
  };

  const handleDeleteSubject = (id: string) => {
    if (sessions.some((s) => s.subjectId === id)) {
      if (!window.confirm('Mata kuliah ini memiliki sesi terdaftar. Menghapusnya akan menghapus seluruh sesi terkait. Lanjutkan?')) {
        return;
      }
    }
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    deleteSubjectFromCloud(id);
    sessions.filter((s) => s.subjectId === id).forEach((s) => deleteSessionFromCloud(s.id));
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
    overwriteAllCloudData(newSubjs, newSess, newTarget);
  };

  // Handle tab change
  const handleTabChange = (tab: 'DASHBOARD' | 'SUBJECTS' | 'CALENDAR' | 'ANALYTICS' | 'TUTON') => {
    setActiveTab(tab);
    setIsSubjectModalOpen(false);
    setIsSessionModalOpen(false);
    setIsBackupModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        cloudStatus={cloudStatus}
        onOpenAddSession={() => {
          setEditingSession(null);
          setModalDefaultDate(undefined);
          setIsSessionModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Tab 1: Dashboard */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* Top Summary Stats & Target (Only shown on Dashboard) */}
            <OverviewCards
              sessions={sessions}
              subjects={subjects}
              weeklyTarget={weeklyTarget}
              onUpdateTarget={handleUpdateTarget}
            />

            {/* Main Schedule Table */}
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

        {/* Tab 2: Manage Subjects & Curriculum */}
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
              tutonTasks={tutonTasks}
              activePomodoroSessionId={activePomodoroSession?.id}
              onToggleComplete={handleToggleComplete}
              onToggleTutonTask={handleToggleTutonTaskCompleted}
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

        {/* Tab 5: Tuton (UT) Companion */}
        {activeTab === 'TUTON' && (
          <div>
            <TutonView
              subjects={subjects}
              tutonTasks={tutonTasks}
              onAddTutonTask={handleAddTutonTask}
              onToggleTutonTaskCompleted={handleToggleTutonTaskCompleted}
              onDeleteTutonTask={handleDeleteTutonTask}
              onGenerate8TutonTasks={handleGenerate8TutonTasks}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E1D5] dark:border-stone-800 bg-white dark:bg-stone-900 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-7 h-7 rounded-xl bg-black flex items-center justify-center p-1 border border-stone-800 shadow-2xs shrink-0">
              <img src="/favicon.svg" alt="Muda Verse" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-semibold text-stone-800 dark:text-stone-200">
                Muda Verse <span className="font-normal text-stone-500 dark:text-stone-400">— Study Planner & Tuton Tracker</span>
              </p>
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                © 2026 Muda Verse. Platform Manajemen & Tracking Progres Belajar Mahasiswa.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:text-[#0D7A57] dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
            >
              Export / Import Data
            </button>
            <span>•</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-[#0D7A57] dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
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
