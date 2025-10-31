// src/screens/transporter/TripTrackingScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import TripMapView from '../../components/TripMapView';
import { useAppDispatch, useAppSelector } from '../../store';
import { completeTrip, fetchAllTrips } from '../../logistics/store/tripsSlice';
import { useLocation } from '../../utils/useLocation';
import locationService from '../../services/locationService';

export default function TripTrackingScreen({ route, navigation }: any) {
  const { trip } = route.params;
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isPollingActive, setIsPollingActive] = useState(false);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize real-time GPS tracking with 5-second updates
  const {
    location: trackedLocation,
    error: locationError,
    isTracking,
    startTracking,
    stopTracking,
  } = useLocation({
    enabled: trip.status === 'in_transit' && locationPermission !== false,
    orderId: trip._id || trip.tripId,
    updateInterval: 5000, // Send location every 5 seconds
  });

  useEffect(() => {
    requestLocationPermission();

    return () => {
      // Cleanup
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Update location when tracked location changes
  useEffect(() => {
    if (trackedLocation) {
      setCurrentLocation({
        latitude: trackedLocation.latitude,
        longitude: trackedLocation.longitude,
        accuracy: trackedLocation.accuracy,
        speed: trackedLocation.speed,
        heading: trackedLocation.heading,
        address: trackedLocation.address || 'Current Location',
      });
    }
  }, [trackedLocation]);

  // Fallback: Poll active locations from backend every 3 seconds
  useEffect(() => {
    if (trip.status !== 'in_transit') {
      return;
    }

    setIsPollingActive(true);

    const pollActiveLocations = async () => {
      try {
        const response = await locationService.getActiveLocations();
        if (response?.data && Array.isArray(response.data)) {
          // Find current transporter's location
          const transporterLocation = response.data.find(
            (loc: any) => loc.transporterId === trip.transporterId || loc.transporterId === trip.driverId
          );

          if (transporterLocation) {
            console.log('📍 Polled location from backend:', transporterLocation);
            setCurrentLocation({
              latitude: transporterLocation.latitude,
              longitude: transporterLocation.longitude,
              accuracy: transporterLocation.accuracy,
              speed: transporterLocation.speed,
              heading: transporterLocation.heading,
              address: transporterLocation.address || 'Current Location',
            });
          }
        }
      } catch (err) {
        console.warn('Failed to poll active locations:', err);
      }
    };

    // Poll immediately and then every 3 seconds
    pollActiveLocations();
    pollingIntervalRef.current = setInterval(pollActiveLocations, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      setIsPollingActive(false);
    };
  }, [trip.status, trip.transporterId, trip.driverId]);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'web') {
        setLocationPermission(true); // Allow web geolocation
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Location permission error:', error);
      setLocationPermission(false);
    }
  };

  const handleMarkCompleted = async () => {
    Alert.alert(
      'Complete Delivery',
      'Mark this delivery as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setIsUpdating(true);
              const tripId = trip._id || trip.tripId;
              console.log('🚀 Starting trip completion for:', tripId);
              console.log('📋 Trip object:', JSON.stringify({
                _id: trip._id,
                tripId: trip.tripId,
                status: trip.status,
                shipmentCropName: trip.shipment?.cropName,
              }));
              
              const result = await dispatch(
                completeTrip(tripId) as any
              ).unwrap();

              console.log('✅ Trip completion successful:', result);
              setIsUpdating(false);
              Alert.alert('Success', 'Delivery marked as completed!', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Refresh trips list
                    console.log('🔄 Refreshing trips list after completion');
                    dispatch(fetchAllTrips() as any);
                    navigation.goBack();
                  },
                },
              ]);
            } catch (error: any) {
              setIsUpdating(false);
              console.error('❌ Complete error:', error);
              console.error('Error details:', JSON.stringify(error));
              Alert.alert(
                'Error',
                error?.message || String(error) || 'Failed to complete delivery'
              );
            }
          },
        },
      ]
    );
  };

  const handleRefreshLocation = async () => {
    setIsUpdating(true);
    try {
      // Manually fetch current position
      if (locationPermission === true && Platform.OS !== 'web') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          speed: (location.coords.speed || 0) * 3.6,
          heading: location.coords.heading || 0,
          address: 'Current Location',
        });
      } else {
        // For web, fetch from backend
        const response = await locationService.getActiveLocations();
        if (response?.data && Array.isArray(response.data)) {
          const transporterLocation = response.data.find(
            (loc: any) => loc.transporterId === trip.transporterId || loc.transporterId === trip.driverId
          );
          if (transporterLocation) {
            setCurrentLocation({
              latitude: transporterLocation.latitude,
              longitude: transporterLocation.longitude,
              accuracy: transporterLocation.accuracy,
              speed: transporterLocation.speed,
              heading: transporterLocation.heading,
              address: transporterLocation.address || 'Current Location',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing location:', error);
      Alert.alert('Error', 'Failed to refresh location');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit':
        return theme.info;
      case 'completed':
        return theme.success;
      case 'accepted':
        return theme.warning;
      default:
        return theme.textSecondary;
    }
  };

  const pickupLat = trip.pickup?.latitude || -2.0;
  const pickupLng = trip.pickup?.longitude || 29.7;
  const deliveryLat = trip.delivery?.latitude || -2.0;
  const deliveryLng = trip.delivery?.longitude || 29.8;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.tertiary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>Trip Tracking</Text>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <TripMapView
          pickupLocation={{
            latitude: pickupLat,
            longitude: pickupLng,
            address: trip.pickup?.address || 'Pickup Location',
          }}
          deliveryLocation={{
            latitude: deliveryLat,
            longitude: deliveryLng,
            address: trip.delivery?.address || 'Delivery Location',
          }}
          currentLocation={currentLocation}
          isTracking={trip.status === 'in_transit'}
        />
      </View>

      {/* Details Card */}
      <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.tripHeader}>
            <Text style={[styles.cropName, { color: theme.text }]}>
              {trip.shipment?.cargoName || trip.shipment?.cropName || 'Delivery'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
              <Text style={styles.statusText}>{trip.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Quantity:</Text>
            <Text style={[styles.value, { color: theme.text }]}>{trip.shipment?.quantity} {trip.shipment?.unit}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Price:</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {(trip.earnings?.totalRate || 0).toLocaleString()} RWF
            </Text>
          </View>

          {/* Current Location Info */}
          {currentLocation && (
            <View style={[styles.currentLocationBox, { borderColor: theme.tertiary }]}>
              <View style={styles.locationLabelRow}>
                <FontAwesome name="map-marker" size={14} color={theme.tertiary} />
                <Text style={[styles.currentLocationLabel, { color: theme.tertiary }]}>
                  Your Current Location
                </Text>
              </View>
              <Text style={[styles.currentLocationCoords, { color: theme.text }]}>
                {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: theme.info }]}
              onPress={handleRefreshLocation}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <FontAwesome name="refresh" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Refresh Location</Text>
                </View>
              )}
            </TouchableOpacity>

            {trip.status !== 'completed' && (
              <TouchableOpacity
                style={[styles.completeButton, { backgroundColor: theme.success }]}
                onPress={handleMarkCompleted}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <FontAwesome name="check" size={16} color="#fff" />
                    <Text style={styles.buttonText}>Mark Completed</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Route Details */}
        <Card style={{ marginTop: 10 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Route Details</Text>

          <View style={styles.routeItem}>
            <View style={styles.routeLabelRow}>
              <FontAwesome name="cube" size={14} color={theme.success} />
              <Text style={[styles.routeLabel, { color: theme.success }]}>Pickup</Text>
            </View>
            <Text style={[styles.routeText, { color: theme.text }]}>
              {trip.pickup?.address || 'Not specified'}
            </Text>
          </View>

          <View style={[styles.routeSeparator, { backgroundColor: theme.border }]} />

          <View style={styles.routeItem}>
            <View style={styles.routeLabelRow}>
              <FontAwesome name="truck" size={14} color={theme.info} />
              <Text style={[styles.routeLabel, { color: theme.info }]}>In Transit</Text>
            </View>
            <Text style={[styles.routeText, { color: theme.textSecondary }]}>
              {trip.status === 'in_transit' ? 'Active' : 'Pending'}
            </Text>
          </View>

          <View style={[styles.routeSeparator, { backgroundColor: theme.border }]} />

          <View style={styles.routeItem}>
            <View style={styles.routeLabelRow}>
              <FontAwesome name="flag" size={14} color={theme.info} />
              <Text style={[styles.routeLabel, { color: theme.info }]}>Delivery</Text>
            </View>
            <Text style={[styles.routeText, { color: theme.text }]}>
              {trip.delivery?.address || 'Not specified'}
            </Text>
          </View>
        </Card>

        {/* Notes */}
        {trip.notes && (
          <Card style={{ marginTop: 10, marginBottom: 20 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notes</Text>
            <Text style={[styles.noteText, { color: theme.text }]}>{trip.notes}</Text>
          </Card>
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
    paddingBottom: 15,
  },
  backButton: {
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 300,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailsContainer: {
    flex: 1,
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
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  currentLocationBox: {
    marginVertical: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'rgba(41, 128, 185, 0.05)',
  },
  currentLocationLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  currentLocationCoords: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  locationLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  refreshButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  routeItem: {
    paddingVertical: 10,
  },
  routeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  routeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  routeText: {
    fontSize: 13,
  },
  routeSeparator: {
    height: 1,
    marginVertical: 8,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
  },
});