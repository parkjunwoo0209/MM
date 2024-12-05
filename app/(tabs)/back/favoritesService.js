import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig.js";
import { getAuth } from "firebase/auth";

/**
 * Firestore에서 즐겨찾기 항목 삭제
 * @param {string} id - 삭제할 항목의 ID
 * @returns {Promise<void>}
 */
export const removeFavoriteFromFirestore = async (id) => {
  try {
    await deleteDoc(doc(db, "favorites", id)); // Firestore에서 문서 삭제
    console.log(`즐겨찾기 항목 ${id} 삭제 완료`);
  } catch (error) {
    console.error("즐겨찾기 삭제 중 오류:", error.message);
    throw error; // 에러 발생 시 상위로 전달
  }
};

export const clearFavoritesFromFirestore = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        throw new Error("로그인된 사용자가 없습니다.");
      }
  
      const userId = user.uid;
      const favoritesCollection = collection(db, "favorites");
      const q = query(favoritesCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
  
      const batch = querySnapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref); // Firestore에서 문서 삭제
      });
  
      await Promise.all(batch);
      console.log("모든 즐겨찾기 항목이 삭제되었습니다.");
    } catch (error) {
      console.error("즐겨찾기 전체 삭제 중 오류:", error.message);
      throw error;
    }
  };