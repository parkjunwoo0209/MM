// Import Firebase Admin SDK

//알림 테스트


const admin = require("firebase-admin");

// Firebase Admin 초기화 (초기화된 앱이 없을 경우에만 초기화)
const serviceAccount = require("../../firebaseKey.json"); // Firebase 서비스 계정 키 파일 경로를 설정하세요
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://metro-map-5f2e7.firebaseio.com", // 여기에 실제 프로젝트 ID를 입력하세요
  });
}

// Notification 테스트를 위한 예시 코드
const handleRouteSelection = async (startStation, endStation, userToken) => {
  const route = [startStation, "102", endStation]; // 테스트용 경로

  // 경로에서 두번째 마지막 역 찾기
  const secondLastStation = route[route.length - 2];
  const finalDestinationStation = route[route.length - 1];

  // FCM 메시지 생성
  const message = {
    notification: {
      title: "도착 알림",
      body: `이번 역은 ${secondLastStation}입니다. 다음 정거장은 ${finalDestinationStation}입니다!`,
    },
    token: userToken, // 사용자의 FCM 토큰
  };

  // FCM 메시지 전송
  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// 예시 호출 (테스트용 코드)
const startStation = "101";
const endStation = "103";
const userToken = "<USER_DEVICE_FCM_TOKEN>"; // 실제 사용자의 FCM 토큰을 사용하세요

handleRouteSelection(startStation, endStation, userToken);
