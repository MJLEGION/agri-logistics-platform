// src/screens/transporter/AvailableLoadsScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { fetchAllOrders, acceptOrder } from '../../store/slices/ordersSlice';

export default function AvailableLoadsScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders, isLoading } = useSelector((state: RootState) => state.orders);
  const { theme } = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('=== TRANSPORTER LOADING ORDERS ===');
        const result = await dispatch(fetchAllOrders()).unwrap();
        console.log('TOTAL ORDERS FETCHED:', result.length);
        console.log('ALL ORDERS:', JSON.stringify(result, null, 2));
      } catch (error) {
        console.log('ERROR LOADING ORDERS:', error);
      }
    };
    loadData();
  }, [dispatch]);

  const availableLoads = orders.filter(
    order => order.status === 'accepted' && !order.transporterId
  );

  console.log('=== FILTERING ORDERS ===');
  console.log('Total orders in state:', orders.length);
  console.log('Available loads after filter:', availableLoads.length);
  console.log('Filter looking for: status="accepted" and no transporterId');
  if (orders.length > 0) {
    console.log('First order example:', JSON.stringify(orders[0], null, 2));
  }

  const handleAcceptLoad = async (orderId: string, cropName: string) => {
    const confirmed = confirm(`Accept transport for ${cropName}?`);
    
    if (confirmed) {
      try {
        await dispatch(acceptOrder(orderId)).unwrap();
        alert('Transport job accepted!');
        navigation.goBack();
      } catch (error: any) {
        alert(error || 'Failed to accept load');
      }
    }
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

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.tertiary} />
      </View>
    );
  }

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
          <Text style={[styles.debugText, { color: theme.textSecondary, marginTop: 20 }]}>
            Debug: {orders.length} total orders in system
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableLoads}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const distance = calculateDistance(item);
            const earnings = calculateEarnings(item);
            
            return (
              <Card>
                <View style={styles.loadHeader}>
                  <Text style={[styles.cropName, { color: theme.text }]}>
                    {item.cropId?.name || 'Order'}
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
                    {item.quantity}
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
                  onPress={() => handleAcceptLoad(item._id || item.id, item.cropId?.name || 'Order')}
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
  debugText: {
    fontSize: 12,
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