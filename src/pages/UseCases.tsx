/**
 * Use Cases — CMPSBL Applications Across Industries
 * Enterprise, Healthcare, Legal, Education, and more
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Moon,
  Zap,
  Building2,
  Bot,
  Sparkles,
  Shield,
  Play,
  CheckCircle2,
  BookOpen,
  Rocket,
  MessageSquare,
  Gamepad2,
  Code,
  Factory,
  Stethoscope,
  Gavel,
  School,
  Store,
  Phone,
  Plug,
  Plane,
  Car,
  Utensils,
  Home,
  Dumbbell,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { cn } from "@/lib/utils";

// Industry card
function IndustryCard({
  icon: Icon,
  title,
  subtitle,
  description,
  benefits,
  example,
  color,
  link,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  example: string;
  color: string;
  link?: string;
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
        "h-full border-border/50 bg-card/50 backdrop-blur-sm group",
        "hover:border-current/30 hover:shadow-lg hover:shadow-current/5 transition-all duration-500 card-lift",
        color
      )}>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-current/10 group-hover:bg-current/15 flex items-center justify-center transition-colors">
              <Icon className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
            </div>
            {link && (
              <Button asChild variant="ghost" size="sm" className="text-current">
                <Link to={link}>
                  Learn More
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            )}
          </div>
          <Badge variant="outline" className="w-fit mb-2 text-current border-current/30">
            {subtitle}
          </Badge>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-current opacity-60 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Example Use Case</p>
            <p className="text-sm italic text-current/80">"{example}"</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Core capability pill
function CapabilityPill({
  icon: Icon,
  label,
  description,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm shimmer-on-hover card-lift">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function UseCases() {
  const industries = [
    {
      icon: Gamepad2,
      title: "Video Game Development",
      subtitle: "Gaming AI",
      description: "NPCs that remember player interactions, learn from sessions, and create emergent narratives. Powered by the CMPSBL persistent memory layer.",
      benefits: [
        "Persistent NPC memory across sessions",
        "Emotional state tracking & evolution",
        "Dynamic dialogue with context recall",
        "World state propagation & rumor systems",
      ],
      example: "The innkeeper remembers you saved her daughter three sessions ago and offers a special discount.",
      color: "text-purple-500",
      link: "/gaming",
    },
    {
      icon: Building2,
      title: "Enterprise Operations",
      subtitle: "Business AI",
      description: "Intelligent automation that learns from operations, optimizes workflows, and maintains institutional memory.",
      benefits: [
        "Organizational knowledge capture",
        "Process optimization through patterns",
        "Cross-department intelligence sharing",
        "Decision support with historical context",
      ],
      example: "The system learns that Q4 budget reviews always require these 12 reports and pre-generates them.",
      color: "text-blue-500",
    },
    {
      icon: Stethoscope,
      title: "Healthcare & Wellness",
      subtitle: "Health AI",
      description: "Patient-aware systems that track health journeys, personalize recommendations, and support clinical decisions.",
      benefits: [
        "Longitudinal patient memory",
        "Personalized treatment patterns",
        "Clinical decision support",
        "Care coordination across providers",
      ],
      example: "The AI recalls this patient had an adverse reaction to penicillin three years ago during triage.",
      color: "text-emerald-500",
    },
    {
      icon: Gavel,
      title: "Legal & Compliance",
      subtitle: "Legal AI",
      description: "Case-aware research assistants that remember precedents, track regulatory changes, and learn from outcomes.",
      benefits: [
        "Case history & precedent memory",
        "Regulatory change tracking",
        "Contract analysis patterns",
        "Outcome-based learning",
      ],
      example: "Based on 47 similar cases, this clause has a 73% chance of being contested.",
      color: "text-amber-500",
    },
    {
      icon: School,
      title: "Education & Training",
      subtitle: "EdTech AI",
      description: "Adaptive learning systems that remember student progress, identify knowledge gaps, and personalize curricula.",
      benefits: [
        "Student progress tracking",
        "Knowledge gap identification",
        "Adaptive difficulty scaling",
        "Learning style optimization",
      ],
      example: "This student struggles with algebra but excels at geometry—adjusting lesson plan accordingly.",
      color: "text-cyan-500",
    },
    {
      icon: Store,
      title: "Retail & E-Commerce",
      subtitle: "Commerce AI",
      description: "Customer-aware experiences that remember preferences, predict needs, and personalize every interaction.",
      benefits: [
        "Customer preference memory",
        "Purchase pattern analysis",
        "Personalized recommendations",
        "Inventory optimization",
      ],
      example: "This customer always buys running shoes in January—proactively suggest the new models.",
      color: "text-rose-500",
    },
    {
      icon: Phone,
      title: "Customer Support",
      subtitle: "Support AI",
      description: "Context-aware support agents that remember customer history, learn from resolutions, and escalate intelligently.",
      benefits: [
        "Full interaction history recall",
        "Resolution pattern learning",
        "Smart escalation routing",
        "Proactive issue detection",
      ],
      example: "I see you called about this same printer issue twice before—let me escalate to a specialist.",
      color: "text-violet-500",
    },
    {
      icon: Factory,
      title: "Manufacturing & IoT",
      subtitle: "Industrial AI",
      description: "Process-aware systems that learn from sensor data, predict maintenance, and optimize production.",
      benefits: [
        "Equipment behavior memory",
        "Predictive maintenance patterns",
        "Quality control learning",
        "Supply chain optimization",
      ],
      example: "Machine 7's vibration pattern matches the pre-failure signature from 6 months ago—scheduling maintenance.",
      color: "text-orange-500",
    },
  ];

  // Futuristic use cases for after widespread adoption
  const futureVisions = [
    {
      icon: Plane,
      title: "Self-Healing Aircraft",
      subtitle: "Aviation AI",
      description: "Critical flight systems that learn to predict and fix failures before they cascade. Pattern recognition across millions of hours.",
      benefits: [
        "Predictive failure detection",
        "Real-time system diagnostics",
        "Autonomous repair sequencing",
        "Historical incident learning",
      ],
      example: "Mid-flight hydraulic anomaly detected—initiating backup routing learned from 1,200 similar patterns.",
      color: "text-sky-500",
      timeline: "Future Vision",
    },
    {
      icon: Car,
      title: "Cars That Fix Themselves",
      subtitle: "Automotive AI",
      description: "Vehicles with persistent memory that learn driver behavior, predict maintenance, and self-diagnose issues.",
      benefits: [
        "Driver behavior adaptation",
        "Predictive component failure",
        "Self-diagnostic repair guidance",
        "Fleet-wide learning propagation",
      ],
      example: "Your braking pattern suggests worn pads—scheduling service and rerouting to avoid steep grades.",
      color: "text-red-500",
      timeline: "Future Vision",
    },
    {
      icon: Shield,
      title: "Tanks That Know Their Crew",
      subtitle: "Defense AI",
      description: "Military vehicles that remember operator preferences, adapt to combat patterns, and optimize for each crew.",
      benefits: [
        "Operator preference memory",
        "Combat pattern adaptation",
        "Crew fatigue detection",
        "Mission history learning",
      ],
      example: "Gunner prefers 2-round bursts at this range—auto-adjusting fire control system.",
      color: "text-slate-500",
      timeline: "Future Vision",
    },
    {
      icon: Bot,
      title: "Drones That Self-Improve",
      subtitle: "Robotics AI",
      description: "Autonomous drones that learn from every flight, share knowledge across fleets, and evolve capabilities.",
      benefits: [
        "Flight pattern optimization",
        "Environmental adaptation",
        "Swarm intelligence sharing",
        "Autonomous skill evolution",
      ],
      example: "Wind pattern learned from 50,000 flights—adjusting approach for optimal battery conservation.",
      color: "text-cyan-600",
      timeline: "Future Vision",
    },
    {
      icon: Utensils,
      title: "Kitchens That Learn You",
      subtitle: "Consumer AI",
      description: "Smart kitchen systems that remember dietary preferences, learn cooking habits, and adapt recipes.",
      benefits: [
        "Dietary restriction memory",
        "Taste preference learning",
        "Ingredient substitution",
        "Meal timing optimization",
      ],
      example: "You've been avoiding gluten for 3 months—here's a modified version of your favorite pasta recipe.",
      color: "text-yellow-500",
      timeline: "Available Now",
    },
    {
      icon: Brain,
      title: "Research Assistants with Memory",
      subtitle: "Research AI",
      description: "Scientific research AI that remembers every paper read, connects insights, and generates new hypotheses.",
      benefits: [
        "Literature comprehension",
        "Cross-domain connection",
        "Hypothesis generation",
        "Experiment pattern learning",
      ],
      example: "This protein structure reminds me of a 2019 paper you read—potential new binding site discovered.",
      color: "text-fuchsia-500",
      timeline: "In Development",
    },
    {
      icon: Home,
      title: "Smart Homes That Anticipate",
      subtitle: "Home AI",
      description: "Home systems that learn family routines, predict needs, and adapt to changing lifestyles.",
      benefits: [
        "Routine pattern learning",
        "Energy optimization",
        "Security adaptation",
        "Lifestyle anticipation",
      ],
      example: "Kids usually get home in 10 minutes—pre-heating their snacks and unlocking the back door.",
      color: "text-teal-500",
      timeline: "Available Now",
    },
    {
      icon: Dumbbell,
      title: "Fitness AI That Grows With You",
      subtitle: "Wellness AI",
      description: "Personal trainers that remember every workout, adapt to your progress, and optimize routines automatically.",
      benefits: [
        "Progress tracking memory",
        "Recovery pattern learning",
        "Injury prevention",
        "Goal adaptation",
      ],
      example: "Your left shoulder shows strain patterns—modifying tomorrow's routine to prevent injury.",
      color: "text-lime-500",
      timeline: "Available Now",
    },
  ];

  const coreCapabilities = [
    { icon: Brain, label: "Persistent Memory", description: "Multi-tier recall that never forgets" },
    { icon: Moon, label: "Offline Learning", description: "Pattern extraction between sessions" },
    { icon: Zap, label: "NEXUS Router", description: "Optimal AI provider selection" },
    { icon: Shield, label: "DEFENSE Shell", description: "Adaptive security & governance" },
    { icon: MessageSquare, label: "DECODE", description: "Context-aware conversation" },
    { icon: Plug, label: "Integration", description: "Enterprise adapters & API governance" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Use Cases — Real-World Applications | CMPSBL"
        description="How teams use CMPSBL: gaming NPCs with persistent memory, enterprise document intelligence, healthcare triage agents, legal research copilots, and financial risk modeling with DREAM cycles."
        canonical="https://cmpsbl.com/use-cases"
        keywords={[
          "AI use cases",
          "enterprise AI",
          "healthcare AI",
          "legal AI",
          "education AI",
          "retail AI",
          "customer support AI",
          "industry applications",
        ]}
      />

      <PublicNav />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Industry Applications
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              One Platform,
              <br />Every Industry
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              <Link to="/persistent-memory" className="text-primary hover:underline font-medium">Persistent memory</Link>,{" "}
              intelligent routing, and <Link to="/engines" className="text-primary hover:underline font-medium">adaptive security</Link> —{" "}
              CMPSBL powers{" "}
              <a href="https://en.wikipedia.org/wiki/Applications_of_artificial_intelligence" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AI applications</a>{" "}
              from <Link to="/gaming" className="text-primary hover:underline font-medium">gaming</Link>{" "}
              to healthcare to <Link to="/enterprise" className="text-primary hover:underline font-medium">enterprise ops</Link>.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Link to="/codelab">
                  <Code className="w-4 h-4" />
                  Start Building
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 hover:border-primary/30 transition-colors">
                <Link to="/contact">
                  <MessageSquare className="w-4 h-4" />
                  Talk to Sales
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Future Visions Grid */}
      <section className="py-20 bg-gradient-to-b from-card/20 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/30">
              <Clock className="w-3 h-3 mr-1" />
              What's Possible
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Where Persistent Memory Goes Next
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From self-healing aircraft to kitchens that learn your taste — see what's possible 
              when AI remembers, adapts, and improves over time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {futureVisions.map((vision, idx) => (
              <motion.div
                key={vision.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <Card className={cn(
                  "h-full border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden",
                  "hover:border-current/30 transition-all duration-300 card-lift shimmer-on-hover",
                  vision.color
                )}>
                  {/* Timeline badge */}
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px]",
                        vision.timeline === "Available Now" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : vision.timeline === "In Development"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-violet-500/10 text-violet-400 border-violet-500/30"
                      )}
                    >
                      {vision.timeline}
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-current/10 flex items-center justify-center">
                        <vision.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit mb-2 text-current border-current/30 text-[10px]">
                      {vision.subtitle}
                    </Badge>
                    <CardTitle className="text-lg">{vision.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {vision.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-1.5">
                      {vision.benefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-current opacity-60 shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-[11px] italic text-current/80">"{vision.example}"</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-12 border-y border-border/50 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Core Capabilities</h2>
            <p className="text-sm text-muted-foreground">The building blocks that power every use case</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {coreCapabilities.map((cap) => (
              <CapabilityPill key={cap.label} {...cap} />
            ))}
          </div>
        </div>
      </section>

      {/* Industry Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Every Industry
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how teams across sectors use persistent memory and intelligent routing 
              to build AI applications that actually learn.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {industries.map((industry, idx) => (
              <IndustryCard key={industry.title} {...industry} delay={idx * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* Install Wizard CTA */}
      <section className="py-20 bg-gradient-to-b from-card/30 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready-Made Capability Packs by Industry
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Choose your industry — Gaming, Developer, or Enterprise — and activate only 
                  the packs you need. No bloat, just the right capabilities.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <Badge variant="outline" className="text-primary border-primary/30">
                    🎮 Gaming Package
                  </Badge>
                  <Badge variant="outline" className="text-accent-foreground border-accent/30">
                    💻 Developer Package
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground border-border">
                    🏢 Enterprise Package
                  </Badge>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Link to="/explore">
                      <Play className="w-4 h-4" />
                      Browse Artifacts
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2 hover:border-primary/30 transition-colors">
                    <Link to="/documentation">
                      <BookOpen className="w-4 h-4" />
                      View Docs
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <RelatedCapabilities />
      <PageSEOBlock path="/use-cases" title="Use Cases" />
      <EnhancedFooter />
    </div>
  );
}
