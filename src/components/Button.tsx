// src/components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,  // Slightly less rounded for professional look
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    };

    // Size variations
    const sizeStyles = {
      small: { paddingVertical: 10, paddingHorizontal: 20 },
      medium: { paddingVertical: 14, paddingHorizontal: 28 },
      large: { paddingVertical: 16, paddingHorizontal: 32 },
    };

    // Variant styles - cleaner, more subtle
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: theme.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      secondary: {
        backgroundColor: theme.secondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.5 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: '#FFFFFF', fontWeight: '700' },
      secondary: { color: '#FFFFFF', fontWeight: '700' },
      outline: { color: theme.primary, fontWeight: '600' },
      ghost: { color: theme.primary, fontWeight: '600' },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  /**
   * Determine loader color based on button variant
   */
  const getLoaderColor = (): string => {
    if (variant === 'primary' || variant === 'secondary') {
      return '#FFFFFF';
    }
    return theme.primary;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={disabled ? 0.5 : 0.8}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});