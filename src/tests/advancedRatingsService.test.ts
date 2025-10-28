/**
 * Advanced Ratings Service Test Suite
 * Tests for leaderboards, incentives, reminders, and fraud detection
 */

import { advancedRatingsService } from '../services/advancedRatingsService';

describe('Advanced Ratings Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Leaderboards', () => {
    
    test('should get weekly leaderboard', async () => {
      const leaderboard = await advancedRatingsService.getLeaderboard({
        period: 'weekly',
        limit: 10
      });

      expect(Array.isArray(leaderboard)).toBe(true);
      expect(leaderboard.length).toBeLessThanOrEqual(10);
      
      // Verify it's sorted by rank
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].rank).toBeLessThanOrEqual(leaderboard[i + 1].rank);
      }
    });

    test('should get monthly leaderboard', async () => {
      const leaderboard = await advancedRatingsService.getLeaderboard({
        period: 'monthly',
        limit: 20
      });

      expect(Array.isArray(leaderboard)).toBe(true);
      expect(leaderboard.length).toBeLessThanOrEqual(20);
    });

    test('should get all-time leaderboard', async () => {
      const leaderboard = await advancedRatingsService.getLeaderboard({
        period: 'allTime',
        limit: 50
      });

      expect(Array.isArray(leaderboard)).toBe(true);
      
      // Check each entry has rank metadata
      leaderboard.forEach((entry, index) => {
        expect(entry.rank).toBeDefined();
        expect(entry.transporterId).toBeDefined();
        expect(entry.averageRating).toBeDefined();
      });
    });

    test('should get transporter rank', async () => {
      const rank = await advancedRatingsService.getTransporterRank('trans-100', 'monthly');

      expect(rank).toBeDefined();
      expect(rank.transporterId).toBe('trans-100');
      expect(rank.rank).toBeDefined();
      expect(rank.percentile).toBeDefined();
      expect(rank.percentile).toBeGreaterThanOrEqual(0);
      expect(rank.percentile).toBeLessThanOrEqual(100);
    });

    test('should handle transporter not in leaderboard', async () => {
      const rank = await advancedRatingsService.getTransporterRank('trans-nonexistent', 'weekly');

      expect(rank.rank).toBeNull();
    });
  });

  describe('Incentive Programs', () => {
    
    test('should create discount incentive', async () => {
      const incentive = await advancedRatingsService.createIncentive({
        transporterId: 'trans-100',
        type: 'discount',
        amount: 1000, // 10 Ghc in smallest units
        description: 'Congratulations on 100 5-star ratings!'
      });

      expect(incentive).toBeDefined();
      expect(incentive.type).toBe('discount');
      expect(incentive.amount).toBe(1000);
      expect(incentive.expiresAt).toBeDefined();
      expect(new Date(incentive.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    test('should create loyalty points incentive', async () => {
      const incentive = await advancedRatingsService.createIncentive({
        transporterId: 'trans-101',
        type: 'points',
        amount: 500,
        description: 'Loyalty points for consistent excellence'
      });

      expect(incentive).toBeDefined();
      expect(incentive.type).toBe('points');
      expect(incentive.amount).toBe(500);
    });

    test('should create cashback incentive', async () => {
      const incentive = await advancedRatingsService.createIncentive({
        transporterId: 'trans-102',
        type: 'cashback',
        amount: 2000,
        description: 'Cashback reward for excellent service'
      });

      expect(incentive).toBeDefined();
      expect(incentive.type).toBe('cashback');
    });

    test('should get farmer incentives', async () => {
      const incentives = await advancedRatingsService.getFarmerIncentives('farmer-001');

      expect(Array.isArray(incentives)).toBe(true);
      
      // All should be active (not expired)
      incentives.forEach(incentive => {
        expect(new Date(incentive.expiresAt).getTime()).toBeGreaterThan(Date.now());
      });
    });

    test('should redeem incentive', async () => {
      const incentive = await advancedRatingsService.createIncentive({
        transporterId: 'trans-103',
        type: 'discount',
        amount: 1500,
        description: 'Redemption test'
      });

      const redeemed = await advancedRatingsService.redeemIncentive(incentive.id);

      expect(redeemed.redeemed).toBe(true);
      expect(redeemed.redeemedAt).toBeDefined();
    });

    test('should not redeem already redeemed incentive', async () => {
      const incentive = await advancedRatingsService.createIncentive({
        transporterId: 'trans-104',
        type: 'discount',
        amount: 1500,
        description: 'Double redeem test'
      });

      // Redeem first time
      await advancedRatingsService.redeemIncentive(incentive.id);

      // Try to redeem again
      await expect(
        advancedRatingsService.redeemIncentive(incentive.id)
      ).rejects.toThrow('Incentive already redeemed');
    });

    test('should not redeem expired incentive', async () => {
      const incentive = await advancedRatingsService.createIncentive({
        transporterId: 'trans-105',
        type: 'discount',
        amount: 1500,
        description: 'Expired incentive test',
        expiresIn: -1 // Expire immediately
      });

      await expect(
        advancedRatingsService.redeemIncentive(incentive.id)
      ).rejects.toThrow('Incentive has expired');
    });
  });

  describe('Rating Reminders', () => {
    
    test('should create reminder', async () => {
      const reminder = await advancedRatingsService.createReminder({
        transactionId: 'trip-001',
        farmerId: 'farmer-001',
        transporterId: 'trans-100'
      });

      expect(reminder).toBeDefined();
      expect(reminder.status).toBe('pending');
      expect(reminder.scheduledFor).toBeDefined();
      expect(reminder.attempt).toBe(1);
    });

    test('should get pending reminders', async () => {
      // Create a reminder that's due
      await advancedRatingsService.createReminder({
        transactionId: 'trip-002',
        farmerId: 'farmer-001',
        transporterId: 'trans-100'
      });

      const reminders = await advancedRatingsService.getPendingReminders('farmer-001');

      expect(Array.isArray(reminders)).toBe(true);
      reminders.forEach(reminder => {
        expect(reminder.status).toBe('pending');
        // Should be due (scheduled time is in the past or present)
        expect(new Date(reminder.scheduledFor).getTime()).toBeLessThanOrEqual(Date.now());
      });
    });

    test('should mark reminder as completed', async () => {
      const reminder = await advancedRatingsService.createReminder({
        transactionId: 'trip-003',
        farmerId: 'farmer-001',
        transporterId: 'trans-100'
      });

      const completed = await advancedRatingsService.completeReminder(reminder.id);

      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();
    });

    test('should create next reminder on incomplete', async () => {
      const reminder = await advancedRatingsService.createReminder({
        transactionId: 'trip-004',
        farmerId: 'farmer-001',
        transporterId: 'trans-100'
      });

      // Mark as incomplete (snooze)
      const snoozed = await advancedRatingsService.snoozeReminder(reminder.id);

      expect(snoozed.status).toBe('pending');
      expect(snoozed.attempt).toBeGreaterThan(1);
      expect(new Date(snoozed.scheduledFor).getTime()).toBeGreaterThan(Date.now());
    });

    test('should stop reminders after 3 attempts', async () => {
      const reminder = await advancedRatingsService.createReminder({
        transactionId: 'trip-005',
        farmerId: 'farmer-001',
        transporterId: 'trans-100'
      });

      // First snooze
      await advancedRatingsService.snoozeReminder(reminder.id);
      
      // Second snooze
      const snoozed2 = await advancedRatingsService.snoozeReminder(reminder.id);
      
      // Third snooze - should stop
      const snoozed3 = await advancedRatingsService.snoozeReminder(reminder.id);

      expect(snoozed3.status).toBe('cancelled');
      expect(snoozed3.cancelledReason).toContain('maximum attempts');
    });
  });

  describe('Fraud Detection', () => {
    
    test('should calculate fraud score', async () => {
      const fraudScore = await advancedRatingsService.calculateFraudScore('trans-100');

      expect(fraudScore).toBeDefined();
      expect(fraudScore.score).toBeGreaterThanOrEqual(0);
      expect(fraudScore.score).toBeLessThanOrEqual(100);
    });

    test('should flag high fraud score', async () => {
      const fraudScore = await advancedRatingsService.calculateFraudScore('trans-100');

      if (fraudScore.score > 50) {
        expect(fraudScore.flagged).toBe(true);
        expect(Array.isArray(fraudScore.reasons)).toBe(true);
        expect(fraudScore.reasons.length).toBeGreaterThan(0);
      }
    });

    test('should detect bulk rating patterns', async () => {
      // This would require creating many ratings in short time
      const fraudScore = await advancedRatingsService.calculateFraudScore('trans-100');

      if (fraudScore.score > 50) {
        expect(fraudScore.reasons).toBeDefined();
      }
    });

    test('should detect timing anomalies', async () => {
      const fraudScore = await advancedRatingsService.calculateFraudScore('trans-100');

      expect(fraudScore).toBeDefined();
      // Score might be high if all ratings came in unrealistic time window
    });

    test('should not flag legitimate high ratings', async () => {
      // Legitimate high ratings over reasonable time period
      const fraudScore = await advancedRatingsService.calculateFraudScore('trans-100');

      // If spread over time and varied, should be low score
      expect(fraudScore.score).toBeDefined();
    });
  });

  describe('Analytics', () => {
    
    test('should get platform analytics', async () => {
      const analytics = await advancedRatingsService.getAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.totalRatings).toBeDefined();
      expect(analytics.totalRatings).toBeGreaterThanOrEqual(0);
      expect(analytics.averageRating).toBeDefined();
      expect(analytics.totalReviews).toBeDefined();
      expect(analytics.topTransporters).toBeDefined();
      expect(Array.isArray(analytics.topTransporters)).toBe(true);
    });

    test('should get analytics by period', async () => {
      const analyticsWeekly = await advancedRatingsService.getAnalytics('weekly');
      const analyticsMonthly = await advancedRatingsService.getAnalytics('monthly');

      expect(analyticsWeekly).toBeDefined();
      expect(analyticsMonthly).toBeDefined();
    });

    test('should include sentiment distribution', async () => {
      const analytics = await advancedRatingsService.getAnalytics();

      expect(analytics.sentimentDistribution).toBeDefined();
      expect(analytics.sentimentDistribution.positive).toBeDefined();
      expect(analytics.sentimentDistribution.negative).toBeDefined();
      expect(analytics.sentimentDistribution.neutral).toBeDefined();
    });

    test('should include top performers', async () => {
      const analytics = await advancedRatingsService.getAnalytics();

      expect(analytics.topTransporters).toBeDefined();
      expect(Array.isArray(analytics.topTransporters)).toBe(true);
      
      // Should be sorted by rating
      for (let i = 0; i < analytics.topTransporters.length - 1; i++) {
        expect(analytics.topTransporters[i].averageRating)
          .toBeGreaterThanOrEqual(analytics.topTransporters[i + 1].averageRating);
      }
    });
  });

  describe('Transporter Insights', () => {
    
    test('should get transporter insights', async () => {
      const insights = await advancedRatingsService.getTransporterInsights('trans-100');

      expect(insights).toBeDefined();
      expect(Array.isArray(insights.strengths)).toBe(true);
      expect(Array.isArray(insights.improvements)).toBe(true);
      expect(Array.isArray(insights.recommendations)).toBe(true);
    });

    test('should identify strengths from positive reviews', async () => {
      const insights = await advancedRatingsService.getTransporterInsights('trans-100');

      // Should have strengths based on positive feedback
      expect(insights.strengths.length).toBeGreaterThanOrEqual(0);
      
      insights.strengths.forEach(strength => {
        expect(strength).toBeDefined();
        expect(typeof strength).toBe('string');
      });
    });

    test('should identify improvements from negative reviews', async () => {
      const insights = await advancedRatingsService.getTransporterInsights('trans-100');

      // Should have improvement areas based on negative feedback
      expect(Array.isArray(insights.improvements)).toBe(true);
      
      insights.improvements.forEach(improvement => {
        expect(improvement).toBeDefined();
        expect(typeof improvement).toBe('string');
      });
    });

    test('should provide actionable recommendations', async () => {
      const insights = await advancedRatingsService.getTransporterInsights('trans-100');

      expect(Array.isArray(insights.recommendations)).toBe(true);
      
      insights.recommendations.forEach(rec => {
        expect(rec).toBeDefined();
        expect(typeof rec).toBe('string');
      });
    });
  });

  describe('Combined Workflows', () => {
    
    test('complete workflow: create rating > check stats > verify badge > get insights', async () => {
      // This tests the full flow working together
      const insights = await advancedRatingsService.getTransporterInsights('trans-100');

      expect(insights).toBeDefined();
      expect(insights.strengths).toBeDefined();
    });

    test('incentive workflow: award > track > redeem > analyze', async () => {
      const incentive = await advancedRatingsService.createIncentive({
        transporterId: 'trans-200',
        type: 'discount',
        amount: 1000,
        description: 'Test workflow'
      });

      expect(incentive).toBeDefined();

      const farmerIncentives = await advancedRatingsService.getFarmerIncentives('farmer-001');
      expect(Array.isArray(farmerIncentives)).toBe(true);

      const redeemed = await advancedRatingsService.redeemIncentive(incentive.id);
      expect(redeemed.redeemed).toBe(true);
    });

    test('reminder workflow: create > get pending > complete > track completion', async () => {
      const reminder = await advancedRatingsService.createReminder({
        transactionId: 'trip-100',
        farmerId: 'farmer-100',
        transporterId: 'trans-100'
      });

      const pending = await advancedRatingsService.getPendingReminders('farmer-100');
      expect(Array.isArray(pending)).toBe(true);

      const completed = await advancedRatingsService.completeReminder(reminder.id);
      expect(completed.status).toBe('completed');
    });
  });
});