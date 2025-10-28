/**
 * Jest Setup File
 * 
 * This file runs before each test suite to set up the test environment.
 * It includes mocks for AsyncStorage and other platform-specific modules.
 */

// Mock AsyncStorage (used by services)
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(async (key: string, value: string) => {
    return Promise.resolve();
  }),
  getItem: jest.fn(async (key: string) => {
    return Promise.resolve(null);
  }),
  removeItem: jest.fn(async (key: string) => {
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(async () => {
    return Promise.resolve([]);
  }),
  clear: jest.fn(async () => {
    return Promise.resolve();
  }),
  multiSet: jest.fn(async (keyValuePairs: Array<[string, string]>) => {
    return Promise.resolve();
  }),
  multiGet: jest.fn(async (keys: string[]) => {
    return Promise.resolve([]);
  }),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});