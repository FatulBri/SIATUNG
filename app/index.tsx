import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AUTH_STORAGE_KEY } from '../constants/dummyData';
import { useAppPreferences } from '../constants/preferences';
import { colors, spacing, typography } from '../constants/theme';

export default function IndexScreen() {
  const { theme } = useAppPreferences();

  useEffect(() => {
    async function checkLoginStatus() {
      const isLoggedIn = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      router.replace(isLoggedIn === 'true' ? '/(tabs)/biodata' : '/login');
    }

    checkLoginStatus();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.primary} size="large" />
      <Text style={[styles.text, { color: theme.muted }]}>Menyiapkan aplikasi...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  text: {
    color: colors.muted,
    fontSize: typography.body,
  },
});
