# CMPSBL Marketplace — Complete Reference

**Version 5.5.0 | Commercial Documentation**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **System Name** | CMPSBL Marketplace |
| **Version** | v5.5.0 |
| **Classification** | Commercial Distribution Platform |
| **Status** | Production (Live System) |
| **Publication Date** | January 2026 |

---

## Table of Contents

1. [Overview](#overview)
2. [Product Categories](#product-categories)
3. [Template System](#template-system)
4. [Rarity & Pricing System](#rarity--pricing-system)
5. [AI Template Generator](#ai-template-generator)
6. [Bundles & Stacks](#bundles--stacks)
7. [Agency Licensing](#agency-licensing)
8. [Studio Licensing](#studio-licensing)
9. [Rights Matrix](#rights-matrix)
10. [Checkout & Payments](#checkout--payments)
11. [Technical Implementation](#technical-implementation)

---

## Overview

The CMPSBL Marketplace is the commercial distribution platform for the promptfluid® Substrate. It provides production-ready cognitive templates, bundles, and licensing options for developers building AI applications that require **behavioral drift prevention**.

### Core Value Proposition

> **"THE Solution for AI Chatbot Behavioral Drift"**

All marketplace products address the fundamental challenge of maintaining consistent AI behavior over time through:

- **Memory Persistence**: Cross-session recall and context continuity
- **Behavioral Anchoring**: Personality and goal stability
- **Self-Healing**: Automatic drift detection and correction
- **Security**: Jailbreak prevention and prompt injection defense

### Platform Highlights

| Metric | Value |
|--------|-------|
| **Total Templates** | 97+ production-ready patterns |
| **Template Categories** | 9 module categories |
| **Price Range** | $27 - $499 (templates) |
| **OS License** | $3,999 (one-time) |
| **World Engine** | $1,999 (one-time) |
| **Agency Plans** | $199 - $1,499/month |
| **Studio Licenses** | $999 - $2,499/month |

---

## Product Categories

### 1. Core Licenses

#### Substrate OS License — $3,999

Full promptfluid® Substrate OS with BYOK (Bring Your Own Keys) support.

**Includes:**
- Core OS runtime
- All 13 kernel modules
- BYOK configuration for any AI provider
- Single-install license with domain binding
- Lifetime updates
- Priority support

**Stripe IDs:**
- Product: `prod_TrNHM2ONKXkipj`
- Price: `price_1SteXGQ7FtTiAL4aFfqLPytS`

#### World Engine Complete — $1,999

Full game world engine for interactive AI environments.

**Includes:**
- NPC Memory System
- Dream Cycles for autonomous evolution
- Physics Integration
- Persistent World State
- Multi-Agent Coordination

**Stripe IDs:**
- Product: `prod_TrNHPBGWkXxyQr`
- Price: `price_1SteXHQ7FtTiAL4ae0ZrtL9S`

---

## Template System

### Template Categories

Templates are organized by the 9 substrate modules they enhance:

| Category | Icon | Description | Example Templates |
|----------|------|-------------|-------------------|
| **Brain** | 🧠 | Memory, learning, knowledge graphs | Memory Persistence Core, Knowledge Graph Builder |
| **Decode** | 💬 | NLU, intent parsing, conversation | Self-Healing Chatbot, Context Continuity Engine |
| **Defense** | 🛡️ | Security, anti-jailbreak, PII filtering | Cognitive Firewall, Personality Guard System |
| **Nexus** | 🔀 | Multi-provider routing, BYOK | Multi-Model Router, Provider Failover |
| **Vision** | 👁️ | Observability, health, analytics | Observability Dashboard, Session Analytics |
| **Dream** | 🌙 | Autonomous evolution, synthesis | Autonomous Improvement Loop, Learning Consolidation |
| **System** | ⚙️ | Core operations, lifecycle | System Monitoring, Quota Monitor |
| **Integration** | 🌐 | Enterprise adapters | Webhook Processor, API Gateway |
| **Cortex** | 🎯 | Agency orchestration | Multi-Agent Coordination, Task Planning |

### Template Collections

#### Drift Prevention Templates (12 templates)

The flagship collection addressing AI behavioral drift:

| Template | Price | Difficulty | Key Features |
|----------|-------|------------|--------------|
| Drift Prevention Engine | $399 | Elite | Memory Anchoring, Self-Correction Loops |
| Memory Persistence Core | $349 | Premium | 3-Tier Memory (Working/Episodic/Semantic) |
| Self-Healing Chatbot | $449 | Elite | Error Detection, Auto-Correction |
| Behavioral Anchor System | $299 | Premium | Personality Anchoring, Drift Thresholds |
| Context Continuity Engine | $299 | Premium | Session Bridging, Coherence Scoring |
| Autonomous Improvement Loop | $499 | Pro | Dream Cycles, Pattern Recognition |
| Personality Guard System | $349 | Premium | Identity Protection, Jailbreak Defense |
| Goal Persistence Module | $349 | Premium | Objective Memory, Deviation Alerts |
| Cognitive Firewall | $399 | Elite | Injection Detection, PII Filtering |
| Learning Consolidation Engine | $449 | Elite | Memory Synthesis, Dream Processing |
| Observability Dashboard | $299 | Premium | Drift Detection, Health Metrics |
| Knowledge Graph Builder | $399 | Elite | Semantic Graphs, Synthesis Engine |

#### Business Application Templates (10 templates)

Customer-facing AI for specific industries:

| Template | Price | Industry |
|----------|-------|----------|
| Smart Recommendation Engine | $349 | E-commerce |
| Support Memory Agent | $449 | Customer Service |
| Fitness Coach Brain | $299 | Health & Wellness |
| Wellness Companion Engine | $349 | Mental Health |
| Financial Advisor Brain | $399 | FinTech |
| HR Intelligence Agent | $499 | Human Resources |
| IT Helpdesk Brain | $399 | IT Support |
| Travel Planner Engine | $449 | Travel |
| Music Discovery Brain | $349 | Entertainment |
| Real Estate Agent Brain | $399 | Real Estate |

#### Complex Templates (11 templates)

Advanced multi-feature templates:

| Template | Price | Category |
|----------|-------|----------|
| Adaptive Learning Chatbot | $299 | Chatbot |
| Knowledge Base Brain | $349 | RAG |
| Personal Assistant Brain | $299 | Agent |
| Customer Support Agent | $399 | Agent |
| Content Creator Brain | $349 | Agent |
| Sales Intelligence Agent | $449 | Agent |
| Code Review Assistant | $449 | Utility |
| Research Analyst Engine | $499 | Agent |
| Educational Tutor Brain | $499 | Agent |
| Interview Coach Engine | $399 | Agent |
| Language Learning Engine | $449 | Agent |

---

## Rarity & Pricing System

The marketplace uses a 6-tier rarity system that maps to difficulty levels and pricing bands.

### Rarity Tiers

| Rarity | Difficulty | Price | Drop Chance | Avg Value |
|--------|------------|-------|-------------|-----------|
| **Common** | Beginner | $27 | 40% | $27 |
| **Uncommon** | Intermediate | $87 | 25% | $87 |
| **Rare** | Advanced | $147 | 18% | $147 |
| **Epic** | Premium | $299-$349 | 10% | $324 |
| **Legendary** | Elite | $399-$449 | 5% | $424 |
| **Mythic** | Pro | $499 | 2% | $499 |

### Visual Styling by Rarity

Each rarity tier has distinct visual styling:

```typescript
const RARITY_STYLES = {
  common: {
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/15',
    borderColor: 'border-slate-500/30',
    glowColor: 'shadow-slate-500/20',
  },
  uncommon: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
  },
  rare: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/30',
  },
  epic: {
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/30',
  },
  legendary: {
    color: 'text-amber-400',
    bgColor: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/40',
  },
  mythic: {
    color: 'text-rose-400',
    bgColor: 'bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-cyan-500/20',
    borderColor: 'border-rose-500/50',
  },
};
```

### Dynamic Naming System

Templates receive evocative "Persona" names generated via deterministic hashing:

**Examples:**
- "Unforgiving Dream Walker" (Mythic, Dream module)
- "Swift Memory Keeper" (Rare, Brain module)
- "Obsidian Guardian Prime" (Legendary, Defense module)

The original technical name is preserved as a subtitle.

---

## AI Template Generator

### Overview

The AI Template Generator is a premium marketplace feature that creates unique, AI-generated templates from 82,944+ possible combinations.

**Price:** $87 (Rare tier floor)

**Stripe IDs:**
- Product: `prod_TrRbgjWKs1zBh0`
- Price: `price_1StiieQ7FtTiAL4a9fPjQkPR`

### Combination Space

```
Total Combinations = 9 × 6 × 6 × 256 = 82,944

Where:
- 9 = Template categories
- 6 = Difficulty levels
- 6 = Rarity tiers
- 256 = Feature combination permutations
```

### Expected Value Calculation

The Generator price is set at the Rare tier floor ($87) to ensure it never underprices Rare, Epic, Legendary, or Mythic drops.

| Rarity | Chance | Value | Expected Contribution |
|--------|--------|-------|----------------------|
| Common | 40% | $27 | $10.80 |
| Uncommon | 25% | $87 | $21.75 |
| Rare | 18% | $147 | $26.46 |
| Epic | 10% | $324 | $32.40 |
| Legendary | 5% | $424 | $21.20 |
| Mythic | 2% | $499 | $9.98 |
| **Total Expected Value** | | | **$122.59** |

**Value Multiplier:** 1.4x average return on investment

### Generation Flow

1. User purchases Generator via Stripe checkout
2. Payment confirmation triggers generation
3. Weighted random roll determines rarity
4. AI generates unique template matching rarity
5. Template stored in `marketplace_generated_templates` table
6. User receives download access

---

## Bundles & Stacks

### Template Stacks

Curated collections designed for specific developer outcomes with 25-30% discounts.

| Stack | Templates | Discount | Outcome |
|-------|-----------|----------|---------|
| **Production Chatbot Stack** | 4 | 25% | Deploy self-healing AI chatbot with persistent memory in 2 hours |
| **Customer Support Stack** | 4 | 25% | AI support that remembers every customer and learns from tickets |
| **AI Learning Platform Stack** | 4 | 30% | AI that gets better overnight without manual retraining |
| **Enterprise Security Stack** | 4 | 25% | Military-grade prompt security and identity protection |

#### Production Chatbot Stack

**Templates Included:**
- Self-Healing Chatbot ($449)
- Memory Persistence Core ($349)
- Context Continuity Engine ($299)
- Cognitive Firewall ($399)

**Stripe IDs:**
- Product: `prod_TrTXD7AJqm3FHZ`
- Price: `price_1StkaXQ7FtTiAL4a58DIgguO`

### Volume Bundles

Bulk template packs with 30% discount.

| Bundle | Templates | Original | Bundle Price | Savings |
|--------|-----------|----------|--------------|---------|
| **Drift Prevention Essentials** | 5 | $1,636 | $1,145 | $491 (30%) |
| **Business AI Complete** | 10 | $3,774 | $2,642 | $1,132 (30%) |
| **Starter Pack** | 5 | $135 | $95 | $40 (30%) |

#### Drift Prevention Essentials Bundle

**Templates Included:**
- Drift Prevention Engine
- Memory Persistence Core
- Behavioral Anchor System
- Context Continuity Engine
- Observability Dashboard

**Stripe IDs:**
- Product: `prod_TrTXtPZf5SteaR`
- Price: `price_1StkaTQ7FtTiAL4a9XCkEqzj`

---

## Agency Licensing

Commercial licensing for agencies deploying AI for clients.

### Agency Tiers

| Tier | Monthly | Annual | Clients | Templates |
|------|---------|--------|---------|-----------|
| **Agency Starter** | $199 | $1,791 | 5 | 10 |
| **Agency Professional** | $499 | $4,491 | 25 | 30 |
| **Agency Enterprise** | $1,499 | $13,491 | Unlimited | All |

### Agency Starter

**Entitlements:**
- Commercial usage rights
- Up to 5 client deployments
- 6-month updates
- Email support

**Stripe IDs:**
- Product: `prod_TrTXujuZzhJkqG`
- Monthly Price: `price_1StkahQ7FtTiAL4a9vwzcf52`
- Annual Price: `price_1StkaiQ7FtTiAL4aHljLC4VK`

### Agency Professional

**Entitlements:**
- Commercial usage rights
- Up to 25 client deployments
- 12-month updates
- Priority support
- Optional rebranding

**Stripe IDs:**
- Product: `prod_TrTXmiUiQFerTZ`
- Monthly Price: `price_1StkakQ7FtTiAL4aSD0KP9Qh`
- Annual Price: `price_1StkalQ7FtTiAL4a7u9C048C`

### Agency Enterprise

**Entitlements:**
- Commercial usage rights
- Unlimited client deployments
- 24-month updates
- Dedicated support
- Full rebranding rights
- Source code access

**Stripe IDs:**
- Product: `prod_TrTXLKscsgEYvO`
- Monthly Price: `price_1StkanQ7FtTiAL4afkVK2zDQ`
- Annual Price: `price_1StkaoQ7FtTiAL4asIfm4Af0`

---

## Studio Licensing

High-ACV licensing for game studios and interactive experiences using World Engine.

### Studio Tiers

| Tier | Monthly | Annual | Key Features |
|------|---------|--------|--------------|
| **Studio Professional** | $999 | $8,991 | World Engine Core, NPC Memory, Dream Cycles |
| **Studio Enterprise** | $2,499 | $22,491 | Multi-Agent Coordination, White-Label, SLA |

### Studio Professional

**Includes:**
- World Engine Core
- NPC Memory System
- Dream Cycles
- Persistent World State
- Physics Integration
- BYOK Routing

**Stripe IDs:**
- Monthly Price: `price_1StkatQ7FtTiAL4aWqQYzs6O`
- Annual Price: `price_1StkauQ7FtTiAL4awoJFZ0Ct`

### Studio Enterprise

**Includes:**
- Everything in Professional
- Multi-Agent Coordination
- Entity Systems
- White-Label Rights
- Custom Integration Support
- SLA Guarantee

**Stripe IDs:**
- Monthly Price: `price_1StkawQ7FtTiAL4aM4CPyVFd`
- Annual Price: `price_1StkaxQ7FtTiAL4aXeYaVfcx`

---

## Rights Matrix

### License Comparison

| Right | Template | Bundle | Agency Starter | Agency Pro | Agency Enterprise | Studio | OS License |
|-------|----------|--------|----------------|------------|-------------------|--------|------------|
| Personal Use | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Commercial Use | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Internal Use | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Client Distribution | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rebrand | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Deployment | Single | Single | Multi | Multi | Unlimited | Unlimited | Single |
| BYOK Support | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Updates | 6 mo | 12 mo | 6 mo | 12 mo | 24 mo | Lifetime | Lifetime |
| Support | Community | Email | Email | Priority | Dedicated | Dedicated | Priority |

---

## Checkout & Payments

### Stripe Integration

All payments are processed through Stripe using the `marketplace-checkout` edge function.

#### Supported Payment Modes

| Product Type | Checkout Mode | Customer Creation |
|--------------|---------------|-------------------|
| Template | `payment` (one-time) | Always |
| Bundle | `payment` (one-time) | Always |
| Stack | `payment` (one-time) | Always |
| OS License | `payment` (one-time) | Always |
| World Engine | `payment` (one-time) | Always |
| Agency Pack | `subscription` (recurring) | Via subscription |
| Studio License | `subscription` (recurring) | Via subscription |

### Checkout Flow

```typescript
// Example checkout request
const { data, error } = await supabase.functions.invoke('marketplace-checkout', {
  body: {
    product_type: 'template', // 'os' | 'template' | 'bundle' | 'stack' | 'agency' | 'studio'
    price_id: 'price_xxx',
    product_id: 'prod_xxx',
    template_name: 'Optional template name',
    customer_email: 'optional@email.com', // For guest checkout
  },
});

// Redirect to Stripe checkout
window.open(data.url, '_blank');
```

### Success URLs

| Type | Success URL |
|------|-------------|
| All | `/marketplace/success?session_id={CHECKOUT_SESSION_ID}&type={product_type}` |
| Cancel | `/marketplace?canceled=true` |

---

## Technical Implementation

### Configuration Files

| File | Purpose |
|------|---------|
| `src/config/marketplace-products.ts` | Product definitions with Stripe IDs |
| `src/config/marketplace-bundles.ts` | Bundles, stacks, agency/studio configs |
| `src/config/marketplace-rarity.ts` | Rarity system configuration |
| `src/lib/templateNames.ts` | Dynamic name generation |

### Database Tables

| Table | Purpose |
|-------|---------|
| `marketplace_purchases` | Purchase records |
| `marketplace_generated_templates` | AI Generator outputs |
| `marketplace_template_stats` | View/like/purchase counts |
| `marketplace_user_interests` | User interaction tracking |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `marketplace-checkout` | Create Stripe checkout sessions |
| `marketplace-verify-license` | Validate licenses with SHA-256 |
| `marketplace-generate-template` | AI template generation |

### Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| `TemplateCard` | `src/components/marketplace/` | Template display cards |
| `TemplatePreviewModal` | `src/components/marketplace/` | Detailed template preview |
| `AITemplateGenerator` | `src/components/marketplace/` | Generator feature UI |
| `BundlesSection` | `src/components/marketplace/` | Bundles/stacks display |
| `AgencySection` | `src/components/marketplace/` | Agency/studio licensing |
| `BlurredCodePreview` | `src/components/marketplace/` | Trade secret protection |

### Security Features

1. **License Verification**: SHA-256 hash validation with domain binding
2. **Blurred Code Preview**: Protects trade secrets until purchase
3. **Observer Mode**: View-only access for non-purchasers
4. **RLS Policies**: Row-level security on all marketplace tables

---

## Capability Tags

Templates display capability badges for quick feature identification:

| Tag | Label | Category |
|-----|-------|----------|
| `persistent-memory` | Persistent Memory | Memory |
| `session-recall` | Session Recall | Memory |
| `cross-session` | Cross-Session | Memory |
| `drift-prevention` | Drift Prevention | Core USP |
| `self-healing` | Self-Healing | Core USP |
| `behavioral-lock` | Behavioral Lock | Core USP |
| `jailbreak-defense` | Jailbreak Defense | Security |
| `prompt-injection` | Injection Guard | Security |
| `pii-filter` | PII Filter | Security |
| `continuous-learning` | Continuous Learning | Learning |
| `dream-cycles` | Dream Cycles | Learning |
| `self-improvement` | Self-Improvement | Learning |
| `multi-provider` | Multi-Provider | Integration |
| `byok-ready` | BYOK Ready | Integration |
| `sdk-integration` | SDK Ready | Integration |

---

## Contact & Licensing

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMPSBL MARKETPLACE                           │
│                        v5.5.0                                   │
├─────────────────────────────────────────────────────────────────┤
│  Created By:        Kenneth E Sweet Jr                          │
│  Organization:      PromptFluid®                                │
├─────────────────────────────────────────────────────────────────┤
│  LICENSING & ACQUISITION                                        │
│  Email:   promptfluid@gmail.com                                 │
│  Phone:   (214) 548-0883                                        │
│  Web:     https://promptfluid.com                               │
├─────────────────────────────────────────────────────────────────┤
│  © 2025-2026 PromptFluid®. All rights reserved.                 │
│  CMPSBL® and promptfluid® are registered trademarks.            │
└─────────────────────────────────────────────────────────────────┘
```

---

*CMPSBL Marketplace v5.5.0 — Commercial Documentation*
*© 2025-2026 PromptFluid®. All rights reserved.*
