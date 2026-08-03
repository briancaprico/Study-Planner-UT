import React, { useState } from 'react';
import { StudySession, Subject } from '../types';
import { SEMESTER_WEEKS } from '../utils/dateHelper';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { BarChart2, TrendingUp, PieChart, Clock, Award, BookOpen } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  sessions: StudySession[];
  subjects: Subject[];
  isDarkMode: boolean;
}

export const AnalyticsCharts: React.FC<Props> = ({ sessions, subjects, isDarkMode }) => {
  const [timeframe, setTimeframe] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');

  const textColor = isDarkMode ? '#CBD5E1' : '#334155';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  // 1. Dynamic Bar Chart Data based on timeframe
  const getBarChartData = () => {
    if (timeframe === 'WEEKLY') {
      const labels = SEMESTER_WEEKS.map((w) => w.label);
      const completedData: number[] = [];
      const scheduledData: number[] = [];

      SEMESTER_WEEKS.forEach((w) => {
        const wSessions = sessions.filter((s) => s.date >= w.start && s.date <= w.end);
        const comp = wSessions
          .filter((s) => s.isCompleted)
          .reduce((sum, s) => sum + s.durationMinutes / 60, 0);
        const sched = wSessions.reduce((sum, s) => sum + s.durationMinutes / 60, 0);

        completedData.push(parseFloat(comp.toFixed(1)));
        scheduledData.push(parseFloat(sched.toFixed(1)));
      });

      return {
        title: 'Target & Realisasi Jam Belajar Mingguan',
        data: {
          labels,
          datasets: [
            {
              label: 'Realisasi Jam Selesai',
              data: completedData,
              backgroundColor: 'rgba(16, 185, 129, 0.85)',
              borderColor: '#10B981',
              borderRadius: 8,
              borderWidth: 1,
            },
            {
              label: 'Target Jam Terjadwal',
              data: scheduledData,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: 8,
              borderWidth: 1,
            },
          ],
        },
      };
    }

    if (timeframe === 'MONTHLY') {
      const monthsMap: Record<string, { completed: number; scheduled: number }> = {};

      sessions.forEach((s) => {
        const [y, m] = s.date.split('-');
        const monthKey = `${y}-${m}`;
        if (!monthsMap[monthKey]) {
          monthsMap[monthKey] = { completed: 0, scheduled: 0 };
        }
        monthsMap[monthKey].scheduled += s.durationMinutes / 60;
        if (s.isCompleted) {
          monthsMap[monthKey].completed += s.durationMinutes / 60;
        }
      });

      const monthKeys = Object.keys(monthsMap).sort();
      const monthNames: Record<string, string> = {
        '2026-08': 'Agustus 2026',
        '2026-09': 'September 2026',
      };

      const labels = monthKeys.map((k) => monthNames[k] || k);
      const completedData = monthKeys.map((k) => parseFloat(monthsMap[k].completed.toFixed(1)));
      const scheduledData = monthKeys.map((k) => parseFloat(monthsMap[k].scheduled.toFixed(1)));

      return {
        title: 'Target & Realisasi Jam Belajar Bulanan',
        data: {
          labels,
          datasets: [
            {
              label: 'Realisasi Jam Selesai',
              data: completedData,
              backgroundColor: 'rgba(16, 185, 129, 0.85)',
              borderColor: '#10B981',
              borderRadius: 8,
              borderWidth: 1,
            },
            {
              label: 'Target Jam Terjadwal',
              data: scheduledData,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: 8,
              borderWidth: 1,
            },
          ],
        },
      };
    }

    // Default DAILY: Last 7 Days
    const labels: string[] = [];
    const hoursData: number[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      labels.push(dayName);

      const hours = sessions
        .filter((s) => s.date === dateStr && s.isCompleted)
        .reduce((sum, s) => sum + s.durationMinutes / 60, 0);

      hoursData.push(parseFloat(hours.toFixed(1)));
    }

    return {
      title: 'Jam Belajar Harian (7 Hari Terakhir)',
      data: {
        labels,
        datasets: [
          {
            label: 'Jam Belajar Selesai',
            data: hoursData,
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderColor: '#3B82F6',
            borderRadius: 8,
            borderWidth: 1,
          },
        ],
      },
    };
  };

  const currentBarConfig = getBarChartData();

  // 2. Cumulative Progress Line Chart (Perkembangan Belajar)
  const getCumulativeData = () => {
    // Sort all completed sessions by date
    const completed = [...sessions]
      .filter((s) => s.isCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const datesMap: Record<string, number> = {};
    completed.forEach((s) => {
      datesMap[s.date] = (datesMap[s.date] || 0) + s.durationMinutes / 60;
    });

    const dates = Object.keys(datesMap).sort();
    let cumulative = 0;
    const labels: string[] = [];
    const points: number[] = [];

    dates.forEach((d) => {
      cumulative += datesMap[d];
      try {
        const [y, m, dayNum] = d.split('-').map(Number);
        labels.push(`${dayNum}/${m}`);
      } catch {
        labels.push(d);
      }
      points.push(parseFloat(cumulative.toFixed(1)));
    });

    return {
      labels: labels.length > 0 ? labels : ['Belum Ada Data'],
      points: points.length > 0 ? points : [0],
    };
  };

  const cumulativeData = getCumulativeData();

  const cumulativeLineData = {
    labels: cumulativeData.labels,
    datasets: [
      {
        fill: true,
        label: 'Akumulasi Jam Belajar',
        data: cumulativeData.points,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.35,
        pointBackgroundColor: '#10B981',
        pointRadius: 4,
      },
    ],
  };

  // 3. Subject Hours Comparison (Horizontal Bar Chart)
  const subjectProgressData = {
    labels: subjects.map((s) => s.code),
    datasets: [
      {
        label: 'Jam Selesai',
        data: subjects.map((subj) => {
          const hours = sessions
            .filter((s) => s.subjectId === subj.id && s.isCompleted)
            .reduce((sum, s) => sum + s.durationMinutes / 60, 0);
          return parseFloat(hours.toFixed(1));
        }),
        backgroundColor: subjects.map((s) => s.color),
        borderRadius: 6,
      },
      {
        label: 'Target Jam',
        data: subjects.map((s) => s.targetHours),
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        borderRadius: 6,
      },
    ],
  };

  // 4. Session Type Breakdown (Doughnut Chart)
  const sessionTypesList = [
    'Belajar Mendalam',
    'Retrieval Practice',
    'Review Ringan',
    'Latihan Soal',
    'Flashcard',
    'Mind Mapping',
  ];

  const typeCounts = sessionTypesList.map((st) => {
    return sessions.filter((s) => s.sessionType === st && s.isCompleted).length;
  });

  const doughnutData = {
    labels: sessionTypesList,
    datasets: [
      {
        data: typeCounts,
        backgroundColor: [
          '#6366F1', // Indigo
          '#A855F7', // Purple
          '#06B6D4', // Cyan
          '#F59E0B', // Amber
          '#F43F5E', // Rose
          '#10B981', // Emerald
        ],
        borderWidth: 2,
        borderColor: isDarkMode ? '#0F172A' : '#FFFFFF',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: { family: 'sans-serif', size: 11 },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { size: 10 } },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor, font: { size: 10 } },
        grid: { color: gridColor },
      },
    },
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Statistik & Analytics Belajar Real-time
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Analisis kebiasaan belajar, alokasi jam per mata kuliah, dan tren performa.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setTimeframe('DAILY')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              timeframe === 'DAILY'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setTimeframe('WEEKLY')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              timeframe === 'WEEKLY'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setTimeframe('MONTHLY')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              timeframe === 'MONTHLY'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Timeframe Study Hours */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              {currentBarConfig.title}
            </h3>
          </div>
          <div key={`chart-timeframe-${isDarkMode}-${timeframe}`} className="h-64 relative">
            <Bar data={currentBarConfig.data} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Cumulative Progress Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Grafik Perkembangan Belajar (Akumulasi Jam)
            </h3>
          </div>
          <div key={`chart-cumulative-${isDarkMode}`} className="h-64 relative">
            <Line data={cumulativeLineData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 3: Subject Progress vs Target */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              Progress Jam Per Mata Kuliah
            </h3>
          </div>
          <div key={`chart-subject-${isDarkMode}`} className="h-64 relative">
            <Bar data={subjectProgressData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 4: Session Type Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-500" />
              Distribusi Jenis Sesi Selesai
            </h3>
          </div>
          <div key={`chart-doughnut-${isDarkMode}`} className="h-64 relative flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: textColor, font: { size: 10 } },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
