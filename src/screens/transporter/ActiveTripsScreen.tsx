// src/screens/transporter/ActiveTripsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { fetchOrders, updateOrder } from '../../store/slices/ordersSlice';
import { useAppDispatch, useAppSelector } from '../../store';

export default function ActiveTripsScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { orders, isLoading } = useAppSelector((state) => state.orders);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchOrders());
    }, [dispatch])
  );

  const myTrips = orders.filter(order => 
    order.transporterId === user?.id || order.transporterId?._id === user?.id
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchOrders());
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewMap = (trip: any) => {
    navigation.navigate('TripTracking', { trip });
  };

  const handleUpdateStatus = async (trip: any) => {
    const nextStatus = trip.status === 'in_progress' ? 'completed' : 'in_progress';
    
    Alert.alert(
      'Update Delivery Status',
      `Mark this delivery as ${nextStatus === 'completed' ? 'completed' : 'in progress'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const result = await dispatch(
                updateOrder({
                  id: trip._id || trip.id,
                  data: { status: nextStatus },
                })
              ).unwrap();
              
              Alert.alert(
                'Success',
                nextStatus === 'completed' ? 'Delivery marked as completed! ✓' : 'Status updated!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      dispatch(fetchOrders());
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('Update error:', error);
              Alert.alert(
                'Error',
                error?.message || error || 'Failed to update delivery status'
              );
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return theme.info;
      case 'completed': return theme.success;
      default: return theme.textSecondary;
    }
  };

  if (isLoading && myTrips.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.tertiary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.tertiary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: theme.card }]}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleRefresh}
            disabled={isRefreshing}
            style={styles.refreshButton}
          >
            <Text style={[styles.refreshIcon, { opacity: isRefreshing ? 0.5 : 1 }]}>
              {isRefreshing ? '⟳' : '🔄'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: theme.card }]}>Active Trips</Text>
      </View>

      {myTrips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚛</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No active trips</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Accept loads to start transporting
          </Text>
        </View>
      ) : (
        <FlatList
          data={myTrips}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.list}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.tripHeader}>
                <Text style={[styles.cropName, { color: theme.text }]}>
                  {item.cropId?.name || 'Order'}
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
                <Text style={[styles.label, { color: theme.textSecondary }]}>Payment:</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {item.totalPrice.toLocaleString()} RWF
                </Text>
              </View>

              <View style={styles.locationSection}>
                <View style={styles.locationItem}>
                  <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                    📍 From:
                  </Text>
                  <Text style={[styles.locationText, { color: theme.text }]}>
                    {item.pickupLocation.address}
                  </Text>
                </View>
                <View style={styles.locationItem}>
                  <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                    🏁 To:
                  </Text>
                  <Text style={[styles.locationText, { color: theme.text }]}>
                    {item.deliveryLocation.address}
                  </Text>
                </View>
              </View>

              {item.status !== 'completed' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.mapButton, { backgroundColor: theme.info }]}
                    onPress={() => handleViewMap(item)}
                  >
                    <Text style={styles.actionButtonText}>🗺️ View Map</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.tertiary }]}
                    onPress={() => handleUpdateStatus(item)}
                  >
                    <Text style={styles.actionButtonText}>
                      {item.status === 'in_progress' ? '✓ Complete' : 'Start Trip'}
                    </Text>
                  </TouchableOpacity>
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
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    fontSize: 16,
  },
  refreshButton: {
    padding: 8,
  },
  refreshIcon: {
    fontSize: 20,
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
  },
  list: {
    padding: 15,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});