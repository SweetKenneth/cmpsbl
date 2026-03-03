# DEFENSE: Shield Ports — Drift Tolerance & Fingerprint Caching

## Overview

The DEFENSE module's Shield Ports subsystem includes **fingerprint caching** and **drift-tolerant reputation scoring** to prevent legitimate users from losing reputation after normal browser changes (updates, plugin installs, viewport resizes) while still catching automation and spoofing.

---

## Fingerprint Caching

### In-Memory Cache
- Fingerprint generation is expensive (Canvas, WebGL, Audio, Font detection).
- Once generated, the fingerprint + hash are cached in-memory for the session.
- A **minimum regeneration window** (default: 10 minutes) prevents repeated CPU-heavy signal pulls.
- Calling `getCachedFingerprint()` within the window reuses cached values.
- `getCachedFingerprint({ force: true })` bypasses the cache for admin/debug use.

### Persistent Cache (Consent-Gated)
- **Only written when tracking consent is granted** (`hasTrackingConsent() === true`).
- Stored record contains:
  - `fingerprint_hash` — SHA-256 of full fingerprint
  - `created_at` / `expires_at` — TTL default 24 hours
  - `schema_version` — for forward-compatible migrations
  - `key_signal_hashes` — FNV-1a hashes of individual signals (canvas, webgl, audio, etc.)
- **Consent denied** → no persistent writes; only in-memory cache is used.
- **Consent revoked** → persistent cache record is wiped immediately via `clearPersistentFingerprintCache()`.

### Feature Flags
- `DEFENSE_FP_PERSIST_CACHE=false` → disables persistent cache, forces in-memory-only mode.

---

## Drift Tolerance

### What Is Drift?
When a returning device generates a new fingerprint, some signals will naturally change:
- Browser updates → canvas/webgl hash changes
- Plugin installs → plugins_count changes
- Monitor change → screen_bucket shift
- VPN toggle → timezone/language shift

**Drift tolerance** prevents these normal changes from triggering blocks.

### How It Works
1. When a device is first seen, its hashed signal snapshot is stored server-side.
2. On subsequent visits, the new signals are compared against the snapshot.
3. A **drift score** (0–1) is computed based on weighted signal differences.
4. The score determines the recommended action.

### Default Thresholds
| Drift Score | Action | Description |
|---|---|---|
| ≤ 0.35 | `allow` | Within tolerance — normal browser changes |
| 0.35 – 0.60 | `challenge` | Uncertain — may need CAPTCHA verification |
| > 0.60 | `block` | High drift — likely spoofing (unless historically trusted) |

### Signal Weights
| Signal | Weight | Rationale |
|---|---|---|
| `canvas` | 0.15 | Stable across sessions, changes on GPU/driver update |
| `webgl` | 0.15 | Tied to GPU hardware |
| `audio` | 0.10 | Stable but can change with audio driver updates |
| `platform` | 0.12 | Very stable — changes are suspicious |
| `timezone` | 0.10 | Can change legitimately (travel, VPN) |
| `language` | 0.08 | Usually stable |
| `screen_bucket` | 0.08 | Bucketed (100px steps) to absorb minor changes |
| `viewport_bucket` | 0.05 | Most volatile — window resizing |
| `plugins_count` | 0.05 | Changes with extension installs |
| `cores_bucket` | 0.06 | Very stable |
| `memory_bucket` | 0.06 | Very stable |

### Hard Negatives
These signals **override drift tolerance** and always increase risk:
- `webdriver` — Selenium/Puppeteer/Playwright detected
- `cdpDetected` — Chrome DevTools Protocol leak
- `performanceAPITampered` — timing API manipulation
- `swiftshader_detected` — headless Chrome GPU emulation

### Trusted Device Leniency
If a device has a historical track record of ≥10 requests with <10% block rate, it's considered **trusted**. Trusted devices receive more leniency:
- Challenge-range drift → `allow`
- High drift (without hard negatives) → `challenge` instead of `block`

---

## Server-Side Storage

### `device_fingerprint_snapshots` Table
- **fingerprint_hash** — indexed, unique per device
- **signal_hashes** (JSONB) — FNV-1a hashes of canvas, webgl, audio, webrtcLeak, etc.
- **signal_buckets** (JSONB) — bucketed values: screen_bucket, viewport_bucket, plugins_count, cores_bucket, memory_bucket
- **flags** (JSONB) — boolean automation flags: webdriver, cdpDetected, performanceAPITampered, swiftshader_detected
- **drift_history** (JSONB) — last 20 drift evaluations (score, reasons, action, timestamp)

**Security**: RLS enabled, no public policies. All reads/writes happen through service-role edge functions only.

---

## Tuning

### Adjusting Drift Thresholds
Modify `TOLERANCE_THRESHOLD` and `CHALLENGE_THRESHOLD` in `fingerprint-drift-evaluate/index.ts`.

### Adjusting Signal Weights
Modify the `SIGNAL_WEIGHTS` map. Total weights should sum to ~1.0 for meaningful scoring.

### Adjusting Cache TTL
- In-memory regen window: `setRegenWindow(ms)` (bounds: 1s–1h)
- Persistent cache TTL: `PERSISTENT_CACHE_TTL_MS` in `fingerprint-cache.ts` (default: 24h)

---

## Rollback

- **Disable drift integration**: Set `DEFENSE_DRIFT_ENABLED=false` — reputation engine skips drift consult.
- **Disable persistent cache**: Set `DEFENSE_FP_PERSIST_CACHE=false` — forces in-memory-only mode.
- **Rate limit false positives**: Raise thresholds and shorten penalty windows in edge rate limiter config.
