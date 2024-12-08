// MM/functions/dao/stationsDao.js

const { db } = require("../firebaseConfig");

// Firestore에 역 정보를 추가하는 함수
exports.addStation = async ({ stationID, stationName, lines }) => {
  try {
    await db.collection("Stations").doc(stationID).set({
      stationName,
      lines, // 노선 정보 추가
    });
    return "Station added successfully"; // 성공 메시지 반환
  } catch (error) {
    throw new Error(`Error adding station: ${error.message}`); // 에러 메시지 처리
  }
};

// 특정 역 정보를 Firestore에서 조회하는 함수
exports.getStationInfo = async (stationID) => {
  try {
    const stationDoc = await db.collection("Stations").doc(stationID).get();
    if (!stationDoc.exists) {
      throw new Error("Station not found"); // 역이 없으면 에러 반환
    }
    return stationDoc.data(); // 역 데이터 반환
  } catch (error) {
    throw new Error(`Error fetching station: ${error.message}`); // 에러 메시지 처리
  }
};