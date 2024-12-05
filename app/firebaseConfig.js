// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDTp5e7hL5excSKzE6JL5M0dITVhQhzoYM", // current_key
  authDomain: "metro-map-5f2e7.firebaseapp.com",
  databaseURL: "https://metro-map-5f2e7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "metro-map-5f2e7",
  storageBucket: "metro-map-5f2e7.firebasestorage.app",
  messagingSenderId: "1011351945014",
  appId: "1:1011351945014:android:2b126c3169c9f131e97d97"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;
