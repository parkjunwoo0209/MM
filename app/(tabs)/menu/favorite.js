import React, { useState, useEffect } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

export default function BookMark() {
  const router = useRouter();
  const [data, setData] = useState([]);

  const fetchData = async () => {
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

      setData(favoritesData);
    } catch (error) {
      console.error("즐겨찾기 데이터 로드 중 오류:", error.message);
    }
  };

  // 컴포넌트가 포커스를 받을 때마다 데이터를 새로 불러옴
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  // 즐겨찾기 삭제
  const handleRemoveItem = async (id) => {
    try {
      await deleteDoc(doc(db, "favorites", id)); // 문서 ID를 기반으로 삭제
      setData((prevData) => prevData.filter((item) => item.id !== id)); // 로컬 상태에서 데이터 제거
    } catch (error) {
      console.error("즐겨찾기 삭제 중 오류:", error.message);
    }
  };


  // 각 리스트 항목 렌더링
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {/* 아이콘 */}
      <Image
        source={require("../../../assets/images/menuicon/location_on.png")}
        style={styles.icon}
      />
      {/* 라벨 */}
      <Text style={styles.label}>{item.station}</Text>
      {/* 즐겨찾기 삭제 버튼 */}
      <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={{ padding: 10 }}>
        <Image
          source={require("../../../assets/images/menuicon/star_filled.png")}
          style={styles.bookmarkIcon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 상단 여백 */}
      <View style={styles.topSpace} />

      {/* 상단 배너 */}
      <View style={styles.banner}>
        <Image
          source={require("../../../assets/images/mainicon/즐겨찾기 아이콘.png")}
          style={styles.bannerIcon}
        />
        <Text style={styles.bannerText}>즐겨찾기</Text>
      </View>

      {/* 리스트 */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>즐겨찾기가 없습니다.</Text>}
      />

      {/* 왼쪽 하단 뒤로가기 아이콘 */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image
          source={require("../../../assets/images/mainicon/뒤로가기.png")}
          style={styles.backIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  topSpace: {
    height: 65, // 상단 여백
    backgroundColor: "#F8F8F8",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#87CEEB", // 상단 배너 배경색
    paddingVertical: 20,
    paddingLeft: 15,
  },
  bannerIcon: {
    width: 45,
    height: 45,
    marginRight: 15,
  },
  bannerText: {
    fontSize: 26,
    color: "white",
    fontWeight: "bold",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  label: {
    flex: 1,
    fontSize: 22,
    color: "#333",
  },
  bookmarkIcon: {
    width: 40,
    height: 40,
  },
  backButton: {
    position: "absolute",
    bottom: 15, // 하단 여백
    left: 15, // 왼쪽 여백
    padding: 10,
    borderRadius: 30, // 버튼 둥글게 유지
    backgroundColor: "transparent", // 배경색 제거
    shadowColor: "transparent", // 그림자 제거
    elevation: 0, // 안드로이드 그림자 제거
  },
  backIcon: {
    width: 40, // 뒤로가기 아이콘 크기
    height: 40,
    tintColor: "#87CEEB", // 아이콘 색상 유지
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
