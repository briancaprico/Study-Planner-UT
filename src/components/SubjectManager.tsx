import React, { useState } from 'react';
import { Subject } from '../types';
import { Plus, Edit2, Trash2, X, BookOpen, Clock, User, Award, Check, ChevronDown, ChevronUp, ListChecks } from 'lucide-react';

interface Props {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onClose?: () => void;
  isInline?: boolean;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#64748B', // Slate
];

export const SubjectManager: React.FC<Props> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onClose,
  isInline = false,
}) => {
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [targetHours, setTargetHours] = useState('15');
  const [lecturer, setLecturer] = useState('');
  const [sks, setSks] = useState('3');

  const startCreate = () => {
    setCode('');
    setName('');
    setColor('#3B82F6');
    setTargetHours('15');
    setLecturer('');
    setSks('3');
    setEditingSubject(null);
    setIsCreating(true);
  };

  const startEdit = (subj: Subject) => {
    setEditingSubject(subj);
    setCode(subj.code);
    setName(subj.name);
    setColor(subj.color);
    setTargetHours(subj.targetHours.toString());
    setLecturer(subj.lecturer || '');
    setSks(subj.sks ? subj.sks.toString() : '3');
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const parsedTarget = parseFloat(targetHours) || 10;
    const parsedSks = parseInt(sks) || 3;

    if (editingSubject) {
      onUpdateSubject({
        ...editingSubject,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        color,
        targetHours: parsedTarget,
        lecturer: lecturer.trim(),
        sks: parsedSks,
      });
    } else {
      onAddSubject({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        color,
        targetHours: parsedTarget,
        lecturer: lecturer.trim(),
        sks: parsedSks,
      });
    }

    setIsCreating(false);
    setEditingSubject(null);
  };

  const content = (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col ${isInline ? 'shadow-xs' : 'max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            Kelola Mata Kuliah & Kurikulum S1 Ilmu Hukum UT
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

        {/* Content Body */}
        <div className="py-4 overflow-y-auto flex-1 space-y-4">
          {isCreating ? (
            /* Add / Edit Form */
            <form onSubmit={handleSave} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {editingSubject ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kode Matkul *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: IF-201"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Mata Kuliah *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Algoritma & Pemrograman"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Jam
                  </label>
                  <input
                    type="number"
                    value={targetHours}
                    onChange={(e) => setTargetHours(e.target.value)}
                    min="1"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SKS
                  </label>
                  <input
                    type="number"
                    value={sks}
                    onChange={(e) => setSks(e.target.value)}
                    min="1"
                    max="6"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Ir. Budi..."
                    value={lecturer}
                    onChange={(e) => setLecturer(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Warna Identitas
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                        color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-6 h-6 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                    title="Pilih Warna Kustom"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Simpan Matkul
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={startCreate}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Tambah Mata Kuliah Baru
            </button>
          )}

          {/* List of Subjects */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {subjects.map((subj) => {
              const isExpanded = expandedSubjectId === subj.id;
              return (
                <div
                  key={subj.id}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 overflow-hidden transition-all"
                >
                  <div className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3.5 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: subj.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {subj.code}
                          </span>
                          {subj.sks && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                              {subj.sks} SKS
                            </span>
                          )}
                          {subj.topics && subj.topics.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                              <ListChecks className="w-3 h-3" />
                              {subj.topics.length} Materi
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {subj.name}
                        </h4>
                        {subj.lecturer && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            Dosen/Program: {subj.lecturer}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {subj.topics && subj.topics.length > 0 && (
                        <button
                          onClick={() => setExpandedSubjectId(isExpanded ? null : subj.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 text-[11px] font-medium"
                          title="Lihat Daftar Materi"
                        >
                          <span className="hidden sm:inline">Materi</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(subj)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSubject(subj.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Topics List */}
                  {isExpanded && subj.topics && (
                    <div className="px-4 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Daftar Materi Pokok Curriculum S1 Ilmu Hukum UT:
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {subj.topics.map((tp, idx) => (
                          <div
                            key={idx}
                            className="text-xs py-1 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span className="truncate">{tp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {onClose && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
            >
              Selesai
            </button>
          </div>
        )}
      </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      {content}
    </div>
  );
};
