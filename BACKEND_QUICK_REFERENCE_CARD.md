# Backend Quick Reference Card

## One-Page Cheat Sheet for Development

---

## 🚀 QUICK START (5 MINUTES)

### 1. Setup PostgreSQL

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Create DB
psql -U postgres
CREATE DATABASE agri_db;
CREATE USER agri_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE agri_db TO agri_user;
```

### 2. Install & Run Backend

```bash
# Clone/setup
npm install
npm run build  # Compile TypeScript
npm run dev    # Start development server

# Server runs on: http://localhost:5000/api
```

### 3. Setup Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Update with your values:
# DATABASE_URL=postgresql://agri_user:password@localhost:5432/agri_db
# JWT_SECRET=your_super_secret_key
# FLUTTERWAVE_SECRET_KEY=sk_test_xxxx
```

---

## 📊 DATABASE SCHEMA QUICK LOOK

```
users
├── id (UUID)
├── phone (unique)
├── email
├── role (shipper/transporter/receiver/admin)
├── password_hash
└── created_at

cargo
├── id (UUID)
├── user_id (FK)
├── title, description
├── quantity, unit, price
├── origin_location, latitude, longitude
├── destination_location, latitude, longitude
├── status (available/reserved/shipped/delivered)
└── created_at

trips
├── id (UUID)
├── transporter_id (FK)
├── cargo_id (FK)
├── status (pending/accepted/in_transit/completed)
├── current_latitude, current_longitude
├── vehicle_type, capacity
└── created_at

payments
├── id (UUID)
├── user_id (FK)
├── cargo_id, trip_id (FK)
├── amount, currency
├── status (pending/processing/completed/failed)
├── reference_number (from payment provider)
└── created_at

ratings
├── id (UUID)
├── rated_user_id (FK)
├── rating_user_id (FK)
├── trip_id (FK)
├── rating (1-5)
├── cleanliness, professionalism, timeliness, communication
└── created_at
```

---

## 🔌 API ENDPOINTS REFERENCE

### Authentication

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/me                Get current user (auth required)
POST   /api/auth/refresh           Refresh JWT token
```

### Cargo/Products

```
GET    /api/cargo                  Get all cargo (paginated, filters)
GET    /api/cargo/:id              Get single cargo
POST   /api/cargo                  Create cargo (shipper only)
PUT    /api/cargo/:id              Update cargo (owner only)
DELETE /api/cargo/:id              Delete cargo (owner only)
GET    /api/cargo/user/:userId     Get user's cargo
GET    /api/cargo/search?q=maize   Search cargo
```

### Trips

```
GET    /api/trips                  Get all trips
GET    /api/trips/:id              Get trip details
POST   /api/trips                  Create trip (transporter only)
PUT    /api/trips/:id              Update trip (owner only)
POST   /api/trips/:id/accept       Accept trip (transporter)
POST   /api/trips/:id/complete     Complete trip (transporter)
POST   /api/trips/:id/location     Update GPS location
GET    /api/trips/transporter/:id  Get transporter's trips
```

### Payments

```
POST   /api/payments/initiate      Start payment process
GET    /api/payments/:id           Get payment status
POST   /api/payments/confirm       Confirm payment received
POST   /api/payments/webhook/flutterwave  Webhook (Flutterwave)
```

### Ratings

```
POST   /api/ratings                Create rating
GET    /api/ratings/transporter/:id/stats    Get stats
GET    /api/ratings/transporter/:id/reviews  Get reviews
GET    /api/ratings/leaderboard   Get top transporters
```

### Transporters

```
GET    /api/transporters           Get all transporters
GET    /api/transporters/:id       Get transporter profile
PUT    /api/transporters/:id       Update profile
GET    /api/transporters/available Get available transporters
```

### Matching

```
POST   /api/matching/find          Find matching transporters
POST   /api/matching/request       Send trip request
```

---

## 🔑 REQUEST HEADERS

All authenticated endpoints require:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

---

## 📝 EXAMPLE REQUESTS

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+250700000001",
    "password": "secure123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "shipper"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+250700000001",
    "password": "secure123"
  }'
```

### Create Cargo

```bash
curl -X POST http://localhost:5000/api/cargo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Maize 50kg",
    "quantity": 50,
    "unit": "kg",
    "price_per_unit": 1000,
    "origin_location": "Kigali",
    "origin_latitude": -1.9505,
    "origin_longitude": 29.8739,
    "destination_location": "Huye",
    "destination_latitude": -2.6030,
    "destination_longitude": 29.7344,
    "delivery_date": "2024-01-20"
  }'
```

### Create Trip (Accept Cargo)

```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cargo_id": "550e8400-e29b-41d4-a716-446655440000",
    "vehicle_type": "truck",
    "capacity_total": 1000
  }'
```

### Create Rating

```bash
curl -X POST http://localhost:5000/api/ratings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rated_user_id": "uuid-of-transporter",
    "trip_id": "uuid-of-trip",
    "rating": 5,
    "comment": "Excellent service!",
    "cleanliness": 5,
    "professionalism": 5,
    "timeliness": 5,
    "communication": 5
  }'
```

---

## 🔍 COMMON QUERY PARAMETERS

### Pagination

```
GET /api/cargo?page=1&limit=20
```

### Filtering

```
GET /api/cargo?status=available&category=grains
GET /api/trips?status=accepted
```

### Search

```
GET /api/cargo/search?q=maize&minPrice=1000&maxPrice=50000
```

### Sorting

```
GET /api/ratings/leaderboard?period=weekly&limit=10
```

---

## 📡 RESPONSE FORMAT

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "field1": "value1"
  },
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here",
  "status": 400
}
```

---

## 🛠️ USEFUL DATABASE QUERIES

### Check User Count

```sql
SELECT COUNT(*) FROM users WHERE role = 'transporter';
```

### Get Top Rated Transporters

```sql
SELECT u.id, u.first_name, AVG(r.rating) as avg_rating, COUNT(r.id) as reviews
FROM users u
LEFT JOIN ratings r ON u.id = r.rated_user_id
WHERE u.role = 'transporter'
GROUP BY u.id
ORDER BY avg_rating DESC
LIMIT 10;
```

### Get Active Trips

```sql
SELECT * FROM trips WHERE status IN ('accepted', 'in_transit');
```

### Get User Earnings

```sql
SELECT
  u.id,
  u.first_name,
  COUNT(t.id) as completed_trips,
  SUM(p.amount) as total_earned
FROM users u
LEFT JOIN trips t ON u.id = t.transporter_id AND t.status = 'completed'
LEFT JOIN payments p ON t.id = p.trip_id AND p.status = 'completed'
GROUP BY u.id;
```

### Reset Database (DEV ONLY!)

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then run migrations again
```

---

## 🧪 TESTING WITH POSTMAN/INSOMNIA

1. **Create Environment Variable:**

   ```
   base_url: http://localhost:5000/api
   token: [get from login response]
   ```

2. **Set Authorization Header:**

   ```
   Type: Bearer Token
   Token: {{token}}
   ```

3. **Quick Test Sequence:**
   - POST /auth/register (get token)
   - POST /cargo (create cargo)
   - GET /cargo (list all)
   - POST /trips (accept cargo)
   - POST /ratings (rate the trip)

---

## 🐛 DEBUGGING TIPS

### Check Logs

```bash
tail -f ./logs/app.log
tail -f ./logs/error.log
```

### Database Connection Issue

```bash
# Test connection
psql -U agri_user -d agri_db -c "SELECT NOW();"

# Check user permissions
\du  # in psql console
```

### JWT Token Issue

```bash
# Decode token at jwt.io
# Or add console.log in authMiddleware.ts
```

### Payment Provider Issues

- Check API keys in .env
- Verify webhook URL is publicly accessible
- Check transaction reference format matches provider requirements

---

## 📦 FILE STRUCTURE CHECKLIST

Before starting, ensure you have:

```
✅ src/
   ✅ config/database.ts
   ✅ config/logger.ts
   ✅ config/env.ts
   ✅ models/User.ts
   ✅ models/[other models].ts
   ✅ services/authService.ts
   ✅ services/[other services].ts
   ✅ controllers/authController.ts
   ✅ controllers/[other controllers].ts
   ✅ routes/auth.ts
   ✅ routes/[other routes].ts
   ✅ middleware/auth.ts
   ✅ middleware/errorHandler.ts
   ✅ server.ts

✅ migrations/
   ✅ 001_create_users_table.sql
   ✅ 002_create_cargo_table.sql
   ✅ [other migrations].sql

✅ .env
✅ .env.example
✅ tsconfig.json
✅ package.json
```

---

## 🔄 TYPICAL WORKFLOW (Frontend Integration)

1. **User Registration** → POST /auth/register → Get token
2. **User Lists Cargo** → POST /cargo → Creates cargo
3. **Transporter Accepts** → POST /trips → Creates trip
4. **Payment Initiated** → POST /payments/initiate → Get payment reference
5. **Payment Confirmed** → POST /payments/confirm → Payment complete
6. **Trip Complete** → POST /trips/:id/complete → Marks trip done
7. **Rate Experience** → POST /ratings → User rates transporter
8. **View Stats** → GET /ratings/transporter/:id/stats → See ratings

---

## 🚨 BEFORE GOING TO PRODUCTION

- [ ] Change JWT_SECRET to a strong value
- [ ] Enable HTTPS only
- [ ] Set up proper CORS (not "\*")
- [ ] Configure rate limiting
- [ ] Enable database backups
- [ ] Set up monitoring (Sentry, New Relic, etc.)
- [ ] Configure logging aggregation (DataDog, LogRocket, etc.)
- [ ] Test all payment webhooks
- [ ] Load test with artillery or k6
- [ ] Set up CI/CD pipeline
- [ ] Configure error tracking
- [ ] Document API for team

---

## 📞 SUPPORT & RESOURCES

- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Express.js Docs:** https://expressjs.com/
- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **JWT Docs:** https://jwt.io/
- **Flutterwave Docs:** https://developer.flutterwave.com/
- **Africa's Talking Docs:** https://africastalking.com/

---

**Last Generated:** 2024  
**Version:** 2.1.0  
**For:** Agri-Logistics Platform
