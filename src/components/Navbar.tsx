import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Moon, 
  Sun, 
  Bell, 
  BellOff, 
  Database, 
  Plus, 
  Search 
} from 'lucide-react';

interface Props {
  activeTab: 'DASHBOARD' | 'SUBJECTS' | 'CALENDAR' | 'ANALYTICS';
  onTabChange: (tab: 'DASHBOARD' | 'SUBJECTS' | 'CALENDAR' | 'ANALYTICS') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  hasNotificationPermission: boolean;
  onRequestNotification: () => void;
  onOpenBackupModal: () => void;
  onOpenAddSession: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  isDarkMode,
  onToggleDarkMode,
  hasNotificationPermission,
  onRequestNotification,
  onOpenBackupModal,
  onOpenAddSession,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none">
              StudyPlanner
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
              Progress & Schedule Tracker Mahasiswa
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => onTabChange('DASHBOARD')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'DASHBOARD'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard & Jadwal
          </button>

          <button
            onClick={() => onTabChange('SUBJECTS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'SUBJECTS'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Mata Kuliah
          </button>

          <button
            onClick={() => onTabChange('CALENDAR')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'CALENDAR'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Kalender
          </button>

          <button
            onClick={() => onTabChange('ANALYTICS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'ANALYTICS'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Statistik
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Notification Button */}
          <button
            onClick={onRequestNotification}
            className={`p-2 rounded-xl border transition-colors ${
              hasNotificationPermission
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={hasNotificationPermission ? 'Notifikasi Pengingat Aktif' : 'Aktifkan Notifikasi Pengingat Browser'}
          >
            {hasNotificationPermission ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          {/* Backup / Restore Button */}
          <button
            onClick={onOpenBackupModal}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Backup / Restore JSON Data"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Add Session CTA */}
          <button
            onClick={onOpenAddSession}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">+ Sesi Baru</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-4 py-1.5 flex items-center justify-around">
        <button
          onClick={() => onTabChange('DASHBOARD')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold p-1 ${
            activeTab === 'DASHBOARD' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => onTabChange('SUBJECTS')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold p-1 ${
            activeTab === 'SUBJECTS' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Matkul
        </button>
        <button
          onClick={() => onTabChange('CALENDAR')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold p-1 ${
            activeTab === 'CALENDAR' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Kalender
        </button>
        <button
          onClick={() => onTabChange('ANALYTICS')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold p-1 ${
            activeTab === 'ANALYTICS' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Statistik
        </button>
      </div>
    </header>
  );
};
