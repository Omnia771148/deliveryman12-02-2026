import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDIitDbOHvjqffq6XFtT5GJzX3_Dp7STIs",
  authDomain: "deliveryboy-5d87b.firebaseapp.com",
  projectId: "deliveryboy-5d87b",
  storageBucket: "deliveryboy-5d87b.firebasestorage.app",
  messagingSenderId: "434284812926",
  appId: "1:434284812926:web:a93ad7116363925c89162f",
  measurementId: "G-MRVSSF1YYL"
};

// Initialize Firebase (Next.js friendly check to prevent duplicate app errors)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize and Export services
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;