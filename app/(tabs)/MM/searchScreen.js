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
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { removeFavoriteFromFirestore } from '../back/favoritesService';
import { clearFavoritesFromFirestore } from '../back/favoritesService';


const SearchScreen = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [recentRecords, setRecentRecords] = useState([]);
  const [favoriteStations, setFavoriteStations] = useState([]);

  const fetchFavoriteStations = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("로그인된 사용자가 없습니다.");
        return;
      }

      const userId = user.uid;
      const favoritesCollection = collection(db, "favorites");
      const q = query(favoritesCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const favoritesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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
    
      const stationsCollectionRef = collection(db, "Stations");
      const querySnapshot = await getDocs(stationsCollectionRef);
      const matchingDoc = querySnapshot.docs.find((doc) => doc.id === searchText.trim());

      if (!matchingDoc) {
        Alert.alert("알림", "찾으시는 역이 없습니다.");
      } else {
        // 검색 결과가 있을 경우 최근 기록에 추가
        const newRecord = {
          id: matchingDoc.id,
          station: matchingDoc.data().station, // 역 이름 추가
          code: matchingDoc.data().code // 역 코드 추가
        };

        console.log(newRecord);

        setRecentRecords((prev) => {
  const isDuplicate = prev.some((item) => item.id === newRecord.id);
  if (isDuplicate) {
    console.log("중복 항목:", newRecord);
    return prev; // 중복 방지
    }
  const updatedRecords = [newRecord, ...prev];
   console.log("업데이트된 기록:", updatedRecords); // 업데이트 확인
  return updatedRecords; // 상태 업데이트
});
      }
    } catch (error) {
      console.error("검색 중 오류:", error.message);
      Alert.alert("오류", "검색 중 문제가 발생했습니다.");
    }
  };

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  const clearSearchText = () => {
    setSearchText('');
  };

  const removeStation = (id) => {
    if (activeTab === 'recent') {
      // 최근 기록에서 특정 항목 제거
      setRecentRecords((prev) => prev.filter((item) => item.id !== id));
    } else {
      // 즐겨찾기에서 특정 항목 제거
      setFavoriteStations((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const removeFromFavorites = async (id) => {
    try {
      await removeFavoriteFromFirestore(id); // Firestore에서 데이터 삭제
      setFavoriteStations((prev) => prev.filter((item) => item.id !== id)); // 로컬 상태 업데이트
    } catch (error) {
      console.error("즐겨찾기 해제 중 오류:", error.message);
    }
  };

  const clearAllRecords = async () => {
    try {
      if (activeTab === 'recent') {
        // 최근 기록 비우기
        setRecentRecords([]);
      } else {
        // 즐겨찾기 전체 삭제
        await clearFavoritesFromFirestore(); // Firestore에서 삭제
        setFavoriteStations([]); // 로컬 상태 비우기
      }
    } catch (error) {
      console.error("전체 삭제 중 오류:", error.message);
    }
  };

  const filteredRecords =
  activeTab === 'recent'
    ? recentRecords.filter((item) => item.id === searchText.trim()) // ID 정확히 일치
    : favoriteStations; // 즐겨찾기는 검색 조건 없이 전체 리스트 반환


    const renderStationItem = ({ item }) => (
      <View style={styles.stationItem}>
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
          {/* 역 정보: ID만 표시 */}
          <Text style={styles.stationId}>{item.id}</Text>
        </View>
        <TouchableOpacity style={styles.deleteIcon} onPress={() => removeStation(item.id)}>
          <Image
            source={require('../../../assets/images/searchicon/X.png')}
            style={{ width: 16, height: 16 }}
          />
        </TouchableOpacity>
      </View>
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
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
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