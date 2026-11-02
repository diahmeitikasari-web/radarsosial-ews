import {
  Student,
  SchoolClass,
  School,
  User,
  SociometricNomination,
  PeerBehavioralRating,
} from '../types';

// ==========================================
// DAFTAR SEKOLAH (MULTI-TENANT)
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
    principalName: 'Drs. H. Ahmad Fauzi, M.Ag.',
    counselorName: 'Liengga Brian Darea, S.Sos.,Gr',
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
    id: 'sch-smpn1-mendobarat',
    name: 'SMP Negeri 1 Mendo Barat',
    npsn: '10902345',
    address: 'Jl. Raya Petaling No. 08, Mendo Barat, Bangka Belitung',
    city: 'Kabupaten Bangka',
    type: 'SMP',
    totalClasses: 12,
    principalName: 'Drs. Hermansyah, M.Pd.',
    counselorName: 'Rahmat Hidayat, S.Pd., Kons.',
    phone: '(0717) 94210',
    status: 'aktif',
    theme: {
      preset: 'forest_mint',
      primaryColor: '#064e3b',
      secondaryColor: '#065f46',
      accentColor: '#34d399',
      accentLight: '#6ee7b7',
      schoolBadge: 'Maju Bersama, Berakhlak Mulia',
    },
  },
  {
    id: 'sch-smpn1-sungailiat',
    name: 'SMP Negeri 1 Sungailiat',
    npsn: '10905678',
    address: 'Jl. Jenderal Sudirman No. 12, Sungailiat',
    city: 'Kabupaten Bangka',
    type: 'SMP',
    totalClasses: 15,
    principalName: 'H. Hendra, M.Pd.',
    counselorName: 'Rina Marlina, S.Pd.',
    phone: '(0717) 91122',
    status: 'aktif',
    theme: {
      preset: 'royal_sapphire',
      primaryColor: '#0f2b5c',
      secondaryColor: '#1a3f7a',
      accentColor: '#38bdf8',
      accentLight: '#7dd3fc',
      schoolBadge: 'Sekolah Penggerak Berprestasi',
    },
  },
];

// ==========================================
// DAFTAR KELAS PENUH (7A, 7B, 8A, 8B, 9A, 9B)
// ==========================================
export const ALL_CLASSES: SchoolClass[] = [
  // --- MTs Negeri 2 Bangka ---
  {
    id: 'cls-7a',
    schoolId: 'sch-mtsn2-bangka',
    name: 'Kelas 7A',
    grade: '7',
    academicYear: '2026/2027',
    homeroomTeacher: 'Dra. Endang Purwanti',
    counselorId: 'usr-guru-bk',
    counselorName: 'Liengga Brian Darea, S.Sos.,Gr',
    targetStudentCount: 20,
    description: 'Rombel Kelas 7A - Tahun Pertama Fase D',
  },
  {
    id: 'cls-7b',
    schoolId: 'sch-mtsn2-bangka',
    name: 'Kelas 7B',
    grade: '7',
    academicYear: '2026/2027',
    homeroomTeacher: 'Agus Setiawan, S.Pd.',
    counselorId: 'usr-guru-bk',
    counselorName: 'Liengga Brian Darea, S.Sos.,Gr',
    targetStudentCount: 20,
    description: 'Rombel Kelas 7B - Tahun Pertama Fase D',
  },
  {
    id: 'cls-8a',
    schoolId: 'sch-mtsn2-bangka',
    name: 'Kelas 8A',
    grade: '8',
    academicYear: '2026/2027',
    homeroomTeacher: 'Budi Santoso, S.Pd.',
    counselorId: 'usr-guru-bk',
    counselorName: 'Liengga Brian Darea, S.Sos.,Gr',
    targetStudentCount: 20,
    description: 'Rombel Prioritas Utama Bimbingan Konseling',
  },
  {
    id: 'cls-8b',
    schoolId: 'sch-mtsn2-bangka',
    name: 'Kelas 8B',
    grade: '8',
    academicYear: '2026/2027',
    homeroomTeacher: 'Nurul Hidayati, M.Pd.',
    counselorId: 'usr-guru-bk',
    counselorName: 'Liengga Brian Darea, S.Sos.,Gr',
    targetStudentCount: 20,
    description: 'Rombel Kelas 8B - Pengembangan Karakter Sebaya',
  },
  {
    id: 'cls-9a',
    schoolId: 'sch-mtsn2-bangka',
    name: 'Kelas 9A',
    grade: '9',
    academicYear: '2026/2027',
    homeroomTeacher: 'Drs. Ahmad Mansur',
    counselorId: 'usr-guru-bk',
    counselorName: 'Liengga Brian Darea, S.Sos.,Gr',
    targetStudentCount: 20,
    description: 'Rombel Kelas 9A - Persiapan Kelulusan & Karir',
  },
  {
    id: 'cls-9b',
    schoolId: 'sch-mtsn2-bangka',
    name: 'Kelas 9B',
    grade: '9',
    academicYear: '2026/2027',
    homeroomTeacher: 'Sri Wahyuni, S.Pd.',
    counselorId: 'usr-guru-bk',
    counselorName: 'Liengga Brian Darea, S.Sos.,Gr',
    targetStudentCount: 20,
    description: 'Rombel Kelas 9B - Penguatan Relasi Akhir Fase',
  },
  {
    id: 'cls-3b',
    schoolId: 'sch-mtsn2-bangka',
    name: 'Kelas 3B',
    grade: '9',
    academicYear: '2026/2027',
    homeroomTeacher: 'Sri Wahyuni, S.Pd.',
    counselorId: 'usr-guru-bk',
    counselorName: 'Liengga Brian Darea, S.Sos.,Gr',
    targetStudentCount: 20,
    description: 'Rombel Kelas 3B (IX-B) - MTs Negeri 2 Bangka',
  },

  // --- SMP Negeri 1 Mendo Barat ---
  {
    id: 'cls-mb-7a',
    schoolId: 'sch-smpn1-mendobarat',
    name: 'Kelas 7A',
    grade: '7',
    academicYear: '2026/2027',
    homeroomTeacher: 'Zainal Abidin, S.Pd.',
    counselorId: 'usr-guru-bk-mendobarat',
    counselorName: 'Rahmat Hidayat, S.Pd., Kons.',
    targetStudentCount: 20,
    description: 'Rombel Kelas 7A SMPN 1 Mendo Barat',
  },
  {
    id: 'cls-mb-7b',
    schoolId: 'sch-smpn1-mendobarat',
    name: 'Kelas 7B',
    grade: '7',
    academicYear: '2026/2027',
    homeroomTeacher: 'Dewi Kartika, S.Pd.',
    counselorId: 'usr-guru-bk-mendobarat',
    counselorName: 'Rahmat Hidayat, S.Pd., Kons.',
    targetStudentCount: 20,
    description: 'Rombel Kelas 7B SMPN 1 Mendo Barat',
  },
  {
    id: 'cls-mb-8a',
    schoolId: 'sch-smpn1-mendobarat',
    name: 'Kelas 8A',
    grade: '8',
    academicYear: '2026/2027',
    homeroomTeacher: 'Ridwan Syafei, M.Pd.',
    counselorId: 'usr-guru-bk-mendobarat',
    counselorName: 'Rahmat Hidayat, S.Pd., Kons.',
    targetStudentCount: 20,
    description: 'Rombel Kelas 8A SMPN 1 Mendo Barat',
  },
  {
    id: 'cls-mb-8b',
    schoolId: 'sch-smpn1-mendobarat',
    name: 'Kelas 8B',
    grade: '8',
    academicYear: '2026/2027',
    homeroomTeacher: 'Maryana, S.Pd.',
    counselorId: 'usr-guru-bk-mendobarat',
    counselorName: 'Rahmat Hidayat, S.Pd., Kons.',
    targetStudentCount: 20,
    description: 'Rombel Kelas 8B SMPN 1 Mendo Barat',
  },
  {
    id: 'cls-mb-9a',
    schoolId: 'sch-smpn1-mendobarat',
    name: 'Kelas 9A',
    grade: '9',
    academicYear: '2026/2027',
    homeroomTeacher: 'Joko Susilo, S.Pd.',
    counselorId: 'usr-guru-bk-mendobarat',
    counselorName: 'Rahmat Hidayat, S.Pd., Kons.',
    targetStudentCount: 20,
    description: 'Rombel Kelas 9A SMPN 1 Mendo Barat',
  },
  {
    id: 'cls-mb-9b',
    schoolId: 'sch-smpn1-mendobarat',
    name: 'Kelas 9B',
    grade: '9',
    academicYear: '2026/2027',
    homeroomTeacher: 'Farida Ariyani, S.Pd.',
    counselorId: 'usr-guru-bk-mendobarat',
    counselorName: 'Rahmat Hidayat, S.Pd., Kons.',
    targetStudentCount: 20,
    description: 'Rombel Kelas 9B SMPN 1 Mendo Barat',
  },

  // --- SMP Negeri 1 Sungailiat ---
  {
    id: 'cls-smp1-8a',
    schoolId: 'sch-smpn1-sungailiat',
    name: 'Kelas VIII-A',
    grade: '8',
    academicYear: '2026/2027',
    homeroomTeacher: 'Dra. Hj. Rusmiati',
    counselorId: 'usr-guru-bk-sungailiat',
    counselorName: 'Rina Marlina, S.Pd.',
    targetStudentCount: 20,
    description: 'Rombel Model Binaan Dinas Pendidikan',
  },
];

// ==========================================
// DAFTAR PENGGUNA MULTI-TENANT
// ==========================================
export const ALL_USERS: User[] = [
  // Super Admin
  {
    id: 'usr-admin',
    name: 'Dr. Diah Meitikasari, M.Psi.',
    email: 'admin@radarsosial.id',
    password: 'admin123456',
    role: 'admin',
    schoolId: 'sch-mtsn2-bangka',
    schoolName: 'Psychosophia Behavioral Lab',
    title: 'Super-Administrator Sistem & Peneliti Utama',
    status: 'active',
    createdAt: '2024-12-01',
  },

  // MTs Negeri 2 Bangka
  {
    id: 'usr-guru-bk',
    name: 'Liengga Brian Darea, S.Sos.,Gr',
    email: 'gurubk@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-mtsn2-bangka',
    schoolName: 'MTs Negeri 2 Bangka',
    assignedClassIds: ['cls-7a', 'cls-7b', 'cls-8a', 'cls-8b', 'cls-9a', 'cls-9b'],
    nip: '19890415 201503 1 002',
    phone: '0812-7890-1234',
    title: 'Guru Bimbingan dan Konseling (Koordinator BK)',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'usr-guru-bk-2',
    name: 'Dra. Siti Rahmawati, M.Pd.Kons',
    email: 'siti.bk@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-mtsn2-bangka',
    schoolName: 'MTs Negeri 2 Bangka',
    assignedClassIds: ['cls-7a', 'cls-7b'],
    nip: '19780210 200501 2 004',
    phone: '0813-8822-1199',
    title: 'Guru BK Tingkat 7',
    status: 'active',
    createdAt: '2025-01-10',
  },
  {
    id: 'usr-guru-bk-3',
    name: 'Ahmad Zaki, S.Pd.I, Gr',
    email: 'zaki.bk@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-mtsn2-bangka',
    schoolName: 'MTs Negeri 2 Bangka',
    assignedClassIds: ['cls-9a', 'cls-9b'],
    nip: '19920314 201902 1 003',
    phone: '0852-7711-4433',
    title: 'Guru BK Tingkat 9',
    status: 'active',
    createdAt: '2025-01-15',
  },
  {
    id: 'usr-kepsek',
    name: 'Drs. H. Ahmad Fauzi, M.Ag.',
    email: 'kepsek@radarsosial.id',
    password: 'kepsek123456',
    role: 'kepala_sekolah',
    schoolId: 'sch-mtsn2-bangka',
    schoolName: 'MTs Negeri 2 Bangka',
    nip: '19740512 199903 1 002',
    phone: '0813-6712-4455',
    title: 'Kepala Sekolah / Madrasah',
    status: 'active',
    createdAt: '2025-01-05',
  },

  // SMP Negeri 1 Mendo Barat (New Tenant Requested by User!)
  {
    id: 'usr-guru-bk-mendobarat',
    name: 'Rahmat Hidayat, S.Pd., Kons.',
    email: 'gurubk-1@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-smpn1-mendobarat',
    schoolName: 'SMP Negeri 1 Mendo Barat',
    assignedClassIds: ['cls-mb-7a', 'cls-mb-7b', 'cls-mb-8a', 'cls-mb-8b', 'cls-mb-9a', 'cls-mb-9b'],
    nip: '19870512 201402 1 003',
    phone: '0813-7766-5544',
    title: 'Guru Bimbingan dan Konseling (Koordinator BK)',
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: 'usr-kepsek-mendobarat',
    name: 'Drs. Hermansyah, M.Pd.',
    email: 'kepsek.mendobarat@radarsosial.id',
    password: 'kepsek123456',
    role: 'kepala_sekolah',
    schoolId: 'sch-smpn1-mendobarat',
    schoolName: 'SMP Negeri 1 Mendo Barat',
    nip: '19720814 199803 1 004',
    phone: '0812-7123-8899',
    title: 'Kepala Sekolah SMP Negeri 1 Mendo Barat',
    status: 'active',
    createdAt: '2025-02-01',
  },

  // SMP Negeri 1 Sungailiat
  {
    id: 'usr-guru-bk-sungailiat',
    name: 'Rina Marlina, S.Pd.',
    email: 'bk.sungailiat@radarsosial.id',
    password: 'bk123456',
    role: 'guru_bk',
    schoolId: 'sch-smpn1-sungailiat',
    schoolName: 'SMP Negeri 1 Sungailiat',
    assignedClassIds: ['cls-smp1-8a'],
    nip: '19830412 200801 2 003',
    phone: '0821-8899-7711',
    title: 'Guru Bimbingan dan Konseling (BK)',
    status: 'active',
    createdAt: '2025-02-01',
  },
  {
    id: 'usr-kepsek-sungailiat',
    name: 'H. Hendra, M.Pd.',
    email: 'kepsek.sungailiat@radarsosial.id',
    password: 'kepsek123456',
    role: 'kepala_sekolah',
    schoolId: 'sch-smpn1-sungailiat',
    schoolName: 'SMP Negeri 1 Sungailiat',
    nip: '19710315 199602 1 001',
    title: 'Kepala Sekolah',
    status: 'active',
    createdAt: '2025-02-01',
  },

  // Orang Tua Siswa (Contoh)
  {
    id: 'usr-parent-budi',
    name: 'H. Supriyanto (Orang Tua Budi Pratama)',
    email: 'wali.budi@gmail.com',
    password: 'bk123456',
    role: 'orang_tua',
    schoolId: 'sch-mtsn2-bangka',
    schoolName: 'MTs Negeri 2 Bangka',
    childId: 's-02',
    studentNis: '20260802',
    phone: '0812-9988-7766',
    status: 'active',
    createdAt: '2026-02-01',
  },
];

// ==========================================
// DATA SISWA UNTUK SETIAP KELAS (20 SISWA/KELAS)
// ==========================================

interface RawStudentTemplate {
  name: string;
  gender: 'L' | 'P';
}

const CLASS_TEMPLATES: Record<string, { schoolId: string; className: string; code: string; students: RawStudentTemplate[] }> = {
  // --- MTs NEGERI 2 BANGKA (Data Madrasah) ---
  'cls-7a': {
    schoolId: 'sch-mtsn2-bangka',
    className: 'Kelas 7A',
    code: '7a',
    students: [
      { name: 'Muhammad Azka Al-Fatih (MTsN)', gender: 'L' },
      { name: 'Aisyah Zahra Salsabila (MTsN)', gender: 'P' },
      { name: 'Ahmad Fauzi Al-Ghazali (MTsN)', gender: 'L' },
      { name: 'Fathimah Nurul Hidayah (MTsN)', gender: 'P' },
      { name: 'Hafidz Al-Ayubi (MTsN)', gender: 'L' },
      { name: 'Khairunnisa Syarifah (MTsN)', gender: 'P' },
      { name: 'M. Zaky Al-Farabi (MTsN)', gender: 'L' },
      { name: 'Nabila Syifa Azzahra (MTsN)', gender: 'P' },
      { name: 'Rayyan Al-Ghifari (MTsN)', gender: 'L' },
      { name: 'Salma Muthmainnah (MTsN)', gender: 'P' },
      { name: 'Thariq Ziyad Al-Kautsar (MTsN)', gender: 'L' },
      { name: 'Ulya Wardatul Jannah (MTsN)', gender: 'P' },
      { name: 'Yahya Ayash (MTsN)', gender: 'L' },
      { name: 'Zaskia Adelia Rahmah (MTsN)', gender: 'P' },
      { name: 'Bilal Ramadhan (MTsN)', gender: 'L' },
      { name: 'Citra Aulia Khadijah (MTsN)', gender: 'P' },
      { name: 'Dzaky Al-Hafidz (MTsN)', gender: 'L' },
      { name: 'Fairuz Syahla (MTsN)', gender: 'P' },
      { name: 'Gibran Al-Farisi (MTsN)', gender: 'L' },
      { name: 'Husna Kamilah (MTsN)', gender: 'P' },
    ],
  },
  'cls-7b': {
    schoolId: 'sch-mtsn2-bangka',
    className: 'Kelas 7B',
    code: '7b',
    students: [
      { name: 'Abdullah Faqih Al-Banna (MTsN)', gender: 'L' },
      { name: 'Anindya Khansa Marwah (MTsN)', gender: 'P' },
      { name: 'Bilal Al-Habasyi (MTsN)', gender: 'L' },
      { name: 'Dhiya Ul-Haq Al-Munawwar (MTsN)', gender: 'L' },
      { name: 'Eni Rahmawati Syarifah (MTsN)', gender: 'P' },
      { name: 'Fauzan Mubarak (MTsN)', gender: 'L' },
      { name: 'Ghina Salsabila Robbani (MTsN)', gender: 'P' },
      { name: 'Habibie Al-Rasyid (MTsN)', gender: 'L' },
      { name: 'Izzatun Nisa Al-Hasanah (MTsN)', gender: 'P' },
      { name: 'Jafar Shodiq (MTsN)', gender: 'L' },
      { name: 'Kaila Putri Firdaus (MTsN)', gender: 'P' },
      { name: 'Luqman Hakim Al-Haddad (MTsN)', gender: 'L' },
      { name: 'Maryam Thohirah (MTsN)', gender: 'P' },
      { name: 'Nizam Syahputra Al-Qudsi (MTsN)', gender: 'L' },
      { name: 'Okta Viana Mawaddah (MTsN)', gender: 'P' },
      { name: 'Prima Putra Al-Anshari (MTsN)', gender: 'L' },
      { name: 'Queen Azzahra Fitri (MTsN)', gender: 'P' },
      { name: 'Rendy Pangestu Al-Islami (MTsN)', gender: 'L' },
      { name: 'Syifa Aulia Rahmah (MTsN)', gender: 'P' },
      { name: 'Tristan Al-Baqi (MTsN)', gender: 'L' },
    ],
  },
  'cls-8a': {
    schoolId: 'sch-mtsn2-bangka',
    className: 'Kelas 8A',
    code: '8a',
    students: [
      { name: 'Alya Rahma Azzahra (MTsN)', gender: 'P' },
      { name: 'Budi Pratama Al-Anshori (MTsN)', gender: 'L' },
      { name: 'Citra Dewi Khadijah (MTsN)', gender: 'P' },
      { name: 'Dimas Aditya Al-Farisi (MTsN)', gender: 'L' },
      { name: 'Erna Mawaddah (MTsN)', gender: 'P' },
      { name: 'Fajar Hidayatullah (MTsN)', gender: 'L' },
      { name: 'Gita Permata Syakira (MTsN)', gender: 'P' },
      { name: 'Hadi Setiawan Al-Amin (MTsN)', gender: 'L' },
      { name: 'Intan Nurhaliza Robbani (MTsN)', gender: 'P' },
      { name: 'Joko Prabowo Al-Fatih (MTsN)', gender: 'L' },
      { name: 'Kania Putri Utami (MTsN)', gender: 'P' },
      { name: 'Lukman Ardiansyah Al-Hafidz (MTsN)', gender: 'L' },
      { name: 'Maya Anggraini Syarifah (MTsN)', gender: 'P' },
      { name: 'Naufal Alamsyah (MTsN)', gender: 'L' },
      { name: 'Olivia Putri Maharani (MTsN)', gender: 'P' },
      { name: 'Pandu Prasetyo Al-Ghazali (MTsN)', gender: 'L' },
      { name: 'Qori Amalia Sholihat (MTsN)', gender: 'P' },
      { name: 'Rian Firmansyah (MTsN)', gender: 'L' },
      { name: 'Siti Sarah Salsabila (MTsN)', gender: 'P' },
      { name: 'Tegar Saputra Al-Baqir (MTsN)', gender: 'L' },
    ],
  },
  'cls-8b': {
    schoolId: 'sch-mtsn2-bangka',
    className: 'Kelas 8B',
    code: '8b',
    students: [
      { name: 'Arya Wibowo Al-Kautsar (MTsN)', gender: 'L' },
      { name: 'Bayu Segara Firdaus (MTsN)', gender: 'L' },
      { name: 'Clara Anastasya Syifa (MTsN)', gender: 'P' },
      { name: 'Denis Satria Nugroho (MTsN)', gender: 'L' },
      { name: 'Eka Lestari Mawaddah (MTsN)', gender: 'P' },
      { name: 'Fauzan Kamil Al-Madani (MTsN)', gender: 'L' },
      { name: 'Gracia Paramita Nur (MTsN)', gender: 'P' },
      { name: 'Haikal Firdaus (MTsN)', gender: 'L' },
      { name: 'Irma Suryani Syarifah (MTsN)', gender: 'P' },
      { name: 'Johan Arifin (MTsN)', gender: 'L' },
      { name: 'Keysha Azzahra Robbani (MTsN)', gender: 'P' },
      { name: 'Lutfi Hakim Al-Qarni (MTsN)', gender: 'L' },
      { name: 'Melani Sukma Khadijah (MTsN)', gender: 'P' },
      { name: 'Nando Tri Saputra (MTsN)', gender: 'L' },
      { name: 'Nadya Safira Ramadhani (MTsN)', gender: 'P' },
      { name: 'Panji Asmoro (MTsN)', gender: 'L' },
      { name: 'Raisa Andriana Putri (MTsN)', gender: 'P' },
      { name: 'Satria Dewa Al-Faqih (MTsN)', gender: 'L' },
      { name: 'Tiara Andini Salsabila (MTsN)', gender: 'P' },
      { name: 'Umar Bakri Al-Khattab (MTsN)', gender: 'L' },
    ],
  },
  'cls-9a': {
    schoolId: 'sch-mtsn2-bangka',
    className: 'Kelas 9A',
    code: '9a',
    students: [
      { name: 'Aldi Taher Al-Farisi (MTsN)', gender: 'L' },
      { name: 'Bagus Sanjaya Al-Amin (MTsN)', gender: 'L' },
      { name: 'Chelsea Olivia Salsabila (MTsN)', gender: 'P' },
      { name: 'Dion Wiyoko Al-Baqir (MTsN)', gender: 'L' },
      { name: 'Endah Pujiastuti Khadijah (MTsN)', gender: 'P' },
      { name: 'Fadhil Muhammad Robbani (MTsN)', gender: 'L' },
      { name: 'Ghina Raudhah Al-Hasanah (MTsN)', gender: 'P' },
      { name: 'Harun Al-Rasyid (MTsN)', gender: 'L' },
      { name: 'Isyana Sarasvati Syarifah (MTsN)', gender: 'P' },
      { name: 'Julian Al-Farisi (MTsN)', gender: 'L' },
      { name: 'Keisha Aurelia Azzahra (MTsN)', gender: 'P' },
      { name: 'Lucky Perdana Al-Hafidz (MTsN)', gender: 'L' },
      { name: 'Maudy Ayunda Mawaddah (MTsN)', gender: 'P' },
      { name: 'Noval Rahmatullah (MTsN)', gender: 'L' },
      { name: 'Olla Ramlania Syifa (MTsN)', gender: 'P' },
      { name: 'Pasha Ungu Al-Ghazali (MTsN)', gender: 'L' },
      { name: 'Queen Latifah Robbani (MTsN)', gender: 'P' },
      { name: 'Ridho Rhoma Al-Banna (MTsN)', gender: 'L' },
      { name: 'Siti Badriah Salsabila (MTsN)', gender: 'P' },
      { name: 'Taufik Hidayatullah (MTsN)', gender: 'L' },
    ],
  },
  'cls-9b': {
    schoolId: 'sch-mtsn2-bangka',
    className: 'Kelas 9B',
    code: '9b',
    students: [
      { name: 'Ahmad Syauqi Al-Haddad (MTsN)', gender: 'L' },
      { name: 'Bintang Ramadhan (MTsN)', gender: 'L' },
      { name: 'Chusnul Khotimah (MTsN)', gender: 'P' },
      { name: 'Daniyal Al-Qudsi (MTsN)', gender: 'L' },
      { name: 'Eva Nur Fauziah (MTsN)', gender: 'P' },
      { name: 'Faris Abqari (MTsN)', gender: 'L' },
      { name: 'Ghaida Shofiyyah (MTsN)', gender: 'P' },
      { name: 'Hamzah Asadullah (MTsN)', gender: 'L' },
      { name: 'Ibtisam Nurul Ain (MTsN)', gender: 'P' },
      { name: 'Ja\'far Shiddiq (MTsN)', gender: 'L' },
      { name: 'Kamilah Wardah (MTsN)', gender: 'P' },
      { name: 'Luqmanul Hakim (MTsN)', gender: 'L' },
      { name: 'Maisarah Azzahra (MTsN)', gender: 'P' },
      { name: 'Nabil Fathurrahman (MTsN)', gender: 'L' },
      { name: 'Oki Setiana Dewi (MTsN)', gender: 'P' },
      { name: 'Panji Al-Ghazali (MTsN)', gender: 'L' },
      { name: 'Qonitah Amira (MTsN)', gender: 'P' },
      { name: 'Rifqi Al-Musyaffa (MTsN)', gender: 'L' },
      { name: 'Salimah Robbani (MTsN)', gender: 'P' },
      { name: 'Thoriq Al-Ziyad (MTsN)', gender: 'L' },
    ],
  },
  'cls-3b': {
    schoolId: 'sch-mtsn2-bangka',
    className: 'Kelas 3B',
    code: '3b',
    students: [
      { name: 'Ahmad Syauqi Al-Haddad (MTsN)', gender: 'L' },
      { name: 'Bintang Ramadhan (MTsN)', gender: 'L' },
      { name: 'Chusnul Khotimah (MTsN)', gender: 'P' },
      { name: 'Daniyal Al-Qudsi (MTsN)', gender: 'L' },
      { name: 'Eva Nur Fauziah (MTsN)', gender: 'P' },
      { name: 'Faris Abqari (MTsN)', gender: 'L' },
      { name: 'Ghaida Shofiyyah (MTsN)', gender: 'P' },
      { name: 'Hamzah Asadullah (MTsN)', gender: 'L' },
      { name: 'Ibtisam Nurul Ain (MTsN)', gender: 'P' },
      { name: 'Ja\'far Shiddiq (MTsN)', gender: 'L' },
      { name: 'Kamilah Wardah (MTsN)', gender: 'P' },
      { name: 'Luqmanul Hakim (MTsN)', gender: 'L' },
      { name: 'Maisarah Azzahra (MTsN)', gender: 'P' },
      { name: 'Nabil Fathurrahman (MTsN)', gender: 'L' },
      { name: 'Oki Setiana Dewi (MTsN)', gender: 'P' },
      { name: 'Panji Al-Ghazali (MTsN)', gender: 'L' },
      { name: 'Qonitah Amira (MTsN)', gender: 'P' },
      { name: 'Rifqi Al-Musyaffa (MTsN)', gender: 'L' },
      { name: 'Salimah Robbani (MTsN)', gender: 'P' },
      { name: 'Thoriq Al-Ziyad (MTsN)', gender: 'L' },
    ],
  },

  // --- SMP NEGERI 1 MENDO BARAT (Data SMP Negeri) ---
  'cls-mb-7a': {
    schoolId: 'sch-smpn1-mendobarat',
    className: 'Kelas 7A',
    code: 'mb7a',
    students: [
      { name: 'Bagas Raditya (SMPN)', gender: 'L' },
      { name: 'Dwi Anggraini (SMPN)', gender: 'P' },
      { name: 'Rian Pratama Petaling (SMPN)', gender: 'L' },
      { name: 'Desi Ratnasari (SMPN)', gender: 'P' },
      { name: 'Bayu Setiawan (SMPN)', gender: 'L' },
      { name: 'Fitri Handayani (SMPN)', gender: 'P' },
      { name: 'Danu Wijaya (SMPN)', gender: 'L' },
      { name: 'Maya Sari Utami (SMPN)', gender: 'P' },
      { name: 'Ilham Saputra (SMPN)', gender: 'L' },
      { name: 'Cindy Claudia (SMPN)', gender: 'P' },
      { name: 'Yoga Prasetya (SMPN)', gender: 'L' },
      { name: 'Lestari Widyaningsih (SMPN)', gender: 'P' },
      { name: 'Hendra Kurniawan (SMPN)', gender: 'L' },
      { name: 'Febrianti Anggraini (SMPN)', gender: 'P' },
      { name: 'Wahyu Hidayat (SMPN)', gender: 'L' },
      { name: 'Novita Sari (SMPN)', gender: 'P' },
      { name: 'Danang Kusuma (SMPN)', gender: 'L' },
      { name: 'Ria Anggraini (SMPN)', gender: 'P' },
      { name: 'Agus Setiawan (SMPN)', gender: 'L' },
      { name: 'Tiara Puspita (SMPN)', gender: 'P' },
    ],
  },
  'cls-mb-7b': {
    schoolId: 'sch-smpn1-mendobarat',
    className: 'Kelas 7B',
    code: 'mb7b',
    students: [
      { name: 'Aditya Tri Wahyudi (SMPN)', gender: 'L' },
      { name: 'Bella Safira Petaling (SMPN)', gender: 'P' },
      { name: 'Candra Kusuma (SMPN)', gender: 'L' },
      { name: 'Dina Mariana (SMPN)', gender: 'P' },
      { name: 'Eko Wahyudi (SMPN)', gender: 'L' },
      { name: 'Gita Gutawa (SMPN)', gender: 'P' },
      { name: 'Gilang Ramadhan (SMPN)', gender: 'L' },
      { name: 'Hesti Purwadinata (SMPN)', gender: 'P' },
      { name: 'Indra Lesmana (SMPN)', gender: 'L' },
      { name: 'Jessica Veranda (SMPN)', gender: 'P' },
      { name: 'Kevin Sanjaya (SMPN)', gender: 'L' },
      { name: 'Luna Maya Petaling (SMPN)', gender: 'P' },
      { name: 'Marcelino Ferdinan (SMPN)', gender: 'L' },
      { name: 'Nadia Vega (SMPN)', gender: 'P' },
      { name: 'Oscar Lawalata (SMPN)', gender: 'L' },
      { name: 'Pamela Bowie (SMPN)', gender: 'P' },
      { name: 'Rendy Juliansyah (SMPN)', gender: 'L' },
      { name: 'Siska Kohl (SMPN)', gender: 'P' },
      { name: 'Tomi Pratama (SMPN)', gender: 'L' },
      { name: 'Vania Larissa (SMPN)', gender: 'P' },
    ],
  },
  'cls-mb-8a': {
    schoolId: 'sch-smpn1-mendobarat',
    className: 'Kelas 8A',
    code: 'mb8a',
    students: [
      { name: 'Bagas Raditya Putra (SMPN)', gender: 'L' },
      { name: 'Budi Santoso (SMPN)', gender: 'L' },
      { name: 'Cintia Permatasari (SMPN)', gender: 'P' },
      { name: 'Doni Firmansyah (SMPN)', gender: 'L' },
      { name: 'Endah Sulistiawati (SMPN)', gender: 'P' },
      { name: 'Fajar Sidik Petaling (SMPN)', gender: 'L' },
      { name: 'Galih Wicaksono (SMPN)', gender: 'L' },
      { name: 'Hesti Wulandari (SMPN)', gender: 'P' },
      { name: 'Ilham Fahrezi (SMPN)', gender: 'L' },
      { name: 'Joko Supriyanto (SMPN)', gender: 'L' },
      { name: 'Kartika Dewi (SMPN)', gender: 'P' },
      { name: 'Lukman Hakim (SMPN)', gender: 'L' },
      { name: 'Megawati Sukma (SMPN)', gender: 'P' },
      { name: 'Nanda Pratama (SMPN)', gender: 'L' },
      { name: 'Okta Viansyah (SMPN)', gender: 'L' },
      { name: 'Putri Ayu Lestari (SMPN)', gender: 'P' },
      { name: 'Qori Nur Anggraini (SMPN)', gender: 'P' },
      { name: 'Ridho Pratama (SMPN)', gender: 'L' },
      { name: 'Salsabila Putri (SMPN)', gender: 'P' },
      { name: 'Tri Wahyono (SMPN)', gender: 'L' },
    ],
  },
  'cls-mb-8b': {
    schoolId: 'sch-smpn1-mendobarat',
    className: 'Kelas 8B',
    code: 'mb8b',
    students: [
      { name: 'Aris Munandar (SMPN)', gender: 'L' },
      { name: 'Bunga Citra Petaling (SMPN)', gender: 'P' },
      { name: 'Coki Pardede (SMPN)', gender: 'L' },
      { name: 'Dewi Persik (SMPN)', gender: 'P' },
      { name: 'Erick Thohir (SMPN)', gender: 'L' },
      { name: 'Febby Rastanty (SMPN)', gender: 'P' },
      { name: 'Gading Marten (SMPN)', gender: 'L' },
      { name: 'Happy Salma (SMPN)', gender: 'P' },
      { name: 'Irfan Hakim (SMPN)', gender: 'L' },
      { name: 'Juwita Bahar (SMPN)', gender: 'P' },
      { name: 'Kiki Amalia (SMPN)', gender: 'P' },
      { name: 'Lucky Hakim (SMPN)', gender: 'L' },
      { name: 'Marshanda (SMPN)', gender: 'P' },
      { name: 'Nabilah Ratna (SMPN)', gender: 'P' },
      { name: 'Onky Alexander (SMPN)', gender: 'L' },
      { name: 'Poppy Sovia (SMPN)', gender: 'P' },
      { name: 'Raditya Dika Petaling (SMPN)', gender: 'L' },
      { name: 'Shandy Aulia (SMPN)', gender: 'P' },
      { name: 'Tukul Arwana (SMPN)', gender: 'L' },
      { name: 'Wendy Cagur (SMPN)', gender: 'L' },
    ],
  },
  'cls-mb-9a': {
    schoolId: 'sch-smpn1-mendobarat',
    className: 'Kelas 9A',
    code: 'mb9a',
    students: [
      { name: 'Andra Ramadhan (SMPN)', gender: 'L' },
      { name: 'Bams Samsons (SMPN)', gender: 'L' },
      { name: 'Cita Citata (SMPN)', gender: 'P' },
      { name: 'Duta Modesto (SMPN)', gender: 'L' },
      { name: 'Evi Masamba (SMPN)', gender: 'P' },
      { name: 'Glenn Fredly Petaling (SMPN)', gender: 'L' },
      { name: 'Happy Asmara (SMPN)', gender: 'P' },
      { name: 'Ian Kasela (SMPN)', gender: 'L' },
      { name: 'Iis Dahlia (SMPN)', gender: 'P' },
      { name: 'Judika Nalom (SMPN)', gender: 'L' },
      { name: 'Kezia Karamoy (SMPN)', gender: 'P' },
      { name: 'Morgan Oey (SMPN)', gender: 'L' },
      { name: 'Nana Mirdad (SMPN)', gender: 'P' },
      { name: 'Nicky Tirta (SMPN)', gender: 'L' },
      { name: 'Olivia Jensen Petaling (SMPN)', gender: 'P' },
      { name: 'Pasha Ungu (SMPN)', gender: 'L' },
      { name: 'Queen Abigail (SMPN)', gender: 'P' },
      { name: 'Reza Rahadian (SMPN)', gender: 'L' },
      { name: 'Shandy Aulia (SMPN)', gender: 'P' },
      { name: 'Vino Bastian Petaling (SMPN)', gender: 'L' },
    ],
  },
  'cls-mb-9b': {
    schoolId: 'sch-smpn1-mendobarat',
    className: 'Kelas 9B',
    code: 'mb9b',
    students: [
      { name: 'Ari Wibowo (SMPN)', gender: 'L' },
      { name: 'Berliana Febrianti (SMPN)', gender: 'P' },
      { name: 'Choky Sitohang (SMPN)', gender: 'L' },
      { name: 'Dian Sastrowardoyo (SMPN)', gender: 'P' },
      { name: 'Evan Sanders Petaling (SMPN)', gender: 'L' },
      { name: 'Fanny Ghassani (SMPN)', gender: 'P' },
      { name: 'Guntur Triyoga (SMPN)', gender: 'L' },
      { name: 'Helmalia Putri (SMPN)', gender: 'P' },
      { name: 'Indra Birowo (SMPN)', gender: 'L' },
      { name: 'Jenny Cortez (SMPN)', gender: 'P' },
      { name: 'Kevin Julio (SMPN)', gender: 'L' },
      { name: 'Laura Basuki (SMPN)', gender: 'P' },
      { name: 'Marcel Chandrawinata (SMPN)', gender: 'L' },
      { name: 'Nadine Chandrawinata (SMPN)', gender: 'P' },
      { name: 'Okan Cornelius Petaling (SMPN)', gender: 'L' },
      { name: 'Prisia Nasution (SMPN)', gender: 'P' },
      { name: 'Roger Danuarta (SMPN)', gender: 'L' },
      { name: 'Sheila Marcia (SMPN)', gender: 'P' },
      { name: 'Tommy Kurniawan (SMPN)', gender: 'L' },
      { name: 'Yuki Kato (SMPN)', gender: 'P' },
    ],
  },

  // --- SMPN 1 Sungailiat VIII-A ---
  'cls-smp1-8a': {
    schoolId: 'sch-smpn1-sungailiat',
    className: 'Kelas VIII-A',
    code: 'sg8a',
    students: [
      { name: 'Arief Muhammad (SMPN Sungailiat)', gender: 'L' },
      { name: 'Bima Arya (SMPN Sungailiat)', gender: 'L' },
      { name: 'Cindy Fatikasari (SMPN Sungailiat)', gender: 'P' },
      { name: 'Dedi Mulyadi (SMPN Sungailiat)', gender: 'L' },
      { name: 'Eni Maryani (SMPN Sungailiat)', gender: 'P' },
      { name: 'Fauzi Bowo (SMPN Sungailiat)', gender: 'L' },
      { name: 'Gita KDI (SMPN Sungailiat)', gender: 'P' },
      { name: 'Helmy Yahya (SMPN Sungailiat)', gender: 'L' },
      { name: 'Ira Maya Sopha (SMPN Sungailiat)', gender: 'P' },
      { name: 'Jaja Miharja (SMPN Sungailiat)', gender: 'L' },
      { name: 'Kamidia Radisti (SMPN Sungailiat)', gender: 'P' },
      { name: 'Lukman Hakim (SMPN Sungailiat)', gender: 'L' },
      { name: 'Melanie Subono (SMPN Sungailiat)', gender: 'P' },
      { name: 'Nurul Arifin (SMPN Sungailiat)', gender: 'P' },
      { name: 'Omesh Ananda (SMPN Sungailiat)', gender: 'L' },
      { name: 'Paramitha Rusady (SMPN Sungailiat)', gender: 'P' },
      { name: 'Quentin Stanislav (SMPN Sungailiat)', gender: 'L' },
      { name: 'Rano Karno (SMPN Sungailiat)', gender: 'L' },
      { name: 'Suti Karno (SMPN Sungailiat)', gender: 'P' },
      { name: 'Tora Sudiro (SMPN Sungailiat)', gender: 'L' },
    ],
  },
};

// ==========================================
// GENERATOR SISWA LENGKAP
// ==========================================
export function generateAllStudents(): Student[] {
  const result: Student[] = [];

  Object.entries(CLASS_TEMPLATES).forEach(([classId, meta]) => {
    meta.students.forEach((s, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      // For cls-8a, keep original IDs s-01..s-20 for total compatibility with previous fixtures
      const id = classId === 'cls-8a' ? `s-${num}` : `s-${meta.code}-${num}`;
      const isMendo = meta.schoolId === 'sch-smpn1-mendobarat';
      const isSungailiat = meta.schoolId === 'sch-smpn1-sungailiat';
      
      const prefix = isMendo ? '20261' : isSungailiat ? '20262' : '20260';
      const grade = meta.code.includes('7') ? '7' : meta.code.includes('8') ? '8' : '9';
      const nis = `${prefix}${grade}${num}`;
      const npsnCode = isMendo ? '3344' : isSungailiat ? '5678' : '1234';
      const nisn = `009${npsnCode}${num}`;
      
      result.push({
        id,
        nis,
        nisn,
        name: s.name,
        gender: s.gender,
        classId,
        className: meta.className,
        schoolId: meta.schoolId,
      });
    });
  });

  return result;
}

// ==========================================
// GENERATOR SOSIOMETRI KONTEMPORER MORENO
// ==========================================
export function generateAllNominations(periodId: string = 'period-2026-s1'): SociometricNomination[] {
  const allStudents = generateAllStudents();
  const result: SociometricNomination[] = [];
  let nomCount = 1;

  const classes = Object.keys(CLASS_TEMPLATES);

  classes.forEach((classId) => {
    const classStudents = allStudents.filter((s) => s.classId === classId);
    if (classStudents.length < 20) return;

    // Mapping peran sosiometri:
    // s[0] & s[3] : Popular
    // s[1]        : Rejected
    // s[4]        : Neglected
    // s[5]        : Controversial
    // others      : Average with dyads

    const s = classStudents;

    // Helper to add nomination
    const addNom = (fromIdx: number, toIdx: number, criteria: 'belajar' | 'bermain', type: 'like' | 'dislike') => {
      if (fromIdx === toIdx || fromIdx >= s.length || toIdx >= s.length) return;
      result.push({
        id: `nom-${periodId}-${classId}-${nomCount++}`,
        periodId,
        classId,
        studentId: s[fromIdx].id,
        targetId: s[toIdx].id,
        criteria,
        type,
      });
    };

    // 1. POPULAR TARGETS: s[0] and s[3] receive many likes, 0 dislikes
    // s[0] receives likes from 11 peers
    [2, 4, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17].forEach((from) => {
      addNom(from, 0, 'belajar', 'like');
      addNom(from, 0, 'bermain', 'like');
    });

    // s[3] receives likes from 10 peers
    [0, 1, 2, 5, 7, 8, 9, 14, 16, 18].forEach((from) => {
      addNom(from, 3, 'belajar', 'like');
      addNom(from, 3, 'bermain', 'like');
    });

    // 2. REJECTED TARGET: s[1] receives many dislikes (8-10 dislikes), and only 1 like
    [0, 2, 3, 5, 6, 7, 8, 11, 12, 15].forEach((from) => {
      addNom(from, 1, 'belajar', 'dislike');
      addNom(from, 1, 'bermain', 'dislike');
    });
    // Single sympathetic like for s[1]
    addNom(4, 1, 'bermain', 'like');

    // 3. NEGLECTED TARGET: s[4] receives 0 likes and 0 dislikes (socially invisible)
    // s[4] nominates popular student s[0] and rejected s[1]
    addNom(4, 0, 'belajar', 'like');

    // 4. CONTROVERSIAL TARGET: s[5] receives both 6 likes and 5 dislikes
    [1, 6, 8, 10, 14, 19].forEach((from) => {
      addNom(from, 5, 'bermain', 'like');
    });
    [0, 2, 3, 7, 11].forEach((from) => {
      addNom(from, 5, 'belajar', 'dislike');
    });

    // 5. RECIPROCAL PAIRS (DYADS):
    const dyads = [
      [0, 2],
      [3, 7],
      [6, 8],
      [9, 10],
      [11, 12],
      [13, 14],
      [15, 16],
      [17, 18],
    ];

    dyads.forEach(([a, b]) => {
      addNom(a, b, 'belajar', 'like');
      addNom(b, a, 'belajar', 'like');
      addNom(a, b, 'bermain', 'like');
      addNom(b, a, 'bermain', 'like');
    });

    // Extra casual nominations for average peers
    addNom(18, 19, 'bermain', 'like');
    addNom(19, 17, 'bermain', 'like');
    addNom(7, 9, 'belajar', 'like');
    addNom(10, 13, 'bermain', 'like');
    addNom(14, 15, 'belajar', 'like');
  });

  return result;
}

// ==========================================
// GENERATOR RATING PERILAKU SEBAYA (BEHAVIORS)
// ==========================================
export function generateAllBehavioralRatings(periodId: string = 'period-2026-s1'): PeerBehavioralRating[] {
  const allStudents = generateAllStudents();
  const result: PeerBehavioralRating[] = [];
  let bCount = 1;

  const classes = Object.keys(CLASS_TEMPLATES);

  classes.forEach((classId) => {
    const classStudents = allStudents.filter((s) => s.classId === classId);
    if (classStudents.length < 20) return;

    classStudents.forEach((student, idx) => {
      // Role-based behavioral dimensions:
      // idx 0 & 3: Popular (high prosocial, very low aggression, low withdrawn)
      // idx 1: Rejected (high victimization & withdrawn, elevated aggression)
      // idx 4: Neglected (very high withdrawn, passive, low prosocial)
      // idx 5: Controversial (high prosocial + high aggression + high hyperactive)
      // others: Average (balanced)

      let prosocial = 6;
      let aggressive = 2;
      let withdrawn = 2;
      let victimization = 2;
      let hyperactive = 3;

      if (idx === 0 || idx === 3) {
        // Popular
        prosocial = 9;
        aggressive = 1;
        withdrawn = 1;
        victimization = 1;
        hyperactive = 2;
      } else if (idx === 1) {
        // Rejected (Victimized)
        prosocial = 2;
        aggressive = 4;
        withdrawn = 7;
        victimization = 9;
        hyperactive = 4;
      } else if (idx === 4) {
        // Neglected (Withdrawn)
        prosocial = 3;
        aggressive = 1;
        withdrawn = 9;
        victimization = 2;
        hyperactive = 1;
      } else if (idx === 5) {
        // Controversial (Energetic, dominant)
        prosocial = 7;
        aggressive = 8;
        withdrawn = 1;
        victimization = 2;
        hyperactive = 8;
      } else if (idx % 3 === 0) {
        prosocial = 7;
        aggressive = 2;
        withdrawn = 3;
        victimization = 2;
        hyperactive = 3;
      } else if (idx % 2 === 0) {
        prosocial = 5;
        aggressive = 3;
        withdrawn = 3;
        victimization = 3;
        hyperactive = 4;
      }

      result.push({
        id: `pbr-${periodId}-${classId}-${bCount++}`,
        periodId,
        classId,
        studentId: student.id,
        prosocial,
        aggressive,
        withdrawn,
        victimization,
        hyperactive,
      });
    });
  });

  return result;
}
