// src/screens/shipper/ShipperActiveOrdersScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { useAppSelector, useAppDispatch } from '../../store';
import { useScreenAnimations } from '../../hooks/useScreenAnimations';
import SearchBar from '../../components/SearchBar';
import ListItem from '../../components/ListItem';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import RateTransporterModal from '../../components/RateTransporterModal';
import Toast, { useToast } from '../../components/Toast';
import * as backendRatingService from '../../services/backendRatingService';
import { logger } from '../../utils/logger';
import { fetchCargo } from '../../store/slices/cargoSlice';
import DashboardLayout from '../../components/layouts/DashboardLayout';

export default function ShipperActiveOrdersScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.orders);
  const { cargo } = useAppSelector((state) => state.cargo);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast, showSuccess, showError, hideToast } = useToast();
  const animations = useScreenAnimations(6);

  // Fetch cargo when screen loads
  useEffect(() => {
    dispatch(fetchCargo() as any);
  }, [dispatch]);

  // Filter orders and cargo to show only those belonging to current shipper
  const shipperOrders = useMemo(() => {
    if (!user?._id && !user?.id) return [];

    const userId = user._id || user.id;

    // Get orders where the shipper/farmer is the current user
    const userOrders = orders
      .filter(order => {
        const orderShipperId = order.shipperId || order.farmerId;
        return orderShipperId === userId;
      })
      .map(order => ({
        ...order,
        type: 'order',
        cargoName: getCargoName(order.cargoId),
      }));

    // Get cargo that belongs to current user and has been accepted (matched, picked_up, in_transit, delivered)
    const userCargo = Array.isArray(cargo)
      ? cargo
          .filter((cargoItem: any) => {
            const cargoOwnerId = cargoItem.shipperId?._id || cargoItem.shipperId?.id || cargoItem.shipperId;
            const hasTransporter = cargoItem.transporterId;
            const activeStatuses = ['matched', 'picked_up', 'in_transit', 'delivered'];
            return (
              cargoOwnerId === userId &&
              hasTransporter &&
              activeStatuses.includes(cargoItem.status)
            );
          })
          .map((cargoItem: any) => ({
            _id: cargoItem._id || cargoItem.id,
            id: cargoItem._id || cargoItem.id,
            type: 'cargo',
            cargoId: cargoItem._id || cargoItem.id,
            cargoName: cargoItem.name,
            status: cargoItem.status,
            quantity: `${cargoItem.quantity} ${cargoItem.unit}`,
            deliveryLocation: cargoItem.destination || { address: cargoItem.location?.address },
            transporterId: cargoItem.transporterId,
            createdAt: cargoItem.createdAt,
            updatedAt: cargoItem.updatedAt,
          }))
      : [];

    // Combine and sort by date
    return [...userOrders, ...userCargo].sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
  }, [orders, cargo, user]);

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return shipperOrders;

    const query = searchQuery.toLowerCase();
    return shipperOrders.filter(item => {
      const cargoName = (item.cargoName || '').toLowerCase();
      const status = (item.status || '').toLowerCase();
      const deliveryLocation = item.deliveryLocation?.address?.toLowerCase() || '';

      return cargoName.includes(query) ||
             status.includes(query) ||
             deliveryLocation.includes(query);
    });
  }, [shipperOrders, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.warning;
      case 'accepted': return theme.success;
      case 'matched': return theme.success; // Cargo accepted
      case 'in_progress': return theme.info;
      case 'picked_up': return theme.info; // Cargo picked up
      case 'in_transit': return theme.info; // Cargo in transit
      case 'completed': return theme.textSecondary;
      case 'delivered': return theme.textSecondary; // Cargo delivered
      case 'cancelled': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const getStatusVariant = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'gray' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'matched': return 'success'; // Cargo accepted
      case 'in_progress': return 'primary';
      case 'picked_up': return 'primary'; // Cargo picked up
      case 'in_transit': return 'primary'; // Cargo in transit
      case 'completed': return 'gray';
      case 'delivered': return 'gray'; // Cargo delivered
      case 'cancelled': return 'danger';
      default: return 'gray';
    }
  };

  const getCargoName = (cargoId: any) => {
    // Handle if cargoId is already an object with name
    if (typeof cargoId === 'object' && cargoId?.name) {
      return cargoId.name;
    }

    // Handle if cargoId is a string ID
    const id = typeof cargoId === 'string' ? cargoId : cargoId?._id || cargoId?.id;
    const foundCargo = cargo.find(c => (c._id === id || c.id === id));

    if (foundCargo) {
      return foundCargo.name;
    }

    // If still not found, show the ID instead of "Unknown Cargo"
    return `Cargo ${id || 'N/A'}`;
  };

  const handleOpenRatingModal = (order: any) => {
    setSelectedOrder(order);
    setRatingModalVisible(true);
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    try {
      if (!selectedOrder?.transporterId) {
        showError('No transporter assigned to this order');
        return;
      }

      // Submit rating to backend API
      await backendRatingService.createRating({
        ratedUserId: selectedOrder.transporterId,
        tripId: selectedOrder._id || selectedOrder.id,
        rating,
        comment,
      });

      logger.info('Rating submitted successfully', {
        orderId: selectedOrder._id || selectedOrder.id,
        rating,
      });

      showSuccess('Rating submitted successfully! Thank you for your feedback.');
      setRatingModalVisible(false);
    } catch (error: any) {
      logger.error('Failed to submit rating', error);
      const errorMessage = error?.message || 'Failed to submit rating. Please try again.';
      showError(errorMessage);
    }
  };

  const sidebarNav = [
    { icon: 'cube-outline', label: 'My Cargo', screen: 'MyCargo' },
    { icon: 'list-outline', label: 'Active Orders', screen: 'ShipperActiveOrders' },
    { icon: 'add-circle-outline', label: 'List Cargo', screen: 'ListCargo' },
  ];

  return (
    <DashboardLayout
      title="Active Orders"
      sidebarColor="#0F172A"
      accentColor="#10B981"
      backgroundImage={require('../../../assets/images/backimages/shipper.jpg')}
      sidebarNav={sidebarNav}
      userRole="shipper"
      navigation={navigation}
      contentPadding={false}
    >

      {/* Search Bar */}
      {shipperOrders.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by cargo name, status, or location..."
            variant="filled"
          />
        </View>
      )}

      {/* Orders List */}
      {shipperOrders.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title="No active orders yet"
          description="Orders will appear here when transporters accept your cargo"
          actionText="View My Cargo"
          onActionPress={() => navigation.navigate('MyCargo')}
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No matching orders"
          description="Try adjusting your search query"
          actionText="Clear Search"
          onActionPress={() => setSearchQuery('')}
        />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id || item.id || ''}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Animated.View style={animations.getFloatingCardStyle(index % 6)}>
              <View>
                <ListItem
                  icon="cube"
                  title={item.cargoName || 'Unknown Cargo'}
                  subtitle={`${item.quantity || 'N/A'} • ${item.deliveryLocation?.address || 'Location'} ${item.transporterId ? '• 🚚 Assigned' : ''}`}
                  rightElement={
                    <Badge
                      label={item.status.toUpperCase().replace('_', ' ')}
                      variant={getStatusVariant(item.status)}
                      size="sm"
                    />
                  }
                  chevron
                  onPress={() => {
                    // Navigate to order details if available
                    // navigation.navigate('OrderDetails', { orderId: item._id || item.id })
                  }}
                />
                {/* Show "Rate Transporter" button for completed/delivered orders */}
                {(item.status === 'completed' || item.status === 'delivered') && item.transporterId && (
                  <TouchableOpacity
                    style={[styles.rateButton, { backgroundColor: theme.primary }]}
                    onPress={() => handleOpenRatingModal(item)}
                  >
                    <Ionicons name="star" size={16} color="#fff" />
                    <Text style={styles.rateButtonText}>Rate Transporter</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}
        />
      )}

      {/* Rating Modal */}
      {selectedOrder && (
        <RateTransporterModal
          visible={ratingModalVisible}
          onClose={() => setRatingModalVisible(false)}
          transporterName={selectedOrder.transporterId?.name || 'Transporter'}
          transporterId={selectedOrder.transporterId?._id || selectedOrder.transporterId}
          orderId={selectedOrder._id || selectedOrder.id}
          onSubmitRating={handleSubmitRating}
          isVerified={selectedOrder.transporterId?.verified || false}
        />
      )}

      {/* Toast Notifications */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
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
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    padding: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cropName: {
    fontSize: 18,
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
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  transportInfo: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  transportText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 12,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});