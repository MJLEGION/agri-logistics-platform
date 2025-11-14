// Enhanced Avatar with profile picture support
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface EnhancedAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  gradient?: string[];
}

const sizeMap = {
  sm: 40,
  md: 56,
  lg: 72,
  xl: 96,
};

const iconSizeMap = {
  sm: 20,
  md: 28,
  lg: 36,
  xl: 48,
};

const statusSizeMap = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export default function EnhancedAvatar({
  name,
  imageUrl,
  size = 'md',
  showOnlineStatus = false,
  isOnline = false,
  icon,
  gradient = ['#10797D', '#0D5F66'],
}: EnhancedAvatarProps) {
  const avatarSize = sizeMap[size];
  const iconSize = iconSizeMap[size];
  const statusSize = statusSizeMap[size];

  const getInitials = () => {
    if (!name || typeof name !== 'string') return 'U';
    const trimmedName = name.trim();
    if (!trimmedName) return 'U';
    const names = trimmedName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return trimmedName.substring(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
        />
      ) : (
        <LinearGradient
          colors={gradient}
          style={[styles.gradient, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
        >
          {icon ? (
            <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
          ) : (
            <Text style={[styles.initials, { fontSize: avatarSize * 0.35 }]}>
              {getInitials()}
            </Text>
          )}
        </LinearGradient>
      )}

      {showOnlineStatus && (
        <View
          style={[
            styles.statusDot,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: isOnline ? '#10B981' : '#6B7280',
              bottom: size === 'sm' ? 0 : 2,
              right: size === 'sm' ? 0 : 2,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusDot: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
