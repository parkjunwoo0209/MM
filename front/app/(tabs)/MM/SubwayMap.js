import React, { useState, useCallback, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, Alert } from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { stationCoordinates } from './location';
import {useRouter} from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '@/app/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubwayMap = ({ 
  popupPosition, 
  popupVisible, 
  setPopupVisible, 
  setPopupPosition
}) => {
  const [favorites, setFavorites] = useState([]);
  const [selectedStations, setSelectedStations] = useState({ departure: null, arrival: null });
  const router = useRouter();

  const handleStationPress = (stationId, top, left) => {
    console.log(`Station ${stationId} pressed at position (${top}, ${left})`);
    setPopupVisible(true);
    setPopupPosition({ top, left, station: stationId });
  };

  // 팝업 함수
  const handlePopupOption = async (type) => {
    if (type === '출발') {
      setSelectedStations((prev) => {
        const newState = { ...prev, departure: popupPosition.station };
        console.log(newState);
        console.log(newState.departure);
        console.log(newState.arrival);
        if (newState.departure && newState.arrival) {
          // API 호출로 사용 기록 업데이트
          result = apiClient.post("/routes/updateUsageHistory", {
            userId: user.uid,
            startStation: newState.departure,
            endStation: newState.arrival,
          })
            .then(() => console.log("사용 기록 업데이트 완료"))
            .catch((error) => console.error("출발 업데이트 실패:", error.message));

          router.push('/MM/searchResult');
        }else {
          console.log("출발역과 도착역이 선택되지 않았습니다.");
        }
        return newState;
      });
    } else if (type === '도착') {
      setSelectedStations(async (prev) => {
        const newState = { ...prev, arrival: popupPosition.station };
        console.log(newState);
        console.log(newState.departure);
        console.log(newState.arrival);
        console.log(user.uid, "유저아이디");
        if (newState.departure && newState.arrival) {
          try {
            result = await apiClient.post("/routes/updateUsageHistory", {
              userId: user.uid,
              startStation: newState.departure,
              endStation: newState.arrival,
            });
            console.log(result, "결과있는지 확인");
            console.log("도착 업데이트 완료");
            router.push('/MM/searchResult');
          } catch (error) {
            console.error("도착 업데이트 실패:", result.error.message);
          }
        }else {
          console.log("출발역과 도착역이 선택되지 않았습니다.");
        }
        return newState;
      });
    } else if (type === '즐겨찾기') {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');

        if (!userEmail) {
          Alert.alert('오류', '로그인이 필요한 서비스입니다.');
          router.push('/menu/login');
          return;
        }

        const stationId = popupPosition.station;

        if (favorites.includes(stationId)) {
          // 즐겨찾기 제거
          await apiClient.post("/api/favorites/remove", {
            email: userEmail,
            favoriteText: stationId
          });
          setFavorites(prev => prev.filter(fav => fav !== stationId));
        } else {
          // 즐겨찾기 추가
          await apiClient.post("/api/favorites/add", {
            email: userEmail,
            favoriteText: stationId
          });
          setFavorites(prev => [...prev, stationId]);
        }
      } catch (error) {
        console.error("즐겨찾기 처리 중 오류:", error);
        Alert.alert('오류', error.response?.data?.error || '즐겨찾기 처리 중 오류가 발생했습니다.');
      }
      setPopupVisible(false);
    }
  };

  // 즐겨찾기 목록 가져오기
  useFocusEffect(
    useCallback(() => {
      const fetchFavorites = async () => {
        try {
          const userEmail = await AsyncStorage.getItem('userEmail');
          if (userEmail) {
            const response = await apiClient.get(`/api/favorites/${userEmail}`);
            // favoriteText 필드의 값들을 favorites 상태로 설정
            setFavorites(response.data.map(item => item.favoriteText));
          }
        } catch (error) {
          console.error("즐겨찾기 불러오기 실패:", error);
        }
      };

      fetchFavorites();
    }, [])
  );

  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <ReactNativeZoomableView
          maxZoom={2}
          minZoom={0.3}
          zoomStep={0.5}
          initialZoom={1}
          bindToBorders={false}
          movementAreaWidth={1500}
          movementAreaHeight={1000}
          style={styles.mapContainer}
          visualTouchFeedback={false}
        >
          <View style={styles.mapWrapper}>
            <Image
              source={require('../../../assets/images/mainicon/지하철 노선도.png')}
            />
            {Object.entries(stationCoordinates).map(([stationId, coords]) => (
              <View
                key={stationId}
                style={[styles.station, { top: coords.top, left: coords.left }]}
                onStartShouldSetResponder={() => true}
                onResponderRelease={() => handleStationPress(stationId, coords.top, coords.left)}
              />
            ))}

{popupVisible && (
  <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
    <View style={[styles.popup, { top: popupPosition.top, left: popupPosition.left }]}>
      <TouchableOpacity style={styles.popupButton} onPress={() => handlePopupOption('출발')}>
        <Text style={styles.popupText}>출발</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.popupButton} onPress={() => handlePopupOption('도착')}>
        <Text style={styles.popupText}>도착</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.popupButton}
        onPress={() => handlePopupOption('즐겨찾기')}
      >
        <Image
          source={
            favorites.includes(popupPosition.station)
              ? require('../../../assets/images/menuicon/star_filled.png')
              : require('../../../assets/images/searchicon/emptystaricon.png')
          }
          style={styles.favoriteIcon}
        />
      </TouchableOpacity>
    </View>
  </TouchableWithoutFeedback>
)}

          </View>
        </ReactNativeZoomableView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  mapWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  station: {
    position: 'absolute',
    width: 35,
    height: 35,
    backgroundColor: 'rgba(0, 0, 255, 0.5)',
    borderRadius: 15,
  },
  popup: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 1,
  },
  popupText: {
    color: 'black',
    fontSize: 20,
    marginHorizontal: 5,
  },
  popupButton: {
    padding: 10,
  },
  favoriteIcon: {
    color: 'white',
  },  
});

export default SubwayMap;