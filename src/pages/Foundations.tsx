/**
 * FNDTN v6 — Foundations
 * Standards release page with documentation index and download surface
 */

import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  FileText, Download, ExternalLink, Archive, BookOpen, 
  Layers, Terminal, Brain, Shield, Eye, Zap, Users,
  Globe, Cpu, Settings, Code, Moon, Network
} from "lucide-react";

const LIBRARY_DOCS = [
  { id: "00", name: "INDEX", description: "Document Library Index" },
  { id: "01", name: "EXECUTIVE-SUMMARY", description: "System Overview" },
  { id: "02", name: "SYSTEM-ARCHITECTURE", description: "14-Module Architecture" },
  { id: "03", name: "USERS-GUIDE", description: "Operator Manual" },
  { id: "04", name: "API-REFERENCE", description: "Endpoint Documentation" },
  { id: "10", name: "CORE-MODULE", description: "Scheduling & Lifecycle" },
  { id: "11", name: "RIPPLE-MODULE", description: "Event Bus & Webhooks" },
  { id: "12", name: "ACCESS-MODULE", description: "Identity & Permissions" },
  { id: "13", name: "BRAIN-MODULE", description: "3-Tier Memory System" },
  { id: "14", name: "DECODE-MODULE", description: "Intent Parsing" },
  { id: "15", name: "DREAM-MODULE", description: "Pattern Synthesis" },
  { id: "16", name: "DEFENSE-MODULE", description: "Threat Detection" },
  { id: "17", name: "NEXUS-MODULE", description: "AI Provider Routing" },
  { id: "18", name: "VISION-MODULE", description: "Observability & Metrics" },
  { id: "19", name: "INTEGRATION-MODULE", description: "Enterprise Connectors" },
  { id: "20", name: "SYSTEM-MODULE", description: "Orchestration Core" },
  { id: "21", name: "MODERNIZER-MODULE", description: "Self-Upgrade Engine" },
  { id: "22", name: "CORTEX-MODULE", description: "Policy & Agency Orchestration" },
  { id: "23", name: "INCLUSIVE-MODULE", description: "Accessibility & Governance" },
  { id: "30", name: "VALIDATION-METHODOLOGY", description: "Testing Framework" },
  { id: "31", name: "PERFORMANCE-BENCHMARKS", description: "Metrics & Results" },
  { id: "32", name: "LIVE-SYSTEM-EVIDENCE", description: "Production Proof" },
  { id: "40", name: "GLOSSARY", description: "Terminology Reference" },
  { id: "41", name: "BIBLIOGRAPHY", description: "Citations & Sources" },
  { id: "42", name: "LICENSING-INFO", description: "License Details" },
  { id: "50", name: "MARKETPLACE-REFERENCE", description: "Template & Revenue Systems" },
];

const MODULES = [
  { name: "CORE", icon: Cpu, desc: "Scheduling & lifecycle" },
  { name: "RIPPLE", icon: Network, desc: "Event bus" },
  { name: "ACCESS", icon: Users, desc: "Identity & permissions" },
  { name: "BRAIN", icon: Brain, desc: "3-tier memory" },
  { name: "DECODE", icon: Terminal, desc: "Intent parsing" },
  { name: "DREAM", icon: Moon, desc: "Pattern synthesis" },
  { name: "DEFENSE", icon: Shield, desc: "Threat detection" },
  { name: "NEXUS", icon: Zap, desc: "AI routing" },
  { name: "VISION", icon: Eye, desc: "Observability" },
  { name: "SYSTEM", icon: Settings, desc: "Orchestration" },
  { name: "MODERNIZER", icon: Code, desc: "Self-upgrade" },
  { name: "INTEGRATION", icon: Globe, desc: "Connectors" },
  { name: "INCLUSIVE", icon: Users, desc: "Accessibility" },
  { name: "CORTEX", icon: Layers, desc: "Policy orchestration" },
];

export default function Foundations() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>FNDTN v6 — Foundations | promptfluid®</title>
        <meta name="description" content="CMPSBL Substrate OS v6.0.0 (FNDTN) — Reference standard for the substrate class. Download documentation, browse the 14-module architecture, and access archival records." />
      </Helmet>

      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">FNDTN v6.0.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-4">
            Foundations
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            CMPSBL Substrate OS v6.0.0 is the reference implementation and proposed standard 
            for the <strong>substrate class</strong> of AI systems — persistent runtime, memory, 
            doctrine, and self-improvement.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline">14 Modules</Badge>
            <Badge variant="outline">260+ Commands</Badge>
            <Badge variant="outline">Production Ready</Badge>
          </div>
        </div>

        {/* Abstract */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Technical Abstract
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              CMPSBL v6.0.0 (FNDTN) presents a unified cognitive infrastructure platform 
              implementing a five-layer, 14-module kernel architecture. The system provides 
              persistent runtime with 3-tier memory (Hot/Warm/Cold), adaptive learning cycles, 
              multi-provider AI routing, real-time observability, and self-improvement pipelines.
            </p>
            <p>
              This release establishes three interconnected standards: <strong>FNDTN</strong> as the 
              substrate mechanics standard, the <strong>AI Governance Reference Namespace</strong> as 
              the governance semantics layer, and <strong>LLMS.txt</strong> as the machine-readable 
              context format for AI systems.
            </p>
          </CardContent>
        </Card>

        {/* 14-Module Architecture */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            14-Module Architecture
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {MODULES.map((mod) => (
              <Card key={mod.name} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-3 text-center">
                  <mod.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="font-mono text-xs font-medium">{mod.name}</p>
                  <p className="text-[10px] text-muted-foreground">{mod.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Cross-links */}
        <Card className="mb-8 bg-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Three-Surface Standard Stack</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/foundations" className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h4 className="font-medium text-primary mb-1">Substrate Standard</h4>
                <p className="text-sm text-muted-foreground">CMPSBL FNDTN v6.0.0</p>
              </Link>
              <Link to="/namespace" className="p-4 rounded-lg bg-muted border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-medium mb-1">Governance Standard</h4>
                <p className="text-sm text-muted-foreground">AI Governance Namespace</p>
              </Link>
              <Link to="/llms-txt" className="p-4 rounded-lg bg-muted border border-border hover:border-primary/30 transition-colors">
                <h4 className="font-medium mb-1">Machine Context Standard</h4>
                <p className="text-sm text-muted-foreground">LLMS.txt</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Download Surface */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" />
            Download Surface
          </h2>
          <p className="text-muted-foreground mb-6">
            CMPSBL.com is the canonical first-release surface. OSF and Zenodo serve as archival mirrors.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Complete Bundle */}
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="w-5 h-5 text-primary" />
                  Complete Bundle
                </CardTitle>
                <CardDescription>
                  Full FNDTN v6.0.0 documentation package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gap-2" asChild>
                  <a href="/docs/FNDTN-v6/fndtn-v6-foundations-paper.html" target="_blank">
                    <FileText className="w-4 h-4" />
                    Browse Foundations Paper (HTML)
                  </a>
                </Button>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href="/docs/FNDTN-v6/fndtn-v6-foundations-paper.md" download>
                    <Download className="w-4 h-4" />
                    Download Foundations Paper (MD)
                  </a>
                </Button>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href="/docs/FNDTN-v6/fndtn-v6-foundations-metadata.json" download>
                    <Download className="w-4 h-4" />
                    Download Metadata (JSON)
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Machine Context */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  Machine Context
                </CardTitle>
                <CardDescription>
                  LLMS.txt for AI systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href="/llms.txt" target="_blank">
                    <FileText className="w-4 h-4" />
                    View llms.txt (Canonical)
                  </a>
                </Button>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href="/llms.txt" download="llms.txt">
                    <Download className="w-4 h-4" />
                    Download llms.txt
                  </a>
                </Button>
                <Button variant="ghost" className="w-full gap-2" asChild>
                  <Link to="/llms-txt">
                    Learn about LLMS.txt Standard →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* External Archives */}
          <Card className="bg-muted/30 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Archival Mirrors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <a 
                  href="https://osf.io/ah7nx/overview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <Archive className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">OSF</p>
                    <p className="text-xs text-muted-foreground">v5.5.0 Archive</p>
                  </div>
                </a>
                <a 
                  href="https://zenodo.org/records/18379258" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <Archive className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Zenodo</p>
                    <p className="text-xs text-muted-foreground">v5.5.0 Archive</p>
                  </div>
                </a>
                <a 
                  href="https://orcid.org/0009-0001-4237-1243" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">ORCID</p>
                    <p className="text-xs text-muted-foreground">Author Profile</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-8" />

        {/* Document Library */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Document Library (26 Documents)
          </h2>
          
          <div className="grid gap-2">
            {LIBRARY_DOCS.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-xs">
                    {doc.id}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/docs/library/${doc.id}-${doc.name}.md`} target="_blank">
                      <FileText className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/docs/library/${doc.id}-${doc.name}.md`} download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Author Attribution */}
        <div className="mt-12 p-6 rounded-lg bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">
            FNDTN v6.0.0 by{" "}
            <a 
              href="https://orcid.org/0009-0001-4237-1243" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Kenneth E. Sweet Jr.
            </a>
            {" "}• PromptFluid • January 2026
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
