// src/components/common/EnhancedCard.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, borderRadius, shadows } from '../../constants/designTokens';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'gradient';
type CardSize = 'sm' | 'md' | 'lg';

interface EnhancedCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  onPress?: () => void;
  style?: ViewStyle;
  gradientColors?: [string, string];
  hover?: boolean;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  variant = 'elevated',
  size = 'md',
  onPress,
  style,
  gradientColors,
  hover = true,
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: { padding: spacing.md },
    md: { padding: spacing.lg },
    lg: { padding: spacing.xl },
  };

  const baseStyles: ViewStyle = {
    borderRadius: borderRadius.lg,
    ...sizeStyles[size],
  };

  const variantStyles: Record<CardVariant, ViewStyle> = {
    elevated: {
      backgroundColor: theme.card,
      ...shadows.md,
    },
    outlined: {
      backgroundColor: theme.card,
      borderWidth: 1.5,
      borderColor: theme.border,
      ...shadows.xs,
    },
    filled: {
      backgroundColor: theme.primary + '08',
      borderWidth: 1,
      borderColor: theme.primary + '20',
    },
    gradient: {
      overflow: 'hidden',
      ...shadows.lg,
    },
  };

  const CardContent = (
    <View style={[baseStyles, variantStyles[variant], style]}>
      {children}
    </View>
  );

  if (variant === 'gradient' && gradientColors) {
    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          baseStyles,
          variantStyles.gradient,
          style,
          { opacity: pressed && hover ? 0.92 : 1 },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ zIndex: 1 }}>{children}</View>
      </Pressable>
    );
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          baseStyles,
          variantStyles[variant],
          style,
          { opacity: pressed && hover ? 0.92 : 1 },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return CardContent;
};

export default EnhancedCard;
