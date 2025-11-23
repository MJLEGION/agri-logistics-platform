import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../../services/authService';
import { RegisterData, LoginCredentials, User } from '../../types';
import { clearCargo } from './cargoSlice';
import { clearOrders } from './ordersSlice';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const register = createAsyncThunk<any, RegisterData, { rejectValue: string }>(
  'auth/register',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      // Clear all old user data before registering
      dispatch(clearCargo());
      dispatch(clearOrders());
      // Clear all AsyncStorage to remove any cached data
      // BUT preserve local_ratings so ratings persist across sessions
      const keys = await AsyncStorage.getAllKeys();
      const dataKeys = keys.filter(key => !key.includes('persist:') && key !== 'local_ratings');
      await AsyncStorage.multiRemove(dataKeys);
      return await authService.register(userData);
    } catch (error: any) {
      return rejectWithValue(error.message || error.response?.data?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk<any, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      // Clear all old user data before logging in
      dispatch(clearCargo());
      dispatch(clearOrders());
      // Clear all AsyncStorage to remove any cached data
      // BUT preserve local_ratings so ratings persist across sessions
      const keys = await AsyncStorage.getAllKeys();
      const dataKeys = keys.filter(key => !key.includes('persist:') && key !== 'local_ratings');
      await AsyncStorage.multiRemove(dataKeys);
      return await authService.login(credentials);
    } catch (error: any) {
      return rejectWithValue(error.message || error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Clear all user data before logging out
      dispatch(clearCargo());
      dispatch(clearOrders());
      // Clear ALL AsyncStorage including persist keys to prevent stuck loading states
      // BUT preserve local_ratings so ratings persist across sessions
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = keys.filter(key => key !== 'local_ratings');
      await AsyncStorage.multiRemove(keysToRemove);
      await authService.logout();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  } as AuthState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = {
        _id: action.payload._id,
        id: action.payload._id, // For backward compatibility
        name: action.payload.name,
        phone: action.payload.phone,
        role: action.payload.role,
      };
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        // action.payload is { token: string, user: User }
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
        state.isAuthenticated = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        // action.payload is { token: string, user: User }
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        // Completely reset auth state to prevent stuck loading states
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Logout failed';
      });
  },
});

export const { setCredentials, resetAuthState } = authSlice.actions;
export default authSlice.reducer;