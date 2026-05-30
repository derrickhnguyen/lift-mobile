export const palette = {
  accent: '#C6F432',
  onAccent: '#0C0D08',
  accentPress: '#B6E21F',
  dropColor: '#FF8A3C',
  errorColor: '#F06A6A',
};

export const darkColors = {
  bg: '#0A0A0B',
  surface: '#141416',
  surface2: '#1B1B1E',
  surface3: '#232327',
  border: '#2A2A2F',
  border2: '#34343A',
  text: '#F4F4F3',
  text2: '#A6A6AD',
  text3: '#6E6E76',
  shadow: 'rgba(0,0,0,0.7)',
};

export const lightColors = {
  bg: '#F6F6F4',
  surface: '#FFFFFF',
  surface2: '#F1F1EE',
  surface3: '#E9E9E5',
  border: '#E4E4DF',
  border2: '#D8D8D2',
  text: '#16161A',
  text2: '#5C5C63',
  text3: '#9A9AA0',
  shadow: 'rgba(20,20,30,0.25)',
};

export type AppTheme = 'dark' | 'light';
export type Colors = typeof darkColors;

export const getColors = (theme: AppTheme): Colors =>
  theme === 'dark' ? darkColors : lightColors;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 18,
};

export const typography = {
  displayFont: 'Archivo_800ExtraBold',
  bodyFont: 'HankenGrotesk_400Regular',
  bodyFontMedium: 'HankenGrotesk_500Medium',
  bodyFontSemibold: 'HankenGrotesk_600SemiBold',
  bodyFontBold: 'HankenGrotesk_700Bold',
  monoFont: 'JetBrainsMono_400Regular',
  monoFontMedium: 'JetBrainsMono_500Medium',
  monoFontBold: 'JetBrainsMono_700Bold',
};
