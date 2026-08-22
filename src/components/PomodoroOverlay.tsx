import React, { useState, useEffect, useRef } from 'react';
import { StudySession, Subject } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Lock,
  Clock,
  BookOpen,
  Coffee,
  Brain,
  ShieldAlert,
} from 'lucide-react';
import { playCompletionChime } from '../utils/notifications';

interface PomodoroOverlayProps {
  session: StudySession;
  subject?: Subject;
  onClose: () => void;
  onCompleteSession: (sessionId: string) => void;
  onOpenQuickQuiz?: (session: StudySession) => void;
}

type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

const FOCUS_QUOTES = [
  'Legal Mindset: Pahami logika dan asas hukum, bukan sekadar menghafal teks pasal.',
  'Retrieval Practice: Uji kembali konsep tanpa melihat catatan untuk memperkuat memori jangka panjang.',
  'Sistematisasi Catatan: Hubungkan teori Ilmu Negara dengan struktur konstitusi Indonesia.',
  'Fokus Tanpa Distraksi: Matikan notifikasi HP dan selesaikan 1 siklus Pomodoro penuh.',
  'Konsistensi adalah Kunci: Belajar 25 menit secara rutin jauh lebih efektif daripada SKS (Sistem Kebut Semalam).',
];

export const PomodoroOverlay: React.FC<PomodoroOverlayProps> = ({
  session,
  subject,
  onClose,
  onCompleteSession,
  onOpenQuickQuiz,
}) => {
  // Preset options (in minutes)
  const initialDuration = Math.min(Math.max(session.durationMinutes, 15), 60);
  const [timerMode, setTimerMode] = useState<TimerMode>('FOCUS');
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Set initial duration on mode or targetMinutes change
  useEffect(() => {
    let mins = 25;
    if (timerMode === 'FOCUS') {
      mins = targetMinutes;
    } else if (timerMode === 'SHORT_BREAK') {
      mins = 5;
    } else if (timerMode === 'LONG_BREAK') {
      mins = 15;
    }
    setTimeLeftSeconds(mins * 60);
  }, [timerMode, targetMinutes]);

  // Rotate motivational quotes every 45s
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % FOCUS_QUOTES.length);
    }, 45000);
    return () => clearInterval(quoteInterval);
  }, []);

  // Play audio chime when timer finishes
  const playAlertChime = () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Gentle double-beep chime
      [587.33, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.2, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.35);
      });
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  };

  // Main Timer Countdown Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeftSeconds === 0) {
      playAlertChime();
      if (timerMode === 'FOCUS') {
        setCompletedCycles((prev) => prev + 1);
        setTimerMode('SHORT_BREAK');
      } else {
        setTimerMode('FOCUS');
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeftSeconds, timerMode, isMuted]);

  // Calculate percentage elapsed
  const totalSeconds = (timerMode === 'FOCUS' ? targetMinutes : timerMode === 'SHORT_BREAK' ? 5 : 15) * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeftSeconds) / totalSeconds) * 100));

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleFinishAndComplete = () => {
    onCompleteSession(session.id);
    onClose();
  };

  const handleExitFocusMode = () => {
    if (window.confirm('Yakin ingin keluar dari Mode Fokus Lock? Timer berjalan akan dihentikan.')) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-950 text-stone-100 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-y-auto backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Header / Lock Indicator & Session Badge */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Mode Fokus Aktif</span>
          </div>
          <span className="text-xs text-stone-400 hidden sm:inline">• UI Terkunci untuk Mencegah Distraksi</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
            title={isMuted ? 'Nyalakan Suara Chime' : 'Matikan Suara Chime'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={handleExitFocusMode}
            className="px-3.5 py-2 rounded-xl bg-stone-900/80 hover:bg-rose-950/60 border border-stone-800 hover:border-rose-800 text-stone-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Keluar dari Mode Fokus Lock"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Center Body: Subject Info, Big Timer & Ring, Controls */}
      <div className="my-auto w-full max-w-2xl flex flex-col items-center text-center space-y-8 py-6">
        {/* Subject & Session Title */}
        <div className="space-y-3">
          {subject && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
              <span className="text-stone-300">{subject.code} — {subject.name}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight max-w-xl mx-auto leading-snug">
            {session.title}
          </h1>
          <p className="text-xs text-stone-400 flex items-center justify-center gap-2 font-medium">
            <Brain className="w-4 h-4 text-[#10B981]" />
            <span>Sesi: <strong className="text-stone-200">{session.sessionType}</strong></span>
            <span>•</span>
            <Clock className="w-4 h-4 text-[#B48455]" />
            <span>Siklus Selesai: <strong className="text-emerald-400">{completedCycles} Pomodoro</strong></span>
          </p>
        </div>

        {/* Mode Selector (25m Focus / 5m Short Break / 15m Long Break) */}
        <div className="inline-flex p-1.5 rounded-2xl bg-stone-900/90 border border-stone-800 gap-1.5">
          <button
            onClick={() => {
              setTimerMode('FOCUS');
              setIsRunning(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              timerMode === 'FOCUS'
                ? 'bg-[#0D7A57] text-white shadow-lg shadow-emerald-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Fokus ({targetMinutes}m)</span>
          </button>
          <button
            onClick={() => {
              setTimerMode('SHORT_BREAK');
              setIsRunning(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              timerMode === 'SHORT_BREAK'
                ? 'bg-[#8D6A47] text-white shadow-lg shadow-amber-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Istirahat Singkat (5m)</span>
          </button>
          <button
            onClick={() => {
              setTimerMode('LONG_BREAK');
              setIsRunning(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              timerMode === 'LONG_BREAK'
                ? 'bg-[#B48455] text-white shadow-lg shadow-amber-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Istirahat Panjang (15m)</span>
          </button>
        </div>

        {/* Big Circular Countdown Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
          {/* SVG Progress Circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-stone-900"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`transition-all duration-1000 ease-linear ${
                timerMode === 'FOCUS'
                  ? 'stroke-[#10B981]'
                  : timerMode === 'SHORT_BREAK'
                  ? 'stroke-[#8D6A47]'
                  : 'stroke-[#B48455]'
              }`}
              strokeWidth="6"
              strokeDasharray={276.46} // 2 * pi * 44
              strokeDashoffset={276.46 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time & Play Status Display inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-wider text-white drop-shadow-md">
              {formatTime(timeLeftSeconds)}
            </span>
            <span className="text-[11px] uppercase font-bold tracking-widest text-stone-400">
              {timerMode === 'FOCUS' ? 'Sesi Fokus Belajar' : 'Mode Istirahat'}
            </span>
            {isRunning && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold animate-pulse pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Sedang Berjalan
              </span>
            )}
          </div>
        </div>

        {/* Duration Quick Selectors for Focus */}
        {timerMode === 'FOCUS' && (
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-stone-400 font-medium mr-1">Durasi Fokus:</span>
            {[15, 25, 30, 45, 50, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setTargetMinutes(mins);
                  setIsRunning(false);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                  targetMinutes === mins
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                    : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}

        {/* Primary Controls (Play/Pause, Reset, Complete) */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {/* Reset Button */}
          <button
            onClick={() => {
              setIsRunning(false);
              const m = timerMode === 'FOCUS' ? targetMinutes : timerMode === 'SHORT_BREAK' ? 5 : 15;
              setTimeLeftSeconds(m * 60);
            }}
            className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-xl transition-all active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-[#8D6A47] hover:bg-[#725436] text-white shadow-amber-950/40'
                : 'bg-[#0D7A57] hover:bg-[#0A5D42] text-white shadow-emerald-950/50'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Jeda Fokus</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{timeLeftSeconds < totalSeconds ? 'Lanjutkan Fokus' : 'Mulai Fokus Sekarang'}</span>
              </>
            )}
          </button>

          {/* Complete Session Button */}
          <button
            onClick={handleFinishAndComplete}
            className="px-5 py-4 rounded-2xl bg-emerald-600/20 hover:bg-[#0D7A57] border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 cursor-pointer"
            title="Selesaikan & Tandai Sesi Selesai"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="hidden sm:inline">Selesai Belajar</span>
          </button>

          {/* Quick Quiz AI Button */}
          {onOpenQuickQuiz && (
            <button
              onClick={() => onOpenQuickQuiz(session)}
              className="px-4 py-4 rounded-2xl bg-[#8D6A47]/30 hover:bg-[#8D6A47] border border-[#8D6A47]/50 hover:border-[#8D6A47] text-amber-200 hover:text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-900/20 active:scale-95 cursor-pointer"
              title="Uji Pemahaman dengan Kuis AI"
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Kuis AI</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Footer: Motivational Quote & Notes Banner */}
      <div className="w-full max-w-2xl border-t border-stone-800/80 pt-4 text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#B48455]" />
          <span>Tips Study & Legal Mindset</span>
        </div>
        <p className="text-xs text-stone-300 italic max-w-xl mx-auto leading-relaxed">
          "{FOCUS_QUOTES[quoteIndex]}"
        </p>
        {session.notes && (
          <p className="text-[11px] text-stone-500 max-w-md mx-auto truncate pt-1">
            📌 Catatan: <span className="text-stone-400">{session.notes}</span>
          </p>
        )}
      </div>
    </div>
  );
};
