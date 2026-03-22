/**
 * HowCmpsblWorks — Quick mental model for developers and investors
 * Shows the CMPSBL stack vs traditional AI stack
 */

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const traditionalStack = ["Models", "Applications"];
const cmpsblStack = ["Models", "CMPSBL AI Platform", "Applications"];

const explanations = [
  { label: "Modules", desc: "handle specialized tasks" },
  { label: "Memories", desc: "capture proven solutions" },
  { label: "Persistent Memory", desc: "remembers across sessions" },
  { label: "Self-Improvement", desc: "gets smarter over time" },
];

export function HowCmpsblWorks() {
  return (
    <section className="relative z-10 py-12 sm:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-6 sm:p-10 overflow-hidden"
        >
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5 border-[hsl(var(--neon-cyan)/0.3)]">
              <Lightbulb className="w-3 h-3 text-[hsl(var(--neon-cyan))]" />
              <span className="text-xs font-semibold">Quick Mental Model</span>
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              How{" "}
              <span className="clockless-river-text" style={{ WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                CMPSBL
              </span>{" "}
              Works
            </h2>
          </div>

          {/* Stack comparison */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {/* Traditional */}
            <div className="rounded-xl border border-border/20 bg-muted/30 p-5">
              <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-3">Traditional AI Stack</div>
              <div className="flex items-center justify-center gap-2">
                {traditionalStack.map((item, i) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="px-3 py-2 rounded-lg border border-border/30 bg-card/50 text-xs font-semibold text-muted-foreground">{item}</div>
                    {i < traditionalStack.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/40" />}
                  </div>
                ))}
              </div>
            </div>

            {/* CMPSBL */}
            <div className="rounded-xl border border-[hsl(var(--neon-cyan)/0.2)] bg-[hsl(var(--neon-cyan)/0.05)] p-5">
              <div className="text-[10px] font-bold text-[hsl(var(--neon-cyan))] uppercase tracking-[0.2em] mb-3">CMPSBL Stack</div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {cmpsblStack.map((item, i) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className={cn(
                      "px-3 py-2 rounded-lg border text-xs font-semibold",
                      item.includes("CMPSBL")
                        ? "border-[hsl(var(--neon-purple)/0.4)] bg-[hsl(var(--neon-purple)/0.1)] text-[hsl(var(--neon-purple))] font-bold"
                        : "border-border/30 bg-card/50 text-foreground/70"
                    )}>{item}</div>
                    {i < cmpsblStack.length - 1 && <ArrowRight className="w-3 h-3 text-[hsl(var(--neon-purple)/0.5)]" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What the OS manages */}
          <div className="text-center mb-4">
            <p className="text-base sm:text-lg text-muted-foreground">
              The platform coordinates intelligence across your application:
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {explanations.map((item) => (
              <div key={item.label} className="text-center p-3 rounded-lg border border-[hsl(var(--neon-purple)/0.15)] bg-[hsl(var(--neon-purple)/0.03)] hover:border-[hsl(var(--neon-purple)/0.3)] hover:bg-[hsl(var(--neon-purple)/0.05)] transition-all duration-300 card-lift">
                <span className="text-xs font-bold text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground"> {item.desc}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground/60 text-center mt-6">
            CMPSBL manages memory, orchestration, governance, and continuous improvement automatically.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
