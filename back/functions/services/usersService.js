// MM/functions/services/usersService.js

const routesService = require("../services/routesService");
const { db } = require("../firebaseConfig");

// 경로 계산 및 사용자에게 선택지 제공
exports.searchRoutes = async (userId, startStation, endStation) => {
  try {
    if (!userId || !startStation || !endStation) {
      throw new Error("User ID, start station, and end station are required");
    }
    
    const result = await routesService.searchRoutes({ 
      userId, 
      startStation, 
      endStation 
    });
    
    return result;
  } catch (error) {
    console.error("Error searching routes:", error.message);
    throw error;
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
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      favoriteText: doc.data().favoriteText
    }));
  } catch (error) {
    console.error("Get favorites error:", error);
    throw error;
  }
};

// 경로 즐겨찾기 추가
exports.addRouteFavorite = async (email, routeData) => {
  try {
    const userRef = db.collection("Users").doc(email);
    const routeFavRef = userRef.collection("RouteFavorites");

    // 필요한 기본 정보만 저장
    const routeDoc = {
      departure: routeData.departure,    // 출발역
      arrival: routeData.arrival,        // 도착역
      type: routeData.type,             // 경로 타입 (최소 시간, 최소 비용, 최소 거리)
      time: routeData.time,             // 소요 시간
      cost: routeData.cost,             // 비용           
    };

    await routeFavRef.add(routeDoc);

    return { success: true, message: "경로가 즐겨찾기에 추가되었습니다." };
  } catch (error) {
    throw new Error(`경로 즐겨찾기 추가 실패: ${error.message}`);
  }
};

// 경로 즐겨찾기 제거
exports.removeRouteFavorite = async (email, routeId) => {
  try {
    const userRef = db.collection("Users").doc(email);
    const routeFavRef = userRef.collection("RouteFavorites").doc(routeId);

    await routeFavRef.delete();
    return { success: true, message: "경로가 즐겨찾기에서 제거되었습니다." };
  } catch (error) {
    throw new Error(`경로 즐겨찾기 제거 실패: ${error.message}`);
  }
};
