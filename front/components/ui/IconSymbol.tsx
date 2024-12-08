// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleSheet, Text, TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  weight = 'regular',
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  weight?: 'regular' | 'medium' | 'bold';
  color?: string;
  style?: TextStyle;
}) {
  const defaultColor = useThemeColor({}, 'text');

  return (
    <Text
      style={[
        styles.symbol,
        {
          fontSize: size,
          fontWeight: weight === 'bold' ? '700' : weight === 'medium' ? '500' : '400',
          color: color ?? defaultColor,
        },
        style,
      ]}>
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  symbol: {
    fontFamily: 'expo-symbols',
  },
});