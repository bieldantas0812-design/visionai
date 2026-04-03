import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isMissingInDatabase: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  isAdmin: false,
  isMissingInDatabase: false,
});

const ADMIN_EMAIL = 'bieldantas0812@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMissingInDatabase, setIsMissingInDatabase] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fUser) => {
      setFirebaseUser(fUser);
      if (!fUser) {
        setUser(null);
        setIsMissingInDatabase(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribeUser = onSnapshot(doc(db, 'users', firebaseUser.uid), async (docSnap) => {
      if (docSnap.exists()) {
        setUser({ id: docSnap.id, ...docSnap.data() } as User);
        setIsMissingInDatabase(false);
        setLoading(false);
      } else {
        // Se o usuário é o admin principal, cria o documento automaticamente
        if (firebaseUser.email === ADMIN_EMAIL) {
          try {
            const adminData = {
              name: 'Administrador Principal',
              email: ADMIN_EMAIL,
              role: 'admin',
              status: 'active',
              credits: 999999,
              planId: 'pro',
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), adminData);
            // O onSnapshot vai disparar novamente com o novo documento
          } catch (err) {
            console.error("Erro ao auto-criar admin:", err);
            setIsMissingInDatabase(true);
            setLoading(false);
          }
        } else {
          console.warn("Usuário autenticado mas não encontrado no Firestore.");
          setUser(null);
          setIsMissingInDatabase(true);
          setLoading(false);
        }
      }
    }, (error) => {
      console.error("Erro ao buscar dados do usuário:", error);
      setLoading(false);
    });

    return () => unsubscribeUser();
  }, [firebaseUser]);

  const isAdmin = user?.role === 'admin' || firebaseUser?.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, isAdmin, isMissingInDatabase }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
