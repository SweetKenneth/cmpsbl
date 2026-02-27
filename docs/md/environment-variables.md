# Environment Variables

## Automatically Configured

These variables are managed by Clockless Cloud and should not be modified manually:

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Backend API endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key (safe to expose in client) |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

## Backend Secrets

Backend functions (edge functions) may require additional secrets configured through the Clockless Cloud secrets manager:

| Secret | Purpose | Required By |
|--------|---------|-------------|
| AI provider keys | Multi-provider routing | NEXUS node |
| Webhook signing keys | HMAC signature for outbound webhooks | RELAY node |
| Stripe keys | Payment processing | ECONOMY / ACCESS nodes |

## Configuration Precedence

1. Clockless Cloud managed variables (highest priority)
2. `.env` file (local development overrides)
3. Default values in code (fallback)

## Security Notes

- Never commit secrets to version control
- The `.env` file is auto-generated and should not be edited manually
- Private keys must be stored as backend secrets, never in client-side code
- Publishable/anon keys are safe for client-side use
