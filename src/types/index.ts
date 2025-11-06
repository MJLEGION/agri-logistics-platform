// src/types/index.ts

// Two-role logistics platform: Shippers request transport, Transporters deliver
export type UserRole = 'shipper' | 'transporter';

// Legacy role mapping for backward compatibility
export type LegacyUserRole = 'farmer';
export const roleMigrationMap: Record<LegacyUserRole, UserRole> = {
  farmer: 'shipper',
};

// Re-export navigation types
export * from './navigation';

// Re-export logistics types
export * from '../logistics/types/trip';

export interface User {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  phone: string;
  role: UserRole;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  // Profile fields
  profilePicture?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  professionalTitle?: string;
  bio?: string;
  // Transporter specific fields
  vehicleInfo?: {
    type?: 'motorcycle' | 'van' | 'truck';
    model?: string;
    licensePlate?: string;
  };
  // Driver's license (for transporters)
  driverLicense?: {
    number?: string;
    expiryDate?: string;
    category?: string; // A, B, C, D, E
    issuingCountry?: string;
  };
  // Certifications and licenses
  certifications?: Array<{
    id: string;
    name: string;
    issuedBy: string;
    issueDate: string;
    expiryDate?: string;
    certificateNumber?: string;
    verified?: boolean;
  }>;
  // Ratings and reviews
  rating?: {
    average: number; // Average rating (0-5)
    count: number; // Total number of ratings
    breakdown?: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  // Shipper specific fields
  businessInfo?: {
    name?: string;
    type?: 'farm' | 'distributor' | 'cooperative';
    registrationNumber?: string;
  };
  // Emergency contact
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  // Preferences
  preferences?: {
    language?: 'english' | 'kinyarwanda' | 'french';
  };
  // Notification preferences
  notificationPreferences?: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    tripReminders: boolean;
  };
  // Privacy settings
  privacySettings?: {
    profileVisibility: 'public' | 'private';
    showPhone: boolean;
    showLocation: boolean;
    allowMessages: boolean;
  };
  // Profile completion status
  profileCompleted?: boolean;
  profileCompletionPercentage?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Cargo represents goods to be transported (formerly Crop)
export interface Cargo {
  _id: string;
  id?: string; // For backward compatibility
  shipperId: string | { _id: string }; // Shipper who listed the cargo
  name: string; // Cargo description (e.g., "Maize", "Coffee Beans")
  quantity: number;
  unit: 'kg' | 'tons' | 'bags';
  readyDate: string; // When cargo is ready for pickup (formerly harvestDate)
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'listed' | 'matched' | 'picked_up' | 'in_transit' | 'delivered' | 'payment_completed';
  pricePerUnit?: number;
  // Transportation details
  distance?: number; // Distance in km from origin to destination
  eta?: number; // Estimated time in minutes
  shippingCost?: number; // Pre-calculated shipping cost in RWF
  suggestedVehicle?: string; // Suggested vehicle type (moto, van, truck)
  // Payment details
  paymentDetails?: {
    transactionId: string;
    referenceId: string;
    amount: number;
    timestamp: string;
    method: string;
  };
  createdAt?: string | Date; // When cargo was listed
  updatedAt?: string | Date; // When cargo was last updated
}

// Legacy alias for backward compatibility
export type Crop = Cargo;

// Transport Request - shipper directly requests transportation service
export interface TransportRequest {
  _id: string;
  id?: string; // For backward compatibility
  cargoId: string; // Reference to cargo being transported
  shipperId: string; // Shipper requesting transport
  transporterId?: string; // Assigned transporter (optional until accepted)
  tripId?: string; // Reference to associated trip
  quantity: number;
  unit?: 'kg' | 'tons' | 'bags';
  transportFee: number; // Fee paid to transporter
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
    contactName?: string;
    contactPhone?: string;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
    contactName?: string;
    contactPhone?: string;
  };
  deliveryNotes?: string; // Special instructions for delivery
  createdAt?: Date;
  acceptedAt?: Date;
  completedAt?: Date;
}

// Legacy alias for backward compatibility
export type ShipmentOrder = TransportRequest;

// Legacy alias for backward compatibility
export type Order = ShipmentOrder;

// Helper type for async thunk parameters
export interface UpdateCargoParams {
  id: string;
  data: Partial<Omit<Cargo, '_id' | 'id'>>;
}

export interface UpdateTransportRequestParams {
  id: string;
  data: Partial<Omit<TransportRequest, '_id' | 'id'>>;
}

// Legacy aliases
export type UpdateCropParams = UpdateCargoParams;
export type UpdateShipmentOrderParams = UpdateTransportRequestParams;
export type UpdateOrderParams = UpdateTransportRequestParams;

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterData {
  name: string;
  phone: string;
  password: string;
  role: UserRole;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}