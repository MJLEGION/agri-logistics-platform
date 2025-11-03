// src/components/ModernListItem.tsx - Modern List Item Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModernColors, Typography, Spacing, BorderRadius, Shadows } from '../config/ModernDesignSystem';

interface ModernListItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
  rightIcon?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function ModernListItem({
  title,
  subtitle,
  icon,
  iconColor = ModernColors.primary,
  badge,
  badgeColor = ModernColors.warning,
  rightIcon = 'chevron-forward',
  onPress,
  disabled = false,
  style,
}: ModernListItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        disabled && styles.disabled,
        style,
      ]}
    >
      {/* Left Icon */}
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon as any} size={24} color={iconColor} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={[Typography.labelLarge, styles.title]}>{title}</Text>
        {subtitle && (
          <Text style={[Typography.bodySmall, styles.subtitle]}>{subtitle}</Text>
        )}
      </View>

      {/* Badge */}
      {badge && (
        <View style={[styles.badge, { backgroundColor: `${badgeColor}20` }]}>
          <Text style={[Typography.labelSmall, { color: badgeColor }]}>{badge}</Text>
        </View>
      )}

      {/* Right Icon */}
      {rightIcon && (
        <Ionicons
          name={rightIcon as any}
          size={20}
          color={ModernColors.textSecondary}
          style={styles.rightIcon}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: ModernColors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.xs,
    ...Shadows.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    color: ModernColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: ModernColors.textSecondary,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginHorizontal: Spacing.md,
  },
  rightIcon: {
    marginLeft: Spacing.md,
  },
});