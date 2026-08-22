import React, { useState, useEffect } from 'react';
import { StudySession, Subject } from '../types';
import {
  Sparkles,
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  BookOpen,
  Loader2,
  Brain,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickQuizModalProps {
  session: StudySession;
  subject?: Subject;
  onClose: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

interface QuizData {
  quizTitle: string;
  questions: Question[];
}

export const QuickQuizModal: React.FC<QuickQuizModalProps> = ({
  session,
  subject,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const generateQuiz = async () => {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setSelectedAnswers({});
    setIsSubmitted(false);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectName: subject?.name || 'Mata Kuliah Umum',
          subjectCode: subject?.code || '',
          sessionTitle: session.title,
          sessionNotes: session.notes || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghasilkan kuis.');
      }

      setQuiz(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat menghubungi server AI.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQuiz();
  }, [session.id]);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return; // Prevent changing after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    if (score >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const score = isSubmitted ? calculateScore() : 0;
  const totalQuestions = quiz?.questions.length || 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="fixed inset-0 z-[110] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-[#E8E1D5] dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E8E1D5] dark:border-stone-800 flex items-center justify-between gap-4 bg-[#FAF7F2] dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0D7A57] text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D7A57] dark:text-emerald-400">
                  AI Quick Quiz
                </span>
                {subject && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8E1D5] dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                    {subject.code}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                {session.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-[#FAF7F2] dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-200 dark:border-emerald-950 border-t-[#0D7A57] animate-spin" />
                <Brain className="w-6 h-6 text-[#0D7A57] dark:text-emerald-400 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                  Gemini AI Sedang Menyusun Soal...
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                  Menganalisis topik "{session.title}" dan membuat pertanyaan latihan interaktif.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>Gagal Membuat Kuis</span>
              </div>
              <p className="text-xs leading-relaxed">{error}</p>
              <button
                onClick={generateQuiz}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}

          {/* Quiz Content */}
          {quiz && !loading && (
            <div className="space-y-6">
              {/* Score Banner if Submitted */}
              {isSubmitted && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                    score >= 70
                      ? 'bg-[#E8F8F2] dark:bg-emerald-950/40 border-[#10B981] text-[#0D7A57] dark:text-emerald-200'
                      : 'bg-[#FDF6EC] dark:bg-amber-950/40 border-[#E8D6BF] text-[#8D6A47] dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-stone-900/80 shadow-xs">
                      <Award
                        className={`w-6 h-6 ${
                          score >= 70 ? 'text-[#0D7A57]' : 'text-[#8D6A47]'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">
                        Hasil Kuis AI
                      </div>
                      <div className="text-lg font-black">
                        Skor: {score} / 100 ({quiz.questions.filter((q, i) => selectedAnswers[i] === q.correctOptionIndex).length} dari {totalQuestions} benar)
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={generateQuiz}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-[#FAF7F2] dark:hover:bg-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Buat Kuis Baru</span>
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {quiz.questions.map((q, qIdx) => {
                  const selected = selectedAnswers[qIdx];
                  const isCorrect = selected === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id || qIdx}
                      className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E8E1D5] dark:border-stone-800 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#E8F8F2] dark:bg-emerald-950 text-[#0D7A57] dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <h3 className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 leading-snug">
                          {q.question}
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          const isThisCorrect = q.correctOptionIndex === optIdx;

                          let optionStyle =
                            'bg-white dark:bg-stone-900 border-[#E8E1D5] dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-[#10B981] dark:hover:border-emerald-700';

                          if (isOptionSelected && !isSubmitted) {
                            optionStyle =
                              'bg-[#E8F8F2] dark:bg-emerald-950/80 border-[#10B981] text-[#0D7A57] dark:text-emerald-300 font-medium ring-1 ring-[#10B981]';
                          }

                          if (isSubmitted) {
                            if (isThisCorrect) {
                              optionStyle =
                                'bg-[#E8F8F2] dark:bg-emerald-950/70 border-[#10B981] text-[#0D7A57] dark:text-emerald-200 font-semibold ring-1 ring-[#10B981]';
                            } else if (isOptionSelected && !isThisCorrect) {
                              optionStyle =
                                'bg-rose-50 dark:bg-rose-950/70 border-rose-500 text-rose-800 dark:text-rose-200 line-through';
                            } else {
                              optionStyle =
                                'bg-white/50 dark:bg-stone-900/50 border-[#E8E1D5] dark:border-stone-800 text-stone-400 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              disabled={isSubmitted}
                              className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                            >
                              <span>{opt}</span>
                              {isSubmitted && isThisCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              )}
                              {isSubmitted && isOptionSelected && !isThisCorrect && (
                                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box after submission */}
                      {isSubmitted && (
                        <div className="mt-3 p-3 rounded-xl bg-[#E8F8F2]/60 dark:bg-emerald-950/30 border border-[#10B981]/30 dark:border-emerald-900/60 text-xs text-[#0D7A57] dark:text-emerald-200 space-y-1">
                          <span className="font-bold flex items-center gap-1 text-[#0D7A57] dark:text-emerald-400">
                            <BookOpen className="w-3.5 h-3.5" /> Penjelasan AI:
                          </span>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {quiz && !loading && (
          <div className="p-4 border-t border-[#E8E1D5] dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-900/50 flex items-center justify-between gap-3">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {isSubmitted
                ? `Selesai (${totalQuestions} soal)`
                : `${answeredCount} dari ${totalQuestions} soal terjawab`}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-[#E8E1D5]/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>

              {!isSubmitted && (
                <button
                  onClick={handleSubmit}
                  disabled={answeredCount === 0}
                  className="px-5 py-2 rounded-xl bg-[#0D7A57] hover:bg-[#0A5D42] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-950/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Periksa Jawaban</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
