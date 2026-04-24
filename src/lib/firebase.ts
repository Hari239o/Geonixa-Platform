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
