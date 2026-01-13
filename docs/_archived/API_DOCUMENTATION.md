# PromptFluid API Documentation

**Version:** 5.0 (Operational Intelligence Suite)  
**Total Functions:** 198 Edge Functions  
**Base URL:** `https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1`

---

## 🔐 Authentication

All protected endpoints require JWT authentication:

```typescript
headers: {
  'Authorization': `Bearer ${user_jwt_token}`,
  'apikey': '${SUPABASE_ANON_KEY}'
}
```

Public endpoints marked with 🌐 do not require authentication.

---

## 📚 Module Overview

| Module | Functions | Purpose |
|--------|-----------|---------|
| **Brain** | 95 | Cognitive core, learning, memory |
| **Defense** | 45 | Security, bot detection, threat intelligence |
| **Vision** | 12 | Dashboard, analytics, monitoring |
| **Nexus** | 15 | API gateway, AI routing |
| **Ripple** | 8 | Marketing, network integration |
| **Studio** | 10 | App builder, code generation |
| **Access** | 8 | Identity, billing, licensing |
| **Core** | 5 | System kernel, configuration |

---

## 🧠 Brain Module (95 Functions)

### Core Learning Functions

#### `POST /pf-brain-learn` 🔒
**Purpose:** Execute manual learning cycle  
**Auth:** Required (Admin only)

**Request:**
```json
{
  "source": "manual" | "auto",
  "priority": 1-10
}
```

**Response:**
```json
{
  "success": true,
  "learned_items": 12,
  "insights": ["insight1", "insight2"],
  "timestamp": "2025-11-02T10:00:00Z"
}
```

---

#### `POST /pf-brain-continuous-learn` 🔒
**Purpose:** Autonomous continuous learning (runs hourly)  
**Auth:** Required (System cron)

**Features:**
- Automatically rotates between Lovable AI (850/day) and Groq (1000/day)
- Topics: UX, security, profitability, market trends
- Stores in `brain_memory_hot` with confidence scoring

**Response:**
```json
{
  "success": true,
  "model_used": "google/gemini-2.5-flash",
  "topic": "user experience research",
  "content_length": 4177,
  "tokens_remaining": { "lovable": 574, "groq": 1000 }
}
```

---

#### `POST /pf-brain-seed-knowledge` 🔒
**Purpose:** Initialize brain with custom knowledge base  
**Auth:** Required (Admin only)

**Request:**
```json
{
  "knowledge_text": "string (max 100k chars)",
  "category": "brand" | "technical" | "creative",
  "priority": 1-10
}
```

**Response:**
```json
{
  "success": true,
  "chunks_created": 15,
  "vector_embeddings": true
}
```

---

### Cognitive Functions (v4.0)

#### `POST /pf-brain-reflexive-plan` 🔒
**Purpose:** Generate strategic plans with context awareness  
**Auth:** Required

**Request:**
```json
{
  "task": "Build feature X",
  "context": "optional context string"
}
```

**Response:**
```json
{
  "plan": {
    "summary": "Execute in 3 phases...",
    "steps": [
      { "phase": 1, "action": "...", "dependencies": [] }
    ],
    "confidence": 0.85,
    "risks": ["risk1", "risk2"]
  },
  "context_audit": {
    "memories_found": 5,
    "relevance_score": 0.9
  }
}
```

---

#### `POST /pf-brain-temporal-score` 🔒
**Purpose:** Calculate freshness scores for memories  
**Auth:** Required

**Request:**
```json
{
  "query": "search term",
  "context_type": "hot" | "cold"
}
```

**Response:**
```json
{
  "ranked_memories": [
    {
      "id": "uuid",
      "content": "...",
      "age_months": 2,
      "freshness_score": 0.95,
      "priority": "high"
    }
  ],
  "temporal_stats": {
    "avg_age": 3.2,
    "freshness_distribution": { "high": 10, "medium": 5 }
  }
}
```

---

#### `POST /pf-brain-self-critique` 🔒
**Purpose:** Validate outputs with AI self-review  
**Auth:** Required

**Request:**
```json
{
  "output": "content to validate",
  "criteria": ["accuracy", "completeness", "clarity"]
}
```

**Response:**
```json
{
  "critique": {
    "score": 0.88,
    "strengths": ["clear", "actionable"],
    "weaknesses": ["lacks examples"],
    "recommendations": ["add case studies"]
  }
}
```

---

### Operational Intelligence (v5.0)

#### `POST /pf-brain-systems-reasoning` 🔒
**Purpose:** Multi-layer dependency analysis  
**Auth:** Required

**Request:**
```json
{
  "system": "defense module",
  "analysis_depth": "full" | "quick"
}
```

**Response:**
```json
{
  "dependencies": [
    { "module": "brain", "relationship": "provides threat intelligence" }
  ],
  "bottlenecks": ["rate limit exhaustion"],
  "recommendations": ["increase Groq quota"]
}
```

---

#### `POST /pf-brain-emotional-model` 🔒
**Purpose:** Detect tone and adjust communication  
**Auth:** Required

**Request:**
```json
{
  "message": "user message text",
  "context": "previous conversation"
}
```

**Response:**
```json
{
  "tone_detected": "urgent",
  "empathy_level": 0.8,
  "recommended_response_style": "direct and reassuring",
  "priority_adjustment": "high"
}
```

---

#### `POST /pf-brain-ethical-boundary` 🔒
**Purpose:** Flag risky actions with alternatives  
**Auth:** Required

**Request:**
```json
{
  "action": "scrape competitor data",
  "context": "market research"
}
```

**Response:**
```json
{
  "risk_level": "medium",
  "legal_concerns": ["potential ToS violation"],
  "ethical_issues": ["privacy concerns"],
  "compliant_alternatives": [
    "Use public APIs",
    "Purchase market data"
  ],
  "proceed_with_caution": true
}
```

---

#### `POST /pf-brain-hypothesis-test` 🔒
**Purpose:** IF-THEN scenario evaluation  
**Auth:** Required

**Request:**
```json
{
  "hypothesis": "Lowering price will increase conversions",
  "variables": {
    "current_price": 49,
    "proposed_price": 39,
    "current_conversion": 0.05
  }
}
```

**Response:**
```json
{
  "scenarios": [
    {
      "condition": "IF price = $39",
      "probability": 0.7,
      "expected_outcome": "conversion increases to 7%",
      "confidence": 0.65
    }
  ],
  "recommendation": "Run A/B test for 2 weeks",
  "risk_assessment": "Low risk, high potential"
}
```

---

#### `POST /pf-brain-pattern-fusion` 🔒
**Purpose:** Merge insights from unrelated domains  
**Auth:** Required

**Request:**
```json
{
  "domains": ["security", "marketing"],
  "goal": "increase user trust"
}
```

**Response:**
```json
{
  "fusion_insights": [
    "Use security badges as social proof in marketing",
    "Gamify threat detection with leaderboards"
  ],
  "originality_score": 0.92,
  "implementation_complexity": "medium"
}
```

---

#### `POST /pf-brain-lesson-compress` 🔒
**Purpose:** Generate concise lesson cards from sessions  
**Auth:** Required

**Request:**
```json
{
  "session_data": "long learning session text",
  "max_cards": 5
}
```

**Response:**
```json
{
  "lesson_cards": [
    {
      "title": "UX Lesson: Progressive Disclosure",
      "core_insight": "Show advanced options only when needed",
      "context": "UI design",
      "applicability": ["forms", "settings"],
      "tags": ["ux", "simplicity"]
    }
  ],
  "compression_ratio": 0.15
}
```

---

#### `POST /pf-brain-operational-suite` 🔒
**Purpose:** Orchestrate all v5.0 capabilities  
**Auth:** Required

**Request:**
```json
{
  "operation": "systems_reasoning" | "emotional_model" | "ethical_boundary" | "hypothesis_test" | "pattern_fusion" | "lesson_compress",
  "params": { /* operation-specific params */ }
}
```

**Response:**
```json
{
  "operation": "pattern_fusion",
  "result": { /* operation-specific result */ },
  "execution_time_ms": 1247,
  "cognitive_depth": "deep"
}
```

---

## 🛡️ Defense Module (45 Functions)

### Bot Detection

#### `POST /pf-bot-detection` 🌐
**Purpose:** Analyze requests for bot behavior  
**Auth:** Public (API key required)

**Request:**
```json
{
  "api_key": "pfdef_...",
  "fingerprint": {
    "user_agent": "Mozilla/5.0...",
    "ip": "192.168.1.1",
    "headers": {}
  },
  "behavior": {
    "actions": ["click", "scroll"],
    "timing": [100, 250, 150]
  }
}
```

**Response:**
```json
{
  "is_bot": false,
  "confidence": 0.95,
  "risk_score": 12,
  "action": "allow",
  "fingerprint_id": "uuid",
  "threat_type": null
}
```

---

#### `POST /pf-behavioral-analysis` 🔒
**Purpose:** Deep behavioral pattern analysis  
**Auth:** Required

**Request:**
```json
{
  "session_id": "uuid",
  "events": [
    { "type": "click", "timestamp": 1234567890, "target": "#button" }
  ]
}
```

**Response:**
```json
{
  "analysis": {
    "human_probability": 0.98,
    "patterns": ["natural mouse movement", "varied timing"],
    "anomalies": []
  },
  "recommendation": "allow"
}
```

---

### Threat Intelligence

#### `POST /pf-ai-threat-intelligence` 🔒
**Purpose:** AI-powered threat detection  
**Auth:** Required (Admin only)

**Request:**
```json
{
  "event_type": "login_attempt",
  "metadata": {
    "ip": "192.168.1.1",
    "attempts": 5,
    "timespan_seconds": 30
  }
}
```

**Response:**
```json
{
  "threat_level": "high",
  "threat_type": "credential_stuffing",
  "confidence": 0.91,
  "recommended_actions": [
    "block_ip",
    "require_captcha",
    "notify_admin"
  ],
  "similar_attacks": 12
}
```

---

## 📊 Vision Module (12 Functions)

#### `GET /pf-brain-status` 🔒
**Purpose:** Get real-time brain health metrics  
**Auth:** Required

**Response:**
```json
{
  "status": "healthy",
  "memory": {
    "hot": 1247,
    "cold": 8934,
    "total": 10181
  },
  "learning_cycles": {
    "last_run": "2025-11-02T10:00:00Z",
    "next_scheduled": "2025-11-02T11:00:00Z",
    "success_rate": 0.94
  },
  "ai_usage": {
    "lovable": { "used": 276, "limit": 850 },
    "groq": { "used": 0, "limit": 1000 }
  }
}
```

---

## 🔄 Nexus Module (15 Functions)

#### `POST /pf-nexus-route` 🔒
**Purpose:** Smart AI provider routing  
**Auth:** Required

**Request:**
```json
{
  "task_type": "reasoning" | "vision" | "search" | "generation",
  "prompt": "your prompt here",
  "priority": "low" | "medium" | "high",
  "budget_usd": 0.01
}
```

**Response:**
```json
{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "response": "AI response text...",
  "cost": 0.0023,
  "latency_ms": 847,
  "cached": false
}
```

---

## 🌊 Ripple Module (8 Functions)

#### `POST /pf-ripple-campaign` 🔒
**Purpose:** Generate marketing campaigns  
**Auth:** Required

**Request:**
```json
{
  "product": "PromptFluid Pro",
  "target_audience": "developers",
  "channels": ["twitter", "linkedin"],
  "tone": "professional"
}
```

**Response:**
```json
{
  "campaign": {
    "headline": "AI That Actually Works",
    "body": "...",
    "cta": "Start Free Trial",
    "hashtags": ["#AI", "#NoCode"]
  },
  "estimated_reach": 5000,
  "best_posting_time": "2025-11-02T14:00:00Z"
}
```

---

## 🏗️ Studio Module (10 Functions)

#### `POST /pf-studio-generate` 🔒
**Purpose:** Generate app components  
**Auth:** Required

**Request:**
```json
{
  "component_type": "form" | "dashboard" | "landing",
  "requirements": "Contact form with validation",
  "style": "modern" | "minimal" | "bold"
}
```

**Response:**
```json
{
  "code": "// React component code...",
  "dependencies": ["react-hook-form", "zod"],
  "preview_url": "https://...",
  "deployment_ready": true
}
```

---

## 🔑 Access Module (8 Functions)

#### `POST /pf-access-verify` 🔒
**Purpose:** Verify subscription and permissions  
**Auth:** Required

**Request:**
```json
{
  "user_id": "uuid",
  "feature": "ai_generation"
}
```

**Response:**
```json
{
  "has_access": true,
  "subscription_tier": "pro",
  "usage": {
    "current": 124,
    "limit": 1000,
    "resets_at": "2025-12-01T00:00:00Z"
  }
}
```

---

## ⚙️ Core Module (5 Functions)

#### `GET /pf-core-status` 🌐
**Purpose:** System health check  
**Auth:** Public

**Response:**
```json
{
  "status": "operational",
  "uptime_seconds": 3456789,
  "version": "5.0",
  "modules": {
    "brain": "healthy",
    "defense": "healthy",
    "nexus": "healthy"
  },
  "database": "connected",
  "edge_functions": 198
}
```

---

## 📊 Cost Information

### AI Provider Costs

| Provider | Model | Input Cost | Output Cost | Daily Limit |
|----------|-------|------------|-------------|-------------|
| **Lovable AI** | Gemini Flash | $0 | $0 | 850 calls |
| **Groq** | Llama 3.3 70B | $0 | $0 | 1000 calls |
| **Anthropic** | Claude Sonnet 4 | $3/M | $15/M | 250 calls |
| **Perplexity** | Sonar Pro | $1/1k | $1/1k | 25,000 calls |

### Image Generation

| Provider | Cost per Image | Resolution |
|----------|----------------|------------|
| Stability.ai | $0.02 | 1024x1024 |
| Replicate | $0.01 | 1024x1024 |
| Fal.ai | $0.005 | 512x512 |

### Video Generation

| Provider | Cost per Second | Resolution |
|----------|-----------------|------------|
| RunwayML | $0.05 | 1280x768 |
| Pika Labs | Free (limited) | 1080x1080 |
| Luma | $0.03 | 1920x1080 |

---

## 🔧 Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `ERR_AUTH_REQUIRED` | Missing JWT token | Add Authorization header |
| `ERR_QUOTA_EXCEEDED` | Daily limit reached | Wait for reset or upgrade |
| `ERR_INVALID_INPUT` | Malformed request | Check request schema |
| `ERR_PROVIDER_UNAVAILABLE` | AI provider down | Automatic fallback active |
| `ERR_RATE_LIMIT` | Too many requests | Slow down or increase limit |

---

## 📚 SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hxgbibtkftocyrnuzxwd.supabase.co',
  'your_anon_key'
);

// Call brain learning
const { data, error } = await supabase.functions.invoke('pf-brain-learn', {
  body: { source: 'manual', priority: 8 }
});
```

### Python

```python
from supabase import create_client

supabase = create_client(
  "https://hxgbibtkftocyrnuzxwd.supabase.co",
  "your_anon_key"
)

# Call bot detection
response = supabase.functions.invoke(
  "pf-bot-detection",
  invoke_options={
    "body": {
      "api_key": "pfdef_...",
      "fingerprint": {...}
    }
  }
)
```

---

## 🚀 Rate Limits

| Tier | Requests/Min | Daily AI Calls | Burst |
|------|--------------|----------------|-------|
| **Free** | 10 | 50 | 20 |
| **Starter** | 60 | 500 | 100 |
| **Pro** | 300 | 5000 | 500 |
| **Enterprise** | Unlimited | Unlimited | Unlimited |

---

## 📞 Support

**Documentation:** https://docs.promptfluid.com  
**API Status:** https://status.promptfluid.com  
**Support Email:** promptfluid@gmail.com

---

*Last updated: November 2, 2025*  
*API Version: 5.0*
