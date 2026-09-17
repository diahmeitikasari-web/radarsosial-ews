import {
  Student,
  SociometricNomination,
  PeerBehavioralRating,
  StudentCalculatedMetrics,
  ClassMetricsAggregate,
  CoieDodgeStatus,
  BehavioralCategory,
  RiskLevel,
  RelationCriteria,
} from '../types';

export function calculateSNAMetrics(
  students: Student[],
  nominations: SociometricNomination[],
  behavioralRatings: PeerBehavioralRating[],
  criteriaFilter?: RelationCriteria
): StudentCalculatedMetrics[] {
  const n = students.length;
  if (n === 0) return [];

  // Filter nominations if criteria specified
  const activeNoms = criteriaFilter
    ? nominations.filter((nom) => nom.criteria === criteriaFilter)
    : nominations;

  // Initialize counts
  const rawLikes: Record<string, number> = {};
  const rawDislikes: Record<string, number> = {};
  const likesGiven: Record<string, number> = {};
  const dislikesGiven: Record<string, number> = {};

  students.forEach((s) => {
    rawLikes[s.id] = 0;
    rawDislikes[s.id] = 0;
    likesGiven[s.id] = 0;
    dislikesGiven[s.id] = 0;
  });

  activeNoms.forEach((nom) => {
    if (nom.type === 'like') {
      if (rawLikes[nom.targetId] !== undefined) rawLikes[nom.targetId]++;
      if (likesGiven[nom.studentId] !== undefined) likesGiven[nom.studentId]++;
    } else if (nom.type === 'dislike') {
      if (rawDislikes[nom.targetId] !== undefined) rawDislikes[nom.targetId]++;
      if (dislikesGiven[nom.studentId] !== undefined) dislikesGiven[nom.studentId]++;
    }
  });

  // Calculate Mean and Standard Deviation
  const likesValues = Object.values(rawLikes);
  const dislikesValues = Object.values(rawDislikes);

  const meanLikes = likesValues.reduce((a, b) => a + b, 0) / (n || 1);
  const meanDislikes = dislikesValues.reduce((a, b) => a + b, 0) / (n || 1);

  const varianceLikes =
    likesValues.reduce((acc, val) => acc + Math.pow(val - meanLikes, 2), 0) / (n || 1);
  const varianceDislikes =
    dislikesValues.reduce((acc, val) => acc + Math.pow(val - meanDislikes, 2), 0) / (n || 1);

  const stdLikes = Math.sqrt(varianceLikes) || 1;
  const stdDislikes = Math.sqrt(varianceDislikes) || 1;

  // Behavior map
  const behaviorMap: Record<string, PeerBehavioralRating> = {};
  behavioralRatings.forEach((b) => {
    behaviorMap[b.studentId] = b;
  });

  return students.map((student) => {
    const L = rawLikes[student.id] || 0;
    const D = rawDislikes[student.id] || 0;
    const LG = likesGiven[student.id] || 0;
    const DG = dislikesGiven[student.id] || 0;

    const zL = (L - meanLikes) / stdLikes;
    const zD = (D - meanDislikes) / stdDislikes;

    // Coie & Dodge Formulas
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
    }

    // Behavioral dimensions
    const b = behaviorMap[student.id] || {
      prosocial: 5,
      aggressive: 2,
      withdrawn: 2,
      victimization: 1,
      hyperactive: 2,
    };

    // Determine Behavioral Cross-Category (Moreno + Coie & Dodge + Peer Evaluation Inventory)
    let behavioralStatus: BehavioralCategory = 'Average / Adaptif';
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
    } else if (status === 'Controversial' && b.prosocial >= 5 && b.aggressive >= 4) {
      behavioralStatus = 'Controversial Leader';
    } else if (status === 'Average' && (b.aggressive >= 6 || b.hyperactive >= 7)) {
      behavioralStatus = 'Emerging Conduct Problem';
    } else {
      behavioralStatus = status === 'Popular' ? 'Populer-Prososial' : 'Average / Adaptif';
    }

    // Risk Level & Priority Trigger
    let riskLevel: RiskLevel = 'Stabil';
    let priorityFlag = false;
    let priorityReason = '';

    if (status === 'Rejected' || b.victimization >= 7) {
      riskLevel = 'Tinggi';
      priorityFlag = true;
      priorityReason =
        behavioralStatus === 'Passive Victim'
          ? 'Korban Penolakan & Viktimisasi Tinggi (Prioritas Segera)'
          : 'Siswa Mengalami Penolakan Sosial Luas (Rejected Status)';
    } else if (status === 'Neglected' && b.withdrawn >= 7) {
      riskLevel = 'Sedang';
      priorityFlag = true;
      priorityReason = 'Terisolasi Sosial Ekstrem (Neglected / Invisible)';
    } else if (status === 'Controversial' || b.aggressive >= 7) {
      riskLevel = 'Sedang';
      priorityFlag = true;
      priorityReason = 'Dinamika Relasi Polarisasi / Perilaku Agresif Tinggi';
    } else if (status === 'Popular') {
      riskLevel = 'Stabil';
    } else {
      riskLevel = 'Rendah';
    }

    // DSS Recommendations for Counselor (Guru BK)
    let dssRecommendation = '';
    if (behavioralStatus === 'Passive Victim') {
      dssRecommendation =
        'Intervensi Konseling Krisis: Perlindungan psikologis segera, pendampingan asertif, integrasikan ke dalam kelompok belajar suportif bersama siswa Populer-Prososial, serta audit dinamika iklim relasi sosial di kelas.';
    } else if (behavioralStatus === 'Aggressive Victim') {
      dssRecommendation =
        'Regulasi Emosi & Resolusi Konflik: Sesi konseling perilaku kognitif, pelatihan kontrol impuls, mediasi sebaya secara terstruktur, dan pemantauan interaksi saat istirahat.';
    } else if (behavioralStatus === 'Isolated') {
      dssRecommendation =
        'Program Buddy System: Pasangkan dengan teman sebaya yang memiliki skor prososial tinggi, beri peran terarah dalam kerja kelompok kecil (2-3 anak) untuk memupuk self-efficacy.';
    } else if (behavioralStatus === 'Bistrategic') {
      dssRecommendation =
        'Penyaluran Kepemimpinan Positif: Arahkan pengaruh sosial ke tugas kepanitiaan kelas yang mengedepankan empati dan keadilan sosial, reduksi legitimasi dominasi intimidatif.';
    } else if (behavioralStatus === 'Populer-Prososial') {
      dssRecommendation =
        'Kader Agen Perubahan: Diberdayakan sebagai peer mediator dan pelindung inklusi sosial untuk merangkul siswa yang terisolasi.';
    } else {
      dssRecommendation =
        'Pemeliharaan Iklim: Libatkan dalam kegiatan kolaboratif rutin, apresiasi keaktifan partisipasi sosial.';
    }

    // Gentle Strength-Based Guidance for Parents (Orang Tua)
    let parentNote = '';
    if (riskLevel === 'Tinggi') {
      parentNote =
        'Ananda sedang menghadapi fase adaptasi pertemanan yang membutuhkan dukungan penuh di rumah. Luangkan waktu 15 menit setiap hari untuk mendengarkan perasaannya tanpa menghakimi, perkuat rasa percaya diri melalui apresiasi hobi, dan koordinasikan dengan Guru BK secara berkala.';
    } else if (status === 'Neglected') {
      parentNote =
        'Ananda cenderung tenang dan pendiam di kelas. Ayah/Bunda dapat mendorong ananda mengundang 1 atau 2 teman dekat bermain di rumah atau mengikuti aktivitas komunitas yang diminatinya.';
    } else {
      parentNote =
        'Ananda menunjukkan dinamika sosio-emosional yang sehat dan adaptif. Terus dukung empati serta kebiasaan tolong-menolong bersama teman sebaya.';
    }

    // Longitudinal History (Simulated trends across previous semesters)
    const longitudinalHistory = [
      {
        periodCode: '2025-S1',
        periodName: 'Sem 1 2025/2026',
        status: (status === 'Rejected' ? 'Average' : status) as CoieDodgeStatus,
        zSP: status === 'Rejected' ? -0.4 : Number((zSP - 0.2).toFixed(2)),
        zSI: Number((zSI - 0.1).toFixed(2)),
        victimization: Math.max(1, b.victimization - 3),
        riskLevel: (status === 'Rejected' ? 'Sedang' : 'Rendah') as RiskLevel,
      },
      {
        periodCode: '2025-S2',
        periodName: 'Sem 2 2025/2026',
        status: (status === 'Rejected' ? 'Neglected' : status) as CoieDodgeStatus,
        zSP: status === 'Rejected' ? -0.85 : Number((zSP - 0.1).toFixed(2)),
        zSI: Number((zSI - 0.05).toFixed(2)),
        victimization: Math.max(1, b.victimization - 1),
        riskLevel: (status === 'Rejected' ? 'Sedang' : riskLevel) as RiskLevel,
      },
      {
        periodCode: '2026-S1',
        periodName: 'Sem 1 2026/2027',
        status,
        zSP: Number(zSP.toFixed(2)),
        zSI: Number(zSI.toFixed(2)),
        victimization: b.victimization,
        riskLevel,
      },
    ];

    return {
      studentId: student.id,
      nis: student.nis,
      name: student.name,
      gender: student.gender,
      className: student.className,
      likesReceived: L,
      dislikesReceived: D,
      likesGiven: LG,
      dislikesGiven: DG,
      zLikes: Number(zL.toFixed(2)),
      zDislikes: Number(zD.toFixed(2)),
      zSP: Number(zSP.toFixed(2)),
      zSI: Number(zSI.toFixed(2)),
      status,
      behavioralStatus,
      prosocialScore: b.prosocial,
      aggressiveScore: b.aggressive,
      withdrawnScore: b.withdrawn,
      victimizationScore: b.victimization,
      hyperactiveScore: b.hyperactive,
      riskLevel,
      priorityFlag,
      priorityReason,
      dssRecommendation,
      parentNote,
      longitudinalHistory,
    };
  });
}

export function calculateClassAggregate(
  classId: string,
  className: string,
  periodId: string,
  periodName: string,
  students: Student[],
  nominations: SociometricNomination[],
  metrics: StudentCalculatedMetrics[]
): ClassMetricsAggregate {
  const totalStudents = students.length;
  const maxPossibleEdges = totalStudents * (totalStudents - 1) || 1;

  // Count positive edges
  const positiveEdges = nominations.filter((n) => n.type === 'like').length;
  const density = Number((positiveEdges / maxPossibleEdges).toFixed(3));

  // Count reciprocal positive nominations
  let reciprocalCount = 0;
  const edgeSet = new Set<string>();
  nominations
    .filter((n) => n.type === 'like')
    .forEach((n) => edgeSet.add(`${n.studentId}->${n.targetId}`));

  nominations
    .filter((n) => n.type === 'like')
    .forEach((n) => {
      if (edgeSet.has(`${n.targetId}->${n.studentId}`)) {
        reciprocalCount++;
      }
    });

  const reciprocityRate =
    positiveEdges > 0 ? Number(((reciprocalCount / positiveEdges) * 100).toFixed(1)) : 0;

  const statusCounts = {
    Popular: 0,
    Rejected: 0,
    Neglected: 0,
    Controversial: 0,
    Average: 0,
  };

  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;

  metrics.forEach((m) => {
    statusCounts[m.status]++;
    if (m.riskLevel === 'Tinggi') highRiskCount++;
    else if (m.riskLevel === 'Sedang') mediumRiskCount++;
    else lowRiskCount++;
  });

  // Calculate social climate score (0-100)
  // Higher density & reciprocity + fewer rejected students = higher climate score
  const rejectionPenalty = statusCounts.Rejected * 12;
  const neglectedPenalty = statusCounts.Neglected * 6;
  const densityBonus = density * 120;
  const reciprocityBonus = (reciprocityRate / 100) * 25;

  let rawClimate = 65 + densityBonus + reciprocityBonus - rejectionPenalty - neglectedPenalty;
  rawClimate = Math.min(100, Math.max(10, Math.round(rawClimate)));

  let climateIndex: 'Kondusif' | 'Waspada' | 'Kritis' = 'Kondusif';
  if (rawClimate < 45 || statusCounts.Rejected >= 3) {
    climateIndex = 'Kritis';
  } else if (rawClimate < 70 || statusCounts.Rejected >= 1) {
    climateIndex = 'Waspada';
  } else {
    climateIndex = 'Kondusif';
  }

  // Strategic DSS recommendations for Guru BK
  const dssStrategicAdvice: string[] = [];
  if (statusCounts.Rejected > 0) {
    dssStrategicAdvice.push(
      `Ditemukan ${statusCounts.Rejected} siswa dalam kategori 'Rejected'. Prioritaskan intervensi anti-viktimisasi dan perlindungan psikologis segera sebelum polarisasi mengkristal.`
    );
  }
  if (statusCounts.Neglected > 2) {
    dssStrategicAdvice.push(
      `Terdapat ${statusCounts.Neglected} siswa terisolasi ('Neglected'). Terapkan metode cooperative jigsaw learning dan reorganisasi tempat duduk berkala untuk mencairkan sub-grup tertutup.`
    );
  }
  if (density < 0.25) {
    dssStrategicAdvice.push(
      `Kepadatan jaringan sosial kelas rendah (${density}). Iklim kelas cenderung terfragmentasi; jadwalkan program team-building dan bimbingan klasikal tentang empati.`
    );
  } else {
    dssStrategicAdvice.push(
      `Jaringan sosial kelas memiliki kohesi yang baik dengan tingkat resiprositas ${reciprocityRate}%. Pertahankan ruang dialog terbuka dan apresiasi kegiatan kolaboratif.`
    );
  }

  // Strategic Policy recommendations for Kepala Sekolah
  const kepsekPolicyAdvice: string[] = [];
  if (climateIndex === 'Kritis' || climateIndex === 'Waspada') {
    kepsekPolicyAdvice.push(
      `Instruksikan Tim Pencegahan & Penanganan Kekerasan (TPPK) sekolah untuk melakukan pemantauan aktif pada jam istirahat dan perpindahan kelas di ${className}.`
    );
    kepsekPolicyAdvice.push(
      `Adakan sesi koordinasi berkala antara Guru BK, Wali Kelas, dan Orang Tua siswa teridentifikasi risiko tinggi tanpa pelabelan negatif.`
    );
    kepsekPolicyAdvice.push(
      `Alokasikan jam khusus bimbingan sosio-emosional 1 jam pelajaran per minggu dalam jadwal kurikulum sekolah.`
    );
  } else {
    kepsekPolicyAdvice.push(
      `Jadikan dinamika inklusi sosial ${className} sebagai model percontohan iklim kelas positif bagi rombel lainnya.`
    );
    kepsekPolicyAdvice.push(
      `Dukung program penghargaan 'Duta Ramah Teman' untuk memupuk agen perubahan sebaya tingkat madrasah/sekolah.`
    );
  }

  return {
    classId,
    className,
    periodId,
    periodName,
    totalStudents,
    density,
    reciprocityRate,
    statusCounts,
    riskSummary: {
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
    },
    climateIndex,
    climateScore: rawClimate,
    dssStrategicAdvice,
    kepsekPolicyAdvice,
  };
}

export const calculateClassMetrics = calculateSNAMetrics;
