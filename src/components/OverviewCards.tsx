import React, { useState } from 'react';
import { StudySession, Subject, WeeklyTarget } from '../types';
import { getWeekRange, isDateInWeek } from '../utils/dateHelper';
import { Flame, Target, Clock, CheckCircle2, AlertTriangle, Award, Edit3, TrendingUp } from 'lucide-react';

interface Props {
  sessions: StudySession[];
  subjects: Subject[];
  weeklyTarget: WeeklyTarget;
  onUpdateTarget: (newTarget: WeeklyTarget) => void;
}

export const OverviewCards: React.FC<Props> = ({
  sessions,
  subjects,
  weeklyTarget,
  onUpdateTarget,
}) => {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(weeklyTarget.targetHours.toString());

  // Calculations
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.isCompleted);
  const completedCount = completedSessions.length;
  const pendingCount = totalSessions - completedCount;

  // Total Progress %
  const totalProgressPercent = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  // Total Hours Spent
  const totalHoursSpent = completedSessions.reduce((sum, s) => sum + s.durationMinutes / 60, 0);
  const totalScheduledHours = sessions.reduce((sum, s) => sum + s.durationMinutes / 60, 0);

  // Weekly Hours Spent & Scheduled (Using current active week range)
  const now = new Date();
  const weekRange = getWeekRange(now);

  const weeklySessions = sessions.filter((s) => {
    // Session is scheduled in current week
    if (isDateInWeek(s.date, weekRange)) return true;
    // OR session was completed in current week
    if (s.completedAt && isDateInWeek(s.completedAt, weekRange)) return true;
    return false;
  });

  const weeklyCompletedSessions = weeklySessions.filter((s) => s.isCompleted);

  const weeklyCompletedHours = weeklyCompletedSessions.reduce(
    (sum, s) => sum + s.durationMinutes / 60,
    0
  );

  const weeklyScheduledHours = weeklySessions.reduce(
    (sum, s) => sum + s.durationMinutes / 60,
    0
  );

  const weeklyTargetPercent =
    weeklyTarget.targetHours > 0
      ? Math.round((weeklyCompletedHours / weeklyTarget.targetHours) * 100)
      : 0;

  // Overdue count
  const overdueCount = sessions.filter((s) => {
    if (s.isCompleted) return false;
    const sessionEndDate = new Date(`${s.date}T${s.endTime}:00`);
    return now > sessionEndDate;
  }).length;

  // Most studied subject
  const subjectHoursMap: Record<string, number> = {};
  completedSessions.forEach((s) => {
    subjectHoursMap[s.subjectId] = (subjectHoursMap[s.subjectId] || 0) + s.durationMinutes / 60;
  });

  let mostStudiedSubj: Subject | null = null;
  let maxHours = 0;
  Object.entries(subjectHoursMap).forEach(([subjId, hours]) => {
    if (hours > maxHours) {
      maxHours = hours;
      const found = subjects.find((sub) => sub.id === subjId);
      if (found) mostStudiedSubj = found;
    }
  });

  // Dynamic Learning Streak Calculation
  const completedDates: string[] = Array.from<string>(
    new Set(completedSessions.map((s) => s.date))
  ).sort();

  const calculateStreakDays = (): number => {
    if (completedDates.length === 0) return 0;
    const timestamps = completedDates.map((dStr) => {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(y, m - 1, d).getTime();
    });
    const ONE_DAY_MS = 86400000;
    let streak = 1;
    for (let i = timestamps.length - 1; i > 0; i--) {
      const diffDays = Math.round((timestamps[i] - timestamps[i - 1]) / ONE_DAY_MS);
      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        break;
      }
    }
    return streak;
  };

  const dynamicStreak = calculateStreakDays();
  const currentStreakDisplay = Math.max(dynamicStreak, weeklyTarget.streakDays || 0);

  const handleSaveTarget = () => {
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val > 0) {
      onUpdateTarget({ ...weeklyTarget, targetHours: val });
    }
    setIsEditingTarget(false);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
      {/* 1. Total Progress Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-[#E8E1D5] dark:border-stone-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total Progress
            </span>
            <div className="p-2 rounded-xl bg-[#E8F8F2] dark:bg-emerald-950/60 text-[#0D7A57] dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {totalProgressPercent}%
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              ({completedCount} dari {totalSessions} sesi)
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className="w-full h-2 bg-[#F4EFE6] dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-teal-600 rounded-full transition-all duration-700"
              style={{ width: `${totalProgressPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1 text-[#0D7A57] dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> {completedCount} Selesai
            </span>
            {overdueCount > 0 && (
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                <AlertTriangle className="w-3 h-3" /> {overdueCount} Terlambat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Total Jam Belajar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-[#E8E1D5] dark:border-stone-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total Jam Belajar
            </span>
            <div className="p-2 rounded-xl bg-[#FDF6EC] dark:bg-amber-950/60 text-[#8D6A47] dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {totalHoursSpent.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
              Jam
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#F4EFE6] dark:border-stone-800/80 flex items-center justify-between text-xs">
          <span className="text-stone-500 dark:text-stone-400">
            Terjadwal: <strong className="text-stone-800 dark:text-stone-200">{totalScheduledHours.toFixed(1)} Jam</strong>
          </span>
          {mostStudiedSubj && (
            <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[120px]" title={(mostStudiedSubj as Subject).name}>
              Top: <strong style={{ color: (mostStudiedSubj as Subject).color }}>{(mostStudiedSubj as Subject).code}</strong>
            </span>
          )}
        </div>
      </div>

      {/* 3. Learning Streak */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-[#E8E1D5] dark:border-stone-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Learning Streak
            </span>
            <div className="p-2 rounded-xl bg-[#FBF4EB] dark:bg-amber-950/60 text-[#A77B50] dark:text-amber-400 animate-bounce">
              <Flame className="w-4 h-4 fill-[#A77B50]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {currentStreakDisplay} Hari
            </span>
            <span className="text-xs font-medium text-[#8D6A47] dark:text-amber-400 bg-[#FDF6EC] dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-[#E8D6BF]/80 dark:border-amber-800/60">
              {completedDates.length} Hari Belajar 🔥
            </span>
          </div>
        </div>

        <div className="mt-3 text-xs text-stone-500 dark:text-stone-400">
          Otomatis bertambah setiap kali Anda menyelesaikan sesi di hari berurutan!
        </div>
      </div>

      {/* 4. Target Mingguan */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-[#E8E1D5] dark:border-stone-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Target ({weekRange.label})
            </span>
            <button
              onClick={() => {
                setTargetInput(weeklyTarget.targetHours.toString());
                setIsEditingTarget(!isEditingTarget);
              }}
              className="p-1.5 rounded-lg hover:bg-[#F4EFE6] dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              title="Ubah Target Mingguan"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#8D6A47]" />
            </button>
          </div>

          {isEditingTarget ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-20 px-2 py-1 text-sm rounded-lg border border-[#DFD5C4] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
                max="100"
              />
              <button
                onClick={handleSaveTarget}
                className="px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Simpan
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {weeklyCompletedHours.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                / {weeklyTarget.targetHours} Jam
              </span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="w-full h-2 bg-[#F4EFE6] dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, weeklyTargetPercent)}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-stone-500 dark:text-stone-400">
            <span className="truncate" title={`Terjadwal ${weekRange.label}: ${weeklyScheduledHours.toFixed(1)} Jam`}>
              Terjadwal: <strong className="text-stone-800 dark:text-stone-200">{weeklyScheduledHours.toFixed(1)} Jam</strong> ({weeklyCompletedSessions.length}/{weeklySessions.length})
            </span>
            <span className="text-[#0D7A57] dark:text-emerald-400 font-semibold ml-1 shrink-0">
              {weeklyTargetPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
