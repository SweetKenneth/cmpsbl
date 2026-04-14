---
name: V1 Integration Wiring
description: Engine ↔ Fingerprint Gate ↔ Audit Chain ↔ Safe Detach all connected and verified with 89 passing assertions.
type: feature
---

## V1 Wiring — Completed April 14, 2026

All V1 components are now wired together — not just co-existing as separate files.

### Connections

1. **Engine `attach()` → Fingerprint Gate**: Verifies host module before wrapping. Invalid = blocked. Suspect = limited capabilities.
2. **Engine `attach()`/`detach()` → Audit Chain**: Records `fingerprint_verify`, `attach_complete`, `detach_start`, `detach_complete` events.
3. **Engine `detach()` → Safe Detach**: Uses transactional protocol (boundary wait → restore → verify). Falls back to direct restore on failure.
4. **All wrappers → Execution Boundary**: Every wrapped function call enters/exits execution boundary so safe detach knows when it's safe.
5. **Session → All above**: Session-scoped engine integrates fingerprint gate, audit chain, and safe detach identically.
6. **First boot auto-register**: Suspect fingerprint on first boot is auto-registered as known-good after successful attach.

### Breaking Change

`detach()` is now async (returns `Promise<ManaManifest>`) due to safe detach protocol's boundary wait.

### Test Coverage

- 12 stress tests, 70 assertions (stop-ship hardening)
- 6 integration tests, 19 assertions (V1 wiring verification)
- Total: 89 assertions, all passing
