# INCLUSIVE Module — Human Compatibility Pipeline

**Version 6.3.0 | 14th Substrate Module**

---

## Module Metadata

| Field | Value |
|-------|-------|
| **Module ID** | INCLUSIVE |
| **Layer** | Human Compatibility |
| **Boot Order** | 14 (after System, before Defense) |
| **Version** | v6.3.0 |
| **Origin** | @origin(cmptbl) + @origin(clarity) |

---

## Purpose

The INCLUSIVE module provides a complete human-compatibility pipeline for the substrate. It ensures all outputs, interfaces, and generated content meet accessibility standards (WCAG 2.2) and inclusive design principles.

**INCLUSIVE was introduced in v6.0.0 and is now a first-class module** — it is not experimental or optional. All 14-module substrate deployments include INCLUSIVE as a core capability.

The module was created by migrating and normalizing archived CMPTBL/Clarity utilities, preserving their battle-tested accessibility logic while integrating them into the substrate lifecycle.

---

## Capabilities

### 1. Scan (`inclusive.scan`)
Scans a target (URL, HTML, or component) for accessibility issues.

```typescript
const result = await substrate.inclusive.scan("https://example.com");
// Returns: { target, issues, severity, score, metadata }
```

### 2. Repair (`inclusive.repair`)
Automatically repairs detected accessibility issues.

```typescript
const result = await substrate.inclusive.repair("https://example.com");
// Returns: { target, repairs, severity, score, metadata }
```

### 3. Validate (`inclusive.validate`)
Validates a target against WCAG 2.2 compliance.

```typescript
const result = await substrate.inclusive.validate("<html>...</html>");
// Returns: { target, isValid, issues, score, metadata }
```

### 4. Profile (`inclusive.profile`)
Creates accessibility profiles for users/contexts.

```typescript
const result = await substrate.inclusive.profile({ userId: "123" });
// Returns: { context, profile, recommendations, metadata }
```

### 5. Report (`inclusive.report`)
Generates detailed compliance reports.

```typescript
const result = await substrate.inclusive.report("https://example.com");
// Returns: { target, summary, details, recommendations, score }
```

### 6. Self-Scan (`inclusive.selfScan`)
Scans the substrate's own interfaces for accessibility issues.

```typescript
const result = await substrate.inclusive.selfScan();
// Returns: { target: "substrate", issues, score, metadata }
```

---

## Output Schema

All INCLUSIVE actions return a standardized JSON schema:

```json
{
  "target": "string",
  "issues": [
    {
      "id": "string",
      "type": "contrast|focus|aria|semantic|...",
      "severity": "low|medium|high|critical",
      "message": "string",
      "selector": "string",
      "wcagCriteria": "1.4.3",
      "recommendation": "string"
    }
  ],
  "severity": "low|medium|high|critical",
  "repairs": [],
  "score": 0-100,
  "metadata": {
    "scanDuration": "number",
    "rulesApplied": "number",
    "wcagLevel": "A|AA|AAA"
  }
}
```

---

## Substrate Integration

### Lifecycle Position
INCLUSIVE is positioned between SYSTEM and DEFENSE in the boot sequence:

```
CORE → BRAIN → DECODE → SYSTEM → INCLUSIVE → DEFENSE → ...
```

### Module Connections

| Module | Integration |
|--------|-------------|
| **BRAIN** | Store findings, repairs, regressions, profiles |
| **MODERNIZER** | Recurring violations become upgrade proposals |
| **DEFENSE** | High severity issues can trigger risk blocks |
| **CORTEX** | Longitudinal pattern recognition |
| **SYSTEM** | Configuration and status reporting |
| **ACCESS** | Permission enforcement |

---

## Template Pipeline Integration

All templates must pass through the INCLUSIVE pipeline before approval:

```
Template Generation → inclusive.scan → inclusive.repair → inclusive.validate → Approval
```

Templates with critical accessibility issues are blocked from marketplace publication.

---

## Terminal Commands

```bash
# Scan a target
inclusive.scan https://example.com

# Self-scan the substrate
inclusive.self_scan

# Repair issues
inclusive.repair https://example.com

# Validate compliance
inclusive.validate https://example.com

# Generate report
inclusive.report https://example.com

# Check regressions
inclusive.regressions

# Check template coverage
inclusive.coverage
```

---

## Permissions (ACCESS Matrix)

| Role | Capabilities |
|------|-------------|
| **governor** | Full access: scan, repair, apply, global |
| **operator** | Scan and report only |
| **observer** | Report read-only |

---

## Related Documentation

- [02-SYSTEM-ARCHITECTURE.md](./02-SYSTEM-ARCHITECTURE.md) — Full architecture overview
- [20-SYSTEM-MODULE.md](./20-SYSTEM-MODULE.md) — System administration
- [16-DEFENSE-MODULE.md](./16-DEFENSE-MODULE.md) — Security perimeter

---

*CMPSBL OS Substrate v6.0.0 — Human Compatibility Era*
*© 2025-2026 PromptFluid®. All rights reserved.*
