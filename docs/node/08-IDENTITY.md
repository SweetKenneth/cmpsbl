# IDENTITY — Authentication & Role Resolution

> **Node ID:** `identity` · **Sector:** OCG · **Generation:** 1 · **Node #8 of 40**
> **Codename:** *Cipher* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

IDENTITY owns authentication state, role resolution, session management, and the governor verification pipeline. It is the single source of truth for "who is this user and what can they do?" Every role check, every admin gate, every governor-mode unlock flows through IDENTITY.

---

## Architecture

### Role Resolution

IDENTITY resolves roles from the `user_roles` database table using a `SECURITY DEFINER` function to prevent RLS recursion:

```sql
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$ SELECT EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role
) $$;
```

**Critical security invariant:** Roles are NEVER stored on the profiles table. A separate `user_roles` table prevents privilege escalation attacks.

### Session Identity

IDENTITY builds a cryptographic identity context for DECODE:

```typescript
interface DecodeIdentityContext {
  userId: string | null;
  role: 'anonymous' | 'authenticated' | 'governor';
  isReturningUser: boolean;
  sessionFingerprint: string;    // Hashed session characteristics
  capabilities: string[];         // Unlocked capabilities for this session
}
```

### Governor Verification

Governor access requires server-side role verification — never client-side checks:

```
1. User claims governor status
2. IDENTITY calls has_role(auth.uid(), 'governor') via RPC
3. If true: unlock governor capabilities in DECODE
4. If false: refuse with safe explanation
5. Log verification attempt to AUDIT
```

---

## Trade Secrets

### 1. Anti-Escalation Architecture

Roles in a separate table with `SECURITY DEFINER` functions means:
- No RLS recursion (the function bypasses RLS to check roles)
- No client-side role manipulation (roles are never in JWT claims)
- No privilege escalation via profile updates
- Atomic role assignment with foreign key constraints

### 2. Session Fingerprinting

IDENTITY computes a session fingerprint from browser characteristics (hashed, never raw):
```
fingerprint = SHA-256(userAgent + language + timezone + screenRes + colorDepth)
```
This fingerprint is used for returning-user detection without PII storage.

### 3. Capability Unlock Map

Each role unlocks specific DECODE capabilities:

| Role | Unlocked Capabilities |
|---|---|
| `anonymous` | Basic chat, public data |
| `authenticated` | Full chat, memory, preferences |
| `governor` | inspect_nodes, topology_view, system_heal, governance_override, pipeline_scoring, foundry_reactor |

---

## CLM Learning Priorities

1. **Anomalous Access Pattern Detection** — Learning normal access patterns per role to flag unusual behavior
2. **Session Continuity Optimization** — Improving returning-user detection accuracy across devices

---

*CMPSBL® Substrate — IDENTITY Node Deep Dive · Founder Eyes Only*
