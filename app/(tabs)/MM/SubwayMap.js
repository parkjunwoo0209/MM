import React, { useState, useCallback, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { stationCoordinates } from './location';
import {useRouter} from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const SubwayMap = ({ 
  popupPosition, 
  popupVisible, 
  setPopupVisible, 
  setPopupPosition
}) => {
  const [favorites, setFavorites] = useState([]); // 즐겨찾기 상태
  const [selectedStations, setSelectedStations] = useState({ departure: null, arrival: null });
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
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
        onPress={() => handlePopupOption('즐겨찾기')}
      >
        <Image
          source={
            favorites.includes(popupPosition.station)
              ? require('../../../assets/images/menuicon/star_filled.png') // 색이 들어있는 별
              : require('../../../assets/images/searchicon/emptystaricon.png') // 비어있는 별
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
