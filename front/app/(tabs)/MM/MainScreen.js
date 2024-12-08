import React, { useRef, useEffect } from "react";
import { StyleSheet, View, Image, Text, FlatList, Animated, PanResponder, TouchableOpacity } from "react-native";
import { useTheme } from '../../../hooks/ThemeContext';
import { useRouter } from 'expo-router';

const mockData = [
  {
    id: "1",
    time: "14분",
    transfers: 1,
    cost: "1250원",
    isFavorite: false,
    steps: [
      { type: "승차", station: "620", details: "3개 역 이동 | 621 → 622 → 601", duration: 8 },
      { type: "환승", station: "601", details: "2개 역 이동 | 503 → 303", duration: 6 },
      { type: "하차", station: "303", details: null, duration: 0 },
    ],
  },
];

const stepColors = {
  승차: "#FFD700",
  환승: "#FFFFFF",
  하차: "#90EE90",
};

const stepBorderColors = {
  승차: "#FFC107",
  환승: "#A9A9A9",
  하차: "#008000",
};

const defaultColor = "#D3D3D3";

const themes = {
  light: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#000000',
    subText: 'rgba(0, 0, 0, 0.4)',
    border: '#CCC',
    dragHandle: '#CCC',
    shadow: '#000000',
    floatingButton: '#FFFFFF',
  },
  dark: {
    background: '#121212',
    card: '#242424',
    text: '#FFFFFF',
    subText: 'rgba(255, 255, 255, 0.6)',
    border: '#404040',
    dragHandle: '#404040',
    shadow: '#000000',
    floatingButton: '#3A3A3A',
  }
};

const MainScreen = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? themes.dark : themes.light;
  
  const slideAnim = useRef(new Animated.Value(500)).current;
  const MIN_TRANSLATE_Y = 350; // 드래그 핸들이 보이도록 최소 높이 설정
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, []);

  // PanResponder로 드래그 이벤트 감지
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // 슬라이드를 제한된 범위 내에서 움직이도록 설정
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // 드래그 거리가 100px 이상이면 리스트를 최소 높이로 내림
          Animated.timing(slideAnim, {
            toValue: MIN_TRANSLATE_Y, // 드래그 핸들이 보이도록 최소 높이로 설정
            duration: 300,
            useNativeDriver: false,
          }).start();
        } else {
          // 드래그 거리가 짧으면 원래 위치로 돌아감
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;
    
    

  const renderGraph = (steps) => {
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let cumulativeWidth = 0;
    const graphWidth = 328;

    return (
      <View style={[styles.graphContainer, { backgroundColor: theme.card }]}>
        <View style={styles.graph}>
          {steps.map((step, index) => {
            const segmentWidth = (step.duration / totalDuration) * graphWidth;
            const circlePosition = cumulativeWidth;
            cumulativeWidth += segmentWidth;

            const nextStep = steps[index + 1];
            const color = stepColors[step.type] || defaultColor;
            const borderColor = stepBorderColors[step.type] || defaultColor;
            const lineColor =
              nextStep?.type === "하차" ? stepColors["하차"] : stepColors[step.type];

            return (
              <React.Fragment key={index}>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.graphLine,
                      { width: segmentWidth, backgroundColor: lineColor, left: circlePosition },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.commonCircle,
                    styles.graphCircle,
                    { backgroundColor: color, borderColor: borderColor, left: circlePosition - 15 },
                  ]}
                >
                  <Text style={styles.graphText}>{step.type}</Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };

  const renderResult = ({ item }) => (
    <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Text style={[styles.time, { color: theme.text }]}>{item.time}</Text>
          <Text style={[styles.details, { color: theme.subText }]}>
            환승 {item.transfers}번 | {item.cost}
          </Text>
        </View>
      </View>
      {renderGraph(item.steps)}
      <View style={styles.steps}>
        {item.steps.map((step, index) => {
          const color = stepColors[step.type] || defaultColor;
          const borderColor = stepBorderColors[step.type] || defaultColor;

          return (
            <View key={index} style={styles.stepContainer}>
              <View style={styles.step}>
                <View
                  style={[
                    styles.commonCircle,
                    styles.circle,
                    { backgroundColor: color, borderColor: borderColor },
                  ]}
                >
                  <Text style={[
                    styles.circleText, 
                    { color: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)' }
                  ]}>
                    {step.type}
                  </Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={[styles.stepStation, { color: theme.text }]}>
                    {step.station} {step.type}
                  </Text>
                  {step.details && (
                    <Text style={[styles.stepDetails, { color: theme.subText }]}>
                      {step.details}
                    </Text>
                  )}
                </View>
              </View>
              {index < item.steps.length - 1 && (
                <View style={[styles.line, { borderColor: theme.border }]} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  // 컴포넌트 내부에서 동적 스타일 적용
  const mapStyle = {
    opacity: isDarkMode ? 0.8 : 1
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.mapContainer}>
        <Image 
          source={require("../../../assets/images/mainicon/지하철 노선도.png")} 
          style={[styles.map, mapStyle]} 
        />
      </View>

      <Animated.View
        style={[
          styles.listContainer,
          {
            transform: [{ translateY: slideAnim }],
            backgroundColor: theme.card,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.dragHandle, { backgroundColor: theme.dragHandle }]} />
        <FlatList
          data={mockData}
          keyExtractor={(item) => item.id}
          renderItem={renderResult}
          contentContainerStyle={[styles.list, { backgroundColor: theme.background }]}
        />
        <TouchableOpacity 
          style={[styles.floatingButton, { backgroundColor: theme.floatingButton }]} 
          onPress={() => console.log("Button Pressed")}
        >
          <Image 
            source={require("../../../assets/images/menuicon/directions_subway.png")} 
            style={styles.floatingIcon} 
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 0.8, // 상단 노선도 부분 비율 조정
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "300%", // 노선도 이미지 크기 조정
    height: "300%", 
    resizeMode: "contain",
  },
  list: {
    flex: 2,
    paddingHorizontal: 0, // 좌우 여백 추가
    backgroundColor: "",
  },
  listContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "50%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  dragHandle: {
    width: 60,
    height: 6,
    backgroundColor: "#CCC",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 10,
  },
  resultCard: {
    backgroundColor: "#F7F7F7",
    padding: 30,
    borderRadius: 15, // 둥근 모서리
    marginBottom: 20,
    shadowColor: "#000", // 그림자 추가
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // 안드로이드 그림자
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  timeContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  time: {
    fontSize: 28, // 더 큰 글씨 크기
    fontWeight: "bold",
    color: "#000",
  },
  details: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  graphContainer: { 
    height: 36, 
    width: '100%',
    maxWidth: 328, // 그래프 너비 고정
    justifyContent: 'center', // 수직 중앙 정렬
    alignSelf: 'center',
    alignItems: 'center', // 수직 중앙 정렬
    position: 'relative', // 화면 가운데 정렬
    marginBottom: 20, // 그래프 아래 간격 추가
    backgroundColor: "#F7F7F7",
  },
  graph: { 
    flexDirection: 'row', // 가로 방향 배치
    alignItems: 'center', // 수직 중앙 정렬
    height: '100%',
    width: '100%', // 부모 컨테이너 높이에 맞춤
    
  },
  graphCircle: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    position: 'absolute', // 그래프 상의 위치 조정
    borderWidth: 1, // 테두리 두께 설정
    justifyContent: 'center', // 수직 중앙 정렬
  alignItems: 'center',     // 수평 중앙 정렬
  },
  graphLine: { 
    height: 20, 
    position: 'absolute' 
  },
  graphText: { 
    fontSize: 14, 
    color: 'rgba(0, 0, 0, 0.6)', 
    textAlign: 'center' 
  },
  stepContainer: {
    marginBottom: 0, // 스텝 간 간격
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    marginRight: 10,
    borderWidth: 1, // 테두리 두께 설정
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center',     // 수평 중앙 정렬
  },
   circleText: { 
    fontSize: 12, // 텍스트 크기
    color: 'rgba(0, 0, 0, 0.4)', // 텍스트 색상
    textAlign: 'center', // 텍스트 중앙 정렬
    //fontWeight: 'bold', // 텍스트 굵기
  },
  
  stepTextContainer: {
    flex: 1,
  },
  stepStation: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  stepDetails: {
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.4)",
    marginTop: 2,
  },
  line: {
    height: 50, // 점선 길이
    borderLeftWidth: 2, // 점선 두께
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderStyle: 'dashed', // 점선 스타일
    marginLeft: 15,
    marginVertical: 0,        // 상하 마진을 없애서 정확히 연결
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  floatingIcon: {
    width: 36,
    height: 36,
  },


});

export default MainScreen; 