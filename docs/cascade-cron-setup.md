# Cascade / Dream-Eater Cron Setup (DEPRECATED)

> ⚠️ **DEPRECATED**: This file has been superseded by `docs/DREAM_EATER_CRON.md`
>
> **Cascade and Dream-Eater are the SAME entity.**
> Use the new unified `pf-dream-eater-cycle` function instead of the fragmented functions below.

## Unified Dream System

See [DREAM_EATER_CRON.md](./DREAM_EATER_CRON.md) for the current setup.

The unified system:
- Runs daily at 3 AM UTC
- Generates dreams from memories and patterns
- Sends ONE consolidated email per dream
- Stores to `cascade_dreams` table

---

## Legacy Functions (Do Not Use)

The following cron jobs are deprecated:

- `cascade-six-hour-report` - Use unified cycle instead
- `cascade-daily-dream` - Use unified cycle instead
- `pf-cascade-dream` - Merged into unified cycle
- `pf-brain-dream` - Merged into unified cycle
- `pf-dream-mode` - Merged into unified cycle

To remove old cron jobs:

```sql
SELECT cron.unschedule('cascade-six-hour-report');
SELECT cron.unschedule('cascade-daily-dream');
```

---

## Email Configuration

Make sure the `RESEND_API_KEY` is set in Supabase Edge Function secrets and that:
- Your domain is verified in Resend
- The "from" email (cascade@promptfluid.com) is configured
- The "to" email (kenneth@promptfluid.com) is correct
