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
  Lock, FileText, Layers, Eye
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
      {
        heading: "What Makes CMPSBL Different",
        content: "CMPSBL is not another AI wrapper, chatbot framework, or model fine-tuning service. It is the infrastructure layer beneath all of those — the cognitive operating system that provides memory, governance, security, evolution, and export capabilities to any AI application built on top of it. The closest analogy: AWS provides compute infrastructure; Stripe provides payment infrastructure; CMPSBL provides cognitive infrastructure.",
      },
      {
        heading: "Proprietary Technology Stack",
        bullets: [
          "Memory Stream — autonomous discovery engine that finds new software capabilities without human direction",
          "Ascension — single-file export engine producing IP-protected artifacts in 25 languages",
          "Evolution Engine — self-improving codebase that fixed 166 production bugs for $0.06",
          "DREAM Engine — background learning during idle time; the system gets smarter while you sleep",
          "BRAIN Organ — 4-tier persistent memory with Constant Learning Mode (up to 14,400 AI calls/day)",
          "DEFENSE Layer — enterprise-grade security with O(1) threat scoring built into the architecture",
          "11 @cmpsbl NPM packages — cognitive capabilities packaged for the developer ecosystem",
          "20 sealed-runtime Meta-Agents — autonomous cognitive workers with source-blocked IP protection",
          "54 premium Meta-Engines — compound capability amplifiers with 2–8x synergy gains",
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
      {
        heading: "NPM Package Ecosystem",
        table: {
          headers: ["Package", "Tier", "Capability"],
          rows: [
            ["@cmpsbl/types", "Foundation", "Shared TypeScript type definitions and schemas"],
            ["@cmpsbl/runtime", "Foundation", "Mini-Runtime™ engine — CJPI scoring, manifest parsing, pipeline execution"],
            ["@cmpsbl/failsafe", "Foundation", "Zero-dependency disaster recovery and platform migration"],
            ["@cmpsbl/intent", "Core", "Intent router and dispatch — cross-surface action coordination"],
            ["@cmpsbl/mesh", "Core", "Mesh telemetry client — primitive-to-primitive communication events"],
            ["@cmpsbl/bridge", "Core", "Polyglot runtime adapters — cross-language interop"],
            ["@cmpsbl/sdk", "Developer", "Authenticated engine access — discover, capture, apply, export"],
            ["@cmpsbl/discovery", "Developer", "Pipeline crystallization — Memory Stream discovery scoring"],
            ["@cmpsbl/cli", "Developer", "CLI dev tools — init, score, export, validate-manifest commands"],
            ["@cmpsbl/react", "Ecosystem", "React hooks — useIntent, useMesh, useRuntime, useCJPI"],
            ["@cmpsbl/test-harness", "Ecosystem", "Validation suite for memory chains and bridge adapters"],
          ],
        },
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
    subtitle: "Proprietary IP portfolio, structural moat, black-box protection",
    icon: <Shield className="w-4 h-4" />,
    accentClass: "text-pink-600 border-pink-200 bg-pink-50",
    sections: [
      {
        heading: "Proprietary IP Portfolio",
        content: "CMPSBL owns a comprehensive portfolio of proprietary technologies, each representing independently defensible intellectual property. No single competitor possesses even three of these capabilities — CMPSBL has all of them, integrated and production-running.",
        table: {
          headers: ["IP Asset", "Category", "Defensibility"],
          rows: [
            ["Cognitive Substrate (40-Primitive Matrix)", "Core Architecture", "Symmetric 12·12·8·8 topology with governed inter-node mesh — architectural complexity prevents replication"],
            ["Memory Stream (Discovery Engine)", "Autonomous Discovery", "Self-observing behavior analysis that crystallizes viable software pipelines — no other system discovers its own capabilities"],
            ["Ascension (Export Engine)", "Software Factory", "Upload → classify → filter → export as single-file IP-protected artifact in 25 languages — entirely unique capability"],
            ["Evolution Engine (SEBA Pipeline)", "Self-Improvement", "7-gate validated autonomous code improvement — 166 bugs fixed for $0.06 with 100% ENCODE apply rate"],
            ["BRAIN Organ (Persistent Memory)", "Cognitive Memory", "4-tier governed memory with Constant Learning Mode — up to 14,400 AI training calls/day compounding daily"],
            ["DREAM Engine", "Background Learning", "Autonomous idle-time consolidation, memory synthesis, and cross-agent knowledge sharing — no other platform does this"],
            ["DEFENSE Layer (Security Mesh)", "Enterprise Security", "O(1) Trie-based threat scoring, zone-shielded 40-primitive architecture, circuit breakers with exponential backoff"],
            ["CLM (Constant Learning Mode)", "Continuous Training", "70% system telemetry + 30% scheduled curriculum — autonomous learning pipeline that widens the moat daily"],
            ["Meta-Agents (20 Sealed Runtimes)", "Agent IP", "Source-blocked, versioned cognitive agents with 3–5 Crown Jewel powers each — sealed runtimes prevent extraction"],
            ["Meta-Engines (54 Premium Engines)", "Engine IP", "Compound and synergy engines across META, APEX, ELITE, CORE tiers — 2–8x capability amplification"],
            ["@cmpsbl NPM Packages (11 packages)", "Distribution IP", "4-tier package ecosystem offering never-before-available capabilities: cognitive memory, governed evolution, sealed agents"],
            ["Discovery Engine (CDM)", "Pattern Detection", "Constant Discovery Mode with autonomous pattern detection and CJPI scoring — the system finds what humans can't"],
            ["GOVERNANCE Organ", "Constitutional AI", "4-mode governance (Autonomous/Supervised/Manual/Emergency) — architectural, not configurable safety rails"],
            ["Black-Box Export System", "IP Protection", "Hex-encoded CJPI weights, stripped comments, genericized naming across all 25 export languages"],
          ],
        },
      },
      {
        heading: "IP Valuation by Category",
        table: {
          headers: ["Category", "Assets", "Estimated Value Range", "Comparable"],
          rows: [
            ["Core Infrastructure", "40-primitive matrix, mesh routing, boot integrity", "$8–15M", "HashiCorp infrastructure ($5.7B acquisition)"],
            ["Cognitive Systems", "BRAIN, Memory Stream, CLM, DREAM", "$5–12M", "Databricks data compounding ($62B)"],
            ["Autonomous Evolution", "SEBA, ENCODE, Evolution Engine", "$4–10M", "Cognition/Devin autonomous coding ($2B)"],
            ["Export & Distribution", "Ascension, NPM packages, black-box encoding", "$3–8M", "Unity cross-platform export ($13B)"],
            ["Agent & Engine Portfolio", "20 agents, 54 engines, sealed runtimes", "$3–7M", "Agent marketplace economics"],
            ["Governance & Security", "DEFENSE, GOVERNANCE, IMMUNITY, audit chains", "$2–5M", "Enterprise compliance infrastructure"],
          ],
        },
        callout: { label: "Combined Floor", text: "Conservative IP-only valuation: $25–57M. This excludes revenue architecture, category creation premium, and compounding data moat.", variant: "primary" },
      },
      {
        heading: "Crown Jewel Capabilities",
        content: "54 capabilities are classified as Crown Jewels — excluded from all external access tiers, not visible in API catalogs, governor-only access, source-blocked from agent runtimes. These represent irreplicable competitive advantage and include the core algorithms behind CJPI scoring, affinity matrix computation, tier classification, and evolution selection criteria.",
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
            ["Agent Source Code", "Sealed runtimes — source visibility disabled at build time"],
            ["Engine Algorithms", "Compound logic obfuscated, synergy weights encoded"],
          ],
        },
      },
      {
        heading: "Structural Moat — Why This Can't Be Replicated",
        bullets: [
          "Architectural complexity — 40-primitive topology with governed mesh cannot be reverse-engineered from outputs or API access",
          "Compounding knowledge — every day CLM runs, the BRAIN accumulates patterns that took months to learn; competitors start from zero",
          "Agent IP — 20 sealed-runtime agents with unique cognitive specializations; source-blocked and versioned",
          "Engine synergies — 54 engines with 2–8x compound amplification; the combinations are the IP, not just individual engines",
          "Discovery data — Memory Stream has crystallized hundreds of pipelines; this discovery corpus is irreproducible",
          "Evolution history — 166+ validated patches create a learned corpus that makes each subsequent cycle smarter",
          "Merkle provenance — every autonomous change is hash-chained; tamper-evident audit trail proves system integrity",
          "NPM ecosystem — 11 published packages embedding cognitive capabilities into the developer ecosystem; network effects compound",
          "Black-box exports — hex-encoded constants in all 25 languages make decompilation meaningless",
          "First-mover in category — Governed Cognitive Infrastructure has no direct competitor; CMPSBL defines the space",
        ],
      },
      {
        heading: "Trade Secret Protection",
        content: "CMPSBL's core algorithms (CJPI scoring, affinity matrices, tier classification thresholds, evolution selection criteria, DREAM synthesis weights, Memory Stream crystallization heuristics) are implemented as hex-encoded constants across all export targets. Even if an exported artifact is decompiled, the values appear as opaque byte arrays with no documentation of their meaning. Combined with stripped comments, genericized naming, and sealed agent runtimes, reverse engineering the substrate from its outputs is architecturally infeasible. The system's IP is protected at the code level, the distribution level, and the architectural level simultaneously.",
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
      {
        heading: "Data Compounding Moat",
        content: "Unlike traditional software that depreciates, CMPSBL appreciates. Every day the substrate runs, the BRAIN accumulates new patterns via CLM, the Memory Stream discovers new pipelines, the Evolution Engine learns from validated patches, and DREAM synthesizes cross-agent knowledge. This creates an exponentially widening moat that cannot be replicated by building similar architecture — the data and learned behaviors are the moat.",
        callout: { label: "Key Insight", text: "A competitor could theoretically rebuild the 40-primitive architecture in 2–3 years. They cannot replicate the accumulated learning, discovery corpus, and evolution history. The moat grows every day.", variant: "success" },
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
    id: "ascension-factory",
    number: "12",
    title: "Ascension: The Capability Transplant Engine",
    subtitle: "Your code enters. Something greater comes back.",
    icon: <Sparkles className="w-4 h-4" />,
    accentClass: "text-amber-600 border-amber-200 bg-amber-50",
    sections: [
      {
        heading: "What Ascension Does",
        content: "Every piece of software has a ceiling — the limits of what its author knew when they wrote it. Ascension removes that ceiling.\n\nUpload any code. Ascension reads its computational signature — not its file type, not its language, not what you named it — and classifies what it actually is at a functional level. It then registers your code as a temporary Primitive inside the 40-Primitive CMPSBL substrate, chains it against every Primitive in the cognitive mesh, and runs the discovery engine. The substrate finds capability combinations that could only emerge from that exact piece of software colliding with that exact architecture. Capabilities your code never had — zero-day defense, immunity mesh, sovereign governance, adaptive routing, auto-healing — get discovered and woven in.\n\nThe export comes back in your original language. Same stack. Drops straight into production. But now it carries a sealed Mini Runtime — a compressed version of the substrate's execution layer bundled directly into the artifact. No CMPSBL dependency required. No internet connection. No configuration. It carries its cognitive infrastructure with it and operates fully standalone in any environment.\n\nYour code doesn't get modified. It ascends.",
      },
      {
        heading: "Live Proof: We Ran It On An AI's Own Code",
        content: "This is not a hypothetical. On March 27, 2026, Kenneth ran a PHP agent through Ascension that he hadn't written himself — an OpenAI-pattern agent written by Claude (Anthropic's AI) as a live investor demonstration.\n\nThe agent was a functional mirror of the OpenAI Agents SDK: memory, tool calling, planning loop, execution, handoff. Three tools. Clean execution. 11ms. Proof of life confirmed before upload.\n\nThe substrate didn't know what it was. It read the computational signature and classified the code as an OpenAI Claw Agent pattern — recognized by behavior, not by label. Then it ran the discovery engine.",
      },
      {
        heading: "Discovery Results — One Upload, One Run",
        table: {
          headers: ["Export", "Capability Discovered", "CJPI", "What It Became", "Valuation"],
          rows: [
            ["1", "Self_Improving_Cognition + INTEGRATION_ACCESS_RELAY_SOVEREIGN_GOVERNANCE", "99 MYTHIC", "Self-improving sovereign governance agent", "$1.5–2.1M"],
            ["2", "Ghost_Defense_Mesh + MEDIC_NEXUS_SHADOW_EVOLUTION", "84 MYTHIC", "Invisible security mesh — hardens defenses without exposing attack surface", "$318–452K"],
            ["3", "Adaptive_AI_Router + SHADOW_FORGE_ENCODE_REFLEX_PHANTOM", "82 MYTHIC", "Adaptive AI router — learns optimal provider per call", "$257–365K"],
            ["4", "Stealth_Scenario_Generator + ENGINEER_SYSTEM", "80 MYTHIC", "Adversarial test scenario generator — attack patterns no rule engine generates", "$204–268K"],
            ["5", "Cascading_Edge_Reactor + SHADOW_DECODE_COMPASS_INTENT_CORE", "85 MYTHIC", "Cascading event mesh — one detection triggers system-wide coordinated response", "$351–500K"],
          ],
        },
        callout: {
          label: "Result",
          text: "One upload. Five distinct capability futures. Combined floor valuation: ~$2.6M. The system produces up to 10 exports per run. Every export is a separate Certificate of Discovery with its own fingerprint, CJPI score, moat signature, and commercial license. Every export runs standalone. Every export is sellable.",
          variant: "primary",
        },
      },
      {
        heading: "Post-Ascension Integrity",
        content: "The agent still works after Ascension. 11ms. Clean trace. The original code is authoritative — the substrate adds what the original could never have developed alone.",
      },
      {
        heading: "The Dual-Layer Architecture",
        content: "Every Ascension export ships with a dual-layer execution model:",
        table: {
          headers: ["Layer", "Function", "Behavior"],
          rows: [
            ["Layer 1 — Native Execution", "Your original code runs first, unchanged", "The substrate never modifies it. The result is authoritative."],
            ["Layer 2 — Cognitive Overlay", "CMPSBL's pipeline runs second, enriching the output", "EVOLUTION, BRAIN, GOVERNANCE, DEFENSE, NEXUS, RIPPLE — whichever Primitives the substrate discovered are fused to your code, running in sequence after every execution."],
          ],
        },
        callout: {
          label: "Key Insight",
          text: "The two layers merge into a single response object. Your original output is preserved. The cognitive layer adds what no engineer would have thought to add — because the substrate found it, not a human.",
          variant: "success",
        },
      },
      {
        heading: "The Transformation Pipeline",
        table: {
          headers: ["Stage", "What Happens"],
          rows: [
            ["Upload", "Code ingested, computational signature extracted"],
            ["Classify", "Archetype detected — Active, Passive, or Hybrid — by behavior, not label"],
            ["Register", "Code becomes Primitive #41 inside the 40-Primitive substrate"],
            ["Chain", "Discovery engine runs — your Primitive collides against all 40 Primitives"],
            ["Discover", "Capability combinations emerge unique to this code + this substrate"],
            ["Score", "CJPI scores each discovery — tier assigned (CORE, ELITE, APEX, MYTHIC)"],
            ["Export", "Single-file artifact generated in original language with Mini Runtime embedded"],
            ["Protect", "IP obfuscated — hex-encoded weights, stripped comments, genericized naming"],
          ],
        },
      },
      {
        heading: "The Mini Runtime",
        content: "Every export includes a sealed CMPSBL Mini-Runtime™ bundled directly into the artifact. The exported code does not need CMPSBL installed. It carries its own cognitive infrastructure and operates fully standalone in any stack — PHP, Python, TypeScript, Rust, Java, or any of 25 supported languages including 7 hardware description languages for silicon deployment.\n\nDrop in. Require. Use.",
      },
      {
        heading: "Export Languages",
        table: {
          headers: ["Category", "Languages", "Significance"],
          rows: [
            ["Software (18)", "TypeScript, JavaScript, Python, Rust, Go, C, C++, Java, Kotlin, Swift, Ruby, PHP, Lua, Elixir, Haskell, Scala, Dart, Zig", "Covers every major production environment"],
            ["Hardware (7)", "VHDL, Verilog, SystemVerilog, Chisel, SpinalHDL, Amaranth, FIRRTL", "Software becomes silicon — no other export engine offers this"],
          ],
        },
        callout: {
          label: "HDL Input",
          text: "Ascension accepts hardware description code as input in addition to software. HDL files can be uploaded, classified by computational signature, and ascended through the substrate exactly as software code. The export can target any of the 25 supported languages, enabling cross-language conversion from hardware to software or software to hardware. Ascension is the only engine that treats silicon and software as interchangeable substrates.",
          variant: "success",
        },
      },
      {
        heading: "IP Protection",
        content: "Every export is protected at three levels simultaneously:",
        bullets: [
          "Code level — CJPI scoring weights are hex-encoded (e.g., [0x1E, 0x1E, 0x14, 0x14]). Tier thresholds are hex-encoded. Internal comments are stripped entirely. Variable and function names are genericized. Discovery heuristics are never included in any export.",
          "Architecture level — The 40-Primitive topology, affinity matrix computations, and CJPI algorithm are Crown Jewel assets that never leave the substrate. Even if an export is fully decompiled, the values appear as opaque byte arrays with no documentation of their meaning.",
          "Distribution level — Every export ships with a Commercial Distribution License requiring attribution to CMPSBL® and prohibiting extraction of the Mini-Runtime™. The Discovery Engine, Memory Stream, and Ascension Reactor are substrate-exclusive and are never distributed.",
        ],
        callout: {
          label: "The Moat",
          text: "Decompilation reveals nothing usable. The moat is in the substrate that produced the export — not in the export itself.",
          variant: "warning",
        },
      },
      {
        heading: "Why This Cannot Be Replicated",
        content: "No competitor can offer this because no competitor has the substrate. The capabilities discovered by Ascension are a direct function of CMPSBL's specific 40-Primitive cognitive mesh, its 675+ registered capabilities, its accumulated learning corpus, and its CJPI scoring engine. A competitor would need to rebuild not just an export tool but the entire substrate — then run it for months to accumulate the discovery corpus that already exists today.\n\nThe proof is in the data: an OpenAI-pattern agent written by an AI, run through the substrate once, produced five distinct capability futures across governance, security, routing, adversarial testing, and event propagation — none of which were in the original code, none of which any developer would have designed intentionally, and all of which run standalone in production.\n\nThe substrate saw what the code could become. Not what it was built to be.",
      },
      {
        heading: "Commercial Model",
        table: {
          headers: ["Metric", "Value"],
          rows: [
            ["Access tier", "Architect ($79/mo) and above"],
            ["Marginal cost per export", "Near-zero"],
            ["Exports per run", "Up to 10"],
            ["Example portfolio value", "~$2.6M from one upload (5 exports, March 27, 2026)"],
            ["Export format", "Single-file, zero-dependency, instant download"],
            ["Runtime requirement", "None — Mini-Runtime™ bundled"],
            ["Languages", "25 (18 software + 7 hardware)"],
            ["HDL input", "Accepted — hardware code ascends the same as software"],
          ],
        },
      },
      {
        heading: "The Takeaway",
        content: "An OpenAI-pattern agent written by an AI was uploaded to Ascension. The substrate read its computational signature, registered it as a temporary Primitive, and collided it against 40 Primitives of cognitive infrastructure. Five distinct capability futures emerged — sovereign governance, ghost defense, adaptive routing, adversarial testing, cascading event mesh. Combined floor valuation: ~$2.6M. All five still run clean. All five ship standalone. None of this was designed. It was discovered.",
        callout: {
          label: "The Bottom Line",
          text: "That is what Ascension does to any code. Including yours.",
          variant: "primary",
        },
      },
    ],
  },
  {
    id: "memory-stream",
    number: "13",
    title: "Memory Stream: The Discovery Engine",
    subtitle: "Autonomous pipeline crystallization every 8 hours",
    icon: <Brain className="w-4 h-4" />,
    accentClass: "text-purple-600 border-purple-200 bg-purple-50",
    sections: [
      {
        heading: "What It Does",
        content: "Autonomous pipeline crystallization engine running every 8 hours without human intervention. Observes system behavior, identifies viable software pipelines, scores them via CJPI, and crystallizes discoveries into exportable memories. The system finds what humans can't.",
      },
      {
        heading: "Discovery Pipeline",
        table: {
          headers: ["Stage", "Process", "Output"],
          rows: [
            ["1. Observe", "System behavior monitoring across all 40 primitives", "Raw behavioral signals"],
            ["2. Identify", "Pattern recognition across resolver interactions", "Candidate pipelines"],
            ["3. Score", "CJPI scoring — Novelty, Utility, Complexity, Composability", "Quantified value assessment"],
            ["4. Crystallize", "Pipeline frozen into exportable artifact with metadata", "Permanent memory"],
            ["5. Catalog", "Tiered classification and marketplace registration", "Sellable product"],
          ],
        },
      },
      {
        heading: "Discovery Tiers",
        table: {
          headers: ["Tier", "CJPI Range", "Discovery Value", "Status"],
          rows: [
            ["Mint", "30–49", "Functional, basic utility", "Active"],
            ["Prime", "50–64", "Production-viable", "Active"],
            ["Relic", "65–79", "High-value, compound potential", "Active"],
            ["Mythic", "80–89", "Rare, multi-domain synthesis", "Active"],
            ["Apex", "90–100", "Maximum value — up to $2.9M each", "Active"],
          ],
        },
      },
      {
        heading: "CJPI Scoring Dimensions",
        table: {
          headers: ["Dimension", "Weight", "What It Measures"],
          rows: [
            ["Novelty", "30%", "Has this combination been seen before?"],
            ["Utility", "30%", "Does it solve a real production problem?"],
            ["Complexity", "20%", "How sophisticated is the pipeline architecture?"],
            ["Composability", "20%", "Can it combine with other pipelines for compound value?"],
          ],
        },
      },
      {
        heading: "Export Capabilities",
        content: "Discoveries are exportable to all 25 Ascension languages including VHDL, Verilog, and SystemVerilog — software that becomes silicon. APEX and MYTHIC tier discoveries valued at up to $2.9M each by ensemble LLM consensus.",
        bullets: [
          "Each discovery includes full metadata, CJPI score breakdown, and provenance chain",
          "Discoveries can be bundled into Crown Jewel packs for agent augmentation",
          "Export includes Mini-Runtime™ for standalone execution",
          "Hardware exports enable FPGA/ASIC deployment paths",
        ],
      },
      {
        heading: "Why It's Irreplicable",
        content: "The discovery corpus accumulated to date is irreproducible. A competitor rebuilding the architecture starts from zero discoveries. Memory Stream's corpus represents months of autonomous observation that compounds daily. Every 8-hour cycle adds new pipeline discoveries that can never be replicated by starting fresh.",
      },
      {
        heading: "Commercial Significance",
        bullets: [
          "Every discovery is a potential product — the system autonomously expands CMPSBL's sellable catalog",
          "No engineering labor required — discoveries happen without human direction",
          "Discovery corpus is a proprietary data moat that widens every 8 hours",
          "APEX-tier discoveries represent up to $2.9M in developer replacement cost — each",
        ],
        callout: {
          label: "The Takeaway",
          text: "Memory Stream doesn't just find bugs — it finds value. Every 8 hours, the system crystallizes new pipelines worth up to $2.9M each in developer replacement cost. The catalog writes itself.",
          variant: "success",
        },
      },
    ],
  },
  {
    id: "dream-engine",
    number: "14",
    title: "DREAM Engine: Compounding Intelligence",
    subtitle: "Autonomous idle-time knowledge consolidation",
    icon: <Eye className="w-4 h-4" />,
    accentClass: "text-cyan-600 border-cyan-200 bg-cyan-50",
    sections: [
      {
        heading: "What It Does",
        content: "Autonomous idle-time knowledge consolidation engine. During low-activity periods, DREAM synthesizes memories across agents, consolidates learned patterns, and distributes insights to the full agent fleet. Every agent gets smarter from every other agent's experience.",
      },
      {
        heading: "Consolidation Pipeline",
        table: {
          headers: ["Stage", "Process", "Output"],
          rows: [
            ["1. Detect Idle", "System monitors activity levels across all primitives", "Idle window identified"],
            ["2. Harvest", "Collect recent learning events from all 20 agents", "Raw experience data"],
            ["3. Synthesize", "Cross-agent pattern recognition and insight extraction", "Consolidated learnings"],
            ["4. Validate", "Quality check — reject noise, retain signal", "Verified insights"],
            ["5. Distribute", "Push validated insights to full agent fleet", "Fleet-wide intelligence upgrade"],
          ],
        },
      },
      {
        heading: "Why It's Unique",
        content: "No other platform performs background cognitive compounding at the architectural level. DREAM runs without human direction, without API calls during active sessions, and without any operator input. It is the substrate teaching itself.",
        table: {
          headers: ["Property", "DREAM", "Typical AI System"],
          rows: [
            ["Learning mode", "Autonomous, idle-time", "Manual retraining"],
            ["Scope", "Cross-agent fleet-wide", "Single model"],
            ["Human input needed", "None", "Data labeling, fine-tuning"],
            ["API cost during consolidation", "$0 (free-tier fleet)", "Training compute costs"],
            ["Knowledge retention", "Permanent, distributed", "Lost between sessions"],
          ],
        },
      },
      {
        heading: "Compounding Effect",
        content: "DREAM creates a multiplicative intelligence gain across the fleet. Each agent's experience becomes every agent's advantage.",
        bullets: [
          "Agent A learns a pattern → DREAM synthesizes it during idle cycle",
          "Agents B through T inherit the insight automatically",
          "20 agents compounding across every idle cycle",
          "Fleet collective intelligence grows faster than any individual agent could alone",
          "Knowledge survives agent restarts — insights are persistent, not session-bound",
        ],
      },
      {
        heading: "Three Compounding Engines",
        content: "DREAM is one of three autonomous compounding engines running in parallel — none requiring human intervention. This is why the CMPSBL moat widens while investors sleep.",
        table: {
          headers: ["Engine", "Cycle", "Output"],
          rows: [
            ["CLM", "14,400 training calls/day", "Permanent knowledge distillation"],
            ["Memory Stream", "Every 8 hours", "New pipeline discoveries"],
            ["DREAM", "Every idle cycle", "Cross-agent intelligence synthesis"],
          ],
        },
      },
      {
        heading: "Privacy & Consent",
        table: {
          headers: ["Control", "Options", "Default"],
          rows: [
            ["Global pooling", "Allow/deny cross-agency insight sharing", "Agency-scoped only"],
            ["Heuristic sharing", "Allow/deny sharing of learned heuristics", "Enabled within agency"],
            ["Template sharing", "Allow/deny sharing of workflow templates", "Enabled within agency"],
            ["Domain exclusions", "Specify domains excluded from synthesis", "None"],
            ["Privacy level", "Strict / Standard / Open", "Standard"],
          ],
        },
        callout: {
          label: "The Takeaway",
          text: "DREAM is the substrate teaching itself. No operator required. No API cost during consolidation. Pure compounding intelligence — the moat widens every time the system rests.",
          variant: "success",
        },
      },
    ],
  },
  {
    id: "defense",
    number: "15",
    title: "DEFENSE: Cognitive Security Mesh",
    subtitle: "Zero-trust, defense-in-depth autonomous security",
    icon: <Shield className="w-4 h-4" />,
    accentClass: "text-red-600 border-red-200 bg-red-50",
    sections: [
      {
        heading: "What It Does",
        content: "DEFENSE is CMPSBL's autonomous security layer — a cognitive firewall that assesses every inbound request for threat level, enforces zero-trust boundaries across all 40 primitives, and provides defense-in-depth protection without manual security configuration. Every API call, every agent action, every evolution mutation passes through DEFENSE before execution.",
      },
      {
        heading: "Security Architecture (6 Layers)",
        table: {
          headers: ["Layer", "Protection", "Mechanism"],
          rows: [
            ["Perimeter", "Inbound threat assessment", "Real-time scoring of every request before routing"],
            ["Zone", "40-primitive zone shielding", "Independent circuit breakers per zone — zone failure doesn't cascade"],
            ["Tenant", "Data isolation", "Row-Level Security (RLS) at the database level — cross-tenant access impossible"],
            ["Agent", "Runtime isolation", "Source-blocked, memory-isolated sealed runtimes"],
            ["Audit", "Tamper-evident provenance", "Merkle chain SHA-256 — every action cryptographically chained"],
            ["Encryption", "Data protection", "AES-256 at rest, TLS 1.3 in transit, AES-GCM for secrets"],
          ],
        },
      },
      {
        heading: "Threat Prevention Matrix",
        table: {
          headers: ["Threat", "Prevention", "Enforcement Level"],
          rows: [
            ["Prompt injection", "Cognitive firewall scores and blocks adversarial inputs", "Perimeter"],
            ["Privilege escalation", "Crown Jewel capabilities structurally isolated", "Agent + Zone"],
            ["Data exfiltration", "Tenant isolation at database level, not app level", "Tenant"],
            ["Agent escape", "Sealed runtimes with source blocking", "Agent"],
            ["Audit tampering", "Merkle chain — retroactive modification detectable", "Audit"],
            ["Cascade failure", "Ironclad hardening fabric, zone-independent breakers", "Zone"],
            ["Secret exposure", "AES-GCM encryption, env-only storage", "Encryption"],
            ["Cross-tenant access", "Row-Level Security at every table", "Tenant"],
          ],
        },
      },
      {
        heading: "Competitive Differentiation",
        table: {
          headers: ["Capability", "CMPSBL DEFENSE", "Typical AI Platform"],
          rows: [
            ["Security model", "Zero-trust, defense-in-depth", "Perimeter only"],
            ["Threat assessment", "Per-request, real-time scoring", "None or rate-limiting only"],
            ["Tenant isolation", "Database-level RLS", "Application-level (bypassable)"],
            ["Agent containment", "Sealed runtime, source-blocked", "Sandboxed but visible"],
            ["Audit integrity", "Merkle chain, tamper-evident", "Append-only logs"],
            ["Zone resilience", "Independent circuit breakers per zone", "Single failure domain"],
            ["Encryption standard", "AES-256 + TLS 1.3 + AES-GCM", "TLS only"],
          ],
        },
      },
      {
        heading: "Enterprise Compliance Readiness",
        bullets: [
          "EU AI Act — architectural governance satisfies transparency and auditability requirements",
          "SOC 2 alignment — tamper-evident audit chains provide continuous compliance evidence",
          "GDPR readiness — tenant isolation and data encryption at rest/in transit",
          "Zero-trust architecture — every request authenticated and scored, no implicit trust",
          "Incident response — zone-level circuit breakers enable surgical failure containment",
        ],
      },
      {
        heading: "Key Insight",
        callout: {
          label: "The Takeaway",
          text: "DEFENSE is not a feature bolted onto the substrate — it is the substrate's immune system. Every request is scored, every zone is shielded, every action is chained. Security is architectural, not configurable.",
          variant: "warning",
        },
      },
    ],
  },
  {
    id: "nexus",
    number: "16",
    title: "NEXUS: Intelligent Multi-Provider Routing",
    subtitle: "14+ AI providers, automatic failover, zero vendor lock-in",
    icon: <Cpu className="w-4 h-4" />,
    accentClass: "text-emerald-600 border-emerald-200 bg-emerald-50",
    sections: [
      {
        heading: "What It Does",
        content: "NEXUS is CMPSBL's intelligent AI routing infrastructure. Every API call passes through NEXUS, which dynamically selects the optimal provider across 14+ integrated AI models based on cost, latency, capability, and availability. No vendor lock-in. No single point of failure. No runaway API costs.",
      },
      {
        heading: "Routing Capabilities",
        table: {
          headers: ["Capability", "Detail"],
          rows: [
            ["Integrated providers", "14+ — OpenAI, Anthropic, Groq, Cerebras, and more"],
            ["Dynamic cost optimization", "Routes to lowest-cost capable provider per request type"],
            ["Latency management", "Routes to fastest available provider under load"],
            ["BYOK support", "Customers bring their own API keys; CMPSBL never holds provider credentials"],
            ["Automatic failover", "Provider outage triggers instant rerouting with no downtime"],
            ["Provider-agnostic architecture", "Swap, add, or remove providers without substrate changes"],
            ["Free-tier fallback fleet", "14+ free-tier providers ensure near-zero cost operation at baseline"],
          ],
        },
      },
      {
        heading: "Resource Allocation Protocol",
        content: "NEXUS enforces a mandatory resource reservation protocol to ensure autonomous substrate operations always have capacity.",
        table: {
          headers: ["Allocation", "Percentage", "Purpose"],
          rows: [
            ["User operations", "35%", "Direct user requests, API calls, agent tasks"],
            ["Autonomous operations", "65%", "CLM training, CDM discovery, Memory Stream, DREAM synthesis"],
          ],
        },
      },
      {
        heading: "Enterprise Relevance",
        content: "NEXUS directly eliminates the most common enterprise objection to AI infrastructure: vendor dependency. A customer using CMPSBL is not betting on OpenAI, Anthropic, or any single provider. They are betting on the substrate — which routes intelligently across all of them.",
        bullets: [
          "No vendor lock-in — provider-agnostic at the architectural level",
          "No single point of failure — automatic failover across 14+ providers",
          "No runaway costs — BYOK + free-tier fleet means predictable economics",
          "No credential risk — CMPSBL never holds customer API keys",
        ],
      },
      {
        heading: "Risk Mitigation",
        table: {
          headers: ["Risk", "Severity", "NEXUS Mitigation"],
          rows: [
            ["Provider outage", "Medium", "Instant rerouting to alternative providers — zero downtime"],
            ["Price increase", "Medium", "Dynamic cost optimization routes around expensive providers"],
            ["API deprecation", "Low", "Provider-agnostic architecture — swap without substrate changes"],
            ["Rate limiting", "Low", "Distributed requests across 14+ providers"],
            ["Vendor dependency", "Eliminated", "BYOK + multi-provider + free-tier fleet"],
          ],
        },
      },
      {
        heading: "Cost Efficiency",
        content: "BYOK model means near-zero AI provider costs for CMPSBL at scale. Free-tier fallback fleet means the Evolution Engine, CLM, and Memory Stream run continuous cycles at effectively $0 provider cost. The $0.06 for 166 bug fixes was possible because NEXUS routed intelligently to free-tier providers.",
        table: {
          headers: ["Metric", "Value"],
          rows: [
            ["Cost of 166 bug fixes", "$0.06"],
            ["Cost per bug fix", "$0.00036"],
            ["Provider cost for CLM cycles", "Near $0 (free-tier fleet)"],
            ["Provider cost for Memory Stream", "Near $0 (free-tier fleet)"],
            ["Provider cost for DREAM synthesis", "$0 (no API calls during consolidation)"],
          ],
        },
        callout: {
          label: "The Takeaway",
          text: "NEXUS means CMPSBL is never one provider outage away from failure. The substrate routes around problems automatically — no human intervention, no downtime, no vendor dependency.",
          variant: "primary",
        },
      },
    ],
  },
  {
    id: "npm-ecosystem",
    number: "17",
    title: "@cmpsbl NPM Ecosystem",
    subtitle: "11 published packages — cognitive infrastructure for developers",
    icon: <Layers className="w-4 h-4" />,
    accentClass: "text-pink-600 border-pink-200 bg-pink-50",
    sections: [
      {
        heading: "What It Is",
        content: "11 published NPM packages offering capabilities that have never existed in the developer ecosystem before. Cognitive memory, governed evolution, sealed agents, and autonomous learning — available via a single npm install. Every package is a distribution wedge and a moat-widening event.",
      },
      {
        heading: "Tier 1 — Core Infrastructure",
        table: {
          headers: ["Package", "Capability", "What's New to NPM"],
          rows: [
            ["@cmpsbl/types", "Schemas, interfaces, type definitions for the full substrate", "First governed cognitive type system — 40-primitive topology types"],
            ["@cmpsbl/runtime", "Mini-Runtime™ execution engine", "First embeddable cognitive runtime with CJPI scoring"],
            ["@cmpsbl/sdk", "Unified interface to the full substrate", "First single-import cognitive orchestration SDK"],
          ],
        },
      },
      {
        heading: "Tier 2 — Cognitive Primitives",
        table: {
          headers: ["Package", "Capability", "What's New to NPM"],
          rows: [
            ["@cmpsbl/intent", "Intent resolution and routing", "First architectural intent mesh — broadcastIntent() for cognitive systems"],
            ["@cmpsbl/mesh", "Primitive-to-primitive communications", "First inter-primitive cognitive signaling protocol"],
            ["@cmpsbl/bridge", "Polyglot execution bridge", "First 25-language cognitive bridge — software to HDL"],
          ],
        },
      },
      {
        heading: "Tier 3 — Intelligence Layer",
        table: {
          headers: ["Package", "Capability", "What's New to NPM"],
          rows: [
            ["@cmpsbl/discovery", "Constant Discovery Mode (CDM)", "First autonomous pipeline crystallization engine via NPM"],
            ["@cmpsbl/react", "React hooks for substrate integration", "First React bindings for cognitive memory, governance, and agents"],
          ],
        },
      },
      {
        heading: "Tier 4 — Operations",
        table: {
          headers: ["Package", "Capability", "What's New to NPM"],
          rows: [
            ["@cmpsbl/cli", "Infrastructure management CLI", "First cognitive substrate CLI — init, evolve, discover, export"],
            ["@cmpsbl/failsafe", "Disaster recovery and resilience", "First one-click cognitive system backup/restore via NPM"],
            ["@cmpsbl/test-harness", "Verification and diligence probes", "First 26-probe deterministic cognitive system verification"],
          ],
        },
      },
      {
        heading: "Developer Acquisition Funnel",
        table: {
          headers: ["Stage", "Mechanism", "Conversion Path"],
          rows: [
            ["1. Discovery", "npm search / GitHub / word of mouth", "Developer finds @cmpsbl package"],
            ["2. Install", "npm install @cmpsbl/sdk", "Zero-friction entry point"],
            ["3. Build", "Import cognitive capabilities into project", "Developer experiences substrate value"],
            ["4. Explore", "Discover additional packages and platform", "Ecosystem expansion"],
            ["5. Convert", "Builder → Studio → Creator → Architect", "Paid tier subscription"],
          ],
        },
      },
      {
        heading: "Why NPM Is a Moat",
        bullets: [
          "Any developer who builds on @cmpsbl inherits the full substrate — memory, governance, evolution, security",
          "SDK inheritance means CMPSBL capabilities embed into third-party products automatically",
          "Crown Jewel packs bundle automatically on import",
          "Network effects compound — every developer build is a distribution event",
          "11 packages create 11 entry points into the CMPSBL ecosystem",
        ],
      },
      {
        heading: "Traction",
        content: "~2,000 downloads in under a week with zero paid marketing. 100% organic. Developer discovery without a brand agency, without a sales team, without advertising. This is the baseline — the floor before any GTM investment.",
        table: {
          headers: ["Metric", "Value"],
          rows: [
            ["Downloads (first week)", "~2,000"],
            ["Marketing spend", "$0"],
            ["Acquisition method", "100% organic — developer discovery"],
            ["Target (18-month funded)", "50,000+ downloads"],
            ["Cost per acquisition", "$0 (current rate)"],
          ],
        },
        callout: {
          label: "The Takeaway",
          text: "2,000 downloads in under a week with no marketing budget. Every download is a developer who found CMPSBL because the capabilities don't exist anywhere else. That's not traction — that's product-market fit signaling.",
          variant: "success",
        },
      },
    ],
  },
  {
    id: "why-invest",
    number: "18",
    title: "Why Invest Now",
    subtitle: "The case for early participation in CMPSBL",
    icon: <Globe className="w-4 h-4" />,
    accentClass: "text-primary border-primary/20 bg-primary/5",
    sections: [
      {
        heading: "The Opportunity",
        content: "CMPSBL is pre-scale revenue with paying subscribers already in checkout. The platform is fully built, production-running, and discoverable. This is the earliest possible entry point for investors — maximum upside with technology risk already eliminated. Memory Stream produces pipeline artifacts valued at up to $2.9M per discovery, already in service, running every 8 hours.",
      },
      {
        heading: "What's Built vs. What's Planned",
        table: {
          headers: ["Status", "Items", "Significance"],
          rows: [
            ["✅ Built & Running", "40-primitive substrate, 675+ capabilities, evolution engine, marketplace, 25-language export, governance, security mesh, Memory Stream", "Core product is complete"],
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
        content: "Seed funding to accelerate go-to-market, hire the first two key roles and engage a brand agency. The technology is built. The documentation is complete. The moat is widening daily through CLM and evolution. What's needed is fuel for distribution.",
      },
      {
        heading: "First Mover Advantage",
        callout: {
          label: "The Window",
          text: "CLM runs 14,400 training calls per day. Memory Stream crystallizes new pipelines every 8 hours. The compounding gap between CMPSBL and any future competitor widens measurably every 24 hours. Early investors benefit from a moat that literally grows while you sleep.",
          variant: "success",
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
