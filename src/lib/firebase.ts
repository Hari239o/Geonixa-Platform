import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "dummy",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "dummy",
};

export const isFirebaseConfigured = firebaseConfig.projectId !== "dummy";

// Start safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);

export const storeExamAnswers = async (email: string, examData: any) => {
  if (firebaseConfig.projectId === "dummy") {
    console.warn("No Firebase Config! Mock processing the save instead.");
    if (typeof window !== "undefined") {
      const key = "geonixa_submissions";
      const prev = JSON.parse(localStorage.getItem(key) || "{}");
      prev[email] = { ...examData, timestamp: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(prev));
    }
    return;
  }
  try {
    const examDoc = doc(collection(db, "exam_submissions"), email);
    await setDoc(examDoc, {
      ...examData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Firebase store failed:", error);
  }
};

export const uploadVideoRecording = async (email: string, blob: Blob) => {
  if (firebaseConfig.projectId === "dummy") {
    console.warn("No Firebase Config! Mock processing the video upload instead.");
    return;
  }
  try {
    const storageRef = ref(storage, `recordings/${email}_${Date.now()}.webm`);
    await uploadBytes(storageRef, blob);
  } catch (error) {
    console.error("Firebase video upload failed:", error);
  }
};

import { getDoc, getDocs, deleteDoc } from "firebase/firestore";

export const registerCandidateFirebase = async (email: string, passKey: string, profile: any) => {
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    const validLogins = JSON.parse(localStorage.getItem("geonixa_valid_logins") || "{}");
    const profileData = JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}");
    validLogins[email] = passKey;
    profileData[email] = profile;
    localStorage.setItem("geonixa_valid_logins", JSON.stringify(validLogins));
    localStorage.setItem("geonixa_student_profiles", JSON.stringify(profileData));
    return;
  }
  try {
    await setDoc(doc(collection(db, "valid_logins"), email), { passKey });
    await setDoc(doc(collection(db, "student_profiles"), email), profile);
  } catch (error) {
    console.error("Firebase register failed:", error);
  }
};

export const verifyCandidateFirebase = async (email: string, passKey: string) => {
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    const validLogins = JSON.parse(localStorage.getItem("geonixa_valid_logins") || "{}");
    if (!validLogins[email]) return "NOT_FOUND";
    if (validLogins[email] === passKey) return "SUCCESS";
    return "INVALID_PASS";
  }
  try {
    const d = await getDoc(doc(collection(db, "valid_logins"), email));
    if (!d.exists()) return "NOT_FOUND";
    if (d.data().passKey === passKey) return "SUCCESS";
    return "INVALID_PASS";
  } catch (e) {
    console.error(e);
    return "ERROR";
  }
};

export const fetchAllDashboardData = async () => {
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    return {
      submissions: JSON.parse(localStorage.getItem("geonixa_submissions") || "{}"),
      logins: JSON.parse(localStorage.getItem("geonixa_valid_logins") || "{}"),
      profiles: JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}")
    };
  }

  let submissions: Record<string, any> = {};
  let logins: Record<string, string> = {};
  let profiles: Record<string, any> = {};

  try {
    const subSnap = await getDocs(collection(db, "exam_submissions"));
    subSnap.forEach(doc => submissions[doc.id] = doc.data());

    const logSnap = await getDocs(collection(db, "valid_logins"));
    logSnap.forEach(doc => logins[doc.id] = doc.data().passKey);

    const profSnap = await getDocs(collection(db, "student_profiles"));
    profSnap.forEach(doc => profiles[doc.id] = doc.data());
  } catch (e) {
    console.error("Dashboard fetch error:", e);
  }

  return { submissions, logins, profiles };
};

export const deleteCandidateFirebase = async (email: string) => {
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    const newSubs = JSON.parse(localStorage.getItem("geonixa_submissions") || "{}");
    delete newSubs[email];
    localStorage.setItem("geonixa_submissions", JSON.stringify(newSubs));

    const newRegs = JSON.parse(localStorage.getItem("geonixa_valid_logins") || "{}");
    delete newRegs[email];
    localStorage.setItem("geonixa_valid_logins", JSON.stringify(newRegs));

    const oldProfs = JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}");
    delete oldProfs[email];
    localStorage.setItem("geonixa_student_profiles", JSON.stringify(oldProfs));
    return;
  }

  try {
    await deleteDoc(doc(collection(db, "exam_submissions"), email));
    await deleteDoc(doc(collection(db, "valid_logins"), email));
    await deleteDoc(doc(collection(db, "student_profiles"), email));
  } catch (e) {
    console.error("Delete failed:", e);
  }
};
