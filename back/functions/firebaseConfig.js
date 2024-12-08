const admin = require("firebase-admin");

// 서비스 계정 키 파일 로드
const serviceAccount = require("../firebaseKey.json");

// Firebase 앱이 초기화되지 않은 경우에만 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Firestore 인스턴스 생성
const db = admin.firestore();

module.exports = { admin, db };  // admin도 export
