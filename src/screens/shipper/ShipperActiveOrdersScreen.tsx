// src/screens/shipper/ShipperActiveOrdersScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { useAppSelector } from '../../store';
import SearchBar from '../../components/SearchBar';
import ListItem from '../../components/ListItem';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import RateTransporterModal from '../../components/RateTransporterModal';
import Toast, { useToast } from '../../components/Toast';

export default function ShipperActiveOrdersScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.orders);
  const { cargo } = useAppSelector((state) => state.cargo);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast, showSuccess, showError, hideToast } = useToast();

  // TEMPORARY: Show ALL orders for debugging
  console.log('🔍 ALL ORDERS:', orders);
  console.log('🔍 ALL CARGO:', cargo);

  // Simplified: Just show all orders (we'll fix filtering later)
  const shipperOrders = orders;

  console.log('📦 Showing all orders temporarily:', shipperOrders.length);

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return shipperOrders;

    const query = searchQuery.toLowerCase();
    return shipperOrders.filter(order => {
      const cargoName = getCargoName(order.cargoId).toLowerCase();
      const status = order.status.toLowerCase();
      const deliveryLocation = order.deliveryLocation?.address?.toLowerCase() || '';

      return cargoName.includes(query) ||
             status.includes(query) ||
             deliveryLocation.includes(query);
    });
  }, [shipperOrders, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.warning;
      case 'accepted': return theme.success;
      case 'in_progress': return theme.info;
      case 'completed': return theme.textSecondary;
      case 'cancelled': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const getStatusVariant = (status: string): 'primary' | 'success' | 'warning' | 'danger' | 'gray' => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'in_progress': return 'primary';
      case 'completed': return 'gray';
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
      // TODO: Send rating to backend API
      console.log('📝 Submitting rating:', {
        orderId: selectedOrder?._id || selectedOrder?.id,
        transporterId: selectedOrder?.transporterId,
        rating,
        comment,
      });

      // TODO: Call API to submit rating
      // await api.post('/ratings', {
      //   orderId: selectedOrder?._id || selectedOrder?.id,
      //   transporterId: selectedOrder?.transporterId,
      //   rating,
      //   comment,
      // });

      showSuccess('Rating submitted successfully! Thank you for your feedback.');
      setRatingModalVisible(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      showError('Failed to submit rating. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>Active Orders</Text>
      </View>

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
          renderItem={({ item }) => (
            <View>
              <ListItem
                icon="cube"
                title={getCargoName(item.cargoId)}
                subtitle={`${item.quantity} • ${item.deliveryLocation?.address || 'Location'} ${item.transporterId ? '• 🚚 Assigned' : ''}`}
                rightElement={
                  <Badge
                    label={item.status.toUpperCase()}
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