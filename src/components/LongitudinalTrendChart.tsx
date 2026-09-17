import React, { useState } from 'react';
import { StudentCalculatedMetrics, Period } from '../types';
import { TrendingUp, TrendingDown, ArrowUpRight, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LongitudinalTrendChartProps {
  selectedStudent?: StudentCalculatedMetrics | null;
  allMetrics: StudentCalculatedMetrics[];
  periods: Period[];
}

export const LongitudinalTrendChart: React.FC<LongitudinalTrendChartProps> = ({
  selectedStudent,
  allMetrics,
  periods,
}) => {
  const [viewMode, setViewMode] = useState<'student' | 'class'>('student');

  // Multi-semester class aggregate trends
  const classTrends = [
    {
      periodCode: '2025-S1',
      name: 'Sem 1 25/26',
      density: 0.28,
      rejectedCount: 1,
      neglectedCount: 2,
      popularCount: 2,
      climateScore: 78,
    },
    {
      periodCode: '2025-S2',
      name: 'Sem 2 25/26',
      density: 0.25,
      rejectedCount: 2,
      neglectedCount: 3,
      popularCount: 3,
      climateScore: 68,
    },
    {
      periodCode: '2026-S1',
      name: 'Sem 1 26/27 (Aktif)',
      density: 0.22,
      rejectedCount: allMetrics.filter((m) => m.status === 'Rejected').length || 1,
      neglectedCount: allMetrics.filter((m) => m.status === 'Neglected').length || 1,
      popularCount: allMetrics.filter((m) => m.status === 'Popular').length || 2,
      climateScore: 60,
    },
  ];

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-xl text-slate-100">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Analisis Tren Longitudinal Antar-Semester
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                3 Periode Pengukuran
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pelacakan lintasan (trajectory) perilaku dan dinamika iklim sosial untuk mendeteksi perubahan dini.
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('student')}
            className={`px-3 py-1 rounded-md transition ${viewMode === 'student' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Lintasan Individu Siswa
          </button>
          <button
            onClick={() => setViewMode('class')}
            className={`px-3 py-1 rounded-md transition ${viewMode === 'class' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Agregat Iklim Kelas
          </button>
        </div>
      </div>

      {viewMode === 'student' ? (
        <div>
          {selectedStudent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Siswa Terpilih:</div>
                  <div className="text-sm font-bold text-white">
                    {selectedStudent.name}{' '}
                    <span className="text-xs font-normal text-slate-400">({selectedStudent.nis})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      selectedStudent.status === 'Popular'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : selectedStudent.status === 'Rejected'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : selectedStudent.status === 'Neglected'
                        ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    Status Terkini: {selectedStudent.status}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      selectedStudent.riskLevel === 'Tinggi'
                        ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                        : selectedStudent.riskLevel === 'Sedang'
                        ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                        : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                    }`}
                  >
                    Risiko: {selectedStudent.riskLevel}
                  </span>
                </div>
              </div>

              {/* Trajectory Timeline Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedStudent.longitudinalHistory.map((hist, idx) => (
                  <div
                    key={hist.periodCode}
                    className={`p-3.5 rounded-xl border relative transition ${
                      idx === selectedStudent.longitudinalHistory.length - 1
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-300">{hist.periodName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {hist.periodCode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-400">Status Sosiometri:</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          hist.status === 'Popular'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : hist.status === 'Rejected'
                            ? 'text-rose-400 bg-rose-500/10'
                            : hist.status === 'Neglected'
                            ? 'text-slate-400 bg-slate-500/10'
                            : 'text-sky-400 bg-sky-500/10'
                        }`}
                      >
                        {hist.status}
                      </span>
                    </div>

                    {/* Metric mini bars */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Preferensi Sosial (Z_SP):</span>
                        <span className={`font-mono font-bold ${hist.zSP < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {hist.zSP > 0 ? `+${hist.zSP}` : hist.zSP}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Dampak Sosial (Z_SI):</span>
                        <span className="font-mono text-slate-200">{hist.zSI}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Indikator Viktimisasi:</span>
                        <span className="font-mono text-amber-400">{hist.victimization}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Behavior Science Interpretation Callout */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300">
                    Analisis Tren Perilaku (Behavioral Science Alert):
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    {selectedStudent.status === 'Rejected'
                      ? `Pola menunjukkan tren penurunan preferensi sosial secara bertahap dari ${selectedStudent.longitudinalHistory[0].status} pada semester lalu menjadi Rejected. Eskalasi ini mengindikasikan isolasi yang mengakar, membutuhkan intervensi terstruktur sebelum siswa menarik diri total.`
                      : `Perkembangan sosiometri siswa stabil dan menunjukkan integrasi sosial yang baik di lingkungan kelas.`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
              Pilih salah satu siswa pada tabel atau graf sosiogram di atas untuk melihat grafik lintasan longitudinal individunya.
            </div>
          )}
        </div>
      ) : (
        /* Class Macro Trends */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {classTrends.map((t, idx) => (
              <div key={t.periodCode} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-300 mb-1">{t.name}</div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl font-extrabold text-white">{t.climateScore}</span>
                  <span className="text-xs text-slate-400">/ 100 Indeks Iklim</span>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kepadatan (Density):</span>
                    <span className="font-mono text-cyan-400">{t.density}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Siswa Rejected:</span>
                    <span className="font-mono text-rose-400 font-bold">{t.rejectedCount} siswa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Siswa Neglected:</span>
                    <span className="font-mono text-slate-300">{t.neglectedCount} siswa</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white mb-0.5">
                Rekomendasi Decision Support System (DSS) untuk Kepala Sekolah:
              </div>
              <p className="text-slate-400 leading-relaxed">
                Kepadatan relasi sosiometri kelas mengalami penurunan tren dari 0.28 ke 0.22 dalam rentang 3 semester. Rekomendasi kebijakan: Adakan program orientasi pertemanan kembali, optimalkan jam bimbingan klasikal, dan berikan arahan wali kelas untuk melakukan rotasi kelompok belajar setiap 2 pekan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
