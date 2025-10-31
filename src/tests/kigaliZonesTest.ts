/**
 * Test suite for Kigali zone code geocoding
 * Tests that different zone codes map to different coordinates
 */

import { geocodeAddress, ensureCoordinates } from '../services/geocodingService';

console.log('🧪 Testing Kigali Zone Code Geocoding\n');

// Test 1: Direct geocoding of zone codes
console.log('=== Test 1: Direct Zone Code Geocoding ===');
const kk229a = geocodeAddress('kk 229a');
const kk226 = geocodeAddress('kk226');

console.log(`kk 229a coordinates:`, kk229a);
console.log(`kk226 coordinates:`, kk226);
console.log(`Distance between them:`, calculateDistanceKm(kk229a, kk226), 'km');

// Test 2: Ensure coordinates for location objects
console.log('\n=== Test 2: Ensure Coordinates for Location Objects ===');
const loc1 = ensureCoordinates({ address: 'kk 229a' });
const loc2 = ensureCoordinates({ address: 'kk226' });

console.log(`Location 1 with kk 229a:`, loc1);
console.log(`Location 2 with kk226:`, loc2);
console.log(`Both have valid coordinates?`, 
  loc1.latitude && loc1.longitude && loc2.latitude && loc2.longitude);

// Test 3: Verify coordinates are different
console.log('\n=== Test 3: Verify Coordinates Are Different ===');
const areDifferent = 
  loc1.latitude !== loc2.latitude || 
  loc1.longitude !== loc2.longitude;
console.log(`Coordinates are different?`, areDifferent ? '✅ YES' : '❌ NO');

if (!areDifferent) {
  console.error('❌ ERROR: Both locations have the same coordinates!');
  console.error('This would result in 0 km distance and no ETA display.');
} else {
  console.log('✅ Good: Different coordinates will enable ETA calculation');
}

// Test 4: Test other zone code variations
console.log('\n=== Test 4: Other Zone Codes ===');
const testCodes = ['kk1', 'kk100', 'kk200', 'kk229', 'kk226', 'kk 226', 'kk1 1'];
testCodes.forEach(code => {
  const coords = geocodeAddress(code);
  console.log(`${code.padEnd(8)} -> lat: ${coords.latitude.toFixed(4)}, lng: ${coords.longitude.toFixed(4)}`);
});

// Test 5: Fallback for major cities
console.log('\n=== Test 5: Rwanda City Names (Fallback) ===');
const cityTests = ['Kigali Market', 'Downtown Kigali', 'Butare', 'Gisenyi'];
cityTests.forEach(city => {
  const coords = geocodeAddress(city);
  console.log(`${city.padEnd(20)} -> lat: ${coords.latitude.toFixed(4)}, lng: ${coords.longitude.toFixed(4)}`);
});

// Helper function to calculate distance
function calculateDistanceKm(from: any, to: any): string {
  const R = 6371; // Earth's radius in km
  const dLat = (to.latitude - from.latitude) * Math.PI / 180;
  const dLng = (to.longitude - from.longitude) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(2);
}

console.log('\n✅ Kigali zone code geocoding tests complete!');
console.log('💡 Run this in browser console: import("./src/tests/kigaliZonesTest.ts")');