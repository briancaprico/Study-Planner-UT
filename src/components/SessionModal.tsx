import React, { useState, useEffect } from 'react';
import { StudySession, Subject, SessionType } from '../types';
import { X, Calendar as CalendarIcon, Clock, BookOpen, FileText, Plus, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  editingSession: StudySession | null;
  defaultDate?: string;
  subjects: Subject[];
  onSave: (session: Omit<StudySession, 'id'> | StudySession) => void;
  onClose: () => void;
}

const SESSION_TYPES: SessionType[] = [
  'Belajar Mendalam',
  'Retrieval Practice',
  'Review Ringan',
  'Latihan Soal',
  'Flashcard',
  'Mind Mapping',
  'Simulasi Ujian',
];

export const SessionModal: React.FC<Props> = ({
  isOpen,
  editingSession,
  defaultDate,
  subjects,
  onSave,
  onClose,
}) => {
  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || todayStr());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [sessionType, setSessionType] = useState<SessionType>('Belajar Mendalam');
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (editingSession) {
      setSubjectId(editingSession.subjectId);
      setTitle(editingSession.title);
      setDate(editingSession.date);
      setStartTime(editingSession.startTime);
      setEndTime(editingSession.endTime);
      setSessionType(editingSession.sessionType);
      setNotes(editingSession.notes || '');
      setIsCompleted(editingSession.isCompleted);
    } else {
      setSubjectId(subjects[0]?.id || '');
      setTitle('');
      setDate(defaultDate || todayStr());
      setStartTime('09:00');
      setEndTime('10:30');
      setSessionType('Belajar Mendalam');
      setNotes('');
      setIsCompleted(false);
    }
  }, [editingSession, defaultDate, subjects]);

  // Calculate duration in minutes
  const calculateDuration = () => {
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      let mins = (eh * 60 + em) - (sh * 60 + sm);
      if (mins < 0) mins += 24 * 60; // Overnight
      return mins || 60;
    } catch {
      return 60;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const duration = calculateDuration();

    if (editingSession) {
      onSave({
        ...editingSession,
        subjectId,
        title: title.trim(),
        date,
        startTime,
        endTime,
        durationMinutes: duration,
        sessionType,
        notes: notes.trim(),
        isCompleted,
      });
    } else {
      onSave({
        subjectId,
        title: title.trim(),
        date,
        startTime,
        endTime,
        durationMinutes: duration,
        sessionType,
        notes: notes.trim(),
        isCompleted,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-5 border border-[#E8E1D5] dark:border-stone-800 shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0D7A57] dark:text-emerald-400" />
            <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">
              {editingSession ? 'Edit Sesi Belajar' : 'Tambah Sesi Belajar Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="py-4 overflow-y-auto flex-1 space-y-4">
          {/* Mata Kuliah Select */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Mata Kuliah *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#10B981]"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Judul / Materi Belajar *
            </label>
            <input
              type="text"
              placeholder="Contoh: Implementasi Linked List & Doubly Pointer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#10B981] placeholder:text-stone-400"
            />
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Tanggal *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Jam Mulai
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Jam Selesai
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
          </div>

          {/* Jenis Sesi */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Jenis Sesi *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SESSION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSessionType(type)}
                  className={`p-2 text-xs rounded-xl border font-medium text-left transition-all cursor-pointer ${
                    sessionType === type
                      ? 'bg-[#E8F8F2] dark:bg-emerald-950/60 border-[#10B981] text-[#0D7A57] dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-[#FAF7F2] dark:bg-stone-800/40 border-[#E8E1D5] dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-[#F3EFEA] dark:hover:bg-stone-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Catatan / Target Pencapaian Sesi
            </label>
            <textarea
              placeholder="Catat poin penting, link modul, atau daftar latihan soal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#10B981] placeholder:text-stone-400 resize-none"
            />
          </div>

          {/* Checkbox Status Selesai */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCompletedCheck"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-[#E8E1D5] text-[#0D7A57] accent-[#0D7A57] focus:ring-[#10B981]"
            />
            <label htmlFor="isCompletedCheck" className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
              Tandai Sesi Ini Langsung Selesai
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-[#E8E1D5] dark:border-stone-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-[#FAF7F2] dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#0D7A57] hover:bg-[#0A5D42] text-white rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {editingSession ? 'Simpan Perubahan' : 'Tambah Sesi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
