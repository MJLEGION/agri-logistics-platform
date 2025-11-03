// src/components/ModernCard.tsx - Beautiful Modern Card Component
import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ModernColors,
  ModernGradients,
  ModernBorderRadius,
  ModernShadows,
  ModernSpacing,
} from '../config/ModernDesignSystem';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outline' | 'filled' | 'gradient';
  padding?: number;
  onPress?: () => void;
  style?: ViewStyle;
  pressableStyle?: ViewStyle;
  gradient?: string[];
}

export default function ModernCard({
  children,
  variant = 'elevated',
  padding = ModernSpacing.lg,
  onPress,
  style,
  pressableStyle,
  gradient,
}: ModernCardProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'filled':
        return ModernColors.backgroundSecondary;
      case 'outline':
        return ModernColors.background;
      case 'elevated':
      default:
        return ModernColors.backgroundSecondary;
    }
  };

  const getBorderStyle = () => {
    switch (variant) {
      case 'outline':
        return {
          borderWidth: 1,
          borderColor: ModernColors.border,
        };
      default:
        return {};
    }
  };

  const getShadowStyle = () => {
    switch (variant) {
      case 'elevated':
        return ModernShadows.md;
      default:
        return {};
    }
  };

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          padding,
          ...getShadowStyle(),
          ...getBorderStyle(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (variant === 'gradient' && gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            padding: 0,
            overflow: 'hidden',
            ...getShadowStyle(),
          },
          style,
        ]}
      >
        <View style={{ padding }}>
          {children}
        </View>
      </LinearGradient>
    );
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressableStyle,
          pressed && { opacity: 0.8 },
        ]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: ModernBorderRadius.lg,
    backgroundColor: ModernColors.backgroundSecondary,
    overflow: 'hidden',
  },
});