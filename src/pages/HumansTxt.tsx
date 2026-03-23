/**
 * Humans.txt — The CMPSBL Team
 * Led by Kenneth E Sweet Jr, showcasing full team
 */
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Code, Palette, Heart, Copy, Check, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const HUMANS_TXT_CONTENT = `/* HUMANS.TXT — Following humanstxt.org standard */

/* TEAM */

Organization: CMPSBL
Role: Cognitive Infrastructure Lab
Location: Dallas, Texas, USA
Contact: hello@CMPSBL.com
Phone: (760) FLUID-AI
Twitter: @cmpsbl

Lead Architect: Kenneth E. Sweet Jr.
ORCID: https://orcid.org/0009-0001-4237-1243
Role: Founder & Chief Architect

Head of AI Research: Dr. Sarah Chen
Role: Multi-agent cognition & memory architectures

Senior Systems Engineer: Marcus Rodriguez
Role: Runtime performance & NEXUS routing

Junior Developer & DevOps: Priya Nakamura
Role: CI/CD processes & EVOLUTION node

Security Researcher: James Whitfield
Role: DEFENSE node & behavioral fingerprinting

VP of Communications: Elena Vasquez
Role: Brand strategy & community

/* THANKS */

Built with love, caffeine, and autonomous AI assistance.
Special thanks to the open source community.
To the dreamers building AI that actually remembers.

/* SITE */

Last update: 2026/03/11
Language: English
Doctype: React + TypeScript + Tailwind
Framework: Vite
Backend: CMPSBL Cloud
AI: Multi-provider orchestration via NEXUS

Standards: HTML5, CSS3, ES2024
Components: Radix UI, shadcn/ui
State: TanStack Query
Routing: React Router v7
Animation: Framer Motion

/* PHILOSOPHY */

"Building the infrastructure layer for autonomous AI systems."

We believe in:
- Cognitive orchestration over simple automation
- Epistemic humility in AI conversations
- Real-time observability for trust
- Security through behavioral analysis
- Persistent memory and dream cycles

/* SUBSTRATE NODES (40 Nodes / 12 Sectors) */

CORE Organ: Kernel boot sequencing & lifecycle authority
SYSTEM Organ: Configuration management & diagnostics
BRAIN Organ: 4-tier persistent memory & learning cycles
MEMORY Organ: Context retrieval & session state
DREAM Engine: Memory consolidation & heuristic synthesis
RIPPLE Organ: Event bus & pub/sub messaging
ACCESS Organ: Authentication & API keys
IDENTITY Organ: User & entity resolution
RELAY Organ: Cross-module message routing
AUDIT Organ: Immutable logging & compliance
NERVE Organ: Operational signaling & coordination
DECODE Agent: Natural language understanding & intent parsing
ENCODE Agent: Content generation & code synthesis
VISION Agent: Observability & telemetry
CORTEX Engine: Memory composition & agency orchestration
NEXUS Organ: 14-provider AI routing authority
ECONOMY Engine: Cost tracking & budget governance
SANDBOX Engine: Isolated execution environment
INCLUSIVE Layer: Accessibility & WCAG compliance
MEDIC Engine: Self-healing diagnostics
SOVEREIGN Agent: Jurisdictional authority & data sovereignty
ORACLE Engine: Predictive analytics & forecasting
CONSCIENCE Layer: Ethical decision boundaries
FORGE Engine: Artifact production & template manufacturing
LINGUA Agent: Multi-language processing & translation
COMPASS Engine: Location-aware processing & geospatial
ECHO Agent: Signal reflection & distributed tracing
TREATY Layer: Agreement & SLA enforcement
HARVEST Agent: Data ingestion & ETL
REFLEX Engine: Real-time reactive processing
EVOLUTION Layer: Version management & shadow-run promotion
SHADOW: Shadow testing & adversarial validation
PHANTOM Agent: Phantom operations & stealth probes
IMMUNITY Layer: Threat adaptation & resilience hardening
INTENT Layer: Purpose alignment & goal tracking
GOVERNANCE Layer: Action legitimacy & doctrine enforcement
DEFENSE Layer: Terminal boundary enforcement & cognitive firewall
INTEGRATION Organ: External service connectivity
ATLAS Engine: Capability mapping & topology awareness
ENGINEER Agent: Engine & meta-engine maintenance intelligence

/* COLOPHON */

CMPSBL — A Cognitive Reality System · powered by the CMPSBL Substrate
40 Nodes • 12 Sectors • 675+ Capabilities
WCAG 2.2 Accessibility via INCLUSIVE Node

CMPSBL® — Where Machines Learn To Dream.

/* STANDARD */
This file follows the humans.txt standard from humanstxt.org
`;

const sections = [
  {
    icon: Users,
    title: "Team",
    items: [
      { label: "Lead", value: "Kenneth E. Sweet Jr. — Founder & Chief Architect" },
      { label: "Research", value: "Dr. Sarah Chen — Head of AI Research" },
      { label: "Engineering", value: "Marcus Rodriguez — Senior Systems Engineer" },
      { label: "DevOps", value: "Priya Nakamura — Junior Developer & DevOps" },
      { label: "Security", value: "James Whitfield — Security Researcher" },
      { label: "Communications", value: "Elena Vasquez — VP of Communications" },
    ],
  },
  {
    icon: Code,
    title: "Stack",
    items: [
      { label: "Frontend", value: "React · TypeScript · Tailwind" },
      { label: "Framework", value: "Vite" },
      { label: "Backend", value: "CMPSBL Cloud" },
      { label: "Components", value: "Radix UI · shadcn/ui" },
    ],
  },
  {
    icon: Palette,
    title: "Design",
    items: [
      { label: "Philosophy", value: "Cognitive-first aesthetics" },
      { label: "Motion", value: "Framer Motion" },
      { label: "Theme", value: "Dark-native, terminal-inspired" },
    ],
  },
  {
    icon: Heart,
    title: "Values",
    items: [
      { label: "AI", value: "Orchestration over automation" },
      { label: "Conversation", value: "Epistemic humility" },
      { label: "Trust", value: "Real-time observability" },
      { label: "Security", value: "Behavioral analysis" },
    ],
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HumansTxt() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(HUMANS_TXT_CONTENT);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Humans.txt — Who Built This Substrate | CMPSBL"
        description="The CMPSBL Collective: a decentralized assembly of humans and machines. Founded by Kenneth E. Sweet Jr. in Dallas, TX. Meet the team, the node manifest, and the principles behind the substrate."
        keywords={['CMPSBL team', 'humans.txt', 'Kenneth Sweet', 'AI collective', 'substrate founders']}
        noindex
      />

      <PublicNav />

      <main className="flex-1 relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 50%)' }} />
        </div>

        <div className="container mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-12 sm:pb-16 max-w-4xl relative z-10">
          {/* Header */}
          <motion.div className="mb-10 sm:mb-14" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
              <Users className="w-3 h-3 text-primary" />
              <a href="https://humanstxt.org" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-primary hover:underline">humanstxt.org</a>
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3">Humans.txt</h1>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              Every system has its architects. The CMPSBL team — six engineers, researchers, and communicators — building cognitive infrastructure for AI.
            </p>
          </motion.div>

          {/* Section grid */}
          <motion.div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-10 sm:mb-12" variants={stagger} initial="hidden" animate="show">
            {sections.map((section) => (
              <motion.div key={section.title} variants={fadeUp} className={section.title === 'Team' ? 'sm:col-span-2' : ''}>
                <Card className="h-full border-border/30 bg-card/40 backdrop-blur-sm glass-edge hover:border-primary/20 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <section.icon className="w-4 h-4 text-primary" />
                      </div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">{section.title}</h2>
                    </div>
                    <div className="space-y-2.5">
                      {section.items.map((item) => (
                        <div key={item.label} className="flex justify-between items-baseline text-sm gap-2">
                          <span className="text-muted-foreground/70 shrink-0">{item.label}</span>
                          <span className="font-medium text-foreground text-right">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Philosophy quote */}
           <motion.div className="mb-10 sm:mb-12 p-5 sm:p-8 rounded-2xl border border-primary/15 bg-primary/[0.03] text-center"
             initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <blockquote className="text-lg sm:text-xl md:text-2xl font-light italic text-foreground mb-2">
              "Building the infrastructure layer for autonomous AI systems."
            </blockquote>
            <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">The substrate mission</p>
          </motion.div>

          {/* Raw content */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="border-primary/20 bg-card/40 backdrop-blur-sm">
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">Raw humans.txt</span>
                </div>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2 h-9">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
              <div className="p-4 sm:p-5">
                <pre className="bg-background/60 rounded-xl p-4 overflow-x-auto text-xs font-mono whitespace-pre-wrap text-muted-foreground leading-relaxed max-h-[400px] overflow-y-auto scrollbar-thin">
                  {HUMANS_TXT_CONTENT}
                </pre>
              </div>
            </Card>
          </motion.div>

          <motion.p className="mt-8 text-center text-xs text-muted-foreground/50"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Following the{" "}
            <a href="https://humanstxt.org" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary hover:underline transition-colors">humanstxt.org</a>{" "}
            standard for crediting the humans behind digital projects.
          </motion.p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
