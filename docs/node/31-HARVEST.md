# HARVEST — Data Acquisition & ETL Pipeline

> **Node ID:** `harvest` · **Sector:** EMZ (Expansion Manufacturing Zone) · **Generation:** 1 · **Node #31 of 40**
> **Codename:** *Reaper* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

HARVEST is the substrate's data acquisition engine. It owns web scraping, API polling, file ingestion, data normalization, and ETL pipeline orchestration. HARVEST feeds raw data to FORGE for artifact construction and to BRAIN for knowledge embedding.

---

## Capabilities

| Capability | Description |
|---|---|
| `scrape` | Extract structured data from web sources |
| `poll` | Periodically fetch data from external APIs |
| `ingest` | Process uploaded files into normalized records |
| `transform` | Apply ETL transformations to raw data |

---

## Architecture

### ETL Pipeline Model

```
┌─────────────────────────────────────────────────────────┐
│                    HARVEST Pipeline                      │
├─────────────────────────────────────────────────────────┤
│  EXTRACT          TRANSFORM           LOAD               │
│  ┌─────────┐     ┌─────────────┐     ┌─────────────┐    │
│  │ Scraper │────▶│ Normalizer  │────▶│ BRAIN embed │    │
│  │ Poller  │     │ Deduplicator│     │ FORGE build │    │
│  │ Ingester│     │ Validator   │     │ Storage     │    │
│  └─────────┘     └─────────────┘     └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Scraper Configuration

```typescript
interface ScrapeJob {
  id: string;
  url: string;
  selectors: Record<string, string>;  // CSS selectors
  schedule?: string;                   // Cron expression
  rateLimit: {
    requestsPerMinute: number;         // Default: 10
    respectRobotsTxt: boolean;         // Default: true
  };
  transform?: TransformRule[];
}
```

### Deduplication Algorithm

```
deduplicate(records[]):
  1. Compute content hash for each record:
     hash = SHA-256(JSON.stringify(sortKeys(record)))
  
  2. Check against bloom filter (1M capacity, 0.1% FPR)
  
  3. If bloom filter miss:
     - Insert hash into bloom filter
     - Check exact match in recent cache (LRU, 10K entries)
  
  4. Return: unique records only
```

---

## Trade Secrets

### 1. Politeness by Default

HARVEST respects `robots.txt` and enforces rate limits by default. This isn't just ethical — it prevents IP bans that would cripple data acquisition. The default 10 req/min is conservative but sustainable.

### 2. Content-Addressed Deduplication

Using SHA-256 hashes of sorted JSON ensures identical records are deduplicated regardless of field order in the source. The bloom filter provides O(1) first-pass filtering before the more expensive LRU cache check.

### 3. Schema Inference

When ingesting unknown file formats, HARVEST samples the first 100 records to infer schema types. This auto-generated schema is then validated against all records, flagging outliers for manual review.

```
inferSchema(sample[]):
  For each field across all records:
    - Count type occurrences (string, number, boolean, null, array, object)
    - Majority type (>80%) becomes field type
    - Mixed types → union type with validation warnings
```

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `high_duplicate_rate` | >30% duplicates in batch | Medium |
| `scrape_failures` | >5 consecutive failures | High |
| `rate_limit_hit` | External rate limit triggered | Medium |
| `schema_drift` | Inferred schema changed | Low |

---

## CLM Learning Priorities

1. **Source Reliability Scoring** — Learning which sources provide consistent, high-quality data
2. **Optimal Polling Frequency** — Balancing freshness against resource consumption

---

*CMPSBL® Substrate — HARVEST Node Deep Dive · Founder Eyes Only*
