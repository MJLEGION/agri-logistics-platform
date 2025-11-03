// src/screens/shipper/ShipperHomeScreen.tsx
import React, { useEffect, useMemo, useCallback } from 'react';
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
import { fetchCargo } from '../../store/slices/cargoSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ListItem from '../../components/ListItem';
import Divider from '../../components/Divider';
import { ShipperHomeScreenProps } from '../../types';

const { width } = Dimensions.get('window');

export default function ShipperHomeScreen({ navigation }: ShipperHomeScreenProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { cargo, isLoading: cargoLoading } = useAppSelector((state) => state.cargo);
  const { orders, isLoading: ordersLoading } = useAppSelector((state) => state.orders);
  const dispatch = useAppDispatch();
  const { theme } = useTheme();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchCargo());
    dispatch(fetchOrders());
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Calculate stats with useMemo for performance
  const userId = user?._id || user?.id;
  
  const myCargo = useMemo(() => {
    console.log('🔍 ShipperHomeScreen: cargo type check:', typeof cargo, 'is array?', Array.isArray(cargo), 'value:', cargo);
    if (!Array.isArray(cargo)) {
      console.error('❌ cargo is not an array:', cargo);
      return [];
    }
    return cargo.filter((c) => {
      const shipperId = typeof c.shipperId === 'string' ? c.shipperId : c.shipperId?._id;
      return shipperId === userId && c.status === 'listed';
    });
  }, [cargo, userId]);

  const myOrders = useMemo(() => {
    console.log('🔍 ShipperHomeScreen: orders type check:', typeof orders, 'is array?', Array.isArray(orders), 'value:', orders);
    if (!Array.isArray(orders)) {
      console.error('❌ orders is not an array:', orders);
      return [];
    }
    return orders.filter((order) => {
      const shipperId = typeof order.shipperId === 'string' ? order.shipperId : order.shipperId?._id;
      return shipperId === userId;
    });
  }, [orders, userId]);

  const activeOrders = useMemo(() => {
    return myOrders.filter(
      (order) => order.status === 'pending' || order.status === 'in_transit'
    );
  }, [myOrders]);

  const quickActions = useMemo(() => [
    {
      icon: 'add-circle',
      title: 'List New Cargo',
      description: 'Add cargo for shipping',
      color: theme.primary,
      gradient: [theme.primary, theme.primaryLight],
      onPress: () => navigation.navigate('ListCargo'),
    },
    {
      icon: 'list',
      title: 'My Cargo',
      description: 'View all your cargo',
      color: theme.accent,
      gradient: [theme.accent, theme.accentLight],
      onPress: () => navigation.navigate('MyCargo'),
    },
    {
      icon: 'cube',
      title: 'Active Orders',
      description: 'Track deliveries',
      color: theme.secondary,
      gradient: [theme.secondary, theme.secondaryLight],
      onPress: () => navigation.navigate('ShipperActiveOrders'),
    },
  ], [theme, navigation]);

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
          colors={['#27AE60', '#2ECC71']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Avatar
                name={user?.name || 'User'}
                size="lg"
                icon="leaf"
                style={{ marginRight: 16 }}
              />
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Welcome back!</Text>
                <Text style={styles.userName}>{user?.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Text style={styles.role}>Shipper</Text>
                  <Badge label="Active" variant="success" size="sm" />
                </View>
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
              {myCargo.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Active Cargo
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
              {myOrders.filter((o) => o.status === 'delivered').length}
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
            {/* List New Cargo */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('ListCargo')}
            >
              <LinearGradient
                colors={['#27AE60', '#2ECC71']}
                style={styles.actionGradient}
              >
                <Ionicons name="add-circle" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                List New Cargo
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                Add cargo for shipping
              </Text>
            </TouchableOpacity>

            {/* My Listings */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('MyCargo')}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.actionGradient}
              >
                <Ionicons name="list" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                My Cargo
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                {myCargo.length} active cargo
              </Text>
            </TouchableOpacity>

            {/* Active Orders */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('ShipperActiveOrders')}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionGradient}
              >
                <Ionicons name="cube" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: theme.text }]}>
                Active Orders
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                {activeOrders.length} ongoing
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        {activeOrders.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Active Orders
            </Text>
            {activeOrders.slice(0, 3).map((order) => (
              <ListItem
                key={order._id || order.id}
                icon="cube"
                title={order.cargoId?.name || 'Order'}
                subtitle={`${order.pickupLocation?.address || 'Pickup location'} → ${order.deliveryLocation?.address || 'Delivery location'}`}
                rightElement={
                  <Badge
                    label={order.status === 'pending' ? 'PENDING' : 'IN TRANSIT'}
                    variant={order.status === 'pending' ? 'warning' : 'primary'}
                    size="sm"
                  />
                }
                chevron
                onPress={() => navigation.navigate('ShipperActiveOrders')}
              />
            ))}
          </View>
        )}

        <Divider spacing="lg" />

        <View style={styles.content}>
          <Button
            title="Logout"
            onPress={() => dispatch(logout())}
            variant="danger"
            size="lg"
            fullWidth
            icon={<Ionicons name="log-out-outline" size={20} color="#FFF" />}
          />
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