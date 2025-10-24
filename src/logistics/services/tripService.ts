// src/logistics/services/tripService.ts

import { Trip, CreateTripInput, UpdateTripInput, TripStatus } from '../types/trip';

// Mock Trip Data for Development
const MOCK_TRIPS: Trip[] = [
  {
    _id: 'TRIP_001',
    tripId: 'TRIP-20250101-001',
    transporterId: '3', // Test transporter
    status: 'in_transit',
    shipment: {
      cropId: 'CROP_001',
      farmerId: '1',
      quantity: 50,
      unit: 'kg',
      cropName: 'Tomatoes',
      totalValue: 75000,
    },
    pickup: {
      latitude: -1.9536,
      longitude: 29.8739,
      address: 'Kigali Central Market',
      contactName: 'John Farmer',
      contactPhone: '+250788123456',
    },
    delivery: {
      latitude: -1.9706,
      longitude: 29.9498,
      address: 'Kigali Business District',
      contactName: 'Store Manager',
      contactPhone: '+250788654321',
    },
    earnings: {
      ratePerUnit: 500,
      totalRate: 25000,
      status: 'pending',
    },
    createdAt: new Date('2025-01-01T08:00:00'),
    acceptedAt: new Date('2025-01-01T08:15:00'),
    startedAt: new Date('2025-01-01T08:30:00'),
    estimatedDuration: 45,
  },
  {
    _id: 'TRIP_002',
    tripId: 'TRIP-20250101-002',
    transporterId: '3', // Test transporter
    status: 'completed',
    shipment: {
      cropId: 'CROP_002',
      farmerId: '1',
      quantity: 100,
      unit: 'kg',
      cropName: 'Potatoes',
      totalValue: 120000,
    },
    pickup: {
      latitude: -1.9445,
      longitude: 29.8739,
      address: 'Rwamagana Farm',
      contactName: 'Jane Farmer',
      contactPhone: '+250788111111',
    },
    delivery: {
      latitude: -1.9500,
      longitude: 30.0588,
      address: 'Kigali Downtown',
      contactName: 'Buyer Person',
      contactPhone: '+250788222222',
    },
    earnings: {
      ratePerUnit: 450,
      totalRate: 45000,
      status: 'earned',
      completedAt: new Date('2025-01-01T10:00:00'),
    },
    createdAt: new Date('2025-01-01T06:00:00'),
    acceptedAt: new Date('2025-01-01T06:20:00'),
    startedAt: new Date('2025-01-01T06:45:00'),
    completedAt: new Date('2025-01-01T10:00:00'),
    estimatedDuration: 120,
  },
  {
    _id: 'TRIP_003',
    tripId: 'TRIP-20250101-003',
    status: 'pending',
    shipment: {
      cropId: 'CROP_003',
      farmerId: '1',
      quantity: 75,
      unit: 'kg',
      cropName: 'Carrots',
      totalValue: 90000,
    },
    pickup: {
      latitude: -1.9550,
      longitude: 29.8500,
      address: 'Nyarugunga Warehouse',
      contactName: 'Warehouse Manager',
      contactPhone: '+250788333333',
    },
    delivery: {
      latitude: -1.9700,
      longitude: 29.9200,
      address: 'Hotel Location',
      contactName: 'Chef',
      contactPhone: '+250788444444',
    },
    earnings: {
      ratePerUnit: 600,
      totalRate: 45000,
      status: 'pending',
    },
    createdAt: new Date('2025-01-01T11:00:00'),
    estimatedDuration: 60,
  },
  {
    _id: 'TRIP_004',
    tripId: 'TRIP-20250101-004',
    status: 'pending',
    shipment: {
      cropId: 'CROP_004',
      farmerId: '1',
      quantity: 200,
      unit: 'kg',
      cropName: 'Onions',
      totalValue: 150000,
    },
    pickup: {
      latitude: -1.9520,
      longitude: 29.8900,
      address: 'Central Distribution Hub',
      contactName: 'Hub Manager',
      contactPhone: '+250788555555',
    },
    delivery: {
      latitude: -1.9400,
      longitude: 29.9100,
      address: 'Retail Store',
      contactName: 'Store Owner',
      contactPhone: '+250788666666',
    },
    earnings: {
      ratePerUnit: 350,
      totalRate: 70000,
      status: 'pending',
    },
    createdAt: new Date('2025-01-01T12:00:00'),
    estimatedDuration: 75,
  },
];

let tripCounter = MOCK_TRIPS.length;

/**
 * Get all trips (with optional filters)
 */
export const getAllTrips = async (): Promise<Trip[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...MOCK_TRIPS];
};

/**
 * Get trips for a specific transporter
 */
export const getTransporterTrips = async (transporterId: string): Promise<Trip[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_TRIPS.filter(trip => trip.transporterId === transporterId);
};

/**
 * Get trips by status
 */
export const getTripsByStatus = async (status: TripStatus): Promise<Trip[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_TRIPS.filter(trip => trip.status === status);
};

/**
 * Get pending trips (available to accept)
 */
export const getPendingTrips = async (): Promise<Trip[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_TRIPS.filter(trip => trip.status === 'pending' && !trip.transporterId);
};

/**
 * Get a single trip by ID
 */
export const getTripById = async (tripId: string): Promise<Trip | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_TRIPS.find(trip => trip._id === tripId) || null;
};

/**
 * Accept a trip (assign transporter and change status)
 */
export const acceptTrip = async (tripId: string, transporterId: string): Promise<Trip> => {
  console.log(`🎯 Trip Service: acceptTrip called for trip=${tripId}, transporter=${transporterId}`);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const trip = MOCK_TRIPS.find(t => t._id === tripId);
  if (!trip) {
    throw new Error(`Trip ${tripId} not found`);
  }

  if (trip.status !== 'pending') {
    throw new Error(`Trip must be in pending status to accept. Current: ${trip.status}`);
  }

  // Update trip
  const updatedTrip: Trip = {
    ...trip,
    transporterId,
    status: 'accepted',
    acceptedAt: new Date(),
  };

  const index = MOCK_TRIPS.findIndex(t => t._id === tripId);
  MOCK_TRIPS[index] = updatedTrip;

  console.log(`✅ Trip Service: Trip accepted successfully`, updatedTrip);
  return updatedTrip;
};

/**
 * Start a trip (change to in_transit)
 */
export const startTrip = async (tripId: string): Promise<Trip> => {
  console.log(`🎯 Trip Service: startTrip called for trip=${tripId}`);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const trip = MOCK_TRIPS.find(t => t._id === tripId);
  if (!trip) {
    throw new Error(`Trip ${tripId} not found`);
  }

  if (trip.status !== 'accepted') {
    throw new Error(`Trip must be accepted before starting. Current: ${trip.status}`);
  }

  const updatedTrip: Trip = {
    ...trip,
    status: 'in_transit',
    startedAt: new Date(),
  };

  const index = MOCK_TRIPS.findIndex(t => t._id === tripId);
  MOCK_TRIPS[index] = updatedTrip;

  console.log(`✅ Trip Service: Trip started successfully`, updatedTrip);
  return updatedTrip;
};

/**
 * Complete a trip (mark as completed and update earnings)
 */
export const completeTrip = async (tripId: string): Promise<Trip> => {
  console.log(`🎯 Trip Service: completeTrip called for trip=${tripId}`);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const trip = MOCK_TRIPS.find(t => t._id === tripId);
  if (!trip) {
    throw new Error(`Trip ${tripId} not found`);
  }

  if (trip.status !== 'in_transit' && trip.status !== 'accepted') {
    throw new Error(`Trip cannot be completed from ${trip.status} status`);
  }

  const completedAt = new Date();
  const updatedTrip: Trip = {
    ...trip,
    status: 'completed',
    completedAt,
    earnings: {
      ...trip.earnings,
      status: 'earned',
      completedAt,
    },
  };

  const index = MOCK_TRIPS.findIndex(t => t._id === tripId);
  MOCK_TRIPS[index] = updatedTrip;

  console.log(`✅ Trip Service: Trip completed successfully`, updatedTrip);
  return updatedTrip;
};

/**
 * Create a new trip
 */
export const createTrip = async (input: CreateTripInput): Promise<Trip> => {
  console.log(`🎯 Trip Service: createTrip called`, input);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  tripCounter++;
  const now = new Date();
  
  const newTrip: Trip = {
    _id: `TRIP_${tripCounter}`,
    tripId: `TRIP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(tripCounter).padStart(3, '0')}`,
    status: 'pending',
    shipment: input.shipment,
    pickup: input.pickup,
    delivery: input.delivery,
    earnings: {
      ratePerUnit: input.ratePerUnit || 500,
      totalRate: (input.ratePerUnit || 500) * input.shipment.quantity,
      status: 'pending',
    },
    createdAt: now,
    estimatedDuration: input.estimatedDuration || 60,
  };

  MOCK_TRIPS.push(newTrip);
  console.log(`✅ Trip Service: New trip created`, newTrip);
  return newTrip;
};

/**
 * Update a trip
 */
export const updateTrip = async (tripId: string, updates: UpdateTripInput): Promise<Trip> => {
  console.log(`🎯 Trip Service: updateTrip called for trip=${tripId}`, updates);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const trip = MOCK_TRIPS.find(t => t._id === tripId);
  if (!trip) {
    throw new Error(`Trip ${tripId} not found`);
  }

  const updatedTrip: Trip = { ...trip, ...updates };
  
  const index = MOCK_TRIPS.findIndex(t => t._id === tripId);
  MOCK_TRIPS[index] = updatedTrip;

  console.log(`✅ Trip Service: Trip updated successfully`, updatedTrip);
  return updatedTrip;
};

/**
 * Cancel a trip
 */
export const cancelTrip = async (tripId: string): Promise<Trip> => {
  console.log(`🎯 Trip Service: cancelTrip called for trip=${tripId}`);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const trip = MOCK_TRIPS.find(t => t._id === tripId);
  if (!trip) {
    throw new Error(`Trip ${tripId} not found`);
  }

  const updatedTrip: Trip = {
    ...trip,
    status: 'cancelled',
  };

  const index = MOCK_TRIPS.findIndex(t => t._id === tripId);
  MOCK_TRIPS[index] = updatedTrip;

  console.log(`✅ Trip Service: Trip cancelled successfully`, updatedTrip);
  return updatedTrip;
};