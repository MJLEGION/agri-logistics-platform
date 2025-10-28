// Direct test runner using ES modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Route Optimization Test Suite Runner');
console.log('═'.repeat(60));
console.log('');

// Import test functions
import('./src/tests/routeOptimizationTests.ts')
  .then((testModule) => {
    if (testModule.runAllTests) {
      console.log('✅ Tests loaded successfully\n');
      return testModule.runAllTests();
    } else {
      throw new Error('runAllTests function not found in test module');
    }
  })
  .catch((error) => {
    console.error('❌ Error running tests:', error.message);
    process.exit(1);
  });