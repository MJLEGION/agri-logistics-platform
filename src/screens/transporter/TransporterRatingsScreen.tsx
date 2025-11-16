import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppSelector } from '../../store';
import * as backendRatingService from '../../services/backendRatingService';
import DashboardLayout from '../../components/layouts/DashboardLayout';

interface Rating {
  _id: string;
  ratedUserId: string;
  ratingUserId: string;
  rating: number;
  comment?: string;
  cleanliness: number;
  professionalism: number;
  timeliness: number;
  communication: number;
  createdAt: string;
  updatedAt: string;
}

export default function TransporterRatingsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0,
  });

  const transporterId = user?.id || user?._id;

  useEffect(() => {
    console.log('TransporterRatingsScreen mounted');
  }, []);

  const fetchRatings = async () => {
    try {
      console.log('[Ratings] Fetching ratings for transporterId:', transporterId, 'type:', typeof transporterId);
      
      if (!transporterId) {
        console.log('[Ratings] No transporterId found');
        setError('No user ID found');
        setLoading(false);
        return;
      }
      
      console.log('[Ratings] Calling backendRatingService.getTransporterRatings');
      const fetchedRatings = await backendRatingService.getTransporterRatings(transporterId);
      console.log('[Ratings] Fetched ratings:', fetchedRatings, 'count:', fetchedRatings?.length);
      
      setRatings(fetchedRatings || []);
      setError(null);

      if (fetchedRatings && fetchedRatings.length > 0) {
        const average = fetchedRatings.reduce((sum, r) => sum + r.rating, 0) / fetchedRatings.length;
        setStats({
          averageRating: parseFloat(average.toFixed(2)),
          totalRatings: fetchedRatings.length,
          fiveStar: fetchedRatings.filter((r) => r.rating === 5).length,
          fourStar: fetchedRatings.filter((r) => r.rating === 4).length,
          threeStar: fetchedRatings.filter((r) => r.rating === 3).length,
          twoStar: fetchedRatings.filter((r) => r.rating === 2).length,
          oneStar: fetchedRatings.filter((r) => r.rating === 1).length,
        });
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ratings');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused');
      setLoading(true);
      fetchRatings();
      return () => {
        console.log('Screen blur');
      };
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRatings();
    setRefreshing(false);
  };

  const renderStarRating = (rating: number) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={{
              fontSize: 16,
              color: star <= rating ? '#FFD700' : '#E0E0E0',
              marginRight: 2,
            }}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  const renderRatingCard = (item: Rating) => (
    <View style={[styles.ratingCard, { backgroundColor: theme.card }]}>
      <View style={styles.ratingHeader}>
        <View style={styles.ratingInfo}>
          <Text style={[styles.farmerName, { color: theme.text }]}>Shipper</Text>
          <Text style={[styles.ratingDate, { color: theme.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.ratingBadge}>
          {renderStarRating(item.rating)}
          <Text style={[styles.ratingNumber, { color: theme.text }]}>
            {item.rating}.0
          </Text>
        </View>
      </View>

      {item.comment && (
        <View style={styles.commentSection}>
          <Text style={[styles.commentText, { color: theme.text }]}>
            {item.comment}
          </Text>
        </View>
      )}

      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Cleanliness</Text>
          <Text style={[styles.metricScore, { color: theme.text }]}>{item.cleanliness}/5</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Professionalism</Text>
          <Text style={[styles.metricScore, { color: theme.text }]}>{item.professionalism}/5</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Timeliness</Text>
          <Text style={[styles.metricScore, { color: theme.text }]}>{item.timeliness}/5</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Communication</Text>
          <Text style={[styles.metricScore, { color: theme.text }]}>{item.communication}/5</Text>
        </View>
      </View>
    </View>
  );

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return '#10B981';
    if (rating >= 3.5) return '#3B82F6';
    if (rating >= 2.5) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={['#F77F00', '#FCBF49']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack?.()) {
                navigation.goBack();
              } else {
                navigation.navigate('Home');
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Ratings & Feedback</Text>
          <View style={{ width: 24 }} />
        </LinearGradient>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  const sidebarNav = [
    { icon: 'briefcase-outline', label: 'Available Loads', screen: 'AvailableLoads' },
    { icon: 'navigate-outline', label: 'Active Trips', screen: 'ActiveTrips' },
    { icon: 'cash-outline', label: 'Earnings', screen: 'EarningsDashboard' },
    { icon: 'star-outline', label: 'Ratings', screen: 'TransporterRatings' },
    { icon: 'time-outline', label: 'History', screen: 'TripHistory' },
  ];

  return (
    <DashboardLayout
      title="My Ratings & Feedback"
      sidebarColor="#0F172A"
      accentColor="#3B82F6"
      backgroundImage={require('../../../assets/images/backimages/transporter.jpg')}
      sidebarNav={sidebarNav}
      userRole="transporter"
      navigation={navigation}
      contentPadding={true}
    >
      <View>
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.error }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {stats.totalRatings > 0 ? (
          <>
            <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Overall Rating
                  </Text>
                  <View style={styles.ratingDisplay}>
                    <Text
                      style={[
                        styles.largeRating,
                        { color: getRatingColor(stats.averageRating) },
                      ]}
                    >
                      {stats.averageRating}
                    </Text>
                    <View>
                      {renderStarRating(Math.round(stats.averageRating))}
                      <Text style={[styles.ratingCount, { color: theme.textSecondary }]}>
                        {stats.totalRatings} ratings
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.distributionContainer, { borderTopColor: theme.border }]}>
                <Text style={[styles.distributionTitle, { color: theme.text }]}>
                  Rating Distribution
                </Text>
                {[
                  { stars: 5, count: stats.fiveStar },
                  { stars: 4, count: stats.fourStar },
                  { stars: 3, count: stats.threeStar },
                  { stars: 2, count: stats.twoStar },
                  { stars: 1, count: stats.oneStar },
                ].map((item) => (
                  <View key={item.stars} style={styles.distributionRow}>
                    <View style={styles.starLabel}>
                      <Text style={[styles.distStarText, { color: theme.text }]}>
                        {item.stars}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#FFD700', marginLeft: 4 }}>★</Text>
                    </View>
                    <View style={[styles.barContainer, { backgroundColor: theme.border }]}>
                      <View
                        style={[
                          styles.bar,
                          {
                            width: `${(item.count / stats.totalRatings) * 100}%`,
                            backgroundColor: getRatingColor(item.stars),
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.distCount, { color: theme.textSecondary }]}>
                      {item.count}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.ratingsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Feedback
              </Text>
              <FlatList
                data={ratings}
                renderItem={({ item }) => renderRatingCard(item)}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Ratings Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Complete your first delivery to receive ratings from shippers
            </Text>
          </View>
        )}
      </View>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsGrid: {
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  largeRating: {
    fontSize: 48,
    fontWeight: '700',
  },
  ratingCount: {
    fontSize: 12,
    marginTop: 4,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  starLabel: {
    width: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distStarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  barContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  distCount: {
    width: 40,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  ratingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ratingInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  ratingDate: {
    fontSize: 12,
  },
  ratingBadge: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  commentSection: {
    marginBottom: 12,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 8,
    borderRadius: 6,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
  },
});
