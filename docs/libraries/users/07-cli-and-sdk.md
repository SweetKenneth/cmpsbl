# CLI & SDK

---

## Overview

CMPSBL provides three access surfaces:

| Tool | What It Is | Where It Runs |
|------|-----------|---------------|
| **Substrate Terminal** | Browser-based command console (~600 commands) | Browser (cmpsbl.com) |
| **CLI** | `@cmpsbl/cli` npm package (66 commands) | Developer's machine |
| **Mana** | `@cmpsbl/mana` npm package (7 commands) | Developer's machine |

---

## Installation

```bash
# CLI — terminal interface for the substrate
npm install -g @cmpsbl/cli

# Mana — Layer 2 attachment engine
npx mana attach
# (no global install needed — npx runs it directly)
```

## Authentication

```bash
# Option 1: Interactive login (recommended)
cmpsbl auth login

# Option 2: Environment variable
export CMPSBL_API_KEY=your_key_here

# Option 3: Register through Mana
npx mana attach
# → walks you through email registration → instant API key
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
cmpsbl ascend [file]             # Run Ascension on a file
cmpsbl ascension status [id]     # Check discovery status
cmpsbl ascension export [id]     # Export artifact pack
cmpsbl verify [fingerprint]      # Verify any fingerprint
```

### Diagnostics
```bash
cmpsbl health                    # Full diagnostic
cmpsbl nexus providers           # Provider fleet status
cmpsbl economy usage             # Usage metrics
cmpsbl audit recent              # Recent audit entries
```

---

## Mana Commands (7)

| Command | Description |
|---------|-------------|
| `mana attach` | Detect project, authenticate, activate Layer 2 |
| `mana status` | Show current layer status and active capabilities |
| `mana config` | View or change your activation level |
| `mana export` | Re-export the signal file |
| `mana detach` | Remove the secondary layer (code untouched) |
| `mana version` | Show version |
| `mana help` | Show help |

---

## Published npm Packages

| Package | Purpose | Status |
|---------|---------|--------|
| `@cmpsbl/cli` | Command-line interface (66 commands) | ✅ Published |
| `@cmpsbl/mana` | Layer 2 attachment engine | ✅ Published |
| `@cmpsbl/runtime` | Dual-layer runtime (bundled with CLI) | ✅ Published |

---

## Access Tiers

Every user falls into one tier. Higher tiers inherit all permissions from lower:

```
Enterprise ⊇ Architect ⊇ Creator ⊇ Studio ⊇ Builder
```

| Tier | Terminal Commands | CLI Commands | Key Capabilities |
|------|-------------------|-------------|-----------------|
| **Builder** (Free) | ~45 (read-only) | 12 | Dashboard view, status, basic recall |
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
