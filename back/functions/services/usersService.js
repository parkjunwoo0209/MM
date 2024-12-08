// MM/functions/services/usersService.js

const routesService = require("../services/routesService");
const { db } = require("../firebaseConfig");

// 경로 계산 및 사용자에게 선택지 제공
exports.searchRoutes = async (req, res) => {
  try {
    const { userId, startStation, endStation } = req.body;
    if (!userId || !startStation || !endStation) {
      return res.status(400).send("User ID, start station, and end station are required");
    }
    const result = await routesService.searchRoutes({ userId, startStation, endStation });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error searching routes:", error.message);
    res.status(500).send(`Error searching routes: ${error.message}`);
  }
};

// 즐겨찾기 추가
exports.addFavorite = async (email, favoriteText) => {
  try {
    const favoriteRef = db.collection("Favorite");
    const snapshot = await favoriteRef
      .where("email", "==", email)
      .where("favoriteText", "==", favoriteText)
      .get();

    if (!snapshot.empty) {
      throw new Error("이미 즐겨찾기에 추가된 역입니다.");
    }

    await favoriteRef.add({
      email,
      favoriteText
    });

    return { success: true, message: "즐겨찾기에 추가되었습니다." };
  } catch (error) {
    console.error("Add favorite error:", error);
    throw error;
  }
};

// 즐겨찾기 제거
exports.removeFavorite = async (email, favoriteText) => {
  try {
    const favoriteRef = db.collection("Favorite");
    const snapshot = await favoriteRef
      .where("email", "==", email)
      .where("favoriteText", "==", favoriteText)
      .get();

    if (snapshot.empty) {
      throw new Error("즐겨찾기에 없는 역입니다.");
    }

    // 해당 문서 삭제
    const docToDelete = snapshot.docs[0];
    await docToDelete.ref.delete();

    return { success: true, message: "즐겨찾기가 제거되었습니다." };
  } catch (error) {
    console.error("Remove favorite error:", error);
    throw error;
  }
};

// 즐겨찾기 목록 조회
exports.getFavorites = async (email) => {
  try {
    const favoriteRef = db.collection("Favorite");
    const snapshot = await favoriteRef
      .where("email", "==", email)
      .get();
    
    // favoriteText 필드를 포함한 전체 문서 데이터 반환
    const favorites = snapshot.docs.map(doc => doc.data());
    return favorites;
  } catch (error) {
    console.error("Get favorites error:", error);
    throw error;
  }
};

// 최근 검색 기록 조회
exports.getSearchHistory = async (email) => {
  try {
    const historyRef = db.collection("UsageHistory");
    const snapshot = await historyRef
      .where("email", "==", email)
      .orderBy("timestamp", "desc")
      .limit(10)  // 최근 10개만 가져오기
      .get();
    
    const history = snapshot.docs.map(doc => ({
      startStation: doc.data().startStation,
      endStation: doc.data().endStation,
      timestamp: doc.data().timestamp
    }));
    return history;
  } catch (error) {
    console.error("Get history error:", error);
    throw error;
  }
};
