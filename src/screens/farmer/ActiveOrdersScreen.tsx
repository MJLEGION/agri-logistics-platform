// src/screens/farmer/ActiveOrdersScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { useAppSelector } from '../../store';

export default function ActiveOrdersScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.orders);
  const { crops } = useAppSelector((state) => state.crops);
  const { theme } = useTheme();

  // Get farmer's crop IDs (handle both _id and id fields)
  const farmerCropIds = crops
    .filter(crop => {
      const farmerId = typeof crop.farmerId === 'string' ? crop.farmerId : crop.farmerId?._id;
      return farmerId === user?._id || farmerId === user?.id;
    })
    .map(crop => crop._id || crop.id);

  const farmerOrders = orders.filter(order => farmerCropIds.includes(order.cropId));

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

  const getCropName = (cropId: string) => {
    return crops.find(c => c._id === cropId || c.id === cropId)?.name || 'Unknown Crop';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>Active Orders</Text>
      </View>

      {farmerOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No active orders yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Orders will appear here when buyers purchase your crops
          </Text>
        </View>
      ) : (
        <FlatList
          data={farmerOrders}
          keyExtractor={(item) => item._id || item.id || ''}
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

              <View style={styles.orderDetail}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Quantity:</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{item.quantity}</Text>
              </View>

              <View style={styles.orderDetail}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Total Price:</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {item.totalPrice.toLocaleString()} RWF
                </Text>
              </View>

              <View style={styles.orderDetail}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Delivery to:</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {item.deliveryLocation.address}
                </Text>
              </View>

              {item.transporterId && (
                <View style={[styles.transportInfo, { backgroundColor: theme.info + '20' }]}>
                  <Text style={[styles.transportText, { color: theme.info }]}>
                    🚚 Transporter assigned
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
});