# ATLAS — System Map & Capability Registry

> **Node ID:** `atlas` · **Sector:** Plane · **Generation:** 2 · **Node #40 of 40**
> **Codename:** *Cartographer* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

ATLAS is the substrate's system map and capability registry. It owns node discovery, capability enumeration, topology visualization, and system-wide metadata. ATLAS is the authoritative source for "what exists and what can it do" — the final node in the 40-node architecture, providing the global view.

---

## Capabilities

| Capability | Description |
|---|---|
| `discover` | Enumerate all nodes and their capabilities |
| `register` | Add new capabilities to the registry |
| `query` | Find nodes by capability or sector |
| `visualize` | Generate topology maps and diagrams |
| `init` | Initialize ATLAS registry with node catalog |
| `health` | Query ATLAS module health metrics |
| `resilience` | Retrieve resilience posture and recovery data |
| `hardening` | Access hardening configuration and limits |
| `runCLM` | Trigger Continuous Lifecycle Management cycle |
| `setCapabilityLock` | Lock/unlock a specific capability registration |
| `upgradeEngine` | Apply engine upgrades with rollback support |
| `sectors` | Enumerate all sectors and their node membership |
| `topology` | Retrieve the full system topology graph |
| `capabilities` | List all registered capabilities across all nodes |
| `nodeDetail` | Deep inspection of a specific node's registry entry |
| `diffTopology` | Compare current topology against a baseline |
| `healthMap` | Per-node health status map across all sectors |
| `registerBulk` | Bulk register multiple capabilities atomically |

---

## Architecture

### Capability Registry Model

```
┌─────────────────────────────────────────────────────────┐
│                   ATLAS Registry                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │                 Node Catalog                     │    │
│  │  40 nodes × capabilities × metadata              │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                               │
│         ┌────────────────┼────────────────┐             │
│         ▼                ▼                ▼             │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐       │
│  │  Sector   │    │Capability │    │  Health   │       │
│  │   Index   │    │   Index   │    │   Index   │       │
│  └───────────┘    └───────────┘    └───────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Registry Entry Model

```typescript
interface RegistryEntry {
  node: {
    id: string;
    name: string;               // Display name
    codename: string;           // Internal codename
    sector: string;             // CORE, CCR, OCG, etc.
    generation: 1 | 2;          // Original or expansion
    bootOrder: number;          // 1-40
  };
  capabilities: Capability[];
  dependencies: string[];       // Required nodes
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    lastCheck: number;
    details: string;
  };
  metadata: Record<string, unknown>;
}

interface Capability {
  key: string;                  // e.g., 'embed', 'route', 'shadow'
  description: string;
  inputSchema?: object;         // JSON Schema
  outputSchema?: object;
  constraints?: {
    rateLimit?: number;
    requiresAuth?: boolean;
    minTrustLevel?: string;
  };
}
```

### Discovery Protocol

```
discover():
  1. Query all 12 sectors in parallel
     - CORE, SYSTEM, CCR, OCG, Execution, ESZ, EPZ, EMZ, CSZ, Fields, Plane, Shell
  
  2. For each sector, enumerate nodes
     - Send pulse to each node
     - Collect capability manifest
     - Record health status
  
  3. Build unified registry
     - Index by sector
     - Index by capability
     - Index by health status
  
  4. Return: Complete system map
```

---

## Trade Secrets

### 1. Lazy Discovery with Cache

ATLAS doesn't re-discover the entire system on every query:

```
queryCapability(capability):
  1. Check cache (TTL: 60 seconds)
  2. If cache hit: return cached result
  3. If cache miss:
     - Query only nodes likely to have capability (sector hint)
     - Update cache with result
  4. Return: matching nodes
```

### 2. Capability Inheritance

Some capabilities are inherited from parent sectors:

```
resolveCapability(node, capability):
  1. Check node's direct capabilities
  2. If not found, check sector-level capabilities
  3. If not found, check global capabilities (CORE)
  4. Return: resolved capability or null
```

### 3. Topology Diffing

ATLAS tracks topology changes over time:

```typescript
interface TopologyDiff {
  added: string[];              // New nodes/capabilities
  removed: string[];            // Removed nodes/capabilities
  changed: {
    node: string;
    before: Partial<RegistryEntry>;
    after: Partial<RegistryEntry>;
  }[];
  timestamp: number;
}
```

### 4. The 80-Capability Map

ATLAS maintains the authoritative list of 80 capabilities across all 40 nodes (2 priority capabilities per node on average). This map is used by CORTEX for orchestration routing.

```
Capability distribution:
  - Kernel (CORE, SYSTEM): 6 capabilities
  - Cognitive (BRAIN, MEMORY, DREAM): 8 capabilities
  - Compliance (OCG): 12 capabilities
  - Execution (11 nodes): 22 capabilities
  - Expansion zones (10 nodes): 20 capabilities
  - Mesh overlays (4 nodes): 8 capabilities
  - Plane (2 nodes): 4 capabilities
  
  Total: 80 registered capabilities
```

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `node_unreachable` | Any node not responding | High |
| `capability_gap` | Required capability not found | Critical |
| `registry_stale` | Cache age > 5 minutes | Low |
| `topology_change` | Unexpected node added/removed | High |

---

## System Map Summary

```
40-Node Architecture:
  ├─ Kernel (2): CORE, SYSTEM
  ├─ Cognitive/CCR (3): BRAIN, MEMORY, DREAM
  ├─ Compliance/OCG (6): RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE
  ├─ Execution (11): DECODE → ENCODE → VISION → CORTEX → NEXUS → 
  │                   ECONOMY → SANDBOX → INCLUSIVE → MEDIC → INTEGRATION
  ├─ ESZ (4): SOVEREIGN, ORACLE, CONSCIENCE, TREATY
  ├─ EPZ (3): COMPASS, ECHO, REFLEX
  ├─ EMZ (3): FORGE, LINGUA, HARVEST
  ├─ CSZ (3): EVOLUTION, SHADOW, PHANTOM
  ├─ Mesh Overlays (4): GOVERNANCE, INTENT, IMMUNITY, DEFENSE
  └─ Plane (2): ENGINEER, ATLAS
```

---

## CLM Learning Priorities

1. **Capability Usage Patterns** — Learning which capabilities are frequently co-requested
2. **Optimal Cache TTLs** — Balancing freshness against discovery cost

---

*CMPSBL® Substrate — ATLAS Node Deep Dive · Founder Eyes Only*

---

## Document Set Complete

This concludes the 40-node deep dive documentation series. All nodes have been documented with:
- Executive summaries
- Capability tables
- Architecture diagrams
- Trade secrets (proprietary algorithms)
- CLM insights
- Learning priorities

*CMPSBL® Substrate Documentation — Founder Eyes Only*
