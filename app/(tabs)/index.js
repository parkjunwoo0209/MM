import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import SplashScreen from './MM/loading';
import MainScreen from './MM/main';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? <SplashScreen /> : <MainScreen />}
    </View>
  );
};

export default Index;
