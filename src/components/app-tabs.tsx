import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Stack screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="index"/>
    </Stack>
  );
}
