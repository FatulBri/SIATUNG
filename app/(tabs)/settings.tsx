import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { Card } from '../../components/Card';
import { SectionTitle } from '../../components/SectionTitle';
import { TranslationKey, useAppPreferences } from '../../constants/preferences';
import {
  ACTIVITY_STORAGE_KEY,
  AUTH_STORAGE_KEY,
  EDUCATION_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  RECIPE_DETAIL_STORAGE_KEY_PREFIX,
  RECIPE_LIST_STORAGE_KEY,
  ActivityType,
  dailyActivities,
  educationHistory,
  profile,
} from '../../constants/dummyData';
import { colors, radius, spacing, typography } from '../../constants/theme';

type Profile = typeof profile;
type Education = (typeof educationHistory)[number] & { id?: number };
type DailyActivity = (typeof dailyActivities)[number];
type ActivityItem = DailyActivity['activities'][number];
type ActivityForm = ActivityItem & { day: string };
type Translate = (key: TranslationKey) => string;

const defaultEducation = educationHistory.map((item, index) => ({ ...item, id: index + 1 }));
const emptyEducation: Education = { id: 0, level: '', schoolName: '', years: '', description: '' };
const emptyActivity: ActivityForm = { day: 'Senin', time: '', title: '', type: 'kuliah' };

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

export default function SettingsScreen() {
  const { language, setLanguage, setThemeMode, t, theme, themeMode } = useAppPreferences();
  const [profileData, setProfileData] = useState<Profile>(profile);
  const [profileForm, setProfileForm] = useState<Profile>(profile);
  const [educations, setEducations] = useState<Education[]>(defaultEducation);
  const [educationForm, setEducationForm] = useState<Education>(emptyEducation);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [activities, setActivities] = useState<DailyActivity[]>(dailyActivities);
  const [activityForm, setActivityForm] = useState<ActivityForm>(emptyActivity);
  const [editingActivity, setEditingActivity] = useState<{ day: string; index: number } | null>(null);
  const [activeModal, setActiveModal] = useState<'profile' | 'education' | 'activity' | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadLocalDatabase();
    }, []),
  );

  async function loadLocalDatabase() {
    const [storedProfile, storedEducation, storedActivities] = await Promise.all([
      AsyncStorage.getItem(PROFILE_STORAGE_KEY),
      AsyncStorage.getItem(EDUCATION_STORAGE_KEY),
      AsyncStorage.getItem(ACTIVITY_STORAGE_KEY),
    ]);

    setProfileData(storedProfile ? JSON.parse(storedProfile) : profile);
    setEducations(storedEducation ? JSON.parse(storedEducation) : defaultEducation);
    setActivities(storedActivities ? JSON.parse(storedActivities) : dailyActivities);
  }

  async function saveProfile(nextProfile: Profile) {
    setProfileData(nextProfile);
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    setActiveModal(null);
  }

  async function saveEducations(nextEducations: Education[]) {
    setEducations(nextEducations);
    await AsyncStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify(nextEducations));
  }

  async function saveActivities(nextActivities: DailyActivity[]) {
    setActivities(nextActivities);
    await AsyncStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(nextActivities));
  }

  function openProfileEditor() {
    setProfileForm(profileData);
    setActiveModal('profile');
  }

  function openEducationCreate() {
    setEditingEducation(null);
    setEducationForm(emptyEducation);
    setActiveModal('education');
  }

  function openEducationEdit(education: Education) {
    setEditingEducation(education);
    setEducationForm(education);
    setActiveModal('education');
  }

  async function handleSaveEducation() {
    if (!educationForm.level.trim() || !educationForm.schoolName.trim()) {
      Alert.alert(t('incompleteData'), t('requiredEducation'));
      return;
    }

    const educationData = { ...educationForm, id: editingEducation?.id ?? Date.now() };
    const nextEducations = editingEducation
      ? educations.map((item) => (item.id === editingEducation.id ? educationData : item))
      : [...educations, educationData];

    await saveEducations(nextEducations);
    setActiveModal(null);
  }

  function deleteEducation(id?: number) {
    if (!id) return;

    Alert.alert(t('delete'), t('confirmDelete'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => saveEducations(educations.filter((item) => item.id !== id)),
      },
    ]);
  }

  function openActivityCreate() {
    setEditingActivity(null);
    setActivityForm(emptyActivity);
    setActiveModal('activity');
  }

  function openActivityEdit(day: string, activity: ActivityItem, index: number) {
    setEditingActivity({ day, index });
    setActivityForm({ day, ...activity });
    setActiveModal('activity');
  }

  async function handleSaveActivity() {
    if (!activityForm.day.trim() || !activityForm.time.trim() || !activityForm.title.trim()) {
      Alert.alert(t('incompleteData'), t('requiredActivity'));
      return;
    }

    const activityData: ActivityItem = {
      time: activityForm.time.trim(),
      title: activityForm.title.trim(),
      type: activityForm.type,
    };

    let nextActivities = activities;

    if (editingActivity) {
      nextActivities = activities.map((dayItem) =>
        dayItem.day === editingActivity.day
          ? {
              ...dayItem,
              activities: dayItem.activities.filter((_, index) => index !== editingActivity.index),
            }
          : dayItem,
      );
    }

    nextActivities = addActivityToDay(nextActivities, activityForm.day, activityData);
    await saveActivities(nextActivities);
    setActiveModal(null);
  }

  function deleteActivity(day: string, index: number) {
    Alert.alert(t('delete'), t('confirmDelete'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () =>
          saveActivities(
            activities.map((dayItem) =>
              dayItem.day === day
                ? {
                    ...dayItem,
                    activities: dayItem.activities.filter((_, activityIndex) => activityIndex !== index),
                  }
                : dayItem,
            ),
          ),
      },
    ]);
  }

  function resetAllData() {
    Alert.alert(
      t('resetData'),
      language === 'id'
        ? 'Kembalikan Profile, Pendidikan, dan Aktivitas ke data awal?'
        : 'Restore Profile, Education, and Activity to default data?',
      [
      { text: t('cancel'), style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await Promise.all([
            AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile)),
            AsyncStorage.setItem(EDUCATION_STORAGE_KEY, JSON.stringify(defaultEducation)),
            AsyncStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(dailyActivities)),
          ]);
          loadLocalDatabase();
        },
      },
    ]);
  }

  function resetRecipeCache() {
    Alert.alert(t('recipeCacheReset'), t('resetRecipeMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          const keys = await AsyncStorage.getAllKeys();
          const recipeDetailKeys = keys.filter((key) =>
            key.startsWith(RECIPE_DETAIL_STORAGE_KEY_PREFIX),
          );

          await AsyncStorage.multiRemove([RECIPE_LIST_STORAGE_KEY, ...recipeDetailKeys]);
          Alert.alert(t('success'), t('recipeCacheDeleted'));
        },
      },
    ]);
  }

  async function handleLogout() {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    router.replace('/login');
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionTitle
          title={t('settings')}
          subtitle={
            language === 'id'
              ? 'Pusat CRUD, tema aplikasi, dan bahasa. Halaman utama hanya menampilkan data final.'
              : 'CRUD center, app theme, and language. Main pages only display final data.'
          }
        />

        <Card>
          <Text style={styles.recipeNoteTitle}>{t('theme')}</Text>
          <View style={styles.preferenceRow}>
            <PreferencePill
              active={themeMode === 'light'}
              label={t('lightMode')}
              onPress={() => setThemeMode('light')}
            />
            <PreferencePill
              active={themeMode === 'dark'}
              label={t('darkMode')}
              onPress={() => setThemeMode('dark')}
            />
          </View>

          <Text style={[styles.recipeNoteTitle, styles.preferenceTitle]}>{t('language')}</Text>
          <View style={styles.preferenceRow}>
            <PreferencePill
              active={language === 'id'}
              label={t('indonesian')}
              onPress={() => setLanguage('id')}
            />
            <PreferencePill
              active={language === 'en'}
              label={t('english')}
              onPress={() => setLanguage('en')}
            />
          </View>
        </Card>

        <CrudSection
          icon="person-circle-outline"
          title={t('biodata')}
          subtitle={profileData.fullName}
          actionLabel={`${t('edit')} ${t('biodata')}`}
          onAction={openProfileEditor}
        />

        <Card>
          <SectionHeader
            icon="school-outline"
            title={t('education')}
            subtitle={
              language === 'id'
                ? `${educations.length} data pendidikan`
                : `${educations.length} education records`
            }
            actionLabel={t('add')}
            onAction={openEducationCreate}
          />
          {educations.map((education) => (
            <View key={education.id ?? education.schoolName} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{education.schoolName}</Text>
                <Text style={styles.itemSubtitle}>
                  {education.level} - {education.years}
                </Text>
              </View>
              <MiniButton label={t('edit')} onPress={() => openEducationEdit(education)} />
              <MiniButton danger label={t('delete')} onPress={() => deleteEducation(education.id)} />
            </View>
          ))}
        </Card>

        <Card>
          <SectionHeader
            icon="calendar-outline"
            title={t('activity')}
            subtitle={
              language === 'id'
                ? `${activities.reduce((total, day) => total + day.activities.length, 0)} aktivitas`
                : `${activities.reduce((total, day) => total + day.activities.length, 0)} activities`
            }
            actionLabel={t('add')}
            onAction={openActivityCreate}
          />
          {activities.map((day) => (
            <View key={day.day} style={styles.dayBlock}>
              <Text style={styles.dayTitle}>{day.day}</Text>
              {day.activities.map((activity, index) => (
                <View key={`${day.day}-${activity.time}-${activity.title}`} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{activity.title}</Text>
                    <Text style={styles.itemSubtitle}>{activity.time}</Text>
                    <Text style={[styles.typeText, { color: activityColors[activity.type] }]}>
                      {activityLabels[activity.type]}
                    </Text>
                  </View>
                  <MiniButton label={t('edit')} onPress={() => openActivityEdit(day.day, activity, index)} />
                  <MiniButton danger label={t('delete')} onPress={() => deleteActivity(day.day, index)} />
                </View>
              ))}
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.recipeNoteTitle}>{t('recipe')}</Text>
          <Text style={styles.recipeNoteText}>
            {language === 'id'
              ? 'CRUD resep tetap berada di tab Resep karena halaman itu memiliki tampilan khusus kartu resep dan detail resep.'
              : 'Recipe CRUD stays in the Recipe tab because it has a dedicated card layout and detail screen.'}
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/recipe')} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{t('openRecipeCrud')}</Text>
          </Pressable>
          <Pressable onPress={resetRecipeCache} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{t('recipeCacheReset')}</Text>
          </Pressable>
        </Card>

        <Pressable onPress={resetAllData} style={styles.resetAllButton}>
          <Text style={styles.resetAllText}>
            {language === 'id' ? 'Reset Profile, Pendidikan, Aktivitas' : 'Reset Profile, Education, Activity'}
          </Text>
        </Pressable>

        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons color={colors.surface} name="log-out-outline" size={20} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </Pressable>
      </ScrollView>

      <ProfileModal
        form={profileForm}
        isVisible={activeModal === 'profile'}
        onChangeForm={setProfileForm}
        onClose={() => setActiveModal(null)}
        onSave={() => saveProfile(profileForm)}
        t={t}
      />
      <EducationModal
        form={educationForm}
        isEditing={Boolean(editingEducation)}
        isVisible={activeModal === 'education'}
        onChangeForm={setEducationForm}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveEducation}
        t={t}
      />
      <ActivityModal
        form={activityForm}
        isEditing={Boolean(editingActivity)}
        isVisible={activeModal === 'activity'}
        onChangeForm={setActivityForm}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveActivity}
        t={t}
      />
    </SafeAreaView>
  );
}

function PreferencePill({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => Promise<void>;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.preferencePill, active && styles.preferencePillActive]}>
      <Text style={[styles.preferencePillText, active && styles.preferencePillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function addActivityToDay(activities: DailyActivity[], day: string, activity: ActivityItem) {
  const hasDay = activities.some((item) => item.day === day);

  if (!hasDay) {
    return [...activities, { day, activities: [activity] }];
  }

  return activities.map((item) =>
    item.day === day ? { ...item, activities: [...item.activities, activity] } : item,
  );
}

function CrudSection({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Card>
      <SectionHeader
        actionLabel={actionLabel}
        icon={icon}
        subtitle={subtitle}
        title={title}
        onAction={onAction}
      />
    </Card>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons color={colors.primary} name={icon} size={24} />
      </View>
      <View style={styles.sectionInfo}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      <Pressable onPress={onAction} style={styles.smallPrimaryButton}>
        <Text style={styles.smallPrimaryText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function MiniButton({ label, danger, onPress }: { label: string; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.miniButton, danger && styles.miniDanger]}>
      <Text style={[styles.miniText, danger && styles.miniDangerText]}>{label}</Text>
    </Pressable>
  );
}

function ProfileModal({
  form,
  isVisible,
  onChangeForm,
  onClose,
  onSave,
  t,
}: {
  form: Profile;
  isVisible: boolean;
  onChangeForm: (form: Profile) => void;
  onClose: () => void;
  onSave: () => void;
  t: Translate;
}) {
  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t('photoPermission'), t('photoPermissionMessage'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      onChangeForm({ ...form, photoUri: result.assets[0].uri });
    }
  }

  function updateForm(field: keyof Profile, value: string) {
    if (field === 'interests') {
      onChangeForm({ ...form, interests: value.split(',').map((item) => item.trim()).filter(Boolean) });
      return;
    }

    onChangeForm({ ...form, [field]: value });
  }

  return (
    <BaseModal isVisible={isVisible} title={`${t('edit')} ${t('biodata')}`} onClose={onClose} onSave={onSave} t={t}>
      <View style={styles.photoEditor}>
        <View style={styles.photoPreview}>
          {form.photoUri ? (
            <Image source={{ uri: form.photoUri }} style={styles.photoPreviewImage} />
          ) : (
            <Text style={styles.photoPreviewText}>{form.initials}</Text>
          )}
        </View>
        <View style={styles.photoActions}>
          <Pressable onPress={pickPhoto} style={styles.photoButton}>
            <Text style={styles.photoButtonText}>{t('choosePhoto')}</Text>
          </Pressable>
          {form.photoUri ? (
            <Pressable
              onPress={() => onChangeForm({ ...form, photoUri: '' })}
              style={styles.removePhotoButton}
            >
              <Text style={styles.removePhotoText}>{t('removePhoto')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <FormInput label={t('initials')} value={form.initials} onChangeText={(value) => updateForm('initials', value)} />
      <FormInput label={t('fullName')} value={form.fullName} onChangeText={(value) => updateForm('fullName', value)} />
      <FormInput label={t('studentId')} value={form.nim} onChangeText={(value) => updateForm('nim', value)} />
      <FormInput label={t('studyProgram')} value={form.programStudy} onChangeText={(value) => updateForm('programStudy', value)} />
      <FormInput label={t('university')} value={form.university} onChangeText={(value) => updateForm('university', value)} />
      <FormInput label={t('birthInfo')} value={form.birthPlaceDate} onChangeText={(value) => updateForm('birthPlaceDate', value)} />
      <FormInput label={t('address')} multiline value={form.address} onChangeText={(value) => updateForm('address', value)} />
      <FormInput label="Email" value={form.email} onChangeText={(value) => updateForm('email', value)} />
      <FormInput label={t('phone')} value={form.phone} onChangeText={(value) => updateForm('phone', value)} />
      <FormInput label={t('interests')} value={form.interests.join(', ')} onChangeText={(value) => updateForm('interests', value)} />
      <FormInput label={t('bio')} multiline value={form.bio} onChangeText={(value) => updateForm('bio', value)} />
    </BaseModal>
  );
}

function EducationModal({
  form,
  isEditing,
  isVisible,
  onChangeForm,
  onClose,
  onSave,
  t,
}: {
  form: Education;
  isEditing: boolean;
  isVisible: boolean;
  onChangeForm: (form: Education) => void;
  onClose: () => void;
  onSave: () => void;
  t: Translate;
}) {
  function updateForm(field: keyof Education, value: string) {
    onChangeForm({ ...form, [field]: value });
  }

  return (
    <BaseModal
      isVisible={isVisible}
      title={isEditing ? `${t('edit')} ${t('education')}` : `${t('add')} ${t('education')}`}
      onClose={onClose}
      onSave={onSave}
      t={t}
    >
      <FormInput label={t('level')} value={form.level} onChangeText={(value) => updateForm('level', value)} />
      <FormInput label={t('schoolName')} value={form.schoolName} onChangeText={(value) => updateForm('schoolName', value)} />
      <FormInput label={t('year')} value={form.years} onChangeText={(value) => updateForm('years', value)} />
      <FormInput label={t('description')} multiline value={form.description} onChangeText={(value) => updateForm('description', value)} />
    </BaseModal>
  );
}

function ActivityModal({
  form,
  isEditing,
  isVisible,
  onChangeForm,
  onClose,
  onSave,
  t,
}: {
  form: ActivityForm;
  isEditing: boolean;
  isVisible: boolean;
  onChangeForm: (form: ActivityForm) => void;
  onClose: () => void;
  onSave: () => void;
  t: Translate;
}) {
  return (
    <BaseModal
      isVisible={isVisible}
      title={isEditing ? `${t('edit')} ${t('activity')}` : `${t('add')} ${t('activity')}`}
      onClose={onClose}
      onSave={onSave}
      t={t}
    >
      <FormInput label={t('day')} value={form.day} onChangeText={(value) => onChangeForm({ ...form, day: value })} />
      <FormInput label={t('time')} placeholder="09.00 - 17.00" value={form.time} onChangeText={(value) => onChangeForm({ ...form, time: value })} />
      <FormInput label={t('activity')} value={form.title} onChangeText={(value) => onChangeForm({ ...form, title: value })} />
      <Text style={styles.formLabel}>{t('type')}</Text>
      <View style={styles.typeSelector}>
        {Object.keys(activityLabels).map((type) => {
          const activityType = type as ActivityType;
          const isActive = form.type === activityType;

          return (
            <Pressable
              key={type}
              onPress={() => onChangeForm({ ...form, type: activityType })}
              style={[styles.typeChip, isActive && { backgroundColor: activityColors[activityType] }]}
            >
              <Text style={[styles.typeChipText, isActive && styles.typeChipTextActive]}>
                {activityLabels[activityType]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BaseModal>
  );
}

function BaseModal({
  children,
  isVisible,
  title,
  onClose,
  onSave,
  t,
}: {
  children: React.ReactNode;
  isVisible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  t: Translate;
}) {
  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>{title}</Text>
            {children}
            <View style={styles.modalActions}>
              <Pressable onPress={onClose} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </Pressable>
              <Pressable onPress={onSave} style={[styles.modalButton, styles.saveButton]}>
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function FormInput({ label, ...inputProps }: { label: string } & TextInputProps) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.formInput, inputProps.multiline && styles.formInputMultiline]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sectionIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  sectionInfo: { flex: 1 },
  sectionTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: '900' },
  sectionSubtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: 2 },
  smallPrimaryButton: {
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  smallPrimaryText: { color: colors.surface, fontSize: typography.caption, fontWeight: '900' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  itemInfo: { flex: 1 },
  itemTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  itemSubtitle: { color: colors.muted, fontSize: typography.caption, lineHeight: 18, marginTop: 2 },
  typeText: { fontSize: typography.caption, fontWeight: '900', marginTop: 2 },
  miniButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  miniDanger: { backgroundColor: '#FEE2E2' },
  miniText: { color: colors.primary, fontSize: typography.caption, fontWeight: '900' },
  miniDangerText: { color: colors.danger },
  dayBlock: { marginTop: spacing.md },
  dayTitle: { color: colors.primary, fontSize: typography.caption, fontWeight: '900', textTransform: 'uppercase' },
  recipeNoteTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: '900' },
  recipeNoteText: { color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: spacing.xs },
  preferenceTitle: {
    marginTop: spacing.lg,
  },
  preferenceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  preferencePill: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.md,
  },
  preferencePillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  preferencePillText: {
    color: colors.primaryDark,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  preferencePillTextActive: {
    color: colors.surface,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  primaryButtonText: { color: colors.surface, fontSize: typography.body, fontWeight: '900' },
  secondaryButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '900',
  },
  resetAllButton: {
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    paddingVertical: spacing.md,
  },
  resetAllText: { color: colors.surface, fontSize: typography.body, fontWeight: '900' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.text,
    paddingVertical: spacing.md,
  },
  logoutText: { color: colors.surface, fontSize: typography.body, fontWeight: '900' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.45)' },
  modalCard: {
    maxHeight: '88%',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  modalTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: '900', marginBottom: spacing.md },
  photoEditor: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  photoPreview: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
  },
  photoPreviewText: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: '900',
  },
  photoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  photoButtonText: {
    color: colors.surface,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  removePhotoButton: {
    borderRadius: radius.pill,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  removePhotoText: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  formGroup: { gap: spacing.xs, marginBottom: spacing.md },
  formLabel: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '900',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: typography.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  formInputMultiline: { minHeight: 92, textAlignVertical: 'top' },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  typeChip: {
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  typeChipText: { color: colors.muted, fontSize: typography.caption, fontWeight: '900' },
  typeChipTextActive: { color: colors.surface },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  modalButton: { flex: 1, alignItems: 'center', borderRadius: radius.md, paddingVertical: spacing.md },
  cancelButton: { backgroundColor: colors.background },
  saveButton: { backgroundColor: colors.primary },
  cancelButtonText: { color: colors.muted, fontSize: typography.body, fontWeight: '900' },
  saveButtonText: { color: colors.surface, fontSize: typography.body, fontWeight: '900' },
});
