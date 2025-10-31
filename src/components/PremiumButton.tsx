// src/components/PremiumButton.tsx - Premium Button Component
import React, { useRef } from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PREMIUM_THEME } from '../config/premiumTheme';

interface PremiumButtonProps {
  label?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

export default function PremiumButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  children,
}: PremiumButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Rotation animation for loading state
  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [loading]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: PREMIUM_THEME.spacing.sm,
          fontSize: 12,
        };
      case 'lg':
        return {
          padding: PREMIUM_THEME.spacing.lg,
          fontSize: 16,
        };
      default:
        return {
          padding: PREMIUM_THEME.spacing.md,
          fontSize: 14,
        };
    }
  };

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return ['#FF6B35', '#FF8C42'];
      case 'secondary':
        return ['#004E89', '#0066BB'];
      case 'accent':
        return ['#27AE60', '#2ECC71'];
      default:
        return ['#FF6B35', '#FF8C42'];
    }
  };

  const sizeStyle = getSizeStyles();

  const buttonContent = (
    <Animated.View
      style={[
        styles.button,
        variant === 'primary' || variant === 'secondary' || variant === 'accent'
          ? styles.gradientButton
          : variant === 'outline'
          ? styles.outlineButton
          : styles.ghostButton,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={styles.pressable}
      >
        {variant === 'primary' || variant === 'secondary' || variant === 'accent' ? (
          <LinearGradient
            colors={getVariantColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.contentContainer}>
              {icon && iconPosition === 'left' && (
                <Animated.View
                  style={loading ? { transform: [{ rotate: spin }] } : undefined}
                >
                  <MaterialCommunityIcons
                    name={icon}
                    size={sizeStyle.fontSize + 4}
                    color="#FFF"
                    style={styles.icon}
                  />
                </Animated.View>
              )}
              {children ? (
                children
              ) : (
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: sizeStyle.fontSize,
                      fontWeight: '700',
                    },
                    textStyle,
                  ]}
                >
                  {loading ? 'Loading...' : label}
                </Text>
              )}
              {icon && iconPosition === 'right' && (
                <Animated.View
                  style={loading ? { transform: [{ rotate: spin }] } : undefined}
                >
                  <MaterialCommunityIcons
                    name={icon}
                    size={sizeStyle.fontSize + 4}
                    color="#FFF"
                    style={styles.icon}
                  />
                </Animated.View>
              )}
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.contentContainer}>
            {icon && iconPosition === 'left' && (
              <MaterialCommunityIcons
                name={icon}
                size={sizeStyle.fontSize + 4}
                color={variant === 'outline' ? '#FFF' : PREMIUM_THEME.colors.textSecondary}
                style={styles.icon}
              />
            )}
            {children ? (
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: sizeStyle.fontSize,
                    fontWeight: '700',
                    color: variant === 'outline' ? '#FFF' : PREMIUM_THEME.colors.textSecondary,
                  },
                  textStyle,
                ]}
              >
                {children}
              </Text>
            ) : (
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: sizeStyle.fontSize,
                    fontWeight: '700',
                    color: variant === 'outline' ? '#FFF' : PREMIUM_THEME.colors.textSecondary,
                  },
                  textStyle,
                ]}
              >
                {loading ? 'Loading...' : label}
              </Text>
            )}
            {icon && iconPosition === 'right' && (
              <MaterialCommunityIcons
                name={icon}
                size={sizeStyle.fontSize + 4}
                color={variant === 'outline' ? '#FFF' : PREMIUM_THEME.colors.textSecondary}
                style={styles.icon}
              />
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );

  return buttonContent;
}

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    borderRadius: PREMIUM_THEME.borderRadius.lg,
    marginBottom: PREMIUM_THEME.spacing.md,
  },
  pressable: {
    width: '100%',
  },
  gradientButton: {
    ...PREMIUM_THEME.shadows.lg,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: PREMIUM_THEME.colors.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingVertical: PREMIUM_THEME.spacing.md,
    paddingHorizontal: PREMIUM_THEME.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  gradient: {
    paddingVertical: PREMIUM_THEME.spacing.md,
    paddingHorizontal: PREMIUM_THEME.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#FFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  icon: {
    marginHorizontal: 4,
  },
});