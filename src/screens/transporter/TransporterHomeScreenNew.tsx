// src/screens/transporter/TransporterHomeScreenNew.tsx
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
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { fetchCargo } from '../../store/slices/cargoSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import SearchBar from '../../components/SearchBar';
import TrackingMapView from '../shipper/TrackingMapView';

// Get static dimensions for StyleSheet (used for initial layout)
const { width: staticWidth, height: staticHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface TripItem {
  id: string;
  name: string;
  status: 'matched' | 'picked_up' | 'in_transit' | 'delivered';
  destination: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
  };
  inTransit?: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
  };
  pickup: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
  };
  shipper: {
    name: string;
    phone?: string;
    avatar?: string;
  };
  price: number;
  weight: string;
  distance: string;
  image?: string;
}

export default function TransporterHomeScreenNew({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { cargo, isLoading: cargoLoading } = useAppSelector((state) => state.cargo);
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { width, height } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<TripItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Responsive breakpoints
  const isMobile = width <= 768;
  const isSmallMobile = width < 420;

  useEffect(() => {
    dispatch(fetchCargo());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    dispatch(fetchCargo());
    setRefreshing(false);
  };

  const userId = user?._id || user?.id;

  const tripItems = useMemo<TripItem[]>(() => {
    if (!userId) return [];

    const userTrips = Array.isArray(cargo)
      ? cargo.filter((item: any) => {
          const transporterId = typeof item.transporterId === 'string' ? item.transporterId : item.transporterId?._id;
          const activeStatuses = ['matched', 'picked_up', 'in_transit', 'delivered'];
          return transporterId === userId && activeStatuses.includes(item.status);
        })
      : [];

    return userTrips.map((item: any) => ({
      id: item._id || item.id,
      name: item.name || 'Trip',
      status: item.status === 'picked_up' ? 'picked_up' : item.status === 'delivered' ? 'delivered' : item.status === 'in_transit' ? 'in_transit' : 'matched',
      destination: {
        address: item.destination?.address || 'Unknown',
        coordinates: item.destination?.coordinates,
      },
      inTransit: {
        address: item.currentLocation?.address || item.destination?.address || 'In Transit',
        coordinates: item.currentLocation?.coordinates,
      },
      pickup: {
        address: item.pickup?.address || 'Pickup Location',
        coordinates: item.pickup?.coordinates,
      },
      shipper: {
        name: item.shipperId?.name || 'Shipper',
        phone: item.shipperId?.phone,
        avatar: item.shipperId?.avatar,
      },
      price: item.price || 0,
      weight: item.weight || '0 kg',
      distance: item.estimatedDistance || '0 km',
      image: item.image,
    }));
  }, [cargo, userId]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return tripItems;
    return tripItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tripItems, searchQuery]);

  const activeTrips = useMemo(() => {
    return filteredItems.filter(t => t.status === 'matched' || t.status === 'picked_up' || t.status === 'in_transit');
  }, [filteredItems]);

  const deliveredTrips = useMemo(() => {
    return filteredItems.filter(t => t.status === 'delivered');
  }, [filteredItems]);

  const inProgressTrips = useMemo(() => {
    return filteredItems.filter(t => t.status === 'in_transit');
  }, [filteredItems]);

  const handleSelectItem = (item: TripItem) => {
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
      case 'picked_up':
        return '#06B6D4';
      default:
        return '#9CA3AF';
    }
  };

  const renderTripItem = ({ item }: { item: TripItem }) => {
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
                {item.status === 'delivered' ? 'Delivered' : item.status === 'in_transit' ? 'In Transit' : item.status === 'picked_up' ? 'Picked Up' : 'Matched'}
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
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Shipper</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{item.shipper.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Price</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>RWF {item.price}</Text>
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
    <View style={[styles.container, { backgroundColor: theme.background, flexDirection: isMobile ? 'column' : 'row' }]}>
      {/* Mobile Header */}
      {isMobile && (
        <View style={[styles.mobileHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={styles.hamburgerButton}
            onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Ionicons name={mobileMenuOpen ? "close" : "menu"} size={28} color={theme.text} />
          </TouchableOpacity>
          <Image
            source={require('../../../assets/images/logos/logo.png')}
            style={styles.mobileHeaderLogo}
            resizeMode="contain"
          />
          <View style={styles.mobileHeaderActions}>
            <LanguageSwitcher showLabel={false} size="small" />
            <ThemeToggle />
          </View>
        </View>
      )}

      {/* Mobile Navigation Menu */}
      {isMobile && mobileMenuOpen && (
        <View style={[styles.mobileMenu, { backgroundColor: '#0F172A' }]}>
          <ScrollView>
            <TouchableOpacity
              style={styles.mobileMenuItem}
              onPress={() => {
                navigation.navigate('AvailableLoads');
                setMobileMenuOpen(false);
              }}
            >
              <Ionicons name="briefcase-outline" size={24} color="#93C5FD" />
              <Text style={styles.mobileMenuText}>{t('transporter.availableLoads')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileMenuItem}
              onPress={() => {
                navigation.navigate('ActiveTrips');
                setMobileMenuOpen(false);
              }}
            >
              <Ionicons name="navigate-outline" size={24} color="#93C5FD" />
              <Text style={styles.mobileMenuText}>{t('transporter.activeDeliveries')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileMenuItem}
              onPress={() => {
                navigation.navigate('EarningsDashboard');
                setMobileMenuOpen(false);
              }}
            >
              <Ionicons name="cash-outline" size={24} color="#93C5FD" />
              <Text style={styles.mobileMenuText}>{t('transporter.earnings')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileMenuItem}
              onPress={() => {
                navigation.navigate('TransporterRatings');
                setMobileMenuOpen(false);
              }}
            >
              <Ionicons name="star-outline" size={24} color="#93C5FD" />
              <Text style={styles.mobileMenuText}>{t('transporter.ratings')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileMenuItem}
              onPress={() => {
                navigation.navigate('TripHistory');
                setMobileMenuOpen(false);
              }}
            >
              <Ionicons name="time-outline" size={24} color="#93C5FD" />
              <Text style={styles.mobileMenuText}>{t('shipper.completedShipments')}</Text>
            </TouchableOpacity>

            <View style={styles.mobileMenuDivider} />

            <TouchableOpacity
              style={styles.mobileMenuItem}
              onPress={() => {
                navigation.navigate('ProfileSettings');
                setMobileMenuOpen(false);
              }}
            >
              <Ionicons name="settings-outline" size={24} color="#93C5FD" />
              <Text style={styles.mobileMenuText}>{t('common.settings')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileMenuItem}
              onPress={() => {
                dispatch(logout());
                setMobileMenuOpen(false);
              }}
            >
              <Ionicons name="log-out" size={24} color="#EF4444" />
              <Text style={[styles.mobileMenuText, { color: '#EF4444' }]}>{t('common.logout')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Desktop Sidebar - Transporter (Blue Theme) - Hidden on mobile */}
      {!isMobile && (
        <View style={[styles.sidebar, { backgroundColor: '#0F172A' }]}>
        <View style={styles.sidebarHeader}>
          <Image
            source={require('../../../assets/images/logos/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Transporter</Text>
          </View>
        </View>

        <View style={styles.sidebarNav}>
          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => navigation.navigate('AvailableLoads')}
          >
            <Ionicons name="briefcase-outline" size={24} color="#93C5FD" />
            <Text style={styles.navLabel}>{t('transporter.availableLoads')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => navigation.navigate('ActiveTrips')}
          >
            <Ionicons name="navigate-outline" size={24} color="#93C5FD" />
            <Text style={styles.navLabel}>{t('transporter.activeDeliveries')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => navigation.navigate('EarningsDashboard')}
          >
            <Ionicons name="cash-outline" size={24} color="#93C5FD" />
            <Text style={styles.navLabel}>{t('transporter.earnings')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => navigation.navigate('TransporterRatings')}
          >
            <Ionicons name="star-outline" size={24} color="#93C5FD" />
            <Text style={styles.navLabel}>{t('transporter.ratings')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => navigation.navigate('TripHistory')}
          >
            <Ionicons name="time-outline" size={24} color="#93C5FD" />
            <Text style={styles.navLabel}>{t('shipper.completedShipments')}</Text>
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
      )}

      {/* Main Content */}
      <ImageBackground
        source={require('../../../assets/images/backimages/transporter.jpg')}
        style={[styles.mainContent, { flexDirection: isMobile ? 'column' : 'row' }]}
        imageStyle={styles.backgroundImage}
      >
        <View style={[styles.backgroundOverlay, { backgroundColor: theme.background + 'E6' }]} />

        {/* Left Panel - Trips List */}
        <View style={[styles.leftPanel, { backgroundColor: theme.card, width: isMobile ? '100%' : LEFT_PANEL_WIDTH, borderRightWidth: isMobile ? 0 : 1 }]}>
          {/* Welcome Banner */}
          <View style={[styles.welcomeBanner, { backgroundColor: '#3B82F6' + '20' }]}>
            <View>
              <Text style={[styles.welcomeTitle, { color: theme.text }]}>
                {t('common.welcomeBack')}!
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
                {filteredItems.length} {t('transporter.activeDeliveries').toLowerCase()}
              </Text>
            </View>
            <View style={styles.welcomeIcon}>
              <Ionicons name="checkmark-circle" size={40} color="#3B82F6" />
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {inProgressTrips.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('shipper.inTransit')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {deliveredTrips.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('shipper.delivered')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {activeTrips.filter(t => t.status === 'matched').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('transporter.available')}</Text>
            </View>
          </View>

          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: theme.text }]}>
              {t('transporter.activeDeliveries')} ({filteredItems.length})
            </Text>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={t('common.search') + '...'}
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              renderItem={renderTripItem}
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
                <View style={[styles.emptyIconBox, { backgroundColor: '#3B82F6' + '20' }]}>
                  <Ionicons name="navigate-outline" size={56} color="#3B82F6" />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No Active Trips
                </Text>
                <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
                  You don't have any trips in progress. Find available loads to get started.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyAction, { backgroundColor: '#3B82F6' }]}
                  onPress={() => navigation.navigate('AvailableLoads')}
                >
                  <Ionicons name="briefcase" size={20} color="#FFF" />
                  <Text style={styles.emptyActionText}>Find Available Loads</Text>
                </TouchableOpacity>

                <View style={styles.emptyTips}>
                  <Text style={[styles.tipsTitle, { color: theme.text }]}>Quick Tips:</Text>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                    <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                      Track your trips in real-time
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                    <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                      Connect with trusted shippers
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                    <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                      Earn money on every delivery
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
                shippingCenter={selectedItem.pickup}
                destination={selectedItem.destination}
                itemName={selectedItem.name}
                mapRegion={undefined}
                routeCoordinates={[]}
              />
            ) : (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={64} color={theme.textSecondary} />
                <Text style={[styles.mapPlaceholderText, { color: theme.textSecondary }]}>
                  Select a trip to view on map
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Right Panel - Detail Item */}
        {selectedItem && (
          <View style={[styles.rightPanel, { backgroundColor: theme.card, width: isMobile ? '100%' : RIGHT_PANEL_WIDTH }]}>
            <View style={styles.detailHeader}>
              <Text style={[styles.detailTitle, { color: theme.text }]}>
                Trip Details
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
                    {selectedItem.status === 'delivered' ? 'Delivered' : selectedItem.status === 'in_transit' ? 'In Transit' : selectedItem.status === 'picked_up' ? 'Picked Up' : 'Matched'}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: theme.text }]}>
                    Destination
                  </Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={18} color="#3B82F6" />
                    <Text style={[styles.locationAddress, { color: theme.textSecondary }]}>
                      {selectedItem.destination.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: theme.text }]}>
                    Shipper
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedItem.shipper.name}
                  </Text>
                  {selectedItem.shipper.phone && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${selectedItem.shipper.phone}`)}
                      style={styles.phoneButton}
                    >
                      <Ionicons name="call" size={16} color="#3B82F6" />
                      <Text style={[styles.phoneText, { color: '#3B82F6' }]}>
                        {selectedItem.shipper.phone}
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
                      RWF {selectedItem.price}
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

                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}>
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
const LEFT_PANEL_WIDTH = isWeb ? 350 : staticWidth * 0.6;
const RIGHT_PANEL_WIDTH = isWeb ? 320 : staticWidth * 0.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection is now dynamic - set inline based on isMobile
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
    backgroundColor: '#3B82F6',
    borderRadius: 16,
  },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
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
  // Mobile Header
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  hamburgerButton: {
    padding: 8,
  },
  mobileHeaderLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  mobileHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Mobile Menu
  mobileMenu: {
    maxHeight: '80%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  mobileMenuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  mobileMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
});
