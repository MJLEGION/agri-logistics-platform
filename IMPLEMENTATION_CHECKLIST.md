# ✅ Implementation Checklist - Live MoMo Integration

## Phase 1: Preparation (30 min)

- [ ] Read FLUTTERWAVE_QUICK_START.md
- [ ] Create Flutterwave account at https://dashboard.flutterwave.com
- [ ] Complete email verification
- [ ] Complete KYC verification (required for live payments)
- [ ] Generate test API keys in Flutterwave dashboard
  - [ ] Copy Public Key: `pk_test_xxxxx`
  - [ ] Copy Secret Key: `sk_test_xxxxx`

## Phase 2: Frontend Setup (15 min)

- [ ] Update `.env` file:
  ```env
  EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_test_xxxxx
  EXPO_PUBLIC_FLUTTERWAVE_API_URL=https://api.flutterwave.com/v3
  ```
- [ ] Verify `src/services/flutterwaveService.ts` exists ✓
- [ ] Verify `src/components/MomoPaymentModal.tsx` is updated ✓
- [ ] Run app locally: `npm start` or `expo start`

## Phase 3: Backend Setup (45 min - 1 hour)

- [ ] Copy code from `BACKEND_PAYMENT_TEMPLATE.js`
- [ ] Create `routes/payments.js` in your backend
- [ ] Paste template code into new file
- [ ] In `app.js`, add:
  ```javascript
  const paymentRoutes = require("./routes/payments");
  app.use("/api/payments", paymentRoutes);
  ```
- [ ] Create backend `.env` file with:
  ```env
  FLUTTERWAVE_SECRET_KEY=sk_test_xxxxx
  FLUTTERWAVE_API_URL=https://api.flutterwave.com/v3
  ```
- [ ] Install required packages:
  ```bash
  npm install axios dotenv
  ```
- [ ] Verify backend is running on correct port
- [ ] Test backend routes with Postman/Insomnia

## Phase 4: Integration Testing (30 min)

- [ ] Start backend server
- [ ] Start frontend app
- [ ] Open app in emulator/simulator
- [ ] Login as buyer
- [ ] Navigate to browse crops
- [ ] Select any crop
- [ ] Enter quantity: 100
- [ ] Enter delivery address: "Test Address"
- [ ] Click "Place Order"
- [ ] Payment modal appears ✓
- [ ] Enter test phone: `0788000001`
- [ ] System detects: "MTN MoMo" ✓
- [ ] Click "Pay Now"
- [ ] See processing state
- [ ] Click "I See The Prompt" (test only)
- [ ] Wait for payment confirmation (auto in test mode)
- [ ] See success screen ✓
- [ ] Order should appear in "My Orders" ✓

## Phase 5: Error Scenario Testing (20 min)

- [ ] Test with invalid phone (12345678)
  - Expected: Error "Phone number must be 9 digits"
- [ ] Test with wrong provider prefix (0987654321)
  - Expected: Error "Please use MTN/Airtel number"
- [ ] Test payment cancellation
  - Click Cancel button
  - Should return to input screen
- [ ] Test with missing quantity
  - Expected: Error "Please fill all fields"
- [ ] Verify error messages are helpful

## Phase 6: Go Live Preparation (15 min)

- [ ] Verify all tests pass with test keys
- [ ] In Flutterwave dashboard: Get live keys
  - [ ] Copy Public Key: `pk_live_xxxxx`
  - [ ] Copy Secret Key: `sk_live_xxxxx`
- [ ] **DO NOT** proceed unless test phase complete!

## Phase 7: Production Deployment (15 min)

- [ ] Update frontend `.env`:
  ```env
  EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_live_xxxxx
  ```
- [ ] Update backend `.env`:
  ```env
  FLUTTERWAVE_SECRET_KEY=sk_live_xxxxx
  ```
- [ ] Rebuild and deploy frontend
- [ ] Restart backend with new environment
- [ ] Verify API connectivity
- [ ] Do ONE test transaction with real money
- [ ] Monitor Flutterwave dashboard for transaction
- [ ] Verify order created in database
- [ ] Check SMS notification sent
- [ ] **STOP if anything fails!**

## Phase 8: Post-Launch Monitoring (Daily for 1 week)

- [ ] Check Flutterwave dashboard daily
  - [ ] Monitor transaction volume
  - [ ] Check for failed payments
  - [ ] Verify settlement amounts
- [ ] Check application logs
  - [ ] Look for payment errors
  - [ ] Monitor error rates
  - [ ] Verify polling success
- [ ] Test daily with small amounts
- [ ] Monitor user feedback
- [ ] Check SMS notifications working
- [ ] Verify orders created correctly

## Phase 9: Documentation Updates

- [ ] Add payment info to README
- [ ] Document Flutterwave setup in deployment guide
- [ ] Add troubleshooting guide for support team
- [ ] Create FAQ for users
- [ ] Document transaction reconciliation process

## Security Checklist

- [ ] Secret Key NEVER in frontend code
- [ ] Secret Key NEVER in git repo
- [ ] Public Key in environment variables
- [ ] .gitignore includes .env files
- [ ] CORS configured on backend
- [ ] Rate limiting added to payment routes
- [ ] Input validation on backend
- [ ] Authentication required on payment routes
- [ ] HTTPS enforced in production
- [ ] Transaction logging implemented
- [ ] Error logging without exposing secrets

## Troubleshooting Reference

### If "Backend Error 500"

```
1. Check backend is running
2. Check FLUTTERWAVE_SECRET_KEY in .env
3. Check API_BASE_URL in frontend
4. Check console logs on backend
5. Restart backend
```

### If "Payment Status Timeout"

```
1. Check backend /status route exists
2. Check route is registered
3. Check polling interval (5 sec is correct)
4. Check Flutterwave dashboard for transaction
5. May retry after 5 minute timeout
```

### If "Could Not Detect Provider"

```
1. Phone must be 9 digits
2. Accepted: 0788123456, 788123456, +250788123456
3. Prefix must be: 078, 079 (MTN) or 072, 073, 075 (Airtel)
4. Use valid test numbers
```

### If "Order Not Created After Payment"

```
1. Payment succeeded (check Flutterwave)
2. Check order creation endpoint
3. Check authentication token
4. Check database connection
5. Check console for errors
```

## Communication Checklist

- [ ] Document for operations team
- [ ] Notify support of new payment system
- [ ] Create support FAQ
- [ ] Brief customer support on process
- [ ] Set up monitoring alerts
- [ ] Create escalation contacts
- [ ] Add to incident response plan

## Maintenance Checklist

- [ ] Weekly: Check transaction volume
- [ ] Weekly: Review failed transactions
- [ ] Monthly: Review fees and settlement
- [ ] Monthly: Check transaction logs
- [ ] Quarterly: Review Flutterwave limits
- [ ] Quarterly: Update documentation
- [ ] Yearly: Security audit

## Quick Start Reference

**Before testing, you need:**

- ✅ `.env` with `EXPO_PUBLIC_FLUTTERWAVE_PUBLIC_KEY`
- ✅ Backend running with payment routes
- ✅ Backend `.env` with `FLUTTERWAVE_SECRET_KEY`

**Test numbers:**

- ✅ `+250788000001` = MTN (auto-succeeds)
- ✅ `+250720000001` = Airtel (auto-succeeds)

**Live deployment:**

- ✅ Switch to `pk_live_xxxxx`
- ✅ Switch to `sk_live_xxxxx`
- ✅ Test one real transaction first
- ✅ Monitor for 1 week

## Success Criteria

- [ ] User can complete payment flow end-to-end
- [ ] Order created after payment
- [ ] SMS notification sent
- [ ] Payment visible in Flutterwave dashboard
- [ ] No errors in console
- [ ] Transaction logged in database
- [ ] User experience is smooth
- [ ] All error cases handled gracefully

## Status Tracker

| Phase               | Status | Date | Notes |
| ------------------- | ------ | ---- | ----- |
| Preparation         | ⬜     |      |       |
| Frontend            | ⬜     |      |       |
| Backend             | ⬜     |      |       |
| Integration Testing | ⬜     |      |       |
| Error Testing       | ⬜     |      |       |
| Go Live Prep        | ⬜     |      |       |
| Production          | ⬜     |      |       |
| Monitoring          | ⬜     |      |       |

**Legend:** ⬜ = Not Started, 🟨 = In Progress, ✅ = Complete

---

**Good luck! You're ready to go live! 🚀**
