const stationsService = require("../services/stationsService");

// 특정 역 정보 조회
exports.getStationInfo = async (req, res) => {
  try {
    const { stationID } = req.params;
    if (!stationID) {
      return res.status(400).send("Missing station ID");
    }

    const result = await stationsService.getStationInfo(stationID);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching station info:", error.message);
    res.status(500).send(`Error fetching station info: ${error.message}`);
  }
};

// 두 역 간 경로 조회
exports.getRoute = async (req, res) => {
  try {
    const { startStation, endStation } = req.params;
    if (!startStation || !endStation) {
      return res.status(400).send("Missing station information");
    }

    const result = await stationsService.getRoute(startStation, endStation);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching route:", error.message);
    res.status(500).send(`Error fetching route: ${error.message}`);
  }
};