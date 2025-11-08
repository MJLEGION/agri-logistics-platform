// Enhanced Transporter Dashboard - Logistics-First Design
// Real-time load matching, route optimization, earnings tracking

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { fetchAllOrders } from '../../store/slices/ordersSlice';
import { fetchCargo } from '../../store/slices/cargoSlice';
import { fetchTransporterTrips } from '../../logistics/store/tripsSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { findBestMatches, calculateDailyEarningPotential } from '../../services/loadMatchingService';
import { calculateDistance } from '../../services/routeOptimizationService';
import { logger } from '../../utils/logger';

const { width } = Dimensions.get('window');

export default function EnhancedTransporterDashboard({ navigation }: any) {
  const { user } = useAppSelector(state => state.auth);
  const { orders } = useAppSelector(state => state.orders);
  const { cargo } = useAppSelector(state => state.cargo);
  const trips = useAppSelector(state => state.trips.trips);
  const dispatch = useAppDispatch();
  const { theme } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [bestMatches, setBestMatches] = useState<any[]>([]);
  const [dailyPotential, setDailyPotential] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Fetch data when screen loads
  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(fetchCargo());
    if (user?.id || user?._id) {
      dispatch(fetchTransporterTrips(user.id || user._id));
    }
    getCurrentLocation();
  }, [dispatch, user]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      logger.debug('EnhancedTransporterDashboard focused, refreshing data');

      const refreshData = async () => {
        try {
          await dispatch(fetchAllOrders());
          logger.debug('Orders fetched');
        } catch (err) {
          logger.error('Failed to fetch orders', err);
        }

        try {
          await dispatch(fetchCargo());
          logger.debug('Cargo fetched');
        } catch (err) {
          logger.error('Failed to fetch cargo', err);
        }

        const userId = user?.id || user?._id;
        if (userId) {
          try {
            await dispatch(fetchTransporterTrips(userId));
            logger.debug('Transporter trips fetched');
          } catch (err) {
            logger.error('Failed to fetch trips', err);
          }
        }

        try {
          await getCurrentLocation();
          logger.debug('Location updated');
        } catch (err) {
          logger.error('Failed to get location', err);
        }
      };

      refreshData();
    }, [dispatch, user])
  );

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('Location permission denied, using default location');
        setCurrentLocation({ latitude: -1.9706, longitude: 30.1044 });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      logger.error('Error getting location, using default', error);
      setCurrentLocation({ latitude: -1.9706, longitude: 30.1044 });
    }
  };

  // Calculate best matches when location, orders, or cargo change
  useEffect(() => {
    if (currentLocation && orders.length > 0) {
      const availableOrders = orders.filter(
        order => (order.status === 'accepted' || order.status === 'pending') && !order.transporterId
      );

      // Only use orders for matching for now (cargo doesn't have proper location structure)
      if (availableOrders.length > 0) {
        const matches = findBestMatches(currentLocation, availableOrders);
        setBestMatches(matches.slice(0, 3)); // Top 3 matches

        const potential = calculateDailyEarningPotential(currentLocation, availableOrders);
        setDailyPotential(potential);
      }
    }
  }, [currentLocation, orders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllOrders());
    await dispatch(fetchCargo());
    if (user?.id || user?._id) {
      await dispatch(fetchTransporterTrips(user.id || user._id));
    }
    await getCurrentLocation();
    setRefreshing(false);
  };

  // Calculate statistics using trips data (which updates in real-time)
  logger.debug('Dashboard statistics calculated', {
    totalTrips: trips.length,
    activeTripsCount: trips.filter(t => t.status === 'in_transit' || t.status === 'accepted').length,
  });

  const activeTrips = trips.filter(
    trip => trip.status === 'in_transit' || trip.status === 'accepted'
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
    // Fallback to distance-based calculation using pickup and delivery locations
    const pickupLat = trip.pickup?.latitude || trip.pickupLocation?.latitude;
    const pickupLng = trip.pickup?.longitude || trip.pickupLocation?.longitude;
    const deliveryLat = trip.delivery?.latitude || trip.deliveryLocation?.latitude;
    const deliveryLng = trip.delivery?.longitude || trip.deliveryLocation?.longitude;
    
    if (pickupLat && pickupLng && deliveryLat && deliveryLng) {
      const distance = calculateDistance(pickupLat, pickupLng, deliveryLat, deliveryLng);
      return sum + distance * 1200; // 1200 RWF per km
    }
    return sum;
  }, 0);

  // Count both orders and cargo as available loads
  // Only count cargo with status 'listed' - 'matched' means it's been accepted
  const availableOrders = orders.filter(
    order => (order.status === 'accepted' || order.status === 'pending') && !order.transporterId
  );

  const availableCargo = cargo.filter(
    c => c.status === 'listed'
  );

  const availableLoads = [...availableOrders, ...availableCargo];

  logger.debug('Available loads calculated', {
    availableOrders: availableOrders.length,
    availableCargo: availableCargo.length,
    totalAvailable: availableLoads.length,
  });

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    Alert.alert(
      isOnline ? 'Going Offline' : 'Going Online',
      isOnline
        ? 'You will stop receiving load requests'
        : 'You will start receiving load requests',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
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
                <Text style={styles.greeting}>Logistics Hub</Text>
                <Text style={styles.userName}>{user?.name}</Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isOnline ? '#10B981' : '#EF4444' },
                    ]}
                  />
                  <Text style={styles.role}>{isOnline ? 'Online' : 'Offline'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerRight}>
              <ThemeToggle />
              <TouchableOpacity
                style={[
                  styles.onlineToggle,
                  { backgroundColor: isOnline ? '#10B981' : '#EF4444' },
                ]}
                onPress={toggleOnlineStatus}
              >
                <Ionicons name={isOnline ? 'checkmark-circle' : 'close-circle'} size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#3B82F6' + '20' }]}>
              <Ionicons name="navigate" size={18} color="#3B82F6" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>{activeTrips.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#10B981' + '20' }]}>
              <Ionicons name="checkmark-done" size={18} color="#10B981" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {completedToday.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Today</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#F59E0B' + '20' }]}>
              <Ionicons name="cash" size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {(todayEarnings / 1000).toFixed(1)}K
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Earned</Text>
          </View>
        </View>

        {/* Daily Earning Potential */}
        {dailyPotential && isOnline && (
          <View style={[styles.potentialCard, { backgroundColor: theme.card }]}>
            <View style={styles.potentialHeader}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
              <Text style={[styles.potentialTitle, { color: theme.text }]}>
                Today's Earning Potential
              </Text>
            </View>
            <View style={styles.potentialStats}>
              <View style={styles.potentialItem}>
                <Text style={[styles.potentialValue, { color: '#10B981' }]}>
                  {dailyPotential.estimatedProfit.toLocaleString()} RWF
                </Text>
                <Text style={[styles.potentialLabel, { color: theme.textSecondary }]}>
                  Potential profit
                </Text>
              </View>
              <View style={styles.potentialDivider} />
              <View style={styles.potentialItem}>
                <Text style={[styles.potentialValue, { color: theme.text }]}>
                  {dailyPotential.possibleLoads}
                </Text>
                <Text style={[styles.potentialLabel, { color: theme.textSecondary }]}>
                  Possible loads
                </Text>
              </View>
              <View style={styles.potentialDivider} />
              <View style={styles.potentialItem}>
                <Text style={[styles.potentialValue, { color: theme.text }]}>
                  {dailyPotential.averagePerHour.toLocaleString()}
                </Text>
                <Text style={[styles.potentialLabel, { color: theme.textSecondary }]}>
                  RWF/hour
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Smart Load Matching */}
        {bestMatches.length > 0 && isOnline && (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Best Matches For You
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AvailableLoads')}>
                <Text style={[styles.seeAllText, { color: theme.tertiary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            {bestMatches.map((match, index) => (
              <TouchableOpacity
                key={match.load._id || match.load.id}
                style={[styles.matchCard, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate('AvailableLoads')}
              >
                {/* Priority Badge */}
                {match.priority === 'high' && (
                  <View style={styles.priorityBadge}>
                    <Ionicons name="star" size={10} color="#FFF" />
                    <Text style={styles.priorityText}>TOP MATCH</Text>
                  </View>
                )}

                <View style={styles.matchHeader}>
                  <View style={styles.matchTitleRow}>
                    <Ionicons name="cube" size={16} color={theme.tertiary} />
                    <Text style={[styles.matchTitle, { color: theme.text }]}>
                      {match.load.cropId?.name || 'Cargo Load'}
                    </Text>
                  </View>
                  <View style={[styles.scoreBox, { backgroundColor: theme.success + '15' }]}>
                    <Text style={[styles.scoreText, { color: theme.success }]}>
                      {match.score}
                    </Text>
                  </View>
                </View>

                <View style={styles.matchDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={14} color={theme.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                      {match.distance.toFixed(1)}km away · {match.eta} min
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="navigate" size={14} color={theme.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                      {match.routeDistance.toFixed(1)}km route
                    </Text>
                  </View>
                </View>

                <View style={styles.earningsRow}>
                  <View>
                    <Text style={[styles.earningsLabel, { color: theme.textSecondary }]}>
                      You'll earn
                    </Text>
                    <Text style={[styles.earningsAmount, { color: theme.success }]}>
                      {match.profit.toLocaleString()} RWF
                    </Text>
                  </View>
                  <View style={styles.reasonsContainer}>
                    {match.matchReasons.slice(0, 2).map((reason: string, i: number) => (
                      <View key={i} style={[styles.reasonChip, { backgroundColor: theme.tertiary + '15' }]}>
                        <Text style={[styles.reasonText, { color: theme.tertiary }]}>
                          {reason}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('AvailableLoads')}
            >
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.actionGradient}>
                <Ionicons name="map" size={32} color="#FFF" />
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{availableLoads.length}</Text>
                </View>
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Find Loads</Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                Available now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('ActiveTrips')}
            >
              <LinearGradient colors={['#10B981', '#059669']} style={styles.actionGradient}>
                <Ionicons name="car-sport" size={32} color="#FFF" />
                {activeTrips.length > 0 && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{activeTrips.length}</Text>
                  </View>
                )}
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>My Trips</Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                {activeTrips.length} active
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('EarningsDashboard')}
            >
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionGradient}>
                <Ionicons name="wallet" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Earnings</Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                View analytics
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('VehicleProfile')}
            >
              <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionGradient}>
                <Ionicons name="car" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>My Fleet</Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                Manage vehicles
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('RoutePlanner')}
            >
              <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.actionGradient}>
                <Ionicons name="map-outline" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Route Planner</Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                Optimize routes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('TripHistory')}
            >
              <LinearGradient colors={['#06B6D4', '#0891B2']} style={styles.actionGradient}>
                <Ionicons name="time" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Trip History</Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                View completed
              </Text>
            </TouchableOpacity>
          </View>

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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  role: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  onlineToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
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
  potentialCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  potentialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  potentialTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  potentialStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  potentialItem: {
    alignItems: 'center',
  },
  potentialValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  potentialLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  potentialDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  priorityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    alignItems: 'center',
    gap: 3,
  },
  priorityText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  matchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  scoreBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  matchDetails: {
    gap: 6,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '500',
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  earningsLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  earningsAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  reasonsContainer: {
    alignItems: 'flex-end',
    gap: 3,
  },
  reasonChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reasonText: {
    fontSize: 9,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'center',
    alignSelf: 'center',
    maxWidth: 600,
    width: '100%',
  },
  actionCard: {
    width: '30%',
    minWidth: 115,
    maxWidth: 150,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 300,
    alignSelf: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
