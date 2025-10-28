# 🚚 Shipping Fee Calculation & Dynamic Pricing Guide

## Overview

The app now has a sophisticated shipping fee calculation system that accounts for:

- ✅ **Origin & Destination** - Both required when listing cargo
- ✅ **Vehicle Type Selection** - With automatic suggestions based on cargo weight
- ✅ **Distance Calculation** - Using Haversine formula (accurate real-world distances)
- ✅ **Traffic Congestion** - Real-time surge pricing based on time of day
- ✅ **ETA Calculation** - Accounts for traffic when estimating delivery time

---

## 🚀 New User Workflow

### Step 1: Create Cargo (with destination)

When listing cargo, users now:

1. Enter **Cargo Name** (e.g., "Fish", "Maize", "Tomatoes")
2. Enter **Quantity** in kg, tons, or bags
3. Choose **Origin Location** (defaults to Kigali)
4. **Select Destination** from Rwanda cities:
   - Kigali
   - Muhanga
   - Huye (Butare)
   - Ruhengeri (Musanze)
   - Gisenyi
   - Kibuye
5. Set **Ready Date** for pickup

### Step 2: Auto-Suggest Vehicle & Calculate Price

As soon as destination is selected:

- **Vehicle is auto-suggested** based on cargo weight:
  - 0-50 kg → 🏍️ Motorcycle
  - 50-500 kg → 🚐 Van/Pickup
  - 500+ kg → 🚚 Truck
- **Distance is calculated** using coordinates
- **Traffic factor is applied** based on current time
- **Shipping fee is shown** with breakdown:
  ```
  Base Cost = Distance (km) × Vehicle Rate (RWF/km)
  With Traffic = Base Cost × (1 + traffic multiplier)
  Total = Amount shown to user
  ```

### Step 3: Confirm Listing

User taps "List Cargo" to create the cargo with:

- All location details
- Pre-calculated shipping cost
- ETA estimate
- Suggested vehicle type

### Step 4: Payment & Transport Request

1. View cargo in **"My Cargo"**
2. Click cargo to open **CargoDetailsScreen**
3. See destination, distance, ETA, suggested vehicle
4. Click **"Pay for Shipping"** (shows pre-calculated amount)
5. Complete payment
6. **"Request Transport"** button appears
7. Select actual vehicle type (can differ from suggestion)
8. System finds matching transporters with that vehicle type

---

## 💰 Pricing Model

### Vehicle Rates (Base Rate per km)

- **🏍️ Motorcycle**: 300 RWF/km (0-50 kg)
- **🚐 Van/Pickup**: 500 RWF/km (50-500 kg)
- **🚚 Truck**: 800 RWF/km (500+ kg)

### Traffic Congestion Multipliers

```
🟢 Light Traffic (off-peak):     1.0x (no change)
🟡 Moderate Traffic (12-1pm):    1.2x (+20%)
🔴 Heavy Traffic (5-7pm):        1.4x (+40%)
🔴 Morning Rush (7-9am):         1.3x (+30%)
```

### Example Calculation

```
Scenario: 100 kg cargo, Kigali to Muhanga, 5pm
- Suggested Vehicle: Van (100 kg = within 50-500 kg range)
- Distance: ~30 km
- Base Rate: 500 RWF/km
- Base Cost: 30 km × 500 = 15,000 RWF
- Traffic Factor: 1.4x (evening rush)
- With Traffic: 15,000 × 1.4 = 21,000 RWF
- Final Shipping Fee: 21,000 RWF
- Estimated Time: 30 km ÷ (45 km/h ÷ 1.4) ≈ 47 minutes
```

---

## 📍 Distance Calculation

Using **Haversine Formula** for accurate real-world distances:

- Accounts for Earth's curvature
- More accurate than simple lat/lon math
- Returns distance in kilometers (rounded to 1 decimal)

### Kigali Coordinates Reference

- **Kigali (Origin)**: -1.9403°, 29.8739°

### Available Destinations

| City          | Distance from Kigali | Approx. Time           |
| ------------- | -------------------- | ---------------------- |
| Muhanga       | 30 km                | 40 min (light traffic) |
| Huye (Butare) | 56 km                | 75 min                 |
| Ruhengeri     | 85 km                | 115 min                |
| Gisenyi       | 140 km               | 190 min                |
| Kibuye        | 120 km               | 160 min                |

---

## 🔧 Technical Implementation

### Files Created/Modified

#### 1. **vehicleService.ts** (NEW)

Location: `src/services/vehicleService.ts`

Exports:

```typescript
// Vehicle definitions
VEHICLE_TYPES: Record<string, VehicleType>

// Helper functions
suggestVehicleType(weightInKg: number): string
calculateShippingCost(distance: number, vehicleId: string, trafficFactor: number): number
getTrafficFactor(date?: Date): number
getTrafficDescription(factor: number): string
isWeightSuitable(weightInKg: number, vehicleId: string): boolean
getCompatibleVehicles(weightInKg: number): VehicleType[]
```

#### 2. **ListCargoScreen.enhanced.tsx** (NEW)

Location: `src/screens/shipper/ListCargoScreen.enhanced.tsx`

Features:

- Destination picker modal with 7 Rwanda cities
- Real-time distance & cost calculation
- Vehicle auto-suggestion
- Traffic factor display
- Pricing breakdown card
- All-in-one cargo creation form

#### 3. **distanceService.ts** (UPDATED)

Enhanced `calculateETA()` to accept traffic factor:

```typescript
calculateETA(distance: number, speedKmh: number = 45, trafficFactor: number = 1.0): number
```

#### 4. **CargoDetailsScreen.tsx** (UPDATED)

Now displays:

- ✅ Destination location (if set)
- ✅ Distance in km
- ✅ ETA in minutes
- ✅ Suggested vehicle type
- ✅ Pre-calculated shipping cost

#### 5. **types/index.ts** (UPDATED)

Cargo interface updated with:

```typescript
destination?: { latitude, longitude, address }
distance?: number
eta?: number
shippingCost?: number
suggestedVehicle?: string
status: 'listed' | ... | 'payment_completed'  // added new status
```

#### 6. **AppNavigator.tsx** (UPDATED)

Now imports enhanced ListCargoScreen:

```typescript
import ListCargoScreen from "../screens/shipper/ListCargoScreen.enhanced";
```

---

## ✨ Key Features

### Dynamic Pricing

- Changes in real-time based on time of day
- Shows traffic impact percentage
- Minimum charge: 5,000 RWF

### Intelligent Vehicle Suggestion

- Automatically suggests based on cargo weight
- User can override and choose different vehicle
- System validates weight vs. vehicle capacity

### Complete Information Flow

- Users know exact shipping cost **before payment**
- Users can see estimated delivery time
- Users understand why price varies (traffic, distance, vehicle type)

### Rwanda-Specific

- All distances calculated for Rwanda context
- Major cities included (Kigali, Muhanga, Huye, etc.)
- Traffic patterns reflect local rush hours
- Pricing in RWF (Rwandan Franc)

---

## 🔑 Usage in TransportRequestScreen

The matching algorithm now considers:

1. **Vehicle Type** - User's selection from request screen
2. **Distance** - Already calculated in cargo
3. **ETA** - Shown to both shipper and transporter
4. **Cost** - Already known, no surprises

---

## 🐛 Troubleshooting

### Q: Why is the shipping cost different each time?

**A**: Traffic factor changes based on time. Visit at different times to see pricing vary.

### Q: Can I change the vehicle type after listing?

**A**: Yes! When you click "Request Transport", you can select a different vehicle. System will recalculate if needed.

### Q: What if destination is missing?

**A**: The "List Cargo" button is disabled until a destination is selected.

### Q: Are the traffic times realistic?

**A**: Yes, based on Kigali rush hour patterns:

- 7-9 AM: Morning commute
- 12-1 PM: Lunch time
- 5-7 PM: Evening rush (heaviest)

---

## 📊 Future Enhancements

Potential improvements:

1. **Real-time traffic API integration** (Google Maps, Here Maps)
2. **Custom vehicle types** (user-defined weight limits)
3. **Seasonal pricing** (rainy season surcharge)
4. **Bulk discounts** (multiple shipments)
5. **Insurance options** (cost of protection)
6. **Fuel price adjustments** (auto-update based on market)

---

## 💡 Testing Checklist

- [ ] Create cargo with destination (note the auto-calculated cost)
- [ ] Try different cargo weights (should suggest different vehicles)
- [ ] View pricing breakdown with all components shown
- [ ] Create cargo at different times to see traffic factor changes
- [ ] Pay for cargo
- [ ] Request transport and see distance/ETA in CargoDetailsScreen
- [ ] Select different vehicle in TransportRequestScreen
- [ ] Verify matching transporters have correct vehicle type

---

**Created**: October 28, 2024
**Updated By**: Zencoder
**Status**: ✅ Ready for Testing
