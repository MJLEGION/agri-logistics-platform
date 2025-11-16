// src/screens/transporter/EarningsDashboardScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  getCompletedTripsForTransporter,
  calculateTotalEarnings,
  getTripsByPeriod,
} from '../../logistics/utils/tripCalculations';
import { fetchAllTrips } from '../../logistics/store/tripsSlice';
import { fetchCargo } from '../../store/slices/cargoSlice';
import PaymentModal from '../../components/PaymentModal';
import { showToast } from '../../services/toastService';
import DashboardLayout from '../../components/layouts/DashboardLayout';

type TimePeriod = 'today' | 'week' | 'month' | 'year';

export default function EarningsDashboardScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { trips } = useAppSelector((state) => state.trips);
  const { cargo } = useAppSelector((state) => state.cargo);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [minimumWithdrawal] = useState(5000); // Minimum withdrawal amount

  // Fetch trips and cargo when screen loads
  useEffect(() => {
    dispatch(fetchAllTrips() as any);
    dispatch(fetchCargo() as any);
  }, [dispatch]);

  // Filter my completed trips
  const myCompletedTrips = useMemo(
    () => getCompletedTripsForTransporter(trips, user?.id || user?._id || ''),
    [trips, user?.id, user?._id]
  );

  // Filter my completed cargo
  const transporterId = user?.id || user?._id || '';
  const myCompletedCargo = useMemo(() => {
    return Array.isArray(cargo) ? cargo.filter((cargoItem: any) => {
      const cargoTransporterId = cargoItem.transporterId?._id || cargoItem.transporterId?.id || cargoItem.transporterId;
      return cargoTransporterId === transporterId && cargoItem.status === 'delivered';
    }) : [];
  }, [cargo, transporterId]);

  // Get date range based on period
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (timePeriod) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 86400000) };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: new Date() };
      case 'month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(),
        };
      case 'year':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(),
        };
    }
  };

  // Filter trips by date range
  const filteredTrips = useMemo(() => {
    const { start, end } = getDateRange();
    return myCompletedTrips.filter((trip) => {
      const tripDate = new Date(trip.completedAt || Date.now());
      return tripDate >= start && tripDate <= end;
    });
  }, [myCompletedTrips, timePeriod]);

  // Filter cargo by date range
  const filteredCargo = useMemo(() => {
    const { start, end } = getDateRange();
    return myCompletedCargo.filter((cargoItem: any) => {
      const cargoDate = new Date(cargoItem.updatedAt || Date.now());
      return cargoDate >= start && cargoDate <= end;
    });
  }, [myCompletedCargo, timePeriod]);

  // Calculate statistics from trips and cargo
  const stats = useMemo(() => {
    const totalTrips = filteredTrips.length;
    const totalCargo = filteredCargo.length;
    const tripEarnings = calculateTotalEarnings(filteredTrips);
    const cargoEarnings = filteredCargo.reduce((sum: number, cargoItem: any) => {
      return sum + (cargoItem.shippingCost || 0);
    }, 0);

    const totalEarnings = tripEarnings + cargoEarnings;
    const totalDeliveries = totalTrips + totalCargo;
    const averagePerTrip = totalDeliveries > 0 ? Math.round(totalEarnings / totalDeliveries) : 0;

    return {
      totalTrips,
      totalCargo,
      totalDeliveries,
      totalDistance: 0, // Distance info can be added to Trip type if needed
      totalEarnings,
      tripEarnings,
      cargoEarnings,
      totalFuelCost: 0, // Can be calculated from trip.earnings.fuelCost if available
      netEarnings: totalEarnings,
      averagePerTrip,
      averageDistance: 0,
    };
  }, [filteredTrips, filteredCargo]);

  const periodLabels = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
  };

  const handleRequestPayout = () => {
    if (stats.netEarnings < minimumWithdrawal) {
      showToast.warning(`You need at least ${minimumWithdrawal.toLocaleString()} RWF to request a payout. Your current balance is ${stats.netEarnings.toLocaleString()} RWF.`);
      return;
    }

    setShowPayoutModal(true);
  };

  const handlePayoutSuccess = async (transactionId: string, referenceId: string) => {
    try {
      setShowPayoutModal(false);
      showToast.success(`Payout request for ${stats.netEarnings.toLocaleString()} RWF submitted successfully! Transaction ID: ${referenceId.substring(0, 12)}...`);

      // Refresh trips after a delay
      setTimeout(() => {
        dispatch(fetchAllTrips() as any);
      }, 1000);
    } catch (error) {
      console.error('Error processing payout:', error);
      showToast.error('There was an issue processing your payout request. Please try again.');
    }
  };

  const sidebarNav = [
    { icon: 'cash-outline', label: 'Earnings', screen: 'EarningsDashboard' },
    { icon: 'navigate-outline', label: 'Active Trips', screen: 'ActiveTrips' },
    { icon: 'briefcase-outline', label: 'Available Loads', screen: 'AvailableLoads' },
    { icon: 'star-outline', label: 'Ratings', screen: 'TransporterRatings' },
    { icon: 'time-outline', label: 'History', screen: 'TripHistory' },
  ];

  return (
    <DashboardLayout
      title="Earnings"
      sidebarColor="#0F172A"
      accentColor="#3B82F6"
      backgroundImage={require('../../../assets/images/backimages/transporter.jpg')}
      sidebarNav={sidebarNav}
      userRole="transporter"
      navigation={navigation}
      contentPadding={true}
    >

        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          {(['today', 'week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                timePeriod === period && styles.periodButtonActive,
                timePeriod === period && {
                  backgroundColor: '#10797D',
                },
              ]}
              onPress={() => setTimePeriod(period)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`View earnings for ${periodLabels[period].toLowerCase()}`}
              accessibilityState={{ selected: timePeriod === period }}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  timePeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {periodLabels[period]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Earnings Card */}
        <View
          style={[
            styles.mainCard,
            { backgroundColor: theme.card },
          ]}
        >
          <View style={styles.mainCardContent}>
            <Text style={styles.earningsLabel}>
              Net Earnings
            </Text>
            <Text style={styles.earningsAmount}>
              {stats.netEarnings.toLocaleString()} RWF
            </Text>
            <Text style={styles.earningsSubtext}>
              {stats.totalDeliveries} deliveries ({stats.totalTrips} trips + {stats.totalCargo} cargo) • {stats.totalDistance} km
            </Text>
          </View>
          <View style={styles.mainCardIcon}>
            <Ionicons name="wallet" size={48} color="#D1D5DB" />
          </View>
        </View>

        {/* Payout Button */}
        <TouchableOpacity
          style={[
            styles.payoutButton,
            {
              backgroundColor: stats.netEarnings >= minimumWithdrawal ? '#10797D' : '#ccc',
              opacity: stats.netEarnings >= minimumWithdrawal ? 1 : 0.6,
            },
          ]}
          onPress={handleRequestPayout}
          disabled={stats.netEarnings < minimumWithdrawal}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Request payout of ${stats.netEarnings.toLocaleString()} RWF`}
          accessibilityHint={stats.netEarnings < minimumWithdrawal ? `Minimum payout is ${minimumWithdrawal.toLocaleString()} RWF` : 'Open payout request form'}
          accessibilityState={{ disabled: stats.netEarnings < minimumWithdrawal }}
        >
          <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.payoutButtonText}>
            Request Payout • {stats.netEarnings.toLocaleString()} RWF
          </Text>
        </TouchableOpacity>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#E5E7EB' }]}>
              <Ionicons name="car" size={24} color="#6B7280" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {stats.totalDeliveries}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Deliveries
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#E5E7EB' }]}>
              <Ionicons name="map" size={24} color="#6B7280" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {stats.totalDistance}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Distance (km)
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#E5E7EB' }]}>
              <Ionicons name="cash" size={24} color="#6B7280" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {stats.averagePerTrip.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Avg/Trip
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#E5E7EB' }]}>
              <Ionicons name="flame" size={24} color="#6B7280" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {stats.totalFuelCost.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Fuel Cost
            </Text>
          </View>
        </View>

        {/* Detailed Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            📊 Breakdown
          </Text>
          <View style={[styles.breakdownBox, { backgroundColor: theme.card }]}>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>
                  Trip Earnings ({stats.totalTrips} trips)
                </Text>
                <Text style={[styles.breakdownValue, { color: '#10797D' }]}>
                  +{stats.tripEarnings.toLocaleString()} RWF
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.breakdownRow,
                { borderTopWidth: 1, borderTopColor: theme.border },
              ]}
            >
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>
                  Cargo Earnings ({stats.totalCargo} cargo)
                </Text>
                <Text style={[styles.breakdownValue, { color: '#10797D' }]}>
                  +{stats.cargoEarnings.toLocaleString()} RWF
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.breakdownRow,
                { borderTopWidth: 1, borderTopColor: theme.border },
              ]}
            >
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>
                  Fuel Costs
                </Text>
                <Text style={[styles.breakdownValue, { color: '#F87171' }]}>
                  -{stats.totalFuelCost.toLocaleString()} RWF
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.breakdownRow,
                {
                  borderTopWidth: 2,
                  borderTopColor: theme.tertiary,
                  backgroundColor: theme.tertiary + '10',
                },
              ]}
            >
              <View style={styles.breakdownItem}>
                <Text
                  style={[styles.breakdownLabel, { color: theme.text, fontWeight: 'bold' }]}
                >
                  Net Income
                </Text>
                <Text style={[styles.breakdownValue, { color: theme.tertiary, fontSize: 18 }]}>
                  {stats.netEarnings.toLocaleString()} RWF
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            📈 Performance
          </Text>
          <View style={[styles.metricsBox, { backgroundColor: theme.card }]}>
            <View style={styles.metricRow}>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Average Trip Distance
              </Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {stats.averageDistance} km
              </Text>
            </View>

            <View style={[styles.metricRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Efficiency
              </Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {stats.totalDistance > 0 ? ((stats.netEarnings / stats.totalDistance) * 1000).toFixed(0) : 0} RWF/km
              </Text>
            </View>

            <View style={[styles.metricRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Fuel Efficiency
              </Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {stats.totalTrips > 0 ? (stats.totalFuelCost / stats.totalTrips).toFixed(0) : 0} RWF/trip
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Deliveries (Trips + Cargo) */}
        {(filteredTrips.length > 0 || filteredCargo.length > 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              🚛 Recent Deliveries ({filteredTrips.length + filteredCargo.length})
            </Text>
            {/* Show Recent Trips */}
            {filteredTrips.slice(0, 5).map((trip) => {
              const earnings = trip.earnings?.totalRate || 0;

              return (
                <TouchableOpacity
                  key={`trip-${trip._id || trip.tripId}`}
                  style={[styles.tripCard, { backgroundColor: theme.card }]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Trip: ${trip.shipment?.cropName || 'Delivery'}, ${trip.shipment?.quantity} ${trip.shipment?.unit}`}
                  accessibilityHint={`Earned ${earnings.toLocaleString()} RWF`}
                >
                  <View style={styles.tripLeft}>
                    <View style={[styles.tripIcon, { backgroundColor: '#E5E7EB' }]}>
                      <Ionicons name="car-sport" size={20} color="#6B7280" />
                    </View>
                    <View style={styles.tripInfo}>
                      <Text style={[styles.tripTitle, { color: theme.text }]}>
                        {trip.shipment?.cropName || 'Delivery'} (Trip)
                      </Text>
                      <Text style={[styles.tripDesc, { color: theme.textSecondary }]}>
                        {trip.shipment?.quantity} {trip.shipment?.unit} → {earnings.toLocaleString()} RWF
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.tripEarnings, { color: '#10797D' }]}>
                    +{earnings.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {/* Show Recent Cargo */}
            {filteredCargo.slice(0, 5).map((cargoItem: any) => {
              const earnings = cargoItem.shippingCost || 0;

              return (
                <TouchableOpacity
                  key={`cargo-${cargoItem._id || cargoItem.id}`}
                  style={[styles.tripCard, { backgroundColor: theme.card }]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Cargo: ${cargoItem.name}, ${cargoItem.quantity} ${cargoItem.unit}`}
                  accessibilityHint={`Earned ${earnings.toLocaleString()} RWF`}
                >
                  <View style={styles.tripLeft}>
                    <View style={[styles.tripIcon, { backgroundColor: '#E5E7EB' }]}>
                      <Ionicons name="cube" size={20} color="#6B7280" />
                    </View>
                    <View style={styles.tripInfo}>
                      <Text style={[styles.tripTitle, { color: theme.text }]}>
                        {cargoItem.name} (Cargo)
                      </Text>
                      <Text style={[styles.tripDesc, { color: theme.textSecondary }]}>
                        {cargoItem.quantity} {cargoItem.unit} → {earnings.toLocaleString()} RWF
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.tripEarnings, { color: '#10797D' }]}>
                    +{earnings.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {filteredTrips.length === 0 && filteredCargo.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No earnings yet for {periodLabels[timePeriod].toLowerCase()}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Complete trips and cargo deliveries to earn money
            </Text>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            💡 Tips to Increase Earnings
          </Text>
          <View style={[styles.tipCard, { backgroundColor: theme.card, borderColor: '#E5E7EB' }]}>
            <Ionicons name="bulb" size={20} color="#6B7280" />
            <Text style={[styles.tipText, { color: theme.text }]}>
              Accept longer trips for higher earnings
            </Text>
          </View>
          <View style={[styles.tipCard, { backgroundColor: theme.card, borderColor: '#E5E7EB' }]}>
            <Ionicons name="bulb" size={20} color="#6B7280" />
            <Text style={[styles.tipText, { color: theme.text }]}>
              Complete trips on time to earn bonuses
            </Text>
          </View>
          <View style={[styles.tipCard, { backgroundColor: theme.card, borderColor: '#E5E7EB' }]}>
            <Ionicons name="bulb" size={20} color="#6B7280" />
            <Text style={[styles.tipText, { color: theme.text }]}>
              Maintain your vehicle to reduce fuel costs
            </Text>
          </View>
        </View>

      <PaymentModal
        visible={showPayoutModal}
        amount={stats.netEarnings}
        orderId={`payout_${user?.id || user?._id || 'unknown'}_${Date.now()}`}
        userEmail={user?.email || 'user@example.com'}
        userName={user?.name || 'User'}
        purpose="payout"
        onSuccess={handlePayoutSuccess}
        onCancel={() => setShowPayoutModal(false)}
      />
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 12,
    gap: 8,
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  periodButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  periodButtonTextActive: {
    color: '#374151',
    fontWeight: '600',
  },
  mainCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  mainCardContent: {
    flex: 1,
  },
  mainCardIcon: {
    opacity: 0.1,
  },
  earningsLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
    color: '#6B7280',
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 3,
    color: '#1F2937',
  },
  earningsSubtext: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '23.5%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  breakdownBox: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  breakdownRow: {
    padding: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricsBox: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  tripCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 11,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tripInfo: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  tripDesc: {
    fontSize: 11,
  },
  tripEarnings: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  tipCard: {
    flexDirection: 'row',
    padding: 11,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
  },
  tipText: {
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
  payoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'center',
  },
  payoutButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});