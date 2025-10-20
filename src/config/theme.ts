// src/config/theme.ts
// Inspired by Triad Plants - Clean, Professional, Minimalist Design
export const lightTheme = {
  // Primary Green Palette (Professional & Clean)
  primary: '#2D7A4F',        // Professional forest green (Triad-inspired)
  primaryLight: '#4CAF50',   // Fresh, vibrant green
  primaryDark: '#1B5E3F',    // Deep forest
  
  // Secondary Neutral Tones (Clean & Professional)
  secondary: '#5D6D7E',      // Professional gray-blue
  secondaryLight: '#95A5A6', // Light gray
  secondaryDark: '#34495E',  // Dark slate
  
  // Accent Colors (Subtle & Professional)
  accent: '#FF9800',         // Warm orange accent
  accentLight: '#FFB74D',    // Light orange
  accentGold: '#FFC107',     // Gold accent
  
  // Backgrounds (Clean White Base)
  background: '#FFFFFF',     // Pure white (Triad style)
  backgroundAlt: '#F8F9FA',  // Very light gray
  backgroundSection: '#FAFBFC', // Section background
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  
  // Text (Professional Hierarchy)
  text: '#2C3E50',           // Dark blue-gray (professional)
  textSecondary: '#7F8C8D',  // Medium gray
  textLight: '#BDC3C7',      // Light gray
  textMuted: '#95A5A6',      // Muted text
  
  // Borders & Dividers (Subtle)
  border: '#E8EAED',         // Very light border
  borderLight: '#F0F2F5',    // Ultra-light border
  divider: '#ECEFF1',        // Subtle divider
  
  // Status Colors (Professional)
  error: '#E74C3C',
  success: '#27AE60',
  warning: '#F39C12',
  info: '#3498DB',
  
  // Star Rating
  star: '#FFC107',           // Gold star color
  starEmpty: '#E0E0E0',      // Empty star
  
  // Legacy support
  tertiary: '#3498DB',
  
  // Gradients (Subtle & Professional)
  gradientStart: '#2D7A4F',
  gradientEnd: '#4CAF50',
  gradientOverlay: 'rgba(45, 122, 79, 0.05)',
  
  // Shadows (Subtle Elevation)
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
  shadowDark: 'rgba(0, 0, 0, 0.16)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Hover States
  hoverBackground: '#F5F7F9',
  hoverBorder: '#D1D5DB',
  
  isDark: false,
};

export const darkTheme = {
  // Primary Green Palette (Dark Mode)
  primary: '#4CAF50',
  primaryLight: '#66BB6A',
  primaryDark: '#2D7A4F',
  
  // Secondary Neutral Tones
  secondary: '#7F8C8D',
  secondaryLight: '#95A5A6',
  secondaryDark: '#5D6D7E',
  
  // Accent Colors
  accent: '#FF9800',
  accentLight: '#FFB74D',
  accentGold: '#FFC107',
  
  // Backgrounds (Dark Mode)
  background: '#1A1A1A',      // Dark background
  backgroundAlt: '#242424',   // Slightly lighter
  backgroundSection: '#2A2A2A', // Section background
  card: '#242424',
  cardElevated: '#2E2E2E',
  
  // Text (Dark Mode)
  text: '#ECEFF1',
  textSecondary: '#B0BEC5',
  textLight: '#78909C',
  textMuted: '#607D8B',
  
  // Borders & Dividers
  border: '#37474F',
  borderLight: '#2C3E50',
  divider: '#34495E',
  
  // Status Colors
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  info: '#42A5F5',
  
  // Star Rating
  star: '#FFC107',
  starEmpty: '#455A64',
  
  // Legacy support
  tertiary: '#42A5F5',
  
  // Gradients
  gradientStart: '#2D7A4F',
  gradientEnd: '#4CAF50',
  gradientOverlay: 'rgba(76, 175, 80, 0.1)',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowMedium: 'rgba(0, 0, 0, 0.5)',
  shadowDark: 'rgba(0, 0, 0, 0.6)',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Hover States
  hoverBackground: '#2E2E2E',
  hoverBorder: '#455A64',
  
  isDark: true,
};

export type Theme = typeof lightTheme;