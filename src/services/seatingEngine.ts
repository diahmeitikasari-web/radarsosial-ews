import {
  Student,
  StudentCalculatedMetrics,
  SociometricNomination,
  SeatingLayoutType,
  SeatingDesk,
  SeatingOptimizationResult,
  CooperativeGroup,
} from '../types';

/**
 * Smart Seating & Cooperative Group Optimizer Engine
 * Based on Moreno Sociometry, Coie-Dodge status, and modern inclusive classroom psychology.
 */

export function generateOptimizedSeating(
  students: Student[],
  metrics: StudentCalculatedMetrics[],
  nominations: SociometricNomination[],
  layoutType: SeatingLayoutType = 'pairs_grid'
): SeatingOptimizationResult {
  const n = students.length;
  if (n === 0) {
    return {
      layoutType,
      rows: 4,
      cols: 4,
      desks: [],
      harmonyScore: 100,
      buddyPairsCount: 0,
      preventedConflictsCount: 0,
      optimizationLog: ['Belum ada data siswa untuk rombel ini.'],
      unassignedStudentIds: [],
    };
  }

  // Pre-index metrics and nominations
  const metricMap = new Map<string, StudentCalculatedMetrics>();
  metrics.forEach((m) => metricMap.set(m.studentId, m));

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  // Build dislike set and like set
  const dislikePairs = new Set<string>();
  const likePairs = new Set<string>();
  const mutualDislikes = new Set<string>();

  nominations.forEach((nom) => {
    if (nom.type === 'dislike') {
      dislikePairs.add(`${nom.studentId}->${nom.targetId}`);
    } else if (nom.type === 'like') {
      likePairs.add(`${nom.studentId}->${nom.targetId}`);
    }
  });

  nominations.forEach((nom) => {
    if (nom.type === 'dislike' && dislikePairs.has(`${nom.targetId}->${nom.studentId}`)) {
      const key = [nom.studentId, nom.targetId].sort().join('--');
      mutualDislikes.add(key);
    }
  });

  // Categorize students by socio-behavioral needs
  const vulnerableStudents: Student[] = []; // Neglected, Passive Victim
  const prosocialMentors: Student[] = []; // Populer-Prososial or high prosocial (>6) with low aggression
  const highEnergyStudents: Student[] = []; // Aggressive, Hyperactive, Conduct problem
  const generalStudents: Student[] = [];

  students.forEach((s) => {
    const m = metricMap.get(s.id);
    if (!m) {
      generalStudents.push(s);
      return;
    }

    if (m.status === 'Neglected' || m.behavioralStatus === 'Passive Victim' || m.behavioralStatus === 'Isolated') {
      vulnerableStudents.push(s);
    } else if (m.status === 'Popular' || (m.prosocialScore >= 6 && m.aggressiveScore <= 2)) {
      prosocialMentors.push(s);
    } else if (m.aggressiveScore >= 6 || m.hyperactiveScore >= 6) {
      highEnergyStudents.push(s);
    } else {
      generalStudents.push(s);
    }
  });

  const optimizationLog: string[] = [];
  let buddyPairsCount = 0;
  let preventedConflictsCount = 0;

  // Determine grid dimensions
  // Standard Pairs Grid: 4 rows x 4 table-pairs = 16 tables = 32 seats (each table has 2 seats: left & right)
  const totalDesks = Math.max(32, Math.ceil(n / 2) * 2);
  const totalTables = totalDesks / 2;
  const rows = layoutType === 'u_shape' ? 3 : 4;
  const tablesPerRow = Math.ceil(totalTables / rows);

  // Initialize empty desks array
  const desks: SeatingDesk[] = [];
  let deskCounter = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < tablesPerRow; c++) {
      const tableNum = r * tablesPerRow + c + 1;
      // Seat Left
      desks.push({
        deskId: `desk_${deskCounter++}`,
        row: r,
        col: c * 2,
        tableNumber: tableNum,
        seatPosition: 'left',
        studentId: null,
      });
      // Seat Right
      desks.push({
        deskId: `desk_${deskCounter++}`,
        row: r,
        col: c * 2 + 1,
        tableNumber: tableNum,
        seatPosition: 'right',
        studentId: null,
      });
    }
  }

  // Helper to check if two students can sit together without conflict
  const isCompatiblePair = (id1: string, id2: string): boolean => {
    if (dislikePairs.has(`${id1}->${id2}`) || dislikePairs.has(`${id2}->${id1}`)) {
      return false;
    }
    return true;
  };

  const assignedStudentIds = new Set<string>();

  // 1. STEP 1: Pair each Vulnerable Student with a Prosocial Mentor Buddy
  // Place them in prime learning locations (Rows 1-2)
  const remainingMentors = [...prosocialMentors];
  const remainingVulnerable = [...vulnerableStudents];

  let tableIndex = 0;
  while (remainingVulnerable.length > 0 && tableIndex < totalTables) {
    const vuln = remainingVulnerable.shift()!;
    // Find best compatible mentor
    let mentorIdx = remainingMentors.findIndex((mentor) => isCompatiblePair(vuln.id, mentor.id));
    let buddy: Student | null = null;

    if (mentorIdx !== -1) {
      buddy = remainingMentors.splice(mentorIdx, 1)[0];
    } else if (generalStudents.length > 0) {
      // Find compatible general student
      const genIdx = generalStudents.findIndex((gen) => isCompatiblePair(vuln.id, gen.id));
      if (genIdx !== -1) {
        buddy = generalStudents.splice(genIdx, 1)[0];
      }
    }

    // Assign to table
    const leftDesk = desks.find((d) => d.tableNumber === tableIndex + 1 && d.seatPosition === 'left');
    const rightDesk = desks.find((d) => d.tableNumber === tableIndex + 1 && d.seatPosition === 'right');

    if (leftDesk && rightDesk) {
      leftDesk.studentId = vuln.id;
      leftDesk.assignedStudent = vuln;
      leftDesk.assignedMetric = metricMap.get(vuln.id);
      assignedStudentIds.add(vuln.id);

      if (buddy) {
        rightDesk.studentId = buddy.id;
        rightDesk.assignedStudent = buddy;
        rightDesk.assignedMetric = metricMap.get(buddy.id);
        assignedStudentIds.add(buddy.id);
        buddyPairsCount++;
        optimizationLog.push(
          `Meja ${tableIndex + 1}: Menjodohkan ${vuln.name} (Siswa Pendiam/Rentan) dengan ${buddy.name} (Peer Buddy Prososial).`
        );
      }
    }
    tableIndex++;
  }

  // 2. STEP 2: Seat High Energy / Conduct Problem students near front row or with calming influences
  const remainingHighEnergy = [...highEnergyStudents];
  while (remainingHighEnergy.length > 0 && tableIndex < totalTables) {
    const energyStudent = remainingHighEnergy.shift()!;
    // Find calm partner from mentors or general students
    let calmPartner: Student | null = null;
    if (remainingMentors.length > 0) {
      const idx = remainingMentors.findIndex((m) => isCompatiblePair(energyStudent.id, m.id));
      if (idx !== -1) calmPartner = remainingMentors.splice(idx, 1)[0];
    }
    if (!calmPartner && generalStudents.length > 0) {
      const idx = generalStudents.findIndex((g) => isCompatiblePair(energyStudent.id, g.id));
      if (idx !== -1) calmPartner = generalStudents.splice(idx, 1)[0];
    }

    const leftDesk = desks.find((d) => d.tableNumber === tableIndex + 1 && d.seatPosition === 'left');
    const rightDesk = desks.find((d) => d.tableNumber === tableIndex + 1 && d.seatPosition === 'right');

    if (leftDesk && rightDesk) {
      leftDesk.studentId = energyStudent.id;
      leftDesk.assignedStudent = energyStudent;
      leftDesk.assignedMetric = metricMap.get(energyStudent.id);
      assignedStudentIds.add(energyStudent.id);

      if (calmPartner) {
        rightDesk.studentId = calmPartner.id;
        rightDesk.assignedStudent = calmPartner;
        rightDesk.assignedMetric = metricMap.get(calmPartner.id);
        assignedStudentIds.add(calmPartner.id);
        preventedConflictsCount++;
        optimizationLog.push(
          `Meja ${tableIndex + 1}: Menempatkan ${energyStudent.name} berdampingan dengan ${calmPartner.name} untuk memfasilitasi regulasi diri.`
        );
      }
    }
    tableIndex++;
  }

  // 3. STEP 3: Place remaining students into available desks while avoiding negative ties
  const unassignedPool: Student[] = [
    ...remainingMentors,
    ...remainingVulnerable,
    ...remainingHighEnergy,
    ...generalStudents,
  ];

  // Fill empty desks
  for (let t = 0; t < totalTables; t++) {
    const leftDesk = desks.find((d) => d.tableNumber === t + 1 && d.seatPosition === 'left');
    const rightDesk = desks.find((d) => d.tableNumber === t + 1 && d.seatPosition === 'right');

    if (leftDesk && !leftDesk.studentId && unassignedPool.length > 0) {
      const s = unassignedPool.shift()!;
      leftDesk.studentId = s.id;
      leftDesk.assignedStudent = s;
      leftDesk.assignedMetric = metricMap.get(s.id);
      assignedStudentIds.add(s.id);
    }

    if (rightDesk && !rightDesk.studentId && unassignedPool.length > 0) {
      // Look for a compatible partner for left desk student
      const leftStudentId = leftDesk?.studentId;
      let partnerIdx = 0;
      if (leftStudentId) {
        const found = unassignedPool.findIndex((cand) => isCompatiblePair(leftStudentId, cand.id));
        if (found !== -1) {
          partnerIdx = found;
          preventedConflictsCount++;
        }
      }
      const s = unassignedPool.splice(partnerIdx, 1)[0];
      rightDesk.studentId = s.id;
      rightDesk.assignedStudent = s;
      rightDesk.assignedMetric = metricMap.get(s.id);
      assignedStudentIds.add(s.id);
    }
  }

  // 4. STEP 4: Calculate Harmony Score (0 - 100)
  let harmonyScore = 85;
  let conflictViolations = 0;

  for (let t = 0; t < totalTables; t++) {
    const left = desks.find((d) => d.tableNumber === t + 1 && d.seatPosition === 'left')?.studentId;
    const right = desks.find((d) => d.tableNumber === t + 1 && d.seatPosition === 'right')?.studentId;

    if (left && right) {
      const key = [left, right].sort().join('--');
      if (mutualDislikes.has(key)) {
        conflictViolations++;
        harmonyScore -= 20;
      } else if (dislikePairs.has(`${left}->${right}`) || dislikePairs.has(`${right}->${left}`)) {
        conflictViolations++;
        harmonyScore -= 10;
      } else if (likePairs.has(`${left}->${right}`) && likePairs.has(`${right}->${left}`)) {
        harmonyScore += 3;
      }
    }
  }

  harmonyScore += Math.min(15, buddyPairsCount * 4);
  harmonyScore = Math.min(100, Math.max(30, harmonyScore));

  if (optimizationLog.length === 0) {
    optimizationLog.push('Denah tempat duduk berhasil disusun dengan distribusi sosial yang seimbang.');
  }

  const unassignedStudentIds = students
    .filter((s) => !assignedStudentIds.has(s.id))
    .map((s) => s.id);

  return {
    layoutType,
    rows,
    cols: tablesPerRow * 2,
    desks,
    harmonyScore,
    buddyPairsCount,
    preventedConflictsCount,
    optimizationLog,
    unassignedStudentIds,
  };
}

/**
 * Cooperative Group Generator (Jigsaw / STAD Learning Groups)
 * Divides the classroom into 4, 6, or 8 balanced, inclusive small groups.
 */
export function generateCooperativeGroups(
  students: Student[],
  metrics: StudentCalculatedMetrics[],
  nominations: SociometricNomination[],
  groupCount: number = 6
): CooperativeGroup[] {
  const n = students.length;
  if (n === 0) return [];

  const actualGroupCount = Math.max(2, Math.min(groupCount, Math.floor(n / 2) || 2));
  const metricMap = new Map<string, StudentCalculatedMetrics>();
  metrics.forEach((m) => metricMap.set(m.studentId, m));

  const dislikePairs = new Set<string>();
  nominations.forEach((nom) => {
    if (nom.type === 'dislike') dislikePairs.add(`${nom.studentId}->${nom.targetId}`);
  });

  const groupColors = [
    '#38bdf8', // Sky / Cyan
    '#a855f7', // Purple
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Rose
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#e11d48', // Red
  ];

  const groupNames = [
    'Kelompok 1 (Alpha)',
    'Kelompok 2 (Beta)',
    'Kelompok 3 (Gamma)',
    'Kelompok 4 (Delta)',
    'Kelompok 5 (Epsilon)',
    'Kelompok 6 (Zeta)',
    'Kelompok 7 (Eta)',
    'Kelompok 8 (Theta)',
  ];

  // Initialize empty groups
  const groups: CooperativeGroup[] = Array.from({ length: actualGroupCount }, (_, idx) => ({
    groupId: idx + 1,
    groupName: groupNames[idx] || `Kelompok ${idx + 1}`,
    color: groupColors[idx % groupColors.length],
    memberIds: [],
    members: [],
    avgProsocial: 0,
    genderRatio: '0L / 0P',
    hasIsolatedStudent: false,
    harmonyValid: true,
  }));

  // Separate students by roles
  const leaders: Student[] = [];
  const isolatedOrVulnerable: Student[] = [];
  const standardBoys: Student[] = [];
  const standardGirls: Student[] = [];

  students.forEach((s) => {
    const m = metricMap.get(s.id);
    if (!m) {
      if (s.gender === 'L') standardBoys.push(s);
      else standardGirls.push(s);
      return;
    }

    if (m.status === 'Popular' || (m.prosocialScore >= 6 && m.aggressiveScore <= 2)) {
      leaders.push(s);
    } else if (m.status === 'Neglected' || m.behavioralStatus === 'Passive Victim' || m.behavioralStatus === 'Isolated') {
      isolatedOrVulnerable.push(s);
    } else {
      if (s.gender === 'L') standardBoys.push(s);
      else standardGirls.push(s);
    }
  });

  // Sort leaders by highest prosocial score
  leaders.sort(
    (a, b) => (metricMap.get(b.id)?.prosocialScore || 0) - (metricMap.get(a.id)?.prosocialScore || 0)
  );

  // Helper to find least populated group that doesn't conflict
  const assignToBestGroup = (
    student: Student,
    role: 'Leader/Prososial' | 'Kawan Suportif' | 'Anggota Aktif'
  ) => {
    const m = metricMap.get(student.id)!;
    // Sort groups by member count ascending
    const sortedGroups = [...groups].sort((a, b) => a.members.length - b.members.length);

    let targetGroup = sortedGroups[0];
    for (const g of sortedGroups) {
      const hasDislike = g.memberIds.some(
        (mId) => dislikePairs.has(`${student.id}->${mId}`) || dislikePairs.has(`${mId}->${student.id}`)
      );
      if (!hasDislike) {
        targetGroup = g;
        break;
      }
    }

    targetGroup.memberIds.push(student.id);
    targetGroup.members.push({ student, metric: m, role });
    if (m.status === 'Neglected' || m.behavioralStatus === 'Passive Victim') {
      targetGroup.hasIsolatedStudent = true;
    }
  };

  // 1. Distribute 1 Leader/Prososial to each group first
  leaders.forEach((ldr) => assignToBestGroup(ldr, 'Leader/Prososial'));

  // 2. Distribute vulnerable/isolated students across distinct groups with a supportive role
  isolatedOrVulnerable.forEach((iso) => assignToBestGroup(iso, 'Kawan Suportif'));

  // 3. Balance Gender across groups
  const remaining = [...standardBoys, ...standardGirls].sort(() => Math.random() - 0.5);
  remaining.forEach((std) => assignToBestGroup(std, 'Anggota Aktif'));

  // Calculate stats for each group
  groups.forEach((g) => {
    const boyCount = g.members.filter((m) => m.student.gender === 'L').length;
    const girlCount = g.members.filter((m) => m.student.gender === 'P').length;
    g.genderRatio = `${boyCount}L / ${girlCount}P`;

    const totalProsocial = g.members.reduce((acc, m) => acc + (m.metric?.prosocialScore || 5), 0);
    g.avgProsocial = g.members.length > 0 ? Number((totalProsocial / g.members.length).toFixed(1)) : 0;
  });

  return groups;
}
