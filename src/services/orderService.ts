// src/services/orderService.ts
import api from './api';
import { Order } from '../types';
import { logger } from '../utils/logger';

/**
 * Backend Order Response Type
 * Matches: Node.js + Express backend response format
 */
interface BackendOrderResponse {
  success: boolean;
  message: string;
  data: any; // Single order or array of orders
}

/**
 * Backend Order Model (from MongoDB)
 * Note: Backend uses "cropId", "farmerId", "buyerId" while frontend uses "cargoId", "shipperId"
 */
interface BackendOrder {
  _id: string;
  cropId: string;
  farmerId: string;
  buyerId: string;
  transporterId?: string;
  quantity: number;
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
  createdAt: string;
  updatedAt: string;
}

/**
 * Map backend order to frontend order format
 */
const mapBackendOrderToFrontend = (order: BackendOrder): Order => ({
  _id: order._id,
  id: order._id,
  cargoId: order.cropId, // Backend uses "cropId", frontend uses "cargoId"
  shipperId: order.farmerId, // Backend uses "farmerId", frontend uses "shipperId"
  transporterId: order.transporterId,
  quantity: order.quantity,
  transportFee: order.totalPrice, // Backend uses "totalPrice", frontend uses "transportFee"
  status: order.status === 'accepted' ? 'accepted' :
          order.status === 'in_progress' ? 'in_progress' :
          order.status === 'completed' ? 'completed' :
          order.status === 'cancelled' ? 'cancelled' : 'pending',
  pickupLocation: order.pickupLocation,
  deliveryLocation: order.deliveryLocation,
  createdAt: new Date(order.createdAt),
  updatedAt: new Date(order.updatedAt),
});

/**
 * Map frontend order to backend order format
 */
const mapFrontendOrderToBackend = (order: Partial<Order>): any => {
  const backendOrder: any = {};

  if (order.cargoId) backendOrder.cropId = order.cargoId;
  if (order.shipperId) backendOrder.farmerId = order.shipperId;
  if (order.shipperId) backendOrder.buyerId = order.shipperId; // For now, buyer is same as shipper
  if (order.transporterId) backendOrder.transporterId = order.transporterId;
  if (order.quantity !== undefined) backendOrder.quantity = order.quantity;
  if (order.transportFee !== undefined) backendOrder.totalPrice = order.transportFee;
  if (order.status) backendOrder.status = order.status;
  if (order.pickupLocation) backendOrder.pickupLocation = order.pickupLocation;
  if (order.deliveryLocation) backendOrder.deliveryLocation = order.deliveryLocation;

  return backendOrder;
};

/**
 * Fetch all orders - connects to real backend API
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    logger.info('Fetching all orders from backend API');
    const response = await api.get<BackendOrderResponse>('/orders');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch orders');
    }

    const ordersData = response.data.data;
    const ordersArray = Array.isArray(ordersData) ? ordersData : [];

    logger.debug('Orders fetched successfully', { count: ordersArray.length });

    // Map backend orders to frontend format
    return ordersArray.map(mapBackendOrderToFrontend);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch orders';
    logger.error('Failed to fetch orders', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get user's orders - connects to real backend API
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    logger.info('Fetching orders for user', { userId });
    const response = await api.get<BackendOrderResponse>(`/orders/user/${userId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user orders');
    }

    const ordersData = response.data.data;
    const ordersArray = Array.isArray(ordersData) ? ordersData : [];

    logger.debug('User orders fetched successfully', { userId, count: ordersArray.length });

    // Map backend orders to frontend format
    return ordersArray.map(mapBackendOrderToFrontend);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch user orders';
    logger.error('Failed to fetch user orders', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get my orders - connects to real backend API
 */
export const getMyOrders = async (): Promise<Order[]> => {
  try {
    logger.info('Fetching my orders from backend API');
    const response = await api.get<BackendOrderResponse>('/orders/my-orders');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch my orders');
    }

    const ordersData = response.data.data;
    const ordersArray = Array.isArray(ordersData) ? ordersData : [];

    logger.debug('My orders fetched successfully', { count: ordersArray.length });

    // Map backend orders to frontend format
    return ordersArray.map(mapBackendOrderToFrontend);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch my orders';
    logger.error('Failed to fetch my orders', error);
    throw new Error(errorMessage);
  }
};

/**
 * Get single order - connects to real backend API
 */
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    logger.info('Fetching order by ID', { id });
    const response = await api.get<BackendOrderResponse>(`/orders/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch order');
    }

    logger.debug('Order fetched successfully', { id });

    // Map backend order to frontend format
    return mapBackendOrderToFrontend(response.data.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch order';
    logger.error('Failed to fetch order by ID', error);
    throw new Error(errorMessage);
  }
};

/**
 * Create new order - connects to real backend API
 */
export const createOrder = async (orderData: any): Promise<Order> => {
  try {
    logger.info('Creating new order', { cargoId: orderData.cargoId, quantity: orderData.quantity });

    // Map frontend order format to backend format
    const backendOrderData = mapFrontendOrderToBackend(orderData);

    const response = await api.post<BackendOrderResponse>('/orders', backendOrderData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create order');
    }

    logger.info('Order created successfully', { id: response.data.data._id });

    // Map backend order to frontend format
    return mapBackendOrderToFrontend(response.data.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create order';
    logger.error('Failed to create order', error);
    throw new Error(errorMessage);
  }
};

/**
 * Update order - connects to real backend API
 */
export const updateOrder = async (id: string, orderData: any): Promise<Order> => {
  try {
    logger.info('Updating order', { id });

    // Map frontend order format to backend format
    const backendOrderData = mapFrontendOrderToBackend(orderData);

    const response = await api.put<BackendOrderResponse>(`/orders/${id}`, backendOrderData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update order');
    }

    logger.info('Order updated successfully', { id });

    // Map backend order to frontend format
    return mapBackendOrderToFrontend(response.data.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update order';
    logger.error('Failed to update order', error);
    throw new Error(errorMessage);
  }
};

/**
 * Delete order - connects to real backend API
 */
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    logger.info('Deleting order', { id });

    const response = await api.delete<BackendOrderResponse>(`/orders/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete order');
    }

    logger.info('Order deleted successfully', { id });
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete order';
    logger.error('Failed to delete order', error);
    throw new Error(errorMessage);
  }
};

/**
 * Accept order (for transporters) - connects to real backend API
 */
export const acceptOrder = async (orderId: string): Promise<Order> => {
  try {
    logger.info('Accepting order', { orderId });

    const response = await api.put<BackendOrderResponse>(`/orders/${orderId}/accept`, {});

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to accept order');
    }

    logger.info('Order accepted successfully', { orderId });

    // Map backend order to frontend format
    return mapBackendOrderToFrontend(response.data.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to accept order';
    logger.error('Failed to accept order', error);
    throw new Error(errorMessage);
  }
};

/**
 * Assign transporter to order - connects to real backend API
 */
export const assignTransporter = async (
  orderId: string,
  transporterId: string
): Promise<Order> => {
  try {
    logger.info('Assigning transporter to order', { orderId, transporterId });

    const response = await api.put<BackendOrderResponse>(`/orders/${orderId}`, {
      transporterId,
      status: 'accepted',
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to assign transporter');
    }

    logger.info('Transporter assigned successfully', { orderId, transporterId });

    // Map backend order to frontend format
    return mapBackendOrderToFrontend(response.data.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to assign transporter';
    logger.error('Failed to assign transporter', error);
    throw new Error(errorMessage);
  }
};

/**
 * Complete delivery for an order - connects to real backend API
 */
export const completeDelivery = async (orderId: string): Promise<Order> => {
  try {
    logger.info('Completing delivery for order', { orderId });

    const response = await api.put<BackendOrderResponse>(`/orders/${orderId}`, {
      status: 'completed',
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete delivery');
    }

    logger.info('Delivery completed successfully', { orderId });

    // Map backend order to frontend format
    return mapBackendOrderToFrontend(response.data.data);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to complete delivery';
    logger.error('Failed to complete delivery', error);
    throw new Error(errorMessage);
  }
};

export default {
  getAllOrders,
  getUserOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  acceptOrder,
  assignTransporter,
  completeDelivery,
};