// MODERN_SCREEN_EXAMPLE.tsx - Complete Example of a Modernized Screen
// Copy this pattern to update existing screens

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// ✅ Import design system
import {
  ModernColors,
  ModernGradients,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '../config/ModernDesignSystem';

// ✅ Import modern components
import ModernButton from '../components/ModernButton';
import ModernDashboardHeader from '../components/ModernDashboardHeader';
import ModernStatsGrid from '../components/ModernStatsGrid';
import ModernListItem from '../components/ModernListItem';

// Example: Modern Transporter Profile Screen
export default function ModernTransporterProfileScreen({ navigation }: any) {
  const [stats] = React.useState([
    {
      id: '1',
      label: 'Trips Completed',
      value: '156',
      icon: 'checkmark-circle',
      trend: 'up' as const,
      trendPercent: 18,
      color: ModernColors.success,
      onPress: () => console.log('Trips pressed'),
    },
    {
      id: '2',
      label: 'Total Earnings',
      value: '₦2.4M',
      icon: 'wallet',
      trend: 'up' as const,
      trendPercent: 24,
      color: ModernColors.primary,
      onPress: () => console.log('Earnings pressed'),
    },
    {
      id: '3',
      label: 'Rating',
      value: '4.8/5',
      icon: 'star',
      color: ModernColors.warning,
    },
    {
      id: '4',
      label: 'On-time Rate',
      value: '98%',
      icon: 'time',
      trend: 'stable' as const,
      color: ModernColors.secondary,
    },
  ]);

  const profileActions = [
    {
      id: '1',
      title: 'Active Trips',
      subtitle: 'Currently active deliveries',
      icon: 'navigate',
      onPress: () => navigation.navigate('ActiveTrips'),
    },
    {
      id: '2',
      title: 'Trip History',
      subtitle: 'View past deliveries',
      icon: 'history',
      onPress: () => navigation.navigate('TripHistory'),
    },
    {
      id: '3',
      title: 'Earnings',
      subtitle: 'View your income details',
      icon: 'trending-up',
      onPress: () => navigation.navigate('Earnings'),
    },
    {
      id: '4',
      title: 'Settings',
      subtitle: 'Manage your profile',
      icon: 'settings',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: ModernColors.background },
      ]}
    >
      {/* ✅ Use ModernDashboardHeader */}
      <ModernDashboardHeader
        title="My Profile"
        subtitle="Transporter Account"
        userName="Sarah Mwase"
        userRole="Professional Transporter"
        notificationCount={2}
        onMenuPress={() => console.log('Menu pressed')}
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ✅ Stats Grid Section */}
        <ModernStatsGrid stats={stats} columns={2} />

        {/* ✅ Profile Card Section */}
        <View style={styles.section}>
          <Text style={[Typography.h4, { color: ModernColors.textPrimary }]}>
            Vehicle Information
          </Text>

          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: ModernColors.backgroundSecondary,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.xl,
                borderRadius: BorderRadius.lg,
                marginTop: Spacing.md,
              },
              Shadows.md,
            ]}
          >
            {/* Vehicle Badge */}
            <View style={styles.vehicleBadge}>
              <Ionicons
                name="car"
                size={32}
                color={ModernColors.primary}
              />
              <View style={{ flex: 1 }}>
                <Text style={[Typography.labelLarge, { color: ModernColors.textPrimary }]}>
                  Toyota Hiace
                </Text>
                <Text style={[Typography.bodySmall, { color: ModernColors.textSecondary }]}>
                  RB 123 XY • 2020
                </Text>
              </View>
            </View>

            {/* Capacity Info */}
            <View style={[styles.infoRow, { marginTop: Spacing.lg }]}>
              <View>
                <Text style={[Typography.labelSmall, { color: ModernColors.textSecondary }]}>
                  Load Capacity
                </Text>
                <Text style={[Typography.body, { color: ModernColors.textPrimary }]}>
                  2000 kg
                </Text>
              </View>
              <View>
                <Text style={[Typography.labelSmall, { color: ModernColors.textSecondary }]}>
                  Insurance
                </Text>
                <Text style={[Typography.body, { color: ModernColors.success }]}>
                  ✓ Valid
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ✅ Quick Actions Section - Using ModernListItem */}
        <View style={styles.section}>
          <Text style={[Typography.h4, { color: ModernColors.textPrimary }]}>
            Quick Actions
          </Text>

          {profileActions.map((action) => (
            <ModernListItem
              key={action.id}
              title={action.title}
              subtitle={action.subtitle}
              icon={action.icon}
              iconColor={ModernColors.primary}
              rightIcon="chevron-forward"
              onPress={action.onPress}
              style={{ marginTop: Spacing.sm }}
            />
          ))}
        </View>

        {/* ✅ Performance Section */}
        <View style={styles.section}>
          <Text style={[Typography.h4, { color: ModernColors.textPrimary }]}>
            Performance Metrics
          </Text>

          <View
            style={[
              {
                backgroundColor: ModernColors.backgroundSecondary,
                paddingHorizontal: Spacing.lg,
                paddingVertical: Spacing.xl,
                borderRadius: BorderRadius.lg,
                marginTop: Spacing.md,
              },
              Shadows.md,
            ]}
          >
            {/* Metric Item */}
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Text style={[Typography.labelLarge, { color: ModernColors.textPrimary }]}>
                  Acceptance Rate
                </Text>
                <Text style={[Typography.h5, { color: ModernColors.success }]}>
                  95%
                </Text>
              </View>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: ModernColors.backgroundTertiary },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: ModernColors.success,
                      width: '95%',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: ModernColors.border, marginVertical: Spacing.lg }} />

            {/* Metric Item */}
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Text style={[Typography.labelLarge, { color: ModernColors.textPrimary }]}>
                  On-Time Delivery
                </Text>
                <Text style={[Typography.h5, { color: ModernColors.success }]}>
                  98%
                </Text>
              </View>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: ModernColors.backgroundTertiary },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: ModernColors.success,
                      width: '98%',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ✅ CTA Button Section */}
        <View style={styles.ctaSection}>
          <ModernButton
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            variant="primary"
            size="lg"
            icon="create"
            fullWidth
          />
          <ModernButton
            title="View All Documents"
            onPress={() => navigation.navigate('Documents')}
            variant="outline"
            size="lg"
            icon="document-text"
            fullWidth
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  profileCard: {
    // All styling is inline in the component
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    marginBottom: Spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  ctaSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
});