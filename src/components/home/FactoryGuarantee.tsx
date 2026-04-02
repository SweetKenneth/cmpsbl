/**
 * FactoryGuarantee — The CMPSBL promise
 * Three-day evaluation. No lock-in. Black-box protected.
 * Premium gradient card with breathing glow and glass treatment.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Lock, Wrench } from "lucide-react";

const GUARANTEES = [
  {
    icon: Clock,
    title: "3-Day Evaluation",
    description: "Hot-swap architecture. Zero-friction trial. Don't like it? Swap it out.",
  },
  {
    icon: Lock,
    title: "No Lock-In. Ever.",
    description: "Sealed runtime. Runs indefinitely. No subscription to keep it running.",
  },
  {
    icon: Shield,
    title: "IP Protected",
    description: "CJPI weights hex-encoded. Internal comments stripped. Tamper-evident.",
  },
] as const;

export function FactoryGuarantee() {
  return (
    <section className="relative z-10 px-4 sm:px-6 py-14 sm:py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[150px]" style={{ background: "hsl(var(--primary) / 0.08)" }} />
      </div>
      <div className="max-w-4xl mx-auto relative">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/15 lab-breathe">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-magenta))]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

          {/* Animated border shimmer */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute -inset-[1px] rounded-2xl lab-shimmer" style={{ background: "linear-gradient(135deg, transparent 40%, hsl(0 0% 100% / 0.1) 50%, transparent 60%)" }} />
          </div>

          <div className="relative p-6 sm:p-10 md:p-14">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-5">
                <Shield className="w-3.5 h-3.5 text-white" />
                <span className="text-xs sm:text-sm font-semibold text-white/90">The CMPSBL Guarantee</span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 leading-tight tracking-tight">
                AI as a Tool.
                <br />
                <span className="text-white/80">Not as a Foundation.</span>
              </h2>
              <p className="text-white/60 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Your code stays your code. We restore first, replace only as a last resort.
              </p>
            </div>

            {/* Guarantee cards */}
            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {GUARANTEES.map((g, idx) => (
                <div
                  key={g.title}
                  className="group text-center p-4 sm:p-5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm hover:bg-white/15 hover:border-white/20 transition-all duration-300 animate-fade-in opacity-0"
                  style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: "both" }}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <g.icon className="w-5 h-5 text-white/80" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-1">{g.title}</h3>
                  <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">{g.description}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto px-8 h-12 text-sm bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold shadow-2xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl">
                <Link to="/ascension">
                  <Wrench className="w-4 h-4 mr-2" />
                  Run Diagnostic
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" className="w-full sm:w-auto px-6 h-12 text-sm border border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold backdrop-blur-sm rounded-xl transition-all duration-300">
                <Link to="/showroom">
                  Browse the Showroom
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
