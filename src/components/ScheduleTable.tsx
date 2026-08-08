import React, { useState } from 'react';
import { StudySession, Subject, FilterOptions, SessionType, SessionStatus } from '../types';
import { calculateSessionStatus, getStatusBadgeStyle, getSessionTypeBadge } from '../utils/statusHelper';
import { getWeekRange, isDateInWeek, sortSessionsByDate } from '../utils/dateHelper';
import { 
  Check, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  MoreVertical, 
  FileText, 
  GripVertical,
  Brain,
  RotateCcw,
  Eye,
  PenTool,
  Layers,
  GitBranch,
  GraduationCap,
  Copy,
  ChevronDown,
  Timer,
  Sparkles
} from 'lucide-react';

interface Props {
  sessions: StudySession[];
  subjects: Subject[];
  filters: FilterOptions;
  activePomodoroSessionId?: string | null;
  onFilterChange: (filters: FilterOptions) => void;
  onToggleComplete: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onDuplicateSession: (session: StudySession) => void;
  onEditSession: (session: StudySession) => void;
  onStartPomodoro?: (session: StudySession) => void;
  onOpenQuickQuiz?: (session: StudySession) => void;
  onOpenAddModal: () => void;
  onReorderSessions: (reordered: StudySession[]) => void;
}

export const ScheduleTable: React.FC<Props> = ({
  sessions,
  subjects,
  filters,
  activePomodoroSessionId,
  onFilterChange,
  onToggleComplete,
  onDeleteSession,
  onDuplicateSession,
  onEditSession,
  onStartPomodoro,
  onOpenQuickQuiz,
  onOpenAddModal,
  onReorderSessions,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeNotesModal, setActiveNotesModal] = useState<StudySession | null>(null);

  // Helper to render icon for session type
  const renderSessionTypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain': return <Brain className="w-3.5 h-3.5" />;
      case 'RotateCcw': return <RotateCcw className="w-3.5 h-3.5" />;
      case 'Eye': return <Eye className="w-3.5 h-3.5" />;
      case 'PenTool': return <PenTool className="w-3.5 h-3.5" />;
      case 'Layers': return <Layers className="w-3.5 h-3.5" />;
      case 'GitBranch': return <GitBranch className="w-3.5 h-3.5" />;
      case 'GraduationCap': return <GraduationCap className="w-3.5 h-3.5" />;
      default: return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  // Filter & sort logic (urut berdasarkan tanggal awal Agustus - September)
  const now = new Date();
  const filteredSessions = sortSessionsByDate(
    sessions.filter((session) => {
      const subj = subjects.find((s) => s.id === session.subjectId);
      const subjName = subj ? subj.name.toLowerCase() : '';
      const subjCode = subj ? subj.code.toLowerCase() : '';
      const query = filters.searchQuery.toLowerCase().trim();

      // Search query check
      if (query) {
        const matchTitle = session.title.toLowerCase().includes(query);
        const matchNotes = (session.notes || '').toLowerCase().includes(query);
        const matchSubj = subjName.includes(query) || subjCode.includes(query);
        if (!matchTitle && !matchNotes && !matchSubj) return false;
      }

      // Subject check
      if (filters.subjectId !== 'ALL' && session.subjectId !== filters.subjectId) {
        return false;
      }

      // Session Type check
      if (filters.sessionType !== 'ALL' && session.sessionType !== filters.sessionType) {
        return false;
      }

      // Status check
      const currentStatus = calculateSessionStatus(session, now);
      if (filters.status !== 'ALL' && currentStatus !== filters.status) {
        return false;
      }

      // Date range check
      if (filters.dateRange !== 'ALL') {
        const sDate = new Date(session.date + 'T00:00:00');
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        if (filters.dateRange === 'TODAY') {
          if (session.date !== todayStr) return false;
        } else if (filters.dateRange === 'THIS_WEEK') {
          const weekRange = getWeekRange(now);
          if (!isDateInWeek(session.date, weekRange)) return false;
        } else if (filters.dateRange === 'THIS_MONTH') {
          if (sDate.getMonth() !== now.getMonth() || sDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }
      }

      return true;
    })
  );

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    try {
      e.dataTransfer.effectAllowed = 'move';
    } catch {}
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      e.dataTransfer.dropEffect = 'move';
    } catch {}
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const draggedItem = filteredSessions[draggedIndex];
    const targetItem = filteredSessions[targetIndex];
    if (!draggedItem || !targetItem) return;

    const masterList = [...sessions];
    const fromMasterIndex = masterList.findIndex((s) => s.id === draggedItem.id);
    const toMasterIndex = masterList.findIndex((s) => s.id === targetItem.id);

    if (fromMasterIndex !== -1 && toMasterIndex !== -1) {
      const [moved] = masterList.splice(fromMasterIndex, 1);
      masterList.splice(toMasterIndex, 0, moved);
      onReorderSessions(masterList);
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Date formatter
  const formatDateLabel = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Tabel Jadwal Belajar
          </h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {filteredSessions.length} Sesi
          </span>
        </div>

        {/* Search & Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-none sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari materi / matkul..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          {/* Subject Dropdown */}
          <select
            value={filters.subjectId}
            onChange={(e) => onFilterChange({ ...filters, subjectId: e.target.value })}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Matkul</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="Belum Dimulai">Belum Dimulai</option>
            <option value="Sedang Berjalan">Sedang Berjalan</option>
            <option value="Selesai">Selesai</option>
            <option value="Terlambat">Terlambat</option>
          </select>

          {/* Session Type Dropdown */}
          <select
            value={filters.sessionType}
            onChange={(e) => onFilterChange({ ...filters, sessionType: e.target.value })}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Jenis Sesi</option>
            <option value="Belajar Mendalam">Belajar Mendalam</option>
            <option value="Retrieval Practice">Retrieval Practice</option>
            <option value="Review Ringan">Review Ringan</option>
            <option value="Latihan Soal">Latihan Soal</option>
            <option value="Flashcard">Flashcard</option>
            <option value="Mind Mapping">Mind Mapping</option>
          </select>

          {/* Date Filter Dropdown */}
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value as any })}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Tanggal</option>
            <option value="TODAY">Hari Ini</option>
            <option value="THIS_WEEK">Minggu Ini</option>
            <option value="THIS_MONTH">Bulan Ini</option>
          </select>

          {/* Add Session Button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            + Tambah Sesi
          </button>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px]">
              <th className="py-2.5 px-1.5 w-6 text-center"></th>
              <th className="py-2.5 px-2">Tanggal</th>
              <th className="py-2.5 px-2">Waktu</th>
              <th className="py-2.5 px-2">Judul / Materi</th>
              <th className="py-2.5 px-2">Matkul</th>
              <th className="py-2.5 px-2">Jenis</th>
              <th className="py-2.5 px-2">Status</th>
              <th className="py-2.5 px-1.5 text-center">Check</th>
              <th className="py-2.5 px-2">Catatan</th>
              <th className="py-2.5 px-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-medium">Tidak ada jadwal belajar ditemukan.</p>
                    <p className="text-xs">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSessions.map((session, index) => {
                const subj = subjects.find((s) => s.id === session.subjectId);
                const currentStatus = calculateSessionStatus(session, now, activePomodoroSessionId);
                const statusStyle = getStatusBadgeStyle(currentStatus);
                const typeStyle = getSessionTypeBadge(session.sessionType);
                const isPomodoroActive = activePomodoroSessionId === session.id;

                return (
                  <tr
                    key={session.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`group transition-colors ${
                      isPomodoroActive
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-l-blue-500'
                        : session.isCompleted
                        ? 'bg-slate-50/50 dark:bg-slate-900/40 text-slate-500'
                        : 'hover:bg-blue-50/30 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Drag Handle */}
                    <td className="py-2.5 px-1 text-center text-slate-300 dark:text-slate-700 group-hover:text-slate-400 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-3.5 h-3.5 mx-auto" />
                    </td>

                    {/* Tanggal */}
                    <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap text-[11px] sm:text-xs">
                      {formatDateLabel(session.date)}
                    </td>

                    {/* Waktu */}
                    <td className="py-2.5 px-2 whitespace-nowrap text-[11px] sm:text-xs">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-mono">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {session.startTime}-{session.endTime}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({session.durationMinutes}m)
                        </span>
                      </div>
                    </td>

                    {/* Judul Materi */}
                    <td className="py-2.5 px-2 max-w-[130px] sm:max-w-[180px] lg:max-w-[220px]">
                      <span
                        className={`font-semibold text-slate-900 dark:text-slate-100 block truncate text-[11px] sm:text-xs ${
                          session.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                        title={session.title}
                      >
                        {session.title}
                      </span>
                    </td>

                    {/* Mata Kuliah */}
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      {subj ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-[11px]">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: subj.color }}
                          />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {subj.code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Jenis Sesi */}
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium ${typeStyle.bg} ${typeStyle.text}`}
                      >
                        {renderSessionTypeIcon(typeStyle.iconName)}
                        <span>{session.sessionType}</span>
                      </span>
                    </td>

                    {/* Status Automatic Badge */}
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotBg}`} />
                        {currentStatus}
                      </span>
                    </td>

                    {/* Checklist Toggle */}
                    <td className="py-2.5 px-1.5 text-center">
                      <button
                        onClick={() => onToggleComplete(session.id)}
                        className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto rounded-md border flex items-center justify-center transition-all ${
                          session.isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs scale-105'
                            : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-slate-800'
                        }`}
                        title={session.isCompleted ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                      >
                        {session.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Catatan Preview */}
                    <td className="py-2.5 px-2 max-w-[100px] sm:max-w-[130px]">
                      {session.notes ? (
                        <button
                          onClick={() => setActiveNotesModal(session)}
                          className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 group/note truncate"
                          title="Klik untuk melihat catatan lengkap"
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate text-[11px] underline decoration-dotted">
                            {session.notes}
                          </span>
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700 text-[10px] italic">
                          -
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {onStartPomodoro && (
                          <button
                            onClick={() => onStartPomodoro(session)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                              isPomodoroActive
                                ? 'bg-blue-600 text-white shadow-xs animate-pulse'
                                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200/60 dark:border-blue-800/60'
                            }`}
                            title="Mulai Sesi Pomodoro Focus (Kunci UI & Bebas Distraksi)"
                          >
                            <Timer className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">{isPomodoroActive ? 'Fokus...' : 'Fokus'}</span>
                          </button>
                        )}
                        {onOpenQuickQuiz && (
                          <button
                            onClick={() => onOpenQuickQuiz(session)}
                            className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] font-semibold flex items-center gap-1 transition-all"
                            title="Generasi Kuis Cepat AI (3-5 Soal Pilihan Ganda)"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="hidden xl:inline">Kuis AI</span>
                          </button>
                        )}
                        <button
                          onClick={() => onDuplicateSession(session)}
                          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Duplikasi Sesi"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditSession(session)}
                          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Sesi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Notes Modal */}
      {activeNotesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Catatan Belajar</h3>
              </div>
              <button
                onClick={() => setActiveNotesModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="py-4">
              <p className="text-xs font-semibold text-slate-500 mb-1">{activeNotesModal.title}</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {activeNotesModal.notes}
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveNotesModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
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
