/**
 * Engine Documentation — Auto-generated docs page per engine slug
 * Shows capabilities, integration guide, and downloadable reference.
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ArrowLeft, Download, FileText, Check, Lock, Shield,
  Copy, Terminal, BookOpen, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getEngineBySlug, type Engine } from "@/lib/engines/catalog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function generateEngineDoc(engine: Engine): string {
  const lines = [
    `╔═══════════════════════════════════════════════════╗`,
    `║  ${engine.codename} ENGINE — SEALED RUNTIME REFERENCE  ║`,
    `╚═══════════════════════════════════════════════════╝`,
    ``,
    `Generated: ${new Date().toISOString()}`,
    `Tier: ${engine.tier} | Edition: ${engine.edition}`,
    `Classification: ${engine.threatLevel}`,
    `Clearance: ${engine.clearance}`,
    `License: ${engine.isSubscription ? 'Annual Subscription' : 'Perpetual One-Time'}`,
    ``,
    `── MISSION BRIEFING ──────────────────────────────────`,
    engine.briefing,
    ``,
    `── OPERATIONAL CAPABILITIES ──────────────────────────`,
    ...engine.capabilities.map((c, i) => `  ${i + 1}. ${c}`),
    ``,
    `── INTEGRATION GUIDE ─────────────────────────────────`,
    ``,
    `  import { ${engine.codename.toLowerCase()} } from '@cmpsbl/engines/${engine.slug}';`,
    ``,
    `  // Initialize the sealed runtime`,
    `  const engine = ${engine.codename.toLowerCase()}.init({`,
    `    mode: 'production',`,
    `    persistence: true,`,
    `    autoHeal: true,`,
    `  });`,
    ``,
    `  // Execute a task`,
    `  const result = await engine.execute({`,
    `    input: yourData,`,
    `    timeout: 30000,`,
    `  });`,
    ``,
    `── SEALED RUNTIME PROPERTIES ─────────────────────────`,
    `  • Source-blocked: Runtime is obfuscated and tamper-proof`,
    `  • Memory-isolated: Each instance runs in its own sandbox`,
    `  • Version-pinned: Your minted version never changes`,
    `  • Auto-healing: Built-in circuit breaking and recovery`,
    `  • CLM-enabled: Continuous Learning Mode improves over time`,
    ``,
    `── SUPPORT ──────────────────────────────────────────`,
    `  Email: Dev@CMPSBL.com`,
    `  Docs:  https://cmpsbl.com/docs/engines/${engine.slug}`,
    ``,
    `© CMPSBL — Sealed Agent Program. All rights reserved.`,
  ];
  return lines.join('\n');
}

export default function EngineDocsPage() {
  const { slug } = useParams<{ slug: string }>();
  const engine = getEngineBySlug(slug ?? "");

  if (!engine) return <Navigate to="/engines" replace />;

  const handleDownload = () => {
    const content = generateEngineDoc(engine);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${engine.codename}-sealed-runtime-reference.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Documentation downloaded');
  };

  const handleCopySnippet = () => {
    const snippet = `import { ${engine.codename.toLowerCase()} } from '@cmpsbl/engines/${engine.slug}';\n\nconst engine = ${engine.codename.toLowerCase()}.init({ mode: 'production' });`;
    navigator.clipboard.writeText(snippet);
    toast.success('Code snippet copied');
  };

  return (
    <>
      <Helmet>
        <title>{engine.codename} Documentation — CMPSBL</title>
        <meta name="description" content={`Integration guide and reference for the ${engine.codename} sealed runtime engine.`} />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to={`/engines/${engine.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to {engine.codename}
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center" style={{ background: `linear-gradient(135deg, hsl(${engine.color} / 0.1), transparent)` }}>
                <engine.icon className="w-7 h-7" style={{ color: `hsl(${engine.color})` }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black tracking-tight">{engine.codename}</h1>
                  <Badge variant="outline" className="text-[10px] font-mono">{engine.tier}</Badge>
                </div>
                <p className="text-muted-foreground">Sealed Runtime Reference & Integration Guide</p>
              </div>
            </div>

            {/* Download bar */}
            <Card className="border-primary/20">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{engine.codename}-sealed-runtime-reference.txt</p>
                    <p className="text-xs text-muted-foreground">Complete integration reference</p>
                  </div>
                </div>
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </CardContent>
            </Card>

            {/* Mission Briefing */}
            <section>
              <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> MISSION BRIEFING
              </h2>
              <p className="text-foreground leading-relaxed">{engine.briefing}</p>
            </section>

            {/* Capabilities */}
            <section>
              <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> CAPABILITIES
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {engine.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{cap}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Start */}
            <section>
              <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> QUICK START
              </h2>
              <div className="relative rounded-xl bg-muted/50 border border-border p-5 font-mono text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 h-7 gap-1 text-xs"
                  onClick={handleCopySnippet}
                >
                  <Copy className="w-3 h-3" /> Copy
                </Button>
                <pre className="text-foreground whitespace-pre-wrap">
{`import { ${engine.codename.toLowerCase()} } from '@cmpsbl/engines/${engine.slug}';

const engine = ${engine.codename.toLowerCase()}.init({
  mode: 'production',
  persistence: true,
  autoHeal: true,
});

const result = await engine.execute({
  input: yourData,
  timeout: 30000,
});`}
                </pre>
              </div>
            </section>

            {/* Runtime Properties */}
            <section>
              <h2 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" /> SEALED RUNTIME PROPERTIES
              </h2>
              <div className="space-y-3">
                {[
                  { icon: Lock, text: "Source-blocked: Runtime is obfuscated and tamper-proof" },
                  { icon: Shield, text: "Memory-isolated: Each instance runs in its own sandbox" },
                  { icon: FileText, text: "Version-pinned: Your minted version never changes" },
                  { icon: Sparkles, text: "Auto-healing: Built-in circuit breaking and recovery" },
                  { icon: BookOpen, text: "CLM-enabled: Continuous Learning Mode improves over time" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </>
  );
}
