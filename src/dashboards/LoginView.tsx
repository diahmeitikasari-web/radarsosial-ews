import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { dataStorage } from '../services/dataStorage';
import { UserGuideBook } from '../components/UserGuideBook';
import { PrintableQuestionnaireA4 } from '../components/PrintableQuestionnaireA4';
import {
  Satellite,
  GraduationCap,
  UserCheck,
  ShieldAlert,
  Key,
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Printer,
  Layers,
  Network,
  Award,
  CheckCircle2,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, loginWithOAuth } = useAuth();

  // Active Tab on the Landing Page: 'home' | 'login' | 'guide'
  const [activeTab, setActiveTab] = useState<'home' | 'login' | 'guide'>('home');
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

  // Login form state
  const [email, setEmail] = useState('gurubk@radarsosial.id');
  const [password, setPassword] = useState('bk123456');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Google SSO Modal State
  const [isSsoModalOpen, setIsSsoModalOpen] = useState(false);

  // Password Reset Request Modal State
  const [isResetRequestOpen, setIsResetRequestOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqRole, setReqRole] = useState<'guru_bk' | 'kepala_sekolah'>('guru_bk');
  const [reqSchool, setReqSchool] = useState('MTs Negeri 2 Bangka');
  const [reqProposedPassword, setReqProposedPassword] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [reqFeedback, setReqFeedback] = useState<string | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleGoogleSsoSelect = async (targetEmail?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsSsoModalOpen(false);
    const res = await loginWithOAuth('google', targetEmail);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleSubmitPasswordRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqEmail.trim()) return;

    dataStorage.requestPasswordReset({
      userName: reqName.trim(),
      userEmail: reqEmail.trim(),
      userRole: reqRole,
      schoolName: reqSchool.trim() || 'Satuan Pendidikan',
      proposedPassword: reqProposedPassword.trim() || undefined,
      reason: reqReason.trim() || 'Pengajuan aktivasi atau reset kata sandi akun.',
    });

    setReqFeedback('Permintaan berhasil dikirimkan! Super-Admin Lab akan meninjau dan menyetujui kata sandi akun Anda.');
    setTimeout(() => {
      setIsResetRequestOpen(false);
      setReqFeedback(null);
      setReqName('');
      setReqEmail('');
      setReqProposedPassword('');
      setReqReason('');
    }, 2500);
  };

  const roleOverview = [
    {
      role: 'guru_bk' as UserRole,
      title: 'Guru BK (Konselor)',
      roleLabel: 'Unit Bimbingan dan Konseling',
      email: 'gurubk@radarsosial.id',
      defaultPass: 'bk123456',
      desc: 'Pemetaan sosial, analisis sosiometri Moreno, SNA interaktif, catatan kualitatif berbasis LLM, dan laporan resmi cetak A4.',
      color: 'border-[#f0c040]/40 bg-[#1a3f64]/40 text-[#f7d970]',
      icon: GraduationCap,
    },
    {
      role: 'kepala_sekolah' as UserRole,
      title: 'Kepala Sekolah / Madrasah',
      roleLabel: 'Pimpinan Satuan Pendidikan',
      email: 'kepsek@radarsosial.id',
      defaultPass: 'kepsek123456',
      desc: 'Decision Support System (DSS), iklim sosial makro sekolah, monitoring rasio risiko kelompok, dan validasi laporan resmi.',
      color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300',
      icon: UserCheck,
    },
    {
      role: 'admin' as UserRole,
      title: 'Super-Admin Lab Hub',
      roleLabel: 'Pusat Analitik & Riset Relasi Sosial',
      email: 'admin@radarsosial.id',
      defaultPass: 'admin123456',
      desc: 'Persetujuan kata sandi akun, manajemen periode asesmen, korelasi sosiometri × perilaku, dan konfigurasi master.',
      color: 'border-purple-500/40 bg-purple-950/30 text-purple-300',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a2a4a] text-[#e8edf5] flex flex-col font-sans selection:bg-[#f0c040]/30 selection:text-[#f7d970]">
      {/* Top Universal Navbar */}
      <header className="sticky top-0 z-40 bg-[#0a2a4a]/95 backdrop-blur-md border-b border-[#1a3f64]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-radial from-[#1a4a6e] to-[#0a2a4a] border-2 border-[#f0c040] flex items-center justify-center text-[#f0c040] shadow-md group-hover:scale-105 transition">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>Radar</span>
                <span className="text-[#f0c040]">Sosial</span>
              </div>
              <div className="text-[10px] text-[#b0c4de] -mt-1 hidden sm:block">
                Psychosophia Behavioral Lab
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'home'
                  ? 'bg-[#1a3f64] text-[#f0c040] shadow-inner font-bold'
                  : 'text-[#b0c4de] hover:text-white hover:bg-white/5'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-[#1a3f64] text-[#f0c040] shadow-inner font-bold'
                  : 'text-[#b0c4de] hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Panduan</span>
            </button>
            <button
              onClick={() => setIsQuestionnaireOpen(true)}
              className="px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-[#b0c4de] hover:text-white hover:bg-white/5"
            >
              <Printer className="w-3.5 h-3.5 text-[#f7d970]" />
              <span>Kuesioner Siswa</span>
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`px-4 py-1.5 rounded-xl transition font-bold shadow-md cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#f0c040] text-[#0a2a4a]'
                  : 'bg-[#1a3f64] hover:bg-[#204c75] text-[#f7d970]'
              }`}
            >
              Masuk Portal
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* TAB 1: BUKU PANDUAN PENGGUNA */}
        {activeTab === 'guide' && <UserGuideBook />}

        {/* TAB 2: LANDING PAGE UTAMA */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Section */}
            <div className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6">
              <div className="absolute inset-0 bg-radial from-[#1a4a6e]/40 via-transparent to-transparent pointer-events-none" />

              <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3f64]/80 border border-[#f0c040]/40 text-xs font-semibold text-[#f7d970] shadow-inner">
                  <Sparkles className="w-4 h-4 text-[#f0c040]" />
                  <span>Psychosophia Behavioral Lab &bull; Sosiometri &amp; Iklim Relasi Sekolah</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                  Pemetaan Presisi Relasi Sosial &amp; Dinamika Sebaya
                </h1>

                <p className="text-sm sm:text-base text-[#b0c4de] max-w-2xl mx-auto leading-relaxed">
                  Platform diagnostik komprehensif bagi Guru BK dan Kepala Sekolah untuk mengidentifikasi jaringan interaksi sebaya, mendeteksi kerentanan isolasi sosial secara dini, serta membangun iklim satuan pendidikan yang aman, inklusif, dan harmonis.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => setActiveTab('login')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold text-xs sm:text-sm shadow-xl transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1a3f64] hover:bg-[#204c75] text-[#e8edf5] font-semibold text-xs sm:text-sm border border-white/10 transition cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#f0c040]" />
                    <span>Baca Buku Panduan</span>
                  </button>
                  <button
                    onClick={() => setIsQuestionnaireOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0a2a4a] hover:bg-[#0d3555] text-[#f7d970] font-semibold text-xs sm:text-sm border border-[#f0c040]/30 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#f7d970]" />
                    <span>Cetak Kuesioner Siswa (A4)</span>
                  </button>
                </div>

                {/* Meta Lab Tag */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-[#b0c4de]/80">
                  <span className="font-semibold text-white">Psychosophia Behavioral Lab</span>
                  <span>&bull;</span>
                  <span className="italic text-[#f7d970]">--bridging data to behavior--</span>
                </div>
              </div>
            </div>

            {/* Portal Architecture Overview (Tanpa Login Cepat) */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl font-bold text-white mb-2">
                  Struktur Peran &amp; Kewenangan Sistem
                </h2>
                <p className="text-xs text-[#b0c4de] max-w-xl mx-auto">
                  Akses terotentikasi penuh dengan proteksi data pribadi berbasis kredensial akun terdaftar atau Single Sign-On (SSO) Google.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {roleOverview.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <div
                      key={acc.role}
                      className={`p-5 rounded-2xl border transition duration-200 flex flex-col justify-between ${acc.color}`}
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-black/30 border border-current flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-white">{acc.title}</h3>
                        <p className="text-[11px] text-[#b0c4de] mt-1.5 leading-relaxed">
                          {acc.desc}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-[#b0c4de]/80">{acc.roleLabel}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail(acc.email);
                            setPassword(acc.defaultPass);
                            setActiveTab('login');
                          }}
                          className="font-bold text-[#f7d970] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Masuk Akun</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4 Core Scientific Pillars */}
            <div className="bg-[#0d3555]/50 border-y border-[#1a3f64] py-14 px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                  <span className="text-[11px] font-bold text-[#f0c040] uppercase tracking-wider">
                    LANDASAN METODOLOGI &amp; FITUR UNGGULAN
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                    Instrumen Diagnostik Komprehensif
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="p-5 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                      <Network className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-white">Sosiometri Moreno &amp; SNA</h3>
                    <p className="text-xs text-[#b0c4de] leading-relaxed">
                      Social Network Analysis (SNA) interaktif untuk memetakan klik pertemanan, hubungan timbal balik (reciprocal), dan mendeteksi siswa yang terisolasi.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 text-[#f7d970] flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-white">Klasifikasi Coie &amp; Dodge</h3>
                    <p className="text-xs text-[#b0c4de] leading-relaxed">
                      Standarisasi Z-Score matematis 5 kuadran sosial: Popular, Rejected, Neglected, Controversial, dan Average sesuai literatur psikologi sosial.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-white">Analisis Tematik Semantik LLM</h3>
                    <p className="text-xs text-[#b0c4de] leading-relaxed">
                      Kategorisasi tematik otomatis atas catatan kualitatif anekdotal Guru BK untuk memetakan iklim sosio-emosional kelas secara akurat.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-white">DSS &amp; Rekomendasi Preskriptif</h3>
                    <p className="text-xs text-[#b0c4de] leading-relaxed">
                      Panduan rencana aksi terstruktur bagi Guru BK dan Kepala Sekolah serta penerbitan laporan resmi A4 terintegrasi catatan kualitatif.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOGIN FORM */}
        {activeTab === 'login' && (
          <div className="py-12 px-4 sm:px-6 flex justify-center items-center">
            <div className="w-full max-w-lg bg-[#0d3555]/80 border-2 border-[#1a3f64] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0a2a4a] border-2 border-[#f0c040] text-[#f0c040] mb-3 shadow-lg">
                  <Satellite className="w-8 h-8" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-white">
                  Masuk ke Radar <span className="text-[#f0c040]">Sosial</span>
                </h2>
                <p className="text-xs text-[#b0c4de] mt-1">
                  Gunakan Single Sign-On (SSO) Google atau kredensial akun terdaftar
                </p>
              </div>

              {/* OAuth 2.0 Primary SSO Button */}
              <div>
                <button
                  id="btn-oauth-google"
                  onClick={() => setIsSsoModalOpen(true)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg transition duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Masuk dengan Akun Google / SSO Belajar.id</span>
                </button>
                <div className="flex items-center justify-between text-[11px] text-[#b0c4de] mt-2 px-1">
                  <span className="flex items-center gap-1">
                    <Key className="w-3 h-3 text-[#f0c040]" />
                    <span>Protokol OAuth 2.0 + PKCE Terenkripsi</span>
                  </span>
                  <span className="text-[#f7d970] font-mono">OIDC Ready</span>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#0d3555] px-3 text-[11px] uppercase tracking-wider text-[#b0c4de] font-bold">
                  Atau Gunakan Kredensial Surel &amp; Kata Sandi
                </span>
              </div>

              {/* Form Login Standar */}
              <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[#e8edf5] font-semibold mb-1">
                    Alamat Surel Terdaftar:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#b0c4de] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="gurubk@radarsosial.id"
                      className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl pl-9 pr-3 py-2.5 text-[#e8edf5] placeholder:text-[#b0c4de]/40 focus:outline-hidden focus:border-[#f0c040] transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[#e8edf5] font-semibold">Kata Sandi:</label>
                    <button
                      type="button"
                      onClick={() => {
                        setReqEmail(email);
                        setIsResetRequestOpen(true);
                      }}
                      className="text-[11px] text-[#f7d970] hover:underline cursor-pointer"
                    >
                      Lupa / Minta Sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#b0c4de] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl pl-9 pr-3 py-2.5 text-[#e8edf5] placeholder:text-[#b0c4de]/40 focus:outline-hidden focus:border-[#f0c040] transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Request Password to Admin Banner */}
              <div className="pt-4 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => setIsResetRequestOpen(true)}
                  className="text-xs text-[#b0c4de] hover:text-[#f7d970] transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-[#f0c040]" />
                  <span>Akun Guru BK / Kepala Sekolah baru? <strong>Ajukan Sandi ke Admin</strong></span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Google SSO Selection Modal */}
      {isSsoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-[#1a3f64] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 className="font-bold text-white text-sm">Pilih Akun Google / Belajar.id</h3>
              </div>
              <button
                onClick={() => setIsSsoModalOpen(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-[#b0c4de] text-xs">
              Sistem akan memverifikasi identitas dan menghubungkan Anda ke hak akses peran yang telah dikonfigurasi.
            </p>

            <div className="space-y-2">
              {dataStorage.getUsers().slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleGoogleSsoSelect(u.email)}
                  className="w-full p-3 rounded-xl bg-[#0a2a4a] hover:bg-[#1a3f64] border border-[#1a3f64] flex items-center justify-between text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-cyan-950 text-cyan-300 flex items-center justify-center font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-[#b0c4de]">{u.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 text-[#f7d970] uppercase">
                    {u.role.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleGoogleSsoSelect()}
                className="w-full py-2.5 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold text-xs transition cursor-pointer"
              >
                Lanjutkan dengan Akun Google Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Password Modal (Guru BK & Kepala Sekolah -> Admin Approval) */}
      {isResetRequestOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#0d3555] border-2 border-[#1a3f64] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1a3f64] pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#f0c040]" />
                <h3 className="font-serif text-base font-bold text-white">
                  Permintaan Kata Sandi ke Admin
                </h3>
              </div>
              <button
                onClick={() => setIsResetRequestOpen(false)}
                className="text-[#b0c4de] hover:text-white text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {reqFeedback ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs space-y-1 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <div className="font-bold text-sm text-white">Pengajuan Berhasil!</div>
                <p>{reqFeedback}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPasswordRequest} className="space-y-3">
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Guru BK dan Kepala Sekolah dapat mengajukan permohonan pengaturan atau reset kata sandi. Super-Admin Lab akan memverifikasi dan menyetujui akun Anda.
                </p>

                <div>
                  <label className="block text-white font-semibold mb-1">Nama Lengkap &amp; Gelar:</label>
                  <input
                    type="text"
                    required
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    placeholder="Liengga Brian Darea, S.Sos.,Gr"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white placeholder:text-[#b0c4de]/40 focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1">Alamat Surel Resmi Terdaftar:</label>
                  <input
                    type="email"
                    required
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    placeholder="gurubk@radarsosial.id"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white placeholder:text-[#b0c4de]/40 focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-white font-semibold mb-1">Peran Akun:</label>
                    <select
                      value={reqRole}
                      onChange={(e) => setReqRole(e.target.value as any)}
                      className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white focus:outline-hidden focus:border-[#f0c040]"
                    >
                      <option value="guru_bk">Guru BK (Konselor)</option>
                      <option value="kepala_sekolah">Kepala Sekolah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-1">Satuan Pendidikan:</label>
                    <input
                      type="text"
                      value={reqSchool}
                      onChange={(e) => setReqSchool(e.target.value)}
                      placeholder="MTsN 2 Bangka"
                      className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white placeholder:text-[#b0c4de]/40 focus:outline-hidden focus:border-[#f0c040]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1">
                    Usulan Kata Sandi Baru (Opsional):
                  </label>
                  <input
                    type="text"
                    value={reqProposedPassword}
                    onChange={(e) => setReqProposedPassword(e.target.value)}
                    placeholder="Contoh: bkBaru2026!"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white placeholder:text-[#b0c4de]/40 focus:outline-hidden focus:border-[#f0c040]"
                  />
                  <span className="text-[10px] text-[#b0c4de] mt-0.5 block">
                    Jika dikosongkan, Admin akan menetapkan kata sandi standar yang aman.
                  </span>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1">Alasan / Keterangan:</label>
                  <textarea
                    rows={2}
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    placeholder="Lupa kata sandi lama / Pergantian konselor baru di madrasah"
                    className="w-full bg-[#0a2a4a] border border-[#1a3f64] rounded-xl p-2.5 text-white placeholder:text-[#b0c4de]/40 focus:outline-hidden focus:border-[#f0c040]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsResetRequestOpen(false)}
                    className="px-4 py-2 rounded-xl text-[#b0c4de] hover:bg-white/5 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim ke Admin</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Printable Questionnaire Modal */}
      <PrintableQuestionnaireA4
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
      />

      {/* Landing Page Footer - Cukup 1 Lembaga: Psychosophia Behavioral Lab */}
      <footer className="bg-[#061c30] border-t-2 border-[#f0c040] py-6 px-4 text-xs text-[#b0c4de]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-[#f0c040]" />
            <span className="font-semibold text-white">Radar Sosial</span>
            <span>&bull;</span>
            <span className="text-[#f7d970] font-medium">Psychosophia Behavioral Lab</span>
            <span>&bull;</span>
            <span className="italic text-[#8fa8c6]">--bridging data to behavior--</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-[#f0c040] transition cursor-pointer"
            >
              Buku Panduan
            </button>
            <button
              onClick={() => setIsQuestionnaireOpen(true)}
              className="hover:text-[#f0c040] transition cursor-pointer"
            >
              Kuesioner A4
            </button>
            <span className="text-[#b0c4de]/80">Psychosophia Behavioral Lab</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
