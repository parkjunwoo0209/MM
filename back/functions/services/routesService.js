const Graph = require("../utils/dijkstra");
const routesDao = require("../dao/routesDao");
const { convertTime } = require("../utils/timeCalculator");
const admin = require("firebase-admin");

// 최적 경로 계산
exports.getOptimalRoute = async (startStation, endStation) => {
  try {
    const connections = await routesDao.getAllConnections();
    const graph = new Graph();

    // 그래프 구성
    connections.forEach(({ startStation, endStation, time, distance, cost }) => {
      graph.addEdge(startStation, endStation, time, distance, cost);
    });

    // 경로 계산
    const shortestTime = graph.findShortestPath(startStation, endStation, "time");
    const shortestDistance = graph.findShortestPath(startStation, endStation, "distance");
    const lowestCost = graph.findShortestPath(startStation, endStation, "cost");

    // 결과 반환
    return {
      shortestTime: {
        path: shortestTime.path,
        travelTime: convertTime(shortestTime.time), // 시간 변환
        totalWeight: shortestTime.time,
      },
      shortestDistance: {
        path: shortestDistance.path,
        travelTime: convertTime(shortestDistance.distance), // 거리 변환
        totalWeight: shortestDistance.distance,
      },
      lowestCost: {
        path: lowestCost.path,
        travelTime: convertTime(lowestCost.cost), // 비용 변환
        totalWeight: lowestCost.cost,
      },
    };
  } catch (error) {
    throw new Error(`Error calculating optimal routes: ${error.message}`);
  }
};

// 경로 안내 시작
exports.startRouteGuidance = async (userId, route, criteria) => {
  const { path, transfers } = route;

  for (let i = 0; i < path.length - 1; i++) {
    const currentStation = path[i];
    const nextStation = path[i + 1];

    // 연결 시간 가져오기 및 변환
    const travelTime = await routesDao.getConnectionTime(currentStation, nextStation);
    const { hours, minutes, seconds } = convertTime(travelTime);

    // 조건 설정
    const isFirstStation = i === 0; // 첫 번째 역
    const isTransfer = transfers.includes(nextStation); // 환승 여부
    const isLastStation = i === path.length - 2; // 도착 전역 여부

    if (isFirstStation) {
      // 안내 시작 알림
      const startMessage = {
        notification: {
          title: "안내 시작",
          body: `${criteria} 경로 안내를 시작합니다. 다음 역은 ${nextStation}입니다.`,
        },
        topic: `user_${userId}`,
      };

      admin.messaging().send(startMessage).catch(err => {
        console.error("Error sending start notification:", err.message);
      });
    } else {
      // 경로 안내 알림
      setTimeout(() => {
        let title = "경로 안내";
        let body = `다음 역은 ${nextStation}입니다.`;

        if (isLastStation) {
          // 도착 안내 우선
          title = "도착 안내";
          body = `다음 역(${nextStation})에서 내리세요.`;
        } else if (isTransfer) {
          // 환승 안내
          title = "환승 안내";
          body = `다음 역(${nextStation})에서 환승하세요.`;
        }

        const message = {
          notification: {
            title,
            body,
          },
          topic: `user_${userId}`,
        };

        admin.messaging().send(message).catch(err => {
          console.error("Error sending notification:", err.message);
        });
      }, (hours * 3600 + minutes * 60 + seconds) * 1000); // 지연 시간 계산
    }
  }
};