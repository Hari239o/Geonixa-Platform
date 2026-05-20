import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc, runTransaction, getDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
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
  if (!email || email === "anonymous") return;
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

export const uploadLiveFrame = async (email: string, blob: Blob) => {
  if (firebaseConfig.projectId === "dummy") return;
  try {
    const storageRef = ref(storage, `live_frames/${email}.jpg`);
    await uploadBytes(storageRef, blob);
  } catch (error) {
    console.error("Live frame upload failed:", error);
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



export const registerCandidateFirebase = async (email: string, passKey: string, profile: any) => {
  if (!email) throw new Error("CANDIDATE_EMAIL_REQUIRED");
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
    await setDoc(doc(collection(db, "student_profiles"), email), { ...profile, isRegistered: true });
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

export const getCandidateProfile = async (email: string) => {
  if (!email) return null;
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    const profiles = JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}");
    return profiles[email] || null;
  }
  try {
    const d = await getDoc(doc(collection(db, "student_profiles"), email));
    return d.exists() ? d.data() : null;
  } catch (e) {
    return null;
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
  if (!email) return;
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
    const profileRef = doc(collection(db, "student_profiles"), email);
    const profileDoc = await getDoc(profileRef);
    
    if (profileDoc.exists()) {
      const slotLabel = profileDoc.data().slot;
      const slotMap: Record<string, string> = {
        "10:00 AM - 11:30 AM": "SLOT_1",
        "12:00 PM - 01:30 PM": "SLOT_2",
        "03:00 PM - 04:30 PM": "SLOT_3",
        "06:00 PM - 07:30 PM": "SLOT_4"
      };
      
      const internalSlotId = slotMap[slotLabel] || "SLOT_1";
      const slotDocRef = doc(db, "meta", "slots");
      
      // Use Transaction to safely restore slot capacity
      await runTransaction(db, async (transaction) => {
        const slotDoc = await transaction.get(slotDocRef);
        if (slotDoc.exists()) {
          const currentData = slotDoc.data();
          const currentCount = currentData[internalSlotId] || 0;
          if (currentCount > 0) {
            transaction.set(slotDocRef, { ...currentData, [internalSlotId]: currentCount - 1 }, { merge: true });
          }
        }
        
        // Purge identity records inside the transaction
        transaction.delete(doc(collection(db, "exam_submissions"), email));
        transaction.delete(doc(collection(db, "valid_logins"), email));
        transaction.delete(profileRef);
      });
    } else {
      // Fallback purge if profile doesn't exist
      await deleteDoc(doc(collection(db, "exam_submissions"), email));
      await deleteDoc(doc(collection(db, "valid_logins"), email));
    }
  } catch (e) {
    console.error("Delete & Slot Restore failed:", e);
  }
};
export const SLOT_CONFIG = {
  "SLOT_1": { id: "SLOT_1", label: "10:00 AM - 11:30 AM", start: "10:00", end: "11:30" },
  "SLOT_2": { id: "SLOT_2", label: "12:00 PM - 01:30 PM", start: "12:00", end: "13:30" },
  "SLOT_3": { id: "SLOT_3", label: "03:00 PM - 04:30 PM", start: "15:00", end: "16:30" },
  "SLOT_4": { id: "SLOT_4", label: "06:00 PM - 07:30 PM", start: "18:00", end: "19:30" },
};

export const getSlotAvailability = async () => {
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("geonixa_slots") || JSON.stringify({
      "SLOT_1": 0, "SLOT_2": 0, "SLOT_3": 0, "SLOT_4": 0
    }));
  }
  try {
    const d = await getDoc(doc(db, "meta", "slots"));
    if (!d.exists()) return { "SLOT_1": 0, "SLOT_2": 0, "SLOT_3": 0, "SLOT_4": 0 };
    return d.data();
  } catch (e) {
    return { "SLOT_1": 0, "SLOT_2": 0, "SLOT_3": 0, "SLOT_4": 0 };
  }
};

export const allocateSlotWithTransaction = async (
  slotId: string, 
  email: string, 
  profileData: any, 
  passKey: string
) => {
  if (firebaseConfig.projectId === "dummy" && typeof window !== "undefined") {
    const slots = JSON.parse(localStorage.getItem("geonixa_slots") || JSON.stringify({
      "SLOT_1": 0, "SLOT_2": 0, "SLOT_3": 0, "SLOT_4": 0
    }));
    if (slots[slotId] >= 25) throw new Error("SLOT_FULL");
    slots[slotId]++;
    localStorage.setItem("geonixa_slots", JSON.stringify(slots));
    await registerCandidateFirebase(email, passKey, { ...profileData, slot: slotId });
    return true;
  }

  const slotRef = doc(db, "meta", "slots");
  const validLoginsRef = doc(db, "valid_logins", email);
  const profileRef = doc(db, "student_profiles", email);

  await runTransaction(db, async (transaction) => {
    const slotDoc = await transaction.get(slotRef);
    if (!slotDoc.exists()) {
      throw new Error("Slot meta document does not exist!");
    }

    const currentData = slotDoc.data();
    const currentCount = currentData[slotId] || 0;

    if (currentCount >= 25) {
      throw new Error("SLOT_FULL");
    }

    transaction.set(slotRef, { ...currentData, [slotId]: currentCount + 1 }, { merge: true });

    transaction.set(validLoginsRef, {
      email,
      passKey,
      role: "student",
      isActive: true,
      lastLogin: null
    });

    transaction.set(profileRef, profileData);
  });
};

export const updateSlotTransferTransaction = async (oldSlotLabel: string, newSlotLabel: string) => {
  if (firebaseConfig.projectId === "dummy") return;
  
  const slotMap: Record<string, string> = {
    "10:00 AM - 11:30 AM": "SLOT_1",
    "12:00 PM - 01:30 PM": "SLOT_2",
    "03:00 PM - 04:30 PM": "SLOT_3",
    "06:00 PM - 07:30 PM": "SLOT_4"
  };
  
  const oldId = slotMap[oldSlotLabel];
  const newId = slotMap[newSlotLabel];
  
  if (!oldId || !newId || oldId === newId) return;

  const slotRef = doc(db, "meta", "slots");
  
  await runTransaction(db, async (transaction) => {
    const slotDoc = await transaction.get(slotRef);
    if (slotDoc.exists()) {
      const currentData = slotDoc.data();
      const oldVal = currentData[oldId] || 0;
      const newVal = currentData[newId] || 0;
      
      if (newVal >= 25) {
        throw new Error("NEW_SLOT_FULL");
      }
      
      transaction.set(slotRef, {
        ...currentData,
        [oldId]: Math.max(0, oldVal - 1),
        [newId]: newVal + 1
      }, { merge: true });
    }
  });
};

export const recalibrateSlotCapacities = async () => {
  if (firebaseConfig.projectId === "dummy") return;
  
  console.log("[SYSTEM] Starting Deep Data Recalibration...");
  
  const profilesSnap = await getDocs(collection(db, "student_profiles"));
  const counts: Record<string, number> = { "SLOT_1": 0, "SLOT_2": 0, "SLOT_3": 0, "SLOT_4": 0 };
  
  const slotMap: Record<string, string> = {
    "10:00 AM - 11:30 AM": "SLOT_1",
    "12:00 PM - 01:30 PM": "SLOT_2",
    "03:00 PM - 04:30 PM": "SLOT_3",
    "06:00 PM - 07:30 PM": "SLOT_4"
  };

  profilesSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.slot && slotMap[data.slot]) {
      counts[slotMap[data.slot]]++;
    }
  });

  // Update the master slot document
  await setDoc(doc(db, "meta", "slots"), counts);
  
  console.log("[SYSTEM] Recalibration complete. New counts:", counts);
  return counts;
};
