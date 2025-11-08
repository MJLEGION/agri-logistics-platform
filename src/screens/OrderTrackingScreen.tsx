// src/screens/OrderTrackingScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import TripMapView from '../components/TripMapView';
import { useTheme } from '../contexts/ThemeContext';
import { OrderTrackingScreenProps } from '../types/navigation';
import { Order } from '../types';
import locationService from '../services/locationService';

const OrderTrackingScreen = ({ route, navigation }: OrderTrackingScreenProps) => {
  const { theme } = useTheme();
  const order: Order | undefined = route.params?.order;
  const [transporterLocation, setTransporterLocation] = useState<any>(null);
  const [pollingError, setPollingError] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback to sample data if order data is not available for development/testing
  const pickupLocation = order?.pickupLocation || {
    latitude: -1.9403, // Kigali, Rwanda
    longitude: 30.0589,
    address: 'Kigali Market',
  };

  const deliveryLocation = order?.deliveryLocation || {
    latitude: -1.9536,
    longitude: 30.0605,
    address: 'Downtown Kigali',
  };

  const orderStatus = order?.status || 'in_progress';
  const isTracking = orderStatus === 'in_progress' || orderStatus === 'accepted';

  const orderId = order?._id?.slice(-6) || order?.id?.slice(-6);

  // Poll for active transporter locations
  useEffect(() => {
    if (!isTracking) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      return;
    }

    const pollTransporterLocation = async () => {
      try {
        const response = await locationService.getActiveLocations();
        if (response?.data && Array.isArray(response.data)) {
          // Try to find transporter location from order
          const transporterId = (order as any)?.transporterId || (order as any)?.assignedTransporter?.id;
          
          let location = null;
          if (transporterId) {
            location = response.data.find((loc: any) => loc.transporterId === transporterId);
          }
          
          // If not found, use the first available location
          if (!location && response.data.length > 0) {
            location = response.data[0];
          }

          if (location) {
            setTransporterLocation({
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
              speed: location.speed,
              heading: location.heading,
              address: location.address || 'Transporter Location',
            });
            setPollingError(null);
          }
        }
      } catch (err) {
        console.warn('Failed to poll transporter location:', err);
        setPollingError('Could not fetch live location');
      }
    };

    // Poll immediately and then every 3 seconds
    pollTransporterLocation();
    pollingIntervalRef.current = setInterval(pollTransporterLocation, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isTracking, order]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.secondary, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.card} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>📍 Order Tracking</Text>
        {orderId && (
          <Text style={[styles.orderId, { color: theme.card }]}>
            Order #{orderId}
          </Text>
        )}
        {isTracking && (
          <View style={styles.liveIndicator}>
            <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
            <Text style={[styles.liveText, { color: theme.success }]}>LIVE</Text>
          </View>
        )}
      </View>
      <TripMapView
        pickupLocation={pickupLocation}
        deliveryLocation={deliveryLocation}
        currentLocation={transporterLocation}
        isTracking={isTracking}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default OrderTrackingScreen;