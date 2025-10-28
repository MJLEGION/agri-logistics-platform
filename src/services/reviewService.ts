/**
 * Review Service
 * Handles comments and feedback from farmers about transporters
 * Features:
 * - Post reviews with comments
 * - Mark reviews as helpful/unhelpful
 * - Flag inappropriate reviews
 * - Reputation tracking for reviewers
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils/validators';

// Types
interface Review {
  id: string;
  ratingId: string; // Links to the rating this review is for
  transporterId: string;
  transporterName: string;
  farmerId: string;
  farmerName: string;
  comment: string;
  helpful: number;
  notHelpful: number;
  flagged: boolean;
  flagReason?: string;
  approved: boolean; // Requires moderation
  createdAt: string;
  updatedAt: string;
}

interface ReviewAnalytics {
  transporterId: string;
  totalReviews: number;
  approvedReviews: number;
  averageHelpfulness: number;
  flaggedCount: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface ReviewerStats {
  farmerId: string;
  reviewCount: number;
  helpfulRatings: number; // How many found their reviews helpful
  reputation: number; // 0-100
}

class ReviewService {
  private STORAGE_KEY_REVIEWS = 'agri_reviews';
  private STORAGE_KEY_REVIEW_ANALYTICS = 'agri_review_analytics';
  private STORAGE_KEY_REVIEWER_STATS = 'agri_reviewer_stats';
  private STORAGE_KEY_FLAGGED_REVIEWS = 'agri_flagged_reviews';

  // Keywords for sentiment analysis
  private POSITIVE_KEYWORDS = [
    'excellent',
    'great',
    'good',
    'reliable',
    'professional',
    'helpful',
    'punctual',
    'safe',
    'clean',
    'friendly'
  ];
  private NEGATIVE_KEYWORDS = [
    'bad',
    'poor',
    'terrible',
    'unreliable',
    'rude',
    'late',
    'damaged',
    'dirty',
    'unprofessional',
    'slow'
  ];

  /**
   * Create a review for a transporter
   */
  async createReview(
    ratingId: string,
    transporterId: string,
    transporterName: string,
    farmerId: string,
    farmerName: string,
    comment: string
  ): Promise<{ success: boolean; data?: Review; error?: string }> {
    try {
      // Validate comment
      if (!comment || comment.trim().length < 10) {
        return {
          success: false,
          error: 'Comment must be at least 10 characters'
        };
      }

      if (comment.length > 1000) {
        return {
          success: false,
          error: 'Comment cannot exceed 1000 characters'
        };
      }

      // Check for duplicate review
      const existing = await this.getReviewForRating(ratingId);
      if (existing) {
        return {
          success: false,
          error: 'Review already exists for this rating'
        };
      }

      // Create review
      const review: Review = {
        id: generateId('rev'),
        ratingId,
        transporterId,
        transporterName,
        farmerId,
        farmerName,
        comment,
        helpful: 0,
        notHelpful: 0,
        flagged: false,
        approved: false, // Requires moderation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store review
      const reviews = await this.getAllReviews();
      reviews.push(review);
      await AsyncStorage.setItem(this.STORAGE_KEY_REVIEWS, JSON.stringify(reviews));

      // Update reviewer stats
      await this.updateReviewerStats(farmerId);

      // Update analytics
      await this.updateAnalytics(transporterId);

      // Check for inappropriate content
      await this.checkContentModeration(review.id, comment);

      return { success: true, data: review };
    } catch (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create review'
      };
    }
  }

  /**
   * Get review for a specific rating
   */
  async getReviewForRating(ratingId: string): Promise<Review | null> {
    try {
      const reviews = await this.getAllReviews();
      return reviews.find(r => r.ratingId === ratingId) || null;
    } catch (error) {
      console.error('Error getting review:', error);
      return null;
    }
  }

  /**
   * Get all reviews for a transporter
   */
  async getTransporterReviews(
    transporterId: string,
    onlyApproved: boolean = true,
    limit: number = 50
  ): Promise<Review[]> {
    try {
      const reviews = await this.getAllReviews();
      return reviews
        .filter(
          r =>
            r.transporterId === transporterId &&
            (!onlyApproved || r.approved)
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting transporter reviews:', error);
      return [];
    }
  }

  /**
   * Get reviews by a farmer
   */
  async getFarmerReviews(farmerId: string): Promise<Review[]> {
    try {
      const reviews = await this.getAllReviews();
      return reviews.filter(r => r.farmerId === farmerId);
    } catch (error) {
      console.error('Error getting farmer reviews:', error);
      return [];
    }
  }

  /**
   * Get all reviews
   */
  async getAllReviews(): Promise<Review[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_REVIEWS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all reviews:', error);
      return [];
    }
  }

  /**
   * Get a single review
   */
  async getReview(reviewId: string): Promise<Review | null> {
    try {
      const reviews = await this.getAllReviews();
      return reviews.find(r => r.id === reviewId) || null;
    } catch (error) {
      console.error('Error getting review:', error);
      return null;
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<{ success: boolean }> {
    try {
      const reviews = await this.getAllReviews();
      const review = reviews.find(r => r.id === reviewId);

      if (!review) {
        return { success: false };
      }

      review.helpful += 1;
      review.updatedAt = new Date().toISOString();

      await AsyncStorage.setItem(this.STORAGE_KEY_REVIEWS, JSON.stringify(reviews));

      // Update reviewer stats
      await this.updateReviewerStats(review.farmerId);

      // Update analytics
      await this.updateAnalytics(review.transporterId);

      return { success: true };
    } catch (error) {
      console.error('Error marking helpful:', error);
      return { success: false };
    }
  }

  /**
   * Mark review as not helpful
   */
  async markNotHelpful(reviewId: string): Promise<{ success: boolean }> {
    try {
      const reviews = await this.getAllReviews();
      const review = reviews.find(r => r.id === reviewId);

      if (!review) {
        return { success: false };
      }

      review.notHelpful += 1;
      review.updatedAt = new Date().toISOString();

      await AsyncStorage.setItem(this.STORAGE_KEY_REVIEWS, JSON.stringify(reviews));

      // Update analytics
      await this.updateAnalytics(review.transporterId);

      return { success: true };
    } catch (error) {
      console.error('Error marking not helpful:', error);
      return { success: false };
    }
  }

  /**
   * Flag review as inappropriate
   */
  async flagReview(
    reviewId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const reviews = await this.getAllReviews();
      const review = reviews.find(r => r.id === reviewId);

      if (!review) {
        return { success: false, error: 'Review not found' };
      }

      review.flagged = true;
      review.flagReason = reason;
      review.updatedAt = new Date().toISOString();

      await AsyncStorage.setItem(this.STORAGE_KEY_REVIEWS, JSON.stringify(reviews));

      // Store flagged review for moderation
      await this.addFlaggedReview(reviewId, reason);

      return { success: true };
    } catch (error) {
      console.error('Error flagging review:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to flag review'
      };
    }
  }

  /**
   * Approve a review (admin function)
   */
  async approveReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const reviews = await this.getAllReviews();
      const review = reviews.find(r => r.id === reviewId);

      if (!review) {
        return { success: false, error: 'Review not found' };
      }

      review.approved = true;
      review.flagged = false; // Clear flag if approved
      review.updatedAt = new Date().toISOString();

      await AsyncStorage.setItem(this.STORAGE_KEY_REVIEWS, JSON.stringify(reviews));

      // Remove from flagged if present
      const flagged = await this.getFlaggedReviews();
      const filtered = flagged.filter(f => f.reviewId !== reviewId);
      await AsyncStorage.setItem(
        this.STORAGE_KEY_FLAGGED_REVIEWS,
        JSON.stringify(filtered)
      );

      return { success: true };
    } catch (error) {
      console.error('Error approving review:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve review'
      };
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const reviews = await this.getAllReviews();
      const index = reviews.findIndex(r => r.id === reviewId);

      if (index === -1) {
        return { success: false, error: 'Review not found' };
      }

      const review = reviews[index];
      reviews.splice(index, 1);

      await AsyncStorage.setItem(this.STORAGE_KEY_REVIEWS, JSON.stringify(reviews));

      // Update analytics
      await this.updateAnalytics(review.transporterId);

      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete review'
      };
    }
  }

  /**
   * Update review analytics for a transporter
   */
  async updateAnalytics(transporterId: string): Promise<ReviewAnalytics | null> {
    try {
      const reviews = await this.getTransporterReviews(transporterId, false);

      if (reviews.length === 0) {
        return null;
      }

      // Calculate sentiment
      const sentiment = {
        positive: 0,
        neutral: 0,
        negative: 0
      };

      reviews.forEach(review => {
        const sentiment_score = this.analyzeSentiment(review.comment);
        if (sentiment_score > 0.3) {
          sentiment.positive++;
        } else if (sentiment_score < -0.3) {
          sentiment.negative++;
        } else {
          sentiment.neutral++;
        }
      });

      // Calculate helpfulness
      const totalHelpful = reviews.reduce((sum, r) => sum + r.helpful, 0);
      const averageHelpfulness = reviews.length > 0 ? totalHelpful / reviews.length : 0;

      // Create analytics
      const analytics: ReviewAnalytics = {
        transporterId,
        totalReviews: reviews.length,
        approvedReviews: reviews.filter(r => r.approved).length,
        averageHelpfulness: parseFloat(averageHelpfulness.toFixed(2)),
        flaggedCount: reviews.filter(r => r.flagged).length,
        sentiment
      };

      // Store analytics
      const allAnalytics = await this.getAllAnalytics();
      const index = allAnalytics.findIndex(
        a => a.transporterId === transporterId
      );

      if (index >= 0) {
        allAnalytics[index] = analytics;
      } else {
        allAnalytics.push(analytics);
      }

      await AsyncStorage.setItem(
        this.STORAGE_KEY_REVIEW_ANALYTICS,
        JSON.stringify(allAnalytics)
      );

      return analytics;
    } catch (error) {
      console.error('Error updating analytics:', error);
      return null;
    }
  }

  /**
   * Get analytics for a transporter
   */
  async getAnalytics(transporterId: string): Promise<ReviewAnalytics | null> {
    try {
      const allAnalytics = await this.getAllAnalytics();
      return allAnalytics.find(a => a.transporterId === transporterId) || null;
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }

  /**
   * Get all analytics
   */
  async getAllAnalytics(): Promise<ReviewAnalytics[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_REVIEW_ANALYTICS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all analytics:', error);
      return [];
    }
  }

  /**
   * Update reviewer statistics
   */
  async updateReviewerStats(farmerId: string): Promise<ReviewerStats | null> {
    try {
      const reviews = await this.getFarmerReviews(farmerId);

      if (reviews.length === 0) {
        return null;
      }

      // Calculate helpful ratings
      const helpfulRatings = reviews.reduce((sum, r) => sum + r.helpful, 0);

      // Calculate reputation (0-100)
      const reputation = Math.min(
        100,
        reviews.length * 2 + helpfulRatings * 3
      );

      const stats: ReviewerStats = {
        farmerId,
        reviewCount: reviews.length,
        helpfulRatings,
        reputation: reputation
      };

      // Store stats
      const allStats = await this.getAllReviewerStats();
      const index = allStats.findIndex(s => s.farmerId === farmerId);

      if (index >= 0) {
        allStats[index] = stats;
      } else {
        allStats.push(stats);
      }

      await AsyncStorage.setItem(
        this.STORAGE_KEY_REVIEWER_STATS,
        JSON.stringify(allStats)
      );

      return stats;
    } catch (error) {
      console.error('Error updating reviewer stats:', error);
      return null;
    }
  }

  /**
   * Get reviewer statistics
   */
  async getReviewerStats(farmerId: string): Promise<ReviewerStats | null> {
    try {
      const allStats = await this.getAllReviewerStats();
      return allStats.find(s => s.farmerId === farmerId) || null;
    } catch (error) {
      console.error('Error getting reviewer stats:', error);
      return null;
    }
  }

  /**
   * Get all reviewer statistics
   */
  async getAllReviewerStats(): Promise<ReviewerStats[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_REVIEWER_STATS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all reviewer stats:', error);
      return [];
    }
  }

  /**
   * Analyze sentiment of review comment
   * Returns score between -1 (negative) and 1 (positive)
   */
  private analyzeSentiment(comment: string): number {
    const text = comment.toLowerCase();
    let score = 0;

    // Count positive keywords
    this.POSITIVE_KEYWORDS.forEach(keyword => {
      const count = (text.match(new RegExp(keyword, 'g')) || []).length;
      score += count * 0.5;
    });

    // Count negative keywords
    this.NEGATIVE_KEYWORDS.forEach(keyword => {
      const count = (text.match(new RegExp(keyword, 'g')) || []).length;
      score -= count * 0.5;
    });

    // Normalize to -1 to 1
    return Math.max(-1, Math.min(1, score / 5));
  }

  /**
   * Check content for moderation
   */
  private async checkContentModeration(
    reviewId: string,
    comment: string
  ): Promise<void> {
    try {
      // Simple profanity/spam check
      const inappropriatePatterns = [
        /hate|racist|sexist/gi,
        /spam|scam|fraud/gi,
        /contact|whatsapp|email/gi // Links to external contact
      ];

      let flagged = false;
      let reason = '';

      for (const pattern of inappropriatePatterns) {
        if (pattern.test(comment)) {
          flagged = true;
          reason = 'Potentially inappropriate content detected';
          break;
        }
      }

      if (flagged) {
        await this.flagReview(reviewId, reason);
      }
    } catch (error) {
      console.error('Error checking content moderation:', error);
    }
  }

  /**
   * Add to flagged reviews
   */
  private async addFlaggedReview(
    reviewId: string,
    reason: string
  ): Promise<void> {
    try {
      const flagged = await this.getFlaggedReviews();
      flagged.push({
        reviewId,
        reason,
        flaggedAt: new Date().toISOString()
      });

      await AsyncStorage.setItem(
        this.STORAGE_KEY_FLAGGED_REVIEWS,
        JSON.stringify(flagged)
      );
    } catch (error) {
      console.error('Error adding flagged review:', error);
    }
  }

  /**
   * Get all flagged reviews for moderation
   */
  async getFlaggedReviews(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(
        this.STORAGE_KEY_FLAGGED_REVIEWS
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting flagged reviews:', error);
      return [];
    }
  }

  /**
   * Get most helpful reviews
   */
  async getMostHelpfulReviews(
    transporterId: string,
    limit: number = 10
  ): Promise<Review[]> {
    try {
      const reviews = await this.getTransporterReviews(transporterId, true);
      return reviews
        .sort(
          (a, b) =>
            b.helpful - a.helpful ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting most helpful reviews:', error);
      return [];
    }
  }

  /**
   * Clear all reviews (for testing/reset)
   */
  async clearAllReviews(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY_REVIEWS);
      await AsyncStorage.removeItem(this.STORAGE_KEY_REVIEW_ANALYTICS);
      await AsyncStorage.removeItem(this.STORAGE_KEY_REVIEWER_STATS);
      await AsyncStorage.removeItem(this.STORAGE_KEY_FLAGGED_REVIEWS);
    } catch (error) {
      console.error('Error clearing reviews:', error);
    }
  }
}

export const reviewService = new ReviewService();
export type { Review, ReviewAnalytics, ReviewerStats };