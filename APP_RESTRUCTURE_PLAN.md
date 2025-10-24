# App Restructure: From Order-Centric to Logistics-Centric

## Current Problem

- App treats **Orders** as primary entity (farmer/buyer perspective)
- Transporter concerns (accepting, completing, earning) are scattered
- Data flow breaks because Orders and Trips are not properly synchronized
- Earnings calculation happens after the fact, not during trip lifecycle

## New Architecture: Logistics-First

### 1. New Core Concepts

#### Trip (Primary Entity for Transporter)

```typescript
interface Trip {
  _id: string;
  // Logistics Identification
  tripId: string;           // Unique trip number (TRIP-20250101-001)
  transporterId: string;    // Assigned transporter
  status: TripStatus;       // pending → accepted → in_transit → completed

  // What's Being Transported
  shipment: Shipment {
    cropId: string;
    farmerId: string;
    quantity: number;
    unit: 'kg' | 'tons' | 'bags';
    cropName: string;
  };

  // Locations
  pickup: Location {
    latitude: number;
    longitude: number;
    address: string;
    contactName: string;
    contactPhone: string;
  };
  delivery: Location {
    latitude: number;
    longitude: number;
    address: string;
    contactName: string;
    contactPhone: string;
  };

  // Financial Tracking
  earnings: {
    ratePerUnit: number;
    totalRate: number;
    status: 'pending' | 'earned' | 'paid';
    completedAt?: Date;
  };

  // Trip Metadata
  createdAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration: number;  // minutes
}

type TripStatus = 'pending' | 'accepted' | 'in_transit' | 'completed' | 'cancelled';

interface Shipment {
  cropId: string;
  farmerId: string;
  quantity: number;
  unit: 'kg' | 'tons' | 'bags';
  cropName: string;
  totalValue: number;
}

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  contactName?: string;
  contactPhone?: string;
}
```

#### Order (Remains, but simplified)

- Only handles Farmer/Buyer marketplace concerns
- Creates Trips when accepted by transporter
- References Trip for logistics tracking

### 2. Restructured Folder Layout

```
src/
├── logistics/                    ← NEW: Core logistics domain
│   ├── types/
│   │   ├── trip.ts             ← Trip, TripStatus, Shipment
│   │   ├── location.ts
│   │   └── earnings.ts
│   ├── services/
│   │   ├── tripService.ts       ← Trip CRUD & lifecycle
│   │   ├── tripAssignmentService.ts
│   │   ├── earningsService.ts   ← Pure earnings logic
│   │   └── tripTrackingService.ts
│   ├── store/
│   │   └── tripsSlice.ts        ← PRIMARY Redux state
│   └── utils/
│       ├── tripCalculations.ts
│       └── tripFormatters.ts
│
├── market/                       ← Marketplace (Farmer/Buyer)
│   ├── types/
│   │   └── order.ts
│   ├── services/
│   │   └── orderService.ts
│   ├── store/
│   │   └── ordersSlice.ts
│   └── screens/
│
├── screens/
│   ├── transporter/             ← Primary transporter flows
│   │   ├── HomeScreen.tsx       ← Dashboard with trip counts
│   │   ├── TripList/
│   │   │   ├── PendingTripsScreen.tsx      ← Available to accept
│   │   │   ├── ActiveTripsScreen.tsx       ← In-progress trips
│   │   │   └── TripHistoryScreen.tsx       ← Completed trips
│   │   ├── TripDetail/
│   │   │   ├── TripDetailsScreen.tsx
│   │   │   ├── TripTrackingScreen.tsx
│   │   │   └── TripCompletionScreen.tsx
│   │   └── Earnings/
│   │       ├── EarningsSummaryScreen.tsx   ← Real-time earnings
│   │       └── EarningsHistoryScreen.tsx
│   │
│   ├── farmer/                  ← Secondary (farmer marketplace)
│   ├── buyer/                   ← Secondary (buyer marketplace)
│   └── auth/
│
└── store/                        ← Redux root
    └── index.ts                 ← Combines logistics + market slices
```

### 3. Redux State Structure

**Before (Order-centric):**

```
state.orders = [
  { _id, status, transporterId, ... }  ← Mixed concerns
]
```

**After (Logistics-centric):**

```
state.logistics.trips = [
  {
    _id, tripId, transporterId, status,
    shipment, pickup, delivery, earnings, ...
  }  ← Trip-specific
]

state.market.orders = [
  {
    _id, status, buyerId, ...
    tripId: "ref to Trip"  ← References trip for logistics
  }  ← Order-specific
]
```

### 4. Data Flow: Accept Order → Create Trip

```
1. TransporterScreen: "Accept Trip" button
                        ↓
2. dispatch(acceptTrip(tripId, transporterId))
                        ↓
3. Redux Thunk tripsSlice:
   - Get transporterId from auth state
   - Call tripService.acceptTrip(tripId, transporterId)
   - Update trip status: pending → accepted
   - Record acceptedAt timestamp
                        ↓
4. TripService:
   - Update trip in database/mock
   - Emit event (trip accepted)
                        ↓
5. Redux Reducer:
   - Update trips array
   - Trip now in "accepted" state
                        ↓
6. ActiveTripsScreen (subscribed to state.logistics.trips):
   - Filters trips by status='accepted' AND transporterId=currentUser.id
   - Displays trip card with all details
   - Shows "Complete Delivery" button
                        ↓
7. User clicks "Complete Delivery"
                        ↓
8. dispatch(completeTrip(tripId))
                        ↓
9. Redux Thunk:
   - Call tripService.completeTrip(tripId)
   - Update trip status: in_transit → completed
   - Record completedAt timestamp
   - Calculate final earnings
                        ↓
10. EarningsSummaryScreen (subscribed to state.logistics.trips):
    - Filters trips by status='completed' AND transporterId=currentUser.id
    - Calculates total: sum(trip.earnings.totalRate for all completed trips)
    - Displays earnings in real-time ✅
```

### 5. Implementation Phases

#### Phase 1: Create Logistics Domain

1. ✅ Create `Trip` type in `src/logistics/types/trip.ts`
2. ✅ Create `tripService.ts` with mock data
3. ✅ Create `tripsSlice.ts` Redux slice
4. ✅ Create `earningsService.ts` with calculation logic

#### Phase 2: Update Screens

1. ✅ Refactor ActiveTripsScreen to use trips instead of orders
2. ✅ Refactor EarningsDashboardScreen to use trips
3. ✅ Rename "AvailableLoadsScreen" → "PendingTripsScreen"
4. ✅ Add real-time earnings display

#### Phase 3: Connect Order → Trip

1. ✅ When order is accepted, create corresponding trip
2. ✅ Keep reference from order to trip
3. ✅ Update both order and trip lifecycle

#### Phase 4: Optimize Transporter Flows

1. ✅ Add trip summary on home dashboard
2. ✅ Optimize trip filtering
3. ✅ Add trip history with earnings breakdown

### 6. Key Benefits

| Issue                  | Before            | After                       |
| ---------------------- | ----------------- | --------------------------- |
| Active trips filtering | Scattered logic   | Centralized in tripsSlice   |
| Earnings calculation   | Late/unreliable   | Real-time in trips domain   |
| Trip status            | Mixed with orders | Dedicated TripStatus type   |
| Transporter context    | Not passed down   | Built into trip from accept |
| Test data              | Inconsistent      | Generated from Trip factory |
| UI State Sync          | Manual syncing    | Automatic via Redux         |

### 7. Migration Strategy

1. Keep current Order system working
2. Introduce new Trip system in parallel
3. Gradually migrate screens from Orders to Trips
4. Once all screens work, mark Orders as "legacy"
5. Eventually Orders can be read-only marketplace view

### 8. Files to Create

**New Files:**

- `src/logistics/types/trip.ts` ← Core Trip type
- `src/logistics/types/location.ts`
- `src/logistics/types/earnings.ts`
- `src/logistics/services/tripService.ts`
- `src/logistics/services/tripTrackingService.ts`
- `src/logistics/services/earningsService.ts`
- `src/logistics/store/tripsSlice.ts`
- `src/logistics/utils/tripCalculations.ts`
- `src/market/types/order.ts` ← Move from root
- `src/market/services/orderService.ts` ← Move from services
- `src/market/store/ordersSlice.ts` ← Move from store

**Files to Update:**

- `src/types/index.ts` ← Re-export from logistics + market
- `src/store/index.ts` ← Include both slices
- `src/screens/transporter/ActiveTripsScreen.tsx` ← Use trips
- `src/screens/transporter/EarningsDashboardScreen.tsx` ← Use trips
- `src/screens/transporter/AvailableLoadsScreen.tsx` ← Refactor

---

## Next Steps

1. **Start with Phase 1**: Create the logistics domain
2. **Build Trip type and service layer** first (no UI changes yet)
3. **Create tripsSlice** with test data
4. **Then wire screens** to use new Redux slice
5. **Test data flow** end-to-end
6. **Gradually migrate** other transporter screens

This ensures the app keeps the same look while the architecture becomes properly logistics-centric underneath.
