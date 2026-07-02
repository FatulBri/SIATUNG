import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Card } from '../components/Card';
import { AUTH_STORAGE_KEY, LOGIN_CREDENTIALS, profile } from '../constants/dummyData';
import { useAppPreferences } from '../constants/preferences';
import { colors, radius, spacing, typography } from '../constants/theme';

export default function LoginScreen() {
  const { isDark, language, theme } = useAppPreferences();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function handleLogin() {
    setError('');
    setIsSubmitting(true);

    const isValid =
      username.trim() === LOGIN_CREDENTIALS.username && password === LOGIN_CREDENTIALS.password;

    if (!isValid) {
      setError(
        language === 'id'
          ? 'Nama pengguna atau kata sandi salah. Gunakan NIM yang ada di dummyData.ts.'
          : 'Invalid username or password. Use the NIM from dummyData.ts.',
      );
      setIsSubmitting(false);
      return;
    }

    await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'true');
    setIsSubmitting(false);
    router.replace('/(tabs)/biodata');
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.decorCircleTop} />
        <View style={styles.decorCircleBottom} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.brandBadge}>
              <Ionicons color={colors.accent} name="shield-checkmark-outline" size={18} />
              <Text style={styles.brandBadgeText}>
                {language === 'id' ? 'Akses Mahasiswa' : 'Student Access'}
              </Text>
            </View>

            <View style={styles.logoWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile.initials}</Text>
              </View>
            </View>

            <Text style={[styles.title, { color: theme.text }]}>
              {language === 'id' ? 'SI ATUNG' : 'SI ATUNG'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              {language === 'id'
                ? 'Aplikasi profil pribadi, aktivitas, riwayat pendidikan, dan praktikum resep dalam satu tempat.'
                : 'A personal profile, activity, education, and recipe practicum app in one place.'}
            </Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.formAccent} />
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {language === 'id' ? 'Masuk ke Aplikasi' : 'Sign In'}
              </Text>
              <Text style={styles.formSubtitle}>
                {language === 'id'
                  ? 'Gunakan NIM sebagai nama pengguna dan kata sandi.'
                  : 'Use your student ID as username and password.'}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{language === 'id' ? 'Nama Pengguna' : 'Username'}</Text>
              <View style={styles.inputWrap}>
                <Ionicons color={colors.muted} name="person-outline" size={18} />
                <TextInput
                  autoCapitalize="none"
                  placeholder={language === 'id' ? 'Masukkan NIM' : 'Enter student ID'}
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{language === 'id' ? 'Kata Sandi' : 'Password'}</Text>
              <View style={styles.inputWrap}>
                <Ionicons color={colors.muted} name="lock-closed-outline" size={18} />
                <TextInput
                  placeholder={language === 'id' ? 'Masukkan kata sandi' : 'Enter password'}
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!isPasswordVisible}
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setIsPasswordVisible((value) => !value)}>
                  <Ionicons
                    color={colors.muted}
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons color={colors.danger} name="alert-circle-outline" size={18} />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              disabled={isSubmitting}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.button,
                isSubmitting && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonText}>
                {isSubmitting
                  ? language === 'id'
                    ? 'Memproses...'
                    : 'Processing...'
                  : language === 'id'
                    ? 'Masuk'
                    : 'Sign In'}
              </Text>
              <Ionicons color={colors.surface} name="arrow-forward-outline" size={18} />
            </Pressable>
          </Card>

          <Text style={[styles.footerText, { color: isDark ? '#CBD5E1' : colors.muted }]}>
            {language === 'id'
              ? `${profile.university} - Praktikum Mobile`
              : `${profile.university} - Mobile Practicum`}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    gap: spacing.lg,
  },
  decorCircleTop: {
    position: 'absolute',
    top: -90,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(30,58,138,0.16)',
  },
  decorCircleBottom: {
    position: 'absolute',
    bottom: -130,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(245,158,11,0.14)',
  },
  header: {
    alignItems: 'center',
    gap: spacing.md,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    borderRadius: radius.pill,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brandBadgeText: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  logoWrap: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: radius.pill,
    padding: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatar: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  formCard: {
    gap: spacing.lg,
    overflow: 'hidden',
  },
  formAccent: {
    height: 4,
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    backgroundColor: colors.accent,
  },
  formHeader: {
    gap: spacing.xs,
  },
  formTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '900',
  },
  formSubtitle: {
    color: colors.muted,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    paddingVertical: spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
  },
  error: {
    flex: 1,
    color: colors.danger,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonText: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: '900',
  },
  footerText: {
    color: colors.muted,
    fontSize: typography.caption,
    fontWeight: '700',
    textAlign: 'center',
  },
});
