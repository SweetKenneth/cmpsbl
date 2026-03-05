/**
 * GovernanceSignal — Subtle technical credibility section
 * Communicates namespaced commands, guardrails, failure discipline, diligence harness.
 */

import { motion } from "framer-motion";
import { Terminal, Shield, AlertTriangle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const signals = [
  {
    icon: Terminal,
    label: "Namespaced Commands",
    description: "Every operation lives in a governed namespace — brain.recall, dream.cycle, defense.scan. No ambiguity, full auditability.",
    code: "brain.recall({ depth: 3, tier: 'warm' })",
  },
  {
    icon: Shield,
    label: "Guardrails",
    description: "Capability invocation passes through governance checks before execution. Budget, safety, and scope constraints enforced at the runtime level.",
    code: "defense.check({ scope: 'write', budget: 50 })",
  },
  {
    icon: AlertTriangle,
    label: "Failure Discipline",
    description: "Every capability declares failure modes upfront. Timeouts, fallbacks, and escalation paths are first-class constructs — not afterthoughts.",
    code: "nexus.route({ fallback: 'anthropic', timeout: 3000 })",
  },
  {
    icon: Eye,
    label: "Diligence Harness",
    description: "Full observability across every invocation. Cost tracking, latency monitoring, and confidence scoring on every operation.",
    code: "vision.trace({ cost: true, latency: true })",
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
          className="rounded-2xl border border-border/30 bg-gradient-to-br from-card/40 via-card/30 to-card/40 backdrop-blur-sm overflow-hidden shadow-lg shadow-primary/[0.03] shimmer-on-hover glass-edge"
        >
          {/* Top bar — memory-stream accent */}
          <div className="h-[2px] memory-stream-bar opacity-30" />
          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="p-6 sm:p-10">
            <div className="text-center mb-8">
              <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-[0.2em] mb-2">
                Substrate Governance · Signal → Silicon
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Every operation is governed, observable, and failure-aware
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
                  className="space-y-3 p-4 sm:p-5 rounded-xl border border-transparent hover:border-border/20 hover:bg-primary/[0.03] hover:-translate-y-0.5 transition-all duration-300 group/signal"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center group-hover/signal:bg-primary/15 transition-colors duration-300">
                      <signal.icon className="w-4 h-4 text-primary/70 group-hover/signal:text-primary transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-bold text-foreground">{signal.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {signal.description}
                  </p>
                  <div className="relative rounded-lg overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
                    <code className="block text-[11px] font-mono text-primary bg-[#0d1117] dark:bg-[#0d1117] rounded-lg px-3 py-3 border border-white/[0.06] shadow-inner shadow-black/20 hover:border-primary/20 code-glow transition-all duration-300">
                      <span className="text-primary/40 text-[9px] mr-1">›</span>{signal.code}
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
