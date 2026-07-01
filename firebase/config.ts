import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

let getReactNativePersistence: any;
try {
  getReactNativePersistence = require('firebase/auth').getReactNativePersistence;
} catch {}

const firebaseConfig = {
  apiKey: "AIzaSyCoDykkEBUSxbNFelzqjl1mEt_lE0CuO2A",
  authDomain: "soccer-daily-8c24e.firebaseapp.com",
  projectId: "soccer-daily-8c24e",
  storageBucket: "soccer-daily-8c24e.firebasestorage.app",
  messagingSenderId: "279471919880",
  appId: "1:279471919880:web:254ef42b0e4e0477b092bd"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence
      ? getReactNativePersistence(AsyncStorage)
      : undefined,
  });
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;
