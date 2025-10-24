// Mock Order Service for Testing
// Provides local order management when backend is unavailable

import AsyncStorage from '@react-native-async-storage/async-storage';

interface MockOrder {
  _id: string;
  id: string;
  buyerId: string;
  farmerId: string;
  transporterId?: string;
  cropId: string; // Must be a string to match Order type
  quantity: number;
  unit?: 'kg' | 'tons' | 'bags';
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
}

// Mock order database (in-memory)
let mockOrders: MockOrder[] = [
  {
    _id: 'order_1',
    id: 'order_1',
    buyerId: '2',
    farmerId: '1',
    transporterId: '3',
    cropId: 'crop_1', // String ID, not object
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
  },
  {
    _id: 'order_2',
    id: 'order_2',
    buyerId: '2',
    farmerId: '1',
    transporterId: '3',
    cropId: 'crop_2', // Potatoes
    quantity: 200,
    unit: 'kg',
    totalPrice: 80000,
    status: 'completed',
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
  },
  {
    _id: 'order_3',
    id: 'order_3',
    buyerId: '2',
    farmerId: '1',
    cropId: 'crop_3', // Tomatoes
    quantity: 150,
    unit: 'kg',
    totalPrice: 60000,
    status: 'pending',
    pickupLocation: {
      latitude: -2.0,
      longitude: 29.7,
      address: 'Farmer Market, Kigali',
    },
    deliveryLocation: {
      latitude: -2.3,
      longitude: 29.85,
      address: 'Neighborhood Market, Kigali',
    },
  },
  {
    _id: 'order_4',
    id: 'order_4',
    buyerId: '2',
    farmerId: '1',
    cropId: 'crop_1', // Beans
    quantity: 80,
    unit: 'kg',
    totalPrice: 32000,
    status: 'accepted',
    pickupLocation: {
      latitude: -2.0,
      longitude: 29.7,
      address: 'Farmer Market, Kigali',
    },
    deliveryLocation: {
      latitude: -2.15,
      longitude: 29.9,
      address: 'Business District, Kigali',
    },
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
        cropId: orderData?.cropId || '', // String ID
        quantity: orderData?.quantity || 0,
        unit: orderData?.unit || 'kg',
        totalPrice: orderData?.totalPrice || 0,
        status: 'pending' as const,
        pickupLocation: orderData?.pickupLocation || {},
        deliveryLocation: orderData?.deliveryLocation || {},
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
      console.log('🔍 Mock acceptOrder: Looking for order with ID:', id);
      console.log('📋 Mock acceptOrder: Available orders:', mockOrders.map(o => ({ _id: o._id, id: o.id, status: o.status })));
      
      const orderIndex = mockOrders.findIndex((o) => o._id === id || o.id === id);
      console.log('🎯 Mock acceptOrder: Found order at index:', orderIndex);

      if (orderIndex === -1) {
        const errorMsg = `Order not found with ID: ${id}`;
        console.error('❌ Mock acceptOrder:', errorMsg);
        throw new Error(errorMsg);
      }

      if (mockOrders[orderIndex].transporterId) {
        const errorMsg = `Order already has a transporter: ${mockOrders[orderIndex].transporterId}`;
        console.error('❌ Mock acceptOrder:', errorMsg);
        throw new Error(errorMsg);
      }

      const updatedOrder = Object.assign({}, mockOrders[orderIndex], {
        transporterId: transporterId || 'mock-transporter-id',
        status: 'in_progress' as const,
      }) as MockOrder;

      mockOrders = [...mockOrders.slice(0, orderIndex), updatedOrder, ...mockOrders.slice(orderIndex + 1)];
      await AsyncStorage.setItem('mockOrders', JSON.stringify(mockOrders));
      
      console.log('✅ Mock acceptOrder: Order updated successfully:', updatedOrder);
      return updatedOrder;
    } catch (error: any) {
      console.error('❌ Error in acceptOrder:', error.message);
      throw error;
    }
  },

  /**
   * Complete a delivery (mark order as completed)
   */
  completeDelivery: async (id: string) => {
    try {
      console.log('🔍 Mock completeDelivery: Looking for order with ID:', id);
      
      const orderIndex = mockOrders.findIndex((o) => o._id === id || o.id === id);
      console.log('🎯 Mock completeDelivery: Found order at index:', orderIndex);

      if (orderIndex === -1) {
        const errorMsg = `Order not found with ID: ${id}`;
        console.error('❌ Mock completeDelivery:', errorMsg);
        throw new Error(errorMsg);
      }

      if (mockOrders[orderIndex].status === 'completed') {
        const errorMsg = `Order is already completed`;
        console.error('❌ Mock completeDelivery:', errorMsg);
        throw new Error(errorMsg);
      }

      const updatedOrder = Object.assign({}, mockOrders[orderIndex], {
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
      }) as MockOrder;

      mockOrders = [...mockOrders.slice(0, orderIndex), updatedOrder, ...mockOrders.slice(orderIndex + 1)];
      await AsyncStorage.setItem('mockOrders', JSON.stringify(mockOrders));
      
      console.log('✅ Mock completeDelivery: Order updated successfully:', updatedOrder);
      return updatedOrder;
    } catch (error: any) {
      console.error('❌ Error in completeDelivery:', error.message);
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