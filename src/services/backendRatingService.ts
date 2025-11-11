// src/services/backendRatingService.ts
import api from './api';
import { logger } from '../utils/logger';

/**
 * Backend Rating Service
 * Connects to real backend API for transporter ratings
 */

interface BackendRatingResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface RatingData {
  ratedUserId: string; // Transporter ID
  tripId?: string; // Order ID
  rating: number; // 1-5 stars
  comment?: string;
  cleanliness?: number;
  professionalism?: number;
  timeliness?: number;
  communication?: number;
}

export interface Rating {
  _id: string;
  ratedUserId: string;
  ratingUserId: string;
  tripId?: string;
  rating: number;
  comment?: string;
  cleanliness: number;
  professionalism: number;
  timeliness: number;
  communication: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransporterStats {
  transporterId: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution?: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
}

/**
 * Create a new rating for a transporter
 */
export const createRating = async (ratingData: RatingData): Promise<Rating> => {
  try {
    logger.info('Creating rating', { transporterId: ratingData.ratedUserId });

    const response = await api.post<BackendRatingResponse>('/ratings', ratingData);

    const ratingResult = response.data.data || response.data;
    if (!ratingResult || !ratingResult._id) {
      throw new Error('Failed to create rating - no data returned');
    }

    logger.info('Rating created successfully');
    return ratingResult;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create rating';
    logger.error('Failed to create rating', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get ratings for a specific transporter
 */
export const getTransporterRatings = async (transporterId: string): Promise<Rating[]> => {
  try {
    logger.info('Fetching transporter ratings', { transporterId });

    const response = await api.get<BackendRatingResponse>(`/ratings/user/${transporterId}`);

    const ratingsData = response.data.data || response.data;
    const ratingsArray = Array.isArray(ratingsData) ? ratingsData : [];

    logger.debug('Transporter ratings fetched', { count: ratingsArray.length });
    return ratingsArray;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch ratings';
    logger.error('Failed to fetch transporter ratings', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get transporter statistics (average rating, total ratings, etc.)
 */
export const getTransporterStats = async (transporterId: string): Promise<TransporterStats> => {
  try {
    logger.info('Fetching transporter stats', { transporterId });

    const response = await api.get<BackendRatingResponse>(`/ratings/transporter/${transporterId}/stats`);

    const statsData = response.data.data || response.data;
    if (!statsData) {
      throw new Error('Failed to fetch transporter stats - no data returned');
    }

    logger.debug('Transporter stats fetched');
    return statsData;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch transporter stats';
    logger.error('Failed to fetch transporter stats', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get reviews for a specific transporter
 */
export const getTransporterReviews = async (transporterId: string): Promise<Rating[]> => {
  try {
    logger.info('Fetching transporter reviews', { transporterId });

    const response = await api.get<BackendRatingResponse>(`/ratings/${transporterId}/reviews`);

    const reviewsData = response.data.data || response.data;
    const reviewsArray = Array.isArray(reviewsData) ? reviewsData : [];

    logger.debug('Transporter reviews fetched', { count: reviewsArray.length });
    return reviewsArray;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch reviews';
    logger.error('Failed to fetch transporter reviews', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get top rated transporters (leaderboard)
 */
export const getTopRatedTransporters = async (): Promise<TransporterStats[]> => {
  try {
    logger.info('Fetching top rated transporters');

    const response = await api.get<BackendRatingResponse>('/ratings/leaderboard');

    const leaderboardData = response.data.data || response.data;
    const leaderboardArray = Array.isArray(leaderboardData) ? leaderboardData : [];

    logger.debug('Leaderboard fetched', { count: leaderboardArray.length });
    return leaderboardArray;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch leaderboard';
    logger.error('Failed to fetch leaderboard', error);
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing rating
 */
export const updateRating = async (ratingId: string, updates: Partial<RatingData>): Promise<Rating> => {
  try {
    logger.info('Updating rating', { ratingId });

    const response = await api.put<BackendRatingResponse>(`/ratings/${ratingId}`, updates);

    const ratingResult = response.data.data || response.data;
    if (!ratingResult || !ratingResult._id) {
      throw new Error('Failed to update rating - no data returned');
    }

    logger.info('Rating updated successfully');
    return ratingResult;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update rating';
    logger.error('Failed to update rating', error);
    throw new Error(errorMessage);
  }
};

/**
 * Delete a rating
 */
export const deleteRating = async (ratingId: string): Promise<void> => {
  try {
    logger.info('Deleting rating', { ratingId });

    await api.delete<BackendRatingResponse>(`/ratings/${ratingId}`);

    logger.info('Rating deleted successfully');
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete rating';
    logger.error('Failed to delete rating', error);
    throw new Error(errorMessage);
  }
};

export default {
  createRating,
  getTransporterRatings,
  getTransporterStats,
  getTransporterReviews,
  getTopRatedTransporters,
  updateRating,
  deleteRating,
};
