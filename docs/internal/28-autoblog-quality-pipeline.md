# 28 — AutoBlog Quality Pipeline

**Classification:** 🔒 INTERNAL  
**Version:** v13.1.0 — IRONCLAD Epoch

---

## 1. Purpose

The AutoBlog system is the substrate's autonomous content generation and publishing pipeline. It generates, scores, reviews, and publishes blog content with minimal human intervention, governed by quality gates that prevent low-quality content from reaching production.

## 2. Architecture (v5.0.0)

### 2.1 Pipeline Flow

```
Topic Seed → Generation → Confidence Scoring → Contradiction Check → Split Brain Review → Assumption Labeling → Governor Review → Publish/Reject
```

### 2.2 Database Model

| Table | Purpose |
|-------|---------|
| `auto_blog_posts` | Primary content storage with all quality metadata |
| `auto_blog_schedule` | Scheduled generation queue |
| `autoblog_publish_governor_state` | Governor-level publish controls |
| `autoblog_confidence_weights` | Tunable scoring weights |
| `autoblog_topic_seeds` | Topic seed pool |

## 3. Quality Engines

### 3.1 Confidence Engine

Multi-factor scoring that produces a 0–100 confidence score:

| Factor | Weight | Description |
|--------|--------|-------------|
| Factual accuracy | 0.30 | Cross-reference against knowledge base |
| Writing quality | 0.25 | Grammar, structure, readability |
| Topic relevance | 0.20 | Alignment with seed topic and brand voice |
| Novelty | 0.15 | Original perspective vs. existing content |
| SEO alignment | 0.10 | Keyword density, meta quality, structure |

Stored in `confidence_factors` (JSONB) on each post.

### 3.2 Contradiction Engine

Adversarial quality gating:
- Scans generated content for internal contradictions
- Cross-references against existing published posts
- Produces a `contradiction_score` (0–100, lower is better)
- `contradiction_outcome`: pass, warn, or fail

### 3.3 Split Brain Evaluation

Dual-perspective review model:

| Reviewer | Role | Score Field |
|----------|------|-------------|
| Reader | Evaluates from a consumer perspective | `split_brain_reader_score` |
| Skeptic | Challenges claims, finds weaknesses | `split_brain_skeptic_score` |

Decision logic:
```
if reader_score >= 70 AND skeptic_score >= 60:
  decision = "publish"
elif reader_score >= 60 AND skeptic_score >= 50:
  decision = "review"  # Human review required
else:
  decision = "reject"
```

Stored as `split_brain_decision` on each post.

### 3.4 Assumption Labeler

Tracks implicit premises in generated content:
- Extracts assumptions from each post
- Monitors assumption validity over time
- Flags posts whose assumptions may have become invalid
- `assumptions_extracted` boolean tracks labeling completion

### 3.5 Semantic Drift Detection

Monitors how content evolves away from core brand messaging:

| Field | Description |
|-------|-------------|
| `semantic_drift_score` | 0–100 measure of drift from baseline |
| `drift_direction` | Which direction content is drifting |
| `epistemic_status` | Confidence in the post's knowledge claims |

## 4. Adaptive Publishing Governance

The publish governor (`autoblog_publish_governor_state`) controls:
- Global publish rate limits
- Category-specific quotas
- Quality floor enforcement (minimum confidence for auto-publish)
- Manual review queue for borderline content

## 5. Monthly Memory Compression

Every 30 days:
1. Aggregates lessons learned from published vs. rejected content
2. Distills patterns into refined parameters
3. Updates `autoblog_confidence_weights` autonomously
4. Archives raw scoring data older than 90 days

## 6. Content Metadata

Each post carries rich metadata:

| Field | Purpose |
|-------|---------|
| `experience_tags` | Contextual tags from generation |
| `word_count` | Length tracking |
| `image_count` | Visual content density |
| `internal_links_count` | Cross-linking density |
| `author_name` / `author_role` | Attribution |
| `topic_seed` | Originating seed reference |

## 7. Review Flow

```
status: draft → review → published | rejected
review_status: pending → approved | rejected
```

Posts can be reviewed manually (`reviewed_by`, `reviewed_at`) or auto-approved when confidence exceeds the governor threshold.

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Initial AutoBlog quality pipeline documentation — v13.1.0 |

---

© 2025–2026 CMPSBL®. Confidential.
