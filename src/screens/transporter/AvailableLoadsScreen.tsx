// src/screens/transporter/AvailableLoadsScreen.tsx
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchAllOrders, acceptOrder } from '../../store/slices/ordersSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { calculateDistance as calcDistance, calculateEarnings as calcEarnings } from '../../services/routeOptimizationService';

const { width } = Dimensions.get('window');

export default function AvailableLoadsScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { orders, isLoading } = useAppSelector((state) => state.orders);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders when screen mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('=== TRANSPORTER LOADING ORDERS ===');
        const result = await dispatch(fetchAllOrders()).unwrap();
        console.log('TOTAL ORDERS FETCHED:', result.length);
      } catch (error) {
        console.log('ERROR LOADING ORDERS:', error);
      }
    };
    loadData();
  }, [dispatch]);

  // Handle manual refresh (pull to refresh)
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchAllOrders()).unwrap();
    } catch (error) {
      console.log('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshData = async () => {
        try {
          console.log('=== SCREEN FOCUSED - AUTO REFRESHING ORDERS ===');
          await dispatch(fetchAllOrders()).unwrap();
        } catch (error) {
          console.log('ERROR AUTO-REFRESHING:', error);
        }
      };
      refreshData();
    }, [dispatch])
  );

  const availableLoads = orders.filter(
    order => (order.status === 'accepted' || order.status === 'pending') && !order.transporterId
  );

  const calculateDistance = (order: any) => {
    return calcDistance(
      order.pickupLocation.latitude,
      order.pickupLocation.longitude,
      order.deliveryLocation.latitude,
      order.deliveryLocation.longitude
    );
  };

  const calculateEarnings = (order: any) => {
    const distance = calculateDistance(order);
    return calcEarnings(distance);
  };

  const handleAcceptLoad = async (orderId: string, cropName: string) => {
    Alert.alert(
      `Accept this load?`,
      `Transport ${cropName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await dispatch(acceptOrder(orderId)).unwrap();
              Alert.alert('Success! 🎉', 'Load accepted. Head to pickup location!', [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error || 'Failed to accept load');
            }
          },
          style: 'default',
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.tertiary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.card} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.card }]}>Available Loads</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.tertiary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.tertiary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.card} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.card }]}>Available Loads</Text>
        <View style={styles.loadsCountBadge}>
          <Text style={styles.loadsCountText}>{availableLoads.length}</Text>
        </View>
      </View>

      {availableLoads.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No loads available</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Check back later for transport opportunities
          </Text>
          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: theme.tertiary }]}
            onPress={() => dispatch(fetchAllOrders())}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={availableLoads}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.loadsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.tertiary}
            />
          }
          renderItem={({ item }) => {
            const distance = calculateDistance(item);
            const earnings = calculateEarnings(item);
            
            return (
              <View style={[styles.loadCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {/* Top Section: Crop & Earnings */}
                <View style={styles.loadCardTop}>
                  <View style={styles.cropSection}>
                    <Text style={[styles.cropName, { color: theme.text }]} numberOfLines={1}>
                      {item.cropId?.name || 'Order'}
                    </Text>
                    <View style={styles.quantityDistance}>
                      <View style={styles.badge}>
                        <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                          {item.quantity}
                        </Text>
                      </View>
                      <View style={styles.badge}>
                        <Ionicons name="navigate" size={12} color={theme.textSecondary} />
                        <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                          {distance.toFixed(1)}km
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Earnings Box - Prominently displayed */}
                  <View style={[styles.earningsBox, { backgroundColor: theme.success + '15' }]}>
                    <Text style={[styles.earningsLabel, { color: theme.textSecondary }]}>
                      Earn
                    </Text>
                    <Text style={[styles.earningsAmount, { color: theme.success }]}>
                      ₦{earnings.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Route Section */}
                <View style={styles.routeSection}>
                  <View style={styles.routeItem}>
                    <View style={[styles.routeDot, { backgroundColor: theme.success }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.routeLabel, { color: theme.textSecondary }]}>
                        Pickup
                      </Text>
                      <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={1}>
                        {item.pickupLocation?.address || 'Not specified'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.routeLine, { backgroundColor: theme.border }]} />

                  <View style={styles.routeItem}>
                    <View style={[styles.routeDot, { backgroundColor: theme.error }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.routeLabel, { color: theme.textSecondary }]}>
                        Delivery
                      </Text>
                      <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={1}>
                        {item.deliveryLocation?.address || 'Not specified'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Accept Button */}
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: theme.tertiary }]}
                  onPress={() => handleAcceptLoad(item._id || item.id, item.cropId?.name || 'Load')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.acceptBtnText}>Accept Load</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  loadsCountBadge: {
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadsCountText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshBtn: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  refreshBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Loads List
  loadsList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },

  // Load Card - inDrive Style
  loadCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 4,
  },

  // Card Top: Name & Earnings
  loadCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cropSection: {
    flex: 1,
    marginRight: 8,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  quantityDistance: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Earnings Box
  earningsBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Route Section - inDrive style with dots and line
  routeSection: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 20,
    marginLeft: 4,
    marginVertical: 2,
  },

  // Accept Button
  acceptBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  acceptBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});