# 🚀 Quick Start - Two-Role Logistics Platform

## 🎯 What Is This?

A **direct shipper-to-transporter logistics platform** for agricultural cargo:
- **Shippers** (farmers) request transportation for their cargo
- **Transporters** accept requests and deliver cargo
- **No middleman** - direct connection for efficiency

---

## 🏃 Start in 30 Seconds

### 1. Run the App
```bash
npm start
```

### 2. Test as Shipper
```
Phone: +250700000001
Password: password123
```
➡️ List cargo → Request transport → Track delivery

### 3. Test as Transporter
```
Phone: +250700000003
Password: password123
```
➡️ View available loads → Accept → Deliver → Earn

---

## 👥 Two Roles Explained

### 🚜 Shipper (Farmer)
**What they do:**
- List agricultural cargo (maize, coffee, beans, etc.)
- Set pickup and delivery locations
- Request transportation services
- Track shipments in real-time
- Pay transport fees

**Screens:** 7 screens (Home, List Cargo, My Listings, etc.)

### 🚚 Transporter
**What they do:**
- View available transport requests
- Accept profitable jobs
- Navigate and deliver cargo
- Earn transport fees
- Track earnings

**Screens:** 10 screens (Dashboard, Available Loads, Active Trips, Earnings, etc.)

---

## 🔄 Complete Workflow

```
1. SHIPPER: List cargo
   "500 kg Maize, Kigali → Ruhengeri, 45,000 RWF"

2. SYSTEM: Auto-creates trip for transporters

3. TRANSPORTER: Views in "Available Loads"
   Sees: "500 kg Maize, 45,000 RWF"

4. TRANSPORTER: Accepts trip
   Status: pending → accepted

5. TRANSPORTER: Starts delivery
   GPS tracking begins
   Shipper can track in real-time

6. TRANSPORTER: Completes delivery
   Earns 45,000 RWF
   Shipper notified

7. BOTH: View in history
```

---

## 💡 Key Features

### Direct Connection
✅ Shippers directly work with transporters
✅ No buyer/receiver middleman
✅ Pure logistics focus

### Real-Time Sync
✅ Transport requests automatically become trips
✅ Status updates sync instantly
✅ Both roles see current status

### GPS Tracking
✅ Real-time location during delivery
✅ Route optimization
✅ Multi-stop support

### Earnings Dashboard
✅ Daily/weekly/monthly breakdown
✅ Trip history
✅ Performance metrics

---

## 🧪 Try It Now

### Scenario 1: As Shipper
1. Login: `+250700000001 / password123`
2. Tap "List Cargo"
3. Enter: "Maize, 500 kg"
4. Set pickup: Kigali
5. Set delivery: Ruhengeri
6. Set fee: 45,000 RWF
7. Submit → Watch it appear for transporters!

### Scenario 2: As Transporter
1. Login: `+250700000003 / password123`
2. View "Available Loads"
3. See the 500 kg Maize request
4. Tap "Accept"
5. View in "Active Trips"
6. Start Trip → GPS tracking
7. Complete → Earn 45,000 RWF!

---

## 📁 What Changed?

### Removed
- ❌ Buyer/Receiver role (unnecessary middleman)
- ❌ 4 buyer screens
- ❌ Three-party workflow complexity

### Added
- ✅ Direct shipper-transporter connection
- ✅ TransportRequest entity
- ✅ Simplified two-role system
- ✅ OrderTracking added to shipper screens

### Updated
- ✅ All types: `UserRole = 'shipper' | 'transporter'`
- ✅ Navigation: Only two role flows
- ✅ Mock users: 2 test users instead of 3
- ✅ Sync service: Two-role logic

---

## 📚 Documentation

### Essential Reading
1. **[TWO_ROLE_SYSTEM.md](./TWO_ROLE_SYSTEM.md)** ⭐ Start here!
   - Complete workflow explained
   - Data models
   - Test scenarios

2. **[RESTRUCTURE_SUMMARY.md](./RESTRUCTURE_SUMMARY.md)**
   - Technical changes
   - File modifications

3. **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)**
   - Visual architecture
   - Data flow diagrams

---

## 🚀 What's Next?

### Phase 2: Integration
- [ ] Wire sync service to Redux
- [ ] Real-time WebSocket updates
- [ ] Push notifications
- [ ] In-app messaging

### Phase 3: Advanced Features
- [ ] Multi-stop optimization
- [ ] Fleet management
- [ ] Automated pricing
- [ ] Photo proof of delivery
- [ ] Rating system

---

## 💬 Common Questions

**Q: Why remove the buyer role?**
A: It was redundant. In pure logistics, shippers directly hire transporters. No need for a buyer intermediary.

**Q: Can I still track deliveries?**
A: Yes! Shippers have full GPS tracking via the Order Tracking screen.

**Q: How do transporters find work?**
A: All transport requests appear in "Available Loads". Transporters browse and accept profitable jobs.

**Q: What about payment?**
A: Shippers set transport fees upfront. Future versions will integrate Flutterwave/MoMo for automatic payment.

---

## 🎯 Success Checklist

After using the app, you should see:

**As Shipper:**
- ✅ Can list cargo easily
- ✅ Can set pickup/delivery locations
- ✅ Can track transport request status
- ✅ Can view real-time GPS tracking
- ✅ Can see trip history

**As Transporter:**
- ✅ See available loads with earnings
- ✅ Can accept profitable jobs
- ✅ GPS navigation works
- ✅ Can complete deliveries
- ✅ Earnings dashboard shows totals

---

**Version**: 2.1.0 (Two-Role System)
**Status**: ✅ Ready to Use
**Updated**: October 24, 2025

**Ready to dive deeper?** Read [TWO_ROLE_SYSTEM.md](./TWO_ROLE_SYSTEM.md) for complete details!
