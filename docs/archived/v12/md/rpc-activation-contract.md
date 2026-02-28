# RPC Activation Contract

The Artifact Pack activation flow uses a backend RPC to atomically activate or deactivate capability packs.

## Activation RPC

```sql
-- Database function signature
activate_capability_pack(
  p_user_id UUID,
  p_pack_id TEXT,
  p_action TEXT  -- 'activate' or 'deactivate'
) RETURNS JSONB
```

## Request Flow

```
1. Client calls activate_capability_pack via Supabase RPC
2. Function validates:
   a. User exists and has valid subscription
   b. Pack exists in the registry
   c. Action is valid ('activate' or 'deactivate')
   d. For activation: user has available slots
   e. For deactivation: cooldown period has elapsed
3. Atomically updates activation record
4. Logs audit entry in activation_audit_log
5. Returns result with updated slot counts
```

## Response Shape

```json
{
  "success": true,
  "pack_id": "cognitive-synthesis-pack",
  "action": "activate",
  "active_count": 3,
  "slot_capacity": 6,
  "timestamp": "2026-02-27T..."
}
```

## Error Responses

| Error | Condition |
|-------|-----------|
| `NO_SLOTS_AVAILABLE` | Active count would exceed slot capacity |
| `PACK_NOT_FOUND` | Pack ID not in registry |
| `ALREADY_ACTIVE` | Pack is already activated |
| `ALREADY_INACTIVE` | Pack is already deactivated |
| `COOLDOWN_ACTIVE` | Deactivation cooldown has not elapsed |
| `SUBSCRIPTION_INVALID` | User subscription is expired or missing |

## Audit Log Entry

Every activation/deactivation produces an audit entry:

```typescript
interface ActivationAuditLog {
  id: string;
  user_id: string;
  pack_id: string;
  event_type: 'activate' | 'deactivate';
  active_count: number;
  slot_capacity: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}
```

## Entitlement Guard (Runtime)

After activation, every capability execution checks entitlements:

```
1. Extract user_id from session
2. Query active packs for user
3. Check if capability_id belongs to an active pack
4. If not entitled → reject with UNAUTHORIZED error
5. If entitled → execute and meter usage via ACCESS
```
