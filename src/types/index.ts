// src/types/index.ts

// Two-role logistics platform: Shippers request transport, Transporters deliver
export type UserRole = 'shipper' | 'transporter';

// Legacy role mapping for backward compatibility
export type LegacyUserRole = 'farmer' | 'buyer';
export const roleMigrationMap: Record<LegacyUserRole, UserRole> = {
  farmer: 'shipper',
  buyer: 'shipper', // Buyers are now also shippers (anyone can request transport)
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
  status: 'listed' | 'matched' | 'picked_up' | 'in_transit' | 'delivered';
  pricePerUnit?: number;
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
  data: Partial<Omit<Cargo, '_id' | 'id' | 'shipperId'>>;
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