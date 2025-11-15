// src/screens/shipper/TrackingMapView.web.tsx
// Web fallback component (no react-native-maps)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface TrackingMapViewProps {
  mapRegion: any;
  shippingCenter?: {
    address: string;
  };
  destination?: {
    address: string;
  };
  routeCoordinates: any[];
  itemName?: string;
}

export default function TrackingMapView({
  shippingCenter,
  destination,
  itemName,
}: TrackingMapViewProps) {
  return (
    <LinearGradient colors={['#10797D', '#0D5F66']} style={styles.webMapGradient}>
      <Ionicons name="map" size={64} color="#FFF" style={{ opacity: 0.3 }} />
      <Text style={styles.webMapTitle}>Map View</Text>
      {itemName && <Text style={styles.webMapSubtitle}>{itemName}</Text>}
      <View style={styles.webMapRoute}>
        <View style={styles.webMapPoint}>
          <Ionicons name="location" size={24} color="#FFF" />
          <Text style={styles.webMapPointText}>
            {shippingCenter?.address || 'Origin'}
          </Text>
        </View>
        <View style={styles.webMapArrow}>
          <Ionicons name="arrow-down" size={32} color="rgba(255,255,255,0.5)" />
        </View>
        <View style={styles.webMapPoint}>
          <Ionicons name="location" size={24} color="#FFF" />
          <Text style={styles.webMapPointText}>
            {destination?.address || 'Destination'}
          </Text>
        </View>
      </View>
      <Text style={styles.webMapNote}>📱 Maps are available on mobile app</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  webMapGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  webMapTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  webMapSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
  },
  webMapRoute: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  webMapPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  webMapPointText: {
    flex: 1,
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  webMapArrow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  webMapNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
});
