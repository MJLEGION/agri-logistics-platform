import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  color,
  size = 'md',
  style,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const getSizeStyle = () => {
    const sizes = {
      sm: {
        width: 40,
        height: 24,
        thumbSize: 18,
        padding: 3,
      },
      md: {
        width: 48,
        height: 28,
        thumbSize: 22,
        padding: 3,
      },
      lg: {
        width: 56,
        height: 32,
        thumbSize: 26,
        padding: 3,
      },
    };
    return sizes[size];
  };

  const sizeStyle = getSizeStyle();

  const trackColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.gray300, color || theme.primary],
  });

  const thumbPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      sizeStyle.padding,
      sizeStyle.width - sizeStyle.thumbSize - sizeStyle.padding,
    ],
  });

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={style}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: sizeStyle.width,
            height: sizeStyle.height,
            backgroundColor: trackColor,
            opacity: disabled ? 0.5 : 1,
            borderRadius: sizeStyle.height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: sizeStyle.thumbSize,
              height: sizeStyle.thumbSize,
              borderRadius: sizeStyle.thumbSize / 2,
              transform: [{ translateX: thumbPosition }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
  },
  thumb: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default Switch;
