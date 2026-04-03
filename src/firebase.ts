import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Função para criar uma instância secundária do Firebase para tarefas administrativas (como criar usuários sem deslogar o admin)
export const createSecondaryApp = () => {
  const name = `secondary-${Date.now()}`;
  return initializeApp(firebaseConfig, name);
};
