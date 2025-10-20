// Mock Crop Service for Testing
// Provides local crop management when backend is unavailable

import AsyncStorage from '@react-native-async-storage/async-storage';

interface MockCrop {
  _id: string;
  id: string;
  name: string;
  farmerId: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  status: 'available' | 'listed' | 'sold' | 'unavailable';
  description?: string;
  category?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  } | string;
  harvestDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock crop database (in-memory)
let mockCrops: MockCrop[] = [
  {
    _id: 'crop_1',
    id: 'crop_1',
    name: 'Tomatoes',
    farmerId: '+250700000001',
    quantity: 500,
    unit: 'kg',
    pricePerUnit: 500,
    status: 'listed',
    description: 'Fresh, ripe tomatoes from local farm',
    category: 'Vegetables',
    location: {
      latitude: -1.9403,
      longitude: 29.8739,
      address: 'Kigali, Rwanda',
    },
    harvestDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'crop_2',
    id: 'crop_2',
    name: 'Potatoes',
    farmerId: '+250700000001',
    quantity: 800,
    unit: 'kg',
    pricePerUnit: 400,
    status: 'listed',
    description: 'High-quality potatoes, suitable for wholesale',
    category: 'Root Vegetables',
    location: {
      latitude: -1.9403,
      longitude: 29.8739,
      address: 'Kigali, Rwanda',
    },
    harvestDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'crop_3',
    id: 'crop_3',
    name: 'Cabbage',
    farmerId: '+250700000001',
    quantity: 300,
    unit: 'kg',
    pricePerUnit: 300,
    status: 'available',
    description: 'Organic cabbage, pesticide-free',
    category: 'Vegetables',
    location: {
      latitude: -1.9403,
      longitude: 29.8739,
      address: 'Kigali, Rwanda',
    },
    harvestDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'crop_4',
    id: 'crop_4',
    name: 'Carrots',
    farmerId: '+250700000001',
    quantity: 200,
    unit: 'kg',
    pricePerUnit: 350,
    status: 'listed',
    description: 'Sweet and crunchy carrots',
    category: 'Root Vegetables',
    location: {
      latitude: -1.9403,
      longitude: 29.8739,
      address: 'Kigali, Rwanda',
    },
    harvestDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const generateId = () => 'crop_' + Math.random().toString(36).substr(2, 9);

export const mockCropService = {
  /**
   * Get all crops
   */
  getAllCrops: async () => {
    try {
      const stored = await AsyncStorage.getItem('mockCrops');
      if (stored) {
        return JSON.parse(stored);
      }
      return mockCrops;
    } catch (error) {
      console.log('Using default mock crops');
      return mockCrops;
    }
  },

  /**
   * Get crop by ID
   */
  getCropById: async (id: string) => {
    const crop = mockCrops.find((c) => c._id === id || c.id === id);
    if (!crop) {
      throw new Error('Crop not found');
    }
    return crop;
  },

  /**
   * Create a new crop
   */
  createCrop: async (cropData: any) => {
    try {
      // Create new crop with explicit properties
      const newCrop = Object.assign({}, {
        _id: generateId(),
        id: generateId(),
        name: cropData?.name || '',
        farmerId: cropData?.farmerId || '',
        quantity: cropData?.quantity || 0,
        unit: cropData?.unit || 'kg',
        pricePerUnit: cropData?.pricePerUnit || 0,
        status: 'available',
        description: cropData?.description || '',
        category: cropData?.category || '',
        location: cropData?.location || '',
        harvestDate: cropData?.harvestDate || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }) as MockCrop;

      mockCrops = [...mockCrops, newCrop];
      await AsyncStorage.setItem('mockCrops', JSON.stringify(mockCrops));
      return newCrop;
    } catch (error: any) {
      console.error('Error in createCrop:', error.message);
      throw error;
    }
  },

  /**
   * Update crop details
   */
  updateCrop: async (id: string, cropData: any) => {
    try {
      const cropIndex = mockCrops.findIndex((c) => c._id === id || c.id === id);

      if (cropIndex === -1) {
        throw new Error('Crop not found');
      }

      const updatedCrop = Object.assign({}, mockCrops[cropIndex], cropData, {
        updatedAt: new Date().toISOString(),
      }) as MockCrop;

      mockCrops = [...mockCrops.slice(0, cropIndex), updatedCrop, ...mockCrops.slice(cropIndex + 1)];
      await AsyncStorage.setItem('mockCrops', JSON.stringify(mockCrops));
      return updatedCrop;
    } catch (error: any) {
      console.error('Error in updateCrop:', error.message);
      throw error;
    }
  },

  /**
   * Delete a crop
   */
  deleteCrop: async (id: string) => {
    const cropIndex = mockCrops.findIndex((c) => c._id === id || c.id === id);

    if (cropIndex === -1) {
      throw new Error('Crop not found');
    }

    const deletedCrop = mockCrops[cropIndex];
    mockCrops.splice(cropIndex, 1);
    await AsyncStorage.setItem('mockCrops', JSON.stringify(mockCrops));
    return deletedCrop;
  },

  /**
   * Initialize mock crops (call on app start)
   */
  initializeMockCrops: async () => {
    try {
      const stored = await AsyncStorage.getItem('mockCrops');
      if (stored) {
        mockCrops = JSON.parse(stored);
      }
    } catch (error) {
      console.log('Using default mock crops');
    }
  },
};

export default mockCropService;