# 22 — S-Tier Vault Internals

**Classification:** 🔒 INTERNAL — Trade Secret  
**Version:** v13.1.0 — IRONCLAD Epoch

---

## 1. Purpose

This document covers the internal architecture of the S-Tier Vault — the admin-only repository of validated Crown Jewel discoveries. The Vault is a Crown Jewel itself: its architecture, data model, and export capabilities are never exposed publicly.

## 2. Access Control

| Level | Access |
|-------|--------|
| Public | None — no public API, no public route |
| Authenticated users | None — not visible in user navigation |
| Admin (Governor) | Full access at `/admin/s-tier-vault` |
| System (Internal) | Write access via discovery reactor |

Route protection: `AdminRoute` wrapper component with role verification.

## 3. Data Architecture

### 3.1 Primary Table: `crown_jewel_discoveries`

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Primary key |
| name | text | Human-readable discovery name |
| description | text | Detailed description |
| module_chain | text[] | Ordered list of contributing modules |
| cjpi_score | numeric(5,2) | 0–100 composite score |
| tier | text | S, A, B, C, or D |
| category | text | Functional grouping |
| status | text | discovered, validated, promoted, archived |
| discovered_at | timestamptz | When the reactor found it |
| promoted_at | timestamptz | When promoted to production registry |
| metadata | jsonb | Additional scoring factors, variant refs |

### 3.2 Supporting Tables

| Table | Purpose |
|-------|---------|
| `crown_jewel_mining_runs` | Tracks reactor execution history |
| `crown_jewel_tier_stats` | Aggregated tier distribution snapshots |

## 4. Vault UI Components

### 4.1 Registry Tab

- Paginated list of all discoveries
- Real-time search across name, description, and module chain
- Tier badge filtering (S/A/B/C/D)
- Module filtering
- Score range slider
- Inline detail expansion

### 4.2 Analytics Tab

- Tier distribution chart (donut)
- Discovery rate over time (line)
- Module frequency heatmap
- Cross-zone chain analysis
- CJPI score distribution histogram

### 4.3 Export System

Three export formats:

1. **JSON manifest** — Complete discovery data with all metadata
2. **ZIP package** — JSON manifest + standalone runtime + standalone discovery engine + README
3. **Filtered export** — Export only discoveries matching current filter state

ZIP structure:
```
cmpsbl-vault-export-{timestamp}/
├── manifest.json
├── _discovery-engine/
│   ├── standalone-runtime.ts
│   ├── standalone-discovery-engine.ts
│   └── README.md
└── metadata.json
```

### 4.4 Verification Panel

Provides independently verifiable proof:
- Total discovery count (live from database)
- Tier distribution percentages
- SHA-256 hash of the full manifest
- Last reactor run timestamp
- RLS enforcement confirmation

## 5. Universal Export Adapter

The adapter (`src/lib/export/universal-adapter.ts`) can export any discovery to 25 targets:

### 5.1 Software Languages (18)
TypeScript, Python, Go, Rust, Java, C#, Ruby, PHP, Swift, Kotlin, Elixir, Lua, C, C++, Dart, Zig, Scala, Haskell

### 5.2 Hardware/HDL Targets (7)
VHDL, Verilog, SystemVerilog, Chisel, SpinalHDL, Clash, Amaranth

### 5.3 Export Process
1. Read discovery manifest entry
2. Map module chain to target language primitives
3. Generate language-specific scaffold with CJPI metadata
4. Package with build configuration (Makefile, package.json, Cargo.toml, etc.)
5. Include standalone runtime in target language (TypeScript only for now, others generate stubs)

## 6. Security Measures

- All vault queries use RLS with admin role check
- Export downloads are audit-logged
- ZIP exports include license file asserting proprietary rights
- No vault data is included in public API responses
- Discovery reactor writes use service-role credentials

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Initial S-Tier Vault internals — v13.1.0 |

---

© 2025–2026 PromptFluid®. Confidential — Trade Secret.
