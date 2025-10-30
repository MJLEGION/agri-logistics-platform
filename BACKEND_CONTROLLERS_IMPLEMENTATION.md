# Backend Controllers Implementation Guide

## Complete Controller Code for All Endpoints

---

## 1. CARGO CONTROLLER

Create `src/controllers/cargoController.ts`:

```typescript
import { Request, Response } from "express";
import { CargoService } from "@/services/cargoService";
import { distanceService } from "@/services/distanceService";
import logger from "@/config/logger";

export class CargoController {
  static async create(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        quantity,
        unit,
        price_per_unit,
        origin_location,
        origin_latitude,
        origin_longitude,
        destination_location,
        destination_latitude,
        destination_longitude,
        delivery_date,
        category,
      } = req.body;

      // Validation
      if (
        !title ||
        !quantity ||
        !price_per_unit ||
        !origin_location ||
        !destination_location
      ) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      // Calculate distance
      const distance = await distanceService.calculateDistance(
        origin_latitude,
        origin_longitude,
        destination_latitude,
        destination_longitude
      );

      const cargo = await CargoService.create({
        user_id: req.user.id,
        title,
        description,
        quantity: parseFloat(quantity),
        unit: unit || "kg",
        price_per_unit: parseFloat(price_per_unit),
        origin_location,
        origin_latitude: parseFloat(origin_latitude),
        origin_longitude: parseFloat(origin_longitude),
        destination_location,
        destination_latitude: parseFloat(destination_latitude),
        destination_longitude: parseFloat(destination_longitude),
        delivery_date: delivery_date ? new Date(delivery_date) : null,
        category: category || "general",
      });

      logger.info(`Cargo created: ${cargo.id} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        data: cargo,
      });
    } catch (error: any) {
      logger.error(`Error creating cargo: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { status, category, page = 1, limit = 20 } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (category) filters.category = category;

      const cargo = await CargoService.getAll(filters);

      // Pagination
      const start = (Number(page) - 1) * Number(limit);
      const end = start + Number(limit);
      const paginatedCargo = cargo.slice(start, end);

      res.json({
        success: true,
        data: paginatedCargo,
        pagination: {
          total: cargo.length,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(cargo.length / Number(limit)),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cargo = await CargoService.getById(id);

      if (!cargo) {
        return res.status(404).json({
          success: false,
          error: "Cargo not found",
        });
      }

      res.json({
        success: true,
        data: cargo,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, quantity, price_per_unit, status } = req.body;

      const cargo = await CargoService.getById(id);
      if (!cargo) {
        return res.status(404).json({
          success: false,
          error: "Cargo not found",
        });
      }

      // Check if user owns the cargo
      if (cargo.user_id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Not authorized to update this cargo",
        });
      }

      const updated = await CargoService.update(id, {
        title,
        description,
        quantity: quantity ? parseFloat(quantity) : undefined,
        price_per_unit: price_per_unit ? parseFloat(price_per_unit) : undefined,
        status,
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cargo = await CargoService.getById(id);
      if (!cargo) {
        return res.status(404).json({
          success: false,
          error: "Cargo not found",
        });
      }

      if (cargo.user_id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Not authorized",
        });
      }

      await CargoService.delete(id);

      logger.info(`Cargo deleted: ${id}`);

      res.json({
        success: true,
        message: "Cargo deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const cargo = await CargoService.getByUserId(userId);

      res.json({
        success: true,
        data: cargo,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const { q, category, minPrice, maxPrice, latitude, longitude, radius } =
        req.query;

      // Build search query
      let query =
        "SELECT * FROM cargo WHERE deleted_at IS NULL AND status = 'available'";
      const params: any[] = [];

      if (q) {
        query += ` AND (title ILIKE $${
          params.length + 1
        } OR description ILIKE $${params.length + 2})`;
        params.push(`%${q}%`, `%${q}%`);
      }

      if (category) {
        query += ` AND category = $${params.length + 1}`;
        params.push(category);
      }

      if (minPrice) {
        query += ` AND total_price >= $${params.length + 1}`;
        params.push(parseFloat(minPrice as string));
      }

      if (maxPrice) {
        query += ` AND total_price <= $${params.length + 1}`;
        params.push(parseFloat(maxPrice as string));
      }

      // Execute search
      const { pool } = require("@/config/database");
      const result = await pool.query(query, params);

      // Filter by distance if location provided
      let results = result.rows;
      if (latitude && longitude && radius) {
        const userLat = parseFloat(latitude as string);
        const userLng = parseFloat(longitude as string);
        const radiusKm = parseFloat(radius as string);

        results = results.filter((item: any) => {
          const distance = this.calculateDistance(
            userLat,
            userLng,
            item.origin_latitude,
            item.origin_longitude
          );
          return distance <= radiusKm;
        });
      }

      res.json({
        success: true,
        data: results,
        count: results.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
```

---

## 2. TRIP CONTROLLER

Create `src/controllers/tripController.ts`:

```typescript
import { Request, Response } from "express";
import { TripService } from "@/services/tripService";
import { CargoService } from "@/services/cargoService";
import logger from "@/config/logger";

export class TripController {
  static async create(req: Request, res: Response) {
    try {
      const {
        cargo_id,
        origin_location,
        destination_location,
        vehicle_type,
        capacity_total,
        estimated_distance,
        estimated_time_hours,
      } = req.body;

      if (!cargo_id || !vehicle_type || !capacity_total) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      // Verify cargo exists
      const cargo = await CargoService.getById(cargo_id);
      if (!cargo) {
        return res.status(404).json({
          success: false,
          error: "Cargo not found",
        });
      }

      const trip = await TripService.create({
        transporter_id: req.user.id,
        cargo_id,
        origin_location: origin_location || cargo.origin_location,
        destination_location:
          destination_location || cargo.destination_location,
        vehicle_type,
        capacity_total,
        estimated_distance: estimated_distance || 0,
        estimated_time_hours: estimated_time_hours || 0,
      });

      logger.info(`Trip created: ${trip.id} by transporter ${req.user.id}`);

      res.status(201).json({
        success: true,
        data: trip,
      });
    } catch (error: any) {
      logger.error(`Error creating trip: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { status, page = 1, limit = 20 } = req.query;

      const { pool } = require("@/config/database");

      let query = "SELECT * FROM trips WHERE deleted_at IS NULL";
      const params: any[] = [];

      if (status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
        params.length + 2
      }`;
      params.push(Number(limit), (Number(page) - 1) * Number(limit));

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const trip = await TripService.getById(id);

      if (!trip) {
        return res.status(404).json({
          success: false,
          error: "Trip not found",
        });
      }

      res.json({
        success: true,
        data: trip,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getByTransporter(req: Request, res: Response) {
    try {
      const { transporterId } = req.params;
      const { status } = req.query;

      let trips = await TripService.getByTransporter(transporterId);

      if (status) {
        trips = trips.filter((t) => t.status === status);
      }

      res.json({
        success: true,
        data: trips,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async acceptTrip(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const trip = await TripService.getById(id);

      if (!trip) {
        return res.status(404).json({
          success: false,
          error: "Trip not found",
        });
      }

      if (trip.transporter_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Not authorized",
        });
      }

      const updated = await TripService.acceptTrip(id);

      // Update cargo status
      await CargoService.update(trip.cargo_id, { status: "reserved" });

      logger.info(`Trip accepted: ${id} by transporter ${req.user.id}`);

      res.json({
        success: true,
        data: updated,
        message: "Trip accepted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async completeTrip(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { actual_distance, actual_time_hours, delivery_proof } = req.body;

      const trip = await TripService.getById(id);

      if (!trip) {
        return res.status(404).json({
          success: false,
          error: "Trip not found",
        });
      }

      if (trip.transporter_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Not authorized",
        });
      }

      const updated = await TripService.completeTrip(
        id,
        actual_distance || 0,
        actual_time_hours || 0
      );

      // Update cargo status
      await CargoService.update(trip.cargo_id, { status: "delivered" });

      // TODO: Trigger rating reminder for shipper

      logger.info(`Trip completed: ${id}`);

      res.json({
        success: true,
        data: updated,
        message: "Trip completed successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async updateLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      const { pool } = require("@/config/database");

      const query = `
        UPDATE trips 
        SET current_latitude = $2,
            current_longitude = $3,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
      `;

      const result = await pool.query(query, [id, latitude, longitude]);

      // Broadcast location to relevant users via WebSocket
      // io.emit('trip:location-updated', { tripId: id, latitude, longitude });

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, vehicle_type, capacity_used } = req.body;

      const trip = await TripService.getById(id);

      if (!trip) {
        return res.status(404).json({
          success: false,
          error: "Trip not found",
        });
      }

      if (trip.transporter_id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Not authorized",
        });
      }

      const { pool } = require("@/config/database");

      const query = `
        UPDATE trips 
        SET status = COALESCE($2, status),
            vehicle_type = COALESCE($3, vehicle_type),
            capacity_used = COALESCE($4, capacity_used),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
      `;

      const result = await pool.query(query, [
        id,
        status,
        vehicle_type,
        capacity_used,
      ]);

      res.json({
        success: true,
        data: result.rows[0],
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

---

## 3. RATING CONTROLLER

Create `src/controllers/ratingController.ts`:

```typescript
import { Request, Response } from "express";
import { RatingService } from "@/services/ratingService";
import logger from "@/config/logger";

export class RatingController {
  static async createRating(req: Request, res: Response) {
    try {
      const {
        rated_user_id,
        trip_id,
        cargo_id,
        rating,
        comment,
        cleanliness,
        professionalism,
        timeliness,
        communication,
      } = req.body;

      if (!rated_user_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: "Invalid rating data",
        });
      }

      // Check if user already rated this trip
      const { pool } = require("@/config/database");
      const existingQuery =
        "SELECT * FROM ratings WHERE trip_id = $1 AND rating_user_id = $2";
      const existing = await pool.query(existingQuery, [trip_id, req.user.id]);

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: "You have already rated this trip",
        });
      }

      const ratingData = await RatingService.createRating({
        rated_user_id,
        rating_user_id: req.user.id,
        trip_id,
        cargo_id,
        rating,
        comment,
        cleanliness: cleanliness || rating,
        professionalism: professionalism || rating,
        timeliness: timeliness || rating,
        communication: communication || rating,
      });

      logger.info(`Rating created: ${ratingData.id} for user ${rated_user_id}`);

      res.status(201).json({
        success: true,
        data: ratingData,
        message: "Rating submitted successfully",
      });
    } catch (error: any) {
      logger.error(`Error creating rating: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getTransporterStats(req: Request, res: Response) {
    try {
      const { transporterId } = req.params;

      const stats = await RatingService.getTransporterStats(transporterId);

      res.json({
        success: true,
        data: {
          transporterId,
          totalRatings: stats.total_ratings || 0,
          averageRating: parseFloat(stats.average_rating || "0").toFixed(1),
          categories: {
            cleanliness: parseFloat(stats.avg_cleanliness || "0").toFixed(1),
            professionalism: parseFloat(
              stats.avg_professionalism || "0"
            ).toFixed(1),
            timeliness: parseFloat(stats.avg_timeliness || "0").toFixed(1),
            communication: parseFloat(stats.avg_communication || "0").toFixed(
              1
            ),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getTransporterReviews(req: Request, res: Response) {
    try {
      const { transporterId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const { pool } = require("@/config/database");

      const query = `
        SELECT r.*, u.first_name, u.last_name
        FROM ratings r
        JOIN users u ON r.rating_user_id = u.id
        WHERE r.rated_user_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3;
      `;

      const result = await pool.query(query, [
        transporterId,
        Number(limit),
        (Number(page) - 1) * Number(limit),
      ]);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getLeaderboard(req: Request, res: Response) {
    try {
      const { period = "all", limit = 20 } = req.query;

      const { pool } = require("@/config/database");

      let dateFilter = "";
      if (period === "weekly") {
        dateFilter = "AND r.created_at >= NOW() - INTERVAL '7 days'";
      } else if (period === "monthly") {
        dateFilter = "AND r.created_at >= NOW() - INTERVAL '30 days'";
      }

      const query = `
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.profile_picture_url,
          COUNT(r.id) as total_ratings,
          AVG(r.rating) as average_rating,
          ROW_NUMBER() OVER (ORDER BY AVG(r.rating) DESC) as rank
        FROM users u
        LEFT JOIN ratings r ON u.id = r.rated_user_id
        WHERE u.role = 'transporter' ${dateFilter}
        GROUP BY u.id
        ORDER BY average_rating DESC, total_ratings DESC
        LIMIT $1;
      `;

      const result = await pool.query(query, [Number(limit)]);

      res.json({
        success: true,
        data: result.rows,
        period,
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

---

## 4. TRANSPORTER CONTROLLER

Create `src/controllers/transporterController.ts`:

```typescript
import { Request, Response } from "express";
import { User } from "@/models/User";
import logger from "@/config/logger";

export class TransporterController {
  static async getAll(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, location } = req.query;

      const { pool } = require("@/config/database");

      let query = `
        SELECT 
          u.*,
          COUNT(r.id) as total_ratings,
          AVG(r.rating) as average_rating
        FROM users u
        LEFT JOIN ratings r ON u.id = r.rated_user_id
        WHERE u.role = 'transporter' AND u.status = 'active'
        GROUP BY u.id
      `;

      const params: any[] = [];

      if (location) {
        // Add location filter if available
        query += ` AND u.location ILIKE $${params.length + 1}`;
        params.push(`%${location}%`);
      }

      query += ` ORDER BY average_rating DESC LIMIT $${
        params.length + 1
      } OFFSET $${params.length + 2}`;
      params.push(Number(limit), (Number(page) - 1) * Number(limit));

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);

      if (!user || user.role !== "transporter") {
        return res.status(404).json({
          success: false,
          error: "Transporter not found",
        });
      }

      // Get stats
      const { RatingService } = require("@/services/ratingService");
      const stats = await RatingService.getTransporterStats(id);

      res.json({
        success: true,
        data: {
          ...user,
          stats,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Not authorized",
        });
      }

      const {
        first_name,
        last_name,
        email,
        vehicle_type,
        vehicle_capacity,
        phone_verified,
      } = req.body;

      const user = await User.update(id, {
        first_name,
        last_name,
        email,
      });

      // TODO: Update vehicle info in separate table

      res.json({
        success: true,
        data: user,
        message: "Profile updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getAvailableTransporters(req: Request, res: Response) {
    try {
      const {
        origin_latitude,
        origin_longitude,
        destination_latitude,
        destination_longitude,
        radius = 50,
      } = req.query;

      const { pool } = require("@/config/database");

      const query = `
        SELECT 
          u.*,
          COUNT(r.id) as total_ratings,
          AVG(r.rating) as average_rating,
          COUNT(CASE WHEN t.status = 'accepted' THEN 1 END) as active_trips
        FROM users u
        LEFT JOIN ratings r ON u.id = r.rated_user_id
        LEFT JOIN trips t ON u.id = t.transporter_id AND t.status IN ('accepted', 'in_transit')
        WHERE u.role = 'transporter' AND u.status = 'active'
        GROUP BY u.id
        ORDER BY average_rating DESC, active_trips ASC;
      `;

      const result = await pool.query(query);

      // Filter by distance if coordinates provided
      let transporters = result.rows;
      if (origin_latitude && origin_longitude) {
        const userLat = parseFloat(origin_latitude as string);
        const userLng = parseFloat(origin_longitude as string);
        const radiusKm = parseFloat(radius as string);

        transporters = transporters.filter((t: any) => {
          // Assuming transporters have location coordinates stored
          // This is pseudo-code, adjust based on actual data structure
          if (t.latitude && t.longitude) {
            const distance = this.calculateDistance(
              userLat,
              userLng,
              t.latitude,
              t.longitude
            );
            return distance <= radiusKm;
          }
          return true;
        });
      }

      res.json({
        success: true,
        data: transporters,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
```

---

## 5. Order/Matching Controller

Create `src/controllers/matchingController.ts`:

```typescript
import { Request, Response } from "express";
import { CargoService } from "@/services/cargoService";
import { TripService } from "@/services/tripService";
import logger from "@/config/logger";

export class MatchingController {
  static async findMatches(req: Request, res: Response) {
    try {
      const { cargoId } = req.body;

      // Get cargo details
      const cargo = await CargoService.getById(cargoId);

      if (!cargo) {
        return res.status(404).json({
          success: false,
          error: "Cargo not found",
        });
      }

      // Find matching transporters
      const { pool } = require("@/config/database");

      const query = `
        SELECT 
          u.*,
          COUNT(r.id) as total_ratings,
          AVG(r.rating) as average_rating,
          COUNT(CASE WHEN t.status IN ('accepted', 'in_transit') THEN 1 END) as active_trips
        FROM users u
        LEFT JOIN ratings r ON u.id = r.rated_user_id
        LEFT JOIN trips t ON u.id = t.transporter_id
        WHERE u.role = 'transporter' AND u.status = 'active'
        GROUP BY u.id
        ORDER BY average_rating DESC;
      `;

      const result = await pool.query(query);

      // Score and rank matches
      const matches = result.rows
        .map((transporter: any) => ({
          ...transporter,
          matchScore: this.calculateMatchScore(transporter, cargo),
        }))
        .sort((a, b) => b.matchScore - a.matchScore);

      res.json({
        success: true,
        data: matches.slice(0, 10),
        message: `Found ${matches.length} available transporters`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async requestTrip(req: Request, res: Response) {
    try {
      const { cargoId, transporterId } = req.body;

      // Verify cargo
      const cargo = await CargoService.getById(cargoId);
      if (!cargo) {
        return res.status(404).json({ error: "Cargo not found" });
      }

      // Create trip request
      const trip = await TripService.create({
        transporter_id: transporterId,
        cargo_id: cargoId,
        origin_location: cargo.origin_location,
        destination_location: cargo.destination_location,
        vehicle_type: "truck", // Default
        capacity_total: 1000,
      });

      logger.info(
        `Trip request created: ${trip.id} for transporter ${transporterId}`
      );

      res.json({
        success: true,
        data: trip,
        message: "Trip request sent to transporter",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  private static calculateMatchScore(transporter: any, cargo: any): number {
    let score = 0;

    // Rating score (0-40 points)
    const avgRating = parseFloat(transporter.average_rating || 0);
    score += avgRating * 8;

    // Active trips penalty (0-20 points)
    const activeTripsPenalty = Math.min(transporter.active_trips * 2, 20);
    score += 20 - activePenalty;

    // Total ratings bonus (0-20 points)
    const ratingsBonus = Math.min(transporter.total_ratings / 10, 20);
    score += ratingsBonus;

    // Distance bonus (0-20 points)
    // Calculate distance from cargo origin
    // If close, add points

    return Math.min(score, 100);
  }
}
```

---

## 6. Complete Routes Setup

Update `src/server.ts` to include all routes:

```typescript
import cargoRoutes from "@/routes/cargo";
import tripRoutes from "@/routes/trips";
import authRoutes from "@/routes/auth";
import paymentRoutes from "@/routes/payments";
import ratingRoutes from "@/routes/ratings";
import transporterRoutes from "@/routes/transporters";
import matchingRoutes from "@/routes/matching";

// Add to app
app.use("/api/auth", authRoutes);
app.use("/api/cargo", cargoRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/transporters", transporterRoutes);
app.use("/api/matching", matchingRoutes);
```

---

This completes all controller implementations. Follow the main guide for setup and testing!
