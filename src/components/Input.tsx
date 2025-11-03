import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, Typography } from '../config/ModernDesignSystem';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: 'default' | 'filled';
  helperText?: string;
  icon?: string;
  containerStyle?: ViewStyle;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({
    label,
    error,
    variant = 'default',
    helperText,
    icon,
    containerStyle,
    style,
    ...props
  }, ref) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const getInputStyle = (): any => {
      const baseStyle = {
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
        color: theme.text,
        backgroundColor: variant === 'filled' ? theme.gray100 : theme.surface,
      };

      const focusedStyle = isFocused && {
        borderColor: theme.primary,
        backgroundColor: theme.surface,
      };

      const errorStyle = error && {
        borderColor: theme.danger,
        backgroundColor: theme.isDark
          ? theme.surface
          : 'rgba(239, 68, 68, 0.05)',
      };

      const borderStyle =
        variant === 'default'
          ? {
              borderWidth: 1,
              borderColor: error ? theme.danger : theme.border,
            }
          : {
              borderBottomWidth: isFocused ? 2 : 1,
              borderBottomColor: isFocused ? theme.primary : theme.border,
            };

      return {
        ...baseStyle,
        ...borderStyle,
        ...(isFocused && focusedStyle),
        ...(error && errorStyle),
        paddingLeft: icon ? Spacing.xxxl + Spacing.md : Spacing.md,
      };
    };

    return (
      <View style={containerStyle}>
        {label && (
          <Text
            style={[
              styles.label,
              {
                color: error ? theme.danger : theme.text,
                fontWeight: '600',
              },
            ]}
          >
            {label}
          </Text>
        )}

        <View style={styles.inputContainer}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={20}
              color={isFocused ? theme.primary : theme.textTertiary}
              style={styles.icon}
            />
          )}
          <TextInput
            ref={ref}
            style={[getInputStyle(), style]}
            placeholderTextColor={theme.textMuted}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </View>

        {error && (
          <Text
            style={[
              styles.errorText,
              {
                color: theme.danger,
              },
            ]}
          >
            {error}
          </Text>
        )}

        {helperText && !error && (
          <Text
            style={[
              styles.helperText,
              {
                color: theme.textTertiary,
              },
            ]}
          >
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  icon: {
    position: 'absolute',
    left: Spacing.md,
    top: Spacing.md,
    zIndex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});

export default Input;
