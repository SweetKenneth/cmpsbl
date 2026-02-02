# Capabilities Depot

**CMPSBL® Substrate — Downloadable Cognitive Artifacts**

---

## What is the Capabilities Depot?

The Capabilities Depot is a marketplace for purchasing and downloading licensed cognitive capabilities for the CMPSBL Substrate. Unlike SaaS offerings, these are **downloadable artifacts** designed for local execution within your own infrastructure.

---

## Key Principles

### 1. Artifacts, Not Services
- Capabilities are delivered as downloadable packages (zip, tar, npm, wasm, container)
- No cloud execution, hosting, or managed services
- All processing happens locally in your environment

### 2. Licensed Downloads
- Purchase grants download access to the capability artifact
- License validated at download time only
- No runtime license checks after download

### 3. Self-Managed Execution
- You are responsible for deployment, execution, and maintenance
- No background jobs, callbacks, or telemetry from us
- Full control over your data and infrastructure

### 4. UNSUPPORTED Policy
All capabilities are sold AS-IS with:
- No technical support
- No warranty
- No maintenance guarantees
- No SLA or uptime commitments

---

## Capability Categories

| Category | Description |
|----------|-------------|
| **Intelligence** | Cognitive analysis, causal inference, pattern detection |
| **Optimization** | Resource optimization, cost management, capacity planning |
| **Resilience** | Failure prediction, chaos testing, auto-remediation |
| **Security** | Threat prediction, compliance automation, defense |
| **Accessibility** | WCAG auditing, accessibility scanning |
| **Automation** | SLA monitoring, resource contention, workflow automation |

---

## Pricing Tiers

| Tier | Price Range | Description |
|------|-------------|-------------|
| **Utility** | $19 – $49 | Essential capabilities for common tasks |
| **Advanced** | $99 – $299 | Sophisticated capabilities for complex workflows |
| **System-Level** | $499 – $999 | Deep integration for production systems |
| **Flagship** | $1,499 – $2,999 | Enterprise-grade, multi-system coordination |

---

## How Downloads Work

### Purchase Flow
1. Browse capabilities at `/capabilities`
2. Select a capability and click "Buy"
3. Complete checkout via Stripe
4. Receive download access immediately

### Downloading
1. Navigate to your purchased capabilities
2. Click "Download" to get the latest version
3. Artifact downloads as a package (zip/tar/npm/wasm/container)
4. Extract and integrate into your infrastructure

### Updates
- View available updates for owned capabilities
- Download newer versions when available
- No auto-updates or forced upgrades
- Compare versions: "You own v1.2.0 – v1.3.1 available"

---

## Artifact Structure

All capability artifacts follow a standard layout:

```
capability-name/
├── capability.json    # Manifest with metadata
├── README.md          # Integration documentation
├── LICENSE.txt        # Commercial license terms
├── CHECKSUM           # SHA-256 verification
├── executor/          # Capability code
│   └── index.js       # Entry point
├── examples/          # Usage examples (optional)
└── docs/              # Additional docs (optional)
```

---

## Legal Terms

### NO SUPPORT
Capabilities are sold without any technical support, maintenance, or bug fix commitments.

### NO WARRANTY
There is no warranty of any kind, express or implied.

### NO HOSTING
Capabilities are not hosted, executed, or managed by PromptFluid. All execution responsibility lies with the licensee.

### LOCAL EXECUTION ONLY
All capabilities are designed for local execution within your infrastructure.

### NO REFUNDS
Due to the nature of digital downloads, all sales are final.

---

## Contact

For enterprise licensing inquiries:
- **Email:** PromptFluid@gmail.com
- **Web:** https://cmpsbl.com/capabilities

---

*CMPSBL® Capabilities Depot — v1.0.0*
