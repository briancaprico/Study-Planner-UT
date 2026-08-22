import React, { useState } from 'react';
import { StudySession, Subject, TutonTaskItem } from '../types';
import { calculateSessionStatus, getStatusBadgeStyle } from '../utils/statusHelper';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Check, Clock, BookOpen, X, Timer, Sparkles, GraduationCap, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  sessions: StudySession[];
  subjects: Subject[];
  tutonTasks?: TutonTaskItem[];
  activePomodoroSessionId?: string | null;
  onToggleComplete: (id: string) => void;
  onToggleTutonTask?: (id: string) => void;
  onOpenAddModalForDate: (dateStr: string) => void;
  onEditSession: (session: StudySession) => void;
  onStartPomodoro?: (session: StudySession) => void;
  onOpenQuickQuiz?: (session: StudySession) => void;
}

export const CalendarView: React.FC<Props> = ({
  sessions,
  subjects,
  tutonTasks = [],
  activePomodoroSessionId,
  onToggleComplete,
  onToggleTutonTask,
  onOpenAddModalForDate,
  onEditSession,
  onStartPomodoro,
  onOpenQuickQuiz,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  const [calendarMode, setCalendarMode] = useState<'ALL' | 'STUDY' | 'TUTON'>('ALL');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar matrix calculations
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week: 0 = Sunday, convert to Monday = 0
  let startDay = firstDayOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = lastDayOfMonth.getDate();

  const daysArray: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(new Date(year, month, d));
  }

  const monthNamesStr = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Filtered items for selected date
  const selectedDateSessions = selectedDayStr
    ? (calendarMode === 'TUTON' ? [] : sessions.filter((s) => s.date === selectedDayStr))
    : [];

  const selectedDateTutonTasks = selectedDayStr
    ? (calendarMode === 'STUDY' ? [] : tutonTasks.filter((t) => t.dueDate === selectedDayStr))
    : [];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E8E1D5] dark:border-stone-800 shadow-sm p-5 transition-colors">
      {/* Calendar Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D7A57]/10 dark:bg-emerald-500/10 flex items-center justify-center text-[#0D7A57] dark:text-emerald-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Kalender Belajar & Tuton
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {monthNamesStr[month]} {year}
            </p>
          </div>
        </div>

        {/* Center: Filter Switcher (Semua / Jadwal Belajar / Kalender Tuton) */}
        <div className="inline-flex p-1 bg-[#FAF7F2] dark:bg-stone-800 rounded-xl border border-[#E8E1D5] dark:border-stone-700 text-xs font-semibold">
          <button
            onClick={() => setCalendarMode('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              calendarMode === 'ALL'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Semua ({sessions.length + tutonTasks.length})
          </button>
          <button
            onClick={() => setCalendarMode('STUDY')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              calendarMode === 'STUDY'
                ? 'bg-[#0D7A57] text-white shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Jadwal Belajar ({sessions.length})
          </button>
          <button
            onClick={() => setCalendarMode('TUTON')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              calendarMode === 'TUTON'
                ? 'bg-[#8D6A47] text-white shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Kalender Tuton ({tutonTasks.length})
          </button>
        </div>

        {/* Right: Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#FAF7F2] dark:bg-stone-800 hover:bg-[#F3EFEA] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors border border-[#E8E1D5] dark:border-stone-700 cursor-pointer"
          >
            Hari Ini
          </button>
          <div className="flex items-center bg-[#FAF7F2] dark:bg-stone-800 rounded-xl p-1 border border-[#E8E1D5] dark:border-stone-700">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-stone-500 dark:text-stone-400 mb-2">
        <div>Sen</div>
        <div>Sel</div>
        <div>Rab</div>
        <div>Kam</div>
        <div>Jum</div>
        <div>Sab</div>
        <div>Ming</div>
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysArray.map((dateObj, idx) => {
          if (!dateObj) {
            return <div key={`empty-${idx}`} className="h-24 sm:h-28 rounded-xl bg-[#FAF7F2]/40 dark:bg-stone-950/20" />;
          }

          const dayStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          const isToday = dayStr === todayStr;
          
          const dayStudySessions = calendarMode === 'TUTON' ? [] : sessions.filter((s) => s.date === dayStr);
          const dayTutonTasks = calendarMode === 'STUDY' ? [] : tutonTasks.filter((t) => t.dueDate === dayStr);
          const totalEvents = dayStudySessions.length + dayTutonTasks.length;
          
          const isSelected = selectedDayStr === dayStr;

          return (
            <div
              key={dayStr}
              onClick={() => setSelectedDayStr(dayStr)}
              className={`h-24 sm:h-28 p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none overflow-hidden ${
                isToday
                  ? 'bg-[#E8F8F2]/60 dark:bg-emerald-950/30 border-[#10B981] ring-2 ring-emerald-500/20'
                  : isSelected
                  ? 'bg-[#F5ECE1] dark:bg-stone-800 border-[#8D6A47] dark:border-stone-600'
                  : 'bg-[#FAF7F2]/60 dark:bg-stone-800/40 border-[#E8E1D5] dark:border-stone-800/80 hover:border-[#DFD5C4] dark:hover:border-stone-700 hover:bg-white dark:hover:bg-stone-800'
              }`}
            >
              {/* Top date bar */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center ${
                    isToday
                      ? 'bg-[#0D7A57] text-white'
                      : 'text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {dateObj.getDate()}
                </span>
                {totalEvents > 0 && (
                  <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 bg-[#E8E1D5]/60 dark:bg-stone-700/60 px-1.5 py-0.5 rounded-md">
                    {totalEvents} item
                  </span>
                )}
              </div>

              {/* Items Badges in Cell */}
              <div className="flex-1 my-1 overflow-y-auto space-y-1 scrollbar-none">
                {/* Study Sessions */}
                {dayStudySessions.slice(0, 2).map((sess) => {
                  const subj = subjects.find((s) => s.id === sess.subjectId);
                  return (
                    <div
                      key={sess.id}
                      className={`text-[10px] p-1 rounded font-medium truncate flex items-center gap-1 ${
                        sess.isCompleted
                          ? 'bg-[#E8F8F2] dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 line-through'
                          : 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 shadow-2xs'
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: subj?.color || '#0D7A57' }}
                      />
                      <span className="truncate">{sess.title}</span>
                    </div>
                  );
                })}

                {/* Tuton Deadlines */}
                {dayTutonTasks.slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    className={`text-[10px] p-1 rounded font-medium truncate flex items-center gap-1 ${
                      t.isCompleted
                        ? 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 line-through'
                        : 'bg-amber-50 dark:bg-stone-800 text-[#8D6A47] dark:text-amber-200 border border-amber-200/60 dark:border-amber-900/40 shadow-2xs'
                    }`}
                  >
                    <GraduationCap className="w-2.5 h-2.5 shrink-0 text-[#8D6A47] dark:text-amber-400" />
                    <span className="truncate font-semibold">{t.subjectCode || 'Tuton'}: {t.title}</span>
                  </div>
                ))}

                {totalEvents > 3 && (
                  <div className="text-[10px] text-stone-400 font-medium px-1">
                    +{totalEvents - 3} lagi...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Inspector Modal */}
      {selectedDayStr && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-5 border border-[#E8E1D5] dark:border-stone-800 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-stone-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#0D7A57] dark:text-emerald-400" />
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100">
                    Agenda: {selectedDayStr}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {selectedDateSessions.length} sesi belajar • {selectedDateTutonTasks.length} tugas/diskusi tuton
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayStr(null)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 max-h-[60vh] overflow-y-auto space-y-3">
              {selectedDateSessions.length === 0 && selectedDateTutonTasks.length === 0 ? (
                <div className="py-8 text-center text-stone-400">
                  <p className="text-sm">Tidak ada agenda pada tanggal ini.</p>
                </div>
              ) : (
                <>
                  {/* Tuton Section if any */}
                  {selectedDateTutonTasks.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <div className="text-xs font-bold text-[#8D6A47] dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Deadline Tuton UT ({selectedDateTutonTasks.length})</span>
                      </div>
                      {selectedDateTutonTasks.map((t) => (
                        <div
                          key={t.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                            t.isCompleted
                              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 opacity-80'
                              : 'bg-[#FDF6EC] dark:bg-stone-800/80 border-[#E8D6BF] dark:border-amber-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => onToggleTutonTask && onToggleTutonTask(t.id)}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                t.isCompleted
                                  ? 'bg-[#8D6A47] border-[#8D6A47] text-white'
                                  : 'border-[#E8D6BF] dark:border-stone-600 bg-white dark:bg-stone-800'
                              }`}
                            >
                              {t.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#8D6A47] dark:text-amber-300">
                                  {t.subjectCode} - {t.subjectName}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 dark:bg-amber-900/60 text-[#8D6A47] dark:text-amber-200">
                                  {t.taskType}
                                </span>
                              </div>
                              <h4 className={`text-sm font-semibold text-stone-900 dark:text-stone-100 mt-0.5 ${t.isCompleted ? 'line-through text-stone-400' : ''}`}>
                                {t.title}
                              </h4>
                              {t.time && (
                                <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-[#8D6A47]" /> Batas: {t.time} WIB
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Study Sessions Section */}
                  {selectedDateSessions.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#0D7A57] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Sesi Belajar Harian ({selectedDateSessions.length})</span>
                      </div>
                      {selectedDateSessions.map((session) => {
                        const subj = subjects.find((s) => s.id === session.subjectId);
                        const currentStatus = calculateSessionStatus(session, now, activePomodoroSessionId);
                        const statusStyle = getStatusBadgeStyle(currentStatus);
                        const isPomodoroActive = activePomodoroSessionId === session.id;

                        return (
                          <div
                            key={session.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                              isPomodoroActive
                                ? 'bg-[#E8F8F2] dark:bg-emerald-950/50 border-[#10B981]'
                                : 'border-[#E8E1D5] dark:border-stone-800 bg-[#FAF7F2]/50 dark:bg-stone-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => onToggleComplete(session.id)}
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                  session.isCompleted
                                    ? 'bg-[#10B981] border-[#10B981] text-white'
                                    : 'border-[#E8E1D5] dark:border-stone-600 bg-white dark:bg-stone-800'
                                }`}
                              >
                                {session.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                              </button>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: subj?.color || '#0D7A57' }}
                                  />
                                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                    {subj?.code}
                                  </span>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                                  >
                                    {currentStatus}
                                  </span>
                                </div>
                                <h4
                                  className={`text-sm font-semibold text-stone-900 dark:text-stone-100 mt-0.5 ${
                                    session.isCompleted ? 'line-through text-stone-400' : ''
                                  }`}
                                >
                                  {session.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
                                  <span className="flex items-center gap-1 font-mono">
                                    <Clock className="w-3 h-3" /> {session.startTime} - {session.endTime}
                                  </span>
                                  <span>•</span>
                                  <span>{session.sessionType}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {onStartPomodoro && (
                                <button
                                  onClick={() => {
                                    onStartPomodoro(session);
                                    setSelectedDayStr(null);
                                  }}
                                  className="p-1.5 rounded-lg bg-[#0D7A57] text-white hover:bg-[#0A5D42] text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                  title="Mulai Sesi Pomodoro Focus"
                                >
                                  <Timer className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Fokus</span>
                                </button>
                              )}
                              {onOpenQuickQuiz && (
                                <button
                                  onClick={() => {
                                    onOpenQuickQuiz(session);
                                    setSelectedDayStr(null);
                                  }}
                                  className="p-1.5 rounded-lg bg-[#FDF6EC] dark:bg-amber-950/60 text-[#8D6A47] dark:text-amber-400 hover:bg-[#F5ECE1] dark:hover:bg-amber-900/80 border border-[#E8D6BF] dark:border-amber-800/60 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Generasi Kuis Cepat AI"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-[#8D6A47] animate-pulse" />
                                  <span className="hidden sm:inline">Kuis AI</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  onEditSession(session);
                                  setSelectedDayStr(null);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-[#0D7A57] dark:text-emerald-400 hover:bg-[#E8F8F2] dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E1D5] dark:border-stone-800 flex items-center justify-between">
              <button
                onClick={() => {
                  onOpenAddModalForDate(selectedDayStr);
                  setSelectedDayStr(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0D7A57] hover:bg-[#0A5D42] text-white rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                + Tambah Sesi di Tanggal Ini
              </button>
              <button
                onClick={() => setSelectedDayStr(null)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-[#FAF7F2] dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

