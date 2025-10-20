# 🎨 Visual Feature Guide

## Quick Visual Reference for Mobile Money, Offline & SMS Features

---

## 💰 Mobile Money Payment Modal

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                    📱                                     ║
║                                                           ║
║           Mobile Money Payment                            ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │                                                   │    ║
║  │           Amount to Pay                          │    ║
║  │           50,000 RWF                             │    ║
║  │                                                   │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  Mobile Money Number                                      ║
║  ┌──────┬──────────────────────────────────────┐        ║
║  │ +250 │ 078 812 3456                         │        ║
║  └──────┴──────────────────────────────────────┘        ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │ ℹ️  You'll receive a prompt on your phone to    │    ║
║  │    confirm the payment                           │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  Supported providers:                                     ║
║  ┌──────────┐  ┌──────────┐                             ║
║  │ MTN MoMo │  │  Airtel  │                             ║
║  └──────────┘  └──────────┘                             ║
║                                                           ║
║  ┌──────────┐              ┌──────────┐                 ║
║  │  Cancel  │              │ Pay Now  │                 ║
║  └──────────┘              └──────────┘                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### Processing State

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                    ⏳                                     ║
║                                                           ║
║              Processing payment...                        ║
║                                                           ║
║     Please check your phone for the payment prompt       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### Success State

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                    ✅                                     ║
║                                                           ║
║              Payment Successful!                          ║
║                                                           ║
║         Your order has been confirmed                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📵 Offline Banner States

### Offline (Red)

```
╔═══════════════════════════════════════════════════════════╗
║ 📵 You are offline. Changes will sync when connected.    ║
╚═══════════════════════════════════════════════════════════╝
```

### Pending Sync (Yellow)

```
╔═══════════════════════════════════════════════════════════╗
║ 🔄 3 requests pending sync              [ Sync Now ]     ║
╚═══════════════════════════════════════════════════════════╝
```

### Syncing (Yellow)

```
╔═══════════════════════════════════════════════════════════╗
║ 🔄 Syncing... (2/3)                                       ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📱 Place Order Screen (Online)

```
╔═══════════════════════════════════════════════════════════╗
║  ← Back                                                   ║
║  Place Order                                              ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │                                                   │    ║
║  │                  Maize                           │    ║
║  │          Available: 500 kg                       │    ║
║  │          5,000 RWF/kg                            │    ║
║  │                                                   │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  Quantity *                                               ║
║  ┌──────┐  ┌────┬────┬──────┐                           ║
║  │ 100  │  │ kg │tons│ bags │                           ║
║  └──────┘  └────┴────┴──────┘                           ║
║                                                           ║
║  Delivery Address *                                       ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │ Kigali, Gasabo District                          │    ║
║  │                                                   │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │ Pickup Location:                                 │    ║
║  │ Musanze, Northern Province                       │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │ Total Amount:                                    │    ║
║  │ 500,000 RWF                                      │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │         💳  Proceed to Payment                   │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📵 Place Order Screen (Offline)

```
╔═══════════════════════════════════════════════════════════╗
║  ← Back                                                   ║
║  Place Order                                              ║
╠═══════════════════════════════════════════════════════════╣
║ 📵 You are offline. Orders will be saved and synced...   ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │                  Maize                           │    ║
║  │          Available: 500 kg                       │    ║
║  │          5,000 RWF/kg                            │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  Quantity *                                               ║
║  ┌──────┐  ┌────┬────┬──────┐                           ║
║  │ 100  │  │ kg │tons│ bags │                           ║
║  └──────┘  └────┴────┴──────┘                           ║
║                                                           ║
║  Delivery Address *                                       ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │ Kigali, Gasabo District                          │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │ Total Amount:                                    │    ║
║  │ 500,000 RWF                                      │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │         💾  Save Order (Offline)                 │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📨 SMS Notifications

### Order Created

```
┌─────────────────────────────────────────────────────┐
│ From: AgriLogistics                                 │
│ To: +250788123456                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Order #ORD123 created successfully!                │
│ 100kg of Maize for 50,000 RWF.                     │
│ We'll notify you when a transporter is assigned.   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Transporter Assigned

```
┌─────────────────────────────────────────────────────┐
│ From: AgriLogistics                                 │
│ To: +250788123456                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Transporter assigned to Order #ORD123!             │
│ John Doe (+250788999888) will deliver using Truck. │
│ Track your order in the app.                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Delivery Completed

```
┌─────────────────────────────────────────────────────┐
│ From: AgriLogistics                                 │
│ To: +250788123456                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Order #ORD123 delivered successfully at 2:30 PM!   │
│ Thank you for using Agri-Logistics Platform.       │
│ Rate your experience in the app.                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Payment Received

```
┌─────────────────────────────────────────────────────┐
│ From: AgriLogistics                                 │
│ To: +250788123456                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Payment received! 50,000 RWF for Order #ORD123.    │
│ Transaction ID: MOMO123456789.                     │
│ Check your mobile money account.                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    BUYER JOURNEY                            │
└─────────────────────────────────────────────────────────────┘

Step 1: Browse Crops
┌─────────────────────────────────────────────────────┐
│  🌾 Available Crops                                 │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │ Maize                          5,000 RWF  │    │
│  │ 500 kg available                          │    │
│  │                        [ Place Order → ]  │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │ Rice                           8,000 RWF  │    │
│  │ 300 kg available                          │    │
│  │                        [ Place Order → ]  │    │
│  └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                        ↓
Step 2: Fill Order Details
┌─────────────────────────────────────────────────────┐
│  Place Order                                        │
│                                                     │
│  Quantity: [ 100 ] kg                              │
│  Delivery: [ Kigali, Gasabo ]                      │
│  Total: 500,000 RWF                                │
│                                                     │
│  [ Proceed to Payment ]                            │
└─────────────────────────────────────────────────────┘
                        ↓
Step 3: Pay with Mobile Money
┌─────────────────────────────────────────────────────┐
│  Mobile Money Payment                               │
│                                                     │
│  Amount: 500,000 RWF                               │
│  Phone: [ +250 ] [ 078 812 3456 ]                 │
│                                                     │
│  [ Cancel ]              [ Pay Now ]               │
└─────────────────────────────────────────────────────┘
                        ↓
Step 4: Confirm on Phone
┌─────────────────────────────────────────────────────┐
│  📱 MTN Mobile Money                                │
│                                                     │
│  Confirm payment of 500,000 RWF                    │
│  to AgriLogistics?                                 │
│                                                     │
│  [ 1. Confirm ]  [ 2. Cancel ]                     │
└─────────────────────────────────────────────────────┘
                        ↓
Step 5: Success!
┌─────────────────────────────────────────────────────┐
│              ✅                                      │
│                                                     │
│         Payment Successful!                         │
│                                                     │
│    Your order has been confirmed                   │
│                                                     │
└─────────────────────────────────────────────────────┘
                        ↓
Step 6: Receive SMS
┌─────────────────────────────────────────────────────┐
│  📱 New Message                                     │
│                                                     │
│  From: AgriLogistics                               │
│  Order #ORD123 created successfully!               │
│  100kg of Maize for 500,000 RWF...                │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Feature Comparison

```
┌─────────────────────────────────────────────────────────────┐
│              BEFORE vs AFTER FEATURES                       │
└─────────────────────────────────────────────────────────────┘

BEFORE                          AFTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Bank account required        ✅ Mobile money payments
❌ Must be online               ✅ Works offline
❌ No notifications             ✅ SMS notifications
❌ Lost orders when offline     ✅ Auto-sync when connected
❌ No payment tracking          ✅ Transaction IDs
❌ Manual status checks         ✅ Automatic SMS updates
❌ High data usage              ✅ Low data usage
❌ Urban-focused                ✅ Rural-friendly

┌─────────────────────────────────────────────────────────────┐
│                    FEATURE MATRIX                           │
└─────────────────────────────────────────────────────────────┘

Feature              │ Online │ Offline │ SMS  │ MoMo
─────────────────────┼────────┼─────────┼──────┼──────
Browse Crops         │   ✅   │   ✅    │  -   │  -
Place Order          │   ✅   │   ✅    │  ✅  │  ✅
Make Payment         │   ✅   │   ❌    │  -   │  ✅
Track Order          │   ✅   │   ✅    │  ✅  │  -
Receive Updates      │   ✅   │   -     │  ✅  │  -
Sync Data            │   ✅   │   ✅    │  -   │  -
```

---

## 📊 Network State Indicators

```
┌─────────────────────────────────────────────────────────────┐
│                  NETWORK STATE VISUAL                       │
└─────────────────────────────────────────────────────────────┘

ONLINE (Green)
┌─────────────────────────────────────────────────────┐
│ ✅ Connected                                         │
│ All features available                              │
└─────────────────────────────────────────────────────┘

OFFLINE (Red)
┌─────────────────────────────────────────────────────┐
│ 📵 You are offline                                   │
│ Changes will sync when connected                    │
└─────────────────────────────────────────────────────┘

SYNCING (Yellow)
┌─────────────────────────────────────────────────────┐
│ 🔄 Syncing... (2/3)                                  │
│ Please wait                                         │
└─────────────────────────────────────────────────────┘

PENDING SYNC (Yellow)
┌─────────────────────────────────────────────────────┐
│ 🟡 3 requests pending sync        [ Sync Now ]      │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Color Coding

```
┌─────────────────────────────────────────────────────────────┐
│                      COLOR GUIDE                            │
└─────────────────────────────────────────────────────────────┘

🟢 GREEN    - Online, Success, Completed
🔴 RED      - Offline, Error, Failed
🟡 YELLOW   - Pending, Warning, Syncing
🔵 BLUE     - Info, Processing
⚪ GRAY     - Disabled, Inactive

EXAMPLES:

✅ Payment Successful        (Green)
❌ Payment Failed            (Red)
⏳ Processing Payment        (Blue)
🟡 Pending Sync              (Yellow)
📵 Offline Mode              (Red)
🔄 Syncing...                (Yellow)
```

---

## 📱 Mobile Phone Screens

### Payment Prompt (MTN)

```
┌─────────────────────────────┐
│  MTN Mobile Money           │
├─────────────────────────────┤
│                             │
│  Confirm payment of         │
│  500,000 RWF                │
│                             │
│  To: AgriLogistics          │
│  From: 078 812 3456         │
│                             │
│  Reference: ORD123          │
│                             │
│  1. Confirm                 │
│  2. Cancel                  │
│                             │
└─────────────────────────────┘
```

### SMS Notification

```
┌─────────────────────────────┐
│  Messages                   │
├─────────────────────────────┤
│                             │
│  AgriLogistics              │
│  2:30 PM                    │
│                             │
│  Order #ORD123 created      │
│  successfully! 100kg of     │
│  Maize for 500,000 RWF.     │
│  We'll notify you when a    │
│  transporter is assigned.   │
│                             │
└─────────────────────────────┘
```

---

## 🎯 Quick Reference Icons

```
💰 Mobile Money Payment
📵 Offline Mode
📨 SMS Notification
✅ Success
❌ Error
⏳ Processing
🔄 Syncing
🟡 Pending
📱 Phone
🌾 Crop
🚚 Transporter
📦 Delivery
💳 Payment
📍 Location
⭐ Rating
```

---

## 📈 Progress Indicators

### Payment Processing

```
Step 1: Initiating...    ████████░░░░░░░░░░░░  40%
Step 2: Confirming...    ████████████████░░░░  80%
Step 3: Complete!        ████████████████████ 100%
```

### Offline Sync

```
Syncing Orders...        ████████░░░░░░░░░░░░  2/5
```

### SMS Delivery

```
Sending SMS...           ████████████████████ Sent ✅
```

---

**Use this guide for quick visual reference! 🎨**
