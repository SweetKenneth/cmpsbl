# HARVEST — Ultimate Architecture (v9.0.0 "Cultivator")

**Primitive:** #31 — HARVEST  
**Category:** FIELDS (Field Intelligence)  
**Weight:** 0.020  
**Classification:** 🔒 INTERNAL  
**Last Updated:** 2026-03-23

---

## 1. Purpose

HARVEST is the substrate's **data extraction, web crawling, and intelligence gathering engine**. It collects structured data from external sources, processes raw content into actionable intelligence, and feeds enriched datasets to BRAIN and MEMORY for knowledge expansion.

---

## 2. Core Engines

### 2.1 Web Crawler
- Respectful crawling with robots.txt compliance
- Rate-limited per domain to prevent abuse
- Handles: HTML, JSON, RSS, sitemaps, and structured data (JSON-LD, microdata)

### 2.2 Data Extraction Pipeline
- CSS selector and XPath-based content extraction
- Schema-driven extraction for structured output
- Handles pagination, infinite scroll, and dynamic content

### 2.3 Content Enrichment Engine
- Entity recognition, keyword extraction, and topic classification
- Sentiment analysis on harvested content
- Duplicate detection via content fingerprinting

### 2.4 Source Quality Scorer
- Evaluates source reliability based on historical accuracy
- Tracks freshness, consistency, and availability
- Deprioritizes low-quality or unreliable sources

### 2.5 Intelligence Feed Manager
- Manages continuous monitoring feeds for tracked topics
- Change detection with configurable sensitivity
- Delivers enriched intelligence to BRAIN's knowledge ingestion pipeline

---

## 3. ADA Integration

HARVEST operates within the `pattern-detection` domain:
- **Autonomy threshold:** 65%
- **Rate limit:** 60 decisions/hr
- **DREAM allowed:** ✓
- **Allowed actions:** extract-pattern, classify-trend, emit-observation, score-novelty, index-discovery, correlate-events, track-regression, snapshot-state, alert-anomaly

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-23 | System | Ultimate architecture documentation |

---

© 2025–2026 CMPSBL®. Confidential.
