import { initializeFirestoreAdmin, getFirestoreDb } from './firestore';

// Initialize Firestore on first import
initializeFirestoreAdmin();

// Export Firestore instance for compatibility
export default getFirestoreDb;

