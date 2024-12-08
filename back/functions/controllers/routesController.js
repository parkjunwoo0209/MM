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

exports.getConnections = async (req, res) => {
  try {
    const { startStation, endStation } = req.query;
    console.log("라우트 컨트롤러 호출됨");
    console.log("출발역:", startStation);
    console.log("도착역:", endStation);
    
    if (!startStation || !endStation) {
      throw new Error("출발역과 도착역이 모두 필요합니다.");
    }

    // routesService의 findConnections 함수 직접 호출
    const result = await routesService.findConnections(startStation, endStation);
    
    // 결과가 있는지 확인
    if (!result) {
      throw new Error("경로를 찾을 수 없습니다.");
    }

    // 세 가지 경로 모두 로깅
    console.log("=== 최소 시간 경로 ===");
    console.log("경로:", result.timeOptimized.path);
    console.log("총 소요 시간:", result.timeOptimized.totalTime);
    console.log("총 거리:", result.timeOptimized.totalDistance);
    console.log("총 비용:", result.timeOptimized.totalCost);
    console.log("노선:", result.timeOptimized.lines);

    console.log("\n=== 최소 거리 경로 ===");
    console.log("경로:", result.distanceOptimized.path);
    console.log("총 소요 시간:", result.distanceOptimized.totalTime);
    console.log("총 거리:", result.distanceOptimized.totalDistance);
    console.log("총 비용:", result.distanceOptimized.totalCost);
    console.log("노선:", result.distanceOptimized.lines);

    console.log("\n=== 최소 비용 경로 ===");
    console.log("경로:", result.costOptimized.path);
    console.log("총 소요 시간:", result.costOptimized.totalTime);
    console.log("총 거리:", result.costOptimized.totalDistance);
    console.log("총 비용:", result.costOptimized.totalCost);
    console.log("노선:", result.costOptimized.lines);
    
    res.json(result);
  } catch (error) {
    console.error("경로 검색 오류:", error);
    res.status(400).json({ error: error.message });
  }
};