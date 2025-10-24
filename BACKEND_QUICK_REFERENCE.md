# 📋 Backend Quick Reference - What Frontend Expects vs What Backend Has

---

## 🔴 CRITICAL GAPS (Without these, app breaks)

### 1. Token Refresh

| Feature      | Frontend                                          | Backend       | Status      |
| ------------ | ------------------------------------------------- | ------------- | ----------- |
| **Endpoint** | `POST /api/auth/refresh`                          | ❌ NOT EXISTS | 🔴 CRITICAL |
| **Request**  | `{ refreshToken }`                                | -             | -           |
| **Response** | `{ token, refreshToken, user }`                   | -             | -           |
| **Behavior** | Called when access token expires                  | -             | -           |
| **Impact**   | Without this, users get stuck at 401 after 1 hour | -             | -           |

**Fix**: Add 10 lines of code to auth controller

---

### 2. User Role in JWT

| Feature         | Frontend                                   | Backend                     | Status      |
| --------------- | ------------------------------------------ | --------------------------- | ----------- |
| **JWT Payload** | Expects `{ userId, role }`                 | ❌ Currently missing `role` | 🔴 CRITICAL |
| **Used for**    | Permission checks in frontend interceptors | -                           | -           |
| **Impact**      | Can't determine who can do what            | -                           | -           |

**Fix**: Update token generation to include role

---

### 3. Smart Order Filtering

| Feature             | Frontend                                  | Backend            | Status      |
| ------------------- | ----------------------------------------- | ------------------ | ----------- |
| **Endpoint**        | `GET /api/orders/my-orders`               | ⚠️ Returns nothing | 🔴 CRITICAL |
| **For Farmer**      | Show orders for their crops               | -                  | -           |
| **For Buyer**       | Show orders they placed                   | -                  | -           |
| **For Transporter** | Show orders assigned to them              | -                  | -           |
| **Impact**          | Farmers/buyers/transporters see no orders | -                  | -           |

**Fix**: Add simple if-else statement based on `req.userRole`

---

## 🟡 HIGH PRIORITY GAPS (App partially works, but features missing)

### 4. Crop Endpoints

| Endpoint                | Frontend Expects                   | Backend Has | Status      |
| ----------------------- | ---------------------------------- | ----------- | ----------- |
| `GET /api/crops`        | All crops with farmerId populated  | ⚠️ Partial  | 🟡 HIGH     |
| `POST /api/crops`       | Create, save farmerId from token   | ⚠️ Partial  | 🟡 HIGH     |
| `PUT /api/crops/:id`    | Update own crop, validate farmerId | ❌ Missing  | 🔴 CRITICAL |
| `DELETE /api/crops/:id` | Delete own crop, validate farmerId | ❌ Missing  | 🔴 CRITICAL |

**Current Issue**: Backend doesn't validate that farmer can only edit own crops

---

### 5. Order Accept Endpoint

| Feature      | Frontend                                          | Backend       | Status      |
| ------------ | ------------------------------------------------- | ------------- | ----------- |
| **Endpoint** | `PUT /api/orders/:id/accept`                      | ❌ NOT EXISTS | 🔴 CRITICAL |
| **Purpose**  | Transporter accepts order and gets assigned       | -             | -           |
| **Updates**  | `status: pending → accepted`, set `transporterId` | -             | -           |
| **Also**     | Should update crop status to `matched`            | -             | -           |
| **Impact**   | Transporters can't accept orders                  | -             | -           |

**Code**: Just 15 lines needed

---

### 6. Payment Endpoints

| Endpoint                                    | Frontend                          | Backend       | Status  |
| ------------------------------------------- | --------------------------------- | ------------- | ------- |
| `POST /api/payments/flutterwave/initiate`   | Frontend calls with order details | ❌ NOT EXISTS | 🟡 HIGH |
| `GET /api/payments/flutterwave/status/:ref` | Check payment status              | ❌ NOT EXISTS | 🟡 HIGH |
| `POST /api/payments/flutterwave/verify`     | Verify payment                    | ❌ NOT EXISTS | 🟡 HIGH |

**Note**: Frontend currently uses MOCK for demo, but you'll need these for production.

---

## ✅ What's Already Good

| Feature               | Status     | Notes                             |
| --------------------- | ---------- | --------------------------------- |
| User registration     | ✅ Working | Just needs role-based validation  |
| User login            | ✅ Working | Needs to include role in JWT      |
| Basic auth middleware | ✅ Exists  | Needs enhancement for role checks |
| Database connection   | ✅ Working | MongoDB setup looks good          |
| CORS                  | ✅ Enabled | Ready for frontend requests       |

---

## 📊 Endpoint Comparison

### Authentication Endpoints

```
Frontend Expects          Backend Has           Status
===============================================================
POST /auth/login          ✅ Exists             ⚠️ Missing refreshToken in response
POST /auth/register       ✅ Exists             ✅ OK
POST /auth/refresh        ❌ MISSING            🔴 CRITICAL
GET  /auth/me             ✅ Exists             ✅ OK
```

### Crop Endpoints

```
Frontend Expects          Backend Has           Status
===============================================================
GET  /crops               ⚠️ Partial            ⚠️ Needs population, filtering
GET  /crops/:id           ⚠️ Partial            ⚠️ Needs population
POST /crops               ✅ Exists             ✅ OK (but validate farmerId)
PUT  /crops/:id           ❌ MISSING            🔴 CRITICAL
DELETE /crops/:id         ❌ MISSING            🔴 CRITICAL
```

### Order Endpoints

```
Frontend Expects          Backend Has           Status
===============================================================
GET  /orders              ⚠️ Partial            ⚠️ Missing role-based filtering
GET  /orders/my-orders    ❌ MISSING            🔴 CRITICAL
POST /orders              ✅ Exists             ✅ OK
PUT  /orders/:id          ⚠️ Partial            ⚠️ Basic update only
PUT  /orders/:id/accept   ❌ MISSING            🔴 CRITICAL
```

### Payment Endpoints

```
Frontend Expects          Backend Has           Status
===============================================================
POST /payments/.../init   ❌ MISSING            🟡 Not urgent (using mock)
GET  /payments/.../status ❌ MISSING            🟡 Not urgent (using mock)
POST /payments/.../verify ❌ MISSING            🟡 Not urgent (using mock)
```

---

## 🔐 Request/Response Format

### What Frontend Sends (Every Request)

```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

### What Frontend Expects Back (Success)

```json
{
  "success": true,
  "data": {
    /* actual data */
  },
  "message": "Optional"
}
```

### What Frontend Expects Back (Error)

```json
{
  "success": false,
  "message": "Error description",
  "error": "error_code"
}
```

---

## 💾 Database Population Requirements

### When returning crops, populate:

```javascript
Crop.find()
  .populate('farmerId', 'name phone location')
  ↑ Frontend needs farmer details
```

### When returning orders, populate:

```javascript
Order.find()
  .populate("cropId") // Need crop details
  .populate("farmerId", "name phone")
  .populate("buyerId", "name phone")
  .populate("transporterId", "name phone");
```

---

## 🚨 Permission Matrix

### What Each Role Can Do

```
ACTION                  FARMER          BUYER           TRANSPORTER
===================================================================
LIST crops              ❌ (their own)  ✅ All          ❌
CREATE crop             ✅              ❌              ❌
UPDATE own crop         ✅              ❌              ❌
DELETE own crop         ✅              ❌              ❌
PLACE order             ❌              ✅              ❌
VIEW own orders         ✅              ✅              ✅
ACCEPT order            ❌              ❌              ✅
UPDATE order status     ⚠️ Limited      ❌              ✅
```

### Backend must enforce on every endpoint!

```javascript
// Example: Only farmer can create crops
router.post(
  "/crops",
  protect, // Check auth
  authorize("farmer"), // Check role ← CRITICAL
  cropController.createCrop
);
```

---

## 📱 Typical Frontend Flow

```
User Opens App
    ↓
Checks AsyncStorage for token
    ↓
If NO token → Show login
If YES token → Call GET /auth/me
    ↓
If 401 (expired) → Call POST /auth/refresh ← NEEDS THIS!
    ↓
If still 401 → Show login
If 200 → Load user data, check role
    ↓
Show farmer/buyer/transporter dashboard
```

**Without `/auth/refresh`, flow breaks at step marked**

---

## 🔧 Implementation Priority

### Week 1 (Must Have)

```
1. ✅ POST /auth/refresh endpoint (10 lines)
2. ✅ Include role in JWT (2 lines)
3. ✅ GET /orders/my-orders filtering (10 lines)
```

### Week 2 (Should Have)

```
4. ✅ PUT /crops/:id endpoint
5. ✅ DELETE /crops/:id endpoint
6. ✅ PUT /orders/:id/accept endpoint
```

### Week 3+ (Nice to Have)

```
7. Payment endpoints
8. Trip tracking
9. Real-time updates
```

---

## 🧪 Quick Testing Checklist

### Test 1: Token Refresh

```bash
✅ Can login and get tokens
✅ Token expires after 1 hour
✅ Can refresh with refreshToken
✅ New token works for 1 more hour
```

### Test 2: Role-Based Filtering

```bash
✅ Farmer sees only their orders
✅ Buyer sees only their orders
✅ Transporter sees only assigned orders
```

### Test 3: Crop Management

```bash
✅ Farmer can create crop
✅ Only farmer can update their crop
✅ Other farmer can't update
✅ Farmer can delete their crop
```

### Test 4: Order Workflow

```bash
✅ Buyer can create order (pending)
✅ Transporter can accept (pending → accepted)
✅ Crop status changes to matched
✅ Only transporter can update order status
```

---

## 📞 Common Error Messages

### When Backend Missing Token Refresh

```
Frontend shows: "Session expired"
Console shows: "401: Invalid token"
Reason: No refresh endpoint
Fix: Implement /auth/refresh
```

### When Role Missing from JWT

```
Frontend shows: "Permission denied"
Console shows: "Role is undefined"
Reason: JWT doesn't include role
Fix: Add role to token generation
```

### When Orders Not Appearing

```
Frontend shows: Empty order list
Console shows: Empty array response
Reason: No role-based filtering
Fix: Check user role and filter by that role
```

### When Crops Not Populating

```
Frontend shows: "Farmer: undefined"
Console shows: farmerId as ObjectId string
Reason: Not using .populate()
Fix: Add .populate('farmerId', 'name phone location')
```

---

## 🎯 Final Checklist for Demo Ready

- [ ] ✅ POST /auth/refresh works
- [ ] ✅ JWT includes userId and role
- [ ] ✅ GET /orders/my-orders filters by role
- [ ] ✅ PUT /crops/:id (with farmer validation)
- [ ] ✅ DELETE /crops/:id (with farmer validation)
- [ ] ✅ PUT /orders/:id/accept (transporter only)
- [ ] ✅ All responses use { success, data, message } format
- [ ] ✅ All errors return proper status codes (400, 401, 403, 404, 500)
- [ ] ✅ Farmer references populated (name, phone)
- [ ] ✅ Test with frontend - can login, see data, create/update items

---

**Current Status**: 🚀 Your frontend is ready. Backend needs ~50 lines of code to be production-ready!
