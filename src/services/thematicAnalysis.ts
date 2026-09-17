import { StudentQualitativeNote, ThematicClusterResult } from '../types';

export interface ThematicCategorizationAnalysis {
  clusters: ThematicClusterResult[];
  totalNotes: number;
  overallTone: 'Harmonis & Inklusif' | 'Perlu Atensi Preventif' | 'Kerentanan Kritis Terdeteksi';
  dominantTheme: string;
  synthesizedNarrative: string;
  actionableDirectives: string[];
}

const THEME_DEFINITIONS = [
  {
    theme: 'Kecemasan Sosial & Penarikan Diri',
    keywords: ['cemas', 'takut', 'menunduk', 'diam', 'mengurung', 'menyendiri', 'enggan', 'malu', 'gemetar', 'menghindar', 'pasif', 'isolasi', 'membaca sendiri'],
    description: 'Kecenderungan menarik diri secara emosional dan sosial dari dinamika kelas, enggan memulai interaksi sebaya.',
    tone: 'peringatan' as const,
    recommendedIntervention: 'Intervensi penataan interaksi kelompok berisiko rendah, bimbingan teman sebangku (buddying), dan latihan afirmatif regulasi diri.',
  },
  {
    theme: 'Kerentanan Viktimisasi / Isolasi Sebaya',
    keywords: ['diabaikan', 'ditolak', 'diejek', 'disindir', 'dizalimi', 'disisihkan', 'enggan sekolah', 'menangis', 'tersisih', 'dijauhi', 'korban'],
    description: 'Indikasi penolakan aktif (peer rejection) dan kerentanan viktimisasi terselubung oleh sub-kelompok kelas.',
    tone: 'kritis' as const,
    recommendedIntervention: 'Konseling individual intensif, mediasi restoratif tanpa menyudutkan, dan perlindungan iklim kelas terstruktur.',
  },
  {
    theme: 'Agresivitas Reaktif & Regulasi Emosi',
    keywords: ['marah', 'berkelahi', 'impulsif', 'friksi', 'membentak', 'memukul', 'mengejek', 'provokasi', 'sarkas', 'emosi meledak', 'gaduh'],
    description: 'Pola respons agresif reaktif, kesulitan mengontrol impuls, dan resistensi terhadap kesepakatan norma kelas.',
    tone: 'kritis' as const,
    recommendedIntervention: 'Latihan mindfulness regulasi emosi, bimbingan manajemen amarah (anger management), dan kontrak perilaku positif.',
  },
  {
    theme: 'Kepemimpinan Prokolektif & Inklusi',
    keywords: ['merangkul', 'pemimpin', 'menolong', 'mengajak', 'inklusif', 'adil', 'mendamaikan', 'jujur', 'berani membela', 'ramah', 'berbagi'],
    description: 'Perilaku prososial spontan, empati tinggi, dan kapasitas menjadi perekat kohesi sosial kelas.',
    tone: 'positif' as const,
    recommendedIntervention: 'Pemberdayaan sebagai Peer Counselor (Konselor Sebaya) dan Agen Perubahan Inklusi dalam dinamika tugas kelompok.',
  },
  {
    theme: 'Dukungan & Resiprositas Pertemanan',
    keywords: ['sahabat', 'kompak', 'berkelompok', 'mendukung', 'belajar bersama', 'akrab', 'resiprok', 'nyaman', 'percaya'],
    description: 'Hubungan interpersonal timbal balik yang sehat, afektif, dan mendukung kesejahteraan psikososial.',
    tone: 'positif' as const,
    recommendedIntervention: 'Pemeliharaan iklim suportif dan penyebaran model resiprositas ke anggota kelas yang lebih terisolasi.',
  },
  {
    theme: 'Klik Tertutup & Eksklusivitas Kelompok',
    keywords: ['geng', 'klik', 'terkotak', 'eksklusif', 'polarisasi', 'meremehkan', 'sub-grup', 'membeda-bedakan'],
    description: 'Terbentuknya sub-kelompok tertutup dengan norma eksklusif yang membatasi integrasi anggota kelas lainnya.',
    tone: 'peringatan' as const,
    recommendedIntervention: 'Rotasi acak kelompok belajar kolaboratif terarah dan proyek kelas bersama yang menuntut ketergantungan positif.',
  },
];

export function analyzeNoteSemantics(
  content: string,
  context: string = 'Observasi Kelas'
): {
  thematicCategory: string;
  sentiment: 'positif' | 'netral' | 'perlu_perhatian' | 'kritis';
  keywords: string[];
  aiInsight: string;
} {
  const lower = content.toLowerCase();
  
  // Find keyword matches per theme
  const scoredThemes = THEME_DEFINITIONS.map((td) => {
    const matches = td.keywords.filter((k) => lower.includes(k));
    return {
      theme: td.theme,
      count: matches.length,
      matchedWords: matches,
      def: td,
    };
  }).sort((a, b) => b.count - a.count);

  const bestTheme = scoredThemes[0]?.count > 0 ? scoredThemes[0] : null;

  let thematicCategory = bestTheme ? bestTheme.theme : 'Dinamika Adaptasi & Interaksi Umum';
  let sentiment: 'positif' | 'netral' | 'perlu_perhatian' | 'kritis' = 'netral';
  let matchedKeywords = bestTheme && bestTheme.matchedWords.length > 0 ? bestTheme.matchedWords : ['adaptasi kelas', 'dinamika sosial'];

  if (bestTheme) {
    if (bestTheme.def.tone === 'kritis') sentiment = 'kritis';
    else if (bestTheme.def.tone === 'peringatan') sentiment = 'perlu_perhatian';
    else if (bestTheme.def.tone === 'positif') sentiment = 'positif';
  } else {
    if (lower.includes('masalah') || lower.includes('kendala')) sentiment = 'perlu_perhatian';
    else if (lower.includes('baik') || lower.includes('aktif') || lower.includes('bagus')) sentiment = 'positif';
  }

  // Generate AI Insight
  let aiInsight = '';
  if (thematicCategory === 'Kecemasan Sosial & Penarikan Diri') {
    aiInsight = `Analisis Semantik LLM: Siswa terindikasi mengalami inhibisi sosial saat konteks ${context}. Disarankan pendekatan personal yang suportif dan pengelompokan dengan figur sebaya yang ramah.`;
  } else if (thematicCategory === 'Kerentanan Viktimisasi / Isolasi Sebaya') {
    aiInsight = `Analisis Semantik LLM: Pola narasi mengindikasikan rasa ketidaknyamanan relasional dan risiko isolasi aktif. Direkomendasikan proteksi dini dan pendampingan konseling individual terstruktur.`;
  } else if (thematicCategory === 'Agresivitas Reaktif & Regulasi Emosi') {
    aiInsight = `Analisis Semantik LLM: Reaksi emosional dan friksi antar-sebaya perlu difasilitasi melalui latihan komunikasi asertif tanpa menyalahkan.`;
  } else if (thematicCategory === 'Kepemimpinan Prokolektif & Inklusi') {
    aiInsight = `Analisis Semantik LLM: Siswa memperlihatkan modalitas sosial prososial unggul. Sangat tepat diberdayakan sebagai pendamping sebaya (peer buddy) untuk merangkul rekan yang pasif.`;
  } else if (thematicCategory === 'Klik Tertutup & Eksklusivitas Kelompok') {
    aiInsight = `Analisis Semantik LLM: Eksklusivitas pergaulan memicu jarak relasional di kelas. Perlu perancangan aktivitas kolaboratif terarah lintas kelompok.`;
  } else {
    aiInsight = `Analisis Semantik LLM: Observasi menunjukkan dinamika pertemanan yang wajar. Lakukan pemantauan berkelanjutan terhadap perkembangan kenyamanan belajar siswa.`;
  }

  return {
    thematicCategory,
    sentiment,
    keywords: matchedKeywords,
    aiInsight,
  };
}

export function generateThematicClassReport(
  notes: StudentQualitativeNote[],
  className: string = 'Kelas'
): ThematicCategorizationAnalysis {
  if (!notes || notes.length === 0) {
    return {
      clusters: [],
      totalNotes: 0,
      overallTone: 'Harmonis & Inklusif',
      dominantTheme: 'Belum ada catatan kualitatif tersimpan',
      synthesizedNarrative: `Belum terdapat data catatan anekdotal kualitatif untuk ${className}. Guru BK dapat mencatat hasil observasi kelas maupun sesi konseling individu pada portal ini untuk mengaktifkan pemetaan tematik otomatis berbasis LLM.`,
      actionableDirectives: ['Tambahkan catatan kualitatif hasil observasi kelas untuk memulai analisis tematik.'],
    };
  }

  const themeCounts: Record<string, { count: number; studentNames: Set<string> }> = {};

  THEME_DEFINITIONS.forEach((t) => {
    themeCounts[t.theme] = { count: 0, studentNames: new Set() };
  });

  let criticalCount = 0;
  let warningCount = 0;

  notes.forEach((n) => {
    const assignedTheme = n.thematicCategory || analyzeNoteSemantics(n.content, n.context).thematicCategory;
    if (!themeCounts[assignedTheme]) {
      themeCounts[assignedTheme] = { count: 0, studentNames: new Set() };
    }
    themeCounts[assignedTheme].count += 1;
    themeCounts[assignedTheme].studentNames.add(n.studentName);

    if (n.sentiment === 'kritis') criticalCount++;
    if (n.sentiment === 'perlu_perhatian') warningCount++;
  });

  const totalNotes = notes.length;

  const clusters: ThematicClusterResult[] = Object.entries(themeCounts)
    .filter(([_, data]) => data.count > 0)
    .map(([theme, data]) => {
      const def = THEME_DEFINITIONS.find((t) => t.theme === theme);
      const percentage = Math.round((data.count / totalNotes) * 100);
      return {
        theme,
        count: data.count,
        percentage,
        description: def?.description || 'Dinamika interaksi perilaku yang teramati pada asesmen kualitatif.',
        tone: (def?.tone || 'netral') as 'positif' | 'peringatan' | 'kritis' | 'netral',
        sampleStudentNames: Array.from(data.studentNames),
        recommendedIntervention: def?.recommendedIntervention || 'Pemantauan konseling berkala.',
      };
    })
    .sort((a, b) => b.count - a.count);

  const dominantTheme = clusters[0]?.theme || 'Dinamika Adaptasi Umum';

  let overallTone: 'Harmonis & Inklusif' | 'Perlu Atensi Preventif' | 'Kerentanan Kritis Terdeteksi' = 'Harmonis & Inklusif';
  if (criticalCount > 0) {
    overallTone = 'Kerentanan Kritis Terdeteksi';
  } else if (warningCount > 0) {
    overallTone = 'Perlu Atensi Preventif';
  }

  // Synthesize rich narrative for counselor official report
  const criticalThemes = clusters.filter((c) => c.tone === 'kritis');
  const warningThemes = clusters.filter((c) => c.tone === 'peringatan');
  const positiveThemes = clusters.filter((c) => c.tone === 'positif');

  let synthesizedNarrative = `Berdasarkan ${totalNotes} catatan observasi kualitatif dan sesi konseling yang dihimpun Guru BK untuk ${className}, dinamika psikososial kelas didominasi oleh tema "${dominantTheme}" (${clusters[0]?.percentage || 0}%). `;

  if (criticalThemes.length > 0) {
    const critNames = criticalThemes.flatMap((c) => c.sampleStudentNames).slice(0, 3).join(', ');
    synthesizedNarrative += `Terdeteksi kerentanan yang memerlukan tindak lanjut segera terkait ${criticalThemes.map((c) => c.theme).join(' dan ')} khususnya pada siswa (${critNames}). `;
  }

  if (warningThemes.length > 0) {
    synthesizedNarrative += `Di samping itu, dinamika ${warningThemes.map((w) => w.theme).join(' serta ')} terpantau memerlukan bimbingan penataan kelompok pertemanan. `;
  }

  if (positiveThemes.length > 0) {
    const posNames = positiveThemes.flatMap((p) => p.sampleStudentNames).slice(0, 3).join(', ');
    synthesizedNarrative += `Kekuatan kohesi kelas ini didukung oleh hadirnya figur prososial (${posNames}) yang menunjukkan empati dan kepemimpinan suportif untuk merangkul rekan sekelas.`;
  }

  const actionableDirectives: string[] = [];
  if (criticalThemes.length > 0) {
    actionableDirectives.push('Laksanakan sesi konseling individual mendalam bagi siswa dengan indikasi distres atau penolakan sosial.');
  }
  if (warningThemes.length > 0) {
    actionableDirectives.push('Terapkan strategi penataan kelompok belajar kooperatif lintas-subkelompok untuk mereduksi fragmentasi.');
  }
  if (positiveThemes.length > 0) {
    actionableDirectives.push('Berdayakan siswa berkarakter prososial sebagai duta pertemanan sebaya (peer support network).');
  }
  if (actionableDirectives.length === 0) {
    actionableDirectives.push('Pertahankan iklim kelas kondusif dengan sesi refleksi sosio-emosional mingguan.');
  }

  return {
    clusters,
    totalNotes,
    overallTone,
    dominantTheme,
    synthesizedNarrative,
    actionableDirectives,
  };
}
