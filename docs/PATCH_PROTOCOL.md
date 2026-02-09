# CMPSBL® Patch Distribution Protocol

**Version:** 1.0.0  
**Status:** Active  
**Author:** CMPSBL® Engineering  
**Classification:** Internal Protocol — Distribution Architecture

---

## 1. Canonical Model

The CMPSBL substrate operates under a **strict canonical hierarchy**:

| Property | CMPSBL | LNCHBL |
|----------|--------|--------|
| Distribution ID | `CMPSBL` | `LNCHBL` |
| Canon Authority | `true` | `false` (immutable) |
| Federation | Enabled | Disabled |
| Patch Authoring | Enabled | Disabled |
| Patch Receiving | N/A | Pull-only |
| Self-Promotion | N/A | Blocked |

**Key invariant:** LNCHBL can never:
- Author patches
- Enable federation
- Claim canon authority
- Modify its distribution identity

These constraints are enforced at three levels:
1. **Compile-time:** TypeScript literal types in `distribution.ts`
2. **Runtime:** Server-side validation in edge functions
3. **Database:** CHECK constraints on `target_distribution`

---

## 2. Patch Lifecycle

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  AUTHOR  │────▶│ PUBLISH  │────▶│   PULL   │────▶│  APPLY   │
│ (CMPSBL) │     │ (CMPSBL) │     │ (LNCHBL) │     │ (LNCHBL) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                                  │
     ▼                ▼                                  ▼
  Draft           Published                         Activated
  Status          + Signed                          + Logged
```

### 2.1 Author Phase (CMPSBL Governor)
1. Governor opens the **OS Dashboard** (`/os`) and navigates to the **Patches** tab (under Evolve)
2. Uses the checkbox UI to select engines (grouped by category) and capabilities to unlock
3. Sets the required license tier (free, builder, pro)
4. Enters a version number and changelog description
5. System generates a signed JSON manifest with SHA-256 signature
6. Patch is saved as `draft`

> **Note:** The Patches tab is CMPSBL-exclusive and must NEVER be included in LNCHBL patches.
> An older `/admin/patches` page exists but is deprecated in favor of the embedded OS tab.

### 2.2 Publish Phase (CMPSBL Admin)
1. Admin reviews the draft manifest
2. Clicks "Publish" to promote to `published` status
3. Patch becomes visible in the manifest endpoint
4. Signature is verified and locked

### 2.3 Pull Phase (LNCHBL)
1. LNCHBL calls `GET /cmpsbl-patch-manifest?distribution_id=LNCHBL`
2. Receives a signed manifest with available patches
3. Compares `latestVersion` against its current version
4. Requests specific patches via `POST /cmpsbl-patch-download`

### 2.4 Apply Phase (LNCHBL)
1. LNCHBL validates the patch signature
2. Applies engine/capability unlocks
3. Records activation in local state
4. **Cannot** modify distribution identity or governance

---

## 3. License Tier Gating

Patches are gated by license tier using a strict hierarchy:

```
free (0) < builder (1) < pro (2)
```

| Tier | Access |
|------|--------|
| **Free** | Free-tier patches only |
| **Builder** | Free + Builder patches |
| **Pro** | All patches (Free + Builder + Pro) |

**Validation is server-side only.** The download endpoint:
1. Hashes the provided license key (SHA-256)
2. Looks up the hash in `marketplace_licenses`
3. Checks `activated === true`
4. Resolves the tier from `product_type`
5. Compares tier level against `patch.required_tier`
6. Returns 403 if insufficient

LNCHBL cannot self-report its tier. The server derives it from the license key.

---

## 4. Security Guarantees

### 4.1 Manifest Integrity
- Every manifest includes a SHA-256 signature
- Signature covers: distributionId, generatedAt, latestVersion, patches[], critical
- LNCHBL should verify this signature before processing

### 4.2 Prohibited Patch Fields
The following fields are **banned from all patch payloads**:
- `distribution_id`
- `canon_authority`
- `is_canonical`
- `federation_enabled`
- `patch_authoring_enabled`
- `governance_mode`
- `identity`

Any patch containing these fields is rejected at authoring time.

### 4.3 Prohibited File Paths
Patches may not include files that modify:
- `distribution.ts` or any canon identity files
- Authentication or governance configuration

### 4.4 Audit Trail
Every patch download is logged to:
- `cmpsbl_patch_downloads` (patch_id, distribution_id, license tier, IP, user agent, timestamp)
- `audit_logs` (action: `patch_download`, entity_type: `cmpsbl_patch`)

### 4.5 Database Security
- `cmpsbl_patches` table has RLS enabled
- Only admin-role users can read/write patches
- Edge functions use service-role for server-side access
- `target_distribution` has a CHECK constraint: must equal `'LNCHBL'`

---

## 5. Revocation Procedure

1. Admin navigates to `/admin/patches`
2. Finds the published patch
3. Clicks "Revoke"
4. Patch status changes to `revoked`
5. Revoked patches are excluded from the manifest endpoint
6. LNCHBL will no longer see or download this patch
7. Already-applied patches on LNCHBL are not automatically rolled back

**Emergency revocation:** Change status directly in the database:
```sql
UPDATE cmpsbl_patches SET status = 'revoked' WHERE id = '<patch-id>';
```

---

## 6. API Reference

### GET `/cmpsbl-patch-manifest`

**Query Parameters:**
- `distribution_id` (required): Must be `LNCHBL`

**Response (200):**
```json
{
  "distributionId": "CMPSBL",
  "generatedAt": "2026-02-09T...",
  "latestVersion": "1.2.0",
  "patches": [
    {
      "id": "uuid",
      "version": "1.2.0",
      "requiredTier": "pro",
      "enginesUnlocked": ["imagination_engine"],
      "capabilitiesUnlocked": ["dream_synthesis"],
      "changelog": "Unlock imagination engine for Pro users",
      "status": "published",
      "publishedAt": "2026-02-09T..."
    }
  ],
  "critical": false,
  "signature": "sha256hex..."
}
```

**Error Responses:**
- `403`: Non-LNCHBL distribution
- `405`: Non-GET method
- `503`: Service unavailable

### POST `/cmpsbl-patch-download`

**Body:**
```json
{
  "patch_id": "uuid",
  "distribution_id": "LNCHBL",
  "license_key": "PF-XXXXX-XXXXX-XXXXX-XXXXX"
}
```

**Response (200):** Full patch payload with manifest and signature.

**Error Responses:**
- `400`: Missing fields
- `403`: Invalid license, wrong distribution, or insufficient tier
- `404`: Patch not found or not published
- `405`: Non-POST method

---

## 7. Worked Example

### Scenario: Unlock `imagination_engine` for Pro users

**Step 1:** Admin opens `/admin/patches` and clicks "Author Patch"

**Step 2:** Fills in:
- Version: `1.0.0`
- Required Tier: `Pro`
- Engines to Unlock: `imagination_engine`
- Capabilities to Unlock: `dream_synthesis, creative_reasoning`
- Changelog: `Unlocks the Imagination Engine for Pro-tier LNCHBL installations. Enables dream synthesis and creative reasoning capabilities.`

**Step 3:** Admin clicks "Create Draft Patch" → patch saved as draft

**Step 4:** Admin reviews manifest JSON, confirms correctness

**Step 5:** Admin clicks "Publish" → patch goes live

**Step 6:** LNCHBL calls manifest endpoint:
```
GET /cmpsbl-patch-manifest?distribution_id=LNCHBL
```

**Step 7:** LNCHBL sees the patch, calls download:
```
POST /cmpsbl-patch-download
{
  "patch_id": "abc-123-...",
  "distribution_id": "LNCHBL",
  "license_key": "PF-A2B3C-D4E5F-G6H7J-K8L9M"
}
```

**Step 8:** Server validates:
- ✅ distribution_id === 'LNCHBL'
- ✅ License key hash found in marketplace_licenses
- ✅ License activated === true
- ✅ License tier (pro) >= required tier (pro)

**Step 9:** Patch payload returned. LNCHBL applies engine unlock.

**Step 10:** Download logged to `cmpsbl_patch_downloads` + `audit_logs`.

---

## 8. File Locations

| Component | Path |
|-----------|------|
| Canon Identity Lock | `src/lib/distribution.ts` |
| Patch Authoring Core | `src/lib/patches/author.ts` |
| Manifest Endpoint | `supabase/functions/cmpsbl-patch-manifest/index.ts` |
| Download Endpoint | `supabase/functions/cmpsbl-patch-download/index.ts` |
| OS Patches Tab (primary) | `src/components/substrate-os/PatchAuthoringTab.tsx` |
| Admin Patches Page (deprecated) | `src/pages/AdminPatches.tsx` |
| Database Table | `cmpsbl_patches` (with RLS) |
| Download Audit | `cmpsbl_patch_downloads` |
| LNCHBL Integration Spec | `docs/LNCHBL_PATCH_CLIENT.md` |
| This Document | `docs/PATCH_PROTOCOL.md` |

---

© 2026 PromptFluid® / CMPSBL®. All rights reserved.
