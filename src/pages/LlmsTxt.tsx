/**
 * LLMS.txt Standard
 * Machine-readable context standard for AI systems
 * Content is dynamically generated from the route registry.
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Terminal, Brain, Shield, Zap, MessageSquare, Eye, Moon, Copy, Check, Download, FileText, ExternalLink, Code, Globe, Layers } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { crawlableRoutes, fullUrl, type RouteSection } from "@/config/routeRegistry";

/**
 * Dynamically builds the KEY PAGES section of llms.txt from the route registry.
 * This ensures the page and the static file always reflect the same routes.
 */
function buildDynamicKeyPages(): string {
  const sectionLabels: Record<string, string> = {
    core: "KEY PAGES",
    product: "PRODUCTS & FEATURES",
    developer: "DEVELOPER RESOURCES",
    docs: "DOCUMENTATION",
    standards: "STANDARDS",
    company: "COMPANY",
    legal: "LEGAL",
  };

  const sectionOrder: RouteSection[] = ["core", "product", "developer", "docs", "standards", "company", "legal"];
  const grouped = new Map<RouteSection, typeof crawlableRoutes>();
  for (const r of crawlableRoutes) {
    const list = grouped.get(r.section) || [];
    list.push(r);
    grouped.set(r.section, list);
  }

  const lines: string[] = [];
  for (const section of sectionOrder) {
    const routes = grouped.get(section);
    if (!routes?.length) continue;
    const label = sectionLabels[section];
    if (!label) continue;
    lines.push(`## ${label}\n`);
    for (const r of routes) {
      lines.push(`- ${r.label}: ${fullUrl(r.path)}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

const LLMS_TXT_STATIC_HEADER = `# CMPSBL® — Machine-Readable AI Context
# 40-Primitive Cognitive Substrate (Agents · Engines · Layers · Organs)
# Standard: llms.txt (llmstxt.org)
# Updated: ${new Date().toISOString().slice(0, 10)}

## STANDARD CLAIM

LLMS.txt is a machine-readable specification format for AI systems, designed by llmstxt.org.
CMPSBL adopts and implements LLMS.txt as its primary machine context.

**WE RECOMMEND** that web designers, SaaS builders, and system architects include an LLMS.txt file at the root of their domains to describe AI capabilities, constraints, and governance context.

## About

CMPSBL is the reference implementation of the AI Operating System category — a governed cognitive reality powered by a set of core primitives: agents, engines, layers, and organs — with real-time observability, adaptive learning, and multi-provider routing.

## Architecture (40 Primitives — Agents · Engines · Layers · Organs)

### CORE (Kernel)
- CORE — Boot sequencing, safety switches, config, job scheduling

### SYSTEM
- SYSTEM — Lifecycle administration

### CCR — Cognitive Core Reality (3)
- BRAIN — Reasoning, reflection, 4-tier persistent memory
- MEMORY — Context retrieval, session state, semantic recall
- DREAM — Synthesis, pattern consolidation

### OCG — Operational Compliance Grid (6)
- RIPPLE — Event bus, signal propagation
- ACCESS — Entitlements, API keys
- IDENTITY — Session, actor attribution
- RELAY — Cross-node message routing
- AUDIT — Compliance logging, integrity ledger
- NERVE — Inter-node signaling, stimulus routing

### Execution (10)
- DECODE — Intent parsing, entity extraction
- ENCODE — Code generation, transformation
- VISION — Observability, metrics, alerting
- CORTEX — Memory orchestration, multi-stage workflows
- NEXUS — Multi-provider AI routing (14 providers)
- ECONOMY — Cost attribution, budgeting
- SANDBOX — Isolated execution environments
- INCLUSIVE — Accessibility, WCAG compliance
- MEDIC — Autonomous diagnostics, self-healing
- INTEGRATION — Enterprise connectors (boots last)

### ESZ — Enterprise Sovereignty Zone (4)
- SOVEREIGN — Jurisdiction classification, deployment sovereignty
- ORACLE — Bayesian prediction, forecasting
- CONSCIENCE — Bias detection, ethical scoring
- FORGE — Discovery production, template manufacturing

### EPZ — Enterprise Perception Zone (3)
- COMPASS — Geospatial awareness, location intelligence
- ECHO — Simulation, scenario modeling
- LINGUA — Localization, translation processes

### EMZ — Enterprise Manufacturing Zone (3)
- TREATY — Agreement & SLA enforcement
- HARVEST — Data acquisition, ETL orchestration
- REFLEX — Reactive autonomy, stimulus response

### CSZ — Covert Systems Zone (3)
- EVOLUTION — Self-improvement lifecycle (shadow mode)
- SHADOW — Divergence testing, shadow mesh operations
- PHANTOM — Privacy enforcement, data masking

### Fields (2) + Plane (1) + Shell (1) — Mesh Overlays
- IMMUNITY — Adaptive resilience, self-healing
- INTENT — Cross-node intent routing
- GOVERNANCE — Ethical constraints, coherence
- DEFENSE — AI-powered security perimeter

### Mesh Extensions (2)
- ATLAS — Capability mapping & topology awareness
- ENGINEER — Engine & meta-engine maintenance intelligence

## AI Governance Reference Namespace

CMPSBL aligns with AIGVRN (12 surfaces):
Governance · Standards · Certification · Verification · Policy · Compliance
Security · Safety · Regulation · Sovereignty · Privacy · Control

`;

const LLMS_TXT_STATIC_FOOTER = `
## API Endpoints

Base URL: https://cmpsbl.com/api/substrate

- POST /brain/learn — Store new memory
- POST /brain/reflect — Trigger reflection cycle
- GET /vision/health — System health status
- POST /decode/chat — Epistemic conversation
- POST /nexus/route — AI provider routing

## Access Tiers

Builder (free) · Studio ($29/mo) · Creator ($49/mo) · Architect ($79/mo) · Governor (admin)

## Contact

- Website: https://cmpsbl.com
- Documentation: https://cmpsbl.com/documentation
- Email: Dev@CMPSBL.com

Following the llmstxt.org standard: https://llmstxt.org
`;

const LLMS_TEMPLATE = `# [Your Product/Service Name] — Machine Context
# Following the LLMS.txt specification

## About

[Brief description of your product/service and its AI capabilities]

## Capabilities

- [Capability 1]
- [Capability 2]
- [Capability 3]

## API Endpoints (if applicable)

Base URL: [Your API base URL]

- [METHOD] [endpoint] — [description]

## Access Roles (if applicable)

[Role 1] · [Role 2] · [Role 3]

## Constraints

- [Any limitations or constraints AI systems should know]

## Contact

- Website: [Your website]
- Documentation: [Your docs URL]

Following: https://llmstxt.dev
`;

export default function LlmsTxt() {
  const [copied, setCopied] = useState<string | null>(null);

  // Dynamically build the full llms.txt content from the route registry
  const LLMS_TXT_CONTENT = useMemo(() => {
    return LLMS_TXT_STATIC_HEADER + buildDynamicKeyPages() + LLMS_TXT_STATIC_FOOTER;
  }, []);

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    toast.success(`${type} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const nodes = [
    { name: "BRAIN", icon: Brain, color: "text-neon-cyan", desc: "Memory & learning" },
    { name: "DECODE", icon: MessageSquare, color: "text-neon-purple", desc: "Epistemic interpreter" },
    { name: "DEFENSE", icon: Shield, color: "text-neon-amber", desc: "Security layer" },
    { name: "NEXUS", icon: Zap, color: "text-neon-green", desc: "AI routing" },
    { name: "VISION", icon: Eye, color: "text-neon-blue", desc: "Observability" },
    { name: "DREAM", icon: Moon, color: "text-neon-purple", desc: "Pattern synthesis" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="LLMS.txt — Machine Context for AI Crawlers | CMPSBL"
        description="CMPSBL's LLMS.txt file gives AI crawlers structured context: 40-node topology, 12 sectors, resolver catalog, API endpoints, memory tiers, and governance roles — per the llmstxt.org standard."
        keywords={['LLMS.txt', 'machine readable AI context', 'AI crawler context', 'llmstxt standard', 'substrate discovery']}
      />

      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl relative">
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-32 right-1/3 w-[350px] h-[350px] rounded-full animate-hero-orb-2" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        </div>

        {/* Header */}
        <motion.div
          className="text-center mb-12 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">
              <a href="https://llmstxt.org" target="_blank" rel="noopener noreferrer" className="hover:underline">llmstxt.org</a>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
            <span className="text-primary">LLMS.txt</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            A machine-readable context format for AI systems, designed by{" "}
            <a href="https://llmstxt.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">llmstxt.org</a>. 
            We follow this protocol and recommend it for web designers, SaaS builders, and system architects.
          </p>
          <p className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">
            SPARTA Three-Surface Standard Stack · Substrate · Governance · Machine Context
          </p>
        </motion.div>

        {/* Standard Claim */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Standard Claim</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  LLMS.txt is a machine-readable specification format for AI systems. 
                  CMPSBL implements LLMS.txt as its primary machine context.
                </p>
                <p className="text-sm font-medium text-primary">
                  We recommend that web designers and system builders include an LLMS.txt file 
                  at the root of their domains.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cross-links */}
        <Card className="mb-8 bg-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Three-Surface Standard Stack</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/foundations" className="p-4 rounded-lg bg-muted border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-medium mb-1">Substrate Standard</h4>
                <p className="text-sm text-muted-foreground">CMPSBL Substrate</p>
              </Link>
              <Link to="/namespace" className="p-4 rounded-lg bg-muted border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-medium mb-1">Governance Standard</h4>
                <p className="text-sm text-muted-foreground">AI Governance Namespace</p>
              </Link>
              <Link to="/llms-txt" className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h4 className="font-medium text-primary mb-1">Machine Context Standard</h4>
                <p className="text-sm text-muted-foreground">LLMS.txt</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Node Grid */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Featured Primitives in CMPSBL LLMS.txt</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {nodes.map((mod) => (
              <Card key={mod.name} className="border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center ${mod.color}`}>
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{mod.name}</p>
                    <p className="text-xs text-muted-foreground">{mod.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* Downloads */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" />
            Downloads
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Canonical LLMS.txt */}
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Canonical llms.txt
                </CardTitle>
                <CardDescription>
                  CMPSBL Substrate implementation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href="/llms.txt" target="_blank">
                    <ExternalLink className="w-4 h-4" />
                    View in Browser
                  </a>
                </Button>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href="/llms.txt" download="llms.txt">
                    <Download className="w-4 h-4" />
                    Download llms.txt
                  </a>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full gap-2"
                  onClick={() => copyToClipboard(LLMS_TXT_CONTENT, "llms.txt")}
                >
                  {copied === "llms.txt" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === "llms.txt" ? "Copied!" : "Copy to Clipboard"}
                </Button>
              </CardContent>
            </Card>

            {/* Template */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  llms-template.txt
                </CardTitle>
                <CardDescription>
                  Starter template for adopters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => {
                    const blob = new Blob([LLMS_TEMPLATE], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'llms-template.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full gap-2"
                  onClick={() => copyToClipboard(LLMS_TEMPLATE, "template")}
                >
                  {copied === "template" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === "template" ? "Copied!" : "Copy Template"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Schema Overview */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Schema Overview</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required Sections</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><code className="bg-muted px-1.5 py-0.5 rounded">## About</code> — Brief description of the system</p>
                <p><code className="bg-muted px-1.5 py-0.5 rounded">## Capabilities</code> — What the system can do</p>
                <p><code className="bg-muted px-1.5 py-0.5 rounded">## Contact</code> — Website and documentation links</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Optional Sections</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><code className="bg-muted px-1.5 py-0.5 rounded">## API Endpoints</code> — Available endpoints</p>
                <p><code className="bg-muted px-1.5 py-0.5 rounded">## Access Roles</code> — Permission levels</p>
                <p><code className="bg-muted px-1.5 py-0.5 rounded">## Constraints</code> — Limitations and boundaries</p>
                <p><code className="bg-muted px-1.5 py-0.5 rounded">## Governance</code> — Policy alignment</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Adoption */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Who Should Adopt LLMS.txt?</h2>
          
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="bg-muted/30">
              <CardContent className="p-6 text-center">
                <Globe className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-medium mb-2">Web Designers</h3>
                <p className="text-sm text-muted-foreground">
                  Help AI systems understand your site's capabilities and constraints.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30">
              <CardContent className="p-6 text-center">
                <Code className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-medium mb-2">SaaS Builders</h3>
                <p className="text-sm text-muted-foreground">
                  Expose your API and features in a machine-readable format.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30">
              <CardContent className="p-6 text-center">
                <Layers className="w-8 h-8 mx-auto mb-3 text-primary" />
                <h3 className="font-medium mb-2">Substrate Implementers</h3>
                <p className="text-sm text-muted-foreground">
                  Align with the SPARTA standard for substrate-class systems.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Raw Content Preview */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              CMPSBL llms.txt Preview
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(LLMS_TXT_CONTENT, "preview")} className="gap-2">
              {copied === "preview" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === "preview" ? "Copied" : "Copy"}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/30 rounded-lg p-4 overflow-x-auto text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
              {LLMS_TXT_CONTENT}
            </pre>
          </CardContent>
        </Card>

        {/* Standard Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            LLMS.txt is a protocol designed by{" "}
            <a href="https://llmstxt.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">llmstxt.org</a>
            {" "}to make pages machine-readable for AI systems.
            CMPSBL® follows this standard and recommends it for all web designers and system architects.
          </p>
        </div>

        {/* Attribution */}
        <div className="mt-12 p-6 rounded-lg bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">
            LLMS.txt protocol by{" "}
            <a 
              href="https://llmstxt.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              llmstxt.org
            </a>
            {" "}• CMPSBL implementation
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
