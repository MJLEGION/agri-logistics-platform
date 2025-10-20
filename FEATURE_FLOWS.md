# 🔄 Feature Flows Diagram

## Visual Guide to Mobile Money, Offline & SMS Features

---

## 💰 Mobile Money Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE MONEY PAYMENT FLOW                     │
└─────────────────────────────────────────────────────────────────┘

BUYER                    FRONTEND                 BACKEND              MTN/AIRTEL
  │                         │                        │                     │
  │  1. Place Order         │                        │                     │
  ├────────────────────────>│                        │                     │
  │                         │                        │                     │
  │  2. Click "Proceed      │                        │                     │
  │     to Payment"         │                        │                     │
  ├────────────────────────>│                        │                     │
  │                         │                        │                     │
  │  3. Payment Modal Opens │                        │                     │
  │<────────────────────────┤                        │                     │
  │                         │                        │                     │
  │  4. Enter Phone Number  │                        │                     │
  │     (078 812 3456)      │                        │                     │
  ├────────────────────────>│                        │                     │
  │                         │                        │                     │
  │  5. Validate Phone      │                        │                     │
  │<────────────────────────┤                        │                     │
  │     ✅ Valid             │                        │                     │
  │                         │                        │                     │
  │  6. Click "Pay Now"     │                        │                     │
  ├────────────────────────>│                        │                     │
  │                         │                        │                     │
  │  7. Show Processing     │  8. POST /momo/initiate│                     │
  │<────────────────────────┤───────────────────────>│                     │
  │                         │                        │                     │
  │                         │                        │  9. Request Payment │
  │                         │                        ├────────────────────>│
  │                         │                        │                     │
  │                         │                        │ 10. Payment Prompt  │
  │<────────────────────────┴────────────────────────┴─────────────────────┤
  │  "Dial *182*8# to confirm payment of 50,000 RWF"                      │
  │                                                                         │
  │ 11. Confirm on Phone                                                   │
  ├────────────────────────┬────────────────────────┬─────────────────────>│
  │                         │                        │                     │
  │                         │                        │ 12. Payment Success │
  │                         │                        │<────────────────────┤
  │                         │                        │                     │
  │                         │ 13. Return Success     │                     │
  │                         │<───────────────────────┤                     │
  │                         │    + Transaction ID    │                     │
  │                         │                        │                     │
  │ 14. Show Success Screen │                        │                     │
  │<────────────────────────┤                        │                     │
  │     ✅ Payment Successful│                        │                     │
  │                         │                        │                     │
  │                         │ 15. Create Order       │                     │
  │                         │    + Payment Info      │                     │
  │                         ├───────────────────────>│                     │
  │                         │                        │                     │
  │                         │ 16. Send SMS           │                     │
  │<────────────────────────┴────────────────────────┤                     │
  │  "Order #123 created successfully!"              │                     │
  │                         │                        │                     │
  │ 17. Navigate to Home    │                        │                     │
  │<────────────────────────┤                        │                     │
  │                         │                        │                     │
```

---

## 📵 Offline Order Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    OFFLINE ORDER CREATION FLOW                   │
└─────────────────────────────────────────────────────────────────┘

USER                    FRONTEND                 ASYNC STORAGE        BACKEND
  │                         │                          │                 │
  │  1. Lose Connection     │                          │                 │
  │     (Airplane Mode)     │                          │                 │
  ├────────────────────────>│                          │                 │
  │                         │                          │                 │
  │                         │  2. Detect Offline       │                 │
  │                         │     (NetInfo)            │                 │
  │                         │                          │                 │
  │  3. Show Offline Banner │                          │                 │
  │<────────────────────────┤                          │                 │
  │  📵 "You are offline"   │                          │                 │
  │                         │                          │                 │
  │  4. Fill Order Form     │                          │                 │
  ├────────────────────────>│                          │                 │
  │                         │                          │                 │
  │  5. Click "Save Order   │                          │                 │
  │     (Offline)"          │                          │                 │
  ├────────────────────────>│                          │                 │
  │                         │                          │                 │
  │  6. Confirm Dialog      │                          │                 │
  │<────────────────────────┤                          │                 │
  │  "Save offline?"        │                          │                 │
  │                         │                          │                 │
  │  7. Confirm "Yes"       │                          │                 │
  ├────────────────────────>│                          │                 │
  │                         │                          │                 │
  │                         │  8. Save to Queue        │                 │
  │                         ├─────────────────────────>│                 │
  │                         │    @offline_queue        │                 │
  │                         │                          │                 │
  │                         │  9. Save Local Copy      │                 │
  │                         ├─────────────────────────>│                 │
  │                         │    @offline_orders       │                 │
  │                         │                          │                 │
  │ 10. Success Message     │                          │                 │
  │<────────────────────────┤                          │                 │
  │  "Order saved!"         │                          │                 │
  │                         │                          │                 │
  │ 11. Restore Connection  │                          │                 │
  ├────────────────────────>│                          │                 │
  │                         │                          │                 │
  │                         │ 12. Detect Online        │                 │
  │                         │     (NetInfo)            │                 │
  │                         │                          │                 │
  │ 13. Show Sync Banner    │                          │                 │
  │<────────────────────────┤                          │                 │
  │  🟡 "1 request pending" │                          │                 │
  │     [Sync Now]          │                          │                 │
  │                         │                          │                 │
  │ 14. Click "Sync Now"    │                          │                 │
  ├────────────────────────>│                          │                 │
  │                         │                          │                 │
  │                         │ 15. Get Queue            │                 │
  │                         │<─────────────────────────┤                 │
  │                         │                          │                 │
  │                         │ 16. POST /orders         │                 │
  │                         ├─────────────────────────────────────────────>│
  │                         │                          │                 │
  │                         │ 17. Order Created        │                 │
  │                         │<─────────────────────────────────────────────┤
  │                         │                          │                 │
  │                         │ 18. Remove from Queue    │                 │
  │                         ├─────────────────────────>│                 │
  │                         │                          │                 │
  │                         │ 19. Send SMS             │                 │
  │<────────────────────────┴──────────────────────────┴─────────────────┤
  │  "Order #123 created successfully!"                                  │
  │                         │                          │                 │
  │ 20. Hide Banner         │                          │                 │
  │<────────────────────────┤                          │                 │
  │     ✅ Synced            │                          │                 │
  │                         │                          │                 │
```

---

## 📨 SMS Notification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      SMS NOTIFICATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

EVENT                   BACKEND                 SMS SERVICE          USER PHONE
  │                         │                        │                   │
  │  ORDER CREATED          │                        │                   │
  ├────────────────────────>│                        │                   │
  │                         │                        │                   │
  │                         │  1. Get User Phone     │                   │
  │                         │     from Database      │                   │
  │                         │                        │                   │
  │                         │  2. Build SMS Message  │                   │
  │                         │     (Template)         │                   │
  │                         │                        │                   │
  │                         │  3. POST /sms          │                   │
  │                         ├───────────────────────>│                   │
  │                         │                        │                   │
  │                         │                        │  4. Send SMS      │
  │                         │                        ├──────────────────>│
  │                         │                        │                   │
  │                         │                        │  5. SMS Delivered │
  │                         │                        │<──────────────────┤
  │                         │                        │                   │
  │                         │  6. Delivery Report    │                   │
  │                         │<───────────────────────┤                   │
  │                         │                        │                   │
  │                         │  7. Log to Database    │                   │
  │                         │     (sms_logs)         │                   │
  │                         │                        │                   │
  │                         │                        │  8. User Reads    │
  │                         │                        │<──────────────────┤
  │                         │                        │  "Order #123      │
  │                         │                        │   created!"       │
  │                         │                        │                   │

┌─────────────────────────────────────────────────────────────────┐
│                    SMS NOTIFICATION TYPES                        │
└─────────────────────────────────────────────────────────────────┘

1. ORDER CREATED
   Trigger: Buyer places order
   To: Buyer
   Message: "Order #123 created! 100kg Maize for 50,000 RWF..."

2. TRANSPORTER ASSIGNED
   Trigger: Transporter accepts job
   To: Buyer + Farmer
   Message: "Transporter assigned! John Doe (+250788...) will deliver..."

3. DELIVERY COMPLETED
   Trigger: Transporter marks delivered
   To: Buyer + Farmer
   Message: "Order #123 delivered at 2:30 PM! Rate your experience..."

4. PAYMENT RECEIVED
   Trigger: Payment processed
   To: Farmer
   Message: "Payment received! 50,000 RWF. Transaction: MOMO123..."
```

---

## 🔄 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPLETE ORDER JOURNEY WITH ALL FEATURES            │
└─────────────────────────────────────────────────────────────────┘

BUYER                                                           FARMER
  │                                                                │
  │  1. Browse Crops (Online/Offline)                             │
  ├──────────────────────────────────────────────────────────────>│
  │                                                                │
  │  2. Select Crop                                                │
  │     "Maize - 500kg - 5,000 RWF/kg"                            │
  │                                                                │
  │  3. Place Order                                                │
  │     Quantity: 100kg                                            │
  │     Total: 500,000 RWF                                         │
  │                                                                │
  │  ┌─────────────────────────────────────┐                      │
  │  │  ONLINE?                            │                      │
  │  └─────────────────────────────────────┘                      │
  │           │                    │                               │
  │          YES                  NO                               │
  │           │                    │                               │
  │           ▼                    ▼                               │
  │  ┌──────────────┐    ┌──────────────┐                        │
  │  │ PAYMENT      │    │ SAVE OFFLINE │                        │
  │  │ MODAL        │    │ TO QUEUE     │                        │
  │  └──────────────┘    └──────────────┘                        │
  │           │                    │                               │
  │  4. Enter Phone       │  Wait for connection                  │
  │     078 812 3456      │        │                               │
  │           │                    │                               │
  │  5. Confirm MoMo      │  Auto-sync when online                │
  │     on Phone          │        │                               │
  │           │                    │                               │
  │           └────────────────────┘                               │
  │                      │                                         │
  │  6. Payment Success  │                                         │
  │     ✅ Transaction ID │                                         │
  │                      │                                         │
  │  7. Order Created    │                                         │
  │     in Database      │                                         │
  │                      │                                         │
  │  8. SMS Sent         │                          8. SMS Sent   │
  │<─────────────────────┼─────────────────────────────────────────┤
  │  "Order #123         │                          "New order    │
  │   created!"          │                           received!"   │
  │                      │                                         │
  │  9. Transporter Assigned                                      │
  │<─────────────────────┼─────────────────────────────────────────┤
  │  SMS: "John Doe      │                          SMS: "John    │
  │  will deliver..."    │                          will pickup..." │
  │                      │                                         │
  │ 10. Track Delivery   │                                         │
  │     (Real-time)      │                                         │
  │                      │                                         │
  │ 11. Delivery Complete│                                         │
  │<─────────────────────┼─────────────────────────────────────────┤
  │  SMS: "Delivered     │                          SMS: "Payment │
  │  at 2:30 PM!"        │                          received!"    │
  │                      │                                         │
  │ 12. Rate Experience  │                                         │
  │     ⭐⭐⭐⭐⭐          │                                         │
  │                      │                                         │
```

---

## 🔀 Network State Transitions

```
┌─────────────────────────────────────────────────────────────────┐
│                    NETWORK STATE MACHINE                         │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   ONLINE     │
                    │              │
                    │ ✅ Full      │
                    │    Features  │
                    └──────────────┘
                           │
                           │ Connection Lost
                           ▼
                    ┌──────────────┐
                    │   OFFLINE    │
                    │              │
                    │ 💾 Save to   │
                    │    Queue     │
                    └──────────────┘
                           │
                           │ Connection Restored
                           ▼
                    ┌──────────────┐
                    │   SYNCING    │
                    │              │
                    │ 🔄 Upload    │
                    │    Queue     │
                    └──────────────┘
                           │
                           │ Sync Complete
                           ▼
                    ┌──────────────┐
                    │   ONLINE     │
                    │              │
                    │ ✅ All       │
                    │    Synced    │
                    └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      UI STATES BY NETWORK                        │
└─────────────────────────────────────────────────────────────────┘

ONLINE:
  Banner: Hidden
  Button: "Proceed to Payment" 💳
  Features: All available

OFFLINE:
  Banner: 📵 "You are offline..." (Orange)
  Button: "Save Order (Offline)" 💾
  Features: Limited (no payment, save to queue)

SYNCING:
  Banner: 🔄 "Syncing..." (Yellow)
  Button: Disabled
  Features: Limited (wait for sync)

PENDING SYNC:
  Banner: 🟡 "3 requests pending sync [Sync Now]" (Yellow)
  Button: "Proceed to Payment" 💳
  Features: All available + manual sync
```

---

## 💾 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   USER ACTION   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CHECK NETWORK  │
│   (NetInfo)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
  ONLINE   OFFLINE
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ BACKEND │ │ ASYNC STORAGE│
│   API   │ │   (Queue)    │
└────┬────┘ └──────┬───────┘
     │             │
     │             │ Connection Restored
     │             ▼
     │      ┌──────────────┐
     │      │  AUTO SYNC   │
     │      └──────┬───────┘
     │             │
     └─────────────┘
           │
           ▼
    ┌──────────────┐
    │   DATABASE   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  SMS SERVICE │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  USER PHONE  │
    └──────────────┘
```

---

## 🎯 Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER PLACEMENT DECISION TREE                 │
└─────────────────────────────────────────────────────────────────┘

                    START: Place Order
                           │
                           ▼
                    ┌──────────────┐
                    │  Is Online?  │
                    └──────┬───────┘
                           │
                    ┌──────┴──────┐
                   YES            NO
                    │              │
                    ▼              ▼
            ┌──────────────┐  ┌──────────────┐
            │ Show Payment │  │ Show Offline │
            │    Modal     │  │    Dialog    │
            └──────┬───────┘  └──────┬───────┘
                   │                 │
                   ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │ Enter Phone  │  │ Save to Queue│
            └──────┬───────┘  └──────┬───────┘
                   │                 │
                   ▼                 │
            ┌──────────────┐        │
            │ Valid Phone? │        │
            └──────┬───────┘        │
                   │                 │
            ┌──────┴──────┐         │
           YES            NO         │
            │              │         │
            ▼              ▼         │
    ┌──────────────┐  ┌──────────┐ │
    │ Process      │  │ Show     │ │
    │ Payment      │  │ Error    │ │
    └──────┬───────┘  └────┬─────┘ │
           │               │        │
           ▼               │        │
    ┌──────────────┐      │        │
    │ Payment OK?  │      │        │
    └──────┬───────┘      │        │
           │               │        │
    ┌──────┴──────┐       │        │
   YES            NO       │        │
    │              │       │        │
    ▼              ▼       ▼        ▼
┌─────────┐  ┌─────────┐ ┌─────────┐
│ Create  │  │ Show    │ │ Wait for│
│ Order   │  │ Error   │ │ Sync    │
└────┬────┘  └─────────┘ └────┬────┘
     │                         │
     ▼                         ▼
┌─────────┐              ┌─────────┐
│ Send SMS│              │ Auto    │
└────┬────┘              │ Sync    │
     │                   └────┬────┘
     ▼                        │
┌─────────┐                  │
│ Success │◄─────────────────┘
└─────────┘
```

---

**Use these diagrams to understand the complete flow! 🎯**
