// src/config/ModernDesignSystem.ts - Modern UI Design System
// Beautiful colors, gradients, and styling for premium app experience

export const ModernColors = {
  // Primary Brand Colors - Modern Blue
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  primaryLight: '#38BDF8',

  // Secondary Colors - Forest Green
  secondary: '#1B4332',
  secondaryDark: '#0F2818',
  secondaryLight: '#2D6A4F',

  // Success Colors
  success: '#10B981',
  successDark: '#059669',
  successLight: '#34D399',

  // Warning Colors
  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FCD34D',

  // Danger Colors
  danger: '#EF4444',
  dangerDark: '#DC2626',
  dangerLight: '#F87171',

  // Purple/Accent
  accent: '#8B5CF6',
  accentDark: '#7C3AED',
  accentLight: '#A78BFA',

  // Backgrounds
  background: '#0F1419',
  backgroundSecondary: '#1A1F2E',
  backgroundTertiary: '#26293B',

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  textDisabled: 'rgba(255, 255, 255, 0.3)',

  // Borders & Dividers
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  divider: 'rgba(255, 255, 255, 0.08)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.3)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',

  // Status Colors
  online: '#2ECC71',
  offline: '#E74C3C',
  pending: '#F39C12',
  completed: '#27AE60',
};

export const ModernGradients = {
  // Primary Brand Gradient - Blue
  primary: ['#0EA5E9', '#38BDF8'],
  primaryDark: ['#0284C7', '#0EA5E9'],

  // Secondary Gradient - Forest Green
  secondary: ['#1B4332', '#2D6A4F'],

  // Success Gradient
  success: ['#10B981', '#34D399'],

  // Danger Gradient
  danger: ['#EF4444', '#F87171'],

  // Background Gradient
  background: ['#0F1419', '#1A1F2E'],
  backgroundSoft: ['#1A1F2E', '#26293B'],

  // Glass Effect Gradient (for cards/modals)
  glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],

  // Header Gradient - Subtle blue
  header: ['#0F1419', '#162E4D'],

  // Button Gradient
  buttonPrimary: ['#0EA5E9', '#0284C7'],
  buttonSecondary: ['#1B4332', '#0F2818'],
  buttonDisabled: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)'],

  // Card Gradient (subtle)
  cardGradient: ['rgba(26, 31, 46, 0.8)', 'rgba(15, 20, 25, 0.6)'],
};

export const ModernSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Export as Spacing for easier imports
export const Spacing = {
  xs: 4,      // Minimal
  sm: 8,      // Compact
  md: 12,     // Standard
  lg: 16,     // Comfortable
  xl: 24,     // Generous
  xxl: 32,    // Large
  xxxl: 48,   // Extra large
};

export const ModernBorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

// Export as BorderRadius for easier imports
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 999,
};

export const ModernShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
};

// Export as Shadows for easier imports
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const ModernFonts = {
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const ModernComponents = {
  button: {
    height: 48,
    minHeight: 44,
    minWidth: 100,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  modal: {
    borderRadius: 20,
    paddingTop: 16,
  },
  tabBar: {
    height: 70,
  },
};

// Typography Presets
export const ModernTypography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
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
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 10,
    fontWeight: '400' as const,
    lineHeight: 14,
  },
};

// Export as Typography for easier imports
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

// Animation Durations
export const ModernAnimations = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Responsive Breakpoints
export const ModernBreakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export default {
  colors: ModernColors,
  gradients: ModernGradients,
  spacing: ModernSpacing,
  borderRadius: ModernBorderRadius,
  shadows: ModernShadows,
  fonts: ModernFonts,
  components: ModernComponents,
  typography: ModernTypography,
  animations: ModernAnimations,
  breakpoints: ModernBreakpoints,
};