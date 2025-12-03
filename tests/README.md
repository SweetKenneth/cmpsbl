# PromptFluid Test Suite

Automated testing suite for PromptFluid creative generation and core functionality.

## Setup

```bash
npm install --save-dev @jest/globals jest @types/jest ts-jest
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/api/creative-generation.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Test Structure

```
tests/
├── api/                    # API endpoint tests
│   └── creative-generation.test.ts
├── integration/            # Integration tests
├── unit/                   # Unit tests for utilities
└── setup.ts               # Test configuration
```

## Environment Variables

Tests require the following environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key

## Test Coverage Goals

- **API Endpoints:** 90%+
- **Critical Paths:** 100%
- **Edge Functions:** Integration tests only
- **UI Components:** Snapshot testing (future)

## Writing New Tests

### API Tests
```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

describe('My Feature', () => {
  it('should do something', async () => {
    // Test implementation
  });
});
```

### Best Practices
1. Use descriptive test names
2. Test both success and error cases
3. Mock external dependencies when needed
4. Clean up test data after tests
5. Use `beforeAll` for setup, `afterAll` for cleanup

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Pre-deployment checks

## Monitoring Tests

- Tests report to test monitoring dashboard
- Failed tests trigger alerts
- Coverage reports generated on each run
