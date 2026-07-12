import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyCoDykkEBUSxbNFelzqjl1mEt_lE0CuO2A',
  authDomain: 'soccer-daily-8c24e.firebaseapp.com',
  projectId: 'soccer-daily-8c24e',
  storageBucket: 'soccer-daily-8c24e.firebasestorage.app',
  messagingSenderId: '279471919880',
  appId: '1:279471919880:web:254ef42b0e4e0477b092bd',
};

export const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

let resolvedAuth: Auth;

if (Platform.OS === 'web') {
  resolvedAuth = getAuth(app);
} else {
  try {
    resolvedAuth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // This happens during Expo hot reload when Auth is already initialized.
    resolvedAuth = getAuth(app);
  }
}

export const auth = resolvedAuth;

/**
 * Login and routing should wait for this promise so Firebase has time
 * to restore the saved user after a browser refresh or app restart.
 */
export const authPersistenceReady: Promise<void> =
  (
    Platform.OS === 'web'
      ? setPersistence(auth, browserLocalPersistence)
      : auth.authStateReady()
  ).catch((error) => {
    console.log('Firebase Auth persistence setup failed:', error);
  });
