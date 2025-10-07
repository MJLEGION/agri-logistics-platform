// src/api/auth.api.ts
import api from './axios.config';
import { User, UserRole } from '../types';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  password: string;
  role: UserRole;
}

export const authAPI = {
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',        // must match your import
        path: '.env',              // location of your env file
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true
      }
    ]
  ]
};
  login: async (data: LoginRequest) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};