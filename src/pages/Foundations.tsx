/**
 * FNDTN v8 — Foundations
 * Standards release page with documentation index and download surface
 */

import { useState } from "react";
import { SEO } from "@/components/SEO";
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
  Globe, Cpu, Settings, Code, Moon, Network, Printer,
  Radio, Key, Landmark, DollarSign, Box, ScrollText,
  Fingerprint, Send, Lock
} from "lucide-react";
import { toast } from "sonner";
import { usePrintDocument } from "@/hooks/usePrintDocument";

// Curated website documentation (matches Library.tsx)
const LIBRARY_DOCS = [
  { id: "00", name: "INDEX", title: "Documentation Overview", description: "Complete guide to CMPSBL documentation" },
  { id: "01", name: "EXECUTIVE-SUMMARY", title: "Executive Summary", description: "High-level overview for investors" },
  { id: "02", name: "WHAT-IS-CMPSBL", title: "What is CMPSBL?", description: "Introduction to cognitive infrastructure" },
  { id: "03", name: "KEY-CAPABILITIES", title: "Key Capabilities", description: "38-node / 12-sector architecture deep dive" },
  { id: "04", name: "USE-CASES", title: "Use Cases", description: "Real-world applications" },
  { id: "05", name: "ARCHITECTURE", title: "Architecture Overview", description: "Technical foundation" },
  { id: "06", name: "GETTING-STARTED", title: "Getting Started", description: "Quick start guide" },
  { id: "07", name: "LICENSING", title: "Pricing & Licensing", description: "License tiers" },
  { id: "08", name: "FAQ", title: "FAQ", description: "Frequently asked questions" },
  { id: "09", name: "SECURITY-COMPLIANCE", title: "Security & Compliance", description: "Enterprise security" },
  { id: "10", name: "ROADMAP", title: "Product Roadmap", description: "Vision through 2028" },
  { id: "11", name: "CASE-STUDIES", title: "Case Studies", description: "Implementation success stories" },
  { id: "12", name: "COMPARISONS", title: "Market Comparison", description: "Competitive analysis" },
  { id: "13", name: "INVESTOR-OVERVIEW", title: "Investor Overview", description: "Investment thesis" },
];

const MODULES = [
  // Kernel
  { name: "CORE", icon: Cpu, desc: "Boot authority & lifecycle", layer: "Kernel" },
  // Modules (9)
  { name: "DECODE", icon: Terminal, desc: "Intent parsing & voice", layer: "Module" },
  { name: "ENCODE", icon: Code, desc: "Code generation engine", layer: "Module" },
  { name: "VISION", icon: Eye, desc: "Observability & traces", layer: "Module" },
  { name: "CORTEX", icon: Layers, desc: "Multi-surface orchestration", layer: "Module" },
  { name: "NEXUS", icon: Zap, desc: "AI provider routing", layer: "Module" },
  { name: "ECONOMY", icon: DollarSign, desc: "Cost & budget tracking", layer: "Module" },
  { name: "SANDBOX", icon: Lock, desc: "Isolated execution", layer: "Module" },
  { name: "INCLUSIVE", icon: Users, desc: "Accessibility engine", layer: "Module" },
  { name: "INTEGRATION", icon: Globe, desc: "External connectors", layer: "Module" },
  // Mesh Overlays (5)
  { name: "DEFENSE", icon: Shield, desc: "Security perimeter", layer: "Mesh" },
  { name: "IMMUNITY", icon: Shield, desc: "Adaptive resilience", layer: "Mesh" },
  { name: "EVOLUTION", icon: Landmark, desc: "Self-improvement", layer: "Mesh" },
  { name: "INTENT", icon: Network, desc: "Goal decomposition", layer: "Mesh" },
  { name: "GOVERNANCE", icon: ScrollText, desc: "Ethical constraints", layer: "Mesh" },
];

export default function Foundations() {
  const { printDocument } = usePrintDocument();
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);

  const handlePrintDownload = async (doc: typeof LIBRARY_DOCS[0]) => {
    setLoadingDoc(doc.id);
    try {
      const filename = `${doc.id}-${doc.name}`;
      let response = await fetch(`/docs/website/${filename}.html`);
      if (!response.ok) {
        response = await fetch(`/docs/website/${filename}.md`);
      }
      if (response.ok) {
        const content = await response.text();
        printDocument({
          content,
          title: doc.title,
          docId: doc.id,
        });
      } else {
        toast.error("Failed to load document");
      }
    } catch (error) {
      toast.error("Error loading document");
    }
    setLoadingDoc(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="FNDTN — Foundations | CMPSBL®"
        description="CMPSBL — A Cognitive Reality System powered by the CMPSBL Substrate. Reference standard for the substrate class. Browse the layered architecture and access archival records."
      />

      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">CMPSBL Substrate</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-4">
            Foundations
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Clockless, powered by the CMPSBL Substrate, is the reference implementation and proposed standard 
            for the <strong>cognitive reality class</strong> of AI systems — persistent runtime, memory, 
            governance, and self-improvement.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline">Layered Architecture</Badge>
            <Badge variant="outline">Mesh Overlays</Badge>
            <Badge variant="outline">Capabilities</Badge>
            <Badge variant="outline">Synergy Pipelines</Badge>
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
              CMPSBL presents a unified cognitive infrastructure platform 
              implementing a layered architecture with production modules, protective layers,
              synergy pipelines, and extensive capabilities. The system provides persistent runtime with tiered memory,
              adaptive learning cycles, multi-provider AI routing, real-time observability,
              autonomous inter-module communication via the INTENT mesh, and self-improvement pipelines.
            </p>
            <p>
              This release establishes three interconnected standards: <strong>ARCHITECT</strong> as the 
              substrate mechanics standard, the <strong>AI Governance Reference Namespace</strong> as 
              the governance semantics layer, and <strong>LLMS.txt</strong> as the machine-readable 
              context format for AI systems.
            </p>
          </CardContent>
        </Card>

        {/* 38-Node / 12-Sector Architecture */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Layered Architecture
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
                <p className="text-sm text-muted-foreground">CMPSBL Substrate</p>
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
                  Full FNDTN v8 documentation package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gap-2" asChild>
                  <Link to="/documentation">
                    <BookOpen className="w-4 h-4" />
                    Browse Documentation
                  </Link>
                </Button>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href="/docs/FNDTN-v7/fndtn-v7-foundations-metadata.json" download>
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
                    <p className="text-xs text-muted-foreground">Research Archive</p>
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
                    <p className="text-xs text-muted-foreground">Research Archive</p>
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
            Document Library ({LIBRARY_DOCS.length} Documents)
          </h2>
          <p className="text-muted-foreground mb-6">
            Curated documentation with printer-friendly PDF export. Click the printer icon for high-fidelity A4 documents.
          </p>
          
          <div className="grid gap-2">
            {LIBRARY_DOCS.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant="outline" className="font-mono text-xs shrink-0">
                    {doc.id}
                  </Badge>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" asChild title="View in Library">
                    <Link to={`/library?doc=${doc.id}-${doc.name}`}>
                      <FileText className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handlePrintDownload(doc)}
                    disabled={loadingDoc === doc.id}
                    title="Print / Download PDF"
                  >
                    <Printer className={`w-4 h-4 ${loadingDoc === doc.id ? 'animate-pulse' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" asChild title="Download Document">
                    <a href={`/docs/website/${doc.id}-${doc.name}.html`} download>
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
            CMPSBL Substrate by{" "}
            <a 
              href="https://orcid.org/0009-0001-4237-1243" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Kenneth E. Sweet Jr.
            </a>
            {" "}• CMPSBL® • February 2026
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
