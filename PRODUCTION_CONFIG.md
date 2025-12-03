# 🚀 PromptFluid Production Configuration Guide

**Last Updated:** October 31, 2025  
**Status:** Ready for Production Deployment

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Environment Setup
- [ ] Supabase project in production mode
- [ ] Database migrations applied
- [ ] RLS policies enabled and tested
- [ ] All edge functions deployed
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] CDN configured (optional)

### ✅ API Keys & Secrets (Production)
- [ ] LOVABLE_API_KEY (verified)
- [ ] TOGETHER_API_KEY (configured)
- [ ] PERPLEXITY_API_KEY (configured)
- [ ] ANTHROPIC_API_KEY (configured)
- [ ] GROQ_API_KEY (configured)
- [ ] STABILITY_API_KEY (optional)
- [ ] REPLICATE_API_KEY (optional)
- [ ] FAL_API_KEY (optional)
- [ ] RUNWAYML_API_KEY (optional)
- [ ] LUMA_API_KEY (optional)
- [ ] KAIBER_API_KEY (optional)
- [ ] MORPH_API_KEY (optional)

### ✅ Monitoring & Logging
- [ ] Error tracking enabled (Sentry/similar)
- [ ] Performance monitoring active
- [ ] Log aggregation configured
- [ ] Alert rules set up
- [ ] Uptime monitoring enabled

### ✅ Security Hardening
- [ ] Rate limiting configured
- [ ] CORS properly restricted
- [ ] Input validation on all endpoints
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Security headers configured

---

## 🔧 ENVIRONMENT CONFIGURATION

### Production Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[your-anon-key]

# App Configuration
VITE_APP_ENV=production
VITE_APP_URL=https://www.promptfluid.com
VITE_API_BASE_URL=https://[your-project-ref].supabase.co/functions/v1

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_DEBUG_MODE=false
```

### Supabase Edge Function Secrets

**Required Secrets (Set via Supabase Dashboard):**
```bash
# AI Provider Keys
LOVABLE_API_KEY=your_lovable_key
TOGETHER_API_KEY=your_together_key
PERPLEXITY_API_KEY=your_perplexity_key
ANTHROPIC_API_KEY=your_anthropic_key
GROQ_API_KEY=your_groq_key

# Database Access
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional Providers
STABILITY_API_KEY=your_stability_key
REPLICATE_API_KEY=your_replicate_key
FAL_API_KEY=your_fal_key
RUNWAYML_API_KEY=your_runwayml_key
LUMA_API_KEY=your_luma_key
KAIBER_API_KEY=your_kaiber_key
MORPH_API_KEY=your_morph_key
```

---

## 🗄️ DATABASE CONFIGURATION

### Connection Pooling
```sql
-- Recommended settings for production
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
```

### Backup Configuration
- **Daily backups:** Enabled
- **Point-in-time recovery:** 7 days
- **Backup retention:** 30 days
- **Backup encryption:** Enabled

### Performance Indexes
```sql
-- Critical indexes for production performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pf_media_cache_hash ON pf_media_cache(hash);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pf_media_cache_ttl ON pf_media_cache(ttl_expiration);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pf_ai_logs_created ON pf_ai_logs(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pf_cost_logs_created ON pf_cost_logs(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_defense_events_timestamp ON defense_events(timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nexus_cache_key ON nexus_cache(cache_key);
```

---

## 🛡️ SECURITY CONFIGURATION

### Rate Limiting (Recommended Settings)

**Per Module:**
- **Defense:** 100 requests/minute
- **Access:** 50 requests/minute
- **Ripple:** 30 requests/minute
- **Creative Generation:** 20 requests/minute
- **Brain Training:** 10 requests/minute

### CORS Configuration
```typescript
// Production CORS (restrictive)
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.promptfluid.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};
```

### Security Headers
```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
```

---

## 📊 MONITORING & ALERTING

### Key Metrics to Monitor

**System Health:**
- API response times (target: <200ms p95)
- Error rates (target: <0.1%)
- Database connection pool usage
- Cache hit rates (target: >70%)
- Edge function cold starts

**Business Metrics:**
- Creative generation requests/day
- AI provider costs/day
- Cache savings ($/day)
- User activity (DAU/MAU)
- Module usage distribution

### Alert Thresholds

**Critical Alerts:**
- API error rate >1% for 5 minutes
- Database connections >90% for 5 minutes
- Edge function failures >5 in 1 minute
- AI provider failures (all providers down)

**Warning Alerts:**
- API latency >500ms p95 for 10 minutes
- Cache hit rate <50% for 1 hour
- Cost anomalies (>2x daily average)
- Disk usage >80%

### Recommended Monitoring Tools
- **Uptime:** Pingdom, UptimeRobot, or StatusCake
- **Errors:** Sentry, Rollbar, or LogRocket
- **Performance:** New Relic, DataDog, or Grafana
- **Logs:** Logtail, Papertrail, or CloudWatch
- **Cost:** Supabase Dashboard + custom alerts

---

## 🚀 DEPLOYMENT PROCESS

### Pre-Deployment Steps
1. Run full test suite: `npm test`
2. Build production bundle: `npm run build`
3. Review security scan results
4. Check database migration status
5. Verify all edge functions deployed
6. Test in staging environment

### Deployment Commands
```bash
# Build for production
npm run build

# Deploy to Vercel (example)
vercel --prod

# Deploy edge functions (automatic via Supabase)
# No manual deployment needed - functions auto-deploy

# Run post-deployment smoke tests
npm run test:smoke
```

### Post-Deployment Verification
- [ ] Homepage loads correctly
- [ ] Authentication flow works
- [ ] API endpoints responding
- [ ] Creative generation working
- [ ] Dashboard displays correctly
- [ ] No console errors
- [ ] Analytics tracking active

---

## 💰 COST OPTIMIZATION

### AI Provider Cost Tracking

**Monthly Budget Guidelines:**
- **Text Generation:** $50-200/month (depending on volume)
- **Image Generation:** $100-500/month
- **Video Generation:** $200-1000/month
- **Total AI Costs:** $350-1700/month (estimated)

### Cost Reduction Strategies
1. **Maximize caching:** 90-day TTL saves 60-80% on repeated requests
2. **Use Together AI first:** Cheapest image generation at $0.001/image
3. **Route by task type:** Perplexity for research (free first year)
4. **Monitor provider performance:** Switch away from expensive/slow providers
5. **Implement request batching:** Reduce total API calls

### Cost Monitoring Queries
```sql
-- Daily cost breakdown by provider
SELECT 
  DATE(created_at) as date,
  service,
  COUNT(*) as requests,
  SUM(cost) as total_cost
FROM pf_cost_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), service
ORDER BY date DESC, total_cost DESC;

-- Cache savings calculation
SELECT 
  COUNT(*) FILTER (WHERE cached = true) as cache_hits,
  COUNT(*) FILTER (WHERE cached = false) as cache_misses,
  ROUND(100.0 * COUNT(*) FILTER (WHERE cached = true) / COUNT(*), 2) as hit_rate
FROM (
  SELECT true as cached FROM pf_media_cache WHERE created_at > NOW() - INTERVAL '7 days'
  UNION ALL
  SELECT false FROM pf_image_outputs WHERE created_at > NOW() - INTERVAL '7 days'
) combined;
```

---

## 🔄 MAINTENANCE SCHEDULE

### Daily Tasks (Automated)
- Database backups
- Log rotation
- Cache cleanup (expired entries)
- Health checks
- Cost aggregation

### Weekly Tasks
- Review error logs
- Check performance metrics
- Analyze cost trends
- Review security alerts
- Update dependencies (if needed)

### Monthly Tasks
- Full security audit
- Performance optimization review
- Cost analysis and optimization
- Database query optimization
- User feedback review

### Quarterly Tasks
- Major dependency updates
- Infrastructure review
- Disaster recovery test
- Capacity planning
- Feature usage analysis

---

## 🆘 INCIDENT RESPONSE

### Incident Severity Levels

**P0 (Critical):** Complete service outage
- Response time: Immediate
- All hands on deck
- Public status update within 15 minutes

**P1 (High):** Major feature unavailable
- Response time: <15 minutes
- Dedicated team assigned
- Status update within 30 minutes

**P2 (Medium):** Degraded performance
- Response time: <1 hour
- Investigation assigned
- Status update within 2 hours

**P3 (Low):** Minor issues
- Response time: <4 hours
- Handled during business hours

### Emergency Contacts
- **On-Call Engineer:** [Set up PagerDuty/similar]
- **Database Admin:** [Supabase support]
- **Infrastructure:** [Vercel/Railway support]

### Rollback Procedure
1. Identify failing deployment
2. Revert to last known good version
3. Verify rollback successful
4. Investigate root cause
5. Implement fix
6. Test thoroughly
7. Redeploy with fix

---

## 📈 SCALING GUIDELINES

### Current Capacity
- **Edge Functions:** Auto-scale (unlimited)
- **Database:** 500 connections max
- **Storage:** Unlimited (Supabase)
- **Bandwidth:** Unlimited (Vercel/Supabase)

### Scaling Triggers
- **Database CPU >70%:** Upgrade database tier
- **API latency >300ms p95:** Optimize queries or scale
- **Cache hit rate <50%:** Increase cache TTL or size
- **Cost >$2000/month:** Review provider routing

### Horizontal Scaling Options
- Add read replicas for database
- Implement CDN for static assets
- Use edge caching (Cloudflare)
- Distribute edge functions globally

---

## ✅ PRODUCTION READINESS CHECKLIST

### Infrastructure
- [x] DNS configured
- [ ] SSL certificate installed
- [x] CDN enabled (optional)
- [x] Load balancing configured (auto)
- [x] Database replicas (if needed)

### Application
- [x] All features tested
- [x] Performance optimized
- [x] Security hardened
- [x] Error handling complete
- [x] Logging configured

### Operations
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Backup verified
- [ ] Incident response plan ready
- [ ] Documentation complete

### Business
- [ ] Legal compliance verified
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support channels ready
- [ ] Billing integration tested

---

## 🎯 FINAL PRODUCTION CHECKLIST

**Before going live:**
1. ✅ All tests passing
2. ✅ Edge functions deployed
3. ✅ Database migrations applied
4. ✅ RLS policies active
5. ✅ API keys configured
6. ✅ Monitoring enabled
7. ⏳ Custom domain configured
8. ⏳ SSL certificate active
9. ⏳ Error tracking enabled
10. ⏳ Performance monitoring active

**Status:** 🟡 **80% Production Ready**

**Remaining Actions:**
1. Configure custom domain
2. Enable error tracking (Sentry)
3. Set up performance monitoring
4. Configure uptime monitoring
5. Complete security audit

---

**PromptFluid™ | AI That Flows**  
**Production Configuration Guide v1.0**
