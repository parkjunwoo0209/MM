const { db } = require("../firebaseConfig");

// 모든 연결 정보 가져오기
exports.getAllConnections = async () => {
  try {
    const snapshot = await db.collection("Connections").get();
    if (snapshot.empty) {
      throw new Error("No connections found");
    }
    // 문서 ID와 데이터를 모두 포함하여 반환
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error(`Error fetching connections: ${error.message}`);
  }
};

// 특정 연결의 시간 가져오기
exports.getConnectionTime = async (startStation, endStation) => {
  try {
    const snapshot = await db.collection("Connections")
      .where("startStation", "==", startStation)
      .where("endStation", "==", endStation)
      .get();

    if (snapshot.empty) {
      throw new Error(`No connection found between ${startStation} and ${endStation}`);
    }
    return snapshot.docs[0].data().time;
  } catch (error) {
    throw new Error(`Error fetching connection time: ${error.message}`);
  }
};

// 특정 역의 노선 정보 가져오기
exports.getStationLines = async (stationID) => {
  try {
    const stationDoc = await db.collection("Stations").doc(stationID).get();
    if (!stationDoc.exists) {
      throw new Error("Station not found");
    }
    return stationDoc.data().lines;
  } catch (error) {
    throw new Error(`Error fetching station lines: ${error.message}`);
  }
};

// 역 존재 여부 확인
exports.checkStationExists = async (stationName) => {
  try {
    const snapshot = await db.collection("Stations")
      .where("stationID", "==", stationName)
      .get();
    return !snapshot.empty;
  } catch (error) {
    throw new Error(`Error checking station existence: ${error.message}`);
  }
};