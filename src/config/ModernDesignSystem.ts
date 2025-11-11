// src/config/ModernDesignSystem.ts - DEPRECATED
// This file is maintained for backward compatibility
// Use src/config/designSystem.ts for new code

import {
  LightTheme,
  Colors,
  Gradients,
  Spacing as UnifiedSpacing,
  BorderRadius as UnifiedBorderRadius,
  Shadows as UnifiedShadows,
  Typography as UnifiedTypography,
  Animations as UnifiedAnimations,
  Components as UnifiedComponents,
} from './designSystem';

// Map unified design system to legacy ModernColors interface
export const ModernColors = {
  // Primary Brand Colors
  primary: Colors.primary[600],
  primaryDark: Colors.primary[700],
  primaryLight: Colors.primary[400],

  // Secondary Colors
  secondary: Colors.secondary[600],
  secondaryDark: Colors.secondary[700],
  secondaryLight: Colors.secondary[400],

  // Success Colors
  success: Colors.success[500],
  successDark: Colors.success[700],
  successLight: Colors.success[300],

  // Warning Colors
  warning: Colors.warning[500],
  warningDark: Colors.warning[700],
  warningLight: Colors.warning[300],

  // Danger Colors
  danger: Colors.error[500],
  dangerDark: Colors.error[700],
  dangerLight: Colors.error[300],

  // Purple/Accent
  accent: LightTheme.accent,
  accentDark: Colors.primary[700],
  accentLight: Colors.primary[400],

  // Backgrounds
  background: LightTheme.background,
  backgroundSecondary: LightTheme.backgroundAlt,
  backgroundTertiary: LightTheme.backgroundSection,

  // Text Colors
  textPrimary: LightTheme.text,
  textSecondary: LightTheme.textSecondary,
  textTertiary: LightTheme.textTertiary,
  textDisabled: LightTheme.textDisabled,

  // Borders & Dividers
  border: LightTheme.border,
  borderLight: LightTheme.borderLight,
  divider: LightTheme.divider,

  // Overlay
  overlay: LightTheme.overlay,
  overlayLight: LightTheme.overlayLight,

  // Status Colors
  online: Colors.success[500],
  offline: Colors.error[500],
  pending: Colors.warning[500],
  completed: Colors.success[600],
};

export const ModernGradients = {
  // Primary Brand Gradient
  primary: Gradients.primary,
  primaryDark: Gradients.primaryDark,

  // Secondary Gradient
  secondary: Gradients.secondary,

  // Success Gradient
  success: Gradients.success,

  // Danger Gradient
  danger: Gradients.error,

  // Background Gradient (use primary for light backgrounds)
  background: Gradients.primary,
  backgroundSoft: Gradients.glass,

  // Glass Effect Gradient
  glass: Gradients.glass,

  // Header Gradient
  header: Gradients.primary,

  // Button Gradient
  buttonPrimary: Gradients.primary,
  buttonSecondary: Gradients.secondary,
  buttonDisabled: ['rgba(200, 200, 200, 0.3)', 'rgba(180, 180, 180, 0.2)'],

  // Card Gradient
  cardGradient: Gradients.glass,
};

export const ModernSpacing = UnifiedSpacing;

// Export as Spacing for easier imports
export const Spacing = UnifiedSpacing;

export const ModernBorderRadius = UnifiedBorderRadius;

// Export as BorderRadius for easier imports
export const BorderRadius = UnifiedBorderRadius;

export const ModernShadows = UnifiedShadows;

// Export as Shadows for easier imports
export const Shadows = UnifiedShadows;

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

export const ModernComponents = UnifiedComponents;

// Typography Presets
export const ModernTypography = UnifiedTypography;

// Export as Typography for easier imports
export const Typography = UnifiedTypography;

// Animation Durations
export const ModernAnimations = {
  fast: UnifiedAnimations.duration.fast,
  normal: UnifiedAnimations.duration.normal,
  slow: UnifiedAnimations.duration.slow,
  verySlow: UnifiedAnimations.duration.slower,
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