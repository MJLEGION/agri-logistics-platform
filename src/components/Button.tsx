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
  AccessibilityRole,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import {
  Spacing,
  BorderRadius,
  Shadows,
  Gradients,
  Components,
} from '../config/designSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  gradient?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const Button = React.memo<ButtonProps>(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  gradient = true,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const getSizeStyle = (): ViewStyle => {
    const sizeStyles: Record<string, ViewStyle> = {
      sm: {
        height: Components.button.height.sm,
        paddingHorizontal: Components.button.paddingHorizontal.sm,
      },
      md: {
        height: Components.button.height.md,
        paddingHorizontal: Components.button.paddingHorizontal.md,
      },
      lg: {
        height: Components.button.height.lg,
        paddingHorizontal: Components.button.paddingHorizontal.lg,
      },
    };
    return sizeStyles[size];
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled || !gradient ? (disabled ? theme.textDisabled : theme.primary) : 'transparent',
        ...(!['outline', 'ghost'].includes(variant) && Shadows.md),
      },
      secondary: {
        backgroundColor: theme.backgroundAlt,
        borderWidth: 1,
        borderColor: theme.border,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? theme.textDisabled : theme.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: disabled || !gradient ? (disabled ? theme.textDisabled : theme.error) : 'transparent',
        ...Shadows.md,
      },
      success: {
        backgroundColor: disabled || !gradient ? (disabled ? theme.textDisabled : theme.success) : 'transparent',
        ...Shadows.md,
      },
      warning: {
        backgroundColor: disabled || !gradient ? (disabled ? theme.textDisabled : theme.warning) : 'transparent',
        ...Shadows.md,
      },
    };

    return {
      ...baseStyle,
      ...getSizeStyle(),
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      opacity: disabled ? 0.6 : 1,
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
      outline: { color: disabled ? theme.textDisabled : theme.primary, fontWeight: '600' },
      ghost: { color: disabled ? theme.textDisabled : theme.primary, fontWeight: '600' },
      danger: { color: '#FFFFFF', fontWeight: '600' },
      success: { color: '#FFFFFF', fontWeight: '600' },
      warning: { color: '#FFFFFF', fontWeight: '600' },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getLoaderColor = (): string => {
    return ['secondary', 'outline', 'ghost'].includes(variant) ? theme.primary : '#FFFFFF';
  };

  const getGradientColors = (): string[] => {
    if (disabled) {
      return [theme.textDisabled, theme.textDisabled];
    }
    const gradientMap: Record<string, string[]> = {
      primary: Gradients.primary,
      danger: Gradients.error,
      success: Gradients.success,
      warning: Gradients.warning,
      secondary: Gradients.secondary,
      outline: Gradients.primary,
      ghost: Gradients.primary,
    };
    return gradientMap[variant] || Gradients.primary;
  };

  const shouldUseGradient = () => {
    return gradient && !disabled && !['outline', 'ghost', 'secondary'].includes(variant);
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getLoaderColor()} size="small" />;
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <React.Fragment>{icon}</React.Fragment>
        )}
        <Text style={[getTextStyle(), textStyle, icon && { marginHorizontal: Spacing.xs }]}>
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <React.Fragment>{icon}</React.Fragment>
        )}
      </>
    );
  };

  const buttonContent = (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        getButtonStyle(),
        shouldUseGradient() && { backgroundColor: 'transparent' },
        style,
      ]}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || (loading ? 'Loading' : `${variant} button`)}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      {renderContent()}
    </TouchableOpacity>
  );

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && { width: '100%' },
      ]}
    >
      {shouldUseGradient() ? (
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            getButtonStyle(),
            { padding: 0 },
          ]}
        >
          {buttonContent}
        </LinearGradient>
      ) : (
        buttonContent
      )}
    </Animated.View>
  );
});

Button.displayName = 'Button';

export default Button;
