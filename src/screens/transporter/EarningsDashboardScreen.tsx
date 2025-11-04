// src/screens/transporter/EarningsDashboardScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
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
import PaymentModal from '../../components/PaymentModal';

type TimePeriod = 'today' | 'week' | 'month' | 'year';

export default function EarningsDashboardScreen({ navigation }: any) {
  const { user } = useAppSelector((state) => state.auth);
  const { trips } = useAppSelector((state) => state.trips);
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [minimumWithdrawal] = useState(5000); // Minimum withdrawal amount

  // Fetch trips when screen loads
  useEffect(() => {
    dispatch(fetchAllTrips() as any);
  }, [dispatch]);

  // Filter my completed trips
  const myCompletedTrips = useMemo(
    () => getCompletedTripsForTransporter(trips, user?.id || user?._id || ''),
    [trips, user?.id, user?._id]
  );

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

  // Calculate statistics from trips
  const stats = useMemo(() => {
    const totalTrips = filteredTrips.length;
    const totalEarnings = calculateTotalEarnings(filteredTrips);
    const averagePerTrip = totalTrips > 0 ? Math.round(totalEarnings / totalTrips) : 0;

    return {
      totalTrips,
      totalDistance: 0, // Distance info can be added to Trip type if needed
      totalEarnings,
      totalFuelCost: 0, // Can be calculated from trip.earnings.fuelCost if available
      netEarnings: totalEarnings,
      averagePerTrip,
      averageDistance: 0,
    };
  }, [filteredTrips]);

  const periodLabels = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
  };

  const handleRequestPayout = () => {
    if (stats.netEarnings < minimumWithdrawal) {
      Alert.alert(
        'Insufficient Balance',
        `You need at least ${minimumWithdrawal.toLocaleString()} RWF to request a payout. Your current balance is ${stats.netEarnings.toLocaleString()} RWF.`,
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    setShowPayoutModal(true);
  };

  const handlePayoutSuccess = async (transactionId: string, referenceId: string) => {
    try {
      setShowPayoutModal(false);
      Alert.alert(
        '✅ Payout Request Successful!',
        `Your request for ${stats.netEarnings.toLocaleString()} RWF has been submitted.\n\nTransaction ID: ${referenceId.substring(0, 12)}...\n\nYou should receive the funds within 1-2 business days.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Could navigate to a transaction history or refresh
              dispatch(fetchAllTrips() as any);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error processing payout:', error);
      Alert.alert('Error', 'There was an issue processing your payout request. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        {/* Header */}
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>💰 Earnings Dashboard</Text>
        </LinearGradient>

        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          {(['today', 'week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                timePeriod === period && styles.periodButtonActive,
                timePeriod === period && {
                  backgroundColor: '#F59E0B',
                },
              ]}
              onPress={() => setTimePeriod(period)}
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
              {stats.totalTrips} trips • {stats.totalDistance} km
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
              backgroundColor: stats.netEarnings >= minimumWithdrawal ? '#F59E0B' : '#ccc',
              opacity: stats.netEarnings >= minimumWithdrawal ? 1 : 0.6,
            },
          ]}
          onPress={handleRequestPayout}
          disabled={stats.netEarnings < minimumWithdrawal}
        >
          <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.payoutButtonText}>
            Request Payout • {stats.netEarnings.toLocaleString()} RWF
          </Text>
        </TouchableOpacity>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#3B82F6' + '20' }]}>
              <Ionicons name="car" size={24} color="#3B82F6" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {stats.totalTrips}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Trips
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#10B981' + '20' }]}>
              <Ionicons name="map" size={24} color="#10B981" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {stats.totalDistance}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Distance (km)
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#F59E0B' + '20' }]}>
              <Ionicons name="cash" size={24} color="#F59E0B" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {stats.averagePerTrip.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Avg/Trip
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIconBox, { backgroundColor: '#EC4899' + '20' }]}>
              <Ionicons name="flame" size={24} color="#EC4899" />
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
                  Gross Earnings
                </Text>
                <Text style={[styles.breakdownValue, { color: '#10B981' }]}>
                  +{stats.totalEarnings.toLocaleString()} RWF
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

        {/* Recent Trips */}
        {filteredTrips.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              🚛 Recent Trips ({filteredTrips.length})
            </Text>
            {filteredTrips.slice(0, 5).map((trip) => {
              const earnings = trip.earnings?.totalRate || 0;

              return (
                <TouchableOpacity
                  key={trip._id || trip.tripId}
                  style={[styles.tripCard, { backgroundColor: theme.card }]}
                >
                  <View style={styles.tripLeft}>
                    <View style={[styles.tripIcon, { backgroundColor: '#3B82F6' + '20' }]}>
                      <Ionicons name="car-sport" size={20} color="#3B82F6" />
                    </View>
                    <View style={styles.tripInfo}>
                      <Text style={[styles.tripTitle, { color: theme.text }]}>
                        {trip.shipment?.cropName || 'Delivery'}
                      </Text>
                      <Text style={[styles.tripDesc, { color: theme.textSecondary }]}>
                        {trip.shipment?.quantity} {trip.shipment?.unit} → {earnings.toLocaleString()} RWF
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.tripEarnings, { color: '#10B981' }]}>
                    +{earnings.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {filteredTrips.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No earnings yet for {periodLabels[timePeriod].toLowerCase()}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Complete trips to earn money
            </Text>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            💡 Tips to Increase Earnings
          </Text>
          <View style={[styles.tipCard, { backgroundColor: '#10B981' + '10', borderColor: '#10B981' }]}>
            <Ionicons name="bulb" size={20} color="#10B981" />
            <Text style={[styles.tipText, { color: theme.text }]}>
              Accept longer trips for higher earnings
            </Text>
          </View>
          <View style={[styles.tipCard, { backgroundColor: '#F59E0B' + '10', borderColor: '#F59E0B' }]}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={[styles.tipText, { color: theme.text }]}>
              Complete trips on time to earn bonuses
            </Text>
          </View>
          <View style={[styles.tipCard, { backgroundColor: '#3B82F6' + '10', borderColor: '#3B82F6' }]}>
            <Ionicons name="bulb" size={20} color="#3B82F6" />
            <Text style={[styles.tipText, { color: theme.text }]}>
              Maintain your vehicle to reduce fuel costs
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Payout Modal */}
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
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
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