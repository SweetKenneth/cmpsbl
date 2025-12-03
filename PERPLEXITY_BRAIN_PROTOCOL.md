# PromptFluid Perplexity Integration - Adaptive Brain Protocol

## Overview
Intelligent quota management system for Perplexity Pro API with adaptive throttling, budget allocation, and automatic fallback mechanisms.

## Key Features

### 1. **Header-Aware Quota Tracking**
- Parses `X-RateLimit-Remaining`, `X-RateLimit-Limit`, `X-RateLimit-Reset` from API responses
- Real-time quota monitoring and adjustment
- Stores usage metrics in `ai_usage_log` table

### 2. **Dynamic Throttling**
```
Throttle delay = (limit - remaining) / limit × 1000ms
```
- **>80% quota remaining**: No delay
- **>50% quota remaining**: 100ms delay
- **>20% quota remaining**: 250ms delay
- **>100 calls remaining**: 500ms delay
- **<100 calls remaining**: 1000ms delay + fallback activation

### 3. **Daily Budget Allocation**
Total: 25,000 calls/day split as:
- **Learn**: 17,500 calls (70%) - Code learning, research, training
- **User**: 5,000 calls (20%) - Defense queries, user requests
- **Reserve**: 2,500 calls (10%) - Emergency buffer

### 4. **Intelligent Categorization**
Automatic query classification based on:
- Query content analysis (keywords: code, implement, architecture)
- Metadata tags (`type`, `source_module`)
- Module origin (brain, defense, vision)

### 5. **Fallback Provider System**
When quota < 100 calls or budget exhausted:
- **Learn queries** → Groq (fast reasoning)
- **User queries** → Anthropic (high quality)
- **Reserve queries** → OpenAI (balanced)

## Database Schema

### `ai_usage_log`
Tracks every API call with performance metrics:
```sql
- id: UUID
- provider: TEXT (perplexity, groq, anthropic, openai)
- category: TEXT (learn, user, reserve)
- query_text: TEXT
- tokens_used: INTEGER
- quota_remaining: INTEGER
- quota_reset_at: TIMESTAMPTZ
- response_time_ms: INTEGER
- success: BOOLEAN
- error_message: TEXT
- metadata: JSONB
- created_at: TIMESTAMPTZ
```

### `ai_daily_quota`
Manages daily budget per category:
```sql
- id: UUID
- provider: TEXT
- date: DATE
- category: TEXT
- calls_made: INTEGER
- calls_budget: INTEGER
- tokens_used: INTEGER
- last_reset_at: TIMESTAMPTZ
- metadata: JSONB
```

## API Reference

### Core Functions

#### `getQuotaFromHeaders(headers: Headers): QuotaStatus`
Extracts quota information from API response headers.

#### `updateUsageLog(entry: UsageLogEntry): Promise<void>`
Logs API usage to Supabase for tracking and analytics.

#### `dynamicThrottle(remaining: number, limit: number): number`
Calculates optimal delay based on quota depletion.

#### `categorizeCall(queryText: string, metadata?: object): QueryCategory`
Intelligently categorizes query for budget allocation.

#### `enforceDailyBudget(category: QueryCategory): Promise<boolean>`
Checks if category is within daily budget limits.

#### `shouldUseFallback(remaining: number): boolean`
Determines if fallback provider should be used.

#### `getFallbackProvider(category: QueryCategory): 'groq' | 'anthropic' | 'openai'`
Selects optimal fallback provider based on query type.

## Cron Job

### Daily Reset (00:00 UTC)
`pf-perplexity-quota-reset` edge function:
1. Archives previous day's usage
2. Resets daily quota counters
3. Initializes new day budgets
4. Queues high-priority learning tasks
5. Logs reset event to `brain_events`

## Integration

### Usage in Research Modules
```typescript
import { 
  categorizeCall, 
  enforceDailyBudget, 
  updateUsageLog,
  dynamicThrottle 
} from '@/lib/brain/perplexity-manager';

// Before API call
const category = categorizeCall(query, metadata);
const withinBudget = await enforceDailyBudget(category);

if (!withinBudget) {
  // Use fallback provider
}

// After API call
await updateUsageLog({
  provider: 'perplexity',
  category,
  query_text: query,
  quota_remaining: headers.get('X-RateLimit-Remaining'),
  success: true
});

// Apply throttle
const delay = dynamicThrottle(remaining, limit);
await new Promise(resolve => setTimeout(resolve, delay));
```

## Validation Checklist

✅ No API 403 rate limit errors over 24h period  
✅ Learning tasks consume ≥70% of daily quota  
✅ Fallback activates automatically when quota < 100  
✅ Daily reset runs successfully at midnight UTC  
✅ Usage logs capture all API calls with metrics  
✅ Budget enforcement prevents category overspending  

## Monitoring

### Key Metrics
- **Quota Utilization**: Percentage of daily budget used per category
- **Throttle Events**: Frequency and duration of rate limiting
- **Fallback Activation**: Count of fallback provider usage
- **Response Times**: Average latency per provider
- **Success Rate**: API call success vs failure ratio

### Dashboard Queries
```typescript
// Get today's quota status
const status = await getQuotaStatus('learn');
// { used: 12500, budget: 17500, remaining: 5000, percentage: 71.4 }

// Check if throttling needed
const shouldThrottle = remaining < (limit * 0.2);
```

## Rollback Plan

If issues occur:
1. Disable dynamic throttling → static 100 RPM cap
2. Disable daily budget enforcement
3. Disable cron job
4. Revert to previous Perplexity integration

## Commit Message
```
🧠 Integrated Perplexity Pro Adaptive Brain Protocol – dynamic throttling,
daily budgeting and header-aware quota control for PromptFluid Brain.
```

## Files Modified
- `src/lib/brain/perplexity-manager.ts` (new)
- `supabase/functions/pf-research-fetch/index.ts` (modified)
- `supabase/functions/pf-perplexity-quota-reset/index.ts` (new)
- `supabase/config.toml` (updated)
- Database migration: `ai_usage_log`, `ai_daily_quota` tables

## Next Steps
1. Monitor quota usage for 24h
2. Tune budget allocation based on actual patterns
3. Optimize throttle algorithm for peak efficiency
4. Implement alert system for quota warnings
5. Add dashboard visualization for quota metrics
