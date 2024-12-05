// MM/functions/controllers/routeController.js

// 필요한 라이브러리와 Firebase Admin 초기화
{/*
const admin = require('firebase-admin');
const Graph = require('../utils/dijkstra'); // 다익스트라 알고리즘 파일을 가져오기
const serviceAccount = require('../../firebaseKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://metro-map-5f2e7.firebaseio.com"
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

// 사용자가 경로를 선택한 후 알림을 전송하는 함수
async function sendAlertOnApproachingStation(route, userToken) {
  if (route.length < 2) {
    console.error("유효하지 않은 경로입니다.");
    return;
  }

  const secondLastStation = route[route.length - 2]; // 도착역 전역
  const finalDestinationStation = route[route.length - 1]; //마지막 도착역

  // 도착 한 정거장 전 알림 메시지 생성
  const message = {
    notification: {
      title: "도착 알림",
      body: `이번 역은 ${secondLastStation}입니다. 다음 역은 목적지인 ${finalDestinationStation}역입니다!`
    },
    token: userToken // 사용자의 FCM 토큰 (이 토큰은 클라이언트 측에서 수집되어야 합니다)
  };

  try {
    await messaging.send(message);
    console.log(`도착하기 한 정거장 전 알림을 성공적으로 전송했습니다: ${secondLastStation}`);
  } catch (error) {
    console.error("알림 전송 오류:", error);
  }
}

// 경로 계산 및 사용자가 경로를 선택했을 때 처리
async function handleRouteSelection(startStation, endStation, userToken) {
  try {
    const graph = new Graph();

    // 모든 역과 연결 정보 가져오기
    const stationsSnapshot = await db.collection("Stations").get();
    const connectionsSnapshot = await db.collection("Connections").get();

    // 그래프에 노드 및 엣지 추가
    stationsSnapshot.docs.forEach((doc) => graph.addNode(doc.id));
    connectionsSnapshot.docs.forEach((doc) => {
      const { startStation, endStation, time, distance, cost } = doc.data();
      graph.addEdge(startStation, endStation, time, distance, cost);
    });

    // 경로 계산
    const shortestPath = graph.findShortestPath(startStation, endStation, "cost"); // 최소 비용 기준 예시

    if (!shortestPath) {
      console.error("경로를 찾을 수 없습니다.");
      return;
    }

    console.log("사용자가 선택한 경로:", shortestPath.path);

    // 사용자가 선택한 경로에 대해 알림을 설정
    sendAlertOnApproachingStation(shortestPath.path, userToken);

  } catch (error) {
    console.error("경로 처리 중 오류 발생:", error);
  }
}

module.exports = {
  handleRouteSelection
};
*/}