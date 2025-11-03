// src/config/theme.ts - Complete Professional Theme System

export const lightTheme = {
  // PRIMARY: Modern Teal (Main action color)
  primary: '#0D7377',
  primaryLight: '#14B8A6',
  primaryLighter: '#99F6E4',
  primaryDark: '#065A66',

  // SECONDARY: Agriculture Green
  secondary: '#2D6A4F',
  secondaryLight: '#40B584',
  secondaryDark: '#1B4332',

  // SUCCESS
  success: '#10B981',
  successLight: '#6EE7B7',
  successDark: '#059669',

  // WARNING
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#D97706',

  // DANGER
  danger: '#EF4444',
  dangerLight: '#FCA5A5',
  dangerDark: '#DC2626',

  // GRAYSCALE
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // TEXT COLORS
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textMuted: '#D1D5DB',

  // BACKGROUNDS
  background: '#FFFFFF',
  backgroundAlt: '#F9FAFB',
  backgroundSection: '#F3F4F6',

  // SURFACE
  surface: '#FFFFFF',
  surfaceHover: '#F9FAFB',
  surfaceBorder: '#E5E7EB',

  // SHADOWS
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
  shadowDark: 'rgba(0, 0, 0, 0.16)',

  // OVERLAYS
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',

  // BORDERS
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#F0F0F0',

  // LEGACY COMPATIBILITY
  primaryGreen: '#2D7A4F',
  accent: '#FF9800',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  error: '#EF4444',
  info: '#3498DB',
  star: '#FFC107',
  starEmpty: '#E0E0E0',
  tertiary: '#3498DB',
  textLight: '#BDC3C7',
  hoverBackground: '#F5F7F9',
  hoverBorder: '#D1D5DB',
  gradientOverlay: 'rgba(45, 122, 79, 0.05)',
  gradientStart: '#0D7377',
  gradientEnd: '#14B8A6',

  isDark: false,
};

export const darkTheme = {
  // PRIMARY
  primary: '#14B8A6',
  primaryLight: '#2DD4BF',
  primaryLighter: '#99F6E4',
  primaryDark: '#0D7377',

  // SECONDARY
  secondary: '#40B584',
  secondaryLight: '#6EE7B7',
  secondaryDark: '#2D6A4F',

  // SUCCESS
  success: '#10B981',
  successLight: '#6EE7B7',
  successDark: '#059669',

  // WARNING
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#D97706',

  // DANGER
  danger: '#EF4444',
  dangerLight: '#FCA5A5',
  dangerDark: '#DC2626',

  // GRAYSCALE
  gray50: '#0F172A',
  gray100: '#1E293B',
  gray200: '#334155',
  gray300: '#475569',
  gray400: '#64748B',
  gray500: '#78909C',
  gray600: '#9CA3AF',
  gray700: '#B0BEC5',
  gray800: '#CBD5E1',
  gray900: '#F8FAFC',

  // TEXT COLORS
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textMuted: '#64748B',

  // BACKGROUNDS
  background: '#0F172A',
  backgroundAlt: '#1E293B',
  backgroundSection: '#334155',

  // SURFACE
  surface: '#1E293B',
  surfaceHover: '#334155',
  surfaceBorder: '#475569',

  // SHADOWS
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',

  // OVERLAYS
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // BORDERS
  border: '#475569',
  borderLight: '#334155',
  divider: '#2A3F5F',

  // LEGACY COMPATIBILITY
  primaryGreen: '#40B584',
  accent: '#FFB74D',
  card: '#1E293B',
  cardElevated: '#2E3E4E',
  error: '#EF4444',
  info: '#42A5F5',
  star: '#FFC107',
  starEmpty: '#455A64',
  tertiary: '#42A5F5',
  textLight: '#78909C',
  hoverBackground: '#2E2E2E',
  hoverBorder: '#455A64',
  gradientOverlay: 'rgba(76, 175, 80, 0.1)',
  gradientStart: '#14B8A6',
  gradientEnd: '#2DD4BF',

  isDark: true,
};

export type Theme = typeof lightTheme;
