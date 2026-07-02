import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { SectionTitle } from '../../components/SectionTitle';
import { AUTH_STORAGE_KEY, PROFILE_STORAGE_KEY, profile } from '../../constants/dummyData';
import { useAppPreferences } from '../../constants/preferences';
import { colors, radius, spacing, typography } from '../../constants/theme';

type Profile = typeof profile;

export default function BiodataScreen() {
  const { t, theme } = useAppPreferences();
  const [profileData, setProfileData] = useState<Profile>(profile);

  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        setProfileData(storedProfile ? JSON.parse(storedProfile) : profile);
      }

      loadProfile();
    }, []),
  );

  async function handleLogout() {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    router.replace('/login');
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionTitle
          title={`${t('biodata')} / CV`}
          subtitle={t('localDataHint')}
        />

        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            {profileData.photoUri ? (
              <Image
                source={{ uri: profileData.photoUri }}
                style={styles.avatarImage}
                onError={() => setProfileData({ ...profileData, photoUri: '' })}
              />
            ) : (
              <Text style={styles.avatarText}>{profileData.initials}</Text>
            )}
          </View>
          <Text style={styles.name}>{profileData.fullName}</Text>
          <Text style={styles.role}>
            {profileData.programStudy} - {profileData.university}
          </Text>
          <Text style={styles.nim}>NIM: {profileData.nim}</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>{t('personalInfo')}</Text>
          <InfoRow icon="location-outline" label="TTL" value={profileData.birthPlaceDate} />
          <InfoRow icon="home-outline" label="Alamat" value={profileData.address} />
          <InfoRow icon="mail-outline" label="Email" value={profileData.email} />
          <InfoRow icon="call-outline" label="No. HP" value={profileData.phone} />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>{t('interests')}</Text>
          <View style={styles.chips}>
            {profileData.interests.map((interest) => (
              <View key={interest} style={styles.chip}>
                <Text style={styles.chipText}>{interest}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>{t('aboutMe')}</Text>
          <Text style={styles.bio}>{profileData.bio}</Text>
        </Card>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]}
        >
          <Ionicons color={colors.surface} name="log-out-outline" size={20} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons color={colors.primary} name={icon} size={18} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.xxl },
  profileCard: { alignItems: 'center' },
  avatar: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.md,
  },
  avatarText: { color: colors.primary, fontSize: 34, fontWeight: '900' },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius.pill,
  },
  name: { color: colors.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  role: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  nim: { color: colors.primary, fontSize: typography.body, fontWeight: '800', marginTop: spacing.sm },
  cardTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: '800', marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  infoIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: {
    color: colors.muted,
    fontSize: typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoValue: { color: colors.text, fontSize: typography.body, lineHeight: 22, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: { color: colors.primary, fontSize: typography.caption, fontWeight: '800' },
  bio: { color: colors.muted, fontSize: typography.body, lineHeight: 24 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    paddingVertical: spacing.md,
  },
  buttonPressed: { opacity: 0.86 },
  logoutText: { color: colors.surface, fontSize: typography.body, fontWeight: '900' },
});
