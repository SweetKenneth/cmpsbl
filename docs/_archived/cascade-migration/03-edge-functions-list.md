# Cascade Edge Functions Migration Guide

## Required Edge Functions

These edge functions need to be copied to your new project:

### Core Cascade Functions
1. **cascade-daily-seed** - Generates daily seed for Cascade's circadian rhythm
2. **cascade-dream-generator** - Generates daily dreams/reflections
3. **cascade-metrics-collector** - Collects and aggregates Cascade metrics
4. **cascade-reflection-email** - Sends reflection emails to users

### Brain Functions (Cascade Dependencies)
5. **pf-brain-cascade-directive** - Processes Cascade directives
6. **pf-brain-cascade-init** - Initializes Cascade brain state
7. **pf-brain-cognitive-cycle** - Manages Cascade's cognitive processing
8. **pf-brain-dream** - Dream generation engine
9. **pf-brain-dream-unified** - Unified dream processing
10. **pf-brain-scheduler** - Schedules Cascade's automated tasks
11. **pf-brain-scheduler-unified** - Unified scheduling system

### Supporting Functions
12. **pf-brain-memory-unified** - Memory management for Cascade
13. **pf-brain-knowledge-unified** - Knowledge base access
14. **pf-brain-reflection** - Reflection processing
15. **pf-brain-reflection-unified** - Unified reflection system

## Migration Steps

### 1. Copy Edge Function Files
Copy the entire function folders from:
```
supabase/functions/cascade-*
supabase/functions/pf-brain-cascade-*
supabase/functions/pf-brain-dream*
supabase/functions/pf-brain-scheduler*
```

### 2. Copy Shared Dependencies
Copy shared utilities:
```
supabase/functions/_shared/
```

### 3. Update config.toml
Add these functions to your new project's `supabase/config.toml`:

```toml
[functions.cascade-daily-seed]
verify_jwt = false

[functions.cascade-dream-generator]
verify_jwt = false

[functions.cascade-metrics-collector]
verify_jwt = false

[functions.cascade-reflection-email]
verify_jwt = false

[functions.pf-brain-cascade-directive]
verify_jwt = false

[functions.pf-brain-cascade-init]
verify_jwt = false

[functions.pf-brain-cognitive-cycle]
verify_jwt = false

[functions.pf-brain-dream]
verify_jwt = false

[functions.pf-brain-dream-unified]
verify_jwt = false

[functions.pf-brain-scheduler]
verify_jwt = false

[functions.pf-brain-scheduler-unified]
verify_jwt = false

[functions.pf-brain-memory-unified]
verify_jwt = false

[functions.pf-brain-knowledge-unified]
verify_jwt = false

[functions.pf-brain-reflection]
verify_jwt = false

[functions.pf-brain-reflection-unified]
verify_jwt = false
```

## Notes
- All functions will auto-deploy when you save them in the new project
- Make sure all required secrets are configured (see secrets guide)
- Test each function after migration to ensure they work correctly
