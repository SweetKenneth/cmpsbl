/**
 * Gaming CMPSBL — NPC Brains, Cognitive Reality & Persistent Memory
 * Polished showcase for game developers + World Engine product
 */

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  Package,
  Crown,
  Layers,
  Cpu,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

const WORLD_ENGINE_PRICE_ID = "price_1T5W8qQ7FtTiAL4amPdCvtlu";

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
  features,
  color,
  gradient,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  color: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <Card className={cn(
        "h-full border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden",
        "hover:border-current/30 hover:shadow-xl transition-all duration-500 card-lift shimmer-on-hover",
        color
      )}>
        <div className={cn("h-1 w-full bg-gradient-to-r", gradient)} />
        <CardHeader className="pb-3">
          <div className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4",
            "bg-gradient-to-br shadow-lg",
            gradient
          )}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <CardTitle className="text-lg sm:text-xl group-hover:text-current transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-current shrink-0" />
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
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  example: string;
  color: string;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className={cn(
        "p-5 sm:p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm",
        "hover:bg-card/60 hover:border-current/30 hover:shadow-lg transition-all duration-300",
        color
      )}>
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0",
            "bg-gradient-to-br shadow-md",
            gradient
          )}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-current transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <div className="p-3 rounded-lg bg-background/50 border border-border/30">
              <p className="text-sm text-current/80 italic">"{example}"</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// World Engine includes
const WORLD_ENGINE_INCLUDES = [
  {
    icon: Brain,
    title: "Persistent NPC Memory System",
    description: "3-tier hot/warm/cold memory architecture. NPCs remember every player interaction across sessions, form opinions, track relationships, and recall specific events with emotional weighting.",
  },
  {
    icon: Moon,
    title: "Dream Cycle Processing",
    description: "Offline memory consolidation where NPCs process experiences, extract patterns, form new associations, and evolve their personalities between play sessions.",
  },
  {
    icon: Globe,
    title: "World State Engine",
    description: "Global event propagation system where actions ripple across the entire game world. Faction relationships shift, rumors spread organically, and environmental changes persist.",
  },
  {
    icon: MessageSquare,
    title: "Dynamic Dialogue System",
    description: "Context-aware dialogue that references past interactions, adjusts tone based on relationship history, and generates personality-consistent responses in real-time.",
  },
  {
    icon: Users,
    title: "Multi-Agent Coordination",
    description: "Create coordinated NPC groups with hierarchies, shared knowledge bases, role specialization, and leader/follower dynamics that drive emergent behavior.",
  },
  {
    icon: Zap,
    title: "Multi-Provider AI Routing",
    description: "Intelligent routing across OpenAI, Anthropic, Google, and open-source models. Automatic cost optimization and latency-based routing per interaction type.",
  },
  {
    icon: Shield,
    title: "Governance & Safety Layer",
    description: "Built-in content filtering, behavior boundaries, and audit trails. Ensure NPCs stay in character and within your game's tone guidelines.",
  },
  {
    icon: Layers,
    title: "Full API & SDK Access",
    description: "RESTful API, WebSocket support, and SDKs for Unity, Unreal, Godot, and custom engines. Complete documentation with code examples for every feature.",
  },
  {
    icon: Cpu,
    title: "Production Infrastructure",
    description: "Enterprise-grade hosting with 99.9% uptime SLA, sub-100ms latency, automatic scaling, and dedicated support. No DevOps required.",
  },
];

export default function GamingSubstrate() {
  const [searchParams] = useSearchParams();
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (searchParams.get('purchase') === 'success') {
      toast.success('World Engine purchase successful! Check your email for access details.');
    }
  }, [searchParams]);

  const handlePurchaseWorldEngine = async () => {
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('world-engine-checkout', {
        body: { priceId: WORLD_ENGINE_PRICE_ID },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (e: any) {
      toast.error(e.message || 'Checkout failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

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
      ],
      color: "text-purple-500",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: Moon,
      title: "Dream Cycles",
      description: "NPCs process experiences during 'dream' cycles. They consolidate memories, form new associations, and evolve their personalities.",
      features: [
        "Offline memory consolidation",
        "Pattern extraction",
        "Personality evolution",
        "Emergent storytelling",
      ],
      color: "text-cyan-500",
      gradient: "from-cyan-500 to-teal-600",
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
      ],
      color: "text-cyan-500",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: Zap,
      title: "AI Provider Routing",
      description: "Route NPC cognition through the optimal AI provider. Balance cost, latency, and capability for each interaction type.",
      features: [
        "Multi-provider support",
        "Cost optimization",
        "Latency-based routing",
        "BYOK architecture",
      ],
      color: "text-green-500",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: Globe,
      title: "World State Engine",
      description: "Maintain persistent world state across all NPCs. Events propagate, rumors spread, and the world remembers.",
      features: [
        "Global event system",
        "Faction relationships",
        "News/rumor propagation",
        "Environmental memory",
      ],
      color: "text-amber-500",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: Users,
      title: "Agency System",
      description: "Create coordinated NPC groups that work together. Define roles, hierarchies, and shared objectives.",
      features: [
        "Multi-agent coordination",
        "Role specialization",
        "Shared knowledge bases",
        "Leader/follower dynamics",
      ],
      color: "text-rose-500",
      gradient: "from-rose-500 to-pink-600",
    },
  ];

  const useCases = [
    {
      icon: Swords,
      title: "RPG Companions",
      description: "Party members who remember your adventures together and grow based on shared experiences.",
      example: "Remember when we defeated that dragon together? I've been practicing fire resistance since then.",
      color: "text-amber-500",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: Map,
      title: "Open World NPCs",
      description: "Shopkeepers, guards, and villagers who remember you and react to your reputation.",
      example: "You're the one who saved my daughter! Take this discount, hero.",
      color: "text-emerald-500",
      gradient: "from-emerald-500 to-green-600",
    },
    {
      icon: Heart,
      title: "Dating Sims",
      description: "Characters with genuine emotional memory who build authentic relationships over time.",
      example: "You remembered my favorite flower from our first conversation...",
      color: "text-rose-500",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      icon: Bot,
      title: "Strategy AI",
      description: "Opponents that learn your tactics and adapt their strategies across matches.",
      example: "You always attack from the east. Not this time.",
      color: "text-blue-500",
      gradient: "from-blue-500 to-indigo-600",
    },
  ];

  const techCapabilities = [
    { icon: Database, label: "60+", sublabel: "Tables", description: "Full persistence layer" },
    { icon: Clock, label: "<100ms", sublabel: "Latency", description: "Response time" },
    { icon: Network, label: "9", sublabel: "Nodes", description: "Production infrastructure" },
    { icon: Shield, label: "Enterprise", sublabel: "Security", description: "Production-ready" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Gaming AI — NPCs That Dream & Remember | CMPSBL"
        description="Give your NPCs persistent memory, dream cycles, and genuine personalities. CMPSBL cognitive infrastructure for video game AI. World Engine available for $2,995."
        canonical="https://cmpsbl.com/gaming"
        keywords={[
          "NPC AI", "game AI", "NPC memory", "persistent NPCs",
          "video game AI", "LLM NPCs", "AI companions", "cognitive reality",
          "game development AI", "world engine", "CMPSBL",
        ]}
      />

      <PublicNav />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
          <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 px-4 py-1.5 bg-purple-500/10 text-purple-400 border-purple-500/30">
              <Gamepad2 className="w-4 h-4 mr-2" />
              For Video Game Developers
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tight">
              <span className="text-foreground">NPCs That </span>
              <span
                className="block sm:inline"
                style={{
                  background: "linear-gradient(135deg, hsl(280 80% 60%), hsl(320 80% 60%), hsl(var(--neon-cyan)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Remember, Dream, Evolve
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
              CMPSBL gives your NPCs persistent memory, authentic personalities,
              and the ability to grow from every player interaction. They don't just respond—they <em>remember</em>.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Button asChild size="lg" className="gap-2 h-12 sm:h-14 px-6 sm:px-8 text-base bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                <a href="#world-engine">
                  <Crown className="w-5 h-5" />
                  Get World Engine — $2,995
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 h-12 sm:h-14 px-6 sm:px-8 text-base">
                <Link to="/upgrade">
                  <Package className="w-5 h-5" />
                  Or Start With a Plan
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-card/30 py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {techCapabilities.map((cap, idx) => (
              <motion.div
                key={cap.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                  <cap.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-foreground">{cap.label}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{cap.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* WORLD ENGINE — Premium Product Section         */}
      {/* ═══════════════════════════════════════════════ */}
      <section id="world-engine" className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/3 via-transparent to-transparent" />
          <motion.div 
            className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[200px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            {/* World Engine Header */}
            <div className="text-center mb-10 sm:mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-400 border-amber-500/30">
                <Crown className="w-4 h-4 mr-2" />
                Premium Product
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 tracking-tight">
                The{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(280 80% 60%), hsl(320 80% 60%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  World Engine
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
                Everything you need to build games with truly intelligent NPCs. 
                Complete cognitive infrastructure — persistent memory, dream cycles, 
                world state, dialogue, multi-agent coordination, and production-grade hosting. 
                One purchase. Lifetime access.
              </p>
            </div>

            {/* Price Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-lg mx-auto mb-12 sm:mb-16"
            >
              <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
                
                <div className="relative p-6 sm:p-10 text-center text-white">
                  <Crown className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-amber-300" />
                  <h3 className="text-2xl sm:text-3xl font-black mb-2">World Engine</h3>
                  <p className="text-white/70 text-sm sm:text-base mb-6">Complete Gaming AI Infrastructure</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl sm:text-6xl font-black">$2,995</span>
                    <span className="text-white/60 text-sm sm:text-base ml-2">one-time</span>
                  </div>

                  <p className="text-white/60 text-xs sm:text-sm mb-6">
                    Lifetime license · All updates included · Production hosting · Priority support
                  </p>

                  <Button 
                    onClick={handlePurchaseWorldEngine}
                    disabled={purchasing}
                    size="lg"
                    className="w-full h-14 text-lg font-bold bg-white text-purple-600 hover:bg-white/90 shadow-2xl shadow-black/30"
                  >
                    {purchasing ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Crown className="w-5 h-5 mr-2" />
                    )}
                    {purchasing ? 'Opening checkout...' : 'Purchase World Engine'}
                  </Button>
                  
                  <p className="text-white/40 text-[10px] sm:text-xs mt-4">
                    Secure checkout via Stripe · Instant access after purchase
                  </p>
                </div>
              </div>
            </motion.div>

            {/* What's Included */}
            <div className="mb-10 sm:mb-14">
              <h3 className="text-xl sm:text-2xl font-bold text-center mb-8">
                Everything Included in the World Engine
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {WORLD_ENGINE_INCLUDES.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 sm:p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-purple-500/20 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-purple-500" />
                      </div>
                      <h4 className="font-bold text-sm sm:text-base mb-2">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Why It's Different */}
            <div className="rounded-2xl border border-purple-500/20 bg-card/30 p-6 sm:p-10">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center">
                Why the World Engine Makes Games{" "}
                <span className="text-purple-400">Unforgettable</span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  {
                    title: "NPCs That Actually Learn",
                    desc: "Other NPC AI systems give you scripted responses with LLM wrappers. The World Engine gives NPCs genuine memory — they track relationships, recall past events, and change their behavior based on accumulated experience. Players feel the difference immediately.",
                  },
                  {
                    title: "Emergent Narratives",
                    desc: "When NPCs remember, dream, and share knowledge, stories emerge that no designer could have scripted. A guard who witnessed you stealing will warn the merchant. The merchant raises prices. Your reputation precedes you.",
                  },
                  {
                    title: "Zero DevOps Overhead",
                    desc: "You get production-grade infrastructure without managing servers, databases, or ML pipelines. Focus on game design. We handle the cognitive infrastructure at scale — from indie to AAA.",
                  },
                  {
                    title: "Works With Any Engine",
                    desc: "Unity, Unreal, Godot, or custom — the World Engine works via REST API and WebSockets. Full SDKs for major engines with drop-in components for NPC memory, dialogue, and world state.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="font-bold text-sm sm:text-base text-foreground">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Second CTA */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <Button 
                  onClick={handlePurchaseWorldEngine}
                  disabled={purchasing}
                  size="lg"
                  className="h-12 sm:h-14 px-8 text-base bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 font-bold"
                >
                  {purchasing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Crown className="w-5 h-5 mr-2" />}
                  Get World Engine — $2,995
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 sm:h-14 px-8 text-base">
                  <Link to="/upgrade">
                    Or explore subscription plans
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <Badge variant="outline" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Core Capabilities
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              Everything Your NPCs Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg px-2">
              A complete cognitive infrastructure for building intelligent, memorable game characters.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {gamingFeatures.map((feature, idx) => (
              <FeatureCard key={feature.title} {...feature} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <Badge variant="outline" className="mb-4">
              <Gamepad2 className="w-3 h-3 mr-1" />
              Game Genres
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              Built for Every Genre
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg px-2">
              From epic RPGs to intimate dating sims, CMPSBL powers authentic character AI.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {useCases.map((useCase) => (
              <UseCaseCard key={useCase.title} {...useCase} />
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <Badge variant="outline" className="mb-4">
              <Code className="w-3 h-3 mr-1" />
              Integration
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              Simple to Integrate
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg px-2">
              Connect your game to CMPSBL in minutes. We handle the cognitive complexity.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/80 border-primary/30 overflow-hidden shadow-2xl shadow-primary/10">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-white/40 ml-2">npc-memory.ts</span>
              </div>
              <CardContent className="p-4 sm:p-6">
                <pre className="text-xs sm:text-sm overflow-x-auto">
                  <code className="text-green-400 font-mono">{`// Initialize NPC with persistent memory
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
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative p-8 sm:p-10 md:p-14 rounded-3xl overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

              <div className="relative">
                <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 text-white/80" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
                  Ready to Build Smarter NPCs?
                </h2>
                <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8 px-2">
                  Get the World Engine for complete access, or start with a subscription plan 
                  and activate capability packs as you go.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2 sm:px-0">
                  <Button 
                    onClick={handlePurchaseWorldEngine}
                    disabled={purchasing}
                    size="lg" 
                    className="h-12 sm:h-14 px-6 sm:px-8 bg-white text-purple-600 hover:bg-white/90 font-bold shadow-lg text-base hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    World Engine — $2,995
                  </Button>
                  <Button asChild size="lg" className="h-12 sm:h-14 px-6 sm:px-8 bg-white/20 text-white hover:bg-white/30 font-bold border-2 border-white/40 text-base">
                    <Link to="/upgrade">
                      <Package className="w-5 h-5 mr-2" />
                      Subscription Plans
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
