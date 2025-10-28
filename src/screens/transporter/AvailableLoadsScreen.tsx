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
import { fetchCargo } from '../../store/slices/cargoSlice';
import { getPendingTripsForTransporter } from '../../logistics/utils/tripCalculations';

const { width } = Dimensions.get('window');

export default function AvailableLoadsScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { trips, isLoading: tripsLoading } = useAppSelector((state) => state.trips);
  const { cargo, isLoading: cargoLoading } = useAppSelector((state) => state.cargo);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  
  // Convert cargo to trip-like format for display
  const convertCargoToTrip = (cargoItem: any) => ({
    _id: cargoItem._id || cargoItem.id,
    tripId: `CARGO-${cargoItem._id || cargoItem.id}`,
    status: 'pending',
    shipment: {
      cargoId: cargoItem._id || cargoItem.id,
      shipperId: cargoItem.shipperId,
      quantity: cargoItem.quantity,
      unit: cargoItem.unit,
      cargoName: cargoItem.name,
      cropName: cargoItem.name, // For backward compatibility
    },
    pickup: {
      latitude: cargoItem.location?.latitude || -1.9403,
      longitude: cargoItem.location?.longitude || 29.8739,
      address: cargoItem.location?.address || 'Kigali, Rwanda',
    },
    delivery: {
      latitude: -1.9706,
      longitude: 29.9498,
      address: 'Destination',
    },
    earnings: {
      ratePerUnit: cargoItem.pricePerUnit || 500,
      totalRate: (cargoItem.quantity || 0) * (cargoItem.pricePerUnit || 500),
      status: 'pending',
    },
    createdAt: new Date(cargoItem.createdAt || Date.now()),
  });

  // Fetch trips and cargo when screen mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 AvailableLoadsScreen: Mounting - loading trips & cargo...');
        await dispatch(fetchTrips() as any);
        await dispatch(fetchCargo() as any);
        console.log('✅ AvailableLoadsScreen: Initial data loaded');
      } catch (error) {
        console.error('❌ AvailableLoadsScreen: Error loading data:', error);
      }
    };
    loadData();
  }, [dispatch]);

  // Handle manual refresh (pull to refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 AvailableLoadsScreen: Manual refresh triggered');
      await dispatch(fetchTrips() as any);
      await dispatch(fetchCargo() as any);
      console.log('✅ AvailableLoadsScreen: Manual refresh complete');
    } catch (error) {
      console.error('❌ AvailableLoadsScreen: Error during refresh:', error);
    }
    setRefreshing(false);
  };

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshData = async () => {
        try {
          console.log('🎯 AvailableLoadsScreen: Screen focused - auto-refreshing trips & cargo...');
          await dispatch(fetchTrips() as any);
          await dispatch(fetchCargo() as any);
          console.log('✅ AvailableLoadsScreen: Auto-refresh complete on focus');
        } catch (error) {
          console.error('❌ AvailableLoadsScreen: Error during auto-refresh:', error);
        }
      };
      refreshData();
    }, [dispatch])
  );

  // Combine trips with cargo that hasn't been matched yet
  const allAvailableLoads = [
    ...getPendingTripsForTransporter(trips),
    ...cargo.filter(c => c.status === 'listed' || c.status === 'matched').map(convertCargoToTrip),
  ];
  
  const isLoading = tripsLoading || cargoLoading;
  const pendingTrips = allAvailableLoads;

  // Enhanced debug logging
  const availableCargo = cargo.filter(c => c.status === 'listed' || c.status === 'matched');
  const pendingTripsFromTrips = getPendingTripsForTransporter(trips);
  
  console.log('📊 AvailableLoadsScreen Debug Info:', {
    totalTrips: trips.length,
    totalCargo: cargo.length,
    availableCargo: availableCargo.length,
    pendingTripsFromTrips: pendingTripsFromTrips.length,
    pendingTrips: pendingTrips.length,
    tripsDetails: trips.map(t => ({
      id: t._id || t.tripId,
      status: t.status,
      hasTransporter: !!t.transporterId,
      isPending: t.status === 'pending' && !t.transporterId,
    })),
    cargoDetails: cargo.map(c => ({
      id: c._id || c.id,
      name: c.name,
      status: c.status,
      shipperId: c.shipperId,
      createdAt: c.createdAt,
    })),
    availableCargoDetails: availableCargo.map(c => ({
      id: c._id || c.id,
      name: c.name,
      status: c.status,
    })),
  });

  if (pendingTrips.length === 0) {
    console.warn('⚠️ NO AVAILABLE LOADS!');
    console.warn('  - Trips available:', trips.length);
    console.warn('  - Cargo available:', availableCargo.length);
    console.warn('  - Check if cargo was created with status "listed"');
  } else {
    console.log(`✅ ${pendingTrips.length} load(s) available for transporter to accept`);
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
            // Support both new (cargoName) and old (cropName) field names
            const cargoName = trip.shipment?.cargoName || trip.shipment?.cropName || 'Agricultural Load';
            const quantity = trip.shipment?.quantity || 0;
            const unit = trip.shipment?.unit || 'kg';
            const pickupAddress = trip.pickup?.address || 'Not specified';
            const deliveryAddress = trip.delivery?.address || 'Destination';

            return (
              <View style={[styles.loadCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {/* Top Section: Cargo & Earnings */}
                <View style={styles.loadCardTop}>
                  <View style={styles.cropSection}>
                    <Text style={[styles.cropName, { color: theme.text }]} numberOfLines={1}>
                      {cargoName}
                    </Text>
                    <View style={styles.quantityDistance}>
                      <View style={styles.badge}>
                        <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                          {quantity} {unit}
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
                        {pickupAddress}
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
                        {deliveryAddress}
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
                      cargoName
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