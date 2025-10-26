# Backend Integration Implementation Checklist

## ✅ Phase 1: Configuration & Setup

- [ ] **Update `.env` file**

  ```
  BACKEND_API_URL=http://localhost:5000/api
  BACKEND_API_TIMEOUT=30000
  ```

- [ ] **Update `.env.example`** with same variables

- [ ] **Update `src/utils/platformUtils.ts`**

  - Change API URL from `http://localhost:3000/api` to `http://localhost:5000/api`
  - Ensure `getApiUrl()` returns correct backend URL

- [ ] **Update `src/api/axios.config.ts`**
  - Change baseURL from `http://localhost:3000/api` to `http://localhost:5000/api`

---

## ✅ Phase 2: Service Files (Already Created ✅)

### Status: **COMPLETE** ✅

- [x] **`src/services/cargoService.ts`** - Already exists, uses correct `/crops` endpoint
- [x] **`src/services/orderService.ts`** - ✅ Created
- [x] **`src/services/transporterService.ts`** - ✅ Created
- [x] **`src/services/paymentService.ts`** - ✅ Created (Optional)

**No action needed** - All service files are ready!

---

## ✅ Phase 3: Redux State Management

### Status: **COMPLETE** ✅

- [x] **`src/store/slices/ordersSlice.ts`** - ✅ Updated with `assignTransporter` thunk
- [x] **`src/store/slices/transportersSlice.ts`** - ✅ Created
- [x] **`src/store/index.ts`** - ✅ Updated to include transporters reducer

**No action needed** - All Redux slices are ready!

---

## ✅ Phase 4: Test Backend Connection

### Before proceeding, verify backend is running:

- [ ] **Start backend server**

  ```bash
  # In your backend directory
  npm start
  # Should be running on http://localhost:5000
  ```

- [ ] **Test connection**
  ```bash
  # In your project terminal
  curl http://localhost:5000/api/auth/me
  # Should return: {"statusCode": 401, "message": "Unauthorized"}
  # (401 is expected without token - means server is running)
  ```

---

## ✅ Phase 5: Frontend Application Updates

### Screens to Update (Optional but Recommended):

#### **Shipper/Farmer Screens:**

- [ ] **`src/screens/shipper/ShipperDashboardScreen.tsx`**

  - Import: `import { fetchCargo } from '../store/slices/cargoSlice';`
  - On mount: `dispatch(fetchCargo())`
  - Connect to Redux: Use `useSelector((state) => state.cargo)`

- [ ] **`src/screens/shipper/ListCargoScreen.tsx`**

  - Import: `import { createCargo } from '../store/slices/cargoSlice';`
  - On submit: `dispatch(createCargo(formData))`

- [ ] **`src/screens/shipper/OrdersScreen.tsx`**
  - Import: `import { fetchUserOrders } from '../store/slices/ordersSlice';`
  - On mount: `dispatch(fetchUserOrders(user._id))`

#### **Transporter Screens:**

- [ ] **`src/screens/transporter/TransporterDashboardScreen.tsx`**

  - Import: `import { fetchAvailableTransporters } from '../store/slices/transportersSlice';`
  - On mount: `dispatch(fetchAvailableTransporters())`

- [ ] **`src/screens/transporter/AvailableLoadsScreen.tsx`**
  - Import: `import { fetchOrders } from '../store/slices/ordersSlice';`
  - On mount: `dispatch(fetchOrders())`

---

## 🧪 Phase 6: Manual Testing

### **Step 1: Authentication Testing**

- [ ] **Register new user**

  - Open app, click "Get Started"
  - Fill form: Phone, Name, Password, Select Role
  - Verify registration succeeds
  - Check Redux: `useSelector(state => state.auth)` should have user data

- [ ] **Login existing user**

  - Go to Login screen
  - Enter: Phone: `+250700000001`, Password: `password123`
  - Verify login succeeds
  - Verify redirect to dashboard

- [ ] **Logout**
  - From dashboard, click Logout
  - Verify redirect to Landing Screen
  - Verify Redux auth is cleared

### **Step 2: Farmer/Shipper Features**

- [ ] **List new cargo**

  - Click "Add Cargo"
  - Fill: Name, Quantity, Price, Location
  - Submit
  - Verify API call succeeds
  - Verify cargo appears in list

- [ ] **View all cargo**

  - Go to Dashboard
  - Verify cargo list loads from backend
  - Verify real data (not mock) is displayed

- [ ] **Edit cargo**

  - Click on a cargo item
  - Update details
  - Save changes
  - Verify update succeeds

- [ ] **View orders**
  - Go to Orders screen
  - Verify orders load from backend
  - Verify order status displays

### **Step 3: Transporter Features**

- [ ] **View available loads**

  - Login as transporter
  - Go to Available Loads screen
  - Verify loads display from backend

- [ ] **View transporter profile**

  - Click Profile
  - Verify your data loads correctly

- [ ] **Accept load (if implemented)**
  - Click "Accept" on a load
  - Verify transporter is assigned
  - Verify status updates

### **Step 4: Error Handling**

- [ ] **Test with backend offline**

  - Stop backend server
  - Try to fetch data
  - Verify friendly error message (should fall back to mock or show error)

- [ ] **Test with bad credentials**

  - Try login with wrong password
  - Verify error message displays

- [ ] **Test with network timeout**
  - Disconnect internet
  - Try API call
  - Verify timeout error displays

---

## 📊 Phase 7: Debugging Guide

### Common Issues & Solutions:

#### **Issue: "Cannot GET /api/crops"**

- **Cause:** Backend not running or wrong URL
- **Solution:**
  - Verify backend is running: `npm start` (in backend directory)
  - Verify port is 5000: Check `BACKEND_API_URL` in `.env`
  - Check backend logs for errors

#### **Issue: 401 Unauthorized on all requests**

- **Cause:** Token not being sent or expired
- **Solution:**
  - Verify login is working first
  - Check token is stored: In Redux DevTools, look at `auth.token`
  - Check API interceptor adds token: In Network tab, look for `Authorization: Bearer ...` header

#### **Issue: CORS Error in Browser Console**

- **Cause:** Backend CORS not enabled
- **Solution:**
  - Backend should have CORS enabled
  - Verify frontend is sending from correct origin
  - Check backend error logs

#### **Issue: Data appears but then disappears on refresh**

- **Cause:** Redux not persisting cargo/orders (by design)
- **Solution:**
  - This is expected - only auth persists
  - If you want to persist cargo/orders, add to `persistConfig` whitelist in `src/store/index.ts`
  - Or refetch data on app start

### **Debug Mode:**

Enable detailed logging by adding this to `src/services/api.ts`:

```typescript
// Add to request interceptor
console.log("🔵 REQUEST:", config.method?.toUpperCase(), config.url);
console.log(
  "   Token:",
  config.headers.Authorization?.substring(0, 20) + "..."
);

// Add to response interceptor
console.log("🟢 RESPONSE:", response.status, response.config.url);
```

---

## 📋 Phase 8: API Testing (Using Postman or curl)

### **Test Endpoints Directly:**

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+250700000099",
    "password": "password123",
    "role": "farmer"
  }'

# Response should include: { "token": "...", "user": {...} }

# 2. Login (save the token returned)
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+250700000099",
    "password": "password123"
  }' | jq -r '.token')

# 3. Get crops (with token)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/crops

# 4. Create crop
curl -X POST http://localhost:5000/api/crops \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tomatoes",
    "quantity": 100,
    "price": 500,
    "location": "Kigali",
    "description": "Fresh tomatoes"
  }'
```

---

## ✅ Final Checklist

### Before Deployment:

- [ ] All API endpoints tested and working
- [ ] Backend running on `http://localhost:5000/api`
- [ ] Frontend environment variables updated
- [ ] Redux state management working
- [ ] Authentication flow complete (register → login → dashboard)
- [ ] Cargo CRUD operations working
- [ ] Orders management working
- [ ] No console errors or warnings
- [ ] Tested with backend offline (graceful fallback works)
- [ ] Performance acceptable (no slow loading)

---

## 🚀 What's Next?

1. ✅ Complete all checklist items above
2. ⚡ Add more features (payments, notifications, etc.)
3. 🌐 Deploy backend to production server
4. 🔐 Update API URLs for production environment
5. 📱 Test on mobile devices
6. 🎉 Launch!

---

## 📞 Support

### If you get stuck:

1. **Check backend logs** - Most errors are on backend side
2. **Check browser console** - Look for error messages
3. **Check Redux DevTools** - Verify state updates
4. **Check Network tab** - Verify API requests/responses
5. **Review `BACKEND_INTEGRATION_GUIDE.md`** - For detailed documentation

---

**Last Updated:** 2025  
**Backend URL:** http://localhost:5000/api  
**Frontend Dev URL:** http://localhost:8082
