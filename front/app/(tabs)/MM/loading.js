import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/mainicon/KakaoTalk_20241113_171601246.png')} // 예시 이미지 URL
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4FBFE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF', // 흰색 텍스트
  },
  subtitle: {
    fontSize: 20,
    color: '#FFFFFF', // 흰색 텍스트
  },
});

export default SplashScreen;
