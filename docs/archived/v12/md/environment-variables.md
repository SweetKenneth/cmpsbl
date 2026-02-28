# Environment Variables

## Automatically Configured

These variables are managed by Clockless Cloud and should not be modified manually:

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Backend API endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key (safe to expose in client) |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

## Backend Secrets

Backend functions may require additional secrets configured through the Clockless Cloud secrets manager:

| Secret | Purpose | Required By |
|--------|---------|-------------|
| AI provider keys | Multi-provider routing | NEXUS node |
| Webhook signing keys | HMAC signature for outbound webhooks | RELAY node |
| Stripe keys | Payment processing | ECONOMY / ACCESS nodes |

## Runtime Detection Flags

These are not environment variables but runtime-detected states that influence system behavior:

| Flag | Source | Effect |
|------|--------|--------|
| Terminal presence | DOM scan + `registerTerminalPresence()` | Skips terminal command audit checks when absent |
| Component mount flags | React lifecycle | Skips component-specific scans for uninstalled modules |
| `auto_training_enabled` | System config | Gates automated evolution proposals |

## Scan & Evolution Configuration

The audit pipeline and evolution engine respect these internal settings:

| Setting | Default | Description |
|---------|---------|-------------|
| Max proposal actions | 5 | Upper bound on fixes per proposal |
| Debt/evolution ratio | 60/40 | Allocation split when system is unstable vs stable |
| Max debt slots | 3 | Guarantees ≥2 evolution slots when stable |
| Stability threshold | 0 fatal, 0 error | Required before evolution engine activates |
| Value scoring | `severity × categoryMultiplier` | Prioritization formula across all 10 audit sources |

## Configuration Precedence

1. Clockless Cloud managed variables (highest priority)
2. `.env` file (local development overrides)
3. Default values in code (fallback)

## Security Notes

- Never commit secrets to version control
- The `.env` file is auto-generated and should not be edited manually
- Private keys must be stored as backend secrets, never in client-side code
- Publishable/anon keys are safe for client-side use
