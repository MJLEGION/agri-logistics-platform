// src/screens/transporter/AvailableLoadsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addOrder } from '../../store/slices/ordersSlice';
import { updateCrop } from '../../store/slices/cropsSlice';

export default function AvailableLoadsScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { crops } = useSelector((state: RootState) => state.crops);
  const { orders } = useSelector((state: RootState) => state.orders);
  const dispatch = useDispatch();

  // Get crops that are matched (have orders) but no transporter assigned
  const assignedCropIds = orders
    .filter(order => order.transporterId)
    .map(order => order.cropId);

  const availableLoads = orders.filter(
    order => order.status === 'accepted' && !order.transporterId
  );

  const handleAcceptLoad = (order: any) => {
    Alert.alert(
      'Accept Transport Job',
      `Accept transport for ${getCropName(order.cropId)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            // Update order with transporter ID
            const updatedOrder = {
              ...order,
              transporterId: user?.id,
              status: 'in_progress' as const,
            };
            
            // Update the order in Redux (you'll need to add updateOrder action)
            // For now, just show success
            Alert.alert('Success', 'Transport job accepted!');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getCropName = (cropId: string) => {
    return crops.find(c => c.id === cropId)?.name || 'Unknown Crop';
  };

  const getCropDetails = (cropId: string) => {
    return crops.find(c => c.id === cropId);
  };

  const calculateDistance = (order: any) => {
    // Mock distance calculation - in real app, use Google Maps Distance Matrix API
    const lat1 = order.pickupLocation.latitude;
    const lon1 = order.pickupLocation.longitude;
    const lat2 = order.deliveryLocation.latitude;
    const lon2 = order.deliveryLocation.longitude;
    
    // Simple distance formula (not accurate, just for demo)
    const distance = Math.sqrt(
      Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)
    ) * 111; // Rough km conversion
    
    return distance.toFixed(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Available Loads</Text>
      </View>

      {availableLoads.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No loads available</Text>
          <Text style={styles.emptySubtext}>
            Check back later for transport opportunities
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableLoads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const crop = getCropDetails(item.cropId);
            return (
              <View style={styles.loadCard}>
                <View style={styles.loadHeader}>
                  <Text style={styles.cropName}>{getCropName(item.cropId)}</Text>
                  <Text style={styles.price}>{item.totalPrice.toLocaleString()} RWF</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Quantity:</Text>
                  <Text style={styles.value}>{item.quantity} {crop?.unit}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Distance:</Text>
                  <Text style={styles.value}>~{calculateDistance(item)} km</Text>
                </View>

                <View style={styles.locationSection}>
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>📍 Pickup:</Text>
                    <Text style={styles.locationText}>{item.pickupLocation.address}</Text>
                  </View>
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>🏁 Delivery:</Text>
                    <Text style={styles.locationText}>{item.deliveryLocation.address}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptLoad(item)}
                >
                  <Text style={styles.acceptButtonText}>Accept Load</Text>
                </TouchableOpacity>
              </View>
            );
          }}
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
    textAlign: 'center',
  },
  list: {
    padding: 15,
  },
  loadCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  loadHeader: {
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
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
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
  acceptButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});