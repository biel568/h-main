import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js';
import {
  getAnalytics,
  isSupported as analyticsIsSupported,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js';

// Configuração enviada do projeto lcjuros
const firebaseConfig = {
  apiKey: 'AIzaSyBA-_OgmbpD4OoRTrDIn6JgXpe2KPYWwuU',
  authDomain: 'lcjuros.firebaseapp.com',
  projectId: 'lcjuros',
  storageBucket: 'lcjuros.firebasestorage.app',
  messagingSenderId: '6790828854',
  appId: '1:6790828854:web:2c83fe17cb2eee17fad997',
  measurementId: 'G-63N8BJF6BV',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics = null;
if (await analyticsIsSupported()) {
  analytics = getAnalytics(app);
}

export {
  app,
  auth,
  db,
  storage,
  analytics,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  serverTimestamp,
  limit,
  ref,
  uploadBytes,
  getDownloadURL,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
};
