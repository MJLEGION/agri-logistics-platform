// src/logistics/services/earningsService.ts

import { Trip } from '../types/trip';
import {
  calculateTotalEarnings,
  calculatePendingEarnings,
  calculatePaidEarnings,
  getTransporterTripStats,
  filterTripsByTransporter,
  getCompletedTripsForTransporter,
} from '../utils/tripCalculations';

/**
 * Get earnings summary for a transporter
 */
export const getEarningsSummary = (trips: Trip[], transporterId: string) => {
  const completedTrips = getCompletedTripsForTransporter(trips, transporterId);
  const transporterTrips = filterTripsByTransporter(trips, transporterId);

  const totalEarnings = calculateTotalEarnings(completedTrips);
  const pendingEarnings = calculatePendingEarnings(transporterTrips);
  const paidEarnings = calculatePaidEarnings(transporterTrips);

  return {
    totalEarnings,
    pendingEarnings,
    paidEarnings,
    completedTrips: completedTrips.length,
    activeTrips: transporterTrips.filter(
      t => t.status === 'accepted' || t.status === 'in_transit'
    ).length,
  };
};

/**
 * Get detailed stats for dashboard
 */
export const getEarningsStats = (trips: Trip[], transporterId: string) => {
  const stats = getTransporterTripStats(trips, transporterId);
  return {
    stats,
    summary: getEarningsSummary(trips, transporterId),
  };
};

/**
 * Get earnings breakdown by trip
 */
export const getEarningsBreakdown = (trips: Trip[], transporterId: string) => {
  const completedTrips = getCompletedTripsForTransporter(trips, transporterId);

  return completedTrips.map(trip => ({
    tripId: trip.tripId || trip._id,
    cropName: trip.shipment.cropName,
    quantity: `${trip.shipment.quantity} ${trip.shipment.unit}`,
    earnings: trip.earnings.totalRate,
    completedAt: trip.completedAt,
  }));
};

/**
 * Calculate earnings for a specific trip
 */
export const calculateTripEarnings = (
  quantity: number,
  ratePerUnit: number
): number => {
  return quantity * ratePerUnit;
};

/**
 * Mark earnings as paid (in real app, this would update backend)
 */
export const markEarningsAsPaid = async (tripIds: string[]): Promise<void> => {
  // In production, this would make an API call
  console.log('💰 Marking earnings as paid for trips:', tripIds);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
};