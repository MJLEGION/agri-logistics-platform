// src/config/theme.ts
export const lightTheme = {
  primary: '#2E7D32',
  secondary: '#FF9800',
  tertiary: '#2196F3',
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#dddddd',
  error: '#f44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  shadow: 'rgba(0, 0, 0, 0.1)',
  isDark: false,
};

export const darkTheme = {
  primary: '#4CAF50',
  secondary: '#FFB74D',
  tertiary: '#64B5F6',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  info: '#42A5F5',
  shadow: 'rgba(0, 0, 0, 0.4)',
  isDark: true,
};

export type Theme = typeof lightTheme;