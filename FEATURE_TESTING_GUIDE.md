# 🧪 Testing Guide: Dynamic Shipping Fee Calculation

## Quick Start Testing

### Prerequisites

- App running in Expo (web, iOS, or Android)
- Logged in as **Shipper** role
- Empty or willing to create new cargo

---

## ✅ Test 1: Basic Cargo Creation with Destination

**Steps:**

1. Navigate to **Home** → **"List Cargo"** (or **Shipper Home** → **List New Cargo**)
2. Fill in form:
   - Cargo Name: `"Test Cargo"`
   - Quantity: `100` (in kg)
   - Price per Unit: `500` (optional)
   - Ready Date: Pick any future date
3. **IMPORTANT**: Scroll down to **"📍 Destination Location"**
4. Tap the destination selector
5. Select **"Muhanga"** from the list
6. Wait 1-2 seconds for calculations

**Expected Result:**

```
✅ Pricing card appears showing:
   - Distance: ~30 km
   - Vehicle Rate: 500 RWF/km (Van is auto-suggested for 100 kg)
   - Traffic: 🟢-🔴 depends on current time
   - Estimated Shipping: 15,000+ RWF (varies by traffic)
   - ETA: ~40+ minutes (varies by traffic)

✅ Vehicle type cards appear with pricing breakdown
✅ "List Cargo" button ENABLED (was disabled before destination)
```

---

## ✅ Test 2: Vehicle Auto-Suggestion

**Test Different Weights:**

### Test 2a: Light Cargo (30 kg)

- Cargo Name: `"Small Package"`
- Quantity: `30` kg
- Select destination: **Muhanga**

**Expected:**

```
✅ Auto-suggested vehicle: 🏍️ Motorcycle
✅ Rate: 300 RWF/km
✅ Pricing shows ~9,000 RWF (30 km × 300)
```

### Test 2b: Medium Cargo (200 kg)

- Cargo Name: `"Medium Load"`
- Quantity: `200` kg
- Select destination: **Muhanga**

**Expected:**

```
✅ Auto-suggested vehicle: 🚐 Van/Pickup
✅ Rate: 500 RWF/km
✅ Pricing shows ~15,000 RWF (30 km × 500)
```

### Test 2c: Heavy Cargo (1000 kg)

- Cargo Name: `"Bulk Shipment"`
- Quantity: `1000` kg (or `1` ton)
- Select destination: **Muhanga**

**Expected:**

```
✅ Auto-suggested vehicle: 🚚 Truck
✅ Rate: 800 RWF/km
✅ Pricing shows ~24,000 RWF (30 km × 800)
```

---

## ✅ Test 3: Traffic Congestion Impact

**Test at Different Times:**

Visit the "List Cargo" screen at different times and select Muhanga to see price changes.

### Morning Rush (7:00 - 9:00 AM)

```
Expected: 🟡 Yellow traffic indicator
         +30% to price
         Example: 30 km × 500 = 15,000 RWF
                  × 1.3 = 19,500 RWF (with traffic)
```

### Normal Hours (9:00 AM - 12:00 PM, 1:00 - 5:00 PM)

```
Expected: 🟢 Green traffic indicator
         No change to price (1.0x)
         Example: 30 km × 500 = 15,000 RWF
```

### Lunch Time (12:00 - 1:00 PM)

```
Expected: 🟡 Yellow traffic indicator
         +20% to price
         Example: 30 km × 500 = 15,000 RWF
                  × 1.2 = 18,000 RWF
```

### Evening Rush (5:00 - 7:00 PM)

```
Expected: 🔴 Red traffic indicator
         +40% to price (highest)
         Example: 30 km × 500 = 15,000 RWF
                  × 1.4 = 21,000 RWF
```

---

## ✅ Test 4: All Destination Distances

Create cargo and select each destination to verify distances:

| Destination | Expected Distance | Price (Van, no traffic) |
| ----------- | ----------------- | ----------------------- |
| Muhanga     | ~30 km            | 15,000 RWF              |
| Huye        | ~56 km            | 28,000 RWF              |
| Ruhengeri   | ~85 km            | 42,500 RWF              |
| Gisenyi     | ~140 km           | 70,000 RWF              |
| Kibuye      | ~120 km           | 60,000 RWF              |

**Steps:**

1. Create new cargo (100 kg in van range)
2. Select each destination one by one
3. Note the price shown

---

## ✅ Test 5: Payment & "Request Transport" Flow

**Steps:**

1. List 2-3 cargo with destinations
2. Go to **"My Cargo"**
3. Click on one cargo to view details
4. Verify you see:

   - ✅ Cargo name and quantity
   - ✅ Origin location (Kigali)
   - ✅ **Destination location** (new!)
   - ✅ **Distance in km** (new!)
   - ✅ **ETA in minutes** (new!)
   - ✅ **Suggested vehicle type** (new!)
   - ✅ Shipping fee based on calculation (not fixed amount)

5. Click **"Pay for Shipping"** button
6. Complete payment (use test payment flow)
7. After successful payment, return to "My Cargo"
8. Click the same cargo again
9. **Expected:** Purple **"Request Transport"** button appears!

**What You'll See:**

```
BEFORE Payment:
- Status: "listed"
- Orange "Pay for Shipping" button
- Shows calculated shipping fee

AFTER Payment:
- Status: "payment_completed"  ← NEW STATUS
- Green checkmark badge
- Purple "Request Transport" button
```

---

## ✅ Test 6: Override Vehicle Selection

**Goal:** Verify user can change vehicle after listing

**Steps:**

1. Create cargo (100 kg, auto-suggests Van)
2. List it
3. Go to My Cargo → click cargo → "Request Transport"
4. See matching transporters for Van
5. See vehicle selection buttons at top
6. Click **"🏍️ Motorcycle"** or **"🚚 Truck"**

**Expected:**

```
✅ Price updates based on selected vehicle
✅ ETA updates based on traffic for new vehicle
✅ Matching transporters list updates to show that vehicle type
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Destination Not Showing Up

**Solution:**

- Scroll down in the form to see the destination section
- Make sure you're in the enhanced ListCargoScreen

### Issue 2: Pricing Card Not Appearing

**Solution:**

- You must select a destination first
- Pricing only shows AFTER destination is chosen
- Wait 2 seconds after selection for calculations

### Issue 3: "List Cargo" Button Disabled

**Solution:**

- You must fill ALL required fields
- You MUST select a destination
- Try filling form again in order: Name → Quantity → Date → Destination

### Issue 4: Shipping Cost Shows Same Amount

**Solution:**

- This is normal! Try creating cargo at different times
- Morning (7-9am), Afternoon (9am-5pm), Evening (5-7pm) show different costs
- Alternatively, try different cargo weights to see different vehicle rates

### Issue 5: Distance Shows 0 km or No Pricing

**Solution:**

- Make sure you selected a destination from the dropdown
- Refresh the app (⌘R on web, reload in Expo)
- Clear app cache if needed

---

## 📊 Expected Behavior Summary

| Feature                    | Expected Behavior                       | Status |
| -------------------------- | --------------------------------------- | ------ |
| Destination selection      | Modal picker with 7 cities              | ✅     |
| Distance calculation       | Real-world distances using Haversine    | ✅     |
| Vehicle suggestion         | Auto-suggests based on weight           | ✅     |
| Pricing calculation        | Base rate × distance × traffic factor   | ✅     |
| Traffic multiplier         | Changes based on time of day            | ✅     |
| ETA calculation            | Distance ÷ speed (adjusted for traffic) | ✅     |
| Payment workflow           | Uses pre-calculated shipping cost       | ✅     |
| "Request Transport" button | Appears after payment_completed status  | ✅     |
| Vehicle override           | User can change vehicle in request      | ✅     |

---

## 🎯 Success Criteria

Your testing is **SUCCESSFUL** if:

- [x] Can create cargo with destination selection
- [x] Pricing shows immediately after destination pick
- [x] Vehicle auto-suggests correctly based on weight
- [x] Prices vary by time of day (traffic)
- [x] All 7 destinations work and show different distances
- [x] CargoDetailsScreen shows destination and distance
- [x] Payment uses pre-calculated amount
- [x] "Request Transport" button appears after payment
- [x] User can override vehicle type in request

---

## 🚀 How to Report Issues

If you find problems:

1. **Note the exact steps** to reproduce
2. **Screenshot the result** you got vs expected
3. **Check what time** you're testing at
4. **Verify destination** was actually selected
5. **Clear cache** and try again

---

## 📝 Technical Notes

- **Updated Files:**

  - ✅ `src/services/vehicleService.ts` (NEW)
  - ✅ `src/screens/shipper/ListCargoScreen.enhanced.tsx` (NEW)
  - ✅ `src/services/distanceService.ts` (UPDATED - ETA)
  - ✅ `src/screens/shipper/CargoDetailsScreen.tsx` (UPDATED - displays new fields)
  - ✅ `src/types/index.ts` (UPDATED - Cargo interface)
  - ✅ `src/navigation/AppNavigator.tsx` (UPDATED - uses enhanced screen)

- **Dependencies:** No new npm packages required
- **Backward Compatible:** Old cargo without destinations still work
- **Mock Data:** Using Rwanda cities (Kigali, Muhanga, Huye, etc.)

---

**Ready to test!** 🎉 Start with Test 1 and work your way through. Report any issues!
