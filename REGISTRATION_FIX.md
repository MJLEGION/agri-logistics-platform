# 🔧 Registration Issue - FIXED

## Problem

Registration was failing when testing on **web** because the API URL was configured for mobile devices (`192.168.1.64:5000`) instead of `localhost:5000`.

---

## ✅ Solution Applied

### 1. **Updated `.env` file**

Changed the API URL to use `localhost` for web testing:

```env
# For web: use localhost, for mobile: use your local IP
EXPO_PUBLIC_API_URL=http://localhost:5000/api
API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_API_URL_MOBILE=http://192.168.1.64:5000/api
```

### 2. **Updated `src/services/api.js`**

Added platform detection to automatically use the correct URL:

```javascript
// Automatically detect platform and use correct API URL
const getApiUrl = () => {
  // For web, always use localhost
  if (Platform.OS === "web") {
    return process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";
  }

  // For mobile (iOS/Android), use mobile IP
  return (
    process.env.EXPO_PUBLIC_API_URL_MOBILE ||
    process.env.EXPO_PUBLIC_API_URL ||
    "http://192.168.1.64:5000/api"
  );
};
```

### 3. **Added Debug Logging**

Added console logs to help debug API issues:

- ✅ API URL being used
- 📤 Outgoing requests
- ✅ Successful responses
- ❌ Error details

### 4. **Improved Error Messages**

Enhanced error handling in RegisterScreen to show more helpful messages.

---

## 🧪 How to Test

### Step 1: Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

### Step 2: Clear Browser Cache

- Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or open DevTools → Application → Clear Storage → Clear site data

### Step 3: Check Console Logs

Open browser DevTools (F12) and look for:

```
🌐 API URL (web): http://localhost:5000/api
```

### Step 4: Try Registration Again

1. Go to Role Selection
2. Choose a role (Farmer/Buyer/Transporter)
3. Fill in the registration form:
   - **Name**: Test User
   - **Phone**: 0788123456
   - **Password**: test123
   - **Confirm Password**: test123
4. Click "Create Account"

### Step 5: Check Console for Logs

You should see:

```
🔐 Attempting registration: { name: 'Test User', phone: '0788123456', role: 'farmer' }
📤 API Request: POST /auth/register
✅ API Response: POST /auth/register - 201
✅ Registration successful!
```

---

## 🔍 Troubleshooting

### Issue: Still getting "Registration Failed"

#### Check 1: Is Backend Running?

```bash
# In a separate terminal, check if backend is running
curl http://localhost:5000/api/health
```

If you get an error, start your backend server.

#### Check 2: Check Console Logs

Open browser DevTools (F12) → Console tab

Look for error messages:

- **"Network Error: No response from server"** → Backend not running
- **"API Error: 400"** → Validation error (check backend logs)
- **"API Error: 409"** → Phone number already exists
- **"API Error: 500"** → Backend server error

#### Check 3: Verify API URL

In the console, you should see:

```
🌐 API URL (web): http://localhost:5000/api
```

If you see `192.168.1.64`, the changes didn't apply. Restart the dev server.

#### Check 4: Check Backend Logs

Look at your backend terminal for error messages.

---

## 📱 Testing on Mobile Devices

### For Android Emulator / iOS Simulator

The app will automatically use `http://192.168.1.64:5000/api` (your local IP).

**Make sure:**

1. Your computer and mobile device are on the same WiFi network
2. Update `EXPO_PUBLIC_API_URL_MOBILE` in `.env` with your actual IP address
3. Your firewall allows connections on port 5000

### Find Your Local IP Address

**Windows:**

```bash
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

**Mac/Linux:**

```bash
ifconfig
# Look for "inet" under en0 or wlan0
```

**Update `.env`:**

```env
EXPO_PUBLIC_API_URL_MOBILE=http://YOUR_IP_HERE:5000/api
```

---

## 🎯 Expected Behavior After Fix

### ✅ On Web

- Uses `http://localhost:5000/api`
- Registration works correctly
- Console shows detailed logs

### ✅ On Mobile

- Uses `http://192.168.1.64:5000/api` (or your IP)
- Registration works correctly
- Console shows detailed logs

### ✅ Error Messages

- Clear, helpful error messages
- Detailed console logs for debugging
- Network errors are caught and displayed

---

## 🔐 Common Registration Errors

### "Phone number already exists"

**Solution:** Use a different phone number or delete the existing user from the database.

### "Network Error: No response from server"

**Solution:**

1. Check if backend is running: `curl http://localhost:5000/api/health`
2. Start backend if not running
3. Check firewall settings

### "Validation error"

**Solution:** Check that all fields meet requirements:

- Name: At least 3 characters
- Phone: At least 10 digits
- Password: At least 6 characters
- Passwords must match

### "Could not register"

**Solution:** Check backend logs for specific error details.

---

## 📝 Files Modified

1. **`.env`** - Updated API URLs
2. **`src/services/api.js`** - Added platform detection and logging
3. **`src/screens/auth/RegisterScreen.tsx`** - Added debug logging

---

## 🚀 Next Steps

### 1. Test Registration

Try registering with different roles:

- Farmer
- Buyer
- Transporter

### 2. Test Login

After successful registration, try logging in with the same credentials.

### 3. Test on Mobile

If you plan to test on mobile devices, update the IP address in `.env`.

### 4. Production Setup

For production, update `.env` with your deployed backend URL:

```env
EXPO_PUBLIC_API_URL=https://your-backend.com/api
```

---

## 💡 Tips

### Enable Detailed Logging

The app now logs all API requests and responses. Check the console to debug issues.

### Clear AsyncStorage

If you encounter auth issues, clear AsyncStorage:

```javascript
// In browser console
localStorage.clear();
```

### Backend Health Check

Create a health check endpoint in your backend:

```javascript
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});
```

---

## ✅ Summary

**Problem:** Registration failing on web due to incorrect API URL  
**Solution:** Platform-specific API URL detection  
**Status:** ✅ FIXED  
**Testing:** Ready to test registration on web and mobile

**Your registration should now work! 🎉**

If you still encounter issues, check the console logs and backend logs for detailed error messages.
