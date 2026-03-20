# 07 — ATLAS Governance Hub

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## 1. What ATLAS Is

ATLAS (codename "Prometheus") is your primary governance and control surface — the dashboard where you review proposals, manage governance modes, supervise system state, and make decisions.

**Access path**: `/os` → Governor panels → ATLAS

---

## 2. Dashboard Tabs (7)

### 2.1 Inbox (Node Inbox)

Your primary approval surface.

| Feature | Description |
|---------|-------------|
| Proposal cards | Human-readable proposals from ENGINEER and other nodes |
| Approve/Reject | One-click governance decisions |
| Impact preview | Projected impact of approval |
| Batch actions | Approve or reject multiple proposals at once |
| Natural language | All proposals translated by INTENT Hub |

**Signal flow**: `Technical Signal (ENGINEER) → INTENT Hub Translation → Human-Readable Card → Your Inbox`

Translation includes: business impact assessment, risk level, recommended action, urgency classification.

### 2.2 Govern (Governance Mode Panel)

Manage the four system operating states: ACTIVE, OBSERVE, LOCKDOWN, EVOLVE.

See [02-governance-authority.md](02-governance-authority.md) for full mode details.

### 2.3 Command

Direct system command interface:
- Terminal-style input with 500+ commands
- Natural language parsing via DECODE
- Command history and autocomplete

### 2.4 Autonomy

Controls for autonomous capabilities:
- SEBA enable/disable
- CLM throttle adjustment
- Auto-training toggle
- Evolution velocity controls

### 2.5 Capabilities

Browse and manage 675+ registered capabilities:
- Enable/disable individual capabilities
- View health and usage metrics
- Manage capability synergies

### 2.6 Intel

INTEL Panel integration:
- IntelCards from all system nodes
- Signal filtering by source, category, severity
- Trend visualization
- Export reports

### 2.7 Audit

Compliance trail viewer:
- Immutable log with tamper-evident hashing
- Filter by entity, action, time range
- Chain-of-custody verification
- Export for compliance reporting

---

## 3. Marketplace

ATLAS includes the marketplace for:
- Agent (Cognitive) browsing and purchase
- Artifact Pack activation and management
- Subscription management
- Template selection for agency creation

---

## 4. Access Levels

| Level | Access |
|-------|--------|
| Public | None |
| Authenticated | Limited marketplace browsing |
| **Governor** | **Full governance surface** |

---

## 5. Key Metrics at a Glance

| Metric | Where | Healthy |
|--------|-------|---------|
| Weighted Matrix Integrity | `system.health_check` | ≥ 80 |
| Active module count | Dashboard → Modules | 40 |
| Circuit breakers open | `system.circuits` | 0 |
| Active cascades | `ripple.cascades` | 0 |
| Evolution confidence | `evolution.status` | ≥ 0.95 for auto |
| NEXUS provider fleet | `nexus.providers` | ≥ 10 healthy |
| Control plane mode | `cp.status` | Not degraded |
| Defense posture | `defense.posture` | Grade A or B |

---

© 2025–2026 PromptFluid®. Governor Eyes Only.
