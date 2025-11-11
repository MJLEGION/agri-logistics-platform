// src/constants/designTokens.ts - DEPRECATED
// This file is maintained for backward compatibility
// Use src/config/designSystem.ts for new code

import {
  Spacing,
  BorderRadius,
  Typography,
  FontSizes,
  FontWeights,
  LineHeights,
  Shadows,
  Animations,
  Colors,
  Opacity,
  ZIndex,
} from '../config/designSystem';

export const spacing = Spacing;

export const borderRadius = BorderRadius;

export const typography = {
  fontSize: {
    xs: FontSizes.xs,
    sm: FontSizes.sm,
    base: FontSizes.base,
    md: FontSizes.md,
    lg: FontSizes.lg,
    xl: FontSizes.xl,
    xxl: FontSizes.xxl,
    xxxl: FontSizes.xxxl,
    huge: FontSizes.huge,
    massive: FontSizes.massive,
  },
  fontWeight: {
    light: FontWeights.light,
    regular: FontWeights.regular,
    medium: FontWeights.medium,
    semibold: FontWeights.semibold,
    bold: FontWeights.bold,
    extrabold: FontWeights.extrabold,
  },
  lineHeight: {
    tight: LineHeights.tight,
    normal: LineHeights.normal,
    relaxed: LineHeights.relaxed,
  },
} as const;

export const shadows = Shadows;

export const animation = Animations;

// Re-export Colors from unified design system
export const colors = Colors;

export const opacity = Opacity;

export const zIndex = ZIndex;
