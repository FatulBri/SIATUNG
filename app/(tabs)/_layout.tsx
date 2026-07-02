import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import { ColorValue } from 'react-native';

import { useAppPreferences } from '../../constants/preferences';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons color={String(color)} name={name} size={size} />
  );
}

export default function TabsLayout() {
  const { theme, t } = useAppPreferences();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 74,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
        },
        tabBarItemStyle: {
          borderRadius: 18,
        },
      }}
    >
      <Tabs.Screen
        name="biodata"
        options={{ title: t('biodata'), tabBarIcon: tabIcon('person-circle-outline') }}
      />
      <Tabs.Screen
        name="pendidikan"
        options={{ title: t('education'), tabBarIcon: tabIcon('school-outline') }}
      />
      <Tabs.Screen
        name="aktivitas"
        options={{ title: t('activity'), tabBarIcon: tabIcon('calendar-outline') }}
      />
      <Tabs.Screen
        name="recipe"
        options={{ title: t('recipe'), tabBarIcon: tabIcon('restaurant-outline') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t('settings'), tabBarIcon: tabIcon('settings-outline') }}
      />
    </Tabs>
  );
}
