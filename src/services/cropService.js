import api from './api';
import mockCropService from './mockCropService';

/**
 * Get all crops - tries real API first, falls back to mock
 */
export const getAllCrops = async () => {
  try {
    console.log('🌾 Attempting to fetch crops from real API...');
    const response = await api.get('/crops');
    console.log('✅ Fetched crops (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock crop service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock crop service
    try {
      const result = await mockCropService.getAllCrops();
      console.log('✅ Fetched crops (Mock Service)');
      return result;
    } catch (mockError) {
      console.error('❌ Mock crop fetch failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};

/**
 * Get crop by ID - tries real API first, falls back to mock
 */
export const getCropById = async (id) => {
  try {
    console.log('🌾 Attempting to fetch crop from real API...');
    const response = await api.get(`/crops/${id}`);
    console.log('✅ Fetched crop (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock crop service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock crop service
    try {
      const result = await mockCropService.getCropById(id);
      console.log('✅ Fetched crop (Mock Service)');
      return result;
    } catch (mockError) {
      console.error('❌ Mock crop fetch failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};

/**
 * Create a new crop - tries real API first, falls back to mock
 */
export const createCrop = async (cropData) => {
  try {
    console.log('🌾 Attempting to create crop with real API...');
    const response = await api.post('/crops', cropData);
    console.log('✅ Crop created (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock crop service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock crop service
    try {
      const result = await mockCropService.createCrop(cropData);
      console.log('✅ Crop created (Mock Service)');
      return result;
    } catch (mockError) {
      console.error('❌ Mock crop creation failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};

/**
 * Update crop - tries real API first, falls back to mock
 */
export const updateCrop = async (id, cropData) => {
  try {
    console.log('🌾 Attempting to update crop with real API...');
    const response = await api.put(`/crops/${id}`, cropData);
    console.log('✅ Crop updated (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock crop service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock crop service
    try {
      const result = await mockCropService.updateCrop(id, cropData);
      console.log('✅ Crop updated (Mock Service)');
      return result;
    } catch (mockError) {
      console.error('❌ Mock crop update failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};

/**
 * Delete crop - tries real API first, falls back to mock
 */
export const deleteCrop = async (id) => {
  try {
    console.log('🌾 Attempting to delete crop with real API...');
    const response = await api.delete(`/crops/${id}`);
    console.log('✅ Crop deleted (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock crop service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock crop service
    try {
      const result = await mockCropService.deleteCrop(id);
      console.log('✅ Crop deleted (Mock Service)');
      return result;
    } catch (mockError) {
      console.error('❌ Mock crop delete failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};