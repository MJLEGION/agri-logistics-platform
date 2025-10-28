// src/screens/transporter/ActiveTripScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchOrders } from '../../store/slices/ordersSlice';
import { fetchTransporterTrips } from '../../logistics/store/tripsSlice';
import TripMapView from '../../components/TripMapView';
import tripService from '../../services/tripService';
import * as orderService from '../../services/orderService';

export default function ActiveTripScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.orders);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [tripInfo, setTripInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Find active trip for this driver
  useEffect(() => {
    console.log('🔍 DEBUG: Looking for active trip');
    console.log('📋 User ID:', user?._id || user?.id);
    console.log('📋 Total orders:', orders.length);
    console.log('📋 All orders:', orders.map(o => ({ id: o._id, transporterId: o.transporterId, status: o.status })));
    
    const myActiveTrip = orders.find(
      (order) =>
        order.transporterId === (user?._id || user?.id) &&
        order.status === 'in_progress'
    );
    console.log('✅ Found active trip:', myActiveTrip || 'None');
    setActiveTrip(myActiveTrip || null);
  }, [orders, user?._id, user?.id]);

  // Listen to trip updates
  useEffect(() => {
    if (!activeTrip) return;

    const handleTripUpdate = (trip: any) => {
      setTripInfo(trip);
    };

    tripService.on('trip_updated', handleTripUpdate);
    tripService.on('trip_arrived', handleTripUpdate);

    return () => {
      tripService.off('trip_updated', handleTripUpdate);
      tripService.off('trip_arrived', handleTripUpdate);
    };
  }, [activeTrip]);

  const handleCompleteDelivery = async () => {
    console.log('🔘 COMPLETE DELIVERY BUTTON CLICKED!');
    console.log('📋 activeTrip:', activeTrip);
    
    if (!activeTrip) {
      console.log('❌ No activeTrip found!');
      alert('No active trip found');
      return;
    }

    console.log('🔘 COMPLETE DELIVERY BUTTON CLICKED! Order ID:', activeTrip._id || activeTrip.id);
    
    // Try using browser confirm as fallback for web
    const isWeb = typeof window !== 'undefined' && !window.cordova;
    console.log('🌐 Is Web Platform:', isWeb);
    
    if (isWeb) {
      const confirmed = window.confirm('Mark this delivery as complete? 🎉 Earnings will be added to your account.');
      console.log('✔️ Browser confirm result:', confirmed);
      
      if (confirmed) {
        try {
          setIsLoading(true);
          const tripId = activeTrip._id || activeTrip.id;
          console.log('🚀 Starting complete delivery for ID:', tripId);
          
          const result = await orderService.completeDelivery(tripId);
          console.log('✅ Complete delivery successful:', result);
          
          tripService.completeTrip(tripId);
          // Refresh BOTH orders and trips so dashboard updates
          await dispatch(fetchOrders());
          const transporterId = user?._id || user?.id;
          if (transporterId) {
            await dispatch(fetchTransporterTrips(transporterId));
          }
          
          alert('🎉 Success! Delivery completed. Earnings added to your account.');
          navigation.goBack();
        } catch (error: any) {
          console.error('❌ Complete delivery error caught:', error);
          const errorMessage = 
            typeof error === 'string' ? error : 
            error?.message || 
            String(error) || 
            'Failed to complete delivery';
          
          console.error('📤 Showing error message:', errorMessage);
          alert('Error: ' + errorMessage);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('❌ User cancelled the action');
      }
    } else {
      // Native/mobile platform - use Alert.alert
      Alert.alert('Complete Delivery', 'Mark this delivery as complete? 🎉 Earnings will be added to your account.', [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setIsLoading(true);
              const tripId = activeTrip._id || activeTrip.id;
              console.log('🚀 Starting complete delivery for ID:', tripId);
              
              const result = await orderService.completeDelivery(tripId);
              console.log('✅ Complete delivery successful:', result);
              
              tripService.completeTrip(tripId);
              // Refresh BOTH orders and trips so dashboard updates
              await dispatch(fetchOrders());
              const transporterId = user?._id || user?.id;
              if (transporterId) {
                await dispatch(fetchTransporterTrips(transporterId));
              }
              
              Alert.alert('Success! 🎉', 'Delivery completed. Earnings added to your account.', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              console.error('❌ Complete delivery error caught:', error);
              const errorMessage = 
                typeof error === 'string' ? error : 
                error?.message || 
                String(error) || 
                'Failed to complete delivery';
              
              console.error('📤 Showing error message:', errorMessage);
              Alert.alert('Error', errorMessage);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]);
    }
  };

  if (!activeTrip) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.tertiary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.card }]}>Active Trip</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No Active Trips</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Accept a load to get started
          </Text>
        </View>
      </View>
    );
  }

  const distance = tripInfo?.distanceRemaining || 2;
  const eta = tripInfo?.eta || 5;
  const status = tripInfo?.status || activeTrip.status;
  
  // Debug logging
  console.log('🚗 ActiveTrip Status:', status);
  console.log('🚗 ActiveTrip:', activeTrip);
  console.log('🚗 Should button show?', status !== 'completed');
  
  const earnings = Math.round(
    (activeTrip.quantity * 1000) / 50 || // Simplified: 1000 RWF per unit ~
    Math.abs(
      activeTrip.pickupLocation.latitude - activeTrip.deliveryLocation.latitude
    ) * 111 * 1000
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.tertiary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>🚚 Active Trip</Text>
      </View>

      {/* Map View */}
      <TripMapView
        pickupLocation={activeTrip.pickupLocation}
        deliveryLocation={activeTrip.deliveryLocation}
        isTracking={true}
        driverLocation={tripInfo?.driverLocation}
      />

      {/* Trip Details */}
      <ScrollView style={styles.details}>
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor:
                status === 'completed'
                  ? theme.success
                  : status === 'arrived'
                    ? '#FF9800'
                    : theme.info,
            },
          ]}
        >
          <Text style={styles.statusIcon}>
            {status === 'completed'
              ? '✅'
              : status === 'arrived'
                ? '🎯'
                : '🚗'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusText}>
              {status === 'in_progress' ? '🚗 Coming' : status === 'arrived' ? '🎯 Arrived' : '✅ Completed'}
            </Text>
            <Text style={styles.statusSubtext}>
              {status === 'in_progress'
                ? `ETA: ${eta} min • ${distance.toFixed(1)} km away`
                : status === 'arrived'
                  ? 'Ready for pickup'
                  : 'Delivery completed'}
            </Text>
          </View>
        </View>

        {/* Trip Info */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🎁 Load Details</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Crop:</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {activeTrip.cropId?.name || 'Unknown'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Quantity:</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {activeTrip.quantity} {activeTrip.unit}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Total Value:</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {activeTrip.totalPrice.toLocaleString()} RWF
            </Text>
          </View>
        </View>

        {/* Location Info */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>📍 Locations</Text>
          <View style={styles.locationBox}>
            <Text style={[styles.locationIcon, { color: theme.success }]}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>Pickup</Text>
              <Text style={[styles.locationAddress, { color: theme.text }]}>
                {activeTrip.pickupLocation.address}
              </Text>
            </View>
          </View>
          <View style={styles.locationBox}>
            <Text style={[styles.locationIcon, { color: theme.error }]}>🏁</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>Delivery</Text>
              <Text style={[styles.locationAddress, { color: theme.text }]}>
                {activeTrip.deliveryLocation.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Earnings */}
        <View
          style={[
            styles.earningsBox,
            { backgroundColor: theme.success + '20', borderColor: theme.success },
          ]}
        >
          <Text style={[styles.earningsLabel, { color: theme.textSecondary }]}>
            💰 You Will Earn
          </Text>
          <Text style={[styles.earningsAmount, { color: theme.success }]}>
            {earnings.toLocaleString()} RWF
          </Text>
          <Text style={[styles.earningsSubtext, { color: theme.textSecondary }]}>
            1,000 RWF/km × ~{Math.round(earnings / 1000)} km
          </Text>
        </View>

        {/* Action Buttons */}
        {status !== 'completed' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.completeButton,
                { 
                  backgroundColor: theme.success,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }
              ]}
              onPress={handleCompleteDelivery}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.completeButtonText}>
                    {status === 'arrived' ? '✅ Complete Delivery' : '📌 I Arrived'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  },
  backButton: {
    fontSize: 16,
    marginBottom: 10,
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  details: {
    flex: 1,
    padding: 15,
  },
  statusBanner: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationBox: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'flex-start',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  locationLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '500',
  },
  earningsBox: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  earningsLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  earningsSubtext: {
    fontSize: 12,
  },
  actions: {
    marginBottom: 20,
  },
  completeButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});