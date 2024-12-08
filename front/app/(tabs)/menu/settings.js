import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Switch, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';  

const Option = () => {
  const router = useRouter();
  const [isBoldText, setIsBoldText] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      {/* 상단 여백 */}
      <View style={styles.topSpace} />

      {/* 상단 배너 */}
      <View style={styles.banner}>
        <Image source={require("../../../assets/images/mainicon/설정 아이콘.png")} style={styles.icon} />
        <Text style={styles.bannerText}>설정</Text>
      </View>

      {/* 옵션 내용 */}
      <View style={styles.options}>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>볼드체 텍스트</Text>
          <Switch
            value={isBoldText}
            onValueChange={() => setIsBoldText((previousState) => !previousState)}
            thumbColor={isBoldText ? "#87CEEB" : "#f4f3f4"}
            trackColor={{ false: "#767577", true: "#87CEEB" }}
          />
        </View>
        <View style={styles.optionItem}>
          <Text style={styles.optionText}>다크 모드</Text>
          <Switch
            value={isDarkMode}
            onValueChange={() => setIsDarkMode((previousState) => !previousState)}
            thumbColor={isDarkMode ? "#87CEEB" : "#f4f3f4"}
            trackColor={{ false: "#767577", true: "#87CEEB" }}
          />
        </View>
      </View>

      {/* 뒤로가기 버튼 */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image source={require("../../../assets/images/mainicon/뒤로가기.png")} style={styles.backIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topSpace: {
    height: 65, // 상단 여백 크기 설정 (필요에 따라 조정)
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#87CEEB",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  bannerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  options: {
    paddingHorizontal: 35,
    marginTop: 30,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  optionText: {
    fontSize: 30,
    color: "#333333",
  },
  backButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  backIcon: {
    width: 40,
    height: 40,
    tintColor: "#87CEEB",
  },
});

export default Option;