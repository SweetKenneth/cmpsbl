# Free-Tier AI Migration Status

## Goal
Replace ALL Lovable AI calls with free-tier routing across 6 providers:
1. Google AI Studio (Gemini 2.5 Flash-Lite)
2. Cerebras (Llama 3.3 70B)
3. Groq (Llama 3.3 70B)
4. Together AI (Llama 3.1 70B)
5. DeepSeek (DeepSeek Chat)
6. Hyperbolic (Llama 3.1 70B)

## Current Status

### ✅ Completed Migrations
- **pf-brain-continuous-learn** - Already using free-tier routing
- **pf-cascade-chat** - Already using free-tier routing
- **pf-brain-dream-unified** - Migrated to use free-tier-router.ts
- **pf-brain-reflect** - Migrated to use free-tier-router.ts

### 🔧 Infrastructure Created
- **supabase/functions/_shared/free-tier-router.ts** - Shared module for all AI calls

### Dream & Reflection Triggers
- **pf-brain-continuous-learn** now triggers:
  - Dream cycles every 6 hours (2-8am only)
  - Reflections every 12 hours
- Both use free-tier routing (NO Lovable AI)

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
