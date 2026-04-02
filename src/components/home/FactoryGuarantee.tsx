/**
 * FactoryGuarantee — The CMPSBL promise
 * Three-day evaluation. No lock-in. Black-box protected.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Lock, Sparkles } from "lucide-react";

const GUARANTEES = [
  {
    icon: Clock,
    title: "3-Day Evaluation Period",
    description: "Hot-swap architecture. Zero-friction trial. If you don't like it, swap it out.",
  },
  {
    icon: Lock,
    title: "No Lock-In. Ever.",
    description: "Sealed Mini-Runtime. Runs indefinitely. No subscription required to keep running.",
  },
  {
    icon: Shield,
    title: "Black-Box Protected",
    description: "Your IP stays yours. CJPI weights are hex-encoded. Internal comments stripped. Tamper-evident.",
  },
] as const;

export function FactoryGuarantee() {
  return (
    <section className="relative z-10 px-3 sm:px-4 py-14 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[200px]" />
      </div>
      <div className="max-w-5xl mx-auto relative">
        <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/15">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-magenta))]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />

          <div className="relative p-6 sm:p-14 md:p-20">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-6">
                <Shield className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white/90">The CMPSBL Guarantee</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-[1.05] tracking-tight">
                No AI Tricks. No Liability Transfer.
                <br className="hidden sm:block" />
                <span className="text-white/80">Just Certified Builds.</span>
              </h2>
              <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                The only updates we offer are upgrades — and they're optional. No emergency patches because someone jailbroke your billing bot at 2am.
              </p>
            </div>

            {/* Guarantee cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {GUARANTEES.map((g) => (
                <div key={g.title} className="text-center p-5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm">
                  <g.icon className="w-6 h-6 text-white/80 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-white mb-1">{g.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{g.description}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button asChild size="lg" className="relative px-8 sm:px-10 h-12 sm:h-16 text-sm sm:text-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold shadow-2xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl">
                <Link to="/ascension">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Submit Your Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" className="px-6 sm:px-8 h-12 sm:h-16 text-sm sm:text-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold backdrop-blur-sm rounded-xl">
                <Link to="/memory-stream">
                  Browse the Catalog
                </Link>
              </Button>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}
