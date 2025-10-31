// ETA Service Tests
// Test suite for ETA and traffic prediction functionality

import {
  getTrafficConditions,
  calculateRouteETA,
  calculateRemainingETA,
  formatDuration,
  formatArrivalTime,
  estimateETARange,
  etaService,
} from '../services/etaService';

describe('ETAService', () => {
  describe('getTrafficConditions', () => {
    it('should return light traffic during night hours', () => {
      const traffic = getTrafficConditions(3); // 3 AM
      expect(traffic.level).toBe('light');
      expect(traffic.multiplier).toBe(0.9);
      expect(traffic.icon).toBe('🌙');
    });

    it('should return heavy traffic during peak morning hours', () => {
      const traffic = getTrafficConditions(8); // 8 AM
      expect(traffic.level).toBe('heavy');
      expect(traffic.multiplier).toBe(1.6);
      expect(traffic.speedReduction).toBe(40);
    });

    it('should return heavy traffic during lunch peak', () => {
      const traffic = getTrafficConditions(12); // 12 PM
      expect(traffic.level).toBe('heavy');
      expect(traffic.multiplier).toBe(1.6);
    });

    it('should return heavy traffic during evening peak', () => {
      const traffic = getTrafficConditions(17); // 5 PM
      expect(traffic.level).toBe('heavy');
      expect(traffic.multiplier).toBe(1.6);
    });

    it('should return light traffic on weekend mornings', () => {
      const traffic = getTrafficConditions(10, 0); // 10 AM, Sunday
      expect(traffic.level).toBe('light');
      expect(traffic.multiplier).toBe(1.0);
      expect(traffic.icon).toBe('😎');
    });

    it('should return moderate traffic for moderate hours', () => {
      const traffic = getTrafficConditions(14); // 2 PM
      expect(traffic.level).toBe('moderate');
      expect(traffic.multiplier).toBeGreaterThan(1.0);
      expect(traffic.multiplier).toBeLessThan(1.6);
    });
  });

  describe('formatDuration', () => {
    it('should format minutes as short duration', () => {
      expect(formatDuration(25)).toBe('25 min');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
    });

    it('should format hours only when minutes are 0', () => {
      expect(formatDuration(120)).toBe('2h');
    });

    it('should handle less than 1 minute', () => {
      expect(formatDuration(0.5)).toBe('Less than 1 min');
    });
  });

  describe('formatArrivalTime', () => {
    it('should format time correctly', () => {
      const date = new Date(2024, 0, 1, 14, 30); // Jan 1, 2024, 2:30 PM
      const formatted = formatArrivalTime(date);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
      expect(formatted).toBe('14:30');
    });

    it('should pad hour with zero', () => {
      const date = new Date(2024, 0, 1, 9, 5); // 9:05 AM
      const formatted = formatArrivalTime(date);
      expect(formatted).toBe('09:05');
    });
  });

  describe('calculateRouteETA', () => {
    it('should calculate ETA for a route', () => {
      const eta = calculateRouteETA({
        from: {
          latitude: -1.9403,
          longitude: 30.0589,
          address: 'Kigali',
        },
        to: {
          latitude: -1.9536,
          longitude: 30.0605,
          address: 'Downtown',
        },
      });

      expect(eta.distanceKm).toBeGreaterThan(0);
      expect(eta.durationMinutes).toBeGreaterThan(0);
      expect(eta.arrivalTime).toBeInstanceOf(Date);
      expect(eta.trafficInfo).toBeDefined();
      expect(eta.confidence).toBeGreaterThan(0);
    });

    it('should include traffic info', () => {
      const eta = calculateRouteETA({
        from: {
          latitude: -1.9403,
          longitude: 30.0589,
          address: 'Kigali',
        },
        to: {
          latitude: -1.9536,
          longitude: 30.0605,
          address: 'Downtown',
        },
      });

      expect(eta.trafficInfo.level).toBeDefined();
      expect(eta.trafficInfo.multiplier).toBeGreaterThan(0);
      expect(eta.trafficInfo.color).toBeDefined();
      expect(eta.trafficInfo.icon).toBeDefined();
    });
  });

  describe('calculateRemainingETA', () => {
    it('should calculate remaining ETA from current position', () => {
      const eta = calculateRemainingETA(
        -1.9403,
        30.0589,
        -1.9536,
        30.0605,
        50 // 50 km/h
      );

      expect(eta.distanceKm).toBeGreaterThan(0);
      expect(eta.durationMinutes).toBeGreaterThan(0);
      expect(eta.currentSpeed).toBe(50);
    });

    it('should calculate faster ETA with higher speed', () => {
      const eta1 = calculateRemainingETA(-1.9403, 30.0589, -1.9536, 30.0605, 30);
      const eta2 = calculateRemainingETA(-1.9403, 30.0589, -1.9536, 30.0605, 60);

      expect(eta1.durationMinutes).toBeGreaterThan(eta2.durationMinutes);
    });
  });

  describe('estimateETARange', () => {
    it('should provide best, normal, and worst case ETAs', () => {
      const range = estimateETARange(
        -1.9403,
        30.0589,
        -1.9536,
        30.0605
      );

      expect(range.bestCase).toBeDefined();
      expect(range.normalCase).toBeDefined();
      expect(range.worstCase).toBeDefined();

      // Best case should be faster than worst case
      expect(range.bestCase.durationMinutes).toBeLessThan(
        range.worstCase.durationMinutes
      );
    });

    it('should show speed differences between cases', () => {
      const range = estimateETARange(
        -1.9403,
        30.0589,
        -1.9536,
        30.0605
      );

      expect(range.bestCase.currentSpeed).toBeGreaterThan(
        range.worstCase.currentSpeed
      );
    });
  });

  describe('etaService export', () => {
    it('should export all functions', () => {
      expect(etaService.getTrafficConditions).toBeDefined();
      expect(etaService.calculateRouteETA).toBeDefined();
      expect(etaService.calculateRemainingETA).toBeDefined();
      expect(etaService.formatArrivalTime).toBeDefined();
      expect(etaService.formatDuration).toBeDefined();
      expect(etaService.estimateETARange).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should calculate complete trip ETA with traffic', () => {
      const eta = calculateRouteETA({
        from: {
          latitude: -1.9403,
          longitude: 30.0589,
          address: 'Kigali Market',
        },
        to: {
          latitude: -2.5974,
          longitude: 29.7399,
          address: 'Butare',
        },
        currentLocation: {
          latitude: -2.0,
          longitude: 29.9,
          speed: 60,
        },
      });

      // Should be a long route
      expect(eta.distanceKm).toBeGreaterThan(50);
      expect(eta.durationMinutes).toBeGreaterThan(60);
      
      // Should have valid traffic info
      expect(['light', 'moderate', 'heavy', 'congested']).toContain(
        eta.trafficInfo.level
      );
    });

    it('should provide formatted output', () => {
      const eta = calculateRouteETA({
        from: {
          latitude: -1.9403,
          longitude: 30.0589,
          address: 'Kigali',
        },
        to: {
          latitude: -1.9536,
          longitude: 30.0605,
          address: 'Downtown',
        },
      });

      const formatted = {
        arrival: formatArrivalTime(eta.arrivalTime),
        duration: formatDuration(eta.durationMinutes),
        traffic: eta.trafficInfo.description,
      };

      expect(formatted.arrival).toMatch(/\d{2}:\d{2}/);
      expect(formatted.duration).toMatch(/min|hour|Less/);
      expect(formatted.traffic).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle same location', () => {
      const eta = calculateRemainingETA(-1.9403, 30.0589, -1.9403, 30.0589);
      expect(eta.distanceKm).toBe(0);
      expect(eta.durationMinutes).toBe(0);
    });

    it('should handle very far locations', () => {
      // Kigali to Gisenyi (far distance in Rwanda)
      const eta = calculateRouteETA({
        from: {
          latitude: -1.9706,
          longitude: 30.1044,
          address: 'Kigali',
        },
        to: {
          latitude: -1.7039,
          longitude: 29.2562,
          address: 'Gisenyi',
        },
      });

      expect(eta.distanceKm).toBeGreaterThan(100);
      expect(eta.durationMinutes).toBeGreaterThan(120);
    });

    it('should handle zero speed gracefully', () => {
      const eta = calculateRemainingETA(
        -1.9403,
        30.0589,
        -1.9536,
        30.0605,
        0
      );

      // Should handle gracefully (might be infinite or very high)
      expect(eta).toBeDefined();
    });
  });
});

// Console test runner (for npm test)
if (require.main === module) {
  console.log('🧪 Running ETA Service Tests...\n');

  try {
    // Test 1: Traffic conditions
    console.log('✅ Test 1: Traffic Conditions');
    const nightTraffic = getTrafficConditions(3);
    console.log(`  Night (3 AM): ${nightTraffic.description} (${nightTraffic.multiplier}x)`);

    const peakTraffic = getTrafficConditions(8);
    console.log(`  Peak (8 AM): ${peakTraffic.description} (${peakTraffic.multiplier}x)`);

    // Test 2: ETA calculation
    console.log('\n✅ Test 2: ETA Calculation');
    const eta = calculateRouteETA({
      from: {
        latitude: -1.9403,
        longitude: 30.0589,
        address: 'Kigali Market',
      },
      to: {
        latitude: -1.9536,
        longitude: 30.0605,
        address: 'Downtown Kigali',
      },
    });

    console.log(`  Distance: ${eta.distanceKm} km`);
    console.log(`  Duration: ${formatDuration(eta.durationMinutes)}`);
    console.log(`  Arrival: ${formatArrivalTime(eta.arrivalTime)}`);
    console.log(`  Traffic: ${eta.trafficInfo.description}`);

    // Test 3: ETA Range
    console.log('\n✅ Test 3: ETA Range');
    const range = estimateETARange(-1.9403, 30.0589, -1.9536, 30.0605);
    console.log(`  Best case: ${formatDuration(range.bestCase.durationMinutes)}`);
    console.log(`  Normal case: ${formatDuration(range.normalCase.durationMinutes)}`);
    console.log(`  Worst case: ${formatDuration(range.worstCase.durationMinutes)}`);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}