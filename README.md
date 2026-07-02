# SIATUNG

SIATUNG adalah aplikasi mobile **Profil Pribadi & Praktikum** berbasis **Expo React Native**. Aplikasi ini dibuat untuk kebutuhan tugas praktikum mobile dengan fokus pada tampilan profesional, navigasi modern, CRUD data lokal, konsumsi API, serta dukungan mode terang/gelap dan multi-bahasa.

## Fitur Utama

- Login lokal menggunakan NIM.
- Biodata/CV digital dengan foto profil.
- Riwayat pendidikan dalam tampilan timeline.
- Aktivitas harian dengan badge kategori.
- CRUD Profile, Education, dan Activity melalui halaman Pengaturan.
- CRUD Recipe dengan data awal dari DummyJSON Recipes API.
- Detail resep berisi gambar, bahan, langkah, kalori, dan porsi.
- Database lokal menggunakan AsyncStorage.
- Upload foto profil dari galeri.
- Mode terang dan gelap.
- Bahasa Indonesia dan English.
- Custom app icon dan splash screen.

## Tech Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- AsyncStorage
- Expo Image Picker
- Expo Splash Screen
- Ionicons
- DummyJSON Recipes API

## Login Default

Gunakan NIM sebagai username dan password.

```text
Username: 23050698
Password: 23050698
```

## Cara Menjalankan

Install dependency:

```bash
npm install
```

Jalankan project:

```bash
npx expo start --clear
```

Lalu scan QR Code menggunakan Expo Go.

## Struktur Folder

```text
app/
  _layout.tsx
  index.tsx
  login.tsx
  (tabs)/
    _layout.tsx
    biodata.tsx
    pendidikan.tsx
    aktivitas.tsx
    recipe.tsx
    settings.tsx
  recipe/
    [id].tsx

components/
  Card.tsx
  SectionTitle.tsx
  Timeline.tsx

constants/
  dummyData.ts
  preferences.tsx
  theme.ts

assets/
  icon.png
  splash-icon.png
```

## Database Lokal

Aplikasi menggunakan **AsyncStorage** untuk menyimpan:

- Status login
- Data profile
- Data pendidikan
- Data aktivitas
- Data resep
- Preferensi tema
- Preferensi bahasa

## Build Android

Project sudah memiliki konfigurasi EAS Build.

Build APK preview:

```bash
npx eas-cli build -p android --profile preview
```

## Identitas

Nama: Muhammad Fathul Bari  
NIM: 23050698  
Program Studi: Ilmu Komputer  
Universitas: Universitas Yatsi Madani
