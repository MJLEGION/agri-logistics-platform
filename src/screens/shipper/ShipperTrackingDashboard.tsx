// src/screens/shipper/ShipperTrackingDashboard.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchCargo } from '../../store/slices/cargoSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';
import SearchBar from '../../components/SearchBar';
import Avatar from '../../components/Avatar';
import TrackingMapView from './TrackingMapView';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface TrackingItem {
  id: string;
  name: string;
  image?: string;
  destination: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
    status: 'completed' | 'in_progress' | 'pending';
  };
  inTransit: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
    status: 'completed' | 'in_progress' | 'pending';
  };
  shippingCenter: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
    status: 'completed' | 'in_progress' | 'pending';
  };
  courier: {
    name: string;
    avatar?: string;
    phone?: string;
  };
  price: number;
  weight: string;
  distance: string;
  status: string;
}

export default function ShipperTrackingDashboard({ navigation }: any) {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { cargo } = useAppSelector((state) => state.cargo);
  const { orders } = useAppSelector((state) => state.orders);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<TrackingItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchCargo() as any);
    dispatch(fetchOrders() as any);
  }, [dispatch]);

  // Transform cargo and orders into tracking items
  const trackingItems = useMemo<TrackingItem[]>(() => {
    const userId = user?._id || user?.id;
    if (!userId) return [];

    // Get active cargo/orders for current shipper
    const userCargo = Array.isArray(cargo)
      ? cargo.filter((item: any) => {
          const ownerId = item.shipperId?._id || item.shipperId?.id || item.shipperId;
          const hasTransporter = item.transporterId;
          const activeStatuses = ['matched', 'picked_up', 'in_transit', 'delivered'];
          return ownerId === userId && hasTransporter && activeStatuses.includes(item.status);
        })
      : [];

    return userCargo.map((item: any) => {
      const transporter = item.transporterId;
      const status = item.status;

      // Determine location statuses based on cargo status
      let destinationStatus: 'completed' | 'in_progress' | 'pending' = 'pending';
      let inTransitStatus: 'completed' | 'in_progress' | 'pending' = 'pending';
      let shippingCenterStatus: 'completed' | 'in_progress' | 'pending' = 'completed';

      if (status === 'delivered') {
        destinationStatus = 'completed';
        inTransitStatus = 'completed';
      } else if (status === 'in_transit') {
        inTransitStatus = 'in_progress';
      } else if (status === 'picked_up') {
        inTransitStatus = 'in_progress';
      }

      return {
        id: item._id || item.id,
        name: item.name || 'Unknown Item',
        image: item.image || item.imageUrl,
        destination: {
          address: item.destination?.address || 'Destination',
          coordinates: item.destination
            ? {
                latitude: item.destination.latitude,
                longitude: item.destination.longitude,
              }
            : undefined,
          status: destinationStatus,
        },
        inTransit: {
          address: item.currentLocation?.address || 'In Transit',
          coordinates: item.currentLocation
            ? {
                latitude: item.currentLocation.latitude,
                longitude: item.currentLocation.longitude,
              }
            : undefined,
          status: inTransitStatus,
        },
        shippingCenter: {
          address: item.location?.address || 'Origin',
          coordinates: item.location
            ? {
                latitude: item.location.latitude,
                longitude: item.location.longitude,
              }
            : undefined,
          status: shippingCenterStatus,
        },
        courier: {
          name: transporter?.name || 'Transporter',
          avatar: transporter?.avatar || transporter?.profilePicture,
          phone: transporter?.phone || transporter?.phoneNumber,
        },
        price: item.price || 0,
        weight: `${item.quantity || 0}${item.unit || 'Kg'}`,
        distance: item.distance || '20km',
        status: item.status,
      };
    });
  }, [cargo, user]);

  // Filter tracking items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return trackingItems;
    const query = searchQuery.toLowerCase();
    return trackingItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.destination.address.toLowerCase().includes(query) ||
        item.courier.name.toLowerCase().includes(query)
    );
  }, [trackingItems, searchQuery]);

  // Select first item by default
  useEffect(() => {
    if (filteredItems.length > 0 && !selectedItem) {
      setSelectedItem(filteredItems[0]);
    }
  }, [filteredItems]);

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleMessage = (phone?: string) => {
    if (phone) {
      Linking.openURL(`sms:${phone}`);
    }
  };

  const getStatusIcon = (status: 'completed' | 'in_progress' | 'pending') => {
    if (status === 'completed') {
      return <Ionicons name="checkmark-circle" size={20} color="#10797D" />;
    } else if (status === 'in_progress') {
      return <Ionicons name="checkmark-circle" size={20} color="#10797D" />;
    }
    return <View style={styles.pendingDot} />;
  };

  // Map region based on selected item
  const mapRegion = useMemo(() => {
    if (selectedItem?.destination.coordinates) {
      return {
        latitude: selectedItem.destination.coordinates.latitude,
        longitude: selectedItem.destination.coordinates.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    // Default to Kigali, Rwanda
    return {
      latitude: -1.9441,
      longitude: 30.0619,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [selectedItem]);

  // Route coordinates for polyline
  const routeCoordinates = useMemo(() => {
    if (!selectedItem) return [];
    const coords = [];
    if (selectedItem.shippingCenter.coordinates) {
      coords.push(selectedItem.shippingCenter.coordinates);
    }
    if (selectedItem.inTransit.coordinates) {
      coords.push(selectedItem.inTransit.coordinates);
    }
    if (selectedItem.destination.coordinates) {
      coords.push(selectedItem.destination.coordinates);
    }
    return coords;
  }, [selectedItem]);

  const renderTrackingItem = (item: TrackingItem) => {
    const isExpanded = expandedItems.has(item.id);
    const isSelected = selectedItem?.id === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.trackingItemCard,
          { backgroundColor: theme.card },
          isSelected && styles.trackingItemSelected,
        ]}
        onPress={() => setSelectedItem(item)}
        activeOpacity={0.7}
      >
        <View style={styles.trackingItemHeader}>
          <Image
            source={
              item.image
                ? { uri: item.image }
                : require('../../../assets/images/logos/logo.png')
            }
            style={styles.itemImage}
          />
          <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
          <TouchableOpacity onPress={() => toggleItemExpansion(item.id)}>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View style={styles.trackingItemDetails}>
            {/* Destination */}
            <View style={styles.locationRow}>
              {getStatusIcon(item.destination.status)}
              <View style={styles.locationInfo}>
                <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                  Destination
                </Text>
                <Text style={[styles.locationAddress, { color: theme.text }]}>
                  {item.destination.address}
                </Text>
              </View>
            </View>

            {/* In Transit */}
            <View style={styles.locationRow}>
              {getStatusIcon(item.inTransit.status)}
              <View style={styles.locationInfo}>
                <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                  In Transit
                </Text>
                <Text style={[styles.locationAddress, { color: theme.text }]}>
                  {item.inTransit.address}
                </Text>
              </View>
            </View>

            {/* Shipping Center */}
            <View style={styles.locationRow}>
              {getStatusIcon(item.shippingCenter.status)}
              <View style={styles.locationInfo}>
                <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                  Shipping Center
                </Text>
                <Text style={[styles.locationAddress, { color: theme.text }]}>
                  {item.shippingCenter.address}
                </Text>
              </View>
            </View>

            {/* Courier Info */}
            <View style={styles.courierSection}>
              <View style={styles.courierInfo}>
                <Avatar
                  source={
                    item.courier.avatar
                      ? { uri: item.courier.avatar }
                      : require('../../../assets/images/logos/logo.png')
                  }
                  size={40}
                />
                <View style={styles.courierDetails}>
                  <Text style={[styles.courierLabel, { color: theme.textSecondary }]}>
                    Courier
                  </Text>
                  <Text style={[styles.courierName, { color: theme.text }]}>
                    {item.courier.name}
                  </Text>
                </View>
              </View>
              <View style={styles.courierActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#10797D' + '20' }]}
                  onPress={() => handleCall(item.courier.phone)}
                >
                  <Ionicons name="call" size={18} color="#10797D" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#10797D' + '20' }]}
                  onPress={() => handleMessage(item.courier.phone)}
                >
                  <Ionicons name="chatbox" size={18} color="#10797D" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Tracking List ({filteredItems.length})
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileSettings')}>
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Left Panel - Tracking List */}
        <View style={[styles.leftPanel, { backgroundColor: theme.card }]}>
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Item.."
              variant="filled"
            />
          </View>

          {/* Tracking Items List */}
          <ScrollView
            style={styles.trackingList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.trackingListContent}
          >
            {filteredItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No active shipments
                </Text>
              </View>
            ) : (
              filteredItems.map(renderTrackingItem)
            )}
          </ScrollView>
        </View>

        {/* Right Panel - Map & Details */}
        <View style={styles.rightPanel}>
          {/* Map View */}
          <View style={styles.mapContainer}>
            {selectedItem ? (
              <TrackingMapView
                mapRegion={mapRegion}
                shippingCenter={selectedItem.shippingCenter}
                destination={selectedItem.destination}
                routeCoordinates={routeCoordinates}
                itemName={selectedItem.name}
              />
            ) : (
              <View style={[styles.mapPlaceholder, { backgroundColor: theme.background }]}>
                <Ionicons name="map-outline" size={64} color={theme.textSecondary} />
                <Text style={[styles.mapPlaceholderText, { color: theme.textSecondary }]}>
                  Select an item to view route
                </Text>
              </View>
            )}

            {/* Address Display */}
            {selectedItem && (
              <View style={styles.addressBanner}>
                <Ionicons name="location" size={20} color="#10797D" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {selectedItem.destination.address}
                </Text>
              </View>
            )}
          </View>

          {/* Detail Item Panel */}
          {selectedItem && (
            <View style={[styles.detailPanel, { backgroundColor: theme.card }]}>
              <Text style={[styles.detailTitle, { color: theme.text }]}>Detail Item</Text>
              <TouchableOpacity style={styles.detailCard} activeOpacity={0.7}>
                <Image
                  source={
                    selectedItem.image
                      ? { uri: selectedItem.image }
                      : require('../../../assets/images/logos/logo.png')
                  }
                  style={styles.detailImage}
                />
                <Text style={[styles.detailName, { color: theme.text }]}>
                  {selectedItem.name}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>

              <View style={styles.detailStats}>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatLabel, { color: theme.textSecondary }]}>
                    price
                  </Text>
                  <Text style={[styles.detailStatValue, { color: theme.text }]}>
                    ${selectedItem.price}
                  </Text>
                </View>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatLabel, { color: theme.textSecondary }]}>
                    weight
                  </Text>
                  <Text style={[styles.detailStatValue, { color: theme.text }]}>
                    {selectedItem.weight}
                  </Text>
                </View>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatLabel, { color: theme.textSecondary }]}>
                    distance
                  </Text>
                  <Text style={[styles.detailStatValue, { color: theme.text }]}>
                    {selectedItem.distance}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Subscribe Panel */}
          <View style={styles.subscribePanel}>
            <LinearGradient colors={['#10797D', '#0D5F66']} style={styles.subscribeGradient}>
              <View style={styles.subscribeContent}>
                <Text style={styles.subscribeTitle}>Subscribe To Premium</Text>
                <Text style={styles.subscribeSubtitle}>
                  Your package will arrive faster with various additional features
                </Text>
                <TouchableOpacity style={styles.subscribeButton}>
                  <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: isWeb ? 'row' : 'column',
  },
  leftPanel: {
    width: isWeb ? 400 : '100%',
    height: isWeb ? '100%' : height * 0.5,
    borderRightWidth: isWeb ? 1 : 0,
    borderRightColor: 'rgba(0,0,0,0.05)',
  },
  searchSection: {
    padding: 16,
    paddingBottom: 12,
  },
  trackingList: {
    flex: 1,
  },
  trackingListContent: {
    padding: 16,
    paddingTop: 0,
  },
  trackingItemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trackingItemSelected: {
    borderWidth: 2,
    borderColor: '#10797D',
  },
  trackingItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  trackingItemDetails: {
    marginTop: 16,
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '400',
  },
  pendingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
  },
  courierSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courierDetails: {
    gap: 2,
  },
  courierLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  courierName: {
    fontSize: 14,
    fontWeight: '600',
  },
  courierActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
  rightPanel: {
    flex: 1,
    gap: 16,
    padding: isWeb ? 16 : 0,
  },
  mapContainer: {
    flex: 1,
    borderRadius: isWeb ? 12 : 0,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 300,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginTop: 12,
    fontSize: 14,
  },
  addressBanner: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  detailPanel: {
    borderRadius: isWeb ? 12 : 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  detailName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  detailStat: {
    alignItems: 'center',
  },
  detailStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  subscribePanel: {
    borderRadius: isWeb ? 12 : 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subscribeGradient: {
    padding: 20,
  },
  subscribeContent: {
    alignItems: 'center',
  },
  subscribeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  subscribeSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  subscribeButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  subscribeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10797D',
  },
});
