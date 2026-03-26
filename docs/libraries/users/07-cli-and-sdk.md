# CLI & SDK

---

## Overview

CMPSBL provides three access surfaces:

| Tool | What It Is | Where It Runs |
|------|-----------|---------------|
| **Substrate Terminal** | Browser-based command console (~600 commands) | Browser (cmpsbl.com) |
| **CLI** | `@cmpsbl/cli` npm package (66 commands) | Developer's machine |
| **SDK** | Full `@cmpsbl/*` package ecosystem (11 packages) | Developer's machine / CI/CD |

---

## Installation

```bash
npm install -g @cmpsbl/cli
```

## Authentication

```bash
cmpsbl auth login
# Or set environment variable:
export CMPSBL_API_KEY=pf_live_xxxxxxxxxxxxx
```

---

## CLI Commands (66)

### Core Commands
```bash
cmpsbl status          # System health overview
cmpsbl version         # Substrate version info
cmpsbl help            # Command reference
cmpsbl whoami          # Identity and tier
```

### Memory
```bash
cmpsbl memory recall [query]     # Search memory
cmpsbl memory store [key] [val]  # Store data
cmpsbl memory tiers              # View tier breakdown
cmpsbl memory stream             # View Memory Stream
```

### Development
```bash
cmpsbl encode analyze [file]     # Code analysis
cmpsbl encode build [spec]       # Execute build plan
cmpsbl decode parse [input]      # Parse intent
cmpsbl forge generate [spec]     # Generate artifact
```

### Ascension
```bash
cmpsbl ascension upload [file]   # Upload code for evolution
cmpsbl ascension status [id]     # Check discovery status
cmpsbl ascension export [id]     # Export artifact pack
```

### Diagnostics
```bash
cmpsbl health                    # Full diagnostic
cmpsbl nexus providers           # Provider fleet status
cmpsbl economy usage             # Usage metrics
cmpsbl audit recent              # Recent audit entries
```

---

## SDK Packages (11)

| Package | Tier | Purpose |
|---------|------|---------|
| `@cmpsbl/cli` | Free | Command-line interface |
| `@cmpsbl/sdk` | Free | Core SDK library |
| `@cmpsbl/types` | Free | TypeScript type definitions |
| `@cmpsbl/memory` | Studio | Memory operations |
| `@cmpsbl/agents` | Creator | Agent deployment and management |
| `@cmpsbl/ascension` | Creator | Ascension Engine integration |
| `@cmpsbl/cortex` | Architect | Pipeline orchestration |
| `@cmpsbl/nexus` | Architect | Provider routing |
| `@cmpsbl/forge` | Architect | Artifact manufacturing |
| `@cmpsbl/governance` | Governor | Governance controls |
| `@cmpsbl/evolution` | Governor | Evolution pipeline management |

---

## Access Tiers

Every user falls into one tier. Higher tiers inherit all permissions from lower:

```
Governor ⊇ Architect ⊇ Creator ⊇ Studio ⊇ Builder
```

| Tier | Terminal Commands | CLI Commands | Key Capabilities |
|------|-------------------|-------------|-----------------|
| **Builder** (Included) | ~45 (read-only) | 12 | Dashboard view, status, basic recall |
| **Studio** ($29) | ~120 | 24 | Terminal access, SDK templates, crystallization |
| **Creator** ($49) | ~280 | 38 | Ascension, agent deployment, DECODE Agent channel |
| **Architect** ($79) | ~450 | 52 | EVOLUTION Layer proposals, SHADOW Layer runs, mesh telemetry |
| **Enterprise** (Custom) | ~550 | 60 | Federated substrates, multi-agency, full mesh control |

---

## Substrate Terminal

The browser-based terminal provides full operating system control with ~600 commands. Every primitive exposes a canonical triad:

```
[primitive] status    — Health and operational state
[primitive] health    — Detailed diagnostics
[primitive] help      — Primitive-specific command reference
```

Plus specialized commands per primitive, gated by your access tier.

---

© 2025–2026 CMPSBL®. All rights reserved.
