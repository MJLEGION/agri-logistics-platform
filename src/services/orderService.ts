// src/services/orderService.ts
import api from './api';
import { Order } from '../types';

/**
 * Fetch all orders
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch orders:', error);
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
    const response = await api.post<Order>('/orders', {
      crop_id: orderData.cargoId || orderData.crop_id,
      quantity: orderData.quantity,
      destination: orderData.deliveryLocation || orderData.destination,
      delivery_date: orderData.deliveryDate || orderData.delivery_date,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create order:', error);
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
    console.error('❌ Failed to update order:', error);
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