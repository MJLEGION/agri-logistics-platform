# 🔧 Backend Sync Requirements - Frontend to Backend Integration

**Generated:** January 2025  
**Status:** CRITICAL - Backend needs updates to match frontend implementation

---

## 📋 Overview

Your frontend expects specific API endpoints, data structures, and responses from your backend. This document details **everything** your backend needs to implement for the frontend to work properly.

The frontend has:

- ✅ Full payment system (mock for demo)
- ✅ Multi-role user management (Farmer, Buyer, Transporter)
- ✅ Complete crop & order management UI
- ✅ Real-time trip tracking
- ✅ Authentication with token refresh

**Your backend currently has:** Basic CRUD for auth, crops, orders, and payments (incomplete)

---

## 🎯 Quick Summary of What's Missing

| Feature           | Frontend Status | Backend Status  | Priority    |
| ----------------- | --------------- | --------------- | ----------- |
| Phone-based Auth  | ✅ Ready        | ⚠️ Partial      | 🔴 CRITICAL |
| Token Refresh     | ✅ Ready        | ❌ Missing      | 🔴 CRITICAL |
| Crop Management   | ✅ Ready        | ⚠️ Partial      | 🔴 CRITICAL |
| Order Management  | ✅ Ready        | ⚠️ Partial      | 🔴 CRITICAL |
| Payment Endpoints | ✅ Ready (Mock) | ❌ Missing      | 🟡 HIGH     |
| Trip Tracking     | ✅ Ready        | ❌ Missing      | 🟡 HIGH     |
| User Roles        | ✅ Ready        | ⚠️ Needs fixing | 🟡 HIGH     |

---

## 🔐 Authentication System

### Current Frontend Expectations

```typescript
// Login - what frontend sends
POST /api/auth/login
{
  "phone": "0788123456",        // REQUIRED
  "password": "MyPassword123"    // REQUIRED
  // NOTE: Role is NOT sent - determined by backend from user record
}

// Response expected
{
  "token": "eyJhbGc...",         // JWT access token
  "refreshToken": "eyJhbGc...",  // Optional but REQUIRED for refresh
  "user": {
    "_id": "user_id",
    "name": "Chidi",
    "phone": "0788123456",
    "role": "farmer"              // IMPORTANT: Determined by backend
  }
}
```

### Backend Implementation Checklist

- [ ] **Phone validation**: Accept only Rwanda (+250 7xx) and Nigeria (+234 7xx)
- [ ] **Password hashing**: Use bcryptjs (already in package.json)
- [ ] **JWT tokens**:
  - Access token: 1 hour expiry
  - Refresh token: 7 days expiry
- [ ] **Token structure**: Include user.\_id and role in JWT payload
- [ ] **Response format**: Include `token`, `refreshToken`, and `user` object

### API Endpoints Required

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh          # ← MUST implement this!
GET  /api/auth/me               # Get current user (protected)
POST /api/auth/logout           # Optional
```

**Issue**: Your backend doesn't implement token refresh! Frontend tries to call `/auth/refresh` when token expires.

---

## 👤 User Roles & Permissions

### Frontend expects role-based access for:

1. **Farmer**

   - Can LIST crops
   - Can CREATE/UPDATE/DELETE own crops
   - Can VIEW orders for their crops
   - CANNOT place orders

2. **Buyer**

   - Can VIEW all crops
   - Can CREATE orders
   - Can VIEW own orders
   - CANNOT create/edit crops
   - CANNOT accept orders

3. **Transporter**
   - Can VIEW available loads (orders needing delivery)
   - Can ACCEPT orders
   - Can UPDATE order status to in_progress/completed
   - CANNOT create/edit crops or orders initially

### Backend Implementation

Your backend should:

- [ ] Store user role in JWT token
- [ ] Validate role on protected endpoints
- [ ] Return 403 if user tries unauthorized action
- [ ] Populate user data when returning crops/orders

---

## 🌾 Crops Management

### Frontend expects these endpoints:

```
GET    /api/crops                    # Get ALL crops (for buyers)
GET    /api/crops/:id                # Get single crop
POST   /api/crops                    # Create new crop (farmer only)
PUT    /api/crops/:id                # Update crop (farmer only, own crops)
DELETE /api/crops/:id                # Delete crop (farmer only, own crops)
```

### Expected Crop Object Structure

```typescript
{
  "_id": "crop_id_123",
  "farmerId": "farmer_id",           // Reference to farmer
  "name": "Maize",
  "quantity": 1000,                  // Total quantity
  "unit": "kg",                      // 'kg' | 'tons' | 'bags'
  "harvestDate": "2024-01-15",      // ISO date string
  "pricePerUnit": 500,               // Price in RWF/USD
  "location": {
    "latitude": -1.9536,
    "longitude": 30.0620,
    "address": "Kigali, Rwanda"
  },
  "status": "listed",                // 'listed' | 'matched' | 'picked_up' | 'in_transit' | 'delivered'
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:00:00Z"
}
```

### Key Issues

- [ ] Ensure farmerId is populated correctly
- [ ] Return full farmer object when requested (nested)
- [ ] Filter crops by status for different user views
- [ ] Validate that only farmer can edit their own crops
- [ ] Update crop status as orders progress

---

## 📦 Orders Management

### Frontend expects these endpoints:

```
GET    /api/orders                   # Get all orders (admin only)
GET    /api/orders/my-orders         # Get user's relevant orders (smart filtering)
GET    /api/orders/:id               # Get single order details
POST   /api/orders                   # Create new order (buyer only)
PUT    /api/orders/:id               # Update order (various roles)
PUT    /api/orders/:id/accept        # Accept order & assign transporter
```

### Expected Order Object Structure

```typescript
{
  "_id": "order_id_123",
  "cropId": "crop_id",               // Reference to crop
  "farmerId": "farmer_id",           // Farmer selling
  "buyerId": "buyer_id",             // Buyer ordering
  "transporterId": "transporter_id", // Assigned transporter (optional)
  "quantity": 500,                   // Amount being ordered
  "totalPrice": 250000,              // Total in RWF
  "status": "pending",               // pending|accepted|in_progress|completed|cancelled
  "pickupLocation": {
    "latitude": -1.9536,
    "longitude": 30.0620,
    "address": "Farm location"
  },
  "deliveryLocation": {
    "latitude": -1.9457,
    "longitude": 30.0834,
    "address": "Buyer location"
  },
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:00:00Z"
}
```

### Order Status Flow

```
pending → accepted → in_progress → completed
  ↓
cancelled
```

### Backend Implementation

- [ ] **Create order**:
  - Buyer submits order with cropId, quantity, deliveryLocation
  - Backend calculates totalPrice based on pricePerUnit
  - Set initial status to "pending"
- [ ] **Accept order** (PUT /api/orders/:id/accept):

  - Transporter accepts
  - Change status to "accepted"
  - Assign transporterId
  - Update crop status to "matched"

- [ ] **Update order**: Support partial updates for status changes
- [ ] **Smart filtering** (GET /api/orders/my-orders):
  - If user is FARMER: Return orders where farmerId == user.\_id
  - If user is BUYER: Return orders where buyerId == user.\_id
  - If user is TRANSPORTER: Return orders where transporterId == user.\_id

---

## 💳 Payment Endpoints

### Frontend currently uses MOCK system, but backend should support:

```
POST /api/payments/flutterwave/initiate     # Start payment
GET  /api/payments/flutterwave/status/:ref  # Check payment status
POST /api/payments/flutterwave/verify       # Verify payment
```

### Expected Payment Response Structure

```typescript
// Initiate response
{
  "success": true,
  "status": "pending",
  "referenceId": "FW_ORD_123_1705000000",
  "flutterwaveRef": "fw_123456",
  "message": "Payment initiated. Check your phone for prompt."
}

// Status check response
{
  "success": true,
  "status": "completed",              // pending|completed|failed
  "transactionId": "123456",
  "referenceId": "FW_ORD_123_1705000000",
  "amount": 50000,
  "currency": "RWF"
}
```

### Implementation Notes

- Frontend sends payment request with amount, phone, orderId
- Backend validates amount matches order total
- Backend calls Flutterwave API (with SECRET KEY - never in frontend)
- Backend returns reference ID for polling
- Frontend polls every 5 seconds until payment completes

---

## 🚚 Trip/Delivery Tracking (NEW - Not in current backend)

### Frontend expects these for transporter:

```
GET  /api/trips                      # Get all available trips
GET  /api/trips/:orderId             # Get trip details
PUT  /api/trips/:orderId/start       # Start trip (location update)
PUT  /api/trips/:orderId/update      # Update driver location
PUT  /api/trips/:orderId/complete    # Mark trip complete
```

### Expected Trip Object Structure

```typescript
{
  "orderId": "order_id",
  "transporterId": "transporter_id",
  "status": "coming",                // coming|arrived|in_transit|completed
  "driverLocation": {
    "latitude": -1.9536,
    "longitude": 30.0620,
    "timestamp": 1705000000000
  },
  "eta": 5,                          // minutes
  "distanceRemaining": 2.5,          // km
  "pickupLocation": { /* ... */ },
  "deliveryLocation": { /* ... */ }
}
```

### Key Features

- [ ] Real-time location tracking
- [ ] Calculate ETA based on distance and speed (40 km/h)
- [ ] Update distance remaining as driver moves
- [ ] Support WebSocket for live updates (or polling)

---

## 🔄 Token Refresh Flow (CRITICAL)

### This is what frontend does:

1. User logs in → Frontend gets `token` + `refreshToken`
2. Frontend makes API call with token
3. Backend responds with 401 (token expired)
4. Frontend calls `/api/auth/refresh` with refreshToken
5. Backend validates refreshToken and returns new access token
6. Frontend retries original request with new token

### Backend Implementation

```javascript
POST /api/auth/refresh
Request Body: { "refreshToken": "eyJhbGc..." }

Response (200):
{
  "token": "new_access_token_here",
  "refreshToken": "new_refresh_token_here"  // Optional, can rotate both
}

Response (401):
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

**Without this endpoint, frontend gets stuck when tokens expire!**

---

## 🛡️ Security Requirements

### What frontend sends with every request:

```
Authorization: Bearer eyJhbGc...
```

### Backend must:

- [ ] Validate JWT signature
- [ ] Check token expiry
- [ ] Extract user.\_id and role from token
- [ ] Validate user still exists in database
- [ ] Check role permissions before allowing action
- [ ] Return 401 if token invalid/expired
- [ ] Return 403 if user lacks permission

### CORS Configuration

Already set in your backend (`cors` imported), but verify:

```javascript
app.use(cors());
// Should allow requests from frontend URL
// Typically: http://localhost:19006 (Expo web)
//           or http://192.168.x.x:19006 (mobile)
```

---

## 📊 Database Schema Changes Needed

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  phone: String (required, unique, validated),
  password: String (required, bcrypt hashed),
  role: String (required, enum: ['farmer', 'buyer', 'transporter']),
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Crop Model

```javascript
{
  _id: ObjectId,
  farmerId: ObjectId (ref to User, required),
  name: String (required),
  quantity: Number (required),
  unit: String (enum: ['kg', 'tons', 'bags']),
  harvestDate: Date (required),
  pricePerUnit: Number (required),
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: String (enum: ['listed', 'matched', 'picked_up', 'in_transit', 'delivered']),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model

```javascript
{
  _id: ObjectId,
  cropId: ObjectId (ref to Crop, required),
  farmerId: ObjectId (ref to User, required),
  buyerId: ObjectId (ref to User, required),
  transporterId: ObjectId (ref to User, optional),
  quantity: Number (required),
  totalPrice: Number (required),
  status: String (enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']),
  pickupLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  deliveryLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: CRITICAL (Do First)

1. Implement `/api/auth/refresh` endpoint
2. Fix user role validation
3. Fix crop GET to return all crops
4. Fix order GET to filter by role

### Phase 2: Important

1. Implement full order update flow
2. Add payment endpoints (even if mock for now)
3. Add proper error responses (400, 403, 404, 500)

### Phase 3: Enhancement

1. Add trip tracking endpoints
2. Add real-time location updates
3. Add analytics/reporting

---

## ⚡ Response Format Standards

### Success Response (200, 201)

```json
{
  "success": true,
  "data": {
    /* actual data */
  },
  "message": "Optional success message"
}
```

### Error Response (400, 401, 403, 404, 500)

```json
{
  "success": false,
  "error": "error_code_here",
  "message": "Human-readable error message",
  "details": {
    /* optional extra details */
  }
}
```

### Frontend expects:

- `success` boolean
- `data` or `error` fields
- Status codes to match actual situation
- Clear error messages for UI display

---

## 🧪 Testing Credentials (From PHONE_VALIDATION_GUIDE.md)

### Valid Test Phone Numbers

**Rwanda (Rwandan context)**:

- `0788123456` (MTN MoMo)
- `0789123456` (MTN MoMo)
- `0798123456` (Airtel)
- `0730123456` (Airtel)
- `+250788123456` (International format)

**Nigeria (For testing if supporting)**:

- `08012345678` (11 digits)
- `07912345678` (11 digits)
- `09012345678` (11 digits)

### Password Requirements

- Minimum 6 characters
- Example: `MyPass123!` or `farm2024`

---

## 📝 Migration Checklist

Use this to track backend implementation:

### Authentication

- [ ] Phone validation (Nigeria + Rwanda)
- [ ] Password hashing with bcryptjs
- [ ] JWT token generation (1h expiry)
- [ ] Refresh token generation (7d expiry)
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/refresh ← CRITICAL
- [ ] GET /api/auth/me (protected)
- [ ] Role-based middleware

### Crops

- [ ] GET /api/crops (all crops, return array)
- [ ] GET /api/crops/:id (single crop)
- [ ] POST /api/crops (create, farmer only)
- [ ] PUT /api/crops/:id (update, farmer only, own crops)
- [ ] DELETE /api/crops/:id (delete, farmer only)
- [ ] Farmer filter in GET endpoints
- [ ] Status update when orders are placed

### Orders

- [ ] GET /api/orders (admin only)
- [ ] GET /api/orders/my-orders (smart role-based filtering)
- [ ] GET /api/orders/:id (single order)
- [ ] POST /api/orders (create, buyer only)
- [ ] PUT /api/orders/:id (update status)
- [ ] PUT /api/orders/:id/accept (transporter assigns)
- [ ] Order status flow validation
- [ ] Total price calculation

### Payments

- [ ] POST /api/payments/flutterwave/initiate
- [ ] GET /api/payments/flutterwave/status/:ref
- [ ] POST /api/payments/flutterwave/verify
- [ ] Validation: amount matches order
- [ ] Error handling for payment failures

### Trips (Optional for MVP)

- [ ] GET /api/trips
- [ ] GET /api/trips/:orderId
- [ ] PUT /api/trips/:orderId/start
- [ ] PUT /api/trips/:orderId/update
- [ ] PUT /api/trips/:orderId/complete

---

## 🔗 Frontend API Calls Reference

### Frontend services call these endpoints:

**authService.ts**:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh` ← Retry mechanism

**cropService.ts**:

- `GET /crops` (all)
- `GET /crops/:id` (single)
- `POST /crops` (create)
- `PUT /crops/:id` (update)
- `DELETE /crops/:id` (delete)

**orderService.ts**:

- `GET /orders` (all)
- `GET /orders/my-orders` (filtered)
- `POST /orders` (create)
- `PUT /orders/:id` (update)
- `PUT /orders/:id/accept` (accept)

**mockPaymentService.ts**:

- Currently using mock (no backend calls needed yet)

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid token" errors

**Cause**: JWT validation failing  
**Solution**: Ensure token includes user.\_id and role

### Issue: Orders not appearing

**Cause**: Role-based filtering not working  
**Solution**: Check role in JWT and filter by role

### Issue: Transporter can't accept orders

**Cause**: Role-based permission check failing  
**Solution**: Validate transporter role and allow PUT to `/orders/:id/accept`

### Issue: Payment workflow fails

**Cause**: Backend doesn't have payment endpoints  
**Solution**: Implement endpoints or use mock payment (frontend is already set up for mock)

---

## 📞 Support

If implementing these endpoints, refer to:

- `FLUTTERWAVE_INTEGRATION.md` - For payment endpoint code template
- `PHONE_VALIDATION_GUIDE.md` - For phone validation rules
- Frontend service files for expected request/response formats

**Frontend architecture is production-ready. Backend needs catching up!** 🚀
