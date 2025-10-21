# Getting Started - Backend Integration

Complete guide to start the app with your Node.js backend.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Backend Server

```bash
# Open terminal 1
cd agri-logistics-backend
npm start
```

**Expected Output:**

```
✓ MongoDB connected
✓ Server running in development mode on port 5000
```

### Step 2: Start Frontend

```bash
# Open terminal 2
cd agri-logistics-platform
npm start
```

### Step 3: Test Login

1. Go to login screen
2. Use any Nigerian/Rwandan phone number
3. Example: `+250788123456` / `0788123456`
4. Check console for API logs

---

## 🔧 Environment Setup

### Option A: Local Network (Desktop App)

**File**: `.env`

```env
# Web: localhost
EXPO_PUBLIC_API_URL=http://localhost:5000/api
API_BASE_URL=http://localhost:5000/api

# Mobile: use your computer's IP
EXPO_PUBLIC_API_URL_MOBILE=http://192.168.1.64:5000/api
```

**Find your IP**:

```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Look for IPv4 address (usually 192.168.x.x or 10.x.x.x)

### Option B: Docker (If using backend Docker)

```env
EXPO_PUBLIC_API_URL=http://host.docker.internal:5000/api
EXPO_PUBLIC_API_URL_MOBILE=http://host.docker.internal:5000/api
```

### Option C: Production URL

```env
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
EXPO_PUBLIC_API_URL_MOBILE=https://your-backend-url.com/api
```

---

## 📱 Platform-Specific Setup

### Web Browser

```bash
npm run web
# Goes to localhost:19006
# Uses http://localhost:5000/api
```

### iOS Simulator

```bash
npm run ios
# Uses EXPO_PUBLIC_API_URL_MOBILE
```

### Android Emulator

```bash
npm run android
# Uses EXPO_PUBLIC_API_URL_MOBILE
```

### Physical Device

```bash
npm start
# Then press 'i' for iOS or 'a' for Android
# Make sure device on same network as backend
```

---

## 🔐 First Time Setup

### 1. Create Test User

**Phone**: `+250788888888` (Rwandan format)
or `0801234567` (Nigerian format)
**Password**: `testpass123`
**Role**: Choose one of:

- `farmer` - Can create crops/orders
- `buyer` - Can browse and order crops
- `transporter` - Can accept orders and track trips

### 2. Create Multiple Test Accounts

```
Account 1 (Farmer):
- Phone: 0801111111
- Password: pass123
- Role: farmer

Account 2 (Buyer):
- Phone: 0802222222
- Password: pass123
- Role: buyer

Account 3 (Transporter):
- Phone: 0803333333
- Password: pass123
- Role: transporter
```

### 3. Test Full Workflow

```
1. Login as Farmer
   → Create crops/products
   → Verify in database

2. Login as Buyer
   → Browse available crops
   → Create order
   → Verify order appears

3. Login as Transporter
   → View available orders (from buyer)
   → Accept order
   → See in Active Trips
```

---

## 🐛 Debugging

### Check Backend Logs

```
In backend terminal, should see:
✓ GET /api/orders - 200
✓ PUT /api/orders/:id/accept - 200
✓ POST /api/auth/login - 200
```

### Check Frontend Logs

```
Open DevTools (F12) → Console tab
Look for:
✅ Fetched all orders (Real API)
✅ Order accepted (Real API)
📤 API Request: PUT /api/orders/xxx/accept
🔑 Auth token added to request
```

### Check Network Tab

```
DevTools (F12) → Network tab
Filter: XHR
Look for requests to:
- POST /api/auth/login
- GET /api/orders
- PUT /api/orders/xxx/accept
Headers should show: Authorization: Bearer {token}
```

### Check AsyncStorage

```javascript
// In browser console
localStorage.getItem("accessToken"); // Should exist
localStorage.getItem("token"); // Should exist
localStorage.getItem("refreshToken"); // Should exist

// In app console
console.log(await AsyncStorage.getItem("accessToken"));
```

---

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend starts without errors
- [ ] Can register new user
- [ ] Can login with registered account
- [ ] AccessToken stored in AsyncStorage
- [ ] Console shows "✅ Login successful (Real API)"
- [ ] API calls show authorization header
- [ ] Can view orders/crops from backend
- [ ] Can accept order successfully
- [ ] Order moves from Available to Active Trips

---

## 🆘 Troubleshooting

### Problem: "Network Error: No response from server"

**Check Backend**:

```bash
# Make sure backend is running
cd agri-logistics-backend
npm start
```

**Check URL**:

```bash
# Test connection
curl http://localhost:5000/api
# Should return: { message: "Agri-Logistics API", version: "1.0.0", ... }
```

**Check Firewall**:

```bash
# Windows: Allow port 5000
# Mac: System Preferences → Security → Firewall
# Linux: sudo ufw allow 5000
```

### Problem: "Invalid phone number"

**Use Correct Format**:

- Nigerian: `0801234567` or `+2340801234567`
- Rwandan: `0788123456` or `+250788123456`

**NOT valid**:

- `1234567890` (US format)
- `555-1234` (too short)
- `0888888888` (wrong digit)

### Problem: "Login failed" but database works

**Check Credentials**:

1. Verify user was created (check backend logs)
2. Verify password is correct
3. Check role is set

**Check Database**:

```bash
# In MongoDB
db.users.find({ phone: "+250788123456" })
```

### Problem: "Only transporters can accept orders"

**Verify Role**:

1. Check logged-in user role: `state.auth.user.role`
2. Must be `'transporter'` (lowercase)
3. Re-login if wrong role

### Problem: "Order already has a transporter"

**This is correct!** Order was already accepted. Test with:

1. Different order
2. Create new order from buyer first
3. Then accept as different transporter

### Problem: App uses mock service instead of backend

**Check Configuration**:

```bash
# 1. Verify .env file exists
cat .env

# 2. Verify backend is running
curl http://localhost:5000/api

# 3. Check console shows real API logs
# Should see: "✅ Fetched (Real API)"
# NOT: "⚠️ Real API failed"

# 4. Restart app
npm start
```

---

## 📊 API Endpoints Quick Reference

### Auth

```
POST   /api/auth/register      (public)
POST   /api/auth/login         (public)
GET    /api/auth/me            (protected)
POST   /api/auth/logout        (protected)
POST   /api/auth/refresh       (public)
```

### Orders

```
GET    /api/orders             (protected) - All orders
GET    /api/orders/my-orders   (protected) - User's orders
GET    /api/orders/:id         (protected)
POST   /api/orders             (protected, buyer only)
PUT    /api/orders/:id         (protected)
PUT    /api/orders/:id/accept  (protected, transporter only)
```

### Crops

```
GET    /api/crops              (protected)
GET    /api/crops/:id          (protected)
POST   /api/crops              (protected, farmer only)
PUT    /api/crops/:id          (protected, farmer only)
DELETE /api/crops/:id          (protected, farmer only)
```

---

## 🔍 Test Endpoints Manually

### Test with cURL

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+250788123456", "password": "testpass123"}'

# Response will have: { user, accessToken, refreshToken }

# 2. Get all orders (using token from login)
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer {accessToken}"

# 3. Accept order
curl -X PUT http://localhost:5000/api/orders/{orderId}/accept \
  -H "Authorization: Bearer {accessToken}"
```

### Test with Postman

1. Import endpoints from backend
2. Create auth request
3. Copy token to Authorization header
4. Test endpoints

---

## 📝 Common Test Scenarios

### Scenario 1: Complete Order Workflow

```
1. Login as Farmer
   - Create crop: "Tomatoes", 100kg, 5000RWF

2. Login as Buyer
   - Browse crops
   - Create order: 50kg of Tomatoes, 2500 RWF

3. Login as Transporter
   - View available orders
   - Accept order
   - See in active trips

4. Verify in Database
   - Order status: "in_progress"
   - Order transporterId: set to transporter ID
```

### Scenario 2: Error Handling

```
1. Register with invalid phone
   → Should fail: "Invalid phone number"

2. Login with wrong password
   → Should fail: "Invalid phone or password"

3. Accept order without auth
   → Should fail: "401 Unauthorized"

4. Accept non-existent order
   → Should fail: "404 Not Found"

5. Accept order as farmer
   → Should fail: "403 Only transporters can accept"
```

---

## 🎯 Performance Tips

### Optimize API Calls

```javascript
// DON'T: Fetch orders every time
useEffect(() => {
  dispatch(fetchAllOrders()); // Every render!
}, []);

// DO: Fetch once on mount
useEffect(() => {
  dispatch(fetchAllOrders());
}, [dispatch]); // Only on component mount
```

### Cache Responses

```javascript
// Backend returns complete data
// Don't re-fetch unless necessary
// Use Redux selectors for data
```

### Monitor Network

```
DevTools → Network tab → Filter: XHR
Should see only necessary requests
Not hundreds of duplicate requests
```

---

## 🔒 Security Checklist

- [ ] Never commit `.env` file with real URLs
- [ ] Use HTTPS in production (not HTTP)
- [ ] Rotate tokens regularly
- [ ] Use secure password hashing (backend does this)
- [ ] Validate all inputs (backend does this)
- [ ] Don't log sensitive data to console (use debug flags)
- [ ] Clear tokens on logout (frontend does this)
- [ ] Use CORS properly (backend configured)

---

## 📚 Next Steps

After successful local testing:

1. **Deploy Backend**

   - Use cloud platform (Heroku, Railway, Render, etc.)
   - Update `.env` with production URL
   - Test endpoints

2. **Deploy Frontend**

   - Build for iOS/Android (EAS Build)
   - Push to app stores
   - Update environment for production

3. **Monitor**
   - Set up logging (Sentry, LogRocket)
   - Monitor API performance
   - Track user issues

---

## 💡 Tips & Tricks

### Quick Backend Restart

```bash
npm start
# Press Ctrl+C to stop
# Then npm start again
```

### Clear All Data

```bash
# Backend: Delete database
# Frontend: Clear localStorage
localStorage.clear()
AsyncStorage.clear()
```

### Test with Different IPs

```env
# Local testing
EXPO_PUBLIC_API_URL=http://localhost:5000/api

# Mobile device (from different computer)
EXPO_PUBLIC_API_URL_MOBILE=http://192.168.1.100:5000/api

# Remote testing
EXPO_PUBLIC_API_URL=https://api.example.com
```

### Enable Detailed Logging

```javascript
// In api.js
const DEBUG = true;
if (DEBUG) console.log(...);  // Shows all requests
```

---

## 🆘 Still Having Issues?

1. **Check console logs** (F12)
2. **Check backend logs** (terminal where npm start runs)
3. **Check network tab** (DevTools → Network)
4. **Check AsyncStorage** (browser console)
5. **Restart app** (sometimes helps)
6. **Clear cache** (Cmd+Shift+Delete)
7. **Check backend repo** (github.com/MJLEGION/agri-logistics-backend)

---

## 📞 Support Resources

- **Backend Issues**: Check backend README
- **Frontend Issues**: Check console logs
- **Environment**: Verify `.env` file
- **Network**: Check IP and port
- **Database**: Check MongoDB connection

---

**You're all set!** 🎉

Your app is now integrated with the Node.js backend. Start testing and building amazing features!

For detailed information, see:

- `BACKEND_INTEGRATION_GUIDE.md` - Technical details
- `BACKEND_TESTING_QUICK_START.md` - Testing guide
- `BACKEND_API_CHECKLIST.md` - Complete API reference
- `CHANGES_AT_A_GLANCE.md` - Code changes summary

---

Last Updated: 2024
Ready for Production! ✨
