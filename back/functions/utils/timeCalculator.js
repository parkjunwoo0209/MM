exports.convertTime = (weight) => {
    if (typeof weight !== "number" || isNaN(weight)) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
    const totalSeconds = Math.floor(weight / 600); // 가중치를 초 단위로 변환
    const hours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
  
    return { hours, minutes, seconds };
  };