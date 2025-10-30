# Backend Setup Checklist

## Follow This Step-by-Step to Get Backend Running in 30 Minutes

---

## ✅ PHASE 1: PREREQUISITES (5 MINUTES)

- [ ] **Install Node.js 18+**

  - Download from https://nodejs.org/
  - Verify: `node --version` (should be v18+)
  - Verify: `npm --version` (should be v9+)

- [ ] **Install PostgreSQL 14+**

  - **Windows:** https://www.postgresql.org/download/windows/
  - **macOS:** `brew install postgresql@15`
  - **Linux:** `sudo apt-get install postgresql`

- [ ] **Verify PostgreSQL Running**

  - macOS: `brew services start postgresql@15`
  - Linux: `sudo systemctl status postgresql`
  - Windows: Open Services app and check "postgresql-x64"

- [ ] **Install a Database Client (Optional but helpful)**
  - DBeaver (free): https://dbeaver.io/
  - OR pgAdmin: https://www.pgadmin.org/
  - OR use command line `psql`

---

## ✅ PHASE 2: DATABASE SETUP (5 MINUTES)

### Step 1: Create Database & User

Open terminal/PowerShell and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# In the psql prompt, run:
CREATE DATABASE agri_db;
CREATE USER agri_user WITH PASSWORD 'agri_password_123';
ALTER ROLE agri_user SET client_encoding TO 'utf8';
ALTER ROLE agri_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE agri_user SET default_transaction_deferrable TO on;
ALTER ROLE agri_user SET default_time_zone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE agri_db TO agri_user;
\q
```

### Step 2: Verify Connection

```bash
# Test connection
psql -U agri_user -d agri_db -c "SELECT NOW();"

# You should see the current timestamp
```

- [ ] Database created
- [ ] User created
- [ ] Connection verified

---

## ✅ PHASE 3: PROJECT SETUP (8 MINUTES)

### Step 1: Create Backend Project

```bash
# Create new directory
mkdir agri-logistics-backend
cd agri-logistics-backend

# Initialize Node project
npm init -y

# Install core dependencies
npm install express cors helmet dotenv axios morgan uuid
npm install pg jsonwebtoken bcryptjs joi yup
npm install winston nodemailer socket.io

# Install dev dependencies
npm install --save-dev typescript @types/node @types/express ts-node nodemon
npm install --save-dev ts-jest @types/jest jest

# Verify installations
npm list express
npm list typescript
```

### Step 2: Setup TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Setup npm Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

- [ ] Project initialized
- [ ] Dependencies installed
- [ ] TypeScript configured
- [ ] npm scripts added

---

## ✅ PHASE 4: CREATE FILE STRUCTURE (5 MINUTES)

```bash
# Create directories
mkdir -p src/config
mkdir -p src/models
mkdir -p src/services
mkdir -p src/controllers
mkdir -p src/routes
mkdir -p src/middleware
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/__tests__
mkdir -p migrations
mkdir -p logs

# Create .env file
touch .env
touch .env.example
touch src/server.ts
```

- [ ] All directories created
- [ ] env files created

---

## ✅ PHASE 5: ENVIRONMENT SETUP (2 MINUTES)

### Create `.env`:

```bash
# Server
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agri_db
DB_USER=agri_user
DB_PASSWORD=agri_password_123
DATABASE_URL=postgresql://agri_user:agri_password_123@localhost:5432/agri_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_12345
JWT_REFRESH_EXPIRY=30d

# Frontend
FRONTEND_URL=http://localhost:8082

# Payment
FLUTTERWAVE_PUBLIC_KEY=pk_test_xxxxx
FLUTTERWAVE_SECRET_KEY=sk_test_xxxxx
AFRICAS_TALKING_API_KEY=xxxxx

# Logging
LOG_LEVEL=info

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:8082,http://localhost:19000,http://localhost:3000
```

### Create `.env.example`:

```bash
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agri_db
DB_USER=agri_user
DB_PASSWORD=your_password
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:8082
```

- [ ] `.env` created with correct values
- [ ] `.env.example` created

---

## ✅ PHASE 6: CORE FILES (10 MINUTES)

Create these 8 core files to get started:

### 1. `src/config/database.ts`

```typescript
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (error) => {
  console.error("❌ Database error:", error);
});

export { pool };
```

### 2. `src/config/env.ts`

```typescript
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000"),
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:8082",
};
```

### 3. `src/config/logger.ts`

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
```

### 4. `src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
```

### 5. `src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import logger from "@/config/logger";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || "Internal Server Error",
  });
};
```

### 6. `src/routes/auth.ts`

```typescript
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "@/config/database";
import { env } from "@/config/env";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { phone, password, firstName, lastName, role } = req.body;

    if (!phone || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO users (id, phone, first_name, last_name, role, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, phone, first_name, last_name, role`,
      [id, phone, firstName, lastName, role, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRY,
      }
    );

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE phone = $1", [
      phone,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRY,
      }
    );

    res.json({
      success: true,
      data: {
        user: { id: user.id, phone: user.phone, role: user.role },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 7. `src/routes/health.ts`

```typescript
import { Router, Request, Response } from "express";
import { pool } from "@/config/database";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");

    res.json({
      status: "UP",
      timestamp: new Date(),
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "DOWN",
      error: "Database connection failed",
    });
  }
});

export default router;
```

### 8. `src/server.ts`

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { errorHandler } from "@/middleware/errorHandler";
import { env } from "@/config/env";
import logger from "@/config/logger";
import authRoutes from "@/routes/auth";
import healthRoutes from "@/routes/health";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json());

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  logger.info(`✅ Server running on http://localhost:${PORT}/api`);
});

export default app;
```

- [ ] All 8 core files created

---

## ✅ PHASE 7: DATABASE MIGRATIONS (3 MINUTES)

Create these migration files and run them:

### Create migration file: `migrations/001_create_tables.sql`

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('shipper', 'transporter', 'receiver', 'admin')),
    verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Cargo table
CREATE TABLE cargo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10, 2),
    unit VARCHAR(50),
    price_per_unit DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    origin_location VARCHAR(255),
    destination_location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_cargo_user_id ON cargo(user_id);
CREATE INDEX idx_cargo_status ON cargo(status);

-- Trips table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transporter_id UUID NOT NULL REFERENCES users(id),
    cargo_id UUID REFERENCES cargo(id),
    status VARCHAR(50) DEFAULT 'pending',
    vehicle_type VARCHAR(50),
    capacity_total DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_trips_transporter_id ON trips(transporter_id);
CREATE INDEX idx_trips_cargo_id ON trips(cargo_id);
CREATE INDEX idx_trips_status ON trips(status);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    cargo_id UUID REFERENCES cargo(id),
    trip_id UUID REFERENCES trips(id),
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rated_user_id UUID NOT NULL REFERENCES users(id),
    rating_user_id UUID NOT NULL REFERENCES users(id),
    trip_id UUID REFERENCES trips(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ratings_rated_user ON ratings(rated_user_id);
CREATE INDEX idx_ratings_trip ON ratings(trip_id);
```

### Run migrations:

```bash
psql -U agri_user -d agri_db -f migrations/001_create_tables.sql
```

Verify:

```bash
psql -U agri_user -d agri_db -c "\dt"
```

You should see 5 tables: users, cargo, trips, payments, ratings

- [ ] Migrations created
- [ ] Tables verified

---

## ✅ PHASE 8: VERIFY EVERYTHING WORKS (3 MINUTES)

### Step 1: Build TypeScript

```bash
npm run build
# Should complete without errors
```

### Step 2: Start Development Server

```bash
npm run dev
# Should show: ✅ Server running on http://localhost:5000/api
```

- [ ] TypeScript compiles
- [ ] Server starts successfully
- [ ] Logs show "Connected to PostgreSQL"

### Step 3: Test API

Open another terminal and test:

```bash
# Test health endpoint
curl http://localhost:5000/api/health
# Should return: {"status":"UP",...}

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+250700000001",
    "password": "test123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "transporter"
  }'
# Should return user and token

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+250700000001",
    "password": "test123"
  }'
# Should return user and token
```

- [ ] Health endpoint works
- [ ] Registration works
- [ ] Login works

---

## ✅ PHASE 9: EXTEND WITH MORE ENDPOINTS (NEXT STEPS)

Now that basic backend is running:

1. **Copy Cargo Controller & Routes** from `BACKEND_CONTROLLERS_IMPLEMENTATION.md`
2. **Copy Trip Controller & Routes**
3. **Copy Rating Controller & Routes**
4. **Copy Payment Controller & Routes**
5. **Add WebSocket for real-time features**
6. **Add Email notifications**

---

## ✅ FINAL CHECKLIST

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] Database and user created
- [ ] Project initialized with npm
- [ ] All directories created
- [ ] .env file configured
- [ ] All 8 core files created
- [ ] Migrations run successfully
- [ ] Server starts with `npm run dev`
- [ ] API endpoints respond correctly
- [ ] Ready to add more controllers

---

## 🎯 YOU'RE DONE!

Your backend is now running! Next steps:

1. ✅ **Test Frontend Connection** - Update frontend to use `http://localhost:5000/api`
2. ✅ **Add More Endpoints** - Copy from `BACKEND_CONTROLLERS_IMPLEMENTATION.md`
3. ✅ **Setup Payment Integration** - Configure Flutterwave/MoMo
4. ✅ **Add Ratings System** - Implement from COMPLETE_RATINGS_INTEGRATION_CHECKLIST.md
5. ✅ **Deploy to Production** - Follow deployment section in main guide

---

## 🆘 TROUBLESHOOTING

**Problem:** `psql: error: could not connect to server`

- **Solution:** Make sure PostgreSQL service is running
  - macOS: `brew services start postgresql@15`
  - Linux: `sudo systemctl start postgresql`

**Problem:** `Error: connect ECONNREFUSED`

- **Solution:** Check DATABASE_URL in .env is correct

**Problem:** `Cannot find module '@/config/database'`

- **Solution:** Make sure paths are set correctly in tsconfig.json

**Problem:** Port 5000 already in use

- **Solution:** Change PORT in .env or kill the process using port 5000

---

**Estimated Time to Complete:** 30 minutes  
**Difficulty:** Intermediate  
**Support:** Refer to COMPLETE_BACKEND_IMPLEMENTATION_GUIDE.md for details
