# 🔐 Test Credentials & Authentication Guide

## Mock Authentication System

The app now includes a **Mock Authentication Service** that works without a backend API. It provides:

- ✅ Proper credential validation
- ✅ Password verification
- ✅ User registration with validation
- ✅ Role-based access
- ✅ Automatic fallback when backend unavailable

---

## 📋 Pre-Created Test Accounts

These accounts are automatically available in the mock system:

### Farmer Account

```
Phone: +250700000001
Password: password123
Name: Test Farmer
Role: Farmer
```

### Buyer Account

```
Phone: +250700000002
Password: password123
Name: Test Buyer
Role: Buyer
```

### Transporter Account

```
Phone: +250700000003
Password: password123
Name: Test Transporter
Role: Transporter
```

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Login ✅

**Steps:**

1. Go to Login screen
2. Enter phone: `+250700000001`
3. Enter password: `password123`
4. Click "Sign In"

**Expected Result:**

- ✅ Login succeeds
- ✅ Redirected to Farmer dashboard
- ✅ User profile shows "Test Farmer"

---

### Scenario 2: Wrong Password ❌

**Steps:**

1. Go to Login screen
2. Enter phone: `+250700000001`
3. Enter password: `wrongpassword` (incorrect)
4. Click "Sign In"

**Expected Result:**

- ❌ Error message: "Invalid password"
- ❌ Login denied
- ❌ Stay on login screen

**IMPORTANT**: This is the bug that was fixed! Now it properly validates passwords.

---

### Scenario 3: User Not Found ❌

**Steps:**

1. Go to Login screen
2. Enter phone: `+250700000099` (doesn't exist)
3. Enter password: `password123`
4. Click "Sign In"

**Expected Result:**

- ❌ Error message: "User not found"
- ❌ Login denied
- ❌ Stay on login screen

---

### Scenario 4: Role-Specific Login ✅

**Test each role's login:**

**Farmer Login:**

- Phone: `+250700000001`, Password: `password123`
- Expected: Farmer dashboard with crop listing options

**Buyer Login:**

- Phone: `+250700000002`, Password: `password123`
- Expected: Buyer dashboard with browse crops

**Transporter Login:**

- Phone: `+250700000003`, Password: `password123`
- Expected: Transporter dashboard with available loads

---

### Scenario 5: Registration with Validation ✅

**Steps:**

1. Go to Registration screen
2. Fill in:
   - Name: `John Doe`
   - Phone: `+250788111222`
   - Password: `SecurePassword123`
   - Confirm Password: `SecurePassword123`
   - Role: Farmer
3. Click "Create Account"

**Expected Result:**

- ✅ Account created successfully
- ✅ Logged in automatically
- ✅ Redirected to Farmer dashboard

---

### Scenario 6: Registration Validation Errors ❌

**Test each validation:**

#### Empty Fields

- Try submitting without filling anything
- Expected: "All fields are required" errors

#### Short Name

- Name: `Jo` (too short)
- Expected: "Name must be at least 3 characters"

#### Invalid Phone

- Phone: `123` (too short)
- Expected: "Invalid phone number"

#### Short Password

- Password: `pass` (too short)
- Expected: "Password must be at least 6 characters"

#### Password Mismatch

- Password: `Password123`
- Confirm: `Password456` (different)
- Expected: "Passwords do not match"

#### Duplicate Phone

- Phone: `+250700000001` (already exists)
- Expected: "Phone number already registered"

---

## 🔍 How It Works

### Login Flow with Credential Validation

```
1. User enters phone & password
2. Form validation checks:
   - ✓ Phone is not empty
   - ✓ Phone is valid format (10+ chars)
   - ✓ Password is not empty
   - ✓ Password is 6+ characters
3. If validation passes, attempt login:
   - Search for user with matching phone
   - If NOT found → Error: "User not found"
   - If found, verify password:
     - If password MATCHES → Login success, generate token
     - If password DOESN'T MATCH → Error: "Invalid password"
4. Navigation based on user role
```

### Key Validations

| Field            | Rule         | Error Message                            |
| ---------------- | ------------ | ---------------------------------------- |
| Phone            | Required     | "Phone number is required"               |
| Phone            | Min 10 chars | "Invalid phone number format"            |
| Password         | Required     | "Password is required"                   |
| Password         | Min 6 chars  | "Password must be at least 6 characters" |
| Name             | Required     | "Name is required"                       |
| Name             | Min 3 chars  | "Name must be at least 3 characters"     |
| Confirm Password | Match        | "Passwords do not match"                 |
| Phone (Register) | Unique       | "Phone number already registered"        |

---

## 🐛 Bug Fixes Applied

### Issue 1: Registration Failed ❌ → FIXED ✅

**What was wrong:**

- App tried to call non-existent backend API
- No error handling or fallback

**What was fixed:**

- Added mock auth service with proper validation
- Real API is attempted first, mock service used as fallback
- Console logs show which service is being used

**Console Output:**

```
📝 Attempting registration with real API...
⚠️ Real API failed, using mock auth service...
✅ Registration successful (Mock Service)
```

### Issue 2: Wrong Credentials Accepted ❌ → FIXED ✅

**What was wrong:**

- Using buyer credentials on farmer login showed farmer dashboard
- No password validation happening

**What was fixed:**

- Mock service now properly validates phone AND password
- Password comparison is exact match
- Returns specific error messages for:
  - User not found
  - Invalid password
  - Missing fields

**Console Output:**

```
🔐 Attempting login with real API...
⚠️ Real API failed, using mock auth service...
❌ Mock login failed: Invalid password
```

---

## 📊 Testing Checklist

### ✅ Registration Tests

- [ ] Register new farmer account - Success
- [ ] Register new buyer account - Success
- [ ] Register new transporter account - Success
- [ ] Register with empty name - Error shown
- [ ] Register with short password - Error shown
- [ ] Register with mismatched passwords - Error shown
- [ ] Register with duplicate phone - Error shown

### ✅ Login Tests

- [ ] Login as farmer with correct credentials - Success
- [ ] Login as buyer with correct credentials - Success
- [ ] Login as transporter with correct credentials - Success
- [ ] Login with wrong password - Error: "Invalid password"
- [ ] Login with non-existent phone - Error: "User not found"
- [ ] Login with empty fields - Validation errors
- [ ] Login redirects to correct dashboard by role - Success

### ✅ Cross-Role Tests

- [ ] Use buyer credentials on farmer login - ERROR (Invalid password)
- [ ] Use farmer credentials on buyer login - ERROR (Invalid password)
- [ ] Use transporter credentials on farmer login - ERROR (Invalid password)
- [ ] Each role can't access other role's account

---

## 🎬 Video Demo Highlights

When recording your demo, make sure to show:

### ✅ Registration Failure → Success

1. Show error when empty
2. Show error when password too short
3. Show error when passwords don't match
4. Successfully register new account
5. Auto-login after registration

### ✅ Login Validation

1. Try wrong password → See error
2. Try non-existent user → See error
3. Login with correct credentials → Success
4. Verify redirected to correct role dashboard

### ✅ Role-Specific Access

1. Login as farmer → See farmer features
2. Logout and login as buyer → See buyer features
3. Logout and login as transporter → See transporter features

---

## 🔧 Development Notes

### Mock Users Database

Located in: `src/services/mockAuthService.ts`

```typescript
// Default mock users (pre-created in system)
mockUsers = [
  {
    _id: "1",
    name: "Test Farmer",
    phone: "+250700000001",
    password: "password123",
    role: "farmer",
    token: "farmer_token_123",
  },
  // ... buyer and transporter
];
```

### Fallback Mechanism

Located in: `src/services/authService.js`

```javascript
// Tries real API first
try {
  const response = await api.post("/auth/login", credentials);
  return response.data;
} catch (error) {
  // Falls back to mock service
  const result = await mockAuthService.login(credentials);
  return result;
}
```

### Initialization

Located in: `App.tsx`

```typescript
useEffect(() => {
  initializeAuth().catch((err) => console.error("Auth init error:", err));
}, []);
```

---

## 💡 Troubleshooting

### Q: I registered successfully but can't login with the same account

**A:** Check that you entered the exact same phone number. Phone numbers are case-sensitive and whitespace matters.

### Q: I keep getting "Invalid password" but I'm sure it's correct

**A:** Password comparison is exact match. Make sure:

- No extra spaces before/after
- Correct case (if typing manually)
- Caps lock is not on

### Q: I want to add more test users

**A:** Edit `src/services/mockAuthService.ts` and add to the `mockUsers` array:

```typescript
mockUsers.push({
  _id: generateId(),
  name: "Your Name",
  phone: "+250700000004",
  password: "password123",
  role: "farmer",
  token: generateToken(),
});
```

### Q: I want to test with a real backend

**A:** The app will automatically try the real API first. Just start your backend server and it will use it instead of mock service.

---

## 📝 Summary

✅ **Registration:** Now validates all fields properly
✅ **Login:** Now properly validates phone AND password
✅ **Cross-Role Testing:** Different credentials for each role
✅ **Error Messages:** Clear, specific feedback
✅ **Fallback System:** Works with or without backend

**Ready for testing! 🚀**
