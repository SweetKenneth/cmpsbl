# IDENTITY — Ultimate Architecture (v9.0.0 "Authenticator")

**Primitive:** #8 — IDENTITY  
**Category:** ESZ (Execution Safety Zone)  
**Weight:** 0.020  
**Classification:** 🔒 INTERNAL  
**Last Updated:** 2026-03-23

---

## 1. Purpose

IDENTITY is the substrate's **authentication, actor provenance, and session management engine**. It manages user identities, role assignments, session lifecycle, and actor attribution across all system operations.

---

## 2. Core Engines

### 2.1 Authentication Gateway
- Multi-method auth: email/password, passkeys (WebAuthn), OAuth, magic links
- Session management with automatic token refresh
- Rate limiting on auth attempts per IP/account

### 2.2 Actor Provenance Tracker
- Attributes every system action to a verified actor
- Maintains actor lineage for delegated operations
- Prevents identity spoofing via JWT validation + fingerprinting

### 2.3 Role Assignment Engine
- Manages the `user_roles` table (separate from profiles, as required)
- Supports roles: admin, governor, moderator, user
- `has_role()` / `has_role_text()` security definer functions for RLS integration

### 2.4 Session Lifecycle Manager
- Tracks active sessions with device fingerprinting
- Geo-velocity detection for impossible-travel alerts
- Session binding validation (token ↔ client fingerprint)

### 2.5 Passkey Credential Manager
- WebAuthn credential storage and verification
- Challenge-response with 2-minute TTL and single-use enforcement
- Sign count tracking for replay detection

---

## 3. ADA Integration

IDENTITY operates within the `access-control` domain:
- **Autonomy threshold:** 85%
- **Rate limit:** 80 decisions/hr
- **DREAM allowed:** ✗
- **Allowed actions:** revoke-key, throttle-developer, enforce-quota, flag-abuse, validate-entitlement, rotate-token, suspend-account, score-reputation, cache-entitlement

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-23 | System | Ultimate architecture documentation |

---

© 2025–2026 CMPSBL®. Confidential.
