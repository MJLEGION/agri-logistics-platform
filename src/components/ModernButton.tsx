// src/components/ModernButton.tsx - Beautiful Modern Button Component
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ModernColors, ModernGradients, ModernComponents, ModernShadows } from '../config/ModernDesignSystem';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function ModernButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ModernButtonProps) {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonHeight = () => {
    switch (size) {
      case 'sm':
        return 36;
      case 'lg':
        return 56;
      default:
        return ModernComponents.button.height;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 16;
      default:
        return 14;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return ModernGradients.buttonPrimary;
      case 'secondary':
        return ModernGradients.buttonSecondary;
      case 'danger':
        return ModernGradients.danger;
      default:
        return ModernGradients.buttonPrimary;
    }
  };

  const getTextColor = () => {
    if (disabled) return ModernColors.textDisabled;
    switch (variant) {
      case 'outline':
      case 'ghost':
        return ModernColors.primary;
      default:
        return ModernColors.textPrimary;
    }
  };

  const buttonHeight = getButtonHeight();
  const textSize = getTextSize();
  const iconSize = getIconSize();

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {variant === 'outline' || variant === 'ghost' ? (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.button,
            {
              height: buttonHeight,
              backgroundColor: variant === 'outline' ? ModernColors.backgroundSecondary : 'transparent',
              borderWidth: variant === 'outline' ? 2 : 0,
              borderColor: variant === 'outline' ? ModernColors.primary : 'transparent',
              opacity: disabled ? 0.5 : 1,
            },
            fullWidth && styles.fullWidth,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={getTextColor()} size="small" />
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <MaterialCommunityIcons
                  name={icon}
                  size={iconSize}
                  color={getTextColor()}
                  style={{ marginRight: 8 }}
                />
              )}
              <Text
                style={[
                  {
                    fontSize: textSize,
                    color: getTextColor(),
                    fontWeight: '600',
                  },
                  textStyle,
                ]}
              >
                {title}
              </Text>
              {icon && iconPosition === 'right' && (
                <MaterialCommunityIcons
                  name={icon}
                  size={iconSize}
                  color={getTextColor()}
                  style={{ marginLeft: 8 }}
                />
              )}
            </>
          )}
        </TouchableOpacity>
      ) : (
        <LinearGradient
          colors={disabled ? ModernGradients.buttonDisabled : getColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            {
              height: buttonHeight,
              opacity: disabled ? 0.6 : 1,
            },
            fullWidth && styles.fullWidth,
          ]}
        >
          <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.buttonInner}
          >
            {loading ? (
              <ActivityIndicator color={ModernColors.textPrimary} size="small" />
            ) : (
              <>
                {icon && iconPosition === 'left' && (
                  <MaterialCommunityIcons
                    name={icon}
                    size={iconSize}
                    color={ModernColors.textPrimary}
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text
                  style={[
                    {
                      fontSize: textSize,
                      color: ModernColors.textPrimary,
                      fontWeight: '600',
                    },
                    textStyle,
                  ]}
                >
                  {title}
                </Text>
                {icon && iconPosition === 'right' && (
                  <MaterialCommunityIcons
                    name={icon}
                    size={iconSize}
                    color={ModernColors.textPrimary}
                    style={{ marginLeft: 8 }}
                  />
                )}
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    ...ModernShadows.md,
  },
  buttonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
});