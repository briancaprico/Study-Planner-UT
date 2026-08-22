import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Database, 
  Plus, 
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';

export interface CloudStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSynced: Date | null;
  error: string | null;
}

interface Props {
  activeTab: 'DASHBOARD' | 'SUBJECTS' | 'CALENDAR' | 'ANALYTICS' | 'TUTON';
  onTabChange: (tab: 'DASHBOARD' | 'SUBJECTS' | 'CALENDAR' | 'ANALYTICS' | 'TUTON') => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  hasNotificationPermission?: boolean;
  onRequestNotification?: () => void;
  onOpenBackupModal: () => void;
  onOpenAddSession: () => void;
  cloudStatus?: CloudStatus;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onOpenBackupModal,
  onOpenAddSession,
  cloudStatus = { isConnected: true, isSyncing: false, lastSynced: new Date(), error: null },
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 dark:bg-[#1C1917]/95 backdrop-blur-md border-b border-[#E8E1D5] dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black dark:bg-black p-1.5 border border-stone-800 dark:border-stone-700 flex items-center justify-center shadow-md shadow-stone-900/10 overflow-hidden shrink-0">
            <img src="/favicon.svg" alt="Muda Verse" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-none">
                Study Planner & Tuton Tracker
              </h1>
              {/* Cloud Realtime Badge */}
              <div
                className={`hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  cloudStatus.isSyncing
                    ? 'bg-[#FDF6EC] dark:bg-amber-950/60 text-[#8D6A47] dark:text-amber-300 border-[#E8D6BF] dark:border-amber-800'
                    : cloudStatus.isConnected
                    ? 'bg-[#E8F8F2] dark:bg-emerald-950/60 text-[#0D7A57] dark:text-emerald-300 border-[#A7E8CD] dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
                title={
                  cloudStatus.isConnected
                    ? 'Tersinkronisasi Realtime dengan Cloud Firestore! Buka di HP/Laptop lain, data langsung ter-update otomatis.'
                    : 'Terhubung ke mode lokal. Cek koneksi internet untuk sinkronisasi cloud.'
                }
              >
                {cloudStatus.isSyncing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-[#8D6A47]" />
                    <span>Syncing...</span>
                  </>
                ) : cloudStatus.isConnected ? (
                  <>
                    <Cloud className="w-3 h-3 text-[#10B981]" />
                    <span>Cloud Sync</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3 h-3 text-rose-500" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 hidden sm:block">
              Progress & Schedule Tracker Mahasiswa
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F4EFE6] dark:bg-stone-800/90 p-1 rounded-2xl border border-[#E6DECة] dark:border-stone-700/70">
          <button
            onClick={() => onTabChange('DASHBOARD')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'DASHBOARD'
                ? 'bg-white dark:bg-stone-700 text-[#0D7A57] dark:text-emerald-300 shadow-xs border border-[#E5DDD0] dark:border-stone-600'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#10B981]" />
            Dashboard & Jadwal
          </button>

          <button
            onClick={() => onTabChange('SUBJECTS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'SUBJECTS'
                ? 'bg-white dark:bg-stone-700 text-[#0D7A57] dark:text-emerald-300 shadow-xs border border-[#E5DDD0] dark:border-stone-600'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#8D6A47]" />
            Mata Kuliah
          </button>

          <button
            onClick={() => onTabChange('CALENDAR')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'CALENDAR'
                ? 'bg-white dark:bg-stone-700 text-[#0D7A57] dark:text-emerald-300 shadow-xs border border-[#E5DDD0] dark:border-stone-600'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-[#10B981]" />
            Kalender
          </button>

          <button
            onClick={() => onTabChange('ANALYTICS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'ANALYTICS'
                ? 'bg-white dark:bg-stone-700 text-[#0D7A57] dark:text-emerald-300 shadow-xs border border-[#E5DDD0] dark:border-stone-600'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-[#8D6A47]" />
            Statistik
          </button>

          <button
            onClick={() => onTabChange('TUTON')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'TUTON'
                ? 'bg-gradient-to-r from-emerald-600 to-[#8D6A47] text-white shadow-xs font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-300" />
            Tuton (UT)
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Backup / Restore Button */}
          <button
            onClick={onOpenBackupModal}
            className="p-2 rounded-xl bg-[#F4EFE6] dark:bg-stone-800 border border-[#E5DDD0] dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-[#EBE3D3] dark:hover:bg-stone-700 transition-colors cursor-pointer"
            title="Backup / Restore JSON Data"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Add Session CTA */}
          <button
            onClick={onOpenAddSession}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">+ Sesi Baru</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-[#E8E1D5] dark:border-stone-800 bg-[#FDFBF7]/95 dark:bg-[#1C1917]/95 px-4 py-1.5 flex items-center justify-around">
        <button
          onClick={() => onTabChange('DASHBOARD')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold p-1 ${
            activeTab === 'DASHBOARD' ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => onTabChange('SUBJECTS')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold p-1 ${
            activeTab === 'SUBJECTS' ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Matkul
        </button>
        <button
          onClick={() => onTabChange('CALENDAR')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold p-1 ${
            activeTab === 'CALENDAR' ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Kalender
        </button>
        <button
          onClick={() => onTabChange('ANALYTICS')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold p-1 ${
            activeTab === 'ANALYTICS' ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Statistik
        </button>
        <button
          onClick={() => onTabChange('TUTON')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold p-1 ${
            activeTab === 'TUTON' ? 'text-[#8D6A47] dark:text-amber-300 font-bold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-amber-500" />
          Tuton
        </button>
      </div>
    </header>
  );
};
