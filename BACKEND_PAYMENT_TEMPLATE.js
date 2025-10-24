/**
 * ========================================
 * Backend Payment Routes - Template
 * ========================================
 * 
 * Copy this to your backend project:
 * File: routes/payments.js (or payments.ts if using TypeScript)
 * 
 * Then require/import in your main app.js:
 * const paymentRoutes = require('./routes/payments');
 * app.use('/api/payments', paymentRoutes);
 * 
 * ========================================
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// ⚠️ IMPORTANT: Add your auth middleware
// Import your authentication verification
// const { protect } = require('../middleware/auth');

/**
 * ========================================
 * ROUTE 1: Initiate Payment
 * ========================================
 * POST /api/payments/flutterwave/initiate
 * 
 * Purpose: Start a payment request
 * Called by: Frontend after user clicks "Pay Now"
 * 
 * Request:
 * {
 *   "amount": 50000,
 *   "phoneNumber": "+250788123456",
 *   "orderId": "ORD_123",
 *   "email": "user@example.com",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "paymentMethod": "momo"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "status": "pending",
 *   "referenceId": "FW_ORD_123_1234567890",
 *   "flutterwaveRef": "123456",
 *   "message": "Payment initiated"
 * }
 */

router.post('/flutterwave/initiate', async (req, res) => {
  try {
    const {
      amount,
      phoneNumber,
      orderId,
      email,
      firstName,
      lastName,
      currency,
      paymentMethod,
    } = req.body;

    // ✅ VALIDATION
    if (!amount || !phoneNumber || !orderId || !email || !paymentMethod) {
      console.log('❌ Missing required fields:', { amount, phoneNumber, orderId, email, paymentMethod });
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'Missing required fields: amount, phoneNumber, orderId, email, paymentMethod',
      });
    }

    // Amount should be positive integer
    if (amount <= 0 || !Number.isInteger(amount)) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'Amount must be a positive integer',
      });
    }

    // Payment method validation
    if (!['momo', 'airtel'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'Invalid payment method. Use "momo" or "airtel"',
      });
    }

    console.log('💳 Processing payment request:', {
      amount,
      phone: phoneNumber,
      method: paymentMethod,
      orderId,
    });

    // ✅ GENERATE UNIQUE REFERENCE
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const referenceId = `FW_${orderId}_${timestamp}_${random}`;

    console.log('📝 Generated reference ID:', referenceId);

    // ✅ DETERMINE PAYMENT METHOD
    // MTN: mobile_money_rwanda
    // Airtel: mobile_money_airtel_rwanda
    const flutterwavePaymentMethod =
      paymentMethod === 'momo'
        ? 'mobile_money_rwanda'
        : 'mobile_money_airtel_rwanda';

    // ✅ PREPARE FLUTTERWAVE PAYLOAD
    const flutterwavePayload = {
      tx_ref: referenceId,
      amount: Math.round(amount), // Ensure it's integer
      currency: currency || 'RWF',
      payment_method: flutterwavePaymentMethod,
      phone_number: phoneNumber,
      email: email,
      customer_name: `${firstName || 'Customer'} ${lastName || ''}`.trim(),
      customizations: {
        title: 'Agri-Logistics Platform',
        description: `Payment for Order ${orderId}`,
        // logo: 'https://your-app-logo-url.png', // Add your logo
      },
    };

    console.log('🔄 Flutterwave Payload:', JSON.stringify(flutterwavePayload, null, 2));

    // ✅ CALL FLUTTERWAVE API
    const flutterwaveResponse = await axios.post(
      `${process.env.FLUTTERWAVE_API_URL}/charges?type=mobile_money`,
      flutterwavePayload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Flutterwave Response:', JSON.stringify(flutterwaveResponse.data, null, 2));

    if (flutterwaveResponse.data.status === 'success') {
      const flutterwaveId = flutterwaveResponse.data.data.id;

      // 📝 OPTIONAL: Save transaction to database
      // try {
      //   const transaction = await Transaction.create({
      //     orderId,
      //     referenceId,
      //     flutterwaveId,
      //     phoneNumber,
      //     amount,
      //     currency: currency || 'RWF',
      //     paymentMethod,
      //     status: 'pending',
      //     createdAt: new Date(),
      //   });
      //   console.log('💾 Transaction saved:', transaction._id);
      // } catch (dbError) {
      //   console.warn('⚠️ Failed to save transaction:', dbError.message);
      //   // Don't fail the payment if DB fails
      // }

      return res.status(200).json({
        success: true,
        status: 'pending',
        referenceId: referenceId,
        flutterwaveRef: flutterwaveId,
        message: 'Payment initiated successfully. Please check your phone for a payment prompt.',
      });
    } else {
      console.error('❌ Flutterwave Error:', flutterwaveResponse.data);
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: flutterwaveResponse.data.message || 'Failed to initiate payment',
      });
    }
  } catch (error) {
    console.error('❌ Payment Initiation Error:', error.message);
    console.error('Response:', error.response?.data);

    return res.status(500).json({
      success: false,
      status: 'failed',
      message: error.response?.data?.message || 'Payment service error',
    });
  }
});

/**
 * ========================================
 * ROUTE 2: Check Payment Status
 * ========================================
 * GET /api/payments/flutterwave/status/:referenceId
 * 
 * Purpose: Check if payment was completed
 * Called by: Frontend polls this every 5 seconds
 * 
 * Response:
 * {
 *   "success": true,
 *   "status": "completed", // or "pending" or "failed"
 *   "transactionId": "5739194928",
 *   "referenceId": "FW_ORD_123_1234567890",
 *   "amount": 50000,
 *   "message": "Payment successful"
 * }
 */

router.get('/flutterwave/status/:referenceId', async (req, res) => {
  try {
    const { referenceId } = req.params;

    if (!referenceId) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'Reference ID required',
      });
    }

    console.log('🔍 Checking payment status for:', referenceId);

    // ✅ CHECK WITH FLUTTERWAVE
    const statusResponse = await axios.get(
      `${process.env.FLUTTERWAVE_API_URL}/transactions/verify_by_reference`,
      {
        params: {
          tx_ref: referenceId,
        },
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    console.log('Flutterwave Status Response:', JSON.stringify(statusResponse.data, null, 2));

    // Flutterwave returns array of transactions
    if (statusResponse.data.data && statusResponse.data.data.length > 0) {
      const transaction = statusResponse.data.data[0];
      const transactionStatus = transaction.status;

      // 📝 OPTIONAL: Update database
      // try {
      //   await Transaction.updateOne(
      //     { referenceId },
      //     { status: transactionStatus }
      //   );
      // } catch (dbError) {
      //   console.warn('Failed to update transaction status:', dbError.message);
      // }

      if (transactionStatus === 'successful') {
        console.log('✅ Payment successful:', referenceId);
        return res.status(200).json({
          success: true,
          status: 'completed',
          transactionId: transaction.id,
          referenceId: referenceId,
          amount: transaction.amount,
          currency: transaction.currency,
          message: 'Payment successful',
        });
      } else if (transactionStatus === 'failed') {
        console.log('❌ Payment failed:', referenceId);
        return res.status(200).json({
          success: false,
          status: 'failed',
          referenceId: referenceId,
          message: transaction.processor_response || 'Payment was declined',
        });
      } else {
        // pending, processing, etc.
        console.log('⏳ Payment still pending:', referenceId);
        return res.status(200).json({
          success: false,
          status: 'pending',
          referenceId: referenceId,
          message: 'Payment is still being processed. Please wait.',
        });
      }
    } else {
      console.warn('⚠️ No transaction found for:', referenceId);
      return res.status(200).json({
        success: false,
        status: 'pending',
        referenceId: referenceId,
        message: 'Payment status not found yet. Please try again.',
      });
    }
  } catch (error) {
    console.error('❌ Status Check Error:', error.message);
    console.error('Response:', error.response?.data);

    return res.status(500).json({
      success: false,
      status: 'failed',
      message: 'Failed to check payment status',
    });
  }
});

/**
 * ========================================
 * ROUTE 3: Verify Payment (Optional)
 * ========================================
 * POST /api/payments/flutterwave/verify
 * 
 * Purpose: Final verification after success
 * Called by: Backend confirmation (optional)
 * 
 * Request:
 * {
 *   "transactionId": "5739194928",
 *   "referenceId": "FW_ORD_123_1234567890"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Payment verified successfully"
 * }
 */

router.post('/flutterwave/verify', async (req, res) => {
  try {
    const { transactionId, referenceId } = req.body;

    if (!transactionId || !referenceId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and Reference ID required',
      });
    }

    console.log('🔐 Verifying payment:', { transactionId, referenceId });

    // ✅ FINAL VERIFICATION WITH FLUTTERWAVE
    const verifyResponse = await axios.get(
      `${process.env.FLUTTERWAVE_API_URL}/transactions/${transactionId}/verify`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    console.log('Verification Response:', JSON.stringify(verifyResponse.data, null, 2));

    if (verifyResponse.data.data.status === 'successful') {
      // 📝 OPTIONAL: Mark as verified in database
      // try {
      //   await Transaction.updateOne(
      //     { referenceId },
      //     { status: 'verified', verifiedAt: new Date() }
      //   );
      // } catch (dbError) {
      //   console.warn('Failed to mark as verified:', dbError.message);
      // }

      return res.status(200).json({
        success: true,
        status: 'completed',
        message: 'Payment verified successfully',
        transactionId: transactionId,
      });
    } else {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('❌ Verification Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Payment verification error',
    });
  }
});

/**
 * ========================================
 * ERROR HANDLING & BEST PRACTICES
 * ========================================
 * 
 * ✅ DO:
 * - Store Secret Key in .env only
 * - Validate all inputs
 * - Log transactions for debugging
 * - Handle network errors gracefully
 * - Return appropriate HTTP status codes
 * - Add rate limiting
 * - Use authentication middleware
 * 
 * ❌ DON'T:
 * - Expose Secret Key in code
 * - Trust frontend amount directly
 * - Log sensitive payment info
 * - Allow unlimited retry attempts
 * - Send Secret Key in responses
 * - Skip validation
 * 
 * ========================================
 */

module.exports = router;

/**
 * ========================================
 * REQUIRED ENVIRONMENT VARIABLES
 * ========================================
 * 
 * In your backend .env file, add:
 * 
 * FLUTTERWAVE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
 * FLUTTERWAVE_API_URL=https://api.flutterwave.com/v3
 * NODE_ENV=production
 * 
 * ========================================
 * SETUP INSTRUCTIONS
 * ========================================
 * 
 * 1. Create file: routes/payments.js
 * 2. Copy this entire code
 * 3. In app.js:
 *    const paymentRoutes = require('./routes/payments');
 *    app.use('/api/payments', paymentRoutes);
 * 4. In .env:
 *    FLUTTERWAVE_SECRET_KEY=sk_live_xxxxx
 *    FLUTTERWAVE_API_URL=https://api.flutterwave.com/v3
 * 5. Install: npm install axios dotenv
 * 6. Test with test keys first
 * 7. Switch to live keys when ready
 * 
 * ========================================
 */