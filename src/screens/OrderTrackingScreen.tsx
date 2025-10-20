// src/screens/OrderTrackingScreen.tsx

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TripMapView from '../components/TripMapView';
import { useTheme } from '../contexts/ThemeContext';

const OrderTrackingScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const order = route?.params?.order;

  // Use order data if available, otherwise use sample data
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

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.secondary }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.card} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>📍 Order Tracking</Text>
        {order && (
          <Text style={[styles.orderId, { color: theme.card }]}>
            Order #{order._id?.slice(-6) || order.id?.slice(-6)}
          </Text>
        )}
      </View>
      <TripMapView
        pickupLocation={pickupLocation}
        deliveryLocation={deliveryLocation}
        isTracking={isTracking}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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