# LNCHBL Patch Client — Integration Specification

**Version:** 1.0.0  
**For:** LNCHBL Distribution  
**From:** CMPSBL® Canonical Substrate  
**Classification:** Integration Guide

---

## Overview

This document specifies exactly what code LNCHBL needs to pull and apply patches from the CMPSBL canonical substrate. LNCHBL is a **pull-only consumer** — it can never author, push, or modify patches.

---

## 1. Required Files for LNCHBL

### 1.1 Distribution Identity Lock

Create `src/lib/distribution.ts` in the LNCHBL project:

```typescript
/**
 * LNCHBL Distribution Identity — IMMUTABLE
 * This file defines the non-canonical downstream identity.
 * NO field in this file may ever be changed at runtime.
 */

export const DISTRIBUTION_ID = 'LNCHBL' as const;
export const CANON_AUTHORITY = false as const;
export const FEDERATION_ENABLED = false as const;
export const IS_CANONICAL = false as const;
export const PATCH_AUTHORING_ENABLED = false as const;

// The upstream canonical source
export const UPSTREAM_DISTRIBUTION = 'CMPSBL' as const;

// LNCHBL can ONLY receive patches, never author them
export type UpstreamDistribution = 'CMPSBL';

// Fields that LNCHBL must never modify (even via patches)
export const IMMUTABLE_FIELDS = [
  'distribution_id',
  'canon_authority',
  'is_canonical',
  'federation_enabled',
  'patch_authoring_enabled',
  'governance_mode',
  'identity',
] as const;
```

### 1.2 Patch Client

Create `src/lib/patches/client.ts` in the LNCHBL project:

```typescript
/**
 * LNCHBL Patch Client — Pull-only patch consumer
 * Fetches and applies patches from the CMPSBL canonical substrate.
 */

import { DISTRIBUTION_ID, IMMUTABLE_FIELDS } from '@/lib/distribution';

// ─── Configuration ───────────────────────────────────────────────────────────

// Replace with your CMPSBL instance URL
const CMPSBL_URL = 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PatchManifest {
  distributionId: string;
  generatedAt: string;
  latestVersion: string;
  patches: PatchEntry[];
  critical: boolean;
  signature: string;
}

export interface PatchEntry {
  id: string;
  version: string;
  requiredTier: string;
  enginesUnlocked: string[];
  capabilitiesUnlocked: string[];
  changelog: string;
  status: string;
  publishedAt: string | null;
}

export interface PatchPayload {
  patch: {
    id: string;
    version: string;
    target_distribution: string;
    required_tier: string;
    engines_unlocked: string[];
    capabilities_unlocked: string[];
    changelog: string;
    manifest_json: any;
    signature: string;
  };
  downloadedAt: string;
}

// ─── Manifest Fetch ──────────────────────────────────────────────────────────

/**
 * Fetch the patch manifest from CMPSBL.
 * Returns available patches for this distribution.
 */
export async function fetchManifest(): Promise<PatchManifest> {
  const url = `${CMPSBL_URL}/cmpsbl-patch-manifest?distribution_id=${DISTRIBUTION_ID}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Manifest fetch failed (${response.status}): ${error.error || 'Unknown error'}`);
  }

  const manifest: PatchManifest = await response.json();

  // Verify the manifest came from CMPSBL
  if (manifest.distributionId !== 'CMPSBL') {
    throw new Error('Manifest distributionId mismatch — expected CMPSBL');
  }

  return manifest;
}

// ─── Patch Download ──────────────────────────────────────────────────────────

/**
 * Download a specific patch from CMPSBL.
 * Requires a valid license key for the patch's required tier.
 */
export async function downloadPatch(
  patchId: string,
  licenseKey: string
): Promise<PatchPayload> {
  const url = `${CMPSBL_URL}/cmpsbl-patch-download`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patch_id: patchId,
      distribution_id: DISTRIBUTION_ID,
      license_key: licenseKey,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Patch download failed (${response.status}): ${error.error || 'Unknown error'}`);
  }

  const payload: PatchPayload = await response.json();

  // Security: Validate the patch doesn't contain prohibited fields
  validatePatchSafety(payload);

  return payload;
}

// ─── Safety Validation ───────────────────────────────────────────────────────

/**
 * Validates a downloaded patch doesn't try to modify distribution identity.
 * This is a CLIENT-SIDE safety check (server also validates).
 */
function validatePatchSafety(payload: PatchPayload): void {
  const patchKeys = Object.keys(payload.patch);

  for (const field of IMMUTABLE_FIELDS) {
    if (patchKeys.includes(field)) {
      throw new Error(
        `SECURITY: Patch contains prohibited field "${field}". ` +
        `This patch has been rejected. Report this to CMPSBL admin.`
      );
    }
  }

  // Verify target distribution
  if (payload.patch.target_distribution !== DISTRIBUTION_ID) {
    throw new Error(
      `SECURITY: Patch target_distribution is "${payload.patch.target_distribution}", ` +
      `expected "${DISTRIBUTION_ID}". Rejected.`
    );
  }
}

// ─── Patch Application ──────────────────────────────────────────────────────

/**
 * Apply a downloaded patch to LNCHBL's local engine/capability state.
 * This enables the engines and capabilities specified in the patch.
 */
export function applyPatch(payload: PatchPayload): {
  enginesUnlocked: string[];
  capabilitiesUnlocked: string[];
  version: string;
} {
  const { engines_unlocked, capabilities_unlocked, version } = payload.patch;

  // Here you would integrate with your local engine/capability registry:
  // 
  // For each engine in engines_unlocked:
  //   engineRegistry.enable(engineId);
  //
  // For each capability in capabilities_unlocked:
  //   capabilityManager.enable(capabilityId);
  //
  // Store the applied patch version in local state:
  //   localStorage.setItem('lnchbl_patch_version', version);

  console.log(`[LNCHBL] Patch v${version} applied:`);
  console.log(`  Engines unlocked: ${engines_unlocked.join(', ') || 'none'}`);
  console.log(`  Capabilities unlocked: ${capabilities_unlocked.join(', ') || 'none'}`);

  return {
    enginesUnlocked: engines_unlocked,
    capabilitiesUnlocked: capabilities_unlocked,
    version,
  };
}

// ─── Full Update Flow ────────────────────────────────────────────────────────

/**
 * Complete patch update flow:
 * 1. Fetch manifest
 * 2. Compare versions
 * 3. Download new patches
 * 4. Apply them
 */
export async function checkForUpdates(
  licenseKey: string,
  currentVersion: string = '0.0.0'
): Promise<{
  updated: boolean;
  newVersion: string;
  patchesApplied: number;
}> {
  // 1. Fetch manifest
  const manifest = await fetchManifest();

  // 2. Compare versions
  if (manifest.latestVersion <= currentVersion && !manifest.critical) {
    return { updated: false, newVersion: currentVersion, patchesApplied: 0 };
  }

  // 3. Download and apply each new patch
  let patchesApplied = 0;
  let newVersion = currentVersion;

  for (const entry of manifest.patches) {
    if (entry.version <= currentVersion && !manifest.critical) continue;

    try {
      const payload = await downloadPatch(entry.id, licenseKey);
      applyPatch(payload);
      newVersion = entry.version;
      patchesApplied++;
    } catch (err) {
      console.error(`[LNCHBL] Failed to apply patch ${entry.id}:`, err);
      // Continue with other patches — don't fail the whole update
    }
  }

  return { updated: patchesApplied > 0, newVersion, patchesApplied };
}
```

---

## 2. Usage in LNCHBL

### 2.1 Check for Updates (e.g., on app startup)

```typescript
import { checkForUpdates } from '@/lib/patches/client';

// On app init or settings page
const result = await checkForUpdates(
  'PF-XXXXX-XXXXX-XXXXX-XXXXX',  // User's license key
  '0.0.0'                          // Current patch version
);

if (result.updated) {
  console.log(`Updated to v${result.newVersion} (${result.patchesApplied} patches)`);
}
```

### 2.2 Manual Patch Check (UI button)

```typescript
import { fetchManifest, downloadPatch, applyPatch } from '@/lib/patches/client';

// Show available patches
const manifest = await fetchManifest();
console.log(`${manifest.patches.length} patches available`);

// Download and apply a specific patch
const payload = await downloadPatch(manifest.patches[0].id, licenseKey);
const result = applyPatch(payload);
```

---

## 3. LNCHBL Security Rules

### NEVER DO:
- ❌ Modify `src/lib/distribution.ts`
- ❌ Set `CANON_AUTHORITY` to `true`
- ❌ Set `PATCH_AUTHORING_ENABLED` to `true`
- ❌ Set `FEDERATION_ENABLED` to `true`
- ❌ Create your own patch authoring UI
- ❌ Push patches to CMPSBL or any other distribution
- ❌ Self-report your license tier (server validates it)

### ALWAYS DO:
- ✅ Validate patches client-side before applying
- ✅ Verify manifest `distributionId === 'CMPSBL'`
- ✅ Store applied patch versions locally
- ✅ Handle download failures gracefully
- ✅ Log all patch operations for debugging

---

## 4. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/cmpsbl-patch-manifest?distribution_id=LNCHBL` | GET | Fetch available patches |
| `/cmpsbl-patch-download` | POST | Download a specific patch |

### Base URL
```
https://bxodolqqczjuahwdrswy.supabase.co/functions/v1
```

### Error Codes
| Code | Meaning |
|------|---------|
| 400 | Missing required fields |
| 403 | Invalid license, wrong distribution, or insufficient tier |
| 404 | Patch not found or not published |
| 405 | Wrong HTTP method |
| 503 | Service temporarily unavailable |

---

## 5. Testing the Integration

### Step 1: Verify distribution identity
```typescript
import { DISTRIBUTION_ID, CANON_AUTHORITY } from '@/lib/distribution';
console.assert(DISTRIBUTION_ID === 'LNCHBL');
console.assert(CANON_AUTHORITY === false);
```

### Step 2: Fetch manifest
```typescript
const manifest = await fetchManifest();
console.log('Manifest received:', manifest.latestVersion);
console.log('Patches available:', manifest.patches.length);
```

### Step 3: Download a patch (requires valid license)
```typescript
const patch = await downloadPatch(manifest.patches[0].id, 'YOUR_LICENSE_KEY');
console.log('Downloaded:', patch.patch.version);
```

---

© 2026 PromptFluid® / CMPSBL®. All rights reserved.
