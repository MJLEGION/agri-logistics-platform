// src/screens/transporter/TransporterHomeScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Animated, PanResponder, Pressable } from 'react-native';
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
          console.error('❌ Orders fetch error:', err);
        }
        
        try {
          await dispatch(fetchCargo());
                  } catch (err) {
          console.error('❌ Cargo fetch error:', err);
        }
        
        const userId = user?.id || user?._id;
        if (userId) {
          try {
            await dispatch(fetchTransporterTrips(userId));
                      } catch (err) {
            console.error('❌ Trips fetch error:', err);
          }
        } else {
          console.warn('⚠️ No user ID available');
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
        {/* Gradient Header */}
        <LinearGradient
          colors={['#F77F00', '#FCBF49']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Avatar
                name={user?.name || 'User'}
                size="lg"
                icon="car-sport"
                style={{ marginRight: 16 }}
              />
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Welcome back!</Text>
                <Text style={styles.userName}>{user?.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Text style={styles.role}>Transporter</Text>
                  <Badge label="Active" variant="success" size="sm" />
                </View>
              </View>
            </View>
            <ThemeToggle />
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
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 4,
  },
  role: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    marginTop: -20,
    justifyContent: 'center',
    alignSelf: 'center',
    maxWidth: 400,
    width: '100%',
  },
  statCard: {
    flex: 1,
    maxWidth: 110,
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '600',
  },
  // CTA Section
  ctaSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
  },

  content: {
    padding: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 6,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignSelf: 'center',
    maxWidth: 450,
    width: '100%',
  },
  actionCard: {
    width: '30%',
    minWidth: 90,
    maxWidth: 110,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 9,
    textAlign: 'center',
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