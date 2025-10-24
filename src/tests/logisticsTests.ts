// Logistics System Tests
// Run these tests to verify all new features work correctly

import {
  calculateDistance,
  calculateEarnings,
  calculateFuelCost,
  calculateProfit,
  calculateETA,
  optimizeMultiStopRoute,
  findNearbyLoads,
  getCurrentTrafficConditions,
} from '../services/routeOptimizationService';

import {
  findBestMatches,
  calculateDailyEarningPotential,
  suggestOptimalWaitingLocation,
} from '../services/loadMatchingService';

// Test Colors for Console Output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, expected?: any, actual?: any) {
  if (condition) {
    console.log(`${GREEN}✓ PASS${RESET} - ${testName}`);
    passedTests++;
  } else {
    console.log(`${RED}✗ FAIL${RESET} - ${testName}`);
    if (expected !== undefined && actual !== undefined) {
      console.log(`  Expected: ${expected}, Got: ${actual}`);
    }
    failedTests++;
  }
}

function testSection(title: string) {
  console.log(`\n${BLUE}${'='.repeat(60)}${RESET}`);
  console.log(`${BLUE}${title}${RESET}`);
  console.log(`${BLUE}${'='.repeat(60)}${RESET}\n`);
}

// ============================================================================
// TEST 1: Distance Calculation Accuracy
// ============================================================================
function testDistanceCalculations() {
  testSection('TEST 1: Distance Calculation Accuracy');

  // Test 1.1: Kigali to Butare (known distance ~119 km)
  const kigaliToButare = calculateDistance(
    -1.9706, 30.1044, // Kigali
    -2.5974, 29.7399  // Butare
  );
  assert(
    kigaliToButare >= 118 && kigaliToButare <= 121,
    'Kigali to Butare distance (~119 km)',
    '118-121 km',
    `${kigaliToButare} km`
  );

  // Test 1.2: Same location (should be 0)
  const sameLocation = calculateDistance(-1.9706, 30.1044, -1.9706, 30.1044);
  assert(
    sameLocation === 0,
    'Same location distance (should be 0)',
    '0 km',
    `${sameLocation} km`
  );

  // Test 1.3: Kigali to Gisenyi (known distance ~145 km)
  const kigaliToGisenyi = calculateDistance(
    -1.9706, 30.1044, // Kigali
    -1.7039, 29.2562  // Gisenyi
  );
  assert(
    kigaliToGisenyi >= 140 && kigaliToGisenyi <= 150,
    'Kigali to Gisenyi distance (~145 km)',
    '140-150 km',
    `${kigaliToGisenyi} km`
  );

  // Test 1.4: Short distance (1 km)
  const shortDistance = calculateDistance(
    -1.9706, 30.1044,
    -1.9616, 30.1044 // ~1 km north
  );
  assert(
    shortDistance >= 0.9 && shortDistance <= 1.1,
    'Short distance (~1 km)',
    '0.9-1.1 km',
    `${shortDistance} km`
  );

  console.log(`\n${YELLOW}Distance Tests: ${passedTests - failedTests}/${passedTests + failedTests} passed${RESET}`);
}

// ============================================================================
// TEST 2: Earnings Calculations
// ============================================================================
function testEarningsCalculations() {
  testSection('TEST 2: Earnings Calculations');

  // Test 2.1: 50 km trip earnings
  const earnings50km = calculateEarnings(50);
  assert(
    earnings50km === 60000,
    '50 km trip earnings (1200 RWF/km)',
    '60,000 RWF',
    `${earnings50km} RWF`
  );

  // Test 2.2: 100 km trip earnings
  const earnings100km = calculateEarnings(100);
  assert(
    earnings100km === 120000,
    '100 km trip earnings',
    '120,000 RWF',
    `${earnings100km} RWF`
  );

  // Test 2.3: Custom rate (1500 RWF/km)
  const earningsCustom = calculateEarnings(50, 1500);
  assert(
    earningsCustom === 75000,
    '50 km with custom rate (1500 RWF/km)',
    '75,000 RWF',
    `${earningsCustom} RWF`
  );

  // Test 2.4: Zero distance
  const earningsZero = calculateEarnings(0);
  assert(
    earningsZero === 0,
    'Zero distance earnings',
    '0 RWF',
    `${earningsZero} RWF`
  );
}

// ============================================================================
// TEST 3: Fuel Cost Calculations
// ============================================================================
function testFuelCostCalculations() {
  testSection('TEST 3: Fuel Cost Calculations');

  // Test 3.1: 100 km fuel cost (12L/100km, 1500 RWF/L)
  const fuelCost100km = calculateFuelCost(100);
  assert(
    fuelCost100km === 18000,
    '100 km fuel cost (12L/100km @ 1500 RWF/L)',
    '18,000 RWF',
    `${fuelCost100km} RWF`
  );

  // Test 3.2: 50 km fuel cost
  const fuelCost50km = calculateFuelCost(50);
  assert(
    fuelCost50km === 9000,
    '50 km fuel cost',
    '9,000 RWF',
    `${fuelCost50km} RWF`
  );

  // Test 3.3: Custom consumption (8L/100km)
  const fuelCostEfficient = calculateFuelCost(100, 1500, 8);
  assert(
    fuelCostEfficient === 12000,
    '100 km with efficient vehicle (8L/100km)',
    '12,000 RWF',
    `${fuelCostEfficient} RWF`
  );

  // Test 3.4: Zero distance
  const fuelCostZero = calculateFuelCost(0);
  assert(
    fuelCostZero === 0,
    'Zero distance fuel cost',
    '0 RWF',
    `${fuelCostZero} RWF`
  );
}

// ============================================================================
// TEST 4: Profit Calculations
// ============================================================================
function testProfitCalculations() {
  testSection('TEST 4: Profit Calculations');

  // Test 4.1: 50 km profit
  const profit50km = calculateProfit(50);
  const expectedProfit = 60000 - 9000; // earnings - fuel
  assert(
    profit50km === expectedProfit,
    '50 km profit (earnings - fuel)',
    `${expectedProfit} RWF`,
    `${profit50km} RWF`
  );

  // Test 4.2: 100 km profit
  const profit100km = calculateProfit(100);
  const expectedProfit100 = 120000 - 18000;
  assert(
    profit100km === expectedProfit100,
    '100 km profit',
    `${expectedProfit100} RWF`,
    `${profit100km} RWF`
  );

  // Test 4.3: Profit margin percentage (50 km)
  const profitMargin = (profit50km / calculateEarnings(50)) * 100;
  assert(
    profitMargin >= 84 && profitMargin <= 86,
    '50 km profit margin (~85%)',
    '84-86%',
    `${profitMargin.toFixed(1)}%`
  );
}

// ============================================================================
// TEST 5: ETA Calculations
// ============================================================================
function testETACalculations() {
  testSection('TEST 5: ETA Calculations');

  // Test 5.1: 60 km at 60 km/h (should be 60 minutes)
  const eta60km = calculateETA(60, { level: 'low', multiplier: 1.0 }, 60);
  assert(
    eta60km === 60,
    '60 km at 60 km/h (no traffic)',
    '60 minutes',
    `${eta60km} minutes`
  );

  // Test 5.2: 30 km at 60 km/h (should be 30 minutes)
  const eta30km = calculateETA(30, { level: 'low', multiplier: 1.0 }, 60);
  assert(
    eta30km === 30,
    '30 km at 60 km/h',
    '30 minutes',
    `${eta30km} minutes`
  );

  // Test 5.3: Heavy traffic (1.5x multiplier)
  const etaTraffic = calculateETA(60, { level: 'high', multiplier: 1.5 }, 60);
  assert(
    etaTraffic === 90,
    '60 km with heavy traffic (1.5x)',
    '90 minutes',
    `${etaTraffic} minutes`
  );

  // Test 5.4: Minimum ETA (very short distance)
  const etaShort = calculateETA(1, { level: 'low', multiplier: 1.0 }, 60);
  assert(
    etaShort >= 1,
    'Very short distance ETA (minimum)',
    '≥1 minute',
    `${etaShort} minutes`
  );
}

// ============================================================================
// TEST 6: Load Matching Algorithm
// ============================================================================
function testLoadMatching() {
  testSection('TEST 6: Load Matching Algorithm');

  const currentLocation = {
    latitude: -1.9706,
    longitude: 30.1044,
  };

  // Create test loads
  const testLoads = [
    {
      _id: '1',
      pickupLocation: { latitude: -1.9706, longitude: 30.1044, address: 'Kigali Center' },
      deliveryLocation: { latitude: -1.9506, longitude: 30.1244, address: 'Kigali East' },
      quantity: 100,
      status: 'pending',
      totalPrice: 50000,
    },
    {
      _id: '2',
      pickupLocation: { latitude: -2.5974, longitude: 29.7399, address: 'Butare' },
      deliveryLocation: { latitude: -1.9706, longitude: 30.1044, address: 'Kigali' },
      quantity: 200,
      status: 'pending',
      totalPrice: 100000,
      urgency: 'urgent' as const,
    },
    {
      _id: '3',
      pickupLocation: { latitude: -1.7039, longitude: 29.2562, address: 'Gisenyi' },
      deliveryLocation: { latitude: -1.9706, longitude: 30.1044, address: 'Kigali' },
      quantity: 150,
      status: 'pending',
      totalPrice: 80000,
    },
  ];

  const matches = findBestMatches(currentLocation, testLoads);

  // Test 6.1: Returns all loads
  assert(
    matches.length === 3,
    'Returns all 3 test loads',
    '3 matches',
    `${matches.length} matches`
  );

  // Test 6.2: Sorted by score (highest first)
  assert(
    matches[0].score >= matches[1].score && matches[1].score >= matches[2].score,
    'Loads sorted by score (descending)',
    'scores in descending order',
    `${matches[0].score}, ${matches[1].score}, ${matches[2].score}`
  );

  // Test 6.3: Closest load has high score
  assert(
    matches[0].distance < 5,
    'Closest load (Kigali Center) ranked first',
    '< 5 km',
    `${matches[0].distance.toFixed(2)} km`
  );

  // Test 6.4: Match has reasons
  assert(
    matches[0].matchReasons.length > 0,
    'Match includes reasons',
    '> 0 reasons',
    `${matches[0].matchReasons.length} reasons`
  );

  // Test 6.5: Urgent loads get priority
  const urgentLoad = matches.find(m => m.load.urgency === 'urgent');
  assert(
    urgentLoad !== undefined && urgentLoad.score > 100,
    'Urgent load gets high score',
    '> 100',
    urgentLoad ? `${urgentLoad.score}` : 'not found'
  );

  console.log(`\n${YELLOW}Sample match scores:${RESET}`);
  matches.forEach((match, i) => {
    console.log(`  ${i + 1}. Score: ${match.score}, Distance: ${match.distance.toFixed(1)}km, Profit: ${match.profit.toLocaleString()} RWF`);
    console.log(`     Reasons: ${match.matchReasons.slice(0, 2).join(', ')}`);
  });
}

// ============================================================================
// TEST 7: Daily Earning Potential
// ============================================================================
function testDailyEarningPotential() {
  testSection('TEST 7: Daily Earning Potential');

  const currentLocation = {
    latitude: -1.9706,
    longitude: 30.1044,
  };

  const testLoads = [
    {
      _id: '1',
      pickupLocation: { latitude: -1.9706, longitude: 30.1044, address: 'Kigali' },
      deliveryLocation: { latitude: -1.9506, longitude: 30.1244, address: 'Nearby' },
      quantity: 100,
      status: 'pending',
      totalPrice: 50000,
    },
    {
      _id: '2',
      pickupLocation: { latitude: -1.9806, longitude: 30.1144, address: 'Kigali' },
      deliveryLocation: { latitude: -1.9406, longitude: 30.1344, address: 'Nearby' },
      quantity: 150,
      status: 'pending',
      totalPrice: 60000,
    },
    {
      _id: '3',
      pickupLocation: { latitude: -1.9906, longitude: 30.0944, address: 'Kigali' },
      deliveryLocation: { latitude: -1.9306, longitude: 30.1444, address: 'Nearby' },
      quantity: 200,
      status: 'pending',
      totalPrice: 70000,
    },
  ];

  const potential = calculateDailyEarningPotential(currentLocation, testLoads, 8);

  // Test 7.1: Returns potential object
  assert(
    potential !== null && potential !== undefined,
    'Returns earning potential object',
    'object',
    typeof potential
  );

  // Test 7.2: Has required fields
  assert(
    'possibleLoads' in potential && 'estimatedEarnings' in potential,
    'Contains required fields',
    'possibleLoads, estimatedEarnings, etc.',
    Object.keys(potential).join(', ')
  );

  // Test 7.3: Possible loads > 0
  assert(
    potential.possibleLoads > 0,
    'Calculates possible loads',
    '> 0',
    potential.possibleLoads
  );

  // Test 7.4: Estimated profit > 0
  assert(
    potential.estimatedProfit > 0,
    'Calculates estimated profit',
    '> 0 RWF',
    `${potential.estimatedProfit} RWF`
  );

  console.log(`\n${YELLOW}Daily Potential:${RESET}`);
  console.log(`  Possible Loads: ${potential.possibleLoads}`);
  console.log(`  Estimated Earnings: ${potential.estimatedEarnings.toLocaleString()} RWF`);
  console.log(`  Estimated Profit: ${potential.estimatedProfit.toLocaleString()} RWF`);
  console.log(`  Average/Hour: ${potential.averagePerHour.toLocaleString()} RWF`);
}

// ============================================================================
// TEST 8: Nearby Loads
// ============================================================================
function testNearbyLoads() {
  testSection('TEST 8: Nearby Loads');

  const currentLocation = {
    latitude: -1.9706,
    longitude: 30.1044,
  };

  const testLoads = [
    {
      _id: '1',
      pickupLocation: { latitude: -1.9706, longitude: 30.1044, address: 'Very Close' },
      deliveryLocation: { latitude: -1.9506, longitude: 30.1244, address: 'Destination' },
      quantity: 100,
      status: 'pending',
      totalPrice: 50000,
    },
    {
      _id: '2',
      pickupLocation: { latitude: -2.5974, longitude: 29.7399, address: 'Butare (far)' },
      deliveryLocation: { latitude: -1.9706, longitude: 30.1044, address: 'Destination' },
      quantity: 200,
      status: 'pending',
      totalPrice: 100000,
    },
    {
      _id: '3',
      pickupLocation: { latitude: -1.9806, longitude: 30.1144, address: 'Close' },
      deliveryLocation: { latitude: -1.9506, longitude: 30.1244, address: 'Destination' },
      quantity: 150,
      status: 'pending',
      totalPrice: 80000,
    },
  ];

  const nearby = findNearbyLoads(currentLocation, testLoads, 20);

  // Test 8.1: Filters distant loads
  assert(
    nearby.length === 2,
    'Filters out loads > 20km away',
    '2 loads',
    `${nearby.length} loads`
  );

  // Test 8.2: Sorted by distance
  assert(
    nearby[0].distance <= nearby[1].distance,
    'Sorted by distance (closest first)',
    'ascending order',
    `${nearby[0].distance.toFixed(1)}km, ${nearby[1].distance.toFixed(1)}km`
  );

  // Test 8.3: Includes earnings
  assert(
    nearby[0].estimatedEarnings > 0,
    'Includes estimated earnings',
    '> 0',
    `${nearby[0].estimatedEarnings} RWF`
  );

  console.log(`\n${YELLOW}Nearby Loads (within 20km):${RESET}`);
  nearby.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.distance.toFixed(1)}km away, Earnings: ${item.estimatedEarnings.toLocaleString()} RWF`);
  });
}

// ============================================================================
// TEST 9: Optimal Waiting Location
// ============================================================================
function testOptimalWaitingLocation() {
  testSection('TEST 9: Optimal Waiting Location');

  const testLoads = [
    {
      _id: '1',
      pickupLocation: { latitude: -1.9706, longitude: 30.1044, address: 'Kigali' },
      deliveryLocation: { latitude: -1.9506, longitude: 30.1244, address: 'Dest' },
      quantity: 100,
      status: 'pending',
      totalPrice: 50000,
    },
    {
      _id: '2',
      pickupLocation: { latitude: -1.9806, longitude: 30.1144, address: 'Nearby' },
      deliveryLocation: { latitude: -1.9506, longitude: 30.1244, address: 'Dest' },
      quantity: 150,
      status: 'pending',
      totalPrice: 60000,
    },
    {
      _id: '3',
      pickupLocation: { latitude: -1.9606, longitude: 30.0944, address: 'Close' },
      deliveryLocation: { latitude: -1.9506, longitude: 30.1244, address: 'Dest' },
      quantity: 200,
      status: 'pending',
      totalPrice: 70000,
    },
  ];

  const optimalLocation = suggestOptimalWaitingLocation(testLoads);

  // Test 9.1: Returns location
  assert(
    optimalLocation !== null && optimalLocation !== undefined,
    'Returns optimal location',
    'object',
    typeof optimalLocation
  );

  // Test 9.2: Has coordinates
  assert(
    'latitude' in optimalLocation && 'longitude' in optimalLocation,
    'Contains latitude and longitude',
    'lat/lon fields',
    Object.keys(optimalLocation).filter(k => k.includes('lat') || k.includes('lon')).join(', ')
  );

  // Test 9.3: Near Kigali (centroid)
  assert(
    Math.abs(optimalLocation.latitude - (-1.97)) < 0.1 &&
    Math.abs(optimalLocation.longitude - 30.10) < 0.1,
    'Optimal location near Kigali (centroid of loads)',
    'near -1.97, 30.10',
    `${optimalLocation.latitude.toFixed(4)}, ${optimalLocation.longitude.toFixed(4)}`
  );

  console.log(`\n${YELLOW}Optimal Waiting Location:${RESET}`);
  console.log(`  Coordinates: ${optimalLocation.latitude.toFixed(4)}, ${optimalLocation.longitude.toFixed(4)}`);
  console.log(`  Nearby Loads: ${optimalLocation.nearbyLoads}`);
  console.log(`  Reason: ${optimalLocation.reason}`);
}

// ============================================================================
// TEST 10: Traffic Conditions
// ============================================================================
function testTrafficConditions() {
  testSection('TEST 10: Traffic Conditions');

  // Test 10.1: Rush hour (8 AM)
  const rushHourMorning = getCurrentTrafficConditions(8);
  assert(
    rushHourMorning.level === 'high' && rushHourMorning.multiplier === 1.5,
    'Rush hour morning (8 AM) = high traffic',
    'high, 1.5x',
    `${rushHourMorning.level}, ${rushHourMorning.multiplier}x`
  );

  // Test 10.2: Business hours (2 PM)
  const businessHours = getCurrentTrafficConditions(14);
  assert(
    businessHours.level === 'moderate' && businessHours.multiplier === 1.2,
    'Business hours (2 PM) = moderate traffic',
    'moderate, 1.2x',
    `${businessHours.level}, ${businessHours.multiplier}x`
  );

  // Test 10.3: Night (11 PM)
  const night = getCurrentTrafficConditions(23);
  assert(
    night.level === 'low' && night.multiplier === 1.0,
    'Night time (11 PM) = low traffic',
    'low, 1.0x',
    `${night.level}, ${night.multiplier}x`
  );

  // Test 10.4: Evening rush (6 PM)
  const rushHourEvening = getCurrentTrafficConditions(18);
  assert(
    rushHourEvening.level === 'high' && rushHourEvening.multiplier === 1.5,
    'Rush hour evening (6 PM) = high traffic',
    'high, 1.5x',
    `${rushHourEvening.level}, ${rushHourEvening.multiplier}x`
  );
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================
export function runAllLogisticsTests() {
  console.log('\n');
  console.log(`${BLUE}${'='.repeat(60)}${RESET}`);
  console.log(`${BLUE}  LOGISTICS PLATFORM - COMPREHENSIVE TEST SUITE${RESET}`);
  console.log(`${BLUE}${'='.repeat(60)}${RESET}`);

  passedTests = 0;
  failedTests = 0;

  testDistanceCalculations();
  testEarningsCalculations();
  testFuelCostCalculations();
  testProfitCalculations();
  testETACalculations();
  testLoadMatching();
  testDailyEarningPotential();
  testNearbyLoads();
  testOptimalWaitingLocation();
  testTrafficConditions();

  // Final Summary
  console.log('\n');
  console.log(`${BLUE}${'='.repeat(60)}${RESET}`);
  console.log(`${BLUE}  TEST SUMMARY${RESET}`);
  console.log(`${BLUE}${'='.repeat(60)}${RESET}`);
  console.log(`\n${GREEN}✓ Passed: ${passedTests}${RESET}`);
  console.log(`${RED}✗ Failed: ${failedTests}${RESET}`);

  const totalTests = passedTests + failedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`\n${YELLOW}Success Rate: ${successRate}%${RESET}`);

  if (failedTests === 0) {
    console.log(`\n${GREEN}🎉 ALL TESTS PASSED! System is working perfectly.${RESET}\n`);
  } else {
    console.log(`\n${RED}⚠️  ${failedTests} test(s) failed. Please review above.${RESET}\n`);
  }

  return {
    passed: passedTests,
    failed: failedTests,
    total: totalTests,
    successRate: parseFloat(successRate),
  };
}

// Export individual test functions for selective testing
export {
  testDistanceCalculations,
  testEarningsCalculations,
  testFuelCostCalculations,
  testProfitCalculations,
  testETACalculations,
  testLoadMatching,
  testDailyEarningPotential,
  testNearbyLoads,
  testOptimalWaitingLocation,
  testTrafficConditions,
};
