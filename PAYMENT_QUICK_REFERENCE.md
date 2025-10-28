# 💳 Payment & Escrow - Quick Reference Card

One-page reference for developers using the Payment system.

---

## 🚀 Quick Start (5 Minutes)

### 1. Install & Import

```typescript
// Services are ready to use
import { transactionService } from "@/services/transactionService";
import { escrowService } from "@/services/escrowService";
import { receiptService } from "@/services/receiptService";
```

### 2. Initiate Payment (Farmer)

```typescript
const result = await transactionService.initiateTransaction({
  // Order
  orderId: "ORD_001",

  // Farmer
  farmerId: "farmer_123",
  farmerName: "John Farmer",
  farmerPhone: "+250788123456",
  farmerEmail: "john@farm.com",

  // Transporter
  transporterId: "trans_456",
  transporterName: "Safe Transport",
  transporterPhone: "+250788654321",
  transporterEmail: "contact@safetrans.com",

  // Cargo
  cargoDescription: "Potatoes - 100 bags",
  cargoQuantity: 100,
  cargoUnit: "bags",
  pickupLocation: "Musanze",
  dropoffLocation: "Kigali",
  pickupTime: new Date().toISOString(),
  estimatedDeliveryTime: new Date(
    Date.now() + 4 * 60 * 60 * 1000
  ).toISOString(),

  // Payment
  paymentMethod: "momo", // or 'airtel'
  phoneNumber: "+250788123456",
  email: "john@farm.com",

  // Items & Costs
  items: [
    { description: "Transport", quantity: 1, unitPrice: 50000, total: 50000 },
  ],
  platformFee: 5000,
});

// Result contains: transactionId, escrowId, receiptId
```

### 3. Confirm Delivery (Transporter)

```typescript
const result = await transactionService.confirmDeliveryAndReleaseEscrow(
  transactionId,
  {
    location: "Kigali",
    photo: "proof_photo_url",
    timestamp: new Date().toISOString(),
  }
);

// Escrow automatically released to transporter wallet
```

### 4. Handle Dispute

```typescript
// Farmer reports issue
await transactionService.raiseDispute(
  transactionId,
  "Items damaged in transit",
  "farmer",
  "photo_evidence_url"
);

// Later - Support team refunds
await transactionService.refundTransaction(
  transactionId,
  "Approved - items were damaged"
);
```

---

## 📊 API Reference

### TransactionService

| Method                                             | What It Does            | Returns               |
| -------------------------------------------------- | ----------------------- | --------------------- |
| `initiateTransaction(request)`                     | Complete payment flow   | `TransactionResult`   |
| `getTransactionStatus(txnId)`                      | Get transaction details | `TransactionStatus`   |
| `confirmDeliveryAndReleaseEscrow(txnId, proof)`    | Release payment         | `TransactionResult`   |
| `refundTransaction(txnId, reason)`                 | Refund payment          | `TransactionResult`   |
| `raiseDispute(txnId, reason, initiator, evidence)` | Start dispute           | `TransactionResult`   |
| `getUserTransactions(userId, type)`                | Get user's transactions | `TransactionStatus[]` |

### EscrowService

| Method                                                                            | What It Does           | Returns           |
| --------------------------------------------------------------------------------- | ---------------------- | ----------------- |
| `createEscrow(txnId, orderId, farmerId, transporterId, amount, method, metadata)` | Create escrow          | `EscrowPayment`   |
| `getEscrow(escrowId)`                                                             | Get escrow details     | `EscrowPayment`   |
| `releaseEscrow(escrowId)`                                                         | Release to transporter | `EscrowRelease`   |
| `refundEscrow(escrowId, reason)`                                                  | Refund to farmer       | `EscrowRefund`    |
| `disputeEscrow(escrowId, reason, initiator, evidence)`                            | Mark as disputed       | `EscrowPayment`   |
| `getFarmerEscrows(farmerId)`                                                      | Get farmer's escrows   | `EscrowPayment[]` |
| `getFarmerEscrowStats(farmerId)`                                                  | Get statistics         | `EscrowStats`     |

### ReceiptService

| Method                                                        | What It Does          | Returns            |
| ------------------------------------------------------------- | --------------------- | ------------------ |
| `generateReceipt(...)`                                        | Create receipt        | `DigitalReceipt`   |
| `getReceipt(receiptId)`                                       | Get receipt data      | `DigitalReceipt`   |
| `generateReceiptHTML(receiptId)`                              | Get HTML version      | `string` (HTML)    |
| `emailReceipt(receiptId, email)`                              | Email receipt         | `ReceiptEmail`     |
| `updateReceiptStatus(receiptId, paymentStatus, escrowStatus)` | Update status         | `DigitalReceipt`   |
| `getFarmerReceipts(farmerId)`                                 | Get farmer's receipts | `DigitalReceipt[]` |
| `getReceiptStats(userId, type)`                               | Get statistics        | `ReceiptStats`     |

---

## 🔄 State Diagrams

### Escrow States

```
CREATE → HELD (payment locked)
         ├→ RELEASE → RELEASED (to transporter) → COMPLETED
         ├→ REFUND  → REFUNDED (to farmer)
         └→ DISPUTE → DISPUTED (under review)
                      ├→ RELEASE → RELEASED
                      └→ REFUND  → REFUNDED
```

### Transaction States

```
PAYMENT_PROCESSING
       ↓
ESCROW_HELD (payment in escrow, awaiting delivery)
       ├→ COMPLETED (on delivery)
       ├→ REFUNDED (on failure)
       └→ DISPUTED (on conflict)
              ├→ COMPLETED
              └→ REFUNDED
```

---

## 📱 Payment Methods

| Method            | Valid Prefixes | Example         |
| ----------------- | -------------- | --------------- |
| **MTN MoMo**      | 078, 079       | +250788123456   |
| **Airtel Money**  | 072, 073, 075  | +250720123456   |
| **Card**          | Any            | Via Flutterwave |
| **Bank Transfer** | N/A            | Manual process  |

### Auto-Detection

```typescript
import { detectPaymentProvider } from "@/services/flutterwaveService";

const provider = detectPaymentProvider("+250788123456");
// Returns: 'momo' or 'airtel'
```

---

## 💰 Cost Calculation

```typescript
// Items
const items = [
  { description: "Service", quantity: 1, unitPrice: 100000, total: 100000 },
];
const subtotal = items.reduce((sum, item) => sum + item.total, 0);
// subtotal = 100000

// Add platform fee
const platformFee = 10000;

// Calculate tax (18% VAT standard in Rwanda)
const tax = Math.round((subtotal + platformFee) * 0.18);
// tax = 19800

// Total
const total = subtotal + platformFee + tax;
// total = 129800
```

---

## 📧 Receipt Examples

### Receipt JSON Structure

```json
{
  "receiptId": "RCP_12345",
  "receiptNumber": "RCP-2024-ABC12-345678",
  "farmer": { "name": "John", "phone": "+250...", "email": "..." },
  "transporter": { "name": "Safe", "phone": "+250...", "email": "..." },
  "cargo": { "description": "Potatoes", "quantity": 100, "unit": "bags" },
  "items": [
    {
      "description": "Transport",
      "quantity": 1,
      "unitPrice": 50000,
      "total": 50000
    }
  ],
  "subtotal": 50000,
  "platformFee": 5000,
  "tax": 9000,
  "totalAmount": 64000,
  "paymentStatus": "pending",
  "escrowStatus": "held"
}
```

### HTML Generation

```typescript
const receipt = await receiptService.getReceipt(receiptId);
const html = await receiptService.generateReceiptHTML(receiptId);

// Send in email
await receiptService.emailReceipt(receiptId, "email@example.com");

// Print or download in browser
window.print(); // Uses CSS media query
```

---

## 🧪 Testing Quick Examples

```typescript
// Test complete flow
describe("Payment", () => {
  test("full transaction", async () => {
    const result = await transactionService.initiateTransaction({
      orderId: "TEST_001",
      farmerId: "test_farmer",
      farmerName: "Test",
      farmerPhone: "+250788123456",
      farmerEmail: "test@farm.com",
      transporterId: "test_trans",
      transporterName: "Test",
      transporterPhone: "+250788654321",
      transporterEmail: "test@trans.com",
      cargoDescription: "Test",
      cargoQuantity: 10,
      cargoUnit: "units",
      pickupLocation: "A",
      dropoffLocation: "B",
      pickupTime: new Date().toISOString(),
      estimatedDeliveryTime: new Date(
        Date.now() + 4 * 60 * 60 * 1000
      ).toISOString(),
      paymentMethod: "momo",
      phoneNumber: "+250788123456",
      email: "test@farm.com",
      items: [
        { description: "Test", quantity: 1, unitPrice: 10000, total: 10000 },
      ],
      platformFee: 1000,
    });

    expect(result.success).toBe(true);
    expect(result.escrowId).toBeDefined();
    expect(result.receiptId).toBeDefined();
  });
});
```

---

## ⚠️ Common Mistakes

```typescript
// ❌ WRONG: Phone without +250 prefix
phoneNumber: "0788123456";

// ✅ RIGHT: Proper format
phoneNumber: "+250788123456";

// ❌ WRONG: Invalid operator
phoneNumber: "+250708123456"; // 070 doesn't exist

// ✅ RIGHT: Valid operator
phoneNumber: "+250788123456"; // 078 = MTN

// ❌ WRONG: Negative amount
amount: -50000;

// ✅ RIGHT: Positive amount
amount: 50000;

// ❌ WRONG: Missing required fields
const result = await transactionService.initiateTransaction({
  orderId: "ORD_001",
  // Missing farmerId, transporterId, etc.
});

// ✅ RIGHT: All fields provided
const result = await transactionService.initiateTransaction({
  orderId: "ORD_001",
  farmerId: "farmer_123",
  farmerName: "John",
  farmerPhone: "+250788123456",
  // ... all other fields
});
```

---

## 🐛 Debugging Tips

```typescript
// Log transaction details
const status = await transactionService.getTransactionStatus(txnId);
console.log("Transaction:", {
  status: status.status,
  events: status.events,
  escrowId: status.escrowId,
  receiptId: status.receiptId,
});

// Check escrow status
const escrow = await escrowService.getEscrow(escrowId);
console.log("Escrow:", {
  status: escrow.status,
  amount: escrow.amount,
  createdAt: escrow.createdAt,
});

// Verify receipt
const receipt = await receiptService.getReceipt(receiptId);
console.log("Receipt:", {
  receiptNumber: receipt.receiptNumber,
  totalAmount: receipt.totalAmount,
  paymentStatus: receipt.paymentStatus,
});

// Check farmer stats
const stats = await escrowService.getFarmerEscrowStats(farmerId);
console.log("Farmer Stats:", stats);
// { totalEscrows, amountHeld, amountReleased, etc }
```

---

## 📊 Sample Dashboard Data

```typescript
// Get farmer's activity
const farmer = "farmer_123";
const receipts = await receiptService.getFarmerReceipts(farmer);
const escrows = await escrowService.getFarmerEscrows(farmer);
const stats = await receiptService.getReceiptStats(farmer, "farmer");

// Dashboard shows
Dashboard = {
  totalOrders: stats.totalReceipts,
  totalSpent: stats.totalAmount,
  completedDeliveries: stats.completedDeliveries,
  pendingPayments: stats.pendingPayments,
  recentOrders: receipts.slice(0, 5),
  escrowBalance: escrows
    .filter((e) => e.status === "held")
    .reduce((sum, e) => sum + e.amount, 0),
};
```

---

## 🔐 Security Checklist

- [ ] Never log phone numbers
- [ ] Validate all inputs
- [ ] Use HTTPS in production
- [ ] Encrypt AsyncStorage (production)
- [ ] Implement rate limiting
- [ ] Validate payment amounts
- [ ] Check order ownership
- [ ] Verify farmer/transporter match
- [ ] Log all transactions
- [ ] Monitor for suspicious activity

---

## 🎯 Integration Checklist

- [ ] Copy `transactionService.ts` to `src/services/`
- [ ] Copy `escrowService.ts` to `src/services/`
- [ ] Copy `receiptService.ts` to `src/services/`
- [ ] Create `PaymentScreen.tsx`
- [ ] Create `DeliveryConfirmationScreen.tsx`
- [ ] Add to navigation
- [ ] Import all services
- [ ] Test payment flow
- [ ] Test delivery confirmation
- [ ] Test dispute handling
- [ ] Test refunds
- [ ] Check receipts
- [ ] Verify escrow states
- [ ] Test error handling
- [ ] Go live!

---

## 📞 Help Commands

```typescript
// Check if services are loaded
import { transactionService, escrowService, receiptService } from "@/services";
console.log("✅ Services loaded:", {
  transactionService: !!transactionService,
  escrowService: !!escrowService,
  receiptService: !!receiptService,
});

// List all farmer transactions
const farmerId = "farmer_123";
const transactions = await transactionService.getUserTransactions(
  farmerId,
  "farmer"
);
console.log(`${transactions.length} transactions for ${farmerId}`);

// Export receipt as JSON
const receipt = await receiptService.getReceipt(receiptId);
console.log(JSON.stringify(receipt, null, 2));

// Get receipt as HTML
const html = await receiptService.generateReceiptHTML(receiptId);
// Open in browser or send via email
```

---

## 📚 Documentation Files

```
Quick questions?
├─ This file (PAYMENT_QUICK_REFERENCE.md) - 5 min read
├─ PAYMENT_ESCROW_SYSTEM.md - 15 min read (detailed)
├─ PAYMENT_ESCROW_INTEGRATION_GUIDE.md - 10 min read (how to integrate)
├─ PAYMENT_TESTING_IMPLEMENTATION.md - 10 min read (testing)
└─ PAYMENT_IMPLEMENTATION_SUMMARY.md - 10 min read (overview)
```

---

## 🚀 Common Tasks

### Task: Check if payment is complete

```typescript
const status = await transactionService.getTransactionStatus(txnId);
if (status.status === "completed") {
  // Payment complete and delivered
}
```

### Task: Get payment amount

```typescript
const status = await transactionService.getTransactionStatus(txnId);
console.log("Amount:", status.amount); // In RWF
```

### Task: Send receipt to email

```typescript
const receipt = await receiptService.getReceipt(receiptId);
await receiptService.emailReceipt(receiptId, "user@example.com");
```

### Task: Check if payment is in escrow

```typescript
const escrow = await escrowService.getEscrow(escrowId);
if (escrow.status === "held") {
  // Payment is in escrow
}
```

### Task: Get farmer's total earnings

```typescript
const escrows = await escrowService.getTransporterEscrows(transporterId);
const released = escrows
  .filter((e) => e.status === "released")
  .reduce((sum, e) => sum + e.amount, 0);
console.log("Total earnings:", released);
```

### Task: List pending disputes

```typescript
const escrows = await escrowService.getFarmerEscrows(farmerId);
const disputed = escrows.filter((e) => e.status === "disputed");
console.log("Pending disputes:", disputed);
```

---

## 🎓 Learning Path

1. **Day 1:** Read PAYMENT_QUICK_REFERENCE.md (this file)
2. **Day 2:** Read PAYMENT_ESCROW_SYSTEM.md for full details
3. **Day 3:** Follow PAYMENT_ESCROW_INTEGRATION_GUIDE.md
4. **Day 4:** Implement PaymentScreen.tsx
5. **Day 5:** Implement DeliveryConfirmationScreen.tsx
6. **Day 6:** Run tests from PAYMENT_TESTING_IMPLEMENTATION.md
7. **Day 7:** Deploy and monitor!

---

## ⚡ Performance Tips

```typescript
// ✅ DO: Batch operations
const receipts = await receiptService.getFarmerReceipts(farmerId);
// Gets all at once

// ❌ DON'T: Loop individual calls
for (const id of receiptIds) {
  const receipt = await receiptService.getReceipt(id);
  // Inefficient - do in batch instead
}

// ✅ DO: Cache results if not changing
const stats = await receiptService.getReceiptStats(userId, type);
// Cache for 5 minutes

// ❌ DON'T: Fetch on every render
componentDidMount = () => {
  this.interval = setInterval(async () => {
    const stats = await receiptService.getReceiptStats(userId, type);
    // This fetches every second!
  }, 1000);
};
```

---

## 🎉 You're Ready!

You have everything you need to:

- ✅ Process payments with escrow
- ✅ Handle mobile money (MoMo/Airtel)
- ✅ Generate professional receipts
- ✅ Manage disputes
- ✅ Track transactions
- ✅ Analyze statistics

**Go build something amazing!** 🚀

---

**Last Updated:** 2024  
**Version:** 1.0  
**Status:** Production Ready ✅
