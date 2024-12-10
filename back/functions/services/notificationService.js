const calculateArrivalTime = (stations, currentStation, targetStation) => {
  
  // 현재 역에서 목표 역까지의 정거장 수 계산
  const stationIndex = stations.indexOf(currentStation);
  const targetIndex = stations.indexOf(targetStation);
  const stationsCount = Math.abs(targetIndex - stationIndex);
  
  // 예상 소요 시간 계산 (분 단위)
  return stationsCount;
};

const getPreFinalStation = (route) => {
  if (!route.path || route.path.length < 2) {
    throw new Error("유효하지 않은 경로입니다.");
  }
  // 도착역 바로 전 역 반환
  return route.path[route.path.length - 2];
};

module.exports = {
  calculateArrivalTime,
  getPreFinalStation
};