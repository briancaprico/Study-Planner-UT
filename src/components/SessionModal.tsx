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
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {editingSession ? 'Edit Sesi Belajar' : 'Tambah Sesi Belajar Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="py-4 overflow-y-auto flex-1 space-y-4">
          {/* Mata Kuliah Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mata Kuliah *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul / Materi Belajar *
            </label>
            <input
              type="text"
              placeholder="Contoh: Implementasi Linked List & Doubly Pointer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Mulai
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Selesai
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Jenis Sesi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jenis Sesi *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SESSION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSessionType(type)}
                  className={`p-2 text-xs rounded-xl border font-medium text-left transition-all ${
                    sessionType === type
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Target Pencapaian Sesi
            </label>
            <textarea
              placeholder="Catat poin penting, link modul, atau daftar latihan soal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Checkbox Status Selesai */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCompletedCheck"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isCompletedCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Tandai Sesi Ini Langsung Selesai
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
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
