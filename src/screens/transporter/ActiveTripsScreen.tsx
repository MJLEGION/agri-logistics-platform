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
import { getActiveTripsForTransporter } from '../../logistics/utils/tripCalculations';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import EmptyState from '../../components/EmptyState';
import Toast, { useToast } from '../../components/Toast';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';

export default function ActiveTripsScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { trips, isLoading } = useAppSelector((state) => state.trips);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [completingTripId, setCompletingTripId] = useState<string | null>(null);
  const { toast, showSuccess, showError, hideToast } = useToast();
  
  // ✨ Pizzazz Animations
  const animations = useScreenAnimations(6);

  const activeTrips = getActiveTripsForTransporter(
    trips,
    user?.id || user?._id || ''
  );

  useEffect(() => {
    console.log('✅ ActiveTripsScreen mounted/updated');
    console.log('📊 State:', { activeTrips: activeTrips.length, isLoading, completingTripId });
  }, [activeTrips, isLoading, completingTripId]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchAllTrips() as any);
    }, [dispatch])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchAllTrips() as any);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewMap = (trip: any) => {
    navigation.navigate('TripTracking', { trip });
  };

  const handleCompleteTrip = async (trip: any) => {
    const tripId = trip._id || trip.tripId;
    console.log('🔵 BUTTON CLICKED - handleCompleteTrip called with trip:', tripId);
    
    try {
      setCompletingTripId(tripId);
      console.log('🚀 Completing trip:', tripId);
      
      const result = await dispatch(
        completeTrip(tripId) as any
      ).unwrap();

      console.log('✅ Trip completion successful:', result);

      showSuccess('Delivery marked as completed!');
      console.log('🔄 Refreshing trips list after completion');
      setCompletingTripId(null);
      dispatch(fetchAllTrips() as any);
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
        <Text style={[styles.title, { color: theme.card }]}>Active Trips</Text>
      </View>

      {activeTrips.length === 0 ? (
        <EmptyState
          icon="car-sport-outline"
          title="No active trips"
          description="Accept loads to start transporting"
          actionText="Find Loads"
          onActionPress={() => navigation.navigate('AvailableLoads')}
        />
      ) : (
        <FlatList
          data={activeTrips}
          keyExtractor={(item) => item._id || item.tripId}
          contentContainerStyle={styles.list}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderItem={({ item: trip, index }) => (
            <Animated.View style={animations.getFloatingCardStyle(index % 6)}>
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
            </Animated.View>
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
    padding: 15,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cropName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationSection: {
    marginTop: 10,
    marginBottom: 15,
  },
  locationItem: {
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});