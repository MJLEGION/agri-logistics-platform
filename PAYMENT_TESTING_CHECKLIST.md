# ✅ Payment System Testing Checklist

## Pre-Demo Preparation

### 1. Test Valid Payment Scenarios

#### Test Case 1: MTN MoMo Success

- [ ] Enter phone: **0788123456**
- [ ] Enter amount: **50000**
- [ ] Click "Pay Now"
- [ ] Wait 3-8 seconds
- [ ] ✅ Should see "Payment Successful!"
- [ ] ✅ Order should be created

#### Test Case 2: Airtel Money Success

- [ ] Enter phone: **0730123456**
- [ ] Enter amount: **100000**
- [ ] Click "Pay Now"
- [ ] Wait 3-8 seconds
- [ ] ✅ Should see "Payment Successful!" (if lucky!)
- [ ] ✅ Order should be created

#### Test Case 3: Payment Failure (Random)

- [ ] Run payment 5-10 times
- [ ] Some should fail (15% failure rate)
- [ ] ✅ Should show error message
- [ ] ✅ Can retry payment
- [ ] ✅ Should not create order on failure

### 2. Test Input Validation

#### Invalid Phone Numbers

- [ ] **Empty field** → "Please enter your phone number"
- [ ] **Too short (5 digits)** → "Phone number must be 9 digits"
- [ ] **Invalid operator (000)** → "Please use MTN (078/079) or Airtel (072/073) number"
- [ ] **Non-numeric input** → Auto-cleaned to digits only

#### Invalid Amounts

- [ ] **Zero amount** → ❌ Should disable "Pay Now" button
- [ ] **Negative amount** → ❌ Should disable "Pay Now" button
- [ ] **Very large amount (1M+)** → ✅ Should accept (no limit validation in demo)

### 3. Test UI/UX Flow

#### Phone Number Input

- [ ] Auto-detects provider as you type
- [ ] Formats as: "078 812 3456"
- [ ] Shows "MTN MoMo" when 078/079 detected
- [ ] Shows "Airtel Money" when 072/073/075 detected

#### Processing State

- [ ] Shows spinner during processing
- [ ] Shows "Processing payment..." message
- [ ] Cannot close modal during payment
- [ ] Shows elapsed time in status (if implemented)

#### Success State

- [ ] Shows checkmark icon
- [ ] Shows "Payment Successful!" message
- [ ] Modal closes after 1.5 seconds
- [ ] Order appears in order list

#### Error State

- [ ] Shows error message
- [ ] Can try again immediately
- [ ] Phone number stays in field
- [ ] Modal doesn't close on error

### 4. Test Edge Cases

- [ ] Very fast successive payments → Should work without conflicts
- [ ] Cancel during processing → Should cancel polling and close
- [ ] Refresh app during payment → Transaction lost (expected for demo)
- [ ] Switch providers mid-payment → Should work
- [ ] Large amount (500000 RWF) → Should work

### 5. Demo Narrative

```
1. "This app supports mobile money payments for African farmers"

2. "Let me show you the payment flow"
   - Click on "Place Order"
   - Show item selection
   - Proceed to payment

3. "The app detects your mobile operator automatically"
   - Enter: 0788123456
   - Point out: "Detected MTN MoMo"

4. "Now let's process the payment"
   - Enter amount: 50000 RWF
   - Click "Pay Now"
   - Wait...

5. "In production, the user would see a real MoMo prompt on their phone"
   - Show the processing screen
   - Explain: "We're polling the payment status every 5 seconds"

6. "After confirmation, the order is created automatically"
   - Show success screen
   - Navigate to order history
   - Point out: "The order is now in the system"
```

## Success Criteria for Demo

✅ Payment modal opens without errors  
✅ Phone number validation works  
✅ Provider auto-detection works  
✅ Processing shows loading state  
✅ ~85% of payments succeed  
✅ Success/failure messages display  
✅ Order is created after success  
✅ Can retry after failure  
✅ UI is responsive and clean

## Common Questions from Evaluators

### Q: "Why don't real payments process?"

**A:** "This is a demonstration using mock payments. In production, we integrate with Flutterwave's real API. The flow and security architecture are production-ready."

### Q: "How secure is this?"

**A:** "In production:

- Secret API key stays on backend only
- Phone numbers are validated
- Amounts are verified server-side
- All transactions are logged
- HTTPS is required"

### Q: "What happens if payment fails?"

**A:** "The user can retry. Each attempt gets a new transaction ID. The system tracks all attempts for fraud prevention."

### Q: "Can users game the system?"

**A:** "No, because:

- Amounts are validated on backend
- Phone numbers are linked to user accounts
- Transaction amounts are immutable
- All changes are logged"

## Performance Notes

### Expected Load Times

- Modal opens: < 100ms
- Phone validation: Instant
- Payment initiation: 1-2 seconds
- Status polling: Every 5 seconds
- Total payment time: 5-15 seconds
- Success screen: 1.5 second auto-close

### Network Requirements

- **In Demo:** None (all local)
- **In Production:** Requires API backend + internet

## Testing Environments

### Test 1: Local Development

```bash
npm start
# Payment works immediately
# No API needed
```

### Test 2: Expo Simulator

```bash
expo start --web
# or
expo start --android
# or
expo start --ios
```

### Test 3: Production Switch

```typescript
// Simply change imports to:
// initiateFlutterwavePayment (requires backend)
// checkFlutterwavePaymentStatus (requires backend)
```

## Sign-Off Checklist

- [ ] All payment flows tested
- [ ] Input validation working
- [ ] UI/UX is smooth
- [ ] Error handling works
- [ ] Success messages display
- [ ] Orders are created
- [ ] Demo narrative is ready
- [ ] Evaluators know how to test
- [ ] Backup demo phone numbers ready
- [ ] Screenshot/video recorded

## Demo Day Tips

1. **Test Before Presentation**

   - Run full test suite 30 minutes before
   - Have backup test numbers
   - Know the exact flow

2. **Explain the Mock**

   - "This is demo mode with mock payments"
   - "Real API integration is production-ready"
   - "We chose mock to avoid credential headaches in class"

3. **Show the Code**

   - Point out `mockPaymentService.ts`
   - Show imports switching explanation
   - Highlight security-first architecture

4. **Answer Technical Questions**

   - Be ready for "Why not real payments?"
   - Explain choice: Student project
   - Show how to switch to real

5. **Backup Plan**
   - Have video recording of demo
   - Keep screenshots ready
   - Have test transaction data

---

**Ready to demo? Good luck! 🚀**
