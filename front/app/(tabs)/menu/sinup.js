import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import apiClient from "@/app/api/apiClient";
import { useRouter } from "expo-router";
import { useTheme } from '../../../hooks/ThemeContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    passwd: "",
  });
  const router = useRouter();

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.email || !formData.passwd) {
        Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
        return;
      }

      const response = await apiClient.post("/api/auth/register", formData);
      Alert.alert('성공', '회원가입이 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => router.push("/menu/login")
        }
      ]);
    } catch (error) {
      if (error.response?.data?.error) {
        Alert.alert('오류', error.response.data.error);
      } else {
        Alert.alert('오류', '회원가입 중 오류가 발생했습니다.');
      }
      console.error("Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign Up</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={formData.passwd}
          onChangeText={(value) => handleChange("passwd", value)}
        />
      </View>
      <Button title="Register" onPress={handleSubmit} />
      <TouchableOpacity onPress={() => router.push("/menu/login")}>
        <Text>이미 계정이 있으신가요? 로그인하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
});

export default SignUp;
