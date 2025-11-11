// src/services/transporterService.ts
import api from './api';
import { logger } from '../utils/logger';

/**
 * Backend Transporter Response Type
 * Matches: Node.js + Express backend response format
 */
interface BackendTransporterResponse {
  success: boolean;
  message: string;
  data: any; // Single transporter or array of transporters
}

export interface Transporter {
  _id: string;
  id?: string; // For backward compatibility
  userId: string;
  name: string;
  phone: string;
  vehicle_type: 'bicycle' | 'motorcycle' | 'car' | 'van' | 'truck' | 'lorry';
  capacity: number;
  rates: number;
  available: boolean;
  location?: string;
  rating?: number;
  completedDeliveries?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get all transporters - connects to real backend API
 */
export const getAllTransporters = async (): Promise<Transporter[]> => {
  try {
    logger.info('Fetching all transporters from backend API');
    const response = await api.get<BackendTransporterResponse>('/transporters');

    const transportersData = response.data.data || response.data;
    const transportersArray = Array.isArray(transportersData) ? transportersData : [];

    logger.debug('Transporters fetched successfully', { count: transportersArray.length });
    return transportersArray;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch transporters';
    logger.error('Failed to fetch transporters', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get available transporters - connects to real backend API
 */
export const getAvailableTransporters = async (): Promise<Transporter[]> => {
  try {
    logger.info('Fetching available transporters from backend API');
    const response = await api.get<BackendTransporterResponse>('/transporters/available');

    const transportersData = response.data.data || response.data;
    const transportersArray = Array.isArray(transportersData) ? transportersData : [];

    logger.debug('Available transporters fetched successfully', { count: transportersArray.length });
    return transportersArray;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch available transporters';
    logger.error('Failed to fetch available transporters', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get transporter by ID - connects to real backend API
 */
export const getTransporterById = async (id: string): Promise<Transporter> => {
  try {
    logger.info('Fetching transporter by ID', { id });
    const response = await api.get<BackendTransporterResponse>(`/transporters/${id}`);

    const transporterData = response.data.data || response.data;
    if (!transporterData) {
      throw new Error('No transporter data received');
    }

    logger.debug('Transporter fetched successfully', { id });
    return transporterData;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch transporter';
    logger.error('Failed to fetch transporter by ID', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get my transporter profile - connects to real backend API
 */
export const getMyTransporterProfile = async (): Promise<Transporter> => {
  try {
    logger.info('Fetching my transporter profile');
    const response = await api.get<BackendTransporterResponse>('/transporters/profile/me');

    const transporterData = response.data.data || response.data;
    if (!transporterData) {
      throw new Error('No transporter profile data received');
    }

    logger.debug('Transporter profile fetched successfully');
    return transporterData;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch transporter profile';
    logger.error('Failed to fetch transporter profile', error);
    throw new Error(errorMessage);
  }
};

/**
 * Create or update my transporter profile - connects to real backend API
 */
export const createOrUpdateMyProfile = async (
  profileData: Partial<Transporter>
): Promise<Transporter> => {
  try {
    logger.info('Creating/updating transporter profile');

    const payload = {
      vehicle_type: profileData.vehicle_type,
      capacity: profileData.capacity,
      rates: profileData.rates,
      available: profileData.available,
      location: profileData.location,
      phone: profileData.phone,
      name: profileData.name,
    };

    const response = await api.post<BackendTransporterResponse>('/transporters/profile/me', payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update transporter profile');
    }

    logger.info('Transporter profile updated successfully');
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update transporter profile';
    logger.error('Failed to update transporter profile', error);
    throw new Error(errorMessage);
  }
};

/**
 * Update transporter profile by ID - connects to real backend API
 */
export const updateTransporterProfile = async (
  id: string,
  profileData: Partial<Transporter>
): Promise<Transporter> => {
  try {
    logger.info('Updating transporter profile', { id });

    const payload = {
      vehicle_type: profileData.vehicle_type,
      capacity: profileData.capacity,
      rates: profileData.rates,
      available: profileData.available,
      location: profileData.location,
      phone: profileData.phone,
      name: profileData.name,
    };

    const response = await api.put<BackendTransporterResponse>(`/transporters/${id}`, payload);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update transporter profile');
    }

    logger.info('Transporter profile updated successfully', { id });
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update transporter profile';
    logger.error('Failed to update transporter profile', error);
    throw new Error(errorMessage);
  }
};

export default {
  getAllTransporters,
  getAvailableTransporters,
  getTransporterById,
  getMyTransporterProfile,
  createOrUpdateMyProfile,
  updateTransporterProfile,
};