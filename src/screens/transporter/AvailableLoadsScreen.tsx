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
import * as cargoService from '../../services/cargoService';
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
import DashboardLayout from '../../components/layouts/DashboardLayout';

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

    // Check if destination is set
    const hasDestination = !!(
      cargoItem.destination?.latitude &&
      cargoItem.destination?.longitude &&
      cargoItem.destination?.address &&
      cargoItem.destination?.address.trim() !== ''
    );

    // Calculate distance - ONLY if destination exists or stored distance is available
    let distance: number = 0;
    let deliveryLat: number;
    let deliveryLon: number;
    let deliveryAddress: string;

    if (cargoItem.distance && cargoItem.distance > 0) {
      // Use stored distance from cargo creation
      distance = cargoItem.distance;
      deliveryLat = cargoItem.destination?.latitude || -1.9536;
      deliveryLon = cargoItem.destination?.longitude || 30.0605;
      deliveryAddress = cargoItem.destination?.address || 'Delivery Location';
    } else if (hasDestination) {
      // Calculate from actual destination
      deliveryLat = cargoItem.destination!.latitude;
      deliveryLon = cargoItem.destination!.longitude;
      deliveryAddress = cargoItem.destination!.address;
      distance = distanceService.calculateDistance(
        pickupLat,
        pickupLon,
        deliveryLat,
        deliveryLon
      );
    } else {
      // No destination set - distance remains 0
      deliveryLat = -1.9536;
      deliveryLon = 30.0605;
      deliveryAddress = 'No destination set';
    }

    // Get cargo weight and suggest appropriate vehicle
    const cargoWeight = cargoItem.quantity || 0;
    const suggestedVehicleId = cargoItem.suggestedVehicle || suggestVehicleType(cargoWeight);
    const vehicleType = getVehicleType(suggestedVehicleId);

    // Calculate transport fee:
    // 1. Use saved shippingCost if available
    // 2. Otherwise calculate ONLY if distance > 0
    // 3. If no destination, transportFee = 0 (not calculated)
    const trafficFactor = getTrafficFactor();
    const transportFee = cargoItem.shippingCost && cargoItem.shippingCost > 0
      ? cargoItem.shippingCost
      : distance > 0
      ? calculateShippingCost(distance, suggestedVehicleId, trafficFactor)
      : 0;

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
          if (!cargoItem) {
            throw new Error('Cargo not found');
          }

          // Get current user (transporter) ID
          const transporterId = user?._id || user?.id;
          if (!transporterId) {
            throw new Error('User not logged in');
          }

          // Call backend API to assign transporter to cargo
          console.log('✅ Accepting cargo:', {
            cargoId: actualId,
            cargoName: cargoItem.name,
            transporterId,
          });

          await cargoService.assignTransporterToCargo(actualId);
          console.log('✅ Cargo accepted successfully');

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

    const { performAccept, isCargo, item } = pendingAcceptItem;

    try {
      await performAccept();

      // Refresh data immediately after accepting
      await dispatch(fetchTrips() as any);
      await dispatch(fetchCargo() as any);
      await dispatch(fetchOrders() as any);

      const successMessage = isCargo
        ? `Cargo "${item?.name}" accepted successfully!`
        : 'Trip accepted! Check My Trips to mark complete!';

      showSuccess(successMessage);
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

  const sidebarNav = [
    { icon: 'briefcase-outline', label: 'Available Loads', screen: 'AvailableLoads' },
    { icon: 'navigate-outline', label: 'Active Trips', screen: 'ActiveTrips' },
    { icon: 'cash-outline', label: 'Earnings', screen: 'EarningsDashboard' },
    { icon: 'star-outline', label: 'Ratings', screen: 'TransporterRatings' },
    { icon: 'time-outline', label: 'History', screen: 'TripHistory' },
  ];

  return (
    <DashboardLayout
      title="Available Loads"
      sidebarColor="#0F172A"
      accentColor="#3B82F6"
      backgroundImage={require('../../../assets/images/backimages/transporter.jpg')}
      sidebarNav={sidebarNav}
      userRole="transporter"
      navigation={navigation}
      contentPadding={false}
    >
      {isTracking && currentLocation && (
        <View style={[styles.gpsIndicator, { backgroundColor: '#3B82F6' }]}>
          <View style={styles.gpsPulse} />
          <Text style={styles.gpsText}>GPS Active • {currentLocation.speed?.toFixed(0) || 0} km/h</Text>
        </View>
      )}

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

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

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
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gpsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  gpsPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  gpsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
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
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardWrapper: {
    width: '48%',
  },

  // Load Card - inDrive Style
  loadCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 8,
  },
  quantityDistance: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
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
    fontWeight: '600',
  },

  // Earnings Box
  earningsBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  earningsLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  earningsAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  earningsRate: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
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
    marginBottom: 12,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  routeLine: {
    width: 2,
    height: 16,
    marginLeft: 3,
    marginVertical: 2,
  },

  // Accept Button
  acceptBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  acceptBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },


  // Live GPS Box
  liveGPSBox: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  liveGPSRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  liveGPSIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveGPSContent: {
    flex: 1,
  },
  liveGPSLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  liveGPSETA: {
    fontSize: 13,
    fontWeight: '600',
  },
});