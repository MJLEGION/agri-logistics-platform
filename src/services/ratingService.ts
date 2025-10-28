/**
 * Rating Service
 * Handles transporter ratings and reviews by farmers
 * Features:
 * - 1-5 star ratings
 * - Review comments/feedback
 * - Verified badge management
 * - Rating analytics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils/validators';

// Types
interface Rating {
  id: string;
  transactionId: string;
  transporterId: string;
  farmerId: string;
  farmerName: string;
  rating: number; // 1-5 stars
  comment?: string;
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
  helpful?: number; // How many found this helpful
  verified?: boolean; // Is this from verified transaction
}

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
  isVerified: boolean;
  verifiedBadge?: {
    badgeType: 'gold' | 'silver' | 'bronze';
    criteriasMet: string[];
    verifiedDate: string;
    verifiedBy: string;
  };
  totalDeliveries: number;
  onTimeRate: number; // Percentage
  completionRate: number; // Percentage
  lastRatingDate?: string;
}

interface Review {
  id: string;
  ratingId: string;
  farmerId: string;
  farmerName: string;
  transporterId: string;
  comment: string;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
}

interface VerificationCriteria {
  minRating: number; // e.g., 4.5
  minDeliveries: number; // e.g., 50
  onTimeRate: number; // e.g., 95%
  completionRate: number; // e.g., 98%
  noDisputes: boolean;
  badgeType: 'gold' | 'silver' | 'bronze';
}

class RatingService {
  private STORAGE_KEY_RATINGS = 'agri_ratings';
  private STORAGE_KEY_TRANSPORTER_STATS = 'agri_transporter_stats';
  private STORAGE_KEY_VERIFIED_TRANSPORTERS = 'agri_verified_transporters';
  private STORAGE_KEY_REVIEWS = 'agri_reviews';

  /**
   * Create a rating for a transporter after delivery
   */
  async createRating(
    transactionId: string,
    transporterId: string,
    farmerId: string,
    farmerName: string,
    rating: number,
    comment?: string
  ): Promise<{ success: boolean; data?: Rating; error?: string }> {
    try {
      // Validate rating
      if (rating < 1 || rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5' };
      }

      // Check if already rated
      const existingRating = await this.getTransactionRating(transactionId);
      if (existingRating) {
        return {
          success: false,
          error: 'This transaction has already been rated'
        };
      }

      // Create rating object
      const ratingObj: Rating = {
        id: generateId('rat'),
        transactionId,
        transporterId,
        farmerId,
        farmerName,
        rating,
        comment: comment?.substring(0, 500), // Max 500 chars
        deliveryDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        helpful: 0,
        verified: true // Assuming all ratings come from verified transactions
      };

      // Store rating
      const ratings = await this.getAllRatings();
      ratings.push(ratingObj);
      await AsyncStorage.setItem(
        this.STORAGE_KEY_RATINGS,
        JSON.stringify(ratings)
      );

      // Update transporter stats
      await this.updateTransporterStats(transporterId);

      // Check if should get verified badge
      await this.checkAndUpdateVerification(transporterId);

      return { success: true, data: ratingObj };
    } catch (error) {
      console.error('Error creating rating:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create rating'
      };
    }
  }

  /**
   * Update an existing rating
   */
  async updateRating(
    ratingId: string,
    updates: Partial<Rating>
  ): Promise<{ success: boolean; data?: Rating; error?: string }> {
    try {
      const ratings = await this.getAllRatings();
      const index = ratings.findIndex(r => r.id === ratingId);

      if (index === -1) {
        return { success: false, error: 'Rating not found' };
      }

      // Update rating
      const updated: Rating = {
        ...ratings[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Validate rating value if changed
      if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
        return { success: false, error: 'Rating must be between 1 and 5' };
      }

      ratings[index] = updated;
      await AsyncStorage.setItem(
        this.STORAGE_KEY_RATINGS,
        JSON.stringify(ratings)
      );

      // Update stats if rating changed
      if (updates.rating) {
        await this.updateTransporterStats(ratings[index].transporterId);
      }

      return { success: true, data: updated };
    } catch (error) {
      console.error('Error updating rating:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update rating'
      };
    }
  }

  /**
   * Get a single rating by ID
   */
  async getRating(ratingId: string): Promise<Rating | null> {
    try {
      const ratings = await this.getAllRatings();
      return ratings.find(r => r.id === ratingId) || null;
    } catch (error) {
      console.error('Error getting rating:', error);
      return null;
    }
  }

  /**
   * Get rating for a specific transaction
   */
  async getTransactionRating(transactionId: string): Promise<Rating | null> {
    try {
      const ratings = await this.getAllRatings();
      return ratings.find(r => r.transactionId === transactionId) || null;
    } catch (error) {
      console.error('Error getting transaction rating:', error);
      return null;
    }
  }

  /**
   * Get all ratings for a transporter
   */
  async getTransporterRatings(
    transporterId: string,
    limit: number = 50
  ): Promise<Rating[]> {
    try {
      const ratings = await this.getAllRatings();
      return ratings
        .filter(r => r.transporterId === transporterId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting transporter ratings:', error);
      return [];
    }
  }

  /**
   * Get all ratings by a farmer
   */
  async getFarmerRatings(farmerId: string): Promise<Rating[]> {
    try {
      const ratings = await this.getAllRatings();
      return ratings.filter(r => r.farmerId === farmerId);
    } catch (error) {
      console.error('Error getting farmer ratings:', error);
      return [];
    }
  }

  /**
   * Get all ratings
   */
  async getAllRatings(): Promise<Rating[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_RATINGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all ratings:', error);
      return [];
    }
  }

  /**
   * Mark a rating as helpful
   */
  async markHelpful(ratingId: string): Promise<{ success: boolean }> {
    try {
      const ratings = await this.getAllRatings();
      const rating = ratings.find(r => r.id === ratingId);

      if (!rating) {
        return { success: false };
      }

      rating.helpful = (rating.helpful || 0) + 1;
      await AsyncStorage.setItem(
        this.STORAGE_KEY_RATINGS,
        JSON.stringify(ratings)
      );

      return { success: true };
    } catch (error) {
      console.error('Error marking helpful:', error);
      return { success: false };
    }
  }

  /**
   * Calculate and update transporter statistics
   */
  async updateTransporterStats(
    transporterId: string
  ): Promise<TransporterStats | null> {
    try {
      const ratings = await this.getTransporterRatings(transporterId, 10000);

      if (ratings.length === 0) {
        return null;
      }

      // Calculate distribution
      const distribution = {
        fiveStar: ratings.filter(r => r.rating === 5).length,
        fourStar: ratings.filter(r => r.rating === 4).length,
        threeStar: ratings.filter(r => r.rating === 3).length,
        twoStar: ratings.filter(r => r.rating === 2).length,
        oneStar: ratings.filter(r => r.rating === 1).length
      };

      // Calculate average
      const total = ratings.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = parseFloat((total / ratings.length).toFixed(2));

      // Create stats
      const stats: TransporterStats = {
        transporterId,
        averageRating,
        totalRatings: ratings.length,
        ratingDistribution: distribution,
        isVerified: false, // Will be updated by verification service
        totalDeliveries: ratings.length, // Simplified - should come from transaction service
        onTimeRate: 95, // Simplified - should come from actual data
        completionRate: 98, // Simplified - should come from actual data
        lastRatingDate:
          ratings.length > 0
            ? ratings[0].createdAt
            : undefined
      };

      // Store stats
      const allStats = await this.getAllTransporterStats();
      const index = allStats.findIndex(s => s.transporterId === transporterId);

      if (index >= 0) {
        allStats[index] = stats;
      } else {
        allStats.push(stats);
      }

      await AsyncStorage.setItem(
        this.STORAGE_KEY_TRANSPORTER_STATS,
        JSON.stringify(allStats)
      );

      return stats;
    } catch (error) {
      console.error('Error updating transporter stats:', error);
      return null;
    }
  }

  /**
   * Get transporter statistics
   */
  async getTransporterStats(
    transporterId: string
  ): Promise<TransporterStats | null> {
    try {
      const stats = await this.getAllTransporterStats();
      return stats.find(s => s.transporterId === transporterId) || null;
    } catch (error) {
      console.error('Error getting transporter stats:', error);
      return null;
    }
  }

  /**
   * Get all transporter statistics
   */
  async getAllTransporterStats(): Promise<TransporterStats[]> {
    try {
      const data = await AsyncStorage.getItem(
        this.STORAGE_KEY_TRANSPORTER_STATS
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all transporter stats:', error);
      return [];
    }
  }

  /**
   * Check if transporter meets verification criteria and update badge
   */
  async checkAndUpdateVerification(transporterId: string): Promise<void> {
    try {
      const stats = await this.getTransporterStats(transporterId);

      if (!stats || stats.isVerified) {
        return; // Already verified or no stats
      }

      // Gold badge criteria: 4.8+ rating, 100+ deliveries, 98%+ on-time
      const goldCriteria: VerificationCriteria = {
        minRating: 4.8,
        minDeliveries: 100,
        onTimeRate: 98,
        completionRate: 99,
        noDisputes: true,
        badgeType: 'gold'
      };

      // Silver badge criteria: 4.5+ rating, 50+ deliveries, 95%+ on-time
      const silverCriteria: VerificationCriteria = {
        minRating: 4.5,
        minDeliveries: 50,
        onTimeRate: 95,
        completionRate: 98,
        noDisputes: true,
        badgeType: 'silver'
      };

      // Bronze badge criteria: 4.0+ rating, 20+ deliveries, 90%+ on-time
      const bronzeCriteria: VerificationCriteria = {
        minRating: 4.0,
        minDeliveries: 20,
        onTimeRate: 90,
        completionRate: 95,
        noDisputes: true,
        badgeType: 'bronze'
      };

      // Check which badge qualifies
      let qualifiedBadge: VerificationCriteria | null = null;

      if (
        stats.averageRating >= goldCriteria.minRating &&
        stats.totalDeliveries >= goldCriteria.minDeliveries &&
        stats.onTimeRate >= goldCriteria.onTimeRate
      ) {
        qualifiedBadge = goldCriteria;
      } else if (
        stats.averageRating >= silverCriteria.minRating &&
        stats.totalDeliveries >= silverCriteria.minDeliveries &&
        stats.onTimeRate >= silverCriteria.onTimeRate
      ) {
        qualifiedBadge = silverCriteria;
      } else if (
        stats.averageRating >= bronzeCriteria.minRating &&
        stats.totalDeliveries >= bronzeCriteria.minDeliveries &&
        stats.onTimeRate >= bronzeCriteria.onTimeRate
      ) {
        qualifiedBadge = bronzeCriteria;
      }

      if (qualifiedBadge) {
        // Auto-qualify (in production, this should require admin approval)
        stats.isVerified = true;
        stats.verifiedBadge = {
          badgeType: qualifiedBadge.badgeType,
          criteriasMet: [
            `Rating: ${stats.averageRating}/${qualifiedBadge.minRating}`,
            `Deliveries: ${stats.totalDeliveries}/${qualifiedBadge.minDeliveries}`,
            `On-time rate: ${stats.onTimeRate}%/${qualifiedBadge.onTimeRate}%`
          ],
          verifiedDate: new Date().toISOString(),
          verifiedBy: 'system_auto' // In production, would be admin user ID
        };

        // Update stats
        const allStats = await this.getAllTransporterStats();
        const index = allStats.findIndex(
          s => s.transporterId === transporterId
        );
        if (index >= 0) {
          allStats[index] = stats;
          await AsyncStorage.setItem(
            this.STORAGE_KEY_TRANSPORTER_STATS,
            JSON.stringify(allStats)
          );
        }
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    }
  }

  /**
   * Manually verify a transporter (admin function)
   */
  async verifyTransporter(
    transporterId: string,
    badgeType: 'gold' | 'silver' | 'bronze',
    verifiedBy: string
  ): Promise<{ success: boolean; data?: TransporterStats; error?: string }> {
    try {
      const stats = await this.getTransporterStats(transporterId);

      if (!stats) {
        return { success: false, error: 'Transporter not found' };
      }

      stats.isVerified = true;
      stats.verifiedBadge = {
        badgeType,
        criteriasMet: [
          'Manually verified by admin',
          `Average rating: ${stats.averageRating}`,
          `Total deliveries: ${stats.totalDeliveries}`
        ],
        verifiedDate: new Date().toISOString(),
        verifiedBy
      };

      // Update storage
      const allStats = await this.getAllTransporterStats();
      const index = allStats.findIndex(s => s.transporterId === transporterId);
      if (index >= 0) {
        allStats[index] = stats;
        await AsyncStorage.setItem(
          this.STORAGE_KEY_TRANSPORTER_STATS,
          JSON.stringify(allStats)
        );
      }

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error verifying transporter:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Remove verification badge
   */
  async removeVerification(
    transporterId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const stats = await this.getTransporterStats(transporterId);

      if (!stats) {
        return { success: false, error: 'Transporter not found' };
      }

      stats.isVerified = false;
      delete stats.verifiedBadge;

      const allStats = await this.getAllTransporterStats();
      const index = allStats.findIndex(s => s.transporterId === transporterId);
      if (index >= 0) {
        allStats[index] = stats;
        await AsyncStorage.setItem(
          this.STORAGE_KEY_TRANSPORTER_STATS,
          JSON.stringify(allStats)
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing verification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Removal failed'
      };
    }
  }

  /**
   * Get all verified transporters
   */
  async getVerifiedTransporters(): Promise<TransporterStats[]> {
    try {
      const stats = await this.getAllTransporterStats();
      return stats
        .filter(s => s.isVerified)
        .sort((a, b) => b.averageRating - a.averageRating);
    } catch (error) {
      console.error('Error getting verified transporters:', error);
      return [];
    }
  }

  /**
   * Get top rated transporters
   */
  async getTopRatedTransporters(limit: number = 20): Promise<TransporterStats[]> {
    try {
      const stats = await this.getAllTransporterStats();
      return stats
        .filter(s => s.totalRatings >= 5) // Min 5 ratings
        .sort((a, b) => {
          // Sort by rating, then by number of ratings
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          return b.totalRatings - a.totalRatings;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top rated transporters:', error);
      return [];
    }
  }

  /**
   * Get transporter rating distribution percentage
   */
  async getRatingDistribution(
    transporterId: string
  ): Promise<{ [key: string]: number } | null> {
    try {
      const stats = await this.getTransporterStats(transporterId);

      if (!stats || stats.totalRatings === 0) {
        return null;
      }

      return {
        fiveStar: Math.round(
          (stats.ratingDistribution.fiveStar / stats.totalRatings) * 100
        ),
        fourStar: Math.round(
          (stats.ratingDistribution.fourStar / stats.totalRatings) * 100
        ),
        threeStar: Math.round(
          (stats.ratingDistribution.threeStar / stats.totalRatings) * 100
        ),
        twoStar: Math.round(
          (stats.ratingDistribution.twoStar / stats.totalRatings) * 100
        ),
        oneStar: Math.round(
          (stats.ratingDistribution.oneStar / stats.totalRatings) * 100
        )
      };
    } catch (error) {
      console.error('Error getting rating distribution:', error);
      return null;
    }
  }

  /**
   * Search transporters by rating
   */
  async searchByRating(minRating: number = 4.0): Promise<TransporterStats[]> {
    try {
      const stats = await this.getAllTransporterStats();
      return stats
        .filter(s => s.averageRating >= minRating && s.totalRatings >= 5)
        .sort(
          (a, b) =>
            b.averageRating - a.averageRating ||
            b.totalRatings - a.totalRatings
        );
    } catch (error) {
      console.error('Error searching by rating:', error);
      return [];
    }
  }

  /**
   * Clear all ratings (for testing/reset)
   */
  async clearAllRatings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY_RATINGS);
      await AsyncStorage.removeItem(this.STORAGE_KEY_TRANSPORTER_STATS);
      await AsyncStorage.removeItem(this.STORAGE_KEY_VERIFIED_TRANSPORTERS);
      await AsyncStorage.removeItem(this.STORAGE_KEY_REVIEWS);
    } catch (error) {
      console.error('Error clearing ratings:', error);
    }
  }
}

export const ratingService = new RatingService();
export type { Rating, TransporterStats, Review, VerificationCriteria };