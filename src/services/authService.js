import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};