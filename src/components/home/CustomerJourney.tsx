/**
 * CustomerJourney — The refurbishment experience in 6 clear steps
 */

import { cn } from "@/lib/utils";
import {
  Upload, Search, Cpu, MessageSquare, TestTube2, ShieldCheck,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Run Diagnostic",
    description: "Upload your code. We scan for vulnerabilities, capabilities, and potential.",
    accent: "--neon-cyan",
    icon: Upload,
  },
  {
    number: "02",
    title: "Review Findings",
    description: "DECODE explains what we found and recommends a restoration plan.",
    accent: "--neon-cyan",
    icon: Search,
  },
  {
    number: "03",
    title: "Refurbish",
    description: "Ascension runs up to 20 primitives against your code. Classic tactics, zero AI in output.",
    accent: "--neon-magenta",
    icon: Cpu,
  },
  {
    number: "04",
    title: "Debrief",
    description: "Every change, every new capability, every variant — explained interactively by DECODE.",
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
    <section className="relative z-10 px-4 sm:px-6 py-14 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2">
            From Upload to Ownership
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Six steps. No surprises. No lock-in. Your code, refurbished and returned.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative rounded-xl border border-border/40 bg-card/20 p-4 sm:p-5 hover:border-primary/30 transition-all duration-300 animate-fade-in opacity-0"
                style={{ animationDelay: `${idx * 0.06}s`, animationFillMode: "both" }}
              >
                {/* Icon + step number */}
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center border border-border/20 shrink-0"
                    style={{ background: `hsl(var(${step.accent}) / 0.08)` }}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: `hsl(var(${step.accent}))` }} />
                  </div>
                  <span
                    className="text-lg sm:text-xl font-black opacity-20"
                    style={{ color: `hsl(var(${step.accent}))` }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground/70 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
