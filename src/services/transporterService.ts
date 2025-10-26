// src/services/transporterService.ts
import api from './api';

export interface Transporter {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  phone: string;
  vehicle_type: string;
  capacity: number;
  rates: number;
  available: boolean;
  location?: string;
  rating?: number;
  userId?: string;
}

/**
 * Get all transporters
 */
export const getAllTransporters = async (): Promise<Transporter[]> => {
  try {
    const response = await api.get<Transporter[]>('/transporters');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch transporters:', error);
    throw error;
  }
};

/**
 * Get available transporters
 */
export const getAvailableTransporters = async (): Promise<Transporter[]> => {
  try {
    const response = await api.get<Transporter[]>('/transporters/available');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch available transporters:', error);
    throw error;
  }
};

/**
 * Get transporter by ID
 */
export const getTransporterById = async (id: string): Promise<Transporter> => {
  try {
    const response = await api.get<Transporter>(`/transporters/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch transporter:', error);
    throw error;
  }
};

/**
 * Update transporter profile (for logged-in transporter)
 */
export const updateTransporterProfile = async (
  id: string,
  profileData: Partial<Transporter>
): Promise<Transporter> => {
  try {
    const response = await api.put<Transporter>(`/transporters/${id}`, {
      vehicle_type: profileData.vehicle_type,
      capacity: profileData.capacity,
      rates: profileData.rates,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update transporter profile:', error);
    throw error;
  }
};

export default {
  getAllTransporters,
  getAvailableTransporters,
  getTransporterById,
  updateTransporterProfile,
};