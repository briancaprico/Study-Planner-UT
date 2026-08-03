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
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Backup & Restore Data (JSON)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
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
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              1. Export Data (Backup)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unduh cadangan data jadwal, mata kuliah, dan statistik Anda dalam format JSON.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh File JSON
              </button>
              <button
                onClick={handleCopyClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin!' : 'Salin JSON'}
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              2. Import Data (Restore)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                A. Upload File JSON:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                B. Atau Tempel Kode Teks JSON:
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Tempelkan isi JSON cadangan di sini...'
                rows={3}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-400"
              />
              <button
                onClick={handleImportText}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-xs"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
