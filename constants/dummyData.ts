export const NIM = '23050698';

export const LOGIN_CREDENTIALS = {
  username: NIM,
  password: NIM,
};

export const AUTH_STORAGE_KEY = '@profil_praktikum_is_logged_in';
export const PROFILE_STORAGE_KEY = '@profil_praktikum_profile';
export const EDUCATION_STORAGE_KEY = '@profil_praktikum_education';
export const ACTIVITY_STORAGE_KEY = '@profil_praktikum_activities';
export const RECIPE_LIST_STORAGE_KEY = '@profil_praktikum_recipe_list';
export const RECIPE_DETAIL_STORAGE_KEY_PREFIX = '@profil_praktikum_recipe_detail_';

export const profile = {
  initials: 'MFB',
  photoUri: '',
  fullName: 'Muhammad Fathul Bari',
  nim: NIM,
  programStudy: 'Ilmu Komputer',
  university: 'Universitas Yatsi Madani (UYM)',
  birthPlaceDate: 'Tangerang, 10 Januari 2006',
  address: 'Jl. Aria Jaya Santika RT.04/02, Tangerang, Provinsi Banten',
  email: 'barifatul.321@gmail.com',
  phone: '081953031474',
  interests: ['AI Engginering', 'Fullstack Developer', 'Mobile Developer'],
  bio:
    `Mahasiswa Ilmu Komputer dengan IPK 3,84/4,00 yang memiliki minat tinggi di bidang teknologi, pengembangan perangkat lunak, dan inovasi digital. Berpengalaman mengembangkan berbagai proyek, seperti website responsif, company profile, serta aplikasi yang terintegrasi dengan kecerdasan buatan (AI) menggunakan API, basis data, dan teknologi modern. Mampu beradaptasi dengan berbagai peran di bidang teknologi informasi, memiliki kemampuan pemecahan masalah yang baik, semangat belajar yang tinggi, serta motivasi untuk memberikan kontribusi secara efektif dalam lingkungan kerja profesional.`,
};

export const educationHistory = [
  {
    level: 'Sekolah Dasar',
    schoolName: 'MI Al Husna',
    years: '2011 - 2017',
    description: 'Menempuh pendidikan dasar dengan fokus pada pembentukan karakter, kedisiplinan, dan dasar-dasar pengetahuan umum.',
  },
  {
    level: 'Sekolah Menengah Pertama',
    schoolName: ' SMP Al Husna',
    years: '2017 - 2020',
    description: 'Melanjutkan pendidikan tingkat menengah pertama dan mulai mengembangkan kemampuan akademik serta minat pada teknologi.',
  },
  {
    level: 'Sekolah Menengah Atas/Kejuruan',
    schoolName: 'SMK Al Husna',
    years: '2020 - 2023',
    description: 'Menempuh jurusan Administrasi Perkantoran dengan fokus pada pengelolaan administrasi, komunikasi perkantoran, dan penggunaan Microsoft Office.',
  },
  {
    level: 'Perguruan Tinggi',
    schoolName: 'Universitas Yatsi Madani',
    years: '2023 - Sekarang',
    description: 'Mahasiswa Ilmu Komputer yang fokus mempelajari pengembangan perangkat lunak, basis data, kecerdasan buatan, dan aplikasi mobile.',
  },
];

export type ActivityType = 'kuliah' | 'kerja' | 'organisasi' | 'mengajar';

export const dailyActivities: {
  day: string;
  activities: { time: string; title: string; type: ActivityType }[];
}[] = [
  {
    day: 'Senin',
    activities: [
      { time: '09.00 - 17.00', title: 'Bekerja', type: 'kerja' },
      { time: '18.20 - 21.40', title: 'Kuliah malam', type: 'kuliah' },
    ],
  },
  {
    day: 'Selasa',
    activities: [
      { time: '09.00 - 17.00', title: 'Bekerja', type: 'kerja' },
      { time: '18.20 - 21.40', title: 'Kuliah malam', type: 'kuliah' },
    ],
  },
  {
    day: 'Rabu',
    activities: [
      { time: '09.00 - 17.00', title: 'Bekerja', type: 'kerja' },
      { time: '18.20 - 21.40', title: 'Kuliah malam', type: 'kuliah' },
    ],
  },
  {
    day: 'Kamis',
    activities: [
      { time: '09.00 - 17.00', title: 'Bekerja', type: 'kerja' },
      { time: '18.20 - 21.40', title: 'Kuliah malam', type: 'kuliah' },
    ],
  },
  {
    day: 'Jumat',
    activities: [
      { time: '09.00 - 17.00', title: 'Bekerja', type: 'kerja' },
    ],
  },
  {
    day: 'Sabtu',
    activities: [
      { time: '08.00 - 16.00', title: 'Mengajar di Sekolah Paket A, B, dan C', type: 'mengajar' },
    ],
  },
  {
    day: 'Minggu',
    activities: [
      { time: '08.00 - 16.00', title: 'Mengajar di Sekolah Paket A, B, dan C', type: 'mengajar' },
    ],
  },
];
