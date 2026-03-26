/**
 * Investor Document Library — Printable HTML viewer for investor docs
 * Surfaces all /docs/libraries/investors/ content in a beautiful, 
 * readable, printable format within the investor-showcase.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Printer, ArrowLeft, ChevronRight, Download, 
  BookOpen, Shield, BarChart3, Zap, Brain, Users, AlertTriangle, 
  Sparkles, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Document Data ───────────────────────────────────────────
interface InvestorDoc {
  id: string;
  number: string;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  sections: DocSection[];
}

interface DocSection {
  heading: string;
  content: string; // HTML-safe markdown-like content
  table?: { headers: string[]; rows: string[][] };
}

const INVESTOR_DOCS: InvestorDoc[] = [
  {
    id: "exec-summary",
    number: "01",
    title: "Executive Summary",
    icon: <Target className="w-4 h-4" />,
    accentColor: "hsl(var(--primary))",
    sections: [
      {
        heading: "The Problem",
        content: "Current AI systems are <strong>stateless, ungoverned, and fragile</strong>. They lack persistent memory, governance, observability, validated evolution, multi-agent coordination, enterprise security, continuous learning, and disaster recovery."
      },
      {
        heading: "The Solution",
        content: "CMPSBL is a <strong>cognitive orchestration substrate</strong> — a runtime infrastructure layer providing governed, persistent, and self-evolving AI agent execution. It is not an application, chatbot, or model. It is the operating surface on which intelligent systems run."
      },
      {
        heading: "Key Numbers",
        content: "",
        table: {
          headers: ["Metric", "Value"],
          rows: [
            ["Matrix primitives", "40 across 4 categories (12·12·8·8)"],
            ["Registered capabilities", "675+"],
            ["Production code", "200,000+ lines"],
            ["Export languages", "25 (18 software, 7 HDL)"],
            ["Database tables", "60+ production"],
            ["CLM training calls/day", "Up to 14,400"],
          ]
        }
      },
      {
        heading: "Business Model",
        content: "",
        table: {
          headers: ["Revenue Stream", "Description"],
          rows: [
            ["Platform Subscriptions", "Builder → Studio ($29) → Creator ($49) → Architect ($79) → Governor"],
            ["Agent Marketplace", "20 agents across 4 price tiers ($79–$249/agent)"],
            ["Engine Marketplace", "54 premium engines across META, APEX, ELITE, CORE"],
            ["Ascension Exports", "Single-file, IP-protected capability artifacts in 25 languages"],
            ["Self-Hosted Licenses", "Full-control perpetual licenses"],
          ]
        }
      },
    ]
  },
  {
    id: "tech-arch",
    number: "02",
    title: "Technology Architecture",
    icon: <Brain className="w-4 h-4" />,
    accentColor: "hsl(var(--neon-purple))",
    sections: [
      {
        heading: "System Design",
        content: "CMPSBL is a <strong>40-primitive cognitive kernel</strong> organized into a symmetric 12·12·8·8 matrix across 4 categories: Organs (12), Layers (12), Engines (8), and Agents (8). System health is a deterministic weighted sum, not a heuristic estimate."
      },
      {
        heading: "Key Technical Differentiators",
        content: "",
        table: {
          headers: ["Differentiator", "What It Does"],
          rows: [
            ["Cognitive Engine System", "675+ capabilities consolidated into compound and meta-engines with 2–8x synergy amplification"],
            ["Constant Learning Mode (CLM)", "Up to 14,400 AI calls/day. 70% system telemetry, 30% scheduled curriculum"],
            ["7-Gate SEBA Evolution", "Every change passes 7 validation gates including TSAC truth arbitration"],
            ["Sealed Agent Marketplace", "20 agents with 3–5 Crown Jewel powers each, source-blocked runtimes"],
            ["Universal Export", "25 target languages with Mini-Runtime™, single-file zero-dependency distributions"],
          ]
        }
      },
      {
        heading: "Infrastructure Depth",
        content: "The substrate implements circuit breakers with exponential backoff, dead letter queues, saga orchestrators with multi-step rollback, CQRS bus, Merkle audit chains (SHA-256), tenant isolation, chaos testing harnesses, canary deployment gates, and schema registries. <strong>Every item is implemented, exported, and wired into the boot sequence.</strong>"
      },
    ]
  },
  {
    id: "competitive",
    number: "03",
    title: "Competitive Positioning",
    icon: <BarChart3 className="w-4 h-4" />,
    accentColor: "hsl(var(--neon-cyan))",
    sections: [
      {
        heading: "Competitive Comparison",
        content: "",
        table: {
          headers: ["Capability", "CMPSBL", "Typical AI Platform"],
          rows: [
            ["Persistent memory", "4-tier, governed, CLM-compounded", "Stateless or session-only"],
            ["Governance", "Architectural, immutable, 4-mode", "Optional, configurable"],
            ["Evolution", "7-gate SEBA with TSAC", "Manual deployment"],
            ["Security", "40-primitive zone-shielded", "Perimeter only"],
            ["Learning", "CLM — 14,400 calls/day", "None"],
            ["Export", "25 languages, standalone", "None"],
            ["Audit", "Tamper-evident Merkle chains", "Append-only logs"],
          ]
        }
      },
      {
        heading: "Category Creation",
        content: "CMPSBL does not compete in existing categories. It creates a new one: <strong>Governed Cognitive Infrastructure</strong> — defined by architectural governance, persistent tiered memory, validated evolution with truth preservation, sealed multi-agent coordination, tamper-evident audit provenance, and continuous autonomous learning. No existing platform combines all six properties."
      },
    ]
  },
  {
    id: "commercial",
    number: "04",
    title: "Commercial Model",
    icon: <Users className="w-4 h-4" />,
    accentColor: "hsl(var(--neon-amber))",
    sections: [
      {
        heading: "Platform Subscription Tiers",
        content: "",
        table: {
          headers: ["Tier", "Price", "Key Features"],
          rows: [
            ["Builder", "Included", "1 slot, session memory, view-only discovery"],
            ["Studio", "$29/mo", "3 slots, persistent memory, 3 export languages"],
            ["Creator", "$49/mo", "10 slots, full memory, 10 languages, basic DREAM"],
            ["Architect", "$79/mo", "25 slots, priority routing, all 25 languages, full DREAM"],
            ["Governor", "Admin", "Unlimited, full governance authority"],
          ]
        }
      },
      {
        heading: "Standalone Product Tiers",
        content: "",
        table: {
          headers: ["Tier", "Price", "Quality"],
          rows: [
            ["Starter", "$79", "Functional, limited customization"],
            ["Pro", "$129", "Full-featured, production-ready"],
            ["Elite", "$159", "Advanced capabilities, priority support"],
            ["Apex", "$249", "Maximum capability, custom integration"],
          ]
        }
      },
      {
        heading: "Unit Economics",
        content: "Key drivers: CLM increases system value daily without per-user cost. Agent purchases are one-time revenue with zero marginal delivery cost. BYOK model eliminates AI provider costs. DREAM synthesis means agents self-improve, reducing support costs. Ascension exports are high-margin digital products with built-in IP protection."
      },
    ]
  },
  {
    id: "engineering",
    number: "05",
    title: "Engineering Proof",
    icon: <Zap className="w-4 h-4" />,
    accentColor: "hsl(var(--neon-green))",
    sections: [
      {
        heading: "Scale Metrics",
        content: "",
        table: {
          headers: ["Metric", "Count"],
          rows: [
            ["Matrix primitives", "40 across 4 categories"],
            ["Database tables", "60+ production"],
            ["Registered capabilities", "675+"],
            ["Terminal commands", "500+"],
            ["Documentation pages", "80+ across 5 libraries"],
            ["Page routes", "60+ distinct"],
          ]
        }
      },
      {
        heading: "Verification Infrastructure",
        content: "<strong>10-Domain Audit Engine</strong> — continuous checks across system manifest, routes, primitives, hooks, branding, terminal, UI, SEO, and backend. <strong>26-Probe Diligence Harness</strong> — investor-grade deterministic probes. <strong>10-Point Code Verification</strong> — static analysis for XSS, secrets, unsafe eval, TypeScript coverage. <strong>Boot Integrity Seals</strong> — hash-chained primitive boot. <strong>Merkle Audit Chains</strong> — SHA-256 hash chains for every autonomous change."
      },
    ]
  },
  {
    id: "ip",
    number: "06",
    title: "IP & Defensibility",
    icon: <Shield className="w-4 h-4" />,
    accentColor: "hsl(var(--neon-magenta))",
    sections: [
      {
        heading: "Crown Jewel Capabilities",
        content: "54 capabilities classified as Crown Jewels — excluded from all external access tiers, not visible in API catalogs, governor-only access, source-blocked from agent runtimes. These represent <strong>irreplicable competitive advantage</strong>."
      },
      {
        heading: "Black-Box Export Protection",
        content: "",
        table: {
          headers: ["Protection Layer", "Method"],
          rows: [
            ["CJPI weights", "Hex-encoded arrays (e.g., [0x1E, 0x1E, 0x14, 0x14])"],
            ["Tier thresholds", "Hex-encoded (e.g., [0x5C, 0x50, 0x41, 0x2D])"],
            ["Internal comments", "Stripped entirely from all exports"],
            ["Architecture references", "Genericized — no internal naming exposed"],
            ["Discovery heuristics", "Never included in any export"],
          ]
        }
      },
      {
        heading: "Defensibility Layers",
        content: "Architectural complexity (40-primitive topology) · Continuous compounding (CLM grows daily) · Agent IP (sealed, versioned) · Merkle provenance · Classified internal library · Engine marketplace (54 productized engines) · DREAM synthesis · Black-box exports (hex-encoded constants in all 25 languages)"
      },
    ]
  },
  {
    id: "governance",
    number: "07",
    title: "Governance & Risk",
    icon: <AlertTriangle className="w-4 h-4" />,
    accentColor: "hsl(var(--neon-amber))",
    sections: [
      {
        heading: "Governance Model",
        content: "Every mutating action passes through GOVERNANCE — no exceptions. Four modes: <strong>Autonomous</strong> (system decides within scoped boundaries), <strong>Supervised</strong> (system proposes, governor approves), <strong>Manual</strong> (governor directs all actions), and <strong>Emergency</strong> (reduced to minimum safe operations). Evolution candidates pass 7-gate SEBA with TSAC truth arbitration before reaching production."
      },
      {
        heading: "Risk Factors",
        content: "Key-person dependency (mitigated by documented succession protocol and dead-man switch). Pre-revenue status (technology is built and production-ready). Solo execution (mitigated by full system documentation across 5 libraries and comprehensive onboarding materials for new team members)."
      },
    ]
  },
  {
    id: "valuation",
    number: "09",
    title: "Defensible Valuation",
    icon: <Sparkles className="w-4 h-4" />,
    accentColor: "hsl(var(--primary))",
    sections: [
      {
        heading: "Valuation Framework",
        content: "Valued across six pillars: Core Infrastructure (40-primitive matrix), Intellectual Property (Crown Jewels, sealed algorithms), Revenue Architecture (subscriptions, marketplace, exports), Data Compounding (CLM, DREAM, Memory Stream), Software Evolution (Ascension — single-file portable exports), and Category Creation (first-mover in Governed Cognitive Infrastructure)."
      },
      {
        heading: "Comparable Companies",
        content: "",
        table: {
          headers: ["Comparable", "Valuation", "CMPSBL Overlap"],
          rows: [
            ["Databricks", "$62B", "Memory, learning, compounding"],
            ["Palantir", "$50B+", "Governance, engines, classification"],
            ["HashiCorp", "$5.7B (acquired)", "Governance-as-architecture"],
            ["Anthropic", "$60B", "Governed autonomy, truth preservation"],
            ["Unity", "$13B", "Universal export, cross-platform runtime"],
            ["Cognition (Devin)", "$2B", "Software evolution"],
          ]
        }
      },
      {
        heading: "Risk-Adjusted Range",
        content: "<strong>Floor:</strong> $13–29M (infrastructure + IP only, 30–40% founder discount). <strong>Mid-Range:</strong> $42–60M (+ revenue architecture, marketplace). <strong>Ceiling:</strong> $132–268M (+ Ascension, category creation, compounding data moat). The founder discount decreases toward 0% with each milestone: first customer, first hire, $100K ARR, institutional investment."
      },
    ]
  },
];

// ─── Document Viewer ─────────────────────────────────────────
function DocViewer({ doc, onBack }: { doc: InvestorDoc; onBack: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-mesh)" }} />

      {/* Header — hidden on print */}
      <div className="sticky top-0 z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl px-4 sm:px-8 py-2.5 flex items-center justify-between print:hidden">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />Back to Library
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs rounded-lg">
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>
        </div>
      </div>

      {/* Printable Document */}
      <article className="relative max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12 print:max-w-none print:px-12 print:py-8">
        {/* Document Header */}
        <header className="space-y-4 pb-6 border-b border-border/20 print:border-b-2 print:border-black/10 mb-8">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary print:text-black">
            <span>CMPSBL®</span>
            <span className="text-muted-foreground print:text-gray-400">·</span>
            <span className="text-muted-foreground print:text-gray-500">Confidential — Investor Use</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight print:text-black">
            <span className="text-primary print:text-gray-500 font-mono text-lg mr-3">{doc.number}</span>
            {doc.title}
          </h1>
        </header>

        {/* Sections */}
        <div className="space-y-8 print:space-y-6">
          {doc.sections.map((section, i) => (
            <section key={i} className="space-y-3">
              <h2 className="text-lg font-bold text-foreground tracking-tight print:text-black print:text-base flex items-center gap-2">
                <span className="w-1.5 h-6 rounded-full shrink-0 print:hidden" style={{ background: doc.accentColor }} />
                {section.heading}
              </h2>
              {section.content && (
                <p className="text-sm text-muted-foreground leading-relaxed print:text-gray-700 print:text-[11pt] print:leading-[1.6]"
                  dangerouslySetInnerHTML={{ __html: section.content }} />
              )}
              {section.table && (
                <div className="overflow-x-auto rounded-xl border border-border/20 print:border print:border-gray-300 print:rounded-none">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 print:bg-gray-100">
                        {section.table.headers.map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-primary font-bold print:text-black print:text-[9pt]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, ri) => (
                        <tr key={ri} className="border-t border-border/10 print:border-gray-200">
                          {row.map((cell, ci) => (
                            <td key={ci} className={`px-4 py-2.5 text-xs leading-relaxed print:text-[10pt] ${
                              ci === 0 ? 'font-semibold text-foreground print:text-black' : 'text-muted-foreground print:text-gray-600'
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
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border/20 print:border-t-2 print:border-black/10 text-center">
          <p className="text-[10px] font-mono text-muted-foreground/50 print:text-gray-400">
            © 2025–2026 CMPSBL® · Confidential — Investor Use Only
          </p>
        </footer>
      </article>
    </div>
  );
}

// ─── Main Library Component ─────────────────────────────────
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
              <p className="text-xs text-muted-foreground">Comprehensive documentation · Printable · Confidential</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Browse the complete investor documentation library. Each document is formatted for screen reading and optimized for print — click <strong>Print</strong> inside any document to generate a clean PDF.
          </p>
        </motion.div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INVESTOR_DOCS.map((doc, i) => (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              onClick={() => setActiveDoc(doc)}
              className="text-left rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-5 hover:border-primary/20 hover:shadow-lg transition-all group active:scale-[0.98]"
              style={{ transition: "var(--transition-smooth)" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg border border-border/20 flex items-center justify-center shrink-0" style={{ background: `${doc.accentColor}15`, borderColor: `${doc.accentColor}25` }}>
                  <span className="text-xs font-mono font-black" style={{ color: doc.accentColor }}>{doc.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm">{doc.title}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {doc.sections.length} sections · {doc.sections.filter(s => s.table).length} tables
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-primary/40 group-hover:text-primary shrink-0 mt-1 transition-colors" />
              </div>
              <div className="flex items-center gap-1.5 mt-3">
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
