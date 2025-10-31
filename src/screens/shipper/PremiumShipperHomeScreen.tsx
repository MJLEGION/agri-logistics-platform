// src/screens/shipper/PremiumShipperHomeScreen.tsx - Premium Shipper Home
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PremiumScreenWrapper from '../../components/PremiumScreenWrapper';
import PremiumCard from '../../components/PremiumCard';
import PremiumButton from '../../components/PremiumButton';
import { PREMIUM_THEME } from '../../config/premiumTheme';

export default function PremiumShipperHomeScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const quickActions = [
    { icon: 'plus-circle', label: 'New Cargo', color: '#FF6B35' },
    { icon: 'list-box', label: 'My Cargo', color: '#004E89' },
    { icon: 'truck-check', label: 'Active Orders', color: '#27AE60' },
    { icon: 'history', label: 'History', color: '#F39C12' },
  ];

  const activeShipments = [
    {
      id: 1,
      destination: 'Kigali Market',
      origin: 'Rural Farm',
      status: 'In Transit',
      distance: 42,
      eta: '2 hours',
      product: 'Fresh Tomatoes',
      icon: 'truck-fast',
    },
    {
      id: 2,
      destination: 'Butare Distribution',
      origin: 'Central Farm',
      status: 'Accepted',
      distance: 85,
      eta: '4 hours',
      product: 'Maize Bags',
      icon: 'clock-outline',
    },
  ];

  return (
    <PremiumScreenWrapper showNavBar={true} scrollable={true}>
      {/* Header Banner */}
      <Animated.View
        style={[
          styles.bannerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FF6B35', '#FF8C42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerGreeting}>Welcome Back!</Text>
            <Text style={styles.bannerName}>John Farmer</Text>
            <Text style={styles.bannerSubtext}>2 active shipments • 8 completed</Text>
          </View>
          <MaterialCommunityIcons name="farm" size={80} color="rgba(255,255,255,0.2)" />
        </LinearGradient>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View style={[styles.quickActionsContainer, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Pressable
              key={index}
              onPress={() => {
                // Navigate based on action
                if (action.label === 'New Cargo') navigation.navigate('EditCargo');
                if (action.label === 'My Cargo') navigation.navigate('MyCargo');
                if (action.label === 'Active Orders') navigation.navigate('ShipperActiveOrders');
              }}
            >
              <Animated.View
                style={[
                  styles.actionCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [50 - index * 5, -index * 5],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={[action.color, action.color + '80']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionIconBg}
                >
                  <MaterialCommunityIcons name={action.icon} size={28} color="#FFF" />
                </LinearGradient>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Animated.View>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* Active Shipments */}
      <Animated.View style={[styles.shipmentsSection, { opacity: fadeAnim }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Shipments</Text>
          <Pressable onPress={() => navigation.navigate('ShipperActiveOrders')}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        {activeShipments.map((shipment) => (
          <Pressable
            key={shipment.id}
            onPress={() => navigation.navigate('OrderTracking', { orderId: shipment.id })}
          >
            <PremiumCard highlighted={shipment.status === 'In Transit'}>
              <View style={styles.shipmentHeader}>
                <View style={styles.shipmentTitleContainer}>
                  <MaterialCommunityIcons
                    name={shipment.icon}
                    size={24}
                    color={PREMIUM_THEME.colors.primary}
                  />
                  <View style={styles.shipmentTitles}>
                    <Text style={styles.shipmentProduct}>{shipment.product}</Text>
                    <Text style={styles.shipmentRoute}>
                      {shipment.origin} → {shipment.destination}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        shipment.status === 'In Transit'
                          ? 'rgba(255, 107, 53, 0.2)'
                          : 'rgba(0, 78, 137, 0.2)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          shipment.status === 'In Transit'
                            ? PREMIUM_THEME.colors.primary
                            : PREMIUM_THEME.colors.secondary,
                      },
                    ]}
                  >
                    {shipment.status}
                  </Text>
                </View>
              </View>

              <View style={styles.shipmentDetails}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={PREMIUM_THEME.colors.textTertiary} />
                  <Text style={styles.detailText}>{shipment.distance} km away</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={PREMIUM_THEME.colors.textTertiary} />
                  <Text style={styles.detailText}>ETA: {shipment.eta}</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#FF6B35', '#FF8C42']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    {
                      width:
                        shipment.status === 'In Transit'
                          ? '65%'
                          : shipment.status === 'Accepted'
                          ? '30%'
                          : '10%',
                    },
                  ]}
                />
              </View>
            </PremiumCard>
          </Pressable>
        ))}
      </Animated.View>

      {/* Stats */}
      <Animated.View style={[styles.statsSection, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        <View style={styles.statsGrid}>
          <PremiumCard>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Total Shipments</Text>
            <View style={styles.statTrend}>
              <MaterialCommunityIcons name="trending-up" size={14} color={PREMIUM_THEME.colors.accent} />
              <Text style={styles.statTrendText}>+2 this week</Text>
            </View>
          </PremiumCard>
          <PremiumCard>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
            <View style={styles.statTrend}>
              <MaterialCommunityIcons name="star" size={14} color={PREMIUM_THEME.colors.warning} />
              <Text style={styles.statTrendText}>Excellent</Text>
            </View>
          </PremiumCard>
        </View>
      </Animated.View>

      {/* CTA */}
      <Animated.View style={[styles.ctaSection, { opacity: fadeAnim }]}>
        <PremiumButton
          label="Create New Shipment"
          variant="primary"
          size="lg"
          icon="plus"
          iconPosition="left"
          onPress={() => navigation.navigate('EditCargo')}
        />
      </Animated.View>
    </PremiumScreenWrapper>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    marginBottom: 24,
  },
  banner: {
    borderRadius: PREMIUM_THEME.borderRadius.lg,
    padding: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...PREMIUM_THEME.shadows.lg,
  },
  bannerContent: {
    flex: 1,
  },
  bannerGreeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  bannerName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  bannerSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  quickActionsContainer: {
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: PREMIUM_THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: PREMIUM_THEME.colors.border,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: PREMIUM_THEME.colors.text,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: PREMIUM_THEME.colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: PREMIUM_THEME.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },

  shipmentsSection: {
    marginBottom: 32,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shipmentTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shipmentTitles: {
    flex: 1,
  },
  shipmentProduct: {
    fontSize: 14,
    fontWeight: '700',
    color: PREMIUM_THEME.colors.text,
  },
  shipmentRoute: {
    fontSize: 12,
    color: PREMIUM_THEME.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  shipmentDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: PREMIUM_THEME.colors.textSecondary,
    fontWeight: '500',
  },

  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: PREMIUM_THEME.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: PREMIUM_THEME.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statTrendText: {
    fontSize: 11,
    color: PREMIUM_THEME.colors.accent,
    fontWeight: '600',
  },

  ctaSection: {
    marginBottom: 40,
  },
});