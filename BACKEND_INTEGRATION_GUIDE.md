# Backend Integration Guide

## Agri-Logistics Platform

**Backend URL:** `http://localhost:5000/api`  
**Tech Stack:** Node.js + Express + MongoDB + JWT  
**Deployment Status:** ✅ Running locally

---

## 📋 TABLE OF CONTENTS

1. [API Endpoints Overview](#api-endpoints-overview)
2. [Configuration Changes](#configuration-changes)
3. [Frontend Service Updates](#frontend-service-updates)
4. [Redux State Management](#redux-state-management)
5. [Authentication Flow](#authentication-flow)
6. [Feature Integration](#feature-integration)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

---

## 🔌 API ENDPOINTS OVERVIEW

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint         | Description       | Body                              | Response                                      |
| ------ | ---------------- | ----------------- | --------------------------------- | --------------------------------------------- |
| POST   | `/auth/register` | Register new user | `{ name, phone, password, role }` | `{ token, user: { _id, name, phone, role } }` |
| POST   | `/auth/login`    | Login user        | `{ phone, password }`             | `{ token, user: { _id, name, phone, role } }` |
| GET    | `/auth/me`       | Get current user  | None                              | `{ _id, name, phone, role }`                  |
| POST   | `/auth/logout`   | Logout user       | None                              | `{ message: "Logged out" }`                   |
| POST   | `/auth/refresh`  | Refresh token     | `{ refreshToken }`                | `{ token }`                                   |

### Crops/Products Endpoints (Farmer/Seller)

| Method | Endpoint              | Description      | Auth | Body                                               |
| ------ | --------------------- | ---------------- | ---- | -------------------------------------------------- |
| GET    | `/crops`              | Get all crops    | ✅   | None                                               |
| GET    | `/crops/:id`          | Get single crop  | ✅   | None                                               |
| POST   | `/crops`              | Create new crop  | ✅   | `{ name, quantity, price, location, description }` |
| PUT    | `/crops/:id`          | Update crop      | ✅   | `{ name, quantity, price, location, description }` |
| DELETE | `/crops/:id`          | Delete crop      | ✅   | None                                               |
| GET    | `/crops/user/:userId` | Get user's crops | ✅   | None                                               |

### Orders Endpoints

| Method | Endpoint               | Description       | Auth | Body                                                |
| ------ | ---------------------- | ----------------- | ---- | --------------------------------------------------- |
| GET    | `/orders`              | Get all orders    | ✅   | None                                                |
| GET    | `/orders/:id`          | Get order details | ✅   | None                                                |
| POST   | `/orders`              | Create new order  | ✅   | `{ crop_id, quantity, destination, delivery_date }` |
| PUT    | `/orders/:id`          | Update order      | ✅   | `{ status, transporter_id }`                        |
| DELETE | `/orders/:id`          | Delete order      | ✅   | None                                                |
| GET    | `/orders/user/:userId` | Get user's orders | ✅   | None                                                |

### Transporter Endpoints

| Method | Endpoint                  | Description                | Auth | Body                                |
| ------ | ------------------------- | -------------------------- | ---- | ----------------------------------- |
| GET    | `/transporters`           | Get all transporters       | ✅   | None                                |
| GET    | `/transporters/:id`       | Get transporter details    | ✅   | None                                |
| GET    | `/transporters/available` | Get available transporters | ✅   | None                                |
| PUT    | `/transporters/:id`       | Update transporter profile | ✅   | `{ vehicle_type, capacity, rates }` |

### Payment Endpoints

| Method | Endpoint             | Description        | Auth | Body                           |
| ------ | -------------------- | ------------------ | ---- | ------------------------------ |
| POST   | `/payments/initiate` | Initiate payment   | ✅   | `{ order_id, amount, method }` |
| GET    | `/payments/:id`      | Get payment status | ✅   | None                           |
| POST   | `/payments/confirm`  | Confirm payment    | ✅   | `{ transaction_id, order_id }` |

---

## 🔧 CONFIGURATION CHANGES

### Step 1: Update Environment Variables

**File:** `.env`

```bash
# Backend API Configuration
BACKEND_API_URL=http://localhost:5000/api
BACKEND_API_TIMEOUT=30000

# For production
# BACKEND_API_URL=https://your-production-api.com/api
```

**File:** `.env.example`

Add the same variables for team reference.

### Step 2: Update `platformUtils.ts`

**File:** `src/utils/platformUtils.ts`

```typescript
// Update getApiUrl() function
export const getApiUrl = (): string => {
  if (Platform.OS === "web") {
    return process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  }

  // For native (iOS/Android)
  if (__DEV__) {
    // Development - use your machine IP or localhost
    return "http://localhost:5000/api";
    // OR use machine IP for physical device testing:
    // return 'http://192.168.x.x:5000/api';
  }

  // Production
  return "https://your-production-api.com/api";
};
```

### Step 3: Update `axios.config.ts`

**File:** `src/api/axios.config.ts`

```typescript
// Change from:
baseURL: API_BASE_URL || 'http://localhost:3000/api',

// To:
baseURL: API_BASE_URL || 'http://localhost:5000/api',
```

---

## 🔌 FRONTEND SERVICE UPDATES

### Step 1: Update Auth Service

**File:** `src/services/authService.ts`

The current implementation already handles the backend correctly with fallback to mock. Key changes:

```typescript
// auth/register endpoint is already correct
const response = await api.post<AuthResponse>("/auth/register", userData);

// auth/login endpoint is already correct
const response = await api.post<AuthResponse>("/auth/login", {
  phone: credentials.phone,
  password: credentials.password,
});
```

**No changes needed** - already compatible! ✅

### Step 2: Create Cargo Service

**File:** `src/services/cargoService.ts`

Update to match backend crops endpoints:

```typescript
import api from "./api";
import { Cargo } from "../types";

/**
 * Fetch all crops/cargo
 */
export const getAllCargo = async (): Promise<Cargo[]> => {
  try {
    const response = await api.get<Cargo[]>("/crops");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch crops:", error);
    throw error;
  }
};

/**
 * Fetch user's crops
 */
export const getUserCargo = async (userId: string): Promise<Cargo[]> => {
  try {
    const response = await api.get<Cargo[]>(`/crops/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch user crops:", error);
    throw error;
  }
};

/**
 * Get single crop by ID
 */
export const getCargById = async (id: string): Promise<Cargo> => {
  try {
    const response = await api.get<Cargo>(`/crops/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch crop:", error);
    throw error;
  }
};

/**
 * Create new cargo/crop
 */
export const createCargo = async (cargoData: any): Promise<Cargo> => {
  try {
    const response = await api.post<Cargo>("/crops", {
      name: cargoData.name,
      quantity: cargoData.quantity,
      price: cargoData.price,
      location: cargoData.pickupLocation || cargoData.location,
      description: cargoData.description || "",
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to create cargo:", error);
    throw error;
  }
};

/**
 * Update cargo/crop
 */
export const updateCargo = async (
  id: string,
  cargoData: any
): Promise<Cargo> => {
  try {
    const response = await api.put<Cargo>(`/crops/${id}`, {
      name: cargoData.name,
      quantity: cargoData.quantity,
      price: cargoData.price,
      location: cargoData.pickupLocation || cargoData.location,
      description: cargoData.description || "",
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to update cargo:", error);
    throw error;
  }
};

/**
 * Delete cargo/crop
 */
export const deleteCargo = async (id: string): Promise<void> => {
  try {
    await api.delete(`/crops/${id}`);
  } catch (error) {
    console.error("❌ Failed to delete cargo:", error);
    throw error;
  }
};

export default {
  getAllCargo,
  getUserCargo,
  getCargById,
  createCargo,
  updateCargo,
  deleteCargo,
};
```

### Step 3: Create Order Service

**File:** `src/services/orderService.ts`

```typescript
import api from "./api";
import { Order } from "../types";

/**
 * Fetch all orders
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await api.get<Order[]>("/orders");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch orders:", error);
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
    console.error("❌ Failed to fetch user orders:", error);
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
    console.error("❌ Failed to fetch order:", error);
    throw error;
  }
};

/**
 * Create new order
 */
export const createOrder = async (orderData: any): Promise<Order> => {
  try {
    const response = await api.post<Order>("/orders", {
      crop_id: orderData.cargoId || orderData.crop_id,
      quantity: orderData.quantity,
      destination: orderData.deliveryLocation || orderData.destination,
      delivery_date: orderData.deliveryDate || orderData.delivery_date,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to create order:", error);
    throw error;
  }
};

/**
 * Update order
 */
export const updateOrder = async (
  id: string,
  orderData: any
): Promise<Order> => {
  try {
    const response = await api.put<Order>(`/orders/${id}`, orderData);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to update order:", error);
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
    console.error("❌ Failed to delete order:", error);
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
      status: "assigned",
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to assign transporter:", error);
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
};
```

### Step 4: Create Transporter Service

**File:** `src/services/transporterService.ts`

```typescript
import api from "./api";

interface Transporter {
  _id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  capacity: number;
  rates: number;
  available: boolean;
  location?: string;
  rating?: number;
}

/**
 * Get all transporters
 */
export const getAllTransporters = async (): Promise<Transporter[]> => {
  try {
    const response = await api.get<Transporter[]>("/transporters");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch transporters:", error);
    throw error;
  }
};

/**
 * Get available transporters
 */
export const getAvailableTransporters = async (): Promise<Transporter[]> => {
  try {
    const response = await api.get<Transporter[]>("/transporters/available");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch available transporters:", error);
    throw error;
  }
};

/**
 * Get transporter by ID
 */
export const getTransporterById = async (id: string): Promise<Transporter> => {
  try {
    const response = await api.get<Transporter>(`/transporters/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch transporter:", error);
    throw error;
  }
};

/**
 * Update transporter profile (for logged-in transporter)
 */
export const updateTransporterProfile = async (
  id: string,
  profileData: Partial<Transporter>
): Promise<Transporter> => {
  try {
    const response = await api.put<Transporter>(`/transporters/${id}`, {
      vehicle_type: profileData.vehicle_type,
      capacity: profileData.capacity,
      rates: profileData.rates,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to update transporter profile:", error);
    throw error;
  }
};

export default {
  getAllTransporters,
  getAvailableTransporters,
  getTransporterById,
  updateTransporterProfile,
};
```

### Step 5: Create Payment Service

**File:** `src/services/paymentService.ts`

```typescript
import api from "./api";

interface PaymentInitiation {
  order_id: string;
  amount: number;
  method: "momo" | "bank_transfer" | "card";
}

interface PaymentStatus {
  _id: string;
  order_id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  method: string;
  transaction_id?: string;
  created_at: string;
}

/**
 * Initiate payment for an order
 */
export const initiatePayment = async (
  paymentData: PaymentInitiation
): Promise<PaymentStatus> => {
  try {
    const response = await api.post<PaymentStatus>("/payments/initiate", {
      order_id: paymentData.order_id,
      amount: paymentData.amount,
      method: paymentData.method,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to initiate payment:", error);
    throw error;
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (
  paymentId: string
): Promise<PaymentStatus> => {
  try {
    const response = await api.get<PaymentStatus>(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch payment status:", error);
    throw error;
  }
};

/**
 * Confirm payment completion
 */
export const confirmPayment = async (
  transactionId: string,
  orderId: string
): Promise<PaymentStatus> => {
  try {
    const response = await api.post<PaymentStatus>("/payments/confirm", {
      transaction_id: transactionId,
      order_id: orderId,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to confirm payment:", error);
    throw error;
  }
};

export default {
  initiatePayment,
  getPaymentStatus,
  confirmPayment,
};
```

---

## 📊 REDUX STATE MANAGEMENT

### Step 1: Update Orders Slice

**File:** `src/store/slices/ordersSlice.ts`

```typescript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as orderService from "../../services/orderService";
import { Order } from "../../types";

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

// Async thunks
export const fetchOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("orders/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await orderService.getAllOrders();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch orders"
    );
  }
});

export const fetchUserOrders = createAsyncThunk<
  Order[],
  string,
  { rejectValue: string }
>("orders/fetchUserOrders", async (userId, { rejectWithValue }) => {
  try {
    return await orderService.getUserOrders(userId);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch user orders"
    );
  }
});

export const createOrder = createAsyncThunk<
  Order,
  any,
  { rejectValue: string }
>("orders/create", async (orderData, { rejectWithValue }) => {
  try {
    return await orderService.createOrder(orderData);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create order"
    );
  }
});

export const updateOrder = createAsyncThunk<
  Order,
  { id: string; data: any },
  { rejectValue: string }
>("orders/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await orderService.updateOrder(id, data);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update order"
    );
  }
});

export const deleteOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("orders/delete", async (id, { rejectWithValue }) => {
  try {
    await orderService.deleteOrder(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete order"
    );
  }
});

export const assignTransporter = createAsyncThunk<
  Order,
  { orderId: string; transporterId: string },
  { rejectValue: string }
>(
  "orders/assignTransporter",
  async ({ orderId, transporterId }, { rejectWithValue }) => {
    try {
      return await orderService.assignTransporter(orderId, transporterId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign transporter"
      );
    }
  }
);

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    selectOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.selectedOrder = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
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
        state.error = action.payload || "Failed to fetch orders";
      })
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch user orders";
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
        state.error = action.payload || "Failed to create order";
      })
      // Update order
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update order";
      })
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.filter(
          (o) => o._id !== action.payload && o.id !== action.payload
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete order";
      })
      // Assign transporter
      .addCase(assignTransporter.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignTransporter.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(assignTransporter.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to assign transporter";
      });
  },
});

export const { selectOrder, clearOrders, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
```

### Step 2: Create Transporters Slice

**File:** `src/store/slices/transportersSlice.ts`

```typescript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as transporterService from "../../services/transporterService";

interface Transporter {
  _id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  capacity: number;
  rates: number;
  available: boolean;
  location?: string;
  rating?: number;
}

interface TransportersState {
  transporters: Transporter[];
  availableTransporters: Transporter[];
  selectedTransporter: Transporter | null;
  isLoading: boolean;
  error: string | null;
}

export const fetchTransporters = createAsyncThunk<
  Transporter[],
  void,
  { rejectValue: string }
>("transporters/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await transporterService.getAllTransporters();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch transporters"
    );
  }
});

export const fetchAvailableTransporters = createAsyncThunk<
  Transporter[],
  void,
  { rejectValue: string }
>("transporters/fetchAvailable", async (_, { rejectWithValue }) => {
  try {
    return await transporterService.getAvailableTransporters();
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch available transporters"
    );
  }
});

export const updateTransporterProfile = createAsyncThunk<
  Transporter,
  { id: string; data: Partial<Transporter> },
  { rejectValue: string }
>("transporters/updateProfile", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await transporterService.updateTransporterProfile(id, data);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update profile"
    );
  }
});

const initialState: TransportersState = {
  transporters: [],
  availableTransporters: [],
  selectedTransporter: null,
  isLoading: false,
  error: null,
};

const transportersSlice = createSlice({
  name: "transporters",
  initialState,
  reducers: {
    selectTransporter: (state, action) => {
      state.selectedTransporter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransporters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransporters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transporters = action.payload;
      })
      .addCase(fetchTransporters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch transporters";
      })
      .addCase(fetchAvailableTransporters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableTransporters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableTransporters = action.payload;
      })
      .addCase(fetchAvailableTransporters.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Failed to fetch available transporters";
      })
      .addCase(updateTransporterProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransporterProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTransporter = action.payload;
      })
      .addCase(updateTransporterProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update profile";
      });
  },
});

export const { selectTransporter, clearError } = transportersSlice.actions;
export default transportersSlice.reducer;
```

### Step 3: Update Redux Store

**File:** `src/store/index.ts`

Add the new slices:

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import authReducer from "./slices/authSlice";
import cargoReducer from "./slices/cargoSlice";
import ordersReducer from "./slices/ordersSlice";
import transportersReducer from "./slices/transportersSlice"; // ADD THIS

// ... existing persist config ...

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"], // Only auth is persisted
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    cargo: cargoReducer,
    orders: ordersReducer,
    transporters: transportersReducer, // ADD THIS
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(thunk),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 🔐 AUTHENTICATION FLOW

### JWT Token Handling

Your API uses JWT tokens. The current setup already handles this correctly:

1. **Login/Register** → Backend returns `token`
2. **Token Storage** → Stored in AsyncStorage with key `auth_token`
3. **Token Sending** → Added to all requests as `Authorization: Bearer {token}`
4. **Token Refresh** → If 401 error, refresh token is used

**Current flow is correct and compatible with backend!** ✅

### Test Authentication

```typescript
// In your login screen or any Redux-connected component:
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = async () => {
    const result = await dispatch(
      login({
        phone: '+250700000001',
        password: 'password123',
      })
    );

    if (login.fulfilled.match(result)) {
      console.log('✅ Login successful!', result.payload);
      // Navigate to home screen
    }
  };

  return (
    // ... JSX ...
  );
};
```

---

## 🎯 FEATURE INTEGRATION

### Feature 1: Farmer/Shipper Cargo Management

**Screens to Update:**

- `src/screens/shipper/ShipperDashboardScreen.tsx`
- `src/screens/shipper/ListCargoScreen.tsx`
- `src/screens/shipper/CargoDetailScreen.tsx`

**Example Integration:**

```typescript
// In ShipperDashboardScreen.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCargo } from "../store/slices/cargoSlice";
import { RootState } from "../store";

export default function ShipperDashboardScreen() {
  const dispatch = useDispatch();
  const { cargo, isLoading, error } = useSelector(
    (state: RootState) => state.cargo
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Fetch cargo when component mounts
    dispatch(fetchCargo() as any);
  }, [dispatch]);

  // Filter cargo for current user if needed
  const userCargo = cargo.filter((c) => c.userId === user?._id);

  return (
    <View>
      {isLoading && <Text>Loading...</Text>}
      {error && <Text style={{ color: "red" }}>{error}</Text>}
      {userCargo.map((item) => (
        <CargoCard key={item._id} cargo={item} />
      ))}
    </View>
  );
}
```

### Feature 2: Order Management

**Screens to Update:**

- `src/screens/shipper/OrdersScreen.tsx`
- `src/screens/transporter/AvailableLoadsScreen.tsx`

**Example Integration:**

```typescript
// In OrdersScreen.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../store/slices/ordersSlice";
import { RootState } from "../store";

export default function OrdersScreen() {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUserOrders(user._id) as any);
    }
  }, [dispatch, user]);

  return (
    <ScrollView>
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </ScrollView>
  );
}
```

### Feature 3: Transporter Assignment

**Integration in Order Detail Screen:**

```typescript
import { assignTransporter } from "../store/slices/ordersSlice";

const handleAssignTransporter = async (
  orderId: string,
  transporterId: string
) => {
  const result = await dispatch(
    assignTransporter({ orderId, transporterId }) as any
  );

  if (assignTransporter.fulfilled.match(result)) {
    Alert.alert("Success", "Transporter assigned successfully!");
  }
};
```

---

## 🧪 TESTING GUIDE

### Step 1: Verify Backend is Running

```bash
# Terminal
curl http://localhost:5000/api/auth/me
# Should return 401 (Unauthorized) - this is correct
```

### Step 2: Test Authentication

```typescript
// Add this to a test screen or use React DevTools
import api from "./src/services/api";

const testAuth = async () => {
  try {
    // Test register
    const registerRes = await api.post("/auth/register", {
      name: "Test Farmer",
      phone: "+250700000099",
      password: "testpass123",
      role: "farmer",
    });
    console.log("✅ Register successful:", registerRes.data);

    // Test login
    const loginRes = await api.post("/auth/login", {
      phone: "+250700000099",
      password: "testpass123",
    });
    console.log("✅ Login successful:", loginRes.data);
  } catch (error) {
    console.error("❌ Auth test failed:", error);
  }
};

// Call testAuth() to verify
```

### Step 3: Test Cargo Operations

```typescript
const testCargo = async () => {
  try {
    // Create cargo
    const createRes = await api.post("/crops", {
      name: "Tomatoes",
      quantity: 100,
      price: 500,
      location: "Kigali",
      description: "Fresh tomatoes",
    });
    console.log("✅ Cargo created:", createRes.data);

    // Fetch cargo
    const fetchRes = await api.get("/crops");
    console.log("✅ Cargo fetched:", fetchRes.data);
  } catch (error) {
    console.error("❌ Cargo test failed:", error);
  }
};
```

### Step 4: Manual Testing Checklist

- [ ] User can register with new phone number
- [ ] User can login with credentials
- [ ] User is redirected to appropriate dashboard (farmer/transporter)
- [ ] Farmer can list new cargo
- [ ] Farmer can edit their cargo
- [ ] Farmer can view all orders
- [ ] Transporter can view available loads
- [ ] Transporter can see cargo details
- [ ] Orders are created successfully
- [ ] Transporters can be assigned to orders
- [ ] User can logout successfully

---

## 🛠️ TROUBLESHOOTING

### Issue: API Connection Refused

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5000`

**Solutions:**

1. Check if backend is running: `npm start` (in backend directory)
2. Verify backend port: Should be `5000`
3. Check firewall settings
4. On physical device: Use machine IP instead of `localhost`

### Issue: 401 Unauthorized

**Problem:** All API requests return 401

**Solutions:**

1. Verify token is stored in AsyncStorage
2. Check token expiration
3. Test with a fresh login
4. Verify JWT secret matches between frontend and backend

### Issue: CORS Error

**Problem:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions:**

1. Ensure backend has CORS enabled
2. Frontend should send: `Origin: http://localhost:8082`
3. Backend should respond with: `Access-Control-Allow-Origin: *`

### Issue: Network Timeout

**Problem:** Requests hang for 30 seconds then fail

**Solutions:**

1. Check network connectivity
2. Verify backend is responsive
3. Reduce timeout in `platformUtils.ts` if needed
4. Check for slow database queries

### Issue: Data Not Persisting

**Problem:** Cargo/Orders data disappears after page refresh

**Current Behavior:** This is expected since only auth is persisted.
**Solution:** If you want to persist other data, update the `persistConfig` whitelist:

```typescript
// In src/store/index.ts
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "cargo", "orders"], // Add cargo and orders
};
```

---

## 📝 QUICK REFERENCE

### File Changes Summary

| File                                    | Change Type           | Status      |
| --------------------------------------- | --------------------- | ----------- |
| `.env`                                  | Add `BACKEND_API_URL` | 🔵 Required |
| `src/utils/platformUtils.ts`            | Update `getApiUrl()`  | 🔵 Required |
| `src/services/cargoService.ts`          | Update to real API    | 🟢 Done     |
| `src/services/orderService.ts`          | Create new file       | 🔵 Required |
| `src/services/transporterService.ts`    | Create new file       | 🔵 Required |
| `src/services/paymentService.ts`        | Create new file       | 🟡 Optional |
| `src/store/slices/ordersSlice.ts`       | Update with thunks    | 🔵 Required |
| `src/store/slices/transportersSlice.ts` | Create new file       | 🔵 Required |
| `src/store/index.ts`                    | Add new reducers      | 🔵 Required |

---

## 🎓 Next Steps

1. ✅ Update environment variables
2. ✅ Create missing service files
3. ✅ Create missing Redux slices
4. ✅ Update Redux store
5. ✅ Update screens to use Redux
6. ✅ Test authentication flow
7. ✅ Test cargo operations
8. ✅ Test order operations
9. ✅ Deploy backend to production
10. ✅ Update API URL for production

---

**Created:** 2025  
**Backend Base URL:** `http://localhost:5000/api`  
**Frontend Dev Server:** `http://localhost:8082`
