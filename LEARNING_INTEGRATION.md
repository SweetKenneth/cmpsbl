# 🧠 PromptFluid Learning Integration

**Status:** ✅ Active  
**Version:** 1.0.0  
**Last Updated:** 2025-10-31

---

## Overview

The Learning Integration system enables PromptFluid Brain to learn from all system operations, build patterns, validations, and user interactions. This self-improving knowledge layer continuously adapts and optimizes based on real-world usage.

---

## Architecture

### Database Tables

#### `learning_logs`
Captures all system learning events in real-time.

```sql
- id: UUID (primary key)
- timestamp: TIMESTAMPTZ
- project_id: TEXT (optional)
- event_type: TEXT (e.g., 'build_start', 'build_success', 'validation_pass')
- module: TEXT (e.g., 'studio', 'merger', 'brain', 'defense')
- payload: JSONB (event-specific data)
- success: BOOLEAN
- error_message: TEXT (optional)
- metadata: JSONB (additional context)
```

#### `learning_patterns`
Stores analyzed heuristics and recommendations.

```sql
- id: UUID (primary key)
- pattern_type: TEXT ('error', 'success', 'frequency')
- pattern_name: TEXT (unique identifier)
- description: TEXT
- confidence: NUMERIC (0.0 to 1.0)
- frequency: INTEGER (occurrence count)
- success_rate: NUMERIC (percentage)
- recommendations: JSONB (actionable suggestions)
- metadata: JSONB
- last_observed: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

---

## Edge Functions

### `pf-learning-log`
**Endpoint:** `https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-learning-log`  
**Authentication:** Public (no JWT required)

Accepts learning events from all modules and stores them in `learning_logs`.

**Request:**
```json
{
  "event_type": "build_success",
  "module": "studio",
  "project_id": "mvp-001",
  "payload": {
    "duration_ms": 1500,
    "files_changed": ["index.tsx", "App.tsx"]
  },
  "success": true,
  "metadata": {
    "user_agent": "Mozilla/5.0..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "log_id": "uuid",
  "message": "Learning event captured successfully"
}
```

### `pf-learning-analyze`
**Endpoint:** `https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-learning-analyze`  
**Authentication:** Public (no JWT required)

Analyzes learning logs and generates patterns with confidence scores.

**Request:**
```json
{
  "period_hours": 24
}
```

**Response:**
```json
{
  "success": true,
  "logs_analyzed": 150,
  "patterns_generated": 12,
  "patterns": [
    {
      "type": "success",
      "name": "studio_build_success_reliable",
      "confidence": 0.85,
      "success_rate": 92.5
    }
  ]
}
```

---

## Frontend Components

### `LearningCollector` (Service)
**Location:** `src/lib/learning/collector.ts`

Captures events from the frontend and batches them for efficient logging.

**Usage:**
```typescript
import { LearningCollector } from '@/lib/learning/collector';

// Log a build event
await LearningCollector.logBuild({
  project_id: 'mvp-001',
  event_type: 'build_success',
  duration_ms: 1500,
  files_changed: ['index.tsx']
});

// Log a validation event
await LearningCollector.logValidation({
  project_id: 'mvp-001',
  validation_type: 'typescript',
  passed: true
});

// Log a merger event
await LearningCollector.logMerger({
  event_type: 'merge_success',
  intent: 'Add user authentication',
  sections: ['auth', 'database'],
  duration_ms: 2000
});
```

**Auto-flushing:**
- Queue batches every 5 seconds
- Auto-flushes on page unload
- Batch size: 10 events

### `LearningAnalyzer` (Service)
**Location:** `src/lib/learning/analyzer.ts`

Analyzes patterns and provides recommendations.

**Usage:**
```typescript
import { LearningAnalyzer } from '@/lib/learning/analyzer';

// Trigger analysis
const result = await LearningAnalyzer.analyzePatterns(24);

// Get high-confidence patterns
const patterns = await LearningAnalyzer.getHighConfidencePatterns(0.75);

// Get error patterns for debugging
const errors = await LearningAnalyzer.getErrorPatterns('studio');

// Get success patterns (best practices)
const successes = await LearningAnalyzer.getSuccessPatterns(80);

// Generate adaptive suggestions
const suggestions = await LearningAnalyzer.generateBrainSuggestions();
```

### `useLearningPatterns` (Hook)
**Location:** `src/hooks/useLearningPatterns.ts`

React hook for fetching and displaying learning patterns.

**Usage:**
```typescript
import { useLearningPatterns } from '@/hooks/useLearningPatterns';

function MyComponent() {
  const { patterns, loading, error, refresh } = useLearningPatterns('success');
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return (
    <div>
      {patterns.map(pattern => (
        <PatternCard key={pattern.pattern_name} pattern={pattern} />
      ))}
      <Button onClick={refresh}>Refresh</Button>
    </div>
  );
}
```

---

## UI Dashboard

### Learning Intelligence Page
**Route:** `/learning-intelligence`  
**Component:** `src/pages/LearningIntelligence.tsx`

Displays:
- Total patterns discovered
- High-confidence patterns (≥75%)
- Error patterns with recommended fixes
- Success patterns (best practices)
- AI-generated recommendations
- Pattern analysis by type (all, errors, success)

---

## Integration Points

### Studio Module
```typescript
// Before build
await LearningCollector.logBuild({
  project_id,
  event_type: 'build_start'
});

// After build
await LearningCollector.logBuild({
  project_id,
  event_type: 'build_success',
  duration_ms,
  files_changed
});

// On build failure
await LearningCollector.logBuild({
  project_id,
  event_type: 'build_failure',
  error: errorMessage
});
```

### Merger Module
```typescript
// Intent parsing
await LearningCollector.logMerger({
  event_type: 'intent_parse',
  intent: userIntent
});

// Merge operation
await LearningCollector.logMerger({
  event_type: 'merge_success',
  intent,
  sections,
  duration_ms
});
```

### Brain Module
```typescript
// Training cycle
await LearningCollector.logBrain({
  event_type: 'train',
  result: 'success',
  details: { patterns_learned: 10 }
});

// Optimization
await LearningCollector.logBrain({
  event_type: 'optimize',
  result: 'success',
  details: { rules_updated: 5 }
});
```

### Defense Module
```typescript
// Bot detection
await LearningCollector.logDefense({
  event_type: 'detection',
  risk_score: 75,
  action: 'challenge',
  details: { ip, fingerprint }
});
```

---

## Pattern Types

### 1. Error Patterns
Identify common failures and suggest fixes.

**Example:**
```json
{
  "pattern_type": "error",
  "pattern_name": "studio_build_timeout",
  "description": "Builds timing out during dependency resolution",
  "confidence": 0.82,
  "frequency": 15,
  "success_rate": 18.5,
  "recommendations": [
    {
      "error": "npm install timeout",
      "suggestion": "Increase timeout threshold or use cached dependencies"
    }
  ]
}
```

### 2. Success Patterns
Highlight reliable behaviors.

**Example:**
```json
{
  "pattern_type": "success",
  "pattern_name": "merger_auth_flows_reliable",
  "description": "Authentication flows consistently succeed",
  "confidence": 0.91,
  "frequency": 50,
  "success_rate": 96.0,
  "recommendations": [
    {
      "type": "best_practice",
      "message": "Continue using this pattern for auth implementations"
    }
  ]
}
```

### 3. Frequency Patterns
Track high-usage operations for optimization.

**Example:**
```json
{
  "pattern_type": "frequency",
  "pattern_name": "nexus_text_high_usage",
  "description": "Text generation heavily used",
  "confidence": 0.88,
  "frequency": 200,
  "success_rate": 94.5,
  "recommendations": [
    {
      "type": "optimization",
      "suggestion": "Consider implementing caching for common prompts"
    }
  ]
}
```

---

## Adaptive Learning Workflow

1. **Event Capture**
   - All modules log events via `LearningCollector`
   - Events batched and sent to `pf-learning-log`
   - Stored in `learning_logs` table

2. **Pattern Analysis**
   - Runs automatically or on-demand via `pf-learning-analyze`
   - Analyzes logs from specified time period
   - Generates patterns by module, event type, success rate

3. **Pattern Storage**
   - High-value patterns stored in `learning_patterns`
   - Updated with new observations
   - Confidence scores adjusted based on sample size

4. **Brain Integration**
   - Brain queries patterns before generating prompts
   - High-confidence patterns (≥0.75) automatically embedded
   - Recommendations influence routing and optimization

5. **User Feedback Loop**
   - Patterns displayed in Learning Intelligence dashboard
   - Admins can review and validate patterns
   - Manual feedback influences future pattern weights

---

## Local Mode Support

When Lovable Cloud is offline, Brain uses cached patterns to:
- Predict common build failures
- Suggest pre-tested solutions
- Simulate validation checks
- Recommend reliable patterns

**Fallback Logic:**
```typescript
// If Lovable unavailable
const patterns = await LearningAnalyzer.getHighConfidencePatterns(0.8);

// Use patterns for self-healing
const suggestions = patterns
  .filter(p => p.pattern_type === 'success')
  .map(p => p.recommendations);
```

---

## Performance Optimization

- **Batched Logging:** Events queued and flushed in batches of 10
- **Indexed Queries:** Database indexes on `timestamp`, `event_type`, `module`, `success`
- **Pattern Caching:** High-confidence patterns cached in Brain memory
- **Async Processing:** Analysis runs asynchronously without blocking UI

---

## Security & Privacy

- **RLS Policies:** System can insert logs; admins can view
- **No PII:** Logs contain only technical metadata
- **Secure Endpoints:** All edge functions use HTTPS
- **Rate Limiting:** Analysis throttled to prevent abuse

---

## Monitoring & Debugging

### View Logs
```sql
SELECT * FROM learning_logs
WHERE module = 'studio'
  AND success = false
ORDER BY timestamp DESC
LIMIT 10;
```

### View Patterns
```sql
SELECT * FROM learning_patterns
WHERE confidence >= 0.75
ORDER BY success_rate DESC;
```

### Trigger Analysis
```typescript
const result = await supabase.functions.invoke('pf-learning-analyze', {
  body: { period_hours: 24 }
});
```

---

## Rollback Instructions

If issues arise:

1. **Remove Edge Functions:**
   ```bash
   rm supabase/functions/pf-learning-log
   rm supabase/functions/pf-learning-analyze
   ```

2. **Drop Tables:**
   ```sql
   DROP TABLE IF EXISTS learning_patterns;
   DROP TABLE IF EXISTS learning_logs;
   ```

3. **Remove Frontend Code:**
   ```bash
   rm src/lib/learning/collector.ts
   rm src/lib/learning/analyzer.ts
   rm src/hooks/useLearningPatterns.ts
   rm src/pages/LearningIntelligence.tsx
   ```

4. **Update Config:**
   Remove learning function entries from `supabase/config.toml`

---

## Future Enhancements

- [ ] Real-time pattern alerts via websockets
- [ ] Multi-project pattern aggregation
- [ ] AI-powered anomaly detection
- [ ] Automated A/B testing of patterns
- [ ] Export patterns as JSON for sharing
- [ ] Pattern versioning and history tracking

---

## Commit Message

```
🧠 Added PromptFluid Learning Integration

- Created learning_logs and learning_patterns tables
- Built pf-learning-log and pf-learning-analyze edge functions
- Implemented LearningCollector service for event capture
- Implemented LearningAnalyzer service for pattern analysis
- Created Learning Intelligence dashboard at /learning-intelligence
- Integrated with Studio, Merger, Brain, and Defense modules
- Enabled adaptive self-improvement based on system usage

System now learns from all operations and continuously optimizes.
```
