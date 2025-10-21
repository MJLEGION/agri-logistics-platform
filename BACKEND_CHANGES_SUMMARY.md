# Frontend Changes Summary - Backend Integration

## 🎯 What Was Changed and Why

Your backend uses Node.js/Express/MongoDB instead of the mock services. Here are the adjustments made to your frontend to work with the real backend.

---

## 📝 File-by-File Changes

### 1️⃣ `src/services/authService.js`

**Problem**: Backend returns different token format (`accessToken` + `refreshToken` instead of single `token`)

**Solution**:

```javascript
// BEFORE: Expected response.data.token
if (response.data.token) {
  await AsyncStorage.setItem("token", response.data.token);
}

// AFTER: Handle backend response format
if (response.data.accessToken) {
  await AsyncStorage.setItem("accessToken", response.data.accessToken);
}
if (response.data.refreshToken) {
  await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
}
// For backward compatibility
if (response.data.accessToken) {
  await AsyncStorage.setItem("token", response.data.accessToken);
}
```

**Changes in `register()` and `login()` functions**:

- ✅ Store `accessToken` separately
- ✅ Store `refreshToken` for token refresh
- ✅ Still set `token` for backward compatibility
- ✅ Transform response to include `token` field

---

### 2️⃣ `src/services/api.js`

**Problem**: Axios interceptor doesn't know about new `accessToken` storage

**Solution**:

```javascript
// BEFORE: Only checked for 'token'
const token = await AsyncStorage.getItem("token");

// AFTER: Check both formats
let token = await AsyncStorage.getItem("accessToken");
if (!token) {
  token = await AsyncStorage.getItem("token");
}
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
  console.log(`🔑 Auth token added to request`);
}
```

**Benefits**:

- ✅ Works with new backend tokens
- ✅ Backward compatible with old token format
- ✅ Automatic token injection on every request

---

### 3️⃣ `src/services/orderService.js`

**Problem**: Accept order endpoint requires JWT auth (not transporterId in body)

**Solution**:

```javascript
// BEFORE: Might have tried to pass data in request body
export const acceptOrder = async (id, transporterId) => {
  const response = await api.put(`/orders/${id}/accept`, { transporterId });
};

// AFTER: Empty body, use JWT token from header
export const acceptOrder = async (id, transporterId) => {
  // Backend uses JWT token from Authorization header
  // to identify the transporter (req.user._id)
  const response = await api.put(`/orders/${id}/accept`);
};
```

**Key Point**: Backend extracts user ID from JWT token, not from request body!

---

### 4️⃣ `src/store/slices/authSlice.ts`

**Problem**: Backend response has nested user object, but frontend expected flat structure

**Solution**:

```javascript
// BEFORE: Expected response.data._id
state.user = {
  _id: action.payload._id,
  id: action.payload._id,
  name: action.payload.name,
  phone: action.payload.phone,
  role: action.payload.role,
};

// AFTER: Extract from nested user object
state.user = {
  _id: action.payload.user?._id,
  id: action.payload.user?._id,
  name: action.payload.user?.name,
  phone: action.payload.user?.phone,
  role: action.payload.user?.role,
};

// Handle both token formats
state.token = action.payload.token || action.payload.accessToken;
```

**Applied to**: Both `register.fulfilled` and `login.fulfilled` cases

---

### 5️⃣ `src/store/slices/ordersSlice.ts`

**Problem**: Accept order thunk didn't validate user authentication

**Solution**:

```javascript
// ADDED: Validation before accepting
const userId = state.auth?.user?.id || state.auth?.user?._id;
if (!userId) {
  throw new Error("User not authenticated. Please log in again.");
}

// Then proceed with accept
const result = await orderService.acceptOrder(id, userId);
```

**Benefits**:

- ✅ Better error messages
- ✅ Prevents failing silently if user not logged in
- ✅ Clearer debugging

---

## 🔄 Data Flow Changes

### Auth Response (New Format)

```json
{
  "success": true,
  "message": "Welcome back!",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "phone": "+250788123456",
    "role": "transporter"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Order Response (New Format)

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "status": "in_progress",
  "transporterId": "507f1f77bcf86cd799439016",
  "cropId": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Tomatoes",
    "quantity": 100,
    "unit": "kg"
  },
  "farmerId": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "James Farmer",
    "phone": "+250788111111"
  },
  "buyerId": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "Michael Buyer",
    "phone": "+250788222222"
  },
  "quantity": 50,
  "totalPrice": 25000,
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
  "updatedAt": "2024-10-21T10:35:00Z"
}
```

---

## 🔐 Authentication Flow (Updated)

```
1. User submits login/register
   ↓
2. authService.js calls backend API
   ↓
3. Backend returns {user, accessToken, refreshToken}
   ↓
4. authService stores:
   - accessToken in AsyncStorage (for API requests)
   - refreshToken in AsyncStorage (for token refresh)
   - token in AsyncStorage (for compatibility)
   ↓
5. authSlice.ts updates Redux with user + token
   ↓
6. On next API request:
   - api.js interceptor reads accessToken from storage
   - Adds header: Authorization: Bearer {accessToken}
   - Backend verifies JWT and identifies user
```

---

## ✅ What Still Works

These features were **NOT changed** (already compatible):

- ✅ Crop service (`src/services/cropService.js`) - Same structure
- ✅ Mock services fallback - Still available if backend offline
- ✅ Redux structure - Compatible with both old and new response formats
- ✅ UI components - Work with backend data without changes
- ✅ Screen components - No changes needed
- ✅ Navigation - No changes needed

---

## ⚠️ Breaking Changes from Mock Service

| Feature          | Mock Service        | Real Backend                                           | Impact                        |
| ---------------- | ------------------- | ------------------------------------------------------ | ----------------------------- |
| Token field      | `token`             | `accessToken` + `refreshToken`                         | Now stores both               |
| User nesting     | `response.data`     | `response.data.user`                                   | Slice updated                 |
| Accept endpoint  | Takes transporterId | Uses JWT token                                         | No body sent                  |
| Order IDs        | `order_001` format  | MongoDB ObjectId                                       | Transparent                   |
| Status values    | Any string          | Enum: pending/accepted/in_progress/completed/cancelled | Validation on backend         |
| Phone validation | Not enforced        | Nigerian/Rwandan format only                           | Registration fails if invalid |

---

## 🧪 How to Verify Changes Work

### Test 1: Register

```
1. Open console (F12)
2. Register with phone: +250788123456
3. Look for console logs:
   - 📝 Attempting registration with real API...
   - 📤 API Request: POST /api/auth/register
   - 🔑 Auth token added to request
   - ✅ Registration successful (Real API)
```

### Test 2: Check Token Storage

```
Browser Console:
> localStorage.getItem('accessToken')  // Should show token
> localStorage.getItem('token')        // Should also show token

Or in app:
> AsyncStorage.getItem('accessToken')
> AsyncStorage.getItem('refreshToken')
```

### Test 3: Accept Order

```
1. Login as transporter
2. Go to Available Loads
3. Click Accept Load
4. Console should show:
   - 📦 Attempting to accept order with real API...
   - 📤 API Request: PUT /api/orders/:id/accept
   - 🔑 Auth token added to request
   - ✅ Order accepted (Real API)
5. Order should move to Active Trips
```

---

## 🐛 Troubleshooting

### Problem: "Invalid phone number"

**Cause**: Backend validates phone format (Nigerian/Rwandan only)
**Fix**: Use format like `+250788123456` or `0788123456`

### Problem: "Auth token not added"

**Cause**: Token not stored in AsyncStorage
**Fix**:

1. Check login succeeded
2. Look for "✅ Registration successful" in console
3. Verify token is in AsyncStorage

### Problem: "Order still in Available Loads after accept"

**Cause**: Order status not changed or transporterId not set
**Fix**:

1. Check accept request succeeded
2. Verify order returned with `status: 'in_progress'`
3. Check your user ID is set as `transporterId`

### Problem: "Backend offline but mock doesn't work"

**Cause**: Service initialization issue
**Fix**:

1. Restart app
2. Clear browser cache
3. Check console for mock service initialization

---

## 📚 Related Documentation

- **Backend Integration Guide**: `BACKEND_INTEGRATION_GUIDE.md`
- **Quick Testing Guide**: `BACKEND_TESTING_QUICK_START.md`
- **API Checklist**: `BACKEND_API_CHECKLIST.md`

---

## ✨ Summary

Your app now:

- ✅ Works with Node.js/Express backend
- ✅ Handles JWT authentication (accessToken + refreshToken)
- ✅ Sends authorization headers on every request
- ✅ Validates user before critical operations
- ✅ Falls back to mock service if backend unavailable
- ✅ Provides detailed console logging for debugging

The changes are **minimal and backward compatible** - most of the app works unchanged!

---

**Last Updated**: 2024
**Status**: Ready for testing with backend
