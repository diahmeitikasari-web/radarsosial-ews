import {
  db,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  Unsubscribe,
  testConnection,
} from './firebase';
import { dataStorage, registerCloudHandler } from './dataStorage';

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
} from '../types';

export type CloudSyncStatus = 'idle' | 'syncing' | 'connected' | 'offline' | 'error';

class FirestoreSyncService {
  private static instance: FirestoreSyncService;
  private unsubscribers: Unsubscribe[] = [];
  private isInitialized = false;
  private syncStatus: CloudSyncStatus = 'idle';
  private lastSyncedTime: Date | null = null;
  private statusListeners: Array<(status: CloudSyncStatus, lastSynced: Date | null) => void> = [];
  private isApplyingRemoteUpdate = false;

  private constructor() {}

  public static getInstance(): FirestoreSyncService {
    if (!FirestoreSyncService.instance) {
      FirestoreSyncService.instance = new FirestoreSyncService();
    }
    return FirestoreSyncService.instance;
  }

  public onStatusChange(callback: (status: CloudSyncStatus, lastSynced: Date | null) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.syncStatus, this.lastSyncedTime);
    return () => {
      const idx = this.statusListeners.indexOf(callback);
      if (idx !== -1) this.statusListeners.splice(idx, 1);
    };
  }

  private setStatus(status: CloudSyncStatus) {
    this.syncStatus = status;
    if (status === 'connected') {
      this.lastSyncedTime = new Date();
    }
    this.statusListeners.forEach((fn) => {
      try {
        fn(this.syncStatus, this.lastSyncedTime);
      } catch (e) {
        console.warn('Status listener error:', e);
      }
    });
  }

  public getStatus(): { status: CloudSyncStatus; lastSynced: Date | null } {
    return { status: this.syncStatus, lastSynced: this.lastSyncedTime };
  }

  /**
   * Initialize two-way synchronization between Firestore and DataStorageService.
   * If Firestore is empty initially, seeds it from local initial data.
   * Listens for real-time changes so other browsers reflect updates immediately.
   */
  public async initSync(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.setStatus('syncing');

    try {
      const isOnline = await testConnection();
      if (!isOnline) {
        this.setStatus('offline');
        return;
      }

      // Check if Firestore already has classes and schools
      const [classesSnap, schoolsSnap] = await Promise.all([
        getDocs(collection(db, 'classes')),
        getDocs(collection(db, 'schools')),
      ]);

      if (classesSnap.empty) {
        // First-time setup: Seed cloud database with initial local dataset
        console.info('[FirestoreSync] Cloud database is empty. Performing initial seed to Firestore...');
        await this.seedInitialDataToCloud();
      } else {
        // Cloud has existing data: pull down initial state to memory & cache
        console.info('[FirestoreSync] Cloud database active. Fetching latest remote documents...');
        await this.pullAllFromCloud();

        // Check if any multi-tenant schools or classes (e.g. IAIN SAS & field schools) are missing in Firestore
        const localSchools = dataStorage.getSchools();
        const localClasses = dataStorage.getClasses();
        const hasAllSchools = localSchools.every((ls) => schoolsSnap.docs.some((d) => d.id === ls.id));
        const hasAllClasses = localClasses.every((lc) => classesSnap.docs.some((d) => d.id === lc.id));
        if (!hasAllSchools || !hasAllClasses) {
          console.info('[FirestoreSync] Cloud missing multi-tenant documents. Uploading updated tenant seed to Firestore...');
          await this.seedMissingTenantsToCloud();
        }
      }

      // Setup real-time Firestore listeners for multi-browser live updates
      this.setupRealtimeListeners();
      this.setStatus('connected');
    } catch (error) {
      console.warn('[FirestoreSync] Cloud synchronization fallback to local cache:', error);
      this.setStatus('offline');
    }
  }

  /**
   * Pull all collections from Firestore into DataStorageService
   */
  public async pullAllFromCloud(): Promise<void> {
    try {
      const [
        schoolsSnap,
        classesSnap,
        periodsSnap,
        studentsSnap,
        notesSnap,
        summariesSnap,
        nomsSnap,
        behaviorsSnap,
      ] = await Promise.all([
        getDocs(collection(db, 'schools')),
        getDocs(collection(db, 'classes')),
        getDocs(collection(db, 'periods')),
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'student_notes')),
        getDocs(collection(db, 'class_summaries')),
        getDocs(collection(db, 'nominations')),
        getDocs(collection(db, 'behaviors')),
      ]);

      this.isApplyingRemoteUpdate = true;

      if (!schoolsSnap.empty) {
        const schools = schoolsSnap.docs.map((d) => d.data() as School);
        dataStorage.syncFromCloud('schools', schools);
      }
      if (!classesSnap.empty) {
        const classes = classesSnap.docs.map((d) => d.data() as SchoolClass);
        dataStorage.syncFromCloud('classes', classes);
      }
      if (!periodsSnap.empty) {
        const periods = periodsSnap.docs.map((d) => d.data() as Period);
        dataStorage.syncFromCloud('periods', periods);
      }
      if (!studentsSnap.empty) {
        const students = studentsSnap.docs.map((d) => d.data() as Student);
        dataStorage.syncFromCloud('students', students);
      }
      if (!notesSnap.empty) {
        const notes = notesSnap.docs.map((d) => d.data() as StudentQualitativeNote);
        dataStorage.syncFromCloud('student_notes', notes);
      }
      if (!summariesSnap.empty) {
        const summaries = summariesSnap.docs.map((d) => d.data() as ClassCounselorSummary);
        dataStorage.syncFromCloud('class_summaries', summaries);
      }
      if (!nomsSnap.empty) {
        const noms = nomsSnap.docs.map((d) => d.data() as SociometricNomination);
        dataStorage.syncFromCloud('nominations', noms);
      }
      if (!behaviorsSnap.empty) {
        const behaviors = behaviorsSnap.docs.map((d) => d.data() as PeerBehavioralRating);
        dataStorage.syncFromCloud('behaviors', behaviors);
      }

      this.isApplyingRemoteUpdate = false;
      this.setStatus('connected');
    } catch (e) {
      this.isApplyingRemoteUpdate = false;
      console.error('[FirestoreSync] Error pulling from cloud:', e);
    }
  }

  /**
   * Seed all initial data from dataStorage into Firestore safely using batched chunks
   */
  private async seedInitialDataToCloud(): Promise<void> {
    try {
      const schools = dataStorage.getSchools();
      await this.saveBatch('schools', schools);

      const classes = dataStorage.getClasses();
      await this.saveBatch('classes', classes);

      const periods = dataStorage.getPeriods();
      await this.saveBatch('periods', periods);

      const students = dataStorage.getAllStudents();
      await this.saveBatch('students', students);

      const notes = dataStorage.getStudentNotes();
      await this.saveBatch('student_notes', notes);

      const noms = dataStorage.getNominations();
      await this.saveBatch('nominations', noms);

      const behaviors = dataStorage.getBehaviors();
      await this.saveBatch('behaviors', behaviors);

      await this.saveDocument('settings', 'global', {
        id: 'global',
        activePeriodId: dataStorage.getActivePeriod()?.id || 'period-2026-s1',
        activeClassId: dataStorage.getActiveClass()?.id || 'cls-8a',
        lastUpdated: new Date().toISOString(),
      });
      console.info('[FirestoreSync] Initial seed committed successfully to Firestore.');
    } catch (e) {
      console.error('[FirestoreSync] Error seeding initial data:', e);
    }
  }

  /**
   * Seed missing multi-tenant schools, classes, and students to cloud Firestore
   */
  private async seedMissingTenantsToCloud(): Promise<void> {
    try {
      const schools = dataStorage.getSchools();
      await this.saveBatch('schools', schools);

      const classes = dataStorage.getClasses();
      await this.saveBatch('classes', classes);

      const students = dataStorage.getAllStudents();
      await this.saveBatch('students', students);

      const noms = dataStorage.getNominations();
      await this.saveBatch('nominations', noms);

      const behaviors = dataStorage.getBehaviors();
      await this.saveBatch('behaviors', behaviors);
      console.info('[FirestoreSync] Missing tenant records committed successfully to Firestore.');
    } catch (e) {
      console.warn('[FirestoreSync] Error seeding missing tenants to cloud:', e);
    }
  }

  /**
   * Realtime listeners: whenever data changes in Firestore (e.g. from another browser),
   * apply changes to local DataStorageService and notify UI components.
   */
  private setupRealtimeListeners(): void {
    const handleListenerError = (collectionName: string) => (err: any) => {
      console.warn(`[FirestoreSync] Realtime listener notice for ${collectionName}:`, err?.message || err);
      this.setStatus('offline');
    };

    // Classes listener
    const unsubClasses = onSnapshot(collection(db, 'classes'), (snap) => {
      if (this.isApplyingRemoteUpdate || snap.empty) return;
      const classes = snap.docs.map((d) => d.data() as SchoolClass);
      dataStorage.syncFromCloud('classes', classes);
      this.setStatus('connected');
    }, handleListenerError('classes'));
    this.unsubscribers.push(unsubClasses);

    // Students listener
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      if (this.isApplyingRemoteUpdate || snap.empty) return;
      const students = snap.docs.map((d) => d.data() as Student);
      dataStorage.syncFromCloud('students', students);
      this.setStatus('connected');
    }, handleListenerError('students'));
    this.unsubscribers.push(unsubStudents);

    // Qualitative Notes listener
    const unsubNotes = onSnapshot(collection(db, 'student_notes'), (snap) => {
      if (this.isApplyingRemoteUpdate || snap.empty) return;
      const notes = snap.docs.map((d) => d.data() as StudentQualitativeNote);
      dataStorage.syncFromCloud('student_notes', notes);
      this.setStatus('connected');
    }, handleListenerError('student_notes'));
    this.unsubscribers.push(unsubNotes);

    // Class Summaries listener
    const unsubSummaries = onSnapshot(collection(db, 'class_summaries'), (snap) => {
      if (this.isApplyingRemoteUpdate || snap.empty) return;
      const summaries = snap.docs.map((d) => d.data() as ClassCounselorSummary);
      dataStorage.syncFromCloud('class_summaries', summaries);
      this.setStatus('connected');
    }, handleListenerError('class_summaries'));
    this.unsubscribers.push(unsubSummaries);

    // Schools listener
    const unsubSchools = onSnapshot(collection(db, 'schools'), (snap) => {
      if (this.isApplyingRemoteUpdate || snap.empty) return;
      const schools = snap.docs.map((d) => d.data() as School);
      dataStorage.syncFromCloud('schools', schools);
      this.setStatus('connected');
    }, handleListenerError('schools'));
    this.unsubscribers.push(unsubSchools);

    // Periods listener
    const unsubPeriods = onSnapshot(collection(db, 'periods'), (snap) => {
      if (this.isApplyingRemoteUpdate || snap.empty) return;
      const periods = snap.docs.map((d) => d.data() as Period);
      dataStorage.syncFromCloud('periods', periods);
      this.setStatus('connected');
    }, handleListenerError('periods'));
    this.unsubscribers.push(unsubPeriods);

    // Nominations listener
    const unsubNoms = onSnapshot(collection(db, 'nominations'), (snap) => {
      if (this.isApplyingRemoteUpdate || snap.empty) return;
      const noms = snap.docs.map((d) => d.data() as SociometricNomination);
      dataStorage.syncFromCloud('nominations', noms);
      this.setStatus('connected');
    }, handleListenerError('nominations'));
    this.unsubscribers.push(unsubNoms);

    // Behaviors listener
    const unsubBehaviors = onSnapshot(collection(db, 'behaviors'), (snap) => {
      if (this.isApplyingRemoteUpdate || snap.empty) return;
      const behaviors = snap.docs.map((d) => d.data() as PeerBehavioralRating);
      dataStorage.syncFromCloud('behaviors', behaviors);
      this.setStatus('connected');
    }, handleListenerError('behaviors'));
    this.unsubscribers.push(unsubBehaviors);
  }

  /**
   * Save a single document to Firestore (write-through)
   */
  public async saveDocument(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      await setDoc(doc(db, collectionName, docId), stripUndefined(data), { merge: true });
      this.setStatus('connected');
    } catch (e) {
      console.warn(`[FirestoreSync] Failed to save document ${collectionName}/${docId}:`, e);
      this.setStatus('offline');
    }
  }

  /**
   * Delete a document from Firestore
   */
  public async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      this.setStatus('connected');
    } catch (e) {
      console.warn(`[FirestoreSync] Failed to delete document ${collectionName}/${docId}:`, e);
      this.setStatus('offline');
    }
  }

  /**
   * Save a batch of documents (e.g. students imported via Excel)
   */
  public async saveBatch(collectionName: string, items: Array<{ id: string; [k: string]: any }>): Promise<void> {
    if (!items || items.length === 0) return;
    try {
      // Chunk into 450 items max per batch (Firestore batch limit is 500)
      const chunkSize = 450;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((item) => {
          batch.set(doc(db, collectionName, item.id), stripUndefined(item), { merge: true });
        });
        await batch.commit();
      }
      this.setStatus('connected');
    } catch (e) {
      console.warn(`[FirestoreSync] Failed batch save to ${collectionName}:`, e);
      this.setStatus('offline');
    }
  }

  /**
   * Atomically clean overwrite a scoped slice (e.g. classId or periodId+classId) in Firestore
   */
  public async replaceScopedBatch(
    collectionName: string,
    filters: Array<{ field: string; value: string }>,
    items: Array<{ id: string; [k: string]: any }>
  ): Promise<void> {
    try {
      const constraints = filters.map((f) => where(f.field, '==', f.value));
      const existingSnap = await getDocs(query(collection(db, collectionName), ...constraints));
      const keepIds = new Set((items || []).map((it) => it.id));

      const ops: Array<{ type: 'delete' | 'set'; id: string; data?: any }> = [];
      existingSnap.docs.forEach((d) => {
        if (!keepIds.has(d.id)) {
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
      this.setStatus('connected');
    } catch (e) {
      console.warn(`[FirestoreSync] Failed scoped replacement on ${collectionName}:`, e);
      this.setStatus('offline');
    }
  }

  public destroy(): void {
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
    this.isInitialized = false;
  }
}

export const firestoreSync = FirestoreSyncService.getInstance();

// Connect write-through handler so DataStorageService mutations sync to Cloud Firestore
registerCloudHandler({
  saveDocument: (col, id, data) => firestoreSync.saveDocument(col, id, data),
  deleteDocument: (col, id) => firestoreSync.deleteDocument(col, id),
  saveBatch: (col, items) => firestoreSync.saveBatch(col, items),
  replaceScopedBatch: (col, filters, items) => firestoreSync.replaceScopedBatch(col, filters, items),
});

// Auto-initialize real-time cloud sync
if (typeof window !== 'undefined') {
  firestoreSync.initSync().catch((err) => {
    console.warn('[FirestoreSync] Initial sync deferred or offline:', err);
  });
}
