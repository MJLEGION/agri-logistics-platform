// src/screens/transporter/TripHistoryScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAllOrders } from '../../store/slices/ordersSlice';
import distanceService from '../../services/distanceService';

type TripStatus = 'all' | 'completed' | 'in_progress' | 'accepted';

export default function TripHistoryScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { orders, isLoading } = useAppSelector((state) => state.orders);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [filterStatus, setFilterStatus] = useState<TripStatus>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'earnings' | 'distance'>('recent');

  // Fetch orders when screen loads
  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // Filter my trips
  const myTrips = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.transporterId === user?.id || order.transporterId === user?._id
      ),
    [orders, user?.id, user?._id]
  );

  // Apply status filter
  const filteredTrips = useMemo(() => {
    if (filterStatus === 'all') return myTrips;
    return myTrips.filter((trip) => trip.status === filterStatus);
  }, [myTrips, filterStatus]);

  // Sort trips
  const sortedTrips = useMemo(() => {
    const trips = [...filteredTrips];
    switch (sortBy) {
      case 'recent':
        return trips.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || b.completedAt || new Date()).getTime() -
            new Date(a.updatedAt || a.createdAt || a.completedAt || new Date()).getTime()
        );
      case 'earnings':
        return trips.sort((a, b) => {
          const aDistance = calculateDistance(a);
          const bDistance = calculateDistance(b);
          return (
            distanceService.calculateEarnings(bDistance) -
            distanceService.calculateEarnings(aDistance)
          );
        });
      case 'distance':
        return trips.sort(
          (a, b) => calculateDistance(b) - calculateDistance(a)
        );
      default:
        return trips;
    }
  }, [filteredTrips, sortBy]);

  const calculateDistance = (order: any) => {
    if (!order.pickupLocation || !order.deliveryLocation) return 0;
    return distanceService.calculateDistance(
      order.pickupLocation.latitude,
      order.pickupLocation.longitude,
      order.deliveryLocation.latitude,
      order.deliveryLocation.longitude
    );
  };

  const calculateEarnings = (order: any) => {
    const distance = calculateDistance(order);
    return distanceService.calculateEarnings(distance);
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalTrips = filteredTrips.length;
    const completedTrips = filteredTrips.filter((t) => t.status === 'completed').length;
    const totalDistance = filteredTrips.reduce((sum, trip) => {
      return sum + calculateDistance(trip);
    }, 0);
    const totalEarnings = filteredTrips.reduce((sum, trip) => {
      return sum + calculateEarnings(trip);
    }, 0);

    return {
      totalTrips,
      completedTrips,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalEarnings,
      completionRate:
        totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0,
    };
  }, [filteredTrips]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in_progress':
        return '#3B82F6';
      case 'accepted':
        return '#F59E0B';
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'car';
      case 'accepted':
        return 'document';
      default:
        return 'help-circle';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Transit';
      case 'accepted':
        return 'Accepted';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderTrip = ({ item: trip }: { item: any }) => {
    const distance = calculateDistance(trip);
    const earnings = calculateEarnings(trip);

    return (
      <TouchableOpacity
        style={[styles.tripCard, { backgroundColor: theme.card }]}
        onPress={() =>
          Alert.alert(
            'Trip Details',
            `${trip.cropId?.name || 'Order'}\n\n` +
              `Distance: ${distance} km\n` +
              `Earnings: ${earnings.toLocaleString()} RWF\n` +
              `Status: ${getStatusLabel(trip.status)}`
          )
        }
      >
        <View style={styles.tripHeader}>
          <View style={styles.tripLeft}>
            <View
              style={[
                styles.tripIcon,
                { backgroundColor: getStatusColor(trip.status) + '20' },
              ]}
            >
              <Ionicons
                name={getStatusIcon(trip.status)}
                size={20}
                color={getStatusColor(trip.status)}
              />
            </View>
            <View style={styles.tripInfo}>
              <Text style={[styles.tripTitle, { color: theme.text }]}>
                {trip.cropId?.name || 'Order'}
              </Text>
              <Text style={[styles.tripRoute, { color: theme.textSecondary }]}>
                {trip.pickupLocation.address?.split(',')[0]} → {trip.deliveryLocation.address?.split(',')[0]}
              </Text>
              <Text style={[styles.tripDate, { color: theme.textSecondary }]}>
                {formatDate(trip.updatedAt || trip.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.tripRight}>
            <Text style={[styles.tripEarnings, { color: '#10B981' }]}>
              {earnings.toLocaleString()}
            </Text>
            <Text style={[styles.tripDistance, { color: theme.textSecondary }]}>
              {distance} km
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(trip.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {getStatusLabel(trip.status).charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🚗</Text>
      <Text style={[styles.emptyText, { color: theme.text }]}>
        {filterStatus === 'all' ? 'No trips yet' : `No ${filterStatus} trips`}
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
        Your trip history will appear here
      </Text>
    </View>
  );

  if (isLoading && myTrips.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.tertiary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#06B6D4', '#0891B2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⏱️ Trip History</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Total Trips
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {stats.totalTrips}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Completion
            </Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {stats.completionRate}%
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Distance
            </Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
              {stats.totalDistance}
            </Text>
          </View>
        </View>

        {/* Filters and Sort */}
        <View style={styles.controlsContainer}>
          {/* Status Filter */}
          <View style={styles.filterContainer}>
            <Text style={[styles.filterLabel, { color: theme.text }]}>Status:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {(['all', 'completed', 'in_progress', 'accepted'] as const).map(
                (status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      filterStatus === status && styles.filterButtonActive,
                      filterStatus === status && {
                        backgroundColor: '#06B6D4',
                      },
                    ]}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filterStatus === status && styles.filterButtonTextActive,
                      ]}
                    >
                      {status === 'all' ? 'All' : getStatusLabel(status)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>

          {/* Sort */}
          <View style={styles.sortContainer}>
            <Text style={[styles.sortLabel, { color: theme.text }]}>Sort:</Text>
            <TouchableOpacity
              style={[styles.sortButton, { borderColor: theme.border }]}
              onPress={() => {
                const options = ['recent' as const, 'earnings' as const, 'distance' as const];
                const currentIndex = options.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % options.length;
                setSortBy(options[nextIndex]);
              }}
            >
              <Ionicons name="arrow-down" size={16} color={theme.tertiary} />
              <Text style={[styles.sortButtonText, { color: theme.text }]}>
                {sortBy === 'recent' ? 'Recent' : sortBy === 'earnings' ? 'Earnings' : 'Distance'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trips List */}
        {sortedTrips.length > 0 ? (
          sortedTrips.map((trip) => renderTrip({ item: trip }))
        ) : (
          renderEmpty()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginVertical: 15,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlsContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    gap: 12,
  },
  filterContainer: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  filterButtonActive: {
    borderColor: '#06B6D4',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  tripCard: {
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  tripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tripRoute: {
    fontSize: 12,
    marginBottom: 2,
  },
  tripDate: {
    fontSize: 11,
  },
  tripRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  tripEarnings: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tripDistance: {
    fontSize: 12,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});