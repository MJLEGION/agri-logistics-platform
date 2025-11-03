import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, BorderRadius, Typography } from '../config/ModernDesignSystem';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  variant?: 'filled' | 'outlined';
  color?: string;
  icon?: string;
  avatar?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  onDelete,
  variant = 'filled',
  color,
  icon,
  avatar,
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();

  const getChipStyle = (): ViewStyle => {
    const baseColor = color || theme.primary;

    if (variant === 'outlined') {
      return {
        backgroundColor: selected ? baseColor + '15' : 'transparent',
        borderWidth: 1,
        borderColor: selected ? baseColor : theme.border,
      };
    }

    return {
      backgroundColor: selected ? baseColor : theme.gray100,
    };
  };

  const getTextColor = (): string => {
    const baseColor = color || theme.primary;

    if (variant === 'outlined') {
      return selected ? baseColor : theme.text;
    }

    return selected ? '#FFFFFF' : theme.text;
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[
        styles.chip,
        getChipStyle(),
        {
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      {avatar && <View style={styles.avatar}>{avatar}</View>}

      {icon && !avatar && (
        <Ionicons
          name={icon as any}
          size={16}
          color={getTextColor()}
          style={styles.icon}
        />
      )}

      <Text
        style={[
          styles.label,
          {
            color: getTextColor(),
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="close-circle"
            size={16}
            color={getTextColor()}
          />
        </TouchableOpacity>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  avatar: {
    marginRight: Spacing.xs,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  deleteButton: {
    marginLeft: Spacing.xs,
  },
});

export default Chip;
