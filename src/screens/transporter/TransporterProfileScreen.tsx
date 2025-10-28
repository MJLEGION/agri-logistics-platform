import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Share,
  Platform,
} from 'react-native';
import { ratingService } from '../../services/ratingService';
import { reviewService } from '../../services/reviewService';
import { useRoute, useNavigation } from '@react-navigation/native';

interface TransporterStats {
  transporterId: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
  onTimePercentage: number;
  completionPercentage: number;
  totalDeliveries: number;
  isVerified: boolean;
  verifiedBadge?: {
    badgeType: 'gold' | 'silver' | 'bronze';
    earnedDate: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  farmerName: string;
  createdAt: string;
  helpfulCount: number;
  unhelpfulCount: number;
  isApproved: boolean;
}

const TransporterProfileScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route?.params as { transporterId: string; transporterName?: string };

  const [stats, setStats] = useState<TransporterStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [reviewPage, setReviewPage] = useState(0);

  const transporterId = params?.transporterId;

  const loadData = useCallback(async () => {
    if (!transporterId) {
      console.error('No transporterId provided');
      return;
    }

    try {
      const [statsData, reviewsData] = await Promise.all([
        ratingService.getTransporterStats(transporterId),
        reviewService.getTransporterReviews(transporterId, reviewPage),
      ]);

      setStats(statsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading transporter profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [transporterId, reviewPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out ${params?.transporterName || 'this transporter'} on Agri-Logistics! ${stats?.averageRating}⭐ rated with ${stats?.totalRatings} deliveries. ${stats?.isVerified ? `Verified ${stats?.verifiedBadge?.badgeType} member!` : ''}`,
        title: `${params?.transporterName || 'Transporter'} Profile`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return '#4CAF50'; // Green
    if (rating >= 4) return '#2196F3'; // Blue
    if (rating >= 3) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getBadgeEmoji = (badgeType?: string): string => {
    switch (badgeType) {
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '';
    }
  };

  const getBadgeColor = (badgeType?: string): string => {
    switch (badgeType) {
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      case 'bronze':
        return '#CD7F32';
      default:
        return '#999';
    }
  };

  const getRatingDistributionPercentage = (count: number): number => {
    if (!stats || stats.totalRatings === 0) return 0;
    return (count / stats.totalRatings) * 100;
  };

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'positive':
        return '#4CAF50';
      case 'negative':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getSentimentEmoji = (sentiment: string): string => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😞';
      default:
        return '😐';
    }
  };

  const RatingDistributionBar = ({ rating, count }: { rating: number; count: number }) => {
    const percentage = getRatingDistributionPercentage(count);
    return (
      <View style={styles.distributionItem}>
        <View style={styles.distributionLabel}>
          <Text style={styles.distributionStar}>{'★'.repeat(rating)}</Text>
          <Text style={styles.distributionCount}>{count}</Text>
        </View>
        <View style={styles.distributionBar}>
          <View
            style={[
              styles.distributionFill,
              { width: `${percentage}%`, backgroundColor: getRatingColor(rating) },
            ]}
          />
        </View>
        <Text style={styles.distributionPercentage}>{percentage.toFixed(0)}%</Text>
      </View>
    );
  };

  const ReviewCard = ({ review }: { review: Review }) => {
    const isExpanded = expandedReviewId === review.id;
    const shouldTruncate = !isExpanded && review.comment && review.comment.length > 100;

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewMeta}>
            <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}</Text>
            <Text style={styles.reviewerName}>{review.farmerName}</Text>
          </View>
          <Text style={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.sentimentBadge}>
          <Text style={styles.sentimentEmoji}>{getSentimentEmoji(review.sentiment)}</Text>
          <Text
            style={[
              styles.sentimentText,
              { color: getSentimentColor(review.sentiment) },
            ]}
          >
            {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
          </Text>
        </View>

        {review.comment && (
          <View>
            <Text style={styles.reviewComment}>
              {shouldTruncate ? `${review.comment.substring(0, 100)}...` : review.comment}
            </Text>
            {shouldTruncate && (
              <TouchableOpacity onPress={() => setExpandedReviewId(isExpanded ? null : review.id)}>
                <Text style={styles.readMoreLink}>{isExpanded ? 'Show less' : 'Read more'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.reviewFooter}>
          <View style={styles.helpfulContainer}>
            <TouchableOpacity style={styles.helpfulButton}>
              <Text style={styles.helpfulButtonText}>👍 {review.helpfulCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpfulButton}>
              <Text style={styles.helpfulButtonText}>👎 {review.unhelpfulCount}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!review.isApproved && (
          <View style={styles.awaitingApprovalBanner}>
            <Text style={styles.awaitingApprovalText}>⏳ Awaiting approval</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ Unable to load transporter profile</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            loadData();
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header with Badge */}
      <View style={styles.headerSection}>
        {stats.isVerified && stats.verifiedBadge && (
          <View
            style={[
              styles.badgeContainer,
              { borderColor: getBadgeColor(stats.verifiedBadge.badgeType) },
            ]}
          >
            <Text style={styles.badgeEmoji}>
              {getBadgeEmoji(stats.verifiedBadge.badgeType)}
            </Text>
            <Text style={styles.badgeText}>
              {stats.verifiedBadge.badgeType.toUpperCase()} VERIFIED
            </Text>
          </View>
        )}

        <Text style={styles.transporterName}>{params?.transporterName || 'Transporter'}</Text>

        {/* Main Rating */}
        <View style={styles.mainRatingContainer}>
          <Text style={[styles.mainRating, { color: getRatingColor(stats.averageRating) }]}>
            {stats.averageRating.toFixed(1)}
          </Text>
          <View style={styles.ratingDetails}>
            <Text style={styles.ratingStars}>
              {'★'.repeat(Math.round(stats.averageRating))}
            </Text>
            <Text style={styles.ratingCount}>Based on {stats.totalRatings} ratings</Text>
          </View>
        </View>

        {/* Key Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.completionPercentage}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.onTimePercentage}%</Text>
            <Text style={styles.statLabel}>On-Time</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.totalDeliveries}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShareProfile}>
          <Text style={styles.shareButtonText}>📤 Share Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Rating Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rating Distribution</Text>
        <View style={styles.distributionContainer}>
          <RatingDistributionBar rating={5} count={stats.ratingDistribution.fiveStar} />
          <RatingDistributionBar rating={4} count={stats.ratingDistribution.fourStar} />
          <RatingDistributionBar rating={3} count={stats.ratingDistribution.threeStar} />
          <RatingDistributionBar rating={2} count={stats.ratingDistribution.twoStar} />
          <RatingDistributionBar rating={1} count={stats.ratingDistribution.oneStar} />
        </View>
      </View>

      {/* Verification Badge Info */}
      {stats.isVerified && stats.verifiedBadge && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Verification Badge</Text>
          <View
            style={[
              styles.badgeInfoBox,
              { borderLeftColor: getBadgeColor(stats.verifiedBadge.badgeType) },
            ]}
          >
            <Text style={styles.badgeInfoText}>
              This transporter earned a{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {stats.verifiedBadge.badgeType.toUpperCase()}
              </Text>{' '}
              verification badge on {new Date(stats.verifiedBadge.earnedDate).toLocaleDateString()}{' '}
              for consistently excellent service.
            </Text>
            <Text style={styles.badgeInfoSubtext}>
              {stats.verifiedBadge.badgeType === 'gold' &&
                '🥇 Premium service with exceptional ratings'}
              {stats.verifiedBadge.badgeType === 'silver' &&
                '🥈 Reliable service with strong ratings'}
              {stats.verifiedBadge.badgeType === 'bronze' &&
                '🥉 Consistent service with good ratings'}
            </Text>
          </View>
        </View>
      )}

      {/* Recent Reviews */}
      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {reviews.length > 0 && (
            <Text style={styles.reviewCount}>{reviews.length} reviews</Text>
          )}
        </View>

        {reviews.length === 0 ? (
          <View style={styles.noReviewsContainer}>
            <Text style={styles.noReviewsText}>No reviews yet</Text>
            <Text style={styles.noReviewsSubtext}>
              Be the first to review this transporter
            </Text>
          </View>
        ) : (
          <View>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {reviews.length > 0 && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() => setReviewPage(reviewPage + 1)}
              >
                <Text style={styles.loadMoreButtonText}>Load More Reviews</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Leave Review Button */}
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity style={styles.leaveReviewButton}>
          <Text style={styles.leaveReviewButtonText}>✍️ Leave a Review</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  badgeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  transporterName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  mainRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainRating: {
    fontSize: 48,
    fontWeight: '700',
    marginRight: 12,
  },
  ratingDetails: {
    flex: 1,
  },
  ratingStars: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 4,
  },
  ratingCount: {
    fontSize: 13,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    marginHorizontal: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  distributionContainer: {
    marginTop: 8,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distributionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  distributionStar: {
    fontSize: 12,
    color: '#FFD700',
    marginRight: 4,
  },
  distributionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    minWidth: 24,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: 4,
  },
  distributionPercentage: {
    fontSize: 11,
    color: '#666',
    minWidth: 35,
    textAlign: 'right',
    fontWeight: '500',
  },
  badgeInfoBox: {
    backgroundColor: '#F5F5F5',
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  badgeInfoText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  badgeInfoSubtext: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  noReviewsContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  noReviewsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  noReviewsSubtext: {
    fontSize: 12,
    color: '#999',
  },
  reviewCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewRating: {
    fontSize: 12,
    color: '#FFD700',
    marginRight: 8,
    fontWeight: 'bold',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  sentimentEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  sentimentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
    marginBottom: 8,
  },
  readMoreLink: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 8,
  },
  reviewFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTopVertical: 8,
  },
  helpfulContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  helpfulButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  helpfulButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  awaitingApprovalBanner: {
    backgroundColor: '#FFF3CD',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FBC02D',
  },
  awaitingApprovalText: {
    fontSize: 11,
    color: '#856404',
    fontWeight: '600',
  },
  loadMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loadMoreButtonText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
  actionButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  leaveReviewButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveReviewButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default TransporterProfileScreen;