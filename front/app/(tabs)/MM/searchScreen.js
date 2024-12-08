import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../api/apiClient';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../hooks/ThemeContext';

const SearchScreen = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [recentRecords, setRecentRecords] = useState([]);
  const [favoriteStations, setFavoriteStations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadRecentRecords();
  }, []);
  

  const fetchFavoriteStations = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      
      if (!userEmail) {
        console.error("로그인된 사용자가 없습니다.");
        return;
      }

      const response = await apiClient.get(`/api/favorites/${userEmail}`);
      const favoritesData = response.data.map(item => ({
        id: item.favoriteText, // 역 ID를 고유 식별자로 사용
        station: item.favoriteText // 역 이름으로 표시
      }));

      setFavoriteStations(favoritesData);
    } catch (error) {
      console.error("즐겨찾기 데이터 로드 중 오류:", error.message);
    }
  };

 useEffect(() => {
    fetchFavoriteStations();
  }, []);

  const handleSearch = async () => {
    try {
      if (!searchText.trim()) {
        Alert.alert("경고", "검색어를 입력해주세요.");
        return;
      }

      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) {
        Alert.alert("알림", "로그인이 필요합니다.");
        return;
      }

      // 역 검색 및 최근 검색어 저장
      try {
        // 최근 검색어 저장
        await apiClient.post("/api/recent-searches", {
          email: userEmail,
          stationName: searchText.trim()
        });
        
        // 검로 검색 결과 저장 (새로 추가)
        const response = await apiClient.get(`/routes/search?start=${searchText.trim()}`);
        const routeData = response.data;
        setSearchResults(routeData);

        // 검색어 초기화
        clearSearchText();
        
        // 최근 검색어 목록 새로고침
        loadRecentRecords();

        // 메인 화면으로 이동
        router.push({
          pathname: '/MM/main',
          params: { stationID: searchText.trim() },
        });
      } catch (error) {
        if (error.response?.status === 404) {
          Alert.alert("알림", "찾으시는 역이 없습니다.");
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("검색 중 오류:", error.message);
      Alert.alert("오류", "검색 중 문제가 발생했습니다.");
    }
  };

  const loadRecentRecords = async () => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) return;

      console.log('API 요청 시작:', `/api/recent-searches/${userEmail}`);

      const response = await apiClient.get(`/api/recent-searches/${userEmail}`);
      console.log('API 응답:', response.data);

      setRecentRecords(response.data.map(item => ({
        id: item.id,           // 문서 ID (삭제할 때 필요)
        station: item.searchtext  // 화면에 표시할 역 이름
      })));
    } catch (error) {
      console.error("최근 검색어 로드 중 오류:", error.response || error);
    }
  };
  

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  const clearSearchText = () => {
    setSearchText('');
  };

  const handleSearchAndClear = async () => {
    try {
      if (!searchText.trim()) {
        Alert.alert("경고", "검색어를 입력해주세요.");
        return;
      }

      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) {
        Alert.alert("알림", "로그인이 필요합니다.");
        return;
      }

      try {
        // 역 검색 및 최근 검색어 저장
        await apiClient.post("/api/recent-searches", {
          email: userEmail,
          stationName: searchText.trim()
        });

        // 경로 검색 결과를 AsyncStorage에 저장
        const routeResponse = await apiClient.get(`/routes/search?start=${departureStation}&end=${arrivalStation}`);
        await AsyncStorage.setItem('lastRouteResult', JSON.stringify(routeResponse.data));
        
        // 검색어 초기화
        clearSearchText();
        
        // 메인 화면으로 이동
        router.push({
          pathname: '/MM/main',
          params: { stationID: searchText.trim() }
        });
      } catch (error) {
        if (error.response?.status === 404) {
          Alert.alert("알림", "찾으시는 역이 없습니다.");
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error during search and clear:", error);
      Alert.alert("오류", "검색 중 문제가 발생했습니다.");
    }
  };
  
  const removeStation = async (id) => {
    try {
      if (activeTab === 'recent') {
        const userEmail = await AsyncStorage.getItem('userEmail');
        if (!userEmail) {
          Alert.alert("알림", "로그인이 필요합니다.");
          return;
        }

        // API를 통해 최근 검색어 삭제
        await apiClient.delete(`/api/recent-searches/${userEmail}/${id}`);
        
        // 로컬 상태에서 항목 제거
        setRecentRecords((prev) => prev.filter((item) => item.id !== id));
        console.log(`검색 기록 '${id}' 삭제 완료`);
      } else {
        // 즐겨찾기 삭제는 기존 함수 사용
        await removeFromFavorites(id);
      }
    } catch (error) {
      console.error("항목 삭제 중 오류:", error.message);
      Alert.alert("오류", "항목 삭제 중 문제가 발생했습니다.");
    }
  };

  const removeFromFavorites = async (id) => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail) {
        Alert.alert("알림", "로그인이 필요합니다.");
        return;
      }

      // API를 통해 즐겨찾기 삭제
      await apiClient.post("/api/favorites/remove", {
        email: userEmail,
        favoriteText: id
      });

      // 로컬 상태 업데이트
      setFavoriteStations((prev) => prev.filter((item) => item.id !== id));
      console.log(`즐겨찾기 '${id}' 삭제 완료`);
    } catch (error) {
      console.error("즐겨찾기 삭제 중 오류:", error.message);
      Alert.alert("오류", "즐겨찾기 삭제 중 문제가 발생했습니다.");
    }
  };

  const clearAllRecords = async () => {
    try {
      if (activeTab === 'recent') {
        const userEmail = await AsyncStorage.getItem('userEmail');
        if (!userEmail) {
          Alert.alert("알림", "로그인이 필요합니다.");
          return;
        }

        // 현재 표시된 모든 최근 검색어를 순회���며 삭제
        for (const record of recentRecords) {
          await apiClient.delete(`/api/recent-searches/${userEmail}/${record.id}`);
        }

        // 로컬 상태 비우기
        setRecentRecords([]);
        console.log("모든 검색 기록 삭제 완료");
      } else {
        console.log("즐겨찾기는 삭제하지 않습니다.");
      }
    } catch (error) {
      console.error("전체 삭제 중 오류:", error.message);
      Alert.alert("오류", "전체 삭제 중 문제가 발생했습니다.");
    }
  };

  const filteredRecords =
  activeTab === 'recent'
    ? recentRecords // 모든 기록 표시
    : favoriteStations; // 즐겨찾기는 기존 로직 유지

    const renderStationItem = ({ item }) => (
      <TouchableOpacity
        style={styles.stationItem}
        onPress={async () => {
          console.log(`Selected station: ${item.station}`);
          try {
            // 경로 검색 API 호출
            const response = await apiClient.get(`/routes/search?start=${item.station}`);
            const routeData = response.data;
            
            // 검색 결과를 AsyncStorage에 저장
            await AsyncStorage.setItem('lastSearchResult', JSON.stringify(routeData));
            
            // 메인 화면으로 이동
            router.push({
              pathname: '/MM/main',
              params: { stationID: item.station }
            });
          } catch (error) {
            console.error('Error during route search:', error);
            Alert.alert('오류', '경로 검색에 실패했습니다.');
          }
        }}
      >
        <View style={styles.stationInfo}>
          {activeTab === 'recent' ? (
            <Image
              source={require('../../../assets/images/searchicon/location_on.png')}
              style={styles.icon}
            />
          ) : (
            <TouchableOpacity onPress={() => removeFromFavorites(item.id)}>
              <Image
                source={require('../../../assets/images/searchicon/staricon.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
          )}
          <Text style={styles.stationId}>{item.station}</Text>
        </View>
        <TouchableOpacity style={styles.deleteIcon} onPress={() => removeStation(item.id)}>
          <Image
            source={require('../../../assets/images/searchicon/X.png')}
            style={{ width: 16, height: 16 }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );

  // useFocusEffect를 사용하여 화면이 포커스를 받을 때마다 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadRecentRecords();
      fetchFavoriteStations();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="지하철 역 검색"
          value={searchText}
          onChangeText={handleSearchChange}
        />
        <TouchableOpacity style={styles.clearButton} onPress={clearSearchText}>
          <Text style={styles.clearButtonText}>X</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchAndClear}>
        <Image
            source={require('../../../assets/images/mainicon/Trailing-Elements.png')} // 이미지 경로
            style={styles.searchButtonImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('recent')}
          style={styles.tabSection}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'recent' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)',
              },
            ]}
          >
            최근 기록
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('favorites')}
          style={styles.tabSection}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'favorites' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)',
              },
            ]}
          >
            즐겨찾기
          </Text>
        </TouchableOpacity>
      </View>

      <Image
        source={require('../../../assets/images/searchicon/div2.png')}
        style={[styles.banner, { width: 402, height: 52 }]}
        resizeMode="cover"
      />

      <TouchableOpacity style={styles.textClearButton} onPress={clearAllRecords}>
        <Text style={styles.textClearButtonText}>전체삭제</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <FlatList
        data={filteredRecords}
        renderItem={renderStationItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <TouchableOpacity style={styles.backButton} onPress={router.back} >
        <Image
          source={require('../../../assets/images/mainicon/뒤로가기.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
    backgroundColor: '#fff',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'transparent',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  tabContainer: {
    flexDirection: 'row',
    height: 50,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  banner: {
    alignSelf: 'center',
    width: '100%',
    height: 52,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  textClearButton: {
    alignItems: 'flex-end',
    marginBottom: 5,
    marginRight: 5,
  },
  textClearButtonText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  list: {
    flex: 1,
  },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  stationCode: {
    marginRight: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  stationName: {
    fontSize: 12,
    color: '#000',
  },
  deleteIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: '#f1f1f1',
  },
  searchButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  searchButtonImage: {
    width: 30, // 이미지의 너비
    height: 30, // 이미지의 높이
    resizeMode: 'contain', // 이미지 크기 조절
    backgroundColor: '#fff',
  },
});
export default SearchScreen;