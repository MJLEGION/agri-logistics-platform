// src/screens/transporter/TransporterHomeScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Animated, PanResponder, Pressable, ImageBackground, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ListItem from '../../components/ListItem';
import Divider from '../../components/Divider';
import { fetchAllOrders } from '../../store/slices/ordersSlice';
import { fetchCargo } from '../../store/slices/cargoSlice';
import { fetchTransporterTrips } from '../../logistics/store/tripsSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { calculateDistance as calcDistance } from '../../services/routeOptimizationService';

export default function TransporterHomeScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.orders);
  const { cargo } = useAppSelector((state) => state.cargo);
  const trips = useAppSelector((state) => state.trips.trips);
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data when screen loads
  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(fetchCargo());
    if (user?.id || user?._id) {
      dispatch(fetchTransporterTrips(user.id || user._id));
    }
  }, [dispatch, user]);

  // Auto-refresh when screen comes into focus (e.g., returning after creating order or completing trip)
  useFocusEffect(
    React.useCallback(() => {
      
      const refreshData = async () => {
        try {
          await dispatch(fetchAllOrders());
        } catch (err) {
          console.error('Orders fetch error:', err);
        }
        
        try {
          await dispatch(fetchCargo());
        } catch (err) {
          console.error('Cargo fetch error:', err);
        }
        
        const userId = user?.id || user?._id;
        if (userId) {
          try {
            await dispatch(fetchTransporterTrips(userId));
          } catch (err) {
            console.error('Trips fetch error:', err);
          }
        } else {
          console.warn('No user ID available');
        }
      };
      
      refreshData();
    }, [dispatch, user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllOrders());
    await dispatch(fetchCargo());
    if (user?.id || user?._id) {
      await dispatch(fetchTransporterTrips(user.id || user._id));
    }
    setRefreshing(false);
  };

  const activeTrips = trips.filter(trip => 
    trip.status === 'in_transit' || trip.status === 'accepted'
  );
  
  const completedToday = trips.filter(trip => {
    if (trip.status !== 'completed') return false;
    const today = new Date().toDateString();
    const tripDate = new Date(trip.updatedAt || trip.createdAt).toDateString();
    return today === tripDate;
  });
    const todayEarnings = completedToday.reduce((sum, trip) => {
    // Use earnings from trip if available, otherwise calculate from distance
    if (trip.earnings?.totalRate) {
      return sum + trip.earnings.totalRate;
    }
    const distance = calculateDistance(trip);
    return sum + (distance * 1000);
  }, 0);

  // Total completed trips (all time)
  const totalCompletedTrips = trips.filter(trip => trip.status === 'completed').length;

  // Count available loads from both orders and cargo (that are listed and ready)
  // Only count cargo with status 'listed' - 'matched' means it's been accepted
  const availableLoads = orders.filter(
    order => (order.status === 'accepted' || order.status === 'pending') && !order.transporterId
  );

  const availableCargo = cargo.filter(
    c => c.status === 'listed'
  );
      const totalAvailableLoads = availableLoads.length + availableCargo.length;

  function calculateDistance(order: any) {
    if (!order.pickupLocation || !order.deliveryLocation) return 0;
    return calcDistance(
      order.pickupLocation.latitude,
      order.pickupLocation.longitude,
      order.deliveryLocation.latitude,
      order.deliveryLocation.longitude
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Header with Overlay */}
        <LinearGradient
          colors={['rgba(247, 127, 0, 0.85)', 'rgba(252, 191, 73, 0.75)']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerOverlay} />
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../../../assets/images/logos/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Welcome, {user?.name?.split(' ')[0]}!</Text>
                <Text style={styles.subtitle}>Start earning today</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Text style={styles.role}>Transporter</Text>
                  <Badge label="Active" variant="success" size="sm" />
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileSettings')}
                style={styles.headerIconButton}
              >
                <Ionicons name="settings-outline" size={20} color="#FFF" />
              </TouchableOpacity>
              <ThemeToggle />
            </View>
          </View>
        </LinearGradient>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#3B82F6' + '20' }]}>
              <Ionicons name="car" size={18} color="#3B82F6" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {activeTrips.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Active
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#10797D' + '20' }]}>
              <Ionicons name="checkmark-circle" size={18} color="#10797D" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {completedToday.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Today
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#F59E0B' + '20' }]}>
              <Ionicons name="cash" size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {(todayEarnings / 1000).toFixed(1)}K
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Earned
            </Text>
          </View>
        </View>

        {/* Featured CTA: Find Loads */}
        <View style={styles.ctaSection}>
          <TouchableOpacity 
            style={[styles.ctaButton, { backgroundColor: theme.tertiary }]}
            onPress={() => navigation.navigate('AvailableLoads')}
            activeOpacity={0.8}
          >
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Ready to earn?</Text>
              <Text style={styles.ctaSubtitle}>{totalAvailableLoads} loads available near you</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>

          <View style={styles.actionsGrid}>
            {/* Available Loads */}
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('AvailableLoads')}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.actionGradient}
              >
                <Ionicons name="location" size={24} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                Available Loads
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                {totalAvailableLoads} loads waiting
              </Text>
            </TouchableOpacity>

            {/* Active Trips */}
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('ActiveTrips')}
            >
              <LinearGradient
                colors={['#10797D', '#0D5F66']}
                style={styles.actionGradient}
              >
                <Ionicons name="car-sport" size={24} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                Active Trips
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                {activeTrips.length} ongoing
              </Text>
            </TouchableOpacity>

            {/* Earnings */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('EarningsDashboard')}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionGradient}
              >
                <Ionicons name="wallet" size={24} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                Earnings
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                View history
              </Text>
            </TouchableOpacity>

            {/* Vehicle Info */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('VehicleProfile')}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.actionGradient}
              >
                <Ionicons name="car" size={24} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                Vehicle Info
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                Manage details
              </Text>
            </TouchableOpacity>

            {/* Route Planner */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('RoutePlanner')}
            >
              <LinearGradient
                colors={['#EC4899', '#DB2777']}
                style={styles.actionGradient}
              >
                <Ionicons name="map" size={24} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                Route Planner
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                Optimize routes
              </Text>
            </TouchableOpacity>

            {/* Trip History */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('TripHistory')}
            >
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
                style={styles.actionGradient}
              >
                <Ionicons name="time" size={24} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                Trip History
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                {totalCompletedTrips} completed
              </Text>
            </TouchableOpacity>

            {/* Ratings & Feedback */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('TransporterRatings')}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionGradient}
              >
                <Ionicons name="star" size={24} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                My Ratings
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                View feedback & reviews
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          {activeTrips.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Active Trips
              </Text>
              {activeTrips.slice(0, 3).map((trip) => (
                <ListItem
                  key={trip._id || trip.id}
                  icon="car-sport"
                  title={trip.shipment?.cargoName || trip.shipment?.cropName || trip.cropId?.name || 'Order'}
                  subtitle={`${trip.pickupLocation?.address || 'Pickup'} → ${trip.deliveryLocation?.address || 'Delivery'}`}
                  rightElement={
                    <Badge
                      label={trip.status === 'in_progress' ? 'IN TRANSIT' : 'ACCEPTED'}
                      variant="primary"
                      size="sm"
                    />
                  }
                  chevron
                  onPress={() => navigation.navigate('ActiveTrips')}
                />
              ))}
            </View>
          )}

          <Divider spacing="lg" />

          <Button
            title="Logout"
            onPress={() => dispatch(logout())}
            variant="danger"
            size="lg"
            fullWidth
            icon={<Ionicons name="log-out-outline" size={20} color="#FFF" />}
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
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginRight: 16,
    borderRadius: 40,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    fontWeight: '500',
  },
  role: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
    marginTop: -24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  ctaSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.85,
  },

  content: {
    padding: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 18,
    marginTop: 12,
    letterSpacing: -0.4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
    justifyContent: 'center',
    alignSelf: 'center',
    maxWidth: 500,
    width: '100%',
  },
  actionCard: {
    width: '31%',
    minWidth: 95,
    maxWidth: 120,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  actionDesc: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  recentSection: {
    marginBottom: 16,
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});