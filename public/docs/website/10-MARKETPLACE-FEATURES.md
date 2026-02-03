# Marketplace & Platform Features

**CMPSBL® — Build, Buy, and Deploy Cognitive Infrastructure**

---

## Overview

The CMPSBL platform provides three integrated marketplaces for building and deploying cognitive applications:

| Feature | Purpose | Access |
|---------|---------|--------|
| **CodeLab** | Live development environment | Free tier available |
| **Template Marketplace** | Pre-built cognitive patterns | Browse & purchase |
| **Capabilities Depot** | Downloadable cognitive artifacts | Licensed downloads |

---

## CodeLab

### What is CodeLab?

CodeLab is a **live, execution-first development environment** for building cognitive applications. Unlike demos or sandboxes, CodeLab runs real schedulers and cognition—no mock mode.

### Key Features

| Feature | Description |
|---------|-------------|
| **Live Execution** | Real substrate execution, not simulations |
| **Visual Builder** | Drag-and-drop workflow creation |
| **Instant Deploy** | Push to production in one click |
| **Full SDK Access** | All 14 modules available |
| **Synergy Testing** | Test cross-module pipelines |

### Who It's For

- **Developers** building cognitive applications
- **Researchers** exploring AI orchestration
- **Teams** evaluating CMPSBL for their stack

### Getting Started

```typescript
// CodeLab provides full SDK access
import { Substrate } from '@cmpsbl/sdk';

const substrate = new Substrate({
  projectId: 'your-project'
});

// Access any module
const memory = await substrate.brain.recall('context');
const analysis = await substrate.decode.understand(input);
```

---

## Template Marketplace

### What is the Template Marketplace?

The Template Marketplace offers **109+ production-ready cognitive patterns** that compress weeks of engineering into instant deployment.

### Template Tiers

| Tier | Templates | Value |
|------|-----------|-------|
| **Starter** | 30+ | 2-8 hours saved |
| **Pro** | 45+ | 8-24 hours saved |
| **Elite** | 34+ | 24-64+ hours saved |

### Template Categories

| Category | Examples |
|----------|----------|
| **Intelligence** | Decision engines, analysis pipelines |
| **Automation** | Workflow builders, task orchestrators |
| **Security** | Threat detection, compliance monitors |
| **Accessibility** | WCAG auditors, adaptive content |
| **Integration** | Multi-provider routers, API managers |

### Unique Identity System

Every template features:
- **Enchanted Title**: Evocative, deterministic naming
- **Rarity Badge**: Common to Mythic classification
- **Difficulty Rating**: Engineering complexity indicator
- **ROI Estimate**: Hours saved metric

### Template Structure

```
template-name/
├── manifest.json     # Configuration
├── README.md         # Integration guide
├── src/              # Template code
│   ├── index.ts      # Entry point
│   └── modules/      # Module configurations
├── tests/            # Validation tests
└── examples/         # Usage examples
```

### Integration

Templates integrate with BRAIN for persistent context and INCLUSIVE for accessibility auditing out of the box.

---

## Capabilities Depot

### What is the Capabilities Depot?

The Capabilities Depot is a marketplace for **downloadable cognitive artifacts**—licensed capabilities for local execution within your infrastructure.

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Artifacts, Not Services** | Download packages, not SaaS subscriptions |
| **Licensed Downloads** | Validated at download, no runtime checks |
| **Local Execution** | Runs in your infrastructure |
| **Full Control** | Your data stays with you |

### Capability Categories

| Category | Description | Count |
|----------|-------------|-------|
| **Intelligence** | Cognitive analysis, causal inference | 15+ |
| **Optimization** | Resource and cost management | 12+ |
| **Resilience** | Failure prediction, auto-remediation | 10+ |
| **Security** | Threat detection, compliance | 14+ |
| **Accessibility** | WCAG auditing, adaptive content | 8+ |
| **Automation** | SLA monitoring, workflows | 12+ |
| **Orchestration** | Multi-system coordination | 15+ |

### Pricing Tiers

| Tier | Price Range | Use Case |
|------|-------------|----------|
| **Utility** | $19 – $49 | Common tasks |
| **Advanced** | $99 – $299 | Complex workflows |
| **System-Level** | $499 – $999 | Production systems |
| **Flagship** | $1,499 – $2,999 | Enterprise coordination |

### Artifact Format

All capabilities follow a standard structure:

```
capability-name/
├── capability.json   # Manifest with metadata
├── README.md         # Integration docs
├── LICENSE.txt       # Commercial license
├── CHECKSUM          # SHA-256 verification
├── executor/         # Capability code
│   └── index.js      # Entry point
└── examples/         # Usage examples
```

### Capability Manifest

```json
{
  "name": "causal-inference",
  "version": "1.2.0",
  "category": "intelligence",
  "executorType": "js",
  "requiredModules": ["BRAIN", "DECODE"],
  "governanceLevel": "governed"
}
```

### Updates & Versioning

- View available updates for owned capabilities
- Download newer versions when available
- No auto-updates or forced upgrades
- Version comparison: "You own v1.2.0 – v1.3.1 available"

---

## How They Work Together

### Development Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  CodeLab    │───▶│  Templates  │───▶│ Capabilities│
│  (Build)    │    │  (Extend)   │    │  (Enhance)  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       └──────────────────┴──────────────────┘
                          │
                    ┌─────────────┐
                    │  Production │
                    │    Deploy   │
                    └─────────────┘
```

### Integration Example

```typescript
// Start with a template
import { loadTemplate } from '@cmpsbl/marketplace';

const workflow = await loadTemplate('intelligent-routing');

// Enhance with a capability
import { CausalInference } from './capabilities/causal-inference';

workflow.addCapability(CausalInference);

// Deploy from CodeLab
await workflow.deploy();
```

---

## Licensing & Terms

### Hybrid Model

CMPSBL uses a hybrid licensing model:

**API Tiers (Developer/Team/Research):**
- Hosted API access — no source code distribution
- We handle infrastructure, updates, and scaling
- Your data stays on our secure infrastructure

**Enterprise Tier ($49,999/year):**
- Full source code access for self-hosted deployment
- Air-gapped / on-premise deployment rights
- Complete infrastructure control

### Templates
- One-time purchase
- Unlimited deployments via API
- Source code for template configuration
- Updates available

### Capabilities
- Licensed download
- Executes via hosted API (API tiers) or local (Enterprise)
- No runtime license checks
- Version updates purchasable

### CodeLab
- Free tier with limits
- Pro tier for production
- Enterprise for self-hosted

---

## Support

For technical questions or integration help:
- **Documentation**: [docs.cmpsbl.com](https://docs.cmpsbl.com)
- **Support**: [/support](/support)
- **Email**: PromptFluid@gmail.com

---

## Next Steps

- [Getting Started](./06-GETTING-STARTED.md) — Begin building
- [Synergy Capabilities](./09-SYNERGY-CAPABILITIES.md) — Cross-module pipelines
- [Architecture](./05-ARCHITECTURE.md) — Technical deep-dive

---

*CMPSBL® Marketplace — Build Faster, Deploy Smarter*
