// Simple test runner for route optimization tests
const path = require('path');
const fs = require('fs');

// Register ts-node for .ts file support
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
});

// Import and run tests
const tests = require('./src/tests/routeOptimizationTests.ts');

console.log('🚀 Starting Route Optimization Test Suite...\n');

// Run the main test function
if (tests.runAllTests) {
  tests.runAllTests().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
} else {
  console.error('❌ Could not find runAllTests export');
  process.exit(1);
}