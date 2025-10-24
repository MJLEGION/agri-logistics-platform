// src/screens/buyer/BuyerHomeScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

export default function BuyerHomeScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { crops } = useAppSelector((state) => state.crops);
  const { orders } = useAppSelector((state) => state.orders);
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
    const buyerId = typeof order.buyerId === 'string' ? order.buyerId : order.buyerId?._id;
    return buyerId === userId;
  });

  const activeOrders = myOrders.filter(
    (order) => order.status === 'pending' || order.status === 'accepted' || order.status === 'in_progress'
  );

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
        {/* Gradient Header */}
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarCircle}>
                <Ionicons name="cart" size={32} color="#FFF" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Welcome back!</Text>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.role}>🛒 Buyer</Text>
              </View>
            </View>
            <ThemeToggle />
          </View>
        </LinearGradient>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#27AE60' + '20' }]}>
              <Ionicons name="leaf" size={24} color="#27AE60" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {availableCrops.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Available Crops
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#F59E0B' + '20' }]}>
              <Ionicons name="cart" size={24} color="#F59E0B" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {activeOrders.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Active Orders
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#10B981' + '20' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {myOrders.filter((o) => o.status === 'completed').length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Completed
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>

          <View style={styles.actionsGrid}>
            {/* Browse Crops */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('BrowseCrops')}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.actionGradient}
              >
                <Ionicons name="search" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                Browse Crops
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                {availableCrops.length} available
              </Text>
            </TouchableOpacity>

            {/* My Orders */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('MyOrders')}
            >
              <LinearGradient
                colors={['#27AE60', '#2ECC71']}
                style={styles.actionGradient}
              >
                <Ionicons name="receipt" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                My Orders
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                {myOrders.length} total orders
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Crops */}
        {featuredCrops.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Featured Crops
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('BrowseCrops')}>
                <Text style={[styles.seeAll, { color: '#3B82F6' }]}>See All</Text>
              </TouchableOpacity>
            </View>

            {featuredCrops.map((crop) => (
              <TouchableOpacity
                key={crop._id || crop.id}
                style={[styles.activityCardNew, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate('PlaceOrder', { cropId: crop._id || crop.id })}
              >
                <View style={styles.activityLeft}>
                  <View style={[styles.activityIconNew, { backgroundColor: '#27AE60' + '20' }]}>
                    <Ionicons name="leaf" size={20} color="#27AE60" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityTitleNew, { color: theme.text }]}>
                      {crop.name}
                    </Text>
                    <Text style={[styles.activityDescNew, { color: theme.textSecondary }]}>
                      {crop.quantity} {crop.unit} • {crop.pricePerUnit || 0} RWF/{crop.unit}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Active Orders
            </Text>
            {activeOrders.slice(0, 3).map((order) => (
              <TouchableOpacity
                key={order._id || order.id}
                style={[styles.activityCardNew, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate('MyOrders')}
              >
                <View style={styles.activityLeft}>
                  <View style={[styles.activityIconNew, { backgroundColor: '#F59E0B' + '20' }]}>
                    <Ionicons name="cube" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityTitleNew, { color: theme.text }]}>
                      Order #{(order._id || order.id)?.slice(-6)}
                    </Text>
                    <Text style={[styles.activityDescNew, { color: theme.textSecondary }]}>
                      {order.status === 'pending' ? 'Awaiting pickup' : 'In transit'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: order.status === 'pending' ? '#F59E0B' : '#3B82F6' }]}>
                  <Text style={styles.statusText}>
                    {order.status === 'pending' ? 'PENDING' : 'IN TRANSIT'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.error }]}
            onPress={() => dispatch(logout())}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFF" />
            <Text style={styles.logoutText}>Logout</Text>
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
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 4,
  },
  role: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    padding: 16,
    maxWidth: 600,
    marginHorizontal: 'auto',
    width: '100%',
    alignItems: 'stretch',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  activityCardNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconNew: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitleNew: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  activityDescNew: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
