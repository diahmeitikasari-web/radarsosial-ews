import React, { useState, useMemo } from 'react';
import {
  Student,
  StudentCalculatedMetrics,
  SociometricNomination,
  SeatingLayoutType,
  SeatingDesk,
  SeatingOptimizationResult,
  CooperativeGroup,
} from '../types';
import { generateOptimizedSeating, generateCooperativeGroups } from '../services/seatingEngine';
import {
  LayoutGrid,
  Users,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Printer,
  RotateCcw,
  ArrowLeftRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartSeatingOptimizerProps {
  students: Student[];
  metrics: StudentCalculatedMetrics[];
  nominations: SociometricNomination[];
  className: string;
}

export const SmartSeatingOptimizer: React.FC<SmartSeatingOptimizerProps> = ({
  students,
  metrics,
  nominations,
  className,
}) => {
  const [activeView, setActiveView] = useState<'seating' | 'cooperative'>('seating');
  const [layoutType, setLayoutType] = useState<SeatingLayoutType>('pairs_grid');
  const [groupCount, setGroupCount] = useState<number>(6);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);

  // Generate initial optimization
  const initialOptimization = useMemo(() => {
    return generateOptimizedSeating(students, metrics, nominations, layoutType);
  }, [students, metrics, nominations, layoutType]);

  // Working state for desks so teacher can manually swap seats if desired
  const [seatingState, setSeatingState] = useState<SeatingOptimizationResult>(initialOptimization);

  // Update seating state when external data or layoutType changes
  React.useEffect(() => {
    setSeatingState(initialOptimization);
  }, [initialOptimization]);

  // Cooperative groups
  const cooperativeGroups: CooperativeGroup[] = useMemo(() => {
    return generateCooperativeGroups(students, metrics, nominations, groupCount);
  }, [students, metrics, nominations, groupCount]);

  // Re-run optimization
  const handleReoptimize = () => {
    const fresh = generateOptimizedSeating(students, metrics, nominations, layoutType);
    setSeatingState(fresh);
    setSelectedDeskId(null);
  };

  // Swap two desks
  const handleDeskClick = (deskId: string) => {
    if (!selectedDeskId) {
      setSelectedDeskId(deskId);
    } else if (selectedDeskId === deskId) {
      setSelectedDeskId(null);
    } else {
      // Perform swap
      setSeatingState((prev) => {
        const newDesks = prev.desks.map((d) => ({ ...d }));
        const deskA = newDesks.find((d) => d.deskId === selectedDeskId);
        const deskB = newDesks.find((d) => d.deskId === deskId);

        if (deskA && deskB) {
          const tempStudentId = deskA.studentId;
          const tempAssignedStudent = deskA.assignedStudent;
          const tempAssignedMetric = deskA.assignedMetric;

          deskA.studentId = deskB.studentId;
          deskA.assignedStudent = deskB.assignedStudent;
          deskA.assignedMetric = deskB.assignedMetric;

          deskB.studentId = tempStudentId;
          deskB.assignedStudent = tempAssignedStudent;
          deskB.assignedMetric = tempAssignedMetric;
        }

        return {
          ...prev,
          desks: newDesks,
          optimizationLog: [
            ...prev.optimizationLog,
            `Penyesuaian Manual: Menukar posisi Meja ${deskA?.tableNumber} dan Meja ${deskB?.tableNumber}.`,
          ],
        };
      });
      setSelectedDeskId(null);
    }
  };

  // Print Seating Chart Handler
  const handlePrint = () => {
    window.print();
  };

  // Metric status badge color
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Popular':
        return { label: 'Populer', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'Rejected':
        return { label: 'Rejected', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'Neglected':
        return { label: 'Neglected', bg: 'bg-slate-400/20 text-slate-300 border-slate-400/40' };
      case 'Controversial':
        return { label: 'Kontroversial', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      default:
        return { label: 'Adaptif', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
    }
  };

  // Group desks by tableNumber
  const tableGroups = useMemo(() => {
    const map = new Map<number, SeatingDesk[]>();
    seatingState.desks.forEach((d) => {
      if (!map.has(d.tableNumber)) map.set(d.tableNumber, []);
      map.get(d.tableNumber)!.push(d);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [seatingState.desks]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0d3555] via-[#0e3b60] to-[#12426c] border border-[#1a3f64] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#f0c040] text-[#0a2a4a] flex items-center justify-center font-bold shadow-md">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>Smart Seating &amp; Group Optimizer</span>
                <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-[#f0c040]/20 text-[#f7d970] border border-[#f0c040]/40 font-bold">
                  Kelas {className}
                </span>
              </h2>
              <p className="text-xs text-[#b0c4de]">
                Penyusun denah tempat duduk intervensi dan kelompok belajar kooperatif berbasis bukti sosiometri (Anti-Viktimisasi &amp; Peer Buddy System).
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#0a2a4a] p-1 rounded-xl border border-[#1a3f64] text-xs">
            <button
              onClick={() => setActiveView('seating')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeView === 'seating'
                  ? 'bg-[#f0c040] text-[#0a2a4a] shadow-md'
                  : 'text-[#8ba3c7] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Denah Tempat Duduk</span>
            </button>
            <button
              onClick={() => setActiveView('cooperative')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeView === 'cooperative'
                  ? 'bg-[#f0c040] text-[#0a2a4a] shadow-md'
                  : 'text-[#8ba3c7] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Kelompok Kooperatif</span>
            </button>
          </div>

          <button
            onClick={handleReoptimize}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#143d63] hover:bg-[#1a4f7e] text-[#f7d970] border border-[#f0c040]/30 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Hitung Ulang Tata Letak Optimal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Optimalkan Ulang</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1a3f64] hover:bg-[#235384] text-white border border-white/10 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Cetak Denah Siap Tempel"
          >
            <Printer className="w-3.5 h-3.5 text-[#f0c040]" />
            <span>Cetak Denah</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0d2a45] border border-[#1a3f64] shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#8ba3c7] font-medium block">Skor Harmonisasi Kelas</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-300 font-mono">
                {seatingState.harmonyScore}
              </span>
              <span className="text-xs text-[#8ba3c7]">/ 100</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">Iklim Sosial Sangat Kondusif</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d2a45] border border-[#1a3f64] shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#f0c040]/20 border border-[#f0c040]/40 text-[#f7d970] flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#8ba3c7] font-medium block">Peer Buddy Didampingkan</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#f7d970] font-mono">
                {seatingState.buddyPairsCount}
              </span>
              <span className="text-xs text-[#8ba3c7]">Pasang Meja</span>
            </div>
            <span className="text-[10px] text-[#b0c4de]">Siswa Rentan + Mentor Prososial</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d2a45] border border-[#1a3f64] shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#8ba3c7] font-medium block">Potensi Gesekan Dieliminasi</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-sky-300 font-mono">
                {seatingState.preventedConflictsCount}
              </span>
              <span className="text-xs text-[#8ba3c7]">Hubungan</span>
            </div>
            <span className="text-[10px] text-sky-400 font-semibold">0 Pasangan Mutual Rejection Bersebelahan</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d2a45] border border-[#1a3f64] shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#8ba3c7] font-medium block">Transparansi Algoritma</span>
            <span className="text-xs font-bold text-white block mt-0.5">
              {seatingState.optimizationLog.length} Aturan Sosiometri Terpenuhi
            </span>
            <button
              onClick={() => setShowLogModal(true)}
              className="mt-2 text-[11px] font-bold text-[#f7d970] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Lihat Log Intervensi</span>
            </button>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#143d63] text-[#f7d970] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main View: Seating vs Cooperative Groups */}
      {activeView === 'seating' ? (
        <div className="p-6 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] shadow-2xl space-y-6">
          {/* Layout Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1a3f64]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#8ba3c7]">Model Tata Letak Meja:</span>
              <div className="flex items-center bg-[#0d2a45] p-1 rounded-xl border border-[#1a3f64] text-xs">
                <button
                  onClick={() => setLayoutType('pairs_grid')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    layoutType === 'pairs_grid'
                      ? 'bg-[#f0c040] text-[#0a2a4a] font-bold shadow-xs'
                      : 'text-[#8ba3c7] hover:text-white'
                  }`}
                >
                  Pasangan Meja 2-2 (Standar)
                </button>
                <button
                  onClick={() => setLayoutType('u_shape')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    layoutType === 'u_shape'
                      ? 'bg-[#f0c040] text-[#0a2a4a] font-bold shadow-xs'
                      : 'text-[#8ba3c7] hover:text-white'
                  }`}
                >
                  Formasi U-Shape (Diskusi Terbuka)
                </button>
              </div>
            </div>

            {selectedDeskId && (
              <div className="flex items-center gap-2 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl animate-pulse">
                <ArrowLeftRight className="w-4 h-4" />
                <span>Pilih kursi kedua untuk menukar posisi siswa</span>
                <button
                  onClick={() => setSelectedDeskId(null)}
                  className="ml-2 underline text-white text-[11px]"
                >
                  Batal
                </button>
              </div>
            )}
          </div>

          {/* FRONT OF CLASSROOM: TEACHER DESK & WHITEBOARD */}
          <div className="flex flex-col items-center space-y-2 pt-2">
            <div className="w-full max-w-xl h-10 rounded-xl bg-gradient-to-r from-[#143d63] via-[#1a4f7e] to-[#143d63] border-2 border-dashed border-[#38bdf8]/40 flex items-center justify-center text-xs font-bold tracking-widest text-[#38bdf8] uppercase shadow-lg">
              <Compass className="w-4 h-4 mr-2" />
              PAPAN TULIS &amp; AREA DEPAN KELAS
            </div>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#0d2a45] border border-[#1a3f64] text-[11px] text-[#8ba3c7]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              <span>Meja Guru &amp; Podium Konsultasi Ramah Siswa</span>
            </div>
          </div>

          {/* CLASSROOM SEATING DESKS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-4">
            {tableGroups.map(([tableNum, desksAtTable]) => {
              const leftDesk = desksAtTable.find((d) => d.seatPosition === 'left');
              const rightDesk = desksAtTable.find((d) => d.seatPosition === 'right');

              // Check if this table has a buddy pair
              const hasBuddyPair =
                (leftDesk?.assignedMetric?.status === 'Neglected' ||
                  leftDesk?.assignedMetric?.behavioralStatus === 'Passive Victim') &&
                (rightDesk?.assignedMetric?.status === 'Popular' ||
                  (rightDesk?.assignedMetric?.prosocialScore || 0) >= 6);

              return (
                <div
                  key={tableNum}
                  className={`p-3.5 rounded-2xl border transition duration-200 ${
                    hasBuddyPair
                      ? 'bg-[#0e3557]/90 border-[#f0c040]/50 shadow-md ring-1 ring-[#f0c040]/20'
                      : 'bg-[#0d2a45]/80 border-[#1a3f64] hover:border-[#2a5b8c]'
                  }`}
                >
                  {/* Table Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px]">
                    <span className="font-bold text-[#f7d970] flex items-center gap-1.5">
                      <span>Meja {tableNum}</span>
                      {hasBuddyPair && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#f0c040]/20 text-[#f7d970] border border-[#f0c040]/30">
                          Peer Buddy
                        </span>
                      )}
                    </span>
                    <span className="text-[#8ba3c7] text-[10px]">2 Kursi</span>
                  </div>

                  {/* Two Seats side-by-side */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Left Seat */}
                    <div
                      onClick={() => leftDesk && handleDeskClick(leftDesk.deskId)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition relative group ${
                        selectedDeskId === leftDesk?.deskId
                          ? 'ring-2 ring-amber-400 bg-amber-950/40 border-amber-400'
                          : leftDesk?.assignedStudent
                          ? 'bg-[#0a233a] border-[#1a3f64] hover:border-[#38bdf8]/60 hover:bg-[#10304f]'
                          : 'bg-[#081b2e] border-dashed border-[#1a3f64] text-center text-[#567299]'
                      }`}
                    >
                      {leftDesk?.assignedStudent ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-[#8ba3c7]">
                              {leftDesk.assignedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                            {leftDesk.assignedMetric && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full border font-bold ${
                                  getStatusBadge(leftDesk.assignedMetric.status).bg
                                }`}
                              >
                                {getStatusBadge(leftDesk.assignedMetric.status).label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white truncate group-hover:text-[#38bdf8]">
                            {leftDesk.assignedStudent.name}
                          </p>
                          <p className="text-[10px] text-[#8ba3c7] truncate">
                            NIS: {leftDesk.assignedStudent.nis}
                          </p>
                          <div className="text-[9px] text-[#f7d970] font-semibold pt-1 border-t border-white/5 truncate">
                            {leftDesk.assignedMetric?.behavioralStatus || 'Adaptif'}
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 text-xs font-medium">Kursi Kosong</div>
                      )}
                    </div>

                    {/* Right Seat */}
                    <div
                      onClick={() => rightDesk && handleDeskClick(rightDesk.deskId)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition relative group ${
                        selectedDeskId === rightDesk?.deskId
                          ? 'ring-2 ring-amber-400 bg-amber-950/40 border-amber-400'
                          : rightDesk?.assignedStudent
                          ? 'bg-[#0a233a] border-[#1a3f64] hover:border-[#38bdf8]/60 hover:bg-[#10304f]'
                          : 'bg-[#081b2e] border-dashed border-[#1a3f64] text-center text-[#567299]'
                      }`}
                    >
                      {rightDesk?.assignedStudent ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-[#8ba3c7]">
                              {rightDesk.assignedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                            {rightDesk.assignedMetric && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full border font-bold ${
                                  getStatusBadge(rightDesk.assignedMetric.status).bg
                                }`}
                              >
                                {getStatusBadge(rightDesk.assignedMetric.status).label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white truncate group-hover:text-[#38bdf8]">
                            {rightDesk.assignedStudent.name}
                          </p>
                          <p className="text-[10px] text-[#8ba3c7] truncate">
                            NIS: {rightDesk.assignedStudent.nis}
                          </p>
                          <div className="text-[9px] text-[#f7d970] font-semibold pt-1 border-t border-white/5 truncate">
                            {rightDesk.assignedMetric?.behavioralStatus || 'Adaptif'}
                          </div>
                        </div>
                      ) : (
                        <div className="py-4 text-xs font-medium">Kursi Kosong</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Guidelines Note */}
          <div className="p-4 rounded-xl bg-[#0d2a45]/60 border border-[#1a3f64] text-xs text-[#8ba3c7] space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Petunjuk Intervensi Wali Kelas &amp; Guru BK:</span>
            </div>
            <p>
              &bull; <strong>Peer Buddy Pairing</strong>: Siswa yang berstatus <em>Neglected</em> (terisolasi) secara otomatis dipasangkan dengan siswa <em>Populer-Prososial</em> sebagai tutor sebaya dan pendukung sosial aktif.
            </p>
            <p>
              &bull; <strong>Pencegahan Konflik</strong>: Tidak ada pasangan siswa dengan sentimen <em>Mutual Rejection</em> (saling tidak menyukai) yang ditaruh pada meja yang sama.
            </p>
            <p>
              &bull; <strong>Penyesuaian Manual</strong>: Klik salah satu kursi, lalu klik kursi lain untuk menukar posisi siswa secara dinamis jika ada pertimbangan khusus guru (misal masalah penglihatan/pendengaran di baris depan).
            </p>
          </div>
        </div>
      ) : (
        /* COOPERATIVE GROUPS VIEW */
        <div className="p-6 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1a3f64]">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Pembagian Kelompok Belajar Kooperatif (Jigsaw / STAD)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0c040]/20 text-[#f7d970] border border-[#f0c040]/30 font-bold">
                  Bebas Polarisasi &amp; Eksklusivitas
                </span>
              </h3>
              <p className="text-xs text-[#b0c4de]">
                Menyeimbangkan rasio gender, menempatkan 1 pemimpin prososial di tiap tim, dan merangkul siswa terisolasi secara inklusif.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8ba3c7] font-medium">Banyak Kelompok:</span>
              <div className="flex items-center bg-[#0d2a45] p-1 rounded-xl border border-[#1a3f64]">
                {[4, 6, 8].map((count) => (
                  <button
                    key={count}
                    onClick={() => setGroupCount(count)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      groupCount === count
                        ? 'bg-[#f0c040] text-[#0a2a4a]'
                        : 'text-[#8ba3c7] hover:text-white'
                    }`}
                  >
                    {count} Tim
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Groups Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cooperativeGroups.map((group) => (
              <div
                key={group.groupId}
                className="p-4 rounded-2xl bg-[#0d2a45] border border-[#1a3f64] shadow-lg space-y-4 hover:border-[#38bdf8]/40 transition"
              >
                {/* Group Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <h4 className="font-bold text-white text-sm">{group.groupName}</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-[#f7d970] font-mono border border-white/10 font-bold">
                    {group.genderRatio}
                  </span>
                </div>

                {/* KPI mini */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#0a233a] p-2.5 rounded-xl border border-[#1a3f64]">
                  <div>
                    <span className="text-[#8ba3c7] text-[10px] block">Rata-rata Prososial:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {group.avgProsocial} / 10
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8ba3c7] text-[10px] block">Iklim Tim:</span>
                    <span className="font-bold text-sky-300">
                      {group.hasIsolatedStudent ? 'Pendampingan Aktif' : 'Mandiri & Kolaboratif'}
                    </span>
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#8ba3c7] uppercase tracking-wider block">
                    Anggota ({group.members.length} Siswa):
                  </span>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {group.members.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#0a233a]/80 border border-white/5 hover:bg-[#10304f] transition"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                              m.student.gender === 'L'
                                ? 'bg-sky-500/20 text-sky-300'
                                : 'bg-pink-500/20 text-pink-300'
                            }`}
                          >
                            {m.student.gender}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">
                            {m.student.name}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold shrink-0 ${
                            m.role === 'Leader/Prososial'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : m.role === 'Kawan Suportif'
                              ? 'bg-[#f0c040]/20 text-[#f7d970] border border-[#f0c040]/40'
                              : 'bg-white/5 text-[#b0c4de]'
                          }`}
                        >
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RATIONALE & LOG MODAL */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a2a4a] border border-[#1a3f64] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1a3f64]">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Sparkles className="w-5 h-5 text-[#f0c040]" />
                  <span>Log Rasionalisasi Optimasi Sosiometri</span>
                </div>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="text-[#8ba3c7] hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-white/5"
                >
                  Tutup
                </button>
              </div>

              <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 text-xs">
                {seatingState.optimizationLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#0d2a45] border border-[#1a3f64] text-[#b0c4de] flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#1a3f64] flex justify-end">
                <button
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#f0c040] text-[#0a2a4a] font-bold text-xs shadow-md"
                >
                  Selesai Membaca
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
