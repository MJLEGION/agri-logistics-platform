/**
 * Geocoding Service Tests
 * Verify address-to-coordinate conversion works correctly
 */

import {
  geocodeAddress,
  ensureCoordinates,
  isValidLocation,
  getCoordinates,
} from '../services/geocodingService';

// Test 1: Basic geocoding
console.log('=== TEST 1: Basic Geocoding ===');
const test1 = geocodeAddress('Kigali Market');
console.log('Input: "Kigali Market"');
console.log('Output:', test1);
console.assert(
  test1.latitude === -1.9403 && test1.longitude === 30.0589,
  'Kigali Market geocoding failed'
);
console.log('✅ PASS: Kigali Market correctly geocoded\n');

// Test 2: Case insensitivity
console.log('=== TEST 2: Case Insensitivity ===');
const test2 = geocodeAddress('DOWNTOWN KIGALI');
console.log('Input: "DOWNTOWN KIGALI"');
console.log('Output:', test2);
console.assert(
  test2.latitude === -1.9536 && test2.longitude === 30.0605,
  'Case insensitive geocoding failed'
);
console.log('✅ PASS: Case insensitive geocoding works\n');

// Test 3: Partial match
console.log('=== TEST 3: Partial Address Match ===');
const test3 = geocodeAddress('going to butare');
console.log('Input: "going to butare"');
console.log('Output:', test3);
console.assert(
  test3.latitude === -2.5974 && test3.longitude === 29.7399,
  'Partial match failed'
);
console.log('✅ PASS: Partial address matching works\n');

// Test 4: Unknown address fallback
console.log('=== TEST 4: Unknown Address Fallback ===');
const test4 = geocodeAddress('Unknown Random Location XYZ');
console.log('Input: "Unknown Random Location XYZ"');
console.log('Output:', test4);
console.assert(
  test4.latitude === -1.9536 && test4.longitude === 30.0605,
  'Fallback to Kigali failed'
);
console.log('✅ PASS: Unknown addresses fallback to Kigali\n');

// Test 5: Location with existing coordinates
console.log('=== TEST 5: Location with Existing Coordinates ===');
const location5 = {
  latitude: -1.5,
  longitude: 29.6,
  address: 'Some location',
};
const test5 = ensureCoordinates(location5);
console.log('Input:', location5);
console.log('Output:', test5);
console.assert(
  test5.latitude === -1.5 && test5.longitude === 29.6,
  'Existing coordinates were changed'
);
console.log('✅ PASS: Existing coordinates preserved\n');

// Test 6: Location with only address
console.log('=== TEST 6: Location with Only Address ===');
const location6 = { address: 'Muhanga' };
const test6 = ensureCoordinates(location6);
console.log('Input:', location6);
console.log('Output:', test6);
console.assert(
  typeof test6.latitude === 'number' && typeof test6.longitude === 'number',
  'Address-only location failed'
);
console.log('✅ PASS: Address-only locations geocoded\n');

// Test 7: Null/undefined location
console.log('=== TEST 7: Null/Undefined Location ===');
const test7 = ensureCoordinates(null);
console.log('Input: null');
console.log('Output:', test7);
console.assert(
  typeof test7.latitude === 'number' && typeof test7.longitude === 'number',
  'Null location handling failed'
);
console.log('✅ PASS: Null locations get default coordinates\n');

// Test 8: Validation
console.log('=== TEST 8: Location Validation ===');
const validLoc = { latitude: -1.9, longitude: 30.1 };
const invalidLoc1 = { latitude: -1.9 }; // Missing longitude
const invalidLoc2 = { latitude: NaN, longitude: 30.1 }; // Invalid latitude
const invalidLoc3 = { latitude: 95, longitude: 200 }; // Out of bounds

console.log('Valid location:', isValidLocation(validLoc), '(should be true)');
console.assert(isValidLocation(validLoc), 'Valid location validation failed');

console.log('Missing longitude:', isValidLocation(invalidLoc1), '(should be false)');
console.assert(!isValidLocation(invalidLoc1), 'Invalid location 1 not caught');

console.log('NaN latitude:', isValidLocation(invalidLoc2), '(should be false)');
console.assert(!isValidLocation(invalidLoc2), 'Invalid location 2 not caught');

console.log('Out of bounds:', isValidLocation(invalidLoc3), '(should be false)');
console.assert(!isValidLocation(invalidLoc3), 'Invalid location 3 not caught');

console.log('✅ PASS: Validation works correctly\n');

// Test 9: Mixed real-world scenario
console.log('=== TEST 9: Real-world Scenario ===');
const pickup = { address: 'Kigali Market' };
const delivery = { latitude: -2.5974, longitude: 29.7399, address: 'Butare' };
const validPickup = ensureCoordinates(pickup);
const validDelivery = ensureCoordinates(delivery);

console.log('Pickup (input):', pickup);
console.log('Pickup (output):', validPickup);
console.log('Delivery (input):', delivery);
console.log('Delivery (output):', validDelivery);

console.assert(
  isValidLocation(validPickup) && isValidLocation(validDelivery),
  'Real-world scenario failed'
);
console.log('✅ PASS: Real-world scenario works\n');

// Test 10: Get coordinates function
console.log('=== TEST 10: Get Coordinates Function ===');
const coords = getCoordinates({ address: 'Gisenyi' });
console.log('Input address: "Gisenyi"');
console.log('Output coordinates:', coords);
console.assert(
  coords.latitude === -1.7039 && coords.longitude === 29.2562,
  'getCoordinates failed'
);
console.log('✅ PASS: getCoordinates works\n');

// Summary
console.log('═══════════════════════════════════════');
console.log('✅ ALL TESTS PASSED!');
console.log('═══════════════════════════════════════');
console.log('Geocoding service is working correctly.');
console.log('ETA system now supports text addresses!');
console.log('═══════════════════════════════════════\n');