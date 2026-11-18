import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  Unsubscribe,
  testConnection,
  OperationType,
  classifyFirestoreError,
  handleFirestoreError,
  QuerySnapshot,
  DocumentData,
} from './firebase';
import { dataStorage, registerCloudHandler } from './dataStorage';
import {
  School,
  SchoolClass,
  Period,
  Student,
  SociometricNomination,
  PeerBehavioralRating,
  StudentQualitativeNote,
  ClassCounselorSummary,
  NotificationItem,
  AuditLog,
  User,
  PasswordResetRequest,
} from '../types';

const CLOUD_SEED_VERSION = '2026_iainsas_v25';

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const cleaned: Record<string, any> = {};
    Object.entries(value as Record<string, any>).forEach(([k, v]) => {
      if (v !== undefined) {
        cleaned[k] = stripUndefined(v);
      }
    });
    return cleaned as T;
  }
  return value;
}

export type CloudSyncStatus = 'idle' | 'syncing' | 'connected' | 'offline' | 'error';

class FirestoreSyncService {
  private static instance: FirestoreSyncService;
  private unsubscribers: Unsubscribe[] = [];
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private onlineListenerRegistered = false;
  private syncStatus: CloudSyncStatus = 'idle';
  private lastSyncedTime: Date | null = null;
  private lastError: string | null = null;
  private statusListeners: Array<
    (status: CloudSyncStatus, lastSynced: Date | null, lastError: string | null) => void
  > = [];

  private constructor() {}

  public static getInstance(): FirestoreSyncService {
    if (!FirestoreSyncService.instance) {
      FirestoreSyncService.instance = new FirestoreSyncService();
    }
    return FirestoreSyncService.instance;
  }

  public onStatusChange(
    callback: (status: CloudSyncStatus, lastSynced: Date | null, lastError: string | null) => void
  ): () => void {
    this.statusListeners.push(callback);
    callback(this.syncStatus, this.lastSyncedTime, this.lastError);
    return () => {
      const idx = this.statusListeners.indexOf(callback);
      if (idx !== -1) this.statusListeners.splice(idx, 1);
    };
  }

  private setStatus(status: CloudSyncStatus, errorMsg: string | null = null) {
    this.syncStatus = status;
    this.lastError = errorMsg;
    if (status === 'connected') {
      this.lastSyncedTime = new Date();
    }
    this.statusListeners.forEach((fn) => {
      try {
        fn(this.syncStatus, this.lastSyncedTime, this.lastError);
      } catch (e) {
        console.warn('Status listener error:', e);
      }
    });
  }

  public getStatus(): { status: CloudSyncStatus; lastSynced: Date | null; lastError: string | null } {
    return { status: this.syncStatus, lastSynced: this.lastSyncedTime, lastError: this.lastError };
  }

  private registerReconnectOnOnline(): void {
    if (typeof window === 'undefined' || this.onlineListenerRegistered) return;
    this.onlineListenerRegistered = true;
    window.addEventListener('online', () => {
      if (!this.isInitialized || this.syncStatus === 'offline' || this.syncStatus === 'error') {
        this.isInitialized = false;
        this.initPromise = null;
        this.initSync().catch(() => {});
      }
    });
  }

  /**
   * Initialize real-time two-way synchronization between Cloud Firestore and DataStorageService.
   * Ensures every browser/device shares one authoritative Cloud database.
   */
  public async initSync(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    if (this.isInitialized && this.unsubscribers.length > 0) return;

    this.registerReconnectOnOnline();
    this.setStatus('syncing', null);

    this.initPromise = (async () => {
      try {
        const isOnline = await testConnection();
        if (!isOnline) {
          this.setStatus('offline', 'Perangkat offline atau gagal menjangkau server Cloud Firestore.');
          return;
        }

        // Verify bootstrap state without overwriting existing class/student uploads
        const [classesSnap, schoolsSnap, usersSnap, periodsSnap, seedVersionSnap] = await Promise.all([
          getDocs(collection(db, 'classes')),
          getDocs(collection(db, 'schools')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'periods')),
          getDoc(doc(db, 'settings', 'seed_version')).catch(() => null),
        ]);

        if (classesSnap.empty && schoolsSnap.empty) {
          console.info('[FirestoreSync] Cloud database kosong. Melakukan seed awal ke Firestore...');
          await this.seedInitialDataToCloud();
        } else {
          // Ensure users directory exists in cloud if migrating from older rule version
          if (usersSnap.empty) {
            await this.saveBatch('users', dataStorage.getUsers());
          }

          const remoteSeedVersion = seedVersionSnap?.exists()
            ? (seedVersionSnap.data() as any)?.version
            : null;

          if (remoteSeedVersion !== CLOUD_SEED_VERSION) {
            await this.seedMissingMasterTenantsToCloud(schoolsSnap, classesSnap, periodsSnap, usersSnap);
          }
        }

        // Attach realtime onSnapshot listeners across all collections and await initial load
        await this.setupRealtimeListeners();
        this.isInitialized = true;
        this.setStatus('connected', null);
      } catch (error) {
        const classified = classifyFirestoreError(error);
        console.warn('[FirestoreSync] Cloud synchronization notice:', classified.rawMessage);
        this.setStatus(
          classified.kind === 'offline' ? 'offline' : 'error',
          classified.userMessage
        );
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  /**
   * Manually pull all collections directly from Cloud Firestore server
   */
  public async pullAllFromCloud(): Promise<{
    success: boolean;
    error?: string;
    syncedDocs?: number;
  }> {
    this.setStatus('syncing', null);
    try {
      const fetchCol = async (colName: string) => {
        try {
          return await getDocsFromServer(collection(db, colName));
        } catch {
          return await getDocs(collection(db, colName));
        }
      };

      const [
        schoolsSnap,
        classesSnap,
        periodsSnap,
        usersSnap,
        passwordRequestsSnap,
        studentsSnap,
        notesSnap,
        summariesSnap,
        nomsSnap,
        behaviorsSnap,
        notificationsSnap,
        auditLogsSnap,
      ] = await Promise.all([
        fetchCol('schools'),
        fetchCol('classes'),
        fetchCol('periods'),
        fetchCol('users'),
        fetchCol('password_requests'),
        fetchCol('students'),
        fetchCol('student_notes'),
        fetchCol('class_summaries'),
        fetchCol('nominations'),
        fetchCol('behaviors'),
        fetchCol('notifications'),
        fetchCol('audit_logs'),
      ]);

      if (!schoolsSnap.empty) {
        dataStorage.syncFromCloud('schools', schoolsSnap.docs.map((d) => d.data() as School), { silent: true });
      }
      if (!classesSnap.empty) {
        dataStorage.syncFromCloud('classes', classesSnap.docs.map((d) => d.data() as SchoolClass), { silent: true });
      }
      if (!periodsSnap.empty) {
        dataStorage.syncFromCloud('periods', periodsSnap.docs.map((d) => d.data() as Period), { silent: true });
      }
      if (!usersSnap.empty) {
        dataStorage.syncFromCloud('users', usersSnap.docs.map((d) => d.data() as User), { silent: true });
      }

      dataStorage.syncFromCloud(
        'password_requests',
        passwordRequestsSnap.docs.map((d) => d.data() as PasswordResetRequest),
        { silent: true }
      );
      dataStorage.syncFromCloud('students', studentsSnap.docs.map((d) => d.data() as Student), { silent: true });
      dataStorage.syncFromCloud(
        'student_notes',
        notesSnap.docs.map((d) => d.data() as StudentQualitativeNote),
        { silent: true }
      );
      dataStorage.syncFromCloud(
        'class_summaries',
        summariesSnap.docs.map((d) => d.data() as ClassCounselorSummary),
        { silent: true }
      );
      dataStorage.syncFromCloud(
        'nominations',
        nomsSnap.docs.map((d) => d.data() as SociometricNomination),
        { silent: true }
      );
      dataStorage.syncFromCloud(
        'behaviors',
        behaviorsSnap.docs.map((d) => d.data() as PeerBehavioralRating),
        { silent: true }
      );
      dataStorage.syncFromCloud(
        'notifications',
        notificationsSnap.docs.map((d) => d.data() as NotificationItem),
        { silent: true }
      );
      dataStorage.syncFromCloud(
        'audit_logs',
        auditLogsSnap.docs.map((d) => d.data() as AuditLog),
        { silent: true }
      );

      dataStorage.notifySubscribers('cloud_pull');

      // Re-attach listeners if user refreshed from an offline boot
      if (!this.isInitialized || this.unsubscribers.length === 0) {
        await this.setupRealtimeListeners();
        this.isInitialized = true;
      }

      this.setStatus('connected', null);
      const totalDocs =
        schoolsSnap.size +
        classesSnap.size +
        studentsSnap.size +
        nomsSnap.size +
        behaviorsSnap.size +
        notesSnap.size;
      return { success: true, syncedDocs: totalDocs };
    } catch (e) {
      const classified = classifyFirestoreError(e);
      console.error('[FirestoreSync] Error pulling from cloud:', classified.rawMessage);
      this.setStatus(
        classified.kind === 'offline' ? 'offline' : 'error',
        classified.userMessage
      );
      return { success: false, error: classified.userMessage };
    }
  }

  /**
   * Seed initial master & benchmark data when Firestore DB is completely empty
   */
  private async seedInitialDataToCloud(): Promise<void> {
    await this.saveBatch('schools', dataStorage.getSchools());
    await this.saveBatch('classes', dataStorage.getClasses());
    await this.saveBatch('periods', dataStorage.getPeriods());
    await this.saveBatch('users', dataStorage.getUsers());
    await this.saveBatch('students', dataStorage.getAllStudents());
    await this.saveBatch('student_notes', dataStorage.getStudentNotes());
    await this.saveBatch('nominations', dataStorage.getNominations());
    await this.saveBatch('behaviors', dataStorage.getBehaviors());
    await this.saveBatch('notifications', dataStorage.getNotifications());
    await this.saveBatch('password_requests', dataStorage.getPasswordRequests());

    await this.saveDocument('settings', 'seed_version', {
      id: 'seed_version',
      version: CLOUD_SEED_VERSION,
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Non-destructive migration: add only missing master tenant documents
   * without touching existing cloud students, nominations, or behaviors.
   */
  private async seedMissingMasterTenantsToCloud(
    schoolsSnap: QuerySnapshot<DocumentData>,
    classesSnap: QuerySnapshot<DocumentData>,
    periodsSnap: QuerySnapshot<DocumentData>,
    usersSnap: QuerySnapshot<DocumentData>
  ): Promise<void> {
    const existingSchoolIds = new Set(schoolsSnap.docs.map((d) => d.id));
    const existingClassIds = new Set(classesSnap.docs.map((d) => d.id));
    const existingPeriodIds = new Set(periodsSnap.docs.map((d) => d.id));
    const existingUserIds = new Set(usersSnap.docs.map((d) => d.id));

    const missingSchools = dataStorage.getSchools().filter((s) => !existingSchoolIds.has(s.id));
    const missingClasses = dataStorage.getClasses().filter((c) => !existingClassIds.has(c.id));
    const missingPeriods = dataStorage.getPeriods().filter((p) => !existingPeriodIds.has(p.id));
    const missingUsers = dataStorage.getUsers().filter((u) => !existingUserIds.has(u.id));

    if (missingSchools.length > 0) await this.saveBatch('schools', missingSchools);
    if (missingClasses.length > 0) await this.saveBatch('classes', missingClasses);
    if (missingPeriods.length > 0) await this.saveBatch('periods', missingPeriods);
    if (missingUsers.length > 0) await this.saveBatch('users', missingUsers);

    await this.saveDocument('settings', 'seed_version', {
      id: 'seed_version',
      version: CLOUD_SEED_VERSION,
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Attach real-time Firestore listeners so uploads/edits from any Guru BK
   * appear immediately on all other connected browsers & devices.
   */
  private async setupRealtimeListeners(): Promise<void> {
    this.unsubscribers.forEach((u) => u());
    this.unsubscribers = [];

    const attachCollectionListener = <T>(
      colName: string,
      options?: { allowEmptyUpdate?: boolean }
    ): Promise<void> => {
      return new Promise((resolve) => {
        let initialResolved = false;
        const markResolved = () => {
          if (!initialResolved) {
            initialResolved = true;
            resolve();
          }
        };

        const unsub = onSnapshot(
          collection(db, colName),
          (snap) => {
            // Avoid overwriting in-memory state from an empty offline cache before server responds
            if (snap.empty && snap.metadata.fromCache) {
              markResolved();
              return;
            }

            const docs = snap.docs.map((d) => d.data() as T);
            if (options?.allowEmptyUpdate || !snap.empty) {
              dataStorage.syncFromCloud(colName, docs);
            }
            this.setStatus('connected', null);
            markResolved();
          },
          (err) => {
            const classified = classifyFirestoreError(err);
            console.warn(`[FirestoreSync] Listener notice on ${colName}:`, classified.rawMessage);
            this.setStatus(
              classified.kind === 'offline' ? 'offline' : 'error',
              classified.userMessage
            );
            markResolved();
          }
        );

        this.unsubscribers.push(unsub);
      });
    };

    await Promise.all([
      attachCollectionListener<School>('schools', { allowEmptyUpdate: false }),
      attachCollectionListener<SchoolClass>('classes', { allowEmptyUpdate: false }),
      attachCollectionListener<Period>('periods', { allowEmptyUpdate: false }),
      attachCollectionListener<User>('users', { allowEmptyUpdate: false }),
      attachCollectionListener<PasswordResetRequest>('password_requests', { allowEmptyUpdate: true }),
      attachCollectionListener<Student>('students', { allowEmptyUpdate: true }),
      attachCollectionListener<StudentQualitativeNote>('student_notes', { allowEmptyUpdate: true }),
      attachCollectionListener<ClassCounselorSummary>('class_summaries', { allowEmptyUpdate: true }),
      attachCollectionListener<SociometricNomination>('nominations', { allowEmptyUpdate: true }),
      attachCollectionListener<PeerBehavioralRating>('behaviors', { allowEmptyUpdate: true }),
      attachCollectionListener<NotificationItem>('notifications', { allowEmptyUpdate: true }),
      attachCollectionListener<AuditLog>('audit_logs', { allowEmptyUpdate: true }),
    ]);
  }

  /**
   * Save a single document to Firestore (write-through)
   */
  public async saveDocument(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      await setDoc(doc(db, collectionName, docId), stripUndefined(data), { merge: true });
      this.setStatus('connected', null);
    } catch (e) {
      const classified = classifyFirestoreError(e);
      this.setStatus(classified.kind === 'offline' ? 'offline' : 'error', classified.userMessage);
      handleFirestoreError(e, OperationType.WRITE, `${collectionName}/${docId}`);
    }
  }

  /**
   * Delete a single document from Firestore
   */
  public async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      this.setStatus('connected', null);
    } catch (e) {
      const classified = classifyFirestoreError(e);
      this.setStatus(classified.kind === 'offline' ? 'offline' : 'error', classified.userMessage);
      handleFirestoreError(e, OperationType.DELETE, `${collectionName}/${docId}`);
    }
  }

  /**
   * Save a batch of documents in chunks of 450
   */
  public async saveBatch(
    collectionName: string,
    items: Array<{ id: string; [k: string]: any }>
  ): Promise<void> {
    if (!items || items.length === 0) return;
    try {
      const chunkSize = 450;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((item) => {
          batch.set(doc(db, collectionName, item.id), stripUndefined(item), { merge: true });
        });
        await batch.commit();
      }
      this.setStatus('connected', null);
    } catch (e) {
      const classified = classifyFirestoreError(e);
      this.setStatus(classified.kind === 'offline' ? 'offline' : 'error', classified.userMessage);
      handleFirestoreError(e, OperationType.WRITE, collectionName);
    }
  }

  /**
   * Atomically clean overwrite a scoped slice (e.g. classId or periodId+classId) in Firestore.
   * Uses a single-field Firestore query + JS filter to avoid composite index dependency.
   */
  public async replaceScopedBatch(
    collectionName: string,
    filters: Array<{ field: string; value: string }>,
    items: Array<{ id: string; [k: string]: any }>
  ): Promise<void> {
    try {
      const primaryFilter = filters.find((f) => f.field === 'classId') || filters[0];
      const existingSnap = primaryFilter
        ? await getDocs(query(collection(db, collectionName), where(primaryFilter.field, '==', primaryFilter.value)))
        : await getDocs(collection(db, collectionName));

      const keepIds = new Set((items || []).map((it) => it.id));
      const ops: Array<{ type: 'delete' | 'set'; id: string; data?: any }> = [];

      existingSnap.docs.forEach((d) => {
        const data = d.data() || {};
        const matchesScope = filters.every((f) => data[f.field] === f.value);
        if (matchesScope && !keepIds.has(d.id)) {
          ops.push({ type: 'delete', id: d.id });
        }
      });

      (items || []).forEach((item) => {
        ops.push({ type: 'set', id: item.id, data: stripUndefined(item) });
      });

      const chunkSize = 450;
      for (let i = 0; i < ops.length; i += chunkSize) {
        const chunk = ops.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((op) => {
          const ref = doc(db, collectionName, op.id);
          if (op.type === 'delete') {
            batch.delete(ref);
          } else {
            batch.set(ref, op.data, { merge: true });
          }
        });
        await batch.commit();
      }
      this.setStatus('connected', null);
    } catch (e) {
      const classified = classifyFirestoreError(e);
      this.setStatus(classified.kind === 'offline' ? 'offline' : 'error', classified.userMessage);
      handleFirestoreError(e, OperationType.WRITE, collectionName);
    }
  }

  /**
   * Clear or factory-restore Firestore collections when Admin executes resetToDefault()
   */
  public async resetCloudDatabase(
    mode: 'factory' | 'clean',
    factoryPayload?: Record<string, any>
  ): Promise<void> {
    const deleteCollectionDocs = async (colName: string) => {
      const snap = await getDocs(collection(db, colName));
      const docs = snap.docs;
      const chunkSize = 450;
      for (let i = 0; i < docs.length; i += chunkSize) {
        const batch = writeBatch(db);
        docs.slice(i, i + chunkSize).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    };

    try {
      await Promise.all([
        deleteCollectionDocs('students'),
        deleteCollectionDocs('nominations'),
        deleteCollectionDocs('behaviors'),
        deleteCollectionDocs('student_notes'),
      ]);

      if (mode === 'factory' && factoryPayload) {
        await Promise.all([
          deleteCollectionDocs('class_summaries'),
          deleteCollectionDocs('notifications'),
          deleteCollectionDocs('password_requests'),
          deleteCollectionDocs('audit_logs'),
        ]);
        await this.saveBatch('schools', factoryPayload.schools || []);
        await this.saveBatch('classes', factoryPayload.classes || []);
        await this.saveBatch('periods', factoryPayload.periods || []);
        await this.saveBatch('users', factoryPayload.users || []);
        await this.saveBatch('students', factoryPayload.students || []);
        await this.saveBatch('nominations', factoryPayload.nominations || []);
        await this.saveBatch('behaviors', factoryPayload.behaviors || []);
        await this.saveBatch('student_notes', factoryPayload.studentNotes || []);
        await this.saveBatch('notifications', factoryPayload.notifications || []);
        await this.saveBatch('password_requests', factoryPayload.passwordRequests || []);

        const summariesObj = factoryPayload.classSummaries || {};
        const summaryItems = Object.entries(summariesObj).map(([k, v]: [string, any]) => ({
          id: k,
          ...v,
        }));
        await this.saveBatch('class_summaries', summaryItems);
      }

      this.setStatus('connected', null);
    } catch (e) {
      const classified = classifyFirestoreError(e);
      this.setStatus(classified.kind === 'offline' ? 'offline' : 'error', classified.userMessage);
      handleFirestoreError(e, OperationType.WRITE, 'resetCloudDatabase');
    }
  }

  public destroy(): void {
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
    this.isInitialized = false;
    this.initPromise = null;
  }
}

export const firestoreSync = FirestoreSyncService.getInstance();

// Connect write-through handler so DataStorageService mutations sync to Cloud Firestore
registerCloudHandler({
  saveDocument: (col, id, data) => firestoreSync.saveDocument(col, id, data),
  deleteDocument: (col, id) => firestoreSync.deleteDocument(col, id),
  saveBatch: (col, items) => firestoreSync.saveBatch(col, items),
  replaceScopedBatch: (col, filters, items) => firestoreSync.replaceScopedBatch(col, filters, items),
  resetCloud: (mode, payload) => firestoreSync.resetCloudDatabase(mode, payload),
});

// Auto-initialize real-time cloud sync
if (typeof window !== 'undefined') {
  firestoreSync.initSync().catch((err) => {
    console.warn('[FirestoreSync] Initial sync deferred or offline:', err);
  });
}
