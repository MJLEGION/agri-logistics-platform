import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../config/ModernDesignSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button = React.memo<ButtonProps>(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
      },
      md: {
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      lg: {
        paddingVertical: 16,
        paddingHorizontal: 32,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? theme.gray300 : theme.primary,
        ...Shadows.md,
      },
      secondary: {
        backgroundColor: theme.gray100,
        borderWidth: 1,
        borderColor: theme.border,
      },
      tertiary: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: disabled ? theme.gray300 : theme.danger,
        ...Shadows.md,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: '#FFFFFF', fontWeight: '600' },
      secondary: { color: theme.text, fontWeight: '600' },
      tertiary: { color: theme.primary, fontWeight: '600' },
      danger: { color: '#FFFFFF', fontWeight: '600' },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getLoaderColor = (): string => {
    return variant === 'secondary' ? theme.primary : '#FFFFFF';
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[getButtonStyle(), style]}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel={title}
        accessibilityRole="button"
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
      >
        {loading ? (
          <ActivityIndicator color={getLoaderColor()} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

Button.displayName = 'Button';

export default Button;
