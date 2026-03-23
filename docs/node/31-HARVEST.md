# HARVEST — Autonomous Data Supply Chain

> **Node ID:** `harvest` · **Sector:** EMZ (Expansion Manufacturing Zone) · **Generation:** 1 · **Node #31 of 40**
> **Codename:** *Reaper* · **Classification:** FOUNDER EYES ONLY
> **Ultimate Form:** v9.0.0 "Leviathan"

---

## Executive Summary

HARVEST is the substrate's autonomous data supply chain. It owns web scraping, API polling, file ingestion, data normalization, ETL pipeline orchestration, schema evolution tracking, multi-layer deduplication, quality assessment, anticipatory prefetching, and full data provenance. HARVEST feeds raw, validated data to FORGE for artifact construction and to BRAIN for knowledge embedding — proactively, before other nodes even request it.

---

## Ultimate Form — v9.0.0 "Leviathan"

### System Architecture

```
External Sources → Source Genome (ranking/profiling)
  ↓
Adaptive Crawler Swarm (parallel, rate-limited, thermal-aware)
  ↓
Schema Cartographer (drift detection + auto-migration)
  ↓
Deduplication Forge (bloom → MinHash → semantic)
  ↓
Quality Furnace (completeness, consistency, accuracy, timeliness)
  ↓
Pipeline Choreographer (DAG execution + checkpoint/resume)
  ↓
Provenance Ledger (hash-chained lineage)
  ↓
BRAIN / FORGE / MEMORY (downstream consumers)
  ↑
Freshness Oracle (decay-curve re-fetch scheduling)
Anticipatory Prefetch (intent-pattern prediction)
Harvest Telemetry (real-time observability)
```

---

## The 10 Ultimate Systems

### 1. Source Genome Registry

DNA-profiles every data source with reliability, freshness, schema stability, and cost-per-record — all tracked via EMA smoothing. Sources are auto-ranked and retired when reliability drops below 20% after 10+ fetches.

| Metric | Tracking |
|---|---|
| Reliability | EMA success rate per source |
| Freshness | Inversely proportional to fetch latency |
| Schema Stability | EMA of schema-unchanged fetches |
| Cost | EMA of milliseconds-per-record |
| Auto-Retirement | Reliability < 0.2 after 10 fetches |

### 2. Adaptive Crawler Swarm

Pool of virtual crawlers with independent rate limits, rotation strategies, and politeness profiles. Swarm scales based on thermal budget: full capacity when cool, minimum when critical.

- **Politeness Levels:** Respectful (10 RPM), Moderate (30 RPM), Aggressive (60 RPM)
- **Thermal Scaling:** Cool=100%, Warm=70%, Hot=40%, Critical=minimum
- **Auto-ban Detection:** Crawlers that trigger external bans are retired
- **User-Agent Rotation:** 3 substrate-branded agents

### 3. Schema Cartographer

Maps schema evolution over time, detects drift, and auto-generates migration transforms when sources change shape. Uses majority-type inference (>80%) across sample records.

- **Drift Severity Levels:** None, Minor (new fields), Major (3+ new fields), Breaking (removed/retyped)
- **Auto-Migration:** Generates add_field, remove_field, cast_field, rename_field operations
- **Sample Size:** First 200 records per snapshot

### 4. Deduplication Forge

Multi-layer deduplication: bloom filter for exact matches, MinHash for near-duplicate detection, with configurable Jaccard threshold (default 0.7).

```
Layer 1: Bloom Filter (100K capacity, 7 hash functions)
  ↓ miss
Layer 2: MinHash Signatures (64-hash, 3-shingle)
  ↓ below threshold
Layer 3: Pass as unique
```

### 5. Freshness Oracle

Predicts optimal re-fetch timing per source using decay curves. Automatically selects the best decay function based on observed churn patterns.

| Churn Rate | Decay Function | Poll Multiplier |
|---|---|---|
| > 0.7 (high) | Linear | 0.5× avg interval |
| 0.3–0.7 (medium) | Exponential | 0.7× avg interval |
| < 0.3 (low) | Logarithmic | 1.2× avg interval |

### 6. Quality Furnace

Scores every ingested batch on 4 dimensions with weighted composite scoring. Batches below the quarantine threshold (40%) are blocked from downstream consumption.

| Dimension | Weight | What It Measures |
|---|---|---|
| Completeness | 30% | Field presence vs expected |
| Consistency | 25% | Type uniformity across records |
| Accuracy | 25% | Placeholder/garbage detection |
| Timeliness | 20% | Data freshness (age in hours) |

### 7. Pipeline Choreographer

DAG-based ETL orchestration with topological stage ordering, parallel execution of independent stages, and automatic retry with exponential backoff.

- **Checkpoint/Resume:** Each stage can save checkpoint state
- **Auto-Retry:** Up to 3 retries per stage (configurable)
- **Cascade Skip:** Failed stages skip all downstream dependents
- **Parallel Execution:** Independent DAG branches run concurrently

### 8. Provenance Ledger

Hash-chained audit trail for every ingested record. Full data lineage: source, transforms applied, downstream consumers, with tamper-evident chain integrity verification.

- **Chain Validation:** Each entry hashes against previous entry
- **Transform Tracking:** Operation name, input/output hashes, timestamps
- **Consumer Tracking:** Which nodes consumed each record
- **Capacity:** 5,000 entries with FIFO eviction

### 9. Anticipatory Prefetch

Watches intent patterns from BRAIN, ORACLE, and CORTEX to predict data needs. Pre-fetches data before it's requested, turning HARVEST from reactive to proactive.

- **Pattern Learning:** EMA frequency + interval tracking per intent type
- **Confidence Gating:** Only prefetch when confidence ≥ 0.3
- **Cache TTL:** 5 minutes per prefetched result
- **Lead Time:** Begins prefetch 10 seconds before predicted need

### 10. Harvest Telemetry

Real-time observability across all HARVEST systems: ingestion rates, source health heatmaps, pipeline throughput, quality trends, and cost-per-record tracking.

- **Composite Health:** Weighted across quality, dedup rate, pipeline success, swarm utilization, chain integrity, prefetch hits
- **Source Heatmap:** Activity-level tracking per source with heat decay
- **Trend Detection:** Comparing recent vs historical quarters (improving/stable/degrading)

---

## Capabilities

| Capability | Description |
|---|---|
| `scrape` | Extract structured data from web sources |
| `poll` | Periodically fetch data from external APIs |
| `ingest` | Process uploaded files into normalized records |
| `transform` | Apply ETL transformations to raw data |
| `deduplicate` | Multi-layer deduplication (bloom + MinHash + semantic) |
| `assess_quality` | Score and quarantine low-quality batches |
| `trace_lineage` | Full provenance chain for any record |
| `prefetch` | Anticipatory data acquisition based on intent patterns |
| `map_schema` | Track schema evolution and auto-generate migrations |

---

## Trade Secrets

### 1. Politeness by Default
HARVEST respects `robots.txt` and enforces rate limits by default. The default 10 req/min is conservative but sustainable. The crawler swarm auto-scales down under thermal pressure.

### 2. Content-Addressed Deduplication
Using SHA-256 hashes of sorted JSON ensures identical records are deduplicated regardless of field order. The bloom filter provides O(1) first-pass filtering. MinHash catches near-duplicates that exact hashing misses.

### 3. Schema Inference with Drift Detection
When ingesting unknown formats, HARVEST samples the first 200 records to infer types. The Cartographer tracks schema changes over time and auto-generates migration transforms — no manual intervention needed.

### 4. Predictive Data Delivery
The Anticipatory Prefetch engine learns intent patterns across the substrate and pre-fetches data before it's needed. This converts HARVEST from a pull-based system to a push-based intelligence layer.

### 5. Tamper-Evident Provenance
Every record's journey is hash-chained. If any entry is modified, the chain integrity check fails — providing cryptographic assurance of data lineage authenticity.

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `high_duplicate_rate` | >30% duplicates in batch | Medium |
| `scrape_failures` | >5 consecutive failures | High |
| `rate_limit_hit` | External rate limit triggered | Medium |
| `schema_drift` | Breaking schema change detected | High |
| `quality_quarantine` | Batch quality < 40% | High |
| `chain_integrity_fail` | Provenance chain broken | Critical |
| `swarm_degradation` | Swarm efficiency < 30% | Medium |
| `prefetch_miss_rate` | Hit rate < 20% | Low |

---

## CLM Learning Priorities

1. **Source Reliability Scoring** — Learning which sources provide consistent, high-quality data
2. **Optimal Polling Frequency** — Balancing freshness against resource consumption via decay curves
3. **Schema Evolution Patterns** — Predicting when sources will change shape
4. **Prefetch Accuracy** — Improving intent-pattern prediction confidence over time
5. **Quality Threshold Calibration** — Adjusting quarantine thresholds based on downstream impact

---

*CMPSBL® Substrate — HARVEST Node Deep Dive · Founder Eyes Only*
