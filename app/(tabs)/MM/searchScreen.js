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
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { removeFavoriteFromFirestore } from '../back/favoritesService';


const SearchScreen = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [recentRecords, setRecentRecords] = useState([]);
  const [favoriteStations, setFavoriteStations] = useState([]);

  useEffect(() => {
    loadRecentRecords();
  }, []);
  

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
        id: doc.data().station,
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
        };
        console.log("추가된 기록:", newRecord);
  
        setRecentRecords((prev) => {
          const isDuplicate = prev.some((item) => item.id === newRecord.id);
          if (isDuplicate) {
            console.log("중복 항목:", newRecord);
            Alert.alert("알림", "이미 최근 기록에 있습니다.");
            return prev; // 중복 방지
          }
          const updatedRecords = [newRecord, ...prev];
          console.log("업데이트된 기록:", updatedRecords); // 업데이트 확인
          return updatedRecords; // 상태 업데이트
        });
  
        // Firestore 중복 확인 및 저장
        const searchTextRef = collection(db, "searchText");
        const existingQuery = query(searchTextRef, where("searchtext", "==", newRecord.id));
        const existingSnapshot = await getDocs(existingQuery);
  
        if (existingSnapshot.empty) {
          // Firestore에 저장
          await addDoc(searchTextRef, { searchtext: newRecord.id });
          console.log("Firestore에 저장 완료:", newRecord.id);
        } else {
          console.log("이미 Firestore에 저장된 검색어입니다.");
        }
      }
    } catch (error) {
      console.error("검색 중 오류:", error.message);
      Alert.alert("오류", "검색 중 문제가 발생했습니다.");
    }
  };

  const loadRecentRecords = async () => {
    try {
      const searchTextRef = collection(db, "searchText");
      const querySnapshot = await getDocs(searchTextRef);
      const loadedRecords = querySnapshot.docs.map((doc) => ({
        id: doc.data().searchtext,
      }));
      setRecentRecords(loadedRecords);
      console.log("Firestore에서 검색 기록 불러오기 완료:", loadedRecords);
    } catch (error) {
      console.error("Firestore 데이터 불러오기 중 오류:", error.message);
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
      await handleSearch();
      clearSearchText();
      router.push({
        pathname: '/MM/main', // main.js로 이동
        params: { stationID: searchText.trim() }, // 검색된 stationID 전달
      });
    } catch (error) {
      console.error("Error during search and clear:", error);
    }
  };
  
  const removeStation = async (id) => {
    try {
      if (activeTab === 'recent') {
        // Firestore에서 해당 문서 찾기
        const searchTextRef = collection(db, "searchText");
        const q = query(searchTextRef, where("searchtext", "==", id)); // searchtext 필드가 id와 일치하는 문서 찾기
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          // 해당 문서를 Firestore에서 삭제
          const docId = querySnapshot.docs[0].id; // 첫 번째 문서 ID 가져오기
          const docRef = doc(db, "searchText", docId); // 문서 참조 생성
          await deleteDoc(docRef); // 문서 삭제
          console.log(`Firestore에서 문서 삭제 완료: ${docId}`);
        } else {
          console.log("해당 역이 Firestore에 없습니다.");
        }
  
        // 로컬 상태에서 항목 제거
        setRecentRecords((prev) => prev.filter((item) => item.id !== id));
      } else {
        // 즐겨찾기에서 특정 항목 제거
        setFavoriteStations((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Firestore에서 항목 삭제 중 오류:", error.message);
    }
  };

  const removeFromFavorites = async (id) => {
  try {
    await removeFavoriteFromFirestore(id); // id 기준으로 삭제
    setFavoriteStations((prev) => prev.filter((item) => item.id !== id)); // 로컬 상태 업데이트
    console.log(`즐겨찾기 ID '${id}' 삭제 완료`);
  } catch (error) {
    console.error("즐겨찾기 삭제 중 오류:", error.message);
  }
};

  const clearAllRecords = async () => {
    try {
      if (activeTab === 'recent') {
        // Firestore에서 검색 기록 삭제
        const searchTextRef = collection(db, "searchText");
        const querySnapshot = await getDocs(searchTextRef);
  
        // 각 문서를 개별적으로 삭제
        for (const doc of querySnapshot.docs) {
          await deleteDoc(doc.ref); // 문서 삭제
          console.log(`삭제된 문서 ID: ${doc.id}`);
        }
  
        console.log("Firestore에서 모든 검색 기록 삭제 완료");
  
        // 로컬 상태 비우기
        setRecentRecords([]);
      } else {
        console.log("즐겨찾기는 삭제하지 않습니다.");
      }
    } catch (error) {
      console.error("전체 삭제 중 오류:", error.message);
    }
  };

  const filteredRecords =
  activeTab === 'recent'
    ? recentRecords // 모든 기록 표시
    : favoriteStations; // 즐겨찾기는 기존 로직 유지

    const renderStationItem = ({ item }) => (
      <TouchableOpacity // 항목 전체를 터치 가능하게 설정
        style={styles.stationItem}
        onPress={() => {
          console.log(`Selected station: ${item.id}`); // 선택된 역 로그 출력 (디버깅용)
          router.push({
            pathname: '/MM/main', // main.js로 이동
            params: { stationID: item.id }, // 검색된 stationID 전달
          }) // 메인 화면으로 이동
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
          {/* 역 정보: ID만 표시 */}
          <Text style={styles.stationId}>{item.id}</Text>
        </View>
        <TouchableOpacity style={styles.deleteIcon} onPress={() => removeStation(item.id)}>
          <Image
            source={require('../../../assets/images/searchicon/X.png')}
            style={{ width: 16, height: 16 }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
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