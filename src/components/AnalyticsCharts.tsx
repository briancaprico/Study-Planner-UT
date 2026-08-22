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

  const textColor = isDarkMode ? '#D6D3D1' : '#44403C';
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
              backgroundColor: isDarkMode ? 'rgba(141, 106, 71, 0.35)' : 'rgba(141, 106, 71, 0.2)',
              borderColor: '#8D6A47',
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

      const labels = monthKeys.map((k) => {
        if (monthNames[k]) return monthNames[k];
        const [y, m] = k.split('-').map(Number);
        if (y && m) {
          const d = new Date(y, m - 1, 1);
          return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        }
        return k;
      });
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
              backgroundColor: isDarkMode ? 'rgba(141, 106, 71, 0.35)' : 'rgba(141, 106, 71, 0.2)',
              borderColor: '#8D6A47',
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
            backgroundColor: 'rgba(13, 122, 87, 0.85)',
            borderColor: '#0D7A57',
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
        backgroundColor: isDarkMode ? 'rgba(141, 106, 71, 0.35)' : 'rgba(141, 106, 71, 0.2)',
        borderColor: '#8D6A47',
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
          '#0D7A57', // Mint Deep Forest
          '#10B981', // Mint Bright
          '#8D6A47', // Light Brown Accent
          '#B45309', // Warm Amber
          '#059669', // Emerald
          '#A78BFA', // Soft Lavender
        ],
        borderWidth: 2,
        borderColor: isDarkMode ? '#1C1917' : '#FFFFFF',
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
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#0D7A57] dark:text-emerald-400" />
            Statistik & Analytics Belajar Real-time
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Analisis kebiasaan belajar, alokasi jam per mata kuliah, dan tren performa.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FAF7F2] dark:bg-stone-800 p-1 rounded-xl border border-[#E8E1D5] dark:border-stone-700">
          <button
            onClick={() => setTimeframe('DAILY')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              timeframe === 'DAILY'
                ? 'bg-white dark:bg-stone-700 text-[#0D7A57] dark:text-emerald-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setTimeframe('WEEKLY')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              timeframe === 'WEEKLY'
                ? 'bg-white dark:bg-stone-700 text-[#0D7A57] dark:text-emerald-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setTimeframe('MONTHLY')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              timeframe === 'MONTHLY'
                ? 'bg-white dark:bg-stone-700 text-[#0D7A57] dark:text-emerald-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Timeframe Study Hours */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-800 shadow-sm transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8D6A47]" />
              {currentBarConfig.title}
            </h3>
          </div>
          <div key={`chart-timeframe-${isDarkMode}-${timeframe}`} className="h-64 relative">
            <Bar data={currentBarConfig.data} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Cumulative Progress Trend */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-800 shadow-sm transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              Grafik Perkembangan Belajar (Akumulasi Jam)
            </h3>
          </div>
          <div key={`chart-cumulative-${isDarkMode}`} className="h-64 relative">
            <Line data={cumulativeLineData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 3: Subject Progress vs Target */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-800 shadow-sm transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0D7A57]" />
              Progress Jam Per Mata Kuliah
            </h3>
          </div>
          <div key={`chart-subject-${isDarkMode}`} className="h-64 relative">
            <Bar data={subjectProgressData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 4: Session Type Distribution */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-800 shadow-sm transition-colors flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#8D6A47]" />
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
