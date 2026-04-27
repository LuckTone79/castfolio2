import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { OWNER_EMAILS } from './config';
import { UserProfile, AppRole } from './types';

// admin / owner 하위호환: Firestore에 'admin'으로 저장된 데이터도 'owner'로 인식
function normalizeRole(rawRole: string | undefined): AppRole {
  if (rawRole === 'admin' || rawRole === 'owner') return 'owner';
  return 'agent';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: AppRole | null;
  userProfile: UserProfile | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        let resolvedRole: AppRole = 'agent';

        if (userDoc.exists()) {
          resolvedRole = normalizeRole(userDoc.data().role);

          // 자동 승격: OWNER_EMAILS에 있는데 Firestore에 agent로 잘못 저장된 경우 → owner로 업그레이드
          const emailLower = (currentUser.email || '').toLowerCase();
          const isOwnerEmail = OWNER_EMAILS.some(e => e.toLowerCase() === emailLower);
          if (isOwnerEmail && resolvedRole !== 'owner') {
            resolvedRole = 'owner';
            try {
              await setDoc(userRef, { role: 'owner', updatedAt: new Date().toISOString() }, { merge: true });
              console.log('Owner role auto-upgraded for:', currentUser.email);
            } catch (upgradeErr) {
              console.error('Failed to auto-upgrade owner role:', upgradeErr);
            }
          }

          setRole(resolvedRole);
        } else {
          // 신규 가입: OWNER_EMAILS에 포함되면 owner, 아니면 agent
          // Firebase Auth는 이메일을 소문자로 반환하지만, 만일을 위해 양쪽 모두 소문자로 비교
          const emailLower = (currentUser.email || '').toLowerCase();
          resolvedRole = OWNER_EMAILS.some(e => e.toLowerCase() === emailLower) ? 'owner' : 'agent';
          try {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName,
              role: resolvedRole,
              status: 'active',
              createdAt: new Date().toISOString(),
            });
            setRole(resolvedRole);
          } catch (err) {
            console.error('Error creating user document:', err);
            setRole(resolvedRole);
          }
        }

        unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              ...data,
              role: normalizeRole(data.role),
            } as UserProfile);
          }
        });
      } else {
        setRole(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, userProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
