import api from './api';

export const getAllOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const updateOrder = async (id, orderData) => {
  const response = await api.put(`/orders/${id}`, orderData);
  return response.data;
};

export const acceptOrder = async (id) => {
  const response = await api.put(`/orders/${id}/accept`);
  return response.data;
};
