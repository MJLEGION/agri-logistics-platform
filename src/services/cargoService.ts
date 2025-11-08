// src/services/cargoService.ts
import api from './api';
import { Cargo } from '../types';
import { logger } from '../utils/logger';

/**
 * Backend Crop Response Type
 * Matches: Node.js + Express backend response format
 */
interface BackendCropResponse {
  success: boolean;
  message: string;
  data: any; // Single crop or array of crops
}

/**
 * Backend Crop Model (from MongoDB)
 * Note: Backend uses "farmerId" and "harvestDate" while frontend uses "shipperId" and "readyDate"
 */
interface BackendCrop {
  _id: string;
  farmerId: string;
  name: string;
  quantity: number;
  unit: 'kg' | 'tons' | 'bags';
  pricePerUnit?: number;
  harvestDate: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'listed' | 'matched' | 'picked_up' | 'in_transit' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

/**
 * Map backend crop to frontend cargo format
 */
const mapBackendCropToCargo = (crop: BackendCrop): Cargo => ({
  _id: crop._id,
  id: crop._id,
  shipperId: crop.farmerId, // Backend uses "farmerId", frontend uses "shipperId"
  name: crop.name,
  quantity: crop.quantity,
  unit: crop.unit,
  readyDate: crop.harvestDate, // Backend uses "harvestDate", frontend uses "readyDate"
  location: crop.location,
  status: crop.status,
  pricePerUnit: crop.pricePerUnit,
  createdAt: crop.createdAt,
  updatedAt: crop.updatedAt,
});

/**
 * Map frontend cargo to backend crop format
 */
const mapCargoToBackendCrop = (cargo: Partial<Cargo>): Partial<BackendCrop> => {
  const backendCrop: any = {};

  if (cargo.shipperId) backendCrop.farmerId = cargo.shipperId;
  if (cargo.name) backendCrop.name = cargo.name;
  if (cargo.quantity !== undefined) backendCrop.quantity = cargo.quantity;
  if (cargo.unit) backendCrop.unit = cargo.unit;
  if (cargo.pricePerUnit !== undefined) backendCrop.pricePerUnit = cargo.pricePerUnit;
  if (cargo.readyDate) backendCrop.harvestDate = cargo.readyDate;
  if (cargo.location) backendCrop.location = cargo.location;
  if (cargo.status) backendCrop.status = cargo.status;

  return backendCrop;
};

/**
 * Get all cargo - connects to real backend API
 */
export const getAllCargo = async (): Promise<Cargo[]> => {
  try {
    logger.info('Fetching all cargo from backend API');
    const response = await api.get<BackendCropResponse>('/crops');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch cargo');
    }

    const cropsData = response.data.data;
    const cropsArray = Array.isArray(cropsData) ? cropsData : [];

    logger.debug('Cargo fetched successfully', { count: cropsArray.length });

    // Map backend crops to frontend cargo format
    return cropsArray.map(mapBackendCropToCargo);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch cargo';
    logger.error('Failed to fetch cargo', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get cargo by ID - connects to real backend API
 */
export const getCargoById = async (id: string): Promise<Cargo> => {
  try {
    logger.info('Fetching cargo by ID', { id });
    const response = await api.get<BackendCropResponse>(`/crops/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch cargo');
    }

    logger.debug('Cargo fetched successfully', { id });

    // Map backend crop to frontend cargo format
    return mapBackendCropToCargo(response.data.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch cargo';
    logger.error('Failed to fetch cargo by ID', error);
    throw new Error(errorMessage);
  }
};

/**
 * Create a new cargo - connects to real backend API
 */
export const createCargo = async (
  cargoData: Omit<Cargo, '_id' | 'id'>
): Promise<Cargo> => {
  try {
    logger.info('Creating new cargo', { name: cargoData.name, quantity: cargoData.quantity });

    // Map frontend cargo format to backend crop format
    const backendCropData = mapCargoToBackendCrop(cargoData);

    const response = await api.post<BackendCropResponse>('/crops', backendCropData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create cargo');
    }

    logger.info('Cargo created successfully', { id: response.data.data._id });

    // Map backend crop to frontend cargo format
    return mapBackendCropToCargo(response.data.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create cargo';
    logger.error('Failed to create cargo', error);
    throw new Error(errorMessage);
  }
};

/**
 * Update cargo - connects to real backend API
 */
export const updateCargo = async (
  id: string,
  cargoData: Partial<Omit<Cargo, '_id' | 'id' | 'shipperId'>>
): Promise<Cargo> => {
  try {
    logger.info('Updating cargo', { id });

    // Map frontend cargo format to backend crop format
    const backendCropData = mapCargoToBackendCrop(cargoData);

    const response = await api.put<BackendCropResponse>(`/crops/${id}`, backendCropData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update cargo');
    }

    logger.info('Cargo updated successfully', { id });

    // Map backend crop to frontend cargo format
    return mapBackendCropToCargo(response.data.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update cargo';
    logger.error('Failed to update cargo', error);
    throw new Error(errorMessage);
  }
};

/**
 * Delete cargo - connects to real backend API
 */
export const deleteCargo = async (id: string): Promise<void> => {
  try {
    logger.info('Deleting cargo', { id });

    const response = await api.delete<BackendCropResponse>(`/crops/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete cargo');
    }

    logger.info('Cargo deleted successfully', { id });
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete cargo';
    logger.error('Failed to delete cargo', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get cargo by user ID - connects to real backend API
 */
export const getCargoByUserId = async (userId: string): Promise<Cargo[]> => {
  try {
    logger.info('Fetching cargo by user ID', { userId });
    const response = await api.get<BackendCropResponse>(`/crops/user/${userId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch cargo');
    }

    const cropsData = response.data.data;
    const cropsArray = Array.isArray(cropsData) ? cropsData : [];

    logger.debug('Cargo fetched successfully', { userId, count: cropsArray.length });

    // Map backend crops to frontend cargo format
    return cropsArray.map(mapBackendCropToCargo);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch cargo';
    logger.error('Failed to fetch cargo by user ID', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get cargo by farmer ID - connects to real backend API
 * Note: This is an alias for getCargoByUserId for backward compatibility
 */
export const getCargoByFarmerId = async (farmerId: string): Promise<Cargo[]> => {
  try {
    logger.info('Fetching cargo by farmer ID', { farmerId });
    const response = await api.get<BackendCropResponse>(`/crops/farmer/${farmerId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch cargo');
    }

    const cropsData = response.data.data;
    const cropsArray = Array.isArray(cropsData) ? cropsData : [];

    logger.debug('Cargo fetched successfully', { farmerId, count: cropsArray.length });

    // Map backend crops to frontend cargo format
    return cropsArray.map(mapBackendCropToCargo);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch cargo';
    logger.error('Failed to fetch cargo by farmer ID', error);
    throw new Error(errorMessage);
  }
};