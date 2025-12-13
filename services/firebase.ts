import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { AppState } from '../types';

const RUNTIME_CONFIG_KEY = 'dpss_firebase_config';

// 1. Try to get config from LocalStorage (User entered in UI)
const getRuntimeConfig = () => {
  try {
    const stored = localStorage.getItem(RUNTIME_CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

// 2. Default Config (Placeholder)
const defaultConfig = {
  apiKey: "YOUR_API_KEY_HERE", 
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const config = getRuntimeConfig() || defaultConfig;
const isConfigured = config.apiKey !== "YOUR_API_KEY_HERE";

let db: any = null;

if (isConfigured) {
  try {
    const app = initializeApp(config);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export const subscribeToSchoolData = (schoolId: string, onData: (data: Partial<AppState>) => void) => {
  if (!db || !schoolId) return () => {};

  console.log(`Subscribing to school: ${schoolId}`);
  const docRef = doc(db, 'schools', schoolId);
  
  const unsubscribe = onSnapshot(docRef, (docSnap: any) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onData({
        students: data.students || [],
        attendance: data.attendance || [],
        classLevels: data.classLevels || []
      });
    }
  }, (error: any) => {
    console.error("Sync error:", error);
  });

  return unsubscribe;
};

export const saveSchoolData = async (schoolId: string, data: Partial<AppState>) => {
  if (!db || !schoolId) return;

  try {
    const docRef = doc(db, 'schools', schoolId);
    await setDoc(docRef, {
      students: data.students,
      attendance: data.attendance,
      classLevels: data.classLevels,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.error("Error saving to cloud:", e);
  }
};

export const isCloudEnabled = () => isConfigured && !!db;

// Helper to save config from UI
export const updateFirebaseConfig = (newConfig: any) => {
  if (!newConfig) {
    localStorage.removeItem(RUNTIME_CONFIG_KEY);
  } else {
    localStorage.setItem(RUNTIME_CONFIG_KEY, JSON.stringify(newConfig));
  }
  window.location.reload(); // Reload to initialize with new config
};
