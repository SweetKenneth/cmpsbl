## Layer 2 Polish & Gap Fill

### 1. Wire ManaAttachPhase through the Findings Bridge
- Replace inline regex scanner (lines 91-104) with `detectFunctionBoundaries()` from findings-bridge
- Replace blanket rule application (lines 126-135) with `buildAttachmentPlan()` for surgical mapping
- The UI still shows which functions get which capabilities, but now it's signal-matched not blanket

### 2. Handle `observe` verdict in Lex + wrappers
- Add `observe` path to defense_gate, governance_hook, and shadow_rule wrappers
- `observe` = allow execution but emit telemetry (log but don't block)

### 3. Fix async wrapping (beacon + circuit breaker)
- Detect Promise returns and await them for proper duration measurement (beacon)
- Handle async throws in circuit breaker
- This makes the FAQ claim truthful

### 4. Add recursive layer tracking
- Track `layerDepth` in engine state — starts at 0, increments on each attach
- Store `parentLayerHash` so each layer can prove its host (whether raw source or another Mana layer)
- Add `layerDepth` and `parentLayerHash` to ManaProof type
- This validates the V3→V2→V1 patent claim

### 5. Minor polish
- Remove the `scan()` import in ManaAttachPhase since it now goes through the bridge
- Update engine version string to reflect convergence
