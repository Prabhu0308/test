import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
