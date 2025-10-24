// src/logistics/services/logisticsSyncService.ts
/**
 * Logistics Synchronization Service
 *
 * Two-role system: Shippers request transport, Transporters deliver
 *
 * This service maintains synchronization between Transport Requests and Trips:
 * - When a Shipper creates TransportRequest → automatically create a Trip
 * - When a Transporter accepts/updates Trip → update TransportRequest status
 * - When a TransportRequest is cancelled → cancel corresponding Trip
 *
 * Direct shipper-transporter connection: no intermediary buyer/receiver role
 */

import { Trip, TripStatus, CreateTripInput } from '../types/trip';
import { ShipmentOrder } from '../../types';
import { tripService } from './tripService';

// Status mapping between Order and Trip
const ORDER_TO_TRIP_STATUS: Record<string, TripStatus> = {
  'pending': 'pending',
  'accepted': 'accepted',
  'in_progress': 'in_transit',
  'completed': 'completed',
  'cancelled': 'cancelled',
};

const TRIP_TO_ORDER_STATUS: Record<TripStatus, ShipmentOrder['status']> = {
  'pending': 'pending',
  'accepted': 'accepted',
  'in_transit': 'in_progress',
  'completed': 'completed',
  'cancelled': 'cancelled',
};

/**
 * Creates a Trip from a ShipmentOrder
 * Called automatically when an order is placed
 */
export const createTripFromOrder = async (order: ShipmentOrder): Promise<Trip> => {
  const tripInput: CreateTripInput = {
    shipment: {
      cropId: order.cargoId,
      farmerId: order.shipperId,
      quantity: order.quantity,
      unit: order.unit || 'kg',
      cropName: `Shipment #${order._id}`,
      totalValue: order.totalPrice,
    },
    pickup: {
      ...order.pickupLocation,
      contactName: 'Shipper',
      contactPhone: '+250788000000', // TODO: Get from user profile
    },
    delivery: {
      ...order.deliveryLocation,
      contactName: 'Receiver',
      contactPhone: '+250788000000', // TODO: Get from user profile
    },
    ratePerUnit: order.totalPrice / order.quantity,
  };

  const trip = await tripService.createTrip(tripInput);

  // Link the order to the trip
  console.log('📦 Created Trip', trip.tripId, 'for Order', order._id);

  return trip;
};

/**
 * Updates Order status based on Trip status changes
 */
export const syncOrderFromTrip = (trip: Trip): Partial<ShipmentOrder> => {
  const orderUpdate: Partial<ShipmentOrder> = {
    status: TRIP_TO_ORDER_STATUS[trip.status],
    transporterId: trip.transporterId,
    tripId: trip._id,
  };

  console.log('🔄 Syncing Order from Trip', trip.tripId, '→ status:', orderUpdate.status);

  return orderUpdate;
};

/**
 * Updates Trip status based on Order status changes
 */
export const syncTripFromOrder = (order: ShipmentOrder): Partial<Trip> => {
  const tripUpdate: Partial<Trip> = {
    status: ORDER_TO_TRIP_STATUS[order.status] || 'pending',
  };

  if (order.transporterId) {
    tripUpdate.transporterId = order.transporterId;
  }

  console.log('🔄 Syncing Trip from Order', order._id, '→ status:', tripUpdate.status);

  return tripUpdate;
};

/**
 * Finds the trip associated with an order
 */
export const findTripForOrder = async (orderId: string): Promise<Trip | null> => {
  const allTrips = await tripService.getAllTrips();
  return allTrips.find(trip => trip.orderId === orderId) || null;
};

/**
 * Cancels a trip when its order is cancelled
 */
export const cancelTripForOrder = async (orderId: string): Promise<void> => {
  const trip = await findTripForOrder(orderId);

  if (trip) {
    await tripService.cancelTrip(trip._id);
    console.log('🚫 Cancelled Trip', trip.tripId, 'for cancelled Order', orderId);
  }
};

/**
 * Batch sync: ensures all orders have corresponding trips
 * Useful for initial migration or data cleanup
 */
export const ensureTripsForOrders = async (orders: ShipmentOrder[]): Promise<void> => {
  console.log('🔄 Starting batch sync: ensuring trips for', orders.length, 'orders');

  for (const order of orders) {
    const existingTrip = await findTripForOrder(order._id);

    if (!existingTrip) {
      await createTripFromOrder(order);
      console.log('✅ Created missing trip for order', order._id);
    }
  }

  console.log('✅ Batch sync complete');
};

/**
 * Get logistics overview for a specific user
 * Two-role system: shipper or transporter
 */
export const getLogisticsOverview = async (userId: string, role: 'shipper' | 'transporter') => {
  const allTrips = await tripService.getAllTrips();

  switch (role) {
    case 'transporter':
      // Transporter overview: available loads, active trips, earnings
      return {
        available: allTrips.filter(t => t.status === 'pending').length,
        active: allTrips.filter(t => t.transporterId === userId && ['accepted', 'in_transit'].includes(t.status)).length,
        completed: allTrips.filter(t => t.transporterId === userId && t.status === 'completed').length,
        totalEarnings: allTrips
          .filter(t => t.transporterId === userId && t.status === 'completed')
          .reduce((sum, t) => sum + t.earnings.totalRate, 0),
      };

    case 'shipper':
      // Shipper overview: transport requests and their status
      return {
        pending: allTrips.filter(t => t.shipment.farmerId === userId && t.status === 'pending').length,
        active: allTrips.filter(t => t.shipment.farmerId === userId && !['completed', 'cancelled'].includes(t.status)).length,
        completed: allTrips.filter(t => t.shipment.farmerId === userId && t.status === 'completed').length,
        inTransit: allTrips.filter(t => t.shipment.farmerId === userId && t.status === 'in_transit').length,
      };

    default:
      return {};
  }
};

export const logisticsSyncService = {
  createTripFromOrder,
  syncOrderFromTrip,
  syncTripFromOrder,
  findTripForOrder,
  cancelTripForOrder,
  ensureTripsForOrders,
  getLogisticsOverview,
};

export default logisticsSyncService;
