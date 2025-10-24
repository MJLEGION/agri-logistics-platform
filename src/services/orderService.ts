// src/services/orderService.ts
import api from './api';
import mockOrderService from './mockOrderService';
import { Order } from '../types';

/**
 * Get all orders (admin/superuser) - tries real API first, falls back to mock
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    console.log('📦 Attempting to fetch all orders from real API...');
    const response = await api.get<Order[]>('/orders');
    console.log('✅ Fetched all orders (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock order service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock order service
    try {
      const result = await mockOrderService.getAllOrders();
      console.log('✅ Fetched all orders (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to fetch orders';
      console.error('❌ Mock order fetch failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Get user's own orders - tries real API first, falls back to mock
 */
export const getMyOrders = async (): Promise<Order[]> => {
  try {
    console.log('📦 Attempting to fetch my orders from real API...');
    const response = await api.get<Order[]>('/orders/my-orders');
    console.log('✅ Fetched my orders (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock order service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock order service
    try {
      const result = await mockOrderService.getMyOrders();
      console.log('✅ Fetched my orders (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to fetch orders';
      console.error('❌ Mock order fetch failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Create a new order - tries real API first, falls back to mock
 */
export const createOrder = async (
  orderData: Omit<Order, '_id' | 'id' | 'transporterId' | 'status'>
): Promise<Order> => {
  try {
    console.log('📦 Attempting to create order with real API...');
    const response = await api.post<Order>('/orders', orderData);
    console.log('✅ Order created (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock order service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock order service
    try {
      const result = await mockOrderService.createOrder(orderData);
      console.log('✅ Order created (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to create order';
      console.error('❌ Mock order creation failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Update order status or details - tries real API first, falls back to mock
 */
export const updateOrder = async (
  id: string,
  orderData: Partial<Omit<Order, '_id' | 'id'>>
): Promise<Order> => {
  try {
    console.log('📦 Attempting to update order with real API...');
    const response = await api.put<Order>(`/orders/${id}`, orderData);
    console.log('✅ Order updated (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock order service...');
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Fallback to mock order service
    try {
      const result = await mockOrderService.updateOrder(id, orderData);
      console.log('✅ Order updated (Mock Service)');
      return result;
    } catch (mockError) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to update order';
      console.error('❌ Mock order update failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Accept an order (assign to transporter) - tries real API first, falls back to mock
 */
export const acceptOrder = async (id: string, transporterId?: string): Promise<Order> => {
  try {
    console.log('📦 Attempting to accept order with real API...');
    console.log('🌐 Order ID:', id);
    console.log('👤 Transporter ID:', transporterId);
    const response = await api.put<any>(`/orders/${id}/accept`, { transporterId });
    console.log('✅ Order accepted (Real API)');
    console.log('📦 Response:', response.data);
    
    // Handle both wrapped and direct response formats
    const orderData = response.data.data || response.data;
    console.log('✔️ Order data returned:', orderData);
    return orderData;
  } catch (error: any) {
    console.log('⚠️ Real API failed, using mock order service...');
    console.error('❌ API Error:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
    });

    // Fallback to mock order service
    try {
      console.log('🎭 Calling mock order service acceptOrder for ID:', id, 'Transporter:', transporterId);
      const result = await mockOrderService.acceptOrder(id, transporterId);
      console.log('✅ Order accepted (Mock Service):', result);
      return result;
    } catch (mockError: any) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to accept order';
      console.error('❌ Mock order accept failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Complete a delivery - tries real API first, falls back to mock
 */
export const completeDelivery = async (id: string): Promise<Order> => {
  try {
    console.log('📦 Attempting to complete delivery with real API...');
    console.log('🌐 Order ID:', id);
    const response = await api.put<any>(`/orders/${id}/complete`);
    console.log('✅ Delivery completed (Real API)');
    console.log('📦 Response:', response.data);
    
    // Handle both wrapped and direct response formats
    const orderData = response.data.data || response.data;
    console.log('✔️ Order data returned:', orderData);
    return orderData;
  } catch (error: any) {
    console.log('⚠️ Real API failed, using mock order service...');
    console.error('❌ API Error:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
    });

    // Fallback to mock order service
    try {
      console.log('🎭 Calling mock order service completeDelivery for ID:', id);
      const result = await mockOrderService.completeDelivery(id);
      console.log('✅ Delivery completed (Mock Service):', result);
      return result;
    } catch (mockError: any) {
      const errorMessage = mockError instanceof Error ? mockError.message : 'Failed to complete delivery';
      console.error('❌ Mock order completion failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};