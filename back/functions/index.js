const express = require("express");
const cors = require("cors");
const admin = require('firebase-admin');
const routes = require("./routes");
const app = express();

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    // 여기에 Firebase 프로젝트 설정을 추가
    // credential: admin.credential.applicationDefault()
  });
}

app.use(cors());
app.use(express.json());

// 요청 로깅 미들웨어 추가
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 모든 라우트를 /api 프리픽스로 사용
app.use("/api", routes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://10.0.2.2:${PORT}`);
});