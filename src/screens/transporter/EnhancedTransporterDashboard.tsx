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
import { showToast } from '../../services/toastService';
import * as backendRatingService from '../../services/backendRatingService';

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
  const [ratingStats, setRatingStats] = useState<any>(null);

  // Fetch transporter rating stats
  const fetchRatingStats = async () => {
    try {
      const userId = user?.id || user?._id;
      if (!userId) {
        console.warn('No user ID found for rating stats');
        setRatingStats({ averageRating: 0, totalRatings: 0 });
        return;
      }
      console.log('Fetching rating stats for user:', userId);
      const stats = await backendRatingService.getTransporterStats(userId);
      console.log('Rating stats response:', stats);
      if (stats) {
        setRatingStats({
          averageRating: stats.averageRating || 0,
          totalRatings: stats.totalRatings || 0,
        });
        logger.debug('Rating stats fetched', stats);
      } else {
        setRatingStats({ averageRating: 0, totalRatings: 0 });
      }
    } catch (error) {
      console.error('Error fetching rating stats:', error);
      logger.error('Failed to fetch rating stats', error);
      setRatingStats({ averageRating: 0, totalRatings: 0 });
    }
  };

  // Fetch data when screen loads
  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(fetchCargo());
    if (user?.id || user?._id) {
      dispatch(fetchTransporterTrips(user.id || user._id));
    }
    getCurrentLocation();
    // fetchRatingStats();
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

        // try {
        //   await fetchRatingStats();
        //   logger.debug('Rating stats updated');
        // } catch (err) {
        //   logger.error('Failed to fetch rating stats', err);
        // }
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
    if (currentLocation) {
      const availableOrders = orders.filter(
        order => (order.status === 'accepted' || order.status === 'pending') && !order.transporterId
      );

      const availableCargo = cargo.filter(
        c => c.status === 'listed'
      );

      // Transform cargo to match Load interface format
      const transformedCargo = availableCargo
        .filter(c => c.location && c.destination) // Only cargo with both pickup and destination
        .map(c => ({
          _id: c._id || c.id,
          id: c.id || c._id,
          pickupLocation: {
            latitude: c.location.latitude,
            longitude: c.location.longitude,
            address: c.location.address || 'Pickup location',
          },
          deliveryLocation: {
            latitude: c.destination!.latitude,
            longitude: c.destination!.longitude,
            address: c.destination!.address || 'Delivery location',
          },
          weight: c.quantity,
          quantity: c.quantity,
          cropId: { name: c.name },
          status: c.status,
          totalPrice: (c.pricePerUnit || 0) * c.quantity,
          shippingCost: c.shippingCost || 0, // Transport fee calculated when cargo was created
          urgency: undefined,
        }));

      // Combine both orders and transformed cargo
      const allAvailableLoads = [...availableOrders, ...transformedCargo];

      if (allAvailableLoads.length > 0) {
        const matches = findBestMatches(currentLocation, allAvailableLoads);
        setBestMatches(matches.slice(0, 3)); // Top 3 matches

        const potential = calculateDailyEarningPotential(currentLocation, allAvailableLoads);
        setDailyPotential(potential);
      } else {
        // No loads available
        setBestMatches([]);
        setDailyPotential(null);
      }
    }
  }, [currentLocation, orders, cargo]);

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
    showToast.success(
      isOnline
        ? 'Going offline - You will stop receiving load requests'
        : 'Going online - You will start receiving load requests'
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
                {ratingStats && typeof ratingStats.totalRatings === 'number' && ratingStats.totalRatings > 0 && (
                  <TouchableOpacity
                    style={styles.ratingRow}
                    onPress={() => {
                      try {
                        console.log('Navigating to TransporterRatings');
                        (navigation as any).navigate('TransporterRatings');
                      } catch (err) {
                        console.error('Navigation error:', err);
                      }
                    }}
                  >
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {(typeof ratingStats.averageRating === 'number' ? ratingStats.averageRating : 0).toFixed(1)} ({ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'rating' : 'ratings'})
                    </Text>
                    <Ionicons name="chevron-forward" size={12} color="#FFF" />
                  </TouchableOpacity>
                )}
                {(!ratingStats || ratingStats.totalRatings === 0) && (
                  <TouchableOpacity
                    style={styles.ratingRow}
                    onPress={() => {
                      try {
                        console.log('Navigating to TransporterRatings (no ratings yet)');
                        (navigation as any).navigate('TransporterRatings');
                      } catch (err) {
                        console.error('Navigation error:', err);
                      }
                    }}
                  >
                    <Ionicons name="star-outline" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>View ratings & feedback</Text>
                    <Ionicons name="chevron-forward" size={12} color="#FFF" />
                  </TouchableOpacity>
                )}
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isOnline ? '#10797D' : '#EF4444' },
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
                  { backgroundColor: isOnline ? '#10797D' : '#EF4444' },
                ]}
                onPress={toggleOnlineStatus}
              >
                <Ionicons name={isOnline ? 'checkmark-circle' : 'close-circle'} size={16} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('ProfileSettings')}
              >
                <Ionicons name="settings" size={24} color="#FFF" />
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
            <View style={[styles.statIconBox, { backgroundColor: '#10797D' + '20' }]}>
              <Ionicons name="checkmark-done" size={18} color="#10797D" />
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
              <Ionicons name="trending-up" size={24} color="#10797D" />
              <Text style={[styles.potentialTitle, { color: theme.text }]}>
                Today's Earning Potential
              </Text>
              <View style={[styles.liveBadge, { backgroundColor: '#10797D' }]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            {/* Main Stats */}
            <View style={styles.potentialStats}>
              <View style={styles.potentialItem}>
                <Text style={[styles.potentialValue, { color: '#10797D' }]}>
                  {(dailyPotential.estimatedProfit / 1000).toFixed(0)}K
                </Text>
                <Text style={[styles.potentialLabel, { color: theme.textSecondary }]}>
                  Potential profit
                </Text>
              </View>
              <View style={styles.potentialDivider} />
              <View style={styles.potentialItem}>
                <Text style={[styles.potentialValue, { color: theme.text }]}>
                  {availableLoads.length}
                </Text>
                <Text style={[styles.potentialLabel, { color: theme.textSecondary }]}>
                  Available loads
                </Text>
              </View>
              <View style={styles.potentialDivider} />
              <View style={styles.potentialItem}>
                <Text style={[styles.potentialValue, { color: theme.text }]}>
                  {(dailyPotential.averagePerHour / 1000).toFixed(1)}K
                </Text>
                <Text style={[styles.potentialLabel, { color: theme.textSecondary }]}>
                  RWF/hour
                </Text>
              </View>
            </View>

            {/* Load Breakdown */}
            <View style={[styles.loadBreakdown, { borderTopColor: theme.border }]}>
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <View style={[styles.breakdownIcon, { backgroundColor: '#3B82F6' + '20' }]}>
                    <Ionicons name="receipt" size={14} color="#3B82F6" />
                  </View>
                  <Text style={[styles.breakdownText, { color: theme.textSecondary }]}>
                    {availableCargo.filter(c => c.status === 'listed').length} Cargo
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <View style={[styles.breakdownIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                    <Ionicons name="document-text" size={14} color="#F59E0B" />
                  </View>
                  <Text style={[styles.breakdownText, { color: theme.textSecondary }]}>
                    {orders.filter(o => (o.status === 'accepted' || o.status === 'pending') && !o.transporterId).length} Orders
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.viewAllButton, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('AvailableLoads')}
              >
                <Text style={styles.viewAllText}>View All Loads</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Top Opportunities - Only show high-priority matches */}
        {bestMatches.filter(m => m.priority === 'high').length > 0 && isOnline && (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Top Opportunities Nearby
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AvailableLoads')}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>

            {bestMatches.filter(m => m.priority === 'high').slice(0, 2).map((match, index) => {
              const cargoName = match.load.cropId?.name || match.load.quantity + ' kg';
              const pickupAddr = match.load.pickupLocation?.address || 'Pickup location';
              const deliveryAddr = match.load.deliveryLocation?.address || 'Delivery location';

              return (
                <TouchableOpacity
                  key={match.load._id || match.load.id || index}
                  style={[styles.matchCard, { backgroundColor: theme.card }]}
                  onPress={() => navigation.navigate('AvailableLoads')}
                >
                  {/* Header with cargo name and earning */}
                  <View style={styles.matchHeader}>
                    <View style={styles.matchTitleRow}>
                      <View style={[styles.cargoIcon, { backgroundColor: theme.primary + '20' }]}>
                        <Ionicons name="leaf" size={18} color={theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.matchTitle, { color: theme.text }]}>
                          {cargoName}
                        </Text>
                        <Text style={[styles.cargoWeight, { color: theme.textSecondary }]}>
                          {match.load.quantity} kg
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text style={[styles.earningsAmount, { color: theme.success, fontSize: 16 }]}>
                        {(match.profit / 1000).toFixed(1)}K
                      </Text>
                      <Text style={[styles.earningsLabel, { color: theme.textSecondary, fontSize: 10 }]}>
                        profit
                      </Text>
                    </View>
                  </View>

                  {/* Route information */}
                  <View style={styles.routeInfo}>
                    <View style={styles.routeStep}>
                      <View style={[styles.routeDot, { backgroundColor: theme.primary }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.routeLabel, { color: theme.textSecondary }]}>
                          Pickup
                        </Text>
                        <Text style={[styles.routeAddress, { color: theme.text }]} numberOfLines={1}>
                          {pickupAddr}
                        </Text>
                      </View>
                      <Text style={[styles.distanceBadge, { color: theme.primary }]}>
                        {match.distance.toFixed(0)}km
                      </Text>
                    </View>
                    <View style={[styles.routeLine, { backgroundColor: theme.border }]} />
                    <View style={styles.routeStep}>
                      <View style={[styles.routeDot, { backgroundColor: theme.success }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.routeLabel, { color: theme.textSecondary }]}>
                          Delivery
                        </Text>
                        <Text style={[styles.routeAddress, { color: theme.text }]} numberOfLines={1}>
                          {deliveryAddr}
                        </Text>
                      </View>
                      <Text style={[styles.distanceBadge, { color: theme.success }]}>
                        {match.routeDistance.toFixed(0)}km
                      </Text>
                    </View>
                  </View>

                  {/* Bottom tags */}
                  <View style={styles.matchTags}>
                    {match.matchReasons.slice(0, 2).map((reason: string, i: number) => (
                      <View key={i} style={[styles.tagChip, { backgroundColor: theme.success + '15' }]}>
                        <Text style={[styles.tagText, { color: theme.success }]}>
                          {reason}
                        </Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
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
              <LinearGradient colors={['#10797D', '#0D5F66']} style={styles.actionGradient}>
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  ratingText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
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
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  liveText: {
    color: '#FFF',
    fontSize: 10,
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
  loadBreakdown: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  viewAllText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
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
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  matchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cargoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cargoWeight: {
    fontSize: 12,
    marginTop: 2,
  },
  earningsLabel: {
    fontSize: 10,
    textAlign: 'right',
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  routeInfo: {
    marginTop: 4,
    marginBottom: 12,
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 13,
    fontWeight: '500',
  },
  distanceBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  routeLine: {
    width: 2,
    height: 16,
    marginLeft: 4,
  },
  matchTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
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
