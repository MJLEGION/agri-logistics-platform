// src/screens/buyer/MyOrdersScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';

export default function MyOrdersScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders } = useSelector((state: RootState) => state.orders);
  const { crops } = useSelector((state: RootState) => state.crops);
  const { theme } = useTheme();

  const myOrders = orders.filter(order => order.buyerId === user?.id);

  const getCropName = (cropId: string) => {
    return crops.find(c => c.id === cropId)?.name || 'Unknown Crop';
  };

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.secondary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>My Orders</Text>
      </View>

      {myOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No orders yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Browse crops to place your first order
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: theme.secondary }]}
            onPress={() => navigation.navigate('BrowseCrops')}
          >
            <Text style={styles.browseButtonText}>Browse Crops</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.orderHeader}>
                <Text style={[styles.cropName, { color: theme.text }]}>
                  {getCropName(item.cropId)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Quantity:</Text>
                <Text style={[styles.value, { color: theme.text }]}>{item.quantity}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Total Price:</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {item.totalPrice.toLocaleString()} RWF
                </Text>
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

              {item.transporterId && (
                <View style={[styles.statusInfo, { backgroundColor: theme.success + '20' }]}>
                  <Text style={[styles.statusInfoText, { color: theme.success }]}>
                    {item.status === 'completed' ? '✓ Delivered' : '🚚 In Transit'}
                  </Text>
                </View>
              )}
            </Card>
          )}
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
    marginBottom: 30,
  },
  browseButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  statusInfo: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusInfoText: {
    fontSize: 14,
    fontWeight: '500',
  },
});