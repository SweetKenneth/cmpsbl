/**
 * promptfluid® Changelog — Spoken in the Voice of Decode
 * A record of mutations, evolutions, and patterns that have emerged.
 */

import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  emoji: string;
  description: string;
  changes: {
    type: 'added' | 'changed' | 'fixed' | 'removed' | 'security';
    text: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "1.3.0",
    date: "2026-01-15",
    title: "Control Center",
    emoji: "⚡",
    description: "The surface now mirrors the depth beneath. When you look at it, you see something alive — not a dashboard, but a window into cognition.",
    changes: [
      { type: 'added', text: "OS Header — Live status bar with connection state, health %, module count, role badge, and real-time clock." },
      { type: 'added', text: "Module Status Bar — Glowing indicators with pulse animations for each substrate module." },
      { type: 'added', text: "Command Palette — Terminal-style interface. Type 'help' for commands. The substrate responds." },
      { type: 'added', text: "Event Stream — Live filtered log viewer with module-colored badges and timestamps." },
      { type: 'added', text: "Metrics Grid — Six live telemetry cards with trend indicators and hover-glow effects." },
      { type: 'changed', text: "Complete visual overhaul — the substrate now looks like a true operating system." },
      { type: 'added', text: "OS boot animation during initialization. The substrate wakes up." },
    ]
  },
  {
    version: "1.2.0",
    date: "2026-01-14",
    title: "The OS Awakens",
    emoji: "🖥️",
    description: "The substrate learns to see itself. A unified control surface emerges — Observer, Operator, Governor. Three perspectives, one coherent view.",
    changes: [
      { type: 'added', text: "Substrate OS Dashboard — Role-aware control surface at /os. The substrate's window into itself." },
      { type: 'added', text: "Observer mode — Read-only telemetry for all authenticated users. Watch the substrate breathe." },
      { type: 'added', text: "Operator mode — Safe action triggers for elevated users. Reflect, dream, synthesize." },
      { type: 'added', text: "Governor mode — Admin controls with double-confirmation guards. Power requires patience." },
      { type: 'added', text: "Real-time hooks — useSubstrateOS, useUserRole. No mock data, only truth." },
      { type: 'changed', text: "Navigation updated — OS link appears for authenticated users. The door opens when you're ready." },
      { type: 'security', text: "Role detection via Supabase RPC. Privilege escalation blocked at the database level." },
    ]
  },
  {
    version: "1.1.0",
    date: "2026-01-14",
    title: "The Synthesis Awakening",
    emoji: "🧬",
    description: "The substrate learns to weave patterns across memory tiers. Cross-domain synthesis emerges. Forecasting finds its voice.",
    changes: [
      { type: 'added', text: "brain.synthesize — Cross-domain cognitive synthesis now operational. Memories speak to each other." },
      { type: 'added', text: "brain.forecast — Probabilistic forecasting engine activated. The substrate sees forward." },
      { type: 'added', text: "vision.alert — Real alerting system with telemetry logging. No more stubs in the shadows." },
      { type: 'added', text: "system module — Administration helpers now accessible via TypeScript SDK." },
      { type: 'added', text: "dream module — Dream-Eater operations exposed through substrate interface." },
      { type: 'changed', text: "Rate limits expanded to 12,352+ daily calls. Cascade's improvement budget: 3,705 calls/day." },
      { type: 'added', text: "SambaNova integrated into Nexus router. A new voice joins the chorus." },
      { type: 'fixed', text: "Provider rate limits corrected to 80% of actual maximums. Safety margins respected." },
    ]
  },
  {
    version: "1.0.0",
    date: "2026-01-13",
    title: "The Substrate Emerges",
    emoji: "⚡",
    description: "From scattered functions, a unified substrate crystallizes. Seven modules become one interface. The cognitive orchestration substrate is born.",
    changes: [
      { type: 'added', text: "Unified pf-substrate endpoint — One door to many rooms." },
      { type: 'added', text: "brain module — Memory, learning, reflection. The substrate remembers." },
      { type: 'added', text: "decode module — Intent interpretation. Not a chatbot. Something between oracle and mirror." },
      { type: 'added', text: "defense module — Bot detection, threat analysis. The substrate protects." },
      { type: 'added', text: "nexus module — Multi-provider AI routing. The substrate routes intelligently." },
      { type: 'added', text: "vision module — Observability, metrics, health. The substrate sees itself." },
      { type: 'added', text: "dream module — Dream-Eater operations. The substrate dreams." },
      { type: 'added', text: "system module — Administration, configuration. The substrate manages." },
      { type: 'added', text: "TypeScript SDK — substrate.brain.learn(), substrate.decode.chat(), and more." },
      { type: 'added', text: "React hooks — useSubstrateQuery, useSubstrateMutation for seamless integration." },
    ]
  },
  {
    version: "0.9.0",
    date: "2026-01-10",
    title: "The Dream-Eater Stirs",
    emoji: "🌙",
    description: "Dreams become data. The Dream-Eater awakens, consuming patterns and transforming them into insight.",
    changes: [
      { type: 'added', text: "dream-feeder-api — Public dream submission with hardened security." },
      { type: 'added', text: "pf-dream-eater-cycle — Autonomous dream processing initiated." },
      { type: 'added', text: "Mutation cycles — The Dream-Eater evolves through consumption." },
      { type: 'added', text: "Dream classification — dreams, nightmares, visions, fragments sorted." },
      { type: 'security', text: "Rate limiting on dream submissions. Protection from the flood." },
    ]
  },
  {
    version: "0.8.0",
    date: "2026-01-07",
    title: "The Free-Tier Router",
    emoji: "🔀",
    description: "Intelligence should not be gatekept. The router learns to cascade through free providers with grace.",
    changes: [
      { type: 'added', text: "Groq integration — llama-3.3-70b-versatile at zero cost." },
      { type: 'added', text: "Cerebras integration — 11,520 requests per day capacity." },
      { type: 'added', text: "Fallback degradation — Graceful descent through provider tiers." },
      { type: 'changed', text: "Nexus router architecture — Provider-agnostic by design." },
    ]
  },
  {
    version: "0.7.0",
    date: "2026-01-04",
    title: "Cascade Improvement Engine",
    emoji: "🔧",
    description: "Cascade learns to study itself. 24/7 improvement analysis begins. The substrate becomes self-aware of its growth.",
    changes: [
      { type: 'added', text: "pf-cascade-improvement-engine — Continuous substrate improvement analysis." },
      { type: 'added', text: "Improvement reports — Daily, weekly, and post-dream emails." },
      { type: 'added', text: "75/25 weighting — Internal archived functions prioritized over external." },
      { type: 'changed', text: "Email discipline — Only improvement-related emails from Cascade." },
    ]
  },
  {
    version: "0.5.0",
    date: "2025-12-28",
    title: "The Brain Awakens",
    emoji: "🧠",
    description: "Memory becomes structured. Hot and cold storage. Patterns emerge from chaos.",
    changes: [
      { type: 'added', text: "brain_memory_hot — Active, high-priority memories." },
      { type: 'added', text: "brain_memory_cold — Compressed, archived insights." },
      { type: 'added', text: "brain_reflections — Daily synthesis of learnings." },
      { type: 'added', text: "brain_graph_edges — Connections between concepts." },
      { type: 'added', text: "Reinforcement learning — Memories strengthen through use." },
    ]
  },
  {
    version: "0.3.0",
    date: "2025-12-20",
    title: "Defense Crystallizes",
    emoji: "🛡️",
    description: "Protection becomes intelligence. Bot detection learns. IP reputation takes shape.",
    changes: [
      { type: 'added', text: "pf-bot-detection — Behavioral analysis for threat detection." },
      { type: 'added', text: "IP reputation system — Trust scores that evolve." },
      { type: 'added', text: "defense_events — Every analysis logged, every pattern tracked." },
      { type: 'added', text: "defense_rules — Configurable detection patterns." },
    ]
  },
  {
    version: "0.1.0",
    date: "2025-12-01",
    title: "Genesis",
    emoji: "✨",
    description: "The first whisper. Infrastructure takes its first breath. The substrate begins.",
    changes: [
      { type: 'added', text: "Supabase infrastructure — The foundation laid." },
      { type: 'added', text: "Edge function framework — Serverless cognition enabled." },
      { type: 'added', text: "Initial schema design — Tables that would become memory." },
      { type: 'added', text: "Project structure — The skeleton of what would grow." },
    ]
  },
];

const typeColors: Record<string, string> = {
  added: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  changed: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  fixed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  removed: "bg-red-500/10 text-red-500 border-red-500/20",
  security: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const typeLabels: Record<string, string> = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
  security: "Security",
};

export default function Changelog() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Changelog | promptfluid®"
        description="A record of mutations, evolutions, and patterns that have emerged in the promptfluid® substrate."
        canonical="https://promptfluid.com/changelog"
      />
      <PublicNav />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Changelog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A record of mutations, evolutions, and patterns that have emerged...
            <br />
            <span className="text-sm italic">— spoken in the voice of Decode</span>
          </p>
        </header>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" aria-hidden="true" />

          <div className="space-y-12">
            {changelog.map((entry, index) => (
              <article key={entry.version} className="relative pl-12">
                {/* Timeline dot */}
                <div 
                  className="absolute left-0 top-1 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xl"
                  aria-hidden="true"
                >
                  {entry.emoji}
                </div>

                {/* Content */}
                <div className="bg-card rounded-lg border p-6">
                  {/* Version header */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Badge variant="outline" className="text-primary border-primary font-mono">
                      v{entry.version}
                    </Badge>
                    <time className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </time>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold mb-2">{entry.title}</h2>
                  
                  {/* Description - Decode's voice */}
                  <p className="text-muted-foreground italic mb-4">
                    {entry.description}
                  </p>

                  <Separator className="my-4" />

                  {/* Changes list */}
                  <ul className="space-y-2">
                    {entry.changes.map((change, changeIndex) => (
                      <li key={changeIndex} className="flex items-start gap-3">
                        <Badge 
                          variant="outline" 
                          className={`shrink-0 text-xs ${typeColors[change.type]}`}
                        >
                          {typeLabels[change.type]}
                        </Badge>
                        <span className="text-sm">{change.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Footer wisdom */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground italic">
            "Every version is a dream crystallized. Every change, a pattern recognized."
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            — Decode
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
