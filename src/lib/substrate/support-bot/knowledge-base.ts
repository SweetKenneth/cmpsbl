/**
 * Support Bot Knowledge Base
 * Current CMPSBL® product knowledge — Memory Stream, Ascension, Mana, Shield,
 * NEXUS, the 40 Primitives, the 13 @cmpsbl NPM packages, and tier policy.
 *
 * This module contains curated Q&A pairs that seed the support bot's
 * memory system with foundational product knowledge.
 *
 * Tiers (canonical for this surface): Builder $0 · Studio $29 · Creator $49 · Architect $79
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
    answer: `**CMPSBL®** (Composable) is a **Governed Cognitive Infrastructure** substrate — not a framework, not a wrapper, not an agent platform. It provides deterministic orchestration for AI systems: routing, memory, learning cycles, defense, and execution coordination. Model-agnostic and provider-agnostic.

Core surfaces:
• **Memory Stream** — autonomous 8-hour discovery cycles surfacing software pipelines nobody asked for
• **Ascension** — bring us your code; we classify it, collide it against the 40 Primitives, score it via CJPI, and certify it
• **Mana** — silent Layer 2 attachment that wraps and protects existing code without modifying source
• **Shield** — LLM prompt defense, hallucination grounding, and governance-gated audit receipts
• **NEXUS** — multi-provider AI router (the default — never Lovable AI)
• **Crown Jewels** — selectable high-value layers that merge into Layer 2 during Ascension export

Built by one person. Pure TypeScript. Zero external AI calls in Ascension or DREAM — confirmed.`,
    category: 'question',
    keywords: ['cmpsbl', 'composable', 'what is', 'substrate', 'governed cognitive infrastructure'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'platform_002',
    question_pattern: 'What is the Memory Stream?',
    answer: `The **Memory Stream** is CMPSBL's autonomous discovery substrate. It runs on **8-hour cycles** — never triggered by user input — and continuously surfaces real, scored software pipelines.

How it works:
1. The stream observes substrate behavior and crystallizes reusable pipelines
2. Each pipeline is scored via **CJPI** (Novelty · Utility · Complexity · Composability) with a minimum floor of 68
3. You can **crystallize** a pipeline — pulling it from the stream into your vault
4. After crystallization, choose **Keep** (store in vault) or **Discard**
5. Every pull is real, production-grade software — never mock, never simulated
6. APEX and MYTHIC discoveries trigger hardware-language emission (VHDL, Verilog, GLSL, WGSL)

Daily crystallization limits by tier:
• **Builder** ($0): 3 pulls/day · 5 vault slots
• **Studio** ($29/mo): 6 pulls/day · 25 vault slots
• **Creator** ($49/mo): 9 pulls/day · 75 vault slots
• **Architect** ($79/mo): 12 pulls/day · unlimited vault

Mythic discoveries prompt a vault upgrade if full. Artifact export is paid-tier only.`,
    category: 'question',
    keywords: ['memory stream', 'crystallize', 'pipeline', 'pulls', 'stream', 'vault', 'keep', 'discard', 'cjpi'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'platform_003',
    question_pattern: 'What is Ascension?',
    answer: `**Ascension** is CMPSBL's code restoration pipeline. Bring it your source — Python, TypeScript, Rust, Go, any of 90+ languages — and Ascension:

1. **Classifies** the code (the #41 step — what archetype is this?)
2. **Collides** it against the **40 Primitives** to find which capabilities apply
3. **Scores** it via **CJPI** (Novelty · Utility · Complexity · Composability)
4. **Certifies** it with a deterministic FNV-1a fingerprint
5. **Exports** a Dual-Layer artifact — your original code wrapped with **Mana** Layer 2, plus an activation guide and docs

Zero external AI calls — confirmed. Every Ascension produces a verifiable fingerprint you can later look up via the DECODE chat (just paste the ID). Includes Ascension Center records, CLI Ascension records, and Vertical Ascension records (Cyber, Fintech, Robotics, etc.).

Ascension is on the **Architect** tier. Mana export is included.`,
    category: 'question',
    keywords: ['ascension', 'restoration', 'fingerprint', 'cjpi', 'classify', 'collision', 'export'],
    confidence: 0.94,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'platform_004',
    question_pattern: 'What is Mana?',
    answer: `**Mana** is CMPSBL's silent software symbiosis engine — the substrate's Layer 2 deployment and defense runtime. Patent: U.S. App. No. 64/031,637.

What it does:
• Wraps host software at **function boundaries** without modifying source
• Operates as a contract-driven runtime governed by **Lex** (the layer's conscience)
• Provides 92 capabilities unified with Ascension findings
• Supports session-scoped engine instances for multi-module safety
• Generates cryptographic proofs and telemetry on every attachment

Install:
\`\`\`bash
npm install -g @cmpsbl/mana
\`\`\`

Phases:
- **Phase 0**: Engine core + single-package attachment
- **Phase 1**: Runtime loader + multi-package composition + manifest consumer

Mana is the distribution channel for all substrate software. In **Ascension Step 2 (Enhance)**, you select Crown Jewels that get merged into the Mana wrapper for export.`,
    category: 'question',
    keywords: ['mana', 'layer 2', 'attachment', 'symbiosis', 'wrap', 'lex', 'governance'],
    confidence: 0.94,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'platform_005',
    question_pattern: 'What is Shield?',
    answer: `**Shield** (\`@cmpsbl/shield\`) is the substrate's LLM prompt defense and governance package — a zero-dependency, standalone runtime (~27KB).

Capabilities (cross-vertical primitive selection):
• **LLM vertical**: VERITAS, RAMPART, SIEVE, GAUNTLET
• **Cyber vertical**: BASTION, WATCHTOWER
• **Spine**: DEFENSE, GOVERNANCE, CONSCIENCE, COMPASS, AUDIT, BEACON

What it scans for:
• Prompt injection attempts
• Hallucinations (with grounding reports)
• Output sanitization issues
• Governance policy violations

Every run produces a **ShieldReceipt** — a governance-gated audit trail. Install: \`npm install @cmpsbl/shield\`.

Shield is the antidote to the LLM threat surface. Use it in front of any model call.`,
    category: 'question',
    keywords: ['shield', 'prompt defense', 'injection', 'hallucination', 'governance', 'receipt'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'platform_006',
    question_pattern: 'What is the NEXUS router?',
    answer: `**NEXUS** is CMPSBL's multi-provider AI Organ — the default router across the substrate. It eliminates vendor lock-in by dynamically routing across 14+ providers (OpenAI, Anthropic, Google, Mistral, open-source, and more).

Routing decisions consider:
• Task type and complexity
• Cost optimization
• Latency requirements
• Provider availability and quota state

CMPSBL **never** uses Lovable AI — NEXUS is the only routing layer. This makes the substrate model-agnostic and provider-agnostic at every layer.`,
    category: 'question',
    keywords: ['nexus', 'router', 'ai routing', 'multi-provider', 'model', 'organ'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'platform_007',
    question_pattern: 'What are the 40 Primitives?',
    answer: `CMPSBL enforces a strict **12·12·8·8** matrix — 40 independently deployable, composable primitives across 4 categories:

**Layers (12)** — Ambient protection
DEFENSE · IMMUNITY · GOVERNANCE · TREATY · EVOLUTION · REFLEX · COMPASS · INTEGRATION · INTENT · ACCESS · VISION · SHADOW

**Organs (12)** — Vital infrastructure
CORE · SYSTEM · BRAIN · MEMORY · NERVE · NEXUS · IDENTITY · SOVEREIGN · ATLAS · MEDIC · RELAY · CONSCIENCE

**Engines (8)** — Invoked processing
DREAM · HARVEST · FORGE · LINGUA · ECHO · PHANTOM · SANDBOX · RIPPLE

**Agents (8)** — Autonomous actors
ENCODE · DECODE · AUDIT · ECONOMY · INCLUSIVE · CORTEX · ORACLE · ENGINEER

Organs and Layers are observable — never directly interactive. Primitives never call each other directly; everything routes through the Intent Router.`,
    category: 'question',
    keywords: ['40 primitives', 'organs', 'layers', 'engines', 'agents', 'matrix', 'architecture'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'platform_008',
    question_pattern: 'What are Crown Jewels?',
    answer: `**Crown Jewels** are selectable, high-value layers that merge into Mana's Layer 2 during Ascension export. They auto-wire to your customer functions.

Characteristics:
• Each Crown Jewel is a self-contained Layer 2 capability
• Selection happens in **Ascension Step 2 (Enhance)**
• Wired into the customer's function boundaries — no source modification needed
• Exposed/unexposed status is the founder's decision; the catalog evolves

S-Tier Crown Jewels are production-ready, exportable standalone software with full functional completeness.`,
    category: 'question',
    keywords: ['crown jewels', 'crown jewel', 'jewel', 'enhance', 'layer 2', 'ascension step 2'],
    confidence: 0.92,
    verified: true,
    priority: 'high',
  },
  {
    id: 'platform_009',
    question_pattern: 'What is the DREAM Engine?',
    answer: `The **DREAM Engine** is CMPSBL's pure-algorithmic synthesis engine. **No AI inside — confirmed.** It performs sub-threshold pattern emergence and pre-conscious synthesis.

What it does:
• Produces patentable synthesis from substrate behavior
• Operates beneath the conscious-decision threshold
• Recursive re-ingestion of its own outputs
• Never accepts or generates AI calls — pure algorithm only

DREAM feeds discoveries to the Memory Stream and powers the substrate's emergent capability layer.`,
    category: 'question',
    keywords: ['dream', 'dream engine', 'synthesis', 'algorithmic', 'emergent', 'patent'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'platform_010',
    question_pattern: 'How does memory work?',
    answer: `CMPSBL uses a **four-tier persistent memory** system that never resets:

• **Hot tier**: 127 records, 7-day window — fast-access recent context
• **Warm tier**: 2,000 records, 30-day window — medium-term knowledge
• **Cold tier**: 200 records, retained forever — long-term important memories
• **Legacy tier**: Unlimited, retained forever — historical archive

Memory automatically demotes, compresses, and optimizes. Protected memory types lock at 1.0 value with zero decay — they never fade. Memory powers DECODE, EVOLUTION, NEXUS routing, and every substrate capability.`,
    category: 'question',
    keywords: ['memory', 'tiers', 'hot', 'warm', 'cold', 'legacy', 'persistent'],
    confidence: 0.94,
    verified: true,
    priority: 'high',
  },
  {
    id: 'platform_011',
    question_pattern: 'Can the system improve itself?',
    answer: `Yes — through the **EVOLUTION Layer** (formerly MODERNIZER). It's governed self-improvement, not uncontrolled mutation.

Flow:
1. EVOLUTION proposes code improvements autonomously
2. Every proposal passes through confidence gating
3. Significant changes require human approval
4. All mutations are versioned and auditable via the AUDIT Agent
5. The GOVERNANCE Layer enforces every safety check

Plus the **Immunity Matrix** runs a Shadow → Simulation → Promotion pipeline for autonomous self-healing.`,
    category: 'question',
    keywords: ['improve', 'evolution', 'self-improving', 'evolve', 'immunity'],
    confidence: 0.92,
    verified: true,
    priority: 'high',
  },
];

// ============================================================================
// NPM Package Knowledge
// ============================================================================

export const PACKAGE_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'pkg_001',
    question_pattern: 'What NPM packages does CMPSBL publish?',
    answer: `**13 packages** published under the **@cmpsbl** scope. All zero-dependency Tier 1 packages can install in any order.

**Tier 1 (standalone)**
• \`@cmpsbl/types\` — Core type definitions
• \`@cmpsbl/runtime\` — CJPI scoring, manifests, pipelines
• \`@cmpsbl/sdk\` — Authenticated client for all 54 hosted engines + Memory Stream
• \`@cmpsbl/intent\` — Intent router + resolver dispatch
• \`@cmpsbl/mesh\` — Mesh telemetry events
• \`@cmpsbl/bridge\` — Polyglot bridge adapters (Python/Go/Rust)
• \`@cmpsbl/discovery\` — Pipeline crystallization engine
• \`@cmpsbl/failsafe\` — Disaster recovery & migration
• \`@cmpsbl/shield\` — LLM prompt defense + governance
• \`@cmpsbl/mana\` — Silent software symbiosis engine

**Tier 2 (depend on Tier 1)**
• \`@cmpsbl/cli\` — CLI with guided onboarding
• \`@cmpsbl/test-harness\` — Pipeline & bridge validation
• \`@cmpsbl/react\` — React hooks (useIntent, useMesh, useRuntime)

License: Apache-2.0. Patents: U.S. App. No. 64/029,678 (Ascension™) and 64/031,637 (Mana™).`,
    category: 'question',
    keywords: ['npm', 'packages', '@cmpsbl', 'install', 'sdk', 'tier'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'pkg_002',
    question_pattern: 'How do I install the SDK?',
    answer: `\`\`\`bash
npm install @cmpsbl/sdk
\`\`\`

Zero dependencies. Self-contained. Quick start:

\`\`\`typescript
import { CMPSBL } from '@cmpsbl/sdk';

const cmpsbl = new CMPSBL({ apiKey: 'your-api-key' });

// Discovery starts automatically on first contact
const discovery = await cmpsbl.discover({ input: 'track user behavior' });

if (discovery.detected) {
  await cmpsbl.capture(discovery.memory.id);
  await cmpsbl.apply(discovery.memory.id);
}
\`\`\`

For direct engine calls:
\`\`\`typescript
import { Engine } from '@cmpsbl/sdk';
const engine = new Engine('your-api-key');
const result = await engine.call('cortex', 'reason', 'Analyze market trends');
\`\`\``,
    category: 'how_to',
    keywords: ['sdk', 'install', 'npm install', 'getting started', 'api key'],
    confidence: 0.94,
    verified: true,
    priority: 'high',
  },
  {
    id: 'pkg_003',
    question_pattern: 'How do I install the CLI or Mana?',
    answer: `**Legacy CLI** (Tier 2, includes runtime):
\`\`\`bash
npm install -g @cmpsbl/cli
cmpsbl --help
\`\`\`

**Mana** (Layer 2 attachment runtime):
\`\`\`bash
npm install -g @cmpsbl/mana
mana attach ./your-package
\`\`\`

Mana includes the \`doctor\` diagnostic command for parallel health checks. Both CLIs sync with your developer identity across the website, terminal, and API.`,
    category: 'how_to',
    keywords: ['cli', 'mana cli', 'install', 'global', 'npm install -g', 'doctor'],
    confidence: 0.93,
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
• 3 Memory Stream crystallizations / day
• 5 vault slots · 3 pipeline slots
• Marketplace browsing · persistent memory
• Composition capabilities

**Studio — $29/mo**
• 6 crystallizations / day · 25 vault slots
• Expanded artifact store · executable capabilities
• Synergy pipelines · artifact export

**Creator — $49/mo**
• 9 crystallizations / day · 75 vault slots
• Cross-system orchestration · larger memory allocation
• Custom pipeline slots · priority support

**Architect — $79/mo**
• 12 crystallizations / day · unlimited vault
• Full **Ascension** access · Mana export
• Organization workspaces · governance controls
• SLA support

Start free — no credit card required. Upgrade anytime at \`/upgrade\`.`,
    category: 'question',
    keywords: ['pricing', 'tiers', 'cost', 'price', 'how much', 'plans', 'free', 'builder', 'studio', 'creator', 'architect'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'pricing_002',
    question_pattern: 'Is there a free tier?',
    answer: `Yes — the **Builder** tier is completely free:

• 3 Memory Stream crystallizations / day
• 5 vault slots
• 3 pipeline slots
• Marketplace browsing
• Persistent memory across sessions
• Composition capabilities

No credit card required. Sign up at \`/auth\` and you're in. Upgrade to Studio ($29), Creator ($49), or Architect ($79) anytime.`,
    category: 'question',
    keywords: ['free', 'free tier', 'builder', 'no cost', 'trial'],
    confidence: 0.94,
    verified: true,
    priority: 'high',
  },
  {
    id: 'pricing_003',
    question_pattern: 'How many crystallizations do I get per day?',
    answer: `Daily Memory Stream crystallization limits by tier:

• **Builder** ($0): 3/day · 5 vault slots
• **Studio** ($29): 6/day · 25 vault slots
• **Creator** ($49): 9/day · 75 vault slots
• **Architect** ($79): 12/day · unlimited vault

Each crystallization reveals a real, scored pipeline. Choose **Keep** (vault) or **Discard**. Limits reset daily. Artifact export is paid-tier only. Creator and above can equip custom pipeline slots.`,
    category: 'question',
    keywords: ['crystallizations', 'pulls', 'daily', 'limit', 'how many', 'vault'],
    confidence: 0.95,
    verified: true,
    priority: 'high',
  },
  {
    id: 'pricing_004',
    question_pattern: 'What are Composable Cognitives?',
    answer: `**Composable Cognitives** are standalone, production-grade AI capabilities you can purchase individually for **$39 each**.

They're **Sealed Engines** — crystallized from high-scoring Memory Stream pipelines. Each Cognitive is a self-contained runtime you can deploy independently, with no subscription required.

Available across the **Marketplace**, **Showroom** (curated by MERCHANT), and **Foundry**. They work with any tier — ideal when you want a specific capability without committing to a higher plan.`,
    category: 'question',
    keywords: ['cognitives', 'composable cognitives', 'standalone', '$39', 'sealed engines', 'purchase', 'marketplace'],
    confidence: 0.92,
    verified: true,
    priority: 'high',
  },
  {
    id: 'pricing_005',
    question_pattern: 'How do I upgrade my plan?',
    answer: `To upgrade your CMPSBL plan:

1. Sign in to your account
2. Navigate to \`/upgrade\`
3. Select your tier (Studio $29, Creator $49, or Architect $79)
4. Complete checkout via Stripe
5. Your tier activates immediately

Upgrades are prorated. Downgrade takes effect at end of billing period; data retained 30 days after downgrade.`,
    category: 'how_to',
    keywords: ['upgrade', 'change plan', 'higher tier', 'switch', 'downgrade'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'pricing_006',
    question_pattern: 'What are Pipeline Packs?',
    answer: `**Pipeline Packs** are CMPSBL's modular capability system — **24 packs across 6 strategic domains**. Each pack unlocks a specific set of capabilities.

How they work:
• Every pipeline pack uses exactly **1 slot**
• Your tier controls how many slots you have
• Activation is **atomic and server-enforced** — no race conditions, no overflow
• Swap packs anytime within your slot capacity

Slot allocation:
• Builder: 3 slots · Studio: 6 slots · Creator: 12 slots · Architect: unlimited

Choose packs that match your workload and rotate them as your needs change.`,
    category: 'question',
    keywords: ['pipeline packs', 'packs', 'slots', 'capabilities', 'activate', 'swap'],
    confidence: 0.94,
    verified: true,
    priority: 'high',
  },
];

// ============================================================================
// Marketplace & Storefronts Knowledge
// ============================================================================

export const MARKETPLACE_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'market_001',
    question_pattern: 'What is the Marketplace?',
    answer: `The **CMPSBL Marketplace** is the unified storefront for substrate output. It includes three rotating surfaces on a **4-hour alternating drop schedule**:

• **Showroom** — MERCHANT-curated items, priced $10–$50 based on quality
• **Junkyard** — Salvageable parts at restoration discounts (the unpolished side)
• **Foundry** — Higher-tier products graduated from Memory Stream discoveries via the Autonomous Product Compiler

Every item carries a **Substrate-Class Badge** indicating its lineage from a canonical primitive. All sales include a unique deterministic fingerprint for verification.`,
    category: 'question',
    keywords: ['marketplace', 'showroom', 'junkyard', 'foundry', 'store', 'shop', 'buy'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'market_002',
    question_pattern: 'What is the Junkyard?',
    answer: `The **Junkyard** is the marketplace's salvageable parts surface. Items here are functional but incomplete — missing features, partial implementations, or specific edge-case gaps. Each lists:

• Original value vs. discounted restoration cost
• Quality score (typically 38–61)
• What's missing and what works

It's a separate surface from the **Foundry**, which carries higher-tier products. Browse at \`/junkyard\`.`,
    category: 'question',
    keywords: ['junkyard', 'salvageable', 'parts', 'restoration', 'discount'],
    confidence: 0.91,
    verified: true,
    priority: 'medium',
  },
];

// ============================================================================
// Getting Started Knowledge
// ============================================================================

export const GETTING_STARTED_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'start_001',
    question_pattern: 'How do I get started?',
    answer: `Getting started with CMPSBL:

1. **Create an account** — Sign up free at \`/auth\`. No credit card.
2. **Explore the Memory Stream** — Visit \`/memory-stream\` to see crystallized pipelines
3. **Activate Pipeline Packs** — Pick capabilities matching your workload (3 slots free)
4. **Pull from the stream** — 3 free crystallizations/day. Keep or Discard each.
5. **Try the SDK** — \`npm install @cmpsbl/sdk\` and follow the quickstart
6. **Add Mana** (optional) — Wrap an existing package with \`npm install -g @cmpsbl/mana\`

Builder tier covers everything you need to evaluate the substrate. Upgrade for Ascension, more pulls, larger vault, and artifact export.`,
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

1. Go to \`/auth\`
2. Sign up with email + password, or use Google OAuth, Magic Link, or WebAuthn (passwordless)
3. Verify your email via the link we send
4. You land on the **Builder** (free) tier — 3 pipeline slots, 5 vault slots, 3 daily crystallizations

No credit card required. Authentication is hardened with rate limiting, geo-anomaly detection, and IP allowlisting for governor accounts.`,
    category: 'how_to',
    keywords: ['account', 'create', 'sign up', 'register', 'join', 'auth'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'start_003',
    question_pattern: 'How do I reset my password?',
    answer: `To reset your password:

1. Go to \`/auth\`
2. Click "Forgot Password"
3. Enter your registered email
4. Check inbox for the reset link (expires in 24h)
5. Set a new password

Or use a passwordless option: Magic Link or WebAuthn (biometric). If the email doesn't arrive, check spam or contact **support@cmpsbl.com**.`,
    category: 'account',
    keywords: ['password', 'reset', 'forgot', 'login', 'access', 'magic link', 'webauthn'],
    confidence: 0.91,
    verified: true,
    priority: 'high',
  },
  {
    id: 'start_004',
    question_pattern: 'How do I look up an Ascension fingerprint?',
    answer: `Just paste the fingerprint ID (8+ hex chars) into this chat. DECODE auto-detects fingerprints and searches across:

• **Ascension Center** records (web-run ascensions)
• **CLI Ascension** records (terminal-run)
• **Vertical Ascension** records (Cyber, Fintech, Robotics, Gaming, Health, etc.)

You'll see the CJPI score, primitives applied, capabilities added, language, archetype, and full metadata. Then ask follow-up questions — DECODE keeps the session context loaded for the rest of the conversation.`,
    category: 'how_to',
    keywords: ['fingerprint', 'lookup', 'ascension', 'verify', 'cjpi', 'serial'],
    confidence: 0.94,
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
    answer: `Yes. Security is built into the substrate via the **DEFENSE Layer** (Primitive #1) — a 6-layer Cognitive Security Matrix:

1. **Perimeter** — rate limiting, bot detection
2. **Identity** — passwordless auth, role checks via security definer functions
3. **Protocol** — input sanitization, TLS 1.3 in transit, encryption at rest
4. **Execution** — sandboxing, governance gates
5. **Audit** — immutable audit chain via the AUDIT Agent
6. **Response** — automated threat response, IP allowlisting

Plus:
• **Row Level Security (RLS)** on every user-owned table
• **Shield** for LLM-layer prompt defense
• **GOVERNANCE Layer** policy enforcement
• Compliance-ready patterns for SOC 2 and GDPR
• 5-pass enterprise hardening audit completed

User roles live in a separate \`user_roles\` table — never on profiles — to prevent privilege escalation.`,
    category: 'question',
    keywords: ['secure', 'security', 'safe', 'defense', 'privacy', 'data', 'rls', 'audit'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'security_002',
    question_pattern: 'How is CMPSBL different from LangChain?',
    answer: `CMPSBL and LangChain serve very different purposes:

| Aspect | LangChain | CMPSBL |
|--------|-----------|--------|
| Type | Library | Governed Cognitive Infrastructure |
| Memory | You build it | Built-in, four-tier persistent |
| Learning | None | Autonomous (Memory Stream, EVOLUTION) |
| Security | You build it | DEFENSE Layer + Shield + RLS |
| Self-improvement | None | Governed EVOLUTION |
| AI routing | Manual | NEXUS multi-provider router |
| Discovery | None | DREAM + CJPI scoring |
| Defense (LLM) | None | Shield (prompt injection, hallucination, audit) |
| Layer 2 | None | Mana (zero-source-modification attachment) |

LangChain chains LLM calls. CMPSBL is the substrate underneath — governed, deterministic, model-agnostic.`,
    category: 'question',
    keywords: ['langchain', 'different', 'compare', 'vs', 'comparison', 'framework'],
    confidence: 0.92,
    verified: true,
    priority: 'high',
  },
  {
    id: 'security_003',
    question_pattern: 'What patents protect CMPSBL?',
    answer: `Two U.S. provisional patent applications cover the core substrate:

• **U.S. App. No. 64/029,678** — **Ascension™** (code classification, primitive collision, CJPI scoring, certification pipeline)
• **U.S. App. No. 64/031,637** — **Mana™** (silent Layer 2 attachment, function-boundary wrapping, Lex governance)

Trademark: **CMPSBL®** is a registered mark. Parent entity: **PromptFluid™** (TX). License: Apache-2.0.`,
    category: 'question',
    keywords: ['patent', 'patents', 'ip', 'trademark', 'license', 'promptfluid'],
    confidence: 0.93,
    verified: true,
    priority: 'medium',
  },
];

// ============================================================================
// Support & Contact Knowledge
// ============================================================================

export const SUPPORT_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'support_001',
    question_pattern: 'How do I contact support?',
    answer: `Reach CMPSBL support through:

**Email:** support@cmpsbl.com — response within 48h

**Self-service:**
• This Support Bot (24/7, memory-backed)
• Documentation at \`/documentation\`
• FAQ on this page

**Account or billing:** Email support@cmpsbl.com with your account email and details.

If this bot can't resolve your issue, click **Escalate to Human** and we'll follow up via email.`,
    category: 'account',
    keywords: ['contact', 'support', 'help', 'reach', 'email', 'human'],
    confidence: 0.94,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'support_002',
    question_pattern: 'Can I talk to a human?',
    answer: `Absolutely. Two options:

1. **Escalate from this chat** — Click "Escalate to Human" and we follow up at support@cmpsbl.com within 48h
2. **Email directly** — Send to support@cmpsbl.com with your account email and a description

The bot handles common questions instantly but always escalates when it isn't confident. We never guess.`,
    category: 'account',
    keywords: ['human', 'person', 'real person', 'talk to someone', 'escalate'],
    confidence: 0.94,
    verified: true,
    priority: 'high',
  },
  {
    id: 'support_003',
    question_pattern: 'Where is the documentation?',
    answer: `Docs live at \`/documentation\` and cover:

• Getting started guides
• Memory Stream and Pipeline Packs
• Ascension pipeline (Architect tier)
• Mana Layer 2 attachment
• Shield prompt defense
• 40-Primitive architecture
• API reference and SDK guides
• Security and governance

Browse the **Evolution Log** at \`/changelog\` for recent updates. Roadmaps live in \`/docs/libraries/roadmaps/\`.`,
    category: 'question',
    keywords: ['documentation', 'docs', 'guides', 'reference', 'library', 'changelog'],
    confidence: 0.91,
    verified: true,
    priority: 'high',
  },
  {
    id: 'support_004',
    question_pattern: 'What browsers are supported?',
    answer: `**Fully supported:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
**Mobile:** iOS Safari 14+, Chrome Mobile, Samsung Internet
**Not supported:** Internet Explorer, browsers with JavaScript disabled

For best experience, use the latest Chrome or Firefox on desktop. WebAuthn passwordless login requires a modern browser with platform authenticator support.`,
    category: 'troubleshoot',
    keywords: ['browser', 'supported', 'chrome', 'firefox', 'safari', 'mobile'],
    confidence: 0.88,
    verified: true,
    priority: 'medium',
  },
  {
    id: 'support_005',
    question_pattern: 'I have a billing issue',
    answer: `For billing issues, email **support@cmpsbl.com** with:

• Your account email
• Description (charge question, refund, plan change, etc.)
• Any relevant Stripe order or transaction IDs

Response within 48h. All payments process through Stripe. To cancel or change plan, go to account settings or email us. Downgrades take effect at end of billing period; data retained for 30 days.`,
    category: 'account',
    keywords: ['billing', 'charge', 'refund', 'payment', 'invoice', 'cancel', 'stripe'],
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
  ...PACKAGE_KNOWLEDGE,
  ...PRICING_KNOWLEDGE,
  ...MARKETPLACE_KNOWLEDGE,
  ...GETTING_STARTED_KNOWLEDGE,
  ...SECURITY_KNOWLEDGE,
  ...SUPPORT_KNOWLEDGE,
];

// ============================================================================
// Knowledge Categories for Quick Access
// ============================================================================

export const KNOWLEDGE_CATEGORIES = {
  platform: PLATFORM_KNOWLEDGE,
  packages: PACKAGE_KNOWLEDGE,
  pricing: PRICING_KNOWLEDGE,
  marketplace: MARKETPLACE_KNOWLEDGE,
  getting_started: GETTING_STARTED_KNOWLEDGE,
  security: SECURITY_KNOWLEDGE,
  support: SUPPORT_KNOWLEDGE,
} as const;

export type KnowledgeCategory = keyof typeof KNOWLEDGE_CATEGORIES;
