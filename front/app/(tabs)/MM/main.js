import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import SubwayMap from './SubwayMap';
import { stationCoordinates } from './location';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from "@/app/api/apiClient";
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../hooks/ThemeContext';
const { width } = Dimensions.get('window'); // 화면 너비를 가져옴

const MainScreen = () => {
  const router = useRouter();
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current; // 초기 위치를 화면 왼쪽으로 설정
  const [selectedStation, setSelectedStation] = useState(null);
  const { stationID } = useLocalSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [searchResults, setSearchResults] = useState(null);  // 검색 결과 저장을 위한 상태 추가

  // stationCoordinates의 키를 배열로 변환
  const stationIds = Object.keys(stationCoordinates);

  useEffect(() => {
    if (stationID && stationCoordinates[stationID]) {
      const { top, left } = stationCoordinates[stationID];
      setPopupPosition({ top, left, station: stationID });
      setPopupVisible(true);
    }
  }, [stationID]);

  // 로그인 상태 확인 함수
  const checkLoginStatus = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        setIsLoggedIn(true);
        setUserEmail(email);
      } else {
        setIsLoggedIn(false);
        setUserEmail(null);
      }
    } catch (error) {
      console.error("로그인 상태 확인 중 오류:", error);
    }
  };

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userEmail');
      setIsLoggedIn(false);
      setUserEmail(null);
      closeMenu();
      Alert.alert('알림', '로그아웃되었습니다.');
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
    }
  };

  // 컴포넌트가 마운트되거나 포커스를 받을 때 로그인 상태 확인
  useFocusEffect(
    React.useCallback(() => {
      checkLoginStatus();
    }, [])
  );

  const openMenu = () => {
    setIsModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0, // 화면 내 위치
      duration: 300, // 애니메이션 시간 (ms)
      useNativeDriver: true, // 네이티브 드라이버 사용
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -width, // 화면 밖으로 이동
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  const handleMenuNavigation = (route) => {
    closeMenu(); // 메뉴를 닫고
    router.push(`/menu/${route}`); // 해당 경로로 이동
  };

  const handleSearch = () => {
    if (stationIds.includes(searchText)) {
      const coordinates = stationCoordinates[searchText];
      if (coordinates) {
        setPopupPosition({
          top: coordinates.top,
          left: coordinates.left,
          station: searchText
        });
        setPopupVisible(true);
      } else {
        alert('해당 역의 좌표를 찾을 수 없습니다.');
      }
    } else {
      alert('찾으시는 역이 없습니다.');
    }
    setSearchText('');
  };

  // 검색 아이콘 클릭 핸들러 수정
  const handleSearchIconClick = async () => {
    try {
      // AsyncStorage에서 마지막 검로 검색 결과 가져오기
      const lastRouteResult = await AsyncStorage.getItem('lastRouteResult');
      
      if (lastRouteResult) {
        // 저장된 경로 검색 결과가 있으면 searchResult 화면으로 이동하며 데이터 전달
        router.push({
          pathname: '/MM/searchResult',
          params: { routeData: lastRouteResult }
        });
      } else {
        // 저장된 검색 결과가 없으면 빈 검색 결과 화면으로 이동
        router.push('/MM/searchResult');
      }
    } catch (error) {
      console.error('Error fetching last route result:', error);
      router.push('/MM/searchResult');
    }
  };

  // 검색 결과를 저장하는 함수
  const saveSearchResults = (results) => {
    setSearchResults(results);
  };

  return (
    <View style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* 상단 검색 바 */}
          <View style={styles.searchBar}>
            <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
              <Image
                source={require('../../../assets/images/mainicon/Leading-icon.png')}
                style={styles.menuIcon}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="역명 검색 · 즐겨찾기"
              placeholderTextColor="#999"
              keyboardType="default"
              onSubmitEditing={handleSearch}
              onPress={() => router.push({
                pathname: '/MM/searchScreen',
                params: { onSearchComplete: saveSearchResults }
              })}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Image
                source={require('../../../assets/images/mainicon/Trailing-Elements.png')}
                style={styles.searchIcon}
              />
            </TouchableOpacity>
          </View>

          {/* 중앙 지하철 이미지 */}
          <ReactNativeZoomableView style={styles.mapContainer}>
            <SubwayMap
              popupPosition={popupPosition}
              popupVisible={popupVisible}
              setPopupVisible={setPopupVisible}
              setPopupPosition={setPopupPosition}
              selectedStation={selectedStation}
            />
          </ReactNativeZoomableView>

          {/* 검색 아이콘 */}
          <TouchableOpacity
            style={styles.searchIconContainer}
            onPress={handleSearchIconClick}
          >
            <Image
              source={require('../../../assets/images/mainicon/search.png')}
              style={styles.floatingSearchIcon}
            />
          </TouchableOpacity>

          {/* 하단 광고 배너 */}
          <View style={styles.bannerContainer}>
            <Image
              source={require('../../../assets/images/mainicon/광고사진.png')}
              style={styles.bannerImage}
            />
          </View>
        </View>

        {/* 좌측 슬라이드 메뉴 */}
        {isModalVisible && (
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <Animated.View
                  style={[
                    styles.modalMenu,
                    { transform: [{ translateX: slideAnim }] },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <Image
                      source={require('../../../assets/images/mainicon/KakaoTalk_20241113_171601246.png')}
                      style={styles.modalLogo}
                    />
                  </View>
                  <View style={styles.modalItems}>
                    {!isLoggedIn ? (
                      // 로그인하지 않은 경우
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleMenuNavigation('login')}
                      >
                        <Image
                          source={require('../../../assets/images/mainicon/로그인 아이콘.png')}
                          style={styles.icon}
                        />
                        <Text style={styles.menuText}>로그인</Text>
                      </TouchableOpacity>
                    ) : (
                      // 로그인한 경우
                      <>
                        <View style={styles.userInfo}>
                          <Text style={styles.emailText}>{userEmail}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={handleLogout}
                        >
                          <Text style={styles.menuText}>로그아웃</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMenuNavigation('favorite')}
                    >
                      <Image
                        source={require('../../../assets/images/mainicon/즐겨찾기 아이콘.png')}
                        style={styles.icon}
                      />
                      <Text style={styles.menuText}>즐겨찾기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMenuNavigation('terms')}
                    >
                     <Image
                        source={require('../../../assets/images/mainicon/이용약관 아이콘.png')}
                        style={styles.icon}
                        /> 
                      <Text style={styles.menuText}>이용약관</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleMenuNavigation('settings')}
                    >
                      <Image
                        source={require('../../../assets/images/mainicon/설정 아이콘.png')}
                        style={styles.icon}
                        />
                      <Text style={styles.menuText}>설정</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                    <Text style={styles.closeButtonText}>←</Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE6F0',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
    paddingHorizontal: 10,
  },
  menuButton: {
    marginRight: 10,
  },
  menuIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    paddingVertical: 8,
  },
  mapContainer: {
    flex: 1,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  modalMenu: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '80%',
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    paddingVertical: 20,
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20, // 상태바 침범 방지
  },
  modalHeader: {
    width: '100%', // 가로를 화면에 가득차게 설정
    height: 100, // 높이를 고정하여 디자인에 맞춤
    backgroundColor: '#4FBFE5', // 배경색
    flexDirection: 'row', // 로고와 텍스트를 같은 행에 배치
    alignItems: 'center', // 세로 중앙 정렬
    paddingLeft: 10, // 왼쪽 여백 추가
  },
  modalLogo: {
    width: 100, // 로고 크기
    height: 100,
    resizeMode: 'contain', // 이미지 비율 지
  },
  modalItems: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  menuText:{
    fontSize: 18,
    color: '#333333',
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 10,
  },
  closeButtonText: {
    color: '#4FBFE5',
    fontSize: 40,
  },
  searchIconContainer: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 10,
    zIndex: 1,
  },
  floatingSearchIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 20,
  },
  overlay: {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
  zIndex: 999, 
  }
});

export default MainScreen;