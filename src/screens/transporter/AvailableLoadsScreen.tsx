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
  RefreshControl,
  Animated,
  Pressable,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchTrips,
  acceptTrip,
} from '../../logistics/store/tripsSlice';
import { fetchCargo, updateCargo } from '../../store/slices/cargoSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';
import { getPendingTripsForTransporter } from '../../logistics/utils/tripCalculations';
import { distanceService } from '../../services/distanceService';
import { suggestVehicleType, getVehicleType, calculateShippingCost, getTrafficFactor } from '../../services/vehicleService';
import { calculateRemainingETA, formatDuration } from '../../services/etaService';
import { useLocation } from '../../utils/useLocation';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Toast, { useToast } from '../../components/Toast';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';

const { width } = Dimensions.get('window');

export default function AvailableLoadsScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { trips, isLoading: tripsLoading } = useAppSelector((state) => state.trips);
  const { cargo, isLoading: cargoLoading } = useAppSelector((state) => state.cargo);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast, showError, showSuccess, hideToast } = useToast();
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [pendingAcceptItem, setPendingAcceptItem] = useState<any>(null);

  // ✨ Pizzazz Animations
  const animations = useScreenAnimations(6);

  // 📍 Real-time GPS Tracking
  const {
    location: currentLocation,
    error: locationError,
    isTracking,
    startTracking,
  } = useLocation({
    enabled: true, // Always track on this screen
    updateInterval: 10000, // Update every 10 seconds
  });

  useEffect(() => {
    // GPS tracking is active
    // Location updates are handled automatically
  }, [currentLocation]);
  
  // Convert cargo to trip-like format for display
  const convertCargoToTrip = (cargoItem: any) => {
    // Calculate distance between pickup and delivery
    const pickupLat = cargoItem.location?.latitude || -1.9536;
    const pickupLon = cargoItem.location?.longitude || 30.0605;

    // Use actual destination if available, otherwise use Kigali city center
    const deliveryLat = cargoItem.destination?.latitude || -1.9536;
    const deliveryLon = cargoItem.destination?.longitude || 30.0605;
    const deliveryAddress = cargoItem.destination?.address || 'Kigali City Center';

    const distance = distanceService.calculateDistance(
      pickupLat,
      pickupLon,
      deliveryLat,
      deliveryLon
    );

    // Get cargo weight and suggest appropriate vehicle
    const cargoWeight = cargoItem.quantity || 0;
    const suggestedVehicleId = suggestVehicleType(cargoWeight);
    const vehicleType = getVehicleType(suggestedVehicleId);

    // Calculate transport fee using vehicle-specific rates with current traffic
    // Motorcycle: 700 RWF/km, Van: 1000 RWF/km, Truck: 1400 RWF/km
    const trafficFactor = getTrafficFactor();
    const transportFee = calculateShippingCost(distance, suggestedVehicleId, trafficFactor);

    return {
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
        latitude: pickupLat,
        longitude: pickupLon,
        address: cargoItem.location?.address || 'Kigali, Rwanda',
      },
      delivery: {
        latitude: deliveryLat,
        longitude: deliveryLon,
        address: deliveryAddress,
      },
      distance: distance,
      vehicleType: suggestedVehicleId,
      vehicleName: vehicleType?.name || '🚚 Truck',
      earnings: {
        ratePerUnit: vehicleType?.baseRatePerKm || 800, // Vehicle-specific rate
        totalRate: transportFee, // Calculated with vehicle rate
        status: 'pending',
      },
      createdAt: new Date(cargoItem.createdAt || Date.now()),
    };
  };

  // Fetch trips and cargo when screen mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchTrips() as any);
        await dispatch(fetchCargo() as any);
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
      await dispatch(fetchTrips() as any);
      await dispatch(fetchCargo() as any);
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
          await dispatch(fetchTrips() as any);
          await dispatch(fetchCargo() as any);
                  } catch (error) {
          console.error('❌ AvailableLoadsScreen: Error during auto-refresh:', error);
        }
      };
      refreshData();
    }, [dispatch])
  );

  // Combine trips with cargo that hasn't been matched yet
  // Only show cargo with status 'listed' - 'matched' means it's been accepted
  const allAvailableLoads = [
    ...getPendingTripsForTransporter(trips),
    ...cargo.filter(c => c.status === 'listed').map(convertCargoToTrip),
  ];

  // Filter by search query
  const filteredLoads = searchQuery.trim()
    ? allAvailableLoads.filter(load => {
        const cargoName = load.shipment?.cargoName || load.shipment?.cropName || '';
        const pickupAddress = load.pickup?.address || '';
        const deliveryAddress = load.delivery?.address || '';
        const searchLower = searchQuery.toLowerCase();
        return (
          cargoName.toLowerCase().includes(searchLower) ||
          pickupAddress.toLowerCase().includes(searchLower) ||
          deliveryAddress.toLowerCase().includes(searchLower)
        );
      })
    : allAvailableLoads;

  const isLoading = tripsLoading || cargoLoading;
  const pendingTrips = filteredLoads;

  const availableCargo = cargo.filter(c => c.status === 'listed');
  const pendingTripsFromTrips = getPendingTripsForTransporter(trips);

  const handleAcceptTrip = async (tripId: string, tripIdFormatted: string, cropName: string) => {

    // Check if this is cargo (tripIdFormatted starts with "CARGO-") or a regular trip
    const isCargo = tripIdFormatted.startsWith('CARGO-');
    const actualId = isCargo ? tripId.replace('CARGO-', '') : tripId;

    // Find the cargo or trip item at the outer scope
    const cargoItem = isCargo ? cargo.find((c: any) => (c._id || c.id) === actualId) : null;
    const tripItem = !isCargo ? trips.find((t: any) => (t._id || t.id) === actualId) : null;

    // Try using browser confirm as fallback for web
    const isWeb = typeof window !== 'undefined' && !window.cordova;

    const performAccept = async () => {
      try {

        if (isCargo) {
          // Handle cargo acceptance
          // 1. Find the cargo item (already found above)
          // const cargoItem = cargo.find((c: any) => (c._id || c.id) === actualId);
          if (!cargoItem) {
            throw new Error('Cargo not found');
          }

          // 2. Get current user (transporter) ID
          const transporterId = user?._id || user?.id;
          if (!transporterId) {
            throw new Error('User not logged in');
          }

          // 3. Update cargo status to 'matched' and assign transporter
          // The backend will handle order creation when cargo is accepted
          const cargoResult = await dispatch(
            updateCargo({
              id: actualId,
              data: {
                status: 'matched',
                transporterId: transporterId
              }
            }) as any
          ).unwrap();

          console.log('✅ Cargo accepted and matched to transporter:', cargoResult);
        } else {
          // Handle regular trip acceptance
          const result = await dispatch(acceptTrip(actualId) as any).unwrap();
                  }

        return true;
      } catch (error: any) {
        console.error(`❌ Accept ${isCargo ? 'cargo' : 'trip'} error caught:`, error);
        const errorMessage =
          typeof error === 'string'
            ? error
            : error?.message || String(error) || `Failed to accept ${isCargo ? 'cargo' : 'trip'}`;
        console.error('📤 Error message:', errorMessage);
        throw new Error(errorMessage);
      }
    };

    // Show confirmation dialog
    const item = isCargo ? cargoItem : tripItem;
    setPendingAcceptItem({ item, isCargo, performAccept });
    setShowAcceptDialog(true);
  };

  const handleConfirmAccept = async () => {
    setShowAcceptDialog(false);

    if (!pendingAcceptItem) return;

    const { performAccept } = pendingAcceptItem;

    try {
      await performAccept();

      // Refresh data immediately after accepting
      await dispatch(fetchTrips() as any);
      await dispatch(fetchCargo() as any);
      await dispatch(fetchOrders() as any);

      showSuccess('Trip accepted! Check My Trips to mark complete!');
      setTimeout(() => navigation.navigate('Home'), 1500);
    } catch (error: any) {
      showError('Error: ' + error.message);
    } finally {
      setPendingAcceptItem(null);
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
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: theme.card }]}>Available Trips</Text>
          {isTracking && currentLocation && (
            <View style={styles.gpsIndicator}>
              <View style={[styles.gpsPulse, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.gpsText, { color: theme.card }]}>GPS Active</Text>
            </View>
          )}
        </View>
        <Badge label={String(allAvailableLoads.length)} variant="gray" size="sm" />
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by cargo name or location..."
          variant="filled"
        />
      </View>

      {pendingTrips.length === 0 ? (
        <EmptyState
          icon={searchQuery ? "search" : "cube-outline"}
          title={searchQuery ? "No matching trips" : "No trips available"}
          description={searchQuery ? "Try adjusting your search" : "Check back later for transport opportunities"}
          actionText="Refresh"
          onActionPress={() => dispatch(fetchTrips() as any)}
        />
      ) : (
        <FlatList
          data={pendingTrips}
          keyExtractor={(item) => item._id || item.tripId}
          contentContainerStyle={styles.loadsList}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.tertiary}
            />
          }
          renderItem={({ item: trip, index }) => {
            const earnings = trip.earnings?.totalRate || 0;
            const routeDistance = trip.distance || 0; // Pickup → Delivery distance
            const ratePerKm = trip.earnings?.ratePerUnit || 800;
            const vehicleName = trip.vehicleName || '🚚 Truck';
            // Support both new (cargoName) and old (cropName) field names
            const cargoName = trip.shipment?.cargoName || trip.shipment?.cropName || 'Agricultural Load';
            const quantity = trip.shipment?.quantity || 0;
            const unit = trip.shipment?.unit || 'kg';
            const pickupAddress = trip.pickup?.address || 'Not specified';
            const deliveryAddress = trip.delivery?.address || 'Destination';

            // 📍 Calculate LIVE distance from current location to pickup
            const pickupLat = trip.pickup?.latitude || -1.9536;
            const pickupLon = trip.pickup?.longitude || 30.0605;

            let liveDistanceToPickup = null;
            let liveETA = null;

            if (currentLocation) {
              liveDistanceToPickup = distanceService.calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                pickupLat,
                pickupLon
              );

              // Calculate real-time ETA to pickup
              const etaData = calculateRemainingETA(
                currentLocation.latitude,
                currentLocation.longitude,
                pickupLat,
                pickupLon,
                currentLocation.speed || 50
              );
              liveETA = etaData;
            }

            return (
              <View style={styles.cardWrapper}>
                <View style={[styles.loadCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {/* Top Section: Cargo & Earnings */}
                <View style={styles.loadCardTop}>
                  <View style={styles.cropSection}>
                    <Text style={[styles.cropName, { color: theme.text }]} numberOfLines={1}>
                      {cargoName}
                    </Text>
                    <View style={styles.quantityDistance}>
                      <Badge
                        label={`${quantity} ${unit}`}
                        variant="gray"
                        size="sm"
                      />
                      {routeDistance > 0 && (
                        <Badge
                          label={`${routeDistance} km route`}
                          variant="primary"
                          size="sm"
                        />
                      )}
                      <Badge
                        label={vehicleName}
                        variant="secondary"
                        size="sm"
                      />
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
                    {routeDistance > 0 && (
                      <Text style={[styles.earningsRate, { color: theme.textSecondary }]}>
                        {ratePerKm.toLocaleString()} RWF/km
                      </Text>
                    )}
                  </View>
                </View>

                {/* 📍 Live GPS Status */}
                {currentLocation && liveDistanceToPickup !== null && liveETA && (
                  <View style={[styles.liveGPSBox, { backgroundColor: theme.info + '10', borderColor: theme.info }]}>
                    <View style={styles.liveGPSRow}>
                      <View style={styles.liveGPSIcon}>
                        <Ionicons name="navigate" size={16} color={theme.info} />
                      </View>
                      <View style={styles.liveGPSContent}>
                        <Text style={[styles.liveGPSLabel, { color: theme.textSecondary }]}>
                          📍 You are {liveDistanceToPickup.toFixed(1)} km away
                        </Text>
                        <Text style={[styles.liveGPSETA, { color: liveETA.trafficInfo.color }]}>
                          {liveETA.trafficInfo.icon} ETA: {formatDuration(liveETA.durationMinutes)} • {liveETA.trafficInfo.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

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
                <Button
                  title="Accept Trip"
                  onPress={() =>
                    handleAcceptTrip(
                      trip._id,
                      trip.tripId || trip._id,
                      cargoName
                    )
                  }
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
                />
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Toast Notifications */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Accept Trip Confirmation Dialog */}
      <ConfirmDialog
        visible={showAcceptDialog}
        title={pendingAcceptItem?.isCargo ? 'Accept Cargo?' : 'Accept Trip?'}
        message={`Do you want to accept this ${pendingAcceptItem?.isCargo ? 'cargo' : 'trip'}?`}
        cancelText="Cancel"
        confirmText="Accept"
        onCancel={() => {
          setShowAcceptDialog(false);
          setPendingAcceptItem(null);
        }}
        onConfirm={handleConfirmAccept}
        isDestructive={false}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    justifyContent: 'space-evenly',
    marginBottom: 6,
  },
  cardWrapper: {
    width: '45%',
  },

  // Load Card - inDrive Style
  loadCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 4,
    marginBottom: 4,
  },

  // Card Top: Name & Earnings
  loadCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  cropSection: {
    flex: 1,
    marginRight: 4,
  },
  cropName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  quantityDistance: {
    flexDirection: 'row',
    gap: 3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    gap: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '500',
  },

  // Earnings Box
  earningsBox: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 8,
    fontWeight: '500',
    marginBottom: 1,
  },
  earningsAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
  earningsRate: {
    fontSize: 7,
    fontWeight: '500',
    marginTop: 1,
  },

  // Route Section - inDrive style with dots and line
  routeSection: {
    marginBottom: 5,
    paddingVertical: 4,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 5,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  routeLabel: {
    fontSize: 8,
    fontWeight: '500',
    marginBottom: 1,
  },
  routeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 12,
    marginLeft: 2,
    marginVertical: 1,
  },

  // Accept Button
  acceptBtn: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  acceptBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // GPS Tracking Header
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  gpsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  gpsPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gpsText: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.9,
  },

  // Live GPS Box
  liveGPSBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
  },
  liveGPSRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveGPSIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveGPSContent: {
    flex: 1,
  },
  liveGPSLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  liveGPSETA: {
    fontSize: 12,
    fontWeight: '600',
  },
});