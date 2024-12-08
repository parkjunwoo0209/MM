import { getRouteInfoFromState } from 'expo-router/build/LocationProvider';
import React, { useState, useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/ThemeContext';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../api/apiClient';

// 타입별 색상 매핑
const stepColors = {
  승차: '#FFC000',
  환승: '#F7F7F7',
  하차: '#92D050',
  경유: '#FFFFFF',
};

// 타입별 테두리 색상 매핑
const stepBorderColors = {
  승차: '#FFFFFF',
  환승: 'rgba(0, 0, 0, 0.4)',
  하차: '#FFFFFF',
  경유: 'rgba(0, 0, 0, 0.4)',
};

// 기본 색상 설정 (해딩 타입 없을 때 사용)
const defaultColor = 'transparent';

// PNG 아이콘 파일 import
const ArrowBackIcon = require('../../../assets/images/searchicon/arrow_back.png');
const ExchangeIcon = require('../../../assets/images/searchicon/exchange.png');
const EmptyStarIcon = require('../../../assets/images/searchicon/emptystaricon.png');
const StarIcon = require('../../../assets/images/searchicon/staricon.png');
const ClearIcon = require('../../../assets/images/searchicon/X.png');
const ArrowDropDownIcon = require('../../../assets/images/searchicon/arrow_drop_down.png');

const SearchResult = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  
  // 모든 상태 변수를 한 곳에서 선언
  const [routeData, setRouteData] = useState(null);
  const [mockData, setMockData] = useState([]);
  const [departureStation, setDepartureStation] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  const [sortOption, setSortOption] = useState('최소 시간순');
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [isSearchFavorite, setIsSearchFavorite] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set()); // 펼쳐진 카드 ID 관리

  // 경로 데이터 포맷팅 함수를 useCallback으로 감싸기
  const formatRouteData = React.useCallback(async (apiData) => {
    if (!apiData) return [];

    try {
      // 검색 결과를 AsyncStorage에 저장
      await AsyncStorage.setItem('lastRouteResult', JSON.stringify(apiData));

      const secondsToMinutes = (seconds) => {
        return Math.round(seconds / 60);
      };

      // createSteps 함수 정의
      const createSteps = (path, connections) => {
        return path.map((station, index) => {
          const connection = index < connections.length ? connections[index] : null;
          const nextConnection = index + 1 < connections.length ? connections[index + 1] : null;

          if (index === 0) {
            return {
              type: '승차',
              station: station,
              details: connection ? `${secondsToMinutes(connection.time)}분 소요 | ${connection.distance}m` : '',
              duration: connection?.time || 0,
              line: connection?.startLine
            };
          } else if (index === path.length - 1) {
            return {
              type: '하차',
              station: station,
              details: '',
              duration: 0,
              line: connection?.endLine
            };
          } else {
            return {
              type: '경유',
              station: station,
              details: connection ? `${secondsToMinutes(connection.time)}분 소요 | ${connection.distance}m` : '',
              duration: connection?.time || 0,
              line: connection?.endLine
            };
          }
        });
      };

      // 각 경로의 steps를 생성
      const costSteps = createSteps(apiData.costOptimized.path, apiData.costOptimized.connections);
      const timeSteps = createSteps(apiData.timeOptimized.path, apiData.timeOptimized.connections);
      const distanceSteps = createSteps(apiData.distanceOptimized.path, apiData.distanceOptimized.connections);

      const routes = [
        {
          id: 'time',  // 시간 경로를 첫 번째로
          time: `${secondsToMinutes(apiData.timeOptimized.totalTime)}분`,
          cost: `${apiData.timeOptimized.totalCost}원`,
          transfers: apiData.timeOptimized.lines.length - 1,
          isFavorite: false,
          steps: timeSteps,
          type: '최소 시간'
        },
        {
          id: 'cost',
          time: `${secondsToMinutes(apiData.costOptimized.totalTime)}분`,
          cost: `${apiData.costOptimized.totalCost}원`,
          transfers: apiData.costOptimized.lines.length - 1,
          isFavorite: false,
          steps: costSteps,
          type: '최소 비용'
        },
        {
          id: 'distance',
          time: `${secondsToMinutes(apiData.distanceOptimized.totalTime)}분`,
          cost: `${apiData.distanceOptimized.totalCost}원`,
          transfers: apiData.distanceOptimized.lines.length - 1,
          isFavorite: false,
          steps: distanceSteps,
          type: '최소 거리'
        }
      ];

      // 초기 정렬을 시간 기준으로
      return routes.sort((a, b) => {
        const timeA = parseInt(a.time.replace('분', ''));
        const timeB = parseInt(b.time.replace('분', ''));
        return timeA - timeB;
      });
    } catch (error) {
      console.error('Error formatting route data:', error);
      return [];
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    const loadRouteData = async () => {
      if (params.routeData) {
        try {
          const parsedData = JSON.parse(params.routeData);
          const formattedData = await formatRouteData(parsedData);
          if (formattedData.length > 0) {
            setMockData(formattedData);
            if (formattedData[0].steps.length > 0) {
              setDepartureStation(formattedData[0].steps[0].station);
              setArrivalStation(formattedData[0].steps[formattedData[0].steps.length - 1].station);
            }
          }
        } catch (error) {
          console.error('데이터 파싱 오류:', error);
          Alert.alert('오류', '경로 데이터를 불러오는데 실패했습니다.');
        }
      }
    };

    loadRouteData();
  }, [params.routeData, formatRouteData]);

  // 출발역 <-> 도착역 교환
  const exchangeStations = async () => {
    try {
      // 기존 역 교환 (임시 변수에 저장)
      const tempDeparture = departureStation;
      const tempArrival = arrivalStation;

      // 상태 업데이트
      setDepartureStation(tempArrival);
      setArrivalStation(tempDeparture);

      // API 호출 경로 수정
      const response = await apiClient.get(`/api/routes/connections`, {
        params: {
          startStation: tempArrival,  // 교환된 출발역
          endStation: tempDeparture   // 교환된 도착역
        }
      });
      
      // 새로운 경로 데이터 포맷팅 및 상태 업데이트
      const formattedData = await formatRouteData(response.data);
      setMockData(formattedData);

    } catch (error) {
      console.error('경로 재검색 오류:', error);
      Alert.alert('오류', '경로를 다시 검색하는데 실패했습니다.');
    }
  };

  //즐겨찾기 토글
  const toggleFavorite = async (id) => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) {
        Alert.alert("알림", "로그인이 필요한 기능입니다.");
        return;
      }

      // 해당 경로 찾기
      const route = mockData.find(item => item.id === id);
      if (!route) return;

      // 필요한 기본 정보만 전송
      const routeData = {
        departure: route.steps[0].station,
        arrival: route.steps[route.steps.length - 1].station,
        type: route.type,
        time: route.time,
        cost: route.cost
      };

      if (!route.isFavorite) {
        await apiClient.post("/api/favorites/route/add", {
          email: userEmail,
          routeData: routeData
        });
      } else {
        await apiClient.post("/api/favorites/route/remove", {
          email: userEmail,
          routeId: id
        });
      }

      // UI 업데이트
      setMockData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );

      Alert.alert(
        "알림", 
        route.isFavorite ? "즐겨찾기가 해제되었습니다." : "즐겨찾기에 추가되었습니다."
      );

    } catch (error) {
      console.error('즐겨찾기 처리 중 오류:', error);
      Alert.alert('오류', '즐겨찾기 처리에 실패했습니다.');
    }
  };

  // 출발역 초기화
  const clearDeparture = () => setDepartureStation('');
  // 도착역 초기화
  const clearArrival = () => setArrivalStation('');

  // 정렬 모달 열기/ 닫기
  const openSortModal = () => setSortModalVisible(true);
  
  const closeSortModal = () => setSortModalVisible(false);

  // 정렬 옵션 처리
  const handleSortOption = (option) => {
    setSortOption(option);

    setMockData((prevData) => {
      const newData = [...prevData];
      
      // 옵션과 일치하는 타입을 맨 위로 올리기 위한 정렬
      return newData.sort((a, b) => {
        // 옵션과 일치하는 타입을 맨 ��로
        if (option === '최소 비용순') {
          if (a.type === '최소 비용') return -1;
          if (b.type === '최소 비용') return 1;
        }
        if (option === '최소 시간순') {
          if (a.type === '최소 시간') return -1;
          if (b.type === '최소 시간') return 1;
        }
        if (option === '최소 거리순') {
          if (a.type === '최소 거리') return -1;
          if (b.type === '최소 거리') return 1;
        }

        // 나머지는 기존 정렬 로직 유지
        if (option === '최소 비용순') {
          const costA = parseInt(a.cost.replace('원', ''));
          const costB = parseInt(b.cost.replace('원', ''));
          return costA - costB;
        } 
        else if (option === '최소 시간순') {
          const timeA = parseInt(a.time.replace('분', ''));
          const timeB = parseInt(b.time.replace('분', ''));
          return timeA - timeB;
        } 
        else if (option === '최소 거리순') {
          const getTotalDistance = (steps) => {
            return steps.reduce((total, step) => {
              const distance = step.details?.match(/\d+m/)?.[0]?.replace('m', '') || 0;
              return total + parseInt(distance);
            }, 0);
          };

          const distanceA = getTotalDistance(a.steps);
          const distanceB = getTotalDistance(b.steps);
          return distanceA - distanceB;
        }
        
        return 0;
      });
    });
    
    closeSortModal();
  };

  // 그래프 렌더링
  const renderGraph = (steps) => {
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let cumulativeWidth = 0;
    const graphWidth = 328;

    // 경유 공간을 합치지 않고 모든 스텝을 그대로 사용
    return (
      <View style={styles.graphContainer}>
        <View style={styles.graph}>
          {steps.map((step, index) => {
            const segmentWidth = (step.duration / totalDuration) * graphWidth;
            const circlePosition = cumulativeWidth;
            cumulativeWidth += segmentWidth;

            const nextStep = steps[index + 1];
            const color = stepColors[step.type] || defaultColor;
            const borderColor = stepBorderColors[step.type] || defaultColor;
            const lineColor = nextStep?.type === '하차' ? stepColors['하차'] : stepColors[step.type];

            // 경유 구간은 표시하지 않고 선만 표시
            if (step.type === '경유') {
              return (
                <React.Fragment key={index}>
                  {index < steps.length - 1 && (
                    <View
                      style={[
                        styles.graphLine,
                        { 
                          width: segmentWidth, 
                          backgroundColor: '#FFFFFF',  // 경유 구간은 흰색으로
                          left: circlePosition,
                          borderWidth: 0,  // 테두리 제거
                          height: '100%'   // 높이를 100%로 설정
                        },
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            }

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

  // 카드 펼치기/접기 함수
  const toggleCard = (id) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 결과 카드 렌더링
  const renderResult = ({ item }) => (
    <View style={styles.resultCard}>
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={() => toggleCard(item.id)}
      >
        <View style={styles.header}>
          <View style={styles.timeContainer}>
            <Text style={styles.label}>{item.type}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.details}>
            {item.cost}
          </Text>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.bookmark}>
            <Image
              source={item.isFavorite ? StarIcon : EmptyStarIcon}
              style={styles.icon}
            />
            <Text style={styles.bookmarkText}>즐겨찾기</Text>
          </TouchableOpacity>
        </View>

        {/* 시작역과 도착역 정보 */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {item.steps[0].station} → {item.steps[item.steps.length - 1].station}
          </Text>
          <Image
            source={expandedCards.has(item.id) ? 
              require('../../../assets/images/searchicon/arrow_up.png') :
              require('../../../assets/images/searchicon/arrow_down.png')}
            style={styles.arrowIcon}
          />
        </View>
      </TouchableOpacity>

      {/* 펼쳐졌을 때만 보이는 상세 정보 */}
      {expandedCards.has(item.id) && (
        <>
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
                      <Text style={styles.circleText}>{step.type}</Text>
                    </View>
                    <View style={styles.stepTextContainer}>
                      <View style={styles.stepStationContainer}>
                        <Text style={styles.stepStation}>
                          {step.station} {step.type}
                        </Text>
                        <Text style={styles.lineInfo}>
                          {step.line}호선
                        </Text>
                      </View>
                      {step.details ? <Text style={styles.stepDetails}>{step.details}</Text> : null}
                    </View>
                  </View>
                  {index < item.steps.length - 1 && <View style={styles.line} />}
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );

  // 뒤로가기 핸들러 수정
  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.iconContainer} onPress={handleBack}>
            <Image source={ArrowBackIcon} style={styles.icon} />
          </TouchableOpacity>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="출발역"
              style={styles.input}
              value={departureStation}
              onChangeText={setDepartureStation}
            />
            <TouchableOpacity onPress={clearDeparture}>
              <Image source={ClearIcon} width={16} height={16} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.iconContainer} onPress={exchangeStations}>
            <Image source={ExchangeIcon} style={styles.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.iconContainer} />
          <View style={styles.searchBox}>
            <TextInput
              placeholder="도착역"
              style={styles.input}
              value={arrivalStation}
              onChangeText={setArrivalStation}
            />
            <TouchableOpacity onPress={clearArrival}>
              <Image source={ClearIcon} width={16} height={16} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setIsSearchFavorite(!isSearchFavorite)}
          >
            <Image
              source={isSearchFavorite ? StarIcon : EmptyStarIcon}
              style={[styles.icon, { tintColor: isDarkMode ? '#FFFFFF' : '#000000' }]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 정렬 섹션 */}
      <View style={styles.sortSection}>
        <Text style={styles.sortText}>{sortOption}</Text>
        <TouchableOpacity onPress={openSortModal} style={styles.sortIcon}>
          <Image source={ArrowDropDownIcon} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* 결과 목록 */}
      <FlatList
        data={mockData}
        keyExtractor={(item) => item.id}
        renderItem={renderResult}
        contentContainerStyle={styles.list}
      />
    

      {/* 정렬 모달 */}
      <Modal
        visible={isSortModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeSortModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={['최소 시간순', '최소 거리순', '최소 비용순']}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSortOption(item)}
                >
                  <Text style={styles.modalOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      {/* 뒤로가기 섹션 */}
    <View style={styles.backSection}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Image source={ArrowBackIcon} style={styles.icon} />
      </TouchableOpacity>
    </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, // 화면 전체 차지
    backgroundColor: '#F7F7F7',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20, // 플랫폼별 marginTop 추가
    
  },
  // 검색 세션
  searchSection: { 
    padding: 10, // 내부 여백
    backgroundColor: '#F7F7F7' //배경색
  },
  // 행 스타일 (출발역/도착역 입력과 버튼이 배치된 행)
  row: { 
    flexDirection: 'row', // 가로 방향 치
    alignItems: 'center', // 수직 중앙 정렬
    justifyContent: 'center', // 가로 중앙 정렬
    marginBottom: 10, // 래쪽 여백
    width: '100%', // 행이 화면 전체 너비 차지
    
    marginBottom: 10 // 아래쪽 여백
  },
  // 입력창 스타일
  searchBox: {
    //flex: 1, // 가로 공간 채우기
    width: 305,
    height: 40, // 고정 높이
    backgroundColor: '#FFFFFF',
    borderRadius: 9999, // 모서리 둥글게
    paddingHorizontal: 15, // 양쪽 내부 여백
    flexDirection: 'row', // 아이콘, 텍스트 입력 가로로 배치
    alignItems: 'center', // 내부 요소 수직 중앙 정
    elevation: 1,
  },
  // 입력 필드
  input: { 
    flex: 1, // 가로 공간 채우기
    fontSize: 14 
  },
  bookmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  label: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
    marginBottom: 5,
  },
  //아이콘 컨테이너 
  iconContainer: { 
    width: 20, // 고정 너비
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center', // 평 중앙 정렬
    marginHorizontal: 10, // 좌우 간격 추가
  },
  // 아이콘 스타일
  icon: { 
    width: 20, 
    height: 20, 
    resizeMode: 'contain' // 아이콘 비율 지하며 맞
  },
  // 정렬 섹션
  sortSection: {
    flexDirection: 'row', // 가로 방향 배
    alignItems: 'center', // 수직 중앙 정렬
    justifyContent: 'flex-end', // 오른쪽 정렬
    padding: 10, // 내부 여백
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
  },
  // 정렬 텍스트 스타일
  sortText: { 
    fontSize: 14, 
    color: '#000' 
  },
  sortIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 모달 오버레이 스타일
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    
  },
  // 모달 콘텐츠 스타일
  modalContent: {
    width: '80%', // 화면 너 80%
    padding: 20, // 내부 여백
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  // 모달 옵션 스타일
  modalOption: { 
    padding: 10 
  },
  modalOptionText: { 
    fontSize: 14, 
    color: '#000' 
  },
  // 결과 목록 스타일 
  list: { 
    paddingHorizontal: 0, // 좌우 여백 0
    marginTop: 10, // 상 여백
  },
  // 결과 카드 스타일
  resultCard: {
    backgroundColor: '#FFFFFF',
    padding: 10, // 내부 여백
    marginBottom: 10, // 하단 여백
    borderRadius: 8, 
  },
  // 헤더 스타일 ( 소요 시간, 즐겨찾기 영역)
  header: { 
    flexDirection: 'row', // 가로 방향 배치 
    justifyContent: 'space-between', // 양 정렬
    alignItems: 'center', // 수직 중앙 정렬
    marginBottom: 10,
  },
  // 소요 시간 컨테이
  timeContainer: { 
    flexDirection: 'column', 
    alignItems: 'flex-start', //왼쪽 정렬
    justifyContent: 'center',
    marginRight: 20, // "14분"과 환승 정보 사이 간격 정
  },
  // 소요 시 텍스트 스타일
  time: { 
    fontSize: 24, 
    fontWeight: '600', // 굵은 글씨
    color: 'rgba(0, 0, 0, 0.8)',
  },
  // 세부 정보 텍스트 스타일
  details: { 
    fontSize: 14, 
    color: 'rgba(0, 0, 0, 0.4)',
    flex: 1,
    textAlign: 'left',
    alignSelf: 'flex-end',
  },
  // 즐겨찾기 버튼 스타일
  bookmark: {
    flexDirection: 'row', // 아이콘과 텍스트를 가로로 배치
    alignItems: 'center', // 수직 중앙 정렬
  },
  // 즐겨찾기 텍스트 스타일
  bookmarkText: {
    marginLeft: 5, // 아이콘과의 간격
    fontSize: 14, // 텍스트 크기
    color: 'rgba(0, 0, 0, 0.4)', // 연한 검정색
  },
  // 스텝 스트 섹션 스타일
  steps: { 
    marginTop: 10 
  },
  // 개별 스텝 컨테이너 스타일
  stepContainer: { 
    
    marginBottom: 0 
  },
  
  step: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  
  stepTextContainer: { 
    flex: 1 
  },
  // 스텝 역 이름 스타일
  stepStation: { 
    fontSize: 14, 
    color: '#000' 
  },
  // 스텝 세부 정보 텍스트 스타일
  stepDetails: { 
    fontSize: 12, 
    color: 'rgba(0, 0, 0, 0.4)' 
  },
  // 점선 스타일 (스텝 사이 연결)
  line: {
    height: 50, // 점선 길이
    borderLeftWidth: 2, // 점선 께
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderStyle: 'dashed', // 점선 스타일
    marginLeft: 15,
  },
  // 그래프 컨테이너 스타일
  graphContainer: { 
    height: 36, 
    width: '100%',
    maxWidth: 328, // 그래프 너비 고정
    justifyContent: 'center', // 수직 중앙 정렬
    alignSelf: 'center',
    alignItems: 'center', // 수직 중앙 정렬
    position: 'relative', // 화면 가운데 정렬
  },
  // 그래프 스타일 (그래프 전체 영역)
  graph: { 
    flexDirection: 'row', // 가로 방향 배치
    alignItems: 'center', // 수직 중앙 정렬
    height: '100%',
    width: '100%', // 부모 컨테이너 높이에 맞춤
    
  },
  // 공통 원 스타일
  commonCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  // 스텝 원 스타일
  circle: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    marginRight: 10 
  },
  circleText: { 
    fontSize: 12, // 텍스트 크기
    color: 'rgba(0, 0, 0, 0.4)', // 스트 색상
    textAlign: 'center', // 텍스트 중앙 정렬
    //fontWeight: 'bold', // 텍스트 굵기
  },
  
   // 그래프 원 스타일
  graphCircle: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    position: 'absolute' // 그래프 상의 위치 조정
  },
  graphText: { 
    fontSize: 14, 
    color: 'rgba(0, 0, 0, 0.6)', 
    textAlign: 'center' 
  },
  graphLine: { 
    height: 20, 
    position: 'absolute' 
  },
  backSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // 왼쪽 정렬
    padding: 10, // 부 여백
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)', // 섹션 위쪽 구분선
    height: 50, // 정렬 섹션과 동일한 높이
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    width: '100%',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 10,
  },
  summaryText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.8)',
    fontWeight: '500',
  },
  arrowIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  lineInfo: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.4)',
    marginLeft: 8
  },
});

export default SearchResult;



  