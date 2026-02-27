# Rollback Plan — CMPSBL Substrate

## Pre-Deployment Checklist
- [ ] Database migration reviewed and reversible
- [ ] Feature flags configured for gradual rollout
- [ ] Monitoring dashboards updated
- [ ] On-call engineer identified
- [ ] Release Gate passed (`bun src/release/releaseGate.ts`)

## Rollback Steps

### 1. Immediate Rollback (< 5 min)
1. Revert to previous deployment via CI/CD pipeline
2. Disable feature flags for new features
3. Verify health dashboard shows green

### 2. Database Rollback (if schema changed)
1. Run reverse migration script
2. Verify data integrity
3. Confirm RLS policies are intact

### 3. Configuration Rollback
1. Revert environment variables
2. Clear CDN cache if applicable
3. Restart edge functions

### 4. Canary / Staged Deployment
- Use EVOLUTION module's shadow deployment for canary testing
- Roll forward only after canary passes 100% health checks
- See `docs/v11/evolution-and-shadow.md` for shadow A/B testing protocol

## Communication
- Notify stakeholders via incident channel
- Update status page if user-facing
- Document root cause for post-mortem

## Recovery Verification
- [ ] All health checks passing
- [ ] Error rates returned to baseline
- [ ] User-facing flows verified
- [ ] Release Gate passes on rolled-back version

---

*CMPSBL Substrate — SPARTA Epoch*
*© 2025–2026 PromptFluid®. All rights reserved.*
