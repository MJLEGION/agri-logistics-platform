// src/config/premiumTheme.ts - Premium Design System
export const PREMIUM_THEME = {
  colors: {
    // Primary colors
    primary: '#FF6B35',
    secondary: '#004E89',
    accent: '#27AE60',
    warning: '#F39C12',
    danger: '#E74C3C',
    info: '#3498DB',
    
    // Backgrounds
    background: '#0F1419',
    backgroundAlt: '#1A1F2E',
    backgroundLight: '#242B38',
    
    // Text
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    
    // Borders
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    
    // Card
    card: 'rgba(255, 255, 255, 0.08)',
  },
  
  typography: {
    h1: {
      fontSize: 48,
      fontWeight: '900' as const,
      letterSpacing: -1,
    },
    h2: {
      fontSize: 36,
      fontWeight: '800' as const,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 28,
      fontWeight: '700' as const,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 24,
      fontWeight: '700' as const,
      letterSpacing: 0.5,
    },
    body: {
      fontSize: 16,
      fontWeight: '500' as const,
      letterSpacing: 0.3,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      letterSpacing: 0.2,
    },
    label: {
      fontSize: 12,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
    caption: {
      fontSize: 11,
      fontWeight: '500' as const,
      letterSpacing: 0.3,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.4,
      shadowRadius: 30,
      elevation: 12,
    },
  },
  
  gradients: {
    primary: ['#FF6B35', '#FF8C42'],
    secondary: ['#004E89', '#0066BB'],
    accent: ['#27AE60', '#2ECC71'],
    warning: ['#F39C12', '#F1C40F'],
    danger: ['#E74C3C', '#C0392B'],
    glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
    dark: ['#0F1419', '#1A1F2E'],
  },
};

export type ThemeType = typeof PREMIUM_THEME;