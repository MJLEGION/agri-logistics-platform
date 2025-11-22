// src/screens/shipper/MyCargoScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated, Pressable, PanResponder, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { fetchCargo, deleteCargo } from '../../store/slices/cargoSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { distanceService } from '../../services/distanceService';
import { suggestVehicleType, getVehicleType, calculateShippingCost, getTrafficFactor, getTrafficDescription } from '../../services/vehicleService';
import SearchBar from '../../components/SearchBar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { showToast } from '../../services/toastService';
import { ListSkeleton } from '../../components/SkeletonLoader';
import Divider from '../../components/Divider';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';
import { logger } from '../../utils/logger';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const { width } = Dimensions.get('window');
const isMobileView = width < 768;
const getNumColumns = () => {
  if (width < 768) return 1; // All mobile devices - single column for better readability
  return 2; // Tablets and desktop - 2 columns
};
const NUM_COLUMNS = getNumColumns();

export default function MyCargoScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { cargo, isLoading } = useAppSelector((state) => state.cargo);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  const animations = useScreenAnimations(6);

  // State for confirmation dialog
  const [dialogVisible, setDialogVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch cargo on screen mount
  useEffect(() => {
    console.log('🔄 MyCargoScreen: Fetching cargo on mount...');
    dispatch(fetchCargo());
  }, [dispatch]);

  // Refetch cargo when screen comes into focus (after creating new cargo)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 MyCargoScreen: Refetching cargo (screen focused)...');
      dispatch(fetchCargo());
    }, [dispatch])
  );

  const myListings = Array.isArray(cargo) ? cargo.filter(item => {
    const shipperId = typeof item.shipperId === 'string' ? item.shipperId : item.shipperId?._id;
    return shipperId === user?._id || shipperId === user?.id;
  }) : [];

  console.log('📊 MyCargoScreen: Cargo state:', {
    totalCargoInState: Array.isArray(cargo) ? cargo.length : 0,
    myListingsCount: myListings.length,
    currentUserId: user?._id || user?.id,
    allCargoIds: Array.isArray(cargo) ? cargo.map(c => ({ id: c._id || c.id, shipperId: c.shipperId })) : []
  });

  // Filter by search query
  const filteredListings = searchQuery.trim()
    ? myListings.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : myListings;

  React.useEffect(() => {
    logger.debug('MyCargoScreen: Listings updated', {
      totalCargo: Array.isArray(cargo) ? cargo.length : 0,
      myListings: myListings.length,
      userId: user?._id || user?.id,
    });
  }, [myListings, cargo, user]);

  const handleDelete = (cargoId: string, cargoName: string) => {
    logger.info('Delete cargo requested', { cargoId, cargoName });

    setPendingDeleteId(cargoId);
    setPendingDeleteName(cargoName);
    setDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;

    logger.info('Deleting cargo', { cargoId: pendingDeleteId });
    const cargoItem = myListings.find(c => c._id === pendingDeleteId || c.id === pendingDeleteId);
    console.log('MyCargoScreen: Cargo to delete:', {
      id: pendingDeleteId,
      shipperId: cargoItem?.shipperId,
      userId: user?._id || user?.id,
    });
    setDialogVisible(false);

    try {
      const result = await dispatch(deleteCargo(pendingDeleteId)) as any;

      if (result.type.includes('fulfilled')) {
        logger.info('Cargo deleted successfully', { cargoId: pendingDeleteId });
        showToast.success('Cargo deleted successfully!');
        dispatch(fetchCargo());
      } else {
        const errorMessage = result.payload || 'Failed to delete cargo. Please try again.';
        logger.error('Failed to delete cargo', { cargoId: pendingDeleteId, error: errorMessage });
        showToast.error(errorMessage);
      }
    } catch (error: any) {
      logger.error('Error deleting cargo', error);
      showToast.error(error?.message || 'An error occurred while deleting cargo.');
    }
    
    setPendingDeleteId(null);
    setPendingDeleteName('');
  };

  const handleCancelDelete = () => {
    logger.debug('Delete cancelled');
    setDialogVisible(false);
    setPendingDeleteId(null);
    setPendingDeleteName('');
  };

  const sidebarNav = [
    { icon: 'cube-outline', label: 'My Cargo', screen: 'MyCargo' },
    { icon: 'list-outline', label: 'Active Orders', screen: 'ShipperActiveOrders' },
    { icon: 'add-circle-outline', label: 'List Cargo', screen: 'ListCargo' },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={[styles.title, { color: theme.card }]}>My Cargo</Text>
        </View>
        <View style={{ padding: 16 }}>
          <ListSkeleton count={4} />
        </View>
      </View>
    );
  }

  return (
    <DashboardLayout
      title={`My Cargo (${myListings.length})`}
      sidebarColor="#0F172A"
      accentColor="#10B981"
      backgroundImage={require('../../../assets/images/backimages/shipper.jpg')}
      sidebarNav={sidebarNav}
      userRole="shipper"
      navigation={navigation}
      contentPadding={false}
    >

      {myListings.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search cargo by name, location, or status..."
            variant="filled"
          />
        </View>
      )}

      {myListings.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title="No cargo listed yet"
          description="Start by listing your first cargo to begin shipping"
          actionText="+ List Your First Cargo"
          onActionPress={() => navigation.navigate('ListCargo')}
        />
      ) : filteredListings.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No matching cargo"
          description="Try adjusting your search query"
          actionText="Clear Search"
          onActionPress={() => setSearchQuery('')}
        />
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.list}
          numColumns={NUM_COLUMNS}
          key={NUM_COLUMNS}
          columnWrapperStyle={NUM_COLUMNS > 1 ? styles.row : undefined}
          renderItem={({ item, index }) => {
            // Calculate distance and pricing
            const pickupLat = item.location?.latitude || -1.9536;
            const pickupLon = item.location?.longitude || 30.0605;

            // Check if destination was set during creation
            const hasDestination = !!(
              item.destination?.latitude &&
              item.destination?.longitude &&
              item.destination?.address &&
              item.destination?.address.trim() !== ''
            );

            // Calculate distance - ONLY if destination exists or stored distance is available
            let distance: number = 0;
            if (item.distance && item.distance > 0) {
              // Use stored distance from cargo creation
              distance = item.distance;
            } else if (hasDestination) {
              // Calculate from destination coordinates
              const deliveryLat = item.destination!.latitude;
              const deliveryLon = item.destination!.longitude;
              distance = distanceService.calculateDistance(
                pickupLat,
                pickupLon,
                deliveryLat,
                deliveryLon
              );
            }
            // If no destination and no stored distance, distance remains 0

            // Suggest vehicle based on weight or use stored vehicle
            const cargoWeight = item.quantity || 0;
            const suggestedVehicleId = item.suggestedVehicle || suggestVehicleType(cargoWeight);
            const vehicleType = getVehicleType(suggestedVehicleId);

            // Get current traffic conditions
            const trafficFactor = getTrafficFactor();
            const trafficDesc = getTrafficDescription(trafficFactor);

            // Calculate transport fee:
            // 1. Use saved shippingCost if available (from creation time)
            // 2. Otherwise calculate ONLY if distance > 0 (destination was set)
            // 3. If no destination, transportFee = 0 (not calculated)
            const transportFee = item.shippingCost !== undefined && item.shippingCost > 0
              ? item.shippingCost
              : distance > 0
              ? calculateShippingCost(distance, suggestedVehicleId, trafficFactor)
              : 0;

            // Production logging disabled for performance
            // console.log('%c📦 MyCargoScreen - Cargo card data:', 'color: #2196F3; font-weight: bold', {
            //   cargoName: item.name,
            //   transportFee: transportFee,
            // });

            return (
              <View style={styles.cardWrapper}>
                <Card>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('CargoDetails', { cargoId: item._id || item.id })}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${item.name} cargo details`}
                    accessibilityHint="Double tap to view full cargo information"
                  >
                    {/* Header Section */}
                    <View style={styles.cargoCardHeader}>
                      <View style={styles.cargoInfo}>
                        <Text style={[styles.cargoName, { color: theme.text }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <View style={styles.badgeRow}>
                          <Badge
                            text={`${item.quantity} ${item.unit}`}
                            variant="gray"
                            size="sm"
                          />
                          <Badge
                            text={vehicleType?.name || '🚚 Truck'}
                            variant="gray"
                            size="sm"
                          />
                          <Badge
                            text={item.status}
                            variant={item.status === 'listed' ? 'primary' : item.status === 'matched' ? 'success' : 'gray'}
                            size="sm"
                          />
                        </View>
                      </View>

                      {/* Status Icon */}
                      <View style={[styles.statusIcon, {
                        backgroundColor: item.status === 'listed' ? theme.primary + '15' :
                                       item.status === 'matched' ? theme.success + '15' :
                                       theme.textSecondary + '15'
                      }]}>
                        <Ionicons
                          name={item.status === 'listed' ? 'cube' :
                                item.status === 'matched' ? 'checkmark-circle' :
                                'archive'}
                          size={28}
                          color={item.status === 'listed' ? theme.primary :
                                 item.status === 'matched' ? theme.success :
                                 theme.textSecondary}
                        />
                      </View>
                    </View>

                    {/* Pricing Section */}
                    <View style={[styles.pricingSection, { backgroundColor: theme.success + '08' }]}>
                      {!hasDestination && transportFee === 0 && (
                        <View style={[styles.warningBanner, { backgroundColor: theme.warning + '15', borderColor: theme.warning }]}>
                          <Text style={[styles.warningText, { color: theme.warning }]}>
                            No destination set - transport fee not calculated
                          </Text>
                        </View>
                      )}
                      <View style={styles.pricingRow}>
                        <View style={styles.pricingItem}>
                          <Text style={[styles.pricingLabel, { color: theme.textSecondary }]}>
                            Cargo Value
                          </Text>
                          <Text style={[styles.pricingValue, { color: theme.text }]}>
                            {((item.pricePerUnit || 0) * item.quantity).toLocaleString()} RWF
                          </Text>
                        </View>
                        <View style={styles.pricingDivider} />
                        <View style={styles.pricingItem}>
                          <Text style={[styles.pricingLabel, { color: theme.textSecondary }]}>
                            🚚 Transport Fee
                          </Text>
                          {transportFee > 0 ? (
                            <>
                              <Text style={[styles.pricingValue, { color: theme.success }]}>
                                {transportFee.toLocaleString()} RWF
                              </Text>
                              <Text style={[styles.pricingSubtext, { color: theme.textSecondary }]}>
                                {distance} km × {vehicleType?.baseRatePerKm} RWF/km
                              </Text>
                              {!(item.shippingCost !== undefined && item.shippingCost > 0) && trafficFactor > 1.0 && (
                                <Text style={[styles.trafficBadge, { color: trafficFactor > 1.3 ? '#EF4444' : trafficFactor > 1.1 ? '#F59E0B' : theme.success }]}>
                                  {trafficDesc} (×{trafficFactor})
                                </Text>
                              )}
                            </>
                          ) : (
                            <Text style={[styles.pricingValue, { color: theme.textSecondary }]}>
                              N/A
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Location & Date Section */}
                    <View style={styles.detailsSection}>
                      <View style={styles.detailRow}>
                        <Ionicons name="location" size={16} color={theme.primary} />
                        <Text style={[styles.detailText, { color: theme.textSecondary }]} numberOfLines={1}>
                          {item.location.address}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={16} color={theme.primary} />
                        <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                          Ready: {new Date(item.readyDate).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <Divider spacing="sm" />

                  {/* Action Buttons */}
                  <View style={styles.actionsRow}>
                    <Button
                      title="View Details"
                      onPress={() => navigation.navigate('CargoDetails', { cargoId: item._id || item.id })}
                      variant="outline"
                      size="sm"
                      icon={<Ionicons name="eye-outline" size={16} color={theme.primary} />}
                      style={{ flex: 1, marginRight: 8 }}
                      accessibilityLabel={`View details for ${item.name}`}
                      accessibilityHint="Navigate to cargo details screen"
                    />
                    <Button
                      title="Delete"
                      onPress={() => handleDelete(item._id || item.id, item.name)}
                      variant="danger"
                      size="sm"
                      icon={<Ionicons name="trash-outline" size={16} color="#fff" />}
                      style={{ flex: 1 }}
                      accessibilityLabel={`Delete ${item.name}`}
                      accessibilityHint="This action cannot be undone"
                    />
                  </View>
                </Card>
              </View>
            );
          }}
        />
      )}
      
      <ConfirmDialog
        visible={dialogVisible}
        title="Delete Cargo"
        message={`Are you sure you want to delete "${pendingDeleteName}"?`}
        cancelText="Cancel"
        confirmText="Delete"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDestructive={true}
      />
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 30,
  },
  addButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: isMobileView ? 12 : 16,
    paddingVertical: isMobileView ? 12 : 15,
    paddingBottom: isMobileView ? 24 : 15,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  cardWrapper: {
    width: NUM_COLUMNS === 1 ? '100%' : '48%',
    marginBottom: isMobileView ? 16 : (NUM_COLUMNS === 1 ? 12 : 0),
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cropName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cropDetail: {
    fontSize: 14,
    marginBottom: 5,
  },
  cropLocation: {
    fontSize: 12,
    marginTop: 5,
  },
  deleteButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // New Card Layout Styles
  cargoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cargoInfo: {
    flex: 1,
    marginRight: 12,
  },
  cargoName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pricingSection: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningBanner: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricingItem: {
    flex: 1,
  },
  pricingDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 12,
  },
  pricingLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  pricingValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  pricingSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  trafficBadge: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  detailsSection: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
});