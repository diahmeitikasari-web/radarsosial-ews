import React, { useState, useMemo } from 'react';
import {
  Student,
  SchoolClass,
  Period,
  StudentCalculatedMetrics,
  ClassMetricsAggregate,
  SociometricNomination,
  PeerBehavioralRating,
  CoieDodgeStatus,
  School,
  User,
} from '../types';
import { SNAVisualizer } from '../components/SNAVisualizer';
import { DualRadarChart } from '../components/DualRadarChart';
import { LongitudinalTrendChart } from '../components/LongitudinalTrendChart';
import { PredictiveAnalyticsDSS } from '../components/PredictiveAnalyticsDSS';
import { QualitativeNotesWorkspace } from '../components/QualitativeNotesWorkspace';
import { SchoolBrandingModal } from '../components/SchoolBrandingModal';
import { getSchoolTheme } from '../utils/themePresets';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Printer,
  Search,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Brain,
  Network,
  Table,
  FileText,
  Plus,
  Building2,
  CheckCircle2,
  Users,
  Palette,
  Calendar,
  Edit2,
  Trash2,
  Filter,
  Check,
  Layers,
  Settings,
  Clock,
  ArrowRight,
  X,
  AlertTriangle,
} from 'lucide-react';
import { dataStorage } from '../services/dataStorage';

interface GuruBKDashboardProps {
  school?: School;
  currentUser?: User;
  activeClass: SchoolClass;
  activePeriod: Period;
  periods?: Period[];
  onSelectPeriod?: (periodId: string) => void;
  students: Student[];
  nominations: SociometricNomination[];
  behaviors: PeerBehavioralRating[];
  metrics: StudentCalculatedMetrics[];
  aggregate: ClassMetricsAggregate;
  classes?: SchoolClass[];
  onSelectClass?: (classId: string) => void;
  onOpenExcelModal: () => void;
  onOpenReportModal: () => void;
  onRefreshData: () => void;
}

export const GuruBKDashboard: React.FC<GuruBKDashboardProps> = ({
  school,
  currentUser,
  activeClass,
  activePeriod,
  periods = [],
  onSelectPeriod,
  students,
  nominations,
  behaviors,
  metrics,
  aggregate,
  classes = [],
  onSelectClass,
  onOpenExcelModal,
  onOpenReportModal,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'sosiogram' | 'predictive_dss' | 'metrics_table' | 'qualitative_notes'
  >('sosiogram');
  const [selectedStudent, setSelectedStudent] = useState<StudentCalculatedMetrics | null>(() => {
    // Default to a priority high risk student (Rejected/Neglected) if exists
    return metrics.find((m) => m.riskLevel === 'Tinggi') || metrics[0] || null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CoieDodgeStatus>('ALL');

  // School theme & branding
  const schoolTheme = useMemo(() => {
    return school?.theme || getSchoolTheme(school?.theme?.preset);
  }, [school]);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);

  // Multi-Counselor School Filtering: "Kelas Bimbingan Saya" vs "Semua Rombel"
  const hasAssignedClasses = Boolean(currentUser?.assignedClassIds && currentUser.assignedClassIds.length > 0);
  const [classFilterScope, setClassFilterScope] = useState<'my' | 'all'>('my');

  const displayedClasses = useMemo(() => {
    if (hasAssignedClasses && classFilterScope === 'my') {
      const assigned = classes.filter(
        (c) => currentUser?.assignedClassIds?.includes(c.id) || c.counselorId === currentUser?.id
      );
      return assigned.length > 0 ? assigned : classes;
    }
    return classes;
  }, [classes, hasAssignedClasses, classFilterScope, currentUser]);

  // Add Class Modal state
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('8');
  const [newAcademicYear, setNewAcademicYear] = useState('2026/2027');
  const [newHomeroomTeacher, setNewHomeroomTeacher] = useState('');
  const [newCounselorName, setNewCounselorName] = useState(
    currentUser?.name || activeClass.counselorName || 'Liengga Brian Darea, S.Sos.,Gr'
  );
  const [newTargetCount, setNewTargetCount] = useState(30);

  // Edit Class Modal state
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [editClassName, setEditClassName] = useState('');
  const [editClassGrade, setEditClassGrade] = useState('8');
  const [editAcademicYear, setEditAcademicYear] = useState('2026/2027');
  const [editHomeroomTeacher, setEditHomeroomTeacher] = useState('');
  const [editCounselorName, setEditCounselorName] = useState('');
  const [editTargetCount, setEditTargetCount] = useState(30);

  const handleOpenEditClass = (cls: SchoolClass) => {
    setEditClassName(cls.name);
    setEditClassGrade(cls.grade);
    setEditAcademicYear(cls.academicYear);
    setEditHomeroomTeacher(cls.homeroomTeacher);
    setEditCounselorName(cls.counselorName || currentUser?.name || 'Guru BK');
    setEditTargetCount(cls.targetStudentCount || 30);
    setIsEditClassModalOpen(true);
  };

  const handleUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClassName.trim()) return;

    dataStorage.updateClass({
      ...activeClass,
      name: editClassName.trim(),
      grade: editClassGrade,
      academicYear: editAcademicYear.trim() || '2026/2027',
      homeroomTeacher: editHomeroomTeacher.trim() || 'Wali Kelas',
      counselorName: editCounselorName.trim() || currentUser?.name || 'Guru BK',
      targetStudentCount: Number(editTargetCount) || 30,
    });

    setIsEditClassModalOpen(false);
    onRefreshData();
  };

  const handleDeleteClass = (classId: string) => {
    if (classes.length <= 1) {
      alert('Tidak dapat menghapus satu-satunya rombel yang tersisa di sekolah ini.');
      return;
    }
    const target = classes.find((c) => c.id === classId);
    if (!target) return;
    if (window.confirm(`Hapus rombel ${target.name}? Data kelas ini akan dihapus dari sistem.`)) {
      dataStorage.deleteClass(classId);
      const remaining = classes.filter((c) => c.id !== classId);
      if (remaining.length > 0 && onSelectClass) {
        onSelectClass(remaining[0].id);
      }
      onRefreshData();
    }
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const created = dataStorage.addClass({
      schoolId: activeClass.schoolId,
      name: newClassName.trim(),
      grade: newClassGrade,
      academicYear: newAcademicYear.trim() || '2026/2027',
      homeroomTeacher: newHomeroomTeacher.trim() || 'Wali Kelas Terpilih',
      counselorId: currentUser?.id,
      counselorName: newCounselorName.trim() || currentUser?.name || 'Guru BK',
      targetStudentCount: Number(newTargetCount) || 30,
      description: `Rombongan Belajar ${newClassName.trim()}`,
    });

    setIsAddClassModalOpen(false);
    setNewClassName('');
    setNewHomeroomTeacher('');
    if (onSelectClass) {
      onSelectClass(created.id);
    }
    onRefreshData();
  };

  // ----------------------------------------------------
  // Period Management & Cycle State (Semester & Triwulan)
  // ----------------------------------------------------
  const [isPeriodManagerOpen, setIsPeriodManagerOpen] = useState(false);
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);
  const [isEditPeriodOpen, setIsEditPeriodOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);

  // Period Form fields
  const [periodCycleType, setPeriodCycleType] = useState<'semester' | 'triwulan'>('semester');
  const [periodSemester, setPeriodSemester] = useState<1 | 2>(1);
  const [periodQuarter, setPeriodQuarter] = useState<1 | 2 | 3 | 4>(1);
  const [periodAcademicYear, setPeriodAcademicYear] = useState('2026/2027');
  const [periodName, setPeriodName] = useState('Semester Ganjil 2026/2027');
  const [periodCode, setPeriodCode] = useState('2026-S1');
  const [periodStartDate, setPeriodStartDate] = useState('2026-07-15');
  const [periodEndDate, setPeriodEndDate] = useState('2026-12-20');
  const [periodStatus, setPeriodStatus] = useState<'aktif' | 'ditutup' | 'draft'>('aktif');
  const [periodDescription, setPeriodDescription] = useState('Asesmen Sosiometri & Pemetaan Relasi Sosial Siswa');

  const applyCyclePreset = (type: 'semester' | 'triwulan', sem: 1 | 2, q: 1 | 2 | 3 | 4, year: string) => {
    const baseYear = year.slice(0, 4) || '2026';
    const nextYear = String(Number(baseYear) + 1);

    if (type === 'semester') {
      if (sem === 1) {
        setPeriodName(`Semester Ganjil ${year}`);
        setPeriodCode(`${baseYear}-S1`);
        setPeriodStartDate(`${baseYear}-07-15`);
        setPeriodEndDate(`${baseYear}-12-20`);
      } else {
        setPeriodName(`Semester Genap ${year}`);
        setPeriodCode(`${baseYear}-S2`);
        setPeriodStartDate(`${nextYear}-01-05`);
        setPeriodEndDate(`${nextYear}-06-25`);
      }
    } else {
      const qLabels = [
        'Triwulan I (Q1: Jul-Sep)',
        'Triwulan II (Q2: Okt-Des)',
        'Triwulan III (Q3: Jan-Mar)',
        'Triwulan IV (Q4: Apr-Jun)',
      ];
      setPeriodName(`${qLabels[q - 1]} ${year}`);
      setPeriodCode(`${baseYear}-TW${q}`);
      if (q === 1) {
        setPeriodStartDate(`${baseYear}-07-01`);
        setPeriodEndDate(`${baseYear}-09-30`);
      } else if (q === 2) {
        setPeriodStartDate(`${baseYear}-10-01`);
        setPeriodEndDate(`${baseYear}-12-31`);
      } else if (q === 3) {
        setPeriodStartDate(`${nextYear}-01-01`);
        setPeriodEndDate(`${nextYear}-03-31`);
      } else {
        setPeriodStartDate(`${nextYear}-04-01`);
        setPeriodEndDate(`${nextYear}-06-30`);
      }
    }
  };

  const handleOpenAddPeriod = () => {
    setPeriodCycleType('semester');
    setPeriodSemester(1);
    setPeriodQuarter(1);
    setPeriodAcademicYear('2026/2027');
    setPeriodStatus('aktif');
    setPeriodDescription('Asesmen Sosiometri & Pemetaan Relasi Sosial Siswa');
    applyCyclePreset('semester', 1, 1, '2026/2027');
    setIsAddPeriodOpen(true);
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const newP: Period = {
      id: `period-${Date.now()}`,
      name: periodName.trim() || `Periode ${periodAcademicYear}`,
      code: periodCode.trim() || `P-${Date.now().toString().slice(-4)}`,
      academicYear: periodAcademicYear.trim() || '2026/2027',
      semester: periodSemester,
      cycleType: periodCycleType,
      quarter: periodCycleType === 'triwulan' ? periodQuarter : undefined,
      status: periodStatus,
      startDate: periodStartDate,
      endDate: periodEndDate,
      description: periodDescription.trim() || undefined,
    };

    dataStorage.addPeriod(newP);
    if (periodStatus === 'aktif' && onSelectPeriod) {
      onSelectPeriod(newP.id);
    }
    setIsAddPeriodOpen(false);
    onRefreshData();
  };

  const handleOpenEditPeriod = (p: Period) => {
    setEditingPeriod(p);
    setPeriodCycleType(p.cycleType || (p.quarter ? 'triwulan' : 'semester'));
    setPeriodSemester(p.semester || 1);
    setPeriodQuarter(p.quarter || 1);
    setPeriodAcademicYear(p.academicYear || '2026/2027');
    setPeriodName(p.name);
    setPeriodCode(p.code);
    setPeriodStartDate(p.startDate);
    setPeriodEndDate(p.endDate);
    setPeriodStatus(p.status);
    setPeriodDescription(p.description || '');
    setIsEditPeriodOpen(true);
  };

  const handleUpdatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeriod) return;

    const updatedP: Period = {
      ...editingPeriod,
      name: periodName.trim(),
      code: periodCode.trim(),
      academicYear: periodAcademicYear.trim(),
      semester: periodSemester,
      cycleType: periodCycleType,
      quarter: periodCycleType === 'triwulan' ? periodQuarter : undefined,
      status: periodStatus,
      startDate: periodStartDate,
      endDate: periodEndDate,
      description: periodDescription.trim() || undefined,
    };

    dataStorage.updatePeriod(updatedP);
    setIsEditPeriodOpen(false);
    setEditingPeriod(null);
    onRefreshData();
  };

  const handleDeletePeriod = (periodId: string) => {
    if (periods.length <= 1) {
      alert('Tidak dapat menghapus satu-satunya periode asesmen yang tersedia.');
      return;
    }
    if (window.confirm('Apakah Anda yakin ingin menghapus periode asesmen ini?')) {
      dataStorage.deletePeriod(periodId);
      const remaining = periods.filter((p) => p.id !== periodId);
      if (remaining.length > 0 && onSelectPeriod && activePeriod.id === periodId) {
        onSelectPeriod(remaining[0].id);
      }
      onRefreshData();
    }
  };

  const handleActivatePeriod = (periodId: string) => {
    dataStorage.activatePeriod(periodId);
    if (onSelectPeriod) {
      onSelectPeriod(periodId);
    }
    onRefreshData();
  };

  // Filtered student list
  const filteredMetrics = metrics.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nis.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Priority students needing urgent intervention
  const priorityStudents = metrics.filter((m) => m.priorityFlag);

  return (
    <div className="space-y-6 text-[#e8edf5]">
      {/* Top Banner / Classroom Overview matching school branding and radar-sosial palette */}
      <div
        className="rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${schoolTheme.primaryColor}, ${schoolTheme.secondaryColor})`,
          borderColor: `${schoolTheme.accentColor}40`,
        }}
      >
        {/* Tier 1: Identity, Title & Primary Operational Actions */}
        <div className="p-5 sm:p-6 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            {/* Left: School Identity & Diagnostic Title */}
            <div className="space-y-2 max-w-3xl">
              {/* Meta Chips: Sekolah, Guru BK, Wali Kelas */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span
                  className="px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 shadow-xs"
                  style={{
                    backgroundColor: `${schoolTheme.accentColor}25`,
                    color: schoolTheme.accentLight || schoolTheme.accentColor,
                    border: `1px solid ${schoolTheme.accentColor}50`,
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{school?.name || 'MTs Negeri 2 Bangka'}</span>
                  {school?.npsn && <span className="opacity-75 font-mono">({school.npsn})</span>}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/35 text-[#b0c4de] text-[11px] border border-white/10 shadow-xs">
                  <span className="text-[#8ba3c7]">Guru BK:</span>
                  <strong className="text-white font-semibold">{currentUser?.name || activeClass.counselorName || 'Liengga Brian Darea, S.Sos.,Gr'}</strong>
                </span>

                {activeClass.homeroomTeacher && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/25 text-[#b0c4de] text-[11px] border border-white/5">
                    <span className="text-[#8ba3c7]">Wali Kelas:</span>
                    <strong className="text-white font-medium">{activeClass.homeroomTeacher}</strong>
                  </span>
                )}
              </div>

              {/* Page Title & Class Badge */}
              <div className="pt-0.5">
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5 flex-wrap">
                  <span>Diagnostik Sosiometri &amp; Radar Perilaku:</span>
                  <motion.span
                    key={activeClass.id}
                    initial={{ opacity: 0, scale: 0.92, y: 3 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="px-3 py-0.5 rounded-xl text-white font-extrabold shadow-md inline-flex items-center gap-1.5"
                    style={{ backgroundColor: `${schoolTheme.accentColor}30`, border: `1px solid ${schoolTheme.accentColor}70` }}
                  >
                    <span>{activeClass.name}</span>
                    <span className="text-xs font-normal text-[#b0c4de] font-mono">({students.length} Siswa)</span>
                  </motion.span>
                </h2>
                <p className="text-xs sm:text-sm text-[#b0c4de] max-w-2xl leading-relaxed mt-1">
                  Pemetaan struktur relasi sosial, deteksi dini siswa rentan (Rejected/Neglected), dan rekomendasi intervensi konseling berbasis sosiometri Moreno &amp; klasifikasi Coie-Dodge.
                </p>
              </div>
            </div>

            {/* Right: Primary Operational Action Group (Fixed, tidy layout) */}
            <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
              {/* School Branding Customizer */}
              <button
                id="btn-branding-school"
                onClick={() => setIsBrandingModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#f7d970] border border-white/20 text-xs font-bold transition shadow-xs cursor-pointer"
                title="Ubah Preferensi Warna Tema Branding Satuan Pendidikan"
              >
                <Palette className="w-3.5 h-3.5 text-[#f0c040]" />
                <span className="hidden sm:inline">Tema Branding</span>
              </button>

              {/* Unggah Excel */}
              <button
                id="btn-upload-excel"
                onClick={onOpenExcelModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition duration-150 cursor-pointer"
                title="Impor Data Angket Sosiometri & Perilaku dari Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Unggah Excel</span>
              </button>

              {/* Cetak PDF */}
              <button
                id="btn-print-official-report"
                onClick={onOpenReportModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] active:bg-[#e0b030] text-[#0a2a4a] text-xs font-extrabold shadow-md shadow-black/30 transition duration-150 cursor-pointer"
                title="Cetak Dokumen Laporan Resmi Diagnostik BK & Rekomendasi Konseling"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tier 2: Dedicated Control & Context Shelf (Bilah Kontrol Rombel & Periode) */}
        <div className="bg-[#06182a]/75 backdrop-blur-md border-t border-white/10 px-5 py-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left: Rombel Scope Filter, Dropdown Selector & Class Management */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Multi-counselor Class Filter Scope */}
            {hasAssignedClasses && (
              <div className="flex items-center rounded-xl bg-[#0d2a45] p-1 border border-[#1a3f64] text-xs shadow-xs">
                <button
                  onClick={() => setClassFilterScope('my')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-xs ${
                    classFilterScope === 'my'
                      ? 'bg-[#1a4a6e] text-[#f7d970] shadow-xs'
                      : 'text-[#8ba3c7] hover:text-white'
                  }`}
                  title="Tampilkan hanya rombel yang ditugaskan ke Guru BK ini"
                >
                  Rombel Saya
                </button>
                <button
                  onClick={() => setClassFilterScope('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-xs ${
                    classFilterScope === 'all'
                      ? 'bg-[#1a4a6e] text-[#f7d970] shadow-xs'
                      : 'text-[#8ba3c7] hover:text-white'
                  }`}
                  title="Tampilkan semua rombel di sekolah"
                >
                  Semua ({classes.length})
                </button>
              </div>
            )}

            {/* Rombel Selector & Management Dropdown */}
            {classes.length > 0 && onSelectClass && (
              <div className="flex items-center gap-1.5 bg-[#0d2a45] px-3 py-1.5 rounded-xl border border-[#1a3f64] text-xs shadow-xs">
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[#8ba3c7] text-xs font-semibold">Rombel:</span>
                <select
                  value={activeClass.id}
                  onChange={(e) => onSelectClass(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-hidden cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
                >
                  {displayedClasses.map((cls) => (
                    <option key={cls.id} value={cls.id} className="bg-[#0a2a4a] text-white">
                      {cls.name} {cls.gradeLevel ? `(Kls ${cls.gradeLevel})` : ''}
                    </option>
                  ))}
                </select>

                {/* Edit Current Class */}
                <button
                  onClick={() => handleOpenEditClass(activeClass)}
                  className="p-1 rounded-lg hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition cursor-pointer ml-0.5"
                  title="Kelola & Edit Rombel Ini"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Current Class if multiple exist */}
                {classes.length > 1 && (
                  <button
                    onClick={() => handleDeleteClass(activeClass.id)}
                    className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                    title="Hapus Rombel Ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Quick Class Selector Chips (if classes <= 5) */}
            <div className="hidden xl:flex items-center gap-1 pl-0.5">
              {displayedClasses.slice(0, 5).map((cls) => {
                const isActive = cls.id === activeClass.id;
                return (
                  <button
                    key={cls.id}
                    onClick={() => onSelectClass?.(cls.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#f0c040]/20 text-[#f7d970] border border-[#f0c040]/50 font-bold shadow-xs'
                        : 'text-[#8ba3c7] hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {cls.name}
                  </button>
                );
              })}
            </div>

            {/* Add Class Button */}
            <button
              id="btn-add-class"
              onClick={() => setIsAddClassModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#143d63] hover:bg-[#1c4d7b] text-[#f7d970] text-xs font-bold border border-[#f0c040]/30 shadow-xs transition duration-150 cursor-pointer"
              title="Tambah Rombongan Belajar Baru (Sinkron ke Admin)"
            >
              <Plus className="w-3.5 h-3.5 text-[#f0c040]" />
              <span>Tambah Kelas</span>
            </button>
          </div>

          {/* Right: Period Manager Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-manage-periods"
              onClick={() => setIsPeriodManagerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d2a45] hover:bg-[#1a4a6e] text-white border border-[#1a3f64] text-xs font-medium transition shadow-xs cursor-pointer w-full sm:w-auto justify-between sm:justify-start"
              title="Kelola Siklus Periode Input (Semester Ganjil/Genap & Triwulan)"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#f0c040] shrink-0" />
                <div className="flex items-center gap-1.5 text-left">
                  <span className="text-[11px] text-[#8ba3c7]">Periode:</span>
                  <motion.span
                    key={activePeriod.id}
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[#f7d970] font-bold text-xs truncate max-w-[180px]"
                  >
                    {activePeriod.name}
                  </motion.span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                {activePeriod.cycleType === 'triwulan' ? 'Triwulan' : 'Semester'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Guru BK Workspaces */}
      <div className="flex items-center gap-2 border-b border-[#1a3f64] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sosiogram')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-150 shrink-0 cursor-pointer ${
            activeTab === 'sosiogram'
              ? 'bg-[#f0c040] text-[#0a2a4a] shadow-lg'
              : 'bg-[#0d3555] hover:bg-[#1a3f64] text-[#b0c4de] border border-[#1a3f64]'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Sosiogram &amp; Jaringan SNA</span>
        </button>

        <button
          onClick={() => setActiveTab('predictive_dss')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-150 shrink-0 cursor-pointer ${
            activeTab === 'predictive_dss'
              ? 'bg-[#f0c040] text-[#0a2a4a] shadow-lg'
              : 'bg-[#0d3555] hover:bg-[#1a3f64] text-[#b0c4de] border border-[#1a3f64]'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Analitik Prediktif &amp; Intervensi DSS (Behavioral Science)</span>
          {priorityStudents.length > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'predictive_dss' ? 'bg-[#0a2a4a] text-[#f7d970]' : 'bg-rose-500 text-white animate-pulse'
            }`}>
              {priorityStudents.length} Siaga
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('metrics_table')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-150 shrink-0 cursor-pointer ${
            activeTab === 'metrics_table'
              ? 'bg-[#f0c040] text-[#0a2a4a] shadow-lg'
              : 'bg-[#0d3555] hover:bg-[#1a3f64] text-[#b0c4de] border border-[#1a3f64]'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Tabel Matriks &amp; Evaluasi Lengkap</span>
        </button>

        <button
          id="btn-tab-qualitative-notes"
          onClick={() => setActiveTab('qualitative_notes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-150 shrink-0 cursor-pointer ${
            activeTab === 'qualitative_notes'
              ? 'bg-[#f0c040] text-[#0a2a4a] shadow-lg'
              : 'bg-[#0d3555] hover:bg-[#1a3f64] text-[#b0c4de] border border-[#1a3f64]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Catatan Kualitatif &amp; Refleksi Cetak (LLM)</span>
        </button>
      </div>

      {/* Priority Crisis Alert Queue (EWS) */}
      {priorityStudents.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-500/50 shadow-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Peringatan Dini (EWS): {priorityStudents.length} Siswa Membutuhkan Atensi Prioritas</span>
            </div>
            <button
              onClick={() => setActiveTab('predictive_dss')}
              className="text-[11px] text-[#f7d970] hover:underline font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Buka Analisis DSS &amp; Langkah Intervensi Presisi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {priorityStudents.map((s) => (
              <div
                key={s.studentId}
                onClick={() => {
                  setSelectedStudent(s);
                  setActiveTab('predictive_dss');
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                  selectedStudent?.studentId === s.studentId
                    ? 'bg-rose-900/40 border-rose-400 shadow-md'
                    : 'bg-[#0a2a4a]/80 border-rose-900/60 hover:bg-[#0a2a4a]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{s.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {s.status}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-[#b0c4de] font-mono">
                      {s.nis}
                    </span>
                  </div>
                  <div className="text-xs text-rose-300 font-medium mt-1">
                    {s.priorityReason}
                  </div>
                  <div className="text-[11px] text-[#b0c4de] mt-1 line-clamp-2">
                    <strong className="text-white">Rencana Dampingan:</strong> {s.dssRecommendation}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-[#b0c4de]">Penolakan</div>
                  <div className="text-base font-extrabold text-rose-400">{s.dislikesReceived} Dislikes</div>
                  <div className="text-[10px] text-[#b0c4de] mt-1">Preferensi: {s.zSP}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panels with smooth framer-motion transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* TAB 1: Sosiogram & Jaringan Visual SNA */}
      {activeTab === 'sosiogram' && (
        <div className="space-y-6">
          <SNAVisualizer
            students={students}
            nominations={nominations}
            metrics={metrics}
            selectedStudentId={selectedStudent?.studentId}
            onSelectStudent={(s) => setSelectedStudent(s)}
          />

          {/* Deep-Dive Grid: Dual Radar & Longitudinal Trend */}
          {selectedStudent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DualRadarChart student={selectedStudent} />
              <LongitudinalTrendChart
                selectedStudent={selectedStudent}
                allMetrics={metrics}
                periods={[
                  { id: '2025-s1', name: 'Sem 1 25/26', code: '2025-S1', academicYear: '2025/2026', semester: 1, status: 'ditutup', startDate: '', endDate: '' },
                  { id: '2025-s2', name: 'Sem 2 25/26', code: '2025-S2', academicYear: '2025/2026', semester: 2, status: 'ditutup', startDate: '', endDate: '' },
                  { id: '2026-s1', name: 'Sem 1 26/27', code: '2026-S1', academicYear: '2026/2027', semester: 1, status: 'aktif', startDate: '', endDate: '' },
                ]}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Predictive Analytics & Behavioral Science DSS */}
      {activeTab === 'predictive_dss' && (
        <PredictiveAnalyticsDSS
          students={students}
          nominations={nominations}
          metrics={metrics}
          aggregate={aggregate}
          activeClassName={activeClass.name}
          counselorName="Liengga Brian Darea, S.Sos.,Gr"
        />
      )}

      {/* TAB 3: Comprehensive Student Metrics Table */}
      {activeTab === 'metrics_table' && (
        <div className="rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] p-5 shadow-xl space-y-4">
          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <span>Tabel Matriks Sosiometri &amp; Status Sosial Siswa</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#0a2a4a] text-[#f7d970] font-medium border border-[#1a3f64]">
                  {filteredMetrics.length} dari {metrics.length} Siswa
                </span>
              </h3>
              <p className="text-xs text-[#b0c4de]">
                Klasifikasi otomatis status sosial Coie &amp; Dodge (1982) berdasarkan Likes, Dislikes, dan skor Z.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-[#b0c4de] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau NIS..."
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#b0c4de]/50 focus:outline-hidden focus:border-[#f0c040] transition"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                aria-label="Filter status sosial siswa"
                className="bg-[#0a2a4a] border border-[#1a3f64] text-white text-xs rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-[#f0c040] transition cursor-pointer"
              >
                <option value="ALL">Semua Status Sosial</option>
                <option value="Popular">Popular (Populer)</option>
                <option value="Average">Average (Rata-rata)</option>
                <option value="Neglected">Neglected (Terabaikan)</option>
                <option value="Rejected">Rejected (Tertolak)</option>
                <option value="Controversial">Controversial (Kontroversial)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#1a3f64]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0a2a4a] text-[#b0c4de] border-b border-[#1a3f64]">
                  <th className="py-3 px-3.5 font-bold">No</th>
                  <th className="py-3 px-3.5 font-bold">Nama Siswa</th>
                  <th className="py-3 px-3.5 font-bold">NIS / JK</th>
                  <th className="py-3 px-3.5 font-bold text-center">Likes (L)</th>
                  <th className="py-3 px-3.5 font-bold text-center">Dislikes (D)</th>
                  <th className="py-3 px-3.5 font-bold text-center">Z_SP</th>
                  <th className="py-3 px-3.5 font-bold text-center">Z_SI</th>
                  <th className="py-3 px-3.5 font-bold">Status Coie &amp; Dodge</th>
                  <th className="py-3 px-3.5 font-bold">Kategori Perilaku</th>
                  <th className="py-3 px-3.5 font-bold">Tingkat Risiko</th>
                  <th className="py-3 px-3.5 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a3f64]/60">
                {filteredMetrics.map((student, idx) => {
                  const isSelected = selectedStudent?.studentId === student.studentId;
                  return (
                    <tr
                      key={student.studentId}
                      onClick={() => setSelectedStudent(student)}
                      className={`cursor-pointer transition duration-150 ${
                        isSelected
                          ? 'bg-[#1a3f64] text-white font-medium'
                          : 'hover:bg-[#0a2a4a]/80 text-[#e8edf5]'
                      }`}
                    >
                      <td className="py-3 px-3.5 text-[#b0c4de] font-mono">{idx + 1}</td>
                      <td className="py-3 px-3.5 font-bold">{student.name}</td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-[#b0c4de]">
                        {student.nis} ({student.gender})
                      </td>
                      <td className="py-3 px-3.5 text-center font-bold text-emerald-400">
                        {student.likesReceived}
                      </td>
                      <td className="py-3 px-3.5 text-center font-bold text-rose-400">
                        {student.dislikesReceived}
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono font-bold">
                        <span
                          className={
                            student.zSP > 0.5
                              ? 'text-emerald-400'
                              : student.zSP < -0.5
                              ? 'text-rose-400'
                              : 'text-[#b0c4de]'
                          }
                        >
                          {student.zSP}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono font-bold">
                        <span
                          className={
                            student.zSI > 0.5
                              ? 'text-cyan-400'
                              : student.zSI < -0.5
                              ? 'text-amber-400'
                              : 'text-[#b0c4de]'
                          }
                        >
                          {student.zSI}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            student.status === 'Popular'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : student.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : student.status === 'Neglected'
                              ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                              : student.status === 'Controversial'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-[11px] font-medium text-[#b0c4de]">
                        {student.behavioralStatus}
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            student.riskLevel === 'Tinggi'
                              ? 'bg-rose-500/20 text-rose-300'
                              : student.riskLevel === 'Sedang'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {student.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                            setActiveTab('predictive_dss');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#f0c040]/10 hover:bg-[#f0c040] hover:text-[#0a2a4a] text-[#f7d970] text-[10px] font-bold border border-[#f0c040]/30 transition cursor-pointer"
                        >
                          DSS Intervensi
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

          {/* TAB 4: Catatan Kualitatif Siswa & Refleksi Guru BK (Masuk Laporan Cetak PDF) */}
          {activeTab === 'qualitative_notes' && (
            <QualitativeNotesWorkspace
              activeClass={activeClass}
              activePeriod={activePeriod}
              students={students}
              currentUser={currentUser}
              onRefreshData={onRefreshData}
              onOpenReportModal={onOpenReportModal}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* MODAL TAMBAH KELAS / ROMBEL */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-[#f0c040]/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f0c040] text-[#0a2a4a] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">Tambah Rombel / Kelas Baru</h3>
                  <p className="text-[11px] text-[#b0c4de]">Mendaftarkan rombel baru pada satuan pendidikan</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddClassModalOpen(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Rombel / Kelas:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 8B, Kelas 7C, dsb."
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-medium focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tingkat / Grade:</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    <option value="7">Kelas 7</option>
                    <option value="8">Kelas 8</option>
                    <option value="9">Kelas 9</option>
                    <option value="10">Kelas 10</option>
                    <option value="11">Kelas 11</option>
                    <option value="12">Kelas 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tahun Ajaran:</label>
                  <input
                    type="text"
                    required
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    placeholder="2026/2027"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Wali Kelas:</label>
                <input
                  type="text"
                  placeholder="Contoh: Siti Rahmawati, S.Pd."
                  value={newHomeroomTeacher}
                  onChange={(e) => setNewHomeroomTeacher(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Guru BK Pengampu:</label>
                  <input
                    type="text"
                    value={newCounselorName}
                    onChange={(e) => setNewCounselorName(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Estimasi Jumlah Siswa:</label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={newTargetCount}
                    onChange={(e) => setNewTargetCount(Number(e.target.value))}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-[11px] text-[#b0c4de]">
                Setelah rombel dibuat, Anda dapat langsung mengunggah file Excel berisi data siswa dan respon sosiometri untuk kelas ini.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Rombel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT KELAS / ROMBEL */}
      {isEditClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-cyan-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-[#0a2a4a] flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">Edit Rombongan Belajar</h3>
                  <p className="text-[11px] text-[#b0c4de]">Perbarui informasi rombel dan penugasan guru BK</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditClassModalOpen(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateClass} className="space-y-3">
              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Rombel / Kelas:</label>
                <input
                  type="text"
                  required
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-medium focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tingkat / Grade:</label>
                  <select
                    value={editClassGrade}
                    onChange={(e) => setEditClassGrade(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                  >
                    <option value="7">Kelas 7</option>
                    <option value="8">Kelas 8</option>
                    <option value="9">Kelas 9</option>
                    <option value="10">Kelas 10</option>
                    <option value="11">Kelas 11</option>
                    <option value="12">Kelas 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tahun Ajaran:</label>
                  <input
                    type="text"
                    required
                    value={editAcademicYear}
                    onChange={(e) => setEditAcademicYear(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Wali Kelas:</label>
                <input
                  type="text"
                  value={editHomeroomTeacher}
                  onChange={(e) => setEditHomeroomTeacher(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Guru BK Pengampu:</label>
                  <input
                    type="text"
                    value={editCounselorName}
                    onChange={(e) => setEditCounselorName(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Estimasi Target Siswa:</label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={editTargetCount}
                    onChange={(e) => setEditTargetCount(Number(e.target.value))}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#1a3f64]">
                {classes.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditClassModalOpen(false);
                      handleDeleteClass(activeClass.id);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Rombel</span>
                  </button>
                ) : <div />}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditClassModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0a2a4a] font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KELOLA PERIODE ASESMEN */}
      {isPeriodManagerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-[#f0c040]/50 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 text-xs max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f0c040] text-[#0a2a4a] flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Kelola Periode Input &amp; Siklus Asesmen</h3>
                  <p className="text-[11px] text-[#b0c4de]">
                    Dukungan siklus Semester (Ganjil &amp; Genap) dan Triwulan (Q1 s/d Q4) &bull; Sinkron dengan Dashboard Admin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPeriodManagerOpen(false)}
                className="text-[#b0c4de] hover:text-white text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 bg-[#0a2a4a] p-3 rounded-2xl border border-[#1a3f64] shrink-0">
              <div className="text-xs text-[#b0c4de]">
                Periode Aktif Saat Ini:{' '}
                <strong className="text-[#f7d970] font-serif text-sm">{activePeriod.name}</strong>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {activePeriod.cycleType === 'triwulan' ? `Triwulan (Q${activePeriod.quarter || 1})` : `Semester ${activePeriod.semester || 1}`}
                </span>
              </div>
              <button
                onClick={handleOpenAddPeriod}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buka Periode Baru</span>
              </button>
            </div>

            {/* List of Periods */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {periods.map((p) => {
                const isActive = p.id === activePeriod.id || p.status === 'aktif';
                const isTriwulan = p.cycleType === 'triwulan' || Boolean(p.quarter);
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-[#0a2a4a] border-[#f0c040]/70 shadow-lg'
                        : 'bg-[#0a2a4a]/60 border-[#1a3f64] hover:bg-[#0a2a4a]/90'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif text-sm font-bold text-white">{p.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/10 text-white border border-white/15">
                          {p.code}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isTriwulan
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {isTriwulan ? `Triwulan (Q${p.quarter || 1})` : `Semester ${p.semester || 1}`}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            p.status === 'aktif'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : p.status === 'draft'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                          }`}
                        >
                          {p.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#b0c4de] flex-wrap">
                        <span>Tahun Ajaran: <strong className="text-white">{p.academicYear}</strong></span>
                        {p.startDate && p.endDate && (
                          <span>Rentang: {p.startDate} s/d {p.endDate}</span>
                        )}
                        {p.description && (
                          <span className="italic text-[#8ba3c7]">&bull; {p.description}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {p.status !== 'aktif' && (
                        <button
                          onClick={() => handleActivatePeriod(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
                        >
                          Aktifkan
                        </button>
                      )}
                      {onSelectPeriod && p.id !== activePeriod.id && (
                        <button
                          onClick={() => {
                            onSelectPeriod(p.id);
                            setIsPeriodManagerOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#1a3f64] hover:bg-[#204c75] text-[#f7d970] text-xs font-bold transition cursor-pointer"
                        >
                          Pilih
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditPeriod(p)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
                        title="Edit Periode"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {periods.length > 1 && (
                        <button
                          onClick={() => handleDeletePeriod(p.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                          title="Hapus Periode"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#1a3f64] flex justify-end shrink-0">
              <button
                onClick={() => setIsPeriodManagerOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#1a3f64] hover:bg-[#204c75] text-white font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH PERIODE ASESMEN BARU */}
      {isAddPeriodOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-[#f0c040]/70 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f0c040] text-[#0a2a4a] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">Buka Periode Asesmen Baru</h3>
                  <p className="text-[11px] text-[#b0c4de]">Pilih siklus Semester (Ganjil/Genap) atau Triwulan (Q1-Q4)</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPeriodOpen(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePeriod} className="space-y-3.5">
              {/* Cycle Type Selector */}
              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1.5">Tipe Siklus Input Asesmen:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPeriodCycleType('semester');
                      applyCyclePreset('semester', periodSemester, periodQuarter, periodAcademicYear);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      periodCycleType === 'semester'
                        ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                        : 'bg-[#0a2a4a] border-[#1a3f64] text-[#b0c4de] hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Siklus Semester</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPeriodCycleType('triwulan');
                      applyCyclePreset('triwulan', periodSemester, periodQuarter, periodAcademicYear);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      periodCycleType === 'triwulan'
                        ? 'bg-purple-600/30 border-purple-400 text-purple-300'
                        : 'bg-[#0a2a4a] border-[#1a3f64] text-[#b0c4de] hover:text-white'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Siklus Triwulan (3 Bulan)</span>
                  </button>
                </div>
              </div>

              {/* Sub-Selection based on Cycle Type */}
              {periodCycleType === 'semester' ? (
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1.5">Pilihan Semester:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPeriodSemester(1);
                        applyCyclePreset('semester', 1, periodQuarter, periodAcademicYear);
                      }}
                      className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        periodSemester === 1
                          ? 'bg-[#f0c040]/20 border-[#f0c040] text-[#f7d970]'
                          : 'bg-[#0a2a4a] border-[#1a3f64] text-[#b0c4de]'
                      }`}
                    >
                      Semester Ganjil (Semester 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPeriodSemester(2);
                        applyCyclePreset('semester', 2, periodQuarter, periodAcademicYear);
                      }}
                      className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        periodSemester === 2
                          ? 'bg-[#f0c040]/20 border-[#f0c040] text-[#f7d970]'
                          : 'bg-[#0a2a4a] border-[#1a3f64] text-[#b0c4de]'
                      }`}
                    >
                      Semester Genap (Semester 2)
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1.5">Pilihan Triwulan (Quarter):</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { q: 1 as const, label: 'Triwulan I (Jul - Sep)' },
                      { q: 2 as const, label: 'Triwulan II (Okt - Des)' },
                      { q: 3 as const, label: 'Triwulan III (Jan - Mar)' },
                      { q: 4 as const, label: 'Triwulan IV (Apr - Jun)' },
                    ].map((item) => (
                      <button
                        key={item.q}
                        type="button"
                        onClick={() => {
                          setPeriodQuarter(item.q);
                          applyCyclePreset('triwulan', periodSemester, item.q, periodAcademicYear);
                        }}
                        className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          periodQuarter === item.q
                            ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                            : 'bg-[#0a2a4a] border-[#1a3f64] text-[#b0c4de]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tahun Ajaran:</label>
                  <input
                    type="text"
                    required
                    value={periodAcademicYear}
                    onChange={(e) => {
                      setPeriodAcademicYear(e.target.value);
                      applyCyclePreset(periodCycleType, periodSemester, periodQuarter, e.target.value);
                    }}
                    placeholder="2026/2027"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-medium focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Kode Unik Periode:</label>
                  <input
                    type="text"
                    required
                    value={periodCode}
                    onChange={(e) => setPeriodCode(e.target.value)}
                    placeholder="2026-S1 / 2026-TW1"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-mono focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Resmi Periode Asesmen:</label>
                <input
                  type="text"
                  required
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  placeholder="Contoh: Semester Ganjil 2026/2027"
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-medium focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tanggal Mulai:</label>
                  <input
                    type="date"
                    required
                    value={periodStartDate}
                    onChange={(e) => setPeriodStartDate(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tanggal Berakhir:</label>
                  <input
                    type="date"
                    required
                    value={periodEndDate}
                    onChange={(e) => setPeriodEndDate(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Status Periode:</label>
                  <select
                    value={periodStatus}
                    onChange={(e) => setPeriodStatus(e.target.value as any)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    <option value="aktif">Aktif (Gunakan Sekarang)</option>
                    <option value="draft">Draft (Persiapan)</option>
                    <option value="ditutup">Ditutup / Arsip</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Catatan / Deskripsi:</label>
                  <input
                    type="text"
                    value={periodDescription}
                    onChange={(e) => setPeriodDescription(e.target.value)}
                    placeholder="Tujuan asesmen"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-[11px] text-[#b0c4de]">
                Periode ini akan otomatis tersinkronisasi dengan Dashboard Admin dan seluruh Rombongan Belajar di satuan pendidikan.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => setIsAddPeriodOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Periode Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PERIODE ASESMEN */}
      {isEditPeriodOpen && editingPeriod && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-cyan-500/70 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-[#0a2a4a] flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">Edit Periode Asesmen</h3>
                  <p className="text-[11px] text-[#b0c4de]">Perbarui data periode {editingPeriod.code}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditPeriodOpen(false);
                  setEditingPeriod(null);
                }}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdatePeriod} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tipe Siklus:</label>
                  <select
                    value={periodCycleType}
                    onChange={(e) => {
                      const t = e.target.value as 'semester' | 'triwulan';
                      setPeriodCycleType(t);
                      applyCyclePreset(t, periodSemester, periodQuarter, periodAcademicYear);
                    }}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                  >
                    <option value="semester">Semester (Ganjil / Genap)</option>
                    <option value="triwulan">Triwulan (Q1 - Q4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">
                    {periodCycleType === 'semester' ? 'Semester:' : 'Triwulan:'}
                  </label>
                  {periodCycleType === 'semester' ? (
                    <select
                      value={periodSemester}
                      onChange={(e) => {
                        const sem = Number(e.target.value) as 1 | 2;
                        setPeriodSemester(sem);
                        applyCyclePreset('semester', sem, periodQuarter, periodAcademicYear);
                      }}
                      className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                    >
                      <option value="1">Semester Ganjil (1)</option>
                      <option value="2">Semester Genap (2)</option>
                    </select>
                  ) : (
                    <select
                      value={periodQuarter}
                      onChange={(e) => {
                        const q = Number(e.target.value) as 1 | 2 | 3 | 4;
                        setPeriodQuarter(q);
                        applyCyclePreset('triwulan', periodSemester, q, periodAcademicYear);
                      }}
                      className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                    >
                      <option value="1">Triwulan I (Q1: Jul-Sep)</option>
                      <option value="2">Triwulan II (Q2: Okt-Des)</option>
                      <option value="3">Triwulan III (Q3: Jan-Mar)</option>
                      <option value="4">Triwulan IV (Q4: Apr-Jun)</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tahun Ajaran:</label>
                  <input
                    type="text"
                    required
                    value={periodAcademicYear}
                    onChange={(e) => setPeriodAcademicYear(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-medium focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Kode Periode:</label>
                  <input
                    type="text"
                    required
                    value={periodCode}
                    onChange={(e) => setPeriodCode(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-mono focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Resmi Periode:</label>
                <input
                  type="text"
                  required
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-medium focus:outline-hidden focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tanggal Mulai:</label>
                  <input
                    type="date"
                    required
                    value={periodStartDate}
                    onChange={(e) => setPeriodStartDate(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tanggal Berakhir:</label>
                  <input
                    type="date"
                    required
                    value={periodEndDate}
                    onChange={(e) => setPeriodEndDate(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Status Periode:</label>
                  <select
                    value={periodStatus}
                    onChange={(e) => setPeriodStatus(e.target.value as any)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="draft">Draft</option>
                    <option value="ditutup">Ditutup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Deskripsi:</label>
                  <input
                    type="text"
                    value={periodDescription}
                    onChange={(e) => setPeriodDescription(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditPeriodOpen(false);
                    setEditingPeriod(null);
                  }}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0a2a4a] font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Perbarui Periode</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BRANDING SEKOLAH */}
      {isBrandingModalOpen && (
        <SchoolBrandingModal
          school={school}
          currentSchool={school}
          onClose={() => setIsBrandingModalOpen(false)}
          onThemeSaved={() => {
            onRefreshData();
          }}
          onSaveTheme={() => {
            onRefreshData();
          }}
        />
      )}
    </div>
  );
};
