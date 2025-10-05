// src/screens/farmer/ActiveOrdersScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function ActiveOrdersScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders } = useSelector((state: RootState) => state.orders);
  const { crops } = useSelector((state: RootState) => state.crops);

  // Get farmer's crop IDs
  const farmerCropIds = crops
    .filter(crop => crop.farmerId === user?.id)
    .map(crop => crop.id);

  // Filter orders for farmer's crops
  const farmerOrders = orders.filter(order => farmerCropIds.includes(order.cropId));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'accepted': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'completed': return '#607D8B';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getCropName = (cropId: string) => {
    return crops.find(c => c.id === cropId)?.name || 'Unknown Crop';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Active Orders</Text>
      </View>

      {farmerOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No active orders yet</Text>
          <Text style={styles.emptySubtext}>
            Orders will appear here when buyers purchase your crops
          </Text>
        </View>
      ) : (
        <FlatList
          data={farmerOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.cropName}>{getCropName(item.cropId)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.orderDetail}>
                <Text style={styles.detailLabel}>Quantity:</Text>
                <Text style={styles.detailValue}>{item.quantity}</Text>
              </View>

              <View style={styles.orderDetail}>
                <Text style={styles.detailLabel}>Total Price:</Text>
                <Text style={styles.detailValue}>{item.totalPrice.toLocaleString()} RWF</Text>
              </View>

              <View style={styles.orderDetail}>
                <Text style={styles.detailLabel}>Delivery to:</Text>
                <Text style={styles.detailValue}>{item.deliveryLocation.address}</Text>
              </View>

              {item.transporterId && (
                <View style={styles.transportInfo}>
                  <Text style={styles.transportText}>🚚 Transporter assigned</Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  list: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
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
    color: '#333',
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
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  transportInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  transportText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
});