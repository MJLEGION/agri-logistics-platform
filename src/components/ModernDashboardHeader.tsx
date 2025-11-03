// src/components/ModernDashboardHeader.tsx - Reusable Dashboard Header
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ModernColors, ModernGradients, Typography, Spacing, BorderRadius } from '../config/ModernDesignSystem';

interface ModernDashboardHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  avatar?: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

export default function ModernDashboardHeader({
  title,
  subtitle,
  userName,
  userRole,
  onMenuPress,
  onNotificationPress,
  notificationCount = 0,
}: ModernDashboardHeaderProps) {
  return (
    <LinearGradient
      colors={ModernGradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header Top - Menu & Notifications */}
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={ModernColors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications" size={24} color={ModernColors.textPrimary} />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Header Content */}
      <View style={styles.content}>
        <Text style={[Typography.h2, styles.title]}>{title}</Text>
        {subtitle && <Text style={[Typography.body, styles.subtitle]}>{subtitle}</Text>}
      </View>

      {/* User Info */}
      {userName && (
        <View style={styles.userInfo}>
          <View style={styles.userDetails}>
            <Text style={[Typography.labelLarge, styles.userName]}>👋 {userName}</Text>
            {userRole && <Text style={[Typography.bodySmall, styles.userRole]}>{userRole}</Text>}
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: ModernColors.danger,
    borderRadius: BorderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ModernColors.primary,
  },
  notificationText: {
    color: ModernColors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    marginBottom: Spacing.lg,
  },
  title: {
    color: ModernColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: ModernColors.textSecondary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: ModernColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userRole: {
    color: ModernColors.textSecondary,
  },
});