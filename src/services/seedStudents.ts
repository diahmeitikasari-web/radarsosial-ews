import {
  Student,
  SchoolClass,
  School,
  User,
  SociometricNomination,
  PeerBehavioralRating,
} from '../types';
import seedData3B from './seedData3B.json';

// ==========================================
// DAFTAR SEKOLAH MULTI-TENANT (7 SATUAN PENDIDIKAN)
// ==========================================
export const ALL_SCHOOLS: School[] = [
  {
    id: 'sch-mtsn2-bangka',
    name: 'MTs Negeri 2 Bangka',
    npsn: '10901234',
    address: 'Jl. Pemuda No. 45, Sungailiat, Bangka Belitung',
    city: 'Kabupaten Bangka',
    type: 'Madrasah',
    totalClasses: 12,
    principalName: 'Kepala MTs Negeri 2 Bangka',
    counselorName: 'BK MTs Negeri 2 Bangka',
    phone: '(0717) 92345',
    status: 'aktif',
    theme: {
      preset: 'navy_gold',
      primaryColor: '#0a2a4a',
      secondaryColor: '#0d3555',
      accentColor: '#f0c040',
      accentLight: '#f7d970',
      schoolBadge: 'Madrasah Hebat Bermartabat',
    },
  },
  {
    id: 'sch-sman-olahraga-mnoer',
    name: 'SMA Negeri Olahraga Muhammad Noer (SKO M. Noer)',
    npsn: '69989821',
    address: 'Komplek GOR Sahabudin, Pangkalpinang, Kepulauan Bangka Belitung',
    city: 'Pangkalpinang',
    type: 'SMA',
    totalClasses: 9,
    principalName: 'Kepala SMA Negeri Olahraga M. Noer',
    counselorName: 'BK SMA Negeri Olahraga M. Noer',
    phone: '(0717) 43210',
    status: 'aktif',
    theme: {
      preset: 'crimson_gold',
      primaryColor: '#7f1d1d',
      secondaryColor: '#991b1b',
      accentColor: '#f59e0b',
      accentLight: '#fde68a',
      schoolBadge: 'Sekolah Keolahragaan Unggul & Berprestasi',
    },
  },
  {
    id: 'sch-mts-daarul-abror',
    name: 'MTs Daarul Abror',
    npsn: '10903456',
    address: 'Kace, Mendo Barat, Kabupaten Bangka, Kepulauan Bangka Belitung',
    city: 'Kabupaten Bangka',
    type: 'Madrasah',
    totalClasses: 9,
    principalName: 'Kepala MTs Daarul Abror',
    counselorName: 'BK MTs Daarul Abror',
    phone: '(0717) 93456',
    status: 'aktif',
    theme: {
      preset: 'forest_mint',
      primaryColor: '#064e3b',
      secondaryColor: '#065f46',
      accentColor: '#34d399',
      accentLight: '#6ee7b7',
      schoolBadge: 'Pondok Pesantren & Madrasah Berakhlak Qurani',
    },
  },
  {
    id: 'sch-smpn1-bakam',
    name: 'SMP Negeri 1 Bakam',
    npsn: '10901452',
    address: 'Jl. Raya Pangkalpinang - Muntok KM 45, Bakam, Kabupaten Bangka',
    city: 'Kabupaten Bangka',
    type: 'SMP',
    totalClasses: 9,
    principalName: 'Kepala SMP Negeri 1 Bakam',
    counselorName: 'BK SMP Negeri 1 Bakam',
    phone: '(0717) 94567',
    status: 'aktif',
    theme: {
      preset: 'royal_sapphire',
      primaryColor: '#0f2b5c',
      secondaryColor: '#1a3f7a',
      accentColor: '#38bdf8',
      accentLight: '#7dd3fc',
      schoolBadge: 'Maju Bersama, Berbudaya & Berprestasi',
    },
  },
  {
    id: 'sch-smpn7-pangkalpinang',
    name: 'SMP Negeri 7 Pangkal Pinang',
    npsn: '10900777',
    address: 'Jl. RE Martadinata, Pangkalpinang, Kepulauan Bangka Belitung',
    city: 'Pangkalpinang',
    type: 'SMP',
    totalClasses: 9,
    principalName: 'Kepala SMP Negeri 7 Pangkal Pinang',
    counselorName: 'BK SMP Negeri 7 Pangkal Pinang',
    phone: '(0717) 42177',
    status: 'aktif',
    theme: {
      preset: 'teal_marine',
      primaryColor: '#134e4a',
      secondaryColor: '#115e59',
      accentColor: '#2dd4bf',
      accentLight: '#99f6e4',
      schoolBadge: 'Sekolah Ramah Anak Berkarakter Pancasila',
    },
  },
  {
    id: 'sch-smkn5-pangkalpinang',
    name: 'SMK N 5 Pangkalpinang',
    npsn: '69899555',
    address: 'Jl. Pasir Padi, Air Itam, Pangkalpinang, Kepulauan Bangka Belitung',
    city: 'Pangkalpinang',
    type: 'SMK',
    totalClasses: 9,
    principalName: 'Kepala SMK N 5 Pangkalpinang',
    counselorName: 'BK SMK N 5 Pangkalpinang',
    phone: '(0717) 42555',
    status: 'aktif',
    theme: {
      preset: 'amber_industrial',
      primaryColor: '#1e293b',
      secondaryColor: '#334155',
      accentColor: '#f59e0b',
      accentLight: '#fde68a',
      schoolBadge: 'SMK Vokasi Unggul & Siap Kerja',
    },
  },
  {
    id: 'sch-iain-sas',
    name: 'IAIN Syaikh Abdurrahman Siddik (IAIN SAS)',
    npsn: '20219001',
    address: 'Jl. Raya Petaling KM 13, Mendo Barat, Kabupaten Bangka, Kepulauan Bangka Belitung',
    city: 'Kabupaten Bangka',
    type: 'Perguruan Tinggi',
    totalClasses: 3,
    principalName: 'Pimpinan / Dekanat IAIN SAS',
    counselorName: 'BK IAIN SAS',
    phone: '(0717) 91234',
    status: 'aktif',
    theme: {
      preset: 'amethyst_amber',
      primaryColor: '#4c1d95',
      secondaryColor: '#581c87',
      accentColor: '#fb923c',
      accentLight: '#fdba74',
      schoolBadge: 'PTKIN Unggul • PAI • TBI • BKPI',
    },
  },
];

// ==========================================
// DAFTAR KELAS PER SEKOLAH (BERSIH UNTUK DATA LAPANGAN)
// ==========================================
export const ALL_CLASSES: SchoolClass[] = [
  // --- MTs Negeri 2 Bangka ---
  {
    id: 'cls-3b',
    schoolId: 'sch-mtsn2-bangka',
    name: 'Kelas 3B',
    grade: '9',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 3B',
    counselorId: 'usr-guru-bk-mtsn2',
    counselorName: 'BK MTs Negeri 2 Bangka',
    targetStudentCount: 29,
    description: 'Rombel Kelas 3B (IX-B) - Data Simulasi Benchmark MTsN 2 Bangka',
  },
  {
    id: 'cls-mtsn2-7a',
    schoolId: 'sch-mtsn2-bangka',
    name: 'Kelas 7A',
    grade: '7',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 7A',
    counselorId: 'usr-guru-bk-mtsn2',
    counselorName: 'BK MTs Negeri 2 Bangka',
    targetStudentCount: 30,
    description: 'Rombel Kelas 7A MTs Negeri 2 Bangka - Siap Input / Upload Data Lapangan',
  },
  {
    id: 'cls-mtsn2-8a',
    schoolId: 'sch-mtsn2-bangka',
    name: 'Kelas 8A',
    grade: '8',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 8A',
    counselorId: 'usr-guru-bk-mtsn2',
    counselorName: 'BK MTs Negeri 2 Bangka',
    targetStudentCount: 30,
    description: 'Rombel Kelas 8A MTs Negeri 2 Bangka - Siap Input / Upload Data Lapangan',
  },
  {
    id: 'cls-mtsn2-9a',
    schoolId: 'sch-mtsn2-bangka',
    name: 'Kelas 9A',
    grade: '9',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 9A',
    counselorId: 'usr-guru-bk-mtsn2',
    counselorName: 'BK MTs Negeri 2 Bangka',
    targetStudentCount: 30,
    description: 'Rombel Kelas 9A MTs Negeri 2 Bangka - Siap Input / Upload Data Lapangan',
  },

  // --- SMA Negeri Olahraga Muhammad Noer (SKO M. Noer) ---
  {
    id: 'cls-sko-x',
    schoolId: 'sch-sman-olahraga-mnoer',
    name: 'Kelas X',
    grade: '10',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas X SKO',
    counselorId: 'usr-bk-skonoer',
    counselorName: 'BK SMA Negeri Olahraga M. Noer',
    targetStudentCount: 30,
    description: 'Rombel Atlet Kelas X SMAN Olahraga M. Noer',
  },
  {
    id: 'cls-sko-xi',
    schoolId: 'sch-sman-olahraga-mnoer',
    name: 'Kelas XI',
    grade: '11',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas XI SKO',
    counselorId: 'usr-bk-skonoer',
    counselorName: 'BK SMA Negeri Olahraga M. Noer',
    targetStudentCount: 30,
    description: 'Rombel Atlet Kelas XI SMAN Olahraga M. Noer',
  },
  {
    id: 'cls-sko-xii',
    schoolId: 'sch-sman-olahraga-mnoer',
    name: 'Kelas XII',
    grade: '12',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas XII SKO',
    counselorId: 'usr-bk-skonoer',
    counselorName: 'BK SMA Negeri Olahraga M. Noer',
    targetStudentCount: 30,
    description: 'Rombel Atlet Kelas XII SMAN Olahraga M. Noer',
  },

  // --- MTs Daarul Abror ---
  {
    id: 'cls-da-7a',
    schoolId: 'sch-mts-daarul-abror',
    name: 'Kelas 7A',
    grade: '7',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 7A Santri',
    counselorId: 'usr-bk-daarulabror',
    counselorName: 'BK MTs Daarul Abror',
    targetStudentCount: 30,
    description: 'Rombel Kelas 7A MTs Daarul Abror',
  },
  {
    id: 'cls-da-8a',
    schoolId: 'sch-mts-daarul-abror',
    name: 'Kelas 8A',
    grade: '8',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 8A Santri',
    counselorId: 'usr-bk-daarulabror',
    counselorName: 'BK MTs Daarul Abror',
    targetStudentCount: 30,
    description: 'Rombel Kelas 8A MTs Daarul Abror',
  },
  {
    id: 'cls-da-9a',
    schoolId: 'sch-mts-daarul-abror',
    name: 'Kelas 9A',
    grade: '9',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 9A Santri',
    counselorId: 'usr-bk-daarulabror',
    counselorName: 'BK MTs Daarul Abror',
    targetStudentCount: 30,
    description: 'Rombel Kelas 9A MTs Daarul Abror',
  },

  // --- SMP Negeri 1 Bakam ---
  {
    id: 'cls-bakam-7a',
    schoolId: 'sch-smpn1-bakam',
    name: 'Kelas 7A',
    grade: '7',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 7A',
    counselorId: 'usr-bk-bakam',
    counselorName: 'BK SMP Negeri 1 Bakam',
    targetStudentCount: 30,
    description: 'Rombel Kelas 7A SMP Negeri 1 Bakam',
  },
  {
    id: 'cls-bakam-8a',
    schoolId: 'sch-smpn1-bakam',
    name: 'Kelas 8A',
    grade: '8',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 8A',
    counselorId: 'usr-bk-bakam',
    counselorName: 'BK SMP Negeri 1 Bakam',
    targetStudentCount: 30,
    description: 'Rombel Kelas 8A SMP Negeri 1 Bakam',
  },
  {
    id: 'cls-bakam-9a',
    schoolId: 'sch-smpn1-bakam',
    name: 'Kelas 9A',
    grade: '9',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 9A',
    counselorId: 'usr-bk-bakam',
    counselorName: 'BK SMP Negeri 1 Bakam',
    targetStudentCount: 30,
    description: 'Rombel Kelas 9A SMP Negeri 1 Bakam',
  },

  // --- SMP Negeri 7 Pangkal Pinang ---
  {
    id: 'cls-smp7-7a',
    schoolId: 'sch-smpn7-pangkalpinang',
    name: 'Kelas 7A',
    grade: '7',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 7A',
    counselorId: 'usr-bk-smp7pkp',
    counselorName: 'BK SMP Negeri 7 Pangkal Pinang',
    targetStudentCount: 30,
    description: 'Rombel Kelas 7A SMP Negeri 7 Pangkal Pinang',
  },
  {
    id: 'cls-smp7-8a',
    schoolId: 'sch-smpn7-pangkalpinang',
    name: 'Kelas 8A',
    grade: '8',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 8A',
    counselorId: 'usr-bk-smp7pkp',
    counselorName: 'BK SMP Negeri 7 Pangkal Pinang',
    targetStudentCount: 30,
    description: 'Rombel Kelas 8A SMP Negeri 7 Pangkal Pinang',
  },
  {
    id: 'cls-smp7-9a',
    schoolId: 'sch-smpn7-pangkalpinang',
    name: 'Kelas 9A',
    grade: '9',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas 9A',
    counselorId: 'usr-bk-smp7pkp',
    counselorName: 'BK SMP Negeri 7 Pangkal Pinang',
    targetStudentCount: 30,
    description: 'Rombel Kelas 9A SMP Negeri 7 Pangkal Pinang',
  },

  // --- SMK N 5 Pangkalpinang ---
  {
    id: 'cls-smk5-x',
    schoolId: 'sch-smkn5-pangkalpinang',
    name: 'Kelas X',
    grade: '10',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas X SMK',
    counselorId: 'usr-bk-smk5pkp',
    counselorName: 'BK SMK N 5 Pangkalpinang',
    targetStudentCount: 30,
    description: 'Rombel Kejuruan Kelas X SMK N 5 Pangkalpinang',
  },
  {
    id: 'cls-smk5-xi',
    schoolId: 'sch-smkn5-pangkalpinang',
    name: 'Kelas XI',
    grade: '11',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas XI SMK',
    counselorId: 'usr-bk-smk5pkp',
    counselorName: 'BK SMK N 5 Pangkalpinang',
    targetStudentCount: 30,
    description: 'Rombel Kejuruan Kelas XI SMK N 5 Pangkalpinang',
  },
  {
    id: 'cls-smk5-xii',
    schoolId: 'sch-smkn5-pangkalpinang',
    name: 'Kelas XII',
    grade: '12',
    academicYear: '2026/2027',
    homeroomTeacher: 'Wali Kelas XII SMK',
    counselorId: 'usr-bk-smk5pkp',
    counselorName: 'BK SMK N 5 Pangkalpinang',
    targetStudentCount: 30,
    description: 'Rombel Kejuruan Kelas XII SMK N 5 Pangkalpinang',
  },

  // --- IAIN Syaikh Abdurrahman Siddik (IAIN SAS) — Prodi PAI, TBI, BKPI ---
  {
    id: 'cls-iain-pai',
    schoolId: 'sch-iain-sas',
    name: 'Prodi PAI (Pendidikan Agama Islam)',
    grade: 'PT',
    academicYear: '2026/2027',
    homeroomTeacher: 'Dosen PA Prodi PAI',
    counselorId: 'usr-bk-iainsas',
    counselorName: 'BK IAIN SAS',
    targetStudentCount: 35,
    description: 'Program Studi Pendidikan Agama Islam (PAI) - IAIN SAS',
  },
  {
    id: 'cls-iain-tbi',
    schoolId: 'sch-iain-sas',
    name: 'Prodi TBI (Tadris Bahasa Inggris)',
    grade: 'PT',
    academicYear: '2026/2027',
    homeroomTeacher: 'Dosen PA Prodi TBI',
    counselorId: 'usr-bk-iainsas',
    counselorName: 'BK IAIN SAS',
    targetStudentCount: 35,
    description: 'Program Studi Tadris Bahasa Inggris (TBI) - IAIN SAS',
  },
  {
    id: 'cls-iain-bkpi',
    schoolId: 'sch-iain-sas',
    name: 'Prodi BKPI (Bimbingan & Konseling Pendidikan Islam)',
    grade: 'PT',
    academicYear: '2026/2027',
    homeroomTeacher: 'Dosen PA Prodi BKPI',
    counselorId: 'usr-bk-iainsas',
    counselorName: 'BK IAIN SAS',
    targetStudentCount: 35,
    description: 'Program Studi Bimbingan & Konseling Pendidikan Islam (BKPI) - IAIN SAS',
  },
];

// ==========================================
// DAFTAR PENGGUNA MULTI-TENANT (NON-FIKTIF / PERAN RESMI)
// ==========================================
export const ALL_USERS: User[] = [
  // Super Admin
  {
    id: 'usr-admin',
    name: 'Super Admin Radar Sosial',
    email: 'admin@radarsosial.id',
    password: 'admin123456',
    role: 'admin',
    schoolId: 'sch-mtsn2-bangka',
    schoolName: 'Psychosophia Behavioral Lab',
    title: 'Super-Administrator Sistem & Peneliti Utama',
    status: 'active',
    createdAt: '2024-12-01',
  },

  // 1. MTs Negeri 2 Bangka
  {
    id: 'usr-guru-bk-mtsn2',
    name: 'BK MTs Negeri 2 Bangka',
    email: 'gurubk@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-mtsn2-bangka',
    schoolName: 'MTs Negeri 2 Bangka',
    assignedClassIds: ['cls-3b', 'cls-mtsn2-7a', 'cls-mtsn2-8a', 'cls-mtsn2-9a'],
    phone: '(0717) 92345',
    title: 'Guru Bimbingan dan Konseling (BK)',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'usr-kepsek-mtsn2',
    name: 'Kepala MTs Negeri 2 Bangka',
    email: 'kepsek@radarsosial.id',
    password: 'kepsek123456',
    role: 'kepala_sekolah',
    schoolId: 'sch-mtsn2-bangka',
    schoolName: 'MTs Negeri 2 Bangka',
    phone: '(0717) 92345',
    title: 'Kepala Madrasah',
    status: 'active',
    createdAt: '2025-01-05',
  },

  // 2. SMA Negeri Olahraga Muhammad Noer (SKO M. Noer)
  {
    id: 'usr-bk-skonoer',
    name: 'BK SMA Negeri Olahraga M. Noer',
    email: 'bk.skonoer@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-sman-olahraga-mnoer',
    schoolName: 'SMA Negeri Olahraga Muhammad Noer (SKO M. Noer)',
    assignedClassIds: ['cls-sko-x', 'cls-sko-xi', 'cls-sko-xii'],
    phone: '(0717) 43210',
    title: 'Guru Bimbingan dan Konseling (BK)',
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: 'usr-kepsek-skonoer',
    name: 'Kepala SMA Negeri Olahraga M. Noer',
    email: 'kepsek.skonoer@radarsosial.id',
    password: 'kepsek123456',
    role: 'kepala_sekolah',
    schoolId: 'sch-sman-olahraga-mnoer',
    schoolName: 'SMA Negeri Olahraga Muhammad Noer (SKO M. Noer)',
    phone: '(0717) 43210',
    title: 'Kepala Sekolah',
    status: 'active',
    createdAt: '2025-02-01',
  },

  // 3. MTs Daarul Abror
  {
    id: 'usr-bk-daarulabror',
    name: 'BK MTs Daarul Abror',
    email: 'bk.daarulabror@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-mts-daarul-abror',
    schoolName: 'MTs Daarul Abror',
    assignedClassIds: ['cls-da-7a', 'cls-da-8a', 'cls-da-9a'],
    phone: '(0717) 93456',
    title: 'Guru Bimbingan dan Konseling (BK)',
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: 'usr-kepsek-daarulabror',
    name: 'Kepala MTs Daarul Abror',
    email: 'kepsek.daarulabror@radarsosial.id',
    password: 'kepsek123456',
    role: 'kepala_sekolah',
    schoolId: 'sch-mts-daarul-abror',
    schoolName: 'MTs Daarul Abror',
    phone: '(0717) 93456',
    title: 'Kepala Madrasah',
    status: 'active',
    createdAt: '2025-02-01',
  },

  // 4. SMP Negeri 1 Bakam
  {
    id: 'usr-bk-bakam',
    name: 'BK SMP Negeri 1 Bakam',
    email: 'bk.bakam@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-smpn1-bakam',
    schoolName: 'SMP Negeri 1 Bakam',
    assignedClassIds: ['cls-bakam-7a', 'cls-bakam-8a', 'cls-bakam-9a'],
    phone: '(0717) 94567',
    title: 'Guru Bimbingan dan Konseling (BK)',
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: 'usr-kepsek-bakam',
    name: 'Kepala SMP Negeri 1 Bakam',
    email: 'kepsek.bakam@radarsosial.id',
    password: 'kepsek123456',
    role: 'kepala_sekolah',
    schoolId: 'sch-smpn1-bakam',
    schoolName: 'SMP Negeri 1 Bakam',
    phone: '(0717) 94567',
    title: 'Kepala Sekolah',
    status: 'active',
    createdAt: '2025-02-01',
  },

  // 5. SMP Negeri 7 Pangkal Pinang
  {
    id: 'usr-bk-smp7pkp',
    name: 'BK SMP Negeri 7 Pangkal Pinang',
    email: 'bk.smp7pkp@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-smpn7-pangkalpinang',
    schoolName: 'SMP Negeri 7 Pangkal Pinang',
    assignedClassIds: ['cls-smp7-7a', 'cls-smp7-8a', 'cls-smp7-9a'],
    phone: '(0717) 42177',
    title: 'Guru Bimbingan dan Konseling (BK)',
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: 'usr-kepsek-smp7pkp',
    name: 'Kepala SMP Negeri 7 Pangkal Pinang',
    email: 'kepsek.smp7pkp@radarsosial.id',
    password: 'kepsek123456',
    role: 'kepala_sekolah',
    schoolId: 'sch-smpn7-pangkalpinang',
    schoolName: 'SMP Negeri 7 Pangkal Pinang',
    phone: '(0717) 42177',
    title: 'Kepala Sekolah',
    status: 'active',
    createdAt: '2025-02-01',
  },

  // 6. SMK N 5 Pangkalpinang
  {
    id: 'usr-bk-smk5pkp',
    name: 'BK SMK N 5 Pangkalpinang',
    email: 'bk.smk5pkp@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-smkn5-pangkalpinang',
    schoolName: 'SMK N 5 Pangkalpinang',
    assignedClassIds: ['cls-smk5-x', 'cls-smk5-xi', 'cls-smk5-xii'],
    phone: '(0717) 42555',
    title: 'Guru Bimbingan dan Konseling (BK)',
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: 'usr-kepsek-smk5pkp',
    name: 'Kepala SMK N 5 Pangkalpinang',
    email: 'kepsek.smk5pkp@radarsosial.id',
    password: 'kepsek123456',
    role: 'kepala_sekolah',
    schoolId: 'sch-smkn5-pangkalpinang',
    schoolName: 'SMK N 5 Pangkalpinang',
    phone: '(0717) 42555',
    title: 'Kepala Sekolah',
    status: 'active',
    createdAt: '2025-02-01',
  },

  // 7. IAIN Syaikh Abdurrahman Siddik (IAIN SAS)
  {
    id: 'usr-bk-iainsas',
    name: 'BK IAIN SAS',
    email: 'bk.iainsas@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-iain-sas',
    schoolName: 'IAIN Syaikh Abdurrahman Siddik (IAIN SAS)',
    assignedClassIds: ['cls-iain-pai', 'cls-iain-tbi', 'cls-iain-bkpi'],
    phone: '(0717) 91234',
    title: 'Unit Layanan Bimbingan & Konseling Mahasiswa (PAI / TBI / BKPI)',
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: 'usr-kepsek-iainsas',
    name: 'Pimpinan / Dekanat IAIN SAS',
    email: 'pimpinan.iainsas@radarsosial.id',
    password: 'kepsek123456',
    role: 'kepala_sekolah',
    schoolId: 'sch-iain-sas',
    schoolName: 'IAIN Syaikh Abdurrahman Siddik (IAIN SAS)',
    phone: '(0717) 91234',
    title: 'Pimpinan / Dekanat Perguruan Tinggi',
    status: 'active',
    createdAt: '2025-02-01',
  },

  // Contoh Akun Orang Tua
  {
    id: 'usr-parent-contoh',
    name: 'Orang Tua Siswa (Kelas 3B)',
    email: 'orangtua@radarsosial.id',
    password: 'bk123456',
    role: 'orang_tua',
    schoolId: 'sch-mtsn2-bangka',
    schoolName: 'MTs Negeri 2 Bangka',
    childId: 's-01',
    studentNis: '20260901',
    phone: '0812-3456-7890',
    status: 'active',
    createdAt: '2026-02-01',
  },
];

// ==========================================
// TEMPLATE KELAS: HANYA 3B MEMILIKI DATA SIMULASI BENCHMARK
// KELAS LAIN DIKOSONGKAN BERSIH AGAR SIAP INPUT DATA LAPANGAN
// ==========================================
interface RawStudentTemplate {
  name: string;
  gender: 'L' | 'P';
}

const CLASS_TEMPLATES: Record<
  string,
  { schoolId: string; className: string; code: string; students: RawStudentTemplate[] }
> = {
  // Hanya Kelas 3B MTsN 2 Bangka yang berisi fixture benchmark
  'cls-3b': {
    schoolId: 'sch-mtsn2-bangka',
    className: 'Kelas 3B',
    code: '3b',
    students: [], // Mengambil langsung dari seedData3B.json
  },
};

// ==========================================
// GENERATOR SISWA LENGKAP
// ==========================================
export function generateAllStudents(): Student[] {
  const result: Student[] = [];

  // 1. Muat data siswa Kelas 3B (29 siswa benchmark)
  if (seedData3B.students && seedData3B.students.length > 0) {
    seedData3B.students.forEach((s) => {
      result.push({
        id: s.id,
        nis: s.nis,
        nisn: `0091234${s.nis.slice(-3)}`,
        name: s.name,
        gender: s.gender as 'L' | 'P',
        classId: 'cls-3b',
        className: 'Kelas 3B',
        schoolId: 'sch-mtsn2-bangka',
      });
    });
  }

  return result;
}

// ==========================================
// GENERATOR SOSIOMETRI KONTEMPORER MORENO
// ==========================================
export function generateAllNominations(periodId: string = 'period-2026-s1'): SociometricNomination[] {
  const result: SociometricNomination[] = [];
  let nomCount = 1;

  // Hanya isi nominasi untuk Kelas 3B dari seedData3B.json
  if (seedData3B.nominations && seedData3B.nominations.length > 0) {
    seedData3B.nominations.forEach((nom) => {
      result.push({
        ...nom,
        id: `nom-${periodId}-cls-3b-${nomCount++}`,
        periodId,
        classId: 'cls-3b',
      } as SociometricNomination);
    });
  }

  return result;
}

// ==========================================
// GENERATOR RATING PERILAKU SEBAYA (BEHAVIORS)
// ==========================================
export function generateAllBehavioralRatings(periodId: string = 'period-2026-s1'): PeerBehavioralRating[] {
  const allStudents = generateAllStudents();
  const result: PeerBehavioralRating[] = [];
  let bCount = 1;

  // Nilai baseline untuk 29 siswa Kelas 3B
  const students3B = allStudents.filter((s) => s.classId === 'cls-3b');
  students3B.forEach((student) => {
    result.push({
      id: `pbr-${periodId}-cls-3b-${bCount++}`,
      periodId,
      classId: 'cls-3b',
      studentId: student.id,
      prosocial: 5,
      aggressive: 2,
      withdrawn: 2,
      victimization: 1,
      hyperactive: 2,
    });
  });

  return result;
}
