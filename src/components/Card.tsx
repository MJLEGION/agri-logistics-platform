import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../config/ModernDesignSystem';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
}) => {
  const { theme } = useTheme();

  const getPaddingStyle = (): ViewStyle => {
    const paddingMap = {
      sm: { padding: Spacing.md },
      md: { padding: Spacing.lg },
      lg: { padding: Spacing.xl },
    };
    return paddingMap[padding];
  };

  const getVariantStyle = (): ViewStyle => {
    const variantMap: Record<string, ViewStyle> = {
      default: {
        backgroundColor: theme.surface,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
      },
      elevated: {
        backgroundColor: theme.surface,
        borderRadius: BorderRadius.lg,
        ...Shadows.lg,
      },
      outlined: {
        backgroundColor: theme.isDark ? theme.surface : 'transparent',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: theme.border,
      },
      filled: {
        backgroundColor: theme.gray100,
        borderRadius: BorderRadius.lg,
      },
    };
    return variantMap[variant];
  };

  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress
    ? { onPress, activeOpacity: 0.7 }
    : {};

  return (
    <Container
      style={[
        styles.card,
        getPaddingStyle(),
        getVariantStyle(),
        style,
      ]}
      {...containerProps}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
});

export default Card;
