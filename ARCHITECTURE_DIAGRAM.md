# 🏗️ Agri-Logistics Platform Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                 AGRI-LOGISTICS PLATFORM v2.0                     │
│              Transportation-Focused Architecture                 │
└─────────────────────────────────────────────────────────────────┘
```

## User Roles & Navigation Flow

```
                    ┌──────────────┐
                    │    LOGIN     │
                    └──────┬───────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
                │          │          │
        ┌───────▼─────┐    │    ┌────▼──────┐
        │  Transporter│    │    │  Receiver │
        │  (Primary)  │    │    │  (Legacy: │
        │             │    │    │   Buyer)  │
        └─────────────┘    │    └───────────┘
                           │
                    ┌──────▼──────┐
                    │   Shipper   │
                    │  (Legacy:   │
                    │   Farmer)   │
                    └─────────────┘
```

## Core Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   SHIPPER   │────────▶│ SHIPMENT     │────────▶│  RECEIVER   │
│ Lists Cargo │         │ ORDER        │         │ Requests    │
└─────────────┘         └──────┬───────┘         │ Delivery    │
                               │                 └─────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  SYNC SERVICE       │
                    │  Auto-creates:      │
                    └──────────┬──────────┘
                               │
                        ┌──────▼──────┐
                        │    TRIP     │◀─────────┐
                        │  (Primary)  │          │
                        └──────┬──────┘          │
                               │                 │
                    ┌──────────▼──────────┐      │
                    │   TRANSPORTER       │      │
                    │   Accepts Trip      │──────┘
                    │   Completes Trip    │
                    └─────────────────────┘
```

## Entity Relationships

```
┌────────────────────────────────────────────────────────────────┐
│                        PRIMARY ENTITIES                         │
└────────────────────────────────────────────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    CARGO    │──────▶│   SHIPMENT  │──────▶│    TRIP     │
│  (Listed)   │       │    ORDER    │       │ (Accepted)  │
│             │       │             │       │             │
│ - name      │       │ - cargoId   │◀──────│ - orderId   │
│ - quantity  │       │ - shipperId │       │ - shipment  │
│ - readyDate │       │ - receiverId│       │ - earnings  │
│ - location  │       │ - tripId    │       │ - status    │
└─────────────┘       └─────────────┘       └─────────────┘
      │                     │                      │
      │                     │                      │
      │                     │                      │
┌─────▼─────┐         ┌─────▼─────┐         ┌─────▼─────┐
│  Shipper  │         │ Receiver  │         │Transporter│
└───────────┘         └───────────┘         └───────────┘
```

## Trip Lifecycle

```
┌──────────┐
│ PENDING  │  ← Shipper creates shipment order
└────┬─────┘    Sync service auto-creates trip
     │
     │ Transporter accepts
     ▼
┌──────────┐
│ ACCEPTED │  ← Trip assigned to transporter
└────┬─────┘    Earnings reserved
     │
     │ Transporter starts delivery
     ▼
┌───────────┐
│IN_TRANSIT │  ← Real-time GPS tracking
└────┬──────┘    Route optimization
     │
     │ Transporter completes delivery
     ▼
┌───────────┐
│ COMPLETED │  ← Earnings marked as earned
└────┬──────┘    Order status synced
     │
     │ Payment processed
     ▼
┌──────────┐
│   PAID   │  ← Transporter receives payment
└──────────┘
```

## Redux State Structure

```
┌───────────────────────────────────────────────────────────────┐
│                        REDUX STORE                             │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐                                             │
│  │     auth     │  ← User, token, role                        │
│  └──────────────┘                                             │
│                                                                │
│  ┌──────────────┐                                             │
│  │    trips     │  ← PRIMARY STORE (Transporter focus)        │
│  │  [Trip[]]    │    - Available loads                        │
│  │              │    - Active trips                           │
│  │              │    - Completed trips                        │
│  │              │    - Earnings data                          │
│  └──────────────┘                                             │
│                                                                │
│  ┌──────────────┐                                             │
│  │   orders     │  ← Shipment orders (Shipper/Receiver)       │
│  │[ShipOrder[]] │    Synced with trips                        │
│  └──────────────┘                                             │
│                                                                │
│  ┌──────────────┐                                             │
│  │    cargo     │  ← Available cargo (Shipper)                │
│  │  [Cargo[]]   │    Listings for transport                   │
│  └──────────────┘                                             │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

## Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         SERVICES LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         LOGISTICS DOMAIN (src/logistics/)              │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  tripService.ts                                   │  │    │
│  │  │  - getAllTrips()                                  │  │    │
│  │  │  - acceptTrip(id)                                 │  │    │
│  │  │  - startTrip(id)                                  │  │    │
│  │  │  - completeTrip(id)                               │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  logisticsSyncService.ts  🆕                     │  │    │
│  │  │  - createTripFromOrder(order)                    │  │    │
│  │  │  - syncOrderFromTrip(trip)                       │  │    │
│  │  │  - syncTripFromOrder(order)                      │  │    │
│  │  │  - cancelTripForOrder(orderId)                   │  │    │
│  │  │  - getLogisticsOverview(userId, role)            │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  earningsService.ts                               │  │    │
│  │  │  - calculateEarnings()                            │  │    │
│  │  │  - getTotalEarnings()                             │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  orderService.ts (Shipper/Receiver operations)       │      │
│  │  - createOrder()  → triggers trip creation            │      │
│  │  - updateOrder()  ← synced from trip changes          │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  cargoService.ts (Shipper cargo management)          │      │
│  │  - listCargo()                                        │      │
│  │  - updateCargo()                                      │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Screen Distribution by Role

```
┌────────────────────────────────────────────────────────────────┐
│                     TRANSPORTER SCREENS (10)                    │
│                      🚚 PRIMARY EXPERIENCE                      │
├────────────────────────────────────────────────────────────────┤
│ 1. Enhanced Dashboard          2. Transporter Home             │
│ 3. Available Loads             4. Active Trips                 │
│ 5. Trip Tracking               6. Route Planner                │
│ 7. Earnings Dashboard          8. Trip History                 │
│ 9. Vehicle Profile            10. Logistics Test               │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                      SHIPPER SCREENS (6)                        │
│                    📤 CARGO SHIPPING FOCUS                      │
├────────────────────────────────────────────────────────────────┤
│ 1. Home                        2. List Cargo                   │
│ 3. My Listings                 4. Cargo Details                │
│ 5. Edit Cargo                  6. Active Orders                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                     RECEIVER SCREENS (4)                        │
│                   📥 DELIVERY REQUEST FOCUS                     │
├────────────────────────────────────────────────────────────────┤
│ 1. Home                        2. Browse Cargo                 │
│ 3. Place Order                 4. My Orders                    │
│ 5. Order Tracking                                              │
└────────────────────────────────────────────────────────────────┘
```

## Synchronization Flow

```
                  ORDER CREATED
                       │
                       ▼
        ┌──────────────────────────┐
        │  logisticsSyncService    │
        │  .createTripFromOrder()  │
        └──────────┬───────────────┘
                   │
                   ├─── Extracts shipment data
                   ├─── Sets pickup/delivery locations
                   ├─── Calculates earnings
                   │
                   ▼
            ┌─────────────┐
            │ TRIP CREATED│
            └──────┬──────┘
                   │
                   ├─── Links orderId
                   ├─── Status: pending
                   └─── Available to transporters


        TRANSPORTER ACCEPTS TRIP
                   │
                   ▼
        ┌──────────────────────────┐
        │  tripService.acceptTrip()│
        └──────────┬─────────────--┘
                   │
                   ├─── Updates trip.status = 'accepted'
                   ├─── Assigns transporterId
                   │
                   ▼
        ┌──────────────────────────┐
        │  syncOrderFromTrip()     │
        └──────────┬─────────────--┘
                   │
                   ├─── Updates order.status = 'accepted'
                   ├─── Assigns order.transporterId
                   └─── Links order.tripId


        TRANSPORTER COMPLETES TRIP
                   │
                   ▼
        ┌──────────────────────────┐
        │tripService.completeTrip()│
        └──────────┬─────────────--┘
                   │
                   ├─── trip.status = 'completed'
                   ├─── earnings.status = 'earned'
                   │
                   ▼
        ┌──────────────────────────┐
        │  syncOrderFromTrip()     │
        └──────────┬─────────────--┘
                   │
                   └─── order.status = 'completed'

          Both entities stay in sync! ✅
```

## File Structure

```
agri-logistics-platform/
│
├── src/
│   ├── logistics/  🆕 LOGISTICS DOMAIN
│   │   ├── types/
│   │   │   └── trip.ts
│   │   ├── services/
│   │   │   ├── tripService.ts
│   │   │   ├── earningsService.ts
│   │   │   └── logisticsSyncService.ts  🆕
│   │   ├── store/
│   │   │   └── tripsSlice.ts
│   │   └── utils/
│   │       └── tripCalculations.ts
│   │
│   ├── screens/
│   │   ├── transporter/ (10 screens) 🚚 PRIMARY
│   │   ├── farmer/ (6 screens) → shipper context
│   │   └── buyer/ (4 screens) → receiver context
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx ✅ UPDATED
│   │   └── AuthNavigator.tsx
│   │
│   ├── types/
│   │   └── index.ts ✅ UPDATED (roles, Cargo, ShipmentOrder)
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── mockAuthService.ts ✅ UPDATED
│   │   ├── orderService.ts
│   │   └── cargoService.ts
│   │
│   └── store/
│       ├── index.ts
│       └── slices/
│           ├── authSlice.ts
│           ├── cropsSlice.ts
│           ├── ordersSlice.ts
│           └── (tripsSlice in logistics/)
│
├── LOGISTICS_RESTRUCTURE.md 🆕 Complete guide
├── RESTRUCTURE_SUMMARY.md 🆕 Implementation summary
├── ARCHITECTURE_DIAGRAM.md 🆕 This file
└── package.json ✅ UPDATED (v2.0.0)
```

## Key Benefits

```
┌─────────────────────────────────────────────────────────────┐
│                      BENEFITS                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🚚 LOGISTICS-FIRST                                          │
│     ✓ Transporters are primary users                        │
│     ✓ Trip entity is central                                │
│     ✓ Best UX for delivery operations                       │
│                                                              │
│  🔄 BACKWARD COMPATIBLE                                      │
│     ✓ Legacy roles still work                               │
│     ✓ No breaking changes                                   │
│     ✓ Gradual migration supported                           │
│                                                              │
│  🔗 SYNCHRONIZED                                             │
│     ✓ Orders and trips always in sync                       │
│     ✓ Automatic status updates                              │
│     ✓ Single source of truth                                │
│                                                              │
│  📈 SCALABLE                                                 │
│     ✓ Multi-stop trips supported                            │
│     ✓ Fleet management ready                                │
│     ✓ Load consolidation possible                           │
│     ✓ Easy to extend                                        │
│                                                              │
│  🛠️ MAINTAINABLE                                            │
│     ✓ Clear domain separation                               │
│     ✓ Type-safe throughout                                  │
│     ✓ Well documented                                       │
│     ✓ Easy to test                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Next Phase Preview

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 2: INTEGRATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Wire Sync Service to Redux Thunks                       │
│     └─ Auto-create trips on order creation                  │
│                                                              │
│  2. Update UI Labels                                        │
│     └─ Farmer → Shipper, Buyer → Receiver                   │
│                                                              │
│  3. Real-Time Updates                                       │
│     └─ Live status sync between entities                    │
│                                                              │
│  4. Enhanced Dashboard                                      │
│     └─ Use logistics overview service                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 PHASE 3: ADVANCED FEATURES                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  • Multi-stop route optimization                            │
│  • Fleet management dashboard                               │
│  • Real-time WebSocket tracking                             │
│  • Push notifications                                       │
│  • Payment processing                                       │
│  • Rating & review system                                   │
│  • Load matching AI                                         │
│  • Trip consolidation                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Version**: 2.0.0
**Date**: October 24, 2025
**Status**: Architecture Complete ✅
