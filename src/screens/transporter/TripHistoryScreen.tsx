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
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';
import {
  fetchTrips,
} from '../../logistics/store/tripsSlice';
import {
  getTripHistoryForTransporter,
  sortTripsByDate,
} from '../../logistics/utils/tripCalculations';
import SearchBar from '../../components/SearchBar';
import ListItem from '../../components/ListItem';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import Chip from '../../components/Chip';
import Toast, { useToast } from '../../components/Toast';

type TripStatus = 'all' | 'completed' | 'cancelled';

export default function TripHistoryScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { trips, isLoading } = useAppSelector((state) => state.trips);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [filterStatus, setFilterStatus] = useState<TripStatus>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'earnings'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast, showSuccess, showError, hideToast } = useToast();
  const animations = useScreenAnimations(6); // ✨ Pizzazz animations

  // Fetch trips when screen loads
  useEffect(() => {
    dispatch(fetchTrips() as any);
  }, [dispatch]);

  // TEMPORARY: Log all trips for debugging
      // Get trip history for user
  const myTrips = useMemo(() => {
    const userId = user?.id || user?._id || '';
    const filtered = getTripHistoryForTransporter(trips, userId);

    // TEMPORARY: Show ALL trips for debugging
        return trips; // Show all trips temporarily
  }, [trips, user?.id, user?._id]);

  // Apply status filter and search
  const filteredTrips = useMemo(() => {
    let filtered = myTrips;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((trip) => trip.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((trip) => {
        const cropName = trip.shipment?.cropName?.toLowerCase() || '';
        const pickupAddress = trip.pickup?.address?.toLowerCase() || '';
        const deliveryAddress = trip.delivery?.address?.toLowerCase() || '';
        const status = trip.status?.toLowerCase() || '';

        return (
          cropName.includes(query) ||
          pickupAddress.includes(query) ||
          deliveryAddress.includes(query) ||
          status.includes(query)
        );
      });
    }

    return filtered;
  }, [myTrips, filterStatus, searchQuery]);

  // Sort trips
  const sortedTrips = useMemo(() => {
    const trips = [...filteredTrips];
    switch (sortBy) {
      case 'recent':
        return sortTripsByDate(trips);
      case 'earnings':
        return trips.sort(
          (a, b) =>
            (b.earnings?.totalRate || 0) - (a.earnings?.totalRate || 0)
        );
      default:
        return trips;
    }
  }, [filteredTrips, sortBy]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalTrips = filteredTrips.length;
    const completedTrips = filteredTrips.filter((t) => t.status === 'completed').length;
    const totalEarnings = filteredTrips.reduce((sum, trip) => {
      return sum + (trip.earnings?.totalRate || 0);
    }, 0);

    return {
      totalTrips,
      completedTrips,
      totalDistance: 0, // Can be added to Trip type if needed
      totalEarnings,
      completionRate:
        totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0,
    };
  }, [filteredTrips]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in_transit':
        return '#3B82F6';
      case 'accepted':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return theme.textSecondary;
    }
  };

  const getStatusVariant = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'gray' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_transit':
        return 'primary';
      case 'accepted':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_transit':
        return 'car';
      case 'accepted':
        return 'document';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_transit':
        return 'In Transit';
      case 'accepted':
        return 'Accepted';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
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

  const renderTrip = ({ item: trip, index }: { item: any; index?: number }) => {
    const earnings = trip.earnings?.totalRate || 0;

    return (
      <Animated.View style={animations.getFloatingCardStyle((index || 0) % 6)}>
        <ListItem
          icon={getStatusIcon(trip.status) as any}
          title={trip.shipment?.cropName || 'Delivery'}
          subtitle={`${trip.pickup?.address?.split(',')[0] || 'Pickup'} → ${trip.delivery?.address?.split(',')[0] || 'Delivery'} • ${earnings.toLocaleString()} RWF • ${formatDate(trip.completedAt || trip.createdAt)}`}
          rightElement={
            <Badge
              label={getStatusLabel(trip.status).toUpperCase()}
              variant={getStatusVariant(trip.status)}
              size="sm"
            />
          }
          chevron
          onPress={() => {
            showSuccess(`Trip: ${trip.shipment?.cropName || 'Delivery'} - ${getStatusLabel(trip.status)}`);
          }}
        />
      </Animated.View>
    );
  };

  const renderEmpty = () => {
    const isSearching = searchQuery.trim().length > 0;
    const title = isSearching
      ? 'No matching trips'
      : filterStatus === 'all'
      ? 'No trips yet'
      : `No ${filterStatus} trips`;
    const description = isSearching
      ? 'Try adjusting your search or filters'
      : 'Your trip history will appear here';

    return (
      <EmptyState
        icon={isSearching ? 'search-outline' : 'car-sport-outline'}
        title={title}
        description={description}
        actionText={isSearching ? 'Clear Search' : 'Find Loads'}
        onActionPress={() => {
          if (isSearching) {
            setSearchQuery('');
          } else {
            navigation.navigate('AvailableLoads');
          }
        }}
      />
    );
  };

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
        {/* Search Bar */}
        {myTrips.length > 0 && (
          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by cargo, location, or status..."
              variant="filled"
            />
          </View>
        )}

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
          {/* Status Filter with Chip */}
          <View style={styles.filterContainer}>
            <Text style={[styles.filterLabel, { color: theme.text }]}>Status:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['all', 'completed', 'in_transit', 'accepted', 'cancelled'] as const).map(
                  (status) => (
                    <Chip
                      key={status}
                      label={status === 'all' ? 'All' : getStatusLabel(status)}
                      selected={filterStatus === status}
                      onPress={() => setFilterStatus(status as TripStatus)}
                    />
                  )
                )}
              </View>
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
        <View style={{ paddingHorizontal: 16 }}>
          {sortedTrips.length > 0 ? (
            sortedTrips.map((trip, index) => renderTrip({ item: trip, index }))
          ) : (
            renderEmpty()
          )}
        </View>
      </ScrollView>

      {/* Toast Notifications */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
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