/**
 * Investor Document Library — Beautiful print-optimized HTML viewer
 * Light-themed, mobile-first, gorgeous print output matching CMPSBL brand
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ChevronRight, Printer, BookOpen,
  Target, Brain, BarChart3, Users, Zap, Shield,
  AlertTriangle, Sparkles, GitBranch, Globe, Cpu,
  Lock, FileText, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────
interface DocSection {
  heading: string;
  content?: string;
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  callout?: { label: string; text: string; variant?: "primary" | "success" | "warning" };
}

interface InvestorDoc {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentClass: string;
  sections: DocSection[];
}

// ─── Document Data (expanded for full investor coverage) ─────
const INVESTOR_DOCS: InvestorDoc[] = [
  {
    id: "exec-summary",
    number: "01",
    title: "Executive Summary",
    subtitle: "What CMPSBL is, why it matters, and the opportunity",
    icon: <Target className="w-4 h-4" />,
    accentClass: "text-primary border-primary/20 bg-primary/5",
    sections: [
      {
        heading: "The Problem",
        content: "Current AI systems are stateless, ungoverned, and fragile. They lack persistent memory, governance over autonomous actions, observability, validated evolution, multi-agent coordination, security for adversarial environments, continuous learning, and disaster recovery. These gaps make AI unsuitable for production infrastructure, enterprise deployment, and regulated environments.",
      },
      {
        heading: "The Solution",
        content: "CMPSBL is a cognitive orchestration substrate — a runtime infrastructure layer providing governed, persistent, and self-evolving AI agent execution. It is not an application, chatbot, or model. It is the operating surface on which intelligent systems run.",
      },
      {
        heading: "Key Numbers",
        table: {
          headers: ["Metric", "Value"],
          rows: [
            ["Matrix Primitives", "40 across 4 categories (12·12·8·8)"],
            ["Registered Capabilities", "675+"],
            ["Premium Engines", "54 across 4 price tiers"],
            ["Database Tables", "60+ production"],
            ["Production Code", "200,000+ lines"],
            ["Documentation", "80+ pages across 5 libraries"],
            ["Cognitive Agents", "20 sealed-runtime agents"],
            ["Export Languages", "25 (18 software, 7 HDL)"],
            ["CLM Training Calls/Day", "Up to 14,400"],
          ],
        },
      },
      {
        heading: "Business Model",
        table: {
          headers: ["Revenue Stream", "Description"],
          rows: [
            ["Platform Subscriptions", "Builder → Studio ($29) → Creator ($49) → Architect ($79) → Governor"],
            ["Agent Marketplace", "20 agents across 4 price tiers ($79–$249/agent)"],
            ["Engine Marketplace", "54 premium engines across META, APEX, ELITE, CORE"],
            ["Ascension Exports", "Single-file, IP-protected capability artifacts in 25 languages"],
            ["Self-Hosted Licenses", "Full-control perpetual licenses"],
          ],
        },
      },
      {
        heading: "Why Now",
        bullets: [
          "Enterprise AI adoption is accelerating but infrastructure hasn't kept pace",
          "Governance requirements (EU AI Act, enterprise compliance) demand architectural solutions",
          "The cost of poor software quality reached $2.41 trillion in 2024",
          "No existing platform combines governance, evolution, and multi-agent coordination",
        ],
      },
    ],
  },
  {
    id: "tech-arch",
    number: "02",
    title: "Technology Architecture",
    subtitle: "40-primitive topology, system design, key differentiators",
    icon: <Brain className="w-4 h-4" />,
    accentClass: "text-purple-600 border-purple-200 bg-purple-50",
    sections: [
      {
        heading: "System Design",
        content: "CMPSBL is a 40-primitive cognitive kernel organized into a symmetric 12·12·8·8 matrix across 4 categories: Organs (12), Layers (12), Engines (8), and Agents (8). System health is a deterministic weighted sum, not a heuristic estimate. Every primitive is independently bootable, auditable, and governed.",
      },
      {
        heading: "Primitive Categories",
        table: {
          headers: ["Category", "Count", "Examples", "Role"],
          rows: [
            ["Organs", "12", "BRAIN, MEMORY, NERVE, CORTEX", "Core cognitive functions"],
            ["Layers", "12", "DEFENSE, GOVERNANCE, IMMUNITY, SHADOW", "Structural protection & coordination"],
            ["Engines", "8", "FORGE, ECONOMY, EVOLUTION, ATLAS", "Specialized processing"],
            ["Agents", "8", "ENCODE, DECODE, ORACLE, PHANTOM", "Autonomous execution"],
          ],
        },
      },
      {
        heading: "Key Technical Differentiators",
        table: {
          headers: ["Differentiator", "What It Does"],
          rows: [
            ["Cognitive Engine System", "675+ capabilities consolidated into compound and meta-engines with 2–8x synergy amplification"],
            ["Constant Learning Mode (CLM)", "Up to 14,400 AI calls/day — 70% system telemetry, 30% scheduled curriculum"],
            ["7-Gate SEBA Evolution", "Every change passes 7 validation gates including TSAC truth arbitration"],
            ["Sealed Agent Marketplace", "20 agents with 3–5 Crown Jewel powers each, source-blocked runtimes"],
            ["Universal Export", "25 target languages with Mini-Runtime™, single-file zero-dependency distributions"],
          ],
        },
      },
      {
        heading: "Infrastructure Depth",
        content: "The substrate implements circuit breakers with exponential backoff, dead letter queues, saga orchestrators with multi-step rollback, CQRS bus, Merkle audit chains (SHA-256), tenant isolation, chaos testing harnesses, canary deployment gates, and schema registries. Every item is implemented, exported, and wired into the boot sequence.",
      },
    ],
  },
  {
    id: "competitive",
    number: "03",
    title: "Competitive Positioning",
    subtitle: "Market landscape, defensible moat, competitive advantages",
    icon: <BarChart3 className="w-4 h-4" />,
    accentClass: "text-cyan-600 border-cyan-200 bg-cyan-50",
    sections: [
      {
        heading: "Competitive Comparison",
        table: {
          headers: ["Capability", "CMPSBL", "Typical AI Platform"],
          rows: [
            ["Persistent Memory", "4-tier, governed, CLM-compounded", "Stateless or session-only"],
            ["Governance", "Architectural, immutable, 4-mode", "Optional, configurable"],
            ["Evolution", "7-gate SEBA with TSAC truth arbitration", "Manual deployment"],
            ["Security", "40-primitive zone-shielded mesh", "Perimeter only"],
            ["Learning", "CLM — up to 14,400 calls/day", "None or fine-tuning"],
            ["Export", "25 languages, standalone artifacts", "API access only"],
            ["Audit", "Tamper-evident Merkle chains", "Append-only logs"],
          ],
        },
      },
      {
        heading: "Category Creation",
        content: "CMPSBL does not compete in existing categories. It creates a new one: Governed Cognitive Infrastructure — defined by architectural governance, persistent tiered memory, validated evolution with truth preservation, sealed multi-agent coordination, tamper-evident audit provenance, and continuous autonomous learning.",
        callout: { label: "Key Insight", text: "No existing platform combines all six properties. This is category creation, not incremental improvement.", variant: "primary" },
      },
      {
        heading: "Named Competitors",
        table: {
          headers: ["Company", "Category", "CMPSBL Advantage"],
          rows: [
            ["OpenAI / Anthropic", "Foundation models", "CMPSBL is model-agnostic infrastructure — works with any LLM"],
            ["LangChain / LlamaIndex", "Orchestration frameworks", "Governed, persistent, self-evolving — not just chaining"],
            ["GitHub Copilot", "Code suggestion", "Autonomous evolution, not human-in-the-loop suggestions"],
            ["Palantir", "Enterprise intelligence", "Self-improving, not analyst-dependent"],
            ["Databricks", "Data platform", "Cognitive, not just analytical"],
          ],
        },
      },
    ],
  },
  {
    id: "commercial",
    number: "04",
    title: "Commercial Model",
    subtitle: "5-tier pricing, marketplace economics, Ascension exports",
    icon: <Users className="w-4 h-4" />,
    accentClass: "text-amber-600 border-amber-200 bg-amber-50",
    sections: [
      {
        heading: "Platform Subscription Tiers",
        table: {
          headers: ["Tier", "Price", "Slots", "Key Features"],
          rows: [
            ["Builder", "Included", "1", "Session memory, view-only discovery"],
            ["Studio", "$29/mo", "3", "Persistent memory, 3 export languages"],
            ["Creator", "$49/mo", "10", "Full memory, 10 languages, basic DREAM"],
            ["Architect", "$79/mo", "25", "Priority routing, all 25 languages, full DREAM"],
            ["Governor", "Admin", "∞", "Full governance authority, all capabilities"],
          ],
        },
      },
      {
        heading: "Standalone Product Tiers",
        table: {
          headers: ["Tier", "Price", "Description"],
          rows: [
            ["Starter", "$79", "Functional agent, limited customization"],
            ["Pro", "$129", "Full-featured, production-ready"],
            ["Elite", "$159", "Advanced capabilities, priority support"],
            ["Apex", "$249", "Maximum capability, custom integration"],
          ],
        },
      },
      {
        heading: "Unit Economics",
        bullets: [
          "CLM increases system value daily without per-user cost",
          "Agent purchases are one-time revenue with zero marginal delivery cost",
          "BYOK model eliminates AI provider costs for the platform",
          "DREAM synthesis means agents self-improve, reducing support burden",
          "Ascension exports are high-margin digital products with built-in IP protection",
          "Zero-infrastructure exports (single-file) eliminate hosting/support costs",
        ],
      },
      {
        heading: "Revenue Projections",
        table: {
          headers: ["Scenario", "Year 1", "Year 2", "Year 3"],
          rows: [
            ["Conservative (100 users)", "$120K ARR", "$480K ARR", "$1.2M ARR"],
            ["Moderate (500 users)", "$600K ARR", "$2.4M ARR", "$6M ARR"],
            ["Aggressive (2,000 users)", "$2.4M ARR", "$9.6M ARR", "$24M ARR"],
          ],
        },
        callout: { label: "Note", text: "Projections assume blended ARPU of $50/mo with 40% annual growth in user base. Agent and export revenue not included.", variant: "warning" },
      },
    ],
  },
  {
    id: "engineering",
    number: "05",
    title: "Engineering Proof",
    subtitle: "Why this is not vibe-coded — audit engines, scale metrics, verification",
    icon: <Zap className="w-4 h-4" />,
    accentClass: "text-emerald-600 border-emerald-200 bg-emerald-50",
    sections: [
      {
        heading: "Scale Metrics",
        table: {
          headers: ["Metric", "Count"],
          rows: [
            ["Matrix Primitives", "40 across 4 categories"],
            ["Source Directories", "19 top-level domains"],
            ["Substrate Engine Dirs", "108 subdirectories + 68 standalone primitives"],
            ["Database Tables", "60+ production"],
            ["Registered Capabilities", "675+"],
            ["Terminal Commands", "500+"],
            ["Page Routes", "60+ distinct"],
            ["Documentation Pages", "80+ across 5 libraries"],
          ],
        },
      },
      {
        heading: "Verification Infrastructure",
        bullets: [
          "10-Domain Audit Engine — continuous checks across system manifest, routes, primitives, hooks, branding, provider branding, terminal, UI, SEO, and backend",
          "26-Probe Diligence Harness — investor-grade deterministic probes testing failure discipline, output-shape consistency, and crash resistance",
          "10-Point Code Verification — static analysis for XSS, secrets, unsafe eval, input validation, timeout guards, TypeScript coverage",
          "Boot Integrity Seals — every primitive boot is hash-chained; the system proves it started correctly",
          "Merkle Audit Chains — SHA-256 hash chains for every autonomous change; call verifyChain() to confirm integrity",
        ],
      },
      {
        heading: "Structural Guarantees",
        content: "Every autonomous operation is logged to a tamper-evident Merkle chain. Every agent runs in a sealed runtime with source-blocked access. Every evolution candidate passes 7 validation gates. Every export is hex-encoded to protect IP. These aren't policies — they're architectural constraints that cannot be bypassed.",
      },
      {
        heading: "Code Quality Evidence",
        table: {
          headers: ["Check", "Status", "Method"],
          rows: [
            ["XSS Vectors", "Protected", "Automated static analysis"],
            ["Secret Exposure", "Protected", "Pattern scanning + env-only secrets"],
            ["Unsafe Eval", "Blocked", "AST-level detection"],
            ["TypeScript Coverage", ">95%", "Strict mode enforced"],
            ["Return Types", "Enforced", "Compiler + lint rules"],
            ["Any Usage", "Blocked", "Zero-tolerance policy"],
          ],
        },
      },
    ],
  },
  {
    id: "ip",
    number: "06",
    title: "IP & Defensibility",
    subtitle: "Crown Jewels, black-box hex-encoding, trade secrets, structural moat",
    icon: <Shield className="w-4 h-4" />,
    accentClass: "text-pink-600 border-pink-200 bg-pink-50",
    sections: [
      {
        heading: "Crown Jewel Capabilities",
        content: "54 capabilities are classified as Crown Jewels — excluded from all external access tiers, not visible in API catalogs, governor-only access, source-blocked from agent runtimes. These represent irreplicable competitive advantage.",
      },
      {
        heading: "Black-Box Export Protection",
        table: {
          headers: ["Protection Layer", "Method"],
          rows: [
            ["CJPI Weights", "Hex-encoded arrays (e.g., [0x1E, 0x1E, 0x14, 0x14])"],
            ["Tier Thresholds", "Hex-encoded (e.g., [0x5C, 0x50, 0x41, 0x2D])"],
            ["Internal Comments", "Stripped entirely from all exports"],
            ["Architecture References", "Genericized — no internal naming exposed"],
            ["Discovery Heuristics", "Never included in any export"],
          ],
        },
      },
      {
        heading: "Defensibility Layers",
        bullets: [
          "Architectural complexity — 40-primitive topology cannot be reverse-engineered from outputs",
          "Continuous compounding — CLM grows system knowledge daily, widening the gap",
          "Agent IP — sealed, versioned, source-blocked runtimes",
          "Merkle provenance — tamper-evident history of every change",
          "Engine marketplace — 54 productized engines with proprietary algorithms",
          "DREAM synthesis — agents self-improve using substrate knowledge",
          "Black-box exports — hex-encoded constants in all 25 export languages",
        ],
      },
      {
        heading: "Trade Secret Protection",
        content: "CMPSBL's core algorithms (CJPI scoring, affinity matrices, tier classification thresholds, evolution selection criteria) are implemented as hex-encoded constants. Even if an exported artifact is decompiled, the values appear as opaque byte arrays with no documentation of their meaning. Combined with stripped comments and genericized naming, reverse engineering the substrate from its outputs is architecturally infeasible.",
      },
    ],
  },
  {
    id: "governance",
    number: "07",
    title: "Governance & Risk",
    subtitle: "Risk classification, mitigation, governance model",
    icon: <AlertTriangle className="w-4 h-4" />,
    accentClass: "text-amber-600 border-amber-200 bg-amber-50",
    sections: [
      {
        heading: "Governance Model",
        content: "Every mutating action passes through GOVERNANCE — no exceptions. The system operates in one of four modes at all times:",
        table: {
          headers: ["Mode", "Description", "When Used"],
          rows: [
            ["Autonomous", "System decides within scoped boundaries", "Normal operation, low-risk actions"],
            ["Supervised", "System proposes, governor approves", "Medium-risk changes, new capabilities"],
            ["Manual", "Governor directs all actions", "Sensitive operations, audits"],
            ["Emergency", "Reduced to minimum safe operations", "System instability, security events"],
          ],
        },
      },
      {
        heading: "Risk Factors & Mitigation",
        table: {
          headers: ["Risk", "Severity", "Mitigation"],
          rows: [
            ["Key-person dependency", "High", "Documented succession protocol, dead-man switch, 5-library knowledge base"],
            ["Pre-revenue status", "Medium", "Technology built and production-ready; pricing validated through market research"],
            ["Solo execution", "Medium", "Full system docs, 3-week onboarding checklist, Staff Library with non-negotiables"],
            ["AI model dependency", "Low", "Model-agnostic architecture; BYOK support; 14+ free-tier providers as fallback"],
            ["Competitive response", "Low", "Structural moat: 40-primitive topology + brain memory + hex-encoded IP"],
          ],
        },
      },
      {
        heading: "Regulatory Preparedness",
        bullets: [
          "EU AI Act compliance — governance modes map directly to risk classification requirements",
          "Audit provenance — Merkle chains provide tamper-evident history for regulatory review",
          "Explainability — every autonomous decision is logged with reasoning chain",
          "Data sovereignty — tenant isolation and self-hosted license options",
        ],
      },
    ],
  },
  {
    id: "survivability",
    number: "08",
    title: "Survivability & Continuity",
    subtitle: "Succession protocol, minimum viable operation, self-sufficiency",
    icon: <Lock className="w-4 h-4" />,
    accentClass: "text-slate-600 border-slate-200 bg-slate-50",
    sections: [
      {
        heading: "Continuity Architecture",
        content: "CMPSBL is designed to survive the loss of any single contributor, including its founder. The system's knowledge is distributed across 5 documentation libraries totaling 80+ pages, with explicit operational procedures for every critical function.",
      },
      {
        heading: "Succession Protocol",
        table: {
          headers: ["Component", "Recovery Method", "Time to Restore"],
          rows: [
            ["Codebase", "Git repository + documented architecture", "Immediate"],
            ["Database", "Automated backups + schema documentation", "< 1 hour"],
            ["System Knowledge", "5-tier documentation library (80+ pages)", "1-2 weeks study"],
            ["Operational Procedures", "Staff Library + onboarding checklist", "3 weeks onboarding"],
            ["Crown Jewel IP", "Source code + hex-encoding documentation", "Preserved in code"],
          ],
        },
      },
      {
        heading: "Minimum Viable Operation",
        bullets: [
          "The substrate can operate autonomously with zero human intervention for routine operations",
          "CLM continues learning without operator input",
          "Evolution engine continues self-improvement within governed bounds",
          "Dead-man switch activates Emergency governance mode after extended inactivity",
          "All 40 primitives have independent boot and health-check capabilities",
        ],
      },
      {
        heading: "Documentation Coverage",
        table: {
          headers: ["Library", "Audience", "Pages", "Purpose"],
          rows: [
            ["Public", "General", "15+", "Product overview, capabilities"],
            ["Users", "Customers", "20+", "How-to guides, tutorials"],
            ["Investors", "Stakeholders", "11", "Due diligence, valuation"],
            ["Internal", "Engineers", "25+", "Technical reference, APIs"],
            ["Staff", "Team", "10+", "Onboarding, non-negotiables, source of truth"],
          ],
        },
      },
    ],
  },
  {
    id: "valuation",
    number: "09",
    title: "Defensible Valuation",
    subtitle: "Full substrate valuation, industry parallels, Ascension premium",
    icon: <Sparkles className="w-4 h-4" />,
    accentClass: "text-primary border-primary/20 bg-primary/5",
    sections: [
      {
        heading: "Valuation Framework",
        content: "CMPSBL is valued across six pillars: Core Infrastructure (40-primitive matrix), Intellectual Property (Crown Jewels, sealed algorithms), Revenue Architecture (subscriptions, marketplace, exports), Data Compounding (CLM, DREAM, Memory Stream), Software Evolution (Ascension — single-file portable exports), and Category Creation (first-mover in Governed Cognitive Infrastructure).",
      },
      {
        heading: "Comparable Companies",
        table: {
          headers: ["Comparable", "Valuation", "CMPSBL Overlap"],
          rows: [
            ["Databricks", "$62B", "Memory, learning, data compounding"],
            ["Palantir", "$50B+", "Governance, engines, classification"],
            ["HashiCorp", "$5.7B (acquired)", "Governance-as-architecture"],
            ["Anthropic", "$60B", "Governed autonomy, truth preservation"],
            ["Unity", "$13B", "Universal export, cross-platform runtime"],
            ["Cognition (Devin)", "$2B", "Software evolution, autonomous coding"],
          ],
        },
      },
      {
        heading: "Risk-Adjusted Range",
        table: {
          headers: ["Scenario", "Range", "Assumptions"],
          rows: [
            ["Floor", "$13–29M", "Infrastructure + IP only, 30–40% founder discount"],
            ["Mid-Range", "$42–60M", "+ Revenue architecture, marketplace economics"],
            ["Ceiling", "$132–268M", "+ Ascension, category creation, compounding data moat"],
          ],
        },
        callout: { label: "Discount Schedule", text: "Founder discount decreases toward 0% with each milestone: first customer, first hire, $100K ARR, institutional investment.", variant: "primary" },
      },
      {
        heading: "Ascension Premium",
        content: "Ascension exports represent a unique value multiplier. Each exported artifact is a standalone, zero-dependency software product in any of 25 languages — with built-in IP protection via hex-encoding. This transforms CMPSBL from a platform into a software product factory, where every discovered capability becomes a sellable product with near-zero marginal cost.",
      },
    ],
  },
  {
    id: "use-of-funds",
    number: "10",
    title: "Use of Funds & Go-to-Market",
    subtitle: "Capital allocation, GTM strategy, and 18-month execution plan",
    icon: <Cpu className="w-4 h-4" />,
    accentClass: "text-violet-600 border-violet-200 bg-violet-50",
    sections: [
      {
        heading: "Capital Allocation Overview",
        content: "Seed capital will be deployed across six strategic pillars designed to maximize market entry speed while protecting the IP moat that's already built. The technology is complete — every dollar goes toward distribution, protection, and acceleration.",
        table: {
          headers: ["Category", "Allocation", "Purpose"],
          rows: [
            ["Founder Salary", "12%", "Full-time operational leadership and product direction"],
            ["Senior Developer Hire", "18%", "First engineering hire — substrate hardening, federation, SDK expansion"],
            ["Head of Sales Hire", "14%", "Enterprise pipeline development, partnership origination, pilot onboarding"],
            ["Brand & Marketing Agency", "22%", "Social media marketing, brand management, content strategy, community building"],
            ["IP Protection", "10%", "Trademarks (CMPSBL®, Ascension™, SEBA™), copyrights, provisional patents on core algorithms"],
            ["Infrastructure & API Costs", "12%", "Cloud hosting, AI provider API costs, CI/CD, monitoring, hardware for development"],
            ["Legal, Accounting & Operations", "7%", "Corporate structure, compliance, financial reporting, insurance"],
            ["Reserve & Contingency", "5%", "Runway extension, opportunistic hires, unexpected costs"],
          ],
        },
      },
      {
        heading: "Hiring Plan",
        table: {
          headers: ["Role", "Timeline", "Key Responsibilities"],
          rows: [
            ["Senior Full-Stack Developer", "Month 1–2", "Substrate hardening, federation protocol, Python/Go SDK, Memory Stream advancement"],
            ["Head of Sales", "Month 2–3", "Enterprise outreach, pilot customer acquisition, partnership development, conference representation"],
            ["Brand Management Agency", "Month 1", "Social media strategy, content calendar, developer community engagement, paid campaigns"],
          ],
        },
      },
      {
        heading: "IP Protection Strategy",
        bullets: [
          "File trademark registrations for CMPSBL®, Ascension™, SEBA™, Memory Stream™, and DREAM Engine™",
          "Copyright registration for the full substrate codebase (200,000+ lines)",
          "Provisional patent filings on core innovations: CJPI scoring algorithm, hex-encoded black-box export method, 7-gate evolution pipeline",
          "Trade secret documentation and NDA framework for future hires and partners",
        ],
      },
      {
        heading: "Go-to-Market Strategy",
        content: "The GTM plan follows a phased approach: lead with the capabilities that are most differentiated and already built, then expand into adjacent markets as the team and brand grow.",
        table: {
          headers: ["Phase", "Timeline", "Focus", "Revenue Target"],
          rows: [
            ["Phase 1 — Developer Adoption", "Months 1–4", "NPM package ecosystem (@cmpsbl), developer tutorials, open-source community hooks", "$0 (awareness)"],
            ["Phase 2 — Engine Marketplace", "Months 3–6", "Launch premium Engines (DREAM, ORACLE, FORGE), self-serve purchasing, developer evangelism", "$5K–$15K MRR"],
            ["Phase 3 — Ascension-as-a-Service", "Months 4–8", "Position Ascension as a never-before-seen capability — upload code, export production-ready IP-protected artifacts in 25 languages", "$15K–$40K MRR"],
            ["Phase 4 — Enterprise Pilots", "Months 6–12", "Self-improving codebases (Evolution Engine), governed AI agent deployment, compliance-ready infrastructure", "$40K–$100K MRR"],
            ["Phase 5 — Platform Expansion", "Months 10–18", "Federation, advanced agents, silicon export preview, partner ecosystem", "$100K+ MRR"],
          ],
        },
      },
      {
        heading: "Product Release Roadmap",
        table: {
          headers: ["Quarter", "Releases", "Strategic Value"],
          rows: [
            ["Q1", "NPM package hardening (11 packages), Ascension polish, Memory Stream v2 with advanced discovery", "Developer credibility, never-before-offered capabilities in the NPM ecosystem"],
            ["Q2", "DREAM Engine pooling, 5 new premium Engines, Store v2 with self-serve checkout", "Recurring revenue activation, marketplace economics"],
            ["Q3", "Self-improving Engine (Evolution-as-a-Service), 10 new Agents, Python/Go SDKs", "Enterprise readiness, multi-language reach"],
            ["Q4", "Federation protocol (multi-substrate), hardware export preview, partner API", "Platform economics, long-term defensibility"],
          ],
        },
      },
      {
        heading: "Marketing & Distribution Channels",
        table: {
          headers: ["Channel", "Strategy", "Expected Impact"],
          rows: [
            ["Social Media (Brand Agency)", "Daily content: demos, architecture explainers, capability spotlights, founder narrative", "Brand awareness, developer trust, investor visibility"],
            ["NPM Ecosystem", "Publish hardened @cmpsbl packages with capabilities never offered before — cognitive memory, governed evolution, sealed agents", "Developer adoption, organic growth, community contributions"],
            ["Developer Content", "Technical blog posts, video walkthroughs, comparison guides vs LangChain/Copilot/Devin", "SEO, thought leadership, inbound leads"],
            ["Conference & Events", "AI infrastructure conferences, startup pitch competitions, developer meetups", "Enterprise leads, investor introductions, press coverage"],
            ["Strategic Partnerships", "Integration partners (CI/CD platforms, cloud providers), channel partners (consultancies)", "Distribution leverage, credibility, enterprise access"],
          ],
        },
      },
      {
        heading: "Ascension — A Never-Before-Seen Service",
        content: "Ascension is already built and functional. No other platform offers this: upload any code → classify its archetype → filter and score capabilities → export as a single-file, zero-dependency, IP-protected distribution in 25 languages. With polish and marketing, Ascension becomes the flagship differentiator — a product factory where every export is a revenue event with near-zero marginal cost.",
        callout: { label: "Key Differentiator", text: "Ascension transforms CMPSBL from a platform into a software product factory. Every developer becomes 10x. Every script becomes a portable, sellable product. No competitor offers anything comparable.", variant: "primary" },
      },
      {
        heading: "18-Month Success Metrics",
        table: {
          headers: ["Metric", "Target", "How"],
          rows: [
            ["Monthly Recurring Revenue", "$100K+ MRR", "Subscriptions + marketplace + Ascension exports"],
            ["NPM Downloads", "50,000+", "Package hardening, developer content, community building"],
            ["Active Developers", "2,000+", "Builder tier onboarding, tutorials, open hooks"],
            ["Enterprise Pilots", "3–5", "Head of Sales outreach, conference pipeline"],
            ["Registered Agents", "40+", "New agent development, community contributions"],
            ["Premium Engines", "80+", "Engine expansion across all categories"],
            ["Social Media Following", "25,000+", "Brand agency content strategy, founder narrative"],
            ["IP Filings", "5+ trademarks, 2+ patents", "Legal firm engagement, provisional filings"],
          ],
        },
      },
      {
        heading: "Why This Capital Is Sufficient",
        bullets: [
          "The product is already built — zero engineering required to launch revenue",
          "BYOK model means near-zero AI provider costs at scale",
          "Single-file exports eliminate hosting and support burden",
          "The Evolution Engine reduces engineering costs by 99.999% for maintenance",
          "CLM compounds system value daily without additional spend",
          "Every dollar goes to distribution, not development — the moat is already dug",
        ],
      },
    ],
  },
  {
    id: "evolution-engine",
    number: "11",
    title: "Evolution Engine",
    subtitle: "Self-improving software: 166 bugs fixed for $0.06",
    icon: <GitBranch className="w-4 h-4" />,
    accentClass: "text-emerald-600 border-emerald-200 bg-emerald-50",
    sections: [
      {
        heading: "Self-Improving Software",
        content: "CMPSBL's Evolution Engine autonomously detects improvement opportunities, generates patches, validates them through a governance pipeline, applies them to production, and learns from the result. Over 340 controlled cycles, it found and fixed 166 real production bugs for a total cost of $0.06.",
        callout: { label: "Bottom Line", text: "166 real bugs fixed in production for 6 cents. The system that found them is itself the product.", variant: "success" },
      },
      {
        heading: "Engine Benchmark (Deduped)",
        table: {
          headers: ["Engine", "Unique Runs", "Applied", "True Apply Rate"],
          rows: [
            ["ENCODE (cognitive pipeline)", "50", "41", "82%"],
            ["Free-Tier (Cerebras/Groq)", "100", "56", "56% — deprecated"],
            ["GPT + File Context", "65", "36", "55%"],
            ["GPT Blind (no context)", "35", "6", "17%"],
            ["GPT Direct (H2H test)", "25", "0", "0%"],
          ],
        },
      },
      {
        heading: "Controlled Head-to-Head",
        content: "25 identical substrate files processed by both ENCODE and raw GPT-4o-mini. ENCODE: 100% (25/25). GPT Direct: 0% (0/25). Same model, same files — the cognitive pipeline is the differentiator, not the LLM.",
      },
      {
        heading: "166 Bugs by Category",
        table: {
          headers: ["Category", "Count", "Examples"],
          rows: [
            ["Crash-Level Defects", "23", "Division by zero, null pointer, recursive stack overflow, missing WHERE clause"],
            ["Security & Validation", "31", "Unclamped confidence, missing auth, invalid state transitions"],
            ["Error Handling", "48", "Missing try/catch, empty fallbacks, fragile resets"],
            ["Performance", "34", "O(n)→O(1) lookups, memoization, early returns"],
            ["Observability", "30", "Missing metrics, silent failures, untracked regressions"],
          ],
        },
      },
      {
        heading: "Cost Analysis",
        table: {
          headers: ["Metric", "Value"],
          rows: [
            ["Total Cycles", "340"],
            ["Total Cost", "$0.06"],
            ["Cost per Bug", "$0.00036"],
            ["Equivalent Human Cost", "$6,225 (senior engineer, $150/hr)"],
            ["Cost Reduction", "99.999%"],
          ],
        },
      },
      {
        heading: "Market Opportunity",
        table: {
          headers: ["Segment", "TAM by 2028", "CMPSBL Advantage"],
          rows: [
            ["DevOps/CI-CD", "$15.5B", "Plugs into existing pipelines"],
            ["AppSec Testing", "$12.9B", "Finds AND fixes — not just reports"],
            ["AI Code Assistants", "$6.5B", "Autonomous, no human in the loop"],
            ["Tech Debt Mgmt", "Emerging", "First to quantify and resolve autonomously"],
          ],
        },
      },
      {
        heading: "Competitive Landscape",
        table: {
          headers: ["Competitor", "Approach", "CMPSBL Advantage"],
          rows: [
            ["GitHub Copilot", "AI suggestion", "Fully autonomous — no human needed"],
            ["Cursor", "AI editor", "System improves itself without developer"],
            ["Snyk / SonarQube", "Static analysis", "Finds AND fixes; no false positive triage"],
            ["Devin (Cognition)", "AI engineer", "40-node cognitive mesh, not general-purpose"],
            ["Kodex AI", "Auto PRs", "Brain memory compounds — each cycle is smarter"],
          ],
        },
      },
      {
        heading: "Real-World Savings",
        table: {
          headers: ["Company Size", "Manual Cost", "CMPSBL Cost", "Annual Savings"],
          rows: [
            ["Series B (500K lines)", "$75,000/yr", "<$10/yr", "$75,000+"],
            ["Enterprise (5M+ lines)", "$800,000+/yr", "<$100/yr", "$800,000+"],
          ],
        },
      },
      {
        heading: "Why This Can't Be Replicated",
        bullets: [
          "The substrate is the product AND the testbed — every improvement to the evolution engine improves the thing running it",
          "Brain memory compounds — 166 successful patches = 166 learned examples; competitors start from zero",
          "Pipeline is the moat — Batch 6: same model, same files, ENCODE 100%, raw GPT 0%",
          "Cost is inarguable — $0.06 for 166 fixes eliminates all economic objection",
        ],
      },
    ],
  },
  {
    id: "why-invest",
    number: "12",
    title: "Why Invest Now",
    subtitle: "The case for early participation in CMPSBL",
    icon: <Globe className="w-4 h-4" />,
    accentClass: "text-primary border-primary/20 bg-primary/5",
    sections: [
      {
        heading: "The Opportunity",
        content: "CMPSBL is pre-revenue with a fully built, production-running platform. This is the earliest possible entry point for investors — maximum upside with technology risk already eliminated. The substrate runs, the evolution engine works, the marketplace is priced, and the export system produces real artifacts.",
      },
      {
        heading: "What's Built vs. What's Planned",
        table: {
          headers: ["Status", "Items", "Significance"],
          rows: [
            ["✅ Built & Running", "40-node substrate, 675+ capabilities, evolution engine, marketplace, 25-language export, governance, security mesh", "Core product is complete"],
            ["✅ Validated", "166 bugs auto-fixed for $0.06, ENCODE 100% apply rate, CLM training pipeline", "Technology works in production"],
            ["🔄 In Progress", "Federation (multi-substrate), additional agent development", "Growth expansion"],
            ["📋 Planned", "Silicon export (FPGA/ASIC), enterprise partnerships", "Long-term differentiation"],
          ],
        },
      },
      {
        heading: "Investment Thesis",
        bullets: [
          "Category creation — first governed cognitive infrastructure platform",
          "Technology risk eliminated — the product is built and running",
          "Compounding moat — Brain memory, CLM, and evolution data grow daily",
          "Multiple revenue streams — subscriptions, marketplace, exports, licenses",
          "Capital efficient — $0.06 for 166 bug fixes demonstrates extreme efficiency",
          "Regulatory tailwind — EU AI Act and enterprise compliance demand governed AI",
          "Massive TAM — $35B+ addressable market with no direct competitor",
        ],
      },
      {
        heading: "What We Need",
        content: "Seed funding to accelerate go-to-market, hire the first 3 engineers, and onboard pilot enterprise customers. The technology is built. The documentation is complete. The moat is widening daily through CLM and evolution. What's needed is fuel for distribution.",
      },
      {
        heading: "First Mover Advantage",
        callout: { 
          label: "The Window", 
          text: "Every day CMPSBL runs, the Brain learns more, the evolution engine fixes more bugs, and the Memory Stream discovers more capabilities. Early investors benefit from a moat that literally grows while you sleep.", 
          variant: "success" 
        },
      },
    ],
  },
];

// ─── Beautiful Print-Optimized Document Viewer ──────────────

function DocViewer({ doc, onBack }: { doc: InvestorDoc; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Print Stylesheet - forces light theme for printing */}
      <style>{`
        @media print {
          body, html { background: white !important; color: #111 !important; }
          .no-print { display: none !important; }
          .print-doc { 
            max-width: 100% !important; 
            padding: 0.5in 0.75in !important;
            font-size: 11pt !important;
          }
          .print-doc h1 { font-size: 22pt !important; }
          .print-doc h2 { font-size: 14pt !important; page-break-after: avoid; }
          .print-doc table { page-break-inside: avoid; }
          .print-doc .doc-section { page-break-inside: avoid; }
          @page { margin: 0.5in; size: letter; }
        }
      `}</style>

      {/* Header Bar — hidden on print */}
      <div className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 sm:px-8 py-2.5 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Library
        </button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.print()} 
          className="gap-1.5 text-xs rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / PDF
        </Button>
      </div>

      {/* Document Content — light theme enforced */}
      <article className="print-doc max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Document Header */}
        <header className="mb-10 pb-8 border-b-2 border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-medium">
              CMPSBL® — Confidential
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[10px] font-mono text-slate-400">
              Document {doc.number} of {INVESTOR_DOCS.length}
            </span>
          </div>
          
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${doc.accentClass}`}>
              <span className="text-lg font-mono font-black">{doc.number}</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {doc.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">{doc.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
            <span>Version 17.0.0</span>
            <span>·</span>
            <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>·</span>
            <span>Investor Use Only</span>
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-10">
          {doc.sections.map((section, i) => (
            <section key={i} className="doc-section">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-mono text-slate-500 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {section.heading}
              </h2>

              {section.content && (
                <p className="text-sm text-slate-600 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: section.content }} />
              )}

              {section.bullets && (
                <ul className="space-y-2 mb-4">
                  {section.bullets.map((bullet, bi) => (
                    <li key={bi} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: bullet }} />
                    </li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {section.table.headers.map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, ri) => (
                        <tr key={ri} className="border-b border-slate-100 last:border-0">
                          {row.map((cell, ci) => (
                            <td key={ci} className={`px-4 py-3 text-xs leading-relaxed ${
                              ci === 0 ? 'font-semibold text-slate-800' : 'text-slate-600'
                            }`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.callout && (
                <div className={`rounded-xl p-4 mb-4 border ${
                  section.callout.variant === 'success' 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : section.callout.variant === 'warning'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className={`text-[10px] font-mono uppercase tracking-wider font-bold mb-1 ${
                    section.callout.variant === 'success' ? 'text-emerald-700' 
                    : section.callout.variant === 'warning' ? 'text-amber-700'
                    : 'text-blue-700'
                  }`}>
                    {section.callout.label}
                  </p>
                  <p className={`text-xs leading-relaxed ${
                    section.callout.variant === 'success' ? 'text-emerald-700' 
                    : section.callout.variant === 'warning' ? 'text-amber-700'
                    : 'text-blue-700'
                  }`}>
                    {section.callout.text}
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-slate-200">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>© 2025–2026 CMPSBL®</span>
            <span>Confidential — Investor Use Only</span>
          </div>
          <p className="text-[9px] text-slate-300 mt-2 text-center">
            cmpsbl.ai · Cognitive Infrastructure Layer for AI
          </p>
        </footer>
      </article>
    </div>
  );
}

// ─── Library Index ──────────────────────────────────────────
interface InvestorDocLibraryProps {
  onBack: () => void;
}

export const InvestorDocLibrary = ({ onBack }: InvestorDocLibraryProps) => {
  const [activeDoc, setActiveDoc] = useState<InvestorDoc | null>(null);

  if (activeDoc) {
    return <DocViewer doc={activeDoc} onBack={() => setActiveDoc(null)} />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-mesh)" }} />

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl px-4 sm:px-8 py-2.5 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />Back to Showcase
        </button>
        <span className="text-[10px] font-mono text-primary/70 uppercase tracking-wider">CMPSBL®</span>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center" style={{ boxShadow: "var(--shadow-glow)" }}>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Investor Library</h1>
              <p className="text-xs text-muted-foreground">{INVESTOR_DOCS.length} documents · Printable · Confidential</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Complete investor documentation — each document is formatted for beautiful on-screen reading and optimized for print. Click <strong>Print / PDF</strong> inside any document to generate a clean, professional PDF.
          </p>
        </motion.div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INVESTOR_DOCS.map((doc, i) => (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              onClick={() => setActiveDoc(doc)}
              className="text-left rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-5 hover:border-primary/20 hover:shadow-lg transition-all group active:scale-[0.98]"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${doc.accentClass}`}>
                  <span className="text-xs font-mono font-black">{doc.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm">{doc.title}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 break-words">
                    {doc.subtitle}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-primary/40 group-hover:text-primary shrink-0 mt-1 transition-colors" />
              </div>
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                {doc.sections.slice(0, 3).map((s, si) => (
                  <span key={si} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-border/10 truncate max-w-[120px]">
                    {s.heading}
                  </span>
                ))}
                {doc.sections.length > 3 && (
                  <span className="text-[9px] text-muted-foreground/50">+{doc.sections.length - 3}</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground/40 font-mono">
          © 2025–2026 CMPSBL® · Confidential — Investor Use Only
        </p>
      </div>
    </div>
  );
};
