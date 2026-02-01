# Substrate Test Suite

Automated testing suite for the Substrate platform — v7.0.0

## Test Framework

This project uses **Vitest** (not Jest). Tests are configured via `vitest.config.ts`.

## Running Tests

```bash
# Run all tests
bun run test

# Run specific test file
bun run test src/test/seba.test.ts

# Run with coverage
bun run test --coverage

# Run in watch mode
bun run test --watch
```

## Test Structure

```
src/
├── test/                   # Test setup and utilities
│   └── setup.ts
├── lib/
│   └── evolve/scan/__tests__/  # Unit tests co-located with modules
│       └── normalizer.test.ts
tests/
├── api/                    # Integration tests (require live backend)
│   └── creative-generation.test.ts  # SKIPPED by default
└── setup.ts                # Legacy setup (being migrated)
```

## Test Categories

| Category | Location | Status |
|----------|----------|--------|
| Unit Tests | `src/**/*.test.ts` | ✅ Active (33 tests) |
| Integration Tests | `tests/api/` | ⏸️ Skipped (require live backend) |

## Writing New Tests

### Unit Tests (Vitest)
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('MyModule', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Integration Tests
Integration tests in `tests/api/` are skipped by default because they require:
1. Deployed edge functions
2. Valid Supabase credentials  
3. Configured API keys

To run manually, remove `.skip` from the describe block.

## Best Practices

1. Co-locate unit tests with their modules (`__tests__/` folder)
2. Use `vi.fn()` for mocks (not `jest.fn()`)
3. Use `import.meta.env` for environment variables (not `process.env`)
4. Test both success and error cases
5. Keep integration tests separate and clearly marked
