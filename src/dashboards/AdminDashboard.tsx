import React, { useState, useMemo } from 'react';
import {
  User,
  UserRole,
  School,
  SchoolClass,
  Period,
  AuditLog,
  Student,
  SociometricNomination,
  PeerBehavioralRating,
  CoieDodgeStatus,
  StudentCalculatedMetrics,
} from '../types';
import { dataStorage } from '../services/dataStorage';
import { calculateSNAMetrics } from '../services/snaEngine';
import {
  ShieldAlert,
  Users,
  Building2,
  Key,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  RefreshCw,
  Lock,
  Globe,
  Database,
  History,
  BarChart3,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Layers,
  Sparkles,
  HelpCircle,
  Filter,
  Flame,
  Table,
  Eye,
  Info,
  Calendar,
  Check,
  X,
  ArrowRight,
  Heart,
  Share2,
  Sliders,
  UserCheck,
  Network,
  Award,
  RotateCcw,
  Wand2,
  Palette,
  CheckSquare,
  Square,
} from 'lucide-react';
import { SchoolBrandingModal } from '../components/SchoolBrandingModal';

interface AdminDashboardProps {
  users: User[];
  schools: School[];
  classes: SchoolClass[];
  periods: Period[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  schools,
  classes,
  periods,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'heatmap' | 'periods' | 'longitudinal' | 'users' | 'oauth' | 'master' | 'audit'
  >('analytics');

  // Unified Filtering State (Mirroring Guru BK Filters + School / Cross-Class Level)
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schools[0]?.id || 'sch-01');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(periods[0]?.id || '2026-s1');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CoieDodgeStatus | 'RISK_ONLY'>('ALL');
  const [criteriaFilter, setCriteriaFilter] = useState<'all' | 'belajar' | 'bermain'>('all');
  const [searchStudent, setSearchStudent] = useState('');

  // Selected Heatmap Cell for Insight Card
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{
    row: string;
    col: string;
    rowId: string;
    colId: string;
    r: number;
    p: string;
    insight: string;
  } | null>({
    row: 'Preferensi Sosial (Z_SP)',
    col: 'Perilaku Prososial',
    rowId: 'zSP',
    colId: 'prosocial',
    r: 0.58,
    p: 'p < 0.01',
    insight: 'Siswa dengan preferensi sosial tinggi (banyak dipilih dan disukai teman) berkorelasi positif kuat dengan tindakan tolong-menolong sukarela di kelas.',
  });

  // Heatmap Class Drill-Down State
  const [drilldownClassId, setDrilldownClassId] = useState<string>(classes[0]?.id || 'cls-8a');
  const [selectedStudentDrilldown, setSelectedStudentDrilldown] = useState<StudentCalculatedMetrics | null>(null);

  // Period Management State
  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newPeriodCode, setNewPeriodCode] = useState('');
  const [newAcademicYear, setNewAcademicYear] = useState('2026/2027');
  const [newSemester, setNewSemester] = useState<1 | 2>(2);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newPeriodStatus, setNewPeriodStatus] = useState<'aktif' | 'ditutup' | 'draft'>('aktif');
  const [newPeriodDescription, setNewPeriodDescription] = useState('');

  // User Management State
  const [searchUser, setSearchUser] = useState('');
  const [userFilterSchool, setUserFilterSchool] = useState<string>('ALL');
  const [userFilterRole, setUserFilterRole] = useState<string>('ALL');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('guru_bk');
  const [newUserSchoolId, setNewUserSchoolId] = useState(schools[0]?.id || 'sch-mtsn2-bangka');
  const [newUserNip, setNewUserNip] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('bk123456');
  const [newUserAssignedClassIds, setNewUserAssignedClassIds] = useState<string[]>([]);

  // Edit User State
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('guru_bk');
  const [editUserSchoolId, setEditUserSchoolId] = useState('');
  const [editUserNip, setEditUserNip] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserStatus, setEditUserStatus] = useState<'active' | 'inactive'>('active');
  const [editUserAssignedClassIds, setEditUserAssignedClassIds] = useState<string[]>([]);

  // Password Management & Approval State
  const [passwordRequests, setPasswordRequests] = useState(() => dataStorage.getPasswordRequests());
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [passwordSuccessToast, setPasswordSuccessToast] = useState<string | null>(null);

  // School Branding Modal State
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [brandingSchool, setBrandingSchool] = useState<School | null>(null);

  // Simulation Modal State
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [simClassId, setSimClassId] = useState(classes[0]?.id || 'c-8a');
  const [simPeriodId, setSimPeriodId] = useState(selectedPeriodId);
  const [simScenario, setSimScenario] = useState<'healthy' | 'polarized' | 'isolated_risk' | 'random'>('healthy');
  const [isSimulating, setIsSimulating] = useState(false);

  // Reset Data Modal State
  const [showResetDataModal, setShowResetDataModal] = useState(false);
  const [resetMode, setResetMode] = useState<'factory' | 'clean'>('factory');
  const [isResetting, setIsResetting] = useState(false);

  // School Management Modal State (Tambah Satuan Pendidikan)
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolNpsn, setNewSchoolNpsn] = useState('');
  const [newSchoolAddress, setNewSchoolAddress] = useState('Jl. Raya Sungailiat - Muntok, Kab. Bangka');
  const [newSchoolCity, setNewSchoolCity] = useState('Kabupaten Bangka');
  const [newSchoolType, setNewSchoolType] = useState('Madrasah');
  const [newSchoolPrincipal, setNewSchoolPrincipal] = useState('');
  const [newSchoolCounselor, setNewSchoolCounselor] = useState('Liengga Brian Darea, S.Sos.,Gr');

  // Master Class Modal State
  const [showAddClassMasterModal, setShowAddClassMasterModal] = useState(false);
  const [newMasterClassName, setNewMasterClassName] = useState('');
  const [newMasterClassGrade, setNewMasterClassGrade] = useState('8');
  const [newMasterClassYear, setNewMasterClassYear] = useState('2026/2027');
  const [newMasterSchoolId, setNewMasterSchoolId] = useState(schools[0]?.id || 'sch-mtsn2-bangka');
  const [newMasterHomeroom, setNewMasterHomeroom] = useState('');
  const [newMasterCounselorId, setNewMasterCounselorId] = useState<string>('');

  // Edit Master Class State
  const [showEditClassMasterModal, setShowEditClassMasterModal] = useState(false);
  const [editingMasterClassId, setEditingMasterClassId] = useState<string | null>(null);
  const [editMasterClassName, setEditMasterClassName] = useState('');
  const [editMasterClassGrade, setEditMasterClassGrade] = useState('8');
  const [editMasterClassYear, setEditMasterClassYear] = useState('2026/2027');
  const [editMasterSchoolId, setEditMasterSchoolId] = useState('');
  const [editMasterHomeroom, setEditMasterHomeroom] = useState('');
  const [editMasterCounselorId, setEditMasterCounselorId] = useState('');

  // OAuth Configuration State
  const [oauthConfig, setOauthConfig] = useState({
    enabled: true,
    provider: 'Google Workspace for Education / Belajar.id',
    clientId: '8492048201-radarsosial-edu.apps.googleusercontent.com',
    allowedDomain: '@madrasah.kemenag.go.id, @belajar.id',
    enforcePKCE: true,
    sessionDurationHours: 12,
  });
  const [oauthSaved, setOauthSaved] = useState(false);

  const auditLogs = dataStorage.getAuditLogs();

  // Load students and data according to Class Filter
  const allStudents = useMemo(() => {
    if (selectedClassId === 'ALL') {
      return dataStorage.getAllStudents();
    }
    return dataStorage.getStudents(selectedClassId);
  }, [selectedClassId]);

  const allNominations = useMemo(() => {
    return dataStorage.getNominations(
      selectedPeriodId,
      selectedClassId === 'ALL' ? undefined : selectedClassId
    );
  }, [selectedPeriodId, selectedClassId]);

  const allBehaviors = useMemo(() => {
    return dataStorage.getBehaviors(
      selectedPeriodId,
      selectedClassId === 'ALL' ? undefined : selectedClassId
    );
  }, [selectedPeriodId, selectedClassId]);

  // Calculate SNA and Behavioral Metrics
  const calculatedMetrics = useMemo(() => {
    return calculateSNAMetrics(allStudents, allNominations, allBehaviors);
  }, [allStudents, allNominations, allBehaviors]);

  // Reciprocal dyads map
  const reciprocalMap = useMemo(() => {
    const map = new Map<string, number>();
    const studentNomMap = new Map<string, Set<string>>();
    allNominations.forEach((nom) => {
      if (nom.type === 'like') {
        if (!studentNomMap.has(nom.fromStudentId)) {
          studentNomMap.set(nom.fromStudentId, new Set());
        }
        studentNomMap.get(nom.fromStudentId)!.add(nom.toStudentId);
      }
    });
    allStudents.forEach((st) => {
      const fromSet = studentNomMap.get(st.id) || new Set();
      let count = 0;
      fromSet.forEach((targetId) => {
        const targetSet = studentNomMap.get(targetId);
        if (targetSet && targetSet.has(st.id)) {
          count++;
        }
      });
      map.set(st.id, count);
    });
    return map;
  }, [allStudents, allNominations]);

  // Filtered metrics based on Admin Search & Filters
  const filteredMetrics = useMemo(() => {
    return calculatedMetrics.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
        m.nis.includes(searchStudent);

      let matchStatus = true;
      if (statusFilter === 'RISK_ONLY') {
        matchStatus = m.riskLevel === 'Tinggi';
      } else if (statusFilter !== 'ALL') {
        matchStatus = m.status === statusFilter;
      }

      return matchSearch && matchStatus;
    });
  }, [calculatedMetrics, searchStudent, statusFilter]);

  // Descriptive Statistics Calculation
  const statsSummary = useMemo(() => {
    if (filteredMetrics.length === 0) return null;

    const calc = (arr: number[]) => {
      const n = arr.length;
      if (n === 0) return { mean: 0, sd: 0, min: 0, max: 0, median: 0 };
      const sum = arr.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const sorted = [...arr].sort((a, b) => a - b);
      const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
      const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n > 1 ? n - 1 : 1);
      const sd = Math.sqrt(variance);
      return {
        mean: Number(mean.toFixed(2)),
        sd: Number(sd.toFixed(2)),
        min: Number((sorted[0] ?? 0).toFixed(2)),
        max: Number((sorted[n - 1] ?? 0).toFixed(2)),
        median: Number(median.toFixed(2)),
      };
    };

    return {
      n: filteredMetrics.length,
      zL: calc(filteredMetrics.map((m) => m.zLikes ?? 0)),
      zD: calc(filteredMetrics.map((m) => m.zDislikes ?? 0)),
      zSP: calc(filteredMetrics.map((m) => m.zSP ?? 0)),
      zSI: calc(filteredMetrics.map((m) => m.zSI ?? 0)),
      prosocial: calc(filteredMetrics.map((m) => m.prosocialScore ?? 0)),
      emotion: calc(filteredMetrics.map((m) => Math.max(0, 100 - (m.aggressiveScore ?? 0)))),
      courage: calc(filteredMetrics.map((m) => Math.max(0, 100 - (m.withdrawnScore ?? 0)))),
      control: calc(filteredMetrics.map((m) => Math.max(0, 100 - (m.hyperactiveScore ?? 0)))),
      victimization: calc(filteredMetrics.map((m) => m.victimizationScore ?? 0)),
    };
  }, [filteredMetrics]);

  // 5x5 Interaction Heatmap Data (Social Radar Dimensions vs Behavioral Radar Dimensions)
  const heatmapData = useMemo(() => {
    const socialDims = [
      { id: 'zLikes', label: 'Penerimaan (Z_Likes)', key: 'zLikes' },
      { id: 'zSP', label: 'Preferensi Sosial (Z_SP)', key: 'zSP' },
      { id: 'zSI', label: 'Dampak Sosial (Z_SI)', key: 'zSI' },
      { id: 'reciprocal', label: 'Resiprositas Pertemanan', key: 'reciprocal' },
      { id: 'likesReceived', label: 'In-Degree (Pilihan Masuk)', key: 'likesReceived' },
    ];

    const behaviorDims = [
      { id: 'prosocial', label: 'Perilaku Prososial', key: 'prosocialScore' },
      { id: 'emotion', label: 'Regulasi Emosi', key: 'emotion' },
      { id: 'courage', label: 'Keberanian Sosial', key: 'courage' },
      { id: 'control', label: 'Kontrol Diri', key: 'control' },
      { id: 'victimization', label: 'Ketahanan Relasi', key: 'victimizationScore' },
    ];

    // Pearson correlation helper
    const calcPearson = (xVals: number[], yVals: number[]) => {
      const n = xVals.length;
      if (n < 3) return 0;
      const xMean = xVals.reduce((a, b) => a + b, 0) / n;
      const yMean = yVals.reduce((a, b) => a + b, 0) / n;
      let num = 0;
      let denX = 0;
      let denY = 0;
      for (let i = 0; i < n; i++) {
        const dx = xVals[i] - xMean;
        const dy = yVals[i] - yMean;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }
      const denom = Math.sqrt(denX * denY);
      if (denom === 0) return 0;
      return Math.max(-1, Math.min(1, num / denom));
    };

    const matrix = socialDims.map((sRow) => {
      const rowVals = filteredMetrics.map((m: any) => {
        if (sRow.id === 'reciprocal') return reciprocalMap.get(m.studentId) || 0;
        return m[sRow.key] ?? 0;
      });

      const cells = behaviorDims.map((bCol) => {
        const colVals = filteredMetrics.map((m: any) => {
          if (bCol.id === 'prosocial') return m.prosocialScore ?? 0;
          if (bCol.id === 'emotion') return Math.max(0, 100 - (m.aggressiveScore ?? 0));
          if (bCol.id === 'courage') return Math.max(0, 100 - (m.withdrawnScore ?? 0));
          if (bCol.id === 'control') return Math.max(0, 100 - (m.hyperactiveScore ?? 0));
          if (bCol.id === 'victimization') return Math.max(0, 100 - (m.victimizationScore ?? 0));
          return m[bCol.key] ?? 0;
        });
        const r = calcPearson(rowVals, colVals);
        const roundedR = Number(r.toFixed(2));

        // P-value approximation
        const p = Math.abs(roundedR) > 0.4 ? 'p < 0.01' : Math.abs(roundedR) > 0.2 ? 'p < 0.05' : 'p > 0.05';

        // Qualitative psychological insight
        let insight = '';
        if (sRow.id === 'zSP' && bCol.id === 'prosocial') {
          insight = 'Siswa dengan preferensi sosial tinggi (banyak dipilih dan disukai) berkorelasi positif kuat dengan inisiatif tolong-menolong sukarela.';
        } else if (sRow.id === 'zSP' && bCol.id === 'victimization') {
          insight = 'Korelasi positif signifikan: Siswa berstatus disukai memiliki tingkat ketahanan relasi sosial yang jauh lebih kokoh.';
        } else if (sRow.id === 'zSI' && bCol.id === 'courage') {
          insight = 'Siswa dengan dampak sosial tinggi (pusat perhatian kelas) cenderung menunjukkan keberanian sosial dan asertivitas lebih aktif.';
        } else if (sRow.id === 'reciprocal' && bCol.id === 'emotion') {
          insight = 'Pertemanan dua arah (saling memilih secara timbal balik) terjalin lebih langgeng pada siswa dengan stabilitas regulasi emosi matang.';
        } else {
          insight = `Interaksi antara dimensi ${sRow.label} dan ${bCol.label} dengan koefisien korelasi Pearson r = ${roundedR > 0 ? '+' : ''}${roundedR}.`;
        }

        return {
          colId: bCol.id,
          colLabel: bCol.label,
          r: roundedR,
          p,
          insight,
        };
      });

      return {
        rowId: sRow.id,
        rowLabel: sRow.label,
        cells,
      };
    });

    return { socialDims, behaviorDims, matrix };
  }, [filteredMetrics, reciprocalMap]);

  // Drilldown Class Students, Nominations & Calculated Metrics
  const drilldownStudents = useMemo(() => {
    return dataStorage.getStudents(drilldownClassId);
  }, [drilldownClassId]);

  const drilldownNominations = useMemo(() => {
    return dataStorage.getNominations(selectedPeriodId, drilldownClassId);
  }, [selectedPeriodId, drilldownClassId]);

  const drilldownBehaviors = useMemo(() => {
    return dataStorage.getBehaviors(selectedPeriodId, drilldownClassId);
  }, [selectedPeriodId, drilldownClassId]);

  const drilldownMetrics = useMemo(() => {
    return calculateSNAMetrics(drilldownStudents, drilldownNominations, drilldownBehaviors);
  }, [drilldownStudents, drilldownNominations, drilldownBehaviors]);

  // Reciprocal map for drilldown class
  const drilldownReciprocalMap = useMemo(() => {
    const map = new Map<string, number>();
    const studentNomMap = new Map<string, Set<string>>();
    drilldownNominations.forEach((nom) => {
      if (nom.type === 'like') {
        if (!studentNomMap.has(nom.fromStudentId)) {
          studentNomMap.set(nom.fromStudentId, new Set());
        }
        studentNomMap.get(nom.fromStudentId)!.add(nom.toStudentId);
      }
    });
    drilldownStudents.forEach((st) => {
      const fromSet = studentNomMap.get(st.id) || new Set();
      let count = 0;
      fromSet.forEach((targetId) => {
        const targetSet = studentNomMap.get(targetId);
        if (targetSet && targetSet.has(st.id)) {
          count++;
        }
      });
      map.set(st.id, count);
    });
    return map;
  }, [drilldownStudents, drilldownNominations]);

  // Specific student dyadic interactions for the drilldown inspector
  const studentDyadicDetails = useMemo(() => {
    if (!selectedStudentDrilldown) return null;
    const stId = selectedStudentDrilldown.studentId;

    const inNoms = drilldownNominations.filter((n) => n.toStudentId === stId);
    const outNoms = drilldownNominations.filter((n) => n.fromStudentId === stId);

    const outTargets = new Set(outNoms.filter((n) => n.type === 'like').map((n) => n.toStudentId));
    const inSources = new Set(inNoms.filter((n) => n.type === 'like').map((n) => n.fromStudentId));
    const mutualIds = new Set([...outTargets].filter((id) => inSources.has(id)));

    const studentMap = new Map(drilldownStudents.map((s) => [s.id, s.name]));

    return {
      inNoms: inNoms.map((n) => ({
        fromName: studentMap.get(n.fromStudentId) || 'Teman Sekelas',
        type: n.type,
        criteria: n.criteria,
        isMutual: n.type === 'like' && mutualIds.has(n.fromStudentId),
      })),
      outNoms: outNoms.map((n) => ({
        toName: studentMap.get(n.toStudentId) || 'Teman Sekelas',
        type: n.type,
        criteria: n.criteria,
        isMutual: n.type === 'like' && mutualIds.has(n.toStudentId),
      })),
      mutualCount: mutualIds.size,
      mutualNames: [...mutualIds].map((id) => studentMap.get(id) || 'Teman Sekelas'),
    };
  }, [selectedStudentDrilldown, drilldownNominations, drilldownStudents]);

  // Longitudinal Multi-Semester Class Aggregate Trends
  const longitudinalData = [
    {
      periodCode: '2025-S1',
      name: 'Sem 1 2025/2026',
      density: 0.28,
      reciprocityRate: 64,
      rejectedCount: 1,
      neglectedCount: 2,
      popularCount: 2,
      climateScore: 78,
    },
    {
      periodCode: '2025-S2',
      name: 'Sem 2 2025/2026',
      density: 0.25,
      reciprocityRate: 58,
      rejectedCount: 2,
      neglectedCount: 3,
      popularCount: 3,
      climateScore: 68,
    },
    {
      periodCode: '2026-S1',
      name: 'Sem 1 2026/2027 (Aktif)',
      density: 0.22,
      reciprocityRate: 52,
      rejectedCount: filteredMetrics.filter((m) => m.status === 'Rejected').length || 1,
      neglectedCount: filteredMetrics.filter((m) => m.status === 'Neglected').length || 1,
      popularCount: filteredMetrics.filter((m) => m.status === 'Popular').length || 2,
      climateScore: 62,
    },
  ];

  // Period Management Handlers
  const handleAddPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodName.trim() || !newPeriodCode.trim()) return;

    const newPeriod: Period = {
      id: `period-${Date.now()}`,
      name: newPeriodName.trim(),
      code: newPeriodCode.trim().toUpperCase(),
      academicYear: newAcademicYear,
      semester: newSemester,
      startDate: newStartDate || new Date().toISOString().slice(0, 10),
      endDate: newEndDate || new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
      status: newPeriodStatus,
      description: newPeriodDescription || `Periode Asesmen Sosiometri & Pemetaan Relasi ${newPeriodName}`,
    };

    dataStorage.addPeriod(newPeriod);
    dataStorage.addAuditLog(
      'Super-Admin Lab',
      'admin',
      'Tambah Periode Asesmen',
      `Menambahkan periode asesmen baru: ${newPeriod.name} (${newPeriod.code})`
    );

    setShowAddPeriodModal(false);
    setNewPeriodName('');
    setNewPeriodCode('');
    setNewPeriodDescription('');
    onRefreshData();
  };

  const handleActivatePeriod = (pId: string, pName: string) => {
    dataStorage.activatePeriod(pId);
    dataStorage.addAuditLog(
      'Super-Admin Lab',
      'admin',
      'Aktivasi Periode Asesmen',
      `Mengaktifkan periode asesmen secara sistemik: ${pName}`
    );
    setSelectedPeriodId(pId);
    onRefreshData();
  };

  const handleTogglePeriodStatus = (p: Period) => {
    const updatedStatus = p.status === 'ditutup' ? 'aktif' : 'ditutup';
    if (updatedStatus === 'aktif') {
      dataStorage.activatePeriod(p.id);
      setSelectedPeriodId(p.id);
    } else {
      dataStorage.updatePeriod({ ...p, status: 'ditutup' });
    }
    dataStorage.addAuditLog(
      'Super-Admin Lab',
      'admin',
      'Ubah Status Periode',
      `Mengubah status periode ${p.name} menjadi ${updatedStatus}`
    );
    onRefreshData();
  };

  const handleDeletePeriod = (pId: string, pName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus periode asesmen "${pName}"? Data asesmen yang terkait akan diarsipkan.`)) {
      dataStorage.deletePeriod(pId);
      dataStorage.addAuditLog(
        'Super-Admin Lab',
        'admin',
        'Hapus Periode Asesmen',
        `Menghapus periode asesmen: ${pName}`
      );
      onRefreshData();
    }
  };

  // EXPORT HANDLERS (CSV & JSON for Academic Research)
  const handleExportCSV = () => {
    if (filteredMetrics.length === 0) return;

    const headers = [
      'ID_Siswa',
      'NIS',
      'Nama_Lengkap',
      'Jenis_Kelamin',
      'Kelas',
      'Periode_Semester',
      'Pilihan_Masuk_Likes',
      'Penolakan_Dislikes',
      'Pilihan_Keluar_Likes',
      'Z_Score_Likes_ZL',
      'Z_Score_Dislikes_ZD',
      'Social_Preference_ZSP',
      'Social_Impact_ZSI',
      'Status_Coie_Dodge',
      'Resiprokal_Mutual',
      'Level_Risiko',
      'Skor_Prososial',
      'Skor_Regulasi_Emosi',
      'Skor_Keberanian_Sosial',
      'Skor_Kontrol_Diri',
      'Skor_Ketahanan_Relasi',
      'Rekomendasi_Konseling',
    ];

    const rows = filteredMetrics.map((m) => [
      `"${m.studentId}"`,
      `"${m.nis}"`,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.gender}"`,
      `"${m.className || selectedClassId}"`,
      `"${selectedPeriodId}"`,
      m.likesReceived ?? 0,
      m.dislikesReceived ?? 0,
      m.likesGiven ?? 0,
      m.zLikes ?? 0,
      m.zDislikes ?? 0,
      m.zSP ?? 0,
      m.zSI ?? 0,
      `"${m.status}"`,
      reciprocalMap.get(m.studentId) || 0,
      `"${m.riskLevel}"`,
      m.prosocialScore ?? 0,
      Math.max(0, 100 - (m.aggressiveScore ?? 0)),
      Math.max(0, 100 - (m.withdrawnScore ?? 0)),
      Math.max(0, 100 - (m.hyperactiveScore ?? 0)),
      Math.max(0, 100 - (m.victimizationScore ?? 0)),
      `"${(m.dssRecommendation || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dataset-Riset-RadarSosial-${selectedPeriodId}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const exportBundle = {
      app: 'Radar Sosial Research Suite',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      school: schools.find((s) => s.id === selectedSchoolId),
      classFilter: selectedClassId,
      periodId: selectedPeriodId,
      statsSummary,
      longitudinalTrends: longitudinalData,
      heatmapCorrelationMatrix: heatmapData.matrix,
      studentsCount: filteredMetrics.length,
      nominationsCount: allNominations.length,
      metrics: filteredMetrics,
      rawNominations: allNominations,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportBundle, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.setAttribute('download', `Dataset-Raw-RadarSosial-${selectedPeriodId}-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportHeatmapCSV = () => {
    const headers = ['Dimensi_Radar_Sosial', ...heatmapData.behaviorDims.map((b) => `"${b.label}"`)];
    const rows = heatmapData.matrix.map((row) => {
      const vals = row.cells.map((c) => c.r);
      return [`"${row.rowLabel}"`, ...vals].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Matriks-Korelasi-Heatmap-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const targetSchool = schools.find((s) => s.id === newUserSchoolId) || schools[0];
    const createdUser = dataStorage.addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      schoolId: newUserSchoolId,
      schoolName: targetSchool?.name,
      nip: newUserNip.trim() || undefined,
      phone: newUserPhone.trim() || undefined,
      status: 'active',
      authProvider: 'local',
      assignedClassIds: newUserRole === 'guru_bk' ? newUserAssignedClassIds : [],
    });

    if (newUserPassword.trim()) {
      dataStorage.setUserPassword(createdUser.id, newUserPassword.trim());
    }

    dataStorage.addAuditLog(
      'Super-Admin Lab',
      'admin',
      'Tambah Pengguna Baru',
      `Menambahkan akun ${newUserName} (${newUserEmail}) sebagai ${newUserRole} di ${targetSchool?.name} beserta pengaturan kata sandi`
    );

    setNewUserName('');
    setNewUserEmail('');
    setNewUserNip('');
    setNewUserPhone('');
    setNewUserPassword('bk123456');
    setNewUserAssignedClassIds([]);
    setShowAddUserModal(false);
    onRefreshData();
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUserId(u.id);
    setEditUserName(u.name);
    setEditUserEmail(u.email);
    setEditUserRole(u.role);
    setEditUserSchoolId(u.schoolId);
    setEditUserNip(u.nip || '');
    setEditUserPhone(u.phone || '');
    setEditUserPassword('');
    setEditUserStatus(u.status || 'active');
    setEditUserAssignedClassIds(u.assignedClassIds || []);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !editUserName.trim() || !editUserEmail.trim()) return;

    const existing = users.find((u) => u.id === editingUserId);
    if (!existing) return;

    const targetSchool = schools.find((s) => s.id === editUserSchoolId) || schools[0];
    const updated: User = {
      ...existing,
      name: editUserName.trim(),
      email: editUserEmail.trim(),
      role: editUserRole,
      schoolId: editUserSchoolId,
      schoolName: targetSchool?.name,
      nip: editUserNip.trim() || undefined,
      phone: editUserPhone.trim() || undefined,
      status: editUserStatus,
      assignedClassIds: editUserRole === 'guru_bk' ? editUserAssignedClassIds : [],
    };

    dataStorage.updateUser(updated);

    if (editUserPassword.trim()) {
      dataStorage.setUserPassword(editingUserId, editUserPassword.trim());
    }

    dataStorage.addAuditLog(
      'Super-Admin Lab',
      'admin',
      'Perbarui Data Pengguna',
      `Memperbarui profil akun ${editUserName} (${editUserRole}) di ${targetSchool?.name}${editUserPassword.trim() ? ' beserta penetapan sandi baru' : ''}`
    );

    setShowEditUserModal(false);
    setEditingUserId(null);
    setEditUserPassword('');
    onRefreshData();
  };

  const handleApprovePasswordRequest = (reqId: string, suggestedPass?: string) => {
    const finalPass = prompt(
      'Konfirmasi atau tetapkan kata sandi baru untuk disetujui oleh Super-Admin:',
      suggestedPass || 'sandiBaru2026!'
    );
    if (!finalPass) return;

    dataStorage.approvePasswordReset(reqId, finalPass.trim());
    setPasswordRequests(dataStorage.getPasswordRequests());
    setPasswordSuccessToast(`Permintaan kata sandi berhasil disetujui! Kata sandi baru aktif: "${finalPass.trim()}"`);
    setTimeout(() => setPasswordSuccessToast(null), 4500);
    onRefreshData();
  };

  const handleRejectPasswordRequest = (reqId: string) => {
    const note = prompt('Masukkan alasan penolakan permintaan kata sandi:', 'Data identitas belum dapat diverifikasi oleh admin');
    if (note === null) return;

    dataStorage.rejectPasswordReset(reqId, note.trim());
    setPasswordRequests(dataStorage.getPasswordRequests());
    setPasswordSuccessToast('Permintaan kata sandi telah ditolak.');
    setTimeout(() => setPasswordSuccessToast(null), 3500);
    onRefreshData();
  };

  const handleDirectSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser || !adminNewPassword.trim()) return;

    dataStorage.setUserPassword(passwordTargetUser.id, adminNewPassword.trim());
    setPasswordSuccessToast(
      `Kata sandi untuk ${passwordTargetUser.name} (${passwordTargetUser.email}) berhasil diperbarui menjadi "${adminNewPassword.trim()}"`
    );
    setShowSetPasswordModal(false);
    setPasswordTargetUser(null);
    setAdminNewPassword('');
    setTimeout(() => setPasswordSuccessToast(null), 4500);
    onRefreshData();
  };

  const handleToggleUserStatus = (u: User) => {
    const nextStatus = u.status === 'active' ? 'inactive' : 'active';
    dataStorage.updateUser({
      ...u,
      status: nextStatus,
    });
    dataStorage.addAuditLog(
      'Super-Admin Lab',
      'admin',
      'Ubah Status Akun',
      `Mengubah status akun ${u.name} menjadi ${nextStatus}`
    );
    onRefreshData();
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akses untuk ${userName}?`)) {
      dataStorage.deleteUser(userId);
      onRefreshData();
    }
  };

  // MASTER CLASS HANDLERS
  const handleAddMasterClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterClassName.trim()) return;

    const counselor = users.find((u) => u.id === newMasterCounselorId);

    dataStorage.addClass({
      schoolId: newMasterSchoolId,
      name: newMasterClassName.trim(),
      grade: newMasterClassGrade,
      academicYear: newMasterClassYear.trim() || '2026/2027',
      homeroomTeacher: newMasterHomeroom.trim() || 'Wali Kelas Terpilih',
      counselorId: newMasterCounselorId || undefined,
      counselorName: counselor?.name || 'Guru BK Terpilih',
      targetStudentCount: 30,
    });

    setNewMasterClassName('');
    setNewMasterHomeroom('');
    setNewMasterCounselorId('');
    setShowAddClassMasterModal(false);
    onRefreshData();
  };

  const handleOpenEditMasterClass = (cls: SchoolClass) => {
    setEditingMasterClassId(cls.id);
    setEditMasterClassName(cls.name);
    setEditMasterClassGrade(cls.grade || '8');
    setEditMasterClassYear(cls.academicYear || '2026/2027');
    setEditMasterSchoolId(cls.schoolId);
    setEditMasterHomeroom(cls.homeroomTeacher || '');
    setEditMasterCounselorId(cls.counselorId || '');
    setShowEditClassMasterModal(true);
  };

  const handleUpdateMasterClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMasterClassId || !editMasterClassName.trim()) return;

    const existing = classes.find((c) => c.id === editingMasterClassId);
    if (!existing) return;

    const counselor = users.find((u) => u.id === editMasterCounselorId);

    dataStorage.updateClass({
      ...existing,
      name: editMasterClassName.trim(),
      grade: editMasterClassGrade,
      academicYear: editMasterClassYear.trim() || '2026/2027',
      schoolId: editMasterSchoolId,
      homeroomTeacher: editMasterHomeroom.trim() || existing.homeroomTeacher,
      counselorId: editMasterCounselorId || undefined,
      counselorName: counselor?.name || existing.counselorName,
    });

    setShowEditClassMasterModal(false);
    setEditingMasterClassId(null);
    onRefreshData();
  };

  const handleDeleteMasterClass = (clsId: string, clsName: string) => {
    if (confirm(`Hapus rombel "${clsName}" dari basis data?`)) {
      dataStorage.deleteClass(clsId);
      onRefreshData();
    }
  };

  // SIMULATION GENERATOR HANDLER
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      dataStorage.simulateClassData(simClassId, simPeriodId, simScenario);
      const targetCls = classes.find((c) => c.id === simClassId);
      dataStorage.addAuditLog(
        'Super-Admin Lab',
        'admin',
        'Simulasi Sosiometri Dijalankan',
        `Menjalankan engine simulasi sosiometri skenario "${simScenario}" pada rombel ${targetCls?.name || simClassId}`
      );
      setIsSimulating(false);
      setShowSimulationModal(false);
      onRefreshData();
    }, 350);
  };

  // RESET DATA HANDLER
  const handleResetData = () => {
    setIsResetting(true);
    setTimeout(() => {
      dataStorage.resetToDefault(resetMode);
      dataStorage.addAuditLog(
        'Super-Admin Lab',
        'admin',
        'Reset Basis Data Sistem',
        `Mereset basis data sistem dengan mode: ${resetMode === 'factory' ? 'Standar Pabrik (MTsN 2 Bangka)' : 'Asesmen Bersih (Clean Slate)'}`
      );
      setIsResetting(false);
      setShowResetDataModal(false);
      onRefreshData();
    }, 400);
  };

  // SCHOOL (TENANT) HANDLERS
  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim() || !newSchoolNpsn.trim()) return;

    dataStorage.addSchool({
      name: newSchoolName.trim(),
      npsn: newSchoolNpsn.trim(),
      address: newSchoolAddress.trim() || 'Kabupaten Bangka',
      city: newSchoolCity.trim() || 'Kabupaten Bangka',
      type: newSchoolType as any,
      principalName: newSchoolPrincipal.trim() || 'Kepala Satuan Pendidikan',
      counselorName: newSchoolCounselor.trim() || 'Guru BK Konselor',
      status: 'aktif',
    });

    setNewSchoolName('');
    setNewSchoolNpsn('');
    setShowAddSchoolModal(false);
    onRefreshData();
  };

  const handleDeleteSchool = (schId: string, schName: string) => {
    if (confirm(`Hapus data satuan pendidikan "${schName}"? Rombel yang terdaftar di sekolah ini juga akan terdampak.`)) {
      dataStorage.deleteSchool(schId);
      onRefreshData();
    }
  };

  const handleSaveOAuth = () => {
    setOauthSaved(true);
    dataStorage.addAuditLog(
      'Super-Admin Lab',
      'admin',
      'Perbarui Konfigurasi OAuth',
      `Mengubah domain diizinkan: ${oauthConfig.allowedDomain}, Enforce PKCE: ${oauthConfig.enforcePKCE}`
    );
    setTimeout(() => setOauthSaved(false), 3000);
  };

  return (
    <div className="space-y-6 text-[#e8edf5]">
      {/* Top Banner / Dashboard Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0a2a4a] via-[#0d3555] to-[#1a3f64] border border-[#1a3f64] shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#f0c040] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Portal Super-Admin &amp; Hub Riset Psikososial Lab</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
            Pusat Analitik Riset &amp; Tata Kelola Sistem Radar Sosial
          </h2>
          <p className="text-xs text-[#b0c4de] max-w-2xl leading-relaxed">
            Analisis data longitudinal multi-semester, uji korelasi statistik, matriks heatmap interaksi radar sosial-perilaku, dan ekspor instrumen riset (CSV/JSON).
          </p>
        </div>

        {/* Global Dataset Export & Simulation / Reset Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="btn-admin-simulation"
            onClick={() => setShowSimulationModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition duration-150 cursor-pointer"
            title="Jalankan simulasi pembentukan pola sosiometri dan perilaku"
          >
            <Wand2 className="w-4 h-4 text-purple-200" />
            <span>Simulasi Data</span>
          </button>

          <button
            id="btn-admin-reset"
            onClick={() => setShowResetDataModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 hover:text-white font-bold text-xs border border-rose-500/40 shadow-lg transition duration-150 cursor-pointer"
            title="Reset data ke standar pabrik atau bersihkan data asesmen"
          >
            <RotateCcw className="w-4 h-4 text-rose-300" />
            <span>Reset Data</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition duration-150 cursor-pointer"
            title="Unduh seluruh dataset dalam format CSV untuk SPSS / R"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV Riset</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-extrabold text-xs shadow-lg transition duration-150 cursor-pointer"
            title="Unduh format JSON raw graph & SNA bundle"
          >
            <Download className="w-4 h-4" />
            <span>JSON Bundle</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR (Mirroring Guru BK Filters for Complete Parity) */}
      <div className="p-4 rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 text-[#b0c4de]">
            <Filter className="w-3.5 h-3.5 text-[#f0c040]" />
            <span className="font-semibold text-white">Rombel / Kelas:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-[#0a2a4a] border border-[#1a3f64] rounded-lg px-2.5 py-1 text-white font-medium focus:outline-hidden focus:border-[#f0c040]"
            >
              <option value="ALL">🌟 Semua Rombel (Agregat Sekolah)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Period Semester Filter */}
          <div className="flex items-center gap-1.5 text-[#b0c4de]">
            <span>Periode:</span>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="bg-[#0a2a4a] border border-[#1a3f64] rounded-lg px-2.5 py-1 text-white font-medium focus:outline-hidden focus:border-[#f0c040]"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.status === 'aktif' ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Coie-Dodge Filter */}
          <div className="flex items-center gap-1.5 text-[#b0c4de]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#0a2a4a] border border-[#1a3f64] rounded-lg px-2.5 py-1 text-white font-medium focus:outline-hidden focus:border-[#f0c040]"
            >
              <option value="ALL">Semua Status</option>
              <option value="RISK_ONLY">⚠️ Siswa Berisiko Saja</option>
              <option value="Popular">Popular</option>
              <option value="Rejected">Rejected</option>
              <option value="Neglected">Neglected</option>
              <option value="Controversial">Controversial</option>
              <option value="Average">Average</option>
            </select>
          </div>
        </div>

        {/* Quick Search Student in Research View */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#b0c4de] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama / NIS siswa..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="bg-[#0a2a4a] border border-[#1a3f64] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#b0c4de]/50 focus:outline-hidden focus:border-[#f0c040] w-52"
          />
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1a3f64] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-[#f0c040] text-[#0a2a4a] font-bold shadow-lg'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analisis Statistik &amp; Distribusi Z</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'heatmap'
              ? 'bg-[#f0c040] text-[#0a2a4a] font-bold shadow-lg'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Matriks Heatmap Interaksi (Sosial × Perilaku)</span>
        </button>

        <button
          onClick={() => setActiveTab('periods')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'periods'
              ? 'bg-[#f0c040] text-[#0a2a4a] font-bold shadow-lg'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Periode Asesmen ({periods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('longitudinal')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'longitudinal'
              ? 'bg-[#f0c040] text-[#0a2a4a] font-bold shadow-lg'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tren Longitudinal Antar-Semester</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-[#f0c040] text-[#0a2a4a] font-bold shadow-lg'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Pengguna ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('oauth')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'oauth'
              ? 'bg-[#f0c040] text-[#0a2a4a] font-bold shadow-lg'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>OAuth &amp; Belajar.id</span>
        </button>

        <button
          onClick={() => setActiveTab('master')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'master'
              ? 'bg-[#f0c040] text-[#0a2a4a] font-bold shadow-lg'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data Master</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-[#f0c040] text-[#0a2a4a] font-bold shadow-lg'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* ===================== TAB 1: ANALISIS STATISTIK & DISTRIBUSI Z ===================== */}
      {activeTab === 'analytics' && statsSummary && (
        <div className="space-y-6">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#0d3555]/70 border border-[#1a3f64]">
              <div className="text-[11px] text-[#b0c4de] font-semibold uppercase">Sampel Populasi (N)</div>
              <div className="text-2xl font-serif font-bold text-white mt-1">{statsSummary.n} Siswa</div>
              <div className="text-[10px] text-[#f7d970] mt-0.5">Tervalidasi Matriks SNA</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d3555]/70 border border-[#1a3f64]">
              <div className="text-[11px] text-[#b0c4de] font-semibold uppercase">Rata-rata Preferensi (Z_SP)</div>
              <div className="text-2xl font-serif font-bold text-cyan-300 mt-1">
                {statsSummary.zSP.mean > 0 ? `+${statsSummary.zSP.mean}` : statsSummary.zSP.mean}
              </div>
              <div className="text-[10px] text-[#b0c4de] mt-0.5">SD = {statsSummary.zSP.sd}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d3555]/70 border border-[#1a3f64]">
              <div className="text-[11px] text-[#b0c4de] font-semibold uppercase">Skor Rata-rata Prososial</div>
              <div className="text-2xl font-serif font-bold text-emerald-400 mt-1">
                {statsSummary.prosocial.mean} / 100
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-0.5">SD = {statsSummary.prosocial.sd}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d3555]/70 border border-[#1a3f64]">
              <div className="text-[11px] text-[#b0c4de] font-semibold uppercase">Risiko Viktimisasi Kelas</div>
              <div className="text-2xl font-serif font-bold text-rose-400 mt-1">
                {statsSummary.victimization.mean} / 100
              </div>
              <div className="text-[10px] text-rose-300/80 mt-0.5">Ambang Bahaya &gt; 25.0</div>
            </div>
          </div>

          {/* Descriptive Statistics Table */}
          <div className="p-5 rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-[#f0c040]" />
                  <span>Tabel Statistik Deskriptif Variabel Sosiometrik &amp; Perilaku Sebaya</span>
                </h3>
                <p className="text-xs text-[#b0c4de]">
                  Parameter estimasi nilai tengah, sebaran varians, dan rentang skor (N = {statsSummary.n})
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#f7d970] bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
                Confidence Interval: 95%
              </span>
            </div>

            <div className="overflow-x-auto border border-[#1a3f64] rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0a2a4a] text-[#f0c040] border-b border-[#1a3f64]">
                    <th className="p-3">Variabel Pengukuran</th>
                    <th className="p-3 text-center">Mean (Rata-rata)</th>
                    <th className="p-3 text-center">Median</th>
                    <th className="p-3 text-center">Standar Deviasi (SD)</th>
                    <th className="p-3 text-center">Min</th>
                    <th className="p-3 text-center">Max</th>
                    <th className="p-3">Interpretasi Metodologis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">Z_L (Skor Baku Penerimaan)</td>
                    <td className="p-3 text-center font-mono text-cyan-300">{statsSummary.zL.mean}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zL.median}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zL.sd}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zL.min}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zL.max}</td>
                    <td className="p-3 text-[#b0c4de]">Frekuensi disukai teman setelah dinormalisasi Z</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">Z_D (Skor Baku Penolakan)</td>
                    <td className="p-3 text-center font-mono text-rose-300">{statsSummary.zD.mean}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zD.median}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zD.sd}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zD.min}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zD.max}</td>
                    <td className="p-3 text-[#b0c4de]">Frekuensi penolakan teman sebaya (indeks risiko)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">Z_SP (Social Preference)</td>
                    <td className="p-3 text-center font-mono text-[#f7d970] font-bold">{statsSummary.zSP.mean}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zSP.median}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zSP.sd}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zSP.min}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zSP.max}</td>
                    <td className="p-3 text-[#b0c4de]">Selisih Z_L - Z_D (Penentu status Popular vs Rejected)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">Z_SI (Social Impact)</td>
                    <td className="p-3 text-center font-mono text-amber-300">{statsSummary.zSI.mean}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zSI.median}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zSI.sd}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zSI.min}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.zSI.max}</td>
                    <td className="p-3 text-[#b0c4de]">Jumlah visibilitas sosial (Z_L + Z_D)</td>
                  </tr>
                  <tr className="hover:bg-white/5 bg-emerald-950/20">
                    <td className="p-3 font-semibold text-emerald-300">Perilaku Prososial</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-300">{statsSummary.prosocial.mean}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.prosocial.median}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.prosocial.sd}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.prosocial.min}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.prosocial.max}</td>
                    <td className="p-3 text-[#b0c4de]">Tolong-menolong &amp; kedermawanan sosial (0-100)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-sky-300">Regulasi Emosi</td>
                    <td className="p-3 text-center font-mono text-sky-300">{statsSummary.emotion.mean}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.emotion.median}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.emotion.sd}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.emotion.min}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.emotion.max}</td>
                    <td className="p-3 text-[#b0c4de]">Kematangan mengendalikan amarah &amp; ketenangan</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-purple-300">Keberanian Sosial</td>
                    <td className="p-3 text-center font-mono text-purple-300">{statsSummary.courage.mean}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.courage.median}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.courage.sd}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.courage.min}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.courage.max}</td>
                    <td className="p-3 text-[#b0c4de]">Keberanian membela teman yang dizalimi</td>
                  </tr>
                  <tr className="hover:bg-white/5 bg-rose-950/20">
                    <td className="p-3 font-semibold text-rose-400">Risiko Viktimisasi</td>
                    <td className="p-3 text-center font-mono font-bold text-rose-400">{statsSummary.victimization.mean}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.victimization.median}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.victimization.sd}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.victimization.min}</td>
                    <td className="p-3 text-center font-mono">{statsSummary.victimization.max}</td>
                    <td className="p-3 text-[#b0c4de]">Indeks kerentanan terhadap tekanan relasional sebaya</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: MATRIKS HEATMAP INTERAKSI ===================== */}
      {activeTab === 'heatmap' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#f0c040]" />
                  <span>Matriks Heatmap Interaksi: Radar Sosial × Radar Perilaku</span>
                </h3>
                <p className="text-xs text-[#b0c4de]">
                  Korelasi Pearson interaktif antara dimensi sosiometrik (Moreno) dengan evaluasi perilaku teman sebaya. Klik sel untuk melihat penjelasan psikologis.
                </p>
              </div>

              <button
                onClick={handleExportHeatmapCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a3f64] hover:bg-[#1a4a6e] text-white text-xs font-semibold border border-white/10 transition"
              >
                <Download className="w-3.5 h-3.5 text-[#f0c040]" />
                <span>Unduh Matriks (CSV)</span>
              </button>
            </div>

            {/* Heatmap Grid Container */}
            <div className="overflow-x-auto border border-[#1a3f64] rounded-xl p-3 bg-[#0a2a4a]">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left font-serif text-white bg-[#0d3555] rounded-tl-lg border border-[#1a3f64]">
                      Dimensi Radar Sosial &darr; / Radar Perilaku &rarr;
                    </th>
                    {heatmapData.behaviorDims.map((b) => (
                      <th
                        key={b.id}
                        className="p-3 font-semibold text-[#f7d970] bg-[#0d3555] border border-[#1a3f64] min-w-[120px]"
                      >
                        {b.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.matrix.map((row) => (
                    <tr key={row.rowId}>
                      <td className="p-3 text-left font-semibold text-white bg-[#0d3555] border border-[#1a3f64]">
                        {row.rowLabel}
                      </td>
                      {row.cells.map((cell) => {
                        // Determine heatmap color based on correlation r
                        let cellBg = 'bg-[#0a2a4a] text-slate-300';
                        if (cell.r >= 0.5) cellBg = 'bg-[#f0c040] text-[#0a2a4a] font-extrabold shadow-sm';
                        else if (cell.r >= 0.25) cellBg = 'bg-amber-500/50 text-[#f7d970] font-bold';
                        else if (cell.r >= 0.1) cellBg = 'bg-cyan-900/40 text-cyan-200';
                        else if (cell.r <= -0.4) cellBg = 'bg-rose-600 text-white font-extrabold';
                        else if (cell.r <= -0.15) cellBg = 'bg-rose-900/50 text-rose-200';

                        const isSelected =
                          selectedHeatmapCell?.row === row.rowLabel &&
                          selectedHeatmapCell?.col === cell.colLabel;

                        return (
                          <td
                            key={cell.colId}
                            onClick={() =>
                              setSelectedHeatmapCell({
                                row: row.rowLabel,
                                col: cell.colLabel,
                                r: cell.r,
                                p: cell.p,
                                insight: cell.insight,
                              })
                            }
                            className={`p-3 border border-[#1a3f64] cursor-pointer transition transform hover:scale-105 ${cellBg} ${
                              isSelected ? 'ring-2 ring-white z-10' : ''
                            }`}
                          >
                            <div className="font-mono text-sm">{cell.r > 0 ? `+${cell.r}` : cell.r}</div>
                            <div className="text-[10px] opacity-80 mt-0.5">{cell.p}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Heatmap Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#b0c4de] pt-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">Gradien Korelasi (r):</span>
                <span className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-rose-600 inline-block" /> Negatif Kuat (&le; -0.40)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-[#0a2a4a] border border-white/20 inline-block" /> Netral (0.00)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-amber-500/50 inline-block" /> Positif Sedang (+0.25)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-[#f0c040] inline-block" /> Positif Kuat (&ge; +0.50)
                </span>
              </div>
              <div>*Metode Pearson Correlation Two-Tailed Test</div>
            </div>

            {/* Selected Cell Deep-Dive Insight Card */}
            {selectedHeatmapCell && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#0a2a4a] to-[#1a3f64] border-2 border-[#f0c040] shadow-xl text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#f7d970] font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-[#f0c040]" />
                    <span>Analisis Interaksi: {selectedHeatmapCell.row} &times; {selectedHeatmapCell.col}</span>
                  </div>
                  <div className="font-mono text-xs bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-white">
                    Koefisien r = {selectedHeatmapCell.r > 0 ? `+${selectedHeatmapCell.r}` : selectedHeatmapCell.r} ({selectedHeatmapCell.p})
                  </div>
                </div>
                <p className="text-white text-xs leading-relaxed">
                  {selectedHeatmapCell.insight}
                </p>
                <div className="text-[11px] text-[#b0c4de] italic">
                  Implikasi Riset: Hubungan antar-variabel ini membuktikan secara empiris bahwa intervensi perbaikan perilaku sosial berkorelasi langsung dengan peningkatan status penerimaan sosiometri di kelas.
                </div>
              </div>
            )}
          </div>

          {/* DRILL-DOWN INTERAKSI TINGKAT KELAS / ROMBEL */}
          <div className="p-5 rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1a3f64] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#f0c040] uppercase tracking-wider">
                  <Sliders className="w-4 h-4" />
                  <span>Drill-Down Interaksi Tingkat Rombel</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-white mt-1">
                  Pemetaan Node Siswa Berdasarkan Dimensi Terpilih
                </h3>
                <p className="text-xs text-[#b0c4de]">
                  Visualisasi sebaran siswa di rombel terpilih terhadap sumbu horizontal ({selectedHeatmapCell?.row || 'Preferensi Sosial'}) dan sumbu vertikal ({selectedHeatmapCell?.col || 'Perilaku Prososial'}). Klik sembarang node siswa untuk membuka rincian ikatan dyadik dan nominasi timbal balik.
                </p>
              </div>

              {/* Class Selector for Drill-Down */}
              <div className="flex items-center gap-2 bg-[#0a2a4a] p-2 rounded-xl border border-[#1a3f64] shrink-0">
                <span className="text-xs font-semibold text-[#f7d970]">Pilih Rombel:</span>
                <select
                  value={drilldownClassId}
                  onChange={(e) => {
                    setDrilldownClassId(e.target.value);
                    setSelectedStudentDrilldown(null);
                  }}
                  className="bg-[#0d3555] text-white text-xs font-bold border border-[#1a3f64] rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-[#f0c040]"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.academicYear})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Class Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0a2a4a] border border-[#1a3f64]">
                <span className="text-[#b0c4de] text-[11px] block">Populasi Rombel</span>
                <span className="text-base font-bold text-white mt-0.5 block">{drilldownStudents.length} Siswa</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0a2a4a] border border-[#1a3f64]">
                <span className="text-[#b0c4de] text-[11px] block">Rata-rata Pilihan Masuk</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                  {drilldownMetrics.length > 0
                    ? (drilldownMetrics.reduce((acc, m) => acc + (m.likesReceived ?? 0), 0) / drilldownMetrics.length).toFixed(1)
                    : 0} / siswa
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0a2a4a] border border-[#1a3f64]">
                <span className="text-[#b0c4de] text-[11px] block">Ikatan Timbal Balik (Resiprokal)</span>
                <span className="text-base font-bold text-[#f7d970] mt-0.5 block">
                  {drilldownNominations.filter((n) => n.type === 'like').length > 0
                    ? `${Math.round(([...drilldownReciprocalMap.values()].reduce((a, b) => a + b, 0) / (drilldownNominations.filter((n) => n.type === 'like').length || 1)) * 50)}%`
                    : '0%'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0a2a4a] border border-[#1a3f64]">
                <span className="text-[#b0c4de] text-[11px] block">Fokus Pendampingan</span>
                <span className="text-base font-bold text-rose-400 mt-0.5 block">
                  {drilldownMetrics.filter((m) => m.status === 'Rejected' || m.status === 'Neglected').length} Siswa
                </span>
              </div>
            </div>

            {/* 2D Interactive Scatter / Distribution Space */}
            <div className="border border-[#1a3f64] rounded-2xl bg-[#0a2a4a] p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-[#b0c4de] mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Kuadran Interaksi:</span>
                  <span className="text-[11px] text-[#f7d970]">
                    Sumbu X: {selectedHeatmapCell?.row || 'Preferensi Sosial (Z_SP)'} &bull; Sumbu Y: {selectedHeatmapCell?.col || 'Perilaku Prososial'}
                  </span>
                </div>
                <div className="text-[11px] text-[#b0c4de]">
                  *Klik node siswa untuk membuka audit hubungan timbal balik
                </div>
              </div>

              {/* Scatter Coordinate Box */}
              <div className="relative w-full h-80 bg-gradient-to-b from-[#0d3555]/50 to-[#071e36] rounded-xl border border-white/10 p-4">
                {/* Quadrant dividing crosshairs */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px border-l border-dashed border-white/20 pointer-events-none" />
                <div className="absolute left-0 right-0 top-1/2 h-px border-t border-dashed border-white/20 pointer-events-none" />

                {/* Quadrant Labels */}
                <div className="absolute top-2 left-3 text-[10px] text-amber-300/60 font-semibold pointer-events-none uppercase">
                  Kuadran II: Perilaku Menonjol &bull; Penerimaan Moderat
                </div>
                <div className="absolute top-2 right-3 text-[10px] text-emerald-400/80 font-bold pointer-events-none uppercase">
                  Kuadran I: Integrasi Tinggi (Prososial &amp; Disukai)
                </div>
                <div className="absolute bottom-2 left-3 text-[10px] text-rose-400/80 font-semibold pointer-events-none uppercase">
                  Kuadran III: Prioritas Bimbingan Relasi
                </div>
                <div className="absolute bottom-2 right-3 text-[10px] text-cyan-300/60 font-semibold pointer-events-none uppercase">
                  Kuadran IV: Penerimaan Tinggi &bull; Asertivitas Santai
                </div>

                {/* Student Nodes Plotted on Scatter */}
                {drilldownMetrics.map((student) => {
                  // Compute X coordinate (-2.5 to +2.5 for Z_SP mapped to 8% to 92%)
                  const zSP = student.zSP ?? 0;
                  const xPercent = Math.max(8, Math.min(92, 50 + (zSP / 2.5) * 40));

                  // Compute Y coordinate (0 to 100 behavior score mapped to 90% to 10%)
                  let rawY = student.prosocialScore ?? 50;
                  if (selectedHeatmapCell?.colId === 'emotion') rawY = Math.max(0, 100 - (student.aggressiveScore ?? 0));
                  if (selectedHeatmapCell?.colId === 'courage') rawY = Math.max(0, 100 - (student.withdrawnScore ?? 0));
                  if (selectedHeatmapCell?.colId === 'control') rawY = Math.max(0, 100 - (student.hyperactiveScore ?? 0));
                  if (selectedHeatmapCell?.colId === 'victimization') rawY = Math.max(0, 100 - (student.victimizationScore ?? 0));

                  const yPercent = Math.max(10, Math.min(90, 100 - (rawY / 100) * 80 - 10));

                  // Node styling based on Coie-Dodge status
                  let statusColor = 'bg-cyan-500 border-cyan-300 text-white';
                  if (student.status === 'Popular') statusColor = 'bg-[#f0c040] border-amber-200 text-[#0a2a4a] font-bold shadow-lg';
                  else if (student.status === 'Rejected') statusColor = 'bg-rose-600 border-rose-300 text-white font-bold shadow-lg ring-2 ring-rose-500/50';
                  else if (student.status === 'Neglected') statusColor = 'bg-slate-600 border-slate-400 text-slate-200';
                  else if (student.status === 'Controversial') statusColor = 'bg-purple-600 border-purple-300 text-white font-bold';

                  const isSelected = selectedStudentDrilldown?.studentId === student.studentId;

                  return (
                    <button
                      key={student.studentId}
                      onClick={() => setSelectedStudentDrilldown(student)}
                      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-pointer group z-20 ${
                        isSelected ? 'scale-125 ring-4 ring-white z-30' : 'hover:scale-115'
                      }`}
                      title={`${student.name} (${student.status}) | Z_SP: ${zSP.toFixed(2)} | Skor: ${rawY}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-md transition ${statusColor}`}
                      >
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[#071e36] text-white text-[10px] px-2 py-1 rounded-md border border-white/20 whitespace-nowrap shadow-xl pointer-events-none z-40">
                        <div className="font-bold text-[#f7d970]">{student.name}</div>
                        <div className="text-[9px] text-[#b0c4de]">Status: {student.status} &bull; Z_SP: {zSP.toFixed(2)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#b0c4de] mt-3 pt-2 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-white">Status Klasifikasi Coie-Dodge:</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#f0c040] inline-block" /> Popular
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" /> Average
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" /> Controversial
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-600 inline-block" /> Neglected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" /> Rejected
                  </span>
                </div>
                <span className="text-[10px] text-[#f7d970]">Klik node di atas untuk bedah profil dyadik</span>
              </div>
            </div>

            {/* STUDENT DYADIC TIES & RELATIONAL PROFILE INSPECTOR (Modal/Card) */}
            {selectedStudentDrilldown && studentDyadicDetails && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0a2a4a] via-[#0d3555] to-[#12395d] border-2 border-[#f0c040] shadow-2xl text-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#f0c040] text-[#0a2a4a] flex items-center justify-center font-bold font-serif text-lg shadow-lg">
                      {selectedStudentDrilldown.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{selectedStudentDrilldown.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#1a3f64] text-[#f7d970] border border-white/10">
                          NIS: {selectedStudentDrilldown.nis}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          selectedStudentDrilldown.status === 'Popular'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : selectedStudentDrilldown.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : selectedStudentDrilldown.status === 'Neglected'
                            ? 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}>
                          {selectedStudentDrilldown.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#b0c4de] mt-0.5">
                        Jenis Kelamin: {selectedStudentDrilldown.gender === 'L' ? 'Laki-Laki' : 'Perempuan'} &bull; Rombel: {selectedStudentDrilldown.className || drilldownClassId}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedStudentDrilldown(null)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    Tutup Rincian
                  </button>
                </div>

                {/* Sosiometric Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                    <span className="text-[10px] text-[#b0c4de] block">Pilihan Masuk (In-Degree)</span>
                    <span className="text-sm font-bold text-emerald-400">{selectedStudentDrilldown.likesReceived ?? 0} Teman</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                    <span className="text-[10px] text-[#b0c4de] block">Pilihan Keluar (Out-Degree)</span>
                    <span className="text-sm font-bold text-sky-400">{selectedStudentDrilldown.likesGiven ?? 0} Teman</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                    <span className="text-[10px] text-[#b0c4de] block">Resiprositas (Mutual Ties)</span>
                    <span className="text-sm font-bold text-[#f7d970]">{studentDyadicDetails.mutualCount} Sahabat</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                    <span className="text-[10px] text-[#b0c4de] block">Preferensi Sosial (Z_SP)</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {(selectedStudentDrilldown.zSP ?? 0) > 0 ? `+${(selectedStudentDrilldown.zSP ?? 0).toFixed(2)}` : (selectedStudentDrilldown.zSP ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                    <span className="text-[10px] text-[#b0c4de] block">Dampak Sosial (Z_SI)</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {(selectedStudentDrilldown.zSI ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Dyadic Interaction Lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* In-Degree Ties (Who nominated this student) */}
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Pilihan Masuk ({studentDyadicDetails.inNoms.length})</span>
                      </span>
                      <span className="text-[10px] text-[#b0c4de]">Siapa yang memilih siswa ini</span>
                    </div>
                    {studentDyadicDetails.inNoms.length === 0 ? (
                      <div className="text-[11px] text-[#b0c4de] italic py-2">Belum ada nominasi pilihan masuk yang tercatat.</div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {studentDyadicDetails.inNoms.map((nom, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-[11px]">
                            <span className="font-medium text-white">{nom.fromName}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                nom.criteria === 'belajar' ? 'bg-sky-500/20 text-sky-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {nom.criteria === 'belajar' ? 'Kriteria Belajar' : 'Kriteria Bermain'}
                              </span>
                              {nom.isMutual && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Timbal Balik
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Out-Degree Ties (Who this student nominated) */}
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sky-300 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Pilihan Keluar ({studentDyadicDetails.outNoms.length})</span>
                      </span>
                      <span className="text-[10px] text-[#b0c4de]">Siapa yang dipilih siswa ini</span>
                    </div>
                    {studentDyadicDetails.outNoms.length === 0 ? (
                      <div className="text-[11px] text-[#b0c4de] italic py-2">Belum ada nominasi pilihan keluar yang tercatat.</div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {studentDyadicDetails.outNoms.map((nom, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-[11px]">
                            <span className="font-medium text-white">{nom.toName}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                nom.criteria === 'belajar' ? 'bg-sky-500/20 text-sky-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {nom.criteria === 'belajar' ? 'Kriteria Belajar' : 'Kriteria Bermain'}
                              </span>
                              {nom.isMutual && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Timbal Balik
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mutual Friends Chips */}
                {studentDyadicDetails.mutualNames.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-wrap items-center gap-2">
                    <span className="text-emerald-300 font-bold text-[11px] flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sahabat Timbal Balik (Mutual Friends):</span>
                    </span>
                    {studentDyadicDetails.mutualNames.map((name, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-semibold text-[11px]">
                        {name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="font-semibold text-[#f7d970] text-xs">Rekomendasi Penguatan Iklim Relasi:</span>
                  <p className="text-white text-xs leading-relaxed">
                    {selectedStudentDrilldown.dssRecommendation || 'Pertahankan ikatan pertemanan sehat dan fasilitasi keterlibatan dalam kelompok kolaboratif untuk memperluas jejaring sosial siswa di kelas.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB: MANAJEMEN PERIODE ASESMEN ===================== */}
      {activeTab === 'periods' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1a3f64] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#f0c040] uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Siklus Asesmen Longitudinal</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-white mt-1">
                  Manajemen Periode Asesmen &amp; Pemetaan Sosial
                </h3>
                <p className="text-xs text-[#b0c4de]">
                  Kelola jadwal asesmen sosiometri semesteran, tetapkan periode aktif sistem, atau arsipkan siklus asesmen sebelumnya.
                </p>
              </div>

              <button
                onClick={() => setShowAddPeriodModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold text-xs shadow-lg transition duration-150 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Buka Periode Asesmen Baru</span>
              </button>
            </div>

            {/* Periods Table */}
            <div className="overflow-x-auto border border-[#1a3f64] rounded-xl bg-[#0a2a4a]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0d3555] text-white font-serif border-b border-[#1a3f64]">
                  <tr>
                    <th className="p-3.5">Nama Periode</th>
                    <th className="p-3.5">Kode</th>
                    <th className="p-3.5">Tahun Ajaran</th>
                    <th className="p-3.5">Semester</th>
                    <th className="p-3.5">Rentang Tanggal</th>
                    <th className="p-3.5">Status Sistem</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a3f64]">
                  {periods.map((period) => {
                    const isActive = period.status === 'aktif';

                    return (
                      <tr key={period.id} className="hover:bg-white/5 transition">
                        <td className="p-3.5 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{period.name}</span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold animate-pulse">
                                Berjalan (Aktif)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#b0c4de] mt-0.5">{period.description}</div>
                        </td>
                        <td className="p-3.5 font-mono text-[#f7d970]">{period.code}</td>
                        <td className="p-3.5 text-[#b0c4de]">{period.academicYear}</td>
                        <td className="p-3.5 text-[#b0c4de]">Semester {period.semester}</td>
                        <td className="p-3.5 text-[#b0c4de] font-mono text-[11px]">
                          {period.startDate} s/d {period.endDate}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              period.status === 'aktif'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : period.status === 'ditutup'
                                ? 'bg-slate-700/50 text-slate-300 border border-slate-600'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {period.status === 'aktif' ? 'Aktif' : period.status === 'ditutup' ? 'Ditutup' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isActive && (
                              <button
                                onClick={() => handleActivatePeriod(period.id, period.name)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition shadow cursor-pointer"
                                title="Jadikan sebagai periode aktif sistem"
                              >
                                Aktifkan
                              </button>
                            )}
                            <button
                              onClick={() => handleTogglePeriodStatus(period)}
                              className="px-3 py-1.5 rounded-lg bg-[#1a3f64] hover:bg-[#1a4a6e] text-[#b0c4de] hover:text-white font-semibold text-[11px] transition border border-white/10 cursor-pointer"
                            >
                              {period.status === 'ditutup' ? 'Buka Kembali' : 'Tutup Asesmen'}
                            </button>
                            <button
                              onClick={() => handleDeletePeriod(period.id, period.name)}
                              className="p-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-800 text-rose-300 hover:text-white transition border border-rose-700/50 cursor-pointer"
                              title="Hapus periode"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: TREN LONGITUDINAL MULTI-SEMESTER ===================== */}
      {activeTab === 'longitudinal' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#f0c040]" />
                  <span>Lintasan Longitudinal Dinamika Sosial (Multi-Semester)</span>
                </h3>
                <p className="text-xs text-[#b0c4de]">
                  Melacak perubahan kohesi iklim kelas, tingkat resiprositas, dan fluktuasi siswa berisiko dari waktu ke waktu
                </p>
              </div>
              <span className="text-xs text-[#f7d970] font-mono bg-black/30 px-3 py-1 rounded-xl border border-white/10">
                3 Periode Pengukuran
              </span>
            </div>

            {/* Longitudinal Trend Visual Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {longitudinalData.map((item, idx) => (
                <div
                  key={item.periodCode}
                  className="p-4 rounded-xl bg-[#0a2a4a] border border-[#1a3f64] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{item.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a3f64] text-[#f7d970]">
                      {item.periodCode}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[#b0c4de] mb-1">
                        <span>Densitas Jaringan (Kepadatan Relasi):</span>
                        <span className="font-bold text-white">{Math.round(item.density * 100)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${item.density * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#b0c4de] mb-1">
                        <span>Tingkat Pertemanan Resiprokal:</span>
                        <span className="font-bold text-[#f0c040]">{item.reciprocityRate}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-[#f0c040] rounded-full"
                          style={{ width: `${item.reciprocityRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-between text-[11px]">
                      <span className="text-rose-400 font-semibold">
                        Siswa Ditolak (Rejected): {item.rejectedCount}
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        Siswa Populer: {item.popularCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Longitudinal Research Interpretation */}
            <div className="p-4 rounded-xl bg-[#1a3f64]/50 border-l-4 border-[#f0c040] text-xs text-[#b0c4de] leading-relaxed">
              <strong className="text-white text-sm block mb-1">
                Catatan Analis Riset Lab:
              </strong>
              Terdapat indikasi penurunan densitas jaringan dari 28% ke 22% pada semester berjalan, diiringi peningkatan siswa berstatus terisolasi. Disarankan aktivasi program pembentukan kelompok belajar heterogen dan bimbingan klasikal penguatan relasi pertemanan sehat sebelum ujian tengah semester.
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 4: MANAJEMEN PENGGUNA ===================== */}
      {activeTab === 'users' && (
        <div className="p-5 rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#f0c040]" />
                <span>Manajemen Pengguna &amp; Pembagian Rombel Guru BK</span>
              </h3>
              <p className="text-xs text-[#b0c4de]">
                Pengelolaan akun dan penugasan kelas untuk sekolah dengan guru BK lebih dari satu
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Search User */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-[#b0c4de] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, surel, NIP..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full sm:w-48 bg-[#0a2a4a] border border-[#1a3f64] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#b0c4de]/50 focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              {/* School Filter */}
              <select
                value={userFilterSchool}
                onChange={(e) => setUserFilterSchool(e.target.value)}
                className="bg-[#0a2a4a] border border-[#1a3f64] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#f0c040] cursor-pointer"
              >
                <option value="ALL">Semua Satuan Pendidikan</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={userFilterRole}
                onChange={(e) => setUserFilterRole(e.target.value)}
                className="bg-[#0a2a4a] border border-[#1a3f64] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#f0c040] cursor-pointer"
              >
                <option value="ALL">Semua Peran</option>
                <option value="guru_bk">Guru BK</option>
                <option value="kepala_sekolah">Kepala Sekolah</option>
                <option value="orang_tua">Orang Tua</option>
                <option value="admin">Super-Admin</option>
              </select>

              <button
                onClick={() => {
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewUserNip('');
                  setNewUserPhone('');
                  setNewUserPassword('bk123456');
                  setNewUserAssignedClassIds([]);
                  setShowAddUserModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold text-xs shadow-md transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pengguna</span>
              </button>
            </div>
          </div>

          {passwordSuccessToast && (
            <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{passwordSuccessToast}</span>
              </div>
              <button onClick={() => setPasswordSuccessToast(null)} className="text-emerald-400 hover:text-white text-base leading-none cursor-pointer">
                &times;
              </button>
            </div>
          )}

          {/* PERMOHONAN PENETAPAN & RESET KATA SANDI (APPROVAL SUPER-ADMIN) */}
          <div className="p-4 rounded-2xl bg-[#0a2a4a]/95 border border-[#1a3f64] shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a3f64] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#f0c040]/15 flex items-center justify-center text-[#f0c040]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-sm">
                    Permohonan Akun &amp; Penetapan Kata Sandi (Persetujuan Super-Admin)
                  </h4>
                  <p className="text-[11px] text-[#b0c4de]">
                    Guru BK atau Kepala Sekolah yang mengajukan aktivasi akun atau permintaan reset kata sandi mandiri
                  </p>
                </div>
              </div>
              <div>
                {passwordRequests.filter((r) => r.status === 'pending').length > 0 ? (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse shadow-sm">
                    {passwordRequests.filter((r) => r.status === 'pending').length} Menunggu Persetujuan
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Semua Permintaan Tuntas
                  </span>
                )}
              </div>
            </div>

            {passwordRequests.length === 0 ? (
              <p className="text-xs text-[#b0c4de] italic py-1">Belum ada permohonan penetapan kata sandi masuk.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#1a3f64]">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#0d3555] text-[#f7d970] border-b border-[#1a3f64]">
                      <th className="p-2.5">Waktu Pengajuan</th>
                      <th className="p-2.5">Nama &amp; Surel Pengguna</th>
                      <th className="p-2.5">Peran &amp; Lembaga</th>
                      <th className="p-2.5">Kata Sandi Diajukan</th>
                      <th className="p-2.5 text-center">Status</th>
                      <th className="p-2.5 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {passwordRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-white/5 transition">
                        <td className="p-2.5 text-[#b0c4de] text-[11px]">
                          {new Date(req.createdAt).toLocaleString('id-ID')}
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-white">{req.userName}</div>
                          <div className="text-[11px] text-cyan-300 font-mono">{req.userEmail}</div>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#1a3f64] text-slate-200">
                            {req.userRole.replace('_', ' ')}
                          </span>
                          <div className="text-[10px] text-[#b0c4de] mt-0.5">{req.schoolName}</div>
                        </td>
                        <td className="p-2.5">
                          {req.proposedPassword ? (
                            <span className="font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                              {req.proposedPassword}
                            </span>
                          ) : (
                            <span className="text-[#b0c4de] italic text-[11px]">(Permintaan reset)</span>
                          )}
                          {req.reason && <div className="text-[10px] text-slate-400 mt-0.5">{req.reason}</div>}
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : req.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {req.status === 'pending' ? 'Menunggu' : req.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApprovePasswordRequest(req.id, req.proposedPassword)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0a2a4a] font-bold text-[11px] transition cursor-pointer"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => handleRejectPasswordRequest(req.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] transition cursor-pointer"
                              >
                                Tolak
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#b0c4de]">Selesai</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* User Table */}
          <div className="overflow-x-auto border border-[#1a3f64] rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#0a2a4a] text-[#f0c040] border-b border-[#1a3f64]">
                  <th className="p-3">Nama &amp; NIP Pengguna</th>
                  <th className="p-3">Surel &amp; Kontak</th>
                  <th className="p-3">Peran Akses</th>
                  <th className="p-3">Satuan Pendidikan</th>
                  <th className="p-3">Rombel Bimbingan / Wilayah</th>
                  <th className="p-3 text-center">Status Akun</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users
                  .filter((u) => {
                    const matchSearch =
                      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
                      (u.nip && u.nip.includes(searchUser));
                    const matchSchool = userFilterSchool === 'ALL' || u.schoolId === userFilterSchool;
                    const matchRole = userFilterRole === 'ALL' || u.role === userFilterRole;
                    return matchSearch && matchSchool && matchRole;
                  })
                  .map((u) => {
                    // Find assigned class names
                    const assignedClasses = (u.assignedClassIds || [])
                      .map((clsId) => classes.find((c) => c.id === clsId)?.name)
                      .filter(Boolean);

                    return (
                      <tr key={u.id} className="hover:bg-white/5 transition">
                        <td className="p-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                          </div>
                          <div className="text-[11px] text-[#b0c4de]/80 flex items-center gap-2">
                            {u.title && <span>{u.title}</span>}
                            {u.nip && <span className="font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded">NIP: {u.nip}</span>}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-[#b0c4de]">{u.email}</div>
                          {u.phone && <div className="text-[10px] text-[#8fa8c6]">{u.phone}</div>}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'guru_bk'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : u.role === 'kepala_sekolah'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : u.role === 'orang_tua'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-[#b0c4de] font-medium">{u.schoolName}</td>
                        <td className="p-3">
                          {u.role === 'guru_bk' ? (
                            assignedClasses.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {assignedClasses.map((clsName, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-[10px] font-semibold"
                                  >
                                    {clsName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                                Semua Rombel Sekolah
                              </span>
                            )
                          ) : u.role === 'kepala_sekolah' ? (
                            <span className="text-[10px] text-[#b0c4de]">Seluruh Rombel Satuan</span>
                          ) : (
                            <span className="text-[10px] text-[#b0c4de]">Sistem Global</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                              u.status === 'inactive'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            }`}
                            title="Klik untuk mengubah status akun"
                          >
                            {u.status === 'inactive' ? 'Dinonaktifkan' : 'Aktif'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setPasswordTargetUser(u);
                                setAdminNewPassword('');
                                setShowSetPasswordModal(true);
                              }}
                              className="p-1 rounded text-[#f0c040] hover:text-[#f7d970] hover:bg-white/5 transition cursor-pointer"
                              title="Atur / Tetapkan Kata Sandi Pengguna"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer"
                              title="Edit Pengguna &amp; Pembagian Rombel"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-white/5 transition cursor-pointer"
                              title="Hapus Akses Pengguna"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 5: OAUTH & BELAJAR.ID ===================== */}
      {activeTab === 'oauth' && (
        <div className="p-5 rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] shadow-xl space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a3f64]">
            <div>
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#f0c040]" />
                <span>Konfigurasi Keamanan Single Sign-On (SSO) OAuth 2.0 &amp; Belajar.id</span>
              </h3>
              <p className="text-[#b0c4de]">
                Pengaturan protokol OpenID Connect (OIDC) &amp; PKCE untuk keamanan PWA di browser mobile &amp; desktop
              </p>
            </div>
            {oauthSaved && (
              <span className="flex items-center gap-1 text-emerald-400 font-bold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pengaturan Berhasil Disimpan!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-white font-semibold">Penyedia Identitas (OAuth Provider):</label>
              <input
                type="text"
                disabled
                value={oauthConfig.provider}
                className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-white font-semibold">Client ID Aplikasi:</label>
              <input
                type="text"
                value={oauthConfig.clientId}
                onChange={(e) => setOauthConfig({ ...oauthConfig, clientId: e.target.value })}
                className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-[#f7d970] font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-white font-semibold">Whitelist Domain Surel Institusi:</label>
              <input
                type="text"
                value={oauthConfig.allowedDomain}
                onChange={(e) => setOauthConfig({ ...oauthConfig, allowedDomain: e.target.value })}
                className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-mono"
              />
              <span className="text-[10px] text-[#b0c4de] block">
                Pisahkan dengan koma. Contoh: @madrasah.kemenag.go.id, @belajar.id
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-white font-semibold">Masa Berlaku Token Sesi (Jam):</label>
              <input
                type="number"
                value={oauthConfig.sessionDurationHours}
                onChange={(e) =>
                  setOauthConfig({ ...oauthConfig, sessionDurationHours: Number(e.target.value) })
                }
                className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#1a3f64] flex justify-end">
            <button
              onClick={handleSaveOAuth}
              className="px-5 py-2.5 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold text-xs shadow-lg transition"
            >
              Simpan Konfigurasi OAuth
            </button>
          </div>
        </div>
      )}

      {/* ===================== TAB 6: DATA MASTER ===================== */}
      {activeTab === 'master' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Satuan Pendidikan Management */}
          <div className="p-5 rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#f0c040]" />
                <span>Satuan Pendidikan (Multi-Tenant)</span>
              </h3>
              <button
                id="btn-add-school"
                onClick={() => setShowAddSchoolModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Sekolah</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {schools.map((s) => (
                <div key={s.id} className="p-3.5 rounded-xl bg-[#0a2a4a] border border-[#1a3f64] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{s.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1a3f64] text-[#f7d970]">
                        {s.type || 'Madrasah'}
                      </span>
                      {s.theme && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-cyan-300">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: s.theme.primaryColor }}
                          />
                          <span>{s.theme.name}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[#b0c4de] text-[11px]">NPSN: {s.npsn} &bull; {s.address} ({s.city || 'Bangka'})</div>
                    <div className="text-[10px] text-emerald-400">Kepsek: {s.principalName} &bull; Konselor: {s.counselorName}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setBrandingSchool(s);
                        setShowBrandingModal(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0c040]/15 hover:bg-[#f0c040]/25 text-[#f7d970] border border-[#f0c040]/30 transition cursor-pointer text-[11px]"
                      title="Atur Warna Tema & Identitas Satuan Pendidikan"
                    >
                      <Palette className="w-3.5 h-3.5 text-[#f0c040]" />
                      <span>Branding Tema</span>
                    </button>

                    {schools.length > 1 && (
                      <button
                        onClick={() => handleDeleteSchool(s.id, s.name)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Hapus Satuan Pendidikan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rombongan Belajar Management */}
          <div className="p-5 rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-[#f0c040]" />
                <span>Rombongan Belajar (Rombel) Terdaftar</span>
              </h3>
              <button
                id="btn-add-class-master"
                onClick={() => {
                  setNewMasterClassName('');
                  setNewMasterHomeroom('');
                  setNewMasterCounselorId('');
                  setShowAddClassMasterModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a3f64] hover:bg-[#204c75] text-[#f7d970] font-bold text-xs border border-[#f0c040]/40 shadow-md transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#f0c040]" />
                <span>Tambah Rombel</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {classes.map((c) => {
                const schoolOwner = schools.find((s) => s.id === c.schoolId);
                const counselor = users.find((u) => u.id === c.counselorId);
                const counselorName = counselor?.name || c.counselorName || 'Guru BK';

                return (
                  <div key={c.id} className="p-3.5 rounded-xl bg-[#0a2a4a] border border-[#1a3f64] flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{c.name}</span>
                        <span className="text-[10px] text-[#b0c4de] bg-black/30 px-2 py-0.5 rounded-md">
                          {schoolOwner?.name || 'MTsN 2 Bangka'}
                        </span>
                      </div>
                      <span className="text-[#b0c4de] text-[11px] block">
                        Tingkat: {c.grade || c.gradeLevel || '8'} &bull; Wali: {c.homeroomTeacher || 'Wali Kelas'}
                      </span>
                      <span className="text-cyan-300 text-[10px] block">
                        Guru BK Pengampu: {counselorName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#f7d970] bg-[#1a3f64] px-2.5 py-1 rounded-lg">
                        {c.academicYear}
                      </span>
                      <button
                        onClick={() => handleOpenEditMasterClass(c)}
                        className="p-1.5 rounded text-cyan-400 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer"
                        title="Edit Rombel & Guru BK Pengampu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {classes.length > 1 && (
                        <button
                          onClick={() => handleDeleteMasterClass(c.id, c.name)}
                          className="p-1.5 rounded text-rose-400 hover:text-rose-300 transition cursor-pointer"
                          title="Hapus Rombel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 7: AUDIT LOGS ===================== */}
      {activeTab === 'audit' && (
        <div className="p-5 rounded-2xl bg-[#0d3555]/80 border border-[#1a3f64] shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#f0c040]" />
                <span>Jejak Audit Keamanan &amp; Integritas Data (Audit Logs)</span>
              </h3>
              <p className="text-[#b0c4de]">
                Pencatatan real-time seluruh aktivitas otentikasi, modifikasi sosiometri, dan penerbitan dokumen resmi
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#1a3f64] rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#0a2a4a] text-[#f0c040] border-b border-[#1a3f64]">
                  <th className="p-3">Waktu Log</th>
                  <th className="p-3">Nama Pengguna</th>
                  <th className="p-3">Peran</th>
                  <th className="p-3">Tindakan / Aksi</th>
                  <th className="p-3">Rincian Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="p-3 text-[#b0c4de]">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                    <td className="p-3 font-bold text-white">{log.userName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#1a3f64] text-slate-200">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-[#f7d970]">{log.action}</td>
                    <td className="p-3 text-slate-300 font-sans text-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-[#1a3f64] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#f0c040]" />
                <span>Tambah Pengguna (Guru BK / Kepala Sekolah)</span>
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Satuan Pendidikan (Tenant):</label>
                <select
                  value={newUserSchoolId}
                  onChange={(e) => setNewUserSchoolId(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white focus:outline-hidden focus:border-[#f0c040]"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (NPSN: {s.npsn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Lengkap (beserta gelar):</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Contoh: Liengga Brian Darea, S.Sos.,Gr"
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Alamat Surel Resmi:</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="nama@madrasah.kemenag.go.id"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">NIP / NUPTK:</label>
                  <input
                    type="text"
                    value={newUserNip}
                    onChange={(e) => setNewUserNip(e.target.value)}
                    placeholder="199203152019031008"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Peran Akses (Role):</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    <option value="guru_bk">Guru BK (Konselor Sekolah)</option>
                    <option value="kepala_sekolah">Kepala Sekolah (DSS &amp; Kebijakan)</option>
                    <option value="admin">Super-Admin Lab Hub</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Kata Sandi Akun:</label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="bk123456"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">No. WhatsApp / Kontak:</label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              {/* Multi-counselor class assignment for Guru BK */}
              {newUserRole === 'guru_bk' && (
                <div className="p-3 rounded-xl bg-[#0a2a4a] border border-[#1a3f64] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[#f7d970] font-semibold text-xs">
                      Tugaskan Kelas Bimbingan yang Diampu:
                    </label>
                    <div className="flex gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() =>
                          setNewUserAssignedClassIds(
                            classes.filter((c) => c.schoolId === newUserSchoolId).map((c) => c.id)
                          )
                        }
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-white/20">|</span>
                      <button
                        type="button"
                        onClick={() => setNewUserAssignedClassIds([])}
                        className="text-rose-400 hover:underline cursor-pointer"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#b0c4de]">
                    Untuk sekolah dengan guru BK lebih dari satu, tentukan rombel yang dibimbing oleh konselor ini (atau biarkan kosong untuk semua rombel):
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {classes
                      .filter((c) => c.schoolId === newUserSchoolId)
                      .map((cls) => {
                        const isChecked = newUserAssignedClassIds.includes(cls.id);
                        return (
                          <label
                            key={cls.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                              isChecked
                                ? 'bg-cyan-950/60 border-cyan-400 text-white'
                                : 'bg-[#0d3555]/60 border-[#1a3f64] text-[#b0c4de] hover:bg-white/5'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewUserAssignedClassIds([...newUserAssignedClassIds, cls.id]);
                                } else {
                                  setNewUserAssignedClassIds(
                                    newUserAssignedClassIds.filter((id) => id !== cls.id)
                                  );
                                }
                              }}
                              className="accent-cyan-400 cursor-pointer"
                            />
                            <div className="truncate">
                              <span className="font-semibold text-white">{cls.name}</span>
                              <span className="block text-[10px] text-[#8fa8c6]">Tingkat {cls.grade}</span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold cursor-pointer"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-[#1a3f64] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                <span>Perbarui Data &amp; Pembagian Kelas Pengguna</span>
              </h3>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3">
              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Satuan Pendidikan (Tenant):</label>
                <select
                  value={editUserSchoolId}
                  onChange={(e) => setEditUserSchoolId(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white focus:outline-hidden focus:border-[#f0c040]"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (NPSN: {s.npsn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Alamat Surel:</label>
                  <input
                    type="email"
                    required
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">NIP / NUPTK:</label>
                  <input
                    type="text"
                    value={editUserNip}
                    onChange={(e) => setEditUserNip(e.target.value)}
                    placeholder="NIP resmi"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Peran Akses:</label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    <option value="guru_bk">Guru BK</option>
                    <option value="kepala_sekolah">Kepala Sekolah</option>
                    <option value="orang_tua">Orang Tua</option>
                    <option value="admin">Super-Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">No. Kontak / WA:</label>
                  <input
                    type="text"
                    value={editUserPhone}
                    onChange={(e) => setEditUserPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Status Akun:</label>
                  <select
                    value={editUserStatus}
                    onChange={(e) => setEditUserStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Dinonaktifkan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Ganti Kata Sandi (Opsional):</label>
                <input
                  type="text"
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah kata sandi akun"
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040] font-mono text-xs"
                />
              </div>

              {/* Multi-counselor class assignment for Guru BK */}
              {editUserRole === 'guru_bk' && (
                <div className="p-3 rounded-xl bg-[#0a2a4a] border border-[#1a3f64] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[#f7d970] font-semibold text-xs">
                      Tugaskan Kelas Bimbingan yang Diampu:
                    </label>
                    <div className="flex gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() =>
                          setEditUserAssignedClassIds(
                            classes.filter((c) => c.schoolId === editUserSchoolId).map((c) => c.id)
                          )
                        }
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <span className="text-white/20">|</span>
                      <button
                        type="button"
                        onClick={() => setEditUserAssignedClassIds([])}
                        className="text-rose-400 hover:underline cursor-pointer"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#b0c4de]">
                    Pilih rombel bimbingan guru BK ini (jika tidak ada yang dipilih, akan mengampu seluruh rombel sekolah):
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {classes
                      .filter((c) => c.schoolId === editUserSchoolId)
                      .map((cls) => {
                        const isChecked = editUserAssignedClassIds.includes(cls.id);
                        return (
                          <label
                            key={cls.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                              isChecked
                                ? 'bg-cyan-950/60 border-cyan-400 text-white'
                                : 'bg-[#0d3555]/60 border-[#1a3f64] text-[#b0c4de] hover:bg-white/5'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditUserAssignedClassIds([...editUserAssignedClassIds, cls.id]);
                                } else {
                                  setEditUserAssignedClassIds(
                                    editUserAssignedClassIds.filter((id) => id !== cls.id)
                                  );
                                }
                              }}
                              className="accent-cyan-400 cursor-pointer"
                            />
                            <div className="truncate">
                              <span className="font-semibold text-white">{cls.name}</span>
                              <span className="block text-[10px] text-[#8fa8c6]">Tingkat {cls.grade}</span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0a2a4a] font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Atur Kata Sandi Pengguna Langsung */}
      {showSetPasswordModal && passwordTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-[#f0c040]/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f0c040] text-[#0a2a4a] flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">Atur Kata Sandi Pengguna</h3>
                  <p className="text-[11px] text-[#b0c4de]">
                    Tetapkan kata sandi baru untuk akun {passwordTargetUser.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSetPasswordModal(false);
                  setPasswordTargetUser(null);
                }}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleDirectSetPassword} className="space-y-3">
              <div className="p-3 rounded-xl bg-[#0a2a4a] border border-[#1a3f64] space-y-1">
                <div className="text-white font-bold">{passwordTargetUser.name}</div>
                <div className="text-[#b0c4de] text-[11px]">Surel: {passwordTargetUser.email}</div>
                <div className="text-cyan-300 text-[11px]">
                  Peran: {passwordTargetUser.role.replace('_', ' ').toUpperCase()} &bull; {passwordTargetUser.schoolName}
                </div>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Kata Sandi Baru:</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan kata sandi baru"
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white font-mono text-sm focus:outline-hidden focus:border-[#f0c040]"
                />
                <span className="text-[10px] text-[#b0c4de] mt-1 block">
                  Pengguna dapat langsung menggunakan kata sandi ini pada portal login.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => {
                    setShowSetPasswordModal(false);
                    setPasswordTargetUser(null);
                  }}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold cursor-pointer"
                >
                  Simpan Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIMULASI SOSIOMETRI & PERILAKU MODAL */}
      {showSimulationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-purple-500/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">Simulasi Data Sosiometri &amp; Perilaku</h3>
                  <p className="text-[11px] text-[#b0c4de]">Generate pola respon sosiometri untuk keperluan uji coba pilot</p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulationModal(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Target Rombel / Kelas:</label>
                  <select
                    value={simClassId}
                    onChange={(e) => setSimClassId(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.academicYear})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Periode Asesmen:</label>
                  <select
                    value={simPeriodId}
                    onChange={(e) => setSimPeriodId(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Pilih Skenario Dinamika Sosial:</label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'healthy',
                      title: '🌟 Harmonis & Prososial',
                      desc: 'Kohesi tinggi, resiprositas kuat, sedikit penolakan sosial, iklim kelas kondusif.',
                    },
                    {
                      id: 'polarized',
                      title: '⚡ Terpolarisasi (Dua Kubu / Rivalitas)',
                      desc: 'Terbentuk dua klik besar dengan ikatan timbal balik terpisah dan friksi relasi antar-grup.',
                    },
                    {
                      id: 'isolated_risk',
                      title: '⚠️ Risiko Tinggi (Siswa Terisolasi & Penolakan)',
                      desc: 'Muncul siswa berstatus terabaikan (neglected) dan penolakan tinggi (rejected) yang butuh intervensi konselor.',
                    },
                    {
                      id: 'random',
                      title: '🎲 Distribusi Realistis Variatif',
                      desc: 'Sebaran alami acak berbobot dengan proporsi populer, rata-rata, dan kontroversial seimbang.',
                    },
                  ].map((sc) => (
                    <label
                      key={sc.id}
                      onClick={() => setSimScenario(sc.id as any)}
                      className={`block p-3 rounded-xl border cursor-pointer transition ${
                        simScenario === sc.id
                          ? 'bg-purple-900/40 border-purple-400 text-white shadow-md'
                          : 'bg-[#0a2a4a] border-[#1a3f64] text-[#b0c4de] hover:bg-[#12395d]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{sc.title}</span>
                        <input
                          type="radio"
                          name="simScenarioRadio"
                          checked={simScenario === sc.id}
                          onChange={() => setSimScenario(sc.id as any)}
                          className="text-purple-500"
                        />
                      </div>
                      <p className="text-[11px] mt-1 leading-relaxed">{sc.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => setShowSimulationModal(false)}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>{isSimulating ? 'Menghasilkan Simulasi...' : 'Jalankan Simulasi'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESET DATA MODAL */}
      {showResetDataModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-rose-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">Reset Basis Data Sistem</h3>
                  <p className="text-[11px] text-[#b0c4de]">Pilih mode reset yang Anda butuhkan</p>
                </div>
              </div>
              <button
                onClick={() => setShowResetDataModal(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => setResetMode('factory')}
                className={`block p-3.5 rounded-xl border cursor-pointer transition ${
                  resetMode === 'factory'
                    ? 'bg-amber-950/40 border-[#f0c040] text-white shadow-md'
                    : 'bg-[#0a2a4a] border-[#1a3f64] text-[#b0c4de]'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white text-xs">
                  <span>🏭 Reset ke Standar Pabrik (MTsN 2 Bangka)</span>
                  <input
                    type="radio"
                    name="resetMode"
                    checked={resetMode === 'factory'}
                    onChange={() => setResetMode('factory')}
                  />
                </div>
                <p className="text-[11px] mt-1 leading-relaxed text-[#b0c4de]">
                  Memulihkan seluruh data percontohan resmi MTs Negeri 2 Bangka (Kelas 8A, 30 siswa, nominasi sosiometri timbal balik lengkap, dan profil radar perilaku).
                </p>
              </label>

              <label
                onClick={() => setResetMode('clean')}
                className={`block p-3.5 rounded-xl border cursor-pointer transition ${
                  resetMode === 'clean'
                    ? 'bg-rose-950/40 border-rose-400 text-white shadow-md'
                    : 'bg-[#0a2a4a] border-[#1a3f64] text-[#b0c4de]'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white text-xs">
                  <span>🧹 Bersihkan Data Asesmen (Clean State)</span>
                  <input
                    type="radio"
                    name="resetMode"
                    checked={resetMode === 'clean'}
                    onChange={() => setResetMode('clean')}
                  />
                </div>
                <p className="text-[11px] mt-1 leading-relaxed text-[#b0c4de]">
                  Menjaga struktur satuan pendidikan, rombel, dan akun pengguna, namun mengosongkan seluruh respon kuesioner sosiometri dan perilaku siswa agar siap untuk survei baru dari nol.
                </p>
              </label>

              <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-[11px] text-[#f7d970]">
                Perhatian: Tindakan ini akan dicatat dalam Jejak Audit Keamanan Sistem.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => setShowResetDataModal(false)}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  disabled={isResetting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isResetting ? 'Mereset Data...' : 'Konfirmasi Reset'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAMBAH SATUAN PENDIDIKAN (SEKOLAH) MODAL */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-[#1a3f64] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#f0c040]" />
                <span>Tambah Satuan Pendidikan (Tenant)</span>
              </h3>
              <button
                onClick={() => setShowAddSchoolModal(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSchool} className="space-y-3">
              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Satuan Pendidikan:</label>
                <input
                  type="text"
                  required
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="Contoh: MTs Negeri 2 Bangka / SMP Negeri 1 Sungailiat"
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">NPSN Resmi:</label>
                  <input
                    type="text"
                    required
                    value={newSchoolNpsn}
                    onChange={(e) => setNewSchoolNpsn(e.target.value)}
                    placeholder="10901234"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white font-mono focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Bentuk Pendidikan:</label>
                  <select
                    value={newSchoolType}
                    onChange={(e) => setNewSchoolType(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    <option value="Madrasah">Madrasah (Kemenag)</option>
                    <option value="Sekolah Umum">Sekolah Umum (Kemendikbud)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Kota / Kabupaten:</label>
                  <input
                    type="text"
                    value={newSchoolCity}
                    onChange={(e) => setNewSchoolCity(e.target.value)}
                    placeholder="Kabupaten Bangka"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Alamat Singkat:</label>
                  <input
                    type="text"
                    value={newSchoolAddress}
                    onChange={(e) => setNewSchoolAddress(e.target.value)}
                    placeholder="Jl. Raya Sungailiat..."
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Kepala Sekolah:</label>
                  <input
                    type="text"
                    value={newSchoolPrincipal}
                    onChange={(e) => setNewSchoolPrincipal(e.target.value)}
                    placeholder="Nama Kepala Sekolah"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Koordinator Guru BK:</label>
                  <input
                    type="text"
                    value={newSchoolCounselor}
                    onChange={(e) => setNewSchoolCounselor(e.target.value)}
                    placeholder="Nama Guru BK"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold cursor-pointer"
                >
                  Daftarkan Satuan Pendidikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAMBAH ROMBEL (MASTER) MODAL */}
      {showAddClassMasterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-[#1a3f64] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#f0c040]" />
                <span>Tambah Rombongan Belajar (Admin)</span>
              </h3>
              <button
                onClick={() => setShowAddClassMasterModal(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMasterClass} className="space-y-3">
              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Satuan Pendidikan (Sekolah):</label>
                <select
                  value={newMasterSchoolId}
                  onChange={(e) => setNewMasterSchoolId(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white focus:outline-hidden focus:border-[#f0c040]"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Rombel / Kelas:</label>
                <input
                  type="text"
                  required
                  value={newMasterClassName}
                  onChange={(e) => setNewMasterClassName(e.target.value)}
                  placeholder="Contoh: Kelas 8B / Kelas 9A"
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tingkat / Grade:</label>
                  <select
                    value={newMasterClassGrade}
                    onChange={(e) => setNewMasterClassGrade(e.target.value)}
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
                    value={newMasterClassYear}
                    onChange={(e) => setNewMasterClassYear(e.target.value)}
                    placeholder="2026/2027"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Nama Wali Kelas:</label>
                  <input
                    type="text"
                    value={newMasterHomeroom}
                    onChange={(e) => setNewMasterHomeroom(e.target.value)}
                    placeholder="Nama Wali Kelas Terpilih"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Guru BK Pengampu:</label>
                  <select
                    value={newMasterCounselorId}
                    onChange={(e) => setNewMasterCounselorId(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    <option value="">Pilih Guru BK Terdaftar</option>
                    {users
                      .filter((u) => u.schoolId === newMasterSchoolId && u.role === 'guru_bk')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => setShowAddClassMasterModal(false)}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold cursor-pointer"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROMBEL (MASTER) MODAL */}
      {showEditClassMasterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-[#1a3f64] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                <span>Perbarui Data Rombongan Belajar &amp; Guru BK</span>
              </h3>
              <button
                onClick={() => setShowEditClassMasterModal(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateMasterClass} className="space-y-3">
              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Satuan Pendidikan (Sekolah):</label>
                <select
                  value={editMasterSchoolId}
                  onChange={(e) => setEditMasterSchoolId(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white focus:outline-hidden focus:border-[#f0c040]"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Rombel / Kelas:</label>
                <input
                  type="text"
                  required
                  value={editMasterClassName}
                  onChange={(e) => setEditMasterClassName(e.target.value)}
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tingkat / Grade:</label>
                  <select
                    value={editMasterClassGrade}
                    onChange={(e) => setEditMasterClassGrade(e.target.value)}
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
                    value={editMasterClassYear}
                    onChange={(e) => setEditMasterClassYear(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Nama Wali Kelas:</label>
                  <input
                    type="text"
                    value={editMasterHomeroom}
                    onChange={(e) => setEditMasterHomeroom(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Guru BK Pengampu:</label>
                  <select
                    value={editMasterCounselorId}
                    onChange={(e) => setEditMasterCounselorId(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    <option value="">Pilih Guru BK Terdaftar</option>
                    {users
                      .filter((u) => u.schoolId === editMasterSchoolId && u.role === 'guru_bk')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => setShowEditClassMasterModal(false)}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0a2a4a] font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHOOL BRANDING MODAL */}
      {showBrandingModal && brandingSchool && (
        <SchoolBrandingModal
          school={brandingSchool}
          onClose={() => {
            setShowBrandingModal(false);
            setBrandingSchool(null);
          }}
          onSaveTheme={(updatedSchool) => {
            setShowBrandingModal(false);
            setBrandingSchool(null);
            onRefreshData();
          }}
        />
      )}

      {/* Add Period Modal */}
      {showAddPeriodModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0d3555] border-2 border-[#1a3f64] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#f0c040]" />
                <span>Buka Periode Asesmen Baru</span>
              </h3>
              <button
                onClick={() => setShowAddPeriodModal(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddPeriod} className="space-y-3">
              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Nama Periode:</label>
                <input
                  type="text"
                  required
                  value={newPeriodName}
                  onChange={(e) => setNewPeriodName(e.target.value)}
                  placeholder="Contoh: Semester Genap 2026/2027"
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Kode Unik:</label>
                  <input
                    type="text"
                    required
                    value={newPeriodCode}
                    onChange={(e) => setNewPeriodCode(e.target.value)}
                    placeholder="Contoh: 2026-S2"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white font-mono uppercase focus:outline-hidden focus:border-[#f0c040]"
                  />
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Semester:</label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(Number(e.target.value) as 1 | 2)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    <option value={1}>Semester 1 (Ganjil)</option>
                    <option value={2}>Semester 2 (Genap)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Status Awal:</label>
                  <select
                    value={newPeriodStatus}
                    onChange={(e) => setNewPeriodStatus(e.target.value as 'aktif' | 'ditutup' | 'draft')}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  >
                    <option value="aktif">Aktif Langsung</option>
                    <option value="draft">Draft (Persiapan)</option>
                    <option value="ditutup">Ditutup</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tanggal Mulai:</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>

                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">Tanggal Selesai:</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#e8edf5] font-semibold mb-1">Keterangan / Deskripsi:</label>
                <textarea
                  rows={2}
                  value={newPeriodDescription}
                  onChange={(e) => setNewPeriodDescription(e.target.value)}
                  placeholder="Keterangan singkat siklus asesmen sosiometri..."
                  className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2 text-white focus:outline-hidden focus:border-[#f0c040]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1a3f64]">
                <button
                  type="button"
                  onClick={() => setShowAddPeriodModal(false)}
                  className="px-4 py-2 rounded-xl text-[#b0c4de] hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold cursor-pointer"
                >
                  Simpan Periode Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
