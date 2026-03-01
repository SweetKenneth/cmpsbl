# CMPSBL® Library 13 — MEMORY Module

**Epoch:** CONTRACT (V13)  
**Classification:** Internal  
**Author:** Kenneth E. Sweet Jr.  
**Date:** 2026-02  

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Library ID** | CMPSBL-LIB-013 |
| **Module** | MEMORY |
| **Sector** | CCR (Clockless Cognitive Reality) |
| **Codename** | Vault |
| **Weight** | 0.050 (5%) |
| **Boot Order** | 4 |

---

## 1. Purpose

MEMORY is the persistent tiered storage system with SM-2 spaced repetition integration and multi-strategy recall. It manages the complete memory lifecycle from ingestion through retrieval.

---

## 2. Memory Architecture

### 2.1 Tiers

| Tier | Description | Access Pattern |
|------|-------------|---------------|
| `hot` | Active, high-access memories | Frequent reads |
| `warm` | Aging, moderate access | Periodic reads |
| `cold` | Archive, low access | Rare reads |

### 2.2 Auto-Tiering Algorithm

```
hot → warm:   access_count < threshold AND age > 24h
warm → cold:  access_count == 0 AND age > 7d
cold → evict: age > 30d AND importance_score < 0.3

Promotion:
  cold → warm: any access triggers promotion
  warm → hot:  3+ accesses in 24h window
```

### 2.3 Memory Types

`doctrine`, `reflection`, `preference`, `conversation`, `dream`, `general`, `insight`, `template`, `heuristic`, `error_pattern`, `doctrine_integrated`

---

## 3. Lifecycle

```
Ingest → Store → Index → Reflect → Retrieve
```

Each stage is independently monitored and can fail without cascading to other stages.

---

## 4. Key Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `ingest()` | `(content, options?) → Promise<LifecycleResult>` | Ingest new content |
| `store()` | `(entry: MemoryEntry) → Promise<LifecycleResult>` | Store a memory entry |
| `index()` | `(memoryId: string) → Promise<LifecycleResult>` | Index for retrieval |
| `reflect()` | `(options?) → Promise<LifecycleResult>` | Run reflection cycle |
| `retrieve()` | `(query: MemoryQuery) → Promise<LifecycleResult>` | Retrieve memories |

---

## 5. Retrieval Strategies

| Strategy | Description |
|----------|-------------|
| `fulltext` | Full-text search across content |
| `semantic` | Meaning-based similarity matching |
| `pattern` | Pattern recognition in memory structures |
| `hybrid` | Combined fulltext + semantic + pattern |

---

## 6. Importance Scoring

```
importance = (confidence × 0.4) + (access_frequency × 0.3) + (recency_score × 0.2) + (tag_relevance × 0.1)
```

Importance scores drive tiering decisions and retrieval ranking.

---

## 7. Spaced Repetition (SM-2)

MEMORY integrates the SM-2 algorithm for long-term retention:

- Memories scheduled for review based on difficulty and interval
- Successful recalls extend intervals; failures shorten them
- Integrated with CLM for continuous memory reinforcement

---

© 2025–2026 PromptFluid®. All rights reserved.
