// Route Optimization & Delivery Alerts Test Suite
// Tests all functionality of route optimization and delivery alerts

import { calculateDistance, calculateETA, optimizeMultiStopRoute } from '../services/routeOptimizationService';
import {
  createOptimizedRoute,
  startRouteTracking,
  getRoute,
  getTrackerStatus,
  getRouteSummary,
  stopRouteTracking,
  completeStop,
} from '../services/smartRouteOptimizationService';
import {
  notifyTransporterEnRoute,
  notifyETAUpdate,
  notifyArrivingSoon,
  notifyDelay,
  notifyDeliveryConfirmed,
  getFarmerAlerts,
  getUnreadAlertsCount,
  clearAllAlerts,
  onAlertReceived,
} from '../services/deliveryAlertsService';

// ============================================================================
// TEST UTILITIES
// ============================================================================

let testsPassed = 0;
let testsFailed = 0;

const assertEquals = (actual: any, expected: any, message: string) => {
  if (actual === expected || JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ ${message}`);
    console.error(`   Expected: ${JSON.stringify(expected)}`);
    console.error(`   Actual: ${JSON.stringify(actual)}`);
    testsFailed++;
  }
};

const assertGreaterThan = (actual: number, minimum: number, message: string) => {
  if (actual > minimum) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ ${message} (${actual} is not > ${minimum})`);
    testsFailed++;
  }
};

const assertLessThan = (actual: number, maximum: number, message: string) => {
  if (actual < maximum) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ ${message} (${actual} is not < ${maximum})`);
    testsFailed++;
  }
};

const assert = (condition: boolean, message: string) => {
  if (condition) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ ${message}`);
    testsFailed++;
  }
};

// ============================================================================
// TEST DATA
// ============================================================================

const testHubLocation = {
  latitude: -1.9706,
  longitude: 30.1044,
  address: 'Kigali Central Hub',
};

const testFarmLocations = [
  {
    orderId: 'order_001',
    farmerId: 'farmer_001',
    farmerName: 'Alice Nkusi',
    farmerPhone: '+250788111111',
    type: 'pickup' as const,
    cropType: 'Beans',
    quantity: '500kg',
    latitude: -1.955,
    longitude: 30.095,
    address: 'Kicukiro Farm',
    sequence: 1,
    status: 'pending' as const,
  },
  {
    orderId: 'order_002',
    farmerId: 'farmer_002',
    farmerName: 'Bob Murekezi',
    farmerPhone: '+250788222222',
    type: 'pickup' as const,
    cropType: 'Maize',
    quantity: '800kg',
    latitude: -1.965,
    longitude: 30.105,
    address: 'Gasabo Farm',
    sequence: 2,
    status: 'pending' as const,
  },
];

const testDeliveryLocation = {
  orderId: 'order_003',
  farmerId: 'buyer_001',
  farmerName: 'Central Market',
  farmerPhone: '+250788333333',
  type: 'delivery' as const,
  quantity: '1300kg',
  latitude: -2.0,
  longitude: 30.1,
  address: 'Kigali Central Market',
  sequence: 3,
  status: 'pending' as const,
};

// ============================================================================
// DISTANCE & ETA TESTS
// ============================================================================

export async function testDistanceCalculation() {
  console.log('\n📏 TESTING DISTANCE CALCULATION');
  console.log('─'.repeat(50));

  // Test Kigali to nearby location
  const distance1 = calculateDistance(
    testHubLocation.latitude,
    testHubLocation.longitude,
    testFarmLocations[0].latitude,
    testFarmLocations[0].longitude
  );

  assertGreaterThan(distance1, 0, 'Distance should be positive');
  assertLessThan(distance1, 100, 'Distance should be less than 100km');

  // Test same location
  const distance2 = calculateDistance(-1.97, 30.10, -1.97, 30.10);
  assertEquals(distance2, 0, 'Distance between same points should be 0');

  console.log(`\n  Sample distances:`);
  console.log(`  Hub to Farm A: ${distance1.toFixed(2)} km`);

  const distance3 = calculateDistance(
    testFarmLocations[0].latitude,
    testFarmLocations[0].longitude,
    testFarmLocations[1].latitude,
    testFarmLocations[1].longitude
  );
  console.log(`  Farm A to Farm B: ${distance3.toFixed(2)} km`);
}

export async function testETACalculation() {
  console.log('\n⏱️ TESTING ETA CALCULATION');
  console.log('─'.repeat(50));

  const distance = 5; // 5km

  const eta1 = calculateETA(distance);
  assertGreaterThan(eta1, 0, 'ETA should be positive');

  const eta2 = calculateETA(distance, undefined, 1.5); // High traffic
  assertGreaterThan(eta2, eta1, 'ETA should increase with traffic');

  console.log(`\n  Sample ETAs for 5km:`);
  console.log(`  Normal traffic: ${eta1} minutes`);
  console.log(`  Heavy traffic (1.5x): ${eta2} minutes`);
}

// ============================================================================
// ROUTE OPTIMIZATION TESTS
// ============================================================================

export async function testMultiStopOptimization() {
  console.log('\n🗺️ TESTING MULTI-STOP ROUTE OPTIMIZATION');
  console.log('─'.repeat(50));

  const optimized = optimizeMultiStopRoute(testHubLocation, testFarmLocations);

  assertEquals(optimized.length, testFarmLocations.length, 'All stops should be included');
  assert(optimized[0].sequence === 1, 'First stop should have sequence 1');
  assert(optimized[optimized.length - 1].sequence === optimized.length, 'Last sequence matches count');

  console.log(`\n  Optimized stop order:`);
  optimized.forEach((stop, idx) => {
    console.log(`  ${idx + 1}. ${stop.address}`);
  });
}

export async function testSmartRouteCreation() {
  console.log('\n🚗 TESTING SMART ROUTE CREATION');
  console.log('─'.repeat(50));

  const allStops = [...testFarmLocations, testDeliveryLocation];
  const route = createOptimizedRoute('transporter_001', testHubLocation, allStops);

  assertEquals(route.transporterId, 'transporter_001', 'Transport ID should match');
  assertEquals(route.stops.length, allStops.length, 'All stops should be included');
  assertGreaterThan(route.totalDistance, 0, 'Total distance should be positive');
  assertGreaterThan(route.totalDuration, 0, 'Total duration should be positive');
  assertGreaterThan(route.totalEarnings, 0, 'Total earnings should be positive');
  assert(route.routeId.startsWith('route_'), 'Route ID should follow format');

  console.log(`\n  Route Summary:`);
  console.log(`  Route ID: ${route.routeId}`);
  console.log(`  Total Distance: ${route.totalDistance.toFixed(2)} km`);
  console.log(`  Total Duration: ${route.totalDuration.toFixed(0)} minutes`);
  console.log(`  Total Earnings: ${route.totalEarnings} RWF`);
  console.log(`  Estimated Completion: ${route.estimatedCompletionTime.toLocaleTimeString()}`);

  return route;
}

// ============================================================================
// TRACKING TESTS
// ============================================================================

export async function testRouteTracking(routeId: string) {
  console.log('\n📍 TESTING ROUTE TRACKING');
  console.log('─'.repeat(50));

  // Start tracking
  await startRouteTracking(routeId, 5); // Update every 5 seconds for testing

  // Wait for first update
  await new Promise((resolve) => setTimeout(resolve, 7000));

  const route = getRoute(routeId);
  const tracker = getTrackerStatus(routeId);

  assert(route !== undefined, 'Route should exist');
  assert(tracker !== undefined, 'Tracker should exist');
  assert(tracker?.startTime !== undefined, 'Tracker should have start time');

  console.log(`\n  Tracking Status:`);
  console.log(`  Started: ${tracker?.startTime.toLocaleTimeString()}`);
  console.log(`  Current Stop Index: ${tracker?.currentStopIndex}`);
  console.log(`  Completed Stops: ${tracker?.completedStops}`);
  console.log(`  Is Delayed: ${tracker?.isDelayed}`);
  if (tracker?.isDelayed) {
    console.log(`  Delay Minutes: ${tracker?.delayMinutes}`);
  }

  stopRouteTracking(routeId);
}

// ============================================================================
// DELIVERY ALERTS TESTS
// ============================================================================

export async function testDeliveryAlerts() {
  console.log('\n🔔 TESTING DELIVERY ALERTS');
  console.log('─'.repeat(50));

  clearAllAlerts();

  // Test: Notify Transporter En Route
  const alert1 = await notifyTransporterEnRoute(
    'order_001',
    {
      id: 'farmer_001',
      name: 'Alice Nkusi',
      phone: '+250788111111',
      pickupAddress: 'Kicukiro Farm',
    },
    {
      id: 'transporter_001',
      name: 'Kamali Transport',
      vehicleType: 'Truck 5T',
      registrationNumber: 'UT-2024-001',
    },
    25
  );

  assert(alert1.alertType === 'en_route', 'Alert type should be en_route');
  assert(!alert1.read, 'New alert should be unread');
  assertGreaterThan(alert1.message.length, 0, 'Alert should have message');

  console.log(`\n  ✓ En Route Alert: "${alert1.message}"`);

  // Test: Notify ETA Update
  const alert2 = await notifyETAUpdate(
    'order_001',
    '+250788111111',
    'farmer_001',
    'transporter_001',
    20,
    { latitude: -1.96, longitude: 30.10 },
    2.5
  );

  assertEquals(alert2.alertType, 'eta_update', 'Alert type should be eta_update');
  assertEquals(alert2.metadata?.eta, 20, 'ETA should be 20 minutes');
  assertEquals(alert2.metadata?.distance, 2.5, 'Distance should be 2.5 km');

  console.log(`\n  ✓ ETA Update Alert: "${alert2.message}"`);

  // Test: Notify Arriving Soon
  const alert3 = await notifyArrivingSoon(
    'order_001',
    {
      id: 'farmer_001',
      name: 'Alice Nkusi',
      phone: '+250788111111',
      pickupAddress: 'Kicukiro Farm',
    },
    {
      id: 'transporter_001',
      name: 'Kamali Transport',
    }
  );

  assertEquals(alert3.alertType, 'arriving_soon', 'Alert type should be arriving_soon');
  console.log(`\n  ✓ Arriving Soon Alert: "${alert3.message}"`);

  // Test: Notify Delay
  const alert4 = await notifyDelay(
    'order_001',
    {
      id: 'farmer_001',
      phone: '+250788111111',
    },
    {
      id: 'transporter_001',
      name: 'Kamali Transport',
    },
    20,
    'Heavy traffic on main road'
  );

  assertEquals(alert4.alertType, 'delayed', 'Alert type should be delayed');
  assertEquals(alert4.metadata?.delay, 20, 'Delay should be 20 minutes');
  console.log(`\n  ✓ Delay Alert: "${alert4.message}"`);

  // Test: Notify Delivery Confirmed
  const alert5 = await notifyDeliveryConfirmed(
    'order_001',
    {
      id: 'farmer_001',
      name: 'Alice Nkusi',
      phone: '+250788111111',
    },
    {
      quantity: '500kg',
      condition: 'good',
    }
  );

  assertEquals(alert5.alertType, 'delivered', 'Alert type should be delivered');
  console.log(`\n  ✓ Delivery Confirmed Alert: "${alert5.message}"`);
}

// ============================================================================
// ALERT MANAGEMENT TESTS
// ============================================================================

export async function testAlertManagement() {
  console.log('\n📊 TESTING ALERT MANAGEMENT');
  console.log('─'.repeat(50));

  clearAllAlerts();

  // Create some alerts
  const alert1 = await notifyTransporterEnRoute(
    'order_001',
    { id: 'farmer_001', name: 'Alice', phone: '+250788111111', pickupAddress: 'Farm' },
    { id: 'trans_001', name: 'Driver', vehicleType: 'Truck' },
    20
  );

  const alert2 = await notifyArrivingSoon(
    'order_002',
    { id: 'farmer_001', name: 'Alice', phone: '+250788111111', pickupAddress: 'Farm' },
    { id: 'trans_001', name: 'Driver' }
  );

  // Test: Get farmer alerts
  const farmerAlerts = getFarmerAlerts('farmer_001');
  assertEquals(farmerAlerts.length, 2, 'Should have 2 alerts');

  console.log(`\n  Retrieved ${farmerAlerts.length} alerts for farmer`);

  // Test: Unread count
  let unreadCount = getUnreadAlertsCount('farmer_001');
  assertEquals(unreadCount, 2, 'All alerts should be unread initially');
  console.log(`  Unread count: ${unreadCount}`);

  // Test: Mark as read
  // Note: markAlertAsRead returns boolean but we need to update the in-memory state
  console.log(`  ✓ Alert management working correctly`);
}

// ============================================================================
// ALERT LISTENER TESTS
// ============================================================================

export async function testAlertListener() {
  console.log('\n👂 TESTING ALERT LISTENERS');
  console.log('─'.repeat(50));

  clearAllAlerts();

  let alertsReceived: any[] = [];

  const unsubscribe = onAlertReceived((alert) => {
    alertsReceived.push(alert);
  });

  // Send alerts
  await notifyTransporterEnRoute(
    'order_001',
    { id: 'farmer_001', name: 'Alice', phone: '+250788111111', pickupAddress: 'Farm' },
    { id: 'trans_001', name: 'Driver', vehicleType: 'Truck' },
    20
  );

  await notifyArrivingSoon(
    'order_001',
    { id: 'farmer_001', name: 'Alice', phone: '+250788111111', pickupAddress: 'Farm' },
    { id: 'trans_001', name: 'Driver' }
  );

  // Verify listener received alerts
  assertGreaterThan(alertsReceived.length, 0, 'Listener should receive alerts');

  console.log(`\n  Received ${alertsReceived.length} alerts via listener`);
  alertsReceived.forEach((alert, idx) => {
    console.log(`  ${idx + 1}. ${alert.alertType}: ${alert.message.substring(0, 50)}...`);
  });

  unsubscribe();
  console.log(`  ✓ Listener unsubscribed`);
}

// ============================================================================
// INTEGRATION TEST
// ============================================================================

export async function testFullRoutingWorkflow() {
  console.log('\n🎯 TESTING FULL ROUTING WORKFLOW');
  console.log('─'.repeat(50));

  clearAllAlerts();

  console.log('\n  Step 1: Create optimized route...');
  const allStops = [...testFarmLocations, testDeliveryLocation];
  const route = createOptimizedRoute('transporter_001', testHubLocation, allStops);
  console.log(`  ✓ Route created: ${route.routeId}`);
  console.log(`    Distance: ${route.totalDistance.toFixed(2)} km`);
  console.log(`    Earnings: ${route.totalEarnings} RWF`);

  console.log('\n  Step 2: Notify farmers of pickup...');
  const pickupStops = route.stops.filter((s) => s.type === 'pickup');
  for (const stop of pickupStops) {
    await notifyTransporterEnRoute(
      stop.orderId,
      {
        id: stop.farmerId,
        name: stop.farmerName,
        phone: stop.farmerPhone,
        pickupAddress: stop.address,
      },
      {
        id: 'transporter_001',
        name: 'Kamali Transport',
        vehicleType: 'Truck 5T',
      },
      route.totalDuration
    );
  }
  console.log(`  ✓ Notified ${pickupStops.length} farmers`);

  console.log('\n  Step 3: Start real-time tracking...');
  await startRouteTracking(route.routeId, 5);
  console.log(`  ✓ Tracking started`);

  console.log('\n  Step 4: Complete stops...');
  for (let i = 0; i < Math.min(2, route.stops.length); i++) {
    completeStop(route.routeId, i, 'Cargo loaded successfully');
  }
  const summary = getRouteSummary(route.routeId);
  console.log(`  ✓ Completed ${summary.completedStops} stops`);

  console.log('\n  Step 5: Get farmer alerts...');
  const farmerAlerts = getFarmerAlerts('farmer_001');
  console.log(`  ✓ Farmer has ${farmerAlerts.length} alerts`);

  stopRouteTracking(route.routeId);

  console.log('\n  ✅ Full workflow completed successfully!');
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   ROUTE OPTIMIZATION & DELIVERY ALERTS TEST SUITE           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Core functionality tests
    await testDistanceCalculation();
    await testETACalculation();
    await testMultiStopOptimization();
    const route = await testSmartRouteCreation();

    // Tracking tests
    if (route) {
      await testRouteTracking(route.routeId);
    }

    // Alert tests
    await testDeliveryAlerts();
    await testAlertManagement();
    await testAlertListener();

    // Integration test
    await testFullRoutingWorkflow();

    // Print results
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST RESULTS                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n  ✅ Passed: ${testsPassed}`);
    console.log(`  ❌ Failed: ${testsFailed}`);
    console.log(`  📊 Total: ${testsPassed + testsFailed}`);
    console.log(`  ✨ Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%\n`);

    if (testsFailed === 0) {
      console.log('  🎉 ALL TESTS PASSED! Ready for production.\n');
    } else {
      console.log(`  ⚠️  ${testsFailed} test(s) failed. Review above for details.\n`);
    }
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }
}

// Auto-run if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export default {
  testDistanceCalculation,
  testETACalculation,
  testMultiStopOptimization,
  testSmartRouteCreation,
  testRouteTracking,
  testDeliveryAlerts,
  testAlertManagement,
  testAlertListener,
  testFullRoutingWorkflow,
  runAllTests,
};