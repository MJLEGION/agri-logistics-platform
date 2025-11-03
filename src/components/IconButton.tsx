import React, { useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../config/ModernDesignSystem';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined' | 'ghost';
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  color,
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const getSizeStyle = (): ViewStyle => {
    const sizes = {
      sm: {
        width: 32,
        height: 32,
        iconSize: 16,
      },
      md: {
        width: 40,
        height: 40,
        iconSize: 20,
      },
      lg: {
        width: 48,
        height: 48,
        iconSize: 24,
      },
    };
    return sizes[size];
  };

  const getVariantStyle = (): ViewStyle => {
    const variants: Record<string, ViewStyle> = {
      default: {
        backgroundColor: theme.gray100,
      },
      filled: {
        backgroundColor: color || theme.primary,
        ...Shadows.sm,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: color || theme.border,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };
    return variants[variant];
  };

  const getIconColor = (): string => {
    if (variant === 'filled') {
      return '#FFFFFF';
    }
    return color || theme.text;
  };

  const sizeStyle = getSizeStyle();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          {
            width: sizeStyle.width,
            height: sizeStyle.height,
            borderRadius: BorderRadius.full,
            opacity: disabled ? 0.5 : 1,
          },
          getVariantStyle(),
          style,
        ]}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <Ionicons
          name={icon as any}
          size={sizeStyle.iconSize}
          color={getIconColor()}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconButton;
