import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "kalinq-app",
  appId: "1:125040198973:web:6a9168b90ca9a98bd8b154",
  storageBucket: "kalinq-app.firebasestorage.app",
  apiKey: "AIzaSyB9k1SlvuXSGHrxA6QJR614YHArtQ_Ijc4",
  authDomain: "kalinq-app.firebaseapp.com",
  messagingSenderId: "125040198973",
  measurementId: "G-QFKBS49XC5"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
