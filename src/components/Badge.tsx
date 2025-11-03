import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, Typography } from '../config/ModernDesignSystem';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'gray',
  size = 'md',
  icon,
  style,
}) => {
  const { theme } = useTheme();

  const getVariantStyle = (): ViewStyle => {
    const variantMap: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: theme.primary + '15',
      },
      success: {
        backgroundColor: theme.success + '15',
      },
      warning: {
        backgroundColor: theme.warning + '15',
      },
      danger: {
        backgroundColor: theme.danger + '15',
      },
      gray: {
        backgroundColor: theme.gray200,
      },
    };
    return variantMap[variant];
  };

  const getTextColor = (): string => {
    const colorMap: Record<string, string> = {
      primary: theme.primary,
      success: theme.success,
      warning: theme.warning,
      danger: theme.danger,
      gray: theme.text,
    };
    return colorMap[variant];
  };

  const getSizeStyle = (): ViewStyle => {
    const sizeMap: Record<string, ViewStyle> = {
      sm: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
      },
      md: {
        paddingVertical: 4,
        paddingHorizontal: Spacing.md,
      },
      lg: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
      },
    };
    return sizeMap[size];
  };

  return (
    <View
      style={[
        styles.badge,
        {
          borderRadius: BorderRadius.sm,
        },
        getVariantStyle(),
        getSizeStyle(),
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: size === 'sm' ? 11 : size === 'md' ? 12 : 13,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});

export default Badge;
