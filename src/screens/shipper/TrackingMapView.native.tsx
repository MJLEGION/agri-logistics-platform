// src/screens/shipper/TrackingMapView.native.tsx
// Native-only map view component (iOS/Android)
import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

interface TrackingMapViewProps {
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  shippingCenter?: {
    coordinates?: { latitude: number; longitude: number };
    address: string;
  };
  destination?: {
    coordinates?: { latitude: number; longitude: number };
    address: string;
  };
  routeCoordinates: Array<{ latitude: number; longitude: number }>;
}

export default function TrackingMapView({
  mapRegion,
  shippingCenter,
  destination,
  routeCoordinates,
}: TrackingMapViewProps) {
  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={mapRegion}
      region={mapRegion}
    >
      {/* Markers */}
      {shippingCenter?.coordinates && (
        <Marker
          coordinate={shippingCenter.coordinates}
          pinColor="#10797D"
          title="Origin"
          description={shippingCenter.address}
        />
      )}
      {destination?.coordinates && (
        <Marker
          coordinate={destination.coordinates}
          pinColor="#10797D"
          title="Destination"
          description={destination.address}
        />
      )}

      {/* Route Polyline */}
      {routeCoordinates.length > 1 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#10797D"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});
