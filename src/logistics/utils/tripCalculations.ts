// src/logistics/utils/tripCalculations.ts

import { Trip, TripStatus } from '../types/trip';

/**
 * Calculate total earnings for a list of trips
 */
export const calculateTotalEarnings = (trips: Trip[]): number => {
  return trips
    .filter(trip => trip.earnings.status === 'earned')
    .reduce((sum, trip) => sum + trip.earnings.totalRate, 0);
};

/**
 * Calculate pending earnings (not yet paid)
 */
export const calculatePendingEarnings = (trips: Trip[]): number => {
  return trips
    .filter(trip => trip.earnings.status === 'pending')
    .reduce((sum, trip) => sum + trip.earnings.totalRate, 0);
};

/**
 * Calculate paid earnings
 */
export const calculatePaidEarnings = (trips: Trip[]): number => {
  return trips
    .filter(trip => trip.earnings.status === 'paid')
    .reduce((sum, trip) => sum + trip.earnings.totalRate, 0);
};

/**
 * Filter trips by status
 */
export const filterTripsByStatus = (trips: Trip[], status: TripStatus): Trip[] => {
  return trips.filter(trip => trip.status === status);
};

/**
 * Filter trips by transporter
 */
export const filterTripsByTransporter = (trips: Trip[], transporterId: string): Trip[] => {
  return trips.filter(trip => trip.transporterId === transporterId);
};

/**
 * Get pending trips (available to accept)
 */
export const getPendingTripsForTransporter = (trips: Trip[]): Trip[] => {
  return trips.filter(trip => trip.status === 'pending' && !trip.transporterId);
};

/**
 * Get active trips for a transporter
 */
export const getActiveTripsForTransporter = (trips: Trip[], transporterId: string): Trip[] => {
  return trips.filter(
    trip =>
      trip.transporterId === transporterId &&
      (trip.status === 'accepted' || trip.status === 'in_transit')
  );
};

/**
 * Get completed trips for a transporter
 */
export const getCompletedTripsForTransporter = (trips: Trip[], transporterId: string): Trip[] => {
  return trips.filter(
    trip => trip.transporterId === transporterId && trip.status === 'completed'
  );
};

/**
 * Get trip history for a transporter (completed and cancelled)
 */
export const getTripHistoryForTransporter = (trips: Trip[], transporterId: string): Trip[] => {
  return trips.filter(
    trip =>
      trip.transporterId === transporterId &&
      (trip.status === 'completed' || trip.status === 'cancelled')
  );
};

/**
 * Calculate trip duration in minutes (from accepted to completed)
 */
export const calculateTripDuration = (trip: Trip): number | null => {
  if (!trip.acceptedAt || !trip.completedAt) {
    return null;
  }
  return Math.round(
    (trip.completedAt.getTime() - trip.acceptedAt.getTime()) / (1000 * 60)
  );
};

/**
 * Calculate earnings per minute
 */
export const calculateEarningsPerMinute = (trip: Trip): number => {
  const duration = calculateTripDuration(trip);
  if (!duration || duration === 0) {
    return 0;
  }
  return trip.earnings.totalRate / duration;
};

/**
 * Get trip statistics for a transporter
 */
export interface TripStats {
  totalTrips: number;
  pendingTrips: number;
  activeTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalEarnings: number;
  pendingEarnings: number;
  averageEarningsPerTrip: number;
  completionRate: number; // percentage
}

export const getTransporterTripStats = (trips: Trip[], transporterId: string): TripStats => {
  const transporterTrips = filterTripsByTransporter(trips, transporterId);
  const completedTrips = getCompletedTripsForTransporter(trips, transporterId);
  const activeTrips = getActiveTripsForTransporter(trips, transporterId);
  const pendingTrips = getPendingTripsForTransporter(trips);

  const totalEarnings = calculateTotalEarnings(completedTrips);
  const pendingEarnings = calculatePendingEarnings(transporterTrips);

  const completionRate =
    transporterTrips.length === 0
      ? 0
      : (completedTrips.length / transporterTrips.length) * 100;

  return {
    totalTrips: transporterTrips.length,
    pendingTrips: pendingTrips.length,
    activeTrips: activeTrips.length,
    completedTrips: completedTrips.length,
    cancelledTrips: transporterTrips.filter(t => t.status === 'cancelled').length,
    totalEarnings,
    pendingEarnings,
    averageEarningsPerTrip:
      completedTrips.length === 0 ? 0 : totalEarnings / completedTrips.length,
    completionRate,
  };
};

/**
 * Sort trips by date (newest first)
 */
export const sortTripsByDate = (trips: Trip[], descending = true): Trip[] => {
  return [...trips].sort((a, b) => {
    const dateA = a.createdAt.getTime();
    const dateB = b.createdAt.getTime();
    return descending ? dateB - dateA : dateA - dateB;
  });
};

/**
 * Sort trips by earnings (highest first)
 */
export const sortTripsByEarnings = (trips: Trip[], descending = true): Trip[] => {
  return [...trips].sort((a, b) => {
    const earningsA = a.earnings.totalRate;
    const earningsB = b.earnings.totalRate;
    return descending ? earningsB - earningsA : earningsA - earningsB;
  });
};

/**
 * Format trip ID for display
 */
export const formatTripId = (trip: Trip): string => {
  return trip.tripId || trip._id;
};

/**
 * Get trip status badge color (for UI)
 */
export const getTripStatusColor = (status: TripStatus): string => {
  switch (status) {
    case 'pending':
      return '#FFA500'; // Orange
    case 'accepted':
      return '#0066CC'; // Blue
    case 'in_transit':
      return '#0066CC'; // Blue
    case 'completed':
      return '#00AA00'; // Green
    case 'cancelled':
      return '#CC0000'; // Red
    default:
      return '#666666'; // Gray
  }
};

/**
 * Get trip status label
 */
export const getTripStatusLabel = (status: TripStatus): string => {
  switch (status) {
    case 'pending':
      return 'Available';
    case 'accepted':
      return 'Accepted';
    case 'in_transit':
      return 'In Transit';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};