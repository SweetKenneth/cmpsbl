# Capabilities Depot — Internal Documentation

**Version 1.0.0 | CONFIDENTIAL**

---

## ⚠️ Classification

> **INTERNAL USE ONLY** — This documentation contains proprietary implementation details for the Capabilities Depot monetization system.

---

## Overview

The Capabilities Depot is a **downloadable artifact marketplace** for cognitive capabilities. Unlike the substrate (which is licensed infrastructure), capabilities are sold as self-contained packages for local execution.

**Key Differentiators:**
- No SaaS / no hosting obligations
- License enforcement at download time only
- Customer responsible for all execution
- Support available during licensing period

---

## Architecture

### Core Modules

```
src/lib/capabilities/depot/
├── types.ts      # Artifact contract, license types
├── registry.ts   # Metadata registry (no execution)
├── pricing.ts    # Tier definitions, Stripe mappings
├── license.ts    # Download enforcement, validation
├── package.ts    # Artifact validation, checksum
└── index.ts      # Public API exports
```

### Design Principles

1. **Metadata Only**: Registry contains no execution hooks
2. **No Runtime Checks**: License validated at download only
3. **No Telemetry**: No callbacks, no phone-home
4. **Self-Contained**: Each artifact fully standalone

---

## Capability Artifact Contract

### CapabilityArtifact Interface

```typescript
interface CapabilityArtifact {
  id: string;
  slug: string;
  name: string;
  category: CapabilityCategory;
  description: string;
  requiredModules: string[];
  executorType: ExecutorType;
  artifactFormat: ArtifactFormat;
  version: string;
  checksum: string;
  releaseNotes: string;
  governanceLevel: GovernanceLevel;
  executionMode: 'local_only';
  supportPolicy: 'licensed_support';
  licenseRequired: true;
  priceUsd: number;
  pricingTier: PricingTier;
  lastUpdated: string;
}
```

### Categories

| Category | Examples |
|----------|----------|
| intelligence | Causal inference, emergent patterns |
| optimization | Capacity forecasting, cost optimization |
| resilience | Predictive healing, chaos framework |
| security | Threat prediction, compliance automation |
| accessibility | WCAG auditor |
| automation | SLA guardian, resource resolver |

### Executor Types

| Type | Format | Use Case |
|------|--------|----------|
| js | zip | Standard JavaScript capabilities |
| edge | zip | Edge function deployments |
| wasm | wasm | High-performance compute |
| container | container | Full container images |

---

## Pricing Model

### Tiers (Aligned with Templates)

| Tier | Range | Badge |
|------|-------|-------|
| utility | $19 – $49 | Starter |
| advanced | $99 – $299 | Pro |
| system | $499 – $999 | Elite |
| flagship | $1,499 – $2,999 | Enterprise |

### Stripe Integration

Price IDs mapped in `CAPABILITY_PRICE_IDS`:
```typescript
const CAPABILITY_PRICE_IDS: Record<string, string> = {
  'causal-inference': 'price_xxx',
  'threat-prediction': 'price_yyy',
};
```

---

## Licensing System

### License Flow

1. **Purchase**: User completes Stripe checkout
2. **Record**: License created in database
3. **Download**: License validated at download time
4. **Deliver**: Signed URL generated (1-hour expiry)
5. **Support**: Available during licensing period

### License States

| Status | Download Allowed | Support Eligible |
|--------|------------------|------------------|
| active | ✓ | ✓ |
| revoked | ✗ | ✗ |
| expired | ✗ | ✗ |

### Validation Function

```typescript
function validateLicense(
  licenses: CapabilityLicense[],
  capabilityId: string,
  userId: string
): LicenseValidationResult
```

---

## Artifact Package Structure

### Required Files

```
/capability-name/
├── capability.json     # Manifest (validated)
├── README.md           # Integration docs
├── LICENSE.txt         # Commercial terms
├── CHECKSUM            # SHA-256 hash
└── executor/           # Capability code
    └── index.js        # Entry point
```

### Validation Pipeline

1. **Schema Validation**: Required fields present
2. **Semver Check**: Valid version format
3. **Category/Executor Validation**: Enum compliance
4. **Checksum Verification**: SHA-256 match
5. **Structure Check**: Required files present

---

## Security Considerations

### What We DON'T Do

- ❌ Execute customer capabilities
- ❌ Store customer data
- ❌ Provide runtime monitoring
- ❌ Phone home or telemetry
- ❌ Background sync or auto-update

### What We DO

- ✓ Validate licenses at download
- ✓ Generate time-limited signed URLs
- ✓ Verify artifact checksums
- ✓ Track download counts (aggregate only)
- ✓ Provide support during licensing period

---

## Legal Framework

### Standard Terms (All Capabilities)

```
LICENSED — Capability provided with support during licensing period.
No hosting, no SLA, no uptime guarantee. Execution responsibility 
lies with the licensee. All sales final.
```

### License.txt Template

```
CMPSBL CAPABILITY LICENSE

1. GRANT: Non-exclusive license to use this capability
2. RESTRICTIONS: No redistribution, no sublicensing
3. SUPPORT: Available during licensing period via /support
4. LIMITED WARRANTY: See terms for details
5. LIABILITY: Maximum liability equals purchase price
```

---

## Database Schema (Future)

```sql
-- capability_licenses
CREATE TABLE capability_licenses (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  capability_id TEXT NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active',
  purchased_version TEXT NOT NULL,
  last_downloaded_version TEXT,
  download_count INTEGER DEFAULT 0,
  order_ref TEXT,
  UNIQUE(user_id, capability_id)
);

-- RLS: Users can only see their own licenses
```

---

## Metrics (Internal Only)

| Metric | Purpose |
|--------|---------|
| Total capabilities | Registry size |
| Downloads per capability | Popularity tracking |
| Revenue by tier | Pricing optimization |
| Conversion rate | Funnel analysis |
| Support tickets | Customer satisfaction |

---

## Roadmap

### v1.1.0 (Planned)
- [ ] User license dashboard
- [ ] Version update notifications
- [ ] Bundle pricing

### v2.0.0 (Future)
- [ ] Subscription model option
- [ ] Enterprise volume licensing
- [ ] Private capabilities marketplace

---

*CMPSBL Capabilities Depot v1.0.0 — Internal Documentation*
*© 2025-2026 PromptFluid®. All rights reserved.*
