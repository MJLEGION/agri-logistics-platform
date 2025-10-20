// Mock Order Service for Testing
// Provides local order management when backend is unavailable

import AsyncStorage from '@react-native-async-storage/async-storage';

interface MockOrder {
  _id: string;
  id: string;
  buyerId: string;
  farmerId: string;
  transporterId?: string;
  cropId: {
    _id: string;
    id: string;
    name: string;
  };
  quantity: number;
  unit: string;
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
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock order database (in-memory)
let mockOrders: MockOrder[] = [
  {
    _id: 'order_1',
    id: 'order_1',
    buyerId: '2',
    farmerId: '1',
    transporterId: '3',
    cropId: {
      _id: 'crop_1',
      id: 'crop_1',
      name: 'Tomatoes',
    },
    quantity: 100,
    unit: 'kg',
    totalPrice: 50000,
    status: 'in_progress',
    pickupLocation: {
      latitude: -2.0,
      longitude: 29.7,
      address: 'Farmer Market, Kigali',
    },
    deliveryLocation: {
      latitude: -2.1,
      longitude: 29.8,
      address: 'Central Market, Kigali',
    },
    notes: 'Fresh tomatoes for wholesale',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'order_2',
    id: 'order_2',
    buyerId: '2',
    farmerId: '1',
    cropId: {
      _id: 'crop_2',
      id: 'crop_2',
      name: 'Potatoes',
    },
    quantity: 200,
    unit: 'kg',
    totalPrice: 80000,
    status: 'pending',
    pickupLocation: {
      latitude: -2.0,
      longitude: 29.7,
      address: 'Farmer Market, Kigali',
    },
    deliveryLocation: {
      latitude: -2.2,
      longitude: 29.9,
      address: 'Downtown Market, Kigali',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const generateId = () => 'order_' + Math.random().toString(36).substr(2, 9);

export const mockOrderService = {
  /**
   * Get all orders for the current user
   */
  getMyOrders: async () => {
    try {
      const stored = await AsyncStorage.getItem('mockOrders');
      if (stored) {
        return JSON.parse(stored);
      }
      return mockOrders;
    } catch (error) {
      console.log('Using default mock orders');
      return mockOrders;
    }
  },

  /**
   * Get all orders (admin/superuser)
   */
  getAllOrders: async () => {
    try {
      const stored = await AsyncStorage.getItem('mockOrders');
      if (stored) {
        return JSON.parse(stored);
      }
      return mockOrders;
    } catch (error) {
      console.log('Using default mock orders');
      return mockOrders;
    }
  },

  /**
   * Create a new order
   */
  createOrder: async (orderData: any) => {
    try {
      const newOrder = Object.assign({}, {
        _id: generateId(),
        id: generateId(),
        buyerId: orderData?.buyerId || '',
        farmerId: orderData?.farmerId || '',
        cropId: orderData?.cropId || {},
        quantity: orderData?.quantity || 0,
        unit: orderData?.unit || 'kg',
        totalPrice: orderData?.totalPrice || 0,
        status: 'pending' as const,
        pickupLocation: orderData?.pickupLocation || {},
        deliveryLocation: orderData?.deliveryLocation || {},
        notes: orderData?.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }) as MockOrder;

      mockOrders = [...mockOrders, newOrder];
      await AsyncStorage.setItem('mockOrders', JSON.stringify(mockOrders));
      return newOrder;
    } catch (error: any) {
      console.error('Error in createOrder:', error.message);
      throw error;
    }
  },

  /**
   * Update order status or details
   */
  updateOrder: async (id: string, data: any) => {
    try {
      const orderIndex = mockOrders.findIndex((o) => o._id === id || o.id === id);

      if (orderIndex === -1) {
        throw new Error('Order not found');
      }

      const updatedOrder = Object.assign({}, mockOrders[orderIndex], data, {
        updatedAt: new Date().toISOString(),
      }) as MockOrder;

      mockOrders = [...mockOrders.slice(0, orderIndex), updatedOrder, ...mockOrders.slice(orderIndex + 1)];
      await AsyncStorage.setItem('mockOrders', JSON.stringify(mockOrders));
      return updatedOrder;
    } catch (error: any) {
      console.error('Error in updateOrder:', error.message);
      throw error;
    }
  },

  /**
   * Accept an order (assign to transporter)
   */
  acceptOrder: async (id: string, transporterId?: string) => {
    try {
      const orderIndex = mockOrders.findIndex((o) => o._id === id || o.id === id);

      if (orderIndex === -1) {
        throw new Error('Order not found');
      }

      const updatedOrder = Object.assign({}, mockOrders[orderIndex], {
        transporterId: transporterId,
        status: 'accepted' as const,
        updatedAt: new Date().toISOString(),
      }) as MockOrder;

      mockOrders = [...mockOrders.slice(0, orderIndex), updatedOrder, ...mockOrders.slice(orderIndex + 1)];
      await AsyncStorage.setItem('mockOrders', JSON.stringify(mockOrders));
      return updatedOrder;
    } catch (error: any) {
      console.error('Error in acceptOrder:', error.message);
      throw error;
    }
  },

  /**
   * Initialize mock orders (call on app start)
   */
  initializeMockOrders: async () => {
    try {
      const stored = await AsyncStorage.getItem('mockOrders');
      if (stored) {
        mockOrders = JSON.parse(stored);
      }
    } catch (error) {
      console.log('Using default mock orders');
    }
  },
};

export default mockOrderService;