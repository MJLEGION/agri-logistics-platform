import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, Typography, BorderRadius } from '../config/ModernDesignSystem';
import Avatar from './Avatar';

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  avatar?: string;
  avatarName?: string;
  icon?: string;
  onPress?: () => void;
  chevron?: boolean;
  divider?: boolean;
  style?: ViewStyle;
}

const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leftElement,
  rightElement,
  avatar,
  avatarName,
  icon,
  onPress,
  chevron = false,
  divider = true,
  style,
}) => {
  const { theme } = useTheme();

  const renderLeftElement = () => {
    if (leftElement) {
      return <View style={styles.leftElement}>{leftElement}</View>;
    }

    if (avatar || avatarName) {
      return (
        <Avatar
          source={avatar}
          name={avatarName}
          size="md"
          style={styles.avatar}
        />
      );
    }

    if (icon) {
      return (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.gray100 },
          ]}
        >
          <Ionicons
            name={icon as any}
            size={20}
            color={theme.primary}
          />
        </View>
      );
    }

    return null;
  };

  const renderRightElement = () => {
    if (rightElement) {
      return <View style={styles.rightElement}>{rightElement}</View>;
    }

    if (chevron) {
      return (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.textTertiary}
        />
      );
    }

    return null;
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <>
      <Container
        onPress={onPress}
        style={[styles.container, style]}
        activeOpacity={onPress ? 0.7 : 1}
      >
        {renderLeftElement()}

        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: theme.text },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>

          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                { color: theme.textSecondary },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}

          {description && (
            <Text
              style={[
                styles.description,
                { color: theme.textTertiary },
              ]}
              numberOfLines={2}
            >
              {description}
            </Text>
          )}
        </View>

        {renderRightElement()}
      </Container>

      {divider && (
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.border },
          ]}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  leftElement: {
    marginRight: Spacing.md,
  },
  avatar: {
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.bodySmall,
    marginBottom: 2,
  },
  description: {
    ...Typography.bodyTiny,
  },
  rightElement: {
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    marginLeft: Spacing.lg + 40 + Spacing.md, // Align with content
  },
});

export default ListItem;
