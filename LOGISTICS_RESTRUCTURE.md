# 🚚 Agri-Logistics Platform - Complete Restructure Guide

## Overview

This document outlines the complete restructuring of the platform to focus on **agricultural logistics and transportation** operations. The app now centers around Trip management with transporters as the primary user role.

---

## 🎯 Core Philosophy

**Before**: Marketplace-focused (farmers list crops, buyers purchase)
**After**: Logistics-focused (shippers request transport, transporters deliver, receivers track)

### Primary Entity: **Trip**
Everything revolves around transportation trips:
- Transporters accept and complete trips
- Shippers (formerly farmers) create shipment requests
- Receivers (formerly buyers) track deliveries

---

## 👥 Role Changes

### New Logistics Roles

| New Role | Legacy Role | Description |
|----------|-------------|-------------|
| **Transporter** | transporter | Primary role - accepts trips, delivers cargo, earns money |
| **Shipper** | farmer | Creates shipment requests, lists cargo for transport |
| **Receiver** | buyer | Requests cargo delivery, tracks incoming shipments |

### Backward Compatibility

The system automatically maps legacy roles to new roles:
```typescript
'farmer' → 'shipper'
'buyer' → 'receiver'
'transporter' → 'transporter' (unchanged)
```

All existing data and screens continue to work with legacy roles.

---

## 📦 Data Model Changes

### Core Entities

#### 1. **Trip** (Primary Entity)
```typescript
interface Trip {
  _id: string;
  tripId: string;              // TRIP-20250101-001
  orderId?: string;            // Link to shipment order
  transporterId?: string;      // Assigned transporter
  status: TripStatus;          // pending | accepted | in_transit | completed | cancelled

  // What's being transported
  shipment: {
    cropId: string;
    farmerId: string;          // Shipper ID
    quantity: number;
    unit: 'kg' | 'tons' | 'bags';
    cropName: string;
    totalValue?: number;
  };

  // Where
  pickup: Location;
  delivery: Location;
  waypoints?: Location[];      // Multi-stop support

  // Financials
  earnings: {
    ratePerUnit: number;
    totalRate: number;
    status: 'pending' | 'earned' | 'paid';
  };

  // Metadata
  createdAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  distance?: number;

  // Vehicle
  vehicleType?: 'pickup' | 'truck' | 'van' | 'motorcycle';
  vehicleCapacity?: number;
}
```

#### 2. **ShipmentOrder** (Formerly Order)
```typescript
interface ShipmentOrder {
  _id: string;
  cargoId: string;           // Reference to cargo
  shipperId: string;         // Who sends (formerly farmerId)
  receiverId: string;        // Who receives (formerly buyerId)
  transporterId?: string;    // Assigned transporter
  tripId?: string;           // Link to trip
  quantity: number;
  unit: 'kg' | 'tons' | 'bags';
  totalPrice: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pickupLocation: Location;
  deliveryLocation: Location;
}
```

#### 3. **Cargo** (Formerly Crop)
```typescript
interface Cargo {
  _id: string;
  shipperId: string;         // Who listed it (formerly farmerId)
  name: string;              // Cargo description
  quantity: number;
  unit: 'kg' | 'tons' | 'bags';
  readyDate: string;         // When ready for pickup (formerly harvestDate)
  location: Location;
  status: 'listed' | 'matched' | 'picked_up' | 'in_transit' | 'delivered';
  pricePerUnit?: number;
}
```

---

## 🔄 Order-Trip Synchronization

### Logistics Sync Service

Located at: `src/logistics/services/logisticsSyncService.ts`

**Key Functions:**

1. **createTripFromOrder(order)**: Automatically creates a trip when shipment order is placed
2. **syncOrderFromTrip(trip)**: Updates order status when trip status changes
3. **syncTripFromOrder(order)**: Updates trip when order changes
4. **cancelTripForOrder(orderId)**: Cancels trip when order is cancelled
5. **ensureTripsForOrders(orders)**: Batch sync for data migration

**Status Mapping:**

| Order Status | Trip Status |
|--------------|-------------|
| pending | pending |
| accepted | accepted |
| in_progress | in_transit |
| completed | completed |
| cancelled | cancelled |

**Usage Example:**
```typescript
// When receiver places order
const order = await orderService.createOrder(orderData);
const trip = await logisticsSyncService.createTripFromOrder(order);
// Now both shipper/receiver see "order" and transporter sees "trip"

// When transporter accepts trip
await tripService.acceptTrip(trip._id);
const orderUpdate = logisticsSyncService.syncOrderFromTrip(trip);
await orderService.updateOrder(order._id, orderUpdate);
// Order status automatically updates
```

---

## 🗺️ Navigation Structure

### Priority Order (Top to Bottom)

1. **🚚 Transporter** (Primary logistics experience)
   - Dashboard with available loads, active trips, earnings
   - Available Loads → Accept trips
   - Active Trips → Track deliveries
   - Trip Tracking → Real-time GPS
   - Earnings Dashboard → Financial overview
   - Trip History
   - Route Planner
   - Vehicle Profile

2. **📤 Shipper** (List cargo for transport)
   - Home → Shipment overview
   - List Cargo → Create shipment request
   - My Listings → Manage cargo
   - Active Orders → Track shipments

3. **📥 Receiver** (Request cargo delivery)
   - Home → Delivery overview
   - Browse Cargo → Find cargo to order
   - Place Order → Request delivery
   - My Orders → Track incoming shipments
   - Order Tracking → Real-time tracking

---

## 🏗️ Architecture

### Redux Store Structure

```typescript
{
  auth: {
    user: User,              // Role: 'transporter' | 'shipper' | 'receiver'
    token: string,
    isAuthenticated: boolean
  },
  trips: {                   // 🆕 PRIMARY STORE
    trips: Trip[],
    isLoading: boolean,
    error: string | null
  },
  orders: {                  // Secondary (for shipper/receiver)
    orders: ShipmentOrder[],
    isLoading: boolean,
    error: string | null
  },
  crops: {                   // Secondary (for shipper)
    crops: Cargo[],
    isLoading: boolean,
    error: string | null
  }
}
```

### Folder Structure

```
src/
├── logistics/                    🆕 CORE LOGISTICS DOMAIN
│   ├── types/
│   │   └── trip.ts              // Trip, Shipment, Location, Earnings
│   ├── services/
│   │   ├── tripService.ts       // CRUD + lifecycle operations
│   │   ├── earningsService.ts   // Financial calculations
│   │   └── logisticsSyncService.ts // 🆕 Order-Trip sync
│   ├── store/
│   │   └── tripsSlice.ts        // Redux state
│   └── utils/
│       └── tripCalculations.ts  // Filtering, stats, formatting
│
├── screens/
│   ├── transporter/             // 10 screens (PRIMARY)
│   ├── farmer/                  // 6 screens (now for shippers)
│   └── buyer/                   // 4 screens (now for receivers)
│
├── services/                    // 20+ services
├── store/                       // Redux configuration
├── types/                       // Updated type definitions
└── navigation/                  // Role-based routing
```

---

## 🔧 Implementation Details

### 1. Type System Updates

**Location**: `src/types/index.ts`

- ✅ Added new role types with legacy mapping
- ✅ Renamed `Crop` → `Cargo` (with legacy alias)
- ✅ Renamed `Order` → `ShipmentOrder` (with legacy alias)
- ✅ Updated field names (farmerId → shipperId, buyerId → receiverId)

### 2. Navigation Updates

**Location**: `src/navigation/AppNavigator.tsx`

- ✅ Added `normalizeRole()` function for legacy role support
- ✅ Reordered role checks (transporter first)
- ✅ Added logistics-focused comments
- ✅ Maintained all existing screens

### 3. Auth System Updates

**Location**: `src/services/mockAuthService.ts`

- ✅ Updated MockUser interface for new roles
- ✅ Updated test users (farmer→shipper, buyer→receiver names)
- ✅ Updated register function to accept new roles
- ✅ Maintained backward compatibility

### 4. Trip System Enhancements

**Location**: `src/logistics/types/trip.ts`

- ✅ Added `orderId` field for order linking
- ✅ Added `waypoints` for multi-stop deliveries
- ✅ Added `actualDuration` and `distance` tracking
- ✅ Added vehicle information fields

### 5. Synchronization Service

**Location**: `src/logistics/services/logisticsSyncService.ts`

- ✅ Created comprehensive sync service
- ✅ Bidirectional Order ↔ Trip sync
- ✅ Status mapping between entities
- ✅ Batch sync capabilities
- ✅ Logistics overview per role

---

## 📱 User Experience Flow

### Transporter Journey (Primary)

1. **Login** → Enhanced Dashboard appears
2. **View Available Loads** → See pending trips with earnings
3. **Accept Trip** → Trip moves to Active Trips
4. **Start Trip** → Begin GPS tracking
5. **Navigate** → Follow route, update status
6. **Complete Trip** → Mark delivered, earn payment
7. **View Earnings** → Daily/weekly/monthly breakdown
8. **Trip History** → Review past deliveries

### Shipper Journey

1. **Login** → Shipment overview
2. **List Cargo** → Create new shipment request
3. **My Listings** → Manage cargo listings
4. **Active Orders** → Track when transporter accepts
5. **Monitor** → Real-time tracking until delivered

### Receiver Journey

1. **Login** → Delivery overview
2. **Browse Cargo** → Find available cargo
3. **Place Order** → Request delivery
4. **Track** → Real-time GPS tracking
5. **Receive** → Confirm delivery

---

## 🧪 Testing

### Test Credentials

```
Transporter:
  Phone: +250700000003
  Password: password123
  ID: '3'

Shipper (legacy: farmer):
  Phone: +250700000001
  Password: password123
  ID: '1'

Receiver (legacy: buyer):
  Phone: +250700000002
  Password: password123
  ID: '2'
```

### Mock Data

**4 Test Trips Available:**
- TRIP_001: In Transit (Transporter '3', 25,000 RWF)
- TRIP_002: Completed (Transporter '3', 45,000 RWF)
- TRIP_003: Pending (Available, 45,000 RWF)
- TRIP_004: Pending (Available, 70,000 RWF)

---

## 🚀 Next Steps

### Phase 1: Complete ✅
- [x] Update type system
- [x] Add logistics-first navigation
- [x] Create sync service
- [x] Maintain backward compatibility

### Phase 2: Screen Integration (In Progress)
- [ ] Update screen titles/labels for logistics terminology
- [ ] Add logistics context to UI components
- [ ] Update API service calls to use sync service
- [ ] Enhance transporter dashboard

### Phase 3: Full Synchronization
- [ ] Integrate sync service with Redux actions
- [ ] Auto-create trips when orders placed
- [ ] Real-time status updates across roles
- [ ] Test complete flow: order → trip → delivery

### Phase 4: Advanced Features
- [ ] Multi-stop route optimization
- [ ] Fleet management
- [ ] Real-time WebSocket updates
- [ ] Push notifications
- [ ] Payment integration
- [ ] Rating system

---

## 📚 Key Files Reference

### Core Type Definitions
- `src/types/index.ts` - Main data models
- `src/logistics/types/trip.ts` - Trip entity

### Services
- `src/logistics/services/tripService.ts` - Trip CRUD
- `src/logistics/services/logisticsSyncService.ts` - Order-Trip sync
- `src/logistics/services/earningsService.ts` - Financial calculations
- `src/services/mockAuthService.ts` - Authentication

### State Management
- `src/store/index.ts` - Redux store configuration
- `src/logistics/store/tripsSlice.ts` - Trips state
- `src/store/slices/ordersSlice.ts` - Orders state

### Navigation
- `src/navigation/AppNavigator.tsx` - Role-based routing
- `src/navigation/AuthNavigator.tsx` - Auth flow

### Utilities
- `src/logistics/utils/tripCalculations.ts` - Trip filtering & stats

---

## 💡 Design Principles

1. **Logistics-First**: Trips are the primary entity, everything else supports them
2. **Backward Compatible**: Legacy roles and data structures still work
3. **Real-Time Sync**: Orders and trips stay synchronized automatically
4. **Transporter-Centric**: Best UX for transporters (they're the core value)
5. **Multi-Role Support**: All three roles have clear, focused experiences
6. **Scalable**: Architecture supports multi-stop, fleet management, consolidation

---

## 🔍 Monitoring & Debugging

### Console Logs

- `🚚` - Navigation/routing
- `📦` - Trip creation/updates
- `🔄` - Synchronization events
- `✅` - Success operations
- `❌` - Errors
- `⚠️` - Warnings/fallbacks

### Redux DevTools

- Monitor `state.trips` for trip data
- Monitor `state.orders` for order data
- Track sync actions: `trips/acceptTrip`, `orders/updateOrder`

---

## 📞 Support

For questions about the restructure:
1. Review this document
2. Check `src/logistics/services/logisticsSyncService.ts` for sync logic
3. Check `src/navigation/AppNavigator.tsx` for role routing
4. Review type definitions in `src/types/index.ts`

---

**Document Version**: 1.0
**Last Updated**: October 24, 2025
**Platform**: Agri-Logistics Platform v2.0
