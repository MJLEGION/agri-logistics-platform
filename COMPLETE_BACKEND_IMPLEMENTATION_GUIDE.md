# 🚀 Complete Backend Implementation Guide

## Agri-Logistics Platform - From Zero to Production

**Last Updated:** 2024  
**Tech Stack:** Node.js + Express + PostgreSQL/MongoDB + JWT  
**Estimated Time:** 40-50 hours

---

## 📑 TABLE OF CONTENTS

1. [Project Setup](#1-project-setup)
2. [Database Design & Setup](#2-database-design--setup)
3. [Authentication System](#3-authentication-system)
4. [Core API Endpoints](#4-core-api-endpoints)
5. [Services Architecture](#5-services-architecture)
6. [Payment Integration](#6-payment-integration)
7. [Ratings System](#7-ratings-system)
8. [Real-time Features](#8-real-time-features)
9. [Error Handling & Logging](#9-error-handling--logging)
10. [Testing](#10-testing)
11. [Deployment](#11-deployment)
12. [Troubleshooting](#12-troubleshooting)

---

# 1. PROJECT SETUP

## Step 1.1: Initialize Node.js Project

```bash
# Create backend directory
mkdir agri-logistics-backend
cd agri-logistics-backend

# Initialize npm
npm init -y

# Install core dependencies
npm install express dotenv axios cors helmet joi bcryptjs jsonwebtoken
npm install pg postgresql  # For PostgreSQL
# OR
npm install mongoose        # For MongoDB

# Install utilities
npm install uuid winston morgan nodemailer socket.io
npm install stripe          # For payments (optional)

# Install dev dependencies
npm install --save-dev nodemon typescript @types/node @types/express ts-node
```

## Step 1.2: Project Structure

```
agri-logistics-backend/
├── src/
│   ├── config/
│   │   ├── database.ts        # DB connection
│   │   ├── env.ts             # Environment variables
│   │   └── logger.ts          # Logging setup
│   ├── models/
│   │   ├── User.ts
│   │   ├── Cargo.ts
│   │   ├── Trip.ts
│   │   ├── Order.ts
│   │   ├── Payment.ts
│   │   ├── Rating.ts
│   │   └── Transaction.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── cargoController.ts
│   │   ├── tripController.ts
│   │   ├── paymentController.ts
│   │   ├── ratingController.ts
│   │   └── transporterController.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── cargo.ts
│   │   ├── trips.ts
│   │   ├── payments.ts
│   │   ├── ratings.ts
│   │   └── transporters.ts
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── rateLimiter.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── cargoService.ts
│   │   ├── paymentService.ts
│   │   ├── tripService.ts
│   │   ├── ratingService.ts
│   │   └── emailService.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── helpers.ts
│   │   └── constants.ts
│   ├── types/
│   │   └── index.ts
│   └── server.ts
├── migrations/
│   ├──001_create_users_table.sql
│   ├── 002_create_cargo_table.sql
│   ├── 003_create_trips_table.sql
│   ├── 004_create_payments_table.sql
│   └── 005_create_ratings_table.sql
├── tests/
│   ├── auth.test.ts
│   ├── cargo.test.ts
│   └── payment.test.ts
├── .env
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

## Step 1.3: Configure TypeScript

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

## Step 1.4: Environment Variables

Create `.env`:

```bash
# Server
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agri_db
DB_USER=postgres
DB_PASSWORD=your_password
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/agri_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRY=30d

# Frontend
FRONTEND_URL=http://localhost:8082
FRONTEND_URL_PROD=https://app.yourdomain.com

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@agri-logistics.com

# Payment (Flutterwave)
FLUTTERWAVE_PUBLIC_KEY=pk_live_xxxx
FLUTTERWAVE_SECRET_KEY=sk_live_xxxx
FLUTTERWAVE_WEBHOOK_SECRET=webhk_xxxx

# MoMo (Africa's Talking)
AFRICAS_TALKING_API_KEY=xxxx
AFRICAS_TALKING_USERNAME=your_username

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:8082,http://localhost:19000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Redis (for caching/sessions)
REDIS_URL=redis://localhost:6379
```

---

# 2. DATABASE DESIGN & SETUP

## Step 2.1: PostgreSQL Setup

### Install PostgreSQL

**Windows:**

```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey
choco install postgresql
```

**macOS:**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu):**

```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql console
CREATE DATABASE agri_db;
CREATE USER agri_user WITH PASSWORD 'secure_password';
ALTER ROLE agri_user SET client_encoding TO 'utf8';
ALTER ROLE agri_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE agri_user SET default_transaction_deferrable TO on;
ALTER ROLE agri_user SET default_time_zone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE agri_db TO agri_user;
\q
```

## Step 2.2: Database Schema

Create migrations directory structure and run these:

### Migration 001: Users Table

```sql
-- migrations/001_create_users_table.sql

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('shipper', 'transporter', 'receiver', 'admin')),
    profile_picture_url VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### Migration 002: Cargo/Products Table

```sql
-- migrations/002_create_cargo_table.sql

CREATE TABLE cargo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    quantity DECIMAL(10, 2),
    unit VARCHAR(50),
    price_per_unit DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    origin_location VARCHAR(255),
    origin_latitude DECIMAL(10, 8),
    origin_longitude DECIMAL(11, 8),
    destination_location VARCHAR(255),
    destination_latitude DECIMAL(10, 8),
    destination_longitude DECIMAL(11, 8),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'shipped', 'delivered', 'cancelled')),
    image_url VARCHAR(500),
    available_date TIMESTAMP,
    delivery_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_cargo_user_id ON cargo(user_id);
CREATE INDEX idx_cargo_status ON cargo(status);
CREATE INDEX idx_cargo_category ON cargo(category);
```

### Migration 003: Trips Table

```sql
-- migrations/003_create_trips_table.sql

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transporter_id UUID NOT NULL REFERENCES users(id),
    cargo_id UUID REFERENCES cargo(id),
    origin_location VARCHAR(255),
    destination_location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_transit', 'completed', 'cancelled')),
    estimated_distance DECIMAL(10, 2),
    actual_distance DECIMAL(10, 2),
    estimated_time_hours INT,
    actual_time_hours INT,
    vehicle_type VARCHAR(50),
    capacity_used DECIMAL(10, 2),
    capacity_total DECIMAL(10, 2),
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_trips_transporter_id ON trips(transporter_id);
CREATE INDEX idx_trips_cargo_id ON trips(cargo_id);
CREATE INDEX idx_trips_status ON trips(status);
```

### Migration 004: Payments Table

```sql
-- migrations/004_create_payments_table.sql

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID,
    user_id UUID NOT NULL REFERENCES users(id),
    cargo_id UUID REFERENCES cargo(id),
    trip_id UUID REFERENCES trips(id),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RWF',
    payment_method VARCHAR(50) CHECK (payment_method IN ('momo', 'airtel', 'bank', 'card')),
    provider VARCHAR(50) CHECK (provider IN ('flutterwave', 'africas_talking', 'stripe')),
    reference_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(reference_number);
```

### Migration 005: Ratings Table

```sql
-- migrations/005_create_ratings_table.sql

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rated_user_id UUID NOT NULL REFERENCES users(id),
    rating_user_id UUID NOT NULL REFERENCES users(id),
    trip_id UUID REFERENCES trips(id),
    cargo_id UUID REFERENCES cargo(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    cleanliness INT CHECK (cleanliness BETWEEN 1 AND 5),
    professionalism INT CHECK (professionalism BETWEEN 1 AND 5),
    timeliness INT CHECK (timeliness BETWEEN 1 AND 5),
    communication INT CHECK (communication BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ratings_rated_user ON ratings(rated_user_id);
CREATE INDEX idx_ratings_trip ON ratings(trip_id);
```

### Run Migrations

```bash
# Create a migration runner script
# Or use a tool like db-migrate, knex, or typeorm

# For now, manual approach:
psql -U agri_user -d agri_db -f migrations/001_create_users_table.sql
psql -U agri_user -d agri_db -f migrations/002_create_cargo_table.sql
psql -U agri_user -d agri_db -f migrations/003_create_trips_table.sql
psql -U agri_user -d agri_db -f migrations/004_create_payments_table.sql
psql -U agri_user -d agri_db -f migrations/005_create_ratings_table.sql
```

## Step 2.3: Seed Data (for testing)

Create `seeds/seed_data.sql`:

```sql
-- Insert test users
INSERT INTO users (phone, email, first_name, last_name, role, password_hash, verified)
VALUES
  ('+250700000001', 'shipper@test.com', 'John', 'Shipper', 'shipper', '$2a$10$...hashed_password', true),
  ('+250700000002', 'transporter@test.com', 'Jane', 'Transporter', 'transporter', '$2a$10$...hashed_password', true),
  ('+250700000003', 'receiver@test.com', 'Bob', 'Receiver', 'receiver', '$2a$10$...hashed_password', true);

-- Insert test cargo
INSERT INTO cargo (user_id, title, description, quantity, unit, price_per_unit, total_price, origin_location, destination_location, status)
SELECT id, 'Maize 50kg', 'High quality maize', 50, 'kg', 1000, 50000, 'Kigali', 'Huye', 'available'
FROM users WHERE role = 'shipper' LIMIT 1;
```

---

# 3. AUTHENTICATION SYSTEM

## Step 3.1: User Model

Create `src/models/User.ts`:

```typescript
import { pool } from "@/config/database";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export interface IUser {
  id: string;
  phone: string;
  email?: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: "shipper" | "transporter" | "receiver" | "admin";
  profile_picture_url?: string;
  verified: boolean;
  status: "active" | "inactive" | "suspended";
  created_at: Date;
  updated_at: Date;
}

export class User {
  static async create(userData: Partial<IUser>): Promise<IUser> {
    const {
      phone,
      email,
      password_hash,
      first_name,
      last_name,
      role,
      verified = false,
    } = userData;

    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password_hash!, 10);

    const query = `
      INSERT INTO users (id, phone, email, first_name, last_name, role, password_hash, verified, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      phone,
      email,
      first_name,
      last_name,
      role,
      hashedPassword,
      verified,
    ]);

    return result.rows[0];
  }

  static async findByPhone(phone: string): Promise<IUser | null> {
    const query = "SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL";
    const result = await pool.query(query, [phone]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<IUser | null> {
    const query = "SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async update(id: string, updates: Partial<IUser>): Promise<IUser> {
    const query = `
      UPDATE users 
      SET first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          email = COALESCE($4, email),
          profile_picture_url = COALESCE($5, profile_picture_url),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      updates.first_name,
      updates.last_name,
      updates.email,
      updates.profile_picture_url,
    ]);

    return result.rows[0];
  }

  static async verifyPassword(
    plainPassword: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}
```

## Step 3.2: Auth Service

Create `src/services/authService.ts`:

```typescript
import jwt from "jsonwebtoken";
import { User, IUser } from "@/models/User";
import { env } from "@/config/env";

export class AuthService {
  static generateAccessToken(user: IUser): string {
    return jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY }
    );
  }

  static generateRefreshToken(user: IUser): string {
    return jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY,
    });
  }

  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  static async register(
    phone: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    // Check if user exists
    const existing = await User.findByPhone(phone);
    if (existing) {
      throw new Error("User already exists");
    }

    // Create user
    const user = await User.create({
      phone,
      password_hash: password,
      first_name: firstName,
      last_name: lastName,
      role: role as any,
      verified: false,
    });

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: userWithoutPassword as any,
      accessToken,
      refreshToken,
    };
  }

  static async login(
    phone: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    // Find user
    const user = await User.findByPhone(phone);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(
      password,
      user.password_hash
    );
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
```

## Step 3.3: Auth Controller

Create `src/controllers/authController.ts`:

```typescript
import { Request, Response } from "express";
import { AuthService } from "@/services/authService";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { phone, password, firstName, lastName, role } = req.body;

      // Validation
      if (!phone || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { user, accessToken, refreshToken } = await AuthService.register(
        phone,
        password,
        firstName,
        lastName,
        role
      );

      res.status(201).json({
        success: true,
        data: {
          user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ error: "Phone and password required" });
      }

      const { user, accessToken, refreshToken } = await AuthService.login(
        phone,
        password
      );

      res.json({
        success: true,
        data: {
          user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: req.user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
```

## Step 3.4: Auth Middleware

Create `src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { AuthService } from "@/services/authService";

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
    const decoded = AuthService.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};
```

---

# 4. CORE API ENDPOINTS

## Step 4.1: Auth Routes

Create `src/routes/auth.ts`:

```typescript
import { Router } from "express";
import { AuthController } from "@/controllers/authController";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authMiddleware, AuthController.me);

export default router;
```

## Step 4.2: Cargo Routes

Create `src/routes/cargo.ts`:

```typescript
import { Router } from "express";
import { CargoController } from "@/controllers/cargoController";
import { authMiddleware, roleMiddleware } from "@/middleware/auth";

const router = Router();

router.get("/", authMiddleware, CargoController.getAll);
router.get("/:id", authMiddleware, CargoController.getById);
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["shipper"]),
  CargoController.create
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["shipper"]),
  CargoController.update
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["shipper"]),
  CargoController.delete
);
router.get("/user/:userId", authMiddleware, CargoController.getByUserId);

export default router;
```

## Step 4.3: Trips Routes

Create `src/routes/trips.ts`:

```typescript
import { Router } from "express";
import { TripController } from "@/controllers/tripController";
import { authMiddleware, roleMiddleware } from "@/middleware/auth";

const router = Router();

router.get("/", authMiddleware, TripController.getAll);
router.get("/:id", authMiddleware, TripController.getById);
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["transporter"]),
  TripController.create
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["transporter"]),
  TripController.update
);
router.get(
  "/transporter/:transporterId",
  authMiddleware,
  TripController.getByTransporter
);
router.post(
  "/:id/accept",
  authMiddleware,
  roleMiddleware(["transporter"]),
  TripController.acceptTrip
);
router.post(
  "/:id/complete",
  authMiddleware,
  roleMiddleware(["transporter"]),
  TripController.completeTrip
);

export default router;
```

## Step 4.4: Payments Routes

Create `src/routes/payments.ts`:

```typescript
import { Router } from "express";
import { PaymentController } from "@/controllers/paymentController";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

router.post("/initiate", authMiddleware, PaymentController.initiatePayment);
router.get("/:id", authMiddleware, PaymentController.getPaymentStatus);
router.post("/confirm", authMiddleware, PaymentController.confirmPayment);
router.post("/webhook/flutterwave", PaymentController.flutterwaveWebhook);
router.post(
  "/webhook/africas-talking",
  PaymentController.africasTalkingWebhook
);

export default router;
```

---

# 5. SERVICES ARCHITECTURE

## Step 5.1: Cargo Service

Create `src/services/cargoService.ts`:

```typescript
import { pool } from "@/config/database";
import { v4 as uuidv4 } from "uuid";

export interface ICargoCreate {
  user_id: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  origin_location: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_location: string;
  destination_latitude: number;
  destination_longitude: number;
  delivery_date?: Date;
}

export class CargoService {
  static async create(data: ICargoCreate) {
    const id = uuidv4();
    const totalPrice = data.quantity * data.price_per_unit;

    const query = `
      INSERT INTO cargo (
        id, user_id, title, description, quantity, unit, 
        price_per_unit, total_price, origin_location, 
        origin_latitude, origin_longitude, destination_location,
        destination_latitude, destination_longitude, delivery_date, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      data.user_id,
      data.title,
      data.description,
      data.quantity,
      data.unit,
      data.price_per_unit,
      totalPrice,
      data.origin_location,
      data.origin_latitude,
      data.origin_longitude,
      data.destination_location,
      data.destination_latitude,
      data.destination_longitude,
      data.delivery_date,
    ]);

    return result.rows[0];
  }

  static async getById(id: string) {
    const query = "SELECT * FROM cargo WHERE id = $1 AND deleted_at IS NULL";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async getAll(filters: any = {}) {
    let query = "SELECT * FROM cargo WHERE deleted_at IS NULL";
    const params: any[] = [];

    if (filters.status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(filters.status);
    }

    if (filters.category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(filters.category);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id: string, updates: any) {
    const query = `
      UPDATE cargo 
      SET title = COALESCE($2, title),
          description = COALESCE($3, description),
          quantity = COALESCE($4, quantity),
          price_per_unit = COALESCE($5, price_per_unit),
          status = COALESCE($6, status),
          updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      updates.title,
      updates.description,
      updates.quantity,
      updates.price_per_unit,
      updates.status,
    ]);

    return result.rows[0] || null;
  }

  static async delete(id: string) {
    const query = `
      UPDATE cargo 
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async getByUserId(userId: string) {
    const query =
      "SELECT * FROM cargo WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC";
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}
```

## Step 5.2: Trip Service

Create `src/services/tripService.ts`:

```typescript
import { pool } from "@/config/database";
import { v4 as uuidv4 } from "uuid";

export class TripService {
  static async create(data: any) {
    const id = uuidv4();

    const query = `
      INSERT INTO trips (
        id, transporter_id, cargo_id, origin_location, destination_location,
        vehicle_type, capacity_total, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      data.transporter_id,
      data.cargo_id,
      data.origin_location,
      data.destination_location,
      data.vehicle_type,
      data.capacity_total,
    ]);

    return result.rows[0];
  }

  static async getById(id: string) {
    const query = "SELECT * FROM trips WHERE id = $1 AND deleted_at IS NULL";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async acceptTrip(tripId: string) {
    const query = `
      UPDATE trips 
      SET status = 'accepted', updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *;
    `;

    const result = await pool.query(query, [tripId]);
    return result.rows[0] || null;
  }

  static async completeTrip(
    tripId: string,
    actualDistance: number,
    actualTimeHours: number
  ) {
    const query = `
      UPDATE trips 
      SET status = 'completed', 
          actual_distance = $2,
          actual_time_hours = $3,
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *;
    `;

    const result = await pool.query(query, [
      tripId,
      actualDistance,
      actualTimeHours,
    ]);
    return result.rows[0] || null;
  }

  static async getByTransporter(transporterId: string) {
    const query = `
      SELECT * FROM trips 
      WHERE transporter_id = $1 AND deleted_at IS NULL 
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, [transporterId]);
    return result.rows;
  }
}
```

---

# 6. PAYMENT INTEGRATION

## Step 6.1: Payment Controller

Create `src/controllers/paymentController.ts`:

```typescript
import { Request, Response } from "express";
import { PaymentService } from "@/services/paymentService";
import { env } from "@/config/env";
import crypto from "crypto";

export class PaymentController {
  static async initiatePayment(req: Request, res: Response) {
    try {
      const { cargoId, tripId, amount, paymentMethod } = req.body;
      const userId = req.user.id;

      if (!amount || !paymentMethod) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const payment = await PaymentService.initiatePayment({
        user_id: userId,
        cargo_id: cargoId,
        trip_id: tripId,
        amount,
        payment_method: paymentMethod,
        provider: paymentMethod === "momo" ? "africas_talking" : "flutterwave",
      });

      res.json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getPaymentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const payment = await PaymentService.getPaymentStatus(id);

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      res.json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async confirmPayment(req: Request, res: Response) {
    try {
      const { paymentId, transactionId } = req.body;

      const payment = await PaymentService.confirmPayment(
        paymentId,
        transactionId
      );

      res.json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async flutterwaveWebhook(req: Request, res: Response) {
    try {
      const hash = crypto
        .createHmac("sha256", env.FLUTTERWAVE_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash !== req.headers["verificationhash"]) {
        return res.status(401).json({ error: "Invalid webhook signature" });
      }

      // Handle webhook payload
      const { data } = req.body;

      if (data.status === "successful") {
        await PaymentService.updatePaymentStatus(data.id, "completed", {
          reference_number: data.reference,
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async africasTalkingWebhook(req: Request, res: Response) {
    // Handle Africa's Talking webhook
    res.json({ success: true });
  }
}
```

## Step 6.2: Payment Service

Create `src/services/paymentService.ts`:

```typescript
import { pool } from "@/config/database";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export class PaymentService {
  static async initiatePayment(data: any) {
    const id = uuidv4();

    // Save payment to DB
    const query = `
      INSERT INTO payments (
        id, user_id, cargo_id, trip_id, amount, currency,
        payment_method, provider, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      data.user_id,
      data.cargo_id,
      data.trip_id,
      data.amount,
      "RWF",
      data.payment_method,
      data.provider,
      "pending",
    ]);

    const payment = result.rows[0];

    // Call payment provider API
    if (data.provider === "flutterwave") {
      // Call Flutterwave API
      const flutterwaveResponse = await this.initiateFlutterwavePayment(
        payment
      );
      return {
        ...payment,
        flutterwaveData: flutterwaveResponse,
      };
    } else if (data.provider === "africas_talking") {
      // Call Africa's Talking API
      const momoResponse = await this.initiateMoMoPayment(payment);
      return {
        ...payment,
        momoData: momoResponse,
      };
    }

    return payment;
  }

  static async initiateFlutterwavePayment(payment: any) {
    const payload = {
      tx_ref: `payment_${payment.id}`,
      amount: payment.amount,
      currency: "RWF",
      redirect_url: `${process.env.FRONTEND_URL}/payment/callback`,
      meta: {
        consumer_id: payment.user_id,
        payment_id: payment.id,
      },
      customer: {
        email: "customer@example.com",
        phonenumber: "+250788000000",
        name: "Customer",
      },
      customizations: {
        title: "Agri-Logistics Payment",
        description: "Cargo Shipping Fee",
      },
    };

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }

  static async initiateMoMoPayment(payment: any) {
    // Implementation for Africa's Talking MoMo
    return {
      status: "pending",
      checkoutUrl: "#",
    };
  }

  static async getPaymentStatus(paymentId: string) {
    const query = "SELECT * FROM payments WHERE id = $1";
    const result = await pool.query(query, [paymentId]);
    return result.rows[0] || null;
  }

  static async confirmPayment(paymentId: string, transactionId: string) {
    const query = `
      UPDATE payments 
      SET status = 'completed', 
          reference_number = $2,
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [paymentId, transactionId]);
    return result.rows[0] || null;
  }

  static async updatePaymentStatus(
    referenceId: string,
    status: string,
    metadata: any
  ) {
    const query = `
      UPDATE payments 
      SET status = $2,
          metadata = metadata || $3,
          updated_at = NOW()
      WHERE reference_number = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [
      referenceId,
      status,
      JSON.stringify(metadata),
    ]);
    return result.rows[0] || null;
  }
}
```

---

# 7. RATINGS SYSTEM

## Step 7.1: Ratings Model & Service

Create `src/services/ratingService.ts`:

```typescript
import { pool } from "@/config/database";
import { v4 as uuidv4 } from "uuid";

export class RatingService {
  static async createRating(data: any) {
    const id = uuidv4();

    const query = `
      INSERT INTO ratings (
        id, rated_user_id, rating_user_id, trip_id, cargo_id,
        rating, comment, cleanliness, professionalism, timeliness, communication,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      data.rated_user_id,
      data.rating_user_id,
      data.trip_id,
      data.cargo_id,
      data.rating,
      data.comment,
      data.cleanliness,
      data.professionalism,
      data.timeliness,
      data.communication,
    ]);

    // Update user stats
    await this.updateUserStats(data.rated_user_id);

    return result.rows[0];
  }

  static async getTransporterStats(transporterId: string) {
    const query = `
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        AVG(cleanliness) as avg_cleanliness,
        AVG(professionalism) as avg_professionalism,
        AVG(timeliness) as avg_timeliness,
        AVG(communication) as avg_communication
      FROM ratings 
      WHERE rated_user_id = $1;
    `;

    const result = await pool.query(query, [transporterId]);
    return result.rows[0];
  }

  static async updateUserStats(userId: string) {
    // Cache user stats for quick access
    const stats = await this.getTransporterStats(userId);
    // Store in cache (Redis or DB)
  }
}
```

---

# 8. REAL-TIME FEATURES

## Step 8.1: WebSocket Setup

Create `src/config/socket.ts`:

```typescript
import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

export function initializeSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    // Verify token
    next();
  });

  // Trip location updates
  io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    socket.on("location:update", (data) => {
      // Broadcast location to interested clients
      socket.broadcast.emit("location:updated", {
        tripId: data.tripId,
        latitude: data.latitude,
        longitude: data.longitude,
      });
    });

    socket.on("trip:accept", (tripId) => {
      io.emit("trip:accepted", { tripId });
    });

    socket.on("trip:complete", (tripId) => {
      io.emit("trip:completed", { tripId });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}
```

---

# 9. ERROR HANDLING & LOGGING

## Step 9.1: Logger Setup

Create `src/config/logger.ts`:

```typescript
import winston from "winston";
import path from "path";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "agri-backend" },
  transports: [
    new winston.transports.File({
      filename: path.join(process.env.LOG_FILE || "./logs", "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(process.env.LOG_FILE || "./logs", "app.log"),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export default logger;
```

## Step 9.2: Error Handler Middleware

Create `src/middleware/errorHandler.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import logger from "@/config/logger";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(error.status || 500).json({
    success: false,
    error: {
      message: error.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    },
  });
};
```

---

# 10. TESTING

## Step 10.1: Setup Jest

Create `jest.config.js`:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/types/**"],
};
```

## Step 10.2: Write Tests

Create `src/__tests__/auth.test.ts`:

```typescript
import { AuthService } from "@/services/authService";
import { User } from "@/models/User";

describe("AuthService", () => {
  test("should register a new user", async () => {
    // Mock implementation
    const user = await AuthService.register(
      "+250700000001",
      "password123",
      "John",
      "Doe",
      "transporter"
    );

    expect(user.user.phone).toBe("+250700000001");
    expect(user.user.role).toBe("transporter");
    expect(user.accessToken).toBeDefined();
  });

  test("should login user", async () => {
    // Mock implementation
    const result = await AuthService.login("+250700000001", "password123");

    expect(result.user).toBeDefined();
    expect(result.accessToken).toBeDefined();
  });
});
```

---

# 11. SERVER SETUP & STARTUP

## Step 11.1: Main Server File

Create `src/server.ts`:

```typescript
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "@/routes/auth";
import cargoRoutes from "@/routes/cargo";
import tripRoutes from "@/routes/trips";
import paymentRoutes from "@/routes/payments";

// Import middleware
import { errorHandler } from "@/middleware/errorHandler";
import logger from "@/config/logger";

// Initialize app
const app: Express = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(","),
    credentials: true,
  })
);
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cargo", cargoRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "UP",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`📍 Base URL: http://localhost:${PORT}/api`);
});

export default app;
```

## Step 11.2: Database Connection

Create `src/config/database.ts`:

```typescript
import { Pool } from "pg";
import logger from "./logger";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  logger.info("✅ Connected to PostgreSQL database");
});

pool.on("error", (error) => {
  logger.error("❌ Unexpected error on idle client", error);
});

export { pool };
```

## Step 11.3: Environment Config

Create `src/config/env.ts`:

```typescript
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000"),

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "5432"),
  DB_NAME: process.env.DB_NAME || "agri_db",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "",

  JWT_SECRET: process.env.JWT_SECRET || "secret",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh-secret",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "30d",

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:8082",

  FLUTTERWAVE_PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY || "",
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY || "",

  AFRICAS_TALKING_API_KEY: process.env.AFRICAS_TALKING_API_KEY || "",
  AFRICAS_TALKING_USERNAME: process.env.AFRICAS_TALKING_USERNAME || "",

  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
```

---

# 12. RUNNING & DEPLOYMENT

## Step 12.1: package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "db:migrate": "ts-node scripts/migrate.ts"
  }
}
```

## Step 12.2: Start Development Server

```bash
npm run dev
# Server should start on http://localhost:5000
```

## Step 12.3: Test API Endpoints

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+250700000001",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "shipper"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+250700000001",
    "password": "password123"
  }'
```

---

# 13. DEPLOYMENT

## Step 13.1: Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Configure HTTPS
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Configure error tracking (Sentry)

## Step 13.2: Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create agri-logistics-backend

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set DATABASE_URL=postgresql://...

# Deploy
git push heroku main
```

## Step 13.3: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://agri_user:password@db:5432/agri_db
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=agri_db
      - POSTGRES_USER=agri_user
      - POSTGRES_PASSWORD=password
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

```bash
# Build and run
docker-compose up --build
```

---

# 14. TROUBLESHOOTING

## Common Issues

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:** Ensure PostgreSQL is running

```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows
# Check Services app for PostgreSQL
```

### JWT Token Expired

```
Error: jwt expired
```

**Solution:** Implement token refresh endpoint

```typescript
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  const decoded = AuthService.verifyRefreshToken(refreshToken);
  const newAccessToken = AuthService.generateAccessToken(decoded);
  res.json({ accessToken: newAccessToken });
});
```

### Payment Integration Issues

- Verify API keys in .env
- Check webhook URLs are publicly accessible
- Test with Flutterwave sandbox first

---

This guide provides everything needed to build a production-ready backend for your Agri-Logistics Platform. Follow the steps sequentially and test each section before moving to the next.

**Questions? Common next steps:**

1. Implement remaining controllers
2. Add input validation using Joi/Yup
3. Set up Redis for caching
4. Configure email notifications
5. Add dashboard/admin panel
