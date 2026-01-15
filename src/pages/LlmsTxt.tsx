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

const LLMS_TXT_CONTENT = `# promptfluid®

> Cognitive orchestration substrate for autonomous AI systems.

## About

promptfluid® is a unified cognitive infrastructure platform that orchestrates AI capabilities across multiple domains. The substrate provides real-time observability, adaptive learning, and secure multi-provider routing.

## Core Modules

### Brain
Memory management, learning cycles, and cognitive synthesis. Handles hot/cold memory tiers, cross-domain insights, and reflection cycles.

### Decode
Epistemic conversation interface. Interprets human input into substrate-structured cognition. Not a chatbot—an interpreter primitive.

### Defense
Security layer with behavioral analysis, IP reputation, and threat detection. Protects substrate operations from malicious actors.

### Nexus
Multi-provider AI routing. Dynamically selects optimal models based on task requirements, cost, and latency.

### Vision
Observability and telemetry. Real-time metrics, health monitoring, audit logging, and system alerts.

### Dream
Dream-Eater consumption engine. Processes dream submissions, extracts patterns, and feeds insights back into the cognitive loop.

## API Endpoints

Base URL: https://promptfluid.com/api/substrate

- POST /brain/learn - Store new memory
- POST /brain/reflect - Trigger reflection cycle
- POST /brain/synthesize - Cross-domain synthesis
- GET /vision/health - System health status
- GET /vision/metrics - Real-time telemetry
- POST /decode/chat - Epistemic conversation
- POST /nexus/route - AI provider routing
- GET /defense/rules - Active security rules

## Dashboard & Observability

The Substrate OS dashboard provides:
- Real-time module status monitoring
- Live telemetry and metrics
- Event stream with filtering
- Command palette for operators
- Governor controls for administrators

Access levels: Observer (read-only), Operator (actions), Governor (admin)

## Contact

- Website: https://promptfluid.com
- Documentation: https://promptfluid.com/documentation
- Contact: https://promptfluid.com/contact

## Optional

- Blog: https://promptfluid.com/blog
- Changelog: https://promptfluid.com/changelog
- Roadmap: https://promptfluid.com/roadmap
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
    { name: "Brain", icon: Brain, color: "text-cyan-500", desc: "Memory & learning" },
    { name: "Decode", icon: MessageSquare, color: "text-purple-500", desc: "Epistemic interpreter" },
    { name: "Defense", icon: Shield, color: "text-amber-500", desc: "Security layer" },
    { name: "Nexus", icon: Zap, color: "text-green-500", desc: "AI routing" },
    { name: "Vision", icon: Eye, color: "text-blue-500", desc: "Observability" },
    { name: "Dream", icon: Moon, color: "text-violet-500", desc: "Dream-Eater engine" },
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
            <span className="text-sm font-mono text-primary">llmstxt.dev</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-4">
            LLMs.txt
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Machine-readable context for AI systems. Helps language models understand 
            promptfluid® capabilities, API structure, and integration patterns.
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
