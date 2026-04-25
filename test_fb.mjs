import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBppSyB55M6_VFL0VwAhjhwUokWMrdEwaU",
  authDomain: "geonixa-exam.firebaseapp.com",
  projectId: "geonixa-exam",
  storageBucket: "geonixa-exam.firebasestorage.app",
  messagingSenderId: "1060886074629",
  appId: "G-SXW1SLPGG2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const d = await getDoc(doc(db, "valid_logins", "test@test.com"));
    console.log("SUCCESS: Read from Firestore", d.exists());
    process.exit(0);
  } catch (e: any) {
    console.log("ERROR: ", e.message);
    process.exit(1);
  }
}
test();
