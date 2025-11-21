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
  FlatList,
  Linking,
  TextInput,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { fetchCargo } from '../../store/slices/cargoSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { ShipperHomeScreenProps } from '../../types';
import SearchBar from '../../components/SearchBar';
import TrackingMapView from './TrackingMapView';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface TrackingItem {
  id: string;
  name: string;
  status: 'pending' | 'in_transit' | 'delivered';
  destination: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
  };
  inTransit?: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
  };
  shippingCenter: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
  };
  transporter: {
    name: string;
    phone?: string;
    avatar?: string;
  };
  price: number;
  weight: string;
  distance: string;
  image?: string;
}

export default function ShipperHomeScreenNew({ navigation }: ShipperHomeScreenProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { cargo } = useAppSelector((state) => state.cargo);
  const { orders } = useAppSelector((state) => state.orders);
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<TrackingItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchCargo());
    dispatch(fetchOrders());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    dispatch(fetchCargo());
    dispatch(fetchOrders());
    setRefreshing(false);
  };

  const userId = user?._id || user?.id;

  const trackingItems = useMemo<TrackingItem[]>(() => {
    if (!userId) return [];

    const userCargo = Array.isArray(cargo)
      ? cargo.filter((item: any) => {
          const ownerId = item.shipperId?._id || item.shipperId?.id || item.shipperId;
          const hasTransporter = item.transporterId;
          const activeStatuses = ['matched', 'picked_up', 'in_transit', 'delivered'];
          return ownerId === userId && hasTransporter && activeStatuses.includes(item.status);
        })
      : [];

    return userCargo.map((item: any) => ({
      id: item._id || item.id,
      name: item.name || 'Cargo',
      status: item.status === 'delivered' ? 'delivered' : item.status === 'in_transit' ? 'in_transit' : 'pending',
      destination: {
        address: item.destination?.address || 'Unknown',
        coordinates: item.destination?.coordinates,
      },
      inTransit: {
        address: item.currentLocation?.address || item.destination?.address || 'In Transit',
        coordinates: item.currentLocation?.coordinates,
      },
      shippingCenter: {
        address: item.pickup?.address || 'Shipping Center',
        coordinates: item.pickup?.coordinates,
      },
      transporter: {
        name: item.transporterId?.name || 'Transporter',
        phone: item.transporterId?.phone,
        avatar: item.transporterId?.avatar,
      },
      price: item.price || 0,
      weight: item.weight || '0 kg',
      distance: item.estimatedDistance || '0 km',
      image: item.image,
    }));
  }, [cargo, userId]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return trackingItems;
    return trackingItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trackingItems, searchQuery]);

  const handleSelectItem = (item: TrackingItem) => {
    setSelectedItem(item);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#10B981';
      case 'in_transit':
        return '#F59E0B';
      default:
        return '#9CA3AF';
    }
  };

  const renderTrackingItem = ({ item }: { item: TrackingItem }) => {
    const isSelected = selectedItem?.id === item.id;
    const isExpanded = expandedItems.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.trackingItem,
          {
            backgroundColor: isSelected ? theme.primary + '15' : theme.card,
            borderLeftWidth: isSelected ? 4 : 0,
            borderLeftColor: isSelected ? theme.primary : 'transparent',
          },
        ]}
        onPress={() => handleSelectItem(item)}
        activeOpacity={0.7}
      >
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.itemImage}
          />
        )}
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>
                {item.status === 'delivered' ? t('shipper.delivered') : item.status === 'in_transit' ? t('shipper.inTransit') : t('shipper.pending')}
              </Text>
            </View>
          </View>

          <View style={styles.itemLocation}>
            <Ionicons name="location" size={14} color={theme.textSecondary} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>
              {item.destination.address}
            </Text>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{t('auth.transporter')}</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{item.transporter.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{t('common.price')}</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>${item.price}</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={() => toggleExpanded(item.id)}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Dark Sidebar */}
      <View style={[styles.sidebar, { backgroundColor: '#1F2937' }]}>
        <View style={styles.sidebarHeader}>
          <Image
            source={require('../../../assets/images/logos/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.sidebarNav}>
          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => navigation.navigate('MyCargo')}
          >
            <Ionicons name="cube-outline" size={24} color="#93C5FD" />
            <Text style={styles.navLabel}>{t('shipper.myCargo')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => navigation.navigate('ShipperActiveOrders')}
          >
            <Ionicons name="list-outline" size={24} color="#93C5FD" />
            <Text style={styles.navLabel}>{t('shipper.activeShipments')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => navigation.navigate('RateTransporter')}
          >
            <Ionicons name="star-outline" size={24} color="#93C5FD" />
            <Text style={styles.navLabel}>{t('transporter.ratings')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => navigation.navigate('ListCargo')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#93C5FD" />
            <Text style={styles.navLabel}>{t('shipper.listCargo')}</Text>
          </TouchableOpacity>

          <View style={styles.sidebarDivider} />

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => navigation.navigate('ProfileSettings')}
          >
            <Ionicons name="settings-outline" size={24} color="#93C5FD" />
            <Text style={styles.navLabel}>{t('common.settings')}</Text>
          </TouchableOpacity>

          <LanguageSwitcher showLabel={false} size="small" />
        </View>

        <View style={styles.sidebarFooter}>
          <ThemeToggle />
          <TouchableOpacity
            style={styles.logoutIcon}
            onPress={() => dispatch(logout())}
          >
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutLabel}>{t('common.logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ImageBackground
        source={require('../../../assets/images/backimages/shipper.jpg')}
        style={styles.mainContent}
        imageStyle={styles.backgroundImage}
      >
        <View style={[styles.backgroundOverlay, { backgroundColor: theme.background + 'E6' }]} />
        
        {/* Left Panel - Tracking List */}
        <View style={[styles.leftPanel, { backgroundColor: theme.card }]}>
          {/* Welcome Banner */}
          <View style={[styles.welcomeBanner, { backgroundColor: theme.primary + '15' }]}>
            <View>
              <Text style={[styles.welcomeTitle, { color: theme.text }]}>
                {t('common.welcomeBack')}!
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
                {filteredItems.length} {t('shipper.activeShipments').toLowerCase()}
              </Text>
            </View>
            <View style={styles.welcomeIcon}>
              <Ionicons name="checkmark-circle" size={40} color={theme.primary} />
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {filteredItems.filter(i => i.status === 'in_transit').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('shipper.inTransit')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {filteredItems.filter(i => i.status === 'delivered').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('shipper.delivered')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {filteredItems.filter(i => i.status === 'pending').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('shipper.pending')}</Text>
            </View>
          </View>

          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: theme.text }]}>
              {t('shipper.recentShipments')} ({filteredItems.length})
            </Text>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search item..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              renderItem={renderTrackingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          ) : (
            <ScrollView
              style={styles.emptyContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.emptyContent}
            >
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconBox, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="cube-outline" size={56} color={theme.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No Active Shipments
                </Text>
                <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
                  You don't have any shipments in transit. Create or import a shipment to get started.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyAction, { backgroundColor: theme.primary }]}
                  onPress={() => navigation.navigate('ListCargo')}
                >
                  <Ionicons name="add-circle" size={20} color="#FFF" />
                  <Text style={styles.emptyActionText}>Create New Shipment</Text>
                </TouchableOpacity>

                <View style={styles.emptyTips}>
                  <Text style={[styles.tipsTitle, { color: theme.text }]}>Quick Tips:</Text>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                    <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                      Track your shipments in real-time
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                    <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                      Connect with trusted transporters
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                    <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                      Get real-time notifications
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Center - Map */}
        {isWeb && (
          <View style={styles.mapContainer}>
            {selectedItem ? (
              <TrackingMapView
                shippingCenter={selectedItem.shippingCenter}
                destination={selectedItem.destination}
                itemName={selectedItem.name}
                mapRegion={undefined}
                routeCoordinates={[]}
              />
            ) : (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={64} color={theme.textSecondary} />
                <Text style={[styles.mapPlaceholderText, { color: theme.textSecondary }]}>
                  Select a shipment to view on map
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Right Panel - Detail Item */}
        {selectedItem && (
          <View style={[styles.rightPanel, { backgroundColor: theme.card }]}>
            <View style={styles.detailHeader}>
              <Text style={[styles.detailTitle, { color: theme.text }]}>
                Detail Item
              </Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedItem.image && (
                <Image
                  source={{ uri: selectedItem.image }}
                  style={styles.detailImage}
                />
              )}

              <View style={styles.detailCard}>
                <Text style={[styles.detailItemName, { color: theme.text }]}>
                  {selectedItem.name}
                </Text>

                <View style={[styles.detailBadge, { backgroundColor: getStatusColor(selectedItem.status) }]}>
                  <Text style={styles.detailBadgeText}>
                    {selectedItem.status === 'delivered' ? 'Delivered' : selectedItem.status === 'in_transit' ? 'In Transit' : 'Pending'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: theme.text }]}>
                    Destination
                  </Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={18} color="#10B981" />
                    <Text style={[styles.locationAddress, { color: theme.textSecondary }]}>
                      {selectedItem.destination.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: theme.text }]}>
                    Transporter
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedItem.transporter.name}
                  </Text>
                  {selectedItem.transporter.phone && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${selectedItem.transporter.phone}`)}
                      style={styles.phoneButton}
                    >
                      <Ionicons name="call" size={16} color="#10B981" />
                      <Text style={[styles.phoneText, { color: '#10B981' }]}>
                        {selectedItem.transporter.phone}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.detailGrid}>
                  <View style={styles.gridItem}>
                    <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>
                      Price
                    </Text>
                    <Text style={[styles.gridValue, { color: theme.text }]}>
                      ${selectedItem.price}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>
                      Weight
                    </Text>
                    <Text style={[styles.gridValue, { color: theme.text }]}>
                      {selectedItem.weight}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>
                      Distance
                    </Text>
                    <Text style={[styles.gridValue, { color: theme.text }]}>
                      {selectedItem.distance}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]}>
                  <Ionicons name="information-circle" size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>View More Details</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

const SIDEBAR_WIDTH = 100;
const LEFT_PANEL_WIDTH = isWeb ? 350 : width * 0.6;
const RIGHT_PANEL_WIDTH = isWeb ? 320 : width * 0.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  sidebarNav: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 20,
  },
  sidebarIconBtn: {
    width: '100%',
    minHeight: 64,
    borderRadius: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    gap: 4,
  },
  navLabel: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  sidebarPrimaryBtn: {
    backgroundColor: '#10B981',
    borderRadius: 16,
  },
  sidebarDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
  sidebarFooter: {
    alignItems: 'center',
    gap: 12,
  },
  logoutIcon: {
    width: '100%',
    minHeight: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 4,
    paddingVertical: 8,
  },
  logoutLabel: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  backgroundImage: {
    opacity: 0.35,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  leftPanel: {
    width: LEFT_PANEL_WIDTH,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
    paddingTop: 0,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 12,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
  },
  welcomeIcon: {
    opacity: 0.2,
  },
  quickStats: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  panelHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  trackingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 0,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  itemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    flex: 1,
  },
  expandedContent: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
  },
  emptyActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTips: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  mapContainer: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  rightPanel: {
    width: RIGHT_PANEL_WIDTH,
    paddingTop: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  detailCard: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailItemName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  detailBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  locationAddress: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
