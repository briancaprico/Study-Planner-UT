import React, { useState } from 'react';
import { StudySession, Subject } from '../types';
import { calculateSessionStatus, getStatusBadgeStyle } from '../utils/statusHelper';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Check, Clock, BookOpen, X, Timer, Sparkles } from 'lucide-react';

interface Props {
  sessions: StudySession[];
  subjects: Subject[];
  activePomodoroSessionId?: string | null;
  onToggleComplete: (id: string) => void;
  onOpenAddModalForDate: (dateStr: string) => void;
  onEditSession: (session: StudySession) => void;
  onStartPomodoro?: (session: StudySession) => void;
  onOpenQuickQuiz?: (session: StudySession) => void;
}

export const CalendarView: React.FC<Props> = ({
  sessions,
  subjects,
  activePomodoroSessionId,
  onToggleComplete,
  onOpenAddModalForDate,
  onEditSession,
  onStartPomodoro,
  onOpenQuickQuiz,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

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

  // Sessions for selected date
  const selectedDateSessions = selectedDayStr
    ? sessions.filter((s) => s.date === selectedDayStr)
    : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 transition-colors">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Kalender Belajar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {monthNamesStr[month]} {year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Hari Ini
          </button>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-500 dark:text-slate-400 mb-2">
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
            return <div key={`empty-${idx}`} className="h-24 sm:h-28 rounded-xl bg-slate-50/40 dark:bg-slate-950/20" />;
          }

          const dayStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          const isToday = dayStr === todayStr;
          const daySessions = sessions.filter((s) => s.date === dayStr);
          const isSelected = selectedDayStr === dayStr;

          return (
            <div
              key={dayStr}
              onClick={() => setSelectedDayStr(dayStr)}
              className={`h-24 sm:h-28 p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none overflow-hidden ${
                isToday
                  ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20'
                  : isSelected
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {/* Top date bar */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center ${
                    isToday
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {dateObj.getDate()}
                </span>
                {daySessions.length > 0 && (
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded-md">
                    {daySessions.length} sesi
                  </span>
                )}
              </div>

              {/* Session Badges in Cell */}
              <div className="flex-1 my-1 overflow-y-auto space-y-1 scrollbar-none">
                {daySessions.slice(0, 3).map((sess) => {
                  const subj = subjects.find((s) => s.id === sess.subjectId);
                  return (
                    <div
                      key={sess.id}
                      className={`text-[10px] p-1 rounded font-medium truncate flex items-center gap-1 ${
                        sess.isCompleted
                          ? 'bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 line-through'
                          : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs'
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: subj?.color || '#3B82F6' }}
                      />
                      <span className="truncate">{sess.title}</span>
                    </div>
                  );
                })}
                {daySessions.length > 3 && (
                  <div className="text-[10px] text-slate-400 font-medium px-1">
                    +{daySessions.length - 3} lagi...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Inspector Modal */}
      {selectedDayStr && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    Jadwal Belajar: {selectedDayStr}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDateSessions.length} sesi terjadwal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayStr(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 max-h-[60vh] overflow-y-auto space-y-3">
              {selectedDateSessions.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-sm">Tidak ada sesi belajar pada tanggal ini.</p>
                </div>
              ) : (
                selectedDateSessions.map((session) => {
                  const subj = subjects.find((s) => s.id === session.subjectId);
                  const currentStatus = calculateSessionStatus(session, now, activePomodoroSessionId);
                  const statusStyle = getStatusBadgeStyle(currentStatus);
                  const isPomodoroActive = activePomodoroSessionId === session.id;

                  return (
                    <div
                      key={session.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        isPomodoroActive
                          ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-400'
                          : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleComplete(session.id)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            session.isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {session.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: subj?.color || '#3B82F6' }}
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {subj?.code}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                            >
                              {currentStatus}
                            </span>
                          </div>
                          <h4
                            className={`text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 ${
                              session.isCompleted ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {session.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                            className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
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
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Generasi Kuis Cepat AI"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                            <span className="hidden sm:inline">Kuis AI</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onEditSession(session);
                            setSelectedDayStr(null);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  onOpenAddModalForDate(selectedDayStr);
                  setSelectedDayStr(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                + Tambah Sesi di Tanggal Ini
              </button>
              <button
                onClick={() => setSelectedDayStr(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
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
