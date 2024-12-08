import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const Agreement = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 상단 여백 */}
      <View style={styles.topSpace} />

      {/* 상단 배너 */}
      <View style={styles.banner}>
        <Image source={require('../../../assets/images/menuicon/error.png')} style={styles.errorIcon} />
        <Text style={styles.bannerText}>이용약관</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 20 }}>
        <Text style={styles.sectionTitle}>[M.M(Metro Map) 이용약관]{'\n'}{'\n'}</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>제 1조 (목적){'\n'}</Text>
          본 약관은 지하철 길찾기 어플(이하 "본 어플")을 이용함에 있어 사용자와 서비스 제공자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.{'\n\n'}

          <Text style={styles.bold}>제 2조 (서비스 내용){'\n'}</Text>
          1. 본 어플은 사용자가 입력한 출발지와 목적지에 따라 지하철 경로를 제공하며, 목적지 도착 1역 전 푸시 알림 서비스를 제공합니다.{'\n'}
          2. 본 어플은 푸시 알림 기능을 통해 사용자가 탑승한 열차 정보를 기반으로 실시간 알림을 제공할 수 있습니다.{'\n'}
          3. 서비스는 사용자의 설정과 입력에 따라 제공되며, 정확성과 신뢰성을 보장하기 위해 최선을 다합니다.{'\n\n'}

          <Text style={styles.bold}>제 3조 (푸시 알림 동의){'\n'}</Text>
          1. 본 어플은 원활한 서비스 제공을 위해 푸시 알림을 활성화하도록 요청할 수 있습니다.{'\n'}
          2. 사용자가 알림을 허용하지 않을 경우, 일부 서비스가 제한될 수 있습니다.{'\n'}
          3. 알림 설정은 언제든지 사용자 기기의 설정에서 변경할 수 있습니다.{'\n\n'}

          <Text style={styles.bold}>제 4조 (개인정보 보호){'\n'}</Text>
          1. 본 어플은 사용자의 개인정보를 보호하기 위해 관련 법령을 준수합니다.{'\n'}
          2. 푸시 알림 서비스를 위해 필요한 최소한의 데이터를 수집하며, 이에 대한 세부 사항은 [개인정보처리방침]에 명시되어 있습니다.{'\n\n'}

          <Text style={styles.bold}>제 5조 (약관 변경){'\n'}</Text>
          1. 본 약관은 필요에 따라 변경될 수 있으며, 변경 내용은 본 어플 내 공지사항을 통해 사전 고지합니다.{'\n'}
          2. 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다.
        </Text>
      </ScrollView>

      {/* Back Button at Bottom Left */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Image source={require('../../../assets/images/mainicon/뒤로가기.png')} style={styles.backIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topSpace: {
    height: 65, // 상단 여백 크기
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#87CEEB',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 20, // 배너와 본문 사이 간격 추가
  },
  errorIcon: {
    width: 45,
    height: 45,
    marginRight: 15, // 아이콘과 텍스트 사이 여백
  },
  bannerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff', // 하얀색 텍스트
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    marginBottom: 20, // 추가된 간격
  },
  backIcon: {
    width: 30,
    height: 30,
  },
});

export default Agreement;