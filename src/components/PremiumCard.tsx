// src/components/PremiumCard.tsx - Premium Card Component
import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PREMIUM_THEME } from '../config/premiumTheme';

interface PremiumCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  gradient?: boolean;
  gradientColors?: string[];
  highlighted?: boolean;
}

export default function PremiumCard({
  children,
  style,
  gradient = false,
  gradientColors,
  highlighted = false,
}: PremiumCardProps) {
  const cardStyle = [
    styles.card,
    highlighted && styles.highlighted,
    style,
  ];

  const content = (
    <View style={cardStyle}>
      {children}
    </View>
  );

  if (gradient && gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientContainer, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: PREMIUM_THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: PREMIUM_THEME.colors.border,
    padding: PREMIUM_THEME.spacing.lg,
    marginBottom: PREMIUM_THEME.spacing.md,
    overflow: 'hidden',
    ...PREMIUM_THEME.shadows.md,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    }),
  },
  gradientContainer: {
    borderRadius: PREMIUM_THEME.borderRadius.lg,
    padding: PREMIUM_THEME.spacing.lg,
    marginBottom: PREMIUM_THEME.spacing.md,
    overflow: 'hidden',
    ...PREMIUM_THEME.shadows.lg,
  },
  highlighted: {
    borderColor: PREMIUM_THEME.colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
});