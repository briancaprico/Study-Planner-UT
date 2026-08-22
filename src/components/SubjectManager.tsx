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
  '#0D7A57', // Forest Mint
  '#10B981', // Emerald
  '#8D6A47', // Light Brown Accent
  '#B48455', // Warm Brown
  '#D97706', // Amber
  '#059669', // Mint Teal
  '#6366F1', // Indigo
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
  const [color, setColor] = useState('#0D7A57');
  const [targetHours, setTargetHours] = useState('15');
  const [lecturer, setLecturer] = useState('');
  const [sks, setSks] = useState('3');

  const startCreate = () => {
    setCode('');
    setName('');
    setColor('#0D7A57');
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
    <div className={`bg-white dark:bg-stone-900 rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-800 flex flex-col ${isInline ? 'shadow-xs' : 'max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-stone-800 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#0D7A57] dark:text-emerald-400" />
          <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">
            Kelola Mata Kuliah & Kurikulum
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

        {/* Content Body */}
        <div className="py-4 overflow-y-auto flex-1 space-y-4">
          {isCreating ? (
            /* Add / Edit Form */
            <form onSubmit={handleSave} className="bg-[#FAF7F2] dark:bg-stone-800/60 p-4 rounded-xl border border-[#E8E1D5] dark:border-stone-700/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {editingSubject ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kode Matkul *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: HKUM4101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Nama Mata Kuliah *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pengantar Ilmu Hukum"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Target Jam
                  </label>
                  <input
                    type="number"
                    value={targetHours}
                    onChange={(e) => setTargetHours(e.target.value)}
                    min="1"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    SKS
                  </label>
                  <input
                    type="number"
                    value={sks}
                    onChange={(e) => setSks(e.target.value)}
                    min="1"
                    max="6"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Ir. Budi..."
                    value={lecturer}
                    onChange={(e) => setLecturer(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Warna Identitas
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                        color === c ? 'ring-2 ring-offset-2 ring-[#0D7A57] scale-110' : ''
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

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E1D5] dark:border-stone-700/80">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-[#E8E1D5] dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#0D7A57] hover:bg-[#0A5D42] text-white rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Matkul
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={startCreate}
              className="w-full py-2.5 border-2 border-dashed border-[#E8E1D5] dark:border-stone-700 hover:border-[#10B981] dark:hover:border-emerald-400 rounded-xl text-xs font-semibold text-[#0D7A57] dark:text-emerald-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                  className="rounded-xl border border-[#E8E1D5] dark:border-stone-800 bg-white dark:bg-stone-800/80 overflow-hidden transition-all"
                >
                  <div className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3.5 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: subj.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {subj.code}
                          </span>
                          {subj.sks && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAF7F2] dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium">
                              {subj.sks} SKS
                            </span>
                          )}
                          {subj.topics && subj.topics.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E8F8F2] dark:bg-emerald-950/60 text-[#0D7A57] dark:text-emerald-400 font-medium flex items-center gap-1">
                              <ListChecks className="w-3 h-3" />
                              {subj.topics.length} Materi
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                          {subj.name}
                        </h4>
                        {subj.lecturer && (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                            Dosen/Program: {subj.lecturer}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {subj.topics && subj.topics.length > 0 && (
                        <button
                          onClick={() => setExpandedSubjectId(isExpanded ? null : subj.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-[#0D7A57] dark:hover:text-emerald-400 hover:bg-[#FAF7F2] dark:hover:bg-stone-700 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                          title="Lihat Daftar Materi"
                        >
                          <span className="hidden sm:inline">Materi</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(subj)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-[#0D7A57] dark:hover:text-emerald-400 hover:bg-[#FAF7F2] dark:hover:bg-stone-700 cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSubject(subj.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#FAF7F2] dark:hover:bg-stone-700 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Topics List */}
                  {isExpanded && subj.topics && (
                    <div className="px-4 pb-3.5 pt-1 border-t border-[#E8E1D5] dark:border-stone-800/80 bg-[#FAF7F2]/50 dark:bg-stone-900/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                          Daftar Materi Pokok:
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {subj.topics.map((tp, idx) => (
                          <div
                            key={idx}
                            className="text-xs py-1 px-2.5 rounded-lg bg-white dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700/60 text-stone-700 dark:text-stone-300 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
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
          <div className="pt-3 border-t border-[#E8E1D5] dark:border-stone-800 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-[#FAF7F2] dark:bg-stone-800 hover:bg-[#F3EFEA] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl transition-colors border border-[#E8E1D5] dark:border-stone-700 cursor-pointer"
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
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      {content}
    </div>
  );
};
