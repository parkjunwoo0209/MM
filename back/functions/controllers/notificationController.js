const { calculateArrivalTime, getPreFinalStation } = require("../services/notificationService");

exports.sendRouteNotifications = async (req, res) => {
  try {
    const { route } = req.body;

    if (!route || !route.path || route.path.length < 2) {
      return res.status(400).json({ 
        error: "유효한 경로 정보가 필요합니다." 
      });
    }

    const startStation = route.path[0];
    const endStation = route.path[route.path.length - 1];
    const preFinalStation = getPreFinalStation(route);
    const timeToPreFinal = calculateArrivalTime(route.path, startStation, preFinalStation);

    res.status(200).json({
      startStation,
      endStation,
      preFinalStation,
      timeToPreFinal,
      message: `${endStation}역 도착 ${timeToPreFinal}분 전(${preFinalStation}역)에 알림이 발송됩니다.`
    });
  } catch (error) {
    console.error("알림 설정 오류:", error);
    res.status(500).json({ error: error.message });
  }
};
