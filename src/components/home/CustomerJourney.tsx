/**
 * CustomerJourney — The ascension experience in 6 clear steps
 * Timeline-style with connecting lines and staggered entrance
 */

import { cn } from "@/lib/utils";
import {
  Upload, Search, Cpu, MessageSquare, TestTube2, ShieldCheck,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Scan",
    description: "Find vulnerabilities, missing capabilities, and structural limits.",
    accent: "--neon-cyan",
    icon: Upload,
  },
  {
    number: "02",
    title: "Diagnose",
    description: "Explain what's wrong and what's possible.",
    accent: "--neon-cyan",
    icon: Search,
  },
  {
    number: "03",
    title: "Ascend",
    description: "Apply up to 20 primitives to upgrade the system.",
    accent: "--neon-magenta",
    icon: Cpu,
  },
  {
    number: "04",
    title: "Deliver",
    description: "Return upgraded code with documentation and test harness.",
    accent: "--neon-magenta",
    icon: MessageSquare,
  },
  {
    number: "05",
    title: "3-Day Evaluation",
    description: "Hot-swap architecture. Zero-friction trial. Try before you commit.",
    accent: "--neon-purple",
    icon: TestTube2,
  },
  {
    number: "06",
    title: "Keep It Forever",
    description: "Sealed runtime. No subscription. No lock-in. Runs indefinitely.",
    accent: "--neon-purple",
    icon: ShieldCheck,
  },
] as const;

export function CustomerJourney() {
  return (
    <section className="relative z-10 px-4 sm:px-6 py-14 sm:py-20 lab-section-glow">
      {/* Scan line — diagnostic feel */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-x-0 h-px lab-scan-line" style={{ animationDuration: "12s" }} />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green lab-status-blink" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50">Active Pipeline</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2">
            From Upload to Ownership
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Six steps. No surprises. No lock-in. Your code, ascended and&nbsp;returned.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative rounded-xl border border-border/40 bg-card/20 p-4 sm:p-5 hover:border-primary/30 transition-all duration-300 animate-fade-in lab-card-glow"
                style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: "both" }}
              >
                {/* Connecting dot on right edge — desktop */}
                {idx < STEPS.length - 1 && idx !== 2 && (
                  <>
                    <div className="hidden lg:block absolute -right-[5px] top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full border border-border/40 bg-background z-10" />
                    <div className="hidden lg:block absolute -right-4 top-1/2 w-4 h-px bg-gradient-to-r from-border/50 to-border/20" />
                  </>
                )}

                {/* Icon + step number */}
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center border border-border/20 shrink-0 relative group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `hsl(var(${step.accent}) / 0.08)` }}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: `hsl(var(${step.accent}))` }} />
                    <div
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ boxShadow: `0 0 12px hsl(var(${step.accent}) / 0.2)` }}
                    />
                  </div>
                  <span
                    className="text-lg sm:text-xl font-black opacity-15 font-mono group-hover:opacity-30 transition-opacity duration-300"
                    style={{ color: `hsl(var(${step.accent}))` }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground/70 leading-relaxed">{step.description}</p>

                {/* Bottom accent line — appears on hover */}
                <div
                  className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, hsl(var(${step.accent}) / 0.3), transparent)` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
