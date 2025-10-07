// src/config/theme.ts
export const lightTheme = {
  // Primary Agricultural Green Palette
  primary: '#2D6A4F',        // Deep forest green
  primaryLight: '#52B788',   // Fresh leaf green
  primaryDark: '#1B4332',    // Dark forest
  
  // Secondary Earth Tones
  secondary: '#D4A574',      // Warm earth/wheat
  secondaryLight: '#E9C9A6', // Light sand
  secondaryDark: '#A67C52',  // Rich soil
  
  // Accent Colors
  accent: '#F77F00',         // Vibrant orange (harvest)
  accentLight: '#FCBF49',    // Golden yellow
  
  // Backgrounds
  background: '#F8F9FA',     // Soft white
  backgroundAlt: '#E8F5E9',  // Light green tint
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  
  // Text
  text: '#1A1A1A',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  
  // Borders & Dividers
  border: '#DEE2E6',
  borderLight: '#E9ECEF',
  divider: '#E0E0E0',
  
  // Status Colors
  error: '#DC3545',
  success: '#52B788',
  warning: '#F77F00',
  info: '#0077B6',
  
  // Legacy support
  tertiary: '#0077B6',
  
  // Gradients
  gradientStart: '#2D6A4F',
  gradientEnd: '#52B788',
  
  // Shadows
  shadow: 'rgba(45, 106, 79, 0.15)',
  shadowDark: 'rgba(0, 0, 0, 0.1)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  isDark: false,
};

export const darkTheme = {
  // Primary Agricultural Green Palette (adjusted for dark mode)
  primary: '#52B788',
  primaryLight: '#74C69D',
  primaryDark: '#2D6A4F',
  
  // Secondary Earth Tones
  secondary: '#D4A574',
  secondaryLight: '#E9C9A6',
  secondaryDark: '#A67C52',
  
  // Accent Colors
  accent: '#F77F00',
  accentLight: '#FCBF49',
  
  // Backgrounds
  background: '#0D1B2A',      // Deep navy-black
  backgroundAlt: '#1B263B',   // Lighter navy
  card: '#1B263B',
  cardElevated: '#253447',
  
  // Text
  text: '#F8F9FA',
  textSecondary: '#ADB5BD',
  textLight: '#6C757D',
  
  // Borders & Dividers
  border: '#415A77',
  borderLight: '#2C3E50',
  divider: '#34495E',
  
  // Status Colors
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  info: '#42A5F5',
  
  // Legacy support
  tertiary: '#42A5F5',
  
  // Gradients
  gradientStart: '#2D6A4F',
  gradientEnd: '#52B788',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowDark: 'rgba(0, 0, 0, 0.6)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  isDark: true,
};

export type Theme = typeof lightTheme;