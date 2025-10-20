# 🧪 Testing Mobile Money (MoMo) Payments

## Overview

The MoMo payment feature is currently in **MOCK MODE** for testing. This means it simulates real payments without actually charging money or connecting to MTN/Airtel APIs.

---

## ✅ How to Test MoMo Payments

### **Step 1: Create an Order**

1. **Login as a Buyer**

   - Go to Login screen
   - Use your buyer credentials
   - Or register a new buyer account

2. **Browse Available Crops**

   - From Buyer Home, click "Browse Crops"
   - Find a crop you want to order

3. **Place an Order**
   - Click on a crop
   - Enter quantity
   - Click "Place Order" or "Proceed to Payment"

---

### **Step 2: Test the Payment Modal**

When you click to place an order, the **MoMo Payment Modal** should appear.

#### **What You Should See:**

```
╔═══════════════════════════════════════════════════════════╗
║                   Mobile Money Payment                    ║
║                                                           ║
║  Amount to Pay: RWF 50,000                               ║
║                                                           ║
║  Select Provider:                                         ║
║  [ MTN Mobile Money ]  [ Airtel Money ]                  ║
║                                                           ║
║  Phone Number:                                            ║
║  [________________]                                       ║
║                                                           ║
║  [ Pay Now ]                                              ║
╚═══════════════════════════════════════════════════════════╝
```

---

### **Step 3: Test Phone Number Validation**

#### **✅ Valid Phone Numbers (Should Work):**

Try these test numbers:

- `0788123456` (MTN)
- `0791234567` (MTN)
- `0792345678` (MTN)
- `0733456789` (Airtel)
- `0725678901` (Airtel)
- `0723456789` (Airtel)

#### **❌ Invalid Phone Numbers (Should Show Error):**

Try these to test validation:

- `0700123456` → Error: "Invalid phone number format"
- `078812` → Error: "Phone number too short"
- `12345` → Error: "Invalid phone number format"
- `0788 123 456 789` → Error: "Phone number too long"

#### **✅ Auto-Formatting:**

As you type, the phone number should auto-format:

- Type: `0788123456`
- Shows: `078 812 3456`

---

### **Step 4: Test Payment Processing**

1. **Enter a valid phone number** (e.g., `0788123456`)
2. **Select a provider** (MTN or Airtel)
3. **Click "Pay Now"**

#### **What Happens (Mock Mode):**

The modal will show a **processing state**:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                    ⏳                                     ║
║                                                           ║
║              Processing Payment...                        ║
║                                                           ║
║         Please check your phone for a prompt             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

After 2-3 seconds, you'll see either:

#### **✅ Success (90% chance in mock mode):**

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                    ✅                                     ║
║                                                           ║
║              Payment Successful!                          ║
║                                                           ║
║         Transaction ID: MOMO1234567890                   ║
║                                                           ║
║              [ Done ]                                     ║
╚═══════════════════════════════════════════════════════════╝
```

#### **❌ Failure (10% chance in mock mode):**

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                    ❌                                     ║
║                                                           ║
║              Payment Failed                               ║
║                                                           ║
║         Insufficient balance or cancelled                ║
║                                                           ║
║              [ Try Again ]                                ║
╚═══════════════════════════════════════════════════════════╝
```

---

### **Step 5: Check Console Logs**

Open browser console (F12) and look for MoMo logs:

#### **When Payment Starts:**

```
💰 [MOCK] Initiating MoMo payment...
💰 Provider: MTN Mobile Money
💰 Phone: 0788123456
💰 Amount: 50000
```

#### **When Payment Succeeds:**

```
✅ [MOCK] Payment successful!
✅ Transaction ID: MOMO1234567890
✅ Status: completed
```

#### **When Payment Fails:**

```
❌ [MOCK] Payment failed
❌ Reason: Insufficient balance or user cancelled
```

---

## 🔍 How to Know MoMo is Working Correctly

### ✅ **Checklist:**

- [ ] **Modal Opens** - Payment modal appears when placing order
- [ ] **Provider Selection** - Can select MTN or Airtel
- [ ] **Phone Validation** - Invalid numbers show error messages
- [ ] **Auto-Formatting** - Phone number formats as you type (078 812 3456)
- [ ] **Processing State** - Shows "Processing Payment..." with loading animation
- [ ] **Success State** - Shows success message with transaction ID
- [ ] **Failure State** - Shows error message with "Try Again" button
- [ ] **Console Logs** - Detailed logs appear in browser console
- [ ] **Order Created** - After successful payment, order is created
- [ ] **SMS Notification** - Console shows SMS notification log

---

## 📱 Expected User Flow

### **Complete Flow:**

1. **Buyer places order** → MoMo modal opens
2. **Buyer enters phone** → Auto-formats and validates
3. **Buyer selects provider** → MTN or Airtel highlighted
4. **Buyer clicks "Pay Now"** → Processing state shows
5. **Mock payment processes** → 2-3 second delay
6. **Success!** → Transaction ID shown
7. **Order created** → Saved to database
8. **SMS sent** → Console shows SMS log
9. **Modal closes** → Returns to order screen

---

## 🧪 Advanced Testing

### **Test 1: Multiple Payments**

Try making multiple orders to test:

- Different phone numbers
- Different providers (MTN vs Airtel)
- Different amounts

### **Test 2: Payment Retry**

If payment fails (10% chance):

1. Click "Try Again"
2. Modal should reset to input state
3. Try payment again

### **Test 3: Cancel Payment**

1. Open payment modal
2. Click outside modal or "X" button
3. Modal should close without creating order

### **Test 4: Offline Mode**

1. Enable airplane mode or disconnect internet
2. Try to place order
3. Should save to offline queue instead of showing payment modal
4. Reconnect internet
5. Click "Sync Now" in offline banner
6. Payment modal should appear for synced order

---

## 🔧 Troubleshooting

### **Issue: Payment Modal Doesn't Open**

**Check:**

1. Are you logged in as a buyer?
2. Did you select a crop and quantity?
3. Check console for errors

**Solution:**

```javascript
// Check if MomoPaymentModal is imported in PlaceOrderScreen
import MomoPaymentModal from "../../components/MomoPaymentModal";
```

### **Issue: Phone Number Not Formatting**

**Check:**

1. Are you typing numbers (not letters)?
2. Is the input field focused?

**Solution:** The formatting happens automatically as you type. Try typing slowly.

### **Issue: Payment Always Fails**

**Check console logs:**

```
❌ [MOCK] Payment failed
```

This is expected 10% of the time in mock mode. Try again - it should succeed.

### **Issue: No Console Logs**

**Check:**

1. Is browser console open? (Press F12)
2. Is console filter set to "All" (not "Errors" only)?

---

## 🎯 What Mock Mode Tests

### ✅ **Frontend Features:**

- Phone number validation
- Auto-formatting
- Provider selection
- Loading states
- Success/failure handling
- Error messages
- Transaction ID generation
- UI/UX flow

### ❌ **NOT Tested in Mock Mode:**

- Real MTN/Airtel API integration
- Actual money transfer
- Real transaction IDs from provider
- Webhook callbacks
- Real SMS delivery

---

## 🚀 Moving to Production

Once you've tested and confirmed everything works in mock mode, you can switch to production:

### **Step 1: Get API Credentials**

1. **MTN MoMo:**

   - Sign up at [momodeveloper.mtn.com](https://momodeveloper.mtn.com)
   - Get API Key, API Secret, Subscription Key

2. **Airtel Money:**
   - Contact Airtel Business for API access

### **Step 2: Update Backend**

Follow the instructions in `BACKEND_API_TEMPLATE.md` to:

- Implement real MoMo API integration
- Add authentication
- Handle webhooks
- Store transactions in database

### **Step 3: Update Frontend**

In `src/services/momoService.ts`, replace mock functions with real API calls:

```typescript
// Change this:
export const initiateMomoPayment = mockMomoPayment;

// To this:
export const initiateMomoPayment = async (paymentData: MomoPaymentData) => {
  const response = await api.post("/payments/momo/initiate", paymentData);
  return response.data;
};
```

### **Step 4: Test with Real Money**

Start with small amounts (RWF 100) to test real transactions.

---

## 📊 Mock Mode Success Rate

The mock payment has a **90% success rate** to simulate real-world scenarios:

- **90% of payments succeed** → Shows success message
- **10% of payments fail** → Shows error message

This helps you test both success and failure flows.

---

## 💡 Tips

### **Quick Test:**

1. Login as buyer
2. Browse crops
3. Place order
4. Enter phone: `0788123456`
5. Select MTN
6. Click "Pay Now"
7. Wait 2-3 seconds
8. Should see success! ✅

### **Check Everything Works:**

Open console (F12) and look for:

```
🌐 API URL (web): http://localhost:5000/api
📤 API Request: POST /orders
💰 [MOCK] Initiating MoMo payment...
✅ [MOCK] Payment successful!
📱 [MOCK SMS] Sending to +250788123456
✅ API Response: POST /orders - 201
```

If you see all these logs, **MoMo is working perfectly!** 🎉

---

## ✅ Summary

### **To Test MoMo:**

1. ✅ Login as buyer
2. ✅ Place an order
3. ✅ Enter phone number (e.g., `0788123456`)
4. ✅ Select provider (MTN/Airtel)
5. ✅ Click "Pay Now"
6. ✅ Wait for success message
7. ✅ Check console logs

### **Signs MoMo is Working:**

- ✅ Modal opens smoothly
- ✅ Phone number formats automatically
- ✅ Validation works (rejects invalid numbers)
- ✅ Processing state shows
- ✅ Success/failure messages appear
- ✅ Transaction ID is generated
- ✅ Console shows detailed logs
- ✅ Order is created after payment

**If all these work, your MoMo integration is ready! 🚀**

---

## 📞 Need Help?

If something doesn't work:

1. **Check console logs** (F12) for error messages
2. **Check backend logs** for API errors
3. **Review `QUICK_START_MOMO_OFFLINE.md`** for setup instructions
4. **Review `OFFLINE_MOMO_SMS_FEATURES.md`** for technical details

**Happy Testing! 💰📱**
