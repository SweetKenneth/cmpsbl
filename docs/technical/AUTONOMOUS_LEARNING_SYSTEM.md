# PromptFluid Autonomous Learning System

## Overview

The PromptFluid ecosystem now features a **fully autonomous learning system** that continuously improves itself through every API interaction. The Brain learns from real-world usage, optimizes routing decisions, and adapts to provide the best performance and cost efficiency.

---

## Core Components

### 1. **Learning Buffer** (`pf_learning_buffer`)
- Captures every API interaction across text, image, and video generation
- Stores request payload, response summary, success status, latency, and cost
- Acts as the raw data input for the Brain's learning cycles

### 2. **Brain Vectors** (`pf_brain_vectors`)
- Converts learning data into embeddings for pattern recognition
- Each vector tagged with context type (text, visual, motion, behavior)
- Enables semantic understanding of what works best in different scenarios

### 3. **Model Statistics** (`pf_model_stats`)
- Real-time performance metrics for each AI provider
- Tracks average latency, cost, success rate, and total calls
- Updated continuously as new data flows in

### 4. **Routing Rules** (`pf_routing_rules`)
- Dynamic provider preferences per API type
- Automatically updated based on cost-to-quality analysis
- Includes fallback chains and cost thresholds

### 5. **Learning Cycles** (`pf_learning_cycles`)
- Scheduled optimization runs every 3 hours
- Analyzes performance data and updates routing rules
- Tracks events processed, rules updated, and insights generated

### 6. **Feedback System** (`pf_output_feedback`)
- Users can rate AI outputs (1-5 stars)
- Feedback directly influences provider selection
- Creates human-in-the-loop quality control

---

## How It Works

### Data Capture Pipeline

Every API call flows through this learning pipeline:

1. **Request Made** → User calls text/image/video generation API
2. **Trace ID Generated** → Unique identifier for tracking (`txt_*`, `img_*`, `vid_*`)
3. **Processing** → Request routed to optimal provider based on current rules
4. **Response Logged** → Success/failure, latency, cost captured
5. **Learning Buffer** → Data stored for future analysis
6. **Immediate Stats Update** → Model statistics incremented

### Learning Cycle (Every 3 Hours)

```
┌─────────────────────────────────────┐
│  1. Fetch Learning Buffer Data     │
│     (last 3 hours)                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Group by Provider & API Type    │
│     Calculate avg cost, latency,    │
│     success rate                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Update Model Statistics         │
│     Store aggregated metrics        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Generate Embeddings             │
│     Convert successful outputs to   │
│     vectors for pattern recognition │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. Log to Brain Events             │
│     Record cycle completion         │
└─────────────────────────────────────┘
```

### Optimization Cycle (Every 3 Hours)

```
┌─────────────────────────────────────┐
│  1. Fetch Model Statistics          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Calculate Cost-to-Quality Score │
│     score = (success_rate / cost)   │
│           × (1000 / latency)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Rank Providers per API Type     │
│     Best score → Preferred provider │
│     Others → Fallback chain         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Update Routing Rules            │
│     Automatically switch to optimal │
│     providers                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. Analyze User Feedback           │
│     Weight provider selection by    │
│     user ratings                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. Store Insights in Brain Memory  │
└─────────────────────────────────────┘
```

---

## Edge Functions

### `/pf-brain-learn`
**Purpose:** Processes learning buffer and generates insights

**Trigger:** Manual or scheduled (every 3 hours)

**Actions:**
- Fetches recent learning buffer entries
- Groups data by provider and API type
- Updates model statistics
- Generates embeddings for pattern recognition
- Logs completion to brain events

**Response:**
```json
{
  "success": true,
  "events_processed": 1247,
  "providers_analyzed": 12,
  "vectors_created": 50,
  "stats": { ... }
}
```

### `/pf-brain-optimize`
**Purpose:** Optimizes routing rules based on performance data

**Trigger:** Manual or scheduled (every 3 hours)

**Actions:**
- Analyzes model statistics
- Calculates cost-to-quality scores
- Updates routing preferences
- Integrates user feedback
- Stores optimization insights

**Response:**
```json
{
  "success": true,
  "cycle_id": "uuid",
  "rules_updated": 3,
  "optimizations": {
    "text": { "preferred_provider": "groq", ... },
    "image": { "preferred_provider": "together", ... },
    "video": { "preferred_provider": "luma", ... }
  }
}
```

### `/pf-learning-feedback`
**Purpose:** Submit user feedback on AI outputs

**Method:** POST

**Auth:** Required

**Body:**
```json
{
  "trace_id": "txt_1234567890_abc123",
  "api_type": "text",
  "provider": "groq",
  "rating": 5,
  "feedback_text": "Excellent quality response"
}
```

**Response:**
```json
{
  "success": true,
  "feedback": { ... }
}
```

---

## UI Dashboard

### Brain Learning Page (`/brain-learning`)

**Features:**
- Live learning cycle status
- Model performance metrics
- Recent optimization history
- Manual learning/optimization triggers
- Provider comparison charts

**Quick Actions:**
- Run Learning Cycle
- Run Optimization
- View Detailed Insights

---

## Trace IDs

Every API response now includes a `trace_id`:

- **Text Generation:** `txt_1704123456789_abc123`
- **Image Generation:** `img_1704123456789_def456`
- **Video Generation:** `vid_1704123456789_ghi789`

Users can use these IDs to:
- Submit feedback on specific outputs
- Track request flow through the system
- Debug issues with specific generations

---

## Automatic Improvements

### What Gets Optimized

1. **Provider Selection**
   - Automatically switches to cheaper providers with equal quality
   - Fallback chains reorganized based on success rates
   - Cost thresholds adjusted dynamically

2. **Prompt Patterns**
   - (Future) Brain learns which prompt structures work best
   - (Future) Auto-suggests prompt improvements
   - (Future) Compression techniques for token efficiency

3. **Caching Strategy**
   - (Future) Identifies frequently requested patterns
   - (Future) Pre-generates common outputs
   - (Future) Adjusts TTL based on usage patterns

4. **Error Recovery**
   - Learns which providers fail for specific input types
   - Automatically excludes unreliable providers
   - Adapts retry strategies based on past failures

---

## Feedback Loop

### How User Ratings Impact Routing

When a user rates an output:

1. Feedback stored with `trace_id` linking to original request
2. Provider associated with that request gets weighted
3. Optimization cycle incorporates rating into cost-to-quality score
4. Future requests favor higher-rated providers

**Formula:**
```
adjusted_score = base_score × (1 + (avg_rating - 3) × 0.2)
```

This means:
- 5-star rating → +40% score boost
- 4-star rating → +20% score boost
- 3-star rating → no change
- 2-star rating → -20% score penalty
- 1-star rating → -40% score penalty

---

## Database Schema

### `pf_learning_buffer`
```sql
id              UUID PRIMARY KEY
api_type        TEXT NOT NULL (text/image/video)
provider        TEXT NOT NULL (groq/stability/luma/etc)
request_payload JSONB (prompt, params)
response_summary JSONB (output metadata)
success         BOOLEAN DEFAULT true
latency         INTEGER (milliseconds)
cost            NUMERIC
trace_id        TEXT (unique identifier)
created_at      TIMESTAMPTZ DEFAULT now()
```

### `pf_brain_vectors`
```sql
id              UUID PRIMARY KEY
vector          vector(1536) (embedding)
context_type    TEXT NOT NULL
source_api      TEXT NOT NULL
score           NUMERIC DEFAULT 0
cost_efficiency NUMERIC DEFAULT 0
metadata        JSONB
created_at      TIMESTAMPTZ DEFAULT now()
```

### `pf_model_stats`
```sql
id                UUID PRIMARY KEY
provider          TEXT UNIQUE NOT NULL
api_type          TEXT NOT NULL
avg_latency       INTEGER DEFAULT 0
avg_cost          NUMERIC DEFAULT 0
avg_success_rate  NUMERIC DEFAULT 100.00
total_calls       INTEGER DEFAULT 0
updated_at        TIMESTAMPTZ DEFAULT now()
```

### `pf_routing_rules`
```sql
id                UUID PRIMARY KEY
api_type          TEXT UNIQUE NOT NULL
preferred_provider TEXT NOT NULL
fallback_order    TEXT[] (array of providers)
cost_threshold    NUMERIC DEFAULT 0.01
updated_at        TIMESTAMPTZ DEFAULT now()
```

### `pf_learning_cycles`
```sql
id                UUID PRIMARY KEY
cycle_start       TIMESTAMPTZ NOT NULL
cycle_end         TIMESTAMPTZ
events_processed  INTEGER DEFAULT 0
rules_updated     INTEGER DEFAULT 0
prompts_optimized INTEGER DEFAULT 0
status            TEXT DEFAULT 'running'
insights          JSONB
created_at        TIMESTAMPTZ DEFAULT now()
```

### `pf_output_feedback`
```sql
id            UUID PRIMARY KEY
trace_id      TEXT NOT NULL
api_type      TEXT NOT NULL
provider      TEXT NOT NULL
rating        INTEGER CHECK (rating BETWEEN 1 AND 5)
feedback_text TEXT
rated_by      UUID REFERENCES auth.users(id)
created_at    TIMESTAMPTZ DEFAULT now()
```

---

## Current Routing Rules

Default routing preferences (auto-optimized over time):

### Text Generation
- **Preferred:** Lovable AI (Gemini)
- **Fallback:** Groq → Anthropic → Perplexity
- **Cost Threshold:** $0.01/request

### Image Generation
- **Preferred:** Together AI
- **Fallback:** Stability → Fal → Replicate
- **Cost Threshold:** $0.02/image

### Video Generation
- **Preferred:** Luma
- **Fallback:** RunwayML → Pika → Kaiber
- **Cost Threshold:** $0.50/video

---

## Performance Metrics

The system tracks:

- **Latency:** Response time from request to completion
- **Cost:** Actual API costs per request
- **Success Rate:** % of requests that complete successfully
- **Quality Score:** Derived from user feedback
- **Cost Efficiency:** Quality per dollar spent

---

## Future Enhancements

### Phase 2: Advanced Learning
- Semantic prompt analysis and optimization
- Predictive caching based on usage patterns
- Multi-model ensemble routing
- A/B testing of routing strategies

### Phase 3: Self-Healing
- Automatic provider failover
- Dynamic rate limit management
- Predictive scaling
- Anomaly detection and auto-correction

### Phase 4: Market Intelligence
- Real-time pricing optimization
- Competitive provider analysis
- Trend forecasting
- Budget optimization

---

## Monitoring & Observability

### Health Checks
- Learning cycle completion rate
- Vector generation success
- Routing rule update frequency
- Feedback submission rate

### Alerts
- Learning cycle failures
- Optimization errors
- Provider performance degradation
- Cost anomalies

---

## Commit

```
✅ PromptFluid Autonomous Learning System Deployed

All API interactions now feed the Brain:
- 6 new database tables for learning infrastructure
- 3 edge functions for learning, optimization, and feedback
- Real-time model performance tracking
- Dynamic routing rule optimization
- User feedback integration
- Brain Learning dashboard at /brain-learning

The system is self-improving and continuously evolving. 🧠
```
