// src/components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../constants/designTokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  gradient?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  gradient = false,
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      fontSize: typography.fontSize.sm,
      iconSize: 16,
    },
    md: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontSize: typography.fontSize.md,
      iconSize: 20,
    },
    lg: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      fontSize: typography.fontSize.lg,
      iconSize: 24,
    },
  };

  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: {
      bg: theme.primary,
      text: '#FFFFFF',
    },
    secondary: {
      bg: theme.secondary,
      text: '#FFFFFF',
    },
    outline: {
      bg: 'transparent',
      text: theme.primary,
      border: theme.primary,
    },
    ghost: {
      bg: 'transparent',
      text: theme.primary,
    },
    danger: {
      bg: theme.error,
      text: '#FFFFFF',
    },
    success: {
      bg: theme.success,
      text: '#FFFFFF',
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle = {
    paddingVertical: currentSize.paddingVertical,
    paddingHorizontal: currentSize.paddingHorizontal,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...(variant !== 'ghost' && shadows.sm),
    ...(fullWidth && { width: '100%' }),
    ...(currentVariant.border && { borderWidth: 2, borderColor: currentVariant.border }),
    ...(isDisabled && { opacity: 0.5 }),
  };

  const textStyle: TextStyle = {
    fontSize: currentSize.fontSize,
    fontWeight: typography.fontWeight.semibold,
    color: currentVariant.text,
  };

  const ButtonContent = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={currentVariant.text} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={currentSize.iconSize} color={currentVariant.text} />
          )}
          <Text style={textStyle}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={currentSize.iconSize} color={currentVariant.text} />
          )}
        </>
      )}
    </>
  );

  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[buttonStyle, style, { overflow: 'hidden', backgroundColor: 'transparent' }]}
      >
        <LinearGradient
          colors={[theme.primary, theme.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {ButtonContent}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[buttonStyle, { backgroundColor: currentVariant.bg }, style]}
    >
      {ButtonContent}
    </TouchableOpacity>
  );
};

export default Button;
