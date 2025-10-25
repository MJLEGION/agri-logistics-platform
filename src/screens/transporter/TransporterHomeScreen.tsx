// src/screens/transporter/TransporterHomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { fetchAllOrders } from '../../store/slices/ordersSlice';
import { fetchCargo } from '../../store/slices/cargoSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { calculateDistance as calcDistance } from '../../services/routeOptimizationService';

export default function TransporterHomeScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.orders);
  const { cargo } = useAppSelector((state) => state.cargo);
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data when screen loads
  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(fetchCargo());
  }, [dispatch]);

  // Auto-refresh when screen comes into focus (e.g., returning after creating order)
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchAllOrders());
      dispatch(fetchCargo());
    }, [dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllOrders());
    await dispatch(fetchCargo());
    setRefreshing(false);
  };

  // Calculate statistics
  const myTrips = orders.filter(order => 
    order.transporterId === user?.id || order.transporterId?._id === user?.id
  );
  
  const activeTrips = myTrips.filter(order => 
    order.status === 'in_progress' || order.status === 'accepted'
  );
  
  const completedToday = myTrips.filter(order => {
    if (order.status !== 'completed') return false;
    const today = new Date().toDateString();
    const orderDate = new Date(order.updatedAt || order.createdAt).toDateString();
    return today === orderDate;
  });

  const todayEarnings = completedToday.reduce((sum, order) => {
    // Calculate earnings: distance * 1000 RWF/km
    const distance = calculateDistance(order);
    return sum + (distance * 1000);
  }, 0);

  // Count available loads from both orders and cargo (that are listed and ready)
  const availableLoads = orders.filter(
    order => (order.status === 'accepted' || order.status === 'pending') && !order.transporterId
  );
  
  const availableCargo = cargo.filter(
    c => c.status === 'listed' || c.status === 'matched'
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
              <View style={styles.avatarCircle}>
                <Ionicons name="car-sport" size={32} color="#FFF" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Welcome back!</Text>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.role}>🚛 Transporter</Text>
              </View>
            </View>
            <ThemeToggle />
          </View>
        </LinearGradient>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#3B82F6' + '20' }]}>
              <Ionicons name="car" size={24} color="#3B82F6" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {activeTrips.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Active Trips
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#10B981' + '20' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {completedToday.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Completed Today
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#F59E0B' + '20' }]}>
              <Ionicons name="cash" size={24} color="#F59E0B" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {todayEarnings.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Today's Earnings (RWF)
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
                <Ionicons name="location" size={32} color="#FFF" />
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
                colors={['#10B981', '#059669']}
                style={styles.actionGradient}
              >
                <Ionicons name="car-sport" size={32} color="#FFF" />
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
                <Ionicons name="wallet" size={32} color="#FFF" />
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
                <Ionicons name="car" size={32} color="#FFF" />
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
                <Ionicons name="map" size={32} color="#FFF" />
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
                <Ionicons name="time" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                Trip History
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                Past deliveries
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
                <TouchableOpacity
                  key={trip._id || trip.id}
                  style={[styles.activityCard, { backgroundColor: theme.card }]}
                  onPress={() => navigation.navigate('ActiveTrips')}
                >
                  <View style={styles.activityLeft}>
                    <View style={[styles.activityIcon, { backgroundColor: '#3B82F6' + '20' }]}>
                      <Ionicons name="car-sport" size={20} color="#3B82F6" />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityTitle, { color: theme.text }]}>
                        {trip.shipment?.cargoName || trip.shipment?.cropName || trip.cropId?.name || 'Order'}
                      </Text>
                      <Text style={[styles.activityDesc, { color: theme.textSecondary }]}>
                        {trip.pickupLocation?.address || 'Pickup'} → {trip.deliveryLocation?.address || 'Delivery'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#3B82F6' }]}>
                    <Text style={styles.statusText}>
                      {trip.status === 'in_progress' ? 'IN TRANSIT' : 'ACCEPTED'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: theme.error }]}
            onPress={() => dispatch(logout())}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  // CTA Section
  ctaSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },

  content: {
    padding: 16,
    maxWidth: 600,
    marginHorizontal: 'auto',
    width: '100%',
    alignItems: 'stretch',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: 24,
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