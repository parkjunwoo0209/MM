import React from 'react';
import { Stack, Slot } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          marginTop: 0,
          paddingTop: 0,
        },
      }}
    >
      <Slot /> {/* 자식 라우트를 렌더링 */}
    </Stack>
  );
}
