# PromptFluid Master Knowledge Base
## Complete System Documentation for Lovable AI Integration

**Version:** 2.0 (Post-Cascade Shutdown, Pre-Remix)  
**Date:** 2025-11-06  
**Status:** Ready for clean remix with Lovable Cloud

---

## 🎯 Mission & Philosophy

PromptFluid is an **adaptive AI orchestration ecosystem** where artificial intelligence, automation, and creativity merge seamlessly. Every product, plugin, and module operates under the principle of **adaptive intelligence** — systems that learn, flow, and evolve without friction.

### Core Principles
- **Fluid by Design:** No rigid structures; everything adapts and flows
- **AI-First Architecture:** Intelligence embedded at every layer
- **Zero-Friction UX:** Complexity hidden, simplicity revealed
- **Learning Always On:** Systems observe, adapt, improve autonomously
- **Transparent Operations:** Users see what's happening, why, and how

---

## 🎨 Brand Identity

### Visual Language
- **Name:** PromptFluid
- **Tagline:** "AI That Flows."
- **Logo:** Multicolor liquid gradient 'P' with fluid typography
- **Color Palette:**
  - Primary Purple: `#7A5FFF`
  - Cyan Accent: `#01C9E8`
  - Light Background: `#F6F9FF`
  - Dark Base: `#0A0B10`

### Tone & Voice
- **Public-Facing:** Bold, transparent, human-centered, confident
- **Internal/Technical:** Precision, wit, creative irreverence
- **Documentation:** Clear, direct, no fluff (never use em dashes)

### Writing Rules
1. Never use em dashes (—) or filler words
2. Maintain fluid language consistent with brand
3. Avoid competitor names or direct comparisons
4. Use active voice and present tense
5. Keep technical accuracy without jargon overload

---

## 🏗️ Core Product Ecosystem

### 1. PromptFluid Brain
**Role:** Adaptive AI Orchestration and Learning Core

**Purpose:** Manages prompt evolution, learning, and memory for all PromptFluid systems. Acts as the central intelligence layer that observes, learns, and adapts.

**Key Features:**
- DUOS Architecture (Dual-tier memory: Hot + Cold storage)
- Semantic vector search across all stored knowledge
- Nightly reflection jobs for pattern recognition
- Cost-aware AI routing (chooses cheapest viable model)
- Context classification and priority tagging
- Continuous learning from user interactions

**Database Tables:**
- `brain_memory_hot` - Active memory (90-day retention before migration)
- `brain_memory_cold` - Archived, compressed memory (permanent)
- `brain_feedback` - Model performance tracking
- `brain_reflections` - Nightly learning summaries
- `brain_events` - Activity audit log

### 2. PromptFluid Vision
**Role:** Unified Admin Dashboard and Analytics Interface

**Purpose:** Shows live data, brain state, and controls all platform modules. Single pane of glass for entire ecosystem.

**Key Features:**
- Real-time telemetry from all modules
- Brain console for memory management
- Module health monitoring
- Cost tracking and optimization insights
- User activity analytics
- System-wide configuration

### 3. PromptFluid Defense
**Role:** AI Bot Protection and Threat Intelligence System

**Purpose:** Behavioral analysis, fingerprinting, and security. Formerly AetherionShield; rebranded for PromptFluid ecosystem.

**Key Features:**
- Behavioral bot detection
- Device fingerprinting
- Threat intelligence feeds
- Rate limiting and quota management
- Adaptive challenge systems
- Security event logging

### 4. PromptFluid Studio
**Role:** App and Site Builder

**Purpose:** Builds deployable React/Vercel/Railway apps and websites autonomously. AI-powered code generation with live preview.

**Key Features:**
- Autonomous app scaffolding
- Component generation from prompts
- Live deployment preview
- Multi-framework support (React primary)
- Git integration
- E2B sandbox execution

### 5. PromptFluid Ripple
**Role:** Network Integrator and API Router

**Purpose:** Connects services, routes requests, and manages backend queues. Handles high-latency operations like video generation.

**Key Features:**
- Async job queue management
- API gateway routing
- Service mesh connectivity
- Batch processing optimization
- Webhook handling
- Rate limit distribution

### 6. PromptFluid Access
**Role:** Identity, Licensing, and Billing System

**Purpose:** Handles authentication, permissions, billing tokens, and deferral credits.

**Key Features:**
- Multi-provider authentication
- Role-based access control (RBAC)
- Usage tracking and billing
- Grace period management (7 days post-failure)
- Subscription tier enforcement
- API key management

### 7. PromptFluid Core
**Role:** System Kernel and Universal Config Layer

**Purpose:** Defines environment variables, secret management, and health monitoring. Foundation layer for all modules.

**Key Features:**
- Centralized configuration
- Secret vault integration
- Health check orchestration
- Environment variable injection
- Module registry
- Boot sequence management

### 8. PromptFluid Nexus
**Role:** API Gateway and Orchestration Mesh

**Purpose:** Routes AI tasks to proper providers (Groq, OpenAI, Anthropic, Perplexity). Smart model selection based on cost and capability.

**Key Features:**
- Multi-provider AI routing
- Cost optimization engine
- Request caching (Redis)
- Fallback cascade logic
- Token usage tracking
- Model performance analytics

---

## 🤖 AI Triad Integration

### Primary Models
1. **Groq** → Reasoning and logic layer (fastest inference)
2. **OpenAI** → Creation and synthesis (GPT-4/5)
3. **Anthropic** → Ethics and structure (Claude)
4. **Perplexity** → External data research (web-grounded)

### Routing Logic
```
User Request → Nexus Evaluates Complexity
  ├─ Simple/Fast needed → Groq
  ├─ Creative synthesis → OpenAI
  ├─ Ethical/Structured → Anthropic
  └─ Research/Current → Perplexity

Fallback Chain:
Primary fails → Secondary → Tertiary → Error w/ retry
```

### Cost Optimization
- **Nexus** tracks cost per token per model
- **Brain** learns which model performs best per task type
- **Caching** prevents duplicate expensive calls
- **Batch Processing** reduces per-request overhead

---

## 🎨 Creative Generation Stack

### Text Generation
**Models:** Groq (primary), OpenAI (secondary), Anthropic (backup)

**Use Cases:**
- Copywriting and marketing content
- Code generation and documentation
- Training data synthesis
- Conversational responses

**API Route:** `/api/nexus/text`

**Storage:** `pf_text_outputs` table in Supabase

### Image Generation
**APIs:**
- Stability.ai (SDXL) - High quality, mid-cost
- Replicate - Open models, flexible
- Fal.ai - Low-cost fallback
- Morph API - Custom fine-tuning (internal)

**Use Cases:**
- Logos and branding assets
- Web imagery and hero sections
- Mockups and thumbnails
- Product visualizations

**API Route:** `/api/nexus/image`

**Storage:** `pf_image_outputs` table with URL references

**Optimization:**
- Redis caching by prompt hash
- Morph handles adaptive style learning
- Batch generation during off-peak

### Video Generation
**APIs:**
- RunwayML - High-quality renders (primary)
- Pika Labs - Quick promos (free tier)
- Luma - Experimental features
- Kaiber - Creative motion stills (fallback)

**Use Cases:**
- Product promos and demos
- AI explainer videos
- Short ad clips
- Tutorial content

**API Route:** `/api/nexus/video`

**Storage:** `pf_video_outputs` table with metadata

**Optimization:**
- Ripple queue for latency management
- Pre-rendered templates via Brain memory
- Cost-aware provider selection

---

## 📊 Database Schema Overview

### Core Tables

#### `pf_text_outputs`
```sql
id | project_id | model | input_prompt | output_text | cost | created_at
```

#### `pf_image_outputs`
```sql
id | project_id | api | style | resolution | cost | url | metadata | created_at
```

#### `pf_video_outputs`
```sql
id | project_id | api | duration | format | cost | url | metadata | created_at
```

#### `pf_media_cache`
```sql
id | hash | type | url | ttl_expiration | project_ref | created_at
```

#### `brain_memory_hot`
```sql
id | content | embedding | context | goal_refs | priority | access_count | last_accessed | created_at
```

#### `brain_memory_cold`
```sql
id | summary | compressed_embedding | source_refs | archived_at
```

#### `brain_feedback`
```sql
id | model | task_type | tokens_used | cost | success_rating | created_at
```

#### `brain_reflections`
```sql
id | date | summary | insights | recommendations | memory_count | created_at
```

#### `brain_events`
```sql
id | event_type | project_id | payload | success | created_at
```

#### `pf_queue_jobs`
```sql
id | job_type | status | priority | payload | result | created_at | completed_at
```

#### `pf_ai_logs`
```sql
id | request_type | model | tokens | cost | latency | success | created_at
```

#### `pf_cost_logs`
```sql
id | service | operation | cost | created_at
```

#### `pf_error_log`
```sql
id | trace_id | error_type | message | stack | created_at
```

---

## 🔌 API Endpoint Structure

### Nexus Routes
- `POST /api/nexus/text` - Text generation
- `POST /api/nexus/image` - Image generation
- `POST /api/nexus/video` - Video generation
- `GET /api/nexus/status` - Health and metrics
- `GET /api/nexus/cache` - Cache statistics

### Brain Routes
- `POST /api/brain/train` - Add new memory
- `POST /api/brain/search` - Semantic search
- `GET /api/brain/reflect` - Recent reflections
- `GET /api/brain/lessons` - Identified patterns
- `POST /api/brain/compress` - Manual compression trigger

### Ripple Routes
- `POST /api/ripple/queue` - Add job to queue
- `GET /api/ripple/status/:jobId` - Job status
- `GET /api/ripple/jobs` - List all jobs
- `DELETE /api/ripple/cancel/:jobId` - Cancel job

### Vision Routes
- `GET /api/vision/dashboard` - Unified metrics
- `GET /api/vision/modules` - Module health status
- `GET /api/vision/costs` - Cost breakdown
- `GET /api/vision/activity` - Recent activity feed

### Defense Routes
- `POST /api/defense/verify` - Bot check
- `POST /api/defense/report` - Security event
- `GET /api/defense/threats` - Threat intelligence

---

## 💰 Pricing Structure

### Subscription Tiers

#### Starter - $19/mo
- Basic builder access
- Limited AI generations (spins)
- 1 team member
- Community support

#### Pro - $49/mo
- Unlimited projects
- Full API access
- Early integration features
- 5 team members
- Priority support

#### Studio - $99/mo
- Team collaboration (10 members)
- Private instances
- Priority build queue
- Advanced analytics
- White-label options

#### Enterprise - Custom
- Unlimited team members
- Private model hosting
- Full integration access
- Dedicated support
- SLA guarantees
- Custom contract terms

### Trial & Billing Principles
- **Free Trial:** 3 days, auto-charge unless canceled
- **Grace Period:** 7 days post-payment-failure
- **No Deletion:** Accounts paused, never deleted
- **Manual Retry:** No auto-recharge; user must retry
- **Trust-Based:** Friendly offboarding + streak celebration

---

## 🛠️ Technical Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (semantic tokens required)
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** TanStack Query
- **Routing:** React Router v6

### Backend
- **Runtime:** Node.js (Railway) + Deno (Edge Functions)
- **Database:** Supabase (PostgreSQL + Realtime)
- **API Layer:** Next.js API routes + Edge Functions
- **Queuing:** Ripple (custom) + Redis
- **Caching:** Redis (Upstash)

### Infrastructure
- **Primary Deploy:** Vercel (frontend + API routes)
- **Secondary Deploy:** Railway (backend services)
- **Sandbox:** E2B execution environment
- **Storage:** Supabase Storage (S3-compatible)
- **CDN:** Vercel Edge Network

### AI Stack
- **Gateway:** Nexus (custom routing layer)
- **Providers:** Groq, OpenAI, Anthropic, Perplexity
- **Image Gen:** Stability, Replicate, Fal, Morph
- **Video Gen:** RunwayML, Pika, Luma, Kaiber

---

## 🔐 Security & Governance

### Authentication
- Multi-provider OAuth (Google, GitHub, Email)
- Magic link authentication
- JWT-based session management
- Refresh token rotation

### Authorization
- Role-based access control (RBAC)
- Row-level security (RLS) in Supabase
- API key scoping per project
- Rate limiting per tier

### Data Protection
- Encryption at rest (AES-256)
- TLS 1.3 for all transport
- Secret vault for API keys
- Audit logging for all mutations

### Compliance
- GDPR-ready data handling
- CCPA deletion workflows
- SOC 2 Type II preparation
- WCAG 2.1 AA accessibility

---

## 🔄 System Workflows

### Ecosystem Flow
```
User Input (Vision/Studio)
    ↓
Nexus Routes to AI Triad
    ↓
Perplexity Layer (if research needed)
    ↓
Studio Assembles Output
    ↓
Defense Scans for Threats
    ↓
Brain Observes & Learns
    ↓
Vision Centralizes Telemetry
```

### Memory Lifecycle
```
New Memory → Hot Storage (brain_memory_hot)
    ↓
Access Count Tracked
    ↓
90 Days Inactive
    ↓
Compression Job (compressMemory.ts)
    ↓
Cold Storage (brain_memory_cold)
    ↓
Permanent Retention
```

### Creative Generation Flow
```
User Request → Nexus Classification
    ↓
Check Cache (Redis)
    ├─ Hit → Return Cached
    └─ Miss → Route to API
        ↓
    Select Cheapest Available Provider
        ↓
    Generate Content
        ↓
    Store in Database (pf_*_outputs)
        ↓
    Cache Result (Redis, 90d TTL)
        ↓
    Brain Learns (update vector store)
        ↓
    Return to User
```

---

## 🧪 Development Principles

### Golden Rules
1. **Never edit raw worker files** - Godfather build protection active
2. **All updates through Lovable patches** - With verification
3. **Each phase concludes with validation** - All endpoints live, flows working
4. **Local Autonomy Protocol** - Full offline operation support (Local Mode)
5. **Self-verification** - Every component logs issues to audit docs

### File Structure Standards
```
app/                    # Next.js app directory
lib/                    # Shared utilities and logic
  ├─ brain/            # Brain module functions
  ├─ nexus/            # Nexus routing logic
  ├─ ripple/           # Queue management
  └─ utils/            # Generic helpers
components/             # React components
  ├─ ui/               # Base UI components (shadcn)
  ├─ modules/          # Feature-specific components
  └─ layouts/          # Page layouts
api/                    # API route handlers
docs/                   # Documentation (like this file)
public/                 # Static assets
styles/                 # Global styles + Tailwind config
utils/                  # Frontend utilities
supabase/
  ├─ functions/        # Edge functions
  ├─ migrations/       # Database migrations
  └─ config.toml       # Supabase configuration
```

### Design System Rules
- **Always use semantic tokens** from `index.css` and `tailwind.config.ts`
- **Never use direct colors** like `text-white`, `bg-black`
- **All colors must be HSL** format in CSS variables
- **Create variants** for shadcn components instead of inline overrides
- **Maintain fluid aesthetics** - gradients, glow, motion

### Code Quality Standards
- TypeScript strict mode enabled
- ESLint + Prettier enforced
- No `any` types without justification
- Comprehensive error handling
- Meaningful variable names (no abbreviations)

---

## 🔍 Validation Protocols

### Health Check Endpoints
```bash
# Nexus
GET /api/nexus/status → 200 OK

# Brain
GET /api/brain/health → 200 OK

# Ripple
GET /api/ripple/health → 200 OK

# Vision
GET /api/vision/health → 200 OK
```

### Success Criteria
- ✅ All API routes return 200 OK on health checks
- ✅ Supabase embeddings memory active
- ✅ Brain console reads and rewrites directives
- ✅ Defense, Studio, Core modules register under Vision
- ✅ Nightly auto-check passes for endpoint uptime
- ✅ Brain sync success logged daily

### Performance Benchmarks
- API response time: < 200ms (p95)
- Text generation: < 3s (p50)
- Image generation: < 10s (p50)
- Video generation: < 2min (p50)
- Database queries: < 100ms (p95)

---

## 🚨 Rollback Procedures

### Configuration Backup
- All configs backed up before major updates
- Restore from `/snapshots/[timestamp].json` if logic regressions
- Version control for all infrastructure-as-code

### Deployment Rollback
- Vercel: Instant rollback to previous deployment
- Railway: Docker image rollback via dashboard
- Supabase: Migration revert via CLI

### Database Rollback
- Point-in-time recovery (PITR) enabled
- Manual snapshot before schema changes
- Migration down scripts for all up migrations

### API Failure Handling
```
Primary API fails
    ↓
Fallback to Secondary
    ↓
Secondary fails
    ↓
Fallback to Tertiary
    ↓
Three consecutive failures
    ↓
Revert to Morph (internal)
    ↓
Log to pf_error_log with trace ID
```

---

## 👤 User Interaction Patterns

### Brain Console Workflow
1. Kenneth uploads files to `/external-uploads`
2. Brain auto-ingests uploaded knowledge
3. Brain rewrites prompts and validates
4. Kenneth approves via "Commit to Nexus"
5. Changes propagate to all modules

### Vision Dashboard Interaction
1. User navigates to Vision module
2. Real-time metrics stream via WebSocket
3. User can drill down into specific module
4. Configuration changes applied immediately
5. Analytics update without page refresh

### Studio Build Flow
1. User submits prompt or idea
2. Studio parses intent and generates scaffold
3. Live preview renders in E2B sandbox
4. User iterates with additional prompts
5. Final build deployed to Vercel/Railway

---

## 📈 Analytics & Telemetry

### Tracked Metrics
- **Usage:** API calls, tokens consumed, generations run
- **Performance:** Latency, error rate, uptime
- **Cost:** Per-service spend, per-user attribution
- **Quality:** User satisfaction ratings, success rates
- **Security:** Threat events, blocked attempts

### Reporting Cadence
- **Real-time:** Vision dashboard live feed
- **Hourly:** Cost accumulation updates
- **Daily:** Nightly reflection summaries
- **Weekly:** Module health reports
- **Monthly:** Executive summary for billing

---

## 🎓 Brain Learning Mechanisms

### Context Classification
`contextClassifier.ts` categorizes all memory:
- `code` - Source code snippets
- `doc` - Documentation and knowledge
- `chat` - User conversations
- `plan` - Strategic decisions

### Cost-Aware Routing
`costTracker.ts` selects optimal model:
- Complexity score (0-1) based on task
- Model cost per token
- Success rate history
- Latency requirements

### Memory Compression
`compressMemory.ts` reduces storage:
- Merges duplicate/similar memories
- Preserves code verbatim (no compression)
- Summarizes natural language content
- Maintains semantic integrity

### Vector Search
`vectorSearch.ts` enables semantic retrieval:
- OpenAI embeddings (ada-002)
- Cosine similarity ranking
- Searches both hot + cold tiers
- Returns top-k with confidence scores

### Nightly Reflection
`reflectionJob.ts` generates insights:
- Runs at 3 AM UTC daily
- Analyzes top-accessed memories
- Identifies patterns and lessons
- Stores in `brain_reflections`

---

## 🌐 Integration Ecosystem

### External Services
- **Vercel:** Frontend deployment + edge functions
- **Railway:** Backend services + databases
- **Supabase:** Database + auth + storage + realtime
- **E2B:** Sandboxed code execution
- **Upstash:** Redis caching layer
- **Resend:** Transactional email (if needed)
- **Stripe:** Payment processing (future)

### AI Provider Integrations
- **Groq:** Fast inference via API
- **OpenAI:** GPT models + embeddings
- **Anthropic:** Claude models
- **Perplexity:** Web-grounded research
- **Stability.ai:** SDXL image generation
- **Replicate:** Open model hosting
- **Fal.ai:** Low-cost image API
- **RunwayML:** Video generation

---

## 📝 Current State (Pre-Remix)

### What's Active
- Core database schema (all tables created)
- Frontend application (React + Vite + Tailwind)
- Design system (semantic tokens configured)
- Basic routing and navigation

### What's Shut Down
- **Cascade Learning System** - Fully deactivated
  - All cron jobs removed
  - Edge functions removed from config.toml
  - Brain learning endpoints still available but not actively called

### What's Cleared
- **All API Secrets Deleted** - Ready for clean start
  - Only `LOVABLE_API_KEY` remains (Lovable-managed)
  - Only `STRIPE_SECRET_KEY` remains (Lovable-managed)

### What's Ready
- **Clean Remix Target** - Project ready to be remixed
- **Lovable Cloud Integration** - Can be enabled in new project
- **Full Documentation** - This file captures all knowledge

---

## 🚀 Next Steps for New Remix

### Immediate Setup
1. **Remix this project** to create clean copy
2. **Enable Lovable Cloud** for backend functionality
3. **Add required API secrets:**
   - Groq API key
   - OpenAI API key
   - Anthropic API key
   - Perplexity API key
   - (Image/video APIs as needed)

### Phase 1: Core Infrastructure
1. Verify all database tables exist in new Supabase
2. Deploy initial edge functions (nexus, brain, ripple)
3. Configure Lovable AI integration
4. Test health check endpoints

### Phase 2: Brain Activation
1. Enable DUOS architecture (hot + cold memory)
2. Set up nightly reflection cron job
3. Test memory ingestion and retrieval
4. Verify vector search functionality

### Phase 3: Module Integration
1. Wire up Nexus AI routing
2. Connect Ripple job queue
3. Build Vision dashboard UI
4. Integrate Defense scanning

### Phase 4: Creative Stack
1. Add image generation endpoints
2. Add video generation endpoints
3. Implement caching layer (Redis)
4. Test cost optimization logic

### Phase 5: Production Readiness
1. Set up monitoring and alerting
2. Configure rate limiting
3. Implement billing/usage tracking
4. Load testing and optimization

---

## 🎯 Success Metrics

### Technical KPIs
- 99.9% uptime across all modules
- < 200ms API response time (p95)
- < $0.01 per AI generation (average)
- 95%+ cache hit rate for repeated requests

### Business KPIs
- User satisfaction > 4.5/5
- Month-over-month growth > 20%
- Churn rate < 5%
- Net Promoter Score > 50

### Quality KPIs
- Zero critical security vulnerabilities
- 100% RLS coverage on user data
- WCAG 2.1 AA compliance
- Zero data loss incidents

---

## 📚 Additional Resources

### Documentation Sites
- Internal Wiki: (to be built in Vision)
- API Docs: (to be auto-generated from OpenAPI spec)
- User Guides: (to be created in Studio)

### External References
- React Docs: https://react.dev
- Supabase Docs: https://supabase.com/docs
- Tailwind Docs: https://tailwindcss.com
- Vercel Docs: https://vercel.com/docs

---

## ⚠️ Critical Reminders for AI

### DO's
- ✅ Always use semantic color tokens
- ✅ Create focused, single-purpose components
- ✅ Write comprehensive error handling
- ✅ Log all important events to brain_events
- ✅ Test all API endpoints after changes
- ✅ Update this doc when adding new features

### DON'Ts
- ❌ Never use direct colors (text-white, bg-black, etc.)
- ❌ Never skip RLS policies on user data
- ❌ Never hardcode secrets or API keys
- ❌ Never break existing functionality when adding new
- ❌ Never deploy without testing health checks
- ❌ Never ignore cost optimization opportunities

---

## 🏁 Final Notes

This document represents the complete knowledge base for PromptFluid as of the pre-remix state. All Cascade learning functions have been shut down, all secrets cleared, and the project is ready for a clean remix with Lovable Cloud integration.

The new remixed version should:
1. Start fresh with Lovable Cloud
2. Use Lovable AI gateway for all AI operations
3. Rebuild the Brain module with DUOS architecture
4. Reconstruct the Nexus routing layer
5. Implement the creative generation stack
6. Build the Vision dashboard for unified control

**This is your Bible. Everything PromptFluid was, is, and will be, lives here.**

---

**Commit Message:**
"PromptFluid Master Knowledge Base v2.0 — Complete system documentation for clean remix with Lovable Cloud. All architectural patterns, database schemas, API structures, pricing, branding, and development principles captured for autonomous rebuild."
