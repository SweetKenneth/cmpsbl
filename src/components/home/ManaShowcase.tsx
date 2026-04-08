/**
 * ManaShowcase — Software Symbiosis / Layer 2 showcase for the homepage
 */

import { Link } from "react-router-dom";
import { ArrowRight, Layers, ShieldCheck, Zap, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const CAPABILITIES = [
  {
    icon: Layers,
    title: "Silent Attachment",
    desc: "Layer 2 wraps any codebase without modifying a single byte of the original source.",
  },
  {
    icon: ShieldCheck,
    title: "SHA-256 Proof",
    desc: "Cryptographic verification that host code is bit-identical before and after attachment.",
  },
  {
    icon: Lock,
    title: "Lex Governance",
    desc: "Every attachment is governed by Lex — the layer's conscience. No rogue operations.",
  },
  {
    icon: Eye,
    title: "Zero Permission",
    desc: "No API keys, no developer permission, no source modification required.",
  },
];

export function ManaShowcase() {
  return (
    <section className="relative z-10 px-4 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Zap className="w-3.5 h-3.5" />
            Patented Technology
          </div>
          <h2 className="text-3xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3">
            The Universal Software
            <br />
            <span className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-purple))] bg-clip-text text-transparent">
              Adhesion&nbsp;Layer
            </span>
          </h2>
           <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
             Mana attaches capabilities to any software — payments, security, telemetry, governance — without the developer ever knowing. The host stays pristine.
           </p>
        </div>

        {/* Capability grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <cap.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                   <p className="text-sm font-bold text-foreground mb-1">{cap.title}</p>
                   <p className="text-xs text-muted-foreground leading-relaxed font-medium">{cap.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visual proof teaser */}
        <div className="rounded-xl border border-border bg-card/30 backdrop-blur-sm p-5 sm:p-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--neon-cyan)/0.1)] border border-[hsl(var(--neon-cyan)/0.2)] text-[hsl(var(--neon-cyan))] text-[10px] font-bold uppercase tracking-wider mb-4">
            Live Proof Available
          </div>
           <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 font-medium">
             We silently attached Layer 2 to{" "}
             <span className="text-foreground font-bold">lodash</span> — injecting DEFENSE gates, Shadow Rules, and governance hooks. The original source hash matches&nbsp;byte-for-byte.
           </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/mana">
                See Mana in Action <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/software-symbiosis">
                Read the Vision <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
