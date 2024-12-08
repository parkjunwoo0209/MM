const express = require("express");
const router = express.Router();

// 컨트롤러 불러오기
const usersController = require("./controllers/usersController");
const usersService = require("./services/usersService");

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

module.exports = router;
