// src/components/ModernStatsGrid.tsx - Reusable Stats Grid Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModernColors, Typography, Spacing, BorderRadius, Shadows } from '../config/ModernDesignSystem';

export interface StatItem {
  id: string;
  label: string;
  value: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercent?: number;
  onPress?: () => void;
  color?: string;
}

interface ModernStatsGridProps {
  stats: StatItem[];
  columns?: number;
}

export default function ModernStatsGrid({ stats, columns = 2 }: ModernStatsGridProps) {
  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return ModernColors.success;
      case 'down':
        return ModernColors.danger;
      default:
        return ModernColors.textSecondary;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove-horizontal';
    }
  };

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <TouchableOpacity
          key={stat.id}
          style={[
            styles.statCard,
            { width: `${100 / columns}%` },
            stat.onPress && styles.pressable,
          ]}
          onPress={stat.onPress}
          activeOpacity={0.8}
          disabled={!stat.onPress}
        >
          <View style={styles.cardContent}>
            {/* Icon */}
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${stat.color || ModernColors.primary}20`,
                },
              ]}
            >
              <Ionicons
                name={stat.icon as any}
                size={28}
                color={stat.color || ModernColors.primary}
              />
            </View>

            {/* Label */}
            <Text style={[Typography.bodySmall, styles.label]}>{stat.label}</Text>

            {/* Value */}
            <Text style={[Typography.h4, styles.value]}>{stat.value}</Text>

            {/* Trend */}
            {stat.trend && (
              <View style={styles.trendContainer}>
                <Ionicons
                  name={getTrendIcon(stat.trend) as any}
                  size={14}
                  color={getTrendColor(stat.trend)}
                />
                <Text style={[Typography.labelSmall, { color: getTrendColor(stat.trend) }]}>
                  {stat.trendPercent && `${stat.trendPercent}%`}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
  },
  statCard: {
    paddingHorizontal: Spacing.sm,
  },
  cardContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: ModernColors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  pressable: {
    // Add slight press feedback
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    color: ModernColors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  value: {
    color: ModernColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});