# ⚡ Real-Time Matching - 5-Minute Quick Start

## What You Now Have

✨ **Automatic transporter matching** that:

- Finds available transporters near the user
- Calculates match scores (proximity + capacity + specialization)
- Auto-assigns the BEST transporter
- Shows ETA & cost estimates
- Lets user confirm and create trip

---

## 🎬 3-Step Setup

### Step 1: Add Route to Navigator (1 min)

In your `AppNavigator.tsx` or `src/navigation/AppNavigator.tsx`:

```tsx
import TransportRequestScreen from "../screens/TransportRequestScreen";

// Inside your Stack.Navigator:
<Stack.Screen
  name="TransportRequest"
  component={TransportRequestScreen}
  options={{ headerShown: false }}
/>;
```

### Step 2: Add Button to Cargo Screen (1 min)

In `src/screens/shipper/CargoDetailsScreen.tsx` (or wherever you list cargo):

```tsx
<TouchableOpacity
  onPress={() => navigation.navigate("TransportRequest", { cargo: cargoItem })}
  style={[styles.button, { backgroundColor: "#8B5CF6" }]}
>
  <Ionicons name="send" size={18} color="#fff" />
  <Text style={styles.buttonText}>Request Transport</Text>
</TouchableOpacity>
```

### Step 3: Test It! (1 min)

1. Login to your app
2. Create/view a cargo item
3. Tap **"Request Transport"**
4. Tap **"Find Matching Transporters"**
5. See auto-assigned transporter
6. Tap **"Auto-Assign"** or **"Confirm & Create Trip"**

---

## 📊 How Matching Works (30 seconds)

**Algorithm Scores 3 Factors:**

```
Proximity (50%)        → How close to pickup?
  - 0-5 km away: 100 pts
  - 5-15 km away: 80 pts
  - 15-30 km away: 60 pts

Capacity (30%)         → Can they fit the load?
  - Perfect fit (+20% buffer): 100 pts
  - Exact fit: 85 pts
  - Slightly under: 70 pts

Specialization (20%)   → Right vehicle for cargo type?
  - Truck: 100 pts
  - Van: 90 pts
  - Pickup: 80 pts
```

**Final Score = (Proximity × 0.5) + (Capacity × 0.3) + (Specialization × 0.2)**

**Top scorer = Auto-assigned! ⭐**

---

## 🚀 Key Features

### ✨ Dynamic Listing

Shows all available transporters with:

- Distance to pickup (km)
- ETA (minutes at 60 km/h)
- Estimated cost (RWF)
- Match score (0-100)
- Reason for match

### 🤖 Auto-Assignment

System automatically selects best transporter based on:

- How close they are
- Vehicle capacity
- Experience with produce type

### ⏱️ ETA Calculation

Uses formula: `Distance ÷ 60 km/h = minutes`

- Example: 30 km ÷ 60 = 30 minutes

### 💰 Cost Estimation

Based on distance × transporter's rate

---

## 🧪 Test Scenarios

### Scenario 1: Bulk Cargo (Maize)

```
Cargo: 1000 kg maize
Suitable Vehicles: Truck, Van, Pickup
System will prefer: TRUCK (best for bulk)
```

### Scenario 2: Fragile Cargo (Tomatoes)

```
Cargo: 500 kg tomatoes
Suitable Vehicles: Van, Pickup only
System will filter out: Trucks (too rough)
```

### Scenario 3: Different Distances

```
Transporter A: 3 km away → Proximity Score: 100
Transporter B: 20 km away → Proximity Score: 60
Transporter A will rank higher (if capacity equal)
```

---

## 🎯 UI Walkthrough

### Match Card Shows:

```
⭐ AUTO-MATCH (badge at top if auto-selected)

├─ Name & Rating
│  └─ "John's Transport • 4.8 ⭐ • Truck"
│
├─ Distance | ETA | Cost
│  └─ 8 km | 45 min | 45,000 RWF
│
├─ Match Score
│  └─ 85/100 (green progress bar)
│
└─ Why This Match?
   ├─ ✓ Very close to pickup location
   ├─ ✓ Perfect capacity for this load
   └─ ✓ Specialized in bulk cargo
```

### Modal Details Show:

- Full transporter info
- Vehicle specifications
- Trip estimate breakdown
- Match score visualization
- Confirm button

---

## 🔧 Simple Customizations

### Change ETA Speed

Edit `TransportRequestScreen.tsx` line ~350:

```typescript
// Current: 60 km/h
const eta = distanceService.calculateETA(distance, 60);

// Change to 45 km/h for rural roads:
const eta = distanceService.calculateETA(distance, 45);
```

### Add New Produce Type

Edit `matchingService.ts` line ~55:

```typescript
PRODUCE_VEHICLE_MAPPING: {
  // Add this:
  coffee: ['truck', 'van'],
  // or:
  passion_fruit: ['van', 'pickup'],
}
```

### Change Scoring Weights

Edit `matchingService.ts` line ~140:

```typescript
// Current: 50% proximity, 30% capacity, 20% specialization
const score = proximity * 0.5 + capacity * 0.3 + special * 0.2;

// Want proximity to matter more? (60% / 25% / 15%):
const score = proximity * 0.6 + capacity * 0.25 + special * 0.15;
```

---

## 📁 Files Overview

| File                         | What It Does                     |
| ---------------------------- | -------------------------------- |
| `matchingService.ts`         | Does all the math & scoring      |
| `matchingSlice.ts`           | Stores matching results in Redux |
| `TransportRequestScreen.tsx` | The UI users see                 |
| `store/index.ts`             | Connects matching to app state   |

---

## ⚠️ Common Issues

**Q: No matches showing?**
A: Ensure backend `/transporters/available` returns transporter data

**Q: Auto-assign not highlighted?**
A: Check browser console for errors in matchingSlice

**Q: Wrong ETA?**
A: Verify distance calculation - default is 60 km/h

**Q: Produce type not matching?**
A: Check spelling in PRODUCE_VEHICLE_MAPPING (case-sensitive)

---

## 🚦 Next Steps

1. ✅ Test with demo data (already included)
2. 📍 Add real GPS location (replace mock coordinates)
3. 🔔 Add notifications when transporter assigned
4. ⭐ Show transporter ratings
5. 💾 Save matching history

---

## 📞 Quick Reference

**How to show matching results:**

```
✅ User taps "Request Transport"
✅ Shows cargo details
✅ Tap "Find Matching Transporters"
✅ System finds & scores all available transporters
✅ Shows top matches sorted by score
✅ BEST MATCH auto-highlighted with ⭐
✅ User taps auto-assign button
✅ Confirms & creates trip
```

**Matching Score Formula:**

```
Proximity (how close) × 50% +
Capacity (can fit) × 30% +
Specialization (right vehicle) × 20% =
Final Score (0-100)
```

---

**Ready to test? Start with Step 1 above! 🚀**
