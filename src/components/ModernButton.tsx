// src/components/ModernButton.tsx - DEPRECATED
// This file is maintained for backward compatibility
// Use src/components/Button.tsx for new code

import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from './Button';

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

/**
 * @deprecated Use Button component from ./Button.tsx instead
 * This component is maintained for backward compatibility only
 */
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
  // Convert icon string to ReactNode
  const iconNode = icon ? (
    <MaterialCommunityIcons
      name={icon as any}
      size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
      color="#FFFFFF"
    />
  ) : undefined;

  // Use unified Button component
  return (
    <Button
      title={title}
      onPress={onPress}
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      icon={iconNode}
      iconPosition={iconPosition}
      style={style}
      textStyle={textStyle}
      gradient={true}
    />
  );
}