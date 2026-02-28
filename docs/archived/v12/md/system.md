# SYSTEM — Lifecycle Management Node

## Purpose
SYSTEM manages module lifecycle, configuration, diagnostics, and system-wide utilities. It sits between CORE and CCR on the Spine.

## Namespace
`system.*`

## Command Examples
```
system.status           # System health overview
system.diligence        # Run full diligence harness
system.config <key>     # Query configuration value
system.modules          # List all registered modules
system.hardening        # Production hardening status
system.cache.clear      # Clear system caches
```

## Response Shape
```typescript
interface SystemStatusResult {
  success: boolean;
  uptime: number;
  modules: { name: string; status: string; health: number }[];
  config: Record<string, unknown>;
}
```

## Failure Modes
- **Config resolution failure**: Missing required configuration → module cannot initialize
- **Cache corruption**: Stale cache data → cleared automatically with RIPPLE notification
- **Dependency cycle**: Circular dependency detected in module graph → boot halted

## Governance Implications
- Configuration changes are audited and require governance approval for protected keys
- Diagnostic commands are read-only and do not trigger governance evaluation
- Module lifecycle transitions (enable/disable) are governed operations
