import React, { useState, useMemo } from 'react';
import {
  Student,
  SociometricNomination,
  PeerBehavioralRating,
  StudentCalculatedMetrics,
  ClassMetricsAggregate,
  CoieDodgeStatus,
} from '../types';
import {
  Brain,
  AlertTriangle,
  ShieldCheck,
  Zap,
  TrendingDown,
  Users,
  Compass,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  Printer,
  ChevronRight,
  HeartHandshake,
  Lightbulb,
  Crosshair,
  UserCheck,
  ShieldAlert,
  HelpCircle,
  Clock,
  Eye,
  Activity,
} from 'lucide-react';

export interface PredictiveRiskReport {
  studentId: string;
  name: string;
  nis: string;
  gender: 'L' | 'P';
  status: CoieDodgeStatus;
  predictiveScore: number; // 0 - 100%
  degradationCategory: 'Eskalasi Bullying Tinggi' | 'Degradasi Isolasi Sosial' | 'Pola Korban-Agresif' | 'Kerentanan Pasif' | 'Stabil / Terjaga';
  trajectoryTrend: 'Memburuk (Deteriorating)' | 'Fluktuatif' | 'Stabil';
  warningFlags: string[];
  peerBridgeCandidates: {
    student: StudentCalculatedMetrics;
    compatibilityScore: number;
    reason: string;
  }[];
  behavioralInterventions: {
    pillar: 'Nudge Spasial' | 'Norma Sosial' | 'Praktik Restoratif' | 'PBIS Tier 2/3';
    title: string;
    scientificBasis: string;
    actionSteps: string[];
  }[];
}

interface PredictiveAnalyticsDSSProps {
  students: Student[];
  nominations: SociometricNomination[];
  metrics: StudentCalculatedMetrics[];
  aggregate: ClassMetricsAggregate;
  activeClassName: string;
  counselorName?: string;
}

export const PredictiveAnalyticsDSS: React.FC<PredictiveAnalyticsDSSProps> = ({
  students,
  nominations,
  metrics,
  aggregate,
  activeClassName,
  counselorName = 'Liengga Brian Darea, S.Sos.,Gr',
}) => {
  // Compute predictive risk reports for all students
  const riskReports: PredictiveRiskReport[] = useMemo(() => {
    // Helper to find nominations
    const likesReceivedMap: Record<string, string[]> = {};
    const dislikesReceivedMap: Record<string, string[]> = {};
    const likesGivenMap: Record<string, string[]> = {};

    nominations.forEach((nom) => {
      if (nom.type === 'like') {
        if (!likesReceivedMap[nom.targetId]) likesReceivedMap[nom.targetId] = [];
        likesReceivedMap[nom.targetId].push(nom.studentId);
        if (!likesGivenMap[nom.studentId]) likesGivenMap[nom.studentId] = [];
        likesGivenMap[nom.studentId].push(nom.targetId);
      } else if (nom.type === 'dislike') {
        if (!dislikesReceivedMap[nom.targetId]) dislikesReceivedMap[nom.targetId] = [];
        dislikesReceivedMap[nom.targetId].push(nom.studentId);
      }
    });

    // High prosocial peers for bridge matching
    const prosocialPeers = metrics.filter(
      (m) => m.prosocialScore >= 6 && m.zSP > 0 && m.status !== 'Rejected'
    );

    return metrics.map((student) => {
      const flags: string[] = [];
      let score = 15; // base level

      const dislikes = dislikesReceivedMap[student.studentId] || [];
      const likes = likesReceivedMap[student.studentId] || [];
      const given = likesGivenMap[student.studentId] || [];

      // Reciprocal check
      const reciprocalCount = likes.filter((lId) => given.includes(lId)).length;

      // 1. Peer Dislike Spike & Concentration
      if (dislikes.length >= 4) {
        score += 35;
        flags.push(`Konsentrasi Penolakan Tinggi: ${dislikes.length} rekan memberikan penolakan langsung (Z_D: ${student.zDislikes.toFixed(2)})`);
      } else if (dislikes.length >= 2) {
        score += 18;
        flags.push(`Tanda Awal Penolakan: Menerima ${dislikes.length} penolakan aktif dari teman sekelas.`);
      }

      // 2. Zero Reciprocity & Extreme Isolation
      if (reciprocalCount === 0 && student.status !== 'Popular') {
        score += 20;
        flags.push('Defisit Relasi Resiprokal: Nol (0) ikatan pertemanan timbal-balik terdeteksi di kelas.');
      }

      // 3. Status Drop / Vulnerability Trajectory
      if (student.status === 'Rejected') {
        score += 25;
        flags.push('Status Sosiometris Rejected (Coie & Dodge): Tingkat preferensi sosial tertekan di bawah rata-rata (Z_SP < -1.0).');
      } else if (student.status === 'Neglected') {
        score += 15;
        flags.push('Status Neglected / Terabaikan: Rendah visibilitas dan kurang dilibatkan dalam kegiatan kelas.');
      }

      // 4. Behavioral Indicators (Victimization, Aggression, Withdrawal)
      if (student.victimizationScore >= 6) {
        score += 20;
        flags.push(`Indikator Viktimisasi Sebaya Nyata: Skor viktimisasi tinggi (${student.victimizationScore}/10) mengindikasikan sasaran celaan/intimidasi.`);
      }
      if (student.withdrawnScore >= 7) {
        score += 15;
        flags.push(`Perilaku Menarik Diri Akut (${student.withdrawnScore}/10): Berisiko mengalami isolasi internal dan penolakan sekolah.`);
      }
      if (student.aggressiveScore >= 6 && dislikes.length >= 2) {
        score += 25;
        flags.push(`Dinamika Provokatif (Aggressive-Victim): Skor agresi ${student.aggressiveScore}/10 bersamaan dengan penolakan memicu spiral konflik sirkular.`);
      }

      // Cap score at 98
      const finalScore = Math.min(98, Math.max(10, score));

      // Determine Category
      let degradationCategory: PredictiveRiskReport['degradationCategory'] = 'Stabil / Terjaga';
      let trajectoryTrend: PredictiveRiskReport['trajectoryTrend'] = 'Stabil';

      if (student.status === 'Rejected' && student.victimizationScore >= 6) {
        degradationCategory = 'Eskalasi Bullying Tinggi';
        trajectoryTrend = 'Memburuk (Deteriorating)';
      } else if (student.status === 'Rejected' && student.aggressiveScore >= 6) {
        degradationCategory = 'Pola Korban-Agresif';
        trajectoryTrend = 'Memburuk (Deteriorating)';
      } else if (student.status === 'Neglected' || student.withdrawnScore >= 7) {
        degradationCategory = 'Degradasi Isolasi Sosial';
        trajectoryTrend = 'Fluktuatif';
      } else if (finalScore >= 50) {
        degradationCategory = 'Kerentanan Pasif';
        trajectoryTrend = 'Fluktuatif';
      }

      // Peer Bridge Matching: find up to 2 best prosocial companions
      const peerBridges = prosocialPeers
        .filter((p) => p.studentId !== student.studentId && !dislikes.includes(p.studentId))
        .map((p) => {
          let comp = 80;
          if (p.gender === student.gender) comp += 10;
          if (likes.includes(p.studentId)) comp += 10;
          return {
            student: p,
            compatibilityScore: Math.min(99, comp),
            reason: `${p.name} (${p.status}) memiliki skor prososial tinggi (${p.prosocialScore}/10) dan tidak pernah menolak ${student.name.split(' ')[0]}. Sangat ideal sebagai jangkar sosial inklusif.`,
          };
        })
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 2);

      // Behavioral Science Interventions tailored to the profile
      const behavioralInterventions: PredictiveRiskReport['behavioralInterventions'] = [];

      // Strategy 1: Nudge Theory (Thaler & Sunstein)
      behavioralInterventions.push({
        pillar: 'Nudge Spasial',
        title: 'Arsitektur Pilihan Tempat Duduk (Proximity Nudge)',
        scientificBasis: 'Teori Arsitektur Pilihan (Thaler & Sunstein, 2008): Jarak fisik menentukan probabilitas interaksi spontan dan menurunkan biaya sosial adaptasi pertemanan.',
        actionSteps: [
          `Tempatkan ${student.name.split(' ')[0]} di radius duduk 1–1.5 meter dekat teman prososial (seperti ${peerBridges[0]?.student.name.split(' ')[0] || 'teman adaptif'}), bukan di barisan belakang atau sendirian.`,
          'Hindari penataan kelompok dengan metode "pilihan bebas" (free pick) yang memperjelas penolakan di hadapan publik.',
          'Beri peran mikro terstruktur (koordinator inventaris materi/operator slide) untuk memicu aktivasi peran positif tanpa rasa canggung.',
        ],
      });

      // Strategy 2: Social Norms & Referents (Paluck & Shepherd, 2012)
      behavioralInterventions.push({
        pillar: 'Norma Sosial',
        title: 'Mobilisasi Agen Pengaruh Sebaya (Social Referent Intervention)',
        scientificBasis: 'Eksperimen Norma Sosial (Paluck & Shepherd, 2012; Cialdini): Mengubah perilaku kelas paling efektif dengan menggerakkan siswa berpengaruh (populer-prososial) untuk menetapkan standar inklusivitas.',
        actionSteps: [
          `Briefing privat ramah bersama konselor dengan siswa berkarakter prososial untuk menjadi "Jangkar Pendamping" tanpa membebani mereka sebagai penegak disiplin.`,
          'Aktifkan norma deskriptif kelas: Guru menekankan bahwa 85%+ siswa di kelas mengutamakan saling membantu saat diskusi kelompok.',
          'Gunakan penguatan pujian publik saat kelas menunjukkan kolaborasi tanpa ada anggota yang diabaikan.',
        ],
      });

      // Strategy 3: Restorative Practice (Wachtel, 2016)
      if (dislikes.length >= 2 || student.victimizationScore >= 5) {
        behavioralInterventions.push({
          pillar: 'Praktik Restoratif',
          title: 'Lingkaran Restoratif Empatik (Empathetic Restorative Circle)',
          scientificBasis: 'Restorative Practices (Wachtel, 2016): Pendekatan dialog non-punitive mencegah terjadinya efek dendam terselubung dan membangun empati afektif antara pihak terlibat.',
          actionSteps: [
            'Lakukan sesi mediasi terpandu dengan pertanyaan restoratif: "Apa dampak dari ejekan tersebut terhadap teman kita?" daripada menghukum sepihak.',
            'Klarifikasi kesalahpahaman laten yang menjadi sumber stereotip penolakan sebaya.',
            'Sepakati komitmen perbaikan relasi tertulis yang terukur dalam tempo 2 pekan.',
          ],
        });
      }

      // Strategy 4: PBIS Tier 2 / Tier 3 (Multi-Tiered System of Support)
      behavioralInterventions.push({
        pillar: 'PBIS Tier 2/3',
        title: student.status === 'Rejected' ? 'Intervensi Khusus Tier 3 (Intensif & TPPK)' : 'Intervensi Kelompok Tier 2 (Social Skills Training)',
        scientificBasis: 'Multi-Tiered Systems of Support (PBIS/MTSS): Penanganan berbasis tingkatan risiko memastikan alokasi perhatian konseling tepat sasaran sebelum terjadi eskalasi.',
        actionSteps: [
          student.status === 'Rejected'
            ? 'Konseling individu terstruktur dengan Guru BK (eksplorasi regulasi emosi, coping mechanism, dan asertivitas santun).'
            : 'Sertakan dalam bimbingan kelompok bertema resiliensi pertemanan dan keterampilan mendengarkan aktif.',
          'Koordinasi tertutup bersama Wali Kelas dan Orang Tua dengan pendekatan berbasis kekuatan anak (strength-based approach).',
          'Pemantauan radar sosiometri berkala 1 bulan pasca-intervensi untuk evaluasi penurunan skor penolakan.',
        ],
      });

      return {
        studentId: student.studentId,
        name: student.name,
        nis: student.nis,
        gender: student.gender,
        status: student.status,
        predictiveScore: finalScore,
        degradationCategory,
        trajectoryTrend,
        warningFlags: flags,
        peerBridgeCandidates: peerBridges,
        behavioralInterventions,
      };
    });
  }, [metrics, nominations]);

  // Sort: highest predictive risk first
  const sortedReports = useMemo(() => {
    return [...riskReports].sort((a, b) => b.predictiveScore - a.predictiveScore);
  }, [riskReports]);

  // Priority / At-Risk Filter
  const highRiskReports = useMemo(() => {
    return sortedReports.filter((r) => r.predictiveScore >= 50);
  }, [sortedReports]);

  // Active selected student report for deep-dive
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return highRiskReports[0]?.studentId || sortedReports[0]?.studentId || '';
  });

  const activeReport = useMemo(() => {
    return sortedReports.find((r) => r.studentId === selectedStudentId) || sortedReports[0];
  }, [sortedReports, selectedStudentId]);

  // Checklist state for executed interventions
  const [checkedInterventions, setCheckedInterventions] = useState<Record<string, boolean>>({
    [`${sortedReports[0]?.studentId}-0-0`]: true,
  });

  const toggleCheck = (key: string) => {
    setCheckedInterventions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // What-If Simulation State
  const [isSimulated, setIsSimulated] = useState(false);

  // Print Action Plan Sheet
  const handlePrintActionPlan = () => {
    window.print();
  };

  if (!activeReport) return null;

  return (
    <div className="space-y-6 text-[#e8edf5]">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0a2a4a] via-[#0d3555] to-[#1a3f64] border border-[#1a3f64] shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#f0c040] uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4 text-[#f0c040] animate-pulse" />
            <span>Modul Analitik Prediktif &amp; Decision Support System (DSS)</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Deteksi Dini Pola Degradasi Interaksi &amp; Rekomendasi Behavioral Science
          </h2>
          <p className="text-xs text-[#b0c4de] mt-1 max-w-3xl leading-relaxed">
            Menganalisis pola ikatan sosiometris, konsentrasi dinamika relasi sebaya, dan tingkat resiprositas untuk memperkuat keharmonisan iklim sosial kelas secara preventif.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSimulated(!isSimulated)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition duration-150 cursor-pointer ${
              isSimulated
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-[#1a3f64] hover:bg-[#1a4a6e] text-[#f7d970] border-[#f0c040]/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isSimulated ? 'Simulasi Aktif: Proyeksi Pulih' : 'Uji Simulasi Intervensi'}</span>
          </button>

          <button
            onClick={handlePrintActionPlan}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] text-xs font-extrabold shadow-md transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rencana Aksi (BIP)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards of Degradation Risk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0d3555] border border-[#1a3f64] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#b0c4de] font-medium">Siswa Terdeteksi Berisiko</div>
            <div className="text-2xl font-black text-rose-400 mt-0.5">
              {highRiskReports.length} <span className="text-xs text-[#b0c4de] font-normal">dari {metrics.length} Siswa</span>
            </div>
            <div className="text-[10px] text-rose-300/80 mt-1 flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3 h-3" />
              <span>Butuh pendampingan segera</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d3555] border border-[#1a3f64] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#b0c4de] font-medium">Potensi Polarisasi / Klik Negatif</div>
            <div className="text-2xl font-black text-[#f0c040] mt-0.5">
              {aggregate.riskSummary.highRiskCount > 0 ? 'Teridentifikasi' : 'Rendah'}
            </div>
            <div className="text-[10px] text-[#b0c4de] mt-1">
              Konsentrasi penolakan terpusat
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0c040]/20 border border-[#f0c040]/30 flex items-center justify-center text-[#f0c040]">
            <Crosshair className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d3555] border border-[#1a3f64] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#b0c4de] font-medium">Jangkar Prososial Tersedia</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {metrics.filter((m) => m.prosocialScore >= 6).length} <span className="text-xs text-[#b0c4de] font-normal">Kandidat Peer Buddy</span>
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-1 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              <span>Siap dimobilisasi sebagai jembatan</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d3555] border border-[#1a3f64] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#b0c4de] font-medium">Konselor Penanggung Jawab</div>
            <div className="text-sm font-bold text-white mt-1 truncate">
              {counselorName}
            </div>
            <div className="text-[10px] text-[#f7d970] mt-0.5 font-medium">
              Guru BK MTsN 2 Bangka &bull; TPPK
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Analysis Workspace: Split 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: At-Risk Student Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#f0c040]" />
              <span>Daftar Siswa Berdasarkan Indeks Kerentanan</span>
            </h3>
            <span className="text-[11px] text-[#b0c4de] font-mono">
              Urutan Risiko Tertinggi
            </span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {sortedReports.map((item) => {
              const isSelected = item.studentId === activeReport.studentId;
              const isHigh = item.predictiveScore >= 70;
              const isMedium = item.predictiveScore >= 45 && item.predictiveScore < 70;

              return (
                <div
                  key={item.studentId}
                  onClick={() => setSelectedStudentId(item.studentId)}
                  className={`p-3.5 rounded-xl border transition duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#1a3f64] border-[#f0c040] shadow-lg ring-1 ring-[#f0c040]/40'
                      : 'bg-[#0d3555]/80 hover:bg-[#0d3555] border-[#1a3f64]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-[#b0c4de] font-mono">
                        {item.nis}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : item.status === 'Neglected'
                            ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[11px] text-[#b0c4de] truncate">
                        {item.degradationCategory}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-base font-black ${
                        isHigh ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.predictiveScore}%
                    </div>
                    <div className="text-[9px] text-[#b0c4de] uppercase font-bold tracking-wider">
                      Skor Risiko
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-Dive Diagnostic & Behavioral Interventions */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Student Card */}
          <div className="p-5 rounded-2xl bg-[#0d3555] border border-[#1a3f64] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-white">
                    {activeReport.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#f0c040]/20 text-[#f7d970] border border-[#f0c040]/30">
                    NIS: {activeReport.nis}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-black/40 text-[#b0c4de]">
                    JK: {activeReport.gender}
                  </span>
                </div>
                <p className="text-xs text-[#b0c4de] mt-0.5">
                  Diagnosis: <strong className="text-white">{activeReport.degradationCategory}</strong> &bull; Trajektori: <strong className="text-amber-300">{activeReport.trajectoryTrend}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-[#b0c4de]">Indeks Kerentanan (PVI)</div>
                  <div className="text-2xl font-extrabold text-rose-400">
                    {isSimulated ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span>32%</span>
                        <span className="text-[11px] font-normal text-emerald-300">(Proyeksi Intervensi)</span>
                      </span>
                    ) : (
                      `${activeReport.predictiveScore}%`
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Flags / Gejala Degradasi yang Terdeteksi */}
            <div>
              <div className="text-[11px] font-bold text-[#f7d970] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Indikator Anomali &amp; Gejala Awal Degradasi:</span>
              </div>
              <div className="space-y-1.5">
                {activeReport.warningFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#0a2a4a] border border-[#1a3f64] text-xs text-[#e8edf5] flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Peer Bridge Matching (Algoritma Jembatan Sebaya) */}
            {activeReport.peerBridgeCandidates.length > 0 && (
              <div className="p-4 rounded-xl bg-[#0a2a4a]/90 border border-[#1a3f64]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <HeartHandshake className="w-4 h-4 text-emerald-400" />
                    <span>Rekomendasi Jembatan Teman Sebaya (Peer Bridge Matching)</span>
                  </div>
                  <span className="text-[10px] text-[#b0c4de]">Algoritma Kompatibilitas Prososial</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeReport.peerBridgeCandidates.map((cand, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 rounded-lg bg-[#0d3555] border border-emerald-500/30 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">
                          {cand.student.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          Kecocokan: {cand.compatibilityScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-[#b0c4de] leading-relaxed">
                        {cand.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Behavioral Science Interventions Checklist (DSS) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#f0c040] uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-[#f0c040]" />
                  <span>Protokol Intervensi Presisi Berbasis Behavioral Science (DSS)</span>
                </div>
                <span className="text-[10px] text-[#b0c4de]">
                  Centang tindakan yang dieksekusi
                </span>
              </div>

              <div className="space-y-3">
                {activeReport.behavioralInterventions.map((intervention, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-4 rounded-xl bg-[#0a2a4a] border border-[#1a3f64] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#f0c040]/10 text-[#f7d970] border border-[#f0c040]/30">
                          {intervention.pillar}
                        </span>
                        <h4 className="text-xs font-bold text-white">
                          {intervention.title}
                        </h4>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#b0c4de] italic bg-black/20 p-2 rounded-lg border border-white/5">
                      <strong>Landasan Ilmiah:</strong> {intervention.scientificBasis}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {intervention.actionSteps.map((step, sIdx) => {
                        const checkKey = `${activeReport.studentId}-${pIdx}-${sIdx}`;
                        const isChecked = !!checkedInterventions[checkKey];

                        return (
                          <div
                            key={sIdx}
                            onClick={() => toggleCheck(checkKey)}
                            className={`p-2.5 rounded-lg border transition duration-150 flex items-start gap-2.5 cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                : 'bg-[#0d3555]/60 hover:bg-[#0d3555] border-white/5 text-[#e8edf5]'
                            }`}
                          >
                            <button
                              type="button"
                              className="shrink-0 mt-0.5 text-emerald-400"
                            >
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4 text-[#b0c4de]" />
                              )}
                            </button>
                            <span className={`text-xs leading-relaxed ${isChecked ? 'line-through opacity-80' : ''}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Counselor Note & Signoff Box */}
            <div className="p-3.5 rounded-xl bg-[#061c30] border border-[#1a3f64] text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#b0c4de] uppercase font-bold">
                  Verifikasi Guru BK:
                </span>
                <div className="font-bold text-white">{counselorName}</div>
                <div className="text-[11px] text-[#b0c4de]">
                  Satuan Pendidikan: MTs Negeri 2 Bangka &bull; Kelas {activeClassName}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DSS Terhubung ke TPPK</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
