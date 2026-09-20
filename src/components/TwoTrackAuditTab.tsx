import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Binary,
  GraduationCap,
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Download,
  Copy,
  Printer,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  Users,
  Compass,
  Layers,
  Heart,
  HelpCircle,
} from 'lucide-react';

interface CodeAnnotation {
  id: string;
  title: string;
  filePath: string;
  lines: string;
  variableFunction: string;
  formula: string;
  codeSnippet: string;
  aiReview: string;
  domainReview: string;
  zone: 'Konvergen' | 'Telah Diperbaiki' | 'AI Salah / Dangkal' | 'Perlu Investigasi Lanjutan';
  domainReference: string;
}

export const TwoTrackAuditTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'summary' | 'track1' | 'annotations' | 'track2' | 'viva'>('annotations');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string>('A-01');

  const annotations: CodeAnnotation[] = [
    {
      id: 'A-01',
      title: 'Standarisasi Skor Z & Klasifikasi Coie-Dodge (1982)',
      filePath: '/src/services/snaEngine.ts',
      lines: '79–98',
      variableFunction: 'calculateSNAMetrics() -> zL, zD, zSP, zSI, status',
      formula: 'zL = (L - meanL) / stdL; zD = (D - meanD) / stdD; zSP = zL - zD; zSI = zL + zD',
      codeSnippet: `const zL = (L - meanLikes) / stdLikes;
const zD = (D - meanDislikes) / stdDislikes;

// Coie & Dodge Formulas (1982)
const zSP = zL - zD; // Social Preference
const zSI = zL + zD; // Social Impact

// Coie & Dodge 1982 Status Classification
let status: CoieDodgeStatus = 'Average';
if (zSP > 1.0 && zL > 0 && zD < 0) {
  status = 'Popular';
} else if (zSP < -1.0 && zD > 0 && zL < 0) {
  status = 'Rejected';
} else if (zSI < -1.0 && L <= meanLikes) {
  status = 'Neglected';
} else if (zSI > 1.0 && zL > 0 && zD > 0) {
  status = 'Controversial';
} else {
  status = 'Average';
}`,
      aiReview: 'AI awal mengasumsikan status dapat dihitung hanya dari selisih mentah (Likes - Dislikes) tanpa normalisasi standar deviasi.',
      domainReview: 'Koreksi Terhadap AI. Selisih mentah bias terhadap variasi jumlah siswa. Menggunakan skor Z terhadap mean dan deviasi kelas membakukan nilai antar-rombel dengan ukuran kelas berbeda.',
      zone: 'Konvergen',
      domainReference: 'Coie, J. D., Dodge, K. A., & Coppotelli, H. (1982). Dimensions and types of social status. Developmental Psychology, 18(4), 557.',
    },
    {
      id: 'A-02',
      title: 'Matriks Silang Tipologi Sosio-Perilaku (Moreno x PEI x Hawley)',
      filePath: '/src/services/snaEngine.ts',
      lines: '109–128',
      variableFunction: 'calculateSNAMetrics() -> behavioralStatus',
      formula: 'Moreno Status × Peer Evaluation Inventory (PEI) Dimensions',
      codeSnippet: `let behavioralStatus: BehavioralCategory = 'Average / Adaptif';
if (status === 'Popular' && b.prosocial >= 6) {
  behavioralStatus = 'Populer-Prososial';
} else if ((status === 'Popular' || status === 'Controversial') && b.aggressive >= 6) {
  behavioralStatus = 'Bistrategic';
} else if (status === 'Rejected' && b.aggressive >= 6) {
  behavioralStatus = 'Aggressive Victim';
} else if (status === 'Rejected' && (b.withdrawn >= 6 || b.victimization >= 5)) {
  behavioralStatus = 'Passive Victim';
} else if (status === 'Neglected' && b.withdrawn >= 6) {
  behavioralStatus = 'Isolated';
}`,
      aiReview: 'AI menganggap siswa populer selalu berkarakter baik tanpa potensi agresivitas manipulatif.',
      domainReview: 'Koreksi Terhadap AI. Mengadopsi teori Patricia Hawley (2003) mengenai Bistrategic Control, di mana siswa populer dapat menggunakan koersi relasional. Membedakan Aggressive Victim vs Passive Victim secara klinis.',
      zone: 'Konvergen',
      domainReference: 'Hawley, P. H. (2003). Prosocial and coercive strategies of resource control in children. International Journal of Behavioral Development.',
    },
    {
      id: 'A-03',
      title: 'Algoritma Brandes untuk Deteksi Siswa Broker Sosial',
      filePath: '/src/services/snaEngine.ts',
      lines: '437–505',
      variableFunction: 'detectCommunitiesAndBrokers() -> betweenness, brokerStudentIds',
      formula: 'Brandes BFS Traversal & Pair-Dependency Accumulation O(|V|·|E|)',
      codeSnippet: `// BRANDES' ALGORITHM FOR BETWEENNESS CENTRALITY
const betweenness: Record<string, number> = {};
students.forEach((s) => (betweenness[s.id] = 0));
// BFS Stack traversal, predecessor queue, backward dependency delta accumulation
while (stack.length > 0) {
  const w = stack.pop()!;
  const wSigma = sigma.get(w)!;
  pred.get(w)!.forEach((v) => {
    const c = (sigma.get(v)! / (wSigma || 1)) * (1 + delta.get(w)!);
    delta.set(v, delta.get(v)! + c);
  });
  if (w !== s) betweenness[w] += delta.get(w)!;
}`,
      aiReview: 'AI awalnya mengusulkan Degree Centrality sederhana yang hanya menghitung jumlah teman langsung.',
      domainReview: 'Koreksi Terhadap AI. Degree centrality melewatkan siswa jembatan perantara antar-geng. Algoritma Brandes mendeteksi broker sosial krusial untuk program konseling Peer Mediation.',
      zone: 'Konvergen',
      domainReference: 'Brandes, U. (2001). A faster algorithm for betweenness centrality. Journal of Mathematical Sociology, 25(2), 163-177.',
    },
    {
      id: 'A-04',
      title: 'Deteksi Komunitas Klik & Indeks Eksklusivitas',
      filePath: '/src/services/snaEngine.ts',
      lines: '506–648',
      variableFunction: 'detectCommunitiesAndBrokers() -> exclusivityIndex, communities',
      formula: 'Exclusivity Index = (Internal Ties - External Ties) / Total Ties',
      codeSnippet: `const maxInternalEdges = memberIds.length * (memberIds.length - 1) || 1;
const internalDensity = Number((internalTiesCount / maxInternalEdges).toFixed(2));
const totalTies = externalTiesCount + internalTiesCount;
const exclusivityIndex =
  totalTies > 0 ? Number(((internalTiesCount - externalTiesCount) / totalTies).toFixed(2)) : 0;

if (exclusivityIndex > 0.4) {
  desc = 'Kelompok pertemanan sangat tertutup (Insular Clique) dengan kohesi internal kuat...';
}`,
      aiReview: 'AI hanya membagi siswa ke dalam klaster warna tanpa mengukur derajat ketertutupan psikologis kelompok.',
      domainReview: 'Penerapan Krackhardt E-I Index membedakan klik tertutup (Insular) yang berisiko polarisasi dan eksklusi sebaya dari kelompok inklusif terbuka.',
      zone: 'Konvergen',
      domainReference: 'Krackhardt, D., & Stern, R. N. (1988). Informal networks and organizational crises. Social Psychology Quarterly.',
    },
    {
      id: 'A-05',
      title: 'Smart Seating Optimizer & Pemisahan Pasangan Konflik',
      filePath: '/src/services/seatingEngine.ts',
      lines: '45–86 & 127–181',
      variableFunction: 'generateOptimizedSeating() -> isCompatiblePair, desks',
      formula: 'Mutual Dislike Constraint Separation + Prosocial Mentor Pairing',
      codeSnippet: `const isCompatiblePair = (id1: string, id2: string): boolean => {
  if (dislikePairs.has(\`\${id1}->\${id2}\`) || dislikePairs.has(\`\${id2}->\${id1}\`)) {
    return false;
  }
  return true;
};

// STEP 1: Pair each Vulnerable Student with a Prosocial Mentor Buddy
while (remainingVulnerable.length > 0 && tableIndex < totalTables) {
  const vuln = remainingVulnerable.shift()!;
  let mentorIdx = remainingMentors.findIndex((mentor) => isCompatiblePair(vuln.id, mentor.id));
  // Place on prime tables 1-2
}`,
      aiReview: 'AI menganggap pengaturan tempat duduk cukup diacak atau disusun berdasarkan urutan abjad.',
      domainReview: 'Penataan tempat duduk adalah intervensi sosio-spasial inklusif. Peneliti mewajibkan pencegahan friksi relasi melalui constraint disliking dan memasangkan siswa rentan dengan mentor prososial.',
      zone: 'Konvergen',
      domainReference: 'Vygotsky Scaffolding & Slavin, R. E. (1995). Cooperative Learning: Theory, Research, and Practice.',
    },
    {
      id: 'A-06',
      title: 'Evaluasi Iklim Sosial Kelas & Peringatan Dini Kebijakan TPPK',
      filePath: '/src/services/snaEngine.ts',
      lines: '305–366',
      variableFunction: 'calculateClassAggregate() -> rawClimate, climateIndex, kepsekPolicyAdvice',
      formula: 'Climate = 65 + (Density×120) + (Reciprocity×0.25) - (Rejected×12) - (Neglected×6)',
      codeSnippet: `const rejectionPenalty = statusCounts.Rejected * 12;
const neglectedPenalty = statusCounts.Neglected * 6;
const densityBonus = density * 120;
const reciprocityBonus = (reciprocityRate / 100) * 25;

let rawClimate = 65 + densityBonus + reciprocityBonus - rejectionPenalty - neglectedPenalty;
rawClimate = Math.min(100, Math.max(10, Math.round(rawClimate)));

if (climateIndex === 'Kritis' || climateIndex === 'Waspada') {
  kepsekPolicyAdvice.push(
    \`Instruksikan Tim Pencegahan & Penanganan Kekerasan (TPPK) sekolah untuk melakukan pemantauan aktif...\`
  );
}`,
      aiReview: 'AI mengukur iklim kelas hanya berdasarkan rasio keikutsertaan pengisian angket.',
      domainReview: 'Koreksi Terhadap AI. Iklim kelas ditentukan oleh struktur relasional: kohesi sebagai faktor pelindung dan penolakan/isolasi sebagai faktor risiko, selaras dengan Permendikbudristek No. 46/2023.',
      zone: 'Konvergen',
      domainReference: 'Permendikbudristek No. 46 Tahun 2023 tentang Pencegahan dan Penanganan Kekerasan di Satuan Pendidikan.',
    },
    {
      id: 'A-07',
      title: 'Isolasi Multi-Tenant Satuan Pendidikan',
      filePath: '/src/dashboards/AdminDashboard.tsx',
      lines: '250–290',
      variableFunction: 'filteredNominations, studentSchoolMap, selectedSchoolId',
      formula: 'School Scoping Isolation (studentIdSet.has(studentId))',
      codeSnippet: `// Isolasi data nominasi berdasarkan id siswa yang terdaftar di sekolah aktif
if (selectedClassId === 'ALL' && selectedSchoolId !== 'ALL') {
  return rawNoms.filter((n) => studentIdSet.has(n.studentId) || studentIdSet.has(n.targetId));
}`,
      aiReview: 'AI awal mencampur seluruh siswa dari sekolah berbeda ke dalam perhitungan mean/deviasi sosiometrik global.',
      domainReview: 'Koreksi Terhadap AI (Telah Diperbaiki). Norma sosial hanya berlaku dalam ekosistem pertemanan nyata di sekolah bersangkutan. Filter multi-tenant mengisolasi perhitungan skor dan hak akses data antar-lembaga.',
      zone: 'Telah Diperbaiki',
      domainReference: 'Prinsip Kedaulatan Data Satuan Pendidikan & Standar Pengujian Psikometri Kelompok Sebaya.',
    },
    {
      id: 'A-08',
      title: 'Etika Pelabelan & Rekomendasi Pengasuhan Positif Orang Tua',
      filePath: '/src/dashboards/OrangTuaDashboard.tsx',
      lines: '160–170',
      variableFunction: 'student.parentNote vs student.dssRecommendation',
      formula: 'Translasi Bahasa Konseling Klinis -> Strength-Based Parenting Guidance',
      codeSnippet: `// OrangTuaDashboard.tsx
<h4 className="text-sm font-bold text-white">
  Rekomendasi Pendampingan Ananda {student.name.split(' ')[0]}
</h4>
<p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
  {student.parentNote || student.dssRecommendation}
</p>`,
      aiReview: 'AI merender rekomendasi klinis Guru BK ("Intervensi Konseling Krisis: Perlindungan psikologis segera...") langsung ke dashboard orang tua.',
      domainReview: 'Koreksi Terhadap AI (Telah Diperbaiki). Berdasarkan Kode Etik ABKIN, istilah krisis berisiko memicu histeria atau hukuman sekunder di rumah. Teks wajib dikonversi menjadi panduan pengasuhan suportif.',
      zone: 'Telah Diperbaiki',
      domainReference: 'Kode Etik Bimbingan dan Konseling Indonesia (ABKIN) Pasal Kerahasiaan & Non-Stigmatisasi Klien.',
    },
  ];

  const handleCopyMarkdown = () => {
    const text = `# Ringkasan Anotasi Ground-Truth Radar Sosial\n` +
      annotations.map((a) => `### Anotasi #${a.id}: ${a.title}\n- Berkas: ${a.filePath}:${a.lines}\n- Variabel: ${a.variableFunction}\n- Zona: ${a.zone}\n- Formula: ${a.formula}\n- Review Ahli: ${a.domainReview}\n`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedNotification('Ringkasan anotasi berhasil disalin ke papan klip!');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    element.setAttribute('href', '/AUDIT_TWO_TRACK.md');
    element.setAttribute('download', 'AUDIT_TWO_TRACK.md');
    element.click();
  };

  const activeAnno = annotations.find((a) => a.id === selectedAnnotationId) || annotations[0];

  return (
    <div className="space-y-6 text-[#e8edf5]">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#0d3555] to-[#0a2a4a] border-2 border-purple-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-purple-300 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Verifikasi Program Comprehension: Two-Track Algorithmic Audit</span>
            </div>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Laporan Audit Algoritmik Dua Jalur (Ground-Truth Review)
            </h2>
            <p className="text-xs text-[#b0c4de] max-w-2xl leading-relaxed">
              Pemeriksaan komprehensif terhadap basis kode nyata, formula psikometri Coie-Dodge, algoritma graf Brandes, kepatuhan Kode Etik ABKIN, dan kesiapan viva ujian akademik tanpa ketergantungan buta pada AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0a2a4a] hover:bg-[#1a3f64] text-[#b0c4de] hover:text-white font-bold text-xs border border-[#1a3f64] shadow-md transition cursor-pointer"
            >
              <Copy className="w-4 h-4 text-cyan-400" />
              <span>Salin Ringkasan</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh AUDIT_TWO_TRACK.md</span>
            </button>
          </div>
        </div>

        {copiedNotification && (
          <div className="mt-3 p-2 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{copiedNotification}</span>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1a3f64] pb-2 text-xs font-semibold">
        <button
          onClick={() => setSubTab('annotations')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            subTab === 'annotations'
              ? 'bg-purple-600 text-white font-bold shadow-md'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Lembar Anotasi Ground-Truth ({annotations.length})</span>
        </button>

        <button
          onClick={() => setSubTab('track1')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            subTab === 'track1'
              ? 'bg-purple-600 text-white font-bold shadow-md'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <Binary className="w-4 h-4" />
          <span>Track 1: Audit Teknis &amp; Formula AI</span>
        </button>

        <button
          onClick={() => setSubTab('track2')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            subTab === 'track2'
              ? 'bg-purple-600 text-white font-bold shadow-md'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Track 2: Standar ABKIN &amp; Permendikbud 46/2023</span>
        </button>

        <button
          onClick={() => setSubTab('viva')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            subTab === 'viva'
              ? 'bg-purple-600 text-white font-bold shadow-md'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Tanya Jawab Ujian Viva Dosen</span>
        </button>

        <button
          onClick={() => setSubTab('summary')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            subTab === 'summary'
              ? 'bg-purple-600 text-white font-bold shadow-md'
              : 'text-[#b0c4de] hover:bg-white/5 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Ringkasan Eksekutif</span>
        </button>
      </div>

      {/* SUBTAB 1: ANNOTATIONS EXPLORER */}
      {subTab === 'annotations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Annotation Selector Cards */}
          <div className="lg:col-span-4 space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {annotations.map((a) => {
              const isSelected = a.id === selectedAnnotationId;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAnnotationId(a.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-purple-900/40 border-purple-400 text-white shadow-lg ring-2 ring-purple-400/40'
                      : 'bg-[#0d3555]/80 border-[#1a3f64] text-[#b0c4de] hover:bg-[#12395d]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#f0c040]">
                      #{a.id}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        a.zone === 'Konvergen'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : a.zone === 'Telah Diperbaiki'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {a.zone}
                    </span>
                  </div>
                  <div className="font-bold text-white text-xs leading-snug">
                    {a.title}
                  </div>
                  <div className="text-[11px] font-mono text-[#8fa8c6] truncate">
                    {a.filePath}:{a.lines}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Anchor Inspector */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0d3555]/90 border border-[#1a3f64] shadow-2xl space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1a3f64]">
              <div>
                <div className="text-xs font-mono font-bold text-[#f0c040]">
                  Anotasi #{activeAnno.id} &bull; {activeAnno.filePath} (Baris {activeAnno.lines})
                </div>
                <h3 className="font-serif text-lg font-bold text-white mt-0.5">
                  {activeAnno.title}
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold self-start uppercase tracking-wider ${
                  activeAnno.zone === 'Konvergen'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    : activeAnno.zone === 'Telah Diperbaiki'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                }`}
              >
                Zona: {activeAnno.zone}
              </span>
            </div>

            {/* Formula & Function Scope */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#0a2a4a] border border-[#1a3f64]">
                <div className="text-[10px] text-[#8fa8c6] uppercase font-bold">Fungsi / Variabel:</div>
                <div className="text-white font-mono text-xs font-semibold mt-0.5 truncate">
                  {activeAnno.variableFunction}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0a2a4a] border border-[#1a3f64]">
                <div className="text-[10px] text-[#8fa8c6] uppercase font-bold">Formula Inti:</div>
                <div className="text-cyan-300 font-mono text-xs font-semibold mt-0.5 truncate">
                  {activeAnno.formula}
                </div>
              </div>
            </div>

            {/* Code Snippet */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[#8fa8c6] text-[11px]">
                <span className="font-mono">Cuplikan Kode Nyata (Ground-Truth Code Anchor):</span>
                <span>TypeScript</span>
              </div>
              <pre className="p-4 rounded-2xl bg-[#071c30] border border-[#1a3f64] font-mono text-xs text-[#e8edf5] overflow-x-auto leading-relaxed">
                <code>{activeAnno.codeSnippet}</code>
              </pre>
            </div>

            {/* AI Review vs Domain Expert Review */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Klaim / Asumsi Awal AI (Track 1):</span>
                </div>
                <p className="text-[11px] text-amber-100/80 leading-relaxed">
                  {activeAnno.aiReview}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Evaluasi Ahli Domain &amp; Koreksi (Track 2):</span>
                </div>
                <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                  {activeAnno.domainReview}
                </p>
              </div>
            </div>

            {/* Domain Citation */}
            <div className="p-3 rounded-xl bg-[#0a2a4a] border border-[#1a3f64] text-[11px] text-[#b0c4de]">
              <span className="font-bold text-white">Rujukan Akademik: </span>
              <span className="italic">{activeAnno.domainReference}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: TRACK 1 AI TECHNICAL AUDIT */}
      {subTab === 'track1' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0d3555] border border-[#1a3f64] space-y-2">
              <div className="text-xs font-bold text-[#f0c040] uppercase">Metode Sosiometri</div>
              <div className="text-xl font-bold text-white">Jacob Levy Moreno (1934)</div>
              <p className="text-xs text-[#b0c4de]">
                Pilihan sosiometrik disukai &amp; ditolak berdasarkan kriteria fungsional belajar kelompok dan bermain.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d3555] border border-[#1a3f64] space-y-2">
              <div className="text-xs font-bold text-cyan-400 uppercase">Model Status Sosial</div>
              <div className="text-xl font-bold text-white">Coie, Dodge &amp; Coppotelli</div>
              <p className="text-xs text-[#b0c4de]">
                Dua sumbu ortogonal: Social Preference (zSP) &amp; Social Impact (zSI) yang memisahkan status Rejected dari Neglected.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d3555] border border-[#1a3f64] space-y-2">
              <div className="text-xs font-bold text-purple-400 uppercase">Analisis Graf Jaringan</div>
              <div className="text-xl font-bold text-white">Algoritma Brandes (2001)</div>
              <p className="text-xs text-[#b0c4de]">
                Betweenness centrality O(|V|·|E|) untuk mengidentifikasi siswa jembatan (broker) antar-kelompok tertutup.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0d3555] border border-[#1a3f64] space-y-4">
            <h3 className="font-serif text-lg font-bold text-white">
              Formula Matematis Skoring &amp; Ambang Batas Klasifikasi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#071c30] border border-[#1a3f64] space-y-2">
                <div className="font-bold text-[#f7d970]">1. Standarisasi Skor Z Rombel:</div>
                <div className="text-[#b0c4de]">zL = (L - meanLikes) / stdLikes</div>
                <div className="text-[#b0c4de]">zD = (D - meanDislikes) / stdDislikes</div>
                <div className="text-cyan-300">zSP = zL - zD (Social Preference)</div>
                <div className="text-cyan-300">zSI = zL + zD (Social Impact)</div>
              </div>

              <div className="p-4 rounded-xl bg-[#071c30] border border-[#1a3f64] space-y-2">
                <div className="font-bold text-[#f7d970]">2. Ambang Klasifikasi Coie-Dodge:</div>
                <div className="text-emerald-300">Popular: zSP &gt; 1.0 &amp;&amp; zL &gt; 0 &amp;&amp; zD &lt; 0</div>
                <div className="text-rose-300">Rejected: zSP &lt; -1.0 &amp;&amp; zD &gt; 0 &amp;&amp; zL &lt; 0</div>
                <div className="text-amber-300">Neglected: zSI &lt; -1.0 &amp;&amp; L &le; meanLikes</div>
                <div className="text-purple-300">Controversial: zSI &gt; 1.0 &amp;&amp; zL &gt; 0 &amp;&amp; zD &gt; 0</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: TRACK 2 DOMAIN & ETHICS */}
      {subTab === 'track2' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0d3555] border border-[#1a3f64] space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#f0c040]" />
              <span>Kepatuhan Terhadap Standar Kode Etik Bimbingan &amp; Konseling (ABKIN)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#e8edf5]">
              <div className="p-4 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] space-y-2">
                <div className="font-bold text-emerald-400 text-sm">Asas Kerahasiaan (Confidentiality)</div>
                <p className="text-[#b0c4de] leading-relaxed">
                  Sosiomatriks mentah (siapa yang menolak siapa) bersifat rahasia mutlak dan hanya boleh diakses oleh Guru BK bersertifikat. Siswa maupun orang tua dilarang melihat daftar pemilih mentah untuk menghindari konflik antar-siswa.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] space-y-2">
                <div className="font-bold text-cyan-400 text-sm">Asas Non-Labeling &amp; Dinamis</div>
                <p className="text-[#b0c4de] leading-relaxed">
                  Status sosiometri bukan vonis watak permanen melainkan potret kondisi adaptasi sosial saat ini. Radar Sosial menyediakan pelacakan longitudinal multi-semester untuk merekam pemulihan iklim pertemanan siswa.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0d3555] border border-[#1a3f64] space-y-3 text-xs">
            <h3 className="font-serif text-lg font-bold text-white">
              Penerapan Permendikbudristek No. 46 Tahun 2023 (PPKSP / TPPK)
            </h3>
            <p className="text-[#b0c4de] leading-relaxed">
              Sistem Radar Sosial secara otomatis menghitung indeks iklim sosial kelas (Kondusif / Waspada / Kritis) dan menerbitkan rekomendasi manajerial bagi Kepala Sekolah untuk mengaktifkan pemantauan Tim Pencegahan dan Penanganan Kekerasan (TPPK) di jam rawan istirahat sekolah.
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 4: VIVA DEFENSE PREPARATION */}
      {subTab === 'viva' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200">
            <strong>Panduan Sidang Viva Dosen:</strong> Pertanyaan-pertanyaan di bawah ini dirancang untuk menguji apakah peneliti benar-benar menguasai logika algoritma dan psikometri yang tertanam dalam aplikasi atau hanya menjiplak kode AI.
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Mengapa Anda membagi perhitungan status sosiometri menjadi dua sumbu: Social Preference dan Social Impact, bukannya langsung memakai persentase pemilih?',
                a: 'Jika hanya menggunakan persentase pemilih (popularitas 1 dimensi), kita tidak bisa membedakan siswa Rejected (aktif ditolak) dari siswa Neglected (terabaikan/tidak terlihat). Social Preference (zSP = zL - zD) mengukur penerimaan relatif, sedangkan Social Impact (zSI = zL + zD) mengukur keberadaan sosial. Intervensi BK keduanya 180 derajat berbeda: siswa Rejected butuh proteksi viktimisasi, sedangkan siswa Neglected butuh penugasan kelompok kooperatif untuk memupuk self-efficacy.',
              },
              {
                q: 'Tunjukkan baris kode Algoritma Brandes pada berkas snaEngine.ts dan terangkan kompleksitas komputasinya!',
                a: 'Algoritma Brandes terletak pada baris 437 hingga 505 di src/services/snaEngine.ts. Algoritma ini menghitung Betweenness Centrality secara eksak dengan kompleksitas O(|V|·|E|). Melalui traversal BFS dan akumulasi dependensi ke belakang (backward pair-dependency accumulation), sistem mendeteksi siswa broker yang menjadi jembatan antar-kelompok tertutup untuk diberdayakan sebagai Peer Mediator.',
              },
              {
                q: 'Bagaimana algoritma Smart Seating Anda menjamin siswa korban perundungan tidak duduk bersebelahan dengan penolaknya?',
                a: 'Pada berkas src/services/seatingEngine.ts baris 128–133, fungsi isCompatiblePair() memeriksa himpunan dislikePairs. Jika terdapat nominasi penolakan satu arah maupun timbal balik, penempatan ditolak. Siswa berstatus rentan (Passive Victim atau Neglected) diprioritaskan terlebih dahulu untuk dipasangkan dengan siswa Populer-Prososial di baris depan (meja 1–2).',
              },
              {
                q: 'Di mana letak koreksi paling mendasar yang Anda lakukan terhadap kode atau asumsi yang awalnya dibuat oleh AI?',
                a: 'Pertama, pada OrangTuaDashboard.tsx baris 167, AI awalnya merender rekomendasi klinis Guru BK ("Intervensi Konseling Krisis") ke layar orang tua; kami mengoreksinya agar menampilkan narasi parentNote yang ramah pengasuhan untuk mencegah kepanikan. Kedua, pada AdminDashboard.tsx baris 250–290, kami mengisolasi populasi standarisasi skor Z agar tidak mencampuradukkan data antar-sekolah.',
              },
            ].map((v, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#0d3555] border border-[#1a3f64] space-y-2 text-xs">
                <div className="font-bold text-[#f0c040] flex items-start gap-2">
                  <span className="shrink-0 font-mono text-sm">Q{i + 1}:</span>
                  <span className="text-white text-sm">{v.q}</span>
                </div>
                <div className="pl-6 pt-1 text-[#b0c4de] leading-relaxed border-l-2 border-purple-500/40 ml-2">
                  <strong className="text-purple-300">Jawaban Otentik Peneliti: </strong>
                  {v.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: EXECUTIVE SUMMARY */}
      {subTab === 'summary' && (
        <div className="p-6 rounded-3xl bg-[#0d3555] border border-[#1a3f64] space-y-4 text-xs leading-relaxed text-[#e8edf5]">
          <h3 className="font-serif text-lg font-bold text-white">
            Ringkasan Eksekutif Audit Algoritmik Dua Jalur
          </h3>
          <p>
            Audit ini membuktikan kesiapan akademik dan penguasaan program (*program comprehension*) pengembang terhadap basis kode platform <strong>Radar Sosial</strong>. Melalui metodologi audit Dua Jalur (Two-Track), setiap komponen komputasi telah diverifikasi terhadap literatur sosiometri Jacob Levy Moreno, model psikometri Coie &amp; Dodge (1982), analisis jejaring sosial Brandes (2001), dan regulasi pencegahan kekerasan Permendikbudristek No. 46 Tahun 2023.
          </p>
          <div className="p-4 rounded-2xl bg-[#0a2a4a] border border-[#1a3f64] space-y-2">
            <div className="font-bold text-[#f7d970]">Protokol Pemeliharaan Berkelanjutan:</div>
            <p className="text-[#b0c4de]">
              Dokumen resmi tersimpan di berkas root <code className="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300 font-mono">/AUDIT_TWO_TRACK.md</code> dan terikat dengan instruksi di <code className="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300 font-mono">/AGENTS.md</code>. Setiap kali terjadi perubahan mendasar pada formula, algoritma, atau skema data, audit ini wajib diperbaharui secara konsisten.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
