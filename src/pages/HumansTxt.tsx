/**
 * Humans.txt — The people behind promptfluid®
 * humanstxt.org specification
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Code, Palette, Brain, Heart, Copy, Check, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const HUMANS_TXT_CONTENT = `/* HUMANS.TXT — Following humanstxt.org standard */

/* TEAM */

Creator & Lead Architect: Kenneth E. Sweet Jr.
ORCID: https://orcid.org/0009-0001-4237-1243
Role: Founder, Architect, Chief Cognitive Engineer
Location: Abilene, Texas, USA
Contact: Dev@CMPSBL.com
Phone: (760) FLUID-AI
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
37 Nodes • 11 Sectors • 500+ Terminal Commands
675+ Capabilities • WCAG 2.2 Accessibility via INCLUSIVE Module

promptfluid® — AI That Flows.

/* STANDARD */
This file follows the humans.txt standard from humanstxt.org
`;

export default function HumansTxt() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(HUMANS_TXT_CONTENT);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    {
      title: "Team",
      icon: Users,
      items: [
        { label: "Creator", value: "Kenneth E. Sweet Jr." },
        { label: "Role", value: "Founder & Chief Cognitive Engineer" },
        { label: "ORCID", value: "0009-0001-4237-1243" },
      ]
    },
    {
      title: "Technology Stack",
      icon: Code,
      items: [
        { label: "Frontend", value: "React + TypeScript + Tailwind" },
        { label: "Framework", value: "Vite" },
        { label: "Backend", value: "CMPSBL Cloud (Nexus Fleet)" },
        { label: "State", value: "TanStack Query" },
        { label: "Components", value: "Radix UI + shadcn/ui" },
      ]
    },
    {
      title: "Design",
      icon: Palette,
      items: [
        { label: "Philosophy", value: "Cognitive-first aesthetics" },
        { label: "Motion", value: "Framer Motion" },
        { label: "Theme", value: "Dark-mode native, terminal-inspired" },
      ]
    },
    {
      title: "Core Values",
      icon: Heart,
      items: [
        { label: "AI Approach", value: "Cognitive orchestration over automation" },
        { label: "Conversation", value: "Epistemic humility" },
        { label: "Trust", value: "Real-time observability" },
        { label: "Security", value: "Behavioral analysis" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Humans.txt — Team & Philosophy | CMPSBL"
        description="The people, philosophy, and technology behind CMPSBL cognitive orchestration substrate. Founded by Kenneth E Sweet Jr in Dallas, TX."
        keywords={['CMPSBL team', 'humans.txt', 'Kenneth Sweet', 'cognitive AI team']}
        noindex={true}
      />

      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Users className="w-4 h-4 text-primary" />
            <a href="https://humanstxt.org" target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-primary hover:underline">humanstxt.org</a>
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-4">
            Humans.txt
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The people, philosophy, and technology behind promptfluid®. 
            Every system has its architects. This is ours.
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sections.map((section) => (
            <Card key={section.title} className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <section.icon className="w-4 h-4 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-right max-w-[60%]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Philosophy Quote */}
        <div className="mb-12 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 text-center">
          <Brain className="w-8 h-8 text-primary mx-auto mb-4" />
          <blockquote className="text-xl font-light italic mb-2">
            "Building the infrastructure layer for autonomous AI systems."
          </blockquote>
          <p className="text-sm text-muted-foreground">
            The substrate mission
          </p>
        </div>

        {/* Raw Content */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              Raw humans.txt
            </CardTitle>
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/30 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
              {HUMANS_TXT_CONTENT}
            </pre>
          </CardContent>
        </Card>

        {/* Standard Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Humans.txt is a protocol designed by{" "}
            <a href="https://humanstxt.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">humanstxt.org</a>
            {" "}to credit the humans behind digital projects.
            PromptFluid® follows this standard and recommends it for all web designers and system architects.
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
