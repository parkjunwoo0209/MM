import React, { useState, useCallback, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { stationCoordinates } from './location';
import {useRouter} from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const SubwayMap = ({ 
  popupPosition, 
  popupVisible, 
  setPopupVisible, 
  setPopupPosition
}) => {
  const [favorites, setFavorites] = useState([]); // 즐겨찾기 상태
  const [selectedStations, setSelectedStations] = useState({ departure: null, arrival: null });
  const router = useRouter();

  // Firestore에서 즐겨찾기 데이터를 가져오는 함수 추가
  const fetchFavorites = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.log("로그인된 사용자가 없습니다.");
        return;
      }

      const favoritesCollection = collection(db, "favorites");
      const q = query(favoritesCollection, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      const favoriteStations = querySnapshot.docs.map(doc => doc.data().station);
      setFavorites(favoriteStations);
    } catch (error) {
      console.error("즐겨찾기 불러오기 실패:", error);
    }
  };

  // 컴포넌트가 마운트되거나 포커스될 때 즐겨찾기 데이터 가져오기
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
      setSelectedStations({ departure: null, arrival: null });
    }, [])
  );

  const handleStationPress = (stationId, top, left) => {
    console.log(`Station ${stationId} pressed at position (${top}, ${left})`);
    setPopupVisible(true);
    setPopupPosition({ top, left, station: stationId });
  };

  const handlePopupOption = (type) => {
    if (type === '출발') {
      console.log(`${popupPosition.station} ${type}로 설정됨`);
      setSelectedStations((prev) => {
        const newState = { ...prev, departure: popupPosition.station };
        if (newState.departure && newState.arrival) {
          router.push('/MM/searchScreen');
        }
        return newState;
      });
    } else if (type === '도착') {
      console.log(`${popupPosition.station} ${type}로 설정됨`);
      setSelectedStations((prev) => {
        const newState = { ...prev, arrival: popupPosition.station };
        if (newState.departure && prev.departure) {
          router.push('/MM/searchScreen');
        }
        return newState;
      });
    } else if (type === '즐겨찾기') {
      setFavorites((prev) => {
        if (prev.includes(popupPosition.station)) {
          console.log(`${popupPosition.station}이(가) 즐겨찾기에서 제거됨`);
          return prev.filter((fav) => fav !== popupPosition.station);
        } else {
          console.log(`${popupPosition.station}이(가) 즐겨찾기에 추가됨`);
          return [...prev, popupPosition.station];
        }
      });
    }
    setPopupVisible(false);
  };

  const handleOutsidePress = () => {
    if (popupVisible) {
      setPopupVisible(false);
    }
  };

  const handleFavorite = async (type) => {
    if (type === "즐겨찾기") {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
  
        if (!user) {
          console.error("로그인된 사용자가 없습니다.");
          return;
        }
  
        const userId = user.uid;
        const favoritesCollection = collection(db, "favorites");
        const station = popupPosition.station;
  
        const q = query(
          favoritesCollection,
          where("userId", "==", userId),
          where("station", "==", station)
        );
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          // 즐겨찾기 제거
          querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(doc(db, "favorites", docSnapshot.id));
          });
          setFavorites(prev => prev.filter(fav => fav !== station));
          console.log(`${station}이(가) 즐겨찾기에서 제거됨`);
        } else {
          // 즐겨찾기 추가
          await addDoc(favoritesCollection, {
            station: station,
            userId: userId,
          });
          setFavorites(prev => [...prev, station]);
          console.log(`${station}이(가) 즐겨찾기에 추가됨`);
        }
      } catch (error) {
        console.error("즐겨찾기 처리 중 오류:", error.message);
      }
    }
    setPopupVisible(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
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
        onPress={() => handleFavorite('즐겨찾기')}
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