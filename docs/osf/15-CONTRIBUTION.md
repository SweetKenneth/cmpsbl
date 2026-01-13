# PromptFluid Contribution Guidelines

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-CONTRIB-001 |
| Version | 1.0.0 |
| Last Updated | 2026-01-13 |
| Status | STABLE |

---

## Welcome

Thank you for your interest in contributing to PromptFluid. This document outlines the contribution process, coding standards, and community guidelines.

PromptFluid is released as a substrate—a foundation for future development. Like Linux and Bitcoin before it, we believe in the power of open collaboration to build something greater than any individual could achieve.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Deno 1.40+ (for Edge Functions)
- Git
- Supabase CLI
- A Supabase project (for testing)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/promptfluid/ecosystem.git
cd ecosystem

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev

# In another terminal, serve edge functions locally
supabase functions serve
```

### Project Structure

```
promptfluid/
├── docs/
│   └── osf/                    # Academic documentation
├── src/
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   ├── pages/                  # Page components
│   └── integrations/           # External integrations
├── supabase/
│   ├── functions/              # Edge Functions
│   │   ├── _shared/            # Shared modules
│   │   └── pf-*/               # Individual functions
│   └── migrations/             # Database migrations
├── wordpress-plugins/          # WordPress plugins
└── tests/                      # Test suites
```

---

## Contribution Types

### Code Contributions

1. **Bug Fixes** - Fix issues in existing functionality
2. **Features** - Add new capabilities
3. **Optimizations** - Improve performance
4. **Refactoring** - Improve code quality
5. **Tests** - Add or improve test coverage

### Documentation Contributions

1. **API Documentation** - Endpoint documentation
2. **Guides** - How-to guides and tutorials
3. **Examples** - Code examples and snippets
4. **Translations** - Internationalization

### Other Contributions

1. **Issue Reports** - Bug reports and feature requests
2. **Code Reviews** - Review pull requests
3. **Community Support** - Help other users
4. **Research** - Academic research and citations

---

## Contribution Process

### 1. Find or Create an Issue

Before starting work, ensure there's an issue describing the change:

```markdown
## Issue Template

**Type:** Bug / Feature / Enhancement / Documentation

**Description:**
Clear description of the issue or proposed change.

**Expected Behavior:**
What should happen.

**Current Behavior:**
What currently happens (for bugs).

**Proposed Solution:**
Your suggested approach.

**Additional Context:**
Any relevant information.
```

### 2. Fork and Branch

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ecosystem.git

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 3. Make Changes

Follow the coding standards outlined below. Commit frequently with clear messages:

```bash
# Commit format
git commit -m "type(scope): description

- Detail 1
- Detail 2

Closes #issue-number"

# Types: feat, fix, docs, style, refactor, test, chore
# Scope: brain, defense, nexus, vision, cascade, etc.
```

### 4. Test Your Changes

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Test edge functions locally
supabase functions serve

# Test specific function
curl http://localhost:54321/functions/v1/your-function
```

### 5. Submit Pull Request

```markdown
## Pull Request Template

**Related Issue:** #issue-number

**Description:**
What this PR does.

**Type of Change:**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Checklist:**
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] No console.log or debug statements

**Screenshots:** (if applicable)
```

---

## Coding Standards

### TypeScript/JavaScript

```typescript
// Use TypeScript for all new code
// Enable strict mode

// Interfaces over types for objects
interface UserConfig {
  name: string;
  email: string;
  preferences: Preferences;
}

// Explicit return types
function calculateScore(data: InputData): number {
  return data.value * 2;
}

// Async/await over promises
async function fetchData(): Promise<Data> {
  const response = await api.get('/data');
  return response.data;
}

// Destructuring
const { name, email } = user;

// Const by default
const config = getConfig();
let counter = 0; // Only when reassignment needed
```

### React Components

```tsx
// Functional components only
export function ComponentName({ prop1, prop2 }: Props) {
  // Hooks at the top
  const [state, setState] = useState(initialState);
  const { data } = useQuery(queryOptions);

  // Event handlers
  const handleClick = useCallback(() => {
    // ...
  }, [dependencies]);

  // Early returns for loading/error states
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  // Main render
  return (
    <div className="container">
      <ChildComponent />
    </div>
  );
}
```

### Edge Functions

```typescript
// Standard edge function structure
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse request
    const body = await req.json();

    // Process
    const result = await processRequest(body);

    // Return response
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### SQL Migrations

```sql
-- Always include descriptive comments
-- Migration: Add custom_field to brain_memories

-- Step 1: Add column
ALTER TABLE public.brain_memories
ADD COLUMN custom_field VARCHAR;

-- Step 2: Add index if needed
CREATE INDEX idx_brain_memories_custom_field
ON public.brain_memories(custom_field);

-- Step 3: Add RLS policy if needed
CREATE POLICY "Custom field access"
ON public.brain_memories
FOR SELECT
USING (true);

-- Step 4: Comment for documentation
COMMENT ON COLUMN public.brain_memories.custom_field IS 'Description of field purpose';
```

---

## Testing Guidelines

### Unit Tests

```typescript
// tests/unit/brain.test.ts
import { describe, it, expect } from 'vitest';
import { calculateConfidence } from '@/lib/brain';

describe('calculateConfidence', () => {
  it('should return base confidence for new memory', () => {
    const result = calculateConfidence({
      source_confidence: 0.8,
      cross_verified: false,
      created_at: new Date(),
      usage_count: 0
    });
    
    expect(result).toBeCloseTo(0.8, 2);
  });

  it('should increase confidence for verified memories', () => {
    const result = calculateConfidence({
      source_confidence: 0.8,
      cross_verified: true,
      created_at: new Date(),
      usage_count: 0
    });
    
    expect(result).toBeCloseTo(1.0, 2);
  });
});
```

### Integration Tests

```typescript
// tests/integration/api.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Brain API', () => {
  beforeAll(async () => {
    // Setup test data
  });

  it('should store and retrieve memory', async () => {
    const { data: created } = await supabase.functions.invoke('pf-brain-learn', {
      body: { content: 'Test memory', source: 'test' }
    });
    
    expect(created.success).toBe(true);
    expect(created.memory_id).toBeDefined();
    
    const { data: retrieved } = await supabase
      .from('brain_memories')
      .select('*')
      .eq('id', created.memory_id)
      .single();
      
    expect(retrieved.content).toBe('Test memory');
  });
});
```

---

## Documentation Standards

### Code Comments

```typescript
/**
 * Calculates the confidence score for a memory.
 * 
 * The confidence score is composed of:
 * - Base confidence from the source
 * - Verification bonus (+0.2 if cross-verified)
 * - Time decay (up to -0.2 over 90 days)
 * - Usage reinforcement (+0.02 per use, max +0.2)
 * 
 * @param memory - The memory to score
 * @returns Confidence score between 0 and 1
 * 
 * @example
 * const confidence = calculateConfidence(memory);
 * console.log(`Confidence: ${confidence}`); // 0.85
 */
function calculateConfidence(memory: Memory): number {
  // Implementation
}
```

### Markdown Documentation

```markdown
# Feature Name

## Overview
Brief description of the feature.

## Usage

### Basic Example
```typescript
const result = await feature.use(options);
```

### Advanced Example
```typescript
// More complex usage
```

## API Reference

### `featureName(options)`

| Parameter | Type | Description |
|-----------|------|-------------|
| option1 | string | Description |
| option2 | number | Description |

### Returns

Description of return value.

## Related

- [Related Feature](./related.md)
- [API Reference](../api.md)
```

---

## Review Process

### What We Look For

1. **Functionality** - Does it work as intended?
2. **Code Quality** - Is it clean and maintainable?
3. **Tests** - Are there adequate tests?
4. **Documentation** - Is it documented?
5. **Security** - Are there security concerns?
6. **Performance** - Are there performance implications?

### Review Timeline

- **Initial Review:** Within 48 hours
- **Feedback Response:** Within 1 week
- **Merge Decision:** Within 2 weeks

---

## Community Guidelines

### Code of Conduct

1. **Be Respectful** - Treat everyone with respect
2. **Be Constructive** - Provide helpful feedback
3. **Be Collaborative** - Work together
4. **Be Patient** - Everyone is learning
5. **Be Inclusive** - Welcome all contributors

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - General discussion
- **Pull Requests** - Code contributions

---

## Recognition

Contributors are recognized in:

1. **CONTRIBUTORS.md** - All contributors listed
2. **Release Notes** - Major contributions highlighted
3. **Documentation** - Authors credited

---

## License

By contributing, you agree that your contributions will be licensed under:

- **Apache 2.0** - Core platform code
- **GPL v2** - WordPress plugins

---

**See Also:**
- [License](./16-LICENSE.md)
- [Architecture](./01-ARCHITECTURE.md)
- [Extension Guide](./09-EXTENSION-GUIDE.md)
