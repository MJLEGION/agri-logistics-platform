// src/screens/buyer/BuyerHomeScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { fetchCrops } from '../../store/slices/cropsSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import Card from '../../components/Card';

const { width } = Dimensions.get('window');

export default function BuyerHomeScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { crops, isLoading: cropsLoading } = useAppSelector((state) => state.crops);
  const { orders, isLoading: ordersLoading } = useAppSelector((state) => state.orders);
  const dispatch = useAppDispatch();
  const { theme } = useTheme();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchCrops());
    dispatch(fetchOrders());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate stats
  const userId = user?._id || user?.id;
  const availableCrops = crops.filter((crop) => crop.status === 'listed');
  const myOrders = orders.filter((order) => {
    const buyerId = typeof order.buyerId === 'string' ? order.buyerId : order.buyerId;
    return buyerId === userId;
  });

  const activeOrders = myOrders.filter(
    (order) => order.status === 'pending' || order.status === 'accepted' || order.status === 'in_progress'
  );

  const quickActions = [
    {
      icon: 'search',
      title: 'Browse Crops',
      description: 'Find fresh produce',
      color: theme.accent,
      gradient: [theme.accent, theme.accentLight],
      onPress: () => navigation.navigate('BrowseCrops'),
    },
    {
      icon: 'receipt',
      title: 'My Orders',
      description: 'Track purchases',
      color: theme.primary,
      gradient: [theme.primary, theme.primaryLight],
      onPress: () => navigation.navigate('MyOrders'),
    },
  ];

  // Featured crops (latest available)
  const featuredCrops = availableCrops.slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.accent, theme.accentLight]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.greeting}>Hello, {user?.name}! 👋</Text>
                <Text style={styles.role}>Buyer Dashboard</Text>
              </View>
            </View>
            <ThemeToggle />
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="leaf" size={24} color="#FFFFFF" />
              <Text style={styles.statNumber}>{availableCrops.length}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cart" size={24} color="#FFFFFF" />
              <Text style={styles.statNumber}>{activeOrders.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.statNumber}>
                {myOrders.filter((o) => o.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>

          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                activeOpacity={0.8}
                style={styles.actionCardWrapper}
              >
                <Card elevated style={styles.actionCard}>
                  <LinearGradient
                    colors={action.gradient}
                    style={styles.actionIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={action.icon as any} size={28} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.actionTitle, { color: theme.text }]}>
                    {action.title}
                  </Text>
                  <Text style={[styles.actionDescription, { color: theme.textSecondary }]}>
                    {action.description}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Crops */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Featured Crops
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('BrowseCrops')}>
              <Text style={[styles.seeAll, { color: theme.accent }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {featuredCrops.length > 0 ? (
            featuredCrops.map((crop, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate('PlaceOrder', { cropId: crop._id || crop.id })}
              >
                <Card style={styles.cropCard}>
                  <View style={styles.cropHeader}>
                    <View
                      style={[
                        styles.cropIcon,
                        { backgroundColor: `${theme.primary}20` },
                      ]}
                    >
                      <Ionicons name="leaf" size={24} color={theme.primary} />
                    </View>
                    <View style={styles.cropContent}>
                      <Text style={[styles.cropName, { color: theme.text }]}>
                        {crop.name}
                      </Text>
                      <Text style={[styles.cropDetails, { color: theme.textSecondary }]}>
                        {crop.quantity} {crop.unit}
                        {crop.pricePerUnit && ` • ${crop.pricePerUnit} RWF/${crop.unit}`}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="leaf-outline" size={48} color={theme.textLight} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No crops available at the moment
              </Text>
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: `${theme.accent}15` }]}
                onPress={onRefresh}
              >
                <Text style={[styles.refreshButtonText, { color: theme.accent }]}>
                  Refresh
                </Text>
              </TouchableOpacity>
            </Card>
          )}
        </View>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Active Orders
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyOrders')}>
                <Text style={[styles.seeAll, { color: theme.accent }]}>See All</Text>
              </TouchableOpacity>
            </View>

            {activeOrders.slice(0, 2).map((order, index) => (
              <Card key={index} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View
                    style={[
                      styles.orderIcon,
                      {
                        backgroundColor:
                          order.status === 'pending'
                            ? `${theme.warning}20`
                            : `${theme.info}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={order.status === 'pending' ? 'time' : 'car'}
                      size={20}
                      color={order.status === 'pending' ? theme.warning : theme.info}
                    />
                  </View>
                  <View style={styles.orderContent}>
                    <Text style={[styles.orderTitle, { color: theme.text }]}>
                      Order #{order._id?.slice(-6) || order.id?.slice(-6)}
                    </Text>
                    <Text style={[styles.orderDescription, { color: theme.textSecondary }]}>
                      {order.status === 'pending' ? 'Awaiting pickup' : 'In transit'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: `${theme.error}15` }]}
            onPress={() => dispatch(logout())}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
            <Text style={[styles.logoutText, { color: theme.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  role: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  actionCardWrapper: {
    width: (width - 52) / 2,
  },
  actionCard: {
    alignItems: 'center',
    padding: 20,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  cropCard: {
    marginBottom: 12,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cropIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropContent: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cropDetails: {
    fontSize: 13,
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderContent: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderDescription: {
    fontSize: 13,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});