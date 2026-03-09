# DEFENSE — Security Perimeter & Access Enforcement

> **Node ID:** `defense` · **Sector:** Mesh Overlay · **Generation:** 2 · **Node #38 of 40**
> **Codename:** *Citadel* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

DEFENSE is the substrate's security perimeter. It owns authentication, authorization, encryption, and access enforcement. DEFENSE provides the containment boundaries that isolate sensitive operations (like SHADOW's sandboxing and PHANTOM's stealth ops). It is the outermost mesh overlay, wrapping all other security layers.

---

## Capabilities

| Capability | Description |
|---|---|
| `authenticate` | Verify identity of actors |
| `authorize` | Check permissions for requested actions |
| `encrypt` | Provide encryption services for sensitive data |
| `contain` | Establish isolation boundaries for operations |

---

## Architecture

### Security Perimeter Model

```
┌─────────────────────────────────────────────────────────┐
│                    DEFENSE Perimeter                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  External                                                │
│  ───────────────────────────────────────────────────     │
│       │                                                  │
│       ▼                                                  │
│  ┌─────────────┐                                        │
│  │ Auth Gate   │ ← Authentication layer                 │
│  └─────────────┘                                        │
│       │                                                  │
│       ▼                                                  │
│  ┌─────────────┐                                        │
│  │ Authz Gate  │ ← Authorization layer                  │
│  └─────────────┘                                        │
│       │                                                  │
│       ▼                                                  │
│  ┌─────────────┐                                        │
│  │ Containment │ ← Isolation boundaries                 │
│  └─────────────┘                                        │
│       │                                                  │
│       ▼                                                  │
│  Internal (trusted zone)                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Authentication Model

```typescript
interface AuthContext {
  actor: {
    id: string;
    type: 'user' | 'service' | 'node' | 'external';
    credentials: Credential[];
  };
  session: {
    id: string;
    createdAt: number;
    expiresAt: number;
    mfaVerified: boolean;
  };
  trust: {
    level: 'anonymous' | 'basic' | 'verified' | 'elevated';
    factors: string[];        // What verified identity (password, mfa, cert)
  };
}
```

### Authorization Model

```
authorize(actor, action, resource):
  1. Check IDENTITY trust ladder
     - Actor must meet minimum trust level for action
  
  2. Check GOVERNANCE policies
     - Action must comply with active policies
  
  3. Check resource permissions
     - Actor must have explicit permission on resource
  
  4. Check rate limits
     - Actor must be within quota
  
  5. All checks pass → allow
     Any check fails → deny with reason
```

---

## Trade Secrets

### 1. Defense in Depth

DEFENSE implements layered security — each layer can independently reject requests:

```
Layer stack (outermost first):
  1. Network perimeter — IP allowlisting, DDoS protection
  2. Authentication — Identity verification
  3. Authorization — Permission checking
  4. Containment — Isolation enforcement
  5. Encryption — Data protection at rest/in transit
```

### 2. Containment Boundaries

DEFENSE provides isolation for sensitive operations:

```typescript
interface ContainmentBoundary {
  id: string;
  type: 'sandbox' | 'shadow' | 'phantom' | 'quarantine';
  permissions: {
    networkAccess: 'none' | 'internal' | 'external';
    storageAccess: 'none' | 'ephemeral' | 'persistent';
    nodeAccess: string[];     // Allowed nodes
  };
  ttl: number;                // Auto-destroy after TTL
}
```

### 3. Encryption Standards

```
Encryption algorithms:
  - At rest: AES-256-GCM
  - In transit: TLS 1.3 (minimum)
  - Key derivation: PBKDF2 with 100K iterations
  - Hashing: SHA-256 for integrity, bcrypt for passwords

Key rotation:
  - Service keys: 90-day rotation
  - User keys: On-demand + breach response
  - Session keys: Per-session ephemeral
```

### 4. Zero-Trust Internal Communication

Even internal node-to-node communication is authenticated:

```
Node-to-node auth:
  1. Each node has a signed certificate
  2. Certificates are validated on every request
  3. Expired or revoked certificates are rejected
  4. Certificate rotation is automatic (30-day cycle)
```

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `auth_failure_spike` | >10 failures/minute from same source | High |
| `authz_denial_rate` | >20% of requests denied | Medium |
| `cert_expiring` | Certificate expires in <7 days | High |
| `containment_breach` | Boundary violation detected | Critical |

---

## Integration with SHADOW

DEFENSE provides SHADOW's containment boundary:

```
SHADOW requests containment:
  1. DEFENSE creates sandbox boundary
     - No production write access
     - Ephemeral storage only
     - Network calls interceptable
  
  2. SHADOW executes within boundary
  
  3. On teardown, DEFENSE destroys boundary
     - All ephemeral data wiped
     - All network mocks cleared
```

---

## CLM Learning Priorities

1. **Attack Surface Minimization** — Identifying unused permissions that can be revoked
2. **Authentication UX Optimization** — Balancing security with user friction

---

*CMPSBL® Substrate — DEFENSE Node Deep Dive · Founder Eyes Only*
