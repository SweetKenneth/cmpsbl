import { vi } from 'vitest';

// Global test configuration
global.console = {
  ...console,
  // Suppress console logs during tests unless explicitly needed
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: console.warn,
  error: console.error,
};

// Mock timers if needed
export const setupMockTimers = () => {
  vi.useFakeTimers();
};

export const teardownMockTimers = () => {
  vi.useRealTimers();
};
