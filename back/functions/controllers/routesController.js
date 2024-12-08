const routesService = require("../services/routesService");

// 최적 경로 검색 및 사용자 선택
exports.searchOptimalRoute = async (req, res) => {
  try {
    const { startStation, endStation, criteria, userId } = req.body;

    if (!startStation || !endStation || !criteria || !userId) {
      return res.status(400).send("Missing required information");
    }

    // 최적 경로 계산
    const result = await routesService.getOptimalRoute(startStation, endStation);

    if (!result) {
      return res.status(404).send("No routes found");
    }

    res.status(200).json(result); // 경로 정보 반환
  } catch (error) {
    console.error("Error calculating routes:", error.message);
    res.status(500).send(`Error calculating routes: ${error.message}`);
  }
};

// 사용자 선택 경로 안내 시작
exports.startRouteGuidance = async (req, res) => {
  try {
    const { userId, selectedRoute, criteria } = req.body;

    if (!userId || !selectedRoute || !criteria) {
      return res.status(400).send("Missing required information");
    }

    // 경로 안내 시작
    await routesService.startRouteGuidance(userId, selectedRoute, criteria);

    res.status(200).send(`Guidance started for ${criteria} route`);
  } catch (error) {
    console.error("Error starting route guidance:", error.message);
    res.status(500).send(`Error starting route guidance: ${error.message}`);
  }
};