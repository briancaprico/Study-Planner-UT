import React from 'react';
import { Subject, StudySession } from '../types';
import { BookOpen, CheckCircle2, Clock, Plus, Flame } from 'lucide-react';

interface Props {
  subjects: Subject[];
  sessions: StudySession[];
  selectedSubjectId: string;
  onSelectSubject: (id: string) => void;
  onOpenAddSubject: () => void;
}

export const SubjectProgressRings: React.FC<Props> = ({
  subjects,
  sessions,
  selectedSubjectId,
  onSelectSubject,
  onOpenAddSubject,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Progress Per Mata Kuliah
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ring progress otomatis terhitung berdasarkan jumlah sesi selesai.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedSubjectId !== 'ALL' && (
            <button
              onClick={() => onSelectSubject('ALL')}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              Tampilkan Semua
            </button>
          )}
          <button
            onClick={onOpenAddSubject}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Kelola Matkul
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {subjects.map((subj) => {
          const subjSessions = sessions.filter((s) => s.subjectId === subj.id);
          const completedCount = subjSessions.filter((s) => s.isCompleted).length;
          const totalCount = subjSessions.length;
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          
          const completedHours = subjSessions
            .filter((s) => s.isCompleted)
            .reduce((sum, s) => sum + s.durationMinutes / 60, 0);

          const isSelected = selectedSubjectId === subj.id;

          // SVG Ring constants
          const radius = 32;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (percent / 100) * circumference;

          return (
            <div
              key={subj.id}
              onClick={() => onSelectSubject(isSelected ? 'ALL' : subj.id)}
              className={`group relative flex flex-col items-center p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500/80 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {/* Top Code Badge */}
              <div className="w-full flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: subj.color }}
                >
                  {subj.code}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {completedCount}/{totalCount} Sesi
                </span>
              </div>

              {/* Progress Ring SVG */}
              <div className="relative my-1 flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 80 80">
                  {/* Track Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-slate-200 dark:stroke-slate-700/80 fill-none"
                    strokeWidth="7"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke={subj.color}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                {/* Center Percentage Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Subject Title */}
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center line-clamp-1 w-full mt-1" title={subj.name}>
                {subj.name}
              </h3>

              {/* Hours spent */}
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>
                  {completedHours.toFixed(1)} jam / {subj.targetHours}h
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
