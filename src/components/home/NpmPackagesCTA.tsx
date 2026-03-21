/**
 * NpmPackagesCTA — Showcase the @cmpsbl NPM ecosystem
 * Used on homepage and developer pages
 */

import { Link } from "react-router-dom";
import { Package, Terminal, ArrowRight, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";

const NPM_PACKAGES = [
  { name: "@cmpsbl/types", desc: "Shared TypeScript schemas — CJPI, manifests, resolvers, mesh events", tier: "Foundation" },
  { name: "@cmpsbl/runtime", desc: "Mini-Runtime™ — CJPI scoring, tiering, pipeline orchestration", tier: "Foundation" },
  { name: "@cmpsbl/failsafe", desc: "Zero-dep migration engine for platform portability", tier: "Foundation" },
  { name: "@cmpsbl/intent", desc: "Intent router — broadcast + resolver dispatch for any app", tier: "Core" },
  { name: "@cmpsbl/mesh", desc: "Mesh telemetry — emit and subscribe to node communication events", tier: "Core" },
  { name: "@cmpsbl/bridge", desc: "Bridge adapter — wire Python, Go, Rust runtimes to the substrate", tier: "Core" },
  { name: "@cmpsbl/sdk", desc: "Engine SDK — authenticated access to hosted CMPSBL engines", tier: "Developer" },
  { name: "@cmpsbl/discovery", desc: "Pipeline discovery — score, crystallize, and manage capabilities", tier: "Developer" },
  { name: "@cmpsbl/cli", desc: "CLI tools — init, score, export, validate-manifest commands", tier: "Developer" },
  { name: "@cmpsbl/react", desc: "React hooks — useIntent, useMesh, useRuntime, useCJPI", tier: "Ecosystem" },
  { name: "@cmpsbl/test-harness", desc: "Test utilities for validating pipelines and bridge adapters", tier: "Ecosystem" },
] as const;

const TIER_COLORS: Record<string, string> = {
  Foundation: "bg-primary/10 text-primary border-primary/20",
  Core: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  Developer: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Ecosystem: "bg-amber-500/10 text-amber-500 border-amber-500/20",
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
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
    </button>
  );
}

/** Full version — used on DevTools and Developer pages */
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
              <Badge variant="outline" className={`text-[10px] shrink-0 ${TIER_COLORS[pkg.tier]}`}>
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

/** Compact CTA version — used on homepage */
export function NpmPackagesCTA() {
  const featured = NPM_PACKAGES.slice(0, 6);
  return (
    <section className="relative z-10 px-3 sm:px-4 py-12 sm:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Terminal className="w-3.5 h-3.5" />
            Open Source SDK
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground mb-3">
            npm install <span className="text-primary">@cmpsbl</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            11 modular packages — plug substrate capabilities into any JavaScript or TypeScript project.
          </p>
        </div>

        {/* Quick install hero */}
        <div className="relative max-w-lg mx-auto mb-8 sm:mb-12">
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 font-mono text-sm shadow-lg">
            <Terminal className="w-4 h-4 text-primary shrink-0" />
            <code className="text-foreground flex-1">npm i @cmpsbl/runtime @cmpsbl/intent @cmpsbl/react</code>
            <CopyButton text="npm i @cmpsbl/runtime @cmpsbl/intent @cmpsbl/react" />
          </div>
        </div>

        {/* Featured packages grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8 sm:mb-10">
          {featured.map((pkg) => (
            <div
              key={pkg.name}
              className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300"
            >
              <Package className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <code className="text-xs font-mono font-semibold text-foreground">{pkg.name}</code>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{pkg.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="font-semibold">
            <Link to="/dev-tools">
              <Package className="w-4 h-4 mr-2" />
              View All 11 Packages
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-semibold">
            <a href="https://www.npmjs.com/org/cmpsbl" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on NPM
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
