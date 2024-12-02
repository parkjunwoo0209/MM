import React from 'react';
import { Stack } from 'expo-router';

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
    />
  );
}
