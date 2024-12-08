const express = require("express");
const router = express.Router();

// 컨트롤러 불러오기
const usersController = require("./controllers/usersController");
const usersService = require("./services/usersService");
const routesController = require("./controllers/routesController");

// 최근 검색어 관련 라우트
router.post("/recent-searches", usersController.addRecentSearch);
router.get("/recent-searches/:email", usersController.getRecentSearches);
router.delete("/recent-searches/:email/:searchId", usersController.deleteRecentSearch);
router.delete("/recent-searches/:email/all", usersController.deleteAllRecentSearches);

// 사용자 관련 라우트
router.post("/auth/register", usersController.register);
router.post("/auth/login", usersController.login);
router.get("/users/:uid/profile", usersController.getProfile);

// 즐겨찾기 관련 라우트
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
router.post("/path/search", routesController.searchPath);

// 경로 즐겨찾기 관련 라우트
router.post("/favorites/route", async (req, res) => {
  try {
    const { email, routeData, action } = req.body;
    let result;

    if (action === 'add') {
      result = await usersService.addRouteFavorite(email, routeData);
    } else if (action === 'remove') {
      result = await usersService.removeRouteFavorite(email, routeData.id);
    } else {
      throw new Error('Invalid action');
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
