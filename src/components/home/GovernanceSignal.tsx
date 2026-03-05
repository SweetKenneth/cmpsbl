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
          className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden"
        >
          {/* Top bar */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="p-6 sm:p-10">
            <div className="text-center mb-8">
              <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-[0.2em] mb-2">
                Stream Governance · Signal → Silicon
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Every operation is governed, observable, and failure-aware
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {signals.map((signal, idx) => (
                <motion.div
                  key={signal.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="space-y-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <signal.icon className="w-4 h-4 text-primary/70" />
                    <span className="text-sm font-semibold text-foreground">{signal.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {signal.description}
                  </p>
                  <code className="block text-[11px] font-mono text-primary bg-[#0d1117] dark:bg-[#0d1117] rounded-lg px-3 py-2.5 border border-white/5 shadow-inner">
                    {signal.code}
                  </code>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
