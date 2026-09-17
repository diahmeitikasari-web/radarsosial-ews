import { SchoolTheme } from '../types';

export interface ThemePresetOption {
  id: SchoolTheme['preset'];
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  accentLight: string;
  bgGradient: string;
  previewBg: string;
}

export const THEME_PRESETS: ThemePresetOption[] = [
  {
    id: 'navy_gold',
    name: 'Bangka Ocean & Gold (Klasik Madrasah)',
    description: 'Kombinasi biru bahari Bangka dengan emas lab sosiometri yang elegan dan profesional.',
    primary: '#0a2a4a',
    secondary: '#0d3555',
    accent: '#f0c040',
    accentLight: '#f7d970',
    bgGradient: 'from-[#071c33] via-[#0a2a4a] to-[#0f3d63]',
    previewBg: '#0a2a4a',
  },
  {
    id: 'emerald_gold',
    name: 'Islamic Emerald & Serambi Emas',
    description: 'Nuansa hijau zamrud madrasah berwibawa dengan aksen keemasan bernafaskan nilai islami.',
    primary: '#064e3b',
    secondary: '#065f46',
    accent: '#facc15',
    accentLight: '#fef08a',
    bgGradient: 'from-[#022c22] via-[#064e3b] to-[#047857]',
    previewBg: '#064e3b',
  },
  {
    id: 'royal_sapphire',
    name: 'Royal Sapphire & Cyan (Sekolah Penggerak)',
    description: 'Biru safir modern dipadukan dengan aksen cyan cerah untuk atmosfer akademik progresif.',
    primary: '#0f2b5c',
    secondary: '#1e3a8a',
    accent: '#38bdf8',
    accentLight: '#7dd3fc',
    bgGradient: 'from-[#081836] via-[#0f2b5c] to-[#1e40af]',
    previewBg: '#0f2b5c',
  },
  {
    id: 'crimson_gold',
    name: 'Cendekia Crimson & Amber',
    description: 'Merah marun wibawa berpadu kuning amber hangat, mencerminkan ketegasan dan kasih konseling.',
    primary: '#701a28',
    secondary: '#881337',
    accent: '#fbbf24',
    accentLight: '#fde68a',
    bgGradient: 'from-[#4c0519] via-[#701a28] to-[#9f1239]',
    previewBg: '#701a28',
  },
  {
    id: 'forest_mint',
    name: 'Harmoni Forest & Mint Green',
    description: 'Hijau daun hutan tropis dengan aksen mint segar untuk nuansa ketenangan dan ramah anak.',
    primary: '#14532d',
    secondary: '#166534',
    accent: '#34d399',
    accentLight: '#6ee7b7',
    bgGradient: 'from-[#052e16] via-[#14532d] to-[#15803d]',
    previewBg: '#14532d',
  },
  {
    id: 'amethyst_amber',
    name: 'Psikologi Amethyst & Sunset Tangerine',
    description: 'Ungu mendalam sains psikologi perilaku dipadukan aksen tangerine senja yang hangat.',
    primary: '#4c1d95',
    secondary: '#581c87',
    accent: '#fb923c',
    accentLight: '#fdba74',
    bgGradient: 'from-[#2e1065] via-[#4c1d95] to-[#6b21a8]',
    previewBg: '#4c1d95',
  },
];

export function getSchoolTheme(presetName?: string): SchoolTheme {
  const found = THEME_PRESETS.find((p) => p.id === presetName);
  const fallback = THEME_PRESETS[0];
  const choice = found || fallback;
  return {
    preset: choice.id,
    primaryColor: choice.primary,
    secondaryColor: choice.secondary,
    accentColor: choice.accent,
    accentLight: choice.accentLight,
  };
}
