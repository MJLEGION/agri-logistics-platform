/**
 * Advanced Ratings Service
 * 
 * Provides advanced features for the ratings system including:
 * - Leaderboards and rankings
 * - Rating incentive programs
 * - Rating reminders
 * - Analytics and trends
 * - Fraud detection
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface TransporterLeaderboardEntry {
  transporterId: string;
  transporterName: string;
  averageRating: number;
  totalRatings: number;
  onTimePercentage: number;
  verifiedBadge?: string;
  rank: number;
}

interface RatingIncentive {
  id: string;
  farmerId: string;
  transporterId: string;
  incentiveType: 'bonus_discount' | 'loyalty_points' | 'cashback';
  amount: number;
  description: string;
  isAwarded: boolean;
  awardedAt?: string;
  isRedeemed: boolean;
  redeemedAt?: string;
  expiresAt: string;
}

interface RatingReminder {
  id: string;
  transactionId: string;
  farmerId: string;
  transporterId: string;
  reminderCount: number;
  lastReminderSent?: string;
  nextReminderDate: string;
  isRated: boolean;
  ratedAt?: string;
}

interface RatingAnalytics {
  totalRatings: number;
  averageRating: number;
  ratingsTrend: {
    period: string;
    count: number;
    averageRating: number;
  }[];
  sentimentTrend: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topRatedTransporters: TransporterLeaderboardEntry[];
  bottomRatedTransporters: TransporterLeaderboardEntry[];
}

class AdvancedRatingsService {
  private readonly LEADERBOARD_KEY = 'agri_leaderboard_';
  private readonly INCENTIVES_KEY = 'agri_incentives_';
  private readonly REMINDERS_KEY = 'agri_reminders_';
  private readonly ANALYTICS_KEY = 'agri_analytics_';
  private readonly FRAUD_SCORES_KEY = 'agri_fraud_scores_';

  /**
   * Get leaderboard of top-rated transporters
   */
  async getLeaderboard(
    period: 'weekly' | 'monthly' | 'all_time' = 'all_time',
    limit: number = 50
  ): Promise<TransporterLeaderboardEntry[]> {
    try {
      const leaderboardData = await AsyncStorage.getItem(`${this.LEADERBOARD_KEY}${period}`);

      if (leaderboardData) {
        const leaderboard = JSON.parse(leaderboardData);
        return leaderboard.slice(0, limit);
      }

      return [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get transporter's position in leaderboard
   */
  async getTransporterRank(
    transporterId: string,
    period: 'weekly' | 'monthly' | 'all_time' = 'all_time'
  ): Promise<{ rank: number; totalTransporters: number } | null> {
    try {
      const leaderboard = await this.getLeaderboard(period, 1000);
      const transporterRank = leaderboard.findIndex(
        (entry) => entry.transporterId === transporterId
      );

      if (transporterRank === -1) {
        return null;
      }

      return {
        rank: transporterRank + 1,
        totalTransporters: leaderboard.length,
      };
    } catch (error) {
      console.error('Error getting transporter rank:', error);
      throw error;
    }
  }

  /**
   * Update leaderboard (typically called after ratings update)
   */
  async updateLeaderboard(allTransporterStats: any[]): Promise<void> {
    try {
      // Sort by average rating and total ratings
      const sortedTransporters = allTransporterStats
        .sort((a, b) => {
          // Primary: average rating
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          // Secondary: total ratings
          return b.totalRatings - a.totalRatings;
        })
        .map((transporter, index) => ({
          transporterId: transporter.transporterId,
          transporterName: transporter.transporterName,
          averageRating: transporter.averageRating,
          totalRatings: transporter.totalRatings,
          onTimePercentage: transporter.onTimePercentage,
          verifiedBadge: transporter.verifiedBadge,
          rank: index + 1,
        }));

      // Store all-time leaderboard
      await AsyncStorage.setItem(
        `${this.LEADERBOARD_KEY}all_time`,
        JSON.stringify(sortedTransporters)
      );

      // Calculate and store weekly leaderboard (last 7 days)
      const weeklyLeaderboard = await this.calculateWeeklyLeaderboard(sortedTransporters);
      await AsyncStorage.setItem(`${this.LEADERBOARD_KEY}weekly`, JSON.stringify(weeklyLeaderboard));

      // Calculate and store monthly leaderboard (last 30 days)
      const monthlyLeaderboard = await this.calculateMonthlyLeaderboard(sortedTransporters);
      await AsyncStorage.setItem(
        `${this.LEADERBOARD_KEY}monthly`,
        JSON.stringify(monthlyLeaderboard)
      );
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      throw error;
    }
  }

  /**
   * Create rating incentive for farmer
   */
  async createIncentive(
    farmerId: string,
    transporterId: string,
    incentiveType: 'bonus_discount' | 'loyalty_points' | 'cashback',
    amount: number,
    description: string,
    expiresInDays: number = 30
  ): Promise<RatingIncentive> {
    try {
      const incentiveId = `incentive_${Date.now()}_${Math.random()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const incentive: RatingIncentive = {
        id: incentiveId,
        farmerId,
        transporterId,
        incentiveType,
        amount,
        description,
        isAwarded: false,
        isRedeemed: false,
        expiresAt: expiresAt.toISOString(),
      };

      // Store incentive
      const incentivesData = await AsyncStorage.getItem(`${this.INCENTIVES_KEY}${farmerId}`);
      const incentives = incentivesData ? JSON.parse(incentivesData) : [];
      incentives.push(incentive);

      await AsyncStorage.setItem(
        `${this.INCENTIVES_KEY}${farmerId}`,
        JSON.stringify(incentives)
      );

      return incentive;
    } catch (error) {
      console.error('Error creating incentive:', error);
      throw error;
    }
  }

  /**
   * Get farmer's active incentives
   */
  async getFarmerIncentives(farmerId: string): Promise<RatingIncentive[]> {
    try {
      const incentivesData = await AsyncStorage.getItem(`${this.INCENTIVES_KEY}${farmerId}`);
      if (!incentivesData) {
        return [];
      }

      const incentives: RatingIncentive[] = JSON.parse(incentivesData);
      const now = new Date();

      // Filter non-expired, non-redeemed incentives
      return incentives.filter(
        (incentive) =>
          !incentive.isRedeemed && new Date(incentive.expiresAt) > now
      );
    } catch (error) {
      console.error('Error fetching farmer incentives:', error);
      return [];
    }
  }

  /**
   * Redeem an incentive
   */
  async redeemIncentive(incentiveId: string, farmerId: string): Promise<RatingIncentive> {
    try {
      const incentivesData = await AsyncStorage.getItem(`${this.INCENTIVES_KEY}${farmerId}`);
      if (!incentivesData) {
        throw new Error('No incentives found');
      }

      const incentives: RatingIncentive[] = JSON.parse(incentivesData);
      const incentive = incentives.find((i) => i.id === incentiveId);

      if (!incentive) {
        throw new Error('Incentive not found');
      }

      if (incentive.isRedeemed) {
        throw new Error('Incentive already redeemed');
      }

      if (new Date(incentive.expiresAt) < new Date()) {
        throw new Error('Incentive has expired');
      }

      // Update incentive
      incentive.isRedeemed = true;
      incentive.redeemedAt = new Date().toISOString();

      await AsyncStorage.setItem(
        `${this.INCENTIVES_KEY}${farmerId}`,
        JSON.stringify(incentives)
      );

      return incentive;
    } catch (error) {
      console.error('Error redeeming incentive:', error);
      throw error;
    }
  }

  /**
   * Create rating reminder for transaction
   */
  async createReminder(
    transactionId: string,
    farmerId: string,
    transporterId: string,
    reminderIntervalHours: number = 24
  ): Promise<RatingReminder> {
    try {
      const reminderId = `reminder_${Date.now()}_${Math.random()}`;
      const nextReminderDate = new Date();
      nextReminderDate.setHours(nextReminderDate.getHours() + reminderIntervalHours);

      const reminder: RatingReminder = {
        id: reminderId,
        transactionId,
        farmerId,
        transporterId,
        reminderCount: 0,
        nextReminderDate: nextReminderDate.toISOString(),
        isRated: false,
      };

      // Store reminder
      const remindersData = await AsyncStorage.getItem(`${this.REMINDERS_KEY}${farmerId}`);
      const reminders = remindersData ? JSON.parse(remindersData) : [];
      reminders.push(reminder);

      await AsyncStorage.setItem(
        `${this.REMINDERS_KEY}${farmerId}`,
        JSON.stringify(reminders)
      );

      return reminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  /**
   * Get pending reminders for farmer
   */
  async getPendingReminders(farmerId: string): Promise<RatingReminder[]> {
    try {
      const remindersData = await AsyncStorage.getItem(`${this.REMINDERS_KEY}${farmerId}`);
      if (!remindersData) {
        return [];
      }

      const reminders: RatingReminder[] = JSON.parse(remindersData);
      const now = new Date();

      // Return reminders that are not yet rated and are due
      return reminders.filter(
        (reminder) =>
          !reminder.isRated &&
          new Date(reminder.nextReminderDate) <= now &&
          reminder.reminderCount < 3 // Max 3 reminders
      );
    } catch (error) {
      console.error('Error fetching pending reminders:', error);
      return [];
    }
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(reminderId: string, farmerId: string): Promise<RatingReminder> {
    try {
      const remindersData = await AsyncStorage.getItem(`${this.REMINDERS_KEY}${farmerId}`);
      if (!remindersData) {
        throw new Error('No reminders found');
      }

      const reminders: RatingReminder[] = JSON.parse(remindersData);
      const reminder = reminders.find((r) => r.id === reminderId);

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      // Update reminder
      reminder.reminderCount += 1;
      reminder.lastReminderSent = new Date().toISOString();

      const nextReminderDate = new Date();
      nextReminderDate.setHours(nextReminderDate.getHours() + 24); // Schedule next in 24 hours
      reminder.nextReminderDate = nextReminderDate.toISOString();

      await AsyncStorage.setItem(
        `${this.REMINDERS_KEY}${farmerId}`,
        JSON.stringify(reminders)
      );

      return reminder;
    } catch (error) {
      console.error('Error marking reminder sent:', error);
      throw error;
    }
  }

  /**
   * Mark reminder as completed (farmer rated)
   */
  async completeReminder(transactionId: string, farmerId: string): Promise<void> {
    try {
      const remindersData = await AsyncStorage.getItem(`${this.REMINDERS_KEY}${farmerId}`);
      if (!remindersData) {
        return;
      }

      const reminders: RatingReminder[] = JSON.parse(remindersData);
      const reminder = reminders.find((r) => r.transactionId === transactionId);

      if (reminder) {
        reminder.isRated = true;
        reminder.ratedAt = new Date().toISOString();

        await AsyncStorage.setItem(
          `${this.REMINDERS_KEY}${farmerId}`,
          JSON.stringify(reminders)
        );
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
      throw error;
    }
  }

  /**
   * Get rating analytics
   */
  async getAnalytics(transporterId?: string): Promise<RatingAnalytics> {
    try {
      const analyticsKey = transporterId
        ? `${this.ANALYTICS_KEY}${transporterId}`
        : `${this.ANALYTICS_KEY}all`;

      const analyticsData = await AsyncStorage.getItem(analyticsKey);

      if (analyticsData) {
        return JSON.parse(analyticsData);
      }

      return {
        totalRatings: 0,
        averageRating: 0,
        ratingsTrend: [],
        sentimentTrend: {
          positive: 0,
          neutral: 0,
          negative: 0,
        },
        topRatedTransporters: [],
        bottomRatedTransporters: [],
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate fraud score for rating (detect suspicious patterns)
   */
  async calculateFraudScore(
    farmerId: string,
    transporterId: string,
    rating: number,
    comment: string
  ): Promise<{ score: number; isSuspicious: boolean; reasons: string[] }> {
    try {
      const reasons: string[] = [];
      let score = 0;

      // Get farmer's recent ratings
      const farmerRatings = await AsyncStorage.getItem(`agri_ratings_${farmerId}`);
      if (farmerRatings) {
        const ratings = JSON.parse(farmerRatings);
        const recentRatings = ratings.filter(
          (r: any) => Date.now() - new Date(r.createdAt).getTime() < 24 * 60 * 60 * 1000
        );

        // Flag if too many ratings in short time
        if (recentRatings.length > 5) {
          score += 30;
          reasons.push('Too many ratings in short time period');
        }

        // Flag if same transporter rated multiple times quickly
        const repeatedTransporterRatings = recentRatings.filter(
          (r: any) => r.transporterId === transporterId
        );
        if (repeatedTransporterRatings.length > 1) {
          score += 25;
          reasons.push('Multiple ratings for same transporter');
        }
      }

      // Analyze comment
      if (comment) {
        // Check for generic/spammy comments
        if (comment.length < 10) {
          score += 10;
          reasons.push('Comment too short');
        }

        // Check for excessive punctuation
        const punctuationCount = (comment.match(/[!?]{2,}/g) || []).length;
        if (punctuationCount > 2) {
          score += 15;
          reasons.push('Excessive punctuation');
        }

        // Check for all caps (potential spam)
        const capsPercentage = (comment.match(/[A-Z]/g) || []).length / comment.length;
        if (capsPercentage > 0.7) {
          score += 20;
          reasons.push('Excessive capitalization');
        }
      }

      // Check rating consistency with comment
      const sentimentAnalysis = this.analyzeCommentSentiment(comment);
      const ratingValence = rating > 3 ? 'positive' : rating < 3 ? 'negative' : 'neutral';

      if (sentimentAnalysis !== ratingValence) {
        score += 15;
        reasons.push('Rating sentiment mismatch');
      }

      return {
        score,
        isSuspicious: score > 50,
        reasons,
      };
    } catch (error) {
      console.error('Error calculating fraud score:', error);
      return {
        score: 0,
        isSuspicious: false,
        reasons: [],
      };
    }
  }

  /**
   * Get transporter insights
   */
  async getTransporterInsights(transporterId: string): Promise<{
    strengthAreas: string[];
    improvementAreas: string[];
    recommendations: string[];
  }> {
    try {
      const stats = await AsyncStorage.getItem(`agri_transporter_stats_${transporterId}`);
      if (!stats) {
        return {
          strengthAreas: [],
          improvementAreas: [],
          recommendations: [],
        };
      }

      const transporterStats = JSON.parse(stats);
      const strengthAreas: string[] = [];
      const improvementAreas: string[] = [];
      const recommendations: string[] = [];

      // Analyze based on ratings and metrics
      if (transporterStats.averageRating >= 4.5) {
        strengthAreas.push('Excellent customer satisfaction');
      }
      if (transporterStats.onTimePercentage >= 95) {
        strengthAreas.push('Consistent on-time delivery');
      }
      if (transporterStats.completionPercentage >= 98) {
        strengthAreas.push('High delivery completion rate');
      }

      if (transporterStats.averageRating < 4) {
        improvementAreas.push('Overall rating needs improvement');
      }
      if (transporterStats.onTimePercentage < 90) {
        improvementAreas.push('Punctuality needs attention');
      }
      if (transporterStats.completionPercentage < 95) {
        improvementAreas.push('Delivery reliability needs improvement');
      }

      // Generate recommendations
      if (improvementAreas.length > 0) {
        recommendations.push('Focus on timely deliveries to improve ratings');
        recommendations.push('Communicate proactively with customers about delays');
      }

      if (strengthAreas.length > 0) {
        recommendations.push('Maintain current high service standards');
        recommendations.push('Encourage satisfied customers to write reviews');
      }

      return {
        strengthAreas,
        improvementAreas,
        recommendations,
      };
    } catch (error) {
      console.error('Error getting transporter insights:', error);
      return {
        strengthAreas: [],
        improvementAreas: [],
        recommendations: [],
      };
    }
  }

  /**
   * Helper: Calculate weekly leaderboard
   */
  private async calculateWeeklyLeaderboard(allTransporters: any[]): Promise<any[]> {
    // This would filter ratings from last 7 days
    // For now, return same as all-time (in production, filter by date)
    return allTransporters;
  }

  /**
   * Helper: Calculate monthly leaderboard
   */
  private async calculateMonthlyLeaderboard(allTransporters: any[]): Promise<any[]> {
    // This would filter ratings from last 30 days
    // For now, return same as all-time (in production, filter by date)
    return allTransporters;
  }

  /**
   * Helper: Analyze comment sentiment (simple keyword-based)
   */
  private analyzeCommentSentiment(
    comment: string
  ): 'positive' | 'neutral' | 'negative' {
    const positiveKeywords = ['excellent', 'great', 'amazing', 'good', 'love', 'best'];
    const negativeKeywords = ['bad', 'poor', 'terrible', 'hate', 'worst', 'awful'];

    const lowerComment = comment.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    positiveKeywords.forEach((keyword) => {
      if (lowerComment.includes(keyword)) positiveScore++;
    });

    negativeKeywords.forEach((keyword) => {
      if (lowerComment.includes(keyword)) negativeScore++;
    });

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }
}

export const advancedRatingsService = new AdvancedRatingsService();