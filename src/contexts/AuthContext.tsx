import { createContext, useContext, useState, ReactNode } from 'react';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/adminConfig';
import {
  generatePassword,
  generateStudentLoginId,
  generateParentLoginId
} from '../utils/userCredentials';

export type AppRole = 'admin' | 'student' | 'parent';

export interface UserData {
  id: string;
  role: AppRole;
  name: string;
  email?: string;
  loginId?: string;
  password?: string;
  phone?: string;
  seatNumber?: string;
  studentId?: string;
  parentName?: string;
  parentId?: string;
  nic?: string;
  address?: string;
  parentOf?: string[];
  createdAt: string;
  createdByAdmin?: boolean;
}

export interface CreateParentInput {
  name: string;
  nic: string;
  address: string;
  phone: string;
}

export interface CreateStudentInput {
  name: string;
  seatNumber: string;
  parentName: string;
  parentId?: string;
  phone: string;
}

export interface CreatedUserCredentials {
  id: string;
  loginId: string;
  password: string;
  role: AppRole;
  name: string;
}

interface AuthContextType {
  userData: UserData | null;
  managedUsers: UserData[];
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<UserData>;
  portalLogin: (loginId: string, password: string) => Promise<UserData>;
  logout: () => void;
  createParentUser: (input: CreateParentInput) => CreatedUserCredentials;
  createStudentUser: (input: CreateStudentInput) => CreatedUserCredentials;
  getUserById: (id: string) => UserData | undefined;
  linkChildToParent: (parentId: string, studentId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function createId() {
  return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [managedUsers, setManagedUsers] = useState<UserData[]>([]);

  function getUserById(id: string) {
    return managedUsers.find((user) => user.id === id);
  }

  function isLoginIdTaken(loginId: string) {
    return managedUsers.some((user) => user.loginId === loginId);
  }

  async function adminLogin(email: string, password: string): Promise<UserData> {
    const normalizedEmail = email.trim().toLowerCase();
    if (
      normalizedEmail !== ADMIN_EMAIL.toLowerCase() ||
      password !== ADMIN_PASSWORD
    ) {
      throw new Error('Invalid admin email or password');
    }

    const admin: UserData = {
      id: 'admin',
      role: 'admin',
      name: 'Administrator',
      email: ADMIN_EMAIL,
      createdAt: new Date().toISOString()
    };

    setUserData(admin);
    return admin;
  }

  async function portalLogin(loginId: string, password: string): Promise<UserData> {
    const user = managedUsers.find(
      (entry) =>
        entry.loginId === loginId.trim() &&
        entry.password === password &&
        (entry.role === 'student' || entry.role === 'parent')
    );

    if (!user) {
      throw new Error('Invalid login ID or password');
    }

    const sessionUser: UserData = { ...user, password: undefined };
    setUserData(sessionUser);
    return sessionUser;
  }

  function logout() {
    setUserData(null);
  }

  function createParentUser(input: CreateParentInput): CreatedUserCredentials {
    if (userData?.role !== 'admin') {
      throw new Error('Only admins can create users');
    }

    const loginId = generateParentLoginId(input.nic);
    if (isLoginIdTaken(loginId)) {
      throw new Error('A parent with this NIC already exists');
    }

    const password = generatePassword();
    const id = createId();

    const parent: UserData = {
      id,
      role: 'parent',
      loginId,
      password,
      name: input.name.trim(),
      phone: input.phone.trim(),
      nic: input.nic.trim(),
      address: input.address.trim(),
      parentOf: [],
      createdAt: new Date().toISOString(),
      createdByAdmin: true
    };

    setManagedUsers((prev) => [...prev, parent]);

    return {
      id,
      loginId,
      password,
      role: 'parent',
      name: parent.name
    };
  }

  function createStudentUser(input: CreateStudentInput): CreatedUserCredentials {
    if (userData?.role !== 'admin') {
      throw new Error('Only admins can create users');
    }

    const loginId = generateStudentLoginId(input.seatNumber);
    if (isLoginIdTaken(loginId)) {
      throw new Error('A student with this seat number already exists');
    }

    const password = generatePassword();
    const id = createId();

    const student: UserData = {
      id,
      role: 'student',
      loginId,
      password,
      name: input.name.trim(),
      phone: input.phone.trim(),
      seatNumber: input.seatNumber.trim(),
      studentId: input.seatNumber.trim(),
      parentName: input.parentName.trim(),
      parentId: input.parentId,
      createdAt: new Date().toISOString(),
      createdByAdmin: true
    };

    setManagedUsers((prev) => {
      const next = [...prev, student];
      if (input.parentId) {
        return next.map((user) =>
          user.id === input.parentId
            ? { ...user, parentOf: [...(user.parentOf ?? []), id] }
            : user
        );
      }
      return next;
    });

    return {
      id,
      loginId,
      password,
      role: 'student',
      name: student.name
    };
  }

  function linkChildToParent(parentId: string, studentId: string) {
    setManagedUsers((prev) =>
      prev.map((user) => {
        if (user.id === parentId) {
          const parentOf = user.parentOf ?? [];
          if (parentOf.includes(studentId)) return user;
          return { ...user, parentOf: [...parentOf, studentId] };
        }
        if (user.id === studentId) {
          const parent = prev.find((p) => p.id === parentId);
          return {
            ...user,
            parentId,
            parentName: parent?.name ?? user.parentName
          };
        }
        return user;
      })
    );

    if (userData?.id === parentId) {
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              parentOf: [...(prev.parentOf ?? []), studentId]
            }
          : prev
      );
    }
  }

  const value = {
    userData,
    managedUsers,
    loading: false,
    adminLogin,
    portalLogin,
    logout,
    createParentUser,
    createStudentUser,
    getUserById,
    linkChildToParent
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
