// src/screens/OrderTrackingScreen.tsx

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import TripMapView from '../components/TripMapView';
import { useTheme } from '../contexts/ThemeContext';
import { OrderTrackingScreenProps } from '../types/navigation';
import { Order } from '../types';

const OrderTrackingScreen = ({ route, navigation }: OrderTrackingScreenProps) => {
  const { theme } = useTheme();
  const order: Order | undefined = route.params?.order;

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
      </View>
      <TripMapView
        pickupLocation={pickupLocation}
        deliveryLocation={deliveryLocation}
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
  },
});

export default OrderTrackingScreen;