import { config } from 'dotenv';

// Load environment variables for testing
config();

// Global test configuration
global.console = {
  ...console,
  // Suppress console logs during tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};

// Test timeouts
jest.setTimeout(30000); // 30 seconds for API calls

// Mock timers if needed
export const setupMockTimers = () => {
  jest.useFakeTimers();
};

export const teardownMockTimers = () => {
  jest.useRealTimers();
};
