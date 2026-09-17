import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if provided
export const db: Firestore =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

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

// Validate connection to Firestore as required by firebase-skill
export async function testConnection(): Promise<boolean> {
  try {
    // Attempt a read from server to verify live connectivity
    await getDocFromServer(doc(db, 'settings', 'connection_test'));
    notifyConnection(true);
    return true;
  } catch (error: any) {
    if (error && typeof error === 'object') {
      const msg = error.message || '';
      const code = error.code || '';
      if (code === 'unavailable' || code === 'failed-precondition' || msg.includes('offline') || msg.includes('client is offline')) {
        console.warn('[Firebase] Client appears offline, using local offline cache.');
        notifyConnection(false);
        return false;
      }
      if (code === 'permission-denied' || msg.includes('Missing or insufficient permissions')) {
        console.warn('[Firebase] Permissions pending or denied. Operating in local storage mode.');
        notifyConnection(false);
        return false;
      }
    }
    // Document not found or other non-fatal errors still indicate server connection
    notifyConnection(true);
    return true;
  }
}

// Run connection test on module load
testConnection().catch(() => notifyConnection(false));

export {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
};
