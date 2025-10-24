// src/types/index.ts

export type UserRole = 'farmer' | 'transporter' | 'buyer';

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

export interface Crop {
  _id: string;
  id?: string; // For backward compatibility
  farmerId: string | { _id: string }; // Can be populated or just ID
  name: string;
  quantity: number;
  unit: 'kg' | 'tons' | 'bags';
  harvestDate: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'listed' | 'matched' | 'picked_up' | 'in_transit' | 'delivered';
  pricePerUnit?: number;
}

export interface Order {
  _id: string;
  id?: string; // For backward compatibility
  cropId: string;
  farmerId: string;
  buyerId: string;
  transporterId?: string;
  quantity: number;
  unit?: 'kg' | 'tons' | 'bags'; // Unit of measurement
  totalPrice: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

// Helper type for async thunk parameters
export interface UpdateCropParams {
  id: string;
  data: Partial<Omit<Crop, '_id' | 'id' | 'farmerId'>>;
}

export interface UpdateOrderParams {
  id: string;
  data: Partial<Omit<Order, '_id' | 'id'>>;
}

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