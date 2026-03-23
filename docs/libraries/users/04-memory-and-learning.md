# Memory & Learning

---

## Memory Tiers

| Tier | Speed | Capacity | What's Stored |
|------|-------|----------|--------------|
| **Hot** | < 1ms | 2,000 entries | Active session context, routing cache |
| **Warm** | < 50ms | 5,000 entries | Recent tasks, active learning topics |
| **Cold** | < 500ms | 10,000 entries | Historical data, completed work |
| **Glacier** | < 2s | 50,000 entries | Long-term archive |

Tier availability depends on your plan: Free = session only, Pro = warm, Enterprise = full 4-tier.

## Automatic Tier Management

- Hot → Warm: After 15 min inactivity or session end
- Warm → Cold: After 14 days with low usage
- Cold → Glacier: Extended retention threshold
- Emergency cascade: Bulk demotion if capacity exceeded

## Using the MEMORY Organ

```bash
# Store
POST /api/v1/memory/store
{"action": "store", "payload": {"key": "project-context", "content": "...", "tier": "warm"}}

# Retrieve
POST /api/v1/memory/retrieve
{"action": "retrieve", "payload": {"key": "project-context"}}

# Search
POST /api/v1/memory/search
{"action": "search", "payload": {"query": "project requirements", "limit": 10}}
```

## Constant Learning Mode (CLM Engine)

The CLM Engine runs continuous learning cycles in the background:

- **Free**: Not available
- **Pro**: 100 calls/day
- **Enterprise**: 14,400 calls/day

Topics are sourced from system telemetry (70%) and scheduled curriculum (30%). Knowledge is distilled and compounded into permanent memory.

## DREAM Engine Synthesis

The DREAM Engine generates autonomous learning insights:

- Processes behavioral signals across the substrate
- Generates novel patterns and heuristic improvements
- Feeds into the EVOLUTION Layer pipeline for validation
- Powers agent self-improvement in the Agency Framework

## Memory Stream API

Access the Memory Stream for discovery data:

```bash
# View recent discoveries
POST /api/v1/memory/stream
{"action": "stream", "payload": {"limit": 20}}

# Check crystallization status
POST /api/v1/memory/crystallize
{"action": "status"}
```

---

© 2025–2026 CMPSBL®. All rights reserved.
