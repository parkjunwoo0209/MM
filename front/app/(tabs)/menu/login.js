import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import apiClient from "@/app/api/apiClient";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogin = async () => {
    try {
      console.log("로그인 시도:", { email, password }); // 디버깅용

      const response = await apiClient.post("/api/auth/login", {
        email: email,
        passwd: password
      });

      console.log("서버 응답:", response.data); // 디버깅용

      if (response.data.success) {
        await AsyncStorage.setItem('userEmail', email);
        Alert.alert("로그인 성공", `환영합니다, ${email}`);
        router.push("/MM/main");
      }
    } catch (error) {
      console.error("로그인 에러:", error.response?.data || error); // 디버깅용
      if (error.response?.status === 401) {
        Alert.alert('오류', '이메일 또는 비밀번호가 일치하지 않습니다.');
      } else {
        Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
      }
      setModalVisible(true);
    }
  };

  return (
    <>
      <View style={styles.container}>
        {/* Top Space */}
        <View style={styles.topSpace} />

        {/* Header */}
        <View style={styles.header}>
          <Image source={require("../../../assets/images/mainicon/로그인 아이콘.png")} style={styles.headerIcon} />
          <Text style={styles.headerText}>로그인</Text>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require("../../../assets/images/menuicon/directions_subway.png")} style={styles.logo} />
          <Text style={styles.logoText}>M.M.</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="이메일"
            style={styles.input}
            placeholderTextColor="#A9A9A9"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="비밀번호"
            secureTextEntry={true}
            style={styles.input}
            placeholderTextColor="#A9A9A9"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>

        {/* Signup Prompt */}
        <TouchableOpacity onPress={() => router.push("/menu/sinup")}>
          <Text style={styles.signupPrompt}>
            회원이 아니신가요? 지금 M.M 가입하러 가기
          </Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image source={require("../../../assets/images/mainicon/뒤로가기.png")} style={styles.backIcon} />
        </TouchableOpacity>
      </View>
      
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>계정이 없습니다</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  topSpace: {
    height: 65, // 상단 여백
  },
  header: {
    width: "100%",
    backgroundColor: "#87CEEB",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingLeft: 15, // 좌측 여백 추가
  },
  headerIcon: {
    width: 55,
    height: 55,
    marginRight: 15, // 아이콘과 텍스트 사이 간격
  },
  headerText: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#87CEEB",
  },
  inputContainer: {
    width: "80%",
    marginTop: 20,
  },
  input: {
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20, // 입력 칸 사이의 간격
    borderColor: "#D3D3D3",
    borderWidth: 1,
  },
  loginButton: {
    width: "80%", // 버튼 너비를 입력 칸과 동일하게 설정
    backgroundColor: "#87CEEB",
    borderRadius: 25,
    paddingVertical: 15,
    marginTop: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupPrompt: {
    color: "#A9A9A9",
    marginTop: 20,
    fontSize: 14,
  },
  backButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  backIcon: {
    width: 30,
    height: 30,
    tintColor: "#87CEEB",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 반투명 배경
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android에서의 그림자 효과
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#0288d1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
