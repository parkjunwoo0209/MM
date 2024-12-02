import React, { useState } from 'react';
import { Platform, StatusBar } from 'react-native'; // Platform과 StatusBar 임포트

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

// 타입별 색상 매핑
const stepColors = {
  승차: '#FFC000',
  환승: '#F7F7F7',
  하차: '#92D050',
};

// 타입별 테두리 색상 매핑
const stepBorderColors = {
  승차: '#FFFFFF',
  환승: 'rgba(0, 0, 0, 0.4)',
  하차: '#FFFFFF',
};

// 기본 색상 설정 (해딩 타입 없을 때 사용)
const defaultColor = 'transparent';

// PNG 아이콘 파일 import
const ArrowBackIcon = require('../../assets/images/searchicon/arrow_back.png');
const ExchangeIcon = require('../../assets/images/searchicon/exchange.png');
const EmptyStarIcon = require('../../assets/images/searchicon/emptystaricon.png');
  const StarIcon = require('../../assets/images/searchicon/staricon.png');
const ClearIcon = require('../../assets/images/searchicon/X.png');
const ArrowDropDownIcon = require('../../assets/images/searchicon/arrow_drop_down.png');

// 목 데이터1
const initialMockData = [
  {
    id: '1',
    time: '14분', // 전체 소요 시간
    cost: '1250원', // 비용
    transfers: 1, // 환승 횟수
    isFavorite: false, // 즐겨찾기 여부
    steps: [
      { type: '승차', station: '620', details: '3개 역 이동 | 8분 소요', duration: 8 },
      { type: '환승', station: '601', details: '2개 역 이동 | 6분 소요', duration: 6 },
      { type: '하차', station: '303', details: '', duration: 0 },
    ],
  },
];

const SearchResult = () => {
  // 출발역, 도착역 상태
  const [departureStation, setDepartureStation] = useState('');
  const [arrivalStation, setArrivalStation] = useState('');
  // 정렬 옵션, 모달 상태
  const [sortOption, setSortOption] = useState('최소 시간순');
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  // 데이터 상태, 즐겨찾기 여부
  const [mockData, setMockData] = useState(initialMockData);
  const [isSearchFavorite, setIsSearchFavorite] = useState(false);

  // 출발역 <-> 도착역 교환
  const exchangeStations = () => {
    const temp = departureStation;
    setDepartureStation(arrivalStation);
    setArrivalStation(temp);
  };

  //즐겨찾기 토글
  const toggleFavorite = (id) => {
    setMockData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
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

    if (option === '최소 시간순') {
      // 시간순 정렬
      setMockData((prevData) =>
        [...prevData].sort(
          (a, b) => parseInt(a.time.replace('분', '')) - parseInt(b.time.replace('분', ''))
        )
      );
    } else if (option === '최소 비용순') {
      // 비용순 정렬
      setMockData((prevData) =>
        [...prevData].sort(
          (a, b) => parseInt(a.cost.replace('원', '')) - parseInt(b.cost.replace('원', ''))
        )
      );
    }
    closeSortModal();
  };

  // 그래프 렌더링
  const renderGraph = (steps) => {
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let cumulativeWidth = 0; // 누적 너비 추적
    const graphWidth = 348; // 그래프 전체 너비 고정

    return (
      <View style={styles.graphContainer}>
        <View style={styles.graph}>
          {steps.map((step, index) => {
            const segmentWidth = (step.duration / totalDuration) * graphWidth; // 구간 비율에 따른 너비 계산
            const circlePosition = cumulativeWidth; // 써클 시작 위치
            cumulativeWidth += segmentWidth; // 누적 너비 업데이트

            // 다음 구간의 상태 확인
          const nextStep = steps[index + 1];
          


            const color = stepColors[step.type] || defaultColor; // 동적 배경색
            const borderColor = stepBorderColors[step.type] || defaultColor; // 동적 테두리 색상
            // 선 색상: 다음 구간이 '하차'라면 하차 색상 적용, 아니면 현재 구간 색상 적용
            const lineColor =
            nextStep?.type === '하차' ? stepColors['하차'] : stepColors[step.type];



            return (
              <React.Fragment key={index}>
                {/* 선 렌더링 */}
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.graphLine,
                      { width: segmentWidth, backgroundColor: lineColor, left: circlePosition },
                    ]}
                  />
                )}
                {/* 써클 렌더링*/}
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

  // 결과 카드 렌더링
  const renderResult = ({ item }) => (
    <View style={styles.resultCard}>
      <View style={styles.header}>
        {/* 소요 시간, 환승 정보 */}
        <View style={styles.timeContainer}>
          <Text style={styles.label}>소요시간</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.details}>
          환승 {item.transfers}번 | {item.cost}
        </Text>

        {/* 즐겨찾기 버튼*/}
        <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.bookmark}>
          {item.isFavorite ? (
            <Image source={StarIcon} style={styles.icon} />
          ) : (
            <Image source={EmptyStarIcon} style={styles.icon} />
          )}
          <Text style={styles.bookmarkText}>즐겨찾기</Text>
        </TouchableOpacity>
      </View>
      {/* 그래프 렌더링*/}
      {renderGraph(item.steps)}
      {/* 스텝 리스트 렌더링*/}
      <View style={styles.steps}>
        {item.steps.map((step, index) => {
          const color = stepColors[step.type] || defaultColor; // 동적 배경색
          const borderColor = stepBorderColors[step.type] || defaultColor; // 동적 테두리 배경색

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
                  <Text style={styles.stepStation}>
                    {step.station} {step.type}
                  </Text>
                  {step.details ? <Text style={styles.stepDetails}>{step.details}</Text> : null}
                </View>
              </View>
              {index < item.steps.length - 1 && <View style={styles.line} />}
            </View>
          );
        })}
      </View>
      <TouchableOpacity style={styles.backButton} onPress={router.back}>
        <Image
          source={require('../../../assets/images/mainicon/뒤로가기.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.iconContainer}>
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
              style={styles.icon}
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
        visible= {isSortModalVisible}
        transparent
        animationType="slide" //애니메이션 효과
        onRequestClose={closeSortModal} // 뒤로가기 버튼 시 닫기
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={['최소 시간순', '최소 비용순']}
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

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, // 화며 전체 차지
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
    flexDirection: 'row', // 가로 방향 배치
    alignItems: 'center', // 수직 중앙 정렬
    justifyContent: 'center', // 가로 중앙 정렬
    marginBottom: 10, // 아래쪽 여백
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
    alignItems: 'center', // 내부 요소 수직 중앙 정렬
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
    alignItems: 'center', // 수평 중앙 정렬
    marginHorizontal: 10, // 좌우 간격 추가
  },
  // 아이콘 스타일
  icon: { 
    width: 20, 
    height: 20, 
    resizeMode: 'contain' // 아이콘 비율 유지하며 맞춤
  },
  // 정렬 섹션
  sortSection: {
    flexDirection: 'row', // 가로 방향 배치
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
    width: '80%', // 화면 너비 80%
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
    marginTop: 10, // 상단 여백
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
    justifyContent: 'space-between', // 양쪽 정렬
    alignItems: 'center', // 수직 중앙 정렬
    marginBottom: 10,
  },
  // 소요 시간 컨테이너
  timeContainer: { 
    flexDirection: 'column', 
    alignItems: 'flex-start', //왼쪽 정렬
    justifyContent: 'center',
    marginRight: 20, // "14분"과 환승 정보 사이 간격 설정
  },
  // 소요 시간 텍스트 스타일
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
  // 스텝 리스트 섹션 스타일
  steps: { 
    marginTop: 10 
  },
  // 개별 스텝 컨테이너 스타일
  stepContainer: { 
    
    marginBottom: 0 
  },
  // 개별 스텝 스타일
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
    borderLeftWidth: 2, // 점선 두께
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderStyle: 'dashed', // 점선 스타일
    marginLeft: 15,
  },
  // 그래프 컨테이너 스타일
  graphContainer: { 
    height: 36, 
    width: '100%',
    maxWidth: 348, // 그래프 너비 고정
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
    color: 'rgba(0, 0, 0, 0.4)', // 텍스트 색상
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
});

export default SearchResult;



  