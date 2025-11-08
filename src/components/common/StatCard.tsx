// src/components/common/StatCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../constants/designTokens';
import Badge from './Badge';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  badge?: {
    label: string;
    variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  };
  gradientColors?: [string, string];
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  gradientColors,
  onPress,
}) => {
  const { theme } = useTheme();

  const Content = (
    <View style={styles.container}>
      {/* Icon Container */}
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
        {gradientColors ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <Ionicons name={icon} size={28} color={gradientColors ? '#FFFFFF' : theme.primary} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textSecondary }]} numberOfLines={1}>
            {title}
          </Text>
          {badge && <Badge label={badge.label} variant={badge.variant} size="sm" />}
        </View>

        <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
          {value}
        </Text>

        {(subtitle || trend) && (
          <View style={styles.footer}>
            {subtitle && (
              <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
            {trend && (
              <View style={styles.trendContainer}>
                <Ionicons
                  name={trend.isPositive ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={trend.isPositive ? theme.success : theme.error}
                />
                <Text
                  style={[
                    styles.trendText,
                    { color: trend.isPositive ? theme.success : theme.error },
                  ]}
                >
                  {trend.value}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }, shadows.md]}
        onPress={onPress}
        activeOpacity={0.92}
      >
        {Content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.card }, shadows.md]}>
      {Content}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 120,
  },
  container: {
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trendText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default StatCard;
