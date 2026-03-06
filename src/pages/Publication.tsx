/**
 * CMPSBL® — DOI Publication & Academic Protection Set
 * v13.5 IRONCLAD Epoch — Defensive Publication Landing Page
 */

import { Link } from "react-router-dom";
import {
  ExternalLink, FileText, Copy, Check, BookOpen, Scale, User,
  Shield, Brain, Zap, Globe, GitBranch, Layers, Lock, Search,
  ChevronRight, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CmpsblNav } from "@/components/navigation/CmpsblNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const DOI = "10.5281/zenodo.18234909";
const DOI_URL = `https://doi.org/${DOI}`;
const ORCID = "0009-0001-4237-1243";
const ORCID_URL = `https://orcid.org/${ORCID}`;

const citations = {
  bibtex: `@software{sweet2026cmpsbl,
  author       = {Sweet Jr., Kenneth E.},
  title        = {{CMPSBL OS Substrate: Cognitive Orchestration
                   System for Autonomous AI Evolution}},
  version      = {13.5.0},
  year         = {2026},
  publisher    = {Zenodo},
  doi          = {${DOI}},
  url          = {${DOI_URL}}
}`,
  apa: `Sweet, K. E., Jr. (2026). CMPSBL OS Substrate: Cognitive Orchestration System for Autonomous AI Evolution (Version 13.5.0) [Computer software]. Zenodo. ${DOI_URL}`,
  chicago: `Sweet, Kenneth E., Jr. "CMPSBL OS Substrate: Cognitive Orchestration System for Autonomous AI Evolution." Version 13.5.0. Zenodo, 2026. ${DOI_URL}.`,
};

const priorArtDocs = [
  { title: "Release Abstract", desc: "System overview and publication purpose", icon: FileText, slug: "release-abstract" },
  { title: "System Overview", desc: "Clockless cognitive substrate infrastructure", icon: Layers, slug: "system-overview" },
  { title: "Memory Stream & Foundry", desc: "Signal → discovery → crystallization architecture", icon: Brain, slug: "memory-stream" },
  { title: "Pipeline Crystallization", desc: "Structural fingerprinting and replay verification", icon: Zap, slug: "pipeline-crystallization" },
  { title: "Universal Export", desc: "Cross-language export and portable runtime", icon: Globe, slug: "universal-export" },
  { title: "Governance & Safety", desc: "Shadow verification, bounded autonomy, auditability", icon: Shield, slug: "governance-safety" },
  { title: "IRONCLAD Hardening", desc: "Circuit breakers, subsystem healing, safe-mode", icon: Shield, slug: "resilience-hardening" },
  { title: "Intent Mesh", desc: "Cross-module semantic routing primitives", icon: GitBranch, slug: "intent-mesh" },
  { title: "Domain Extension", desc: "Primitive-node expansion for industry domains", icon: Layers, slug: "domain-extension" },
  { title: "Prior Art Statement", desc: "Defensive publication intent and scope", icon: Scale, slug: "prior-art" },
];

const systemMetrics = [
  { label: "Architecture Nodes", value: "38" },
  { label: "Architectural Sectors", value: "7" },
  { label: "Synergy Pipelines", value: "300+" },
  { label: "Autonomy Tiers", value: "3" },
  { label: "Hardening Coverage", value: "100%" },
  { label: "Export Targets", value: "25" },
];

export default function Publication() {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleCopy = (format: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    toast.success(`${format.toUpperCase()} citation copied`);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="CMPSBL Substrate — Academic Publication"
        description="Defensive publication and prior-art documentation for the CMPSBL Substrate OS. IRONCLAD epoch, Zenodo-archived cognitive orchestration system."
        canonical="https://cmpsbl.com/publication"
        keywords={['CMPSBL', 'DOI', 'Zenodo', 'prior art', 'defensive publication', 'cognitive architecture', 'academic']}
        type="article"
      />

      <CmpsblNav />

      {/* Subtle ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/3" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/4 blur-[120px]" />
      </div>

      <main className="relative z-10">
        {/* ─── Hero ─── */}
        <section className="container mx-auto px-6 pt-28 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="outline" className="border-primary/30 text-primary font-mono text-xs">
                v13.5 · IRONCLAD
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground font-mono text-xs">
                Defensive Publication
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-3">
              CMPSBL® Substrate OS
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-2 max-w-2xl">
              Cognitive Orchestration System for Autonomous AI Evolution
            </p>
            <p className="text-sm text-muted-foreground mb-10">
              Kenneth E. Sweet Jr. · PromptFluid® · 2026
            </p>

            {/* DOI Card */}
            <Card className="bg-card/80 backdrop-blur border-border/60 mb-8">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Digital Object Identifier</p>
                    <p className="text-xl md:text-2xl font-mono font-semibold text-foreground">
                      {DOI}
                    </p>
                  </div>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/30">
                    📖 Open Access
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <a href={DOI_URL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Zenodo
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={ORCID_URL} target="_blank" rel="noopener noreferrer">
                      <User className="w-4 h-4 mr-2" />
                      ORCID Profile
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://osf.io/ah7nx/" target="_blank" rel="noopener noreferrer">
                      <Search className="w-4 h-4 mr-2" />
                      OSF Project
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/docs/academic-v13">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Full Library
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Abstract */}
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                The CMPSBL® Substrate OS is a cognitive orchestration system designed for persistent,
                self-governing artificial intelligence operations. The substrate provides a unified runtime
                environment in which multiple cognitive modules collaborate through structured message passing,
                governed mutation, and verifiable state evolution.
              </p>
              <p>
                The system implements a clockless architecture — modules operate without shared global clocks,
                coordinating instead through event-driven signal propagation and weighted integrity scoring.
                This design enables autonomous learning, offline cognitive consolidation, and governed
                self-evolution within deterministic safety boundaries.
              </p>
            </div>
          </div>
        </section>

        {/* ─── System Metrics ─── */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {systemMetrics.map((m) => (
                <Card key={m.label} className="bg-card/60 border-border/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-semibold text-foreground">{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* ─── Prior Art Documents ─── */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Prior Art Documents</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              10 public documents establishing timestamped prior art for the system architecture.
              All documents are classified <span className="font-mono text-xs text-primary">📖 OPEN ACCESS / PRIOR ART</span>.
            </p>

            <div className="grid md:grid-cols-2 gap-3">
              {priorArtDocs.map((doc) => (
                <Link
                  key={doc.slug}
                  to={`/docs/academic-v13?doc=${doc.slug}`}
                  className="group"
                >
                  <Card className="bg-card/60 border-border/50 hover:border-primary/30 hover:bg-primary/[0.02] transition-all">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-md bg-primary/8 text-primary shrink-0">
                        <doc.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {doc.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 mt-1 shrink-0 transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/docs/academic-v13?doc=sealed-mechanisms">
                <Badge variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/5 cursor-pointer transition-colors">
                  <Lock className="w-3 h-3 mr-1.5" />
                  Sealed Mechanisms Registry
                </Badge>
              </Link>
              <Link to="/docs/academic-v13?doc=zenodo-metadata">
                <Badge variant="outline" className="border-border text-muted-foreground hover:bg-muted cursor-pointer transition-colors">
                  <FileText className="w-3 h-3 mr-1.5" />
                  Zenodo Metadata
                </Badge>
              </Link>
            </div>
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* ─── Citations ─── */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Citation</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(citations).map(([format, text]) => (
                <Card key={format} className="bg-card/60 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="uppercase text-xs font-mono">
                        {format}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(format, text)}
                        className="h-8 text-xs"
                      >
                        {copiedFormat === format ? (
                          <><Check className="w-3 h-3 mr-1" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1" /> Copy</>
                        )}
                      </Button>
                    </div>
                    <pre className="text-xs font-mono text-muted-foreground bg-muted/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      {text}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* ─── Licensing & IP ─── */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Intellectual Property</h2>
            </div>

            <Card className="bg-card/60 border-border/50">
              <CardContent className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  This publication set is released under defensive publication terms. The system described
                  herein is the intellectual property of Kenneth E. Sweet Jr. and PromptFluid®. Publication
                  establishes prior art and does not constitute a grant of license.
                </p>
                <p>
                  Exploit-sensitive implementation details, scoring weights, discovery heuristics, and
                  privileged runtime internals are intentionally withheld from this publication and documented
                  in the Sealed Mechanisms registry.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <Badge variant="outline" className="text-xs border-border">
                    All Rights Reserved
                  </Badge>
                  <Badge variant="outline" className="text-xs border-border">
                    Defensive Publication
                  </Badge>
                  <Badge variant="outline" className="text-xs border-border">
                    © 2025–2026 PromptFluid®
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="container mx-auto px-6 py-12 pb-20">
          <div className="max-w-4xl">
            <Card className="bg-primary/[0.03] border-primary/20">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground mb-1">Explore the full documentation library</p>
                  <p className="text-sm text-muted-foreground">
                    18 documents across four classification tiers — architecture, governance, resilience, and more.
                  </p>
                </div>
                <Button asChild className="shrink-0">
                  <Link to="/docs/academic-v13">
                    Academic Library
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}
