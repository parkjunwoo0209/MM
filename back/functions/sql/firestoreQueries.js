// MM/functions/sql/firestoreQueries.js

const admin = require("firebase-admin");
const db = admin.firestore();

// Firestore 쿼리 모음

// 모든 역 가져오기
exports.getAllStations = async () => {
  try {
    const snapshot = await db.collection("Stations").get();
    if (snapshot.empty) {
      throw new Error("No stations found");
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error fetching stations: ${error.message}`);
  }
};

// 특정 역 정보 가져오기
exports.getStationById = async (stationID) => {
  try {
    const stationDoc = await db.collection("Stations").doc(stationID).get();
    if (!stationDoc.exists) {
      throw new Error("Station not found");
    }
    return stationDoc.data();
  } catch (error) {
    throw new Error(`Error fetching station: ${error.message}`);
  }
};

// 모든 연결 정보 가져오기
exports.getAllConnections = async () => {
  try {
    const snapshot = await db.collection("Connections").get();
    if (snapshot.empty) {
      throw new Error("No connections found");
    }
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    throw new Error(`Error fetching connections: ${error.message}`);
  }
};

// 특정 사용자 사용 기록 업데이트
exports.updateUsageHistory = async (userId, startStation, endStation) => {
  try {
    const usageRef = db.collection("UsageHistory").doc(`${userId}_${startStation}_${endStation}`);
    const usageDoc = await usageRef.get();

    if (usageDoc.exists) {
      const usageData = usageDoc.data();
      const newCount = usageData.count + 1;
      await usageRef.update({ count: newCount });
    } else {
      await usageRef.set({ userId, startStation, endStation, count: 1 });
    }
  } catch (error) {
    throw new Error(`Error updating usage history: ${error.message}`);
  }
};

// 즐겨찾기 자동 추가
exports.addToFavorites = async (userId, startStation, endStation) => {
  try {
    const favoritesRef = db.collection("Favorites").doc(userId);
    const favoritesDoc = await favoritesRef.get();

    if (favoritesDoc.exists) {
      const favoritesData = favoritesDoc.data();
      if (!favoritesData.routes.some(route => route.startStation === startStation && route.endStation === endStation)) {
        await favoritesRef.update({
          routes: admin.firestore.FieldValue.arrayUnion({ startStation, endStation })
        });
      }
    } else {
      await favoritesRef.set({
        routes: [{ startStation, endStation }]
      });
    }
  } catch (error) {
    throw new Error(`Error adding to favorites: ${error.message}`);
  }
};
