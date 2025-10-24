# 🎯 Flutterwave Live MoMo Integration Guide

## Overview

This document explains the live Flutterwave integration for MTN MoMo and Airtel Money payments in the Agri-Logistics platform.

**Status:** ✅ Frontend ready | ⏳ Backend setup required

---

## 📋 Architecture

```
User Places Order
    ↓
Enters Phone Number
    ↓
System Detects Provider (MTN/Airtel)
    ↓
Frontend sends payment request to Backend
    ↓
Backend validates + calls Flutterwave API securely
    ↓
User receives MoMo prompt on phone
    ↓
Frontend polls backend for payment status (every 5 seconds)
    ↓
Order created after successful payment
```

---

## 🚀 Getting Started

### Step 1: Create Flutterwave Account

1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Sign up for a business account
3. Complete KYC verification (required for live payments)
4. Navigate to **Settings → API Keys**
5. Copy your keys:
   - **Public Key** (can be exposed in frontend)
   - **Secret Key** (NEVER expose - backend only)

**Keys Location:**

```
Settings → API Keys → Show Live Keys (or Test Keys)
```

### Step 2: Update Frontend .env

Create `.env` file from `.env.example`:

```bash
# Copy template
cp .env.example .env

# Edit .env and add:
EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
EXPO_PUBLIC_FLUTTERWAVE_API_URL=https://api.flutterwave.com/v3
```

**Note:** Frontend uses public key only. The public key is safe to expose.

### Step 3: Update Backend

Your backend needs to handle payment requests. Here's the required endpoint:

**Backend Endpoint Structure:**

```
POST /api/payments/flutterwave/initiate
GET /api/payments/flutterwave/status/:referenceId
POST /api/payments/flutterwave/verify
```

---

## 💻 Backend Implementation (Node.js/Express)

### Install Dependencies

```bash
npm install axios dotenv
```

### Backend .env

Create backend `.env` file:

```env
# Flutterwave (BACKEND ONLY - Never expose to frontend)
FLUTTERWAVE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
FLUTTERWAVE_API_URL=https://api.flutterwave.com/v3
NODE_ENV=production
```

### Backend Routes

Add these routes to your Express backend:

**File: `routes/payments.js`**

```javascript
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { protect } = require("../middleware/auth"); // Your auth middleware

// Initialize Payment
router.post("/flutterwave/initiate", protect, async (req, res) => {
  try {
    const {
      amount,
      phoneNumber,
      orderId,
      email,
      firstName,
      lastName,
      currency,
      paymentMethod,
    } = req.body;

    // Validate inputs
    if (!amount || !phoneNumber || !email || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Generate unique reference
    const reference = `FW_${orderId}_${Date.now()}`;

    // Prepare Flutterwave payload
    const payload = {
      tx_ref: reference,
      amount: Math.round(amount), // Flutterwave expects integer
      currency: currency || "RWF",
      payment_method:
        paymentMethod === "momo"
          ? "mobile_money_rwanda"
          : "mobile_money_airtel_rwanda",
      phone_number: phoneNumber,
      email: email,
      customer_name: `${firstName} ${lastName}`,
      customizations: {
        title: "Agri-Logistics Platform",
        description: `Order Payment - ${orderId}`,
        logo: "https://your-app-logo-url.png", // Add your logo URL
      },
    };

    // Call Flutterwave API
    const response = await axios.post(
      `${process.env.FLUTTERWAVE_API_URL}/charges?type=mobile_money`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "success") {
      // Save transaction reference to database for later verification
      // const transaction = await Transaction.create({
      //   orderId,
      //   userId: req.user._id,
      //   referenceId: reference,
      //   flutterwaveId: response.data.data.id,
      //   amount,
      //   phoneNumber,
      //   status: 'pending',
      //   paymentMethod
      // });

      return res.status(200).json({
        success: true,
        status: "pending",
        referenceId: reference,
        flutterwaveRef: response.data.data.id,
        message: "Payment initiated. Check your phone for prompt.",
      });
    } else {
      return res.status(400).json({
        success: false,
        status: "failed",
        message: response.data.message || "Failed to initiate payment",
      });
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    return res.status(500).json({
      success: false,
      status: "failed",
      message: error.response?.data?.message || "Payment service error",
    });
  }
});

// Check Payment Status
router.get("/flutterwave/status/:referenceId", protect, async (req, res) => {
  try {
    const { referenceId } = req.params;

    // Check transaction status with Flutterwave
    const response = await axios.get(
      `${process.env.FLUTTERWAVE_API_URL}/transactions/verify_by_reference?tx_ref=${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    const transaction = response.data.data[0]; // Flutterwave returns array

    if (transaction.status === "successful") {
      return res.status(200).json({
        success: true,
        status: "completed",
        transactionId: transaction.id,
        referenceId: referenceId,
        amount: transaction.amount,
        currency: transaction.currency,
        message: "Payment successful",
      });
    } else if (transaction.status === "failed") {
      return res.status(200).json({
        success: false,
        status: "failed",
        message: transaction.processor_response || "Payment failed",
      });
    } else {
      return res.status(200).json({
        success: false,
        status: "pending",
        message: "Payment is still processing",
      });
    }
  } catch (error) {
    console.error("Status check error:", error);
    return res.status(500).json({
      success: false,
      status: "failed",
      message: "Failed to check payment status",
    });
  }
});

// Verify Payment (after success confirmation)
router.post("/flutterwave/verify", protect, async (req, res) => {
  try {
    const { transactionId, referenceId } = req.body;

    // Final verification with Flutterwave
    const response = await axios.get(
      `${process.env.FLUTTERWAVE_API_URL}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    if (response.data.data.status === "successful") {
      // Mark transaction as verified in database
      // await Transaction.updateOne(
      //   { referenceId },
      //   { status: 'completed', verifiedAt: new Date() }
      // );

      return res.status(200).json({
        success: true,
        status: "completed",
        message: "Payment verified successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        status: "failed",
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification error",
    });
  }
});

module.exports = router;
```

### Register Routes in Main App

**File: `app.js` or `index.js`**

```javascript
const paymentRoutes = require("./routes/payments");

// Add this line with other routes
app.use("/api/payments", paymentRoutes);
```

---

## 🔒 Security Considerations

### Frontend (Safe to Expose)

- ✅ Public Key
- ✅ API URL
- ✅ Public reference IDs

### Backend Only (NEVER expose)

- 🔒 Secret Key
- 🔒 Never send to frontend
- 🔒 Use environment variables
- 🔒 Add .env to .gitignore

### Validation Checklist

- ✅ Validate amount on backend (prevent tampering)
- ✅ Verify user identity (authentication)
- ✅ Store transaction reference for reconciliation
- ✅ Implement rate limiting on payment endpoints
- ✅ Log all payment attempts
- ✅ Use HTTPS only in production

---

## 🧪 Testing

### Test Credentials

Before going live, use Flutterwave test credentials:

1. Switch to **Test Keys** in Flutterwave dashboard
2. Use test phone numbers:
   - **MTN (Rwanda):** +250788000001 - +250788000099
   - **Airtel (Rwanda):** +250720000001 - +250720000099
3. All test transactions will pass automatically

### Test Flow

```
Frontend:
1. Add amount: 1000
2. Phone: +250788000001 (test number)
3. Click Pay Now
4. Payment will auto-complete after 5 seconds

Backend:
- Check logs for request/response
- Verify transaction is created
- Test status polling
```

---

## 🔄 Payment Flow (Step-by-Step)

### 1. User Initiates Payment

```javascript
// Frontend calls this
initiateFlutterwavePayment({
  amount: 50000,
  phoneNumber: "+250788123456",
  orderId: "ORD_123",
  email: "buyer@example.com",
  paymentMethod: "momo", // auto-detected from phone
});
```

### 2. Frontend sends to Backend

```json
POST /api/payments/flutterwave/initiate
{
  "amount": 50000,
  "phoneNumber": "+250788123456",
  "orderId": "ORD_123",
  "email": "buyer@example.com",
  "paymentMethod": "momo"
}
```

### 3. Backend calls Flutterwave

```javascript
// Backend calls Flutterwave API with Secret Key
axios.post(
  "https://api.flutterwave.com/v3/charges?type=mobile_money",
  {
    tx_ref: "FW_ORD_123_timestamp",
    amount: 50000,
    currency: "RWF",
    payment_method: "mobile_money_rwanda",
    phone_number: "+250788123456",
    email: "buyer@example.com",
  },
  {
    headers: {
      Authorization: "Bearer sk_live_xxxxx",
    },
  }
);
```

### 4. User receives MoMo Prompt

- Phone buzzes with payment prompt
- User enters PIN to confirm

### 5. Frontend Polls Status

```javascript
// Every 5 seconds, frontend checks:
GET /api/payments/flutterwave/status/FW_ORD_123_timestamp

// Response (successful):
{
  "success": true,
  "status": "completed",
  "transactionId": "5739194928",
  "message": "Payment successful"
}
```

### 6. Order Created

```javascript
// After successful payment, create order:
POST /api/orders {
  cropId: '...',
  quantity: 100,
  totalPrice: 50000,
  paymentMethod: 'momo',
  transactionId: '5739194928',
  status: 'confirmed'
}
```

---

## 📊 Transaction Storage

Recommended database schema:

```javascript
// Transaction Model
{
  _id: ObjectId,
  orderId: String,         // Link to Order
  userId: ObjectId,        // Link to User
  referenceId: String,     // FW_ORD_123_timestamp
  flutterwaveId: Number,   // Flutterwave internal ID
  amount: Number,          // RWF
  currency: String,        // RWF
  phoneNumber: String,     // +250788123456
  paymentMethod: String,   // 'momo' or 'airtel'
  status: String,          // 'pending', 'completed', 'failed'
  metadata: Object,        // Flutterwave response
  createdAt: Date,
  completedAt: Date,
  verifiedAt: Date
}
```

---

## 🐛 Troubleshooting

### Issue: "Payment initiation failed"

**Cause:** Backend not configured or secret key invalid
**Fix:**

- Verify backend routes are registered
- Check secret key in backend .env
- Ensure backend is running

### Issue: "Could not detect payment provider"

**Cause:** Phone number format incorrect
**Fix:**

- Accepted formats: `0788123456`, `788123456`, `+250788123456`
- Must be 9 digits after country code

### Issue: "Email is required"

**Cause:** User profile missing email
**Fix:**

- Ensure user completes registration with email
- Update user profile in settings

### Issue: Payment stuck in "pending"

**Cause:** User didn't confirm MoMo prompt or network timeout
**Fix:**

- Check if user received prompt on phone
- User must enter PIN
- May retry after 5 minutes

### Issue: "CORS error"

**Cause:** Backend not allowing frontend origin
**Fix:**

- Add CORS headers in backend:

```javascript
app.use(
  cors({
    origin: ["http://localhost:8081", "your-app-url"],
    credentials: true,
  })
);
```

---

## 📱 Provider Detection

The system auto-detects providers based on phone number prefix:

| Provider | Prefixes      | Detects As   |
| -------- | ------------- | ------------ |
| MTN      | 078, 079      | MTN MoMo     |
| Airtel   | 072, 073, 075 | Airtel Money |

**Example:**

- `+250788123456` → Detects as **MTN MoMo**
- `+250723456789` → Detects as **Airtel Money**

---

## 🎯 Next Steps

- [ ] Create Flutterwave account
- [ ] Get API credentials (Public & Secret keys)
- [ ] Update frontend .env
- [ ] Implement backend payment routes
- [ ] Test with test credentials
- [ ] Go live with live credentials
- [ ] Set up transaction logging/monitoring
- [ ] Add webhook for payment notifications (optional)

---

## 📞 Support

**Flutterwave Docs:** https://developer.flutterwave.com/
**Status Page:** https://status.flutterwave.com/
**Support Email:** support@flutterwave.com

---

## ✅ Checklist Before Going Live

- [ ] Flutterwave account created & verified
- [ ] Live API keys obtained
- [ ] Backend routes tested with test credentials
- [ ] Frontend payment flow tested end-to-end
- [ ] User email field verified in registration
- [ ] Error handling for all failure scenarios
- [ ] Transaction logging implemented
- [ ] CORS configured properly
- [ ] Rate limiting added
- [ ] Payment verification webhook setup (optional)
- [ ] SMS notification on payment success
- [ ] Order status sync with payment status
