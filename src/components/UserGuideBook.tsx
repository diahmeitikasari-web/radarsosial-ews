import React, { useState } from 'react';
import {
  BookOpen,
  Printer,
  Satellite,
  Layers,
  LogIn,
  Keyboard,
  PieChart,
  Tag,
  HelpCircle,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Users,
  Search,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Compass,
  Network,
  Activity,
  Award,
  BarChart3,
  Sliders,
  Heart,
  Share2,
  UserCheck,
  Brain,
  Key,
  FileText,
  Copy,
  FolderSync,
  FolderPlus,
} from 'lucide-react';

export const UserGuideBook: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('apa');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const tocItems = [
    { id: 'apa', title: '1. Hakikat, Fungsi & 4 Pilar Metodologi Radar Sosial' },
    { id: 'sosiometri', title: '2. Landasan Metodologi 1: Sosiometri Jacob L. Moreno (1934)' },
    { id: 'sna', title: '3. Landasan Metodologi 2: Social Network Analysis (SNA) & Jejaring Graf' },
    { id: 'engine', title: '4. Landasan Metodologi 3: Engine Logics & Klasifikasi Coie-Dodge (1982)' },
    { id: 'tematik', title: '5. Landasan Metodologi 4: Analisis Tematik Semantik LLM (Braun & Clarke 2006)' },
    { id: 'radar-perilaku', title: '6. Radar Perilaku Sebaya & Matriks Diagnostik Dual-Radar' },
    { id: 'catatan-kualitatif', title: '7. Workspace Catatan Kualitatif Siswa & Refleksi Naratif Guru BK' },
    { id: 'input', title: '8. Tata Cara Pengumpulan Data: Kuesioner Ramah Siswa A4 & Template Excel' },
    { id: 'autentikasi', title: '9. Sistem Keamanan Akun & Alur Permohonan Mandiri Kata Sandi' },
    { id: 'dashboard', title: '10. Navigasi & Pembacaan Dashboard Tiga Peran' },
    { id: 'cetak', title: '11. Prosedur Cetak Laporan Resmi PDF A4 (Lengkap Bab VII) & Kuesioner A4' },
    { id: 'trouble', title: '12. Troubleshooting, Etika Konseling & Privasi Data BK' },
    { id: 'kontak', title: '13. Pusat Bantuan & Laboratorium Riset' },
  ];

  return (
    <div className="min-h-screen bg-[#0a2a4a] text-[#e8edf5] font-sans selection:bg-[#f0c040]/30 selection:text-[#f7d970]">
      {/* Floating Action Button for Quick Print */}
      <div className="fixed bottom-6 right-6 z-40 no-print flex items-center gap-2">
        <button
          onClick={handlePrint}
          className="print-include flex items-center gap-2 px-5 py-3 rounded-full bg-[#f0c040] hover:bg-[#f7d970] text-[#0a2a4a] font-bold text-xs shadow-2xl transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF Buku Panduan</span>
        </button>
      </div>

      {/* COVER / HEADER */}
      <div className="bg-gradient-to-br from-[#0a2a4a] via-[#0d3555] to-[#1a3f64] border-b-4 border-[#f0c040] py-14 px-4 sm:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Circular Satellite Emblem */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-radial from-[#1a4a6e] to-[#0a2a4a] border-4 border-[#f0c040] shadow-[0_0_0_8px_rgba(240,192,64,0.15)] text-[#f0c040] mb-5">
            <Satellite className="w-12 h-12" />
          </div>

          <div className="inline-block bg-[#f0c040] text-[#0a2a4a] text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-3 shadow-md">
            <BookOpen className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
            Buku Pedoman Metodologi & Petunjuk Operasional
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Radar <span className="text-[#f0c040]">Sosial</span>
          </h1>
          <p className="mt-3 text-[#b0c4de] text-base sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
            Pedoman Komprehensif Pemetaan Dinamika Relasi, Analisis Jaringan Sosial (SNA), dan Pengelolaan Iklim Sosial Kelas Berbasis Metodologi Moreno & Model Klasifikasi Coie-Dodge
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#b0c4de]/80">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-[#f0c040]" />
              Psychosophia Behavioral Lab
            </span>
            <span>&bull;</span>
            <span>IAIN Syaikh Abdurrahman Siddik Bangka Belitung</span>
            <span>&bull;</span>
            <span>Edisi Revisi Ilmiah — 2026</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* TABLE OF CONTENTS (TOC) */}
        <div className="bg-white/5 border border-[#f0c040]/20 rounded-2xl p-6 sm:p-8 mb-10 backdrop-blur-sm no-print">
          <h2 className="font-serif text-xl font-bold text-[#f0c040] mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            <span>Daftar Isi Buku Pedoman</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-left px-3 py-2 rounded-xl text-[#e8edf5] hover:text-[#f0c040] hover:bg-white/5 transition flex items-center justify-between border-b border-white/5 cursor-pointer"
              >
                <span>{item.title}</span>
                <ChevronRight className="w-4 h-4 text-[#f0c040]/60 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* ===================== BAB 1. HAKIKAT, FUNGSI & 4 PILAR METODOLOGI ===================== */}
        <section id="apa" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            1
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Satellite className="w-6 h-6 text-[#f0c040]" />
            <span>Hakikat, Fungsi &amp; 4 Pilar Metodologi Radar Sosial</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Instrumen psikososial presisi dan decision support system berbasis bukti ilmiah untuk mengamati, memetakan, dan membina dinamika relasi peserta didik.
          </p>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#e8edf5]/90">
            <p>
              Di dalam setiap ruang kelas, selalu terdapat dua struktur kehidupan: <strong>struktur formal</strong> (posisi ketua kelas, denah bangku, dan nilai rapor) serta <strong>struktur informal laten</strong> (siapa mengagumi siapa, siapa berteman akrab dengan siapa, siapa yang terpinggirkan dari obrolan, dan siapa yang memegang pengaruh opini sebaya). Struktur informal inilah yang menentukan 80% rasa aman psikologis, motivasi belajar, dan kesejahteraan emosional siswa.
            </p>
            <p>
              <strong>Radar Sosial</strong> hadir sebagai instrumen psikososial presisi yang bertindak layaknya <em>sonar sosial</em>. Sistem ini bukan dirancang untuk memberi label negatif pada anak, melainkan untuk <strong>mengelola relasi sosial siswa</strong>, <strong>memetakan iklim pertemanan kelas secara positif</strong>, dan <strong>membuka ruang pendampingan yang hangat, adil, dan inklusif</strong> sebelum ketegangan relasional tereskalasi menjadi konflik terbuka.
            </p>

            {/* 4 Pilar Metodologi Ilmiah */}
            <div className="border border-[#1a3f64] rounded-2xl bg-[#0a2a4a] p-5 space-y-3.5 my-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f0c040]" />
                <h3 className="font-serif text-sm sm:text-base font-bold text-white">
                  Empat Pilar Metodologi Ilmiah Radar Sosial:
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0d3555] border border-cyan-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span>Pilar 1: Sosiometri Moreno (1934)</span>
                  </div>
                  <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                    Pengukuran kuantitatif daya tarik (*attraction*) dan daya tolak (*repulsion*) antarpribadi dalam kriteria fungsional belajar dan bermain.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0d3555] border border-blue-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                    <Network className="w-3.5 h-3.5" />
                    <span>Pilar 2: Social Network Analysis (SNA)</span>
                  </div>
                  <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                    Teori graf matematis modern untuk menghitung densitas kelas, sentralitas derajat (*in/out-degree*), resiprositas dyadik, dan deteksi klik terisolasi.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0d3555] border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-[#f7d970] font-bold text-xs">
                    <Award className="w-3.5 h-3.5" />
                    <span>Pilar 3: Model Coie &amp; Dodge (1982)</span>
                  </div>
                  <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                    Standardisasi Z-Score matematis untuk klasifikasi 5 status penerimaan sosial: Popular, Rejected, Neglected, Controversial, dan Average.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0d3555] border border-purple-500/30 space-y-1">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Pilar 4: Analisis Tematik Semantik LLM (Braun &amp; Clarke)</span>
                  </div>
                  <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                    Otomatisasi pengelompokan tema psikososial atas catatan kualitatif anekdotal Guru BK untuk menghasilkan narasi iklim kelas dan preskripsi bimbingan.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Functions Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
              <div className="p-4 rounded-xl bg-[#0d3555] border border-[#1a3f64] space-y-1.5">
                <div className="flex items-center gap-2 text-[#f7d970] font-bold text-sm">
                  <Compass className="w-4 h-4" />
                  <span>1. Pemetaan Struktur Sosial Nyata</span>
                </div>
                <p className="text-[#b0c4de] text-xs">
                  Menyingkap pola klik (*sub-groups*), isolat sosial, serta polarisasi gender atau kelompok minat yang kasat mata dalam observasi sehari-hari.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d3555] border border-[#1a3f64] space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Heart className="w-4 h-4" />
                  <span>2. Pembinaan Relasi Sehat &amp; Inklusif</span>
                </div>
                <p className="text-[#b0c4de] text-xs">
                  Mengidentifikasi siswa yang belum memiliki kawan akrab timbal balik (*reciprocal tie*) agar dapat dipasangkan dalam dinamika kelompok kooperatif.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d3555] border border-[#1a3f64] space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <Award className="w-4 h-4" />
                  <span>3. Pemberdayaan Duta Relasi Positif</span>
                </div>
                <p className="text-[#b0c4de] text-xs">
                  Menemukan figur-figur siswa populer yang berkarakter prososial tinggi untuk diberdayakan sebagai penggerak kehangatan dan keteladanan sebaya.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d3555] border border-[#1a3f64] space-y-1.5">
                <div className="flex items-center gap-2 text-[#f0c040] font-bold text-sm">
                  <BarChart3 className="w-4 h-4" />
                  <span>4. Evaluasi Kinerja Bimbingan Terukur</span>
                </div>
                <p className="text-[#b0c4de] text-xs">
                  Menghasilkan metrik longitudinal kuantitatif untuk mengukur peningkatan kohesi kelas dari semester ke semester sebagai bukti akuntabilitas konselor.
                </p>
              </div>
            </div>

            <div className="bg-[#1a3f64]/60 border-l-4 border-[#f0c040] p-4 rounded-r-xl text-xs text-[#b0c4de] leading-relaxed">
              <strong className="text-white text-sm block mb-1">Prinsip Etika Konseling:</strong>
              Data sosiometri bersifat rahasia profesional (*confidential*). Hasil kalkulasi Radar Sosial digunakan oleh Guru BK semata-mata sebagai landasan perencanaan bimbingan klasikal, bimbingan kelompok, dan konsultasi suportif, bukan untuk diumumkan atau dijadikan vonis sosial terhadap peserta didik.
            </div>
          </div>
        </section>

        {/* ===================== BAB 2. SOSIOMETRI MORENO ===================== */}
        <section id="sosiometri" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            2
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#f0c040]" />
            <span>Landasan Metodologi 1: Sosiometri Jacob L. Moreno (1934)</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Akar keilmuan pengukuran psikososial yang telah teruji selama hampir satu abad dalam psikologi pendidikan.
          </p>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#e8edf5]/90">
            <p>
              Sosiometri dirumuskan pertama kali oleh psikiater <strong>Jacob Levy Moreno</strong> dalam adikaryanya <em>"Who Shall Survive?" (1934)</em>. Moreno mendefinisikan sosiometri sebagai studi matematis tentang sifat-sifat psikologis dari suatu populasi, khususnya teknik untuk mengukur daya tarik (*attraction*) dan daya tolak (*repulsion*) antarpribadi dalam kelompok.
            </p>

            {/* Konsep Sosiometri Moreno */}
            <div className="border border-[#1a3f64] rounded-2xl bg-[#0a2a4a] p-4 space-y-3">
              <h3 className="font-serif text-sm font-bold text-[#f7d970]">
                Tiga Pilar Utama Tes Sosiometri Klasik Moreno:
              </h3>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a3f64] text-[#f0c040] flex items-center justify-center font-bold shrink-0 text-[11px]">a</span>
                  <div>
                    <strong className="text-white">Kriteria Pilihan Nyata (Criterion-Referenced):</strong> Pertanyaan sosiometri tidak bersifat abstrak ("Siapa temanmu?"), melainkan berorientasi pada situasi konkret. Radar Sosial menggunakan dua kriteria utama: <strong>Kriteria Belajar</strong> (kolaboratif akademik) dan <strong>Kriteria Bermain/Sosial</strong> (kehangatan interaksi rekreasi).
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a3f64] text-[#f0c040] flex items-center justify-center font-bold shrink-0 text-[11px]">b</span>
                  <div>
                    <strong className="text-white">Polaritas Pilihan Positif &amp; Negatif:</strong> Siswa diberikan kesempatan untuk menyebutkan hingga 3 teman yang paling diinginkan untuk beraktivitas bersama (*Positive Nominations / Likes*) serta teman yang cenderung dihindari (*Negative Nominations / Dislikes*).
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1a3f64] text-[#f0c040] flex items-center justify-center font-bold shrink-0 text-[11px]">c</span>
                  <div>
                    <strong className="text-white">Sosiogram (Peta Graf Visual):</strong> Representasi visual jaringan di mana setiap siswa digambarkan sebagai titik lingkaran (*node*), dan garis berarah (*directed edge*) melambangkan pilihan afektif mereka.
                  </div>
                </li>
              </ul>
            </div>

            <p>
              Dengan metode ini, dinamika kelompok tidak lagi bergantung pada asumsi subjektif guru semata, melainkan berpijak pada agregasi persepsi riil dari seluruh anggota komunitas kelas.
            </p>
          </div>
        </section>

        {/* ===================== BAB 3. SNA & THRESHOLD ===================== */}
        <section id="sna" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            3
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Network className="w-6 h-6 text-[#f0c040]" />
            <span>Social Network Analysis (SNA) &amp; Ambang Batas (Thresholds)</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Metrik analitik jaringan graf dan parameter kuantitatif untuk mengevaluasi kesehatan ekosistem kelas.
          </p>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#e8edf5]/90">
            <p>
              Dalam sistem Radar Sosial, sosiogram Moreno diintegrasikan dengan algoritma <strong>Social Network Analysis (SNA)</strong> modern berbasis teori graf $G = (V, E)$, di mana $V$ adalah himpunan siswa (*vertices/nodes*) dan $E$ adalah himpunan relasi pilihan antarsiswa (*directed edges*).
            </p>

            {/* Metrik SNA Table */}
            <div className="overflow-x-auto border border-[#1a3f64] rounded-2xl bg-[#0a2a4a]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0d3555] text-white font-serif border-b border-[#1a3f64]">
                  <tr>
                    <th className="p-3">Metrik SNA</th>
                    <th className="p-3">Definisi Matematis</th>
                    <th className="p-3">Ambang Batas (Threshold)</th>
                    <th className="p-3">Makna Bimbingan Konseling</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a3f64]">
                  <tr className="hover:bg-white/5">
                    <td className="p-3 font-bold text-[#f7d970]">In-Degree Centrality (k_in)</td>
                    <td className="p-3 font-mono text-[11px] text-[#b0c4de]">
                      k_in = Σ a_ji (pilihan masuk)
                    </td>
                    <td className="p-3 font-bold text-emerald-400">
                      Tinggi: &ge; 4 pilihan<br />
                      Rendah: &le; 1 pilihan
                    </td>
                    <td className="p-3 text-[#b0c4de]">
                      Jumlah total pilihan masuk yang diterima seorang siswa. Menunjukkan tingkat popularitas dan penerimaan sosial di kelas.
                    </td>
                  </tr>

                  <tr className="hover:bg-white/5">
                    <td className="p-3 font-bold text-sky-300">Out-Degree Centrality (k_out)</td>
                    <td className="p-3 font-mono text-[11px] text-[#b0c4de]">
                      k_out = Σ a_ij (pilihan keluar)
                    </td>
                    <td className="p-3 font-bold text-sky-400">
                      Aktif: 3 pilihan<br />
                      Pasif: 0 - 1 pilihan
                    </td>
                    <td className="p-3 text-[#b0c4de]">
                      Jumlah nominasi keluar yang diajukan siswa. Mencerminkan inisiatif sosial dan minat siswa untuk menjalin hubungan dengan kawan sebaya.
                    </td>
                  </tr>

                  <tr className="hover:bg-white/5 bg-[#0d3555]/30">
                    <td className="p-3 font-bold text-[#f0c040]">Reciprocity Rate (Indeks Resiprositas)</td>
                    <td className="p-3 font-mono text-[11px] text-[#b0c4de]">
                      R = (2 &times; M) / E<br />
                      (M = jumlah pasangan timbal balik)
                    </td>
                    <td className="p-3 font-bold text-[#f7d970]">
                      Sehat: &ge; 40%<br />
                      Kritis: &lt; 25%
                    </td>
                    <td className="p-3 text-[#b0c4de]">
                      Persentase ikatan di mana siswa saling memilih satu sama lain. Resiprositas tinggi mengindikasikan ikatan persahabatan sejati dan kohesi stabil.
                    </td>
                  </tr>

                  <tr className="hover:bg-white/5">
                    <td className="p-3 font-bold text-purple-300">Network Density (Kerapatan Jaringan)</td>
                    <td className="p-3 font-mono text-[11px] text-[#b0c4de]">
                      D = E / (N &times; (N - 1))<br />
                      (N = jumlah siswa kelas)
                    </td>
                    <td className="p-3 font-bold text-purple-400">
                      Terpadu: &ge; 0.20<br />
                      Terpecah: &lt; 0.12
                    </td>
                    <td className="p-3 text-[#b0c4de]">
                      Rasio ikatan nyata terhadap seluruh kemungkinan ikatan teoritis. Menandakan apakah kelas bersifat guyub atau terfragmentasi ke klik-klik eksklusif.
                    </td>
                  </tr>

                  <tr className="hover:bg-white/5">
                    <td className="p-3 font-bold text-amber-300">Betweenness Centrality &amp; Bridge</td>
                    <td className="p-3 font-mono text-[11px] text-[#b0c4de]">
                      C_B(v) = Σ (σ_st(v) / σ_st)
                    </td>
                    <td className="p-3 font-bold text-amber-400">
                      Top 10% di kelas
                    </td>
                    <td className="p-3 text-[#b0c4de]">
                      Siswa bertindak sebagai "jembatan sosial" yang menyambungkan kelompok-kelompok berbeda. Figur sentral untuk meredakan polarisasi rombel.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#b0c4de]">
              <strong className="text-white block mb-1">Pedoman Interpretasi Ambang Batas Kelas:</strong>
              Apabila suatu rombongan belajar memiliki tingkat resiprositas di bawah 25% dan kerapatan di bawah 0.12, Guru BK disarankan menyusun <em>program dinamika kelompok terstruktur</em>, penataan ulang formasi bangku belajar, serta penugasan proyek silang antar-kelompok.
            </div>
          </div>
        </section>

        {/* ===================== BAB 4. ENGINE LOGICS & COIE-DODGE ===================== */}
        <section id="engine" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            4
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-[#f0c040]" />
            <span>Engine Logics &amp; Sistem Cut-Off Klasifikasi (Coie &amp; Dodge 1982)</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Bagaimana mesin Radar Sosial mengolah skor mentah menjadi klasifikasi status sosiometri 5 kategori tanpa bias subjektif.
          </p>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#e8edf5]/90">
            <p>
              Banyak sistem sosiometri tradisional hanya menghitung jumlah pilihan mentah tanpa mempertimbangkan ukuran kelas atau standar deviasi. Radar Sosial menerapkan algoritma baku psikometri dari model <strong>Coie, Dodge, &amp; Coppotelli (1982)</strong> yang diperbarui oleh <strong>Newcomb &amp; Bukowski (1983)</strong>.
            </p>

            {/* Algoritma 3 Langkah */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#0d3555] border border-[#1a3f64] space-y-2">
                <span className="px-2 py-0.5 rounded bg-[#f0c040] text-[#0a2a4a] text-[10px] font-bold">Langkah 1</span>
                <h4 className="font-bold text-white text-xs">Standardisasi Z-Score</h4>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Jumlah pilihan suka mentah (L) dan tidak suka (D) distandardisasi menjadi skor-Z berbasis rata-rata (&mu;) dan simpangan baku (&sigma;) kelas:
                </p>
                <div className="p-2 rounded bg-black/40 font-mono text-[10px] text-[#f7d970] text-center">
                  Z_L = (L - &mu;_L) / &sigma;_L &bull; Z_D = (D - &mu;_D) / &sigma;_D
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0d3555] border border-[#1a3f64] space-y-2">
                <span className="px-2 py-0.5 rounded bg-[#f0c040] text-[#0a2a4a] text-[10px] font-bold">Langkah 2</span>
                <h4 className="font-bold text-white text-xs">Kalkulasi SP &amp; SI</h4>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Menghitung <em>Social Preference</em> (Preferensi Sosial) dan <em>Social Impact</em> (Dampak Sosial), lalu menstandardisasi ulang keduanya menjadi Z_SP dan Z_SI:
                </p>
                <div className="p-2 rounded bg-black/40 font-mono text-[10px] text-cyan-300 text-center">
                  SP = Z_L - Z_D &bull; SI = Z_L + Z_D
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0d3555] border border-[#1a3f64] space-y-2">
                <span className="px-2 py-0.5 rounded bg-[#f0c040] text-[#0a2a4a] text-[10px] font-bold">Langkah 3</span>
                <h4 className="font-bold text-white text-xs">Evaluasi Sistem Cut-Off</h4>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Mesin mengevaluasi kondisi logis matematis cut-off point secara deterministik untuk menentukan satu dari lima status sosiometri Coie-Dodge.
                </p>
                <div className="p-2 rounded bg-black/40 font-mono text-[10px] text-emerald-300 text-center">
                  Model 5 Kuadran Status
                </div>
              </div>
            </div>

            {/* TABEL CUT-OFF DETERMINASI */}
            <div className="overflow-x-auto border-2 border-[#1a3f64] rounded-2xl bg-[#0a2a4a] my-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0d3555] text-white font-serif border-b border-[#1a3f64]">
                    <th className="p-3.5">Status Klasifikasi</th>
                    <th className="p-3.5">Aturan Cut-Off Logis Mesin</th>
                    <th className="p-3.5">Ciri Interaksi Sosial di Kelas</th>
                    <th className="p-3.5">Fokus Arahan Guru BK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a3f64]">
                  <tr className="hover:bg-white/5 bg-amber-500/5">
                    <td className="p-3.5 font-bold text-[#f0c040]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f0c040]" />
                        <span>Popular (Disukai Luas)</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[#f7d970]">
                      Z_SP &gt; +1.0<br />
                      Z_L &gt; 0 dan Z_D &lt; 0
                    </td>
                    <td className="p-3.5 text-[#b0c4de]">
                      Banyak disukai, sangat sedikit atau nol penolakan. Memiliki pengaruh positif, luwes bergaul, dan sering dijadikan teladan.
                    </td>
                    <td className="p-3.5 text-white">
                      Berdayakan sebagai <em>peer mediator</em>, ketua tim kolaboratif, atau penggerak kampanye kebaikan kelas.
                    </td>
                  </tr>

                  <tr className="hover:bg-white/5 bg-rose-500/5">
                    <td className="p-3.5 font-bold text-rose-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span>Rejected (Memerlukan Bimbingan)</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-rose-300">
                      Z_SP &lt; -1.0<br />
                      Z_L &lt; 0 dan Z_D &gt; 0
                    </td>
                    <td className="p-3.5 text-[#b0c4de]">
                      Menerima banyak penolakan dan minim pilihan suka. Rentan mengalami frustrasi sosial atau konflik relasi berulang.
                    </td>
                    <td className="p-3.5 text-white">
                      <strong>Prioritas Konseling:</strong> Identifikasi akar penolakan (apakah agresi atau defisit sosial), beri pelatihan ketenangan &amp; penerimaan.
                    </td>
                  </tr>

                  <tr className="hover:bg-white/5">
                    <td className="p-3.5 font-bold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                        <span>Neglected (Terabaikan / Kurang Terlihat)</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      Z_SI &lt; -1.0<br />
                      Pilihan mentah L &le; 1
                    </td>
                    <td className="p-3.5 text-[#b0c4de]">
                      Jarang dipilih dan jarang ditolak. "Tidak terlihat" (*invisible*) dalam dinamika kelompok, cenderung pemalu atau penyendiri.
                    </td>
                    <td className="p-3.5 text-white">
                      Fasilitasi pelan-pelan ke dalam kelompok kecil suportif (2-3 siswa ramah), latih keberanian asertif dan percaya diri.
                    </td>
                  </tr>

                  <tr className="hover:bg-white/5 bg-purple-500/5">
                    <td className="p-3.5 font-bold text-purple-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span>Controversial (Kontroversial / Terbelah)</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-purple-300">
                      Z_SI &gt; +1.0<br />
                      Z_L &gt; 0 dan Z_D &gt; 0
                    </td>
                    <td className="p-3.5 text-[#b0c4de]">
                      Banyak yang sangat menyukai sekaligus banyak yang menolak. Figur dominan, vokal, berkepribadian kuat namun memicu polarisasi.
                    </td>
                    <td className="p-3.5 text-white">
                      Arahkan energi kepemimpinan agar lebih empati terhadap teman lain, serta kurangi gaya interaksi yang mendominasi berlebihan.
                    </td>
                  </tr>

                  <tr className="hover:bg-white/5">
                    <td className="p-3.5 font-bold text-cyan-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                        <span>Average (Rata-Rata / Dinamis Wajar)</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-cyan-400">
                      -1.0 &le; Z_SP &le; +1.0<br />
                      -1.0 &le; Z_SI &le; +1.0
                    </td>
                    <td className="p-3.5 text-[#b0c4de]">
                      Tingkat penerimaan dan penolakan berada dalam rentang normal kelas. Merupakan pilar penstabil iklim sosial rombel.
                    </td>
                    <td className="p-3.5 text-white">
                      Pertahankan dinamika relasi sehat melalui bimbingan klasikal tematik tentang kerja sama dan empati.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ===================== BAB 5. ANALISIS TEMATIK SEMANTIK LLM ===================== */}
        <section id="tematik" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            5
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-[#f0c040]" />
            <span>Landasan Metodologi 4: Analisis Tematik Semantik LLM (Braun &amp; Clarke 2006)</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Mengubah catatan naratif observasi anekdotal Guru BK menjadi klaster tema psikososial terstruktur dan sintesis iklim kelas berbasis AI.
          </p>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#e8edf5]/90">
            <p>
              Status sosiometri kuantitatif (Z-Score) menjawab pertanyaan <em>"siapa yang populer atau ditolak?"</em>, namun tidak mampu menjawab <em>"mengapa peristiwa penolakan terjadi?"</em> dan <em>"bagaimana dinamika emosional di balik interaksi tersebut?"</em>. Di sinilah <strong>Analisis Tematik (Thematic Analysis)</strong> berperan sebagai jembatan kualitatif esensial.
            </p>
            <p>
              Radar Sosial mengadopsi kerangka kerja <strong>Braun &amp; Clarke (2006)</strong> yang dialihbahasakan ke dalam mesin pemrosesan bahasa alami (NLP) dan Large Language Model (LLM). Kerangka ini mengekstraksi tema psikologis melalui 6 tahapan terstruktur:
            </p>

            {/* 6 Tahap Analisis Tematik Braun & Clarke */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-3">
              <div className="p-3.5 rounded-xl bg-[#0d3555] border border-cyan-500/30 space-y-1">
                <span className="px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-bold">Fase 1</span>
                <h4 className="font-bold text-white text-xs">Familiarisasi Teks</h4>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Konselor menulis catatan observasi anekdotal, transkrip konseling, atau laporan wali kelas ke dalam sistem.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d3555] border border-blue-500/30 space-y-1">
                <span className="px-2 py-0.5 rounded bg-blue-400/20 text-blue-300 text-[10px] font-bold">Fase 2</span>
                <h4 className="font-bold text-white text-xs">Pembangkitan Kode Awal</h4>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Mesin membedah leksikal narasi mencari kata kunci psikososial (misal: <em>"diejek", "menangis", "berinisiatif"</em>).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d3555] border border-amber-500/30 space-y-1">
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">Fase 3</span>
                <h4 className="font-bold text-white text-xs">Pencarian Klaster Tema</h4>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Kode-kode relevan dipetakan ke dalam 6 tema baku psikososial yang telah divalidasi oleh pakar bimbingan konseling.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d3555] border border-purple-500/30 space-y-1">
                <span className="px-2 py-0.5 rounded bg-purple-400/20 text-purple-300 text-[10px] font-bold">Fase 4</span>
                <h4 className="font-bold text-white text-xs">Peninjauan Tema</h4>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Sistem mengevaluasi kecocokan tema dengan konteks (observasi kelas, bimbingan kelompok, atau konseling privat).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d3555] border border-emerald-500/30 space-y-1">
                <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 text-[10px] font-bold">Fase 5</span>
                <h4 className="font-bold text-white text-xs">Definisi &amp; Sentimen</h4>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Menghitung tingkat polaritas emosi (Kritis, Perlu Perhatian, Positif, Netral) dan ringkasan intisari per siswa.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d3555] border border-[#f0c040]/30 space-y-1">
                <span className="px-2 py-0.5 rounded bg-[#f0c040]/20 text-[#f7d970] text-[10px] font-bold">Fase 6</span>
                <h4 className="font-bold text-white text-xs">Sintesis Laporan Resmi</h4>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Menyusun narasi iklim kelas holistik dan preskripsi konseling terapan yang disinkronkan ke Bab VII Dokumen PDF A4.
                </p>
              </div>
            </div>

            {/* 6 Tema Sosiometrik Baku */}
            <div className="space-y-3 pt-2">
              <h3 className="font-serif text-sm font-bold text-[#f7d970] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#f0c040]" />
                <span>Enam Taksonomi Tema Sosiometrik Baku Radar Sosial:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-purple-300 text-xs">1. Kecemasan Sosial &amp; Penarikan Diri</strong>
                    <span className="text-[10px] bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded">Perhatian</span>
                  </div>
                  <p className="text-[#b0c4de] text-[11px]">
                    Kecenderungan menunduk, gemetar saat presentasi, enggan bicara jika tidak ditunjuk, menghindari kontak mata, dan menyendiri di pojok kelas.
                  </p>
                  <div className="text-[10px] text-purple-200/80 font-mono">
                    Kata Kunci: cemas, takut, menyendiri, pasif, minder, ragu, gugup, menarik diri.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-rose-300 text-xs">2. Kerentanan Viktimisasi / Isolasi Sebaya</strong>
                    <span className="text-[10px] bg-rose-900/60 text-rose-200 px-2 py-0.5 rounded font-bold">Kritis</span>
                  </div>
                  <p className="text-[#b0c4de] text-[11px]">
                    Pengalaman menjadi sasaran ejekan, dijauhi teman sekelompok, menangis di sudut kelas, tidak diajak saat jam istirahat, atau barang-barangnya disembunyikan.
                  </p>
                  <div className="text-[10px] text-rose-200/80 font-mono">
                    Kata Kunci: bully, ejek, dikucilkan, menangis, sendirian, ditolak, terisolasi, diabaikan.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-300 text-xs">3. Agresivitas Reaktif &amp; Regulasi Emosi</strong>
                    <span className="text-[10px] bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded">Perhatian / Kritis</span>
                  </div>
                  <p className="text-[#b0c4de] text-[11px]">
                    Reaksi membentak teman saat kalah permainan, melempar barang ketika frustrasi, mendominasi tugas kelompok tanpa mendengar pendapat kawan.
                  </p>
                  <div className="text-[10px] text-amber-200/80 font-mono">
                    Kata Kunci: marah, memukul, membentak, meledak, emosi, membantah, impulsif, dominan.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-emerald-300 text-xs">4. Kepemimpinan Prokolektif &amp; Inklusi</strong>
                    <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded">Positif</span>
                  </div>
                  <p className="text-[#b0c4de] text-[11px]">
                    Inisiatif mengajak kawan yang sendirian untuk bergabung, memediasi perselisihan teman sebaya dengan bijak, dan menjadi jembatan antar-kelompok.
                  </p>
                  <div className="text-[10px] text-emerald-200/80 font-mono">
                    Kata Kunci: memimpin, merangkul, mengajak, inisiatif, mendamaikan, mengayomi, aktif.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-sky-300 text-xs">5. Dukungan &amp; Resiprositas Pertemanan</strong>
                    <span className="text-[10px] bg-sky-900/60 text-sky-200 px-2 py-0.5 rounded">Positif</span>
                  </div>
                  <p className="text-[#b0c4de] text-[11px]">
                    Hubungan persahabatan hangat dua arah, kerelaan meminjamkan alat tulis, saling mengajari materi pelajaran sulit, dan saling menghibur saat sedih.
                  </p>
                  <div className="text-[10px] text-sky-200/80 font-mono">
                    Kata Kunci: bersahabat, kompak, membantu, berbagi, setia, saling dukung, akrab.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-indigo-300 text-xs">6. Klik Tertutup &amp; Eksklusivitas Kelompok</strong>
                    <span className="text-[10px] bg-indigo-900/60 text-indigo-200 px-2 py-0.5 rounded">Perhatian</span>
                  </div>
                  <p className="text-[#b0c4de] text-[11px]">
                    Terbentuknya kelompok pertemanan yang sangat eksklusif, menolak kehadiran anggota baru di luar lingkaran kecilnya, atau membuat polarisasi antargeng.
                  </p>
                  <div className="text-[10px] text-indigo-200/80 font-mono">
                    Kata Kunci: klik, geng, kelompok sendiri, eksklusif, membatasi, kubu, gengsi.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-[#0d3555] to-[#1a3f64] border border-[#f0c040]/40 text-xs space-y-2">
              <strong className="text-[#f7d970] block">Integrasi Dual-Layer Analisis Tematik:</strong>
              <p className="text-[#b0c4de]">
                Sistem beroperasi dalam mode ganda: <strong>Pencocokan Deterministik NLP</strong> berjalan seketika di peramban untuk responsivitas instan tanpa jeda, dipadukan dengan <strong>Sintesis Reflektif LLM</strong> yang merangkum keseluruhan data kelas menjadi paragraf narasi evaluasi iklim pertemanan dan preskripsi konseling profesional.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== BAB 6. RADAR PERILAKU ===================== */}
        <section id="radar-perilaku" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            6
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-[#f0c040]" />
            <span>Radar Perilaku Sebaya &amp; Logika Interpretasi Dual-Radar</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Mengapa status sosiometri saja tidak cukup? Menghubungkan persepsi sosial dengan bukti perilaku konkret.
          </p>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#e8edf5]/90">
            <p>
              Status sosiometri menggambarkan <em>bagaimana siswa dipersepsikan oleh kelompoknya</em>. Namun, seorang konselor memerlukan pemahaman tentang <em>mengapa</em> siswa tersebut dipersepsikan demikian. Oleh karena itu, Radar Sosial menyandingkan <strong>Radar Sosiometri</strong> dengan <strong>Radar Perilaku Sebaya (Peer Behavior Assessment)</strong> yang mengukur 5 dimensi fundamental (skala 0 - 100):
            </p>

            {/* 5 Dimensi Perilaku Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-3">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-sm">1. Perilaku Prososial</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-black/30 px-2 py-0.5 rounded">Skala 0-100</span>
                </div>
                <p className="text-[#b0c4de] text-xs">
                  Tingkat kesukarelaan tolong-menolong, kemauan berbagi catatan pelajaran, empati saat teman bersedih, dan sikap ramah inklusif.
                </p>
                <div className="text-[11px] text-emerald-200/90 font-medium">
                  <strong>Logika Analisis:</strong> Memiliki korelasi positif terkuat ($r \ge +0.55$) dengan status <em>Popular</em>. Menjadi benteng utama pelindung ikatan persahabatan.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 text-sm">2. Regulasi Emosi &amp; Ketenangan</span>
                  <span className="text-[10px] font-mono text-sky-400 bg-black/30 px-2 py-0.5 rounded">Skala 0-100</span>
                </div>
                <p className="text-[#b0c4de] text-xs">
                  Kemampuan mengendalikan amarah saat diejek, kesabaran menunggu giliran, ketenangan saat menghadapi kegagalan atau candaan teman.
                </p>
                <div className="text-[11px] text-sky-200/90 font-medium">
                  <strong>Logika Analisis:</strong> Skor rendah pada dimensi ini (mudah meledak/temperamental) adalah prediktor utama lonjakan penolakan teman sebaya ($Z_D$).
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 text-sm">3. Keberanian Sosial (Social Courage)</span>
                  <span className="text-[10px] font-mono text-purple-400 bg-black/30 px-2 py-0.5 rounded">Skala 0-100</span>
                </div>
                <p className="text-[#b0c4de] text-xs">
                  Keberanian bersuara di depan umum, mengajak teman yang sendirian untuk ikut bermain, dan berani membela kawan yang diperlakukan tidak adil.
                </p>
                <div className="text-[11px] text-purple-200/90 font-medium">
                  <strong>Logika Analisis:</strong> Mengubah popularitas pasif menjadi kepemimpinan aktif (*upstander behavior*).
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm">4. Kontrol Diri &amp; Ketertiban Kelompok</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-black/30 px-2 py-0.5 rounded">Skala 0-100</span>
                </div>
                <p className="text-[#b0c4de] text-xs">
                  Kedisiplinan menghormati kesepakatan belajar bersama, tidak memotong pembicaraan, dan konsentrasi saat aktivitas kooperatif.
                </p>
                <div className="text-[11px] text-amber-200/90 font-medium">
                  <strong>Logika Analisis:</strong> Siswa impulsif sering ditolak bukan karena jahat, melainkan karena mengganggu kenyamanan belajar kelompok.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 sm:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 text-sm">5. Indeks Ketahanan Relasional (Kerentanan Isolasi)</span>
                  <span className="text-[10px] font-mono text-rose-400 bg-black/30 px-2 py-0.5 rounded">Skala 0-100</span>
                </div>
                <p className="text-[#b0c4de] text-xs">
                  Tingkat kerentanan siswa terhadap pengabaian teman atau tekanan interaksi yang tidak seimbang di lingkungan sekolah.
                </p>
                <div className="text-[11px] text-rose-200/90 font-medium">
                  <strong>Logika Analisis:</strong> Bila indeks ini tinggi (&ge; 65) berpadu dengan status <em>Rejected</em> atau <em>Neglected</em>, sistem secara otomatis menerbitkan rekomendasi prioritas pendampingan konseling intensif.
                </div>
              </div>
            </div>

            {/* Logika Diagnostik Diferensial */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d3555] to-[#1a3f64] border-2 border-[#f0c040] space-y-3">
              <h3 className="font-serif text-sm font-bold text-[#f7d970] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f0c040]" />
                <span>Logika Diagnostik Diferensial Konselor (Matriks Sosiometri &times; Perilaku)</span>
              </h3>
              <p className="text-xs text-white leading-relaxed">
                Melalui penggabungan dua radar ini, Guru BK dapat membedakan akar masalah sosial siswa secara jernih:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                  <strong className="text-rose-300 block mb-1">Kasus A: Ditolak Agresif (*Aggressive-Rejected*)</strong>
                  <span className="text-[#b0c4de]">Status Rejected + Regulasi Emosi Rendah + Prososial Rendah.</span>
                  <div className="text-white mt-1 text-[11px]">Intervensi: Pelatihan manajemen amarah, empati kognitif, dan restrukturisasi perilaku impulsif.</div>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                  <strong className="text-amber-300 block mb-1">Kasus B: Ditolak Menarik Diri (*Withdrawn-Rejected*)</strong>
                  <span className="text-[#b0c4de]">Status Rejected + Regulasi Emosi Tinggi + Keberanian Sosial Rendah.</span>
                  <div className="text-white mt-1 text-[11px]">Intervensi: Pelatihan keterampilan sosial dasar, penugasan berpasangan, perlindungan dari pengucilan.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== BAB 7. WORKSPACE CATATAN KUALITATIF SISWA ===================== */}
        <section id="catatan-kualitatif" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            7
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#f0c040]" />
            <span>Workspace Catatan Kualitatif Siswa &amp; Refleksi Naratif Guru BK</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Pencatatan komprehensif dua arah (Catatan Observasi Konselor &amp; Catatan Curahan Hati Siswa ke Guru BK), klasifikasi semantik otomatis seketika, analisis klaster tematik, dan sinkronisasi ke Bab VII Laporan Cetak Resmi PDF A4.
          </p>

          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#e8edf5]/90">
            <p>
              Di bilah navigasi atas, Guru BK kini memiliki akses langsung ke tab <strong>"Catatan Kualitatif"</strong>. Ruang kerja ini memungkinkan konselor menghimpun data kualitatif dari dua sumber utama: <strong>observasi objektif guru BK</strong> di lingkungan sekolah serta <strong>catatan curahan hati / laporan langsung siswa ke Guru BK</strong> melalui sesi konseling privat atau bimbingan kelompok.
            </p>

            {/* Dua Pilar Sumber Catatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-3">
              <div className="p-4 rounded-xl bg-[#0d3555] border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Users className="w-4 h-4" />
                  <span>A. Catatan Observasi Guru BK &amp; Pendidik</span>
                </div>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Mendokumentasikan insiden perilaku nyata: interaksi diskusi kelompok, friksi saat olahraga, fenomena pembentukan klik bermain eksklusif saat jam istirahat, serta keaktifan menolong rekan sekelas.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d3555] border border-[#f0c040]/40 space-y-2">
                <div className="flex items-center gap-2 text-[#f7d970] font-bold text-xs">
                  <Heart className="w-4 h-4 text-[#f0c040]" />
                  <span>B. Catatan Curahan Hati Siswa ke Guru BK</span>
                </div>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Menampung keluhan dan curhatan langsung peserta didik: kecemasan saat kerja kelompok, rasa terabaikan, tekanan konformitas kelompok (*peer pressure*), ketakutan diasingkan teman, maupun laporan kepedulian antar-rekan (*peer-support*).
                </p>
              </div>
            </div>

            {/* Fitur Kunci Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-3">
              <div className="p-4 rounded-xl bg-[#0d3555] border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Keyboard className="w-4 h-4" />
                  <span>1. Input Observasi Multikonteks &amp; Konseling</span>
                </div>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Konselor memilih nama siswa dan konteks kejadian: <em>Observasi Kelas, Sesi Konseling Individu, Bimbingan Kelompok, Laporan Teman Sebaya, Interaksi Jam Istirahat,</em> atau <em>Insiden Anekdotal</em>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d3555] border border-[#f0c040]/40 space-y-2">
                <div className="flex items-center gap-2 text-[#f7d970] font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-[#f0c040]" />
                  <span>2. Asisten Semantik Seketika (Real-Time AI)</span>
                </div>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Saat konselor mengetikkan narasi catatan, kotak <strong>"Deteksi Semantik Real-Time"</strong> secara otomatis memunculkan tema sosiometrik yang cocok, polaritas sentimen (*Kritis, Perlu Perhatian, Positif*), serta saran preskripsi bimbingan secara instan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d3555] border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <PieChart className="w-4 h-4" />
                  <span>3. Panel Sintesis Iklim Tematik Rombel</span>
                </div>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Menyajikan bilah statistik persentase 6 tema tematik di rombel aktif, tone iklim psikososial kelas, dan daftar arahan preskripsi konseling prioritas yang disintesis dari keseluruhan catatan siswa.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d3555] border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <FolderSync className="w-4 h-4" />
                  <span>4. Sinkronisasi Narasi Refleksi Konselor</span>
                </div>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Guru BK dapat menyunting narasi refleksi kelas secara mandiri, atau memanfaatkan tombol <strong>"Salin Narasi AI ke Catatan Guru BK"</strong> untuk langsung mengadopsi sintesis sistem ke dalam catatan evaluasi resmi rombel.
                </p>
              </div>
            </div>

            {/* Fitur Simulasi Data */}
            <div className="p-4 rounded-xl bg-[#061c30] border-2 border-[#f0c040] space-y-2.5">
              <div className="flex items-center gap-2 text-[#f0c040] font-bold text-sm">
                <FolderPlus className="w-4 h-4" />
                <span>Simulasi Data Catatan Siswa ke Guru BK &amp; Hasil Analisis Tematik</span>
              </div>
              <p className="text-[#b0c4de] text-xs leading-relaxed">
                Untuk keperluan pelatihan konselor baru, simulasi data, atau uji akreditasi, sistem menyediakan <strong>15 catatan simulasi komprehensif</strong> yang mencakup: curahan hati siswa terisolasi (*Budi, Jaka*), kecemasan sosial dan penarikan diri (*Erna*), inisiatif kepedulian teman sebaya (*Nabila, Citra*), kepemimpinan prososial (*Dimas, Rizky*), tekanan kelompok/peer pressure (*Rangga, Siti*), dan regulasi emosi (*Fajar*). Seluruh catatan langsung terhubung dengan klasifikasi tematik otomatis dan sintesis iklim kelas.
              </p>
            </div>

            {/* Integrasi ke Laporan Cetak PDF */}
            <div className="p-4 rounded-xl bg-[#0d3555] border border-white/10 space-y-2 text-xs">
              <strong className="text-white text-sm block">Integrasi Otomatis ke Dokumen Cetak Resmi PDF A4 (Bab VII):</strong>
              <p className="text-[#b0c4de]">
                Semua catatan kualitatif yang tersimpan otomatis dicetak ke <strong>Bab VII (Catatan Kualitatif Siswa &amp; Refleksi Naratif Guru BK)</strong> pada Dokumen Laporan Resmi A4, lengkap dengan tabel rincian observasi per siswa, tema terdeteksi, badge sentimen, dan kolom tanda tangan pengesahan Kepala Sekolah.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== BAB 8. INPUT DATA ===================== */}
        <section id="input" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            8
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Keyboard className="w-6 h-6 text-[#f0c040]" />
            <span>Tata Cara Pengumpulan Data: Kuesioner Ramah Siswa A4 &amp; Format Excel</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Prosedur praktis pembagian kuesioner sosiometri ramah peserta didik dan alur impor data ke dalam sistem.
          </p>

          <div className="space-y-4 text-xs sm:text-sm text-[#e8edf5]">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2.5">
              <h3 className="font-serif text-base font-bold text-[#f0c040] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>1. Instrumen Kuesioner Siswa (Format Bersih Cukup Teks Nama Sekolah):</span>
              </h3>
              <p className="text-xs text-[#b0c4de] leading-relaxed">
                Lembar instrumen kuesioner siswa pada tab <strong>"Kuesioner Siswa (A4)"</strong> berformat bersih tanpa logo, tanpa teks kementerian/dinas, dan <strong>hanya menampilkan teks Nama Satuan Pendidikan (Sekolah/Madrasah)</strong>. Desain minimalis ini menjaga kenyamanan psikologis peserta didik, menjamin kerahasiaan penuh (*konselor-only*), serta menghilangkan kekhawatiran siswa bahwa lembar ini dinilai sebagai evaluasi akademis.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2">
              <h3 className="font-serif text-base font-bold text-cyan-300 flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>2. Alur Pengisian via Template Excel (Disarankan):</span>
              </h3>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[#e8edf5]">
                <li>Di dashboard Guru BK, klik tombol <strong>"Unggah Excel Template"</strong>.</li>
                <li>Klik tombol <strong>"Unduh Format Template Excel"</strong> yang sudah tersedia dengan baris contoh.</li>
                <li>Buka file di Microsoft Excel atau Google Sheets. Isikan nama siswa pada kolom <code>nama</code>, rombel pada kolom <code>kelas</code>, dan jenis kelamin (<code>L</code> atau <code>P</code>).</li>
                <li>Masukkan pilihan teman belajar di kolom <code>like_belajar</code> (pisahkan dengan koma/spasi, maksimal 3 nama).</li>
                <li>Masukkan pilihan teman bermain di kolom <code>like_bermain</code>.</li>
                <li>(Opsional namun dianjurkan) Masukkan nama teman yang cenderung dihindari pada kolom <code>dislike_belajar</code> dan <code>dislike_bermain</code>.</li>
                <li>Simpan file dan seret (*drag-and-drop*) kembali ke kotak dialog unggah di aplikasi.</li>
              </ol>
            </div>

            <div className="bg-amber-500/10 border-l-4 border-amber-400 p-3 rounded-r-xl text-xs text-amber-200">
              <strong>Tips Konsistensi Nama:</strong> Pastikan ejaan nama yang ditulis dalam kolom nominasi sama persis dengan nama yang tercantum di daftar siswa. Sistem telah dilengkapi algoritma pencocokan cerdas (*fuzzy name matching*), namun konsistensi penulisan akan menghasilkan kalkulasi jejaring graf yang paling akurat.
            </div>
          </div>
        </section>

        {/* ===================== BAB 9. SISTEM KEAMANAN AKUN & PERMOHONAN MANDIRI ===================== */}
        <section id="autentikasi" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            9
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Key className="w-6 h-6 text-[#f0c040]" />
            <span>Sistem Keamanan Akun &amp; Alur Permohonan Mandiri Kata Sandi</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Peningkatan arsitektur keamanan: penghapusan tombol quick-switch publik, permohonan mandiri, dan approval workflow oleh Super-Admin.
          </p>

          <div className="space-y-4 text-xs sm:text-sm text-[#e8edf5]/90 leading-relaxed">
            <p>
              Untuk memastikan kerahasiaan data sosiometri anak sesuai kode etik konseling dan perlindungan data pribadi siswa, Radar Sosial telah <strong>menghapus tombol quick-switch kredensial di halaman login publik</strong>. Setiap pengguna wajib masuk menggunakan kata sandi resmi yang telah terverifikasi.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-3">
              <div className="p-4 rounded-xl bg-[#0d3555] border border-cyan-500/30 space-y-2">
                <strong className="text-cyan-300 text-xs block">1. Alur Guru BK / Kepala Sekolah Baru:</strong>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Pada layar login, klik tautan <em>"Belum punya akun atau lupa password? Ajukan Akses di Sini"</em>. Isi nama lengkap, email kedinasan, NIP, peran yang diajukan (Guru BK / Kepala Sekolah), nama madrasah, dan alasan pengajuan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d3555] border border-purple-500/30 space-y-2">
                <strong className="text-purple-300 text-xs block">2. Verifikasi &amp; Approval Super-Admin:</strong>
                <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                  Super-Admin di <strong>Dashboard Super-Admin Lab Hub</strong> akan menerima notifikasi permohonan. Admin memverifikasi keabsahan data, menetapkan kata sandi aman, dan menyetujui akun secara resmi ke dalam sistem.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#b0c4de]">
              <strong>Perlindungan Akun Admin:</strong> Akun Super-Admin Lab Hub dilindungi dengan protokol keamanan tingkat tinggi dan hanya dapat diakses oleh administrator resmi dari unit Psychosophia Behavioral Lab.
            </div>

            <div className="p-4 rounded-xl bg-[#0d3555] border border-emerald-500/30 space-y-2">
              <strong className="text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sinkronisasi Cloud Real-Time Antar-Peramban (Firebase Firestore)
              </strong>
              <p className="text-[#b0c4de] text-[11px] leading-relaxed">
                Radar Sosial kini terintegrasi penuh dengan <strong>Firebase Firestore Cloud Database</strong>. Seluruh entitas data — meliputi profil sekolah, rombongan belajar, master siswa, catatan kualitatif anekdotal, nominasi sosiometri, dan refleksi Guru BK — tersinkronisasi secara otomatis dan dua-arah antar berbagai peramban (browser) dan perangkat tanpa jeda. Sistem juga dilengkapi mekanisme <em>offline-first resilience</em>; data tetap dapat diakses dan diinput dalam kondisi internet tidak stabil dan otomatis disinkronkan kembali saat koneksi pulih.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== BAB 10. DASHBOARD TIGA PERAN ===================== */}
        <section id="dashboard" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            10
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <PieChart className="w-6 h-6 text-[#f0c040]" />
            <span>Navigasi &amp; Pembacaan Dashboard Tiga Peran</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Fasilitas antarmuka yang disesuaikan secara ergonomis untuk Guru BK, Kepala Sekolah, dan Administrator Lab.
          </p>

          <div className="space-y-4 text-xs sm:text-sm text-[#e8edf5]">
            <div className="p-4 rounded-xl bg-[#0d3555] border border-[#1a3f64] space-y-1.5">
              <strong className="text-[#f0c040] text-sm block">1. Dashboard Guru BK (Konselor Sekolah):</strong>
              <p className="text-[#b0c4de] text-xs leading-relaxed">
                Pusat kerja harian konselor. Dilengkapi dengan filter dinamis rombel &amp; kriteria sosiometri, kanvas interaktif jaring sosiogram dengan kontrol fisika pegas (*force-directed physics*), panel EWS deteksi siswa butuh pendampingan, radar komparasi individual, workspace catatan kualitatif, serta form rencana aksi bimbingan konseling terintegrasi.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0d3555] border border-[#1a3f64] space-y-1.5">
              <strong className="text-cyan-300 text-sm block">2. Dashboard Kepala Sekolah (Decision Support System / DSS):</strong>
              <p className="text-[#b0c4de] text-xs leading-relaxed">
                Ringkasan eksekutif makro sekolah. Menyajikan indeks kesehatan relasional antarkelas, metrik komparasi kohesi rombel, tinjauan iklim tematik umum, dan rekomendasi kebijakan manajerial untuk pembentukan rombel seimbang pada tahun ajaran baru.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0d3555] border border-[#1a3f64] space-y-1.5">
              <strong className="text-purple-300 text-sm block">3. Dashboard Super-Admin Lab Hub:</strong>
              <p className="text-[#b0c4de] text-xs leading-relaxed">
                Pusat analitik tingkat lanjut, manajemen persetujuan akun/kata sandi, dan tata kelola siklus asesmen. Memuat <strong>Matriks Heatmap Interaksi</strong> korelasi Pearson 5x5, <strong>Drill-Down Interaksi Rombel</strong> dengan plot sebaran node siswa dan audit ikatan dyadik, serta <strong>Manajemen Periode Asesmen</strong> multi-semester.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== BAB 11. CETAK LAPORAN ===================== */}
        <section id="cetak" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            11
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Printer className="w-6 h-6 text-[#f0c040]" />
            <span>Prosedur Cetak Laporan Resmi PDF A4 (Lengkap Bab VII) &amp; Kuesioner A4</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Dokumen terstandarisasi siap cetak dengan kop bersih yang hanya menampilkan teks nama satuan pendidikan.
          </p>

          <div className="space-y-3 text-xs leading-relaxed text-[#e8edf5]">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <strong className="text-[#f0c040] text-sm block">a. Laporan Resmi Hasil Pemetaan (PDF A4 Lengkap 7 Bab):</strong>
              <p className="text-[#b0c4de]">
                Klik tombol <strong>"Cetak Dokumen Resmi PDF"</strong> di bagian atas Dashboard Guru BK. Lembar laporan dibuka dengan <strong>Kop Elegan Teks Nama Sekolah/Madrasah</strong> (tanpa logo, tanpa teks kementerian/dinas, tanpa NPSN/unit layanan), Bab I-VI Analisis Kuantitatif Sosiometri &amp; Perilaku, <strong>Bab VII Catatan Kualitatif Siswa &amp; Refleksi Naratif Guru BK</strong>, serta lembar tanda tangan pengesahan ganda (Guru BK dan Kepala Sekolah).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <strong className="text-[#f7d970] text-sm block">b. Instrumen Kuesioner Siswa (A4 Cukup Teks Nama Sekolah):</strong>
              <p className="text-[#b0c4de]">
                Klik tab <strong>"Kuesioner Siswa (A4)"</strong> pada bilah navigasi atas. Dokumen kuesioner siap cetak/fotokopi memuat <strong>Teks Nama Satuan Pendidikan</strong> di bagian atas secara bersih dan simetris tanpa logo, dengan instruksi ramah siswa, petunjuk pengerjaan santun, dan kolom isian nominasi kriteria belajar dan bermain.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== BAB 12. TROUBLESHOOTING & PRIVASI ===================== */}
        <section id="trouble" className="py-8 border-b border-white/10 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            12
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#f0c040]" />
            <span>Troubleshooting, Etika Konseling &amp; Privasi Data BK</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Kepatuhan kode etik bimbingan konseling dan resolusi cepat kendala sistem.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="font-bold text-[#f0c040] block mb-1">Q: Bagaimana menjaga kerahasiaan pilihan sosiometri siswa?</span>
              <p className="text-[#b0c4de]">
                Siswa harus diyakinkan bahwa pilihan yang mereka tulis tidak akan pernah dibocorkan kepada teman sekelas. Hanya Guru BK yang memiliki kewenangan membuka data individu demi kemaslahatan bimbingan.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="font-bold text-[#f0c040] block mb-1">Q: Mengapa hasil sosiogram tampak sangat padat dan saling bertumpuk?</span>
              <p className="text-[#b0c4de]">
                Anda dapat menggunakan slider daya tolak (*Repulsion Force*) dan panjang tautan (*Link Distance*) di panel pengaturan kanvas untuk merenggangkan node, atau menggunakan tombol filter untuk menampilkan satu gender atau kriteria tertentu saja.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="font-bold text-[#f0c040] block mb-1">Q: Apakah data tersimpan aman jika browser ditutup?</span>
              <p className="text-[#b0c4de]">
                Ya. Layanan persistensi lokal menyimpan data secara aman di peramban Anda. Anda juga dapat menggunakan tombol Ekspor CSV/JSON di dashboard admin untuk membuat salinan cadangan (*backup*) secara berkala.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== BAB 13. PUSAT BANTUAN ===================== */}
        <section id="kontak" className="py-8 scroll-mt-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f0c040] text-[#0a2a4a] font-extrabold text-lg mb-3 shadow-lg">
            13
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <Headphones className="w-6 h-6 text-[#f0c040]" />
            <span>Pusat Bantuan &amp; Konsultasi Riset</span>
          </h2>
          <p className="text-[#b0c4de] text-sm mb-4">
            Dukungan teknis dan konsultasi metodologi dari tim peneliti laboratorium.
          </p>

          <div className="bg-gradient-to-br from-[#0d3555] to-[#1a3f64] border-2 border-[#f0c040] rounded-2xl p-6 text-center">
            <h3 className="font-serif text-xl font-bold text-[#f0c040] mb-2">
              Psychosophia Behavioral Lab
            </h3>
            <p className="text-xs text-[#b0c4de] max-w-lg mx-auto mb-4 leading-relaxed">
              Pusat Studi Perilaku, Bimbingan Konseling &amp; Penguatan Relasi Sekolah &bull; IAIN Syaikh Abdurrahman Siddik Bangka Belitung
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
              <span className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 text-white font-mono">
                📧 lab@radarsosial.id
              </span>
              <span className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 text-white font-mono">
                🌐 radar-sosial.vercel.app
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#061c30] border-t-2 border-[#f0c040] py-6 px-4 text-center text-xs text-[#b0c4de]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>Radar Sosial</strong> &bull; Buku Pedoman Metodologi &amp; Operasional &bull; Edisi 2026
          </span>
          <span className="text-[11px] text-[#b0c4de]/70">
            Psychosophia Behavioral Lab &bull; IAIN SAS Bangka Belitung
          </span>
        </div>
      </footer>
    </div>
  );
};
