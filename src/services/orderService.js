import api from './api';
import mockOrderService from './mockOrderService';

/**
 * Get all orders (admin/superuser) - tries real API first, falls back to mock
 */
export const getAllOrders = async () => {
  try {
    console.log('📦 Attempting to fetch all orders from real API...');
    const response = await api.get('/orders');
    console.log('✅ Fetched all orders (Real API) raw response:', response.data);
    
    // Handle wrapped API response: { success: true, data: [...] }
    const orderData = response.data?.data || response.data;
    
    // Ensure it's always an array
    const orderArray = Array.isArray(orderData) ? orderData : [];
    console.log('✅ Fetched all orders (Real API):', orderArray.length, 'items');
    return orderArray;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock order service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock order service
    try {
      const result = await mockOrderService.getAllOrders();
      console.log('✅ Fetched all orders (Mock Service):', result?.length || 0, 'items');
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
    console.log('📦 Attempting to fetch my orders from real API...');
    const response = await api.get('/orders/my-orders');
    console.log('✅ Fetched my orders (Real API) raw response:', response.data);
    
    // Handle wrapped API response: { success: true, data: [...] }
    const orderData = response.data?.data || response.data;
    
    // Ensure it's always an array
    const orderArray = Array.isArray(orderData) ? orderData : [];
    console.log('✅ Fetched my orders (Real API):', orderArray.length, 'items');
    return orderArray;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock order service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock order service
    try {
      const result = await mockOrderService.getMyOrders();
      console.log('✅ Fetched my orders (Mock Service):', result?.length || 0, 'items');
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
    console.log('📦 Attempting to create order with real API...');
    const response = await api.post('/orders', orderData);
    console.log('✅ Order created (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock order service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock order service
    try {
      const result = await mockOrderService.createOrder(orderData);
      console.log('✅ Order created (Mock Service)');
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
    console.log('📦 Attempting to update order with real API...');
    const response = await api.put(`/orders/${id}`, orderData);
    console.log('✅ Order updated (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock order service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock order service
    try {
      const result = await mockOrderService.updateOrder(id, orderData);
      console.log('✅ Order updated (Mock Service)');
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
    console.log('📦 Attempting to accept order with real API...');
    const response = await api.put(`/orders/${id}/accept`);
    console.log('✅ Order accepted (Real API)');
    return response.data;
  } catch (error) {
    console.log('⚠️ Real API failed, using mock order service...');
    console.error('API Error:', error.message);
    
    // Fallback to mock order service
    try {
      const result = await mockOrderService.acceptOrder(id);
      console.log('✅ Order accepted (Mock Service)');
      return result;
    } catch (mockError) {
      console.error('❌ Mock order accept failed:', mockError.message);
      throw new Error(mockError.message);
    }
  }
};
