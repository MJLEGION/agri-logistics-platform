# Quick Testing Guide - Backend Integration

## 🚀 Get Started in 5 Minutes

### Step 1: Start Your Backend

```bash
cd agri-logistics-backend
npm start
```

Should show: `Server running in development mode on port 5000`

### Step 2: Start Your Frontend

```bash
cd agri-logistics-platform
npm start
# or for web:
npm run web
```

---

## ✅ Test Case 1: Register a New User

**Test Data** (Nigerian number):

```
Name: John Transporter
Phone: 0801234567
Password: password123
Role: transporter
```

**Test Data** (Rwandan number):

```
Name: Jean Transporteur
Phone: +250788123456
Password: password123
Role: transporter
```

**Expected Result**:

1. Console shows: `✅ Registration successful (Real API)`
2. User info displays on screen
3. App navigates to home/dashboard

**Console Logs to See**:

```
📝 Attempting registration with real API...
📤 API Request: POST /api/auth/register
✅ API Response: POST ... 201
✅ Registration successful (Real API)
```

---

## ✅ Test Case 2: Login

**Use registered credentials**:

```
Phone: +250788123456
Password: password123
```

**Expected Result**:

1. Login succeeds
2. Console shows: `✅ Login successful (Real API)`
3. Token stored in AsyncStorage
4. Redux auth state updated with user info

**Console Logs**:

```
🔐 Attempting login with real API...
📤 API Request: POST /api/auth/login
🔑 Auth token added to request
✅ API Response: POST ... 200
✅ Login successful (Real API)
```

---

## ✅ Test Case 3: View Available Loads (Transporter)

1. Login as transporter
2. Navigate to "Available Loads" screen
3. App should fetch orders from backend

**Expected Behavior**:

- Load list appears or "No loads available" message
- Console shows: `✅ Fetched all orders (Real API)`

**Console Logs**:

```
📦 Attempting to fetch all orders from real API...
📤 API Request: GET /api/orders
🔑 Auth token added to request
✅ API Response: GET ... 200
✅ Fetched all orders (Real API)
```

---

## ✅ Test Case 4: Accept an Order (Critical Test!)

1. If no orders exist, you need to **create one first** (use buyer account)
2. Login as transporter
3. Go to "Available Loads"
4. Click "Accept Load" on an order

**Expected Behavior**:

1. Order disappears from Available Loads
2. Order appears in Active Trips
3. Console shows success message

**Console Logs**:

```
📦 Attempting to accept order with real API...
  Order ID: order_001
  Transporter ID: transporter_123
📤 API Request: PUT /api/orders/order_001/accept
🔑 Auth token added to request
✅ API Response: PUT ... 200
✅ Accept order result: {...full order object...}
```

**Debug the Order Object** - Should see:

```
{
  _id: "mongodb_id",
  status: "in_progress",
  transporterId: "your_transporter_id",
  cropId: {...},
  farmerId: {...},
  ...
}
```

---

## ❌ Expected Error Cases to Test

### Error 1: Invalid Phone Number

```
Phone: 1234567890
```

**Expected**: ❌ "Invalid phone number format"

### Error 2: Wrong Password

```
Phone: +250788123456
Password: wrongpassword
```

**Expected**: ❌ "Invalid phone number or password"

### Error 3: Accept Order Without Auth

- Logout
- Try to navigate to available orders
  **Expected**: Redirect to login screen

### Error 4: Backend Offline

1. Stop backend server
2. Try login
3. Should fallback to mock service
   **Console shows**: `⚠️ Real API failed, using mock auth service...`

---

## 📊 What to Look For in Console

### Success Indicators ✅

```
✅ Registration successful (Real API)
✅ Login successful (Real API)
✅ Fetched all orders (Real API)
✅ Order accepted (Real API)
📤 API Request: PUT /api/orders/:id/accept
🔑 Auth token added to request
```

### Fallback Indicators ⚠️

```
⚠️ Real API failed, using mock order service...
⚠️ Real API failed, using mock auth service...
```

### Error Indicators ❌

```
❌ API Error: 401 - ...
❌ API Error: 403 - Only transporters can accept
❌ API Error: 404 - Order not found
❌ Network Error: No response from server
```

---

## 🔍 Quick Verification Checklist

| Feature                       | Status | Notes                             |
| ----------------------------- | ------ | --------------------------------- |
| Register works                | [ ]    | Check console for API call        |
| Login works                   | [ ]    | Token should be in AsyncStorage   |
| Token attached to requests    | [ ]    | Look for 🔑 Auth token added      |
| Available orders fetch        | [ ]    | Should see list or "No loads"     |
| Accept order success          | [ ]    | Order should move to Active Trips |
| Accept order fails gracefully | [ ]    | Should show error message         |
| Fallback to mock works        | [ ]    | Stop backend and test             |
| Phone validation              | [ ]    | Invalid numbers rejected          |

---

## 🐛 Troubleshooting

### Problem: "Network Error: No response from server"

**Solution**:

1. Verify backend is running: `npm start` in backend directory
2. Check backend is on port 5000
3. Verify `.env` has correct API URL
4. For mobile: Use correct IP address in `EXPO_PUBLIC_API_URL_MOBILE`

### Problem: "Only transporters can accept orders"

**Solution**:

1. Make sure you're logged in as `role: 'transporter'`
2. Check Redux auth state shows correct role
3. Verify token is being sent in request header

### Problem: "Order already has a transporter"

**Solution**:

1. This is correct behavior - order already accepted
2. Try with a different order
3. If no other orders available, create one from buyer account first

### Problem: "400 - Invalid phone number"

**Solution**:

1. Use Nigerian format: `0801234567` or `+2340801234567`
2. Use Rwandan format: `+250788123456` or `0788123456`
3. Ensure 10+ digits total

### Problem: App keeps using mock service

**Solution**:

1. Backend might not be running - check port 5000
2. Check network connection
3. Verify `.env` API URL is correct
4. Try stopping and restarting app

---

## 📝 Test Order Creation (Buyer)

To create an order for transporter to accept:

1. Register/Login as **buyer**
2. Go to "Browse Farmers" or crops section
3. Create order with:
   - Valid crop
   - Quantity and price
   - Pickup/delivery locations
4. Order status should be `'accepted'`
5. Transporter should see it in "Available Loads"

---

## 🎯 Success Criteria

Your backend integration is working when:

✅ Can register with Nigerian/Rwandan phone numbers  
✅ Can login and receive JWT tokens  
✅ Can fetch orders from backend database  
✅ Can accept orders and see them move to Active Trips  
✅ Console shows successful API calls  
✅ All data matches between backend database and app  
✅ Error cases show appropriate messages  
✅ App falls back to mock when backend offline

---

## 💡 Tips

1. **Keep console open** (F12) while testing to see all logs
2. **Check Redux DevTools** to see auth state changes
3. **Use Network tab** in DevTools to see actual API calls
4. **Backend logs** will show request details too
5. **Test with both** success and error scenarios

---

Good luck testing! 🚀
