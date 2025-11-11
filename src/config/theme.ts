// src/config/theme.ts - DEPRECATED
// This file is maintained for backward compatibility
// Use src/config/designSystem.ts for new code

import { LightTheme, DarkTheme, type Theme as NewTheme } from './designSystem';

// Re-export from unified design system with legacy property names for compatibility
export const lightTheme = {
  ...LightTheme,
  // Add legacy aliases
  danger: LightTheme.error,
  primaryGreen: LightTheme.secondary,
  primaryLighter: LightTheme.primaryLight,
  textLight: LightTheme.textTertiary,
  hoverBackground: LightTheme.surfaceHover,
  hoverBorder: LightTheme.borderLight,
  gradientOverlay: LightTheme.overlayLight,
  tertiary: LightTheme.info,
};

export const darkTheme = {
  ...DarkTheme,
  // Add legacy aliases
  danger: DarkTheme.error,
  primaryGreen: DarkTheme.secondary,
  primaryLighter: DarkTheme.primaryLight,
  textLight: DarkTheme.textTertiary,
  hoverBackground: DarkTheme.surfaceHover,
  hoverBorder: DarkTheme.borderLight,
  gradientOverlay: DarkTheme.overlayLight,
  tertiary: DarkTheme.info,
};

export type Theme = typeof lightTheme;
