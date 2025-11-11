// Route Planner Screen - Optimize delivery routes with multiple stops
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppSelector } from '../../store';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';
import {
  optimizeMultiStopRoute,
  calculateRouteSegments,
  suggestRestStops,
  calculateDistance,
  calculateEarnings,
  calculateFuelCost,
} from '../../services/routeOptimizationService';
import { showToast } from '../../services/toastService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export default function RoutePlannerScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { orders } = useAppSelector(state => state.orders);
  const { user } = useAppSelector(state => state.auth);
  const animations = useScreenAnimations(6); // ✨ Pizzazz animations

  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [selectedLoads, setSelectedLoads] = useState<any[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation({ latitude: -1.9706, longitude: 30.1044, address: 'Kigali' });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: 'Current Location',
      });
    } catch (error) {
      setCurrentLocation({ latitude: -1.9706, longitude: 30.1044, address: 'Kigali' });
    }
  };

  // Get my accepted loads
  const myLoads = orders.filter(
    order =>
      (order.transporterId === user?.id || order.transporterId?._id === user?.id) &&
      (order.status === 'accepted' || order.status === 'in_progress')
  );

  const toggleLoad = (load: any) => {
    const isSelected = selectedLoads.find(l => l._id === load._id);
    if (isSelected) {
      setSelectedLoads(selectedLoads.filter(l => l._id !== load._id));
    } else {
      setSelectedLoads([...selectedLoads, load]);
    }
  };

  const optimizeRoute = () => {
    if (!currentLocation) {
      showToast.error('Unable to get current location');
      return;
    }

    if (selectedLoads.length === 0) {
      showToast.warning('Please select at least one load to optimize');
      return;
    }

    setIsOptimizing(true);

    try {
      // Create waypoints from selected loads
      const waypoints = selectedLoads.flatMap(load => [
        { ...load.pickupLocation, type: 'pickup' as const, sequence: 0 },
        { ...load.deliveryLocation, type: 'delivery' as const, sequence: 0 },
      ]);

      // Optimize route
      const optimized = optimizeMultiStopRoute(currentLocation, waypoints);

      // Calculate segments
      const fullRoute = [currentLocation, ...optimized];
      const segments = calculateRouteSegments(fullRoute);

      // Calculate totals
      const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
      const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
      const totalEarnings = calculateEarnings(totalDistance);
      const totalFuelCost = calculateFuelCost(totalDistance);
      const netProfit = totalEarnings - totalFuelCost;

      // Suggest rest stops
      const restStops = suggestRestStops(segments, 4);

      setOptimizedRoute({
        waypoints: optimized,
        segments,
        totalDistance,
        totalDuration,
        totalEarnings,
        totalFuelCost,
        netProfit,
        restStops,
      });
      showToast.success('Route optimized successfully!');
    } catch (error) {
      showToast.error('Failed to optimize route');
    } finally {
      setIsOptimizing(false);
    }
  };

  const clearRoute = () => {
    setOptimizedRoute(null);
    setSelectedLoads([]);
  };

  const handleStartNavigation = () => {
    setShowNavigationDialog(false);
    if (selectedLoads[0]) {
      navigation.navigate('TripTracking', { trip: selectedLoads[0] });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Navigate to previous screen"
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route Planner</Text>
        <Ionicons name="map" size={24} color="#FFF" />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Location */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={20} color="#EC4899" />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Starting Point</Text>
          </View>
          <Text style={[styles.locationText, { color: theme.textSecondary }]}>
            {currentLocation?.address || 'Getting location...'}
          </Text>
          <Text style={[styles.coordsText, { color: theme.textSecondary }]}>
            {currentLocation
              ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
              : 'Waiting for GPS...'}
          </Text>
        </View>

        {/* Available Loads */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={20} color="#EC4899" />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Your Loads ({myLoads.length})
            </Text>
          </View>

          {myLoads.length === 0 ? (
            <View style={styles.emptyLoads}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No accepted loads yet. Accept loads to plan routes.
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                Select loads to include in your route
              </Text>
              {myLoads.map((load, index) => {
                const isSelected = selectedLoads.find(l => l._id === load._id);
                return (
                  <Animated.View key={load._id} style={animations.getFloatingCardStyle(index % 6)}>
                    <TouchableOpacity
                      style={[
                        styles.loadItem,
                        {
                          backgroundColor: isSelected ? '#EC4899' + '15' : theme.background,
                          borderColor: isSelected ? '#EC4899' : theme.border,
                        },
                      ]}
                      onPress={() => toggleLoad(load)}
                      accessible={true}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`Load: ${load.cropId?.name || 'Cargo'}, ${load.quantity}`}
                      accessibilityHint={`Route from ${load.pickupLocation.address.split(',')[0]} to ${load.deliveryLocation.address.split(',')[0]}`}
                      accessibilityState={{ checked: isSelected }}
                    >
                      <View style={styles.loadLeft}>
                        <View
                          style={[
                            styles.checkbox,
                            {
                              backgroundColor: isSelected ? '#EC4899' : 'transparent',
                              borderColor: isSelected ? '#EC4899' : theme.border,
                            },
                          ]}
                        >
                          {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <View style={styles.loadInfo}>
                          <Text style={[styles.loadName, { color: theme.text }]}>
                            {load.cropId?.name || 'Cargo'}
                          </Text>
                          <Text style={[styles.loadRoute, { color: theme.textSecondary }]}>
                            {load.pickupLocation.address.split(',')[0]} →{' '}
                            {load.deliveryLocation.address.split(',')[0]}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.loadQuantity, { color: theme.textSecondary }]}>
                        {load.quantity}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </>
          )}
        </View>

        {/* Action Buttons */}
        {selectedLoads.length > 0 && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.error }]}
              onPress={clearRoute}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear selection"
              accessibilityHint="Remove all selected loads and reset route"
            >
              <Ionicons name="close-circle" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#EC4899', flex: 2 }]}
              onPress={optimizeRoute}
              disabled={isOptimizing}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Optimize route"
              accessibilityHint={`Calculate optimal route for ${selectedLoads.length} selected loads`}
              accessibilityState={{ disabled: isOptimizing, busy: isOptimizing }}
            >
              <Ionicons name="git-network" size={20} color="#FFF" />
              <Text style={styles.buttonText}>
                {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Optimized Route Results */}
        {optimizedRoute && (
          <>
            {/* Summary Card */}
            <View style={[styles.card, { backgroundColor: '#10797D' + '15' }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10797D" />
                <Text style={[styles.cardTitle, { color: '#10797D' }]}>
                  Route Optimized!
                </Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Distance
                  </Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {optimizedRoute.totalDistance.toFixed(1)} km
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Duration
                  </Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {Math.floor(optimizedRoute.totalDuration / 60)}h{' '}
                    {optimizedRoute.totalDuration % 60}m
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Earnings
                  </Text>
                  <Text style={[styles.statValue, { color: '#10797D' }]}>
                    {optimizedRoute.totalEarnings.toLocaleString()} RWF
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Fuel Cost
                  </Text>
                  <Text style={[styles.statValue, { color: '#EF4444' }]}>
                    {optimizedRoute.totalFuelCost.toLocaleString()} RWF
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Net Profit
                  </Text>
                  <Text style={[styles.statValue, { color: '#10797D', fontSize: 20 }]}>
                    {optimizedRoute.netProfit.toLocaleString()} RWF
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Stops
                  </Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {optimizedRoute.waypoints.length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Route Sequence */}
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="navigate" size={20} color="#EC4899" />
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Optimized Sequence
                </Text>
              </View>

              <View style={styles.routeSequence}>
                {/* Start */}
                <View style={styles.sequenceItem}>
                  <View style={[styles.sequenceDot, { backgroundColor: '#10797D' }]} />
                  <View style={styles.sequenceContent}>
                    <Text style={[styles.sequenceLabel, { color: '#10797D' }]}>START</Text>
                    <Text style={[styles.sequenceAddress, { color: theme.text }]}>
                      {currentLocation.address}
                    </Text>
                  </View>
                </View>

                {/* Waypoints */}
                {optimizedRoute.waypoints.map((waypoint: any, index: number) => (
                  <View key={index}>
                    <View style={[styles.sequenceLine, { backgroundColor: theme.border }]} />
                    <View style={styles.sequenceItem}>
                      <View
                        style={[
                          styles.sequenceDot,
                          {
                            backgroundColor:
                              waypoint.type === 'pickup' ? '#3B82F6' : '#F59E0B',
                          },
                        ]}
                      />
                      <View style={styles.sequenceContent}>
                        <Text
                          style={[
                            styles.sequenceLabel,
                            {
                              color: waypoint.type === 'pickup' ? '#3B82F6' : '#F59E0B',
                            },
                          ]}
                        >
                          {waypoint.type === 'pickup' ? 'PICKUP' : 'DELIVERY'} #{index + 1}
                        </Text>
                        <Text style={[styles.sequenceAddress, { color: theme.text }]}>
                          {waypoint.address}
                        </Text>
                        {optimizedRoute.segments[index] && (
                          <Text style={[styles.sequenceDistance, { color: theme.textSecondary }]}>
                            +{optimizedRoute.segments[index].distance.toFixed(1)} km •{' '}
                            ~{optimizedRoute.segments[index].duration} min
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Rest Stops */}
            {optimizedRoute.restStops.length > 0 && (
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="cafe" size={20} color="#F59E0B" />
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Suggested Rest Stops
                  </Text>
                </View>
                <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                  Take breaks every 4 hours for safety
                </Text>
                {optimizedRoute.restStops.map((stop: any, index: number) => (
                  <View key={index} style={styles.restStopItem}>
                    <Ionicons name="pause-circle" size={16} color="#F59E0B" />
                    <Text style={[styles.restStopText, { color: theme.text }]}>
                      {stop.address || `Stop ${index + 1}`}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Start Navigation Button */}
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: '#10797D' }]}
              onPress={() => setShowNavigationDialog(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Start navigation"
              accessibilityHint={`Begin turn-by-turn navigation for ${optimizedRoute.waypoints.length} stops`}
            >
              <Ionicons name="navigate-circle" size={24} color="#FFF" />
              <Text style={styles.startButtonText}>Start Navigation</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Navigation Confirmation Dialog */}
      <ConfirmDialog
        visible={showNavigationDialog}
        title="Start Navigation"
        message="This would open turn-by-turn navigation. For now, use the trip tracking screen."
        cancelText="Cancel"
        confirmText="View on Map"
        onCancel={() => setShowNavigationDialog(false)}
        onConfirm={handleStartNavigation}
        isDestructive={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  locationText: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  coordsText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  helperText: {
    fontSize: 13,
    marginBottom: 12,
  },
  emptyLoads: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  loadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadInfo: {
    flex: 1,
  },
  loadName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  loadRoute: {
    fontSize: 12,
  },
  loadQuantity: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  routeSequence: {
    marginTop: 8,
  },
  sequenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sequenceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  sequenceLine: {
    width: 2,
    height: 20,
    marginLeft: 5,
    marginVertical: 4,
  },
  sequenceContent: {
    flex: 1,
    paddingBottom: 8,
  },
  sequenceLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  sequenceAddress: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  sequenceDistance: {
    fontSize: 11,
  },
  restStopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  restStopText: {
    fontSize: 13,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    gap: 12,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
