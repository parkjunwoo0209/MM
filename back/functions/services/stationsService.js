// MM/functions/services/stationsService.js

const { db } = require("../firebaseConfig");
const Graph = require("../utils/dijkstra");

// 특정 역 정보를 Firestore에서 조회
exports.getStationInfo = async (stationID) => {
  try {
    const stationDoc = await db.collection("Stations").doc(stationID).get();
    if (!stationDoc.exists) {
      throw new Error("Station not found");
    }
    const stationData = stationDoc.data();
    return stationData; // 노선 정보도 반환
  } catch (error) {
    throw new Error(`Error fetching station: ${error.message}`);
  }
};

// 환승 지점 확인 로직 추가
exports.getTransferInfo = async (startStation, endStation) => {
  try {
    const startStationInfo = await exports.getStationInfo(startStation);
    const endStationInfo = await exports.getStationInfo(endStation);

    // 두 역의 노선 비교
    const startLines = startStationInfo.lines;
    const endLines = endStationInfo.lines;

    // 두 역이 연결되며 환승 노선인지 확인
    const commonLines = startLines.filter(line => endLines.includes(line));
    if (commonLines.length > 0) {
      return { isTransfer: false }; // 동일 노선
    } else {
      return {
        isTransfer: true,
        transferFrom: startLines,
        transferTo: endLines,
      };
    }
  } catch (error) {
    throw new Error(`Error fetching transfer info: ${error.message}`);
  }
};
