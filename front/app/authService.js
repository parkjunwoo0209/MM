// authService.js
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "./firebaseConfig";

const auth = getAuth(app);

// 로그인 함수
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken(); // ID 토큰 생성
    return idToken; // ID 토큰 반환
  } catch (error) {
    console.error("Error signing in:", error.message);
    throw error;
  }
};