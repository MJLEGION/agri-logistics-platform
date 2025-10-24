# ⚡ Flutterwave Quick Start (5 Minutes)

## What You Need

1. Flutterwave account with API keys
2. This guide + code in FLUTTERWAVE_INTEGRATION.md

---

## ✅ Quick Checklist

### Step 1: Flutterwave Account (2 min)

```
1. Go to https://dashboard.flutterwave.com
2. Sign up → Complete email verification
3. Complete KYC verification
4. Go to Settings → API Keys
5. Copy BOTH keys:
   - Public Key: pk_live_xxxxx
   - Secret Key: sk_live_xxxxx
```

### Step 2: Frontend Setup (1 min)

```bash
# Copy env template
cp .env.example .env

# Edit .env and add:
EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_live_xxxxx
EXPO_PUBLIC_FLUTTERWAVE_API_URL=https://api.flutterwave.com/v3
```

### Step 3: Backend Setup (2 min)

**Your backend needs these 3 endpoints:**

1. **POST /api/payments/flutterwave/initiate**

   - Receives payment request
   - Calls Flutterwave API with Secret Key
   - Returns reference ID

2. **GET /api/payments/flutterwave/status/:referenceId**

   - Frontend calls this every 5 seconds
   - Checks if user confirmed payment
   - Returns success/failed/pending

3. **POST /api/payments/flutterwave/verify**
   - Final verification after success

See `FLUTTERWAVE_INTEGRATION.md` for complete code.

---

## 🧪 Test It First

### Frontend is Ready!

✅ `src/services/flutterwaveService.ts` - Ready
✅ `src/components/MomoPaymentModal.tsx` - Ready

### Test with Test Keys (Safe)

```
1. In Flutterwave dashboard: Switch to "Test Keys"
2. Use test numbers:
   - MTN: +250788000001
   - Airtel: +250720000001
3. Payment will auto-complete
```

### Then Go Live

```
1. Switch to "Live Keys" in Flutterwave
2. Use your public key (pk_live_)
3. Update backend with live secret key
4. Real payments now enabled
```

---

## 💾 What Changed in Your Code

### New Files Created:

```
✅ src/services/flutterwaveService.ts - Flutterwave payment logic
✅ FLUTTERWAVE_INTEGRATION.md - Full documentation
✅ FLUTTERWAVE_QUICK_START.md - This file
```

### Files Updated:

```
✅ src/components/MomoPaymentModal.tsx - Now uses Flutterwave
✅ .env.example - Added Flutterwave config
```

### What Still Works:

```
✅ All your order flow
✅ All your user authentication
✅ All your other features
✅ Just the payment is now LIVE instead of MOCK
```

---

## 🚀 Payment Flow Now Works Like This

```
User places order
    ↓
Enters phone number (e.g., 0788123456)
    ↓
System auto-detects MTN or Airtel ✅
    ↓
Frontend requests payment from YOUR BACKEND
    ↓
Backend calls Flutterwave API with Secret Key
    ↓
Flutterwave sends prompt to user's phone
    ↓
Frontend polls backend every 5 seconds
    ↓
User confirms payment on phone
    ↓
Frontend detects success → Order created ✅
```

---

## ⚠️ Critical: Backend Security

**NEVER put Secret Key in frontend!**

```javascript
// ❌ WRONG - Never do this
const secretKey = "sk_live_xxxxx"; // DON'T DO THIS!
fetch("/pay", { secretKey }); // DON'T DO THIS!

// ✅ CORRECT
// Backend only has secret key
app.post("/payments/flutterwave/initiate", (req, res) => {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY; // Backend .env only
  // Call Flutterwave with secret key securely
  axios.post(flutterwaveURL, payload, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
});
```

---

## 🔑 Environment Variables

### Frontend `.env` (Safe)

```env
EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_live_xxxxx
EXPO_PUBLIC_FLUTTERWAVE_API_URL=https://api.flutterwave.com/v3
```

### Backend `.env` (Secret)

```env
FLUTTERWAVE_SECRET_KEY=sk_live_xxxxx
FLUTTERWAVE_API_URL=https://api.flutterwave.com/v3
NODE_ENV=production
```

---

## 🎯 Implementation Order

1. **Create Flutterwave account** (do this first!)
2. **Get API keys** (pk_live + sk_live)
3. **Update frontend .env** (EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY)
4. **Implement backend routes** (see FLUTTERWAVE_INTEGRATION.md)
5. **Test with test keys** (use +250788000001)
6. **Switch to live keys** (use real customer numbers)
7. **Enable SMS notifications** (optional - already in code)
8. **Monitor transactions** (set up logging)

---

## 📊 What Happens in Each Step

### 1️⃣ Frontend - User Enters Phone

- Auto-detects MTN (078/079) or Airtel (072/073/075)
- Validates format
- Shows detected provider name

### 2️⃣ Frontend - User Clicks "Pay Now"

- Calls: `initiateFlutterwavePayment()`
- Sends to your backend: `/api/payments/flutterwave/initiate`
- Gets back: `referenceId`

### 3️⃣ Backend - Processes Payment

- Receives request with: amount, phone, email, etc.
- Uses Secret Key to call Flutterwave securely
- Returns reference ID to frontend
- Saves transaction to database

### 4️⃣ User - Gets MoMo Prompt

- Phone buzzes with payment request
- User enters PIN to confirm
- Flutterwave processes payment

### 5️⃣ Frontend - Polls for Status

- Every 5 seconds: checks `/api/payments/flutterwave/status/:referenceId`
- If successful → Order created
- If failed → Shows error
- If pending → Keeps checking (up to 5 minutes)

### 6️⃣ Backend - Status Check

- Calls Flutterwave: "Is this payment complete?"
- Returns: success, failed, or still pending

### 7️⃣ Success - Order Created

- Order saved with transaction ID
- SMS notification sent to buyer
- Order appears in buyer's "My Orders"

---

## 🐛 If Something Doesn't Work

### Payment modal doesn't show

- Check: `src/screens/buyer/PlaceOrderScreen.tsx` line 115
- Check: User is entering delivery address

### "Could not detect provider"

- Phone format must be: 0788123456 or 788123456 or +250788123456
- First digit after 0: must be 7, 2, or 7
- Second digit: must be 2-9

### Backend error 404

- Backend routes not registered
- Check `app.js` or `index.js` has:
  ```javascript
  app.use("/api/payments", paymentRoutes);
  ```

### "Secret Key Error"

- Check backend .env has: `FLUTTERWAVE_SECRET_KEY=sk_live_xxxxx`
- Check it's NOT in frontend code
- Restart backend after changing .env

---

## 💡 Pro Tips

1. **Test First:** Use test keys before going live
2. **Monitor:** Check Flutterwave dashboard for transactions
3. **Logs:** Add console.log to see payment flow
4. **Retry:** If payment times out, user can try again
5. **Email:** Make sure users have email in their profile

---

## 📞 Need Help?

- **Frontend Payment Issues:** Check MomoPaymentModal.tsx
- **Backend Integration:** See FLUTTERWAVE_INTEGRATION.md
- **Flutterwave Docs:** https://developer.flutterwave.com/
- **Phone Format:** Must match Rwanda (+250) pattern

---

## ✨ You're All Set!

Frontend is ready. Now you just need to:

1. Set up Flutterwave account
2. Get API keys
3. Add 3 backend endpoints
4. Test it
5. Go live!

Questions? Check FLUTTERWAVE_INTEGRATION.md for detailed backend implementation.
