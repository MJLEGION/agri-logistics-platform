import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderService from '../../services/orderService';
import { Order, UpdateOrderParams } from '../../types';

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

// Mock test orders for development
const MOCK_TEST_ORDERS: Order[] = [
  {
    _id: 'TEST_ORDER_001',
    cropId: 'CROP_001',
    farmerId: '1',
    buyerId: '2', // Test Buyer ID from mockAuthService
    quantity: 50,
    totalPrice: 25000,
    status: 'in_progress',
    pickupLocation: {
      latitude: -1.9536,
      longitude: 29.8739,
      address: 'Kigali Central Market',
    },
    deliveryLocation: {
      latitude: -1.9706,
      longitude: 29.9498,
      address: 'Kigali Business District',
    },
  },
  {
    _id: 'TEST_ORDER_002',
    cropId: 'CROP_002',
    farmerId: '1',
    buyerId: '2',
    quantity: 100,
    totalPrice: 45000,
    status: 'completed',
    pickupLocation: {
      latitude: -1.9445,
      longitude: 29.8739,
      address: 'Rwamagana Farm',
    },
    deliveryLocation: {
      latitude: -1.9500,
      longitude: 30.0588,
      address: 'Kigali Downtown',
    },
  },
  {
    _id: 'TEST_ORDER_003',
    cropId: 'CROP_003',
    farmerId: '1',
    buyerId: '2',
    quantity: 75,
    totalPrice: 35000,
    status: 'accepted',
    pickupLocation: {
      latitude: -1.9550,
      longitude: 29.8500,
      address: 'Nyarugunga Warehouse',
    },
    deliveryLocation: {
      latitude: -1.9700,
      longitude: 29.9200,
      address: 'Hotel Location',
    },
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

export const acceptOrder = createAsyncThunk<Order, string, { rejectValue: string }>(
  'orders/accept',
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.acceptOrder(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept order');
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
      });
  },
});

export const { clearError, clearOrders, addTestOrder } = ordersSlice.actions;
export default ordersSlice.reducer;