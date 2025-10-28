/**
 * Review Service Test Suite
 * Tests for creating reviews, sentiment analysis, and content moderation
 */

import { reviewService } from '../services/reviewService';

describe('Review Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Creating Reviews', () => {
    
    test('should create a valid review', async () => {
      const result = await reviewService.createReview(
        'rating-001',
        'trans-100',
        'Transporter Name',
        'farmer-001',
        'Farmer Name',
        'Amazing service! Very professional and on time.'
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data?.comment).toBe('Amazing service! Very professional and on time.');
      expect(result.data?.ratingId).toBe('rating-001');
      expect(result.data?.createdAt).toBeDefined();
    });

    test('should reject review shorter than 10 characters', async () => {
      const result = await reviewService.createReview(
        'rating-003',
        'trans-100',
        'Transporter Name',
        'farmer-001',
        'Farmer Name',
        'Good'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('10 characters');
    });

    test('should reject review longer than 1000 characters', async () => {
      const longText = 'a'.repeat(1001);
      
      const result = await reviewService.createReview(
        'rating-004',
        'trans-100',
        'Transporter Name',
        'farmer-001',
        'Farmer Name',
        longText
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceed');
    });
  });

  describe('Review Analytics', () => {
    
    test('should calculate review analytics', async () => {
      // Create some reviews
      await reviewService.createReview(
        'rating-001',
        'trans-200',
        'Transporter Name',
        'farmer-001',
        'Farmer Name',
        'Excellent service! Very professional.'
      );

      await reviewService.createReview(
        'rating-002',
        'trans-200',
        'Transporter Name',
        'farmer-002',
        'Farmer Name',
        'Good service, timely delivery.'
      );

      const analytics = await reviewService.getReviewAnalytics('trans-200');

      expect(analytics).toBeDefined();
      expect(analytics.transporterId).toBe('trans-200');
    });
  });

  describe('Marking Reviews Helpful', () => {
    
    test('should mark review as helpful', async () => {
      // Create a review first
      const reviewResult = await reviewService.createReview(
        'rating-010',
        'trans-300',
        'Transporter Name',
        'farmer-001',
        'Farmer Name',
        'This is a helpful review comment.'
      );

      if (reviewResult.success && reviewResult.data) {
        const result = await reviewService.markHelpful(reviewResult.data.id, true);

        expect(result.success).toBe(true);
      }
    });

    test('should mark review as not helpful', async () => {
      // Create a review first
      const reviewResult = await reviewService.createReview(
        'rating-011',
        'trans-300',
        'Transporter Name',
        'farmer-001',
        'Farmer Name',
        'This is another review comment.'
      );

      if (reviewResult.success && reviewResult.data) {
        const result = await reviewService.markHelpful(reviewResult.data.id, false);

        expect(result.success).toBe(true);
      }
    });
  });

  describe('Flagging Reviews', () => {
    
    test('should flag a review', async () => {
      // Create a review first
      const reviewResult = await reviewService.createReview(
        'rating-020',
        'trans-400',
        'Transporter Name',
        'farmer-001',
        'Farmer Name',
        'This is a review that needs to be flagged.'
      );

      if (reviewResult.success && reviewResult.data) {
        const result = await reviewService.flagReview(reviewResult.data.id, 'inappropriate');

        expect(result.success).toBe(true);
      }
    });
  });
});