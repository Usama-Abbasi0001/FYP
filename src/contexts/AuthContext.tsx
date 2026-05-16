import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserData {
  uid: string;
  email: string;
  role: 'admin' | 'student' | 'parent' | 'security';
  name: string;
  phone?: string;
  studentId?: string;
  parentOf?: string[];
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signup: (email: string, password: string, role: string, additionalData: any) => Promise<UserData | null>;
  login: (email: string, password: string) => Promise<UserData | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 GET USER FROM FIRESTORE
  const fetchUserData = async (uid: string) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UserData;
      setUserData(data);
      return data;
    }

    return null;
  };

  // SIGNUP
  async function signup(email: string, password: string, role: string, additionalData: any) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await sendEmailVerification(userCredential.user);

    const userDoc: UserData = {
      uid: userCredential.user.uid,
      email,
      role: role as UserData['role'],
      name: additionalData.name || '',
      phone: additionalData.phone || '',
      studentId: role === 'student' ? additionalData.studentId : '',
      parentOf: role === 'parent' ? additionalData.children || [] : [],
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);

    setUserData(userDoc);
    return userDoc;
  }

  // LOGIN (🔥 IMPORTANT FIX)
  async function login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const data = await fetchUserData(userCredential.user.uid);

    return data; // 👈 NOW ROLE WILL WORK
  }

  async function logout() {
    await signOut(auth);
    setCurrentUser(null);
    setUserData(null);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  // AUTH STATE LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}