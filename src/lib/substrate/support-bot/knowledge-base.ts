/**
 * Support Bot Knowledge Base
 * Current CMPSBL product knowledge — Memory Stream, Pipeline Packs, Sealed Engines, and tiers.
 *
 * This module contains curated Q&A pairs that seed the support bot's
 * memory system with foundational product knowledge.
 */

import type { IntentCategory } from './types';

// ============================================================================
// Knowledge Entry Type
// ============================================================================

export interface KnowledgeEntry {
  id: string;
  question_pattern: string;
  answer: string;
  category: IntentCategory;
  keywords: string[];
  confidence: number;
  verified: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// ============================================================================
// Platform & Product Knowledge
// ============================================================================

export const PLATFORM_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'platform_001',
    question_pattern: 'What is CMPSBL?',
    answer: `CMPSBL® (Composable) is a classic car factory for software — a cognitive infrastructure substrate. It discovers capabilities in code, restores and hardens them, and sends them back production-ready.

Key characteristics:
• **Memory Stream** (The Scouts) — autonomous 8-hour discovery cycles finding capabilities nobody asked it to find
• **Ascension** (The Restoration Shop) — bring us your code, we scan, restore, and harden it with up to 20 primitives
• **40 Primitives** (The Craftsmen) — 12 Organs, 12 Layers, 8 Engines, 8 Agents powering everything
• **CJPI scoring** — every discovery is scored, priced, and placed in the Showroom
• No AI inside the output — pure algorithmic, production-ready code`,
    category: 'question',
    keywords: ['cmpsbl', 'composable', 'what is', 'factory', 'substrate'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'platform_002',
    question_pattern: 'What is the Memory Stream?',
    answer: `The Memory Stream is CMPSBL's continuous substrate of evolving software systems. It surfaces real, scored pipelines that you can crystallize and use.

How it works:
1. The Memory Stream continuously generates and evaluates pipelines
2. Each pipeline is scored for quality (minimum floor: 68+)
3. You can "crystallize" a pipeline — pulling it from the stream
4. After crystallization, choose Keep (store in vault) or Discard
5. Every pull is real, production-grade software

Daily crystallization limits depend on your tier:
• Builder (Free): 3 pulls / day — 5 vault capacity
• Studio ($29/mo): 6 pulls / day — 25 vault capacity
• Creator ($49/mo): 9 pulls / day — 75 vault capacity
• Architect ($79/mo): 12 pulls / day — Unlimited vault

Rare discoveries (Relic, Mythic, Apex) trigger special alerts. Mythic discoveries prompt vault upgrade if full. Artifact export is available for paid tiers only.`,
    category: 'question',
    keywords: ['memory stream', 'crystallize', 'pipeline', 'pulls', 'stream', 'vault', 'keep', 'discard'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'platform_003',
    question_pattern: 'What are Pipeline Packs?',
    answer: `Pipeline Packs are CMPSBL's modular capability system. There are 24 pipeline packs across 6 strategic domains. Each pack unlocks a specific set of capabilities.

How they work:
• Every pipeline pack uses exactly 1 slot
• Your plan controls how many slots you have
• Activation is atomic and server-enforced — no race conditions or overflows
• You can swap packs anytime within your slot capacity

Your tier determines your slot capacity. Choose the packs that match your workload and swap them as your needs change.`,
    category: 'question',
    keywords: ['pipeline packs', 'packs', 'slots', 'capabilities', 'activate'],
    confidence: 0.94,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'platform_004',
    question_pattern: 'What are Sealed Engines?',
    answer: `Sealed Engines are production-grade runtimes crystallized from high-scoring Memory Stream pipelines. They represent the highest-quality outputs from the system.

Key characteristics:
• Crystallized from pipelines that exceed quality thresholds
• Production-ready — designed for deployment, not experimentation
• Each engine is a self-contained runtime
• Available as standalone purchases ($39 each) — Composable Cognitives

Sealed Engines are the bridge from exploration (Memory Stream) to production deployment.`,
    category: 'question',
    keywords: ['sealed engines', 'engines', 'runtime', 'production', 'cognitives'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'platform_005',
    question_pattern: 'How does memory work?',
    answer: `CMPSBL uses a four-tier persistent memory system that never resets:

• Hot tier: 127 records, 7-day window — fast-access recent context
• Warm tier: 2,000 records, 30-day window — medium-term knowledge
• Cold tier: 200 records, retained forever — long-term important memories
• Legacy tier: Unlimited records, retained forever — historical archive

The system automatically demotes, compresses, and optimizes memory over time. Protected memory types are locked at 1.0 value with zero decay — they never fade.

Memory powers the entire substrate: the support bot, EVOLUTION, the NEXUS router, and every capability you use.`,
    category: 'question',
    keywords: ['memory', 'tiers', 'hot', 'warm', 'cold', 'legacy', 'persistent'],
    confidence: 0.94,
    verified: true,
    priority: 'high',
  },
  {
    id: 'platform_006',
    question_pattern: 'What is the NEXUS router?',
    answer: `The NEXUS router is CMPSBL's intelligent multi-provider AI routing system. Instead of being locked to a single AI provider, NEXUS routes your requests to the optimal model based on:

• Task type and complexity
• Cost optimization
• Latency requirements
• Provider availability

You can use OpenAI, Anthropic, Google AI, Mistral, open-source models, or any combination — NEXUS handles the routing transparently. This makes CMPSBL model-agnostic and provider-agnostic.`,
    category: 'question',
    keywords: ['nexus', 'router', 'ai routing', 'multi-provider', 'model'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'platform_007',
    question_pattern: 'Can the system improve itself?',
    answer: `Yes. CMPSBL includes governed self-EVOLUTION capabilities:

• The system proposes code improvements autonomously
• All proposals go through confidence gating
• Significant changes require human approval before being applied
• Every mutation is versioned and auditable

This isn't uncontrolled self-modification — it's governed EVOLUTION with full audit trails and safety checks enforced by the GOVERNANCE layer.`,
    category: 'question',
    keywords: ['improve', 'evolution', 'self-improving', 'evolve'],
    confidence: 0.92,
    verified: true,
    priority: 'high',
  },
];

// ============================================================================
// Pricing & Tiers Knowledge
// ============================================================================

export const PRICING_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'pricing_001',
    question_pattern: 'What are the pricing tiers?',
    answer: `CMPSBL offers four access tiers:

**Builder (Free) — $0/mo**
• 3 Memory Stream crystallizations per day
• Artifact Store access
• Persistent Memory
• Composition capabilities

**Studio — $29/mo**
• 6 crystallizations per day
• Expanded artifact store
• Executable capabilities
• Synergy pipelines

**Creator — $49/mo**
• 9 crystallizations per day
• Cross-system orchestration
• Larger memory allocation
• Priority support

**Architect — $79/mo**
• 12 crystallizations per day
• Organization workspaces
• Full governance controls
• SLA support

Start free — no credit card required. Upgrade anytime at /upgrade.`,
    category: 'question',
    keywords: ['pricing', 'tiers', 'cost', 'price', 'how much', 'plans', 'free'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'pricing_002',
    question_pattern: 'Is there a free tier?',
    answer: `Yes! The Builder tier is completely free:

• 3 Memory Stream crystallizations per day
• Full access to the Artifact Store
• Persistent Memory
• Composition capabilities
• 3 pipeline slots included

No credit card required. Create an account and start immediately. You can upgrade to Studio ($29), Creator ($49), or Architect ($79) anytime.`,
    category: 'question',
    keywords: ['free', 'trial', 'free tier', 'builder', 'no cost'],
    confidence: 0.94,
    verified: true,
    priority: 'high',
  },
  {
    id: 'pricing_003',
    question_pattern: 'How many crystallizations do I get per day?',
    answer: `Daily Memory Stream crystallization limits by tier:

• Builder (Free): 3 per day — vault stores up to 5 pipelines
• Studio ($29/mo): 6 per day — vault stores up to 25 pipelines
• Creator ($49/mo): 9 per day — vault stores up to 75 pipelines
• Architect ($79/mo): 12 per day — unlimited vault storage

Each crystallization reveals a pipeline. You choose to Keep (store in vault) or Discard. Limits reset daily. Artifact export available for paid tiers only. Creator+ can equip custom pipeline slots.`,
    category: 'question',
    keywords: ['crystallizations', 'pulls', 'daily', 'limit', 'how many', 'vault'],
    confidence: 0.95,
    verified: true,
    priority: 'high',
  },
  {
    id: 'pricing_004',
    question_pattern: 'What are Composable Cognitives?',
    answer: `Composable Cognitives are standalone, production-grade AI capabilities you can purchase individually for $39 each.

They are Sealed Engines — crystallized from high-scoring Memory Stream pipelines. Each Cognitive is a self-contained runtime you can deploy independently.

Composable Cognitives work with any tier and don't require a subscription. They're ideal if you want a specific capability without committing to a higher plan.`,
    category: 'question',
    keywords: ['cognitives', 'standalone', '$39', 'composable', 'purchase'],
    confidence: 0.92,
    verified: true,
    priority: 'high',
  },
  {
    id: 'pricing_005',
    question_pattern: 'How do I upgrade my plan?',
    answer: `To upgrade your CMPSBL plan:

1. Sign in to your account
2. Navigate to /upgrade
3. Select your desired tier (Studio, Creator, or Architect)
4. Complete checkout via Stripe
5. Your new tier activates immediately

Upgrades are prorated — you only pay the difference for the remaining billing period. You can upgrade at any time.`,
    category: 'how_to',
    keywords: ['upgrade', 'change plan', 'higher tier', 'switch'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
];

// ============================================================================
// Getting Started Knowledge
// ============================================================================

export const GETTING_STARTED_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'start_001',
    question_pattern: 'How do I get started?',
    answer: `Getting started with CMPSBL is simple:

1. **Create an account** — Sign up for free at /auth. No credit card required.
2. **Explore the Memory Stream** — Visit /memory-stream to see crystallized pipelines
3. **Activate Pipeline Packs** — Choose capabilities that match your workload from 24 available packs across 6 strategic domains
4. **Start crystallizing** — Pull pipelines from the Memory Stream (3 free pulls per day), then Keep or Discard each discovery

Your free Builder tier gives you 3 pipeline slots, 5 vault capacity, and 3 daily pulls. Upgrade anytime for more slots, vault space, and artifact export.`,
    category: 'how_to',
    keywords: ['get started', 'begin', 'start', 'new user', 'sign up', 'onboarding'],
    confidence: 0.94,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'start_002',
    question_pattern: 'How do I create an account?',
    answer: `To create a CMPSBL account:

1. Go to /auth
2. Click "Sign Up"
3. Enter your email address and create a password
4. Check your email for a verification link
5. Click the link to verify your account
6. Sign in and you're ready to go

You'll start on the Builder (Free) tier with 3 pipeline slots and 3 daily Memory Stream crystallizations. No credit card required.`,
    category: 'how_to',
    keywords: ['account', 'create', 'sign up', 'register', 'join'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'start_003',
    question_pattern: 'How do I reset my password?',
    answer: `To reset your password:

1. Go to the login page at /auth
2. Click "Forgot Password"
3. Enter your registered email
4. Check your inbox for a reset link
5. Click the link and set a new password

Reset links expire after 24 hours. If you don't receive the email, check your spam folder or contact support@cmpsbl.com.`,
    category: 'account',
    keywords: ['password', 'reset', 'forgot', 'login', 'access'],
    confidence: 0.91,
    verified: true,
    priority: 'high',
  },
];

// ============================================================================
// Security & Architecture Knowledge
// ============================================================================

export const SECURITY_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'security_001',
    question_pattern: 'Is CMPSBL secure?',
    answer: `Yes. Security is built into the core of CMPSBL through the DEFENSE system:

• Rate limiting and bot detection
• Input sanitization on all endpoints
• Passwordless WebAuthn authentication support
• Complete audit logging via the AUDIT system
• Row Level Security (RLS) on all user data
• Encryption at rest and in transit (TLS 1.3)

The DEFENSE system is an outer containment boundary — a mesh overlay that spans all systems. All access attempts are monitored, logged, and analyzed for threats.

CMPSBL follows compliance-ready patterns for SOC 2 and GDPR.`,
    category: 'question',
    keywords: ['secure', 'security', 'safe', 'defense', 'privacy', 'data'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'security_002',
    question_pattern: 'How is CMPSBL different from LangChain?',
    answer: `CMPSBL and LangChain serve different purposes:

| Aspect | LangChain | CMPSBL |
|--------|-----------|--------|
| Type | Library | Infrastructure |
| Memory | You build it | Built-in, multi-tier |
| Learning | None | Autonomous |
| Security | You build it | Built-in (DEFENSE) |
| EVOLUTION | None | Self-improving |
| AI Routing | Manual | NEXUS router (automatic) |

LangChain is a toolkit for chaining LLM calls. CMPSBL is the infrastructure layer underneath — persistent memory, governed EVOLUTION, security, and intelligent routing all built in.`,
    category: 'question',
    keywords: ['langchain', 'different', 'compare', 'vs', 'comparison'],
    confidence: 0.92,
    verified: true,
    priority: 'high',
  },
];

// ============================================================================
// Support & Contact Knowledge
// ============================================================================

export const SUPPORT_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'support_001',
    question_pattern: 'How do I contact support?',
    answer: `You can reach CMPSBL support through:

**Email:** support@cmpsbl.com
Response time: within 48 hours

**Self-service options:**
• This Support Bot (available 24/7, memory-backed)
• Documentation at /documentation
• FAQ section on this page (searchable)

**For account or billing questions:**
Email support@cmpsbl.com with your account email and details.

If the support bot can't resolve your issue, click "Escalate to Human" and we'll follow up via email.`,
    category: 'account',
    keywords: ['contact', 'support', 'help', 'reach', 'email', 'human'],
    confidence: 0.94,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'support_002',
    question_pattern: 'Can I talk to a human?',
    answer: `Absolutely. You have two options:

1. **Escalate from this chat** — Click "Escalate to Human" and we will follow up at support@cmpsbl.com within 48 hours.

2. **Email directly** — Send your question to support@cmpsbl.com. Include your account email and a description of your issue.

The support bot handles common questions instantly, but we always prioritize getting you to a human when you need one. We never guess — if the bot isn't confident, it escalates automatically.`,
    category: 'account',
    keywords: ['human', 'person', 'real person', 'talk to someone', 'escalate'],
    confidence: 0.94,
    verified: true,
    priority: 'high',
  },
  {
    id: 'support_003',
    question_pattern: 'Where is the documentation?',
    answer: `CMPSBL documentation is available at /documentation. It covers:

• Getting started guides
• Memory Stream and Pipeline Pack usage
• Architecture overview
• API reference
• Security and governance documentation

You can also browse the Evolution Log at /changelog for recent updates. For questions not covered in the docs, ask this support bot or email support@cmpsbl.com.`,
    category: 'question',
    keywords: ['documentation', 'docs', 'guides', 'reference', 'library'],
    confidence: 0.91,
    verified: true,
    priority: 'high',
  },
  {
    id: 'support_004',
    question_pattern: 'What browsers are supported?',
    answer: `CMPSBL supports all modern browsers:

**Fully supported:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
**Mobile:** iOS Safari 14+, Chrome Mobile, Samsung Internet
**Not supported:** Internet Explorer, browsers with JavaScript disabled

For the best experience, use the latest version of Chrome or Firefox on desktop.`,
    category: 'troubleshoot',
    keywords: ['browser', 'supported', 'chrome', 'firefox', 'safari', 'mobile'],
    confidence: 0.88,
    verified: true,
    priority: 'medium',
  },
  {
    id: 'support_005',
    question_pattern: 'I have a billing issue',
    answer: `For billing issues, email support@cmpsbl.com with:

• Your account email
• Description of the issue (charge question, refund request, etc.)
• Any relevant order or transaction IDs

We'll respond within 48 hours. All payments are processed securely through Stripe.

If you need to cancel or change your plan, you can do so from your account settings or by contacting us.`,
    category: 'account',
    keywords: ['billing', 'charge', 'refund', 'payment', 'invoice', 'cancel'],
    confidence: 0.90,
    verified: true,
    priority: 'high',
  },
];

// ============================================================================
// Combined Knowledge Base
// ============================================================================

export const FULL_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  ...PLATFORM_KNOWLEDGE,
  ...PRICING_KNOWLEDGE,
  ...GETTING_STARTED_KNOWLEDGE,
  ...SECURITY_KNOWLEDGE,
  ...SUPPORT_KNOWLEDGE,
];

// ============================================================================
// Knowledge Categories for Quick Access
// ============================================================================

export const KNOWLEDGE_CATEGORIES = {
  platform: PLATFORM_KNOWLEDGE,
  pricing: PRICING_KNOWLEDGE,
  getting_started: GETTING_STARTED_KNOWLEDGE,
  security: SECURITY_KNOWLEDGE,
  support: SUPPORT_KNOWLEDGE,
} as const;

export type KnowledgeCategory = keyof typeof KNOWLEDGE_CATEGORIES;
