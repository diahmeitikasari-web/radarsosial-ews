import {
  Period,
  School,
  SchoolTheme,
  SchoolClass,
  Student,
  SociometricNomination,
  PeerBehavioralRating,
  User,
  NotificationItem,
  AuditLog,
  StudentQualitativeNote,
  ClassCounselorSummary,
  PasswordResetRequest,
} from '../types';
import {
  INITIAL_PERIODS,
  INITIAL_SCHOOLS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS_8A,
  INITIAL_USERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PASSWORD_REQUESTS,
  INITIAL_STUDENT_NOTES,
  INITIAL_CLASS_SUMMARIES,
  generateSeedNominations,
  generateSeedBehavioralRatings,
} from './mockData';

const STORAGE_KEYS = {
  PERIODS: 'radar_sosial_periods',
  SCHOOLS: 'radar_sosial_schools',
  CLASSES: 'radar_sosial_classes',
  STUDENTS: 'radar_sosial_students',
  NOMINATIONS: 'radar_sosial_nominations',
  BEHAVIORS: 'radar_sosial_behaviors',
  USERS: 'radar_sosial_users',
  NOTIFICATIONS: 'radar_sosial_notifications',
  AUDIT_LOGS: 'radar_sosial_audit_logs',
  ACTIVE_PERIOD_ID: 'radar_sosial_active_period_id',
  ACTIVE_CLASS_ID: 'radar_sosial_active_class_id',
  PASSWORD_REQUESTS: 'radar_sosial_password_requests',
  STUDENT_NOTES: 'radar_sosial_student_notes',
  CLASS_SUMMARIES: 'radar_sosial_class_summaries',
};

function getStoredOr<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage quota or parse error:', e);
  }
}

export type CloudWriteHandler = {
  saveDocument: (collectionName: string, id: string, data: any) => Promise<void>;
  deleteDocument: (collectionName: string, id: string) => Promise<void>;
  saveBatch: (collectionName: string, items: Array<{ id: string; [k: string]: any }>) => Promise<void>;
};

let cloudHandler: CloudWriteHandler | null = null;
export function registerCloudHandler(handler: CloudWriteHandler) {
  cloudHandler = handler;
}

export class DataStorageService {
  private static instance: DataStorageService;

  private periods: Period[];
  private schools: School[];
  private classes: SchoolClass[];
  private students: Student[];
  private nominations: SociometricNomination[];
  private behaviors: PeerBehavioralRating[];
  private users: User[];
  private notifications: NotificationItem[];
  private auditLogs: AuditLog[];
  private activePeriodId: string;
  private activeClassId: string;
  private passwordRequests: PasswordResetRequest[];
  private studentNotes: StudentQualitativeNote[];
  private classSummaries: Record<string, ClassCounselorSummary>;
  private subscribers: Array<(event?: string) => void> = [];

  private constructor() {
    this.periods = getStoredOr(STORAGE_KEYS.PERIODS, INITIAL_PERIODS);
    this.schools = getStoredOr(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
    this.classes = getStoredOr(STORAGE_KEYS.CLASSES, INITIAL_CLASSES).map((c) => ({
      ...c,
      counselorName: c.counselorName || 'Liengga Brian Darea, S.Sos.,Gr',
    }));
    this.students = getStoredOr(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS_8A);

    const defaultNoms = generateSeedNominations('period-2026-s1');
    this.nominations = getStoredOr(STORAGE_KEYS.NOMINATIONS, defaultNoms);

    const defaultBehaviors = generateSeedBehavioralRatings('period-2026-s1');
    this.behaviors = getStoredOr(STORAGE_KEYS.BEHAVIORS, defaultBehaviors);

    const storedUsers = getStoredOr(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.users = storedUsers.map((u: User) => {
      if (!u.password) {
        const defaultPwd = u.role === 'admin' ? 'admin123456' : u.role === 'kepala_sekolah' ? 'kepsek123456' : 'bk123456';
        return { ...u, password: defaultPwd };
      }
      return u;
    });
    setStored(STORAGE_KEYS.USERS, this.users);

    this.notifications = getStoredOr(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.auditLogs = getStoredOr(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'log-1',
        timestamp: '2026-09-13T08:00:00Z',
        userName: 'Liengga Brian Darea, S.Sos.,Gr',
        userRole: 'guru_bk',
        action: 'Sinkronisasi Data Sosiometri',
        details: 'Data Kelas 8A Semester 1 2026/2027 berhasil dianalisis.',
      },
    ]);

    this.activePeriodId = getStoredOr(STORAGE_KEYS.ACTIVE_PERIOD_ID, 'period-2026-s1');
    this.activeClassId = getStoredOr(STORAGE_KEYS.ACTIVE_CLASS_ID, 'cls-8a');
    this.passwordRequests = getStoredOr(STORAGE_KEYS.PASSWORD_REQUESTS, INITIAL_PASSWORD_REQUESTS);
    const loadedNotes = getStoredOr<StudentQualitativeNote[]>(STORAGE_KEYS.STUDENT_NOTES, []);
    this.studentNotes = loadedNotes && loadedNotes.length >= 8 ? loadedNotes : [...INITIAL_STUDENT_NOTES];
    setStored(STORAGE_KEYS.STUDENT_NOTES, this.studentNotes);
    this.classSummaries = getStoredOr(STORAGE_KEYS.CLASS_SUMMARIES, INITIAL_CLASS_SUMMARIES);
  }

  public static getInstance(): DataStorageService {
    if (!DataStorageService.instance) {
      DataStorageService.instance = new DataStorageService();
    }
    return DataStorageService.instance;
  }

  public subscribe(fn: (event?: string) => void): () => void {
    this.subscribers.push(fn);
    return () => {
      const idx = this.subscribers.indexOf(fn);
      if (idx !== -1) this.subscribers.splice(idx, 1);
    };
  }

  public notifySubscribers(event?: string): void {
    this.subscribers.forEach((fn) => {
      try {
        fn(event);
      } catch (e) {
        console.warn('Subscriber error:', e);
      }
    });
  }

  public syncFromCloud(collectionName: string, items: any[]): void {
    if (!items || !Array.isArray(items)) return;
    switch (collectionName) {
      case 'schools':
        this.schools = items;
        setStored(STORAGE_KEYS.SCHOOLS, this.schools);
        break;
      case 'classes':
        this.classes = items;
        setStored(STORAGE_KEYS.CLASSES, this.classes);
        break;
      case 'periods':
        this.periods = items;
        setStored(STORAGE_KEYS.PERIODS, this.periods);
        break;
      case 'students':
        this.students = items;
        setStored(STORAGE_KEYS.STUDENTS, this.students);
        break;
      case 'student_notes':
        this.studentNotes = items;
        setStored(STORAGE_KEYS.STUDENT_NOTES, this.studentNotes);
        break;
      case 'class_summaries': {
        const sumMap: Record<string, ClassCounselorSummary> = {};
        items.forEach((s) => {
          const key = `${s.classId}_${s.periodId}`;
          sumMap[key] = s;
        });
        this.classSummaries = sumMap;
        setStored(STORAGE_KEYS.CLASS_SUMMARIES, this.classSummaries);
        break;
      }
      case 'nominations':
        this.nominations = items;
        setStored(STORAGE_KEYS.NOMINATIONS, this.nominations);
        break;
      case 'behaviors':
        this.behaviors = items;
        setStored(STORAGE_KEYS.BEHAVIORS, this.behaviors);
        break;
    }
    this.notifySubscribers(collectionName);
  }

  // Periods
  public getPeriods(): Period[] {
    return [...this.periods];
  }

  public getActivePeriod(): Period {
    return (
      this.periods.find((p) => p.id === this.activePeriodId) ||
      this.periods.find((p) => p.status === 'aktif') ||
      this.periods[0]
    );
  }

  public setActivePeriodId(id: string): void {
    this.activePeriodId = id;
    setStored(STORAGE_KEYS.ACTIVE_PERIOD_ID, id);
  }

  public activatePeriod(periodId: string): void {
    this.periods = this.periods.map((p) => ({
      ...p,
      status: p.id === periodId ? ('aktif' as const) : ('ditutup' as const),
    }));
    this.activePeriodId = periodId;
    setStored(STORAGE_KEYS.ACTIVE_PERIOD_ID, periodId);
    setStored(STORAGE_KEYS.PERIODS, this.periods);
    this.periods.forEach((p) => cloudHandler?.saveDocument('periods', p.id, p));
    cloudHandler?.saveDocument('settings', 'global', {
      id: 'global',
      activePeriodId: this.activePeriodId,
      activeClassId: this.activeClassId,
    });
    this.notifySubscribers('periods');
  }

  public addPeriod(period: Period): void {
    if (period.status === 'aktif') {
      this.periods = this.periods.map((p) => ({ ...p, status: 'ditutup' as const }));
      this.activePeriodId = period.id;
      setStored(STORAGE_KEYS.ACTIVE_PERIOD_ID, period.id);
    }
    this.periods.push(period);
    setStored(STORAGE_KEYS.PERIODS, this.periods);
    cloudHandler?.saveDocument('periods', period.id, period);
    this.notifySubscribers('periods');
  }

  public updatePeriod(period: Period): void {
    const idx = this.periods.findIndex((p) => p.id === period.id);
    if (idx !== -1) {
      if (period.status === 'aktif') {
        this.periods = this.periods.map((p) =>
          p.id === period.id ? period : { ...p, status: 'ditutup' as const }
        );
        this.activePeriodId = period.id;
        setStored(STORAGE_KEYS.ACTIVE_PERIOD_ID, period.id);
      } else {
        this.periods[idx] = period;
      }
      setStored(STORAGE_KEYS.PERIODS, this.periods);
      cloudHandler?.saveDocument('periods', period.id, period);
      this.notifySubscribers('periods');
    }
  }

  public deletePeriod(periodId: string): void {
    this.periods = this.periods.filter((p) => p.id !== periodId);
    if (this.activePeriodId === periodId && this.periods.length > 0) {
      this.activePeriodId = this.periods[0].id;
      setStored(STORAGE_KEYS.ACTIVE_PERIOD_ID, this.activePeriodId);
    }
    setStored(STORAGE_KEYS.PERIODS, this.periods);
    cloudHandler?.deleteDocument('periods', periodId);
    this.notifySubscribers('periods');
  }

  // Classes & Schools
  public getSchools(): School[] {
    return [...this.schools];
  }

  public addSchool(schoolData: Partial<School> & { name: string; npsn: string }): School {
    const newSchool: School = {
      id: schoolData.id || `sch-${Date.now()}`,
      name: schoolData.name,
      npsn: schoolData.npsn,
      address: schoolData.address || 'Kabupaten Bangka',
      city: schoolData.city || 'Kabupaten Bangka',
      type: schoolData.type || 'Madrasah',
      totalClasses: schoolData.totalClasses || 0,
      principalName: schoolData.principalName || 'Kepala Sekolah',
      counselorName: schoolData.counselorName || 'Guru BK',
      phone: schoolData.phone || '-',
      status: schoolData.status || 'aktif',
    };
    this.schools.push(newSchool);
    setStored(STORAGE_KEYS.SCHOOLS, this.schools);
    this.addAuditLog('Super-Admin', 'admin', 'Tambah Satuan Pendidikan (Tenant)', `Menambahkan sekolah ${newSchool.name} (NPSN: ${newSchool.npsn})`);
    cloudHandler?.saveDocument('schools', newSchool.id, newSchool);
    this.notifySubscribers('schools');
    return newSchool;
  }

  public updateSchool(updated: School): void {
    const idx = this.schools.findIndex((s) => s.id === updated.id);
    if (idx !== -1) {
      this.schools[idx] = updated;
      setStored(STORAGE_KEYS.SCHOOLS, this.schools);
      this.addAuditLog('Super-Admin', 'admin', 'Perbarui Satuan Pendidikan', `Memperbarui data ${updated.name}`);
      cloudHandler?.saveDocument('schools', updated.id, updated);
      this.notifySubscribers('schools');
    }
  }

  public updateSchoolTheme(schoolId: string, theme: SchoolTheme): void {
    const idx = this.schools.findIndex((s) => s.id === schoolId);
    if (idx !== -1) {
      this.schools[idx] = { ...this.schools[idx], theme };
      setStored(STORAGE_KEYS.SCHOOLS, this.schools);
      this.addAuditLog('Satuan Pendidikan', 'admin', 'Perbarui Tema Branding Sekolah', `Memperbarui tema warna preferensi sekolah ${this.schools[idx].name} (${theme.preset})`);
      cloudHandler?.saveDocument('schools', this.schools[idx].id, this.schools[idx]);
      this.notifySubscribers('schools');
    }
  }

  public deleteSchool(schoolId: string): void {
    const sch = this.schools.find((s) => s.id === schoolId);
    this.schools = this.schools.filter((s) => s.id !== schoolId);
    setStored(STORAGE_KEYS.SCHOOLS, this.schools);
    this.addAuditLog('Super-Admin', 'admin', 'Hapus Satuan Pendidikan', `Menghapus sekolah: ${sch?.name || schoolId}`);
    cloudHandler?.deleteDocument('schools', schoolId);
    this.notifySubscribers('schools');
  }

  public getClasses(schoolId?: string): SchoolClass[] {
    return schoolId ? this.classes.filter((c) => c.schoolId === schoolId) : [...this.classes];
  }

  public addClass(classData: Partial<SchoolClass> & { name: string; schoolId: string }): SchoolClass {
    const targetSchool = this.schools.find((s) => s.id === classData.schoolId) || this.schools[0];
    
    // Find counselor if provided
    let counselor = this.users.find((u) => u.id === classData.counselorId);
    if (!counselor && classData.counselorName) {
      counselor = this.users.find((u) => u.name === classData.counselorName && u.role === 'guru_bk');
    }

    const newClass: SchoolClass = {
      id: classData.id || `cls-${Date.now()}`,
      schoolId: classData.schoolId,
      name: classData.name,
      grade: classData.grade || '8',
      academicYear: classData.academicYear || '2026/2027',
      homeroomTeacher: classData.homeroomTeacher || 'Wali Kelas Terpilih',
      counselorId: counselor?.id || classData.counselorId,
      counselorName: counselor?.name || classData.counselorName || targetSchool?.counselorName || 'Liengga Brian Darea, S.Sos.,Gr',
      targetStudentCount: classData.targetStudentCount || 30,
      description: classData.description || 'Rombongan Belajar Terdaftar',
    };
    this.classes.push(newClass);
    setStored(STORAGE_KEYS.CLASSES, this.classes);
    this.setActiveClassId(newClass.id);

    // Sync counselor's assignedClassIds
    if (newClass.counselorId) {
      this.users = this.users.map((u) => {
        if (u.id === newClass.counselorId) {
          const current = u.assignedClassIds || [];
          return {
            ...u,
            assignedClassIds: current.includes(newClass.id) ? current : [...current, newClass.id],
          };
        }
        return u;
      });
      setStored(STORAGE_KEYS.USERS, this.users);
    }

    this.addAuditLog('Guru BK / Admin', 'guru_bk', 'Tambah Rombel Baru', `Menambahkan rombel ${newClass.name} di ${targetSchool?.name || 'Sekolah'}`);
    cloudHandler?.saveDocument('classes', newClass.id, newClass);
    this.notifySubscribers('classes');
    return newClass;
  }

  public updateClass(updated: SchoolClass): void {
    const idx = this.classes.findIndex((c) => c.id === updated.id);
    if (idx !== -1) {
      // Find counselor name if only id provided
      if (updated.counselorId) {
        const found = this.users.find((u) => u.id === updated.counselorId);
        if (found) updated.counselorName = found.name;
      }

      this.classes[idx] = updated;
      setStored(STORAGE_KEYS.CLASSES, this.classes);

      // Sync counselor's assignedClassIds
      this.users = this.users.map((u) => {
        if (u.id === updated.counselorId) {
          const current = u.assignedClassIds || [];
          return {
            ...u,
            assignedClassIds: current.includes(updated.id) ? current : [...current, updated.id],
          };
        } else if (u.assignedClassIds?.includes(updated.id) && u.id !== updated.counselorId) {
          return {
            ...u,
            assignedClassIds: u.assignedClassIds.filter((id) => id !== updated.id),
          };
        }
        return u;
      });
      setStored(STORAGE_KEYS.USERS, this.users);

      this.addAuditLog('Admin / Guru BK', 'guru_bk', 'Perbarui Rombel', `Memperbarui rombel ${updated.name}`);
      cloudHandler?.saveDocument('classes', updated.id, updated);
      this.notifySubscribers('classes');
    }
  }

  public deleteClass(classId: string): void {
    const cls = this.classes.find((c) => c.id === classId);
    this.classes = this.classes.filter((c) => c.id !== classId);
    setStored(STORAGE_KEYS.CLASSES, this.classes);

    // Clean up class reference from users
    this.users = this.users.map((u) => ({
      ...u,
      assignedClassIds: u.assignedClassIds?.filter((id) => id !== classId) || [],
    }));
    setStored(STORAGE_KEYS.USERS, this.users);

    if (this.activeClassId === classId && this.classes.length > 0) {
      this.setActiveClassId(this.classes[0].id);
    }
    this.addAuditLog('Admin / Guru BK', 'guru_bk', 'Hapus Rombel', `Menghapus rombel: ${cls?.name || classId}`);
    cloudHandler?.deleteDocument('classes', classId);
    this.notifySubscribers('classes');
  }

  public getActiveClass(): SchoolClass {
    return this.classes.find((c) => c.id === this.activeClassId) || this.classes[0];
  }

  public setActiveClassId(id: string): void {
    this.activeClassId = id;
    setStored(STORAGE_KEYS.ACTIVE_CLASS_ID, id);
    cloudHandler?.saveDocument('settings', 'global', {
      id: 'global',
      activePeriodId: this.activePeriodId,
      activeClassId: this.activeClassId,
    });
    this.notifySubscribers('settings');
  }

  // Students
  public getStudents(classId?: string): Student[] {
    if (classId === 'ALL' || !classId) {
      return [...this.students];
    }
    return this.students.filter((s) => s.classId === classId);
  }

  public getStudentsForClass(classId?: string): Student[] {
    const targetClass = classId || this.activeClassId;
    return this.students.filter((s) => s.classId === targetClass);
  }

  public getAllStudents(): Student[] {
    return [...this.students];
  }

  public setStudentsForClass(classId: string, newStudents: Student[]): void {
    this.students = this.students.filter((s) => s.classId !== classId).concat(newStudents);
    setStored(STORAGE_KEYS.STUDENTS, this.students);
    cloudHandler?.saveBatch('students', newStudents);
    this.notifySubscribers('students');
  }

  // Nominations & Behaviors
  public getNominations(periodId?: string, classId?: string): SociometricNomination[] {
    const pId = periodId || this.activePeriodId;
    if (classId === 'ALL' || classId === undefined) {
      return this.nominations.filter((n) => n.periodId === pId);
    }
    return this.nominations.filter((n) => n.periodId === pId && n.classId === classId);
  }

  public setNominations(periodId: string, classId: string, newNoms: SociometricNomination[]): void {
    this.nominations = this.nominations
      .filter((n) => !(n.periodId === periodId && n.classId === classId))
      .concat(newNoms);
    setStored(STORAGE_KEYS.NOMINATIONS, this.nominations);
    cloudHandler?.saveBatch('nominations', newNoms);
    this.notifySubscribers('nominations');
  }

  public getBehaviors(periodId?: string, classId?: string): PeerBehavioralRating[] {
    const pId = periodId || this.activePeriodId;
    if (classId === 'ALL' || classId === undefined) {
      return this.behaviors.filter((b) => b.periodId === pId);
    }
    return this.behaviors.filter((b) => b.periodId === pId && b.classId === classId);
  }

  public setBehaviors(periodId: string, classId: string, newBehaviors: PeerBehavioralRating[]): void {
    this.behaviors = this.behaviors
      .filter((b) => !(b.periodId === periodId && b.classId === classId))
      .concat(newBehaviors);
    setStored(STORAGE_KEYS.BEHAVIORS, this.behaviors);
    cloudHandler?.saveBatch('behaviors', newBehaviors);
    this.notifySubscribers('behaviors');
  }

  // Simulation Engine
  public simulateClassData(
    schoolId: string,
    classId: string,
    scenario: 'healthy' | 'polarized' | 'isolated_risk' | 'random' = 'healthy'
  ): { studentCount: number; nominationCount: number; behaviorCount: number } {
    const targetClass = this.classes.find((c) => c.id === classId);
    const className = targetClass?.name || 'Kelas Terpilih';
    const periodId = this.activePeriodId;

    const namesBoys = [
      'Aditya Pratama', 'Bima Sakti', 'Candra Wijaya', 'Daffa Al-Faris', 
      'Evan Bagas', 'Fikri Haikal', 'Galang Ramadhan', 'Hafiz Maulana',
      'Irfan Setiawan', 'Jovan Raditya', 'Kurniawan Dwi', 'Lukman Hakim'
    ];
    const namesGirls = [
      'Alya Rahma Azzahra', 'Bella Safira', 'Citra Dewi Lestari', 'Dina Maulida',
      'Erna Susilowati', 'Farah Nadira', 'Gita Savitri', 'Hana Zahira',
      'Indah Cahyani', 'Kamelia Sari', 'Lestari Ayu', 'Mila Anggraini'
    ];

    const simStudents: Student[] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const isMale = i % 2 === 0;
      const namePool = isMale ? namesBoys : namesGirls;
      const name = namePool[Math.floor(i / 2) % namePool.length] + (i >= 12 ? ` II` : '');
      const sId = `sim-${classId}-${i + 1}`;
      simStudents.push({
        id: sId,
        nis: `2026${(i + 10).toString().padStart(4, '0')}`,
        name,
        gender: isMale ? 'L' : 'P',
        classId,
        className,
        schoolId,
      });
    }

    const simNominations: SociometricNomination[] = [];
    const simBehaviors: PeerBehavioralRating[] = [];

    const addNom = (nominatorId: string, nomineeId: string, type: 'like' | 'dislike', criteria: 'belajar' | 'bermain') => {
      simNominations.push({
        id: `nom-sim-${nominatorId}-${nomineeId}-${type}-${criteria}`,
        periodId,
        classId,
        studentId: nominatorId,
        targetId: nomineeId,
        type,
        criteria,
      });
    };

    const setBehavior = (targetId: string, prosocial: number, aggressive: number, withdrawn: number, hyperactive: number, victimization: number) => {
      simBehaviors.push({
        id: `beh-sim-${periodId}-${classId}-${targetId}`,
        periodId,
        classId,
        studentId: targetId,
        prosocial: Math.max(1, Math.min(10, prosocial)),
        aggressive: Math.max(1, Math.min(10, aggressive)),
        withdrawn: Math.max(1, Math.min(10, withdrawn)),
        hyperactive: Math.max(1, Math.min(10, hyperactive)),
        victimization: Math.max(1, Math.min(10, victimization)),
      });
    };

    if (scenario === 'healthy') {
      for (let i = 0; i < simStudents.length; i++) {
        const student = simStudents[i];
        const peer1 = simStudents[(i + 1) % simStudents.length];
        const peer2 = simStudents[(i + 2) % simStudents.length];
        addNom(student.id, peer1.id, 'like', 'belajar');
        addNom(student.id, peer2.id, 'like', 'bermain');
        if (i % 5 === 0) {
          const peerDis = simStudents[(i + 6) % simStudents.length];
          addNom(student.id, peerDis.id, 'dislike', 'belajar');
        }
        setBehavior(student.id, 7 + (i % 3), 1, 2, 2, 1);
      }
    } else if (scenario === 'polarized') {
      const groupA = simStudents.slice(0, 8);
      const groupB = simStudents.slice(8, 16);

      groupA.forEach((st, idx) => {
        const friend1 = groupA[(idx + 1) % groupA.length];
        const friend2 = groupA[(idx + 2) % groupA.length];
        addNom(st.id, friend1.id, 'like', 'belajar');
        addNom(st.id, friend2.id, 'like', 'bermain');
        const rival = groupB[idx % groupB.length];
        addNom(st.id, rival.id, 'dislike', 'belajar');
        setBehavior(st.id, 6, idx === 0 ? 7 : 3, 2, 4, 2);
      });

      groupB.forEach((st, idx) => {
        const friend1 = groupB[(idx + 1) % groupB.length];
        const friend2 = groupB[(idx + 2) % groupB.length];
        addNom(st.id, friend1.id, 'like', 'belajar');
        addNom(st.id, friend2.id, 'like', 'bermain');
        const rival = groupA[idx % groupA.length];
        addNom(st.id, rival.id, 'dislike', 'belajar');
        setBehavior(st.id, 6, idx === 0 ? 8 : 3, 2, 4, 2);
      });
    } else if (scenario === 'isolated_risk') {
      const rejected1 = simStudents[1]; // High dislike, victimized
      const rejected2 = simStudents[2]; // High dislike, aggressive-rejected
      const neglected1 = simStudents[14]; // Isolated
      const neglected2 = simStudents[15]; // Isolated

      for (let i = 0; i < 14; i++) {
        const st = simStudents[i];
        if (i !== 1 && i !== 2) {
          addNom(st.id, rejected1.id, 'dislike', 'belajar');
          addNom(st.id, rejected2.id, 'dislike', 'bermain');
          const buddy = simStudents[(i + 3) % 14];
          addNom(st.id, buddy.id, 'like', 'belajar');
        }
        setBehavior(st.id, 6, 2, 2, 2, 1);
      }
      // Specific risk profiles
      setBehavior(rejected1.id, 2, 3, 8, 3, 9); // Withdrawn/Victimized Rejected
      setBehavior(rejected2.id, 2, 9, 2, 8, 2); // Aggressive-Rejected
      setBehavior(neglected1.id, 3, 1, 9, 1, 3); // Neglected / Isolated
      setBehavior(neglected2.id, 3, 1, 9, 1, 3); // Neglected / Isolated
    } else {
      simStudents.forEach((st, i) => {
        const f1 = simStudents[(i + 1) % simStudents.length];
        const f2 = simStudents[(i + 3) % simStudents.length];
        addNom(st.id, f1.id, 'like', 'belajar');
        addNom(st.id, f2.id, 'like', 'bermain');
        if (i % 3 === 0) {
          const d1 = simStudents[(i + 4) % simStudents.length];
          addNom(st.id, d1.id, 'dislike', 'belajar');
        }
        setBehavior(st.id, 4 + (i % 5), 1 + (i % 4), 2 + (i % 3), 2 + (i % 4), 1 + (i % 3));
      });
    }

    this.students = this.students.filter((s) => s.classId !== classId).concat(simStudents);
    this.nominations = this.nominations.filter((n) => !(n.periodId === periodId && n.classId === classId)).concat(simNominations);
    this.behaviors = this.behaviors.filter((b) => !(b.periodId === periodId && b.classId === classId)).concat(simBehaviors);

    setStored(STORAGE_KEYS.STUDENTS, this.students);
    setStored(STORAGE_KEYS.NOMINATIONS, this.nominations);
    setStored(STORAGE_KEYS.BEHAVIORS, this.behaviors);

    this.addAuditLog(
      'Super-Admin Lab',
      'admin',
      'Eksekusi Simulasi Sosiometri',
      `Skenario '${scenario}' berhasil disimulasikan untuk ${className} (${simStudents.length} siswa, ${simNominations.length} nominasi)`
    );

    return {
      studentCount: simStudents.length,
      nominationCount: simNominations.length,
      behaviorCount: simBehaviors.length,
    };
  }

  // Users (for Admin management)
  public getUsers(schoolId?: string): User[] {
    if (schoolId && schoolId !== 'ALL') {
      return this.users.filter((u) => u.schoolId === schoolId);
    }
    return [...this.users];
  }

  public addUser(user: Partial<User> & { name: string; email: string; role: any }): User {
    const targetSchool = this.schools.find((s) => s.id === user.schoolId) || this.schools[0];
    const fullUser: User = {
      id: user.id || `usr-${Date.now()}`,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId || targetSchool?.id || 'sch-mtsn2-bangka',
      schoolName: user.schoolName || targetSchool?.name || 'MTs Negeri 2 Bangka',
      assignedClassIds: user.assignedClassIds || [],
      nip: user.nip,
      phone: user.phone,
      status: user.status || 'active',
      authProvider: user.authProvider || 'google',
      childId: user.childId,
      title: user.title || (user.role === 'guru_bk' ? 'Guru Bimbingan dan Konseling' : 'Kepala Satuan Pendidikan'),
      createdAt: user.createdAt || new Date().toISOString(),
    };
    this.users.push(fullUser);
    setStored(STORAGE_KEYS.USERS, this.users);

    // If guru_bk has assigned classes, update counselorId & counselorName on those classes
    if (fullUser.role === 'guru_bk' && fullUser.assignedClassIds && fullUser.assignedClassIds.length > 0) {
      this.classes = this.classes.map((cls) => {
        if (fullUser.assignedClassIds?.includes(cls.id)) {
          return {
            ...cls,
            counselorId: fullUser.id,
            counselorName: fullUser.name,
          };
        }
        return cls;
      });
      setStored(STORAGE_KEYS.CLASSES, this.classes);
    }

    this.addAuditLog('Super-Admin', 'admin', 'Tambah Pengguna Baru', `Menambahkan akun ${fullUser.name} (${fullUser.role}) untuk ${fullUser.schoolName}`);
    return fullUser;
  }

  public updateUser(user: User): void {
    const idx = this.users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      const targetSchool = this.schools.find((s) => s.id === user.schoolId);
      const updatedUser: User = {
        ...user,
        schoolName: targetSchool ? targetSchool.name : user.schoolName,
      };
      this.users[idx] = updatedUser;
      setStored(STORAGE_KEYS.USERS, this.users);

      // If guru_bk, sync assigned classes
      if (updatedUser.role === 'guru_bk') {
        const assignedIds = updatedUser.assignedClassIds || [];
        this.classes = this.classes.map((cls) => {
          if (assignedIds.includes(cls.id)) {
            return {
              ...cls,
              counselorId: updatedUser.id,
              counselorName: updatedUser.name,
            };
          } else if (cls.counselorId === updatedUser.id) {
            return {
              ...cls,
              counselorId: undefined,
              counselorName: 'Guru BK Konselor',
            };
          }
          return cls;
        });
        setStored(STORAGE_KEYS.CLASSES, this.classes);
      }

      this.addAuditLog('Super-Admin', 'admin', 'Perbarui Pengguna', `Memperbarui akun ${user.name} (${user.role})`);
    }
  }

  public deleteUser(userId: string): void {
    const target = this.users.find((u) => u.id === userId);
    this.users = this.users.filter((u) => u.id !== userId);
    setStored(STORAGE_KEYS.USERS, this.users);

    // Clean up counselorId in classes if this user was a counselor
    this.classes = this.classes.map((cls) => {
      if (cls.counselorId === userId) {
        return {
          ...cls,
          counselorId: undefined,
          counselorName: 'Guru BK Konselor',
        };
      }
      return cls;
    });
    setStored(STORAGE_KEYS.CLASSES, this.classes);

    this.addAuditLog('Super-Admin', 'admin', 'Hapus Pengguna', `Menghapus ID pengguna: ${target?.name || userId}`);
  }

  // Notifications
  public getNotifications(role?: string): NotificationItem[] {
    if (!role) return [...this.notifications];
    return this.notifications.filter(
      (n) => n.targetRoles.includes(role as any) || n.targetRoles.length === 0
    );
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp'>): void {
    const newItem: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.notifications.unshift(newItem);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    }
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  public addAuditLog(userName: string, userRole: any, action: string, details: string): void {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName,
      userRole,
      action,
      details,
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    setStored(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  public setUserPassword(userId: string, newPassword: string, adminName: string = 'Super-Admin'): boolean {
    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].password = newPassword;
      setStored(STORAGE_KEYS.USERS, this.users);
      this.addAuditLog(
        adminName,
        'admin',
        'Atur Ulang Kata Sandi',
        `Memperbarui kata sandi untuk pengguna ${this.users[userIndex].name} (${this.users[userIndex].email})`
      );
      this.addNotification({
        title: 'Kata Sandi Diperbarui oleh Admin',
        message: `Kata sandi akun Anda telah diperbarui oleh Administrator. Silakan gunakan kredensial baru saat login.`,
        type: 'info',
        targetRoles: [this.users[userIndex].role],
        severity: 'low',
        read: false,
      });
      return true;
    }
    return false;
  }

  // Password Reset Requests (Guru BK & Kepala Sekolah -> Admin Approval Flow)
  public getPasswordRequests(): PasswordResetRequest[] {
    return [...this.passwordRequests];
  }

  public requestPasswordReset(req: {
    userId?: string;
    userName: string;
    userEmail: string;
    userRole: any;
    schoolName: string;
    reason?: string;
    proposedPassword?: string;
  }): PasswordResetRequest {
    const newRequest: PasswordResetRequest = {
      id: `req-${Date.now()}`,
      userId: req.userId,
      userName: req.userName,
      userEmail: req.userEmail,
      userRole: req.userRole,
      schoolName: req.schoolName,
      requestedAt: new Date().toISOString(),
      reason: req.reason || 'Permintaan pengaturan ulang kata sandi oleh pengguna.',
      proposedPassword: req.proposedPassword,
      status: 'pending',
    };
    this.passwordRequests.unshift(newRequest);
    setStored(STORAGE_KEYS.PASSWORD_REQUESTS, this.passwordRequests);

    this.addAuditLog(
      req.userName,
      req.userRole,
      'Permintaan Kata Sandi',
      `Mengirimkan pengajuan reset/atur kata sandi untuk akun ${req.userEmail}`
    );

    this.addNotification({
      title: 'Permintaan Reset Kata Sandi Baru',
      message: `${req.userName} (${req.userRole.replace('_', ' ')}) dari ${req.schoolName} mengajukan reset kata sandi dan menunggu persetujuan Admin.`,
      type: 'warning',
      targetRoles: ['admin'],
      severity: 'medium',
      read: false,
    });

    return newRequest;
  }

  public approvePasswordReset(
    requestId: string,
    adminName: string = 'Super-Admin',
    customNewPassword?: string
  ): { success: boolean; newPassword?: string; message: string } {
    const req = this.passwordRequests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, message: 'Permintaan tidak ditemukan.' };
    }

    // Determine new password
    const newPassword = customNewPassword || req.proposedPassword || 'bk123456';

    // Find the user by ID or email
    let user = this.users.find((u) => (req.userId && u.id === req.userId) || u.email.toLowerCase() === req.userEmail.toLowerCase());
    if (user) {
      user.password = newPassword;
      setStored(STORAGE_KEYS.USERS, this.users);
    }

    req.status = 'approved';
    req.resolvedAt = new Date().toISOString();
    req.resolvedBy = adminName;
    req.adminNote = `Disetujui. Kata sandi baru diterapkan: ${newPassword}`;
    setStored(STORAGE_KEYS.PASSWORD_REQUESTS, this.passwordRequests);

    this.addAuditLog(
      adminName,
      'admin',
      'Setujui Reset Kata Sandi',
      `Menyetujui permintaan reset kata sandi untuk ${req.userName} (${req.userEmail})`
    );

    this.addNotification({
      title: 'Permintaan Kata Sandi Disetujui',
      message: `Permintaan reset kata sandi Anda telah disetujui oleh ${adminName}. Anda kini dapat masuk dengan kata sandi baru.`,
      type: 'success',
      targetRoles: [req.userRole],
      severity: 'medium',
      read: false,
    });

    return {
      success: true,
      newPassword,
      message: `Permintaan berhasil disetujui. Kata sandi aktif: ${newPassword}`,
    };
  }

  public rejectPasswordReset(requestId: string, adminName: string = 'Super-Admin', reason?: string): boolean {
    const req = this.passwordRequests.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'rejected';
    req.resolvedAt = new Date().toISOString();
    req.resolvedBy = adminName;
    req.adminNote = reason || 'Permintaan ditolak oleh Administrator.';
    setStored(STORAGE_KEYS.PASSWORD_REQUESTS, this.passwordRequests);

    this.addAuditLog(
      adminName,
      'admin',
      'Tolak Reset Kata Sandi',
      `Menolak permintaan reset kata sandi untuk ${req.userName}: ${reason || 'Tidak ada alasan'}`
    );

    this.addNotification({
      title: 'Permintaan Kata Sandi Ditolak',
      message: `Permintaan pengaturan kata sandi untuk ${req.userEmail} ditolak: ${reason || 'Silakan hubungi admin sekolah.'}`,
      type: 'alert',
      targetRoles: [req.userRole],
      severity: 'high',
      read: false,
    });

    return true;
  }

  // Qualitative Notes for Students
  public getStudentNotes(studentId?: string, classId?: string, periodId?: string): StudentQualitativeNote[] {
    let sId = studentId;
    let cId = classId;
    let pId = periodId;

    // Handle when called with (classId, periodId)
    if (sId && sId.startsWith('cls-') && !cId) {
      cId = sId;
      sId = undefined;
    }

    let result = [...this.studentNotes];
    if (sId) {
      result = result.filter((n) => n.studentId === sId);
    }
    if (cId) {
      result = result.filter((n) => n.classId === cId);
    }
    if (pId) {
      result = result.filter((n) => n.periodId === pId);
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public seedSimulationNotes(classId: string = 'cls-8a', periodId: string = 'period-2026-s1'): StudentQualitativeNote[] {
    const freshNotes = INITIAL_STUDENT_NOTES.map((n) => ({
      ...n,
      classId,
      periodId,
    }));
    this.studentNotes = [
      ...freshNotes,
      ...this.studentNotes.filter((n) => !(n.classId === classId && n.periodId === periodId)),
    ];
    setStored(STORAGE_KEYS.STUDENT_NOTES, this.studentNotes);

    if (INITIAL_CLASS_SUMMARIES['cls-8a_period-2026-s1']) {
      this.saveClassCounselorSummary(
        classId,
        periodId,
        INITIAL_CLASS_SUMMARIES['cls-8a_period-2026-s1'].counselorReflection
      );
    }

    this.addAuditLog(
      'Guru BK',
      'guru_bk',
      'Muat Data Simulasi Catatan Kualitatif',
      `Memuat 12 catatan anekdotal & sintesis tematik percontohan untuk ${classId}`
    );

    return this.getStudentNotes(undefined, classId, periodId);
  }

  public addStudentNote(note: Omit<StudentQualitativeNote, 'id' | 'createdAt'>): StudentQualitativeNote {
    const newNote: StudentQualitativeNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.studentNotes.unshift(newNote);
    setStored(STORAGE_KEYS.STUDENT_NOTES, this.studentNotes);

    this.addAuditLog(
      note.authorName,
      note.authorRole as any,
      'Tambah Catatan Kualitatif Siswa',
      `Catatan kualitatif ditambahkan untuk ${note.studentName} (${note.context})`
    );

    cloudHandler?.saveDocument('student_notes', newNote.id, newNote);
    this.notifySubscribers('student_notes');

    return newNote;
  }

  public updateStudentNote(updatedNote: StudentQualitativeNote): void {
    const idx = this.studentNotes.findIndex((n) => n.id === updatedNote.id);
    if (idx !== -1) {
      this.studentNotes[idx] = { ...updatedNote };
      setStored(STORAGE_KEYS.STUDENT_NOTES, this.studentNotes);
      cloudHandler?.saveDocument('student_notes', updatedNote.id, updatedNote);
      this.notifySubscribers('student_notes');
    }
  }

  public deleteStudentNote(noteId: string): void {
    const target = this.studentNotes.find((n) => n.id === noteId);
    this.studentNotes = this.studentNotes.filter((n) => n.id !== noteId);
    setStored(STORAGE_KEYS.STUDENT_NOTES, this.studentNotes);
    if (target) {
      this.addAuditLog(
        'Guru BK',
        'guru_bk',
        'Hapus Catatan Kualitatif',
        `Catatan untuk ${target.studentName} dihapus.`
      );
    }
    cloudHandler?.deleteDocument('student_notes', noteId);
    this.notifySubscribers('student_notes');
  }

  // Class Counselor Reflection Summary (included in Printable Report)
  public getClassCounselorSummary(classId: string, periodId: string): string {
    const key = `${classId}_${periodId}`;
    if (this.classSummaries[key]) {
      return this.classSummaries[key].counselorReflection;
    }
    return '';
  }

  public saveClassCounselorSummary(
    classId: string,
    periodId: string,
    reflection: string,
    authorName: string = 'Liengga Brian Darea, S.Sos.,Gr'
  ): void {
    const key = `${classId}_${periodId}`;
    const summaryData: ClassCounselorSummary = {
      classId,
      periodId,
      counselorReflection: reflection,
      updatedAt: new Date().toISOString(),
      updatedBy: authorName,
    };
    this.classSummaries[key] = summaryData;
    setStored(STORAGE_KEYS.CLASS_SUMMARIES, this.classSummaries);

    this.addAuditLog(
      authorName,
      'guru_bk',
      'Simpan Refleksi Kualitatif Kelas',
      `Memperbarui catatan kualitatif laporan cetak untuk kelas ${classId}`
    );

    cloudHandler?.saveDocument('class_summaries', key, { id: key, ...summaryData });
    this.notifySubscribers('class_summaries');
  }

  // Reset to factory mock data or clean survey data
  public resetToDefault(mode: 'factory' | 'clean' = 'factory'): void {
    if (mode === 'clean') {
      this.students = [];
      this.nominations = [];
      this.behaviors = [];
      this.studentNotes = [];
      setStored(STORAGE_KEYS.STUDENTS, []);
      setStored(STORAGE_KEYS.NOMINATIONS, []);
      setStored(STORAGE_KEYS.BEHAVIORS, []);
      setStored(STORAGE_KEYS.STUDENT_NOTES, []);
      this.addAuditLog('Super-Admin', 'admin', 'Reset Data Asesmen (Clean)', 'Data isian survei sosiometri & perilaku siswa dibersihkan.');
    } else {
      localStorage.clear();
      this.periods = INITIAL_PERIODS;
      this.schools = INITIAL_SCHOOLS;
      this.classes = INITIAL_CLASSES;
      this.students = INITIAL_STUDENTS_8A;
      this.nominations = generateSeedNominations('period-2026-s1');
      this.behaviors = generateSeedBehavioralRatings('period-2026-s1');
      this.users = INITIAL_USERS;
      this.notifications = INITIAL_NOTIFICATIONS;
      this.passwordRequests = INITIAL_PASSWORD_REQUESTS;
      this.studentNotes = INITIAL_STUDENT_NOTES;
      this.classSummaries = INITIAL_CLASS_SUMMARIES;
      this.auditLogs = [];
      this.activePeriodId = 'period-2026-s1';
      this.activeClassId = 'cls-8a';
      this.addAuditLog('Super-Admin', 'admin', 'Reset Pabrik (Factory Default)', 'Sistem dipulihkan ke konfigurasi percontohan MTs Negeri 2 Bangka.');
    }
  }
}

export const dataStorage = DataStorageService.getInstance();
