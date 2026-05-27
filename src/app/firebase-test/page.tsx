"use client";
import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';

export default function FirebaseTestPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });

    return () => unsub();
  }, []);

  const handleAnonSignIn = async () => {
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      setError(e.message || 'Sign-in failed');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Firebase Auth Test</h2>
      <p>Environment configured: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET'}</p>
      <div>
        <button onClick={handleAnonSignIn} style={{ marginRight: 8 }}>Sign in Anonymously</button>
        <button onClick={handleSignOut}>Sign out</button>
      </div>
      {uid ? (
        <div>
          <p>Signed in UID: {uid}</p>
        </div>
      ) : (
        <p>Not signed in</p>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
