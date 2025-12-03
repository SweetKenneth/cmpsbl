# PromptFluid Dual-Domain Architecture Setup

## Overview

PromptFluid operates on a dual-domain architecture for security, performance, and organizational purposes:

- **evolv.onl** - Backend infrastructure, API gateway, Railway workers
- **promptfluid.com** - Public-facing website, customer portal, employee interaction

---

## Domain Configuration

### EVOLV.ONL - Backend Infrastructure

**Purpose:** Backend operations, API endpoints, Railway workers, Defense System

**DNS Configuration:**
```
A     @           185.158.133.1 (or your Railway IP)
A     api         185.158.133.1
A     workers     185.158.133.1
A     railway     185.158.133.1
A     defense     185.158.133.1
A     nexus       185.158.133.1
A     brain       185.158.133.1
CNAME www         evolv.onl
```

**Vercel Configuration (if using):**
1. Go to Vercel Dashboard → Project Settings → Domains
2. Add: `evolv.onl`, `api.evolv.onl`, `workers.evolv.onl`, etc.
3. Follow DNS verification instructions

**Railway Configuration:**
1. Railway Dashboard → Project → Settings → Domains
2. Add custom domains for each subdomain
3. Update DNS records as instructed

**Features:**
- ✅ PromptFluid Defense™ System installed
- ✅ Copyright protection shields
- ✅ API endpoint monitoring
- ✅ Restricted access (requires authentication)
- ✅ All backend operations routed here

**Access Route:** `/evolv-backoffice`

---

### PROMPTFLUID.COM - Public Website

**Purpose:** Public website, customer interaction, marketing, documentation

**DNS Configuration:**
```
A     @           185.158.133.1 (Lovable/Vercel IP)
A     www         185.158.133.1
A     app         185.158.133.1
A     docs        185.158.133.1
A     studio      185.158.133.1
A     vision      185.158.133.1
```

**Vercel/Lovable Configuration:**
1. Project Settings → Domains
2. Add: `promptfluid.com`, `www.promptfluid.com`, etc.
3. Set `promptfluid.com` as Primary Domain
4. Verify DNS propagation (up to 72 hours)

**Features:**
- ✅ Public-facing marketing site
- ✅ Customer onboarding
- ✅ Product showcases
- ✅ Documentation portal
- ✅ Employee/customer interaction

---

## Security Implementation

### Copyright Protection (evolv.onl)

All evolv.onl pages display:
- 🛡️ Official copyright shield
- ™ Trademark notices for all PromptFluid products
- ⚠️ Legal warnings against unauthorized access
- 🔒 Defense System enforcement notices

### Defense System Integration

The **PromptFluid Defense™** system is installed on evolv.onl and monitors:
- All API endpoint access attempts
- Behavioral analysis of requests
- Bot detection and blocking
- IP reputation tracking
- Real-time threat intelligence

### Access Control

**evolv.onl:**
- Requires authentication for most endpoints
- Rate-limited
- Monitored by Defense System
- Logs all access attempts

**promptfluid.com:**
- Public access allowed
- Customer-friendly interface
- Marketing-focused content

---

## API Routing Architecture

### Backend APIs (evolv.onl)

```typescript
https://api.evolv.onl/nexus      → Nexus AI Gateway
https://api.evolv.onl/brain      → Brain Core API
https://api.evolv.onl/defense    → Defense Shield API
https://api.evolv.onl/ripple     → Ripple Network
https://api.evolv.onl/vision     → Vision Analytics
https://workers.evolv.onl/       → Railway Workers
```

### Frontend Routes (promptfluid.com)

```typescript
https://promptfluid.com/              → Homepage
https://www.promptfluid.com/          → Homepage
https://app.promptfluid.com/          → Customer Portal
https://docs.promptfluid.com/         → Documentation
https://studio.promptfluid.com/       → Studio Builder
https://vision.promptfluid.com/       → Vision Dashboard
```

---

## Environment Variables

Update your environment configuration:

```bash
# Backend Domain (evolv.onl)
VITE_BACKEND_DOMAIN=evolv.onl
VITE_API_BASE_URL=https://api.evolv.onl

# Frontend Domain (promptfluid.com)
VITE_FRONTEND_DOMAIN=promptfluid.com
VITE_PUBLIC_URL=https://promptfluid.com

# Supabase (remains the same)
VITE_SUPABASE_URL=https://hxgbibtkftocyrnuzxwd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here
```

---

## Deployment Checklist

### For evolv.onl:
- [ ] DNS records configured (A records for all subdomains)
- [ ] Railway project connected
- [ ] Defense System installed and operational
- [ ] Copyright shields visible on all pages
- [ ] API endpoints responding correctly
- [ ] Authentication middleware active
- [ ] SSL certificates provisioned

### For promptfluid.com:
- [ ] DNS records configured
- [ ] Vercel/Lovable domain connected
- [ ] SSL certificates active
- [ ] Public routes accessible
- [ ] Customer portal functional
- [ ] Documentation site live

---

## Testing

### evolv.onl Testing:
```bash
# Test API endpoints
curl https://api.evolv.onl/health
curl https://defense.evolv.onl/status
curl https://nexus.evolv.onl/health

# Verify Defense System
curl -I https://defense.evolv.onl
```

### promptfluid.com Testing:
```bash
# Test public access
curl https://promptfluid.com
curl https://www.promptfluid.com
curl https://docs.promptfluid.com

# Verify SSL
curl -I https://promptfluid.com
```

---

## Legal & Compliance

### Trademarks Protected:
- PromptFluid™
- PromptFluid.com
- Evolv.onl
- PromptFluid Brain™
- PromptFluid Vision™
- PromptFluid Defense™
- PromptFluid Studio™
- PromptFluid Nexus™
- PromptFluid Ripple™

### Enforcement:
All unauthorized access attempts to evolv.onl infrastructure are:
- Logged and analyzed
- Blocked by Defense System
- Subject to legal action
- Monitored in real-time

---

## Support & Monitoring

### Health Checks:
- evolv.onl: https://api.evolv.onl/health
- promptfluid.com: https://promptfluid.com/health

### Monitoring Dashboards:
- Defense System: https://defense.evolv.onl/dashboard
- Vision Analytics: https://vision.promptfluid.com
- Railway Metrics: Railway Dashboard

---

## Contact

For domain or infrastructure issues:
- Technical: kenneth@promptfluid.com
- Legal: legal@promptfluid.com
- Security: security@evolv.onl

---

**Last Updated:** 2025-01-01
**Version:** 1.0.0
**Status:** Production Ready
