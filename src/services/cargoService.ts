// src/services/cargoService.ts
import api from './api';
import mockCargoService from './mockCargoService';
import { Cargo } from '../types';

/**
 * Get all cargo - tries real API first, falls back to mock
 */
export const getAllCargo = async (): Promise<Cargo[]> => {
  try {
    console.log('📦 Attempting to fetch cargo from real API...');
    const response = await api.get<Cargo[]>('/cargo');
    console.log('✅ Fetched cargo (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock cargo service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock cargo service
    try {
      const result = await mockCargoService.getAllCargo();
      console.log('✅ Fetched cargo (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to fetch cargo';
      console.error('❌ Mock cargo fetch failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Get cargo by ID - tries real API first, falls back to mock
 */
export const getCargoById = async (id: string): Promise<Cargo> => {
  try {
    console.log('📦 Attempting to fetch cargo from real API...');
    const response = await api.get<Cargo>(`/cargo/${id}`);
    console.log('✅ Fetched cargo (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock cargo service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock cargo service
    try {
      const result = await mockCargoService.getCargoById(id);
      console.log('✅ Fetched cargo (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to fetch cargo';
      console.error('❌ Mock cargo fetch failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Create a new cargo - tries real API first, falls back to mock
 */
export const createCargo = async (
  cargoData: Omit<Cargo, '_id' | 'id' | 'status'>
): Promise<Cargo> => {
  try {
    console.log('📦 Attempting to create cargo with real API...');
    const response = await api.post<Cargo>('/cargo', cargoData);
    console.log('✅ Cargo created (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock cargo service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock cargo service
    try {
      const result = await mockCargoService.createCargo(cargoData);
      console.log('✅ Cargo created (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to create cargo';
      console.error('❌ Mock cargo creation failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Update cargo - tries real API first, falls back to mock
 */
export const updateCargo = async (
  id: string,
  cargoData: Partial<Omit<Cargo, '_id' | 'id' | 'shipperId'>>
): Promise<Cargo> => {
  try {
    console.log('📦 Attempting to update cargo with real API...');
    const response = await api.put<Cargo>(`/cargo/${id}`, cargoData);
    console.log('✅ Cargo updated (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock cargo service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock cargo service
    try {
      const result = await mockCargoService.updateCargo(id, cargoData);
      console.log('✅ Cargo updated (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to update cargo';
      console.error('❌ Mock cargo update failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Delete cargo - tries real API first, falls back to mock
 */
export const deleteCargo = async (id: string): Promise<void> => {
  try {
    console.log('📦 Attempting to delete cargo with real API...');
    await api.delete(`/cargo/${id}`);
    console.log('✅ Cargo deleted (Real API)');
  } catch (error) {
    console.log('⚠️ Real API failed, using mock cargo service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock cargo service
    try {
      const result = await mockCargoService.deleteCargo(id);
      console.log('✅ Cargo deleted (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to delete cargo';
      console.error('❌ Mock cargo delete failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};