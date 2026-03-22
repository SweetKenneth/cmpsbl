/**
 * GovernanceSignal — Subtle technical credibility section
 * Uses solid neon colors, no unnecessary gradients
 */

import { motion } from "framer-motion";
import { Terminal, Shield, AlertTriangle, Eye, Hammer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const signals = [
  {
    icon: Terminal,
    label: "Namespaced Commands",
    description: "Every operation lives in a governed namespace — brain.recall, dream.cycle, defense.scan. No ambiguity, full auditability.",
    code: "brain.recall({ depth: 3, tier: 'warm' })",
    color: "text-[hsl(var(--neon-cyan))]",
    iconBg: "bg-[hsl(var(--neon-cyan)/0.08)]",
  },
  {
    icon: Shield,
    label: "Guardrails",
    description: "Capability invocation passes through governance checks before execution. Budget, safety, and scope constraints enforced at the runtime level.",
    code: "defense.check({ scope: 'write', budget: 50 })",
    color: "text-[hsl(var(--neon-purple))]",
    iconBg: "bg-[hsl(var(--neon-purple)/0.08)]",
  },
  {
    icon: AlertTriangle,
    label: "Failure Discipline",
    description: "Every capability declares failure modes upfront. Timeouts, fallbacks, and escalation paths are first-class constructs — not afterthoughts.",
    code: "nexus.route({ fallback: 'anthropic', timeout: 3000 })",
    color: "text-[hsl(var(--neon-magenta))]",
    iconBg: "bg-[hsl(var(--neon-magenta)/0.08)]",
  },
  {
    icon: Eye,
    label: "Diligence Harness",
    description: "Full observability across every invocation — including cost tracking, latency monitoring, and confidence scoring.",
    code: "vision.trace({ cost: true, latency: true })",
    color: "text-[hsl(var(--neon-cyan))]",
    iconBg: "bg-[hsl(var(--neon-cyan)/0.08)]",
  },
];

export function GovernanceSignal() {
  return (
    <section className="relative z-10 py-16 sm:py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border/30 bg-[hsl(var(--stream-slate))] backdrop-blur-sm overflow-hidden shadow-lg shadow-[hsl(var(--neon-cyan)/0.03)] shimmer-on-hover glass-edge"
        >
          {/* Top bar — memory-stream accent (allowed gradient) */}
          <div className="h-[2px] memory-stream-bar opacity-30" />

          <div className="p-6 sm:p-10">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <span className="section-ordinal absolute -top-10 left-1/2 -translate-x-1/2 hidden sm:block" aria-hidden="true">05</span>
              </div>
              <Badge variant="outline" className="mb-4 gap-1.5 border-[hsl(var(--neon-cyan)/0.3)] px-4 py-1.5">
                <Hammer className="w-3 h-3 text-[hsl(var(--neon-cyan))]" />
                <span className="text-xs font-semibold">Governance Layer</span>
              </Badge>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
                Every Operation Is{" "}
                <span className="text-[hsl(var(--neon-cyan))]">Governed</span>
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {signals.map((signal, idx) => (
                <motion.div
                  key={signal.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="space-y-3 p-4 sm:p-5 rounded-xl border border-border/20 bg-card/30 hover:border-[hsl(var(--neon-cyan)/0.2)] transition-all duration-300 group/signal card-lift"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300", signal.iconBg)}>
                      <signal.icon className={cn("w-4 h-4 transition-colors duration-300", signal.color)} />
                    </div>
                    <span className="text-sm font-bold text-foreground">{signal.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {signal.description}
                  </p>
                  <div className="relative rounded-lg overflow-hidden">
                    <code className="block text-[11px] font-mono text-[hsl(var(--neon-cyan))] bg-[#0d1117] dark:bg-[#0d1117] rounded-lg px-3 py-3 border border-white/[0.06] shadow-inner shadow-black/20 hover:border-[hsl(var(--neon-cyan)/0.2)] code-glow transition-all duration-300">
                      <span className="text-[hsl(var(--neon-cyan)/0.4)] text-[9px] mr-1">›</span>{signal.code}
                    </code>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
