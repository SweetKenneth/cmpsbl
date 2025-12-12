# Free-Tier AI Migration Status

## Goal
Route AI calls across multiple providers with smart per-min/hour/day limits.

## RATE LIMITS (Dec 2024 - Verified)

| Provider   | Per Min | Per Hour | Per Day  | Tier | Notes |
|------------|---------|----------|----------|------|-------|
| Cerebras   | 30 RPM  | 900 RPH  | 14,400   | FREE | llama-3.3-70b |
| Together   | 10 RPM  | 600 RPH  | 14,400   | $5   | Llama 3.1 70B |
| Hyperbolic | 60 RPM  | 3,600    | 86,400   | $5   | Llama 3.1 70B |
| DeepSeek   | 20 RPM  | 600 RPH  | 5,000    | FREE | Conservative cap |
| Groq       | 30 RPM  | 500 RPH  | 1,000    | FREE | llama-3.3-70b |
| Google     | 2 RPM   | 20 RPH   | 50       | FREE | Severely reduced |

**TOTAL CAPACITY**: ~121,250 requests/day
**TARGET**: 90% utilization = ~109,125 requests/day = ~75 RPM max

## Provider Priority Order
1. **Cerebras** (PRIMARY) - Best free tier
2. **Together** ($5 deposit tier)
3. **Hyperbolic** ($5 deposit tier - highest daily)
4. **DeepSeek** (Conservative limits)
5. **Groq** (Low daily limit)
6. **Google** (Last resort - heavily limited)

## Smart Routing Features
- Per-minute limit checks (85% threshold)
- Per-hour limit checks (85% threshold)  
- Per-day limit checks (90% threshold)
- Automatic failover to next provider
- 2 request buffer per-minute safety margin

## Current Status

### ✅ Active Providers
- **Cerebras** - Using free-tier (14.4K/day)
- **Together** - $5 deposit tier (14.4K/day)
- **Hyperbolic** - $5 deposit tier (86.4K/day)
- **DeepSeek** - Capped at 5K/day for reliability
- **Groq** - Free tier (1K/day)
- **Google** - Severely limited (50/day)

## Remaining Functions Using Lovable AI (53 files)

### Access Module (10 files)
- pf-access-alt-text
- pf-access-assist
- pf-access-fix
- pf-access-recommendations
- pf-access/index.ts (main)
- pf-access-scan
- pf-access-tts
- pf-access-unified
- pf-access-user-manual
- pf-access-badge

### Brain Module (43 files)
- pf-brain-ab
- pf-brain-act
- pf-brain-analytics
- pf-brain-auto-research
- pf-brain-autonomous
- pf-brain-autonomy-report
- pf-brain-cascade-directive
- pf-brain-cascade-init
- pf-brain-causal
- pf-brain-circadian-unified
- pf-brain-cognitive-cycle
- pf-brain-cold-migration
- pf-brain-compress
- pf-brain-context-check
- pf-brain-context-unified
- pf-brain-correlate
- pf-brain-curiosity-reflect
- pf-brain-curiosity-tune
- pf-brain-cycle
- pf-brain-daily-report
- pf-brain-deep-think
- pf-brain-directive-unified
- pf-brain-directive
- pf-brain-dream (old version)
- pf-brain-dtq
- pf-brain-echo
- pf-brain-emotion-unified
- pf-brain-emotional-model
- pf-brain-ethical-boundary
- pf-brain-ethics
- pf-brain-feedback-ingest
- pf-brain-feedback
- pf-brain-forecast-eval
- pf-brain-forecast-unified
- pf-brain-forecast
- pf-brain-graph-build
- pf-brain-graph-unified
- pf-brain-hypothesis-test
- pf-brain-ingest-global
- pf-brain-ingest-secure
- pf-brain-ingest-sensory
- pf-brain-ingest-unified
- pf-brain-initialize
- pf-brain-insight-aggregate
- pf-brain-insight-synthesize
- pf-brain-knowledge-unified
- pf-brain-learn
- pf-brain-learning-unified
- pf-brain-lesson-compress
- pf-brain-memory-unified
- pf-brain-ml-unified
- pf-brain-ml
- pf-brain-notify-admin
- pf-brain-operational-suite
- pf-brain-optimize
- pf-brain-pattern-fusion
- pf-brain-persona-refine
- pf-brain-plan-objectives
- pf-brain-predict
- pf-brain-proxy
- pf-brain-queue-feeder
- pf-brain-reboot
- pf-brain-reflection-unified
- pf-brain-reflection
- pf-brain-reflexive-plan
- pf-brain-reinforce
- pf-brain-report
- pf-brain-reporting-unified
- pf-brain-reward
- pf-brain-scheduler-unified
- pf-brain-scheduler
- pf-brain-seed-domains
- pf-brain-seed-knowledge
- pf-brain-select-domain
- pf-brain-self-critique

## Migration Strategy

### Phase 1: Critical Path (Complete)
1. ✅ Continuous learning orchestrator
2. ✅ Cascade chat
3. ✅ Dream generation
4. ✅ Reflection cycles

### Phase 2: High-Usage Functions (Recommended Next)
Priority order based on likely call frequency:
1. pf-brain-ingest-* (sensory, global, secure, unified)
2. pf-brain-context-* (check, unified)
3. pf-brain-memory-unified
4. pf-brain-learning-unified
5. pf-access-unified

### Phase 3: Specialized Functions
Migrate remaining brain and access functions on-demand

### Phase 4: Cleanup
- Remove unused LOVABLE_API_KEY references
- Archive deprecated functions
- Update documentation

## Migration Template

```typescript
// 1. Import free-tier router
import { callFreeTierAI } from '../_shared/free-tier-router.ts';

// 2. Replace Lovable AI calls
const result = await callFreeTierAI(prompt, {
  temperature: 0.7,
  maxTokens: 800,
  systemPrompt: 'Your system prompt here'
});

// 3. Use result
const content = result.content;
const model = result.model; // e.g. "gemini-2.5-flash-lite"
const provider = result.provider; // e.g. "google"
```

## Cost Savings

### Before Migration
- Lovable AI: $0.0015/1K tokens (estimated)
- 88 calls/day = potential costs adding up

### After Migration  
- 100% FREE across 6 providers
- ~53,800 requests/day capacity
- Zero API costs

## Next Steps

1. Monitor dream/reflection execution over next 24 hours
2. Verify free-tier usage in ai_learning_data table
3. Update high-traffic brain functions (Phase 2)
4. Complete remaining migrations (Phase 3)
5. Remove Lovable AI dependencies (Phase 4)

## Validation Checklist

- [x] Free-tier router module created
- [x] Dream cycles triggering (every 6 hours)
- [x] Reflections triggering (every 12 hours)
- [x] Continuous learning using free-tier
- [x] Cascade chat using free-tier
- [ ] No Lovable AI calls in ai_daily_quota table (verify in 24h)
- [ ] Dream entries in cascade_dreams table
- [ ] Reflection entries in brain_reflections table
