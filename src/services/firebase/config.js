import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";

const firebaseConfig = {

  apiKey:
    "AIzaSyC_EYs5s0cRZ0uJxqRoD332tqTVylfV0r8",

  authDomain:
    "jigokubara-6e95e.firebaseapp.com",

  projectId:
    "jigokubara-6e95e",

  storageBucket:
    "jigokubara-6e95e.appspot.com",

  messagingSenderId:
    "1008348631374",

  appId:
    "1:1008348631374:web:9c0bd32d61f87110080e1f",
};

const app =
  initializeApp(
    firebaseConfig
  );

export const auth =
  getAuth(app);

export const db =
  getFirestore(app);

export const storage =
  getStorage(app);

export default app;