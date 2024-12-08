const Graph = require('../utils/dijkstra');
const routesDao = require("../dao/routesDao");

exports.findConnections = async (startStation, endStation) => {
  try {
    const allConnections = await routesDao.getAllConnections();
    console.log("모든 연결 정보 개수:", allConnections.length);
    
    if (allConnections.length === 0) {
      throw new Error("연결 정보를 찾을 수 없습니다.");
    }
    
    const graph = new Graph();
    
    // 모든 연결을 그래프에 추가
    allConnections.forEach(connection => {
      graph.addEdge(
        connection.startStation,
        connection.endStation,
        connection.time,
        connection.distance,
        connection.cost,
        connection.startLine,  // 노선 정보 추가
        connection.endLine     // 노선 정보 추가
      );
    });

    // 세 가지 기준으로 경로 찾기
    const timeResult = graph.findShortestPath(startStation, endStation, 'time');
    const distanceResult = graph.findShortestPath(startStation, endStation, 'distance');
    const costResult = graph.findShortestPath(startStation, endStation, 'cost');

    if (!timeResult || !distanceResult || !costResult) {
      throw new Error(`${startStation}에서 ${endStation}까지의 경로를 찾을 수 없습니다.`);
    }

    // 각 경로에 대한 상세 정보 수집
    const getPathDetails = (pathResult) => {
      const connections = [];
      let totalTime = 0;
      let totalDistance = 0;
      let totalCost = 0;
      const lines = []; // 경유하는 노선들

      for (let i = 0; i < pathResult.path.length - 1; i++) {
        const currentStation = pathResult.path[i];
        const nextStation = pathResult.path[i + 1];
        
        const connection = allConnections.find(conn => 
          conn.startStation === currentStation && 
          conn.endStation === nextStation
        );

        if (connection) {
          connections.push(connection);
          totalTime += connection.time;
          totalDistance += connection.distance;
          totalCost += connection.cost;
          if (connection.startLine) {
            lines.push(connection.startLine);
          }
        }
      }

      return {
        path: pathResult.path,
        connections,
        totalTime,
        totalDistance,
        totalCost,
        lines: [...new Set(lines)] // 중복 제거된 노선 목록
      };
    };

    const finalResult = {
      timeOptimized: {
        ...getPathDetails(timeResult),
        type: '최소 시간'
      },
      distanceOptimized: {
        ...getPathDetails(distanceResult),
        type: '최소 거리'
      },
      costOptimized: {
        ...getPathDetails(costResult),
        type: '최소 비용'
      }
    };

    console.log("최종 결과:", {
      timeOptimized: {
        stations: finalResult.timeOptimized.path.length,
        totalTime: finalResult.timeOptimized.totalTime,
        totalDistance: finalResult.timeOptimized.totalDistance,
        totalCost: finalResult.timeOptimized.totalCost,
        lines: finalResult.timeOptimized.lines
      },
      distanceOptimized: {
        stations: finalResult.distanceOptimized.path.length,
        totalTime: finalResult.distanceOptimized.totalTime,
        totalDistance: finalResult.distanceOptimized.totalDistance,
        totalCost: finalResult.distanceOptimized.totalCost,
        lines: finalResult.distanceOptimized.lines
      },
      costOptimized: {
        stations: finalResult.costOptimized.path.length,
        totalTime: finalResult.costOptimized.totalTime,
        totalDistance: finalResult.costOptimized.totalDistance,
        totalCost: finalResult.costOptimized.totalCost,
        lines: finalResult.costOptimized.lines
      }
    });

    return finalResult;

  } catch (error) {
    console.error("경로 검색 오류:", error);
    throw new Error(`경로 검색 중 오류 발생: ${error.message}`);
  }
};