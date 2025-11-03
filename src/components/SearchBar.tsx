import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, Shadows, Typography } from '../config/ModernDesignSystem';

interface SearchBarProps extends TextInputProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  showFilter?: boolean;
  onFilterPress?: () => void;
  containerStyle?: ViewStyle;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  onClear,
  onFocus,
  onBlur,
  variant = 'default',
  showFilter = false,
  onFilterPress,
  placeholder = 'Search...',
  containerStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
  };

  const handleSearch = () => {
    onSearch?.(value || '');
  };

  const getContainerStyle = (): ViewStyle => {
    const variants: Record<string, ViewStyle> = {
      default: {
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: isFocused ? theme.primary : theme.border,
        ...Shadows.sm,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: isFocused ? theme.primary : theme.border,
      },
      filled: {
        backgroundColor: theme.gray100,
        borderWidth: 0,
      },
    };
    return variants[variant];
  };

  return (
    <View
      style={[
        styles.container,
        getContainerStyle(),
        containerStyle,
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? theme.primary : theme.textTertiary}
        style={styles.searchIcon}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSearch}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          {
            color: theme.text,
          },
        ]}
        returnKeyType="search"
        {...props}
      />

      {value && value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons
            name="close-circle"
            size={20}
            color={theme.textTertiary}
          />
        </TouchableOpacity>
      )}

      {showFilter && (
        <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
          <Ionicons
            name="options-outline"
            size={20}
            color={theme.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    paddingVertical: Spacing.xs,
  },
  clearButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  filterButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
});

export default SearchBar;
