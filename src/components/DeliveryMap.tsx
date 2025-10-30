/**
 * DeliveryMap Component
 * Display delivery route on map with pickup and delivery locations
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

interface Location {
  latitude: number;
  longitude: number;
}

interface DeliveryMapProps {
  transporterLocation?: Location | null;
  pickupLocation?: Location;
  deliveryLocation?: Location;
  mapKey?: string;
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  transporterLocation,
  pickupLocation,
  deliveryLocation,
  mapKey,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string>('');

  useEffect(() => {
    if (!transporterLocation || !deliveryLocation) {
      return;
    }

    // Generate Google Maps URL with markers
    const generateMapUrl = () => {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY || mapKey || '';

      if (!apiKey) {
        setError('Google Maps API key not configured');
        return;
      }

      // Build markers for the map
      const markers = [];

      if (transporterLocation) {
        markers.push(
          `markers=color:blue|label:T|${transporterLocation.latitude},${transporterLocation.longitude}`
        );
      }

      if (pickupLocation) {
        markers.push(
          `markers=color:green|label:P|${pickupLocation.latitude},${pickupLocation.longitude}`
        );
      }

      if (deliveryLocation) {
        markers.push(
          `markers=color:red|label:D|${deliveryLocation.latitude},${deliveryLocation.longitude}`
        );
      }

      // Calculate center point
      const centerLat =
        (transporterLocation.latitude +
          (pickupLocation?.latitude || 0) +
          (deliveryLocation?.latitude || 0)) /
        3;
      const centerLon =
        (transporterLocation.longitude +
          (pickupLocation?.longitude || 0) +
          (deliveryLocation?.longitude || 0)) /
        3;

      const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
      const params = new URLSearchParams({
        center: `${centerLat},${centerLon}`,
        zoom: '13',
        size: `${Dimensions.get('window').width - 32}x300`,
        ...Object.fromEntries(markers.map((m, i) => [`markers${i}`, m])),
        key: apiKey,
      });

      setMapUrl(`${baseUrl}?${params.toString()}`);
      setLoading(false);
    };

    setLoading(true);
    setTimeout(() => generateMapUrl(), 100);
  }, [transporterLocation, pickupLocation, deliveryLocation, mapKey]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.helperText}>
          Please add GOOGLE_MAPS_API_KEY to your environment variables
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Route</Text>

      {mapUrl ? (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapInfoText}>
            📍 Transporter Location (Blue): {transporterLocation?.latitude.toFixed(4)},{' '}
            {transporterLocation?.longitude.toFixed(4)}
          </Text>
          {pickupLocation && (
            <Text style={styles.mapInfoText}>
              📦 Pickup (Green): {pickupLocation.latitude.toFixed(4)}, {pickupLocation.longitude.toFixed(4)}
            </Text>
          )}
          {deliveryLocation && (
            <Text style={styles.mapInfoText}>
              🏁 Delivery (Red): {deliveryLocation.latitude.toFixed(4)}, {deliveryLocation.longitude.toFixed(4)}
            </Text>
          )}
          <View style={styles.mapImage}>
            <Text style={styles.mapImageText}>
              {'\n'}
              [Map would display here]{'\n'}
              Use mapUrl to render with react-native-maps or Google Maps API
              {'\n\n'}
              URL: {mapUrl.substring(0, 80)}...
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No location data available. Start tracking to display route.
          </Text>
        </View>
      )}

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Transporter</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: '#28a745' }]} />
          <Text style={styles.legendText}>Pickup</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: '#dc3545' }]} />
          <Text style={styles.legendText}>Delivery</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 8,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  mapPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mapInfoText: {
    fontSize: 11,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  mapImage: {
    height: 300,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mapImageText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
  },
  noDataContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 4,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noDataText: {
    color: '#856404',
    fontSize: 14,
  },
  legendContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
});