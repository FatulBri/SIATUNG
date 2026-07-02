import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { SectionTitle } from '../../components/SectionTitle';
import { ACTIVITY_STORAGE_KEY, ActivityType, dailyActivities } from '../../constants/dummyData';
import { useAppPreferences } from '../../constants/preferences';
import { colors, radius, spacing, typography } from '../../constants/theme';

const activityLabels: Record<ActivityType, string> = {
  kuliah: 'Kuliah',
  kerja: 'Kerja',
  organisasi: 'Organisasi',
  mengajar: 'Mengajar',
};

const activityColors: Record<ActivityType, string> = {
  kuliah: colors.kuliah,
  kerja: colors.kerja,
  organisasi: colors.organisasi,
  mengajar: colors.mengajar,
};

type DailyActivity = (typeof dailyActivities)[number];

export default function AktivitasScreen() {
  const { t, theme } = useAppPreferences();
  const [activities, setActivities] = useState<DailyActivity[]>(dailyActivities);

  useFocusEffect(
    useCallback(() => {
      async function loadActivities() {
        const storedActivities = await AsyncStorage.getItem(ACTIVITY_STORAGE_KEY);
        setActivities(storedActivities ? JSON.parse(storedActivities) : dailyActivities);
      }

      loadActivities();
    }, []),
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionTitle
          title={t('dailyActivity')}
          subtitle={t('localDataHint')}
        />

        {activities.map((day) => (
          <Card key={day.day}>
            <Text style={styles.dayTitle}>{day.day}</Text>
            <View style={styles.activityList}>
              {day.activities.map((activity) => (
                <View key={`${day.day}-${activity.time}-${activity.title}`} style={styles.activityRow}>
                  <View style={styles.timeBox}>
                    <Text style={styles.timeText}>{activity.time}</Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: `${activityColors[activity.type]}18` },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: activityColors[activity.type] }]}>
                        {activityLabels[activity.type]}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.xxl },
  dayTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: '900', marginBottom: spacing.md },
  activityList: { gap: spacing.md },
  activityRow: { flexDirection: 'row', gap: spacing.md },
  timeBox: {
    width: 94,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  timeText: { color: colors.muted, fontSize: typography.caption, fontWeight: '800', lineHeight: 17 },
  activityInfo: { flex: 1, gap: spacing.xs },
  activityTitle: { color: colors.text, fontSize: typography.body, fontWeight: '700', lineHeight: 21 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeText: { fontSize: typography.caption, fontWeight: '900' },
});
