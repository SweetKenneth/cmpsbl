/**
 * SubstrateAliveSection — Zero-setup value proposition
 * Communicates that the substrate is already alive: loadouts, engines,
 * agents — everything works immediately upon activation.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Key,
  Boxes,
  Cpu,
  Bot,
  CheckCircle2,
} from "lucide-react";

const PILLARS = [
  {
    icon: Boxes,
    title: "Select a Loadout",
    description: "Pick a pre-built project from Signal Forge. It deploys live — identity, memory, defense, and governance already wired.",
    terminal: "cmpsbl loadout build research-agent",
  },
  {
    icon: Cpu,
    title: "Activate an Engine",
    description: "Choose an engine and it's running in your terminal. No configuration, no setup scripts, no boilerplate.",
    terminal: "cmpsbl engine activate CORTEX",
  },
  {
    icon: Bot,
    title: "Add an Agent",
    description: "Select an agent and it's awaiting your command — complete with every feature the substrate offers.",
    terminal: "cmpsbl agent deploy WRAITH",
  },
] as const;

export function SubstrateAliveSection() {
  return (
    <section className="relative z-10 px-3 sm:px-4 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary/80 tracking-wide uppercase">
              Already Running
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight mb-5 leading-[1.15]">
            The Substrate Is Already Alive
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed mb-3">
            Most platforms make you piece things together — install libraries, scaffold projects,
            wire authentication, configure monitoring, set up memory.{" "}
            <span className="text-foreground/90 font-medium">Here, all of that is already done.</span>
          </p>

          <p className="text-sm sm:text-base text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Create an account, grab your API key, and the rest is automatic.
            Stop spending time assembling infrastructure.{" "}
            <span className="text-foreground/90 font-medium">
              Spend it customizing what's already working.
            </span>
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative rounded-xl border border-border/20 bg-card/20 p-5 sm:p-6 hover:border-primary/25 hover:bg-card/40 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg border border-border/20 bg-card/40 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors">
                  <Icon className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                </div>

                <h3 className="text-base font-bold text-foreground/90 mb-2">
                  {pillar.title}
                </h3>

                <p className="text-sm text-muted-foreground/60 leading-relaxed mb-4">
                  {pillar.description}
                </p>

                <div className="font-mono text-xs text-primary/50 bg-primary/5 rounded-lg px-3 py-2 border border-primary/10 group-hover:text-primary/70 group-hover:border-primary/20 transition-colors">
                  <span className="text-muted-foreground/30 mr-1">$</span>
                  {pillar.terminal}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom callout */}
        <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-transparent to-[hsl(var(--neon-cyan)/0.05)] p-5 sm:p-7 text-center mb-6">
          <p className="text-base sm:text-lg font-semibold text-foreground/80 mb-2">
            You can build here faster than anywhere else.
          </p>
          <p className="text-sm text-muted-foreground/60 max-w-xl mx-auto">
            Every loadout, engine, and agent ships with persistent memory, governed execution,
            self-healing, and continuous learning — already running the moment you activate it.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="gap-2 rounded-xl text-sm font-bold">
            <Link to="/auth">
              <Key className="w-4 h-4" />
              Create Account & Get API Key
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl text-sm">
            <Link to="/foundry">
              Browse Signal Forge
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
