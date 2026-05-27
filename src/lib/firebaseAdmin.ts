import admin from 'firebase-admin';

// Initialize Firebase Admin SDK using a service account JSON provided
// via the FIREBASE_SERVICE_ACCOUNT environment variable. This value
// should be the full JSON string of the service account (keep secret).
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  if (serviceAccount) {
    try {
      const parsed = JSON.parse(serviceAccount);
      admin.initializeApp({
        credential: admin.credential.cert(parsed as admin.ServiceAccount),
      });
    } catch (err) {
      // If parsing fails, don't crash at import time; defer to runtime usage
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', err);
    }
  }
}

export default admin;
