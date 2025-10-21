// src/services/cropService.ts
import api from './api';
import mockCropService from './mockCropService';
import { Crop } from '../types';

/**
 * Get all crops - tries real API first, falls back to mock
 */
export const getAllCrops = async (): Promise<Crop[]> => {
  try {
    console.log('🌾 Attempting to fetch crops from real API...');
    const response = await api.get<Crop[]>('/crops');
    console.log('✅ Fetched crops (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock crop service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock crop service
    try {
      const result = await mockCropService.getAllCrops();
      console.log('✅ Fetched crops (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to fetch crops';
      console.error('❌ Mock crop fetch failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Get crop by ID - tries real API first, falls back to mock
 */
export const getCropById = async (id: string): Promise<Crop> => {
  try {
    console.log('🌾 Attempting to fetch crop from real API...');
    const response = await api.get<Crop>(`/crops/${id}`);
    console.log('✅ Fetched crop (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock crop service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock crop service
    try {
      const result = await mockCropService.getCropById(id);
      console.log('✅ Fetched crop (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to fetch crop';
      console.error('❌ Mock crop fetch failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Create a new crop - tries real API first, falls back to mock
 */
export const createCrop = async (
  cropData: Omit<Crop, '_id' | 'id' | 'status'>
): Promise<Crop> => {
  try {
    console.log('🌾 Attempting to create crop with real API...');
    const response = await api.post<Crop>('/crops', cropData);
    console.log('✅ Crop created (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock crop service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock crop service
    try {
      const result = await mockCropService.createCrop(cropData);
      console.log('✅ Crop created (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to create crop';
      console.error('❌ Mock crop creation failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Update crop - tries real API first, falls back to mock
 */
export const updateCrop = async (
  id: string,
  cropData: Partial<Omit<Crop, '_id' | 'id' | 'farmerId'>>
): Promise<Crop> => {
  try {
    console.log('🌾 Attempting to update crop with real API...');
    const response = await api.put<Crop>(`/crops/${id}`, cropData);
    console.log('✅ Crop updated (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock crop service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock crop service
    try {
      const result = await mockCropService.updateCrop(id, cropData);
      console.log('✅ Crop updated (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to update crop';
      console.error('❌ Mock crop update failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Delete crop - tries real API first, falls back to mock
 */
export const deleteCrop = async (id: string): Promise<void> => {
  try {
    console.log('🌾 Attempting to delete crop with real API...');
    await api.delete(`/crops/${id}`);
    console.log('✅ Crop deleted (Real API)');
  } catch (error) {
    console.log('⚠️ Real API failed, using mock crop service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock crop service
    try {
      const result = await mockCropService.deleteCrop(id);
      console.log('✅ Crop deleted (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to delete crop';
      console.error('❌ Mock crop delete failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};