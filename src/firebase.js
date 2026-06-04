import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCU6jt277pq-R131__PExqO3fFUnkQJqGQ",
  authDomain: "vendingpro-98f0d.firebaseapp.com",
  projectId: "vendingpro-98f0d",
  storageBucket: "vendingpro-98f0d.firebasestorage.app",
  messagingSenderId: "591341817505",
  appId: "1:591341817505:web:61c5116cd4bd4ba4f3eae0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
