// src/screens/transporter/ActiveTripsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Animated, Pressable, PanResponder } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchAllTrips,
  completeTrip,
} from '../../logistics/store/tripsSlice';
import { fetchOrders, updateOrder } from '../../store/slices/ordersSlice';
import { getActiveTripsForTransporter } from '../../logistics/utils/tripCalculations';
import { distanceService } from '../../services/distanceService';
import { calculateRemainingETA, formatDuration, formatArrivalTime } from '../../services/etaService';
import { useLocation } from '../../utils/useLocation';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import EmptyState from '../../components/EmptyState';
import Toast, { useToast } from '../../components/Toast';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';

export default function ActiveTripsScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { trips, isLoading: tripsLoading } = useAppSelector((state) => state.trips);
  const { orders, isLoading: ordersLoading } = useAppSelector((state) => state.orders);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [completingTripId, setCompletingTripId] = useState<string | null>(null);
  const { toast, showSuccess, showError, hideToast } = useToast();

  // ✨ Pizzazz Animations
  const animations = useScreenAnimations(6);

  // Get active trips from trips system
  const activeTrips = getActiveTripsForTransporter(
    trips,
    user?.id || user?._id || ''
  );

  // Get active orders (transporterId matches current user, status is accepted or in_progress)
  const transporterId = user?.id || user?._id || '';
  const activeOrders = Array.isArray(orders) ? orders.filter(
    (order: any) =>
      (order.transporterId === transporterId || order.transporterId?._id === transporterId || order.transporterId?.id === transporterId) &&
      (order.status === 'accepted' || order.status === 'in_progress')
  ) : [];

  // Combine trips and orders
  const allActiveItems = [...activeTrips, ...activeOrders];
  const isLoading = tripsLoading || ordersLoading;

  // 📍 Real-time GPS Tracking
  const {
    location: currentLocation,
    error: locationError,
    isTracking,
  } = useLocation({
    enabled: allActiveItems.length > 0, // Only track when there are active trips
    updateInterval: 5000, // Update every 5 seconds
  });

  useEffect(() => {
    console.log('✅ ActiveTripsScreen mounted/updated');
    console.log('📊 State:', {
      activeTrips: activeTrips.length,
      activeOrders: activeOrders.length,
      totalActive: allActiveItems.length,
      isLoading,
      completingTripId
    });
  }, [activeTrips, activeOrders, allActiveItems, isLoading, completingTripId]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchAllTrips() as any);
      dispatch(fetchOrders() as any);
    }, [dispatch])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchAllTrips() as any);
      await dispatch(fetchOrders() as any);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewMap = (trip: any) => {
    navigation.navigate('TripTracking', { trip });
  };

  const handleCompleteTrip = async (item: any) => {
    const itemId = item._id || item.id || item.tripId;
    console.log('🔵 BUTTON CLICKED - handleCompleteTrip called with item:', itemId, 'Type:', item.cargoId ? 'ORDER' : 'TRIP');

    try {
      setCompletingTripId(itemId);

      // Check if this is an order (has cargoId) or a trip (has tripId without cargoId)
      const isOrder = !!item.cargoId;

      if (isOrder) {
        console.log('🚀 Completing ORDER:', itemId);
        const result = await dispatch(
          updateOrder({ id: itemId, data: { status: 'completed' } }) as any
        ).unwrap();
        console.log('✅ Order completion successful:', result);
      } else {
        console.log('🚀 Completing TRIP:', itemId);
        const result = await dispatch(
          completeTrip(itemId) as any
        ).unwrap();
        console.log('✅ Trip completion successful:', result);
      }

      showSuccess('Delivery marked as completed!');
      console.log('🔄 Refreshing trips and orders list after completion');
      setCompletingTripId(null);
      dispatch(fetchAllTrips() as any);
      dispatch(fetchOrders() as any);
    } catch (error: any) {
      setCompletingTripId(null);
      console.error('❌ Complete error:', error);
      console.error('Error details:', {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        fullError: String(error)
      });

      const errorMessage = error?.message || String(error) || 'Failed to complete delivery';
      showError(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit': return theme.info;
      case 'accepted': return theme.warning;
      case 'completed': return theme.success;
      default: return theme.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_transit': return 'In Transit';
      case 'accepted': return 'Accepted';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  if (isLoading && activeTrips.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.tertiary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.tertiary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isRefreshing}
            style={styles.refreshButton}
          >
            <FontAwesome
              name="refresh"
              size={20}
              color={theme.card}
              style={{ opacity: isRefreshing ? 0.5 : 1 }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerBottom}>
          <Text style={[styles.title, { color: theme.card }]}>Active Trips</Text>
          {isTracking && currentLocation && (
            <View style={styles.trackingIndicator}>
              <View style={[styles.trackingPulse, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.trackingText, { color: theme.card }]}>
                Live Tracking • {currentLocation.speed?.toFixed(0) || 0} km/h
              </Text>
            </View>
          )}
        </View>
      </View>

      {allActiveItems.length === 0 ? (
        <EmptyState
          icon="car-sport-outline"
          title="No active trips"
          description="Accept loads to start transporting"
          actionText="Find Loads"
          onActionPress={() => navigation.navigate('AvailableLoads')}
        />
      ) : (
        <FlatList
          data={allActiveItems}
          keyExtractor={(item) => item._id || item.id || item.tripId}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderItem={({ item: trip, index }) => (
            <View style={styles.cardWrapper}>
              <Card>
              <View style={styles.tripHeader}>
                <Text style={[styles.cropName, { color: theme.text }]}>
                  {trip.shipment?.cropName || 'Delivery'}
                </Text>
                <Badge
                  label={getStatusLabel(trip.status).toUpperCase()}
                  variant={trip.status === 'in_transit' ? 'primary' : trip.status === 'accepted' ? 'warning' : 'success'}
                  size="sm"
                />
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Quantity:</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {trip.shipment?.quantity} {trip.shipment?.unit}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Payment:</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {(trip.earnings?.totalRate || 0).toLocaleString()} RWF
                </Text>
              </View>

              {/* Live ETA Info */}
              {currentLocation && trip.delivery && (
                (() => {
                  const deliveryLat = trip.delivery.latitude || -1.9706;
                  const deliveryLon = trip.delivery.longitude || 29.9498;

                  const remainingDistance = distanceService.calculateDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    deliveryLat,
                    deliveryLon
                  );

                  const etaData = calculateRemainingETA(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    deliveryLat,
                    deliveryLon,
                    currentLocation.speed || 50
                  );

                  return (
                    <View style={[styles.liveETABox, { backgroundColor: etaData.trafficInfo.color + '15', borderColor: etaData.trafficInfo.color }]}>
                      <View style={styles.etaRow}>
                        <View style={[styles.etaIcon, { backgroundColor: etaData.trafficInfo.color + '25' }]}>
                          <Text style={{ fontSize: 20 }}>{etaData.trafficInfo.icon}</Text>
                        </View>
                        <View style={styles.etaContent}>
                          <Text style={[styles.etaLabel, { color: theme.textSecondary }]}>
                            📍 {remainingDistance.toFixed(1)} km to destination
                          </Text>
                          <Text style={[styles.etaTime, { color: etaData.trafficInfo.color }]}>
                            🕐 Arriving at {formatArrivalTime(etaData.arrivalTime)} • {formatDuration(etaData.durationMinutes)}
                          </Text>
                          <Text style={[styles.etaTraffic, { color: theme.textSecondary }]}>
                            {etaData.trafficInfo.description}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })()
              )}

              <View style={styles.locationSection}>
                <View style={styles.locationItem}>
                  <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                    📍 From:
                  </Text>
                  <Text style={[styles.locationText, { color: theme.text }]}>
                    {trip.pickup?.address || 'Not specified'}
                  </Text>
                </View>
                <View style={styles.locationItem}>
                  <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                    🏁 To:
                  </Text>
                  <Text style={[styles.locationText, { color: theme.text }]}>
                    {trip.delivery?.address || 'Not specified'}
                  </Text>
                </View>
              </View>

              {trip.status !== 'completed' && (
                <View style={styles.actionButtons}>
                  <Button
                    title="View Map"
                    onPress={() => handleViewMap(trip)}
                    variant="secondary"
                    size="md"
                    disabled={completingTripId === trip._id}
                    icon={<Ionicons name="map-outline" size={16} color="#fff" />}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title={completingTripId === trip._id ? 'Processing...' : 'Complete'}
                    onPress={() => handleCompleteTrip(trip)}
                    variant="primary"
                    size="md"
                    disabled={completingTripId === trip._id}
                    loading={completingTripId === trip._id}
                    icon={<Ionicons name="checkmark-circle-outline" size={16} color="#fff" />}
                    style={{ flex: 1 }}
                  />
                </View>
              )}
            </Card>
            </View>
          )}
        />
      )}

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
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    fontSize: 16,
  },
  refreshButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  row: {
    justifyContent: 'space-evenly',
    marginBottom: 8,
  },
  cardWrapper: {
    width: '45%',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cropName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
  },
  value: {
    fontSize: 10,
    fontWeight: '500',
  },
  locationSection: {
    marginTop: 5,
    marginBottom: 6,
  },
  locationItem: {
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: 9,
    marginBottom: 1,
  },
  locationText: {
    fontSize: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapButton: {
    flex: 1,
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // GPS Tracking Header
  headerBottom: {
    alignItems: 'center',
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  trackingPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trackingText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },

  // Live ETA Box
  liveETABox: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  etaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  etaContent: {
    flex: 1,
  },
  etaLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
  },
  etaTime: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  etaTraffic: {
    fontSize: 11,
    fontWeight: '500',
  },
});