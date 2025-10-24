import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderService from '../../services/orderService';
import { Order, UpdateOrderParams } from '../../types';

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

// Mock test transport requests for development
// Two-role system: shipper creates transport request, transporter delivers
const MOCK_TEST_ORDERS: Order[] = [
  {
    _id: 'TEST_ORDER_001',
    cargoId: 'CARGO_001',
    shipperId: '1', // Shipper (farmer) requesting transport
    transporterId: '3', // Transporter assigned
    quantity: 50,
    unit: 'kg',
    transportFee: 25000,
    status: 'in_progress',
    pickupLocation: {
      latitude: -1.9536,
      longitude: 29.8739,
      address: 'Kigali Central Market',
      contactName: 'John Farmer',
      contactPhone: '+250700000001',
    },
    deliveryLocation: {
      latitude: -1.9706,
      longitude: 29.9498,
      address: 'Kigali Business District',
      contactName: 'Store Manager',
      contactPhone: '+250788999888',
    },
    deliveryNotes: 'Deliver before 5 PM',
  },
  {
    _id: 'TEST_ORDER_002',
    cargoId: 'CARGO_002',
    shipperId: '1',
    transporterId: '3',
    quantity: 100,
    unit: 'kg',
    transportFee: 45000,
    status: 'completed',
    pickupLocation: {
      latitude: -1.9445,
      longitude: 29.8739,
      address: 'Rwamagana Farm',
      contactName: 'John Farmer',
      contactPhone: '+250700000001',
    },
    deliveryLocation: {
      latitude: -1.9500,
      longitude: 30.0588,
      address: 'Kigali Downtown',
      contactName: 'Warehouse Staff',
      contactPhone: '+250788777666',
    },
  },
  {
    _id: 'TEST_ORDER_003',
    cargoId: 'CARGO_003',
    shipperId: '1',
    transporterId: undefined,
    quantity: 75,
    unit: 'kg',
    transportFee: 35000,
    status: 'pending',
    pickupLocation: {
      latitude: -1.9550,
      longitude: 29.8500,
      address: 'Nyarugunga Warehouse',
      contactName: 'John Farmer',
      contactPhone: '+250700000001',
    },
    deliveryLocation: {
      latitude: -1.9700,
      longitude: 29.9200,
      address: 'Hotel Location',
      contactName: 'Hotel Manager',
      contactPhone: '+250788555444',
    },
    deliveryNotes: 'Handle with care',
  },
];

// Async thunks
export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getMyOrders();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchAllOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  'orders/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getAllOrders();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all orders');
    }
  }
);

export const createOrder = createAsyncThunk<Order, any, { rejectValue: string }>(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderService.createOrder(orderData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const updateOrder = createAsyncThunk<Order, UpdateOrderParams, { rejectValue: string }>(
  'orders/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrder(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order');
    }
  }
);

export const acceptOrder = createAsyncThunk<Order, string, { rejectValue: string; state: any }>(
  'orders/accept',
  async (id, { rejectWithValue, getState }) => {
    try {
      console.log('🎯 acceptOrder thunk started for ID:', id);
      
      // Get current user's ID to assign as transporter
      const state = getState();
      const currentUser = state.auth?.user;
      const transporterId = currentUser?._id || currentUser?.id;
      console.log('👤 Current user (transporter) ID:', transporterId);
      
      const result = await orderService.acceptOrder(id, transporterId);
      console.log('✅ acceptOrder thunk success:', result);
      return result;
    } catch (error: any) {
      console.error('❌ acceptOrder thunk error:', {
        message: error?.message,
        response: error?.response?.data,
        errorString: String(error)
      });
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to accept order';
      console.log('📤 Returning rejection value:', errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const completeOrder = createAsyncThunk<Order, string, { rejectValue: string }>(
  'orders/complete',
  async (id, { rejectWithValue }) => {
    try {
      console.log('🎯 completeOrder thunk started for ID:', id);
      const result = await orderService.completeDelivery(id);
      console.log('✅ completeOrder thunk success:', result);
      return result;
    } catch (error: any) {
      console.error('❌ completeOrder thunk error:', {
        message: error?.message,
        response: error?.response?.data,
        errorString: String(error)
      });
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to complete order';
      console.log('📤 Returning rejection value:', errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: MOCK_TEST_ORDERS,
    isLoading: false,
    error: null,
  } as OrdersState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.error = null;
    },
    addTestOrder: (state, action) => {
      state.orders.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders (my orders)
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })
      // Fetch all orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch all orders';
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create order';
      })
      // Update order
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update order';
      })
      // Accept order
      .addCase(acceptOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        } else {
          state.orders.push(action.payload);
        }
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to accept order';
      })
      // Complete order
      .addCase(completeOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        } else {
          state.orders.push(action.payload);
        }
      })
      .addCase(completeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to complete order';
      });
  },
});

export const { clearError, clearOrders, addTestOrder } = ordersSlice.actions;
export default ordersSlice.reducer;