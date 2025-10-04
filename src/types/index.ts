// src/types/index.ts

export type UserRole = 'farmer' | 'transporter' | 'buyer';

export interface User {
  id: string;
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
  id: string;
  farmerId: string;
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
  id: string;
  cropId: string;
  farmerId: string;
  buyerId: string;
  transporterId?: string;
  quantity: number;
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