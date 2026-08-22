import React, { useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  FileText, 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Award, 
  Plus, 
  Percent, 
  Check, 
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  BarChart3,
  Trash2,
  Tag
} from 'lucide-react';
import { Subject, TutonTaskItem } from '../types';

interface Props {
  subjects: Subject[];
  tutonTasks: TutonTaskItem[];
  onAddTutonTask: (task: TutonTaskItem) => void;
  onToggleTutonTaskCompleted: (taskId: string) => void;
  onDeleteTutonTask: (taskId: string) => void;
  onGenerate8TutonTasks: (subjectId: string, startDate: string) => void;
}

export const TutonView: React.FC<Props> = ({
  subjects,
  tutonTasks,
  onAddTutonTask,
  onToggleTutonTaskCompleted,
  onDeleteTutonTask,
  onGenerate8TutonTasks,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ROADMAP' | 'TASKS' | 'CALCULATOR' | 'GENERATOR' | 'GUIDE'>('ROADMAP');

  // Filter state for Tuton Tasks tab
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [selectedTaskTypeFilter, setSelectedTaskTypeFilter] = useState<string>('ALL');

  // Calculator State
  const [calcSelectedSubject, setCalcSelectedSubject] = useState<string>(subjects[0]?.id || '');
  const [calcAttendance, setCalcAttendance] = useState<number>(100); // 0-100%

  // Progress Calculations for Tuton Tracker
  const totalTutonTasksCount = tutonTasks.length;
  const completedTutonTasksCount = tutonTasks.filter((t) => t.isCompleted).length;
  const overallTutonPercentage = totalTutonTasksCount > 0 ? Math.round((completedTutonTasksCount / totalTutonTasksCount) * 100) : 0;

  const totalTugasCount = tutonTasks.filter((t) => t.taskType.startsWith('TUGAS')).length;
  const completedTugasCount = tutonTasks.filter((t) => t.taskType.startsWith('TUGAS') && t.isCompleted).length;
  const [calcDiscussionAvg, setCalcDiscussionAvg] = useState<number>(85); // 0-100
  const [calcTask1, setCalcTask1] = useState<number>(85);
  const [calcTask2, setCalcTask2] = useState<number>(80);
  const [calcTask3, setCalcTask3] = useState<number>(90);
  const [calcUasScore, setCalcUasScore] = useState<number>(75);

  // Auto Generator state
  const [genSubjectId, setGenSubjectId] = useState<string>(subjects[0]?.id || '');
  const [genStartDate, setGenStartDate] = useState<string>('2026-09-14');
  const [genGenerated, setGenGenerated] = useState<boolean>(false);

  // Add Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || '');
  const [newSessionNumber, setNewSessionNumber] = useState<number>(1);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTaskType, setNewTaskType] = useState<TutonTaskItem['taskType']>('DISKUSI');
  const [newDueDate, setNewDueDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState<string>('');

  // Math Calculations for UT Tuton Grade
  const taskAvg = Math.round((calcTask1 + calcTask2 + calcTask3) / 3);
  const tutonScore = Math.round((calcAttendance * 0.20) + (calcDiscussionAvg * 0.30) + (taskAvg * 0.50));
  const uasQualifies = calcUasScore >= 30;
  
  // Final Course Score: 30% Tuton + 70% UAS (if UAS >= 30, else 100% UAS)
  const finalGradeScore = uasQualifies 
    ? Math.round((tutonScore * 0.30) + (calcUasScore * 0.70)) 
    : calcUasScore;

  const getLetterGrade = (score: number) => {
    if (score >= 85) return { letter: 'A', status: 'Sangat Memuaskan', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' };
    if (score >= 80) return { letter: 'A-', status: 'Sangat Baik', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' };
    if (score >= 75) return { letter: 'B', status: 'Baik', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' };
    if (score >= 70) return { letter: 'B-', status: 'Cukup Baik', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' };
    if (score >= 60) return { letter: 'C', status: 'Cukup', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' };
    if (score >= 50) return { letter: 'D', status: 'Kurang', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' };
    return { letter: 'E', status: 'Gagal', color: 'text-rose-700 bg-rose-100 dark:bg-rose-900/60 border-rose-300 dark:border-rose-800' };
  };

  const gradeInfo = getLetterGrade(finalGradeScore);

  const handleGenerate = () => {
    if (!genSubjectId || !genStartDate) return;
    onGenerate8TutonTasks(genSubjectId, genStartDate);
    setGenGenerated(true);
    setTimeout(() => setGenGenerated(false), 4000);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const subj = subjects.find(s => s.id === newSubjectId);
    
    const newTask: TutonTaskItem = {
      id: `tuton-manual-${Date.now()}`,
      subjectId: newSubjectId,
      subjectCode: subj?.code || 'UT',
      subjectName: subj?.name || 'Mata Kuliah UT',
      sessionNumber: Number(newSessionNumber),
      title: newTitle.trim(),
      taskType: newTaskType,
      dueDate: newDueDate,
      time: '23:59',
      isCompleted: false,
      notes: newNotes.trim() || undefined,
    };

    onAddTutonTask(newTask);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewNotes('');
  };

  // Filter tutonTasks
  const filteredTutonTasks = tutonTasks.filter((t) => {
    if (selectedSubjectFilter !== 'ALL' && t.subjectId !== selectedSubjectFilter) return false;
    if (selectedTaskTypeFilter !== 'ALL' && t.taskType !== selectedTaskTypeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-stone-900 via-[#2C241E] to-[#1C2826] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-[#8D6A47]/30">
        <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tuton Planner & Simulator Nilai UT
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('CALCULATOR')}
              className="px-4 py-2.5 rounded-xl bg-[#8D6A47] hover:bg-[#78593A] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer border border-[#A77B50]"
            >
              <Calculator className="w-4 h-4 text-amber-200" />
              <span>Hitung Nilai UT</span>
            </button>
            <button
              onClick={() => setActiveSubTab('GENERATOR')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-100 font-semibold text-xs border border-emerald-400/30 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Generate 8 Sesi Tuton</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-[#E8E1D5] dark:border-stone-800 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('ROADMAP')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'ROADMAP'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#F4EFE6] dark:hover:bg-stone-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Roadmap 8 Sesi Tuton
        </button>

        <button
          onClick={() => setActiveSubTab('TASKS')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'TASKS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#F4EFE6] dark:hover:bg-stone-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Tracker Tuton ({completedTutonTasksCount}/{totalTutonTasksCount})
        </button>

        <button
          onClick={() => setActiveSubTab('CALCULATOR')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'CALCULATOR'
              ? 'bg-[#8D6A47] text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#F4EFE6] dark:hover:bg-stone-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Simulator Nilai UT
        </button>

        <button
          onClick={() => setActiveSubTab('GENERATOR')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'GENERATOR'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#F4EFE6] dark:hover:bg-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Auto Generator Sesi Tuton
        </button>

        <button
          onClick={() => setActiveSubTab('GUIDE')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'GUIDE'
              ? 'bg-[#8D6A47] text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-[#F4EFE6] dark:hover:bg-stone-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Panduan Sukses Tuton
        </button>
      </div>

      {/* Sub Tab 1: Roadmap 8 Sesi Tuton */}
      {activeSubTab === 'ROADMAP' && (
        <div className="space-y-6">
          {/* Official Timeline Notice Card */}
          <div className="bg-gradient-to-r from-[#FAF7F2] via-[#F4EFE6] to-[#FDF6EC] dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-800 rounded-2xl p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#0D7A57] text-white font-bold text-xs">UT</span>
                <div>
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>Lini Masa Resmi Tuton Semester Ganjil TA 2026/2027</span>
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    Wajib diperhatikan dan dipatuhi oleh seluruh mahasiswa Universitas Terbuka.
                  </p>
                </div>
              </div>

              <div className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>Batas Submit Tugas: Pukul 15.00 WIB!</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              {/* Forum Diskusi */}
              <div className="bg-white/90 dark:bg-stone-900/90 rounded-xl p-4 border border-[#E8E1D5] dark:border-stone-700 space-y-2">
                <h4 className="font-extrabold text-[#0D7A57] dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-4 h-4 text-[#10B981]" />
                  <span>1. Jadwal Forum Diskusi Mingguan</span>
                </h4>
                <ul className="space-y-1.5 text-stone-700 dark:text-stone-300 font-medium">
                  <li className="flex justify-between border-b border-[#F0EAE1] dark:border-stone-800 pb-1">
                    <span>Sesi 1:</span> <strong className="text-stone-900 dark:text-stone-100">14 – 20 September 2026</strong>
                  </li>
                  <li className="flex justify-between border-b border-[#F0EAE1] dark:border-stone-800 pb-1">
                    <span>Sesi 2:</span> <strong className="text-stone-900 dark:text-stone-100">21 – 27 September 2026</strong>
                  </li>
                  <li className="flex justify-between border-b border-[#F0EAE1] dark:border-stone-800 pb-1">
                    <span>Sesi 4:</span> <strong className="text-stone-900 dark:text-stone-100">05 – 11 Oktober 2026</strong>
                  </li>
                  <li className="flex justify-between border-b border-[#F0EAE1] dark:border-stone-800 pb-1">
                    <span>Sesi 6:</span> <strong className="text-stone-900 dark:text-stone-100">19 – 25 Oktober 2026</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Sesi 8:</span> <strong className="text-stone-900 dark:text-stone-100">02 – 08 November 2026</strong>
                  </li>
                </ul>
              </div>

              {/* Tugas Tutorial */}
              <div className="bg-white/90 dark:bg-stone-900/90 rounded-xl p-4 border border-[#E5DDD0] dark:border-stone-700 space-y-2">
                <h4 className="font-extrabold text-[#8D6A47] dark:text-amber-300 flex items-center gap-1.5 text-xs">
                  <Award className="w-4 h-4 text-[#8D6A47]" />
                  <span>2. Tenggat Tugas Tutorial (Masa 2 Minggu)</span>
                </h4>
                <ul className="space-y-1.5 text-stone-700 dark:text-stone-300 font-medium">
                  <li className="flex justify-between items-center border-b border-[#F0EAE1] dark:border-stone-800 pb-1">
                    <span>Tugas 1 (Sesi 3):</span> 
                    <strong className="text-[#8D6A47] dark:text-amber-400">28 Sept – 12 Okt 2026 (15:00 WIB)</strong>
                  </li>
                  <li className="flex justify-between items-center border-b border-[#F0EAE1] dark:border-stone-800 pb-1">
                    <span>Tugas 2 (Sesi 5):</span> 
                    <strong className="text-[#8D6A47] dark:text-amber-400">12 Okt – 26 Okt 2026 (15:00 WIB)</strong>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Tugas 3 (Sesi 7):</span> 
                    <strong className="text-[#8D6A47] dark:text-amber-400">26 Okt – 09 Nov 2026 (15:00 WIB)</strong>
                  </li>
                </ul>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold pt-1">
                  ⚠️ Catatan: Batas akhir penyerahan seluruh tugas pukul 15.00 WIB pada tanggal yang ditentukan!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-[#E8E1D5] dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#10B981]" />
                  Struktur Standard 8 Sesi Tutorial Online UT
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Tuton berlangsung selama 8 minggu berturut-turut. Setiap sesi memiliki durasi pengerjaan aktif & forum diskusi.
                </p>
              </div>

              <a
                href="https://elearning.ut.ac.id"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D7A57] hover:text-[#0A5D42] bg-[#E8F8F2] dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-[#A7E8CD] dark:border-emerald-800 transition-colors"
              >
                <span>Buka Elearning UT</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 8 Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                { num: 1, title: 'Sesi 1: Orientasi & Inisiasi 1', dateText: '14 – 20 Sep 2026', task: 'Diskusi 1', highlight: false, desc: 'Perkenalan, klik Kehadiran Sesi 1, pelajari Modul 1 BMP, dan jawab Forum Diskusi 1.' },
                { num: 2, title: 'Sesi 2: Inisiasi 2', dateText: '21 – 27 Sep 2026', task: 'Diskusi 2', highlight: false, desc: 'Konfirmasi Kehadiran Sesi 2, baca Inisiasi 2, berikan tanggapan diskusi dengan bahasa sendiri.' },
                { num: 3, title: 'Sesi 3: Inisiasi 3 & TUGAS 1', dateText: '28 Sept – 12 Okt 2026', task: 'Tugas 1 (s.d 15.00 WIB)', highlight: true, badge: 'Tugas 1 Release', desc: 'Rilis Tugas Tutorial 1! Waktu pengerjaan 2 minggu. Deadline 12 Okt Pukul 15.00 WIB.' },
                { num: 4, title: 'Sesi 4: Inisiasi 4', dateText: '05 – 11 Okt 2026', task: 'Diskusi 4', highlight: false, desc: 'Konfirmasi Kehadiran Sesi 4, tanggapi Forum Diskusi 4 & review pengerjaan Tugas 1.' },
                { num: 5, title: 'Sesi 5: Inisiasi 5 & TUGAS 2', dateText: '12 Okt – 26 Okt 2026', task: 'Tugas 2 (s.d 15.00 WIB)', highlight: true, badge: 'Tugas 2 Release', desc: 'Rilis Tugas Tutorial 2! Waktu pengerjaan 2 minggu. Deadline 26 Okt Pukul 15.00 WIB.' },
                { num: 6, title: 'Sesi 6: Inisiasi 6', dateText: '19 – 25 Okt 2026', task: 'Diskusi 6', highlight: false, desc: 'Konfirmasi Kehadiran Sesi 6, diskusikan materi modul bersama tutor & rekan mahasiswa.' },
                { num: 7, title: 'Sesi 7: Inisiasi 7 & TUGAS 3', dateText: '26 Okt – 09 Nov 2026', task: 'Tugas 3 (s.d 15.00 WIB)', highlight: true, badge: 'Tugas 3 Release', desc: 'Rilis Tugas Tutorial 3! Waktu pengerjaan 2 minggu. Deadline 09 Nov Pukul 15.00 WIB.' },
                { num: 8, title: 'Sesi 8: Sesi Penutup & Refleksi', dateText: '02 – 08 Nov 2026', task: 'Diskusi 8 & Persiapan UAS', highlight: false, desc: 'Diskusi Rangkuman Sesi 8, kuis latihan mandiri, dan persiapan menghadapi UAS UT.' },
              ].map((sesi) => (
                <div 
                  key={sesi.num}
                  className={`rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
                    sesi.highlight 
                      ? 'bg-[#FDF6EC] dark:bg-amber-950/30 border-[#E8D6BF] dark:border-amber-700/80 shadow-xs' 
                      : 'bg-[#FAF7F2] dark:bg-stone-800/50 border-[#E8E1D5] dark:border-stone-700/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        sesi.highlight 
                          ? 'bg-[#8D6A47] text-white' 
                          : 'bg-[#E8F8F2] dark:bg-emerald-950 text-[#0D7A57] dark:text-emerald-300'
                      }`}>
                        Sesi {sesi.num}
                      </span>
                      {sesi.badge && (
                        <span className="text-[10px] font-extrabold text-[#8D6A47] dark:text-amber-300 bg-[#F5ECE1] dark:bg-amber-900/50 px-2 py-0.5 rounded-full border border-[#DFD5C4] dark:border-amber-700">
                          {sesi.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-0.5">
                      {sesi.title}
                    </h4>

                    <div className="text-[11px] font-bold text-[#0D7A57] dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#10B981]" />
                      <span>{sesi.dateText}</span>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mt-1">
                      {sesi.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8E1D5]/60 dark:border-stone-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#8D6A47]" />
                      {sesi.task}
                    </span>
                    <button
                      onClick={() => {
                        setNewSessionNumber(sesi.num);
                        setIsAddModalOpen(true);
                      }}
                      className="text-[#0D7A57] hover:text-[#0A5D42] dark:text-emerald-400 font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>+ Tambah Task</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Tracker Tuton Tasks */}
      {activeSubTab === 'TASKS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-[#E8E1D5] dark:border-stone-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#8D6A47]" />
                  Tracker Tugas Tuton UT
                </h3>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0D7A57] hover:bg-[#0A5D42] text-white shadow-md shadow-emerald-700/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Item Tuton</span>
              </button>
            </div>

            {/* Tracking Progress Tuton Per Mata Kuliah */}
            <div className="bg-gradient-to-br from-[#FAF7F2] via-[#F4EFE6] to-[#FDF6EC] dark:from-stone-800/90 dark:via-stone-800/60 dark:to-stone-900/90 rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-700/80 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E8E1D5]/80 dark:border-stone-700/80">
                <div>
                  <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#0D7A57] dark:text-emerald-400" />
                    <span>Progress Tuton Per Mata Kuliah</span>
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Ringkasan persentase penyelesaian Sesi 1-8 dan Tugas Tutorial 1, 2, 3 untuk tiap mata kuliah. Klik tombol <strong className="text-stone-700 dark:text-stone-300">Filter</strong> pada kartu untuk menyaring daftar tugas.
                  </p>
                </div>

                {/* Stat Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 text-xs flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-stone-500 dark:text-stone-400 font-medium">Total Selesai:</span>
                    <strong className="text-[#0D7A57] dark:text-emerald-400 font-black">{completedTutonTasksCount}/{totalTutonTasksCount} ({overallTutonPercentage}%)</strong>
                  </div>
                  <div className="bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 text-xs flex items-center gap-1.5 shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-[#8D6A47]" />
                    <span className="text-stone-500 dark:text-stone-400 font-medium">Tugas 1-3:</span>
                    <strong className="text-[#8D6A47] dark:text-amber-400 font-black">{completedTugasCount}/{totalTugasCount} Selesai</strong>
                  </div>
                </div>
              </div>

              {/* Grid of Subject Progress Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {subjects.map((s) => {
                  const subjTasks = tutonTasks.filter((t) => t.subjectId === s.id);
                  const totalCount = subjTasks.length;
                  const completedCount = subjTasks.filter((t) => t.isCompleted).length;
                  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                  const diskusiTotal = subjTasks.filter((t) => t.taskType === 'DISKUSI').length;
                  const diskusiDone = subjTasks.filter((t) => t.taskType === 'DISKUSI' && t.isCompleted).length;

                  const tugas1 = subjTasks.find((t) => t.taskType === 'TUGAS_1');
                  const tugas2 = subjTasks.find((t) => t.taskType === 'TUGAS_2');
                  const tugas3 = subjTasks.find((t) => t.taskType === 'TUGAS_3');

                  const isSelected = selectedSubjectFilter === s.id;

                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#E8F8F2]/90 dark:bg-emerald-950/60 border-[#10B981] dark:border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-stone-900 border-[#E8E1D5] dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#0D7A57] text-white font-black text-xs shadow-2xs">
                            {s.code}
                          </span>
                          <div>
                            <h5 className="text-xs font-extrabold text-stone-900 dark:text-stone-100 line-clamp-1">
                              {s.name}
                            </h5>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400">
                              {s.sks} SKS • {completedCount}/{totalCount} Task Selesai
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            percentage === 100
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : percentage >= 50
                              ? 'bg-[#E8F8F2] text-[#0D7A57] dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-[#FDF6EC] text-[#8D6A47] dark:bg-amber-950/80 dark:text-amber-300'
                          }`}>
                            {percentage}%
                          </span>

                          <button
                            type="button"
                            onClick={() => setSelectedSubjectFilter(isSelected ? 'ALL' : s.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#0D7A57] text-white border-[#0D7A57]'
                                : 'bg-[#FAF7F2] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#F4EFE6]'
                            }`}
                          >
                            {isSelected ? 'Semua' : 'Filter'}
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-[#E8E1D5] dark:bg-stone-800 rounded-full overflow-hidden my-2">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            percentage === 100
                              ? 'bg-[#10B981]'
                              : percentage >= 50
                              ? 'bg-[#0D7A57]'
                              : 'bg-[#8D6A47]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="grid grid-cols-4 gap-1.5 text-[10px] pt-1">
                        <div className="bg-[#FAF7F2] dark:bg-stone-800/80 rounded p-1.5 text-center border border-[#E8E1D5]/60 dark:border-stone-800">
                          <span className="text-stone-400 block text-[9px]">Diskusi 1-8</span>
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            💬 {diskusiDone}/{diskusiTotal}
                          </span>
                        </div>

                        <div className="bg-[#FAF7F2] dark:bg-stone-800/80 rounded p-1.5 text-center border border-[#E8E1D5]/60 dark:border-stone-800">
                          <span className="text-stone-400 block text-[9px]">Tugas 1</span>
                          {tugas1 ? (
                            tugas1.isCompleted ? (
                              <span className="font-bold text-[#0D7A57] dark:text-emerald-400">✅ Done</span>
                            ) : (
                              <span className="font-bold text-[#8D6A47] dark:text-amber-400">⏳ Pending</span>
                            )
                          ) : (
                            <span className="text-stone-400 font-medium">-</span>
                          )}
                        </div>

                        <div className="bg-[#FAF7F2] dark:bg-stone-800/80 rounded p-1.5 text-center border border-[#E8E1D5]/60 dark:border-stone-800">
                          <span className="text-stone-400 block text-[9px]">Tugas 2</span>
                          {tugas2 ? (
                            tugas2.isCompleted ? (
                              <span className="font-bold text-[#0D7A57] dark:text-emerald-400">✅ Done</span>
                            ) : (
                              <span className="font-bold text-[#8D6A47] dark:text-amber-400">⏳ Pending</span>
                            )
                          ) : (
                            <span className="text-stone-400 font-medium">-</span>
                          )}
                        </div>

                        <div className="bg-[#FAF7F2] dark:bg-stone-800/80 rounded p-1.5 text-center border border-[#E8E1D5]/60 dark:border-stone-800">
                          <span className="text-stone-400 block text-[9px]">Tugas 3</span>
                          {tugas3 ? (
                            tugas3.isCompleted ? (
                              <span className="font-bold text-[#0D7A57] dark:text-emerald-400">✅ Done</span>
                            ) : (
                              <span className="font-bold text-[#8D6A47] dark:text-amber-400">⏳ Pending</span>
                            )
                          ) : (
                            <span className="text-stone-400 font-medium">-</span>
                          )}
                        </div>
                      </div>

                      {totalCount === 0 && (
                        <div className="mt-2 text-center py-1.5 bg-[#FDF6EC] dark:bg-amber-950/40 rounded border border-[#E8D6BF] dark:border-amber-800 text-[10px] text-[#8D6A47] dark:text-amber-300 flex items-center justify-between px-2">
                          <span>Belum ada task Tuton terdaftar.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setGenSubjectId(s.id);
                              setActiveSubTab('GENERATOR');
                            }}
                            className="font-bold text-[#0D7A57] dark:text-emerald-400 underline cursor-pointer"
                          >
                            + Generate 8 Sesi
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl border border-[#E8E1D5] dark:border-stone-700 text-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-semibold text-stone-700 dark:text-stone-300">Filter Matkul:</span>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="bg-white dark:bg-stone-900 border border-[#E8E1D5] dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs font-medium"
                >
                  <option value="ALL">Semua Mata Kuliah</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-700 dark:text-stone-300">Tipe Task:</span>
                <select
                  value={selectedTaskTypeFilter}
                  onChange={(e) => setSelectedTaskTypeFilter(e.target.value)}
                  className="bg-white dark:bg-stone-900 border border-[#E8E1D5] dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs font-medium"
                >
                  <option value="ALL">Semua Tipe</option>
                  <option value="DISKUSI">Diskusi Sesi</option>
                  <option value="TUGAS_1">Tugas 1 (Sesi 3)</option>
                  <option value="TUGAS_2">Tugas 2 (Sesi 5)</option>
                  <option value="TUGAS_3">Tugas 3 (Sesi 7)</option>
                  <option value="KEHADIRAN">Kehadiran</option>
                  <option value="UAS">Persiapan UAS</option>
                </select>
              </div>
            </div>

            {/* List of Tasks */}
            <div className="space-y-3">
              {filteredTutonTasks.length === 0 ? (
                <div className="text-center py-10 px-4 bg-[#FAF7F2] dark:bg-stone-800/40 rounded-2xl border border-dashed border-[#E8E1D5] dark:border-stone-700 space-y-3">
                  <BookOpen className="w-10 h-10 text-stone-400 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                      Belum Ada Item Tuton
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                      Gunakan fitur **Auto Generator** untuk membuat otomatis 8 Sesi Tuton (Inisiasi 1-8 dan Tugas 1-3) untuk mata kuliah UT kamu.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('GENERATOR')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0D7A57] hover:bg-[#0A5D42] rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Auto Generate 8 Sesi Tuton</span>
                  </button>
                </div>
              ) : (
                filteredTutonTasks.map((task) => {
                  const subj = subjects.find(s => s.id === task.subjectId);
                  const isTaskUrgent = task.taskType.startsWith('TUGAS');

                  return (
                    <div 
                      key={task.id} 
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        task.isCompleted 
                          ? 'bg-[#E8F8F2]/60 dark:bg-emerald-950/20 border-[#A7E8CD] dark:border-emerald-800/60' 
                          : isTaskUrgent
                            ? 'bg-[#FDF6EC] dark:bg-amber-950/20 border-[#E8D6BF] dark:border-amber-800'
                            : 'bg-white dark:bg-stone-800/80 border-[#E8E1D5] dark:border-stone-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onToggleTutonTaskCompleted(task.id)}
                          className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                            task.isCompleted 
                              ? 'bg-[#10B981] border-[#10B981] text-white' 
                              : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 hover:border-[#10B981]'
                          }`}
                        >
                          {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#E8F8F2] dark:bg-emerald-950 text-[#0D7A57] dark:text-emerald-300 border border-[#A7E8CD] dark:border-emerald-800">
                              Sesi {task.sessionNumber}
                            </span>

                            <span className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
                              {task.subjectCode} - {task.subjectName}
                            </span>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              task.taskType.startsWith('TUGAS')
                                ? 'bg-[#8D6A47] text-white'
                                : 'bg-[#E8E1D5] dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                            }`}>
                              {task.taskType}
                            </span>
                          </div>

                          <h4 className={`text-sm font-bold ${
                            task.isCompleted ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'
                          }`}>
                            {task.title}
                          </h4>

                          <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 flex-wrap">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-[#8D6A47]" />
                              Batas Waktu: {task.dueDate} ({task.time || '23:59'})
                            </span>

                            {task.notes && (
                              <span className="text-stone-600 dark:text-stone-300 italic">
                                "{task.notes}"
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onDeleteTutonTask(task.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Hapus Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 3: Simulator Nilai Tuton UT */}
      {activeSubTab === 'CALCULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-[#E8E1D5] dark:border-stone-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#8D6A47]" />
                Simulator & Kalkulator Kontribusi Nilai Tuton UT
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Aturan UT: Nilai Tuton = (20% Kehadiran) + (30% Rata-rata Diskusi) + (50% Rata-rata Tugas 1-3).
              </p>
            </div>

            {/* Subject Selector */}
            {subjects.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Pilih Mata Kuliah Evaluasi:
                </label>
                <select
                  value={calcSelectedSubject}
                  onChange={(e) => setCalcSelectedSubject(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name} ({s.sks || 3} SKS)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Inputs Grid */}
            <div className="space-y-4">
              {/* 1. Kehadiran */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E8E1D5] dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span>1. Kehadiran (Bobot 20%)</span>
                  </label>
                  <span className="text-xs font-extrabold text-[#0D7A57] dark:text-emerald-400 bg-[#E8F8F2] dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-[#A7E8CD] dark:border-emerald-800">
                    {calcAttendance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={calcAttendance}
                  onChange={(e) => setCalcAttendance(Number(e.target.value))}
                  className="w-full accent-[#0D7A57] cursor-pointer"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Selalu klik tombol konfirmasi kehadiran di setiap Sesi 1 s.d 8 untuk mendapatkan 100%.
                </p>
              </div>

              {/* 2. Diskusi */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E8E1D5] dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-[#0D7A57]" />
                    <span>2. Rata-Rata Nilai Diskusi Sesi 1–8 (Bobot 30%)</span>
                  </label>
                  <span className="text-xs font-extrabold text-[#0D7A57] dark:text-emerald-400 bg-[#E8F8F2] dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-[#A7E8CD] dark:border-emerald-800">
                    {calcDiscussionAvg} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={calcDiscussionAvg}
                  onChange={(e) => setCalcDiscussionAvg(Number(e.target.value))}
                  className="w-full accent-[#0D7A57] cursor-pointer"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Nilai rata-rata dari keaktifan menjawab pertanyaan diskusi di forum sesi 1 sampai 8.
                </p>
              </div>

              {/* 3. Tugas Tutorial 1, 2, 3 */}
              <div className="p-4 rounded-xl bg-[#FDF6EC] dark:bg-amber-950/20 border border-[#E8D6BF] dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#8D6A47] dark:text-amber-200 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#8D6A47]" />
                    <span>3. Nilai Tugas Tutorial 1, 2, & 3 (Bobot 50%)</span>
                  </label>
                  <span className="text-xs font-extrabold text-[#8D6A47] dark:text-amber-300 bg-[#F5ECE1] dark:bg-amber-900/60 px-2 py-0.5 rounded-md border border-[#DFD5C4] dark:border-amber-700">
                    Rata-rata: {taskAvg}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Tugas 1 (Sesi 3)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={calcTask1}
                      onChange={(e) => setCalcTask1(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-white dark:bg-stone-900 border border-[#E8E1D5] dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Tugas 2 (Sesi 5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={calcTask2}
                      onChange={(e) => setCalcTask2(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-white dark:bg-stone-900 border border-[#E8E1D5] dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Tugas 3 (Sesi 7)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={calcTask3}
                      onChange={(e) => setCalcTask3(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-white dark:bg-stone-900 border border-[#E8E1D5] dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Estimasi UAS */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E8E1D5] dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#8D6A47]" />
                    <span>4. Estimasi Nilai UAS (Ujian Akhir Semester)</span>
                  </label>
                  <span className="text-xs font-extrabold text-[#8D6A47] dark:text-amber-400 bg-[#FDF6EC] dark:bg-stone-950 px-2 py-0.5 rounded-md border border-[#E8D6BF] dark:border-stone-800">
                    {calcUasScore} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={calcUasScore}
                  onChange={(e) => setCalcUasScore(Number(e.target.value))}
                  className="w-full accent-[#8D6A47] cursor-pointer"
                />
                <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Syarat Mutlak UT: Nilai UAS minimal 30 agar nilai Tuton berkontribusi ke nilai akhir.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results Card */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-[#E8E1D5] dark:border-stone-800 shadow-sm space-y-6 sticky top-24">
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#10B981]" />
                Hasil Simulasi Nilai Akhir
              </h4>

              {/* Score breakdown card */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/70 border border-[#E8E1D5] dark:border-stone-700 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-600 dark:text-stone-400">Total Nilai Tuton (100%):</span>
                  <span className="font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                    {tutonScore}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-600 dark:text-stone-400">Kontribusi Tuton (30%):</span>
                  <span className="font-bold text-[#0D7A57] dark:text-emerald-400">
                    {uasQualifies ? (tutonScore * 0.30).toFixed(1) : '0 (UAS < 30)'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-600 dark:text-stone-400">Kontribusi UAS (70%):</span>
                  <span className="font-bold text-[#8D6A47] dark:text-amber-400">
                    {(calcUasScore * 0.70).toFixed(1)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E8E1D5] dark:border-stone-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    Estimasi Nilai Matkul:
                  </span>
                  <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                    {finalGradeScore}
                  </span>
                </div>
              </div>

              {/* Final Grade Letter */}
              <div className={`p-4 rounded-xl border text-center space-y-1 ${gradeInfo.color}`}>
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  Estimasi Huruf Mutu UT
                </div>
                <div className="text-4xl font-extrabold">
                  {gradeInfo.letter}
                </div>
                <div className="text-xs font-bold mt-1">
                  {gradeInfo.status}
                </div>
              </div>

              {/* Qualification Status Badge */}
              <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                uasQualifies 
                  ? 'bg-[#E8F8F2] dark:bg-emerald-950/40 border-[#A7E8CD] dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                {uasQualifies ? (
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Kontribusi Aktif:</strong> Nilai UAS kamu ({calcUasScore}) telah memenuhi syarat batas minimal 30. Nilai Tuton berkontribusi penuh 30% ke nilai akhir.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Peringatan Syarat UT:</strong> Nilai UAS kamu ({calcUasScore}) di bawah 30. Dalam aturan UT, nilai Tuton HANGUS dan tidak berkontribusi jika UAS di bawah 30.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 4: Auto Generator Jadwal Tuton */}
      {activeSubTab === 'GENERATOR' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-[#E8E1D5] dark:border-stone-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0D7A57]" />
              Auto Generator 8 Sesi Tuton UT
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Buat otomatis seluruh 8 Sesi Tuton (Inisiasi 1-8, Forum Diskusi, & Tugas 1-3) ke dalam database khusus Tuton UT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/50 border border-[#E8E1D5] dark:border-stone-700">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  1. Pilih Mata Kuliah UT:
                </label>
                <select
                  value={genSubjectId}
                  onChange={(e) => setGenSubjectId(e.target.value)}
                  className="w-full bg-white dark:bg-stone-900 border border-[#E8E1D5] dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    2. Tanggal Awal Sesi 1 Tuton:
                  </label>
                  <button
                    type="button"
                    onClick={() => setGenStartDate('2026-09-14')}
                    className="text-[11px] font-bold text-[#0D7A57] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>📅 Preset Resmi UT 2026/2027 (14 Sep 2026)</span>
                  </button>
                </div>
                <input
                  type="date"
                  value={genStartDate}
                  onChange={(e) => setGenStartDate(e.target.value)}
                  className="w-full bg-white dark:bg-stone-900 border border-[#E8E1D5] dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
                {genStartDate === '2026-09-14' && (
                  <p className="text-[11px] font-semibold text-[#0D7A57] dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Menggunakan Lini Masa Resmi UT TA 2026/2027! Tugas 1-3 diset deadline pukul 15.00 WIB.</span>
                  </p>
                )}
              </div>

              <button
                onClick={handleGenerate}
                className="w-full py-3 px-4 rounded-xl bg-[#0D7A57] hover:bg-[#0A5D42] text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate 8 Sesi Tuton (Data Khusus Tuton)</span>
              </button>

              {genGenerated && (
                <div className="p-3 rounded-xl bg-[#E8F8F2] dark:bg-emerald-950/60 border border-[#A7E8CD] dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span>Berhasil! 8 Sesi Tuton telah dibuat di database Tuton, terpisah dari Dashboard.</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs text-stone-600 dark:text-stone-400">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Item Sesi Yang Akan Dibuat Otomatis:
              </h4>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Sesi 1 & 2</strong>: Inisiasi Materi & Forum Diskusi Sesi 1-2.</li>
                <li><strong>Sesi 3</strong>: Diskusi 3 + <span className="text-[#8D6A47] dark:text-amber-400 font-bold">Tugas Tutorial 1</span>.</li>
                <li><strong>Sesi 4</strong>: Inisiasi Materi & Forum Diskusi Sesi 4.</li>
                <li><strong>Sesi 5</strong>: Diskusi 5 + <span className="text-[#8D6A47] dark:text-amber-400 font-bold">Tugas Tutorial 2</span>.</li>
                <li><strong>Sesi 6</strong>: Inisiasi Materi & Forum Diskusi Sesi 6.</li>
                <li><strong>Sesi 7</strong>: Diskusi 7 + <span className="text-[#8D6A47] dark:text-amber-400 font-bold">Tugas Tutorial 3</span>.</li>
                <li><strong>Sesi 8</strong>: Inisiasi 8, Diskusi Penutup, & Refleksi UAS.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 5: Panduan & Tips Tuton UT */}
      {activeSubTab === 'GUIDE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-[#E8E1D5] dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              Tips Bebas Plagiarisme & Nilai Maksimal Diskusi
            </h3>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed list-disc list-inside">
              <li><strong>Gunakan Bahasa Sendiri (Parafrase)</strong>: Jangan copy-paste langsung dari BMP atau internet. Tulis ulang dengan analisis kamu sendiri.</li>
              <li><strong>Sertakan Referensi BMP</strong>: Tuliskan rujukan sumber (Contoh: <em>Berdasarkan BMP EKMA4116 Modul 3 Halaman 3.12...</em>).</li>
              <li><strong>Tanggapi di Awal Sesi</strong>: Berikan respon diskusi di hari Senin–Rabu agar tutor memiliki waktu memberikan penilaian optimal.</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-[#E8E1D5] dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8D6A47]" />
              Aturan Pengerjaan Tugas 1, 2, 3
            </h3>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed list-disc list-inside">
              <li><strong>Format File Unggahan</strong>: Gunakan format PDF atau MS Word (.docx) sesuai instruksi di modul tugas elearning.ut.ac.id.</li>
              <li><strong>Batas Ukuran File</strong>: Usahakan ukuran file di bawah 2MB agar berhasil diunggah ke server UT.</li>
              <li><strong>Jangan Mengunggah di Menit Terakhir</strong>: Server Elearning UT sering mengalami lonjakan traffic tinggi mendekati deadline hari Minggu malam pukul 23.59 WIB.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 max-w-md w-full border border-[#E8E1D5] dark:border-stone-800 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5] dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0D7A57]" />
                Tambah Item Tuton Baru
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Mata Kuliah:
                </label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 rounded-xl px-3 py-2 font-semibold"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Sesi Ke (1-8):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newSessionNumber}
                    onChange={(e) => setNewSessionNumber(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 rounded-xl px-3 py-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Tipe Task:
                  </label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="DISKUSI">Diskusi Forum</option>
                    <option value="TUGAS_1">Tugas Tutorial 1</option>
                    <option value="TUGAS_2">Tugas Tutorial 2</option>
                    <option value="TUGAS_3">Tugas Tutorial 3</option>
                    <option value="KEHADIRAN">Konfirmasi Kehadiran</option>
                    <option value="UAS">Persiapan UAS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Judul Task Tuton:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Diskusi 3 atau Tugas 1 Analisis SWOT"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 rounded-xl px-3 py-2 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Batas Waktu (Deadline):
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 rounded-xl px-3 py-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Catatan / Instruksi Tambahan:
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan pengerjaan atau format file..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#FAF7F2] dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 rounded-xl px-3 py-2 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E1D5] dark:border-stone-700 font-bold text-stone-600 dark:text-stone-300 hover:bg-[#FAF7F2] dark:hover:bg-stone-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0D7A57] hover:bg-[#0A5D42] text-white font-bold cursor-pointer shadow-sm"
                >
                  Simpan Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
