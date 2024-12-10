const express = require("express");
const router = express.Router();

// 컨트롤러 불러오기
const usersController = require("./controllers/usersController");
const usersService = require("./services/usersService");
const routesController = require("./controllers/routesController");
const notificationController = require("./controllers/notificationController");
const { getUserFCMToken, sendNotification } = require("./services/notificationService");

// 최근 검색어 관련 라우트
router.post("/recent-searches", usersController.addRecentSearch);
router.get("/recent-searches/:email", usersController.getRecentSearches);
router.delete("/recent-searches/:email/:searchId", usersController.deleteRecentSearch);
router.delete("/recent-searches/:email/all", usersController.deleteAllRecentSearches);

// 사용자 관련 라우트
router.post("/auth/register", usersController.register);
router.post("/auth/login", usersController.login);
router.get("/users/:uid/profile", usersController.getProfile);


// 역 즐겨찾기 관련 라우트
router.post("/favorites/add", async (req, res) => {
  try {
    const { email, favoriteText } = req.body;
    const result = await usersService.addFavorite(email, favoriteText);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/favorites/remove", async (req, res) => {
  try {
    const { email, favoriteText } = req.body;
    const result = await usersService.removeFavorite(email, favoriteText);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/favorites/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const favorites = await usersService.getFavorites(email);
    res.json(favorites);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 경로 검색 관련 라우트
router.post("/routes/search", routesController.searchRoute);
router.get("/routes/connections", routesController.getConnections);


// 경로 즐겨찾기 관련 라우트

// 경로 즐겨찾기 추가
router.post("/favorites/route/add", async (req, res) => {
  try {
    const { email, routeData } = req.body; // 이메일 포함
    if (!email || !routeData) {
      return res.status(400).json({ error: "이메일과 경로 데이터를 제공해야 합니다." });
    }

    const result = await usersService.addRouteFavorite(email, routeData);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/favorites/route/remove", async (req, res) => {
  try {
    const { email, routeId } = req.body;

    if (!email || !routeId) {
      return res.status(400).json({ error: "Email and route ID are required." });
    }

    const result = await usersService.removeRouteFavorite(email, routeId);
    res.json(result);
  } catch (error) {
    console.error("경로 즐겨찾기 제거 오류:", error);
    res.status(500).json({ error: error.message }); // 서버 오류를 500으로 반환
  }
});

router.get("/favorites/route/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const routeFavorites = await usersService.getRouteFavorites(email);
    res.json(routeFavorites);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// 자동 즐찾 라우트
router.post("/routes/check", async (req, res) => {
  try {
    const { email, departure, arrival } = req.body;

    if (!email || !departure || !arrival) {
      return res.status(400).json({ error: "Email, departure, and arrival are required." });
    }

    const result = await usersService.checkRouteUsage(email, departure, arrival); // 서비스 호출
    res.json(result); // 결과 반환
  } catch (error) {
    console.error("경로 체크 중 오류:", error.message);
    res.status(500).json({ error: error.message });
  }
});

//알림기능

// 알림 발송 라우트
router.post("/notifications/send", notificationController.sendRouteNotifications);


module.exports = router;
