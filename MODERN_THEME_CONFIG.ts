// MODERN MINIMALIST THEME - For src/config/theme.ts
// This is the updated color system focused on clean, modern design

export const modernLightTheme = {
  // ========================================
  // PRIMARY: Modern Teal (Professional + Modern)
  // ========================================
  primary: '#0F766E',            // Teal - main action color
  primaryLight: '#14B8A6',       // Light teal
  primaryLighter: '#99F6E4',     // Very light teal (for badges)
  primaryDark: '#0D5A5E',        // Dark teal
  
  // ========================================
  // STATUS COLORS: Clear & Intentional
  // ========================================
  success: '#059669',            // Modern green (ratings, completions)
  warning: '#D97706',            // Warm amber (warnings, pending)
  error: '#DC2626',              // Clean red (errors, failures)
  info: '#0284C7',               // Bright blue (information)
  
  // ========================================
  // TEXT: Hierarchy-based
  // ========================================
  text: '#111827',               // Almost black - primary text
  textSecondary: '#6B7280',      // Medium gray - secondary text
  textTertiary: '#9CA3AF',       // Light gray - tertiary text
  textMuted: '#D1D5DB',          // Very light gray - muted text
  
  // ========================================
  // BACKGROUNDS: Clean & Minimal
  // ========================================
  background: '#FFFFFF',         // Pure white
  backgroundAlt: '#F9FAFB',      // Barely off-white
  backgroundSecondary: '#F3F4F6',// Light gray background
  
  // ========================================
  // CARDS & SURFACES
  // ========================================
  card: '#FFFFFF',               // White cards
  cardElevated: '#FFFFFF',       // Elevated cards (same, use shadow)
  cardHover: '#F9FAFB',          // On hover
  cardBorder: 'rgba(0, 0, 0, 0)', // No border in modern design
  
  // ========================================
  // BORDERS & DIVIDERS
  // ========================================
  border: '#E5E7EB',             // Light border
  borderLight: '#F3F4F6',        // Ultra light border
  divider: '#F0F0F0',            // Subtle divider
  
  // ========================================
  // SHADOWS & ELEVATION (Subtle)
  // ========================================
  shadow: 'rgba(0, 0, 0, 0.05)',     // Subtle
  shadowMedium: 'rgba(0, 0, 0, 0.08)', // Medium
  shadowDark: 'rgba(0, 0, 0, 0.12)',   // Darker
  
  // ========================================
  // OVERLAYS
  // ========================================
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // ========================================
  // RATINGS
  // ========================================
  star: '#FBBF24',               // Amber stars
  starEmpty: '#E5E7EB',          // Light gray empty
  
  // ========================================
  // GRADIENTS (Subtle)
  // ========================================
  gradientStart: '#0F766E',
  gradientEnd: '#14B8A6',
  gradientOverlay: 'rgba(15, 118, 110, 0.05)',
  
  // ========================================
  // STATE COLORS
  // ========================================
  disabled: '#D1D5DB',           // Disabled state
  hoverBackground: '#F9FAFB',    // Hover state
  hoverBorder: '#D1D5DB',        // Hover border
  
  // ========================================
  // LEGACY SUPPORT
  // ========================================
  secondary: '#6B7280',          // Use textSecondary
  secondaryLight: '#9CA3AF',     // Use textTertiary
  secondaryDark: '#374151',      // Use textSecondary
  accent: '#0284C7',             // Use info or primary
  accentLight: '#7DD3FC',        // Use info light
  accentGold: '#FBBF24',         // Use star
  tertiary: '#0284C7',           // Use info
  
  isDark: false,
};

export const modernDarkTheme = {
  // ========================================
  // PRIMARY: Teal (adjusted for dark mode)
  // ========================================
  primary: '#14B8A6',            // Lighter teal for dark
  primaryLight: '#2DD4BF',       // Even lighter
  primaryLighter: '#067857',     // Darker teal for badges
  primaryDark: '#0F766E',        // Darker
  
  // ========================================
  // STATUS COLORS: Dark mode versions
  // ========================================
  success: '#10B981',            // Green
  warning: '#F59E0B',            // Amber
  error: '#F87171',              // Light red
  info: '#38BDF8',               // Light blue
  
  // ========================================
  // TEXT: Dark mode hierarchy
  // ========================================
  text: '#F8FAFC',               // Almost white
  textSecondary: '#CBD5E1',      // Light gray
  textTertiary: '#94A3B8',       // Medium gray
  textMuted: '#64748B',          // Darker gray
  
  // ========================================
  // BACKGROUNDS: Dark
  // ========================================
  background: '#0F172A',         // Deep dark
  backgroundAlt: '#1E293B',      // Slightly lighter
  backgroundSecondary: '#334155',// Light gray for sections
  
  // ========================================
  // CARDS & SURFACES
  // ========================================
  card: '#1E293B',               // Dark cards
  cardElevated: '#293548',       // Slightly lighter
  cardHover: '#334155',          // On hover
  cardBorder: 'rgba(255, 255, 255, 0)', // No border
  
  // ========================================
  // BORDERS & DIVIDERS
  // ========================================
  border: '#334155',             // Dark border
  borderLight: '#475569',        // Light dark border
  divider: '#1E293B',            // Subtle divider
  
  // ========================================
  // SHADOWS & ELEVATION
  // ========================================
  shadow: 'rgba(0, 0, 0, 0.3)',     // More visible in dark
  shadowMedium: 'rgba(0, 0, 0, 0.5)',
  shadowDark: 'rgba(0, 0, 0, 0.7)',
  
  // ========================================
  // OVERLAYS
  // ========================================
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // ========================================
  // RATINGS
  // ========================================
  star: '#FBBF24',               // Keep amber for contrast
  starEmpty: '#475569',          // Dark gray
  
  // ========================================
  // GRADIENTS
  // ========================================
  gradientStart: '#0F766E',
  gradientEnd: '#14B8A6',
  gradientOverlay: 'rgba(20, 184, 166, 0.1)',
  
  // ========================================
  // STATE COLORS
  // ========================================
  disabled: '#475569',           // Disabled state
  hoverBackground: '#334155',    // Hover state
  hoverBorder: '#475569',        // Hover border
  
  // ========================================
  // LEGACY SUPPORT
  // ========================================
  secondary: '#CBD5E1',
  secondaryLight: '#94A3B8',
  secondaryDark: '#64748B',
  accent: '#38BDF8',
  accentLight: '#7DD3FC',
  accentGold: '#FBBF24',
  tertiary: '#38BDF8',
  
  isDark: true,
};

export type Theme = typeof modernLightTheme;

// ========================================================================
// HOW TO USE IN YOUR THEME.TS:
// ========================================================================
// Replace your current lightTheme and darkTheme with these modern versions.
// The color names are the same so no component changes are needed!
//
// Example:
// export const lightTheme = modernLightTheme;
// export const darkTheme = modernDarkTheme;
// ========================================================================

// ========================================================================
// TYPOGRAPHY SYSTEM (Add to your theme.ts)
// ========================================================================
export const typography = {
  // Heading 1 - Screen titles
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  
  // Heading 2 - Section headers
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  
  // Heading 3 - Card titles, subsections
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  
  // Body - Primary text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  // Small - Secondary text
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  
  // Tiny - Labels and captions
  tiny: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
};

// ========================================================================
// SPACING SYSTEM (Use consistently)
// ========================================================================
export const spacing = {
  // Micro
  xs: 4,
  sm: 8,
  
  // Standard
  md: 12,
  lg: 16,
  xl: 20,
  
  // Large
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  
  // Screen padding
  screenPaddingH: 20,  // Horizontal padding
  screenPaddingV: 24,  // Vertical padding
  
  // Card/Element spacing
  elementSpacing: 16,  // Between elements
  sectionSpacing: 24,  // Between sections
};

// ========================================================================
// BORDER RADIUS SYSTEM
// ========================================================================
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

// ========================================================================
// SHADOW SYSTEM
// ========================================================================
export const shadows = {
  // Light shadow for cards
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Medium shadow
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Dark shadow for modals/overlays
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};

// ========================================================================
// COLOR USAGE GUIDE
// ========================================================================
/*
PRIMARY ACTIONS:
- Buttons (Save, Submit, Add) → primary
- Links → primary
- Active states → primary

SECONDARY ACTIONS:
- Cancel, Back buttons → border with text
- Secondary actions → transparent with border

TEXT:
- Main content → text
- Secondary info → textSecondary
- Hints, placeholders → textTertiary
- Disabled → textMuted

STATUS:
- Success (completed, delivered) → success
- Warning (pending, processing) → warning
- Error (failed, rejected) → error
- Info (new, update) → info

RATINGS:
- Filled stars → star
- Empty stars → starEmpty

BACKGROUNDS:
- Screen backgrounds → background
- Alternate sections → backgroundAlt
- Cards → card (with subtle shadow, no border)
*/