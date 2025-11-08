// src/components/common/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, typography, borderRadius } from '../../constants/designTokens';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  dot?: boolean;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  icon,
  dot = false,
  style,
}) => {
  const { theme } = useTheme();

  const variantColors: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
    success: {
      bg: theme.success + '15',
      text: theme.success,
      border: theme.success + '30',
    },
    warning: {
      bg: theme.warning + '15',
      text: theme.warning,
      border: theme.warning + '30',
    },
    error: {
      bg: theme.error + '15',
      text: theme.error,
      border: theme.error + '30',
    },
    info: {
      bg: theme.info + '15',
      text: theme.info,
      border: theme.info + '30',
    },
    neutral: {
      bg: theme.gray200,
      text: theme.gray700,
      border: theme.gray300,
    },
    primary: {
      bg: theme.primary + '15',
      text: theme.primary,
      border: theme.primary + '30',
    },
  };

  const sizeStyles = {
    sm: {
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
      fontSize: typography.fontSize.xs,
      iconSize: 10,
      dotSize: 6,
    },
    md: {
      paddingVertical: 4,
      paddingHorizontal: spacing.md,
      fontSize: typography.fontSize.sm,
      iconSize: 12,
      dotSize: 8,
    },
    lg: {
      paddingVertical: 6,
      paddingHorizontal: spacing.md,
      fontSize: typography.fontSize.base,
      iconSize: 14,
      dotSize: 10,
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantColors[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentVariant.bg,
          borderColor: currentVariant.border,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            {
              width: currentSize.dotSize,
              height: currentSize.dotSize,
              backgroundColor: currentVariant.text,
            },
          ]}
        />
      )}
      {icon && !dot && (
        <Ionicons
          name={icon}
          size={currentSize.iconSize}
          color={currentVariant.text}
          style={{ marginRight: spacing.xs }}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: currentVariant.text,
            fontSize: currentSize.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: typography.fontWeight.semibold,
  },
  dot: {
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
});

export default Badge;
