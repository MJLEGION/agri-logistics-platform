/**
 * Jest Configuration for Ratings System Testing
 * 
 * This configuration sets up Jest for testing TypeScript services
 * and React components in the agri-logistics-platform project.
 */

module.exports = {
  // Use TypeScript preset
  preset: 'ts-jest',

  // Test environment - use node for service tests
  testEnvironment: 'node',

  // Where to find test files
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // TypeScript compilation options
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/services/**/*.{ts,tsx}',
    'src/screens/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.native.{ts,tsx}',
    '!src/**/*.web.{ts,tsx}',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Transform files
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Module name mapper for paths
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/screens/(.*)$': '<rootDir>/src/screens/$1',
  },

  // Timeout for slow tests
  testTimeout: 10000,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
    '/.next/',
  ],

  // Coverage ignore patterns
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
    '/src/tests/',
  ],

  // Verbose output
  verbose: true,

  // Show which tests are being run
  testNamePattern: '.*',
};