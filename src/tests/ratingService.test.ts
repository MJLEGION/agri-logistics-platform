/**
 * Rating Service Test Suite
 * Tests for creating ratings, calculating stats, and verifying badges
 */

import { ratingService } from '../services/ratingService';

describe('Rating Service', () => {
  
  beforeEach(() => {
    // Clear AsyncStorage before each test
    jest.clearAllMocks();
  });

  describe('Creating Ratings', () => {
    
    test('should create a valid 5-star rating', async () => {
      const result = await ratingService.createRating(
        'trip-001',
        'trans-123',
        'farmer-001',
        'John Farmer',
        5,
        'Excellent service! Very professional.'
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data?.rating).toBe(5);
      expect(result.data?.comment).toBe('Excellent service! Very professional.');
      expect(result.data?.transporterId).toBe('trans-123');
      expect(result.data?.createdAt).toBeDefined();
    });

    test('should create a rating without comment', async () => {
      const result = await ratingService.createRating(
        'trip-002',
        'trans-123',
        'farmer-001',
        'John Farmer',
        4
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data?.rating).toBe(4);
    });

    test('should reject rating below 1', async () => {
      const result = await ratingService.createRating(
        'trip-003',
        'trans-123',
        'farmer-001',
        'John Farmer',
        0,
        'Bad service'
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('between 1 and 5');
    });

    test('should reject rating above 5', async () => {
      const result = await ratingService.createRating(
        'trip-004',
        'trans-123',
        'farmer-001',
        'John Farmer',
        6,
        'Good service'
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('between 1 and 5');
    });

    test('should reject comment longer than 1000 characters', async () => {
      const longComment = 'a'.repeat(1001);
      
      const result = await ratingService.createRating(
        'trip-005',
        'trans-123',
        'farmer-001',
        'John Farmer',
        5,
        longComment
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceed');
    });

    test('should reject duplicate rating for same transaction', async () => {
      // Create first rating
      await ratingService.createRating(
        'trip-006',
        'trans-123',
        'farmer-001',
        'John Farmer',
        5,
        'Great!'
      );

      // Try to create another for same transaction
      const result = await ratingService.createRating(
        'trip-006',
        'trans-123',
        'farmer-001',
        'John Farmer',
        3,
        'Actually bad'
      );
      expect(result.success).toBe(false);
    });
  });

  describe('Calculating Transporter Statistics', () => {
    
    test('should calculate average rating correctly', async () => {
      // Create 3 ratings: 5, 4, 5 = avg 4.67
      await ratingService.createRating(
        'trip-010',
        'trans-200',
        'farmer-001',
        'Farmer 1',
        5,
        'Excellent'
      );

      await ratingService.createRating(
        'trip-011',
        'trans-200',
        'farmer-002',
        'Farmer 2',
        4,
        'Good'
      );

      await ratingService.createRating(
        'trip-012',
        'trans-200',
        'farmer-003',
        'Farmer 3',
        5,
        'Perfect'
      );

      const stats = await ratingService.getTransporterStats('trans-200');

      expect(stats).toBeDefined();
      expect(stats.totalRatings).toBe(3);
      expect(Math.round(stats.averageRating * 100) / 100).toBe(4.67);
    });

    test('should calculate rating distribution correctly', async () => {
      // Create ratings: two 5-star, one 3-star
      await ratingService.createRating(
        'trip-020',
        'trans-300',
        'farmer-001',
        'Farmer 1',
        5,
        'Great'
      );

      await ratingService.createRating(
        'trip-021',
        'trans-300',
        'farmer-002',
        'Farmer 2',
        5,
        'Excellent'
      );

      await ratingService.createRating(
        'trip-022',
        'trans-300',
        'farmer-003',
        'Farmer 3',
        3,
        'Okay'
      );

      const stats = await ratingService.getTransporterStats('trans-300');

      expect(stats.distribution).toBeDefined();
      expect(stats.distribution[5]).toBe(2);
      expect(stats.distribution[3]).toBe(1);
    });

    test('should return empty stats for transporter with no ratings', async () => {
      const stats = await ratingService.getTransporterStats('trans-nonexistent');

      expect(stats).toBeDefined();
      expect(stats.totalRatings).toBe(0);
      expect(stats.averageRating).toBe(0);
    });
  });

  describe('Verification Badge Eligibility', () => {
    
    test('should qualify for Gold badge', () => {
      const stats = {
        averageRating: 4.8,
        totalRatings: 100,
        onTimePercentage: 98
      };

      const badge = ratingService.calculateVerificationEligibility(stats);

      expect(badge).toBe('gold');
    });

    test('should qualify for Silver badge', () => {
      const stats = {
        averageRating: 4.5,
        totalRatings: 50,
        onTimePercentage: 95
      };

      const badge = ratingService.calculateVerificationEligibility(stats);

      expect(badge).toBe('silver');
    });

    test('should qualify for Bronze badge', () => {
      const stats = {
        averageRating: 4.0,
        totalRatings: 20,
        onTimePercentage: 90
      };

      const badge = ratingService.calculateVerificationEligibility(stats);

      expect(badge).toBe('bronze');
    });

    test('should not qualify for badge with low rating', () => {
      const stats = {
        averageRating: 3.5,
        totalRatings: 100,
        onTimePercentage: 90
      };

      const badge = ratingService.calculateVerificationEligibility(stats);

      expect(badge).toBeNull();
    });

    test('should not qualify for badge with few deliveries', () => {
      const stats = {
        averageRating: 4.8,
        totalRatings: 5,
        onTimePercentage: 98
      };

      const badge = ratingService.calculateVerificationEligibility(stats);

      expect(badge).toBeNull();
    });

    test('should not qualify for badge with low on-time percentage', () => {
      const stats = {
        averageRating: 4.8,
        totalRatings: 100,
        onTimePercentage: 80
      };

      const badge = ratingService.calculateVerificationEligibility(stats);

      expect(badge).toBeNull();
    });
  });

  describe('Getting Transporter Reviews', () => {
    
    test('should get reviews for transporter', async () => {
      // Create some ratings first
      await ratingService.createRating(
        'trip-030',
        'trans-400',
        'farmer-001',
        'Farmer 1',
        5,
        'Good'
      );

      await ratingService.createRating(
        'trip-031',
        'trans-400',
        'farmer-002',
        'Farmer 2',
        4,
        'Fine'
      );

      const reviews = await ratingService.getTransporterReviews('trans-400');

      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBe(2);
    });

    test('should return empty array for transporter with no reviews', async () => {
      const reviews = await ratingService.getTransporterReviews('trans-nonexistent');

      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBe(0);
    });
  });

  describe('Searching Transporters', () => {
    
    test('should find transporters by minimum rating', async () => {
      // Create high-rated transporter
      await ratingService.createRating(
        'trip-040',
        'trans-500',
        'farmer-001',
        'Farmer 1',
        5,
        'Excellent'
      );

      // Create low-rated transporter
      await ratingService.createRating(
        'trip-041',
        'trans-501',
        'farmer-002',
        'Farmer 2',
        2,
        'Poor'
      );

      const results = await ratingService.searchTransporters({
        minRating: 4.0
      });

      expect(Array.isArray(results)).toBe(true);
      results.forEach(transporter => {
        expect(transporter.averageRating).toBeGreaterThanOrEqual(4.0);
      });
    });

    test('should find transporters by name', async () => {
      const results = await ratingService.searchTransporters({
        name: 'John'
      });

      expect(Array.isArray(results)).toBe(true);
    });

    test('should combine filters', async () => {
      const results = await ratingService.searchTransporters({
        minRating: 4.0,
        name: 'Transporter'
      });

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Getting Top Rated Transporters', () => {
    
    test('should get leaderboard sorted by rating', async () => {
      const leaderboard = await ratingService.getTopRatedTransporters(10);

      expect(Array.isArray(leaderboard)).toBe(true);
      
      // Verify sorted in descending order
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].averageRating).toBeGreaterThanOrEqual(
          leaderboard[i + 1].averageRating
        );
      }
    });

    test('should respect limit parameter', async () => {
      const leaderboard = await ratingService.getTopRatedTransporters(5);

      expect(leaderboard.length).toBeLessThanOrEqual(5);
    });

    test('should return empty array if no transporters', async () => {
      const leaderboard = await ratingService.getTopRatedTransporters(10);

      expect(Array.isArray(leaderboard)).toBe(true);
    });
  });
});