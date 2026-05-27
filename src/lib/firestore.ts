import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
import { getFirestore, Firestore, DocumentData, Query } from 'firebase-admin/firestore';

let app: App | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase Admin SDK for Firestore
 */
export function initializeFirestoreAdmin(): Firestore {
  if (db) return db;

  // Check if Firebase apps are already initialized
  if (getApps().length === 0) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT environment variable is required for server-side Firestore operations'
      );
    }

    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
    } catch (err) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT must be valid JSON. Check environment variable formatting.'
      );
    }

    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app!);
  
  // Enable offline persistence in development
  if (process.env.NODE_ENV === 'development') {
    db.settings({ ignoreUndefinedProperties: true });
  }

  return db;
}

/**
 * Get Firestore instance
 */
export function getFirestoreDb(): Firestore {
  if (!db) {
    return initializeFirestoreAdmin();
  }
  return db;
}

/**
 * Create a new document with auto-generated ID
 */
export async function createDocument<T extends DocumentData>(
  collection: string,
  data: T
): Promise<string> {
  const db = getFirestoreDb();
  const docRef = await db.collection(collection).add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

/**
 * Create or set a document with specific ID
 */
export async function setDocument<T extends DocumentData>(
  collection: string,
  docId: string,
  data: T,
  merge = false
): Promise<void> {
  const db = getFirestoreDb();
  await db.collection(collection).doc(docId).set(
    {
      ...data,
      updatedAt: new Date(),
    },
    { merge }
  );
}

/**
 * Get a single document
 */
export async function getDocument<T extends DocumentData>(
  collection: string,
  docId: string
): Promise<T | null> {
  const db = getFirestoreDb();
  const doc = await db.collection(collection).doc(docId).get();
  return (doc.exists ? doc.data() : null) as T | null;
}

/**
 * Get documents by query
 */
export async function getDocuments<T extends DocumentData>(
  collection: string,
  whereCondition?: [string, string, any]
): Promise<T[]> {
  const db = getFirestoreDb();
  let query: Query = db.collection(collection);

  if (whereCondition) {
    const [field, operator, value] = whereCondition;
    query = query.where(field, operator as any, value);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as unknown as T));
}

/**
 * Update a document
 */
export async function updateDocument<T extends Partial<DocumentData>>(
  collection: string,
  docId: string,
  data: T
): Promise<void> {
  const db = getFirestoreDb();
  await db.collection(collection).doc(docId).update({
    ...data,
    updatedAt: new Date(),
  });
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collection: string,
  docId: string
): Promise<void> {
  const db = getFirestoreDb();
  await db.collection(collection).doc(docId).delete();
}

/**
 * Delete documents by query condition
 */
export async function deleteDocumentsByCondition(
  collection: string,
  whereCondition: [string, string, any]
): Promise<number> {
  const db = getFirestoreDb();
  const [field, operator, value] = whereCondition;
  
  const docs = await db
    .collection(collection)
    .where(field, operator as any, value)
    .get();

  let deletedCount = 0;
  for (const doc of docs.docs) {
    await doc.ref.delete();
    deletedCount++;
  }
  
  return deletedCount;
}

/**
 * Batch write operations
 */
export async function batchWrite(
  operations: Array<{
    type: 'set' | 'update' | 'delete';
    collection: string;
    docId: string;
    data?: DocumentData;
  }>
): Promise<void> {
  const db = getFirestoreDb();
  const batch = db.batch();

  for (const op of operations) {
    const docRef = db.collection(op.collection).doc(op.docId);
    
    if (op.type === 'set') {
      batch.set(docRef, {
        ...op.data,
        updatedAt: new Date(),
      });
    } else if (op.type === 'update') {
      batch.update(docRef, {
        ...op.data,
        updatedAt: new Date(),
      });
    } else if (op.type === 'delete') {
      batch.delete(docRef);
    }
  }

  await batch.commit();
}

/**
 * Set up automatic deletion of old documents (for 2-day retention)
 * Run this periodically (e.g., via Cloud Functions)
 */
export async function cleanupOldStudentAnswers(maxAgeHours = 48): Promise<number> {
  const db = getFirestoreDb();
  const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  
  const docs = await db
    .collection('studentAnswers')
    .where('createdAt', '<', cutoffTime)
    .get();

  let deletedCount = 0;
  for (const doc of docs.docs) {
    await doc.ref.delete();
    deletedCount++;
  }

  return deletedCount;
}
