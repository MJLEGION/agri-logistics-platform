import api from './api';
import mockOrderService from './mockOrderService';

/**
 * Get all orders (admin/superuser) - tries real API first, falls back to mock
 */
export const getAllOrders = async () => {
  try {
        const response = await api.get('/orders');
        // Handle wrapped API response: { success: true, data: [...] }
    const orderData = response.data?.data || response.data;
    
    // Ensure it's always an array
    const orderArray = Array.isArray(orderData) ? orderData : [];
        return orderArray;
  } catch (error) {
        console.error('API Error:', error.message);
    
    // Fallback to mock order service
    try {
      const result = await mockOrderService.getAllOrders();
            // Ensure result is always an array
      return Array.isArray(result) ? result : [];
    } catch (mockError) {
      console.error('❌ Mock order fetch failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};

/**
 * Get user's own orders - tries real API first, falls back to mock
 */
export const getMyOrders = async () => {
  try {
        const response = await api.get('/orders/my-orders');
        // Handle wrapped API response: { success: true, data: [...] }
    const orderData = response.data?.data || response.data;
    
    // Ensure it's always an array
    const orderArray = Array.isArray(orderData) ? orderData : [];
        return orderArray;
  } catch (error) {
        console.error('API Error:', error.message);
    
    // Fallback to mock order service
    try {
      const result = await mockOrderService.getMyOrders();
            // Ensure result is always an array
      return Array.isArray(result) ? result : [];
    } catch (mockError) {
      console.error('❌ Mock order fetch failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};

/**
 * Create a new order - tries real API first, falls back to mock
 */
export const createOrder = async (orderData) => {
  try {
        const response = await api.post('/orders', orderData);
        return response.data;
  } catch (error) {
        console.error('API Error:', error.message);
    
    // Fallback to mock order service
    try {
      const result = await mockOrderService.createOrder(orderData);
            return result;
    } catch (mockError) {
      console.error('❌ Mock order creation failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};

/**
 * Update order status or details - tries real API first, falls back to mock
 */
export const updateOrder = async (id, orderData) => {
  try {
        const response = await api.put(`/orders/${id}`, orderData);
        return response.data;
  } catch (error) {
        console.error('API Error:', error.message);
    
    // Fallback to mock order service
    try {
      const result = await mockOrderService.updateOrder(id, orderData);
            return result;
    } catch (mockError) {
      console.error('❌ Mock order update failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};

/**
 * Accept an order (assign to transporter) - tries real API first, falls back to mock
 */
export const acceptOrder = async (id) => {
  try {
        const response = await api.put(`/orders/${id}/accept`);
        return response.data;
  } catch (error) {
        console.error('API Error:', error.message);
    
    // Fallback to mock order service
    try {
      const result = await mockOrderService.acceptOrder(id);
            return result;
    } catch (mockError) {
      console.error('❌ Mock order accept failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};
