/**
 * LLMs.txt — Machine-readable context for AI systems
 * Follows llmstxt.dev specification
 */

import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Brain, Shield, Zap, MessageSquare, Eye, Moon, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const LLMS_TXT_CONTENT = `# promptfluid® CMPSBL OS — FNDTN v6.0.0
# Machine-Readable Context Standard for AI Systems

## STANDARD CLAIM

LLMS.txt is a machine-readable specification format for AI systems.
CMPSBL Substrate OS FNDTN v6.0.0 implements LLMS.txt as its primary machine context.

**WE RECOMMEND** that web designers, SaaS builders, and system architects include an LLMS.txt file at the root of their domains to describe AI capabilities, constraints, and governance context.

## About

promptfluid® is a unified cognitive infrastructure platform (substrate OS) with 14 modules, real-time observability, adaptive learning, and multi-provider routing.

## 14-Module Architecture (FNDTN v6)

### Kernel Layer
- CORE — Scheduling, lifecycle, boot sequencing
- RIPPLE — Event bus, pub/sub, webhooks
- ACCESS — Identity, API keys, permissions

### Cognitive Layer
- BRAIN — 3-tier persistent memory, learning cycles
- DECODE — Intent parsing, entity extraction
- DREAM — Memory consolidation, pattern synthesis

### Operational Layer
- DEFENSE — Threat detection, cognitive firewall
- NEXUS — Multi-provider AI routing
- VISION — Observability, metrics, alerting

### Administrative Layer
- SYSTEM — Orchestration, diagnostics, configuration
- MODERNIZER — Self-upgrade engine
- INTEGRATION — Enterprise connectors (35+)
- INCLUSIVE — Accessibility, AI governance/ethics

### Orchestrator Layer
- CORTEX — Policy intent, agency orchestration

## AI Governance Reference Namespace

CMPSBL aligns with AIGVRN (12 surfaces):
Governance · Standards · Certification · Verification · Policy · Compliance
Security · Safety · Regulation · Sovereignty · Privacy · Control

## API Endpoints

Base URL: https://promptfluid.com/api/substrate

- POST /brain/learn — Store new memory
- POST /brain/reflect — Trigger reflection cycle
- GET /vision/health — System health status
- POST /decode/chat — Epistemic conversation
- POST /nexus/route — AI provider routing

## Access Roles

Observer (read-only) · Operator (actions) · Governor (admin)

## Contact

- Website: https://cmpsbl.com / https://promptfluid.com
- Documentation: https://cmpsbl.com/docs
- FNDTN Paper: https://cmpsbl.com/docs/FNDTN-v6/

Following: https://llmstxt.dev
`;

export default function LlmsTxt() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(LLMS_TXT_CONTENT);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const modules = [
    { name: "BRAIN", icon: Brain, color: "text-cyan-500", desc: "Memory & learning" },
    { name: "DECODE", icon: MessageSquare, color: "text-purple-500", desc: "Epistemic interpreter" },
    { name: "DEFENSE", icon: Shield, color: "text-amber-500", desc: "Security layer" },
    { name: "NEXUS", icon: Zap, color: "text-green-500", desc: "AI routing" },
    { name: "VISION", icon: Eye, color: "text-blue-500", desc: "Observability" },
    { name: "DREAM", icon: Moon, color: "text-violet-500", desc: "Pattern synthesis" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>LLMs.txt — promptfluid®</title>
        <meta name="description" content="Machine-readable context for AI systems following the llmstxt.dev specification." />
      </Helmet>

      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">FNDTN v6.0.0 Standard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-4">
            LLMS.txt
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-4">
            Machine-readable context standard for AI systems. We developed LLMS.txt 
            and recommend it for web designers and system builders.
          </p>
          <p className="text-sm text-muted-foreground">
            Part of the <strong>FNDTN v6 Three-Surface Standard Stack</strong>: Substrate · Governance · Machine Context
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {modules.map((mod) => (
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

        {/* Raw Content */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              Raw llms.txt
            </CardTitle>
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/30 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
              {LLMS_TXT_CONTENT}
            </pre>
          </CardContent>
        </Card>

        {/* Specification Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Following the{" "}
            <a 
              href="https://llmstxt.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              llmstxt.dev
            </a>{" "}
            specification for AI-readable context.
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
