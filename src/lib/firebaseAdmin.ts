import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // If we have a service account JSON string in env variables, we can use it.
  // Otherwise, we can try to initialize with default credentials, 
  // but usually for Vercel we need the FIREBASE_PROJECT_ID and a service account.
  
  // Actually, for just generating custom tokens, we MUST have a service account JSON or
  // the client email and private key set in environment variables!
  
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Attempt default initialization (might fail locally if GOOGLE_APPLICATION_CREDENTIALS is not set)
    admin.initializeApp();
  }
}

export const adminAuth = admin.auth();
