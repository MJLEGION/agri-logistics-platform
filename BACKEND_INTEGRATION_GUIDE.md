# Backend Integration Guide

## 🔗 Backend Connection Updates

This document summarizes the frontend adjustments made to work with your Node.js/MongoDB backend.

---

## ✅ Changes Made

### 1. **Authentication Token Handling**

**File**: `src/services/authService.js`

**What Changed**:

- Backend now returns `accessToken` & `refreshToken` (not single `token`)
- Updated `register()` and `login()` functions to:
  - Store both tokens in AsyncStorage
  - Transform response to include `token` field for backward compatibility
  - Handle both old and new token formats

**Response Format**:

```json
{
  "success": true,
  "message": "Welcome back!",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "phone": "+250788123456",
    "role": "transporter"
  },
  "accessToken": "jwt_token_1h",
  "refreshToken": "jwt_token_7d"
}
```

### 2. **Token Storage & Authorization**

**File**: `src/services/api.js`

**What Changed**:

- Updated request interceptor to check both `accessToken` and `token`
- Automatically adds JWT token to all API requests via `Authorization: Bearer {token}` header
- Added logging for token attachment

### 3. **User Data in Redux**

**File**: `src/store/slices/authSlice.ts`

**What Changed**:

- Updated both `register.fulfilled` and `login.fulfilled` handlers
- Now correctly extracts user data from `action.payload.user` object
- Handles both `token` and `accessToken` fields for flexibility

### 4. **Accept Order Endpoint**

**File**: `src/services/orderService.js`

**What Changed**:

- Backend endpoint: `PUT /api/orders/:id/accept`
- **Important**: Backend uses JWT token for authentication (from header)
- No request body is needed - transporter ID comes from JWT token
- Removed assumption of transporterId parameter in request

**How It Works**:

1. Frontend calls: `api.put('/orders/{id}/accept')`
2. Axios interceptor adds: `Authorization: Bearer {accessToken}`
3. Backend extracts user ID from JWT token
4. Backend sets: `order.transporterId = req.user._id` and `order.status = 'in_progress'`

### 5. **Authorization Validation**

**File**: `src/store/slices/ordersSlice.ts`

**What Changed**:

- Added validation in `acceptOrder` thunk
- Ensures user is authenticated before accepting order
- Better error messages if user not logged in

---

## 📋 Expected Order Response

Backend returns complete order objects:

```json
{
  "_id": "mongodb_id",
  "cropId": {
    "_id": "crop_id",
    "name": "Tomatoes",
    "quantity": 100,
    "unit": "kg"
  },
  "farmerId": {
    "_id": "farmer_id",
    "name": "Farmer Name",
    "phone": "+250788111111"
  },
  "buyerId": {
    "_id": "buyer_id",
    "name": "Buyer Name",
    "phone": "+250788222222"
  },
  "transporterId": "transporter_id_or_null",
  "quantity": 50,
  "totalPrice": 25000,
  "status": "accepted|in_progress|completed",
  "pickupLocation": {
    "latitude": -1.9536,
    "longitude": 29.8739,
    "address": "Kigali Central Market"
  },
  "deliveryLocation": {
    "latitude": -1.9706,
    "longitude": 29.9498,
    "address": "Kigali Business District"
  },
  "createdAt": "2024-10-21T10:30:00Z",
  "updatedAt": "2024-10-21T10:30:00Z"
}
```

---

## 🔄 Order Status Flow

Backend maintains this status flow:

- **pending** → Order initially created (not used in current flow)
- **accepted** → Order ready for transporter to pick up
- **in_progress** → Transporter accepted the order
- **completed** → Order delivered
- **cancelled** → Order cancelled

### Transporter Flow:

1. Transporter sees orders with `status === 'accepted'` in "Available Loads"
2. Clicks "Accept Load" → calls `PUT /api/orders/:id/accept`
3. Backend sets `transporterId = req.user._id` and `status = 'in_progress'`
4. Order now appears in "Active Trips" (filtered by `transporterId`)

---

## 🔐 API Authentication

All endpoints (except `/auth/register` and `/auth/login`) require JWT token:

```
Authorization: Bearer {accessToken}
```

**Available Endpoints**:

- `POST /api/auth/register` - Public
- `POST /api/auth/login` - Public
- `GET /api/orders` - Requires auth (returns all orders)
- `GET /api/orders/my-orders` - Requires auth (returns user's orders only)
- `GET /api/orders/:id` - Requires auth
- `PUT /api/orders/:id/accept` - Requires auth (transporter only)
- `GET /api/auth/me` - Requires auth

---

## 📱 Phone Validation

Backend enforces phone number validation:

**Nigerian Format**:

- `0801-0809` + 9 digits
- `0701-0709` + 9 digits
- `+234` + 9 digits

**Rwandan Format**:

- `+2507` + 7 digits
- `07` + 7 digits (0788-0798)

**Examples**:

- ✅ `+250788123456`
- ✅ `0788123456`
- ✅ `+2340801234567`
- ✅ `08012345678`

---

## 🧪 Testing Checklist

### 1. **Registration**

- [ ] Use valid phone number (Nigerian or Rwandan format)
- [ ] Verify token is stored in AsyncStorage
- [ ] Check Redux auth state has user data

### 2. **Login**

- [ ] Login with registered credentials
- [ ] Check accessToken & refreshToken are stored
- [ ] Verify user role is captured correctly

### 3. **Transporter Workflow**

- [ ] Login as transporter
- [ ] Fetch available orders: Should see orders with `status: 'accepted'`
- [ ] Accept an order: Should call `PUT /api/orders/:id/accept`
- [ ] Check Active Trips: Order should now appear (with `transporterId` set)
- [ ] Available Loads: Order should disappear from this view

### 4. **Error Handling**

- [ ] Try invalid phone number → Should show validation error
- [ ] Try wrong password → Should show error
- [ ] Try to accept order without auth → Should redirect to login
- [ ] Accept order that's already accepted → Should show error

### 5. **Network Issues**

- [ ] With backend offline: App should fallback to mock service
- [ ] When backend comes online: Requests should succeed
- [ ] Check console logs show which service is being used

---

## 🐛 Debugging Tips

**Check console logs for**:

- `🌐 API URL (web): ...` - Confirms API endpoint
- `📤 API Request: POST /api/auth/login` - Request being made
- `🔑 Auth token added to request` - Token attachment
- `✅ API Response: POST ... 200` - Successful response
- `❌ API Error: 401 - ...` - Authentication error
- `⚠️ Real API failed, using mock order service...` - Fallback to mock

**Common Issues**:

| Issue                             | Solution                                  |
| --------------------------------- | ----------------------------------------- |
| "Network Error: No response"      | Check backend is running on port 5000     |
| "Invalid phone number"            | Use correct Nigerian/Rwandan format       |
| "Only transporters can accept"    | Log in with transporter role              |
| "Order already has a transporter" | Order is already accepted by someone      |
| Token is null                     | Check AsyncStorage contains `accessToken` |

---

## 🚀 Environment Setup

Make sure `.env` file is configured:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_API_URL_MOBILE=http://192.168.1.64:5000/api
```

For **web**: Uses `http://localhost:5000/api`
For **mobile**: Uses IP address from `EXPO_PUBLIC_API_URL_MOBILE`

---

## 📚 Backend Repository

Backend code: [agri-logistics-backend](https://github.com/MJLEGION/agri-logistics-backend)

Key files:

- `src/models/order.js` - Order schema
- `src/controllers/orderController.js` - Order endpoints
- `src/controllers/authController.js` - Auth endpoints
- `src/middleware/auth.js` - JWT verification

---

## ✨ Next Steps

1. **Run backend**: `npm start` on port 5000
2. **Update `.env`** if needed for your network setup
3. **Test registration** with valid phone number
4. **Test transporter flow** for order acceptance
5. **Monitor console** for detailed debugging info

---

Generated: 2024
Updated to match Node.js/MongoDB backend
