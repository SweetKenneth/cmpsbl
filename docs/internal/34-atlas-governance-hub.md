# 34 — ATLAS v2.0.0 (Prometheus) Governance Hub

**Classification:** 🔒 INTERNAL  
**Version:** v13.1.0 — IRONCLAD Epoch

---

## 1. Purpose

ATLAS (codename "Prometheus") is the substrate's primary governance and human-in-the-loop approval interface. It serves as the governor's control surface — the place where system proposals are reviewed, governance modes are managed, and system state is supervised.

## 2. Architecture

### 2.1 Position

ATLAS is an Execution-tier module that bridges the Control Plane (ENGINEER, INTEL) with human decision-making:

```
ENGINEER → INTEL → ATLAS → Governor Decision → System Action
```

### 2.2 Core Implementation

ATLAS manages:
- Capability gating and feature flags
- The governance mode state machine
- Human approval workflows
- The marketplace interface

## 3. Dashboard Tabs (7)

### 3.1 Inbox

The **Node Inbox** (`NodeInboxView`) is the primary approval surface:

| Feature | Description |
|---------|-------------|
| Proposal cards | Human-readable proposals from ENGINEER and other nodes |
| Approve/Reject | One-click governance decisions |
| Impact preview | Shows projected impact of approval |
| Batch actions | Approve or reject multiple proposals |
| Natural language | All proposals translated from technical signals by INTENT Hub |

### 3.2 Govern

The **Governance Mode Panel** (`GovernanceModePanel`) manages four system states:

| Mode | Description | Behavior |
|------|-------------|----------|
| ACTIVE | Normal operation | All systems running, evolution enabled |
| OBSERVE | Read-only monitoring | No mutations, no promotions, observation only |
| LOCKDOWN | Emergency containment | Critical operations only, evolution frozen |
| EVOLVE | Accelerated evolution | Increased mutation velocity, reduced governance friction |

Mode transitions:
- ACTIVE → OBSERVE (manual)
- ACTIVE → LOCKDOWN (manual or automatic on critical alert)
- ACTIVE → EVOLVE (manual, requires governor confirmation)
- LOCKDOWN → ACTIVE (manual, requires health verification)
- EVOLVE → ACTIVE (manual or automatic after evolution target met)

### 3.3 Command

Direct system command interface:
- Terminal-style command input
- Natural language command parsing (via DECODE)
- Command history and autocomplete
- 500+ terminal commands available

### 3.4 Autonomy

Controls for the substrate's autonomous capabilities:
- SEBA enable/disable
- CLM throttle adjustment
- Auto-training toggle
- Evolution velocity controls

### 3.5 Capabilities

Capability management surface:
- Browse 675+ registered capabilities
- Enable/disable individual capabilities
- View capability health and usage metrics
- Manage capability synergies

### 3.6 Intel

INTEL Panel integration:
- IntelCards from all system nodes
- Signal filtering by source, category, severity
- Trend visualization
- Export reports

### 3.7 Audit

Compliance trail viewer:
- Immutable audit log with tamper-evident hashing
- Filter by entity, action, time range
- Chain-of-custody verification
- Export for compliance reporting

## 4. Marketplace Features

ATLAS includes the marketplace for:
- Agent (Cognitive) browsing and purchase
- Artifact Pack activation and management
- Subscription management
- Template selection for agency creation

## 5. Access Control

| Level | Access |
|-------|--------|
| Public | None |
| Authenticated | Limited marketplace browsing |
| Admin (Governor) | Full governance surface |

## 6. INTENT Hub Integration

All proposals arriving in the Inbox have been translated by the INTENT Hub:

```
Technical Signal (ENGINEER) → INTENT Hub Translation → Human-Readable Card → ATLAS Inbox
```

Translation includes:
- Business impact assessment
- Risk level explanation
- Recommended action
- Urgency classification

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Initial ATLAS v2 (Prometheus) documentation — v13.1.0 |

---

© 2025–2026 CMPSBL®. Confidential.
