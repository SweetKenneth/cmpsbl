/**
 * NpmPackagesCTA — Showcase the @cmpsbl NPM ecosystem
 * Color palette: Cyan / Purple / Magenta (matching CMPSBL hero gradient)
 */


import { Package, Terminal, ArrowRight, Copy, Check, ExternalLink, Zap, Layers, Shield, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NPM_PACKAGES = [
  { name: "@cmpsbl/types", desc: "Shared TypeScript schemas — CJPI, manifests, resolvers, mesh events", tier: "Foundation" },
  { name: "@cmpsbl/runtime", desc: "CJPI scoring, tiering, memory chain orchestration, and pipeline execution", tier: "Foundation" },
  { name: "@cmpsbl/failsafe", desc: "Zero-dep migration engine for platform portability", tier: "Foundation" },
  { name: "@cmpsbl/intent", desc: "Intent router — broadcast + resolver dispatch for any app", tier: "Core" },
  { name: "@cmpsbl/matrix", desc: "Matrix telemetry — emit and subscribe to primitive-to-primitive communication events", tier: "Core" },
  { name: "@cmpsbl/bridge", desc: "Bridge adapter — wire Python, Go, Rust runtimes to the substrate", tier: "Core" },
  { name: "@cmpsbl/sdk", desc: "Engine SDK — authenticated access to hosted CMPSBL engines", tier: "Developer" },
  { name: "@cmpsbl/discovery", desc: "Memory discovery — score, crystallize, and manage capabilities", tier: "Developer" },
  { name: "@cmpsbl/cli", desc: "CLI tools — init, score, export, validate-manifest commands", tier: "Developer" },
  { name: "@cmpsbl/react", desc: "React hooks — useIntent, useMesh, useRuntime, useCJPI", tier: "Ecosystem" },
  { name: "@cmpsbl/test-harness", desc: "Test utilities for validating memory chains and bridge adapters", tier: "Ecosystem" },
] as const;

const TIER_COLORS: Record<string, string> = {
  Foundation: "bg-[hsl(var(--neon-cyan)/0.1)] text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan)/0.2)]",
  Core: "bg-[hsl(var(--neon-purple)/0.1)] text-[hsl(var(--neon-purple))] border-[hsl(var(--neon-purple)/0.2)]",
  Developer: "bg-[hsl(var(--neon-magenta)/0.1)] text-[hsl(var(--neon-magenta))] border-[hsl(var(--neon-magenta)/0.2)]",
  Ecosystem: "bg-primary/10 text-primary border-primary/20",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button onClick={copy} className="p-1 rounded hover:bg-muted transition-colors" title="Copy install command">
      {copied ? <Check className="w-3 h-3 text-[hsl(var(--neon-cyan))]" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
    </button>
  );
}

/** Full version — used on Developer Tools and Developer pages */
export function NpmPackagesGrid() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">NPM Packages</h3>
        <Badge variant="secondary" className="text-xs font-mono">@cmpsbl</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {NPM_PACKAGES.map((pkg) => (
          <div
            key={pkg.name}
            className="group relative flex flex-col gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <code className="text-sm font-mono font-semibold text-foreground">{pkg.name}</code>
              <Badge variant="outline" className={cn("text-[10px] shrink-0", TIER_COLORS[pkg.tier])}>
                {pkg.tier}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{pkg.desc}</p>
            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border/40">
              <code className="text-[11px] font-mono text-muted-foreground flex-1 truncate">
                npm i {pkg.name}
              </code>
              <CopyButton text={`npm i ${pkg.name}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const HIGHLIGHTS = [
  { icon: Zap, title: "Intent Routing", desc: "DAG-based sequencing across all 40 primitives" },
  { icon: Layers, title: "Matrix Telemetry", desc: "Real-time primitive health and communication" },
  { icon: Shield, title: "Convex Core™", desc: "Sealed artifact with proprietary logic protection" },
  { icon: Code, title: "24 Languages", desc: "Polyglot bridges from TypeScript to any runtime" },
];

/** Compact CTA version — used on homepage */
export function NpmPackagesCTA() {
  return (
    <section className="relative z-10 px-3 sm:px-4 py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--neon-purple)/0.02)] to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative">
        <motion.div 
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--neon-cyan)/0.1)] border border-[hsl(var(--neon-cyan)/0.2)] text-xs font-bold text-[hsl(var(--neon-cyan))] mb-5 tracking-wide uppercase">
            <Package className="w-3.5 h-3.5" />
            Now on NPM
          </div>
          <h2 className="text-3xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground mb-4">
            Build What
            <br />
            <span className="text-[hsl(var(--neon-purple))]">Evolves</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
            Install the{" "}
            <code className="text-[hsl(var(--neon-cyan))] font-mono text-sm bg-[hsl(var(--neon-cyan)/0.05)] px-1.5 py-0.5 rounded">@cmpsbl/cli</code>{" "}
            to scaffold projects and run Ascension from your terminal. Pair&nbsp;it with the{" "}
            <code className="text-[hsl(var(--neon-cyan))] font-mono text-sm bg-[hsl(var(--neon-cyan)/0.05)] px-1.5 py-0.5 rounded">@cmpsbl/sdk</code>{" "}
            to embed persistent memory, cognitive scoring, and governed orchestration into any&nbsp;project.
          </p>
        </motion.div>

        <motion.div 
          className="relative max-w-2xl mx-auto mb-10 sm:mb-14"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 bg-card border-2 border-[hsl(var(--neon-purple)/0.2)] rounded-2xl px-5 py-4 font-mono text-sm shadow-lg shadow-[hsl(var(--neon-purple)/0.05)]">
            <Terminal className="w-5 h-5 text-[hsl(var(--neon-purple))] shrink-0" />
            <code className="text-foreground flex-1 text-xs sm:text-sm">npm i -g @cmpsbl/cli @cmpsbl/sdk</code>
            <CopyButton text="npm i -g @cmpsbl/cli @cmpsbl/sdk" />
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {/* CLI Card */}
          <a 
            href="https://www.npmjs.com/package/@cmpsbl/cli" 
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-[hsl(var(--neon-cyan)/0.25)] bg-[hsl(var(--neon-cyan)/0.04)] hover:border-[hsl(var(--neon-cyan)/0.5)] hover:bg-[hsl(var(--neon-cyan)/0.08)] transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-[hsl(var(--neon-cyan)/0.05)]"
          >
            <Terminal className="w-8 h-8 text-[hsl(var(--neon-cyan))]" />
            <code className="text-base font-mono font-bold text-foreground">@cmpsbl/cli</code>
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Scaffold projects, run Ascension, and validate manifests — all from your terminal.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--neon-cyan))] group-hover:gap-2.5 transition-all">
              View on NPM <ArrowRight className="w-4 h-4" />
            </span>
          </a>

          {/* SDK Card */}
          <a 
            href="https://www.npmjs.com/package/@cmpsbl/sdk" 
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-[hsl(var(--neon-purple)/0.25)] bg-[hsl(var(--neon-purple)/0.04)] hover:border-[hsl(var(--neon-purple)/0.5)] hover:bg-[hsl(var(--neon-purple)/0.08)] transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-[hsl(var(--neon-purple)/0.05)]"
          >
            <Code className="w-8 h-8 text-[hsl(var(--neon-purple))]" />
            <code className="text-base font-mono font-bold text-foreground">@cmpsbl/sdk</code>
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Embed persistent memory, cognitive scoring, and governed orchestration into any&nbsp;project.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--neon-purple))] group-hover:gap-2.5 transition-all">
              View on NPM <ArrowRight className="w-4 h-4" />
            </span>
          </a>
        </motion.div>

        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Button asChild size="lg" variant="outline" className="font-semibold text-foreground border-border hover:text-primary">
            <a href="https://www.npmjs.com/org/cmpsbl" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All Packages on NPM
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
