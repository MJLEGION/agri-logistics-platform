// src/services/orderService.ts
import api from './api';
import { Order } from '../types';
import { mockOrderService } from './mockOrderService';

// Flag to use mock service when API fails
const USE_MOCK_FALLBACK = true;

/**
 * Fetch all orders
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  } catch (error) {
    console.error('❌ API failed to fetch orders:', error);

    // Fallback to mock service if API fails
    if (USE_MOCK_FALLBACK) {
      console.log('🔄 Falling back to mock service for orders...');
      try {
        const mockOrders = await mockOrderService.getMyOrders();
        console.log('✅ Orders fetched successfully via mock service:', mockOrders.length);
        return mockOrders as Order[];
      } catch (mockError: any) {
        console.error('❌ Mock service also failed:', mockError);
        throw new Error('Failed to fetch orders: ' + mockError.message);
      }
    }

    throw error;
  }
};

/**
 * Get user's orders
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const response = await api.get<Order[]>(`/orders/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch user orders:', error);
    throw error;
  }
};

/**
 * Get single order
 */
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch order:', error);
    throw error;
  }
};

/**
 * Create new order
 */
export const createOrder = async (orderData: any): Promise<Order> => {
  try {
    console.log('📤 Creating order with data:', orderData);

    // Map the order data to the API format
    const payload = {
      cargoId: orderData.cargoId || orderData.crop_id,
      shipperId: orderData.shipperId,
      transporterId: orderData.transporterId,
      quantity: orderData.quantity,
      unit: orderData.unit || 'kg',
      transportFee: orderData.transportFee,
      status: orderData.status || 'pending',
      pickupLocation: orderData.pickupLocation,
      deliveryLocation: orderData.deliveryLocation,
      requestedDate: orderData.requestedDate || new Date(),
      // Legacy fields for backward compatibility
      crop_id: orderData.cargoId || orderData.crop_id,
      destination: orderData.deliveryLocation?.address || orderData.destination,
      delivery_date: orderData.deliveryDate || orderData.delivery_date,
    };

    console.log('📤 Sending payload to API:', payload);
    const response = await api.post<Order>('/orders', payload);
    console.log('✅ Order created successfully via API:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ API failed to create order:', error);
    console.error('❌ Error response:', error?.response?.data);

    // Fallback to mock service if API fails
    if (USE_MOCK_FALLBACK) {
      console.log('🔄 Falling back to mock service...');
      try {
        const mockOrder = await mockOrderService.createOrder(orderData);
        console.log('✅ Order created successfully via mock service:', mockOrder);
        return mockOrder as Order;
      } catch (mockError: any) {
        console.error('❌ Mock service also failed:', mockError);
        throw new Error('Failed to create order: ' + mockError.message);
      }
    }

    throw error;
  }
};

/**
 * Update order
 */
export const updateOrder = async (id: string, orderData: any): Promise<Order> => {
  try {
    const response = await api.put<Order>(`/orders/${id}`, orderData);
    return response.data;
  } catch (error) {
    console.error('❌ API failed to update order:', error);

    // Fallback to mock service if API fails
    if (USE_MOCK_FALLBACK) {
      console.log('🔄 Falling back to mock service for order update...');
      try {
        const updatedOrder = await mockOrderService.updateOrder(id, orderData);
        console.log('✅ Order updated successfully via mock service:', updatedOrder);
        return updatedOrder as Order;
      } catch (mockError: any) {
        console.error('❌ Mock service also failed:', mockError);
        throw new Error('Failed to update order: ' + mockError.message);
      }
    }

    throw error;
  }
};

/**
 * Delete order
 */
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await api.delete(`/orders/${id}`);
  } catch (error) {
    console.error('❌ Failed to delete order:', error);
    throw error;
  }
};

/**
 * Assign transporter to order
 */
export const assignTransporter = async (
  orderId: string,
  transporterId: string
): Promise<Order> => {
  try {
    const response = await api.put<Order>(`/orders/${orderId}`, {
      transporter_id: transporterId,
      status: 'assigned',
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to assign transporter:', error);
    throw error;
  }
};

/**
 * Complete delivery for an order
 */
export const completeDelivery = async (orderId: string): Promise<Order> => {
  try {
    const response = await api.put<Order>(`/orders/${orderId}`, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to complete delivery:', error);
    throw error;
  }
};

export default {
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  assignTransporter,
  completeDelivery,
};