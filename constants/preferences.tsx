import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { darkColors, lightColors } from './theme';

export type ThemeMode = 'light' | 'dark';
export type Language = 'id' | 'en';

const THEME_STORAGE_KEY = '@profil_praktikum_theme_mode';
const LANGUAGE_STORAGE_KEY = '@profil_praktikum_language';

const translations = {
  id: {
    biodata: 'Biodata',
    education: 'Pendidikan',
    activity: 'Aktivitas',
    recipe: 'Resep',
    settings: 'Pengaturan',
    detailRecipe: 'Detail Resep',
    theme: 'Tema',
    language: 'Bahasa',
    lightMode: 'Mode Terang',
    darkMode: 'Mode Gelap',
    indonesian: 'Indonesia',
    english: 'English',
    localDataHint: 'Data final dari database lokal. Ubah data melalui tab Pengaturan.',
    personalInfo: 'Informasi Pribadi',
    interests: 'Hobi / Minat',
    aboutMe: 'Tentang Saya',
    logout: 'Keluar',
    educationHistory: 'Riwayat Pendidikan',
    dailyActivity: 'Aktivitas Harian',
    recipePracticum: 'Resep Praktikum',
    recipeSubtitle: 'Database resep lokal dengan data awal dari API DummyJSON.',
    add: 'Tambah',
    edit: 'Edit',
    delete: 'Hapus',
    cancel: 'Batal',
    save: 'Simpan',
    retry: 'Coba Lagi',
    loadingRecipes: 'Memuat resep praktikum...',
    recipeUnavailable: 'Data belum tersedia',
    imageUnavailable: 'Gambar tidak tersedia',
    addRecipe: 'Tambah Resep',
    editRecipe: 'Edit Resep',
    recipeCacheReset: 'Reset Cache Resep',
    openRecipeCrud: 'Buka CRUD Resep',
    resetData: 'Reset Data',
    incompleteData: 'Data belum lengkap',
    requiredName: 'Nama wajib diisi.',
    requiredEducation: 'Jenjang dan nama sekolah wajib diisi.',
    requiredActivity: 'Hari, jam, dan nama aktivitas wajib diisi.',
    confirmDelete: 'Yakin ingin menghapus data ini?',
    resetRecipeMessage: 'Hapus database lokal resep agar data bisa diambil ulang dari API?',
    success: 'Berhasil',
    recipeCacheDeleted: 'Cache resep berhasil dihapus.',
    photoPermission: 'Izin dibutuhkan',
    photoPermissionMessage: 'Izinkan akses galeri untuk memilih foto profil.',
    choosePhoto: 'Pilih Foto',
    removePhoto: 'Hapus Foto',
    initials: 'Inisial',
    fullName: 'Nama Lengkap',
    studentId: 'NIM',
    studyProgram: 'Program Studi',
    university: 'Universitas',
    birthInfo: 'Tempat, Tanggal Lahir',
    address: 'Alamat',
    phone: 'No. HP',
    bio: 'Bio',
    level: 'Jenjang',
    schoolName: 'Nama Sekolah/Kampus',
    year: 'Tahun',
    description: 'Deskripsi',
    day: 'Hari',
    time: 'Jam',
    type: 'Jenis',
  },
  en: {
    biodata: 'Profile',
    education: 'Education',
    activity: 'Activity',
    recipe: 'Recipe',
    settings: 'Settings',
    detailRecipe: 'Recipe Detail',
    theme: 'Theme',
    language: 'Language',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    indonesian: 'Indonesian',
    english: 'English',
    localDataHint: 'Final data from local database. Edit it from the Settings tab.',
    personalInfo: 'Personal Information',
    interests: 'Interests',
    aboutMe: 'About Me',
    logout: 'Sign Out',
    educationHistory: 'Education History',
    dailyActivity: 'Daily Activity',
    recipePracticum: 'Recipe Practicum',
    recipeSubtitle: 'Local recipe database seeded from the DummyJSON API.',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    retry: 'Try Again',
    loadingRecipes: 'Loading practicum recipes...',
    recipeUnavailable: 'Data unavailable',
    imageUnavailable: 'Image unavailable',
    addRecipe: 'Add Recipe',
    editRecipe: 'Edit Recipe',
    recipeCacheReset: 'Reset Recipe Cache',
    openRecipeCrud: 'Open Recipe CRUD',
    resetData: 'Reset Data',
    incompleteData: 'Incomplete data',
    requiredName: 'Name is required.',
    requiredEducation: 'Level and school name are required.',
    requiredActivity: 'Day, time, and activity name are required.',
    confirmDelete: 'Are you sure you want to delete this data?',
    resetRecipeMessage: 'Delete the local recipe database so data can be fetched again from the API?',
    success: 'Success',
    recipeCacheDeleted: 'Recipe cache has been deleted.',
    photoPermission: 'Permission required',
    photoPermissionMessage: 'Allow gallery access to choose a profile photo.',
    choosePhoto: 'Choose Photo',
    removePhoto: 'Remove Photo',
    initials: 'Initials',
    fullName: 'Full Name',
    studentId: 'Student ID',
    studyProgram: 'Study Program',
    university: 'University',
    birthInfo: 'Place, Date of Birth',
    address: 'Address',
    phone: 'Phone',
    bio: 'Bio',
    level: 'Level',
    schoolName: 'School/Campus Name',
    year: 'Year',
    description: 'Description',
    day: 'Day',
    time: 'Time',
    type: 'Type',
  },
};

export type TranslationKey = keyof typeof translations.id;

type PreferenceContextValue = {
  themeMode: ThemeMode;
  language: Language;
  theme: typeof lightColors;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
};

const PreferenceContext = createContext<PreferenceContextValue | null>(null);

export function AppPreferencesProvider({ children }: PropsWithChildren) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    async function loadPreferences() {
      const [storedTheme, storedLanguage] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
      ]);

      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeModeState(storedTheme);
      }

      if (storedLanguage === 'id' || storedLanguage === 'en') {
        setLanguageState(storedLanguage);
      }
    }

    loadPreferences();
  }, []);

  async function setThemeMode(mode: ThemeMode) {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  }

  async function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }

  const value = useMemo(
    () => ({
      themeMode,
      language,
      theme: themeMode === 'dark' ? darkColors : lightColors,
      isDark: themeMode === 'dark',
      setThemeMode,
      setLanguage,
      t: (key: keyof typeof translations.id) => translations[language][key],
    }),
    [language, themeMode],
  );

  return <PreferenceContext.Provider value={value}>{children}</PreferenceContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(PreferenceContext);

  if (!context) {
    throw new Error('useAppPreferences must be used inside AppPreferencesProvider');
  }

  return context;
}
