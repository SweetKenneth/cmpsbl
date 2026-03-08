/**
 * Humans.txt — The architects behind CMPSBL®
 * Cinematic reveal with terminal aesthetic
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

Creator & Lead Architect: Kenneth E. Sweet Jr.
ORCID: https://orcid.org/0009-0001-4237-1243
Role: Founder, Architect, Chief Cognitive Engineer
Location: Abilene, Texas, USA
Contact: Dev@CMPSBL.com
Phone: (760) 358-4324
Twitter: @cmpsbl

/* THANKS */

Built with love, caffeine, and autonomous AI assistance.
Special thanks to the open source community.
To the dreamers building AI that actually remembers.

/* SITE */

Last update: 2026/02/01
Language: English
Doctype: React + TypeScript + Tailwind
Framework: Vite
Backend: CMPSBL Cloud (Nexus Fleet)
AI: Multi-provider orchestration via Nexus

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

/* SUBSTRATE MODULES */

Brain: Memory, learning, reflection cycles
Decode: Epistemic conversation interpreter
Defense: Security and threat detection
Nexus: AI provider routing
Vision: Observability and telemetry
Dream: Memory consolidation engine

/* COLOPHON */

CMPSBL — A Cognitive Reality System · powered by the CMPSBL Substrate
40 Nodes • 12 Sectors • 500+ Terminal Commands
675+ Capabilities • WCAG 2.2 Accessibility via INCLUSIVE Module

CMPSBL® — Where Machines Learn To Think.

/* STANDARD */
This file follows the humans.txt standard from humanstxt.org
`;

const sections = [
  {
    icon: Users,
    title: "Team",
    items: [
      { label: "Creator", value: "Kenneth E. Sweet Jr." },
      { label: "Role", value: "Founder & Chief Cognitive Engineer" },
      { label: "ORCID", value: "0009-0001-4237-1243" },
      { label: "Location", value: "Abilene, Texas" },
    ],
  },
  {
    icon: Code,
    title: "Stack",
    items: [
      { label: "Frontend", value: "React · TypeScript · Tailwind" },
      { label: "Framework", value: "Vite" },
      { label: "Backend", value: "CMPSBL Cloud (Nexus Fleet)" },
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
        title="Humans.txt — Team & Philosophy | CMPSBL"
        description="The people, philosophy, and technology behind CMPSBL cognitive orchestration substrate. Founded by Kenneth E Sweet Jr."
        keywords={['CMPSBL team', 'humans.txt', 'Kenneth Sweet', 'cognitive AI team']}
        noindex
      />

      <PublicNav />

      <main className="flex-1 relative">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute top-20 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 50%)' }}
          />
        </div>

        <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl relative z-10">
          {/* Header */}
          <motion.div
            className="mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
              <Users className="w-3 h-3 text-primary" />
              <a
                href="https://humanstxt.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-primary hover:underline"
              >
                humanstxt.org
              </a>
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Humans.txt</h1>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              Every system has its architects. This is the team, philosophy, and technology behind CMPSBL®.
            </p>
          </motion.div>

          {/* Section grid */}
          <motion.div
            className="grid sm:grid-cols-2 gap-4 mb-12"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {sections.map((section) => (
              <motion.div key={section.title} variants={fadeUp}>
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
          <motion.div
            className="mb-12 p-6 sm:p-8 rounded-2xl border border-primary/15 bg-primary/[0.03] text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <blockquote className="text-xl sm:text-2xl font-light italic text-foreground mb-2">
              "Building the infrastructure layer for autonomous AI systems."
            </blockquote>
            <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">
              The substrate mission
            </p>
          </motion.div>

          {/* Raw content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
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

          {/* Footer note */}
          <motion.p
            className="mt-8 text-center text-xs text-muted-foreground/50"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Following the{" "}
            <a href="https://humanstxt.org" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary hover:underline transition-colors">
              humanstxt.org
            </a>{" "}
            standard for crediting the humans behind digital projects.
          </motion.p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
