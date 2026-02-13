# 05. Accessibility Pipeline (INCLUSIVE Module)

**CMPSBL OS Substrate — Internal Engineering Library**

---

## The Blocking Secret

The INCLUSIVE module's power is **template blocking**. No template can be published unless it passes WCAG compliance. This is **enforced mathematically** through a weighted scoring system.

---

## The 4-Stage Pipeline

```
CRAWL → SCAN → ANALYZE → REPAIR
  │        │        │        │
  │        │        │        └─ Generate fix suggestions
  │        │        └─ WCAG 2.2 compliance check
  │        └─ DOM/ARIA inspection
  └─ Page discovery & rendering
```

### Stage 1: CRAWL

- Discover all pages in template
- Render JavaScript (full SPA support)
- Handle dynamic content
- Follow internal links

### Stage 2: SCAN

- Inspect DOM structure
- Check ARIA attributes
- Validate semantic HTML
- Test color contrast
- Check keyboard navigation

### Stage 3: ANALYZE

- Map issues to WCAG criteria
- Calculate severity
- Check against Level A, AA, AAA
- Generate compliance score

### Stage 4: REPAIR

- Generate fix suggestions
- Provide code snippets
- Prioritize by severity
- Track fix status

---

## The Weighted Scoring System

**This is the mathematical gate that enforces accessibility:**

```
score = 100 - (critical × 20) - (serious × 10) - (moderate × 5) - (minor × 1)
```

### Severity Levels

| Severity | Weight | Example Issues |
|----------|--------|----------------|
| **Critical** | -20 points | Missing alt text, no keyboard access |
| **Serious** | -10 points | Low contrast, missing form labels |
| **Moderate** | -5 points | Missing lang attribute, tabindex issues |
| **Minor** | -1 point | Redundant ARIA, minor spacing issues |

### Passing Threshold

```
Templates MUST achieve score >= 80 to pass

Examples:
- 0 critical, 0 serious, 0 moderate, 5 minor = 95 ✅
- 1 critical, 0 serious, 0 moderate, 0 minor = 80 ✅
- 1 critical, 1 serious, 0 moderate, 0 minor = 70 ❌
- 2 critical = 60 ❌ BLOCKED
```

---

## Template Blocking

Before any template is published:

1. INCLUSIVE module scans the rendered output
2. Critical violations (Level A failures) trigger `BLOCK` status
3. Template **cannot be published** until resolved
4. Each issue includes an automated repair suggestion

### Block Flow

```
Template submission
        │
        ▼
┌───────────────┐
│ CRAWL pages   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ SCAN for      │
│ issues        │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Calculate     │
│ score         │
└───────┬───────┘
        │
    ┌───┴───┐
    │       │
 Score<80  Score>=80
    │       │
    ▼       ▼
 BLOCKED   PASSED
    │       │
    ▼       ▼
 Return    Publish
 issues    template
```

---

## WCAG Criteria Checked

### Level A (Must Pass)

| Criterion | What We Check |
|-----------|---------------|
| 1.1.1 | Non-text content has alt text |
| 1.3.1 | Info and relationships in markup |
| 1.4.1 | Color not sole conveyor of info |
| 2.1.1 | Keyboard accessible |
| 2.4.1 | Bypass blocks (skip links) |
| 4.1.1 | Valid HTML parsing |
| 4.1.2 | Name, role, value for components |

### Level AA (Should Pass)

| Criterion | What We Check |
|-----------|---------------|
| 1.4.3 | Contrast ratio 4.5:1 minimum |
| 1.4.4 | Text resizable to 200% |
| 2.4.6 | Headings and labels descriptive |
| 2.4.7 | Focus visible |

---

## Repair Suggestions

Each violation generates a concrete fix:

```json
{
  "issue": "Image missing alt attribute",
  "element": "<img src='hero.jpg'>",
  "wcag": "1.1.1 Non-text Content (Level A)",
  "severity": "critical",
  "fix": "<img src='hero.jpg' alt='Descriptive text here'>",
  "explanation": "Screen readers cannot describe images without alt text"
}
```

### Fix Types

| Type | Description |
|------|-------------|
| **Attribute** | Add/modify HTML attribute |
| **Wrap** | Wrap element in new container |
| **Replace** | Replace element entirely |
| **CSS** | Adjust styling (contrast, spacing) |
| **ARIA** | Add accessibility attributes |

---

## Scan Commands

```bash
# Scan a URL
inclusive.scan https://example.com

# Get detailed report
inclusive.report <scan_id>

# Generate fixes
inclusive.fix <scan_id>
```

---

## Scan Results Storage

```
accessibility_scans table:
- id: Scan UUID
- domain: Scanned URL
- score: Calculated score (0-100)
- issues: JSON array of findings
- wcag_level: Target level (A, AA, AAA)
- scan_status: pending/complete/failed
- metadata: Additional context
```

---

## v8.5.0 Infrastructure Integration

### File Processing Pipeline
- **Location:** `src/lib/substrate/file-processing/`
- **Purpose:** CSV, JSON, Markdown, HTML ingestion with optional Brain routing
- **Functions:** `ingestFile()`, `getStatus()`, `getSupportedTypes()`
- **Tier:** Builder

### Capability Usage Analytics
- **Location:** `src/lib/substrate/capability-analytics/`
- **Purpose:** Usage tracking to identify high-value and dead-weight capabilities
- **Functions:** `trackUsage()`, `getSummary()`, `getTrends()`
- **Tier:** Builder

---

*CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch — Internal Engineering Library*
*© 2025-2026 PromptFluid®. All rights reserved.*
