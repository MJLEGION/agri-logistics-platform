// src/components/ModernStatCard.tsx - Beautiful Stat/Metric Card
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ModernColors,
  ModernGradients,
  ModernBorderRadius,
  ModernSpacing,
  ModernShadows,
  ModernTypography,
} from '../config/ModernDesignSystem';

interface ModernStatCardProps {
  icon?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  gradient?: string[];
  backgroundColor?: string;
  iconColor?: string;
  onPress?: () => void;
}

export default function ModernStatCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  gradient = ModernGradients.cardGradient,
  backgroundColor,
  iconColor = ModernColors.primary,
  onPress,
}: ModernStatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'minus';
    }
  };

  const getTrendColor = () => {
    if (!trend) return ModernColors.textSecondary;
    switch (trend.direction) {
      case 'up':
        return ModernColors.success;
      case 'down':
        return ModernColors.danger;
      default:
        return ModernColors.warning;
    }
  };

  const cardContent = (
    <View style={[styles.card, backgroundColor && { backgroundColor }]}>
      {/* Header with icon and trend */}
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { borderColor: iconColor }]}>
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={iconColor}
            />
          </View>
        )}
        {trend && (
          <View style={[styles.trendContainer, { borderColor: getTrendColor() }]}>
            <MaterialCommunityIcons
              name={getTrendIcon()}
              size={14}
              color={getTrendColor()}
            />
            <Text style={[styles.trendValue, { color: getTrendColor() }]}>
              {trend.value}%
            </Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Value */}
      <Text style={styles.value}>{value}</Text>

      {/* Subtitle */}
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && { opacity: 0.8 }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {cardContent}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {cardContent}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: ModernBorderRadius.lg,
    overflow: 'hidden',
    ...ModernShadows.md,
  },
  card: {
    padding: ModernSpacing.lg,
    backgroundColor: 'rgba(26, 31, 46, 0.8)',
    borderRadius: ModernBorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ModernSpacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 13,
    color: ModernColors.textSecondary,
    fontWeight: '500',
    marginBottom: ModernSpacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    ...ModernTypography.h3,
    color: ModernColors.textPrimary,
    marginBottom: ModernSpacing.sm,
  },
  subtitle: {
    fontSize: 12,
    color: ModernColors.textTertiary,
    fontWeight: '400',
  },
});