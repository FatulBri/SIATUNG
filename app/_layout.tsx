import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppPreferencesProvider, useAppPreferences } from '../constants/preferences';

export default function RootLayout() {
  return (
    <AppPreferencesProvider>
      <RootStack />
    </AppPreferencesProvider>
  );
}

function RootStack() {
  const { isDark, theme, t } = useAppPreferences();

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.background },
          headerStyle: { backgroundColor: theme.surface },
          headerTitleStyle: { color: theme.text, fontWeight: '800' },
          headerTintColor: theme.primary,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ title: t('detailRecipe') }} />
      </Stack>
    </SafeAreaProvider>
  );
}
