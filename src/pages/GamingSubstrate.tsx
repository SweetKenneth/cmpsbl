/**
 * Gaming CMPSBL — NPC Brains, World Engines & Persistent Memory
 * CMPSBL (Composable) as a foundation for video game AI
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Moon,
  Zap,
  Users,
  Gamepad2,
  Globe,
  MessageSquare,
  Sparkles,
  Database,
  RefreshCw,
  Network,
  Shield,
  Clock,
  Bot,
  Heart,
  Swords,
  Map,
  BookOpen,
  Terminal,
  Code,
  Play,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { cn } from "@/lib/utils";

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
  features,
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn(
        "h-full border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:border-current/30 transition-all duration-300",
        color
      )}>
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center mb-3">
            <Icon className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-current opacity-60" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Use case card
function UseCaseCard({
  icon: Icon,
  title,
  description,
  example,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  example: string;
  color: string;
}) {
  return (
    <div className={cn(
      "p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm",
      "hover:bg-card/50 transition-all duration-300",
      color
    )}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <p className="text-xs text-current/80 italic">"{example}"</p>
        </div>
      </div>
    </div>
  );
}

export default function GamingSubstrate() {
  // Core gaming features
  const gamingFeatures = [
    {
      icon: Brain,
      title: "NPC Memory System",
      description: "Give your NPCs persistent memory that survives sessions. They remember player interactions, form opinions, and learn preferences.",
      features: [
        "3-tier memory (hot/warm/cold)",
        "Relationship tracking",
        "Emotional state persistence",
        "Cross-session recall",
        "Memory decay & reinforcement",
      ],
      color: "text-purple-500",
    },
    {
      icon: Moon,
      title: "Dream Cycles",
      description: "NPCs process experiences during 'dream' cycles. They consolidate memories, form new associations, and evolve their personalities.",
      features: [
        "Offline memory consolidation",
        "Pattern extraction",
        "Personality evolution",
        "Dream-influenced behaviors",
        "Emergent storytelling",
      ],
      color: "text-violet-500",
    },
    {
      icon: MessageSquare,
      title: "Dynamic Dialogue",
      description: "Context-aware conversations that reference past interactions. NPCs maintain conversational context and personality consistency.",
      features: [
        "Intent understanding",
        "Contextual responses",
        "Personality-driven speech",
        "Memory-informed dialogue",
        "Multi-turn conversations",
      ],
      color: "text-cyan-500",
    },
    {
      icon: Zap,
      title: "AI Provider Routing",
      description: "Route NPC cognition through the optimal AI provider. Balance cost, latency, and capability for each interaction type.",
      features: [
        "Multi-provider support",
        "Cost optimization",
        "Latency-based routing",
        "Fallback chains",
        "BYOK architecture",
      ],
      color: "text-green-500",
    },
    {
      icon: Globe,
      title: "World State Engine",
      description: "Maintain persistent world state across all NPCs. Events propagate, rumors spread, and the world remembers.",
      features: [
        "Global event system",
        "Faction relationships",
        "Economic simulation",
        "News/rumor propagation",
        "Environmental memory",
      ],
      color: "text-amber-500",
    },
    {
      icon: Users,
      title: "Agency System",
      description: "Create coordinated NPC groups that work together. Define roles, hierarchies, and shared objectives.",
      features: [
        "Multi-agent coordination",
        "Role specialization",
        "Shared knowledge bases",
        "Group decision making",
        "Leader/follower dynamics",
      ],
      color: "text-rose-500",
    },
  ];

  // Use cases
  const useCases = [
    {
      icon: Swords,
      title: "RPG Companions",
      description: "Party members who remember your adventures together and grow based on shared experiences.",
      example: "Remember when we defeated that dragon together? I've been practicing fire resistance since then.",
      color: "text-amber-500",
    },
    {
      icon: Map,
      title: "Open World NPCs",
      description: "Shopkeepers, guards, and villagers who remember you and react to your reputation.",
      example: "You're the one who saved my daughter! Take this discount, hero.",
      color: "text-emerald-500",
    },
    {
      icon: Heart,
      title: "Dating Sims",
      description: "Characters with genuine emotional memory who build authentic relationships over time.",
      example: "You remembered my favorite flower from our first conversation...",
      color: "text-rose-500",
    },
    {
      icon: Bot,
      title: "Strategy AI",
      description: "Opponents that learn your tactics and adapt their strategies across matches.",
      example: "You always attack from the east. Not this time.",
      color: "text-blue-500",
    },
  ];

  // Technical capabilities
  const techCapabilities = [
    { icon: Database, label: "60+ Tables", description: "Full persistence layer" },
    { icon: Clock, label: "<100ms", description: "Response latency" },
    { icon: Network, label: "11 Modules", description: "Complete cognitive OS" },
    { icon: Shield, label: "Enterprise", description: "Production-ready security" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Gaming CMPSBL — NPC Brains & World Engines | promptfluid®"
        description="Give your NPCs persistent memory, dream cycles, and genuine personalities. CMPSBL designed for video game AI."
        canonical="https://promptfluid.com/gaming"
        keywords={[
          "NPC AI",
          "game AI",
          "NPC memory",
          "persistent NPCs",
          "video game AI",
          "LLM NPCs",
          "AI companions",
          "world engine",
          "game development AI",
          "CMPSBL",
        ]}
      />

      <PublicNav />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-purple-500/10 text-purple-400 border-purple-500/30">
              <Gamepad2 className="w-3 h-3 mr-1" />
              For Video Game Developers
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              NPCs That Remember,
              <br />Dream, and Evolve
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              CMPSBL gives your NPCs persistent memory, authentic personalities, 
              and the ability to grow from player interactions. They don't just respond—they remember.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link to="/devtools">
                  <Terminal className="w-4 h-4" />
                  Start Building
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/demo">
                  <Play className="w-4 h-4" />
                  See Demo
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-card/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {techCapabilities.map((cap, idx) => (
              <motion.div
                key={cap.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <cap.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{cap.label}</div>
                <div className="text-xs text-muted-foreground">{cap.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything Your NPCs Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete cognitive infrastructure for building intelligent, memorable game characters.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gamingFeatures.map((feature, idx) => (
              <FeatureCard key={feature.title} {...feature} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Every Genre
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From epic RPGs to intimate dating sims, the substrate powers authentic character AI.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase) => (
              <UseCaseCard key={useCase.title} {...useCase} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Integration
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect your game to the substrate in minutes. We handle the cognitive complexity.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-black/60 border-border/50">
              <CardContent className="p-6">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-green-400">{`// Initialize NPC with persistent memory
const npc = await cmpsbl.brain.remember({
  entity_id: "npc_innkeeper_03",
  memory: {
    type: "interaction",
    player_id: playerId,
    content: "Player asked about the dragon rumors",
    emotional_weight: 0.7,
    tags: ["quest_hint", "dragon", "tavern"]
  }
});

// NPC recalls relevant memories during dialogue
const memories = await cmpsbl.brain.recall({
  entity_id: "npc_innkeeper_03",
  query: "What does this NPC remember about the player?",
  limit: 5
});

// Trigger dream cycle for memory consolidation
await cmpsbl.dream.cycle({
  entity_ids: ["npc_innkeeper_03"],
  consolidate: true,
  extract_patterns: true
});`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Build Smarter NPCs?
            </h2>
            <p className="text-muted-foreground mb-8">
              Access the full substrate SDK, templates, and documentation. 
              Start building NPCs that players will actually remember.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link to="/devtools">
                  <Code className="w-4 h-4" />
                  Developer Portal
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/documentation">
                  <BookOpen className="w-4 h-4" />
                  Read the Docs
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="gap-2">
                <Link to="/contact">
                  <MessageSquare className="w-4 h-4" />
                  Talk to Us
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
