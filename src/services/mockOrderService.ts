// Mock Transport Request Service for Testing
// Two-role system: shippers request transport, transporters deliver
// Provides local order management when backend is unavailable

import AsyncStorage from '@react-native-async-storage/async-storage';

interface MockOrder {
  _id: string;
  id: string;
  shipperId: string; // Who requests transport (formerly farmerId)
  transporterId?: string; // Who delivers
  cargoId: string; // Reference to cargo
  quantity: number;
  unit?: 'kg' | 'tons' | 'bags';
  transportFee: number; // Payment to transporter (formerly totalPrice)
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
    contactName?: string;
    contactPhone?: string;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
    contactName?: string;
    contactPhone?: string;
  };
  deliveryNotes?: string;
}

// Mock transport request database (in-memory)
// Two-role system: shipper requests, transporter delivers
let mockOrders: MockOrder[] = [
  {
    _id: 'order_1',
    id: 'order_1',
    shipperId: '1', // Shipper requesting transport
    transporterId: '3', // Assigned transporter
    cargoId: 'cargo_1',
    quantity: 100,
    unit: 'kg',
    transportFee: 50000,
    status: 'in_progress',
    pickupLocation: {
      latitude: -2.0,
      longitude: 29.7,
      address: 'Farmer Market, Kigali',
      contactName: 'John Farmer',
      contactPhone: '+250700000001',
    },
    deliveryLocation: {
      latitude: -2.1,
      longitude: 29.8,
      address: 'Central Market, Kigali',
      contactName: 'Market Manager',
      contactPhone: '+250788123456',
    },
    deliveryNotes: 'Fresh produce, deliver by noon',
  },
  {
    _id: 'order_2',
    id: 'order_2',
    shipperId: '1',
    transporterId: '3',
    cargoId: 'cargo_2', // Potatoes
    quantity: 200,
    unit: 'kg',
    transportFee: 80000,
    status: 'completed',
    pickupLocation: {
      latitude: -2.0,
      longitude: 29.7,
      address: 'Farmer Market, Kigali',
      contactName: 'John Farmer',
      contactPhone: '+250700000001',
    },
    deliveryLocation: {
      latitude: -2.2,
      longitude: 29.9,
      address: 'Downtown Market, Kigali',
      contactName: 'Store Owner',
      contactPhone: '+250788234567',
    },
  },
  {
    _id: 'order_3',
    id: 'order_3',
    shipperId: '1',
    cargoId: 'cargo_3', // Tomatoes
    quantity: 150,
    unit: 'kg',
    transportFee: 60000,
    status: 'pending',
    pickupLocation: {
      latitude: -2.0,
      longitude: 29.7,
      address: 'Farmer Market, Kigali',
      contactName: 'John Farmer',
      contactPhone: '+250700000001',
    },
    deliveryLocation: {
      latitude: -2.3,
      longitude: 29.85,
      address: 'Neighborhood Market, Kigali',
      contactName: 'Recipient',
      contactPhone: '+250788345678',
    },
    deliveryNotes: 'Handle gently, fragile items',
  },
  {
    _id: 'order_4',
    id: 'order_4',
    shipperId: '1',
    transporterId: '3',
    cargoId: 'cargo_1', // Beans
    quantity: 80,
    unit: 'kg',
    transportFee: 32000,
    status: 'accepted',
    pickupLocation: {
      latitude: -2.0,
      longitude: 29.7,
      address: 'Farmer Market, Kigali',
      contactName: 'John Farmer',
      contactPhone: '+250700000001',
    },
    deliveryLocation: {
      latitude: -2.15,
      longitude: 29.9,
      address: 'Business District, Kigali',
      contactName: 'Office Manager',
      contactPhone: '+250788456789',
    },
    deliveryNotes: 'Office hours delivery preferred',
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
      return mockOrders;
    }
  },

  /**
   * Create a new order
   */
  createOrder: async (orderData: any) => {
    try {

      const orderId = generateId();
      const newOrder = {
        _id: orderId,
        id: orderId,
        // Support both old and new field names
        shipperId: orderData?.shipperId || orderData?.farmerId || '',
        transporterId: orderData?.transporterId || '',
        cargoId: orderData?.cargoId || orderData?.cropId || orderData?.crop_id || '',
        quantity: orderData?.quantity || 0,
        unit: orderData?.unit || 'kg',
        transportFee: orderData?.transportFee || orderData?.totalPrice || 0,
        status: (orderData?.status || 'pending') as 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled',
        pickupLocation: orderData?.pickupLocation || {
          latitude: 0,
          longitude: 0,
          address: '',
        },
        deliveryLocation: orderData?.deliveryLocation || {
          latitude: 0,
          longitude: 0,
          address: '',
        },
        deliveryNotes: orderData?.deliveryNotes || '',
        requestedDate: orderData?.requestedDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as MockOrder;

      mockOrders = [...mockOrders, newOrder];
      await AsyncStorage.setItem('mockOrders', JSON.stringify(mockOrders));
            return newOrder;
    } catch (error: any) {
      console.error('❌ Error in createOrder:', error.message);
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
            const orderIndex = mockOrders.findIndex((o) => o._id === id || o.id === id);

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
    }
  },
};

export default mockOrderService;