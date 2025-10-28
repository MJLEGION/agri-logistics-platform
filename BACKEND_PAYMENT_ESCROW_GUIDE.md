# 🔧 Backend Payment Escrow System Implementation Guide

**Complete guide for building the backend services to support the Payment Escrow System**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Payment Processing](#payment-processing)
6. [Escrow Management](#escrow-management)
7. [Integration with Payment Providers](#integration-with-payment-providers)
8. [Security Implementation](#security-implementation)
9. [Error Handling](#error-handling)
10. [Implementation Examples](#implementation-examples)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Checklist](#deployment-checklist)

---

## 📖 Overview

### What the Frontend Expects

The frontend mobile app (`src/services/transactionService.ts`) expects a backend API that:

1. **Processes payments** through mobile money providers (MoMo, Airtel)
2. **Manages escrow accounts** - holding and releasing payments
3. **Stores transaction data** - for history and tracking
4. **Handles disputes** - managing disputed transactions
5. **Generates receipts** - storing receipt data
6. **Provides analytics** - transaction statistics and reports

### Backend Responsibilities

- ✅ Process actual payments via payment provider APIs
- ✅ Hold payments in escrow (database records)
- ✅ Verify payment confirmations
- ✅ Manage wallets/accounts for transporters
- ✅ Send confirmation emails
- ✅ Handle refunds and disputes
- ✅ Maintain complete audit trail
- ✅ Generate reports and analytics

---

## 🏗️ Architecture

### System Flow

```
┌────────────────────────────────────────────────────────────┐
│                    MOBILE APP (Frontend)                    │
│  - Transaction Service                                      │
│  - Escrow Service                                           │
│  - Receipt Service                                          │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       ▼
┌────────────────────────────────────────────────────────────┐
│                   BACKEND API (Node.js/Express)            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Controller Layer                                      │  │
│  │ - PaymentController                                   │  │
│  │ - EscrowController                                    │  │
│  │ - TransactionController                              │  │
│  │ - ReceiptController                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Service Layer                                         │  │
│  │ - PaymentService (MoMo, Airtel, Flutterwave)         │  │
│  │ - EscrowService (Hold, Release, Refund)             │  │
│  │ - TransactionService (Orchestration)                │  │
│  │ - NotificationService (Email, SMS)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Data Layer (Database)                                 │  │
│  │ - Transactions                                        │  │
│  │ - Escrows                                             │  │
│  │ - Receipts                                            │  │
│  │ - Wallets                                             │  │
│  │ - Users (Farmers, Transporters)                      │  │
│  │ - Audit Logs                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
           │                                  ▼
           │                  ┌──────────────────────────────┐
           │                  │  Payment Providers APIs      │
           │                  │  - MTN MoMo                  │
           │                  │  - Airtel Money              │
           │                  │  - Flutterwave               │
           │                  │  - Banks                     │
           │                  └──────────────────────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Email Service       │
    │  - SendGrid/Mailgun  │
    │  - AWS SES           │
    └──────────────────────┘
```

---

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  role ENUM('farmer', 'transporter') NOT NULL,

  -- Profile info
  profileComplete BOOLEAN DEFAULT FALSE,
  profilePhoto VARCHAR(500),

  -- Status
  status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
  kycVerified BOOLEAN DEFAULT FALSE,
  kycVerifiedAt TIMESTAMP,

  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

### Wallets Table

```sql
CREATE TABLE wallets (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL UNIQUE,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'RWF',

  -- Transaction stats
  totalEarned DECIMAL(15, 2) DEFAULT 0.00,
  totalSpent DECIMAL(15, 2) DEFAULT 0.00,
  totalRefunded DECIMAL(15, 2) DEFAULT 0.00,

  -- Linked accounts
  momoPhoneNumber VARCHAR(20),
  airtelPhoneNumber VARCHAR(20),
  bankAccount VARCHAR(50),

  -- Status
  status ENUM('active', 'frozen', 'closed') DEFAULT 'active',

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_userId (userId)
);
```

### Transactions Table

```sql
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,

  -- Participants
  farmerId VARCHAR(36) NOT NULL,
  transporterId VARCHAR(36) NOT NULL,

  -- Order details
  orderId VARCHAR(36) NOT NULL,
  cargoDescription VARCHAR(500) NOT NULL,
  pickupLocation VARCHAR(255) NOT NULL,
  dropoffLocation VARCHAR(255) NOT NULL,

  -- Dates
  pickupTime DATETIME NOT NULL,
  estimatedDeliveryTime DATETIME NOT NULL,
  actualDeliveryTime DATETIME,

  -- Payment details
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RWF',
  paymentMethod ENUM('momo', 'airtel', 'card', 'bank') NOT NULL,

  -- Status
  status ENUM(
    'INITIATED',
    'PAYMENT_PROCESSING',
    'PAYMENT_CONFIRMED',
    'ESCROW_HELD',
    'IN_TRANSIT',
    'DELIVERED',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'DISPUTED',
    'REFUNDED'
  ) NOT NULL DEFAULT 'INITIATED',

  -- Reference IDs
  escrowId VARCHAR(36),
  receiptId VARCHAR(36),
  paymentReference VARCHAR(100),

  -- Tracking
  trackingNumber VARCHAR(50),

  -- Metadata
  metadata JSON,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (farmerId) REFERENCES users(id),
  FOREIGN KEY (transporterId) REFERENCES users(id),
  FOREIGN KEY (orderId) REFERENCES orders(id),
  INDEX idx_farmerId (farmerId),
  INDEX idx_transporterId (transporterId),
  INDEX idx_status (status),
  INDEX idx_orderId (orderId),
  INDEX idx_createdAt (createdAt)
);
```

### Escrows Table

```sql
CREATE TABLE escrows (
  id VARCHAR(36) PRIMARY KEY,

  -- References
  transactionId VARCHAR(36) NOT NULL UNIQUE,
  orderId VARCHAR(36) NOT NULL,
  farmerId VARCHAR(36) NOT NULL,
  transporterId VARCHAR(36) NOT NULL,

  -- Amount
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RWF',

  -- Status
  status ENUM('HELD', 'RELEASED', 'REFUNDED', 'DISPUTED') NOT NULL DEFAULT 'HELD',

  -- Dates
  heldAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  heldUntil TIMESTAMP NOT NULL, -- 24 hours from createdAt
  releasedAt TIMESTAMP,
  refundedAt TIMESTAMP,

  -- Reasons (for refund/dispute)
  releaseReason VARCHAR(500),
  refundReason VARCHAR(500),
  disputeReason VARCHAR(500),
  disputedBy ENUM('farmer', 'transporter'),

  -- Evidence
  disputeEvidence JSON, -- Photos, documents, etc.

  -- Payment method
  paymentMethod ENUM('momo', 'airtel', 'card', 'bank'),

  -- Metadata
  metadata JSON,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (transactionId) REFERENCES transactions(id),
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (farmerId) REFERENCES users(id),
  FOREIGN KEY (transporterId) REFERENCES users(id),

  UNIQUE KEY unique_transaction (transactionId),
  INDEX idx_status (status),
  INDEX idx_heldUntil (heldUntil),
  INDEX idx_farmerId (farmerId),
  INDEX idx_transporterId (transporterId)
);
```

### Receipts Table

```sql
CREATE TABLE receipts (
  id VARCHAR(36) PRIMARY KEY,

  -- References
  transactionId VARCHAR(36) NOT NULL UNIQUE,
  orderId VARCHAR(36),
  escrowId VARCHAR(36),

  -- Participants
  farmerId VARCHAR(36) NOT NULL,
  transporterId VARCHAR(36) NOT NULL,

  -- Receipt details
  receiptNumber VARCHAR(50) NOT NULL UNIQUE,
  receiptDate DATETIME NOT NULL,

  -- Amounts (breakdown)
  subtotal DECIMAL(15, 2) NOT NULL,
  platformFee DECIMAL(15, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RWF',

  -- Line items
  items JSON NOT NULL, -- Array of {description, quantity, unitPrice, total}

  -- Status
  status ENUM('DRAFT', 'ISSUED', 'PAID', 'COMPLETED', 'REFUNDED') DEFAULT 'DRAFT',

  -- Delivery proof
  deliveryProof JSON, -- {location, photo, timestamp, signature, otp}

  -- Formats
  jsonData LONGTEXT,
  htmlData LONGTEXT,

  -- Email tracking
  emailSentToFarmer BOOLEAN DEFAULT FALSE,
  emailSentToTransporter BOOLEAN DEFAULT FALSE,
  emailSentAt TIMESTAMP,

  -- Print tracking
  printCount INT DEFAULT 0,
  lastPrintedAt TIMESTAMP,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (transactionId) REFERENCES transactions(id),
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (escrowId) REFERENCES escrows(id),
  FOREIGN KEY (farmerId) REFERENCES users(id),
  FOREIGN KEY (transporterId) REFERENCES users(id),

  UNIQUE KEY unique_receiptNumber (receiptNumber),
  INDEX idx_transactionId (transactionId),
  INDEX idx_farmerId (farmerId),
  INDEX idx_transporterId (transporterId),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
);
```

### Disputes Table

```sql
CREATE TABLE disputes (
  id VARCHAR(36) PRIMARY KEY,

  -- References
  escrowId VARCHAR(36) NOT NULL,
  transactionId VARCHAR(36) NOT NULL,
  orderId VARCHAR(36),

  -- Participants
  raisedBy VARCHAR(36) NOT NULL, -- User ID
  raisedByRole ENUM('farmer', 'transporter') NOT NULL,

  -- Details
  reason VARCHAR(1000) NOT NULL,
  evidence JSON, -- Photos, documents

  -- Status
  status ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
  resolution ENUM('REFUNDED', 'RELEASED', 'PARTIAL_REFUND') ,
  resolutionReason VARCHAR(500),
  resolvedBy VARCHAR(36), -- Support team member ID

  -- Dates
  raisedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewedAt TIMESTAMP,
  resolvedAt TIMESTAMP,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (escrowId) REFERENCES escrows(id),
  FOREIGN KEY (transactionId) REFERENCES transactions(id),
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (raisedBy) REFERENCES users(id),

  INDEX idx_status (status),
  INDEX idx_escrowId (escrowId),
  INDEX idx_raisedBy (raisedBy),
  INDEX idx_raisedAt (raisedAt)
);
```

### Audit Logs Table

```sql
CREATE TABLE auditLogs (
  id VARCHAR(36) PRIMARY KEY,

  -- What happened
  action VARCHAR(100) NOT NULL, -- PAYMENT_INITIATED, ESCROW_CREATED, etc.

  -- Who did it
  userId VARCHAR(36),
  ipAddress VARCHAR(45),
  userAgent VARCHAR(500),

  -- What changed
  entityType VARCHAR(50), -- 'transaction', 'escrow', 'payment', etc.
  entityId VARCHAR(36),
  changes JSON, -- Before/after values

  -- Context
  metadata JSON,

  -- Status
  success BOOLEAN DEFAULT TRUE,
  errorMessage VARCHAR(500),

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_action (action),
  INDEX idx_userId (userId),
  INDEX idx_entityType (entityType),
  INDEX idx_entityId (entityId),
  INDEX idx_createdAt (createdAt)
);
```

---

## 🔌 API Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Register a new user (farmer or transporter)

**Request:**

```json
{
  "phone": "+250788123456",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "farmer",
  "password": "securePassword123"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "userId": "user_123456",
    "phone": "+250788123456",
    "email": "john@example.com",
    "role": "farmer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Payment Endpoints

#### POST /api/payments/initiate

Initiate a payment (called by frontend after user confirmation)

**Request:**

```json
{
  "transactionId": "txn_123456",
  "orderId": "ord_789",
  "farmerId": "farmer_123",
  "transporterId": "trans_456",
  "amount": 55000,
  "currency": "RWF",
  "paymentMethod": "momo",
  "phoneNumber": "+250788123456",
  "cargoDescription": "Potatoes - 100 bags",
  "pickupLocation": "Musanze",
  "dropoffLocation": "Kigali",
  "metadata": {
    "cargoQuantity": 100,
    "cargoUnit": "bags"
  }
}
```

**Response (202 - Accepted, processing):**

```json
{
  "success": true,
  "data": {
    "transactionId": "txn_123456",
    "paymentReference": "PAY_20240115_ABC123",
    "status": "PAYMENT_PROCESSING",
    "estimatedTime": "2-3 minutes"
  }
}
```

**Implementation:**

```javascript
// Node.js/Express Example
app.post("/api/payments/initiate", authenticateUser, async (req, res) => {
  try {
    const {
      transactionId,
      orderId,
      farmerId,
      transporterId,
      amount,
      currency,
      paymentMethod,
      phoneNumber,
      cargoDescription,
      pickupLocation,
      dropoffLocation,
      metadata,
    } = req.body;

    // 1. Validate input
    if (!transactionId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // 2. Check if transaction already exists
    const existingTxn = await Transaction.findById(transactionId);
    if (existingTxn) {
      return res.status(409).json({
        success: false,
        error: "Transaction already exists",
      });
    }

    // 3. Create transaction record
    const transaction = await Transaction.create({
      id: transactionId,
      farmerId,
      transporterId,
      orderId,
      amount,
      currency,
      paymentMethod,
      cargoDescription,
      pickupLocation,
      dropoffLocation,
      status: "INITIATED",
      metadata,
    });

    // 4. Route to payment provider
    let paymentResult;
    if (paymentMethod === "momo") {
      paymentResult = await processMoMoPayment({
        phoneNumber,
        amount,
        transactionId,
        description: cargoDescription,
      });
    } else if (paymentMethod === "airtel") {
      paymentResult = await processAirtelPayment({
        phoneNumber,
        amount,
        transactionId,
        description: cargoDescription,
      });
    } else if (paymentMethod === "card") {
      paymentResult = await processFlutterwavePayment({
        amount,
        currency,
        transactionId,
        description: cargoDescription,
      });
    }

    // 5. Update transaction with payment reference
    await Transaction.update(
      { id: transactionId },
      {
        status: "PAYMENT_PROCESSING",
        paymentReference: paymentResult.reference,
      }
    );

    // 6. Log audit
    await AuditLog.create({
      action: "PAYMENT_INITIATED",
      userId: farmerId,
      entityType: "transaction",
      entityId: transactionId,
      metadata: { paymentMethod, amount },
    });

    // 7. Return response
    res.status(202).json({
      success: true,
      data: {
        transactionId,
        paymentReference: paymentResult.reference,
        status: "PAYMENT_PROCESSING",
        estimatedTime: "2-3 minutes",
      },
    });
  } catch (error) {
    console.error("Payment initiation failed:", error);
    res.status(500).json({
      success: false,
      error: "Payment processing failed",
      message: error.message,
    });
  }
});
```

---

#### POST /api/payments/verify

Verify payment completion (called by payment provider webhook)

**Request (Webhook from MoMo/Airtel/Flutterwave):**

```json
{
  "reference": "PAY_20240115_ABC123",
  "transactionId": "txn_123456",
  "status": "successful",
  "amount": 55000,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactionId": "txn_123456",
    "status": "ESCROW_HELD",
    "escrowId": "esc_123456",
    "message": "Payment verified and escrow created"
  }
}
```

**Implementation:**

```javascript
app.post("/api/payments/verify", verifyWebhookSignature, async (req, res) => {
  try {
    const { reference, transactionId, status, amount } = req.body;

    // 1. Find transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    }

    // 2. Verify payment status
    if (status === "successful") {
      // 3. Create escrow record
      const escrow = await Escrow.create({
        id: generateId("esc"),
        transactionId,
        orderId: transaction.orderId,
        farmerId: transaction.farmerId,
        transporterId: transaction.transporterId,
        amount,
        currency: transaction.currency,
        status: "HELD",
        paymentMethod: transaction.paymentMethod,
        heldUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // 4. Update transaction
      await Transaction.update(
        { id: transactionId },
        {
          status: "ESCROW_HELD",
          escrowId: escrow.id,
          paymentReference: reference,
        }
      );

      // 5. Send confirmation emails
      await sendPaymentConfirmationEmail({
        farmerId: transaction.farmerId,
        transporterId: transaction.transporterId,
        transactionId,
        amount,
      });

      // 6. Log audit
      await AuditLog.create({
        action: "PAYMENT_CONFIRMED",
        entityType: "transaction",
        entityId: transactionId,
        metadata: { amount, reference },
      });

      res.json({
        success: true,
        data: {
          transactionId,
          status: "ESCROW_HELD",
          escrowId: escrow.id,
          message: "Payment verified and escrow created",
        },
      });
    } else if (status === "failed") {
      // Update transaction status
      await Transaction.update({ id: transactionId }, { status: "FAILED" });

      // Send failure notification
      await sendPaymentFailureEmail({
        farmerId: transaction.farmerId,
        transactionId,
        reason: "Payment was not processed successfully",
      });

      res.json({
        success: true,
        data: {
          transactionId,
          status: "FAILED",
          message: "Payment could not be processed",
        },
      });
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({
      success: false,
      error: "Payment verification failed",
    });
  }
});
```

---

#### GET /api/transactions/{transactionId}

Get transaction details

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "txn_123456",
    "status": "ESCROW_HELD",
    "amount": 55000,
    "currency": "RWF",
    "paymentMethod": "momo",
    "cargoDescription": "Potatoes - 100 bags",
    "pickupLocation": "Musanze",
    "dropoffLocation": "Kigali",
    "estimatedDeliveryTime": "2024-01-15T14:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "escrowId": "esc_123456",
    "receiptId": "rcp_123456"
  }
}
```

---

### Escrow Endpoints

#### POST /api/escrows/{escrowId}/release

Release escrow to transporter (called after delivery confirmation)

**Request:**

```json
{
  "reason": "Delivery confirmed by transporter",
  "deliveryProof": {
    "location": "Kigali",
    "photo": "https://...",
    "timestamp": "2024-01-15T14:30:00Z",
    "otp": "123456"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "escrowId": "esc_123456",
    "status": "RELEASED",
    "transactionId": "txn_123456",
    "releasedAt": "2024-01-15T14:35:00Z",
    "walletUpdate": {
      "transporterId": "trans_456",
      "previousBalance": 100000,
      "amount": 55000,
      "newBalance": 155000
    }
  }
}
```

**Implementation:**

```javascript
app.post(
  "/api/escrows/:escrowId/release",
  authenticateUser,
  async (req, res) => {
    try {
      const { escrowId } = req.params;
      const { reason, deliveryProof } = req.body;

      // 1. Find escrow
      const escrow = await Escrow.findById(escrowId);
      if (!escrow) {
        return res
          .status(404)
          .json({ success: false, error: "Escrow not found" });
      }

      // 2. Verify escrow is in HELD state
      if (escrow.status !== "HELD") {
        return res.status(400).json({
          success: false,
          error: `Cannot release escrow in ${escrow.status} state`,
        });
      }

      // 3. Update escrow status
      await Escrow.update(
        { id: escrowId },
        {
          status: "RELEASED",
          releaseReason: reason,
          releasedAt: new Date(),
        }
      );

      // 4. Update transaction status
      await Transaction.update(
        { id: escrow.transactionId },
        {
          status: "COMPLETED",
          actualDeliveryTime: deliveryProof.timestamp,
        }
      );

      // 5. Update transporter's wallet
      const wallet = await Wallet.findOne({ userId: escrow.transporterId });
      const newBalance = parseFloat(wallet.balance) + parseFloat(escrow.amount);

      await Wallet.update(
        { userId: escrow.transporterId },
        {
          balance: newBalance,
          totalEarned:
            parseFloat(wallet.totalEarned) + parseFloat(escrow.amount),
        }
      );

      // 6. Update receipt status
      await Receipt.update(
        { transactionId: escrow.transactionId },
        {
          status: "COMPLETED",
          deliveryProof,
        }
      );

      // 7. Send completion emails
      await sendCompletionEmails({
        farmerId: escrow.farmerId,
        transporterId: escrow.transporterId,
        amount: escrow.amount,
        transactionId: escrow.transactionId,
      });

      // 8. Log audit
      await AuditLog.create({
        action: "ESCROW_RELEASED",
        userId: req.user.id,
        entityType: "escrow",
        entityId: escrowId,
        metadata: {
          amount: escrow.amount,
          transporterId: escrow.transporterId,
        },
      });

      res.json({
        success: true,
        data: {
          escrowId,
          status: "RELEASED",
          transactionId: escrow.transactionId,
          releasedAt: new Date(),
          walletUpdate: {
            transporterId: escrow.transporterId,
            amount: escrow.amount,
            newBalance,
          },
        },
      });
    } catch (error) {
      console.error("Escrow release failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to release escrow",
      });
    }
  }
);
```

---

#### POST /api/escrows/{escrowId}/refund

Refund escrow to farmer

**Request:**

```json
{
  "reason": "Transporter cancelled pickup"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "escrowId": "esc_123456",
    "status": "REFUNDED",
    "amount": 55000,
    "refundedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

#### POST /api/escrows/{escrowId}/dispute

Raise a dispute on an escrow

**Request:**

```json
{
  "reason": "Items damaged in transit",
  "evidence": [
    {
      "type": "photo",
      "url": "https://..."
    }
  ],
  "raisedByRole": "farmer"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "escrowId": "esc_123456",
    "status": "DISPUTED",
    "disputeId": "dispute_123456",
    "message": "Dispute raised. Support team will review within 24 hours."
  }
}
```

---

### Receipt Endpoints

#### POST /api/receipts/{receiptId}/email

Send receipt via email

**Request:**

```json
{
  "recipientRole": "farmer"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "receiptId": "rcp_123456",
    "emailSent": true,
    "sentAt": "2024-01-15T10:35:00Z"
  }
}
```

---

#### GET /api/receipts/{receiptId}/html

Get receipt in HTML format

**Response:**

```html
HTTP/1.1 200 OK Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
  <head>
    <title>Receipt #RCP-2024-ABC12-345678</title>
    ...
  </head>
  <body>
    ... receipt content ...
  </body>
</html>
```

---

#### GET /api/receipts/{receiptId}/json

Get receipt in JSON format

**Response:**

```json
{
  "success": true,
  "data": {
    "receiptId": "rcp_123456",
    "receiptNumber": "RCP-2024-ABC12-345678",
    "receiptDate": "2024-01-15",
    "farmer": {
      "name": "John Doe",
      "phone": "+250788123456",
      "email": "john@example.com"
    },
    "transporter": {
      "name": "Safe Transport Ltd",
      "phone": "+250788654321",
      "email": "contact@transport.com"
    },
    "items": [
      {
        "description": "Transport - Potatoes",
        "quantity": 100,
        "unit": "bags",
        "unitPrice": 500,
        "total": 50000
      }
    ],
    "summary": {
      "subtotal": 50000,
      "platformFee": 5000,
      "taxRate": 0.18,
      "tax": 9900,
      "total": 64900
    }
  }
}
```

---

## 💳 Payment Processing

### MoMo Payment Processing

**Provider:** MTN MoMo API

```javascript
// Implementation
async function processMoMoPayment({
  phoneNumber,
  amount,
  transactionId,
  description,
}) {
  try {
    // 1. Validate phone number
    if (!isMTNMoMoNumber(phoneNumber)) {
      throw new Error("Invalid MTN MoMo number");
    }

    // 2. Initialize payment
    const response = await axios.post(
      "https://api.mtn-momo.com/v1/collection/token/oauth2/token/",
      null,
      {
        auth: {
          username: process.env.MOMO_API_USER,
          password: process.env.MOMO_API_KEY,
        },
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.MOMO_PRIMARY_KEY,
        },
      }
    );

    const accessToken = response.data.access_token;

    // 3. Request payment
    const paymentRequest = await axios.post(
      "https://api.mtn-momo.com/v1/collection/v2_0/requesttopay",
      {
        amount: amount.toString(),
        currency: "RWF",
        externalId: transactionId,
        payer: {
          partyIdType: "MSISDN",
          partyId: phoneNumber,
        },
        payerMessage: description,
        payeeNote: description,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Reference-Id": transactionId,
          "Ocp-Apim-Subscription-Key": process.env.MOMO_PRIMARY_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // 4. Poll for payment status (check every 5 seconds for 2 minutes)
    let paymentStatus = null;
    for (let i = 0; i < 24; i++) {
      await sleep(5000);

      const statusCheck = await axios.get(
        `https://api.mtn-momo.com/v1/collection/v2_0/requesttopay/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Ocp-Apim-Subscription-Key": process.env.MOMO_PRIMARY_KEY,
          },
        }
      );

      if (statusCheck.data.status === "SUCCESSFUL") {
        paymentStatus = "successful";
        break;
      } else if (statusCheck.data.status === "FAILED") {
        paymentStatus = "failed";
        break;
      }
    }

    return {
      reference: transactionId,
      status: paymentStatus || "pending",
      amount,
      currency: "RWF",
    };
  } catch (error) {
    console.error("MoMo payment processing failed:", error);
    throw error;
  }
}

function isMTNMoMoNumber(phoneNumber) {
  // MTN MoMo prefixes: 078, 079
  const prefix = phoneNumber.substring(3, 5);
  return ["78", "79"].includes(prefix);
}
```

### Airtel Money Processing

```javascript
async function processAirtelPayment({
  phoneNumber,
  amount,
  transactionId,
  description,
}) {
  try {
    // 1. Validate phone number
    if (!isAirtelMoneyNumber(phoneNumber)) {
      throw new Error("Invalid Airtel Money number");
    }

    // 2. Initialize payment
    const response = await axios.post(
      "https://api.airtel.africa/merchant/v1/payments/",
      {
        reference: transactionId,
        subscriber: {
          phone: phoneNumber,
        },
        transaction: {
          amount: amount.toString(),
          currency: "RWF",
          id: transactionId,
        },
        merchant: {
          consumerKey: process.env.AIRTEL_CONSUMER_KEY,
          consumerSecret: process.env.AIRTEL_CONSUMER_SECRET,
        },
      }
    );

    // 3. Poll for payment status
    let paymentStatus = null;
    for (let i = 0; i < 24; i++) {
      await sleep(5000);

      const statusCheck = await axios.get(
        `https://api.airtel.africa/merchant/v1/payments/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.AIRTEL_TOKEN}`,
          },
        }
      );

      if (statusCheck.data.status === "TS") {
        // Transaction Successful
        paymentStatus = "successful";
        break;
      } else if (statusCheck.data.status === "TF") {
        // Transaction Failed
        paymentStatus = "failed";
        break;
      }
    }

    return {
      reference: transactionId,
      status: paymentStatus || "pending",
      amount,
      currency: "RWF",
    };
  } catch (error) {
    console.error("Airtel payment processing failed:", error);
    throw error;
  }
}

function isAirtelMoneyNumber(phoneNumber) {
  // Airtel Money prefixes: 072, 073, 075
  const prefix = phoneNumber.substring(3, 5);
  return ["72", "73", "75"].includes(prefix);
}
```

### Flutterwave Card Processing

```javascript
async function processFlutterwavePayment({
  amount,
  currency,
  transactionId,
  description,
}) {
  try {
    // 1. Create payment link
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: transactionId,
        amount,
        currency,
        redirect_url: `${process.env.APP_URL}/payment/callback`,
        customer: {
          email: process.env.MERCHANT_EMAIL,
        },
        customizations: {
          title: "Agri Logistics Payment",
          description,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    return {
      reference: response.data.data.id,
      paymentLink: response.data.data.link,
      status: "pending",
      amount,
      currency,
    };
  } catch (error) {
    console.error("Flutterwave payment processing failed:", error);
    throw error;
  }
}
```

---

## 🔒 Security Implementation

### 1. Authentication & Authorization

```javascript
// JWT middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};

// Webhook signature verification
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers["x-webhook-signature"];
  const body = JSON.stringify(req.body);

  const hash = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    return res.status(401).json({ success: false, error: "Invalid signature" });
  }

  next();
};
```

### 2. Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 payment attempts per user
  message: "Too many payment attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/payments/initiate", paymentLimiter, async (req, res) => {
  // ...
});
```

### 3. Input Validation

```javascript
const validatePaymentRequest = (req, res, next) => {
  const { amount, phoneNumber, paymentMethod } = req.body;

  // Validate amount
  if (amount < 1000 || amount > 10000000) {
    return res.status(400).json({
      success: false,
      error: "Amount must be between 1,000 and 10,000,000 RWF",
    });
  }

  // Validate phone number
  if (!/^\+250\d{9}$/.test(phoneNumber)) {
    return res.status(400).json({
      success: false,
      error: "Invalid phone number format",
    });
  }

  // Validate payment method
  if (!["momo", "airtel", "card", "bank"].includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      error: "Invalid payment method",
    });
  }

  next();
};

app.post("/api/payments/initiate", validatePaymentRequest, async (req, res) => {
  // ...
});
```

### 4. Data Encryption

```javascript
const crypto = require("crypto");

// Encrypt sensitive data
function encryptPhoneNumber(phoneNumber) {
  const cipher = crypto.createCipher("aes-256-cbc", process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(phoneNumber, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// Decrypt sensitive data
function decryptPhoneNumber(encrypted) {
  const decipher = crypto.createDecipher(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

### 5. HTTPS & CORS

```javascript
const cors = require("cors");
const helmet = require("helmet");

app.use(helmet()); // Adds security headers

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "https://yourdomain.com",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
```

---

## ❌ Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Payment processing failed",
  "code": "PAYMENT_ERROR",
  "details": {
    "field": "phoneNumber",
    "message": "Invalid phone number format"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

### Global Error Handler

```javascript
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let status = err.status || 500;
  let message = err.message || "Internal server error";
  let code = err.code || "INTERNAL_ERROR";

  // Payment provider errors
  if (err.provider === "momo") {
    status = 503;
    code = "MOMO_SERVICE_ERROR";
    message = "MTN MoMo service temporarily unavailable";
  } else if (err.provider === "airtel") {
    status = 503;
    code = "AIRTEL_SERVICE_ERROR";
    message = "Airtel Money service temporarily unavailable";
  }

  // Database errors
  if (err.code === "ER_DUP_ENTRY") {
    status = 409;
    code = "DUPLICATE_ENTRY";
    message = "Record already exists";
  }

  // Validation errors
  if (err.name === "ValidationError") {
    status = 400;
    code = "VALIDATION_ERROR";
  }

  res.status(status).json({
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
};

app.use(errorHandler);
```

---

## 📚 Implementation Examples

### Complete Payment Flow Example

```javascript
// STEP 1: User initiates payment from frontend
POST /api/payments/initiate
{
  "transactionId": "txn_20240115_001",
  "farmerId": "farmer_123",
  "transporterId": "trans_456",
  "amount": 55000,
  "paymentMethod": "momo",
  "phoneNumber": "+250788123456"
}
→ Response: status PAYMENT_PROCESSING

// STEP 2: Payment provider (MoMo) prompts user for PIN
// User enters PIN on their phone

// STEP 3: MoMo API sends webhook notification
POST /api/payments/verify (webhook)
{
  "reference": "txn_20240115_001",
  "status": "successful",
  "amount": 55000
}

// STEP 4: Backend:
// - Creates ESCROW record (HELD status)
// - Updates TRANSACTION (ESCROW_HELD)
// - Sends confirmation emails to both parties

// STEP 5: Transporter receives/completes delivery
POST /api/escrows/esc_123456/release
{
  "deliveryProof": { ... }
}

// STEP 6: Backend:
// - Updates ESCROW (RELEASED)
// - Updates WALLET (adds funds to transporter)
// - Updates RECEIPT (COMPLETED)
// - Sends completion emails
```

---

## 🧪 Testing Strategy

### Unit Tests

```javascript
// Test payment initiation
describe("Payment Service", () => {
  describe("initiate payment", () => {
    it("should create transaction with INITIATED status", async () => {
      const result = await paymentService.initiatePayment({
        transactionId: "txn_001",
        amount: 50000,
        phoneNumber: "+250788123456",
      });

      expect(result.success).toBe(true);
      expect(result.data.status).toBe("PAYMENT_PROCESSING");
    });

    it("should fail with invalid phone number", async () => {
      const result = await paymentService.initiatePayment({
        transactionId: "txn_002",
        amount: 50000,
        phoneNumber: "invalid",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid phone number");
    });

    it("should fail with duplicate transaction ID", async () => {
      // Create first transaction
      await paymentService.initiatePayment({
        transactionId: "txn_003",
        amount: 50000,
        phoneNumber: "+250788123456",
      });

      // Try to create with same ID
      const result = await paymentService.initiatePayment({
        transactionId: "txn_003",
        amount: 50000,
        phoneNumber: "+250788654321",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("already exists");
    });
  });
});

// Test escrow operations
describe("Escrow Service", () => {
  describe("release escrow", () => {
    it("should move funds to transporter wallet", async () => {
      const escrowId = "esc_001";
      const transporterId = "trans_456";

      const result = await escrowService.releaseEscrow(escrowId);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe("RELEASED");

      // Verify wallet updated
      const wallet = await Wallet.findOne({ userId: transporterId });
      expect(wallet.balance).toBeGreaterThan(0);
    });

    it("should only release HELD escrows", async () => {
      const escrowId = "esc_002";
      // First release it
      await escrowService.releaseEscrow(escrowId);

      // Try to release again
      const result = await escrowService.releaseEscrow(escrowId);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot release");
    });
  });
});
```

### Integration Tests

```javascript
describe("Payment Flow Integration", () => {
  it("should complete full payment → escrow → delivery → release flow", async () => {
    // 1. Initiate payment
    const initResult = await request(app).post("/api/payments/initiate").send({
      transactionId: "txn_flow_001",
      farmerId: "farmer_123",
      transporterId: "trans_456",
      amount: 55000,
      paymentMethod: "momo",
      phoneNumber: "+250788123456",
    });

    expect(initResult.status).toBe(202);
    const { transactionId } = initResult.body.data;

    // 2. Verify payment (simulate webhook)
    const verifyResult = await request(app)
      .post("/api/payments/verify")
      .set(
        "x-webhook-signature",
        generateSignature({
          reference: transactionId,
          status: "successful",
          amount: 55000,
        })
      )
      .send({
        reference: transactionId,
        status: "successful",
        amount: 55000,
      });

    expect(verifyResult.status).toBe(200);
    const { escrowId } = verifyResult.body.data;

    // 3. Release escrow
    const releaseResult = await request(app)
      .post(`/api/escrows/${escrowId}/release`)
      .set("Authorization", `Bearer ${transporterToken}`)
      .send({
        deliveryProof: {
          location: "Kigali",
          timestamp: new Date().toISOString(),
        },
      });

    expect(releaseResult.status).toBe(200);
    expect(releaseResult.body.data.status).toBe("RELEASED");
  });
});
```

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] All endpoints tested and working
- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] Payment provider credentials set up
- [ ] Email service configured
- [ ] HTTPS certificates installed
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Logging system in place
- [ ] Backup strategy configured

### Environment Variables (.env)

```bash
# Server
NODE_ENV=production
PORT=3000
API_URL=https://api.youromain.com
APP_URL=https://app.yourdomain.com

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=agri_user
DB_PASSWORD=secure_password
DB_NAME=agri_logistics

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRY=24h

# MoMo API
MOMO_API_USER=your_momo_user
MOMO_API_KEY=your_momo_key
MOMO_PRIMARY_KEY=your_momo_primary_key

# Airtel API
AIRTEL_CONSUMER_KEY=your_airtel_key
AIRTEL_CONSUMER_SECRET=your_airtel_secret
AIRTEL_TOKEN=your_airtel_token

# Flutterwave
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret

# Email Service
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
MERCHANT_EMAIL=noreply@yourdomain.com

# Encryption
ENCRYPTION_KEY=your_encryption_key

# Webhooks
WEBHOOK_SECRET=your_webhook_secret

# Features
ENABLE_MOMO=true
ENABLE_AIRTEL=true
ENABLE_CARD=true
ESCROW_HOLD_HOURS=24
```

### Deployment Steps

1. **Set up database**

   ```bash
   mysql -u root -p < schema.sql
   npm run migrate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Run tests**

   ```bash
   npm test
   ```

5. **Start server**

   ```bash
   npm start
   # or with PM2
   pm2 start app.js
   ```

6. **Verify endpoints**
   ```bash
   curl https://api.yourdomain.com/api/health
   ```

---

## 🔗 Integration Points

### From Frontend to Backend

The frontend app will call these endpoints:

```
1. POST /api/payments/initiate
   ├─ User clicks "Pay"
   └─ Initiates payment flow

2. Webhook: POST /api/payments/verify
   ├─ Payment provider notifies backend
   └─ Creates escrow

3. POST /api/transactions/{id}
   ├─ Get transaction details
   └─ Display in app

4. POST /api/escrows/{id}/release
   ├─ Transporter confirms delivery
   └─ Releases escrow

5. GET /api/receipts/{id}/html
   ├─ Display receipt
   └─ Send via email

6. POST /api/escrows/{id}/dispute
   ├─ Farmer raises dispute
   └─ Triggers manual review
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Payment stuck in PAYMENT_PROCESSING**

- Check MoMo/Airtel API credentials
- Verify webhook is being called
- Check server logs for errors
- Manually trigger webhook: `POST /api/payments/verify`

**Issue: Escrow not releasing**

- Verify escrow is in HELD state
- Check wallet exists for transporter
- Verify delivery proof data
- Check database transaction logs

**Issue: Emails not sent**

- Verify SENDGRID_API_KEY
- Check email service configuration
- Review email service logs
- Test with test email address

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

```javascript
// Setup monitoring
const prometheus = require("prom-client");

const paymentCounter = new prometheus.Counter({
  name: "payments_total",
  help: "Total payments processed",
  labelNames: ["method", "status"],
});

const escrowGauge = new prometheus.Gauge({
  name: "escrows_held",
  help: "Number of held escrows",
  labelNames: ["status"],
});

// Log metrics
paymentCounter.inc({ method: "momo", status: "successful" });
```

**Monitor:**

- ✅ Payment success rate
- ✅ Average processing time
- ✅ Number of held escrows
- ✅ Dispute resolution rate
- ✅ API error rate
- ✅ Payment provider availability

---

## 🎉 Summary

You now have a complete backend implementation guide that covers:

✅ **Database Schema** - 6 tables with proper relationships
✅ **10+ API Endpoints** - All mapped and documented
✅ **Payment Processing** - MoMo, Airtel, Flutterwave integration
✅ **Security** - Authentication, authorization, encryption
✅ **Error Handling** - Comprehensive error responses
✅ **Testing Strategy** - Unit and integration test examples
✅ **Deployment Steps** - Complete checklist and env variables

**Next:** Implement each endpoint following the examples provided!
