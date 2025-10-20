# 🧪 Order Tracking Testing Guide

## What Was Set Up

### ✅ Option 1: Mock Test Orders (Done!)

- **3 pre-loaded test orders** in Redux store
- **Visible immediately** when you login as a buyer
- Different statuses to show various tracking states:
  - 🟡 **ORDER 001**: Status `in_progress` (active tracking)
  - ✅ **ORDER 002**: Status `completed` (delivered)
  - 🟢 **ORDER 003**: Status `accepted` (preparing)

### ✅ Option 2: Skip Payment Button (Done!)

- New **⚡ Skip Payment (TEST)** button on PlaceOrderScreen
- Allows creating real orders without payment modal
- Great for testing the full order creation flow

---

## 🚀 How to Test

### Test Mock Orders (Fastest)

1. **Refresh your browser** or restart with `npm start --web`
2. **Login as Buyer**
   - Phone: `+250700000002`
   - Password: `password123`
3. **Click "My Orders"** → You'll see **3 test orders!**
4. **Click "📍 Track Order"** on any order
5. **Enjoy the map** with pickup/delivery locations! 🗺️

---

### Test Order Creation (Skip Payment)

1. **Login as Buyer** (same credentials)
2. **Click "Browse Crops"**
3. **Select a crop** and click "Place Order"
4. **Fill in the form**:
   - Quantity: `10`
   - Delivery Address: `My Home`
5. **Click "⚡ Skip Payment (TEST)"**
6. **New order created!** Go to "My Orders" to see it
7. **Track it on the map** 🗺️

---

## 🗺️ Map Features You Can Test

✅ Zoom in/out with mouse wheel or pinch  
✅ Drag to pan around the map  
✅ Click markers to see location details  
✅ View different route statuses:

- 🔵 **Current location** (blue marker)
- 🟢 **Pickup location** (green marker)
- 🔴 **Delivery location** (red marker)
- 📍 **Route line** (solid for completed, dashed for in-progress)

---

## 📍 Test Order Locations

All test orders use **Kigali, Rwanda** locations:

| Order | Pickup                | Delivery                 | Status      |
| ----- | --------------------- | ------------------------ | ----------- |
| 001   | Kigali Central Market | Kigali Business District | In Progress |
| 002   | Rwamagana Farm        | Kigali Downtown          | Completed   |
| 003   | Nyarugunga Warehouse  | Hotel Location           | Accepted    |

---

## 🔄 What to Verify

- [ ] Mock orders appear in "My Orders"
- [ ] Can click "Track Order" button
- [ ] Map loads with correct locations
- [ ] Can zoom/pan the map
- [ ] Skip payment button works
- [ ] New orders show up in list
- [ ] Can track new orders on map

---

## 📝 Next Steps (When Ready)

1. **Connect real backend** - Replace mock orders with actual API calls
2. **Integrate payment** - Connect MomoPaymentModal to real payment processor
3. **Live tracking** - Add real GPS data from transporters
4. **Notifications** - Send SMS/push when order status changes

---

## 💡 Tips

- **Offline Mode**: Test by clicking "Save Order (Offline)" button
- **Multiple Orders**: Create 5-10 test orders to see list scrolling
- **Different Statuses**: Mix `in_progress`, `completed`, `accepted` for variety
- **Backend Integration**: When API is ready, just remove `MOCK_TEST_ORDERS` from Redux

---

**Happy Testing!** 🎉
