import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { SectionTitle } from '../../components/SectionTitle';
import { EDUCATION_STORAGE_KEY, educationHistory } from '../../constants/dummyData';
import { useAppPreferences } from '../../constants/preferences';
import { colors, radius, spacing, typography } from '../../constants/theme';

type Education = (typeof educationHistory)[number] & { id?: number };

const seededEducation = educationHistory.map((item, index) => ({ ...item, id: index + 1 }));

export default function PendidikanScreen() {
  const { t, theme } = useAppPreferences();
  const [educations, setEducations] = useState<Education[]>(seededEducation);

  useFocusEffect(
    useCallback(() => {
      async function loadEducations() {
        const storedEducations = await AsyncStorage.getItem(EDUCATION_STORAGE_KEY);
        setEducations(storedEducations ? JSON.parse(storedEducations) : seededEducation);
      }

      loadEducations();
    }, []),
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionTitle
          title={t('educationHistory')}
          subtitle={t('localDataHint')}
        />

        {educations.map((education, index) => (
          <View key={education.id ?? `${education.level}-${education.schoolName}`} style={styles.timelineRow}>
            <View style={styles.markerColumn}>
              <View style={styles.dot} />
              {index < educations.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <Card style={styles.educationCard}>
              <Text style={styles.level}>{education.level}</Text>
              <Text style={styles.school}>{education.schoolName}</Text>
              <Text style={styles.years}>{education.years}</Text>
              <Text style={styles.description}>{education.description}</Text>
            </Card>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.xxl },
  timelineRow: { flexDirection: 'row' },
  markerColumn: { alignItems: 'center', marginRight: spacing.md, paddingTop: spacing.md },
  dot: {
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.primaryLight,
  },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: spacing.xs },
  educationCard: { flex: 1 },
  level: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  school: { color: colors.text, fontSize: typography.subtitle, fontWeight: '900', marginTop: spacing.xs },
  years: { color: colors.muted, fontSize: typography.body, fontWeight: '800', marginTop: spacing.xs },
  description: { color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: spacing.sm },
});
