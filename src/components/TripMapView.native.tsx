// Native (iOS/Android) version of TripMapView
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface TripMapViewProps {
  pickupLocation: Location;
  deliveryLocation: Location;
  currentLocation?: Location;
  isTracking?: boolean;
}

export default function TripMapView({
  pickupLocation,
  deliveryLocation,
  currentLocation,
  isTracking = false,
}: TripMapViewProps) {
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: (pickupLocation.latitude + deliveryLocation.latitude) / 2,
    longitude: (pickupLocation.longitude + deliveryLocation.longitude) / 2,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });

  useEffect(() => {
    // Calculate center and zoom to fit both markers
    const minLat = Math.min(pickupLocation.latitude, deliveryLocation.latitude);
    const maxLat = Math.max(pickupLocation.latitude, deliveryLocation.latitude);
    const minLng = Math.min(pickupLocation.longitude, deliveryLocation.longitude);
    const maxLng = Math.max(pickupLocation.longitude, deliveryLocation.longitude);

    const latDelta = maxLat - minLat + 0.05;
    const lngDelta = maxLng - minLng + 0.05;

    setMapRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.1),
      longitudeDelta: Math.max(lngDelta, 0.1),
    });
    setIsReady(true);
  }, [pickupLocation, deliveryLocation]);

  if (!isReady) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tertiary} />
      </View>
    );
  }

  const routeCoordinates = [
    { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
    ...(currentLocation
      ? [{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }]
      : []),
    { latitude: deliveryLocation.latitude, longitude: deliveryLocation.longitude },
  ];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomControlEnabled={true}
      >
        {/* Pickup Location Marker */}
        <Marker
          coordinate={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
          }}
          title="Pickup Location"
          description={pickupLocation.address}
          pinColor="#27AE60"
        />

        {/* Delivery Location Marker */}
        <Marker
          coordinate={{
            latitude: deliveryLocation.latitude,
            longitude: deliveryLocation.longitude,
          }}
          title="Delivery Location"
          description={deliveryLocation.address}
          pinColor="#E74C3C"
        />

        {/* Current Location Marker (if tracking) */}
        {currentLocation && isTracking && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Current Location"
            pinColor="#2980B9"
          />
        )}

        {/* Route Polyline */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={theme.tertiary}
          strokeWidth={3}
          lineDashPattern={isTracking ? undefined : [10, 5]}
        />
      </MapView>

      {/* Info Box */}
      <View
        style={[styles.infoBox, { backgroundColor: theme.card, borderTopColor: theme.border }]}
      >
        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <FontAwesome name="cube" size={12} color={theme.textSecondary} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>From:</Text>
          </View>
          <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
            {pickupLocation.address}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <FontAwesome name="flag" size={12} color={theme.textSecondary} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>To:</Text>
          </View>
          <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
            {deliveryLocation.address}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  infoBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  infoRow: {
    marginVertical: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
});