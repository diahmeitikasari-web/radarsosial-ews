import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  getDocs,
  getDocsFromServer,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  Unsubscribe,
  Firestore,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if provided
export const db: Firestore =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  code?: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo: Array<{ providerId?: string | null; email?: string | null }>;
  };
}

export interface ClassifiedFirestoreError {
  kind: 'offline' | 'permission' | 'quota' | 'unknown';
  userMessage: string;
  rawMessage: string;
  code: string;
}

export function classifyFirestoreError(error: unknown): ClassifiedFirestoreError {
  const errObj = error as any;
  const code = String(errObj?.code || '').toLowerCase();
  const rawMessage = error instanceof Error ? error.message : String(error || 'Unknown Firestore error');
  const msgLower = rawMessage.toLowerCase();

  if (
    code === 'resource-exhausted' ||
    msgLower.includes('quota exceeded') ||
    msgLower.includes('resource_exhausted')
  ) {
    return {
      kind: 'quota',
      code,
      rawMessage,
      userMessage:
        'Kuota harian baca/tulis Cloud Firestore telah tercapai. Data tetap tersimpan aman di peramban lokal dan kuota akan reset keesokan harinya.',
    };
  }

  if (code === 'permission-denied' || msgLower.includes('missing or insufficient permissions')) {
    return {
      kind: 'permission',
      code,
      rawMessage,
      userMessage:
        'Akses tulis ke Cloud Firestore ditolak oleh aturan keamanan (permission-denied). Periksa deployment firestore.rules.',
    };
  }

  if (
    code === 'unavailable' ||
    code === 'failed-precondition' ||
    msgLower.includes('offline') ||
    msgLower.includes('client is offline') ||
    msgLower.includes('network')
  ) {
    return {
      kind: 'offline',
      code,
      rawMessage,
      userMessage:
        'Koneksi ke server Cloud Firestore terputus atau perangkat sedang offline. Data tersimpan di cache lokal.',
    };
  }

  return {
    kind: 'unknown',
    code,
    rawMessage,
    userMessage: `Gagal menyinkronkan ke Cloud Firestore: ${rawMessage}`,
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const classified = classifyFirestoreError(error);
  const errInfo: FirestoreErrorInfo = {
    error: classified.rawMessage,
    code: classified.code || undefined,
    operationType,
    path,
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
  };
  console.error('[Firestore Error]', JSON.stringify(errInfo));
  const enriched = new Error(classified.userMessage);
  (enriched as any).firestoreInfo = errInfo;
  (enriched as any).kind = classified.kind;
  throw enriched;
}

// Connection test state
let isCloudConnected = false;
const connectionListeners: Array<(connected: boolean) => void> = [];

export function onCloudConnectionChange(callback: (connected: boolean) => void): () => void {
  connectionListeners.push(callback);
  callback(isCloudConnected);
  return () => {
    const idx = connectionListeners.indexOf(callback);
    if (idx !== -1) connectionListeners.splice(idx, 1);
  };
}

function notifyConnection(status: boolean) {
  isCloudConnected = status;
  connectionListeners.forEach((fn) => {
    try {
      fn(status);
    } catch (e) {
      console.warn('Error notifying connection listener:', e);
    }
  });
}

// Validate connection to Firestore as required by firebase-integration skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    notifyConnection(true);
    return true;
  } catch (error: unknown) {
    const classified = classifyFirestoreError(error);
    if (classified.kind === 'offline') {
      console.warn('[Firebase] Client appears offline, using local offline cache.');
      notifyConnection(false);
      return false;
    }
    if (classified.kind === 'permission' || classified.kind === 'quota') {
      console.warn(`[Firebase] ${classified.userMessage}`);
      notifyConnection(false);
      return false;
    }
    // Document not found (empty test/connection doc) still confirms live server roundtrip
    notifyConnection(true);
    return true;
  }
}

// Run connection test on browser boot
if (typeof window !== 'undefined') {
  testConnection().catch(() => notifyConnection(false));
}

export {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  type Unsubscribe,
  type QuerySnapshot,
  type DocumentData,
};
