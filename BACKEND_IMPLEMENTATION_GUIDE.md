# 🚀 Backend Implementation Guide - Code Examples

**Focus**: Implementing the critical missing pieces your frontend needs

---

## 🔴 CRITICAL #1: Token Refresh Endpoint

**Why?** Frontend gets stuck when access token expires (1 hour). Without this, users can't continue using the app.

### Step 1: Update User Model

```javascript
// src/models/user.js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        // Nigeria: +234 or 0 followed by 7,8,9 + 9 more digits
        // Rwanda: +250 or 0 followed by 7, then 8-9 + 7 more digits
        const nigerianRegex = /^(\+234|0)[789]\d{9}$/;
        const rwandanRegex = /^(\+250|0)7[8-9]\d{7}$/;
        return nigerianRegex.test(v) || rwandanRegex.test(v);
      },
      message: "Invalid phone format",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["farmer", "buyer", "transporter"],
    required: true,
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
```

### Step 2: Create Token Utility

```javascript
// src/utils/tokenUtils.js
const jwt = require("jsonwebtoken");

const generateTokens = (userId, role) => {
  // Access token: 1 hour
  const token = jwt.sign(
    {
      userId, // Store user ID
      role, // Store role for permission checks
      type: "access",
    },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1h" }
  );

  // Refresh token: 7 days
  const refreshToken = jwt.sign(
    {
      userId,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
    { expiresIn: "7d" }
  );

  return { token, refreshToken };
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
};

const verifyRefreshToken = (refreshToken) => {
  return jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
  );
};

module.exports = {
  generateTokens,
  verifyToken,
  verifyRefreshToken,
};
```

### Step 3: Add Refresh Endpoint

```javascript
// src/controllers/authController.js
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateTokens, verifyRefreshToken } = require("../utils/tokenUtils");

// Refresh token endpoint
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new tokens
    const { token, refreshToken: newRefreshToken } = generateTokens(
      user._id,
      user.role
    );

    return res.status(200).json({
      success: true,
      token,
      refreshToken: newRefreshToken,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

// Updated login endpoint
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validate input
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and password required",
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens(user._id, user.role);

    return res.status(200).json({
      success: true,
      token,
      refreshToken, // ← IMPORTANT: Frontend needs this!
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
```

### Step 4: Add to Routes

```javascript
// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Existing routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.me);

// ← ADD THIS NEW ROUTE
router.post("/refresh", authController.refresh);

module.exports = router;
```

### Step 5: Authentication Middleware

```javascript
// src/middleware/auth.js
const { verifyToken } = require("../utils/tokenUtils");
const User = require("../models/user");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verify token
    const decoded = verifyToken(token);

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Only ${roles.join("/")} can access this`,
      });
    }
    next();
  };
};
```

---

## 🔴 CRITICAL #2: Smart Order Filtering

**Why?** Frontend calls `/orders/my-orders` expecting role-based filtering. Currently returns nothing.

### Implementation

```javascript
// src/controllers/orderController.js
const Order = require("../models/order");
const Crop = require("../models/crop");

// Get user's relevant orders (smart filtering by role)
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    let query = {};

    if (userRole === "farmer") {
      // Farmers see orders for their crops
      query.farmerId = userId;
    } else if (userRole === "buyer") {
      // Buyers see orders they placed
      query.buyerId = userId;
    } else if (userRole === "transporter") {
      // Transporters see orders assigned to them
      query.transporterId = userId;
    }

    const orders = await Order.find(query)
      .populate("cropId")
      .populate("farmerId", "name phone")
      .populate("buyerId", "name phone")
      .populate("transporterId", "name phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// Get all crops (for buyers to browse)
exports.getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ status: "listed" })
      .populate("farmerId", "name phone location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: crops,
    });
  } catch (error) {
    console.error("Get crops error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
    });
  }
};
```

---

## 🟡 HIGH PRIORITY #1: Crop Management

### Complete Crop Controller

```javascript
// src/controllers/cropController.js
const Crop = require("../models/crop");

// Get all crops (for buyers)
exports.getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ status: "listed" })
      .populate("farmerId", "name phone location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: crops,
    });
  } catch (error) {
    console.error("Get all crops error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
    });
  }
};

// Get single crop
exports.getCropById = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await Crop.findById(id).populate(
      "farmerId",
      "name phone location"
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    console.error("Get crop error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch crop",
    });
  }
};

// Create new crop (farmer only)
exports.createCrop = async (req, res) => {
  try {
    const { name, quantity, unit, harvestDate, pricePerUnit, location } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !quantity ||
      !unit ||
      !harvestDate ||
      pricePerUnit === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const crop = new Crop({
      farmerId: req.userId, // Current user is the farmer
      name,
      quantity,
      unit,
      harvestDate,
      pricePerUnit,
      location,
      status: "listed",
    });

    await crop.save();

    return res.status(201).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    console.error("Create crop error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create crop",
    });
  }
};

// Update crop (farmer only, own crops)
exports.updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await Crop.findById(id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    // Check if user is the farmer
    if (crop.farmerId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the farmer can update this crop",
      });
    }

    // Update fields
    Object.assign(crop, req.body);
    await crop.save();

    return res.status(200).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    console.error("Update crop error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update crop",
    });
  }
};

// Delete crop (farmer only)
exports.deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await Crop.findById(id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    // Check if user is the farmer
    if (crop.farmerId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the farmer can delete this crop",
      });
    }

    await Crop.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Crop deleted",
    });
  } catch (error) {
    console.error("Delete crop error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete crop",
    });
  }
};
```

### Crop Routes

```javascript
// src/routes/cropRoutes.js
const express = require("express");
const router = express.Router();
const cropController = require("../controllers/cropController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, cropController.getAllCrops);
router.get("/:id", protect, cropController.getCropById);
router.post("/", protect, authorize("farmer"), cropController.createCrop);
router.put("/:id", protect, authorize("farmer"), cropController.updateCrop);
router.delete("/:id", protect, authorize("farmer"), cropController.deleteCrop);

module.exports = router;
```

---

## 🟡 HIGH PRIORITY #2: Order Management - Accept Endpoint

### Critical Missing Endpoint

```javascript
// In src/controllers/orderController.js

// Accept order (transporter assigns themselves)
exports.acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only unassigned orders can be accepted
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order already assigned or completed",
      });
    }

    // Assign transporter and update status
    order.transporterId = userId;
    order.status = "accepted";
    await order.save();

    // Update crop status to 'matched'
    await Crop.findByIdAndUpdate(order.cropId, { status: "matched" });

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Accept order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept order",
    });
  }
};
```

---

## 🟡 HIGH PRIORITY #3: Payment Mock Endpoints

**For Demo**: Your frontend uses mock payments, but backend should have endpoints for when you switch to live.

```javascript
// src/controllers/paymentController.js
const Order = require("../models/order");

exports.initiatePayment = async (req, res) => {
  try {
    const {
      amount,
      phoneNumber,
      orderId,
      email,
      firstName,
      lastName,
      paymentMethod,
    } = req.body;

    // Validate inputs
    if (!amount || !phoneNumber || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Verify amount matches order
    const order = await Order.findById(orderId);
    if (!order || order.totalPrice !== amount) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch",
      });
    }

    // Generate reference
    const reference = `FW_${orderId}_${Date.now()}`;

    // In production, call Flutterwave API here
    // For now, mock response

    return res.status(200).json({
      success: true,
      status: "pending",
      referenceId: reference,
      message: "Payment initiated",
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment service error",
    });
  }
};

exports.checkPaymentStatus = async (req, res) => {
  try {
    const { referenceId } = req.params;

    // In production, verify with Flutterwave API
    // For now, mock successful payment after a few seconds

    return res.status(200).json({
      success: true,
      status: "completed",
      referenceId,
      message: "Payment successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Status check error",
    });
  }
};
```

---

## ✅ Implementation Checklist

### Phase 1 (This Week)

- [ ] Create `tokenUtils.js` with `generateTokens()` and `verifyRefreshToken()`
- [ ] Implement `/api/auth/refresh` endpoint
- [ ] Update login response to include `refreshToken`
- [ ] Update auth middleware to extract userId and role
- [ ] Implement `/api/orders/my-orders` with role-based filtering
- [ ] Fix GET `/api/crops` to return all crops (with farmerId populated)

### Phase 2 (Next Week)

- [ ] Complete crop CRUD endpoints
- [ ] Implement order accept endpoint
- [ ] Update order status flow
- [ ] Add payment mock endpoints
- [ ] Test all flows with frontend

### Phase 3 (Later)

- [ ] Real Flutterwave integration
- [ ] Trip tracking endpoints
- [ ] Real-time WebSocket updates
- [ ] Analytics/reporting

---

## 🧪 Testing Token Refresh

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0788123456",
    "password": "MyPassword123"
  }'

# Response includes: token, refreshToken, user

# 2. Use token in request (it works for 1 hour)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGc..."

# 3. After 1 hour, get 401 error, then refresh
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'

# Response includes: new token, new refreshToken
```

---

## 📝 .env Configuration

```env
# Database
MONGODB_URI=mongodb://localhost:27017/agri-logistics

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this

# Server
PORT=5000
NODE_ENV=development

# Flutterwave (for later)
FLUTTERWAVE_SECRET_KEY=sk_test_xxxxx
FLUTTERWAVE_PUBLIC_KEY=pk_test_xxxxx
```

---

## 🚨 Common Mistakes to Avoid

1. ❌ **Sending password in responses** → Always omit `password` field
2. ❌ **Not populating foreign keys** → Use `.populate()` for farmerId, buyerId
3. ❌ **Role-based checks only in frontend** → Always validate on backend!
4. ❌ **Not validating amount on server** → Prevent payment tampering
5. ❌ **Forgetting to include `userId` in JWT payload** → Frontend needs it in interceptors
6. ❌ **CORS not configured** → Frontend requests from different port/device

---

These implementations will get your backend aligned with the frontend! 🚀
