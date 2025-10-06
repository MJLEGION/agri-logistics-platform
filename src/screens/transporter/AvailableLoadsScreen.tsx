// src/screens/transporter/AvailableLoadsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateOrder } from '../../store/slices/ordersSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';

export default function AvailableLoadsScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { crops } = useSelector((state: RootState) => state.crops);
  const { orders } = useSelector((state: RootState) => state.orders);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const availableLoads = orders.filter(
    order => order.status === 'accepted' && !order.transporterId
  );

  const handleAcceptLoad = (order: any) => {
    const confirmed = confirm(`Accept transport for ${getCropName(order.cropId)}?`);
    
    if (confirmed) {
      const updatedOrder = {
        ...order,
        transporterId: user?.id,
        status: 'in_progress' as const,
      };
      
      dispatch(updateOrder(updatedOrder));
      alert('Transport job accepted!');
      navigation.goBack();
    }
  };

  const getCropName = (cropId: string) => {
    return crops.find(c => c.id === cropId)?.name || 'Unknown Crop';
  };

  const getCropDetails = (cropId: string) => {
    return crops.find(c => c.id === cropId);
  };

  const calculateDistance = (order: any) => {
    const lat1 = order.pickupLocation.latitude;
    const lon1 = order.pickupLocation.longitude;
    const lat2 = order.deliveryLocation.latitude;
    const lon2 = order.deliveryLocation.longitude;
    
    const distance = Math.sqrt(
      Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)
    ) * 111;
    
    return distance;
  };

  const calculateEarnings = (order: any) => {
    const distance = calculateDistance(order);
    return Math.round(distance * 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.tertiary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>Available Loads</Text>
      </View>

      {availableLoads.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No loads available</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
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
            const distance = calculateDistance(item);
            const earnings = calculateEarnings(item);
            
            return (
              <Card>
                <View style={styles.loadHeader}>
                  <Text style={[styles.cropName, { color: theme.text }]}>
                    {getCropName(item.cropId)}
                  </Text>
                  <View style={[styles.earningsBox, { backgroundColor: theme.success + '20' }]}>
                    <Text style={[styles.earningsLabel, { color: theme.textSecondary }]}>
                      You Earn
                    </Text>
                    <Text style={[styles.earnings, { color: theme.success }]}>
                      {earnings.toLocaleString()} RWF
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Quantity:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    {item.quantity} {crop?.unit}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Distance:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    ~{distance.toFixed(1)} km
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Rate:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>1,000 RWF/km</Text>
                </View>

                <View style={styles.locationSection}>
                  <View style={styles.locationItem}>
                    <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                      📍 Pickup:
                    </Text>
                    <Text style={[styles.locationText, { color: theme.text }]}>
                      {item.pickupLocation.address}
                    </Text>
                  </View>
                  <View style={styles.locationItem}>
                    <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                      🏁 Delivery:
                    </Text>
                    <Text style={[styles.locationText, { color: theme.text }]}>
                      {item.deliveryLocation.address}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.acceptButton, { backgroundColor: theme.tertiary }]}
                  onPress={() => handleAcceptLoad(item)}
                >
                  <Text style={styles.acceptButtonText}>Accept Load</Text>
                </TouchableOpacity>
              </Card>
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
  loadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cropName: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  earningsBox: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  earnings: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
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
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
  },
  acceptButton: {
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