# Backend API Integration Checklist

## 📋 Files Modified for Backend Integration

### ✅ 1. Authentication Service

**File**: `src/services/authService.js`

**Changes**:

- [x] Updated `register()` to handle `accessToken` & `refreshToken`
- [x] Updated `login()` to handle `accessToken` & `refreshToken`
- [x] Added token storage in AsyncStorage
- [x] Transform response to include `token` field for backward compatibility

**Key Methods**:

```javascript
export const register = async(userData); // Returns user + tokens
export const login = async(credentials); // Returns user + tokens
export const getCurrentUser = async(); // Returns current user
export const logout = async(); // Clears tokens
```

### ✅ 2. API Configuration

**File**: `src/services/api.js`

**Changes**:

- [x] Updated request interceptor to use `accessToken`
- [x] Fallback to `token` for backward compatibility
- [x] Automatic JWT token attachment to all requests
- [x] Proper error logging

**Features**:

- Automatic token injection in Authorization header
- Platform-specific API URL detection (web vs mobile)
- Comprehensive logging for debugging

### ✅ 3. Order Service

**File**: `src/services/orderService.js`

**Changes**:

- [x] `acceptOrder()` now sends empty body (uses JWT token)
- [x] Backend identifies transporter from JWT token
- [x] Proper logging and error handling

**Key Methods**:

```javascript
export const getAllOrders = async(); // GET /api/orders
export const getMyOrders = async(); // GET /api/orders/my-orders
export const createOrder = async(orderData); // POST /api/orders
export const updateOrder = async(id, data); // PUT /api/orders/:id
export const acceptOrder = async(id, userId); // PUT /api/orders/:id/accept
```

### ✅ 4. Redux Auth Slice

**File**: `src/store/slices/authSlice.ts`

**Changes**:

- [x] Updated `register.fulfilled` to extract user from nested object
- [x] Updated `login.fulfilled` to extract user from nested object
- [x] Handle both `token` and `accessToken` fields
- [x] Proper error handling

**State Structure**:

```typescript
{
  user: {
    _id: string,
    id: string,
    name: string,
    phone: string,
    role: 'farmer' | 'buyer' | 'transporter'
  },
  token: string,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null
}
```

### ✅ 5. Redux Orders Slice

**File**: `src/store/slices/ordersSlice.ts`

**Changes**:

- [x] Added validation in `acceptOrder` thunk
- [x] Verify user is authenticated before accepting
- [x] Better error messages

---

## 🔗 Backend API Endpoints

### Authentication Endpoints

| Method | Endpoint             | Body                            | Auth | Response                            |
| ------ | -------------------- | ------------------------------- | ---- | ----------------------------------- |
| POST   | `/api/auth/register` | `{name, phone, password, role}` | No   | `{user, accessToken, refreshToken}` |
| POST   | `/api/auth/login`    | `{phone, password}`             | No   | `{user, accessToken, refreshToken}` |
| GET    | `/api/auth/me`       | -                               | Yes  | `{user}`                            |
| POST   | `/api/auth/logout`   | `{refreshToken}`                | Yes  | `{message}`                         |
| POST   | `/api/auth/refresh`  | `{refreshToken}`                | No   | `{accessToken}`                     |

### Order Endpoints

| Method | Endpoint                 | Body                                                               | Auth | Role        | Response   |
| ------ | ------------------------ | ------------------------------------------------------------------ | ---- | ----------- | ---------- |
| GET    | `/api/orders`            | -                                                                  | Yes  | Any         | `[orders]` |
| GET    | `/api/orders/my-orders`  | -                                                                  | Yes  | Any         | `[orders]` |
| GET    | `/api/orders/:id`        | -                                                                  | Yes  | Any         | `{order}`  |
| POST   | `/api/orders`            | `{cropId, quantity, totalPrice, pickupLocation, deliveryLocation}` | Yes  | Buyer       | `{order}`  |
| PUT    | `/api/orders/:id`        | `{field: value}`                                                   | Yes  | Any         | `{order}`  |
| PUT    | `/api/orders/:id/accept` | -                                                                  | Yes  | Transporter | `{order}`  |

### Crop Endpoints

| Method | Endpoint         | Body                                         | Auth | Role   | Response    |
| ------ | ---------------- | -------------------------------------------- | ---- | ------ | ----------- |
| GET    | `/api/crops`     | -                                            | Yes  | Any    | `[crops]`   |
| GET    | `/api/crops/:id` | -                                            | Yes  | Any    | `{crop}`    |
| POST   | `/api/crops`     | `{name, quantity, unit, description, price}` | Yes  | Farmer | `{crop}`    |
| PUT    | `/api/crops/:id` | `{field: value}`                             | Yes  | Farmer | `{crop}`    |
| DELETE | `/api/crops/:id` | -                                            | Yes  | Farmer | `{message}` |

---

## 🔐 Authentication Flow

```
1. Register/Login
   └─ POST /api/auth/register or /api/auth/login
   └─ Receive: {user, accessToken, refreshToken}
   └─ Store: accessToken in AsyncStorage
   └─ Store: refreshToken in AsyncStorage
   └─ Redux: Set user + token

2. Make API Request
   └─ Axios interceptor reads accessToken from AsyncStorage
   └─ Add header: Authorization: Bearer {accessToken}
   └─ Send request to backend

3. Token Refresh (when accessToken expires)
   └─ POST /api/auth/refresh
   └─ Send: {refreshToken}
   └─ Receive: {accessToken}
   └─ Update AsyncStorage with new accessToken

4. Logout
   └─ POST /api/auth/logout
   └─ Send: {refreshToken}
   └─ Clear AsyncStorage
   └─ Clear Redux
```

---

## 🧪 API Testing Scenarios

### Scenario 1: User Registration

```javascript
// Request
POST /api/auth/register
{
  name: "John Transporter",
  phone: "+250788123456",
  password: "securePassword123",
  role: "transporter"
}

// Response (201 Created)
{
  success: true,
  message: "Registration successful",
  user: {
    _id: "507f1f77bcf86cd799439011",
    name: "John Transporter",
    phone: "+250788123456",
    role: "transporter"
  },
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Scenario 2: User Login

```javascript
// Request
POST /api/auth/login
{
  phone: "+250788123456",
  password: "securePassword123"
}

// Response (200 OK)
{
  success: true,
  message: "Welcome back, John Transporter!",
  user: {
    _id: "507f1f77bcf86cd799439011",
    name: "John Transporter",
    phone: "+250788123456",
    role: "transporter"
  },
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Scenario 3: Get All Orders (Transporter)

```javascript
// Request
GET / api / orders;
Headers: {
  Authorization: "Bearer {accessToken}";
}

// Response (200 OK)
[
  {
    _id: "507f1f77bcf86cd799439012",
    cropId: {
      _id: "507f1f77bcf86cd799439013",
      name: "Tomatoes",
      quantity: 100,
      unit: "kg",
    },
    farmerId: {
      _id: "507f1f77bcf86cd799439014",
      name: "James Farmer",
      phone: "+250788111111",
    },
    buyerId: {
      _id: "507f1f77bcf86cd799439015",
      name: "Michael Buyer",
      phone: "+250788222222",
    },
    transporterId: null,
    quantity: 50,
    totalPrice: 25000,
    status: "accepted",
    pickupLocation: {
      latitude: -1.9536,
      longitude: 29.8739,
      address: "Kigali Central Market",
    },
    deliveryLocation: {
      latitude: -1.9706,
      longitude: 29.9498,
      address: "Kigali Business District",
    },
    createdAt: "2024-10-21T10:30:00Z",
    updatedAt: "2024-10-21T10:30:00Z",
  },
];
```

### Scenario 4: Accept Order (Transporter)

```javascript
// Request
PUT /api/orders/507f1f77bcf86cd799439012/accept
Headers: {
  Authorization: "Bearer {accessToken}"
}
Body: {} (empty)

// Response (200 OK)
{
  _id: "507f1f77bcf86cd799439012",
  cropId: {...},
  farmerId: {...},
  buyerId: {...},
  transporterId: "507f1f77bcf86cd799439016", // Now set to current user
  quantity: 50,
  totalPrice: 25000,
  status: "in_progress",  // Status changed!
  pickupLocation: {...},
  deliveryLocation: {...},
  createdAt: "2024-10-21T10:30:00Z",
  updatedAt: "2024-10-21T10:35:00Z"
}
```

---

## 🔄 Data Flow Diagram

```
┌─────────────┐
│   App.tsx   │
└──────┬──────┘
       │
       ├─→ Redux Store
       │   ├─ authSlice (user, token)
       │   ├─ ordersSlice (orders list)
       │   └─ cropsSlice (crops list)
       │
       ├─→ Services Layer
       │   ├─ authService.js
       │   ├─ orderService.js
       │   └─ cropService.js
       │
       ├─→ Axios API
       │   └─ src/services/api.js
       │       ├─ Base URL: http://localhost:5000/api
       │       ├─ Interceptor: Adds JWT token to headers
       │       └─ Fallback: Mock services if backend fails
       │
       └─→ Backend Server
           ├─ port 5000
           ├─ Authentication
           ├─ Order Management
           ├─ Crop Management
           └─ MongoDB Database
```

---

## ✨ Error Handling

### Frontend Error Handling

| Error Type       | Trigger                | Handling                 |
| ---------------- | ---------------------- | ------------------------ |
| Network Error    | Backend offline        | Fallback to mock service |
| 401 Unauthorized | Invalid/expired token  | Redirect to login        |
| 403 Forbidden    | Wrong role/permissions | Show error message       |
| 404 Not Found    | Resource not found     | Show "not found" message |
| 400 Bad Request  | Invalid data           | Show validation error    |
| 500 Server Error | Backend error          | Show error message       |

### Validation Errors

**Phone Number**:

- Must be Nigerian: `0801-0809` + 9 digits or `+234` + 10 digits
- Or Rwandan: `0788-0798` + 7 digits or `+250` + 9 digits

**Password**:

- Minimum 6 characters

**Role**:

- Must be one of: `farmer`, `buyer`, `transporter`

---

## 📊 Testing Checklist

### Auth Flow

- [ ] Register with Nigerian phone number
- [ ] Register with Rwandan phone number
- [ ] Register with invalid phone - should fail
- [ ] Register with short password - should fail
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials - should fail
- [ ] AccessToken stored in AsyncStorage
- [ ] RefreshToken stored in AsyncStorage
- [ ] Logout clears tokens

### Order Flow

- [ ] Fetch all orders (with auth token)
- [ ] Fetch my orders (with auth token)
- [ ] Create order as buyer
- [ ] Accept order as transporter
- [ ] Order disappears from Available Loads
- [ ] Order appears in Active Trips
- [ ] Accept same order twice - should fail

### Error Cases

- [ ] API error → falls back to mock service
- [ ] Network offline → uses mock service
- [ ] Invalid token → redirects to login
- [ ] Missing auth header → 401 error
- [ ] Role validation → correct errors shown

### Console Verification

- [ ] Logs show real API being used
- [ ] Token is added to requests
- [ ] Response data is properly formatted
- [ ] Errors show detailed messages
- [ ] Fallback to mock works

---

## 🚀 Deployment Considerations

### Environment Variables

```env
# Development (local backend)
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_API_URL_MOBILE=http://192.168.1.64:5000/api

# Production (deployed backend)
EXPO_PUBLIC_API_URL=https://your-backend-domain.com/api
EXPO_PUBLIC_API_URL_MOBILE=https://your-backend-domain.com/api
```

### CORS Setup

Backend should have CORS enabled for your frontend domain:

```javascript
const cors = require("cors");
app.use(cors()); // or specific origins
```

### Security

- [ ] Always use HTTPS in production
- [ ] Validate all user inputs
- [ ] Sanitize sensitive data before logging
- [ ] Use secure token storage
- [ ] Implement token refresh before expiry

---

## 📞 Support

For backend issues, refer to:

- Backend repo: https://github.com/MJLEGION/agri-logistics-backend
- Backend docs: Check backend README.md

For frontend issues, check:

- Console logs (F12)
- Network tab (DevTools)
- Redux state (Redux DevTools)
- AsyncStorage contents (in browser/app)

---

Last Updated: 2024
Version: 1.0 (Backend Integration)
