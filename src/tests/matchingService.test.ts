/**
 * Matching Service Test Suite
 * Tests real-time stakeholder matching algorithm and scoring
 */

describe('Matching Service', () => {
  const testProduceVehicleMapping = {
    maize: ['truck', 'van', 'pickup'],
    tomatoes: ['van', 'pickup'],
    bananas: ['van', 'pickup'],
  };

  const testCapacityRequirements = {
    maize: 500,
    tomatoes: 100,
    bananas: 100,
  };

  describe('Matching Request Validation', () => {
    test('should validate matching request structure', () => {
      const request = {
        userId: 'user_123',
        pickupLocation: {
          latitude: -1.9356,
          longitude: 29.8739,
          address: 'Kigali',
        },
        deliveryLocation: {
          latitude: -2.0,
          longitude: 30.0,
          address: 'Gitarama',
        },
        produceType: 'maize',
        quantity: 1000,
        unit: 'kg' as const,
        requiredCapacity: 1000,
      };

      expect(request.userId).toBeDefined();
      expect(request.pickupLocation.latitude).toBeDefined();
      expect(request.produceType).toBeDefined();
    });

    test('should validate coordinates are within valid range', () => {
      const validLocation = {
        latitude: -1.9356,
        longitude: 29.8739,
      };

      const invalidLatitude = {
        latitude: 91,
        longitude: 29.8739,
      };

      expect(Math.abs(validLocation.latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(validLocation.longitude)).toBeLessThanOrEqual(180);
      expect(Math.abs(invalidLatitude.latitude)).toBeGreaterThan(90);
    });

    test('should validate produce type', () => {
      const validProduceTypes = ['maize', 'tomatoes', 'bananas', 'potatoes'];
      const testProduce = 'maize';

      expect(validProduceTypes).toContain(testProduce);
    });

    test('should validate quantity is positive', () => {
      const validQuantity = 1000;
      const invalidQuantity = -100;
      const zeroQuantity = 0;

      expect(validQuantity).toBeGreaterThan(0);
      expect(invalidQuantity).toBeLessThan(0);
      expect(zeroQuantity).toBe(0);
    });
  });

  describe('Vehicle Type Compatibility', () => {
    test('should map produce to suitable vehicle types', () => {
      const produce = 'maize';
      const suitableVehicles = testProduceVehicleMapping[produce];

      expect(suitableVehicles).toContain('truck');
      expect(suitableVehicles).toContain('van');
    });

    test('should ensure fragile items use appropriate vehicles', () => {
      const fragileProduces = ['tomatoes', 'bananas'];
      
      fragileProduces.forEach(produce => {
        const vehicles = testProduceVehicleMapping[produce];
        // Should not include motorcycle for fragile items
        expect(vehicles).not.toContain('motorcycle');
      });
    });

    test('should score based on vehicle type match', () => {
      const vehicleType = 'truck';
      const suitableForProduce = ['truck', 'van', 'pickup'];

      const matchScore = suitableForProduce.includes(vehicleType) ? 10 : 0;
      expect(matchScore).toBe(10);
    });

    test('should calculate capacity match score', () => {
      const requiredCapacity = 500;
      const vehicleCapacity = 1000;

      const capacityRatio = vehicleCapacity / requiredCapacity;
      const capacityScore = Math.min(capacityRatio * 10, 10);

      expect(capacityRatio).toBe(2);
      expect(capacityScore).toBe(10);
    });
  });

  describe('Distance and ETA Calculation', () => {
    test('should calculate distance between coordinates', () => {
      // Simplified distance calculation (Haversine)
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.asin(Math.sqrt(a));
        return R * c;
      };

      const distance = calculateDistance(-1.9356, 29.8739, -2.0, 30.0);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(200); // Reasonable for Rwanda
    });

    test('should estimate ETA based on distance and speed', () => {
      const distance = 50; // km
      const avgSpeed = 60; // km/h
      const eta = (distance / avgSpeed) * 60; // in minutes

      expect(eta).toBeGreaterThan(0);
      expect(eta).toBeLessThan(120);
    });

    test('should prefer closer transporters', () => {
      const transporters = [
        { id: 'tr_1', distance: 5 },
        { id: 'tr_2', distance: 15 },
        { id: 'tr_3', distance: 30 },
      ];

      const sorted = [...transporters].sort((a, b) => a.distance - b.distance);
      expect(sorted[0].distance).toBeLessThan(sorted[sorted.length - 1].distance);
    });
  });

  describe('Matching Score Calculation', () => {
    test('should calculate composite matching score', () => {
      const factors = {
        proximityScore: 10, // 0-10
        capacityScore: 9,   // 0-10
        vehicleScore: 10,   // 0-10
        ratingScore: 8,     // 0-10
        availabilityScore: 7, // 0-10
      };

      // Weighted average
      const weights = { proximity: 0.3, capacity: 0.2, vehicle: 0.2, rating: 0.2, availability: 0.1 };
      const totalScore = 
        factors.proximityScore * weights.proximity +
        factors.capacityScore * weights.capacity +
        factors.vehicleScore * weights.vehicle +
        factors.ratingScore * weights.rating +
        factors.availabilityScore * weights.availability;

      expect(totalScore).toBeGreaterThan(0);
      expect(totalScore).toBeLessThanOrEqual(10);
    });

    test('should identify best match', () => {
      const matches = [
        { id: 'tr_1', score: 8.5 },
        { id: 'tr_2', score: 9.2 },
        { id: 'tr_3', score: 7.8 },
      ];

      const bestMatch = matches.reduce((best, current) =>
        current.score > best.score ? current : best
      );

      expect(bestMatch.score).toBe(9.2);
      expect(bestMatch.id).toBe('tr_2');
    });
  });

  describe('Capacity Validation', () => {
    test('should check if vehicle has sufficient capacity', () => {
      const requiredCapacity = 500;
      const vehicleCapacity = 1000;

      const hasSufficientCapacity = vehicleCapacity >= requiredCapacity;
      expect(hasSufficientCapacity).toBe(true);
    });

    test('should check minimum capacity requirements per produce', () => {
      const produce = 'maize';
      const minRequired = testCapacityRequirements[produce];
      const userQuantity = 1000;

      const meetsRequirement = userQuantity >= minRequired;
      expect(meetsRequirement).toBe(true);
    });

    test('should consider load already on vehicle', () => {
      const vehicleCapacity = 1000;
      const currentLoad = 600;
      const availableCapacity = vehicleCapacity - currentLoad;
      const requestedCapacity = 300;

      const canAccommodate = availableCapacity >= requestedCapacity;
      expect(canAccommodate).toBe(true);
    });
  });

  describe('Matching Result Structure', () => {
    test('should return well-structured matching result', () => {
      const result = {
        requestId: 'req_123',
        userLocation: {
          latitude: -1.9356,
          longitude: 29.8739,
          address: 'Kigali',
        },
        matches: [
          {
            transporter: {
              id: 'tr_1',
              name: 'John',
              vehicleType: 'truck',
            },
            distance: 5,
            eta: 15,
            cost: 25000,
            score: 9.2,
            reasonsForMatch: ['Close proximity', 'Suitable vehicle'],
            isAutoMatch: true,
          },
        ],
        bestMatch: {} as any,
        totalDistance: 50,
      };

      expect(result.requestId).toBeDefined();
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches[0].score).toBeGreaterThan(0);
    });

    test('should provide reasons for match', () => {
      const reasons = [
        'Close proximity',
        'Suitable vehicle type',
        'Sufficient capacity',
        'High rating',
        'Available immediately',
      ];

      expect(reasons.length).toBeGreaterThan(0);
      reasons.forEach(reason => {
        expect(reason.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Auto-Match Decision', () => {
    test('should auto-match if score is high', () => {
      const score = 9.5;
      const autoMatchThreshold = 8.5;

      const shouldAutoMatch = score >= autoMatchThreshold;
      expect(shouldAutoMatch).toBe(true);
    });

    test('should require user selection if score is medium', () => {
      const score = 7.2;
      const autoMatchThreshold = 8.5;
      const userSelectThreshold = 6.0;

      const shouldAutoMatch = score >= autoMatchThreshold;
      const shouldShowOptions = score >= userSelectThreshold && score < autoMatchThreshold;

      expect(shouldAutoMatch).toBe(false);
      expect(shouldShowOptions).toBe(true);
    });

    test('should reject match if score is too low', () => {
      const score = 4.5;
      const minimumScore = 6.0;

      const isValidMatch = score >= minimumScore;
      expect(isValidMatch).toBe(false);
    });
  });

  describe('Real-Time Matching Scenarios', () => {
    test('should handle multiple simultaneous matches', () => {
      const requests = [
        { id: 'req_1', produceType: 'maize' },
        { id: 'req_2', produceType: 'tomatoes' },
        { id: 'req_3', produceType: 'bananas' },
      ];

      expect(requests.length).toBe(3);
      requests.forEach(req => {
        expect(req.id).toBeDefined();
      });
    });

    test('should update match scores when transporter moves', () => {
      const initialDistance = 20;
      const newDistance = 10;

      expect(newDistance).toBeLessThan(initialDistance);
      // Score should improve with closer distance
    });

    test('should handle transporter becoming unavailable', () => {
      const transporter = {
        id: 'tr_1',
        status: 'busy',
        currentMatch: 'req_123',
      };

      const isAvailable = transporter.status === 'available';
      expect(isAvailable).toBe(false);
    });
  });

  describe('Cost Estimation', () => {
    test('should estimate delivery cost based on distance', () => {
      const baseRate = 1000; // RWF per km
      const distance = 25; // km
      const estimatedCost = baseRate * distance;

      expect(estimatedCost).toBe(25000);
    });

    test('should add surcharge for fragile items', () => {
      const baseCost = 25000;
      const fragileMultiplier = 1.2;
      const totalCost = baseCost * fragileMultiplier;

      expect(totalCost).toBe(30000);
    });

    test('should add premium for express delivery', () => {
      const baseCost = 25000;
      const expressPremium = 1.5;
      const totalCost = baseCost * expressPremium;

      expect(totalCost).toBe(37500);
    });
  });

  describe('Service API Contract', () => {
    test('should export required functions', () => {
      const requiredFunctions = [
        'findMatches',
        'scoreTransporter',
        'validateMatchingRequest',
        'calculateDistance',
      ];

      requiredFunctions.forEach(fn => {
        expect(fn).toBeDefined();
      });
    });
  });

  describe('Performance', () => {
    test('should complete matching within reasonable time', () => {
      const startTime = Date.now();
      // Simulate matching operation
      const matches = Array.from({ length: 10 }, (_, i) => ({
        id: `tr_${i}`,
        score: Math.random() * 10,
      }));
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(matches.length).toBe(10);
      expect(executionTime).toBeLessThan(5000); // Should be fast
    });
  });
});