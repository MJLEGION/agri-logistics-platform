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
  status: 'available' | 'listed' | 'sold' | 'unavailable' | 'payment_completed' | 'picked_up' | 'in_transit' | 'delivered' | 'matched';
  description?: string;
  category?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  } | string;
  destination?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  } | null;
  readyDate?: string;
  distance?: number;
  eta?: number;
  shippingCost?: number;
  suggestedVehicle?: string;
  paymentDetails?: {
    transactionId: string;
    referenceId: string;
    amount: number;
    timestamp: string;
    method: string;
  };
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
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
      latitude: -1.9536,
      longitude: 30.0605,
      address: 'Kigali, Rwanda',
    },
    destination: {
      latitude: -1.5,
      longitude: 29.6,
      address: 'Musanze, Rwanda',
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
      latitude: -1.9536,
      longitude: 30.0605,
      address: 'Kigali, Rwanda',
    },
    destination: {
      latitude: -2.5974,
      longitude: 29.7399,
      address: 'Huye (Butare), Rwanda',
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
      latitude: -1.9536,
      longitude: 30.0605,
      address: 'Kigali, Rwanda',
    },
    destination: {
      latitude: -1.9486,
      longitude: 30.0872,
      address: 'Nyarutarama, Kigali',
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
      latitude: -1.9536,
      longitude: 30.0605,
      address: 'Kigali, Rwanda',
    },
    destination: {
      latitude: -1.9571,
      longitude: 30.0994,
      address: 'Remera, Kigali',
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
        mockCargo = JSON.parse(stored); // Update in-memory cache
                        return mockCargo;
      }
            return mockCargo;
    } catch (error) {
      console.error('❌ AsyncStorage error loading cargo:', error);
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
      
      // Validate required fields
      if (!cargoData?.name) {
        throw new Error('Cargo name is required');
      }
      if (!cargoData?.quantity) {
        throw new Error('Cargo quantity is required');
      }
      if (!cargoData?.shipperId) {
        throw new Error('Shipper ID is required - please make sure you are logged in');
      }

      const id = generateId();
      const newCargo: MockCargo = {
        _id: id,
        id: id,
        name: cargoData?.name || '',
        shipperId: cargoData?.shipperId || '',
        quantity: cargoData?.quantity || 0,
        unit: cargoData?.unit || 'kg',
        pricePerUnit: cargoData?.pricePerUnit || 0,
        status: cargoData?.status || 'listed',
        description: cargoData?.description || '',
        category: cargoData?.category || '',
        location: cargoData?.location || {},
        destination: cargoData?.destination || null,
        readyDate: cargoData?.readyDate || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...cargoData,
        _id: id,
        id: id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('%c✅ mockCargoService.createCargo - INPUT cargoData:', 'color: #FF6F00; font-weight: bold', {
        name: cargoData?.name,
        quantity: cargoData?.quantity,
        unit: cargoData?.unit,
        pricePerUnit: cargoData?.pricePerUnit,
        destination: cargoData?.destination,
        shippingCost: cargoData?.shippingCost,
        distance: cargoData?.distance,
        eta: cargoData?.eta,
      });

      console.log('%c✅ mockCargoService.createCargo - STORED cargo:', 'color: #4CAF50; font-weight: bold', {
        cargoId: id,
        name: newCargo.name,
        quantity: newCargo.quantity,
        unit: newCargo.unit,
        pricePerUnit: newCargo.pricePerUnit,
        cargoValue: (newCargo.pricePerUnit || 0) * (newCargo.quantity || 0),
        destination: newCargo.destination,
        shippingCost: newCargo.shippingCost,
        distance: newCargo.distance,
        eta: newCargo.eta,
      });

      mockCargo = [...mockCargo, newCargo];
      
      // Save to AsyncStorage with error handling
      try {
        const jsonData = JSON.stringify(mockCargo);
        await AsyncStorage.setItem('mockCargo', jsonData);
      } catch (storageError) {
        console.error('%c⚠️ Warning: Could not save cargo to AsyncStorage:', 'color: #FF9800; font-weight: bold', storageError);
      }
      
      return newCargo;
    } catch (error: any) {
      console.error('%c❌ Error in createCargo:', 'color: #F44336; font-size: 13px; font-weight: bold', error.message);
      console.error('%c📋 Error details:', 'color: #F44336; font-weight: bold', error);
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
    try {
      
      const cargoIndex = mockCargo.findIndex((c) => c._id === id || c.id === id);

      if (cargoIndex === -1) {
        throw new Error('Cargo not found');
      }

      const deletedCargo = mockCargo[cargoIndex];
      
      // Use spread operator instead of splice to avoid read-only array issue
      mockCargo = [...mockCargo.slice(0, cargoIndex), ...mockCargo.slice(cargoIndex + 1)];
      await AsyncStorage.setItem('mockCargo', JSON.stringify(mockCargo));
      
      
      return deletedCargo;
    } catch (error: any) {
      console.error('%c❌ Error deleting cargo:', 'color: #F44336; font-weight: bold', error.message);
      throw error;
    }
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
    }
  },
};

export default mockCargoService;