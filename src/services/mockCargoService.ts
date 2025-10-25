// Mock Cargo Service for Testing
// Provides local cargo management when backend is unavailable

import AsyncStorage from '@react-native-async-storage/async-storage';

interface MockCargo {
  _id: string;
  id: string;
  name: string;
  shipperId: string;
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
  readyDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock crop database (in-memory)
let mockCargo: MockCargo[] = [
  {
    _id: 'cargo_1',
    id: 'cargo_1',
    name: 'Tomatoes',
    shipperId: '+250700000001',
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
    readyDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'cargo_2',
    id: 'cargo_2',
    name: 'Potatoes',
    shipperId: '+250700000001',
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
    readyDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'cargo_3',
    id: 'cargo_3',
    name: 'Cabbage',
    shipperId: '+250700000001',
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
    readyDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'cargo_4',
    id: 'cargo_4',
    name: 'Carrots',
    shipperId: '+250700000001',
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
    readyDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const generateId = () => 'cargo_' + Math.random().toString(36).substr(2, 9);

export const mockCargoService = {
  /**
   * Get all cargo
   */
  getAllCargo: async () => {
    try {
      const stored = await AsyncStorage.getItem('mockCargo');
      if (stored) {
        return JSON.parse(stored);
      }
      return mockCargo;
    } catch (error) {
      console.log('Using default mock cargo');
      return mockCargo;
    }
  },

  /**
   * Get cargo by ID
   */
  getCargoById: async (id: string) => {
    const cargo = mockCargo.find((c) => c._id === id || c.id === id);
    if (!cargo) {
      throw new Error('Cargo not found');
    }
    return cargo;
  },

  /**
   * Create a new cargo
   */
  createCargo: async (cargoData: any) => {
    try {
      // Create new cargo with explicit properties
      const newCargo = Object.assign({}, {
        _id: generateId(),
        id: generateId(),
        name: cargoData?.name || '',
        shipperId: cargoData?.shipperId || '',
        quantity: cargoData?.quantity || 0,
        unit: cargoData?.unit || 'kg',
        pricePerUnit: cargoData?.pricePerUnit || 0,
        status: 'available',
        description: cargoData?.description || '',
        category: cargoData?.category || '',
        location: cargoData?.location || '',
        readyDate: cargoData?.readyDate || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }) as MockCargo;

      mockCargo = [...mockCargo, newCargo];
      await AsyncStorage.setItem('mockCargo', JSON.stringify(mockCargo));
      return newCargo;
    } catch (error: any) {
      console.error('Error in createCargo:', error.message);
      throw error;
    }
  },

  /**
   * Update cargo details
   */
  updateCargo: async (id: string, cargoData: any) => {
    try {
      const cargoIndex = mockCargo.findIndex((c) => c._id === id || c.id === id);

      if (cargoIndex === -1) {
        throw new Error('Cargo not found');
      }

      const updatedCargo = Object.assign({}, mockCargo[cargoIndex], cargoData, {
        updatedAt: new Date().toISOString(),
      }) as MockCargo;

      mockCargo = [...mockCargo.slice(0, cargoIndex), updatedCargo, ...mockCargo.slice(cargoIndex + 1)];
      await AsyncStorage.setItem('mockCargo', JSON.stringify(mockCargo));
      return updatedCargo;
    } catch (error: any) {
      console.error('Error in updateCargo:', error.message);
      throw error;
    }
  },

  /**
   * Delete a cargo
   */
  deleteCargo: async (id: string) => {
    const cargoIndex = mockCargo.findIndex((c) => c._id === id || c.id === id);

    if (cargoIndex === -1) {
      throw new Error('Cargo not found');
    }

    const deletedCargo = mockCargo[cargoIndex];
    mockCargo.splice(cargoIndex, 1);
    await AsyncStorage.setItem('mockCargo', JSON.stringify(mockCargo));
    return deletedCargo;
  },

  /**
   * Initialize mock cargo (call on app start)
   */
  initializeMockCargo: async () => {
    try {
      const stored = await AsyncStorage.getItem('mockCargo');
      if (stored) {
        mockCargo = JSON.parse(stored);
      }
    } catch (error) {
      console.log('Using default mock cargo');
    }
  },
};

export default mockCargoService;