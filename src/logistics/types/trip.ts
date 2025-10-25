// src/logistics/types/trip.ts

export type TripStatus = 'pending' | 'accepted' | 'in_transit' | 'completed' | 'cancelled';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  contactName?: string;
  contactPhone?: string;
}

export interface Shipment {
  cropId: string;
  farmerId: string;
  quantity: number;
  unit: 'kg' | 'tons' | 'bags';
  cropName: string;
  totalValue?: number;
}

export interface Earnings {
  ratePerUnit: number;
  totalRate: number;
  status: 'pending' | 'earned' | 'paid';
  completedAt?: Date;
}

export interface Trip {
  // Core Identifiers
  _id: string;
  tripId: string; // Unique trip number (TRIP-20250101-001)
  orderId?: string; // Reference to associated shipment order
  transporterId?: string; // Assigned transporter (optional until accepted)

  // Trip Status
  status: TripStatus;

  // What's Being Transported
  shipment: Shipment;

  // Locations (can support multiple stops for consolidated shipments)
  pickup: Location;
  delivery: Location;
  waypoints?: Location[]; // Optional intermediate stops

  // Financial Tracking
  earnings: Earnings;

  // Trip Metadata
  createdAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // Actual time taken in minutes
  distance?: number; // Distance in kilometers

  // Vehicle Information
  vehicleType?: 'pickup' | 'truck' | 'van' | 'motorcycle';
  vehicleCapacity?: number; // in kg
  
  // Additional Info
  notes?: string;
}

// Helper type for creating new trips
export interface CreateTripInput {
  shipment: Shipment;
  pickup: Location;
  delivery: Location;
  ratePerUnit?: number;
  estimatedDuration?: number;
}

// Helper type for trip updates
export interface UpdateTripInput {
  status?: TripStatus;
  transporterId?: string;
  startedAt?: Date;
  completedAt?: Date;
}