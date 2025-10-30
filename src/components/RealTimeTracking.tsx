/**
 * RealTimeTracking Component
 * Displays real-time GPS tracking UI
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocation } from '../utils/useLocation';

interface RealTimeTrackingProps {
  orderId?: string;
  onLocationUpdate?: (location: any) => void;
}

export const RealTimeTracking: React.FC<RealTimeTrackingProps> = ({
  orderId,
  onLocationUpdate,
}) => {
  const { location, error, loading, startTracking, stopTracking } = useLocation(
    false,
    orderId || null
  );
  const [isTracking, setIsTracking] = useState(false);

  const handleStartTracking = () => {
    startTracking();
    setIsTracking(true);
  };

  const handleStopTracking = () => {
    stopTracking();
    setIsTracking(false);
  };

  useEffect(() => {
    if (location && onLocationUpdate) {
      onLocationUpdate(location);
    }
  }, [location, onLocationUpdate]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Real-Time Tracking</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Getting location...</Text>
        </View>
      )}

      {location && (
        <View style={styles.locationInfoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Latitude:</Text>
            <Text style={styles.value}>{location.latitude?.toFixed(4)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Longitude:</Text>
            <Text style={styles.value}>{location.longitude?.toFixed(4)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Accuracy:</Text>
            <Text style={styles.value}>{location.accuracy?.toFixed(0) || 0}m</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Speed:</Text>
            <Text style={styles.value}>{location.speed?.toFixed(1) || 0} km/h</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Heading:</Text>
            <Text style={styles.value}>{location.heading?.toFixed(0) || 0}°</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Last Updated:</Text>
            <Text style={styles.value}>
              {location.timestamp instanceof Date
                ? location.timestamp.toLocaleTimeString()
                : new Date().toLocaleTimeString()}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.startBtn, isTracking && styles.disabledBtn]}
          onPress={handleStartTracking}
          disabled={isTracking}
        >
          <Text style={styles.buttonText}>Start Tracking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.stopBtn, !isTracking && styles.disabledBtn]}
          onPress={handleStopTracking}
          disabled={!isTracking}
        >
          <Text style={styles.buttonText}>Stop Tracking</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#c82333',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
  },
  loadingText: {
    color: '#0c5460',
    fontSize: 14,
    marginTop: 8,
  },
  locationInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  value: {
    color: '#666',
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    backgroundColor: '#28a745',
  },
  stopBtn: {
    backgroundColor: '#dc3545',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});