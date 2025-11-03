import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { BorderRadius, Shadows } from '../config/ModernDesignSystem';

interface AvatarProps {
  source?: ImageSourcePropType | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  badge?: boolean;
  badgeColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  icon?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'md',
  name,
  badge,
  badgeColor,
  onPress,
  style,
  icon,
}) => {
  const { theme } = useTheme();

  const getSizeStyle = () => {
    const sizes = {
      xs: { width: 24, height: 24, fontSize: 10 },
      sm: { width: 32, height: 32, fontSize: 12 },
      md: { width: 48, height: 48, fontSize: 18 },
      lg: { width: 64, height: 64, fontSize: 24 },
      xl: { width: 96, height: 96, fontSize: 36 },
    };
    return sizes[size];
  };

  const getInitials = (name: string): string => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getBackgroundColor = (name: string): string => {
    const colors = [
      theme.primary,
      theme.secondary,
      theme.success,
      theme.warning,
      '#8B5CF6',
      '#EC4899',
      '#F59E0B',
    ];
    const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return colors[charCode % colors.length];
  };

  const sizeStyle = getSizeStyle();

  const renderContent = () => {
    if (source) {
      const imageSource = typeof source === 'string' ? { uri: source } : source;
      return (
        <Image
          source={imageSource}
          style={[styles.image, sizeStyle]}
          resizeMode="cover"
        />
      );
    }

    if (icon) {
      return (
        <View
          style={[
            styles.iconContainer,
            sizeStyle,
            { backgroundColor: theme.gray200 },
          ]}
        >
          <Ionicons
            name={icon as any}
            size={sizeStyle.fontSize}
            color={theme.textSecondary}
          />
        </View>
      );
    }

    if (name) {
      return (
        <View
          style={[
            styles.initialsContainer,
            sizeStyle,
            { backgroundColor: getBackgroundColor(name) },
          ]}
        >
          <Text style={[styles.initials, { fontSize: sizeStyle.fontSize }]}>
            {getInitials(name)}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.placeholderContainer,
          sizeStyle,
          { backgroundColor: theme.gray200 },
        ]}
      >
        <Ionicons
          name="person"
          size={sizeStyle.fontSize}
          color={theme.textTertiary}
        />
      </View>
    );
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      style={[styles.container, style]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {renderContent()}
      {badge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor || theme.success,
              width: sizeStyle.width * 0.3,
              height: sizeStyle.width * 0.3,
              borderRadius: sizeStyle.width * 0.15,
            },
          ]}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderRadius: BorderRadius.full,
  },
  initialsContainer: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  iconContainer: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContainer: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default Avatar;
