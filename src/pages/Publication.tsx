/**
 * CMPSBL® — DOI Publication & Academic Protection Set
 * v13.5 IRONCLAD Epoch — Defensive Publication Landing Page
 */

import { Link } from "react-router-dom";
import {
  ExternalLink, FileText, Copy, Check, BookOpen, Scale, User,
  Shield, Brain, Zap, Globe, GitBranch, Layers, Lock, Search,
  ChevronRight, ArrowRight, Fingerprint, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CmpsblNav } from "@/components/navigation/CmpsblNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const DOI = "10.5281/zenodo.18234909";
const DOI_URL = `https://doi.org/${DOI}`;
const ORCID = "0009-0001-4237-1243";
const ORCID_URL = `https://orcid.org/${ORCID}`;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: "easeOut" as const }
  })
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } }
};

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
  { title: "Release Abstract", desc: "System overview and publication purpose", icon: FileText, slug: "release-abstract", num: "01" },
  { title: "System Overview", desc: "Clockless cognitive substrate infrastructure", icon: Layers, slug: "system-overview", num: "02" },
  { title: "Memory Stream & Foundry", desc: "Signal → discovery → crystallization architecture", icon: Brain, slug: "memory-stream", num: "03" },
  { title: "Memory Crystallization", desc: "Structural fingerprinting and replay verification", icon: Zap, slug: "pipeline-crystallization", num: "04" },
  { title: "Universal Export", desc: "Cross-language export and portable runtime", icon: Globe, slug: "universal-export", num: "05" },
  { title: "Governance & Safety", desc: "Shadow verification, bounded autonomy, auditability", icon: Shield, slug: "governance-safety", num: "06" },
  { title: "IRONCLAD Hardening", desc: "Circuit breakers, subsystem healing, safe-mode", icon: Fingerprint, slug: "resilience-hardening", num: "07" },
  { title: "Intent Mesh", desc: "Cross-module semantic routing primitives", icon: GitBranch, slug: "intent-mesh", num: "08" },
  { title: "Domain Extension", desc: "Primitive-node expansion for industry domains", icon: Layers, slug: "domain-extension", num: "09" },
  { title: "Prior Art Statement", desc: "Defensive publication intent and scope", icon: Scale, slug: "prior-art", num: "10" },
];

const systemMetrics = [
  { label: "Architecture Nodes", value: "40", icon: Layers },
  { label: "Architectural Sectors", value: "12", icon: GitBranch },
  { label: "Synergy Memories", value: "300+", icon: Zap },
  { label: "Autonomy Tiers", value: "3", icon: Shield },
  { label: "Hardening Coverage", value: "100%", icon: Fingerprint },
  { label: "Export Targets", value: "25", icon: Globe },
];

const priorArtClaims = [
  "Clockless cognitive orchestration with weighted integrity scoring",
  "Memory stream architecture with signal-to-discovery crystallization",
  "Pipeline crystallization with structural fingerprinting and replay verification",
  "Universal cross-language export with embedded micro-substrate runtime",
  "Shadow-mode governance with bounded autonomy tiers",
  "IRONCLAD resilience fabric with per-module bulkhead isolation",
  "Intent mesh for cross-module semantic routing",
  "Domain extension through primitive-node expansion",
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

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/3" />
        <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[150px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-[120px]" />
      </div>

      <main className="relative z-10">
        {/* ═══════════ HERO ═══════════ */}
        <section className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-10 sm:pb-12 md:pt-36 md:pb-16">
          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} custom={0} className="flex flex-wrap items-center gap-2 mb-8">
              <Badge variant="outline" className="border-primary/30 text-primary font-mono text-[11px] tracking-wide px-3 py-1">
                v13.5 · IRONCLAD EPOCH
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground font-mono text-[11px] tracking-wide px-3 py-1">
                DEFENSIVE PUBLICATION
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground font-mono text-[11px] tracking-wide px-3 py-1">
                📖 OPEN ACCESS
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-4">
              CMPSBL® Substrate OS
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground mb-3 max-w-2xl leading-relaxed">
              Cognitive Orchestration System for Autonomous AI Evolution
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-12">
              <a href={ORCID_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Kenneth E. Sweet Jr.
              </a>
              <span className="text-border">·</span>
              <span>PromptFluid®</span>
              <span className="text-border">·</span>
              <span>March 2026</span>
            </motion.div>

            {/* DOI Card */}
            <motion.div variants={fadeUp} custom={4}>
              <Card className="glass overflow-hidden">
                <CardContent className="p-0">
                  {/* DOI header strip */}
                  <div className="px-6 md:px-8 py-5 border-b border-border/50 bg-muted/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Digital Object Identifier</p>
                        <a
                          href={DOI_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg md:text-xl font-mono font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {DOI}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-muted-foreground font-mono">ARCHIVED</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="px-6 md:px-8 py-5 flex flex-wrap gap-3">
                    <Button asChild size="sm">
                      <a href={DOI_URL} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                        View on Zenodo
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={ORCID_URL} target="_blank" rel="noopener noreferrer">
                        <User className="w-3.5 h-3.5 mr-2" />
                        ORCID
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://osf.io/ah7nx/" target="_blank" rel="noopener noreferrer">
                        <Search className="w-3.5 h-3.5 mr-2" />
                        OSF
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/docs/academic-v13">
                        <BookOpen className="w-3.5 h-3.5 mr-2" />
                        Full Library
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════ ABSTRACT ═══════════ */}
         <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-primary" />
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Abstract</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-[1.8] text-[15px]">
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
              <p>
                As of the current MINDGAMES epoch, the substrate comprises 40 matrix nodes organized across
                twelve architectural sectors, with 300+ synergy pipelines, a three-tier autonomy governance model,
                675+ capabilities, and full-spectrum resilience hardening across all subsystems.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ═══════════ SYSTEM METRICS ═══════════ */}
        <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {systemMetrics.map((m, i) => (
                <motion.div key={m.label} variants={fadeUp} custom={i}>
                  <Card className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300 group">
                    <CardContent className="p-4 text-center">
                      <m.icon className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/60 mx-auto mb-2 transition-colors" />
                      <p className="text-2xl font-semibold text-foreground tracking-tight">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider leading-tight">{m.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Divider */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="border-t border-border/50" />
        </div>

        {/* ═══════════ PRIOR ART CLAIMS ═══════════ */}
         <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 rounded-full bg-primary" />
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Architectural Claims</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6 ml-3">
              This publication establishes timestamped prior art for the following:
            </p>

            <div className="grid gap-2">
              {priorArtClaims.map((claim, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-border/30"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <span className="text-[10px] font-mono text-primary/60 mt-0.5 shrink-0 w-4 text-right">{i + 1}</span>
                  <p className="text-sm text-foreground/80">{claim}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Divider */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="border-t border-border/50" />
        </div>

        {/* ═══════════ DOCUMENT INDEX ═══════════ */}
         <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 rounded-full bg-primary" />
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Public Prior-Art Documents</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-8 ml-3">
              10 open-access documents. Classified{" "}
              <span className="font-mono text-[11px] text-primary">📖 OPEN ACCESS / PRIOR ART</span>.
            </p>

            <div className="grid md:grid-cols-2 gap-2.5">
              {priorArtDocs.map((doc, i) => (
                <motion.div key={doc.slug} variants={fadeUp} custom={i}>
                  <Link
                    to={`/docs/academic-v13?doc=${doc.slug}`}
                    className="group block"
                  >
                    <Card className="bg-card border-border/40 hover:border-primary/30 hover:shadow-sm transition-all duration-300">
                      <CardContent className="p-4 flex items-start gap-3.5">
                        <div className="relative mt-0.5">
                          <div className="w-9 h-9 rounded-lg bg-primary/[0.07] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] transition-colors">
                            <doc.icon className="w-4 h-4" />
                          </div>
                          <span className="absolute -top-1 -right-1 text-[9px] font-mono text-muted-foreground/50">
                            {doc.num}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                            {doc.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{doc.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-border group-hover:text-primary/50 mt-1.5 shrink-0 transition-colors" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Additional links */}
            <motion.div variants={fadeUp} custom={11} className="mt-6 flex flex-wrap gap-2.5">
              <Link to="/docs/academic-v13?doc=sealed-mechanisms" className="group">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-destructive/20 hover:border-destructive/40 hover:bg-destructive/[0.03] transition-all">
                  <Lock className="w-3.5 h-3.5 text-destructive/60" />
                  <span className="text-xs font-medium text-destructive/70 group-hover:text-destructive transition-colors">Sealed Mechanisms Registry</span>
                  <Badge variant="outline" className="text-[9px] border-destructive/20 text-destructive/50 px-1.5 py-0">⛔ WITHHELD</Badge>
                </div>
              </Link>
              <Link to="/docs/academic-v13?doc=zenodo-metadata" className="group">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Zenodo Metadata</span>
                </div>
              </Link>
              <Link to="/docs/academic-v13" className="group">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/[0.03] transition-all">
                  <BookOpen className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-xs font-medium text-primary/70 group-hover:text-primary transition-colors">View All 18 Documents</span>
                  <ArrowRight className="w-3 h-3 text-primary/40 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Divider */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="border-t border-border/50" />
        </div>

        {/* ═══════════ CITATIONS ═══════════ */}
         <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-5 rounded-full bg-primary" />
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">How to Cite</h2>
            </div>

            <div className="space-y-3">
              {Object.entries(citations).map(([format, text]) => (
                <Card key={format} className="bg-card border-border/40 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-muted/20">
                      <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-muted-foreground font-medium">
                        {format}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(format, text)}
                        className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {copiedFormat === format ? (
                          <><Check className="w-3 h-3 mr-1.5 text-green-500" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1.5" /> Copy</>
                        )}
                      </Button>
                    </div>
                    <pre className="text-[12px] font-mono text-muted-foreground p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {text}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Divider */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="border-t border-border/50" />
        </div>

        {/* ═══════════ IP NOTICE ═══════════ */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-5 rounded-full bg-primary" />
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Intellectual Property</h2>
            </div>

            <Card className="bg-card border-border/40">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-4 text-sm text-muted-foreground leading-[1.8]">
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
                </div>
                <div className="mt-6 pt-5 border-t border-border/30 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground tracking-wide">
                    ALL RIGHTS RESERVED
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground tracking-wide">
                    DEFENSIVE PUBLICATION
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground tracking-wide">
                    © 2025–2026 PROMPTFLUID®
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* ═══════════ CTA ═══════════ */}
        <section className="container mx-auto px-4 sm:px-6 pt-4 pb-16 sm:pb-20">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-primary/15 overflow-hidden">
              <CardContent className="p-0">
                <div className="h-0.5 w-full bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div>
                    <p className="font-medium text-foreground mb-1.5">Explore the full documentation library</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      18 documents across four classification tiers — architecture, governance, resilience, and more.
                    </p>
                  </div>
                  <Button asChild className="shrink-0 group">
                    <Link to="/docs/academic-v13">
                      Academic Library
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}
