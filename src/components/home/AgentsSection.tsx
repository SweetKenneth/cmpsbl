/**
 * AgentsSection — Full 20-agent showcase on homepage
 * 3 Crown Jewel–powered flagships (expanded) + 17 specialist agents (compact grid)
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Zap, Brain, Shield, ArrowRight, Download, Sparkles, Database, Clock,
  Eye, Network, DollarSign, Activity, Lock, Fingerprint,
  Search, Code, BarChart3, Settings, Pen, Scale, Users, Headphones,
  HardDrive, Megaphone, Layers, ShieldCheck, Landmark, Palette, Container,
  Compass, Languages, GraduationCap, Briefcase, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ── Flagship Crown Jewel Powers ── */
interface AgentPower {
  name: string;
  source: string;
  description: string;
  icon: React.ElementType;
}

interface FlagshipAgent {
  name: string;
  subtitle: string;
  description: string;
  powers: AgentPower[];
  icon: React.ElementType;
  free: boolean;
  gradient: string;
  glowColor: string;
  borderColor: string;
}

const flagships: FlagshipAgent[] = [
  {
    name: "MEMORY Agent",
    subtitle: "Powered by PRISM · CIPHER · Memory Intelligence Fabric",
    description:
      "Not a cache — a living knowledge graph. Relationships between memories evolve over time, consolidate during idle cycles, and surface at sub-millisecond speed when context demands it.",
    powers: [
      {
        name: "Temporal Knowledge Graph",
        source: "PRISM Engine",
        description: "Relationship-aware recall that understands how memories connect, contradict, and evolve — not just what was said, but how it relates to everything else.",
        icon: Database,
      },
      {
        name: "Dream Consolidation",
        source: "Memory Intelligence Fabric",
        description: "Offline synthesis that merges, deduplicates, and strengthens memories during idle cycles — your agent literally gets smarter while it sleeps.",
        icon: Sparkles,
      },
      {
        name: "Tiered Recall Architecture",
        source: "CIPHER Engine",
        description: "Hot/warm/cold memory tiers with intelligent promotion. Recent context in <1ms, deep history in <50ms. No memory is ever truly forgotten.",
        icon: Clock,
      },
    ],
    icon: Brain,
    free: true,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    glowColor: "rgba(139, 92, 246, 0.15)",
    borderColor: "border-violet-500/20",
  },
  {
    name: "GUARDIAN Agent",
    subtitle: "Powered by SENTINEL · GENESIS · Immune Autonomy Mesh",
    description:
      "Not a firewall — an immune system. GUARDIAN doesn't just block known threats; it fingerprints behavior, predicts attack vectors, and auto-triages incidents with zero human intervention.",
    powers: [
      {
        name: "Behavioral Fingerprinting",
        source: "SENTINEL Engine",
        description: "Builds real-time behavioral profiles of every request. Detects prompt injection, credential stuffing, and novel attack patterns before the first byte of damage.",
        icon: Fingerprint,
      },
      {
        name: "Autonomous Incident Triage",
        source: "GENESIS Engine",
        description: "Self-classifying severity scoring with auto-executing remediation playbooks. P0 incidents trigger cascading defense — P3s get logged and learned from.",
        icon: Activity,
      },
      {
        name: "Evolving Immune Mesh",
        source: "Immune Autonomy Meta-Engine",
        description: "Every blocked threat strengthens the mesh. Cross-fleet antibody sharing means an attack on one deployment immunizes every other deployment automatically.",
        icon: Lock,
      },
    ],
    icon: Shield,
    free: true,
    gradient: "from-red-500 via-rose-500 to-orange-600",
    glowColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "border-red-500/20",
  },
  {
    name: "ROUTER Agent",
    subtitle: "Powered by NEXUS · MIRAGE · ORACLE",
    description:
      "Not a load balancer — a fleet intelligence engine. ROUTER doesn't round-robin; it predicts which model will produce the best answer for this exact task at this exact moment, then routes accordingly.",
    powers: [
      {
        name: "Cognitive Affinity Matching",
        source: "NEXUS + MIRAGE Engines",
        description: "Routes tasks to the model with highest empirical confidence for that specific task type. Math goes to one model, creative writing to another — automatically.",
        icon: Network,
      },
      {
        name: "Predictive Latency Shaping",
        source: "ORACLE Engine",
        description: "Forecasts provider response times 30 seconds ahead and pre-routes to avoid slowdowns before they happen. Your users never feel a provider outage.",
        icon: Eye,
      },
      {
        name: "Real-Time Cost Arbitrage",
        source: "NEXUS Engine",
        description: "Token-level spend tracking with automatic provider rotation. Same quality, 40-60% less cost — the router finds the cheapest path to the right answer.",
        icon: DollarSign,
      },
    ],
    icon: Zap,
    free: false,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glowColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "border-emerald-500/20",
  },
];

/* ── Compact Specialist Agents (remaining 17 from catalog) ── */
interface SpecialistAgent {
  name: string;
  className: string;
  tagline: string;
  icon: React.ElementType;
  color: string;
  isFree: boolean;
}

const specialists: SpecialistAgent[] = [
  { name: "Research Mind", className: "Investigator", tagline: "Deep research with verified sources", icon: Search, color: "text-cyan-400", isFree: false },
  { name: "Coding Mind", className: "Engineer", tagline: "Writes, debugs, and ships code", icon: Code, color: "text-green-400", isFree: false },
  { name: "Analyst Mind", className: "Strategist", tagline: "Anomaly detection & decision memos", icon: BarChart3, color: "text-purple-400", isFree: false },
  { name: "Ops Mind", className: "Operator", tagline: "SOPs, escalation & scheduling", icon: Settings, color: "text-orange-400", isFree: false },
  { name: "Writer Mind", className: "Scribe", tagline: "Persona-locked longform content", icon: Pen, color: "text-pink-400", isFree: false },
  { name: "Legal Mind", className: "Counsel", tagline: "Contract review & compliance", icon: Scale, color: "text-slate-400", isFree: false },
  { name: "Recruiter Mind", className: "Talent Scout", tagline: "Candidate screening & JD generation", icon: Users, color: "text-teal-400", isFree: false },
  { name: "Support Mind", className: "Resolver", tagline: "Ticket triage & KB routing", icon: Headphones, color: "text-sky-400", isFree: false },
  { name: "Data Engineer Mind", className: "Architect", tagline: "Pipeline design & ETL orchestration", icon: HardDrive, color: "text-indigo-400", isFree: false },
  { name: "Marketing Mind", className: "Campaigner", tagline: "Campaign strategy & A/B testing", icon: Megaphone, color: "text-rose-400", isFree: false },
  { name: "Product Mind", className: "Builder", tagline: "PRDs, user stories & roadmaps", icon: Layers, color: "text-violet-400", isFree: false },
  { name: "Security Mind", className: "Sentinel", tagline: "Threat modeling & incident response", icon: ShieldCheck, color: "text-red-400", isFree: false },
  { name: "Finance Mind", className: "Controller", tagline: "Financial modeling & forecasting", icon: Landmark, color: "text-emerald-400", isFree: false },
  { name: "Designer Mind", className: "Craftsman", tagline: "Design systems & accessibility", icon: Palette, color: "text-fuchsia-400", isFree: false },
  { name: "DevOps Mind", className: "Deployer", tagline: "CI/CD & infrastructure as code", icon: Container, color: "text-amber-400", isFree: false },
  { name: "Strategist Mind", className: "Visionary", tagline: "Market analysis & GTM planning", icon: Compass, color: "text-cyan-400", isFree: false },
  { name: "Translator Mind", className: "Linguist", tagline: "Multi-language & tone preservation", icon: Languages, color: "text-lime-400", isFree: false },
];

/* ── Also include the 3 public catalog agents not in flagships ── */
const publicExtras: SpecialistAgent[] = [
  { name: "Hybrid Mind", className: "Generalist", tagline: "Free cross-task generalist", icon: Bot, color: "text-yellow-400", isFree: true },
  { name: "Educator Mind", className: "Mentor", tagline: "Curriculum & adaptive teaching", icon: GraduationCap, color: "text-blue-400", isFree: true },
  { name: "Sales Mind", className: "Closer", tagline: "Pipeline tracking & deal intelligence", icon: Briefcase, color: "text-emerald-400", isFree: false },
];

// Merge to get all 17 non-flagship agents (20 total - 3 flagships = 17)
// The 3 flagships map to: Hybrid (≈Memory), Security (≈Guardian), Sales (≈Router) conceptually
// But the catalog has 20 distinct SKUs, so we show all 20 minus duplicates
const allSpecialists = [...publicExtras, ...specialists];

export function AgentsSection() {
  return (
    <section className="relative z-10 py-16 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 px-4 py-1.5">
            <Zap className="w-3 h-3 mr-1.5 text-primary" />
            <span className="text-xs font-semibold">20 Composable Agents</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Twenty Agents.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--primary)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Crown Jewel Cores.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Three flagship agents backed by sealed runtime engines, plus seventeen domain specialists — 
            every one powered by the substrate's Crown Jewel vault.
          </p>
        </motion.div>

        {/* ── 3 Flagship Agents (expanded) ── */}
        <div className="space-y-6 mb-12">
          {flagships.map((agent, idx) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.12, duration: 0.5 }}
              className={cn(
                "relative rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden",
                "hover:shadow-xl transition-all duration-500 group",
                agent.borderColor
              )}
              style={{ boxShadow: `0 0 60px -15px ${agent.glowColor}` }}
            >
              <div className={cn("h-1 w-full bg-gradient-to-r", agent.gradient)} />
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg", agent.gradient)}>
                      <agent.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-black text-foreground tracking-tight">{agent.name}</h3>
                        {agent.free ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">FREE</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">PRO</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">{agent.subtitle}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">{agent.description}</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {agent.powers.map((power, pIdx) => (
                    <motion.div
                      key={power.name}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.12 + pIdx * 0.08 + 0.2 }}
                      className="relative rounded-xl border border-border/50 bg-background/50 p-4 hover:border-primary/30 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br opacity-80", agent.gradient)}>
                          <power.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">{power.source}</span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground mb-1.5">{power.name}</h4>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed">{power.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── 17 Specialist Agents (compact grid) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              + 17 Domain Specialists
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {allSpecialists.slice(0, 17).map((agent, idx) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="relative rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 hover:border-primary/30 hover:bg-card/60 transition-all duration-300 group"
              >
                {agent.isFree && (
                  <span className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                    FREE
                  </span>
                )}
                <agent.icon className={cn("w-5 h-5 mb-2.5", agent.color)} />
                <h4 className="text-xs font-bold text-foreground mb-0.5 leading-tight">{agent.name}</h4>
                <p className="text-[10px] text-muted-foreground/60 font-mono mb-1">{agent.className}</p>
                <p className="text-[10px] text-muted-foreground/70 leading-snug">{agent.tagline}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="gap-2 px-8 h-12 font-semibold">
            <Link to="/composable-cognitives">
              <Download className="w-4 h-4" />
              Browse All 20 Agents
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
