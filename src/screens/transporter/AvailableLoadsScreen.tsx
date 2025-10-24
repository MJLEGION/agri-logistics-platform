// src/screens/transporter/AvailableLoadsScreen.tsx
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchTrips,
  acceptTrip,
} from '../../logistics/store/tripsSlice';
import { getPendingTripsForTransporter } from '../../logistics/utils/tripCalculations';

const { width } = Dimensions.get('window');

export default function AvailableLoadsScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { trips, isLoading } = useAppSelector((state) => state.trips);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch trips when screen mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('=== TRANSPORTER LOADING TRIPS ===');
        await dispatch(fetchTrips() as any);
        console.log('TOTAL TRIPS FETCHED:', trips.length);
      } catch (error) {
        console.log('ERROR LOADING TRIPS:', error);
      }
    };
    loadData();
  }, [dispatch]);

  // Handle manual refresh (pull to refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchTrips() as any);
    } catch (error) {
      console.log('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshData = async () => {
        try {
          console.log('=== SCREEN FOCUSED - AUTO REFRESHING TRIPS ===');
          await dispatch(fetchTrips() as any);
        } catch (error) {
          console.log('ERROR AUTO-REFRESHING:', error);
        }
      };
      refreshData();
    }, [dispatch])
  );

  const pendingTrips = getPendingTripsForTransporter(trips);

  console.log('📊 Available Trips Debug:', {
    totalTrips: trips.length,
    pendingTrips: pendingTrips.length,
    tripsDetails: trips.map(t => ({
      id: t._id || t.tripId,
      status: t.status,
      hasTransporter: !!t.transporterId,
      isPending: t.status === 'pending' && !t.transporterId,
    })),
  });

  if (pendingTrips.length === 0) {
    console.warn('⚠️ NO PENDING TRIPS! Check if mock trips have status=pending and no transporterId');
  } else {
    console.log(`✅ ${pendingTrips.length} trip(s) available for acceptance`);
  }

  const handleAcceptTrip = async (tripId: string, cropName: string) => {
    console.log('🔘 ACCEPT TRIP BUTTON CLICKED! Trip ID:', tripId, 'Crop:', cropName);

    // Try using browser confirm as fallback for web
    const isWeb = typeof window !== 'undefined' && !window.cordova;
    console.log('🌐 Is Web Platform:', isWeb);

    if (isWeb) {
      const confirmed = window.confirm(`Accept this trip? Transport ${cropName}`);
      console.log('✔️ Browser confirm result:', confirmed);

      if (confirmed) {
        try {
          console.log('🚀 Accepting trip for ID:', tripId);
          const result = await dispatch(acceptTrip(tripId) as any).unwrap();
          console.log('✅ Accept trip successful:', result);

          alert('Success! 🎉 Trip accepted. Head to pickup location!');
          navigation.navigate('Home');
        } catch (error: any) {
          console.error('❌ Accept trip error caught:', error);
          const errorMessage =
            typeof error === 'string'
              ? error
              : error?.message || String(error) || 'Failed to accept trip';

          console.error('📤 Showing error message:', errorMessage);
          alert('Error: ' + errorMessage);
        }
      } else {
        console.log('❌ User cancelled the action');
      }
    } else {
      // Native/mobile platform - use Alert.alert
      Alert.alert(`Accept this trip?`, `Transport ${cropName}`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              console.log('🚀 Accepting trip for ID:', tripId);
              const result = await dispatch(acceptTrip(tripId) as any).unwrap();
              console.log('✅ Accept trip successful:', result);

              Alert.alert('Success! 🎉', 'Trip accepted. Head to pickup location!', [
                { text: 'OK', onPress: () => navigation.navigate('Home') },
              ]);
            } catch (error: any) {
              console.error('❌ Accept trip error caught:', error);
              const errorMessage =
                typeof error === 'string'
                  ? error
                  : error?.message || String(error) || 'Failed to accept trip';

              console.error('📤 Showing error message:', errorMessage);
              Alert.alert('Error', errorMessage);
            }
          },
          style: 'default',
        },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.tertiary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.card} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.card }]}>Available Loads</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.tertiary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.tertiary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.card} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>Available Trips</Text>
        <View style={styles.loadsCountBadge}>
          <Text style={styles.loadsCountText}>{pendingTrips.length}</Text>
        </View>
      </View>

      {pendingTrips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No trips available</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Check back later for transport opportunities
          </Text>
          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: theme.tertiary }]}
            onPress={() => dispatch(fetchTrips() as any)}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pendingTrips}
          keyExtractor={(item) => item._id || item.tripId}
          contentContainerStyle={styles.loadsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.tertiary}
            />
          }
          renderItem={({ item: trip }) => {
            const earnings = trip.earnings?.totalRate || 0;

            return (
              <View style={[styles.loadCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {/* Top Section: Crop & Earnings */}
                <View style={styles.loadCardTop}>
                  <View style={styles.cropSection}>
                    <Text style={[styles.cropName, { color: theme.text }]} numberOfLines={1}>
                      {trip.shipment?.cropName || 'Agricultural Load'}
                    </Text>
                    <View style={styles.quantityDistance}>
                      <View style={styles.badge}>
                        <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                          {trip.shipment?.quantity} {trip.shipment?.unit}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Earnings Box - Prominently displayed */}
                  <View style={[styles.earningsBox, { backgroundColor: theme.success + '15' }]}>
                    <Text style={[styles.earningsLabel, { color: theme.textSecondary }]}>
                      Earn
                    </Text>
                    <Text style={[styles.earningsAmount, { color: theme.success }]}>
                      {earnings.toLocaleString()} RWF
                    </Text>
                  </View>
                </View>

                {/* Route Section */}
                <View style={styles.routeSection}>
                  <View style={styles.routeItem}>
                    <View style={[styles.routeDot, { backgroundColor: theme.success }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.routeLabel, { color: theme.textSecondary }]}>
                        Pickup
                      </Text>
                      <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={1}>
                        {trip.pickup?.address || 'Not specified'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.routeLine, { backgroundColor: theme.border }]} />

                  <View style={styles.routeItem}>
                    <View style={[styles.routeDot, { backgroundColor: theme.error }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.routeLabel, { color: theme.textSecondary }]}>
                        Delivery
                      </Text>
                      <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={1}>
                        {trip.delivery?.address || 'Not specified'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Accept Button */}
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: theme.tertiary }]}
                  onPress={() =>
                    handleAcceptTrip(
                      trip._id || trip.tripId,
                      trip.shipment?.cropName || 'Load'
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.acceptBtnText}>Accept Trip</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  loadsCountBadge: {
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadsCountText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshBtn: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  refreshBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Loads List
  loadsList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },

  // Load Card - inDrive Style
  loadCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 4,
  },

  // Card Top: Name & Earnings
  loadCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cropSection: {
    flex: 1,
    marginRight: 8,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  quantityDistance: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Earnings Box
  earningsBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Route Section - inDrive style with dots and line
  routeSection: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 20,
    marginLeft: 4,
    marginVertical: 2,
  },

  // Accept Button
  acceptBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  acceptBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});