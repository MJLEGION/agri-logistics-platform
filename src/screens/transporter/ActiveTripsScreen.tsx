// src/screens/transporter/ActiveTripsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateOrderStatus } from '../../store/slices/ordersSlice';

export default function ActiveTripsScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders } = useSelector((state: RootState) => state.orders);
  const { crops } = useSelector((state: RootState) => state.crops);
  const dispatch = useDispatch();

  const myTrips = orders.filter(order => order.transporterId === user?.id);

  const getCropName = (cropId: string) => {
    return crops.find(c => c.id === cropId)?.name || 'Unknown';
  };

  const handleUpdateStatus = (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'in_progress' ? 'completed' : 'in_progress';
    
    Alert.alert(
      'Update Status',
      `Mark this delivery as ${nextStatus === 'completed' ? 'completed' : 'in progress'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            dispatch(updateOrderStatus({ orderId, status: nextStatus }));
            if (nextStatus === 'completed') {
              Alert.alert('Success', 'Delivery marked as completed!');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Active Trips</Text>
      </View>

      {myTrips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚛</Text>
          <Text style={styles.emptyText}>No active trips</Text>
          <Text style={styles.emptySubtext}>
            Accept loads to start transporting
          </Text>
        </View>
      ) : (
        <FlatList
          data={myTrips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.cropName}>{getCropName(item.cropId)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Quantity:</Text>
                <Text style={styles.value}>{item.quantity}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Payment:</Text>
                <Text style={styles.value}>{item.totalPrice.toLocaleString()} RWF</Text>
              </View>

              <View style={styles.locationSection}>
                <View style={styles.locationItem}>
                  <Text style={styles.locationLabel}>📍 From:</Text>
                  <Text style={styles.locationText}>{item.pickupLocation.address}</Text>
                </View>
                <View style={styles.locationItem}>
                  <Text style={styles.locationLabel}>🏁 To:</Text>
                  <Text style={styles.locationText}>{item.deliveryLocation.address}</Text>
                </View>
              </View>

              {item.status !== 'completed' && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleUpdateStatus(item.id, item.status)}
                >
                  <Text style={styles.actionButtonText}>
                    {item.status === 'in_progress' ? 'Mark as Completed' : 'Start Trip'}
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: '#2196F3',
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
  },
  list: {
    padding: 15,
  },
  tripCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  locationSection: {
    marginTop: 10,
    marginBottom: 15,
  },
  locationItem: {
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});