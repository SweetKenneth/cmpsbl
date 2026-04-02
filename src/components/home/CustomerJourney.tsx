/**
 * CustomerJourney — The 8-step factory experience
 * Bring Us Your Tech → Keep It Forever
 */

import { cn } from "@/lib/utils";

const STEPS = [
  {
    number: "01",
    title: "Bring Us Your Tech",
    description: "Upload any code, any language, any framework.",
    accent: "--neon-cyan",
  },
  {
    number: "02",
    title: "The Diagnostic",
    description: "ENCODE + ORACLE + ENGINEER scan. DECODE explains the truth.",
    accent: "--neon-cyan",
  },
  {
    number: "03",
    title: "Choose Your Primitives",
    description: "Scan team recommends up to 20. You select.",
    accent: "--primary",
  },
  {
    number: "04",
    title: "The Restoration",
    description: "Ascension runs selected primitives. Queue if at capacity.",
    accent: "--primary",
  },
  {
    number: "05",
    title: "DECODE Debrief",
    description: "Every change, every new capability, every variant — explained.",
    accent: "--neon-magenta",
  },
  {
    number: "06",
    title: "The Documentation",
    description: "Full restoration report + test harness config + CJPI certificate.",
    accent: "--neon-magenta",
  },
  {
    number: "07",
    title: "Three-Day Test Drive",
    description: "Hot-swap architecture. Zero-friction trial. Infrastructure, not policy.",
    accent: "--neon-purple",
  },
  {
    number: "08",
    title: "Keep It Forever",
    description: "Sealed Mini-Runtime. Runs indefinitely. No lock-in. Ever.",
    accent: "--neon-purple",
  },
] as const;

export function CustomerJourney() {
  return (
    <section className="relative z-10 px-3 sm:px-6 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground mb-3">
            From Upload to Ownership
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Eight steps. No surprises. No lock-in. Your code, restored and returned.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              className="group relative rounded-xl border border-border/40 bg-card/20 p-5 hover:border-primary/30 transition-all duration-300 animate-fade-in opacity-0"
              style={{ animationDelay: `${idx * 0.06}s`, animationFillMode: "both" }}
            >
              {/* Step number */}
              <div
                className="text-3xl font-black mb-3 opacity-20"
                style={{ color: `hsl(var(${step.accent}))` }}
              >
                {step.number}
              </div>

              <h3 className="text-sm font-bold text-foreground mb-1.5">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-border/50" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
