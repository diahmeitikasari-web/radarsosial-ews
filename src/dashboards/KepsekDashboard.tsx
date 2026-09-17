import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  School,
  SchoolClass,
  Period,
  StudentCalculatedMetrics,
  ClassMetricsAggregate,
} from '../types';
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  AlertTriangle,
  Award,
  Printer,
  Compass,
  FileCheck2,
  CheckCircle2,
  Lightbulb,
  Layers,
} from 'lucide-react';

interface KepsekDashboardProps {
  school: School;
  classes: SchoolClass[];
  activeClass: SchoolClass;
  activePeriod: Period;
  metrics: StudentCalculatedMetrics[];
  aggregate: ClassMetricsAggregate;
  onOpenReportModal: () => void;
  onChangeClass: (classId: string) => void;
}

export const KepsekDashboard: React.FC<KepsekDashboardProps> = ({
  school,
  classes,
  activeClass,
  activePeriod,
  metrics,
  aggregate,
  onOpenReportModal,
  onChangeClass,
}) => {
  // Policy Adoption Checklist State for Principal
  const [implementedPolicies, setImplementedPolicies] = useState<Record<number, boolean>>({
    0: true,
  });

  const togglePolicy = (idx: number) => {
    setImplementedPolicies((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const highRiskCount = metrics.filter((m) => m.riskLevel === 'Tinggi').length;
  const mediumRiskCount = metrics.filter((m) => m.riskLevel === 'Sedang').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Executive Dashboard Kepala Sekolah & Pimpinan Madrasah</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Decision Support System (DSS) Kebijakan Iklim & Keamanan Sosial
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {school.name} • Periode Pemantauan: {activePeriod.name}. Analisis agregat makro untuk perumusan kebijakan preventif bullying dan penguatan karakter.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 transition shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan Manajerial PDF</span>
        </button>
      </div>

      {/* Institutional KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Climate Index */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Indeks Iklim Sosial Kelas</span>
            <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
              <Compass className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white flex items-baseline gap-2">
            {aggregate.climateScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kategori: {aggregate.climateIndex}</span>
          </div>
        </div>

        {/* Network Density */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Kepadatan Jaringan (Density)</span>
            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white">{aggregate.density}</div>
          <div className="mt-2 text-[11px] text-slate-400">
            Resiprositas Pertemanan: <strong className="text-white">{aggregate.reciprocityRate}%</strong>
          </div>
        </div>

        {/* Priority Crisis Alert */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Siswa Dalam Peringatan Dini</span>
            <span className="p-1 rounded-md bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 flex items-baseline gap-2">
            {highRiskCount} <span className="text-xs text-slate-400 font-normal">Tinggi</span>
            <span className="text-sm font-semibold text-amber-400">/ {mediumRiskCount} Sedang</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-300">
            {highRiskCount > 0
              ? 'Terindikasi potensi viktimisasi atau penolakan parah'
              : 'Tidak ada kasus penolakan ekstrem terdeteksi'}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Status Popular (Role Model)</span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {aggregate.statusCounts.Popular} Siswa
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Dapat diberdayakan sebagai Peer Counselor (Konselor Sebaya)
          </div>
        </div>
      </div>

      {/* Decision Support System (DSS) - Strategic Policy Directives */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Rekomendasi Kebijakan Strategis Sekolah (Decision Support System)
              </h3>
              <p className="text-xs text-slate-400">
                Langkah manajerial yang direkomendasikan sistem berbasis olahan data sosiometri untuk kepala sekolah.
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
            Algoritma DSS v1.2
          </span>
        </div>

        <div className="space-y-3">
          {aggregate.kepsekPolicyAdvice.map((policy, idx) => {
            const isDone = !!implementedPolicies[idx];
            return (
              <div
                key={idx}
                onClick={() => togglePolicy(idx)}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  isDone
                    ? 'bg-amber-950/20 border-amber-600/40 text-amber-100'
                    : 'bg-slate-950/50 border-slate-800 hover:bg-slate-950'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md shrink-0 ${isDone ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-white mb-0.5">
                    Arahan Kebijakan #{idx + 1}:
                  </div>
                  <p className="text-slate-300 leading-relaxed">{policy}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isDone ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                      {isDone ? 'Status: Disetujui & Diterapkan Pimpinan' : 'Klik untuk Mengadopsi Kebijakan'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Class Macro Comparison for Principal */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Perbandingan Iklim Antar-Rombel (Rombongan Belajar)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Pilih kelas untuk berpindah fokus analisis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const isCurrent = cls.id === activeClass.id;
            return (
              <motion.div
                key={cls.id}
                onClick={() => onChangeClass(cls.id)}
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.15 }}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">{cls.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-semibold">
                      Sedang Ditinjau
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  Wali Kelas: <span className="text-slate-200">{cls.homeroomTeacher}</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Siswa:</span>
                    <span className="font-bold text-white">{cls.studentCount} Siswa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Indeks Iklim:</span>
                    <span className="font-bold text-cyan-400">
                      {cls.id === 'c-8a' ? '74 (Kondusif)' : cls.id === 'c-8b' ? '68 (Cukup)' : '82 (Sangat Baik)'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Compliance / Legal Framework (TPPK) */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-slate-200 mb-0.5">
            Kepatuhan Regulasi Pencegahan Kekerasan Satuan Pendidikan:
          </div>
          <p className="leading-relaxed">
            Sistem Radar Sosial terintegrasi dengan mandat <strong>Permendikbudristek No. 46 Tahun 2023</strong> tentang Pencegahan dan Penanganan Kekerasan di Lingkungan Satuan Pendidikan (PPKSP). Data sosiometri ini menjadi alat bukti diagnostik objektif bagi Tim Pencegahan dan Penanganan Kekerasan (TPPK) sekolah.
          </p>
        </div>
      </div>
    </div>
  );
};
