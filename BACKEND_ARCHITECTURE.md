# Backend Integration Architecture

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native + Expo)                   │
│                     Port: 8082 (Web Development)                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP/HTTPS
                                  │
                    ┌─────────────▼──────────────┐
                    │   Axios API Client        │
                    │  (src/services/api.ts)    │
                    │                            │
                    │  - Request Interceptors   │
                    │  - Token Authorization    │
                    │  - Error Handling         │
                    │  - Timeout Management     │
                    └─────────────┬──────────────┘
                                  │
                                  │ Bearer Token in Headers
                                  │ Content-Type: application/json
                                  │
┌─────────────────────────────────▼──────────────────────────────────┐
│              BACKEND (Node.js + Express + MongoDB)                  │
│                    Port: 5000 (/api endpoint)                       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   Authentication Routes                     │   │
│  │  POST   /auth/register   - Create new user                │   │
│  │  POST   /auth/login      - Authenticate user              │   │
│  │  POST   /auth/logout     - End session                    │   │
│  │  GET    /auth/me         - Get current user               │   │
│  │  POST   /auth/refresh    - Refresh JWT token              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   Crops/Products Routes                     │   │
│  │  GET    /crops           - List all crops                  │   │
│  │  GET    /crops/:id       - Get single crop                │   │
│  │  POST   /crops           - Create new crop                │   │
│  │  PUT    /crops/:id       - Update crop                    │   │
│  │  DELETE /crops/:id       - Delete crop                    │   │
│  │  GET    /crops/user/:id  - Get user's crops               │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   Orders Routes                             │   │
│  │  GET    /orders          - List all orders                 │   │
│  │  GET    /orders/:id      - Get order details               │   │
│  │  POST   /orders          - Create new order                │   │
│  │  PUT    /orders/:id      - Update order                    │   │
│  │  DELETE /orders/:id      - Delete order                    │   │
│  │  GET    /orders/user/:id - Get user's orders               │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   Transporters Routes                       │   │
│  │  GET    /transporters            - List all transporters   │   │
│  │  GET    /transporters/:id        - Get transporter details │   │
│  │  GET    /transporters/available  - Get available ones      │   │
│  │  PUT    /transporters/:id        - Update profile          │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   Payments Routes                           │   │
│  │  POST   /payments/initiate       - Start payment           │   │
│  │  GET    /payments/:id            - Check status            │   │
│  │  POST   /payments/confirm        - Confirm payment         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              MongoDB Database (Persistence)                 │   │
│  │  - Users Collection                                         │   │
│  │  - Crops Collection                                         │   │
│  │  - Orders Collection                                        │   │
│  │  - Transporters Collection                                  │   │
│  │  - Payments Collection                                      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### 1. Authentication Flow

```
User enters credentials
        │
        ▼
┌──────────────────────────────────┐
│ Component (LoginScreen.tsx)      │
│ - Collect email, password        │
│ - Dispatch login() action        │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Redux Thunk (authSlice.ts)       │
│ - login({ phone, password })     │
│ - Call authService.login()       │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Service Layer (authService.ts)   │
│ - api.post('/auth/login', data)  │
│ - Handle response                │
│ - Store token in AsyncStorage    │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Axios (api.ts)                   │
│ - Add Bearer token header        │
│ - Make HTTP request              │
│ - Handle interceptors            │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Backend API                      │
│ POST /auth/login                 │
│ - Verify credentials             │
│ - Generate JWT token             │
│ - Return user data               │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Response (token, user data)      │
│ Back to Frontend                 │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Redux Store                      │
│ - Save token in auth.token       │
│ - Save user in auth.user         │
│ - Set isAuthenticated = true     │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Component Re-renders             │
│ Navigation to Dashboard          │
└──────────────────────────────────┘
```

### 2. Cargo Management Flow

```
User clicks "List Cargo"
        │
        ▼
┌──────────────────────────────────┐
│ ListCargoScreen Component        │
│ - Show form: name, qty, price    │
│ - User fills data                │
│ - Clicks "Create"                │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Redux Thunk (cargoSlice.ts)      │
│ - createCargo(cargoData)         │
│ - Call cargoService.createCargo()│
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Service (cargoService.ts)        │
│ - api.post('/crops', cargoData)  │
│ - Backend validates and saves    │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ MongoDB Database                 │
│ Insert into crops collection     │
│ Return created document          │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Redux Store                      │
│ - Add new cargo to state.cargo   │
│ - Update UI automatically        │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Component Shows                  │
│ "Cargo created successfully!"    │
│ New cargo in list                │
└──────────────────────────────────┘
```

### 3. Order + Transporter Assignment Flow

```
Shipper creates order
        │
        ▼
┌──────────────────────────────────┐
│ Redux: createOrder()             │
│ POST /orders                     │
│ { crop_id, quantity, destination}
└──────────────────────────────────┘
        │
        ▼
MongoDB: Order saved with status "pending"
        │
        ▼
Transporter views available loads
        │
        ▼
┌──────────────────────────────────┐
│ Redux: fetchOrders()             │
│ GET /orders                      │
│ Shows all pending orders         │
└──────────────────────────────────┘
        │
        ▼
Transporter clicks "Accept"
        │
        ▼
┌──────────────────────────────────┐
│ Redux: assignTransporter()       │
│ PUT /orders/:id                  │
│ { transporter_id, status }       │
└──────────────────────────────────┘
        │
        ▼
MongoDB: Order updated
        │
        ▼
Both users notified of assignment
```

---

## 🔐 Security Flow

```
Frontend Request
    │
    ├─ Get token from AsyncStorage
    │
    ├─ Add to request header:
    │  Authorization: Bearer {token}
    │
    ▼
Backend Receives Request
    │
    ├─ Check Authorization header
    │
    ├─ Verify JWT signature
    │  (Must match backend secret)
    │
    ├─ Check token expiration
    │
    ├─ Extract user ID from token
    │
    ▼
If Valid: Process request
    │
    ├─ Return data
    │
    ▼
If Invalid: Return 401 Unauthorized
    │
    ├─ Frontend detects 401
    │
    ├─ Try to refresh token
    │  POST /auth/refresh
    │
    ├─ If refresh succeeds:
    │   Save new token, retry request
    │
    ├─ If refresh fails:
    │   Redirect to login
    │
    ▼
User must login again
```

---

## 📦 State Management Structure

### Redux Store Shape

```javascript
{
  auth: {
    user: {
      _id: "mongoid123",
      name: "John Farmer",
      phone: "+250700000001",
      role: "farmer"
    },
    token: "eyJhbGc...", // JWT token
    isAuthenticated: true,
    isLoading: false,
    error: null
  },

  cargo: {
    cargo: [
      {
        _id: "cargo123",
        name: "Tomatoes",
        quantity: 100,
        price: 500,
        location: "Kigali",
        userId: "user123"
      }
    ],
    isLoading: false,
    error: null
  },

  orders: {
    orders: [
      {
        _id: "order123",
        crop_id: "cargo123",
        quantity: 50,
        destination: "Kigali",
        status: "pending",
        transporter_id: null
      }
    ],
    selectedOrder: null,
    isLoading: false,
    error: null
  },

  transporters: {
    transporters: [
      {
        _id: "transporter123",
        name: "John Driver",
        vehicle_type: "truck",
        capacity: 5000,
        rates: 50000,
        available: true
      }
    ],
    availableTransporters: [...],
    selectedTransporter: null,
    isLoading: false,
    error: null
  }
}
```

---

## 🔄 Component-Redux-Service Connection

### Example: Fetching Cargo List

```
┌─────────────────────────────────────────────────────┐
│  Component: ShipperDashboardScreen.tsx              │
│                                                      │
│  useEffect(() => {                                  │
│    dispatch(fetchCargo());  ◄─── Dispatch action   │
│  }, [dispatch]);                                    │
│                                                      │
│  const { cargo, isLoading } = useSelector(          │
│    state => state.cargo  ◄─── Subscribe to state    │
│  );                                                  │
│                                                      │
│  return (                                            │
│    <ScrollView>                                      │
│      {cargo.map(item => (                            │
│        <CargoCard key={item._id} cargo={item} />     │
│      ))}                                             │
│    </ScrollView>                                     │
│  );                                                  │
│                                                      │
└─────────────────────────────────────────────────────┘
          │
          │ dispatch(fetchCargo())
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  Redux Thunk: cargoSlice.ts                         │
│                                                      │
│  export const fetchCargo = createAsyncThunk(        │
│    'cargo/fetchAll',                                │
│    async (_, { rejectWithValue }) => {              │
│      try {                                           │
│        return await cargoService.getAllCargo();     │
│      } catch (error) {                              │
│        return rejectWithValue(error);               │
│      }                                               │
│    }                                                │
│  );                                                 │
│                                                      │
│  // Reducers update state on success/error          │
│  .addCase(fetchCargo.fulfilled, (state, action) => {
│    state.cargo = action.payload;                    │
│  })                                                  │
│                                                      │
└─────────────────────────────────────────────────────┘
          │
          │ Call cargoService
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  Service: cargoService.ts                           │
│                                                      │
│  export const getAllCargo = async () => {           │
│    const response = await api.get('/crops');        │
│    return response.data;                            │
│  };                                                 │
│                                                      │
└─────────────────────────────────────────────────────┘
          │
          │ HTTP GET /crops
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  Backend: Express Route Handler                     │
│                                                      │
│  app.get('/crops', (req, res) => {                  │
│    // Query MongoDB for all crops                   │
│    // Return as JSON array                          │
│  });                                                │
│                                                      │
└─────────────────────────────────────────────────────┘
          │
          │ Response: [{ _id, name, ... }]
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  Axios Response                                      │
│  (Automatic conversion to state via Redux)          │
│                                                      │
│  response.data = [...]                              │
│  ▼                                                  │
│  Redux state updated                                │
│  ▼                                                  │
│  Component re-renders with new cargo list           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## ⚡ Request/Response Cycle

### Complete Request Example

```
1. Frontend (Browser)
   POST http://localhost:5000/api/orders
   Headers:
   - Authorization: Bearer eyJhbGc...
   - Content-Type: application/json

   Body:
   {
     "crop_id": "cargo123",
     "quantity": 50,
     "destination": "Kigali",
     "delivery_date": "2025-03-15"
   }

2. Axios Interceptor (Request)
   - Add token to headers
   - Log request
   - Check timeout

3. Backend Server
   POST /api/orders

   a) Middleware checks
      - Is token valid? ✓
      - Is user authenticated? ✓

   b) Controller processes
      - Validate input data
      - Check user exists
      - Check crop exists

   c) Database operations
      - Insert order into orders collection
      - Update crop availability
      - Create audit log

   d) Response preparation
      status: 201 Created
      body: { _id: "order456", ...order_data }

4. Axios Interceptor (Response)
   - Log response
   - Check status code
   - Return to Redux thunk

5. Redux Thunk
   - fulfilled() called
   - Update state.orders array
   - State dispatch action

6. Component
   - Selector triggered
   - Re-render with new order in list

7. User Sees
   "Order created successfully!"
   New order appears in list
```

---

## 🐛 Error Handling Architecture

```
Error Occurs Anywhere in Chain
        │
        ▼
┌────────────────────────────────────┐
│ 1. API Request Fails               │
│    - Network error                 │
│    - Server error (5xx)            │
│    - Client error (4xx)            │
│    - Timeout                       │
└────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│ 2. Axios Interceptor Catches It    │
│    - Log error                     │
│    - Handle 401 (token refresh)    │
│    - Handle 403 (permission)       │
│    - Handle 500 (server error)     │
└────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│ 3. Redux Thunk                     │
│    - rejectWithValue(error)        │
│    - Dispatch rejected action      │
└────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│ 4. Redux Reducer                   │
│    - addCase(action.rejected)      │
│    - Set state.error = message     │
│    - Set state.isLoading = false   │
└────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│ 5. Component                       │
│    - useSelector(state.error)      │
│    - Display error message         │
│    - Retry button available        │
└────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│ 6. User Actions                    │
│    - Read error message            │
│    - Click retry or try again      │
│    - Contact support if persistent │
└────────────────────────────────────┘
```

---

## 📱 Device-Specific Configurations

```
┌─────────────────────────────────────────────────────┐
│ Platform Detection (platformUtils.ts)               │
└─────────────────────────────────────────────────────┘

Web Browser (localhost:8082)
    │
    ├─ API URL: http://localhost:5000/api
    ├─ Timeout: 30 seconds
    ├─ Storage: LocalStorage
    │
    ▼
iOS/Android Physical Device
    │
    ├─ API URL: http://192.168.x.x:5000/api
    │  (Use machine IP instead of localhost)
    ├─ Timeout: 30 seconds
    ├─ Storage: AsyncStorage (react-native)
    │
    ▼
iOS/Android Emulator
    │
    ├─ API URL: http://10.0.2.2:5000/api
    │  (Special Android emulator IP)
    ├─ Timeout: 30 seconds
    ├─ Storage: AsyncStorage
    │
    ▼
Production
    │
    ├─ API URL: https://api.production.com/api
    ├─ Timeout: 30 seconds
    ├─ Storage: Secured AsyncStorage
```

---

## 🎯 Key Takeaways

1. **Layered Architecture**

   - UI Layer (Components)
   - State Management (Redux)
   - Service Layer (API calls)
   - Network Layer (Axios)
   - Backend (Express + MongoDB)

2. **Unidirectional Data Flow**

   - Component → Redux → Service → API → Backend → Database
   - Response flows back: Database → Backend → API → Service → Redux → Component

3. **Error Handling**

   - Catch at every level
   - Log for debugging
   - Present user-friendly messages

4. **Security**

   - JWT tokens in headers
   - Token refresh on expiry
   - Role-based access control

5. **State Management**
   - Redux keeps auth, cargo, orders, transporters
   - Components subscribe via selectors
   - Thunks handle async operations

---

This architecture ensures:
✅ Scalability
✅ Maintainability  
✅ Testability
✅ Security
✅ Performance
