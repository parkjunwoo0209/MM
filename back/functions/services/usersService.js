
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
      endStation,
    });

    return result;
  } catch (error) {
    console.error("Error searching routes:", error.message);
    throw error;
  }
};

// 역 즐겨찾기 추가
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
      favoriteText,
    });

    return { success: true, message: "즐겨찾기에 추가되었습니다." };
  } catch (error) {
    console.error("Add favorite error:", error);
    throw error;
  }
};

// 역 즐겨찾기 제거
exports.removeFavorite = async (email, favoriteText) => {
  try {
    const favoriteRef = db.collection("RouteFavorites");
    const snapshot = await favoriteRef
      .where("email", "==", email)
      .where("favoriteText", "==", favoriteText)
      .get();

    if (snapshot.empty) {
      throw new Error("즐겨찾기에 없는 역입니다.");
    }

    const docToDelete = snapshot.docs[0];
    await docToDelete.ref.delete();

    return { success: true, message: "즐겨찾기가 제거되었습니다." };
  } catch (error) {
    console.error("Remove favorite error:", error);
    throw error;
  }
};

// 역 즐겨찾기 목록 조회
exports.getFavorites = async (email) => {
  try {
    const favoriteRef = db.collection("Favorite");
    const snapshot = await favoriteRef.where("email", "==", email).get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      favoriteText: doc.data().favoriteText,
    }));
  } catch (error) {
    console.error("Get favorites error:", error);
    throw error;
  }
};

// 경로 즐겨찾기 추가
exports.addRouteFavorite = async (email, routeData) => {
  try {
    const routeFavRef = db.collection("RouteFavorites");

    // 경로 데이터 저장
    const routeDoc = {
      email: email,
      departure: routeData.departure,
      arrival: routeData.arrival,
      type: routeData.type,
      time: routeData.time,
      cost: routeData.cost
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
    const routeFavRef = db.collection("RouteFavorites")
    const snapshot = await routeFavRef.doc(routeId).get();

    if (!snapshot.exists){
      throw new Error('즐겨찾기에 없는 경로입니다.');
    }

    await snapshot.ref.delete();

    return { success: true, message: "경로가 즐겨찾기에서 제거되었습니다." };
  } catch (error) {
    console.error("경로 즐겨찾기 제거 오류:", error);
    throw new Error(`경로 즐겨찾기 제거 실패: ${error.message}`);
  }
};

//목록
exports.getRouteFavorites = async (email) => {
  try {
    const routeFavRef = db.collection("RouteFavorites");
    const snapshot = await routeFavRef.where("email", "==", email).get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Get route favorites error:", error.message);
    throw error;
  }
};

exports.checkRouteUsage = async (email, departure, arrival) => {
  try {
    const routeUsageRef = db.collection("RouteUsage");
    const routeDocId = `${email}_${departure}_${arrival}`; // 고유 키 생성
    const routeDocRef = routeUsageRef.doc(routeDocId);

    const routeDoc = await routeDocRef.get();

    let usageCount = 0;

    if (routeDoc.exists) {
      usageCount = routeDoc.data().count + 1; // 기존 사용 횟수 증가
      await routeDocRef.update({ count: usageCount });
    } else {
      usageCount = 1; // 처음 사용하는 경로
      await routeDocRef.set({ email, departure, arrival, count: usageCount });
    }

    if (usageCount >= 5) {
      // 자동 즐겨찾기 등록
      const routeFavoritesRef = db.collection("RouteFavorites");
      const favoritesSnapshot = await routeFavoritesRef
        .where("email", "==", email)
        .where("departure", "==", departure)
        .where("arrival", "==", arrival)
        .get();

      if (favoritesSnapshot.empty) {
        await routeFavoritesRef.add({
          email,
          departure,
          arrival,
          createdAt: new Date(),
        });
        return { success: true, message: "자동 즐겨찾기에 등록되었습니다." };
      }
    }

    return { success: true, count: usageCount };
  } catch (error) {
    console.error("서비스 로직에서 오류:", error.message);
    throw new Error("Failed to check route usage.");
  }
};
