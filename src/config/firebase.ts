import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDvK4NmGA9dliohPnWKTXaDUZOqbbkocCQ",
  authDomain: "smart-campus-safety-system.firebaseapp.com",
  projectId: "smart-campus-safety-system",
  storageBucket: "smart-campus-safety-system.appspot.com",
  messagingSenderId: "471097942189",
  appId: "1:471097942189:web:18e1a3a507d043cb83a624",
  measurementId: "G-9SFNBEH7EZ"
};

// Initialize app
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// ⚠️ FIX: messaging crash prevent (important for web)
export const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export default app;