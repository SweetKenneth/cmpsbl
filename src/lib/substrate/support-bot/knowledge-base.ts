/**
 * Support Bot Knowledge Base
 * Pre-trained FAQ data for CodeLab, Marketplace, and Licensing
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
// CodeLab Knowledge
// ============================================================================

export const CODELAB_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'codelab_001',
    question_pattern: 'What is CodeLab?',
    answer: `CodeLab is a live, execution-first development environment that runs real schedulers and cognition — not mock or demo mode. It's designed for builders and researchers who need to experiment with the substrate's cognitive capabilities in a professional, production-ready context. CodeLab provides direct access to terminal commands, memory operations, and cognitive primitives.`,
    category: 'question',
    keywords: ['codelab', 'what', 'development', 'environment'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'codelab_002',
    question_pattern: 'How do I get started with CodeLab?',
    answer: `To get started with CodeLab:

1. Navigate to /codelab from the main navigation
2. The terminal interface will initialize automatically
3. Run 'help' to see available commands
4. Use 'brain.status' to check memory system health
5. Try 'decode.interpret "your text"' to test intent parsing

CodeLab provides real-time execution with live substrate integration. All commands execute against the actual cognitive engine, not simulations.`,
    category: 'how_to',
    keywords: ['codelab', 'start', 'getting started', 'begin', 'setup'],
    confidence: 0.92,
    verified: true,
    priority: 'high',
  },
  {
    id: 'codelab_003',
    question_pattern: 'What commands are available in CodeLab?',
    answer: `CodeLab supports comprehensive terminal commands across all substrate modules:

**Core Commands:**
- 'help' — List all available commands
- 'status' — Show system health overview
- 'version' — Display current substrate version

**Brain/Memory Commands:**
- 'brain.status' — Memory tier health
- 'brain.recall [query]' — Search memories
- 'brain.ingest [content]' — Store new memory

**Decode Commands:**
- 'decode.interpret [text]' — Analyze intent
- 'decode.personality.list' — Show personality profiles

**System Commands:**
- 'system.events' — View recent events
- 'defense.status' — Security posture

Run 'help [module]' for detailed command documentation.`,
    category: 'how_to',
    keywords: ['commands', 'terminal', 'codelab', 'available', 'list'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'codelab_004',
    question_pattern: 'Is CodeLab a demo or sandbox?',
    answer: `No, CodeLab is NOT a demo or sandbox. It is a live, execution-first development environment that runs real schedulers and cognition. Key distinctions:

• **Real Execution**: Commands execute against the production cognitive engine
• **Persistent Memory**: Brain operations affect actual memory tiers
• **Live Events**: System events are real-time, not simulated
• **Professional Tool**: Designed for builders and researchers, not demos

CodeLab is production infrastructure for cognitive development, positioned as a professional tool rather than a toy environment.`,
    category: 'question',
    keywords: ['demo', 'sandbox', 'mock', 'simulation', 'test'],
    confidence: 0.94,
    verified: true,
    priority: 'high',
  },
  {
    id: 'codelab_005',
    question_pattern: 'CodeLab terminal not working',
    answer: `If the CodeLab terminal isn't responding, try these troubleshooting steps:

1. **Refresh the page** — The terminal may need to reinitialize
2. **Check system status** — Look for any error banners at the top
3. **Clear session** — Run 'clear' or use the trash icon
4. **Verify connection** — Ensure you have stable internet
5. **Browser console** — Check for JavaScript errors (F12)

If the issue persists, the substrate may be in a degraded state. Check 'system.health' for diagnostics or escalate to support.`,
    category: 'troubleshoot',
    keywords: ['not working', 'broken', 'error', 'terminal', 'stuck'],
    confidence: 0.88,
    verified: true,
    priority: 'medium',
  },
  {
    id: 'codelab_006',
    question_pattern: 'How do I save my work in CodeLab?',
    answer: `CodeLab automatically persists cognitive operations to the substrate:

• **Memory writes** — Stored in Brain tiers (Hot/Warm/Cold)
• **Learning events** — Logged to the learning system
• **Session history** — Terminal commands are not persisted between sessions

For explicit saves:
- Use 'brain.ingest [content]' to store important information
- Use 'export' commands where available for data extraction

Note: Terminal command history is session-scoped and clears on page refresh.`,
    category: 'how_to',
    keywords: ['save', 'persist', 'store', 'export', 'work'],
    confidence: 0.87,
    verified: true,
    priority: 'medium',
  },
];

// ============================================================================
// Marketplace Knowledge
// ============================================================================

export const MARKETPLACE_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'marketplace_001',
    question_pattern: 'What is the Marketplace?',
    answer: `The CMPSBL Marketplace offers production-ready templates and patterns built on the substrate. Key features:

• **109+ Templates** — Covering Elite, Pro, and Standard tiers
• **AI Generator** — Premium $87 feature creating unique templates from 82,944+ combinations
• **Cognitive Integration** — All templates include Brain and INCLUSIVE module hooks
• **Rarity System** — Templates rated from Common to Mythic based on complexity

Templates are priced by engineering time compression, with ROI expressed as hours saved (2 to 64+ hours).`,
    category: 'question',
    keywords: ['marketplace', 'what', 'templates', 'store'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'marketplace_002',
    question_pattern: 'How do I buy a template?',
    answer: `To purchase a Marketplace template:

1. Browse templates at /marketplace
2. Click on a template to view details and preview
3. Review the price and included features
4. Click "Purchase" to proceed to checkout
5. Complete payment via Stripe
6. Access your template in your dashboard

All purchases include:
• Source code download
• Documentation
• 6 months of update access (varies by tier)
• INCLUSIVE accessibility compliance built-in`,
    category: 'how_to',
    keywords: ['buy', 'purchase', 'template', 'checkout', 'payment'],
    confidence: 0.92,
    verified: true,
    priority: 'high',
  },
  {
    id: 'marketplace_003',
    question_pattern: 'What is the AI Template Generator?',
    answer: `The AI Template Generator is a premium $87 Marketplace feature that creates unique, production-ready templates from 82,944+ possible combinations.

**How it works:**
1. The Nexus router analyzes your requirements
2. Rarity and difficulty multipliers are calculated
3. A unique template is generated with variable value up to $499
4. Your generation is stored with RLS protection

**Key benefits:**
• Unique templates not available in the standard catalog
• Instant generation using cognitive primitives
• Full ownership of generated output
• Production-ready code with accessibility built-in`,
    category: 'question',
    keywords: ['ai generator', 'template generator', 'generate', 'unique'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'marketplace_004',
    question_pattern: 'What are template tiers?',
    answer: `Marketplace templates are organized into tiers based on complexity and value:

**Elite Tier** ($299-$499)
• Most complex patterns
• 48-64+ hours saved
• Full cognitive integration
• Premium support

**Pro Tier** ($99-$249)
• Advanced patterns
• 16-48 hours saved
• Extended features
• Priority updates

**Standard Tier** ($27-$79)
• Essential patterns
• 2-16 hours saved
• Core functionality
• Community support

Each tier includes the substrate's INCLUSIVE accessibility module for WCAG compliance.`,
    category: 'question',
    keywords: ['tiers', 'elite', 'pro', 'standard', 'pricing', 'levels'],
    confidence: 0.91,
    verified: true,
    priority: 'high',
  },
  {
    id: 'marketplace_005',
    question_pattern: 'Can I get a refund on a template?',
    answer: `Template refund policy:

**Digital products are generally non-refundable** due to immediate access upon purchase. However, exceptions may be made for:

• Technical issues preventing download
• Template not matching documented features
• Duplicate purchases

To request a refund:
1. Contact Dev@CMPSBL.com within 7 days
2. Include your order ID and reason
3. Our team will review and respond within 48 hours

For technical issues, we'll first attempt to resolve the problem before processing refunds.`,
    category: 'account',
    keywords: ['refund', 'money back', 'return', 'cancel', 'purchase'],
    confidence: 0.88,
    verified: true,
    priority: 'medium',
  },
  {
    id: 'marketplace_006',
    question_pattern: 'How do I access my purchased templates?',
    answer: `To access templates you've purchased:

1. Sign in to your account
2. Navigate to your Dashboard
3. Click on "My Purchases" or "Templates"
4. Find your template and click "Download"

**Access includes:**
• Source code in a ZIP file
• Documentation in Markdown
• Any associated assets
• Update access based on your tier

Templates are linked to your account and can be re-downloaded anytime during your update access period.`,
    category: 'how_to',
    keywords: ['access', 'download', 'purchased', 'my templates', 'dashboard'],
    confidence: 0.90,
    verified: true,
    priority: 'high',
  },
  {
    id: 'marketplace_007',
    question_pattern: 'What is template rarity?',
    answer: `Template rarity indicates complexity and uniqueness:

• **Common** — Basic patterns, widely applicable
• **Uncommon** — Enhanced functionality, moderate complexity
• **Rare** — Specialized patterns, significant engineering
• **Epic** — Advanced cognitive integration, complex architecture
• **Legendary** — Highly specialized, extensive R&D
• **Mythic** — Unique, maximum complexity and value

Rarity is calculated based on:
• Engineering time required
• Cognitive primitive usage
• Pattern uniqueness
• Integration complexity

Higher rarity generally means higher value and price.`,
    category: 'question',
    keywords: ['rarity', 'common', 'rare', 'epic', 'legendary', 'mythic'],
    confidence: 0.89,
    verified: true,
    priority: 'medium',
  },
];

// ============================================================================
// Licensing Knowledge
// ============================================================================

export const LICENSING_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'licensing_001',
    question_pattern: 'What licensing options are available?',
    answer: `The CMPSBL Substrate offers tiered infrastructure licensing:

**Developer License** — $15,000/year
• Automated Stripe checkout
• Local deployment on your infrastructure
• SDK access and documentation
• Community support

**Research License** — $80,000/year
• Institutional research focus
• Academic use rights
• Publication support
• Contact-based contract

**Enterprise License** — $180,000/year
• Product embedding rights
• SLA support
• Custom integration
• Dedicated account manager

**Strategic** — Custom pricing
• Cloud/autonomy partnerships
• Exclusive arrangements
• Contact for details

Annual billing provides 25% discount.`,
    category: 'question',
    keywords: ['licensing', 'options', 'license', 'tiers', 'pricing'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'licensing_002',
    question_pattern: 'How much does a license cost?',
    answer: `Substrate licensing pricing:

| Tier | Annual Price | Monthly Equivalent |
|------|-------------|-------------------|
| Developer | $15,000/yr | ~$1,250/mo |
| Research | $80,000/yr | Contact sales |
| Enterprise | $180,000/yr | Contact sales |
| Strategic | Custom | Contact sales |

**Notes:**
• Only Developer tier has automated checkout
• Annual billing includes 25% discount
• Research/Enterprise require contract negotiation
• Downgrade restrictions apply mid-term

Contact Dev@CMPSBL.com for quotes and custom arrangements.`,
    category: 'question',
    keywords: ['cost', 'price', 'pricing', 'how much', 'fee'],
    confidence: 0.94,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'licensing_003',
    question_pattern: 'How do I purchase a Developer License?',
    answer: `The Developer License ($15,000/year) is the only tier with automated checkout:

1. Navigate to /substrate/licensing
2. Select "Developer License"
3. Click "Purchase License"
4. Complete Stripe checkout
5. Receive instant access and download links

**Included:**
• Full API access (all 10 entities + 5 mesh overlays via hosted API)
• Unlimited API calls (fair use)
• Documentation library
• 12 months of updates
• Community support channel

Note: Developer license provides hosted API access. For self-hosted deployment with source code, see Enterprise tier ($49,999/yr).

For Research, Enterprise, or Strategic licenses, contact Dev@CMPSBL.com for contract-based purchase.`,
    category: 'how_to',
    keywords: ['purchase', 'buy', 'developer license', 'checkout', 'how to buy'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'licensing_004',
    question_pattern: 'What is the difference between templates and licenses?',
    answer: `**Templates** and **Licenses** serve different purposes:

**Marketplace Templates ($27-$499)**
• Pre-built patterns and components
• One-time purchase
• Use in your projects
• No substrate infrastructure included

**Substrate Licenses ($15,000-$180,000+/yr)**
• Full cognitive infrastructure
• Deploy the entire substrate
• Run your own instance
• Build products on top

**Think of it as:**
• Templates = buying furniture
• License = buying the factory

Templates run ON the substrate; licenses give you the substrate itself.`,
    category: 'question',
    keywords: ['difference', 'templates', 'licenses', 'compare', 'vs'],
    confidence: 0.92,
    verified: true,
    priority: 'high',
  },
  {
    id: 'licensing_005',
    question_pattern: 'Can I downgrade my license?',
    answer: `License downgrade policy:

**Mid-term downgrades are NOT permitted.** If you need to downgrade:

1. Your request is queued for end of renewal cycle
2. You retain current tier access until expiration
3. Downgrade takes effect at next renewal
4. Refunds are not provided for unused time

**Upgrades** are processed immediately with prorated billing.

This policy ensures predictable infrastructure planning and fair usage of resources.

Contact Dev@CMPSBL.com for special circumstances.`,
    category: 'account',
    keywords: ['downgrade', 'lower', 'reduce', 'change tier', 'cancel'],
    confidence: 0.88,
    verified: true,
    priority: 'medium',
  },
  {
    id: 'licensing_006',
    question_pattern: 'What rights do I get with a license?',
    answer: `License rights follow a Rights & Permissions Matrix:

**Developer License:**
• Personal use ✓
• Commercial use ✓ (limited)
• Internal deployment ✓
• Client distribution ✗
• White-label ✗
• BYOK (Bring Your Own Key) ✓

**Enterprise License:**
• All Developer rights ✓
• Client distribution ✓
• White-label (negotiable)
• Custom SLA ✓
• Priority support ✓

**Research License:**
• Academic use ✓
• Publication rights ✓
• Commercial use ✗

Full matrix available at /substrate/licensing.`,
    category: 'question',
    keywords: ['rights', 'permissions', 'what can i do', 'allowed', 'usage'],
    confidence: 0.91,
    verified: true,
    priority: 'high',
  },
  {
    id: 'licensing_007',
    question_pattern: 'How do I contact sales for Enterprise licensing?',
    answer: `For Enterprise, Research, or Strategic licensing inquiries:

**Email:** Dev@CMPSBL.com
**Phone:** (760) FLUID-AI

**Please include:**
• Organization name
• Intended use case
• Deployment scale requirements
• Timeline for implementation

Our team typically responds within 24-48 business hours. For urgent inquiries, phone is preferred.

Enterprise contracts involve:
• Custom pricing negotiation
• SLA definition
• Integration planning
• Dedicated onboarding`,
    category: 'account',
    keywords: ['contact', 'sales', 'enterprise', 'inquiry', 'reach out'],
    confidence: 0.90,
    verified: true,
    priority: 'high',
  },
  {
    id: 'licensing_008',
    question_pattern: 'Is there a free trial?',
    answer: `Currently, we do not offer free trials for substrate licenses due to infrastructure costs. However:

**Free exploration options:**
• Browse documentation at /library
• Explore CodeLab for terminal interaction
• View template previews in Marketplace
• Read the technical specifications

**Low-commitment entry:**
• Marketplace templates ($27-$499) let you experience substrate-powered patterns
• Developer License ($15,000/yr) is the lowest infrastructure tier

For evaluation discussions or proof-of-concept arrangements, contact Dev@CMPSBL.com.`,
    category: 'question',
    keywords: ['free trial', 'trial', 'demo', 'try', 'test', 'free'],
    confidence: 0.87,
    verified: true,
    priority: 'medium',
  },
];

// ============================================================================
// General/Support Knowledge
// ============================================================================

export const GENERAL_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'general_001',
    question_pattern: 'How do I contact support?',
    answer: `You can reach support through several channels:

**Email:** Dev@CMPSBL.com
**Phone:** (760) FLUID-AI

**Self-service:**
• This Support Bot (available 24/7)
• Documentation at /library
• FAQ sections on product pages

**Response times:**
• Email: 24-48 business hours
• Phone: Business hours (CST)
• Support Bot: Instant

For urgent issues, phone is recommended. For complex technical questions, email with details is preferred.`,
    category: 'account',
    keywords: ['contact', 'support', 'help', 'reach', 'email', 'phone'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'general_002',
    question_pattern: 'What is CMPSBL?',
    answer: `CMPSBL (Composable) is the cognitive infrastructure substrate powering the Clockless Cognitive Reality System. It is NOT an operating system — it is a substrate.

**Architecture:**
• 38 total nodes across 12 sectors
• 1 CORE Kernel — the standalone boot authority
• 1 SYSTEM — lifecycle management
• CCR (3): BRAIN, MEMORY, DREAM — cognitive core
• OCG (6): RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE — compliance grid
• Execution (10): DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, INTEGRATION
• ESZ (4): SOVEREIGN, ORACLE, CONSCIENCE, TREATY — sovereignty zone
• EPZ (3): COMPASS, ECHO, REFLEX — perception zone
• EMZ (3): FORGE, LINGUA, HARVEST — manufacturing zone
• CSZ (3): EVOLUTION, SHADOW, PHANTOM — covert systems zone
• Fields (2): IMMUNITY, INTENT — cross-cutting fabric
• Plane (1): GOVERNANCE — supervisory blanket
• Shell (1): DEFENSE — outer containment boundary

**Key characteristics:**
• Persistent memory systems (no resets)
• Intent interpretation via DECODE
• Autonomous learning cycles
• Governed evolution with audit trails
• Self-defense and resilience

It's designed as infrastructure, not a product — a substrate for building cognitive applications.`,
    category: 'question',
    keywords: ['cmpsbl', 'composable', 'what is', 'platform', 'substrate', 'architecture', 'modules'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'general_003',
    question_pattern: 'How do I reset my password?',
    answer: `To reset your password:

1. Go to the login page
2. Click "Forgot Password"
3. Enter your registered email
4. Check your inbox for reset link
5. Click the link and set new password

**Note:** Reset links expire after 24 hours.

If you don't receive the email:
• Check spam/junk folders
• Verify you're using the correct email
• Contact support if issues persist

For account security, we recommend using a strong, unique password.`,
    category: 'account',
    keywords: ['password', 'reset', 'forgot', 'login', 'access'],
    confidence: 0.91,
    verified: true,
    priority: 'high',
  },
  {
    id: 'general_004',
    question_pattern: 'Is my data secure?',
    answer: `Data security is a core priority:

**Technical Measures:**
• Encryption at rest and in transit (TLS 1.3)
• Row Level Security (RLS) on all user data
• No plain-text storage of sensitive data
• Regular security audits

**DEFENSE Mesh Overlay:**
• Behavioral analysis for threat detection
• IP reputation tracking
• Rate limiting and abuse prevention
• Automatic anomaly alerting

**Data Sovereignty:**
• Brain memory data remains your property
• Deletion requests honored
• No data sold or transferred
• Learning transparency maintained

See /library for detailed security documentation.`,
    category: 'question',
    keywords: ['secure', 'security', 'data', 'privacy', 'safe'],
    confidence: 0.92,
    verified: true,
    priority: 'high',
  },
  {
    id: 'general_005',
    question_pattern: 'What browsers are supported?',
    answer: `The platform supports modern browsers:

**Fully Supported:**
• Chrome 90+
• Firefox 88+
• Safari 14+
• Edge 90+

**Mobile:**
• iOS Safari 14+
• Chrome Mobile
• Samsung Internet

**Not Supported:**
• Internet Explorer
• Opera Mini
• Browsers with JavaScript disabled

For best experience, use the latest version of Chrome or Firefox. Some features like CodeLab terminal work best on desktop browsers.`,
    category: 'troubleshoot',
    keywords: ['browser', 'supported', 'chrome', 'firefox', 'safari', 'compatibility'],
    confidence: 0.88,
    verified: true,
    priority: 'medium',
  },
  {
    id: 'general_006',
    question_pattern: 'How many modules does the substrate have?',
    answer: `The CMPSBL Substrate has **38 active nodes** across **12 sectors**:

1. **CORE** — Standalone kernel boot authority
2. **SYSTEM** — Lifecycle management
3. **CCR** (3): BRAIN, MEMORY, DREAM
4. **OCG** (6): RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE
5. **Execution** (10): DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, INTEGRATION
6. **ESZ** (4): SOVEREIGN, ORACLE, CONSCIENCE, TREATY
7. **EPZ** (3): COMPASS, ECHO, REFLEX
8. **EMZ** (3): FORGE, LINGUA, HARVEST
9. **CSZ** (3): EVOLUTION, SHADOW, PHANTOM
10. **Fields** (2): IMMUNITY, INTENT
11. **Plane** (1): GOVERNANCE
12. **Shell** (1): DEFENSE

**Important distinctions:**
• 5 Mesh Overlays (DEFENSE, IMMUNITY, EVOLUTION, INTENT, GOVERNANCE) are cross-cutting behavioral layers
• 4 Shielded Expansion Zones: ESZ (SOVEREIGN, ORACLE, CONSCIENCE, TREATY), EPZ (COMPASS, ECHO, REFLEX), EMZ (FORGE, LINGUA, HARVEST), CSZ (EVOLUTION, SHADOW, PHANTOM)
• Grand total: 38 nodes across 12 sectors

Do NOT confuse overlays or zones with modules.`,
    category: 'question',
    keywords: ['modules', 'how many', 'entities', 'architecture', 'count', 'number'],
    confidence: 0.95,
    verified: true,
    priority: 'critical',
  },
  {
    id: 'general_007',
    question_pattern: 'What are mesh overlays?',
    answer: `Mesh Overlays are cross-cutting behavioral layers that span all entities in the substrate. They are NOT modules.

The 5 Mesh Overlays:
1. **DEFENSE** — Security posture, threat detection, IP reputation
2. **IMMUNITY** — Self-healing, repair attempts, fault isolation
3. **EVOLUTION** — Governed mutations, A/B testing, versioned upgrades
4. **INTENT** — Goal alignment, priority resolution
5. **GOVERNANCE** — Safety checks, policy enforcement, audit compliance

**Key difference from modules:**
• Modules are discrete functional units (DECODE, ENCODE, etc.)
• Overlays span across ALL modules and zones simultaneously
• You interact with modules directly; overlays operate autonomously in the background`,
    category: 'question',
    keywords: ['mesh', 'overlay', 'defense', 'immunity', 'evolution', 'intent', 'governance'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
  {
    id: 'general_008',
    question_pattern: 'What is CORE?',
    answer: `CORE is the kernel of the CMPSBL Substrate — the standalone boot authority.

**Responsibilities:**
• Initializes all downstream layers
• Maintains the canonical registry of all entities, zones, and overlays
• Manages boot graph and dependency resolution
• Has no upstream dependencies — it IS the root

**CORE is not a module.** It is a kernel. The 10 public entities are: 1 CORE Kernel + 9 Modules.

CORE boots the system, then the 9 modules, 5 mesh overlays, and 9 hidden zones all operate under its authority.`,
    category: 'question',
    keywords: ['core', 'kernel', 'boot', 'authority', 'root'],
    confidence: 0.93,
    verified: true,
    priority: 'high',
  },
];

// ============================================================================
// Combined Knowledge Base
// ============================================================================

export const FULL_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  ...CODELAB_KNOWLEDGE,
  ...MARKETPLACE_KNOWLEDGE,
  ...LICENSING_KNOWLEDGE,
  ...GENERAL_KNOWLEDGE,
];

// ============================================================================
// Knowledge Categories for Quick Access
// ============================================================================

export const KNOWLEDGE_CATEGORIES = {
  codelab: CODELAB_KNOWLEDGE,
  marketplace: MARKETPLACE_KNOWLEDGE,
  licensing: LICENSING_KNOWLEDGE,
  general: GENERAL_KNOWLEDGE,
} as const;

export type KnowledgeCategory = keyof typeof KNOWLEDGE_CATEGORIES;
