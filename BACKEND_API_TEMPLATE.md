# 🔌 Backend API Template for MoMo, Offline & SMS

## Overview

This document provides ready-to-use backend API templates for integrating Mobile Money payments, SMS notifications, and offline sync support.

---

## 📋 Required Endpoints

### 1. Mobile Money Payments

```
POST   /api/payments/momo/initiate
GET    /api/payments/momo/status/:referenceId
```

### 2. SMS Notifications

```
POST   /api/notifications/sms
```

### 3. Orders (Updated)

```
POST   /api/orders  (accept payment info)
```

---

## 💰 Mobile Money API Implementation

### Node.js + Express + MTN MoMo

#### Install Dependencies

```bash
npm install axios uuid
```

#### Environment Variables (.env)

```env
# MTN Mobile Money
MOMO_API_KEY=your_api_key
MOMO_API_SECRET=your_api_secret
MOMO_SUBSCRIPTION_KEY=your_subscription_key
MOMO_ENVIRONMENT=sandbox  # or 'production'
MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
```

#### Helper: Get Access Token

```javascript
// utils/momoAuth.js
const axios = require("axios");

let cachedToken = null;
let tokenExpiry = null;

async function getMomoAccessToken() {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const credentials = Buffer.from(
    `${process.env.MOMO_API_KEY}:${process.env.MOMO_API_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(
      `${process.env.MOMO_BASE_URL}/collection/token/`,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY,
        },
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + 3600 * 1000; // 1 hour

    return cachedToken;
  } catch (error) {
    console.error("Failed to get MoMo access token:", error.response?.data);
    throw new Error("Authentication failed");
  }
}

module.exports = { getMomoAccessToken };
```

#### Endpoint: Initiate Payment

```javascript
// routes/payments.js
const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { getMomoAccessToken } = require("../utils/momoAuth");

const router = express.Router();

router.post("/momo/initiate", async (req, res) => {
  const { amount, phoneNumber, orderId, currency = "RWF" } = req.body;

  // Validate input
  if (!amount || !phoneNumber || !orderId) {
    return res.status(400).json({
      success: false,
      status: "failed",
      message: "Missing required fields",
    });
  }

  // Generate unique reference ID
  const referenceId = uuidv4();

  try {
    // Get access token
    const accessToken = await getMomoAccessToken();

    // Format phone number (remove + and country code for API)
    const formattedPhone = phoneNumber.replace(/^\+250/, "");

    // Initiate payment request
    const response = await axios.post(
      `${process.env.MOMO_BASE_URL}/collection/v1_0/requesttopay`,
      {
        amount: amount.toString(),
        currency: currency,
        externalId: orderId,
        payer: {
          partyIdType: "MSISDN",
          partyId: formattedPhone,
        },
        payerMessage: `Payment for order ${orderId}`,
        payeeNote: "Agri-Logistics Platform",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": process.env.MOMO_ENVIRONMENT,
          "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // Store transaction in database
    await db.transactions.create({
      referenceId,
      orderId,
      amount,
      phoneNumber,
      status: "pending",
      createdAt: new Date(),
    });

    res.json({
      success: true,
      referenceId: referenceId,
      status: "pending",
      message: "Payment initiated. Please check your phone to confirm.",
    });
  } catch (error) {
    console.error("MoMo payment error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      status: "failed",
      message:
        error.response?.data?.message || "Payment failed. Please try again.",
    });
  }
});

module.exports = router;
```

#### Endpoint: Check Payment Status

```javascript
// routes/payments.js (continued)

router.get("/momo/status/:referenceId", async (req, res) => {
  const { referenceId } = req.params;

  try {
    // Get access token
    const accessToken = await getMomoAccessToken();

    // Check payment status
    const response = await axios.get(
      `${process.env.MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Target-Environment": process.env.MOMO_ENVIRONMENT,
          "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY,
        },
      }
    );

    const paymentData = response.data;
    const status = paymentData.status; // PENDING, SUCCESSFUL, FAILED

    // Update database
    await db.transactions.update(
      { referenceId },
      {
        status: status.toLowerCase(),
        updatedAt: new Date(),
        momoResponse: paymentData,
      }
    );

    // Map status
    let mappedStatus = "pending";
    if (status === "SUCCESSFUL") mappedStatus = "completed";
    if (status === "FAILED") mappedStatus = "failed";

    res.json({
      success: status === "SUCCESSFUL",
      status: mappedStatus,
      transactionId: paymentData.financialTransactionId,
      referenceId: referenceId,
      message:
        status === "SUCCESSFUL"
          ? "Payment completed successfully"
          : status === "FAILED"
          ? "Payment failed"
          : "Payment is pending",
    });
  } catch (error) {
    console.error("Status check error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      status: "failed",
      message: "Failed to check payment status",
    });
  }
});
```

---

## 📨 SMS Notifications API Implementation

### Node.js + Express + Africa's Talking

#### Install Dependencies

```bash
npm install africastalking
```

#### Environment Variables (.env)

```env
# Africa's Talking
SMS_API_KEY=your_api_key
SMS_USERNAME=your_username  # Usually 'sandbox' for testing
SMS_SENDER_ID=AgriLogistics  # Your sender name (max 11 chars)
```

#### SMS Service

```javascript
// services/smsService.js
const AfricasTalking = require("africastalking");

const africastalking = AfricasTalking({
  apiKey: process.env.SMS_API_KEY,
  username: process.env.SMS_USERNAME,
});

const sms = africastalking.SMS;

async function sendSMS(to, message) {
  try {
    const result = await sms.send({
      to: [to],
      message: message,
      from: process.env.SMS_SENDER_ID,
    });

    console.log("SMS sent:", result);
    return {
      success: true,
      result: result.SMSMessageData.Recipients[0],
    };
  } catch (error) {
    console.error("SMS error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { sendSMS };
```

#### Endpoint: Send SMS

```javascript
// routes/notifications.js
const express = require("express");
const { sendSMS } = require("../services/smsService");

const router = express.Router();

router.post("/sms", async (req, res) => {
  const { to, message, type } = req.body;

  // Validate input
  if (!to || !message) {
    return res.status(400).json({
      success: false,
      message: "Phone number and message are required",
    });
  }

  // Validate phone format (Rwanda)
  if (!to.match(/^\+250[0-9]{9}$/)) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number format. Use +250XXXXXXXXX",
    });
  }

  try {
    const result = await sendSMS(to, message);

    // Log to database
    await db.smsLogs.create({
      to,
      message,
      type,
      status: result.success ? "sent" : "failed",
      result: result,
      sentAt: new Date(),
    });

    res.json(result);
  } catch (error) {
    console.error("SMS sending failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send SMS",
    });
  }
});

module.exports = router;
```

#### Helper: SMS Templates

```javascript
// utils/smsTemplates.js

function orderCreatedSMS(orderDetails) {
  return `Order #${orderDetails.orderId} created successfully! ${orderDetails.quantity} of ${orderDetails.cropName} for ${orderDetails.totalPrice} RWF. We'll notify you when a transporter is assigned.`;
}

function transporterAssignedSMS(orderDetails) {
  return `Transporter assigned to Order #${orderDetails.orderId}! ${orderDetails.transporterName} (${orderDetails.transporterPhone}) will deliver using ${orderDetails.vehicleType}. Track your order in the app.`;
}

function deliveryCompletedSMS(orderDetails) {
  return `Order #${orderDetails.orderId} delivered successfully at ${orderDetails.deliveryTime}! Thank you for using Agri-Logistics Platform. Rate your experience in the app.`;
}

function paymentReceivedSMS(paymentDetails) {
  return `Payment received! ${paymentDetails.amount} RWF for Order #${paymentDetails.orderId}. Transaction ID: ${paymentDetails.transactionId}. Check your mobile money account.`;
}

module.exports = {
  orderCreatedSMS,
  transporterAssignedSMS,
  deliveryCompletedSMS,
  paymentReceivedSMS,
};
```

---

## 📦 Updated Orders Endpoint

### Accept Payment Information

```javascript
// routes/orders.js
const express = require("express");
const { sendSMS } = require("../services/smsService");
const { orderCreatedSMS } = require("../utils/smsTemplates");

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    cropId,
    quantity,
    totalPrice,
    pickupLocation,
    deliveryLocation,
    paymentMethod, // NEW: 'momo', 'cash', etc.
    paymentStatus, // NEW: 'pending', 'completed'
    transactionId, // NEW: MoMo transaction ID
  } = req.body;

  const buyerId = req.user.id; // From auth middleware

  try {
    // Create order
    const order = await db.orders.create({
      cropId,
      buyerId,
      quantity,
      totalPrice,
      pickupLocation,
      deliveryLocation,
      paymentMethod: paymentMethod || "cash",
      paymentStatus: paymentStatus || "pending",
      transactionId: transactionId || null,
      status: "pending",
      createdAt: new Date(),
    });

    // Get buyer phone number
    const buyer = await db.users.findById(buyerId);

    // Send SMS notification
    if (buyer.phone) {
      const crop = await db.crops.findById(cropId);

      await sendSMS(
        buyer.phone,
        orderCreatedSMS({
          orderId: order.id,
          cropName: crop.name,
          quantity: quantity,
          totalPrice: totalPrice,
        })
      );
    }

    res.status(201).json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
});

module.exports = router;
```

---

## 🔗 Main App Setup

### Express Server Setup

```javascript
// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const paymentsRouter = require("./routes/payments");
const notificationsRouter = require("./routes/notifications");
const ordersRouter = require("./routes/orders");

app.use("/api/payments", paymentsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/orders", ordersRouter);

// Error handling
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🗄️ Database Schema Updates

### Transactions Table

```sql
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  reference_id VARCHAR(36) UNIQUE NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RWF',
  phone_number VARCHAR(20) NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  momo_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### SMS Logs Table

```sql
CREATE TABLE sms_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  to_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('order_created', 'transporter_assigned', 'delivery_completed', 'payment_received'),
  status ENUM('sent', 'failed') DEFAULT 'sent',
  result JSON,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table (Updated)

```sql
ALTER TABLE orders
ADD COLUMN payment_method ENUM('cash', 'momo', 'bank') DEFAULT 'cash',
ADD COLUMN payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
ADD COLUMN transaction_id VARCHAR(100);
```

---

## 🧪 Testing Endpoints

### Test Mobile Money Payment

```bash
# Initiate payment
curl -X POST http://localhost:3000/api/payments/momo/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "phoneNumber": "+250788123456",
    "orderId": "ORDER123",
    "currency": "RWF"
  }'

# Check status
curl http://localhost:3000/api/payments/momo/status/REFERENCE_ID_HERE
```

### Test SMS Notification

```bash
curl -X POST http://localhost:3000/api/notifications/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+250788123456",
    "message": "Test SMS from Agri-Logistics Platform",
    "type": "order_created"
  }'
```

### Test Order Creation with Payment

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cropId": "CROP123",
    "quantity": 100,
    "totalPrice": 50000,
    "pickupLocation": {...},
    "deliveryLocation": {...},
    "paymentMethod": "momo",
    "paymentStatus": "completed",
    "transactionId": "MOMO123456"
  }'
```

---

## 🔐 Security Best Practices

### 1. API Key Protection

```javascript
// Never expose API keys in frontend
// Always use environment variables
// Rotate keys regularly
```

### 2. Request Validation

```javascript
const { body, validationResult } = require("express-validator");

router.post(
  "/momo/initiate",
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("phoneNumber")
      .matches(/^\+250[0-9]{9}$/)
      .withMessage("Invalid phone"),
    body("orderId").notEmpty().withMessage("Order ID required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process payment...
  }
);
```

### 3. Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many payment requests, please try again later",
});

app.use("/api/payments", paymentLimiter);
```

### 4. Webhook Verification (MTN MoMo)

```javascript
router.post("/momo/webhook", (req, res) => {
  // Verify webhook signature
  const signature = req.headers["x-momo-signature"];
  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", process.env.MOMO_API_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Process webhook...
});
```

---

## 📊 Monitoring & Logging

### Payment Logging

```javascript
// Log all payment attempts
await db.paymentLogs.create({
  orderId,
  amount,
  phoneNumber,
  status: "initiated",
  provider: "mtn_momo",
  timestamp: new Date(),
});
```

### SMS Delivery Tracking

```javascript
// Track SMS delivery status
const result = await sms.send({...});

await db.smsLogs.create({
  to: phoneNumber,
  message: message,
  status: result.SMSMessageData.Recipients[0].status,
  messageId: result.SMSMessageData.Recipients[0].messageId,
  cost: result.SMSMessageData.Recipients[0].cost
});
```

---

## 🚀 Deployment Checklist

- [ ] Set environment variables in production
- [ ] Switch from sandbox to production URLs
- [ ] Enable HTTPS (required for MoMo API)
- [ ] Set up webhook endpoints
- [ ] Configure rate limiting
- [ ] Set up monitoring/alerts
- [ ] Test with real phone numbers
- [ ] Verify SMS delivery
- [ ] Test payment flow end-to-end
- [ ] Set up error logging (Sentry, etc.)

---

## 📚 API Documentation Links

- **MTN MoMo**: https://momodeveloper.mtn.com/api-documentation
- **Airtel Money**: https://developers.airtel.africa/documentation
- **Africa's Talking**: https://developers.africastalking.com/docs/sms/overview

---

## ✅ Summary

This template provides:

- ✅ Complete Mobile Money payment integration
- ✅ SMS notification system
- ✅ Updated order creation with payment tracking
- ✅ Security best practices
- ✅ Testing examples
- ✅ Database schema updates

**Ready to deploy! 🚀**
