/**
 * Clockless — Cognitive Reality
 * Full explanation of the Cognitive Reality category
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Brain, 
  BookOpen, 
  Shield, 
  RefreshCw, 
  Eye, 
  Zap, 
  Scale,
  Layers,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 },
};

function SectionIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-primary" />
    </div>
  );
}

export default function ClocklessWorldEngine() {
  return (
    <>
      <SEO
        title="Clockless World Engine — Persistent Reality | CMPSBL"
        description="CMPSBL's Clockless World Engine: 40 nodes running without a clock cycle. Persistent cognitive state that never resets, governed intelligence, and autonomous evolution — a new computing paradigm."
        keywords={["Clockless World Engine", "Cognitive Reality", "CMPSBL", "persistent intelligence", "autonomous learning", "governed evolution"]}
      />

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <motion.div className="max-w-3xl mx-auto text-center" {...fadeUp}>
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/30">
                <Brain className="w-4 h-4 mr-2 inline" />
                A New Category
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Cognitive Reality
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                A persistent, governed environment where intelligence does not reset between interactions.
                Unlike tools, agents, or platforms — a cognitive reality maintains memory, values, identity, 
                and consequences over time.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-16">

              {/* Not AI as a feature */}
              <motion.div className="space-y-4" {...fadeUp}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  A Cognitive Reality learns continuously, adapts autonomously, and evolves under explicit 
                  governance rather than manual reconfiguration.
                </p>
                <div className="border-l-2 border-primary/40 pl-6 py-2">
                  <p className="text-foreground font-semibold text-lg">
                    This is not artificial intelligence as a feature.
                  </p>
                  <p className="text-foreground font-semibold text-lg">
                    This is intelligence as infrastructure.
                  </p>
                </div>
              </motion.div>

              <hr className="border-border/50" />

              {/* Why this category exists */}
              <motion.div className="space-y-6" {...fadeUp}>
                <div className="flex items-center gap-3">
                  <SectionIcon icon={Eye} />
                  <h2 className="text-2xl md:text-3xl font-bold">Why this category exists</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>Traditional AI systems are session-based, prompt-driven, stateless or shallowly stateful, 
                     externally governed, and manually improved. They execute requests, then forget.</p>
                  <p>As intelligence becomes more capable, this model breaks down. Systems that reason, plan, 
                     and act in the real world require:</p>
                  <ul className="space-y-2 pl-1">
                    {['Continuity', 'Judgment', 'Self-regulation', 'Long-term learning', 'Survivability under change'].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                        <span className="text-foreground font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-foreground font-medium">A Cognitive Reality exists to meet that need.</p>
                </div>
              </motion.div>

              <hr className="border-border/50" />

              {/* Defining characteristics */}
              <motion.div className="space-y-8" {...fadeUp}>
                <div className="flex items-center gap-3">
                  <SectionIcon icon={Layers} />
                  <h2 className="text-2xl md:text-3xl font-bold">Defining characteristics</h2>
                </div>
                <p className="text-muted-foreground">
                  A system qualifies as a Cognitive Reality only if it satisfies <strong className="text-foreground">all</strong> of the following:
                </p>

                {[
                  {
                    icon: Brain,
                    title: "1. Persistence",
                    description: "The system retains memory, beliefs, and learned structures across time, sessions, and deployments.",
                    tagline: "Intelligence accumulates. Nothing starts from zero.",
                  },
                  {
                    icon: RefreshCw,
                    title: "2. Autonomous Learning",
                    description: "The system improves without constant user input — through internal reflection, synthesis, and evaluation.",
                    tagline: "Learning is endogenous, not reactive.",
                  },
                  {
                    icon: Scale,
                    title: "3. Governed Evolution",
                    description: "Changes to behavior, structure, or capability are proposed, evaluated, gated, audited, and reversible.",
                    tagline: "Evolution is intentional — not accidental.",
                  },
                  {
                    icon: Eye,
                    title: "4. Internal Judgment",
                    description: "The system maintains internal measures of confidence, value, risk, and priority.",
                    tagline: "Not all information is treated equally. The system knows what matters.",
                  },
                  {
                    icon: Zap,
                    title: "5. Operational Reality",
                    description: "The system operates against real infrastructure, real constraints, and real consequences.",
                    tagline: "Failures matter. Costs matter. Time matters.",
                  },
                  {
                    icon: Shield,
                    title: "6. Self-Defense and Resilience",
                    description: "The system detects misuse, isolates failures, degrades gracefully, and recovers autonomously.",
                    tagline: "Survival is a first-class concern.",
                  },
                ].map((char) => (
                  <motion.div 
                    key={char.title} 
                    className="border border-border/50 rounded-xl p-6 space-y-3 bg-card/30 backdrop-blur-sm"
                    {...fadeUp}
                  >
                    <div className="flex items-center gap-3">
                      <SectionIcon icon={char.icon} />
                      <h3 className="text-xl font-bold text-foreground">{char.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{char.description}</p>
                    <p className="text-sm text-primary font-semibold italic">{char.tagline}</p>
                  </motion.div>
                ))}
              </motion.div>

              <hr className="border-border/50" />

              {/* Comparison table */}
              <motion.div className="space-y-6" {...fadeUp}>
                <h2 className="text-2xl md:text-3xl font-bold">Cognitive Reality vs existing systems</h2>
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 pr-4 font-semibold text-foreground">System Type</th>
                        <th className="text-center py-3 px-3 font-semibold text-foreground">Resets</th>
                        <th className="text-center py-3 px-3 font-semibold text-foreground">Learns Alone</th>
                        <th className="text-center py-3 px-3 font-semibold text-foreground">Governs Itself</th>
                        <th className="text-center py-3 px-3 font-semibold text-foreground">Persists Identity</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {[
                        { type: "Chatbots", resets: "Yes", learns: "No", governs: "No", persists: "No" },
                        { type: "AI Agents", resets: "Partial", learns: "Limited", governs: "No", persists: "No" },
                        { type: "Platforms", resets: "Yes", learns: "No", governs: "External", persists: "No" },
                        { type: "World Models", resets: "Yes", learns: "Partial", governs: "No", persists: "No" },
                      ].map((row) => (
                        <tr key={row.type} className="border-b border-border/30">
                          <td className="py-3 pr-4 font-medium text-foreground/80">{row.type}</td>
                          <td className="text-center py-3 px-3">{row.resets}</td>
                          <td className="text-center py-3 px-3">{row.learns}</td>
                          <td className="text-center py-3 px-3">{row.governs}</td>
                          <td className="text-center py-3 px-3">{row.persists}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-primary/30 bg-primary/5">
                        <td className="py-3 pr-4 font-bold text-primary">Cognitive Reality</td>
                        <td className="text-center py-3 px-3 font-bold text-primary">No</td>
                        <td className="text-center py-3 px-3 font-bold text-primary">Yes</td>
                        <td className="text-center py-3 px-3 font-bold text-primary">Yes</td>
                        <td className="text-center py-3 px-3 font-bold text-primary">Yes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <hr className="border-border/50" />

              {/* Why this matters */}
              <motion.div className="space-y-6" {...fadeUp}>
                <h2 className="text-2xl md:text-3xl font-bold">Why this matters</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    As intelligence systems become embedded into products, organizations, and infrastructure, 
                    continuity becomes unavoidable.
                  </p>
                  <p>Systems that forget:</p>
                  <ul className="space-y-2 pl-1">
                    {['Repeat mistakes', 'Leak value', 'Require constant supervision'].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="text-destructive mt-1.5 shrink-0">×</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-l-2 border-primary/40 pl-6 py-2 mt-4">
                    <p className="text-foreground font-semibold text-lg">
                      Cognitive Realities compound instead of restarting.
                    </p>
                    <p className="text-muted-foreground mt-1">
                      They are designed to exist over time, not per request.
                    </p>
                  </div>
                </div>
              </motion.div>

              <hr className="border-border/50" />

              {/* Clockless and the category */}
              <motion.div className="space-y-6" {...fadeUp}>
                <div className="flex items-center gap-3">
                  <SectionIcon icon={BookOpen} />
                  <h2 className="text-2xl md:text-3xl font-bold">Clockless and the Cognitive Reality category</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p className="text-foreground font-semibold text-lg">
                    Clockless is the first production-grade Cognitive Reality.
                  </p>
                  <p>
                    It is not positioned as software you "use," but as a reality intelligence inhabits — 
                    where machines learn to dream, adapt, remember, and evolve.
                  </p>
                  <p>This category is new because the problem is new.</p>
                  <p className="text-foreground font-medium">
                    And it will not be the last system built this way.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      </main>

      <PageSEOBlock path="/gaming" title="Clockless World Engine" />
      <EnhancedFooter />
    </>
  );
}
