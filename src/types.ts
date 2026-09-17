export type UserRole = 'guru_bk' | 'kepala_sekolah' | 'orang_tua' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  schoolName: string;
  assignedClassIds?: string[]; // Array of class IDs assigned to this counselor/teacher
  nip?: string;
  phone?: string;
  avatarUrl?: string;
  studentNis?: string; // For parents: which student they belong to
  childId?: string;
  status?: 'active' | 'inactive';
  authProvider?: string;
  title?: string;
  password?: string; // Stored user password managed by Admin
  createdAt: string;
}

export interface PasswordResetRequest {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  schoolName: string;
  requestedAt: string; // ISO string
  reason?: string;
  proposedPassword?: string;
  status: 'pending' | 'approved' | 'rejected';
  resolvedAt?: string;
  resolvedBy?: string;
  adminNote?: string;
}

export type QualitativeNoteContext =
  | 'Observasi Kelas'
  | 'Konseling Individu'
  | 'Sesi Konseling Individu'
  | 'Bimbingan Kelompok'
  | 'Laporan Teman Sebaya'
  | 'Laporan Rekan Sebaya'
  | 'Insiden Anekdotal'
  | 'Interaksi Informal / Istirahat'
  | 'Kunjungan Rumah (Home Visit)'
  | 'Kegiatan Ekstrakurikuler';

export interface StudentQualitativeNote {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  periodId: string;
  authorName: string;
  authorRole: string;
  date: string; // YYYY-MM-DD
  context: QualitativeNoteContext;
  content: string; // Qualitative descriptive notes by Guru BK
  thematicCategory?: string; // e.g. "Kecemasan Sosial & Penarikan Diri", "Dukungan & Resiprositas Sebaya", "Agresivitas Reaktif", "Kepemimpinan Prokolektif"
  sentiment?: 'positif' | 'netral' | 'perlu_perhatian' | 'kritis';
  keywords?: string[];
  aiInsight?: string;
  createdAt: string;
}

export interface ThematicClusterResult {
  theme: string;
  count: number;
  percentage: number;
  description: string;
  tone: 'positif' | 'peringatan' | 'kritis' | 'netral';
  sampleStudentNames: string[];
  recommendedIntervention: string;
}

export interface ClassCounselorSummary {
  classId: string;
  periodId: string;
  counselorReflection: string; // Catatan narasi refleksi Guru BK untuk kelas
  updatedAt: string;
  updatedBy: string;
}

export interface Period {
  id: string;
  name: string; // e.g., "Semester 1 2026/2027", "Triwulan I (Jul-Sep 2026)"
  code: string; // e.g., "2026-S1", "2026-TW1"
  academicYear: string; // "2026/2027"
  semester: 1 | 2;
  cycleType?: 'semester' | 'triwulan';
  quarter?: 1 | 2 | 3 | 4;
  status: 'aktif' | 'ditutup' | 'draft';
  startDate: string;
  endDate: string;
  description?: string;
}

export interface SchoolTheme {
  preset: 'navy_gold' | 'emerald_gold' | 'royal_sapphire' | 'crimson_gold' | 'forest_mint' | 'amethyst_amber';
  primaryColor: string; // e.g., '#0a2a4a'
  secondaryColor: string; // e.g., '#0f3d63'
  accentColor: string; // e.g., '#f0c040'
  accentLight: string; // e.g., '#f7d970'
  schoolBadge?: string;
}

export interface School {
  id: string;
  name: string;
  npsn: string;
  address: string;
  city: string;
  type: 'Madrasah' | 'SMP' | 'SMA';
  totalClasses: number;
  principalName?: string;
  counselorName?: string;
  phone?: string;
  status?: 'aktif' | 'non-aktif';
  theme?: SchoolTheme;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  name: string; // e.g., "8A"
  grade: string; // "8"
  academicYear: string;
  homeroomTeacher: string;
  counselorId?: string; // ID of assigned Guru BK
  counselorName: string;
  targetStudentCount?: number;
  description?: string;
}

export type SimulationScenario =
  | 'healthy'
  | 'polarized'
  | 'isolated_risk'
  | 'random';

export interface Student {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  className: string;
  schoolId: string;
  avatarUrl?: string;
}

export type RelationCriteria = 'belajar' | 'bermain';
export type RelationType = 'like' | 'dislike';

export interface SociometricNomination {
  id: string;
  periodId: string;
  classId: string;
  studentId: string; // Nominator
  targetId: string; // Selected peer
  criteria: RelationCriteria; // 'belajar' (socio-instrumental) | 'bermain' (socio-affective)
  type: RelationType; // 'like' | 'dislike'
}

export interface PeerBehavioralRating {
  id: string;
  periodId: string;
  classId: string;
  studentId: string; // Subject being rated
  prosocial: number; // 0-10 or 1-5 peer nominations for prosocial/helping
  aggressive: number; // peer nominations for aggressive/bullying behavior
  withdrawn: number; // peer nominations for withdrawn/shy/isolated
  victimization: number; // peer nominations for being picked on / bullied
  hyperactive: number; // peer nominations for disruptive / hyperactive
}

export type CoieDodgeStatus =
  | 'Popular'
  | 'Rejected'
  | 'Neglected'
  | 'Controversial'
  | 'Average';

export type BehavioralCategory =
  | 'Populer-Prososial'
  | 'Bistrategic'
  | 'Aggressive Victim'
  | 'Passive Victim'
  | 'Isolated'
  | 'Controversial Leader'
  | 'Emerging Conduct Problem'
  | 'Average / Adaptif';

export type RiskLevel = 'Tinggi' | 'Sedang' | 'Rendah' | 'Stabil';

export interface StudentCalculatedMetrics {
  studentId: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  className: string;
  likesReceived: number;
  dislikesReceived: number;
  likesGiven: number;
  dislikesGiven: number;
  zLikes: number;
  zDislikes: number;
  zSP: number; // Social Preference: Z_L - Z_D
  zSI: number; // Social Impact: Z_L + Z_D
  status: CoieDodgeStatus;
  behavioralStatus: BehavioralCategory;
  prosocialScore: number;
  aggressiveScore: number;
  withdrawnScore: number;
  victimizationScore: number;
  hyperactiveScore: number;
  riskLevel: RiskLevel;
  priorityFlag: boolean;
  priorityReason?: string;
  dssRecommendation: string;
  parentNote: string;
  longitudinalHistory: {
    periodCode: string;
    periodName: string;
    status: CoieDodgeStatus;
    zSP: number;
    zSI: number;
    victimization: number;
    riskLevel: RiskLevel;
  }[];
}

export interface ClassMetricsAggregate {
  classId: string;
  className: string;
  periodId: string;
  periodName: string;
  totalStudents: number;
  density: number; // 0 to 1
  reciprocityRate: number; // percentage
  statusCounts: {
    Popular: number;
    Rejected: number;
    Neglected: number;
    Controversial: number;
    Average: number;
  };
  riskSummary: {
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
  };
  climateIndex: 'Kondusif' | 'Waspada' | 'Kritis';
  climateScore: number; // 0 - 100
  dssStrategicAdvice: string[];
  kepsekPolicyAdvice: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'alert' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  targetRoles: UserRole[];
  studentId?: string;
  classId?: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
}
