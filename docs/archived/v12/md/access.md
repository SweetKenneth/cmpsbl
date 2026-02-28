# ACCESS — Entitlements & API Management Node

## Purpose
ACCESS manages API keys, rate limiting, entitlements, usage metering, subscription tiers, and the product catalog. It is the commercial enforcement layer of the OCG.

## Namespace
`access.*`

## Command Examples
```
access.keys.list            # List API keys for current developer
access.keys.create <name>   # Create new API key
access.quota                # Current quota usage
access.entitlements         # Active entitlements
access.usage <period>       # Usage report for period
access.tier                 # Current subscription tier
```

## Response Shape
```typescript
interface EntitlementResult {
  success: boolean;
  tier: string;
  activeSlots: number;
  maxSlots: number;
  activePacks: string[];
  quotaRemaining: {
    memory: number;
    requests: number;
    learning: number;
  };
}
```

## Failure Modes
- **Quota exceeded**: Request denied with structured error including reset time
- **Key expired**: API key past expiration → rejected with renewal guidance
- **Rate limit hit**: Per-minute or per-day limit reached → 429 with retry-after header

## Governance Implications
- API key creation is an audited operation
- Tier changes require subscription validation
- Usage data feeds into ECONOMY node for billing calculations
