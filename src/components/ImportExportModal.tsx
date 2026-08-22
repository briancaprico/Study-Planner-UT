import React, { useState } from 'react';
import { Subject, StudySession, WeeklyTarget } from '../types';
import { exportAppData, importAppData, resetToDefaultData } from '../utils/storage';
import { Download, Upload, RotateCcw, Copy, Check, X, Database, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  subjects: Subject[];
  sessions: StudySession[];
  weeklyTarget: WeeklyTarget;
  onRestoreData: (subjects: Subject[], sessions: StudySession[], target: WeeklyTarget) => void;
  onClose: () => void;
}

export const ImportExportModal: React.FC<Props> = ({
  isOpen,
  subjects,
  sessions,
  weeklyTarget,
  onRestoreData,
  onClose,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleExportDownload = () => {
    const jsonStr = exportAppData(subjects, sessions, weeklyTarget);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_planner_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessMsg('File backup JSON berhasil diunduh!');
  };

  const handleCopyClipboard = () => {
    const jsonStr = exportAppData(subjects, sessions, weeklyTarget);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportText = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!jsonInput.trim()) {
      setErrorMsg('Masukkan teks JSON terlebih dahulu.');
      return;
    }
    try {
      const restored = importAppData(jsonInput);
      onRestoreData(restored.subjects, restored.sessions, restored.target);
      setSuccessMsg('Data berhasil di-restore dari JSON!');
      setJsonInput('');
    } catch (e: any) {
      setErrorMsg(e.message || 'Gagal membaca data JSON.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const restored = importAppData(content);
        onRestoreData(restored.subjects, restored.sessions, restored.target);
        setSuccessMsg(`Data berhasil di-restore dari file ${file.name}!`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal memproses file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin meriset semua data ke contoh bawaan? Data Anda saat ini akan ditimpa.')) {
      const defaultData = resetToDefaultData();
      onRestoreData(defaultData.subjects, defaultData.sessions, defaultData.target);
      setSuccessMsg('Data berhasil diriset ke dataset standar!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-5 border border-[#E8E1D5] dark:border-stone-800 shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0D7A57] dark:text-emerald-400" />
            <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">
              Backup & Restore Data (JSON)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#E8F8F2] dark:bg-emerald-950/50 border border-[#10B981] text-[#0D7A57] dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="p-4 bg-[#FAF7F2] dark:bg-stone-800/50 rounded-xl border border-[#E8E1D5] dark:border-stone-700/80 space-y-2">
            <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
              1. Export Data (Backup)
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Unduh cadangan data jadwal, mata kuliah, dan statistik Anda dalam format JSON.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0D7A57] hover:bg-[#0A5D42] text-white rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh File JSON
              </button>
              <button
                onClick={handleCopyClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-stone-700 border border-[#E8E1D5] dark:border-stone-600 hover:bg-[#FAF7F2] dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#0D7A57]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin!' : 'Salin JSON'}
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="p-4 bg-[#FAF7F2] dark:bg-stone-800/50 rounded-xl border border-[#E8E1D5] dark:border-stone-700/80 space-y-3">
            <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
              2. Import Data (Restore)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                A. Upload File JSON:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#E8F8F2] file:text-[#0D7A57] dark:file:bg-emerald-950 dark:file:text-emerald-300 hover:file:bg-[#d5f3e7] cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-[#E8E1D5] dark:border-stone-700/60">
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                B. Atau Tempel Kode Teks JSON:
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Tempelkan isi JSON cadangan di sini...'
                rows={3}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#0D7A57] resize-none placeholder:text-stone-400"
              />
              <button
                onClick={handleImportText}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#8D6A47] hover:bg-[#725436] text-white rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Proses Restore JSON
              </button>
            </div>
          </div>

          {/* Reset Section */}
          <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">Riset ke Data Standar</h4>
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                Kembalikan mata kuliah & jadwal ke data awal aplikasi.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E8E1D5] dark:border-stone-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-[#FAF7F2] dark:bg-stone-800 hover:bg-[#E8E1D5] dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
