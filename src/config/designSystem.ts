// src/config/designSystem.ts
// UNIFIED Design System - Single source of truth for all design tokens
// Consolidates theme.ts, ModernDesignSystem.ts, and designTokens.ts

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const Colors = {
  // Primary Brand Colors - Teal (Agriculture-focused)
  primary: {
    50: '#E6FFFE',
    100: '#CCFFFC',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D7377',  // Main primary
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Secondary - Agriculture Green
  secondary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#2D6A4F',  // Main secondary
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Success Colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10797D',  // Main success
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Warning Colors
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Main warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error/Danger Colors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Main error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Info/Blue Colors
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',  // Main info
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Neutral/Gray Colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// ============================================================================
// THEME DEFINITIONS (Light & Dark)
// ============================================================================

export const LightTheme = {
  // Primary colors
  primary: Colors.primary[600],
  primaryLight: Colors.primary[400],
  primaryDark: Colors.primary[700],

  // Secondary colors
  secondary: Colors.secondary[600],
  secondaryLight: Colors.secondary[400],
  secondaryDark: Colors.secondary[700],

  // Semantic colors
  success: Colors.success[500],
  successLight: Colors.success[300],
  successDark: Colors.success[700],

  warning: Colors.warning[500],
  warningLight: Colors.warning[300],
  warningDark: Colors.warning[700],

  error: Colors.error[500],
  errorLight: Colors.error[300],
  errorDark: Colors.error[700],

  info: Colors.info[500],
  infoLight: Colors.info[300],
  infoDark: Colors.info[700],

  // Text colors
  text: Colors.gray[900],
  textSecondary: Colors.gray[600],
  textTertiary: Colors.gray[400],
  textMuted: Colors.gray[300],
  textDisabled: Colors.gray[400],

  // Background colors
  background: '#FFFFFF',
  backgroundAlt: Colors.gray[50],
  backgroundSection: Colors.gray[100],

  // Surface colors
  surface: '#FFFFFF',
  surfaceHover: Colors.gray[50],
  surfaceBorder: Colors.gray[200],

  // Card colors
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',

  // Border & Divider colors
  border: Colors.gray[200],
  borderLight: Colors.gray[100],
  divider: Colors.gray[200],

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',

  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
  shadowDark: 'rgba(0, 0, 0, 0.16)',

  // Special colors
  accent: '#FF9800',
  star: '#FFC107',
  starEmpty: '#E0E0E0',

  // Gradients
  gradientStart: Colors.primary[600],
  gradientEnd: Colors.primary[400],

  isDark: false,
};

export const DarkTheme = {
  // Primary colors
  primary: Colors.primary[400],
  primaryLight: Colors.primary[300],
  primaryDark: Colors.primary[600],

  // Secondary colors
  secondary: Colors.secondary[400],
  secondaryLight: Colors.secondary[300],
  secondaryDark: Colors.secondary[600],

  // Semantic colors
  success: Colors.success[500],
  successLight: Colors.success[300],
  successDark: Colors.success[700],

  warning: Colors.warning[500],
  warningLight: Colors.warning[300],
  warningDark: Colors.warning[700],

  error: Colors.error[500],
  errorLight: Colors.error[300],
  errorDark: Colors.error[700],

  info: Colors.info[500],
  infoLight: Colors.info[300],
  infoDark: Colors.info[700],

  // Text colors
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textMuted: '#6B7280',
  textDisabled: '#4B5563',

  // Background colors
  background: '#0F172A',
  backgroundAlt: '#1E293B',
  backgroundSection: '#334155',

  // Surface colors
  surface: '#1E293B',
  surfaceHover: '#334155',
  surfaceBorder: '#475569',

  // Card colors
  card: '#1E293B',
  cardElevated: '#334155',

  // Border & Divider colors
  border: '#475569',
  borderLight: '#334155',
  divider: '#334155',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',

  // Special colors
  accent: '#FFB74D',
  star: '#FFC107',
  starEmpty: '#455A64',

  // Gradients
  gradientStart: Colors.primary[400],
  gradientEnd: Colors.primary[300],

  isDark: true,
};

export type Theme = typeof LightTheme;

// ============================================================================
// GRADIENTS
// ============================================================================

export const Gradients = {
  primary: [Colors.primary[600], Colors.primary[400]],
  primaryDark: [Colors.primary[700], Colors.primary[600]],
  secondary: [Colors.secondary[600], Colors.secondary[400]],
  success: [Colors.success[500], Colors.success[300]],
  warning: [Colors.warning[500], Colors.warning[300]],
  error: [Colors.error[500], Colors.error[300]],
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
};

// ============================================================================
// SPACING
// ============================================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  full: 9999,
};

// ============================================================================
// SHADOWS
// ============================================================================

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyTiny: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  labelLarge: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
  massive: 48,
};

export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
};

// ============================================================================
// ANIMATIONS
// ============================================================================

export const Animations = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
};

// ============================================================================
// COMPONENT SIZES
// ============================================================================

export const Components = {
  button: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    minWidth: 100,
    paddingHorizontal: {
      sm: 16,
      md: 20,
      lg: 24,
    },
  },
  input: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    paddingHorizontal: 16,
  },
  card: {
    padding: 16,
    borderRadius: BorderRadius.lg,
  },
  modal: {
    borderRadius: BorderRadius.xl,
    padding: 20,
  },
  tabBar: {
    height: 70,
  },
};

// ============================================================================
// OPACITY
// ============================================================================

export const Opacity = {
  disabled: 0.38,
  hover: 0.08,
  focus: 0.12,
  selected: 0.16,
  activated: 0.24,
  pressed: 0.32,
};

// ============================================================================
// Z-INDEX
// ============================================================================

export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1920,
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  Colors,
  LightTheme,
  DarkTheme,
  Gradients,
  Spacing,
  BorderRadius,
  Shadows,
  Typography,
  FontSizes,
  FontWeights,
  LineHeights,
  Animations,
  Components,
  Opacity,
  ZIndex,
  Breakpoints,
};
