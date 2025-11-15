// src/screens/shipper/ShipperHomeScreenNew.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { fetchCargo } from '../../store/slices/cargoSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { ShipperHomeScreenProps } from '../../types';
import SearchBar from '../../components/SearchBar';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function ShipperHomeScreenNew({ navigation }: ShipperHomeScreenProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { cargo, isLoading: cargoLoading } = useAppSelector((state) => state.cargo);
  const { orders, isLoading: ordersLoading } = useAppSelector((state) => state.orders);
  const dispatch = useAppDispatch();
  const { theme } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchCargo());
    dispatch(fetchOrders());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate stats
  const userId = user?._id || user?.id;

  const myCargo = useMemo(() => {
    if (!Array.isArray(cargo)) return [];
    return cargo.filter((c) => {
      const shipperId = typeof c.shipperId === 'string' ? c.shipperId : c.shipperId?._id;
      return shipperId === userId && c.status === 'listed';
    });
  }, [cargo, userId]);

  const myOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
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

  const completedOrders = useMemo(() => {
    return myOrders.filter((order) => order.status === 'delivered');
  }, [myOrders]);

  const menuItems = [
    {
      id: 'home',
      icon: 'home',
      label: 'Home',
      onPress: () => setSelectedMenu('home'),
    },
    {
      id: 'list-cargo',
      icon: 'add-circle',
      label: 'List New Cargo',
      onPress: () => navigation.navigate('ListCargo'),
    },
    {
      id: 'my-cargo',
      icon: 'cube',
      label: 'My Cargo',
      badge: myCargo.length,
      onPress: () => navigation.navigate('MyCargo'),
    },
    {
      id: 'active-orders',
      icon: 'cart',
      label: 'Active Orders',
      badge: activeOrders.length,
      onPress: () => navigation.navigate('ShipperActiveOrders'),
    },
    {
      id: 'tracking',
      icon: 'map',
      label: 'Track Shipments',
      onPress: () => navigation.navigate('ShipperTrackingDashboard'),
    },
    {
      id: 'rate',
      icon: 'star',
      label: 'Rate Transporters',
      onPress: () => navigation.navigate('RateTransporter'),
    },
  ];

  const renderMenuItem = (item: any) => {
    const isSelected = selectedMenu === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.menuItem,
          isSelected && { backgroundColor: theme.primary + '15' },
        ]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons
            name={item.icon}
            size={22}
            color={isSelected ? theme.primary : theme.textSecondary}
          />
          <Text
            style={[
              styles.menuItemText,
              {
                color: isSelected ? theme.primary : theme.text,
                fontWeight: isSelected ? '600' : '400',
              },
            ]}
          >
            {item.label}
          </Text>
        </View>
        {item.badge !== undefined && item.badge > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Sidebar */}
      <View style={[styles.sidebar, { backgroundColor: theme.card }]}>
        {/* Logo and User Info */}
        <View style={styles.sidebarHeader}>
          <Image
            source={require('../../../assets/images/logos/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.welcomeText, { color: theme.text }]}>
            Welcome, {user?.name?.split(' ')[0]}!
          </Text>
          <Text style={[styles.roleText, { color: theme.textSecondary }]}>
            Shipper
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search..."
            variant="filled"
          />
        </View>

        {/* Menu Items */}
        <ScrollView
          style={styles.menuList}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.menuTitle, { color: theme.textSecondary }]}>
            QUICK ACTIONS
          </Text>
          {menuItems.map(renderMenuItem)}

          {/* Logout */}
          <View style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => dispatch(logout())}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={22} color={theme.error} />
              <Text style={[styles.menuItemText, { color: theme.error }]}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Theme Toggle at Bottom */}
        <View style={styles.sidebarFooter}>
          <ThemeToggle />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Top Bar */}
        <View style={[styles.topBar, { backgroundColor: theme.card }]}>
          <Text style={[styles.topBarTitle, { color: theme.text }]}>
            Manage your shipments
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileSettings')}>
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            {/* Active Cargo */}
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconBox, { backgroundColor: '#E5E7EB' }]}>
                <Ionicons name="leaf" size={28} color="#6B7280" />
              </View>
              <Text style={[styles.statNumber, { color: theme.text }]}>{myCargo.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Cargo</Text>
            </View>

            {/* Active Orders */}
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconBox, { backgroundColor: '#E5E7EB' }]}>
                <Ionicons name="cart" size={28} color="#6B7280" />
              </View>
              <Text style={[styles.statNumber, { color: theme.text }]}>{activeOrders.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Orders</Text>
            </View>

            {/* Completed */}
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconBox, { backgroundColor: '#E5E7EB' }]}>
                <Ionicons name="checkmark-circle" size={28} color="#6B7280" />
              </View>
              <Text style={[styles.statNumber, { color: theme.text }]}>{completedOrders.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
            </View>
          </View>

          {/* Featured Actions */}
          <View style={styles.featuredSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Featured
            </Text>

            {/* Track Shipments Card */}
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => navigation.navigate('ShipperTrackingDashboard')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#10797D', '#0D5F66']}
                style={styles.featuredGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featuredContent}>
                  <View style={styles.featuredIconBox}>
                    <Ionicons name="map" size={40} color="#FFF" />
                  </View>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredTitle}>Track Shipments</Text>
                    <Text style={styles.featuredSubtitle}>
                      Monitor your cargo in real-time
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={28} color="#FFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Rate Transporters Card */}
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('RateTransporter')}
              activeOpacity={0.7}
            >
              <View style={styles.actionCardContent}>
                <View style={[styles.actionIconBox, { backgroundColor: '#E5E7EB' }]}>
                  <Ionicons name="star" size={28} color="#6B7280" />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={[styles.actionTitle, { color: theme.text }]}>
                    Rate Transporters
                  </Text>
                  <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                    Share your feedback
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          {activeOrders.length > 0 && (
            <View style={styles.activitySection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Activity
              </Text>
              {activeOrders.slice(0, 3).map((order) => (
                <View
                  key={order._id || order.id}
                  style={[styles.activityCard, { backgroundColor: theme.card }]}
                >
                  <View style={styles.activityLeft}>
                    <View style={[styles.activityIcon, { backgroundColor: theme.primary + '20' }]}>
                      <Ionicons name="cube" size={24} color={theme.primary} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityTitle, { color: theme.text }]}>
                        {order.cargoId?.name || 'Order'}
                      </Text>
                      <Text style={[styles.activitySubtitle, { color: theme.textSecondary }]}>
                        {order.status === 'pending' ? 'Pending' : 'In Transit'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.activityBadge,
                      {
                        backgroundColor:
                          order.status === 'pending' ? '#F59E0B' : theme.primary,
                      },
                    ]}
                  >
                    <Text style={styles.activityBadgeText}>
                      {order.status === 'pending' ? 'PENDING' : 'ACTIVE'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const SIDEBAR_WIDTH = isWeb ? 280 : width * 0.75;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
  },
  sidebarHeader: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 12,
    borderRadius: 30,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 12,
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    flex: 1,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 16,
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 16,
    padding: 20,
  },
  statCard: {
    flex: isWeb ? 1 : undefined,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  featuredSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  featuredGradient: {
    padding: 20,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featuredIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredInfo: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  actionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
  },
  activitySection: {
    padding: 20,
    paddingTop: 0,
  },
  activityCard: {
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
    gap: 12,
    flex: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
  },
  activityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
