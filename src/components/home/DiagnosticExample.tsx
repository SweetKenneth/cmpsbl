/**
 * DiagnosticExample — Shows example diagnostic output + before/after comparison
 * Builds trust by making the value concrete before asking users to commit.
 */

import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, ArrowRight, Clock } from "lucide-react";

const EXAMPLE_OUTPUT = [
  { text: "3 vulnerabilities identified and patched", type: "fix" as const },
  { text: "Authentication layer hardened (token validation and session controls)", type: "fix" as const },
  { text: "Rate limiting and abuse protection added", type: "fix" as const },
  { text: "2 new capability modules unlocked", type: "unlock" as const },
  { text: "Full test harness generated for validation", type: "unlock" as const },
];

const BEFORE = [
  "Legacy Node API",
  "Weak authentication",
  "No rate limiting",
];

const AFTER = [
  "Hardened authentication system",
  "Rate limiting and abuse protection implemented",
  "New capability modules added",
  "Full documentation and test harness included",
];

export function DiagnosticExample() {
  return (
    <section className="relative z-10 px-4 sm:px-6 py-14 sm:py-20 lab-section-glow">
      <div className="max-w-4xl mx-auto">
        {/* Timing callout */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground/50 font-medium tracking-wide">
            ~60 seconds to scan · Minutes to restore · No setup required
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Example Output */}
          <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 sm:p-6 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--neon-cyan))] lab-status-blink" />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">Example Output</span>
            </div>
            <div className="space-y-2.5">
              {EXAMPLE_OUTPUT.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 animate-fade-in"
                  style={{ animationDelay: `${0.2 + idx * 0.08}s`, animationFillMode: "both" }}
                >
                  <CheckCircle2
                    className={cn(
                      "w-3.5 h-3.5 mt-0.5 shrink-0",
                      item.type === "fix" ? "text-[hsl(var(--neon-cyan))]" : "text-[hsl(var(--neon-magenta))]"
                    )}
                  />
                  <span className="text-xs sm:text-sm text-foreground/80 leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Before / After */}
          <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 sm:p-6 animate-fade-in" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
            <div className="space-y-5">
              {/* Before */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive/60" />
                  <span className="text-xs font-mono uppercase tracking-widest text-destructive/50">Before</span>
                </div>
                <div className="space-y-1.5 pl-1">
                  {BEFORE.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-destructive/40 shrink-0" />
                      <span className="text-xs text-muted-foreground/60 line-through decoration-destructive/30">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-2 px-2">
                <div className="flex-1 h-px bg-gradient-to-r from-destructive/20 via-border/30 to-[hsl(var(--neon-cyan)/0.3)]" />
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                <div className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--neon-cyan)/0.3)] to-transparent" />
              </div>

              {/* After */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--neon-cyan))]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--neon-cyan)/0.6)]">After</span>
                </div>
                <div className="space-y-1.5 pl-1">
                  {AFTER.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[hsl(var(--neon-cyan))] shrink-0" />
                      <span className="text-xs sm:text-sm text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
