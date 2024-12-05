// authService.js
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "./firebaseConfig";

const auth = getAuth(app);

// 로그인 함수
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in:", userCredential.user);
    return userCredential.user; // 성공 시 사용자 정보 반환
  } catch (error) {
    console.error("Error signing in:", error.message);
    throw error; // 에러를 호출한 쪽으로 전달
  }
};
