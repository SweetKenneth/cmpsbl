/**
 * Industry Showcase — Homepage section showing CMPSBL versatility
 * Enhanced with better visuals and clearer messaging
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Gamepad2,
  Building2,
  Stethoscope,
  Scale,
  GraduationCap,
  ShoppingCart,
  Phone,
  Factory,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Industry {
  icon: React.ElementType;
  title: string;
  tagline: string;
  example: string;
  color: string;
  gradient: string;
  href?: string;
}

const industries: Industry[] = [
  {
    icon: Gamepad2,
    title: "Gaming",
    tagline: "NPCs that remember every player interaction",
    example: "You saved my village 3 sessions ago—take this reward.",
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-violet-500/20",
    href: "/gaming",
  },
  {
    icon: Building2,
    title: "Enterprise",
    tagline: "Operations that learn and optimize autonomously",
    example: "Q4 reports auto-generated based on historical patterns",
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-indigo-500/20",
    href: "/use-cases",
  },
  {
    icon: Stethoscope,
    title: "Healthcare",
    tagline: "Patient journeys remembered across encounters",
    example: "Flagging drug interaction from 2 years ago during triage",
    color: "text-emerald-500",
    gradient: "from-emerald-500/20 to-green-500/20",
    href: "/use-cases",
  },
  {
    icon: Scale,
    title: "Legal",
    tagline: "Case precedents learned from every outcome",
    example: "73% similar cases contested this clause successfully",
    color: "text-amber-500",
    gradient: "from-amber-500/20 to-yellow-500/20",
    href: "/use-cases",
  },
  {
    icon: GraduationCap,
    title: "Education",
    tagline: "Student progress tracked across semesters",
    example: "Adapting curriculum to each learner's pace",
    color: "text-cyan-500",
    gradient: "from-cyan-500/20 to-teal-500/20",
    href: "/use-cases",
  },
  {
    icon: ShoppingCart,
    title: "Retail",
    tagline: "Customer preferences remembered forever",
    example: "Pre-stocking items before seasonal demand",
    color: "text-rose-500",
    gradient: "from-rose-500/20 to-pink-500/20",
    href: "/use-cases",
  },
  {
    icon: Phone,
    title: "Support",
    tagline: "Full context from every past interaction",
    example: "I see you called twice about this—escalating now.",
    color: "text-violet-500",
    gradient: "from-violet-500/20 to-purple-500/20",
    href: "/use-cases",
  },
  {
    icon: Factory,
    title: "Manufacturing",
    tagline: "Equipment patterns trigger predictive maintenance",
    example: "Vibration signature matches pre-failure from 6mo ago",
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-red-500/20",
    href: "/use-cases",
  },
];

function IndustryCard({ industry, delay = 0 }: { industry: Industry; delay?: number }) {
  const Icon = industry.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
    >
      <Link 
        to={industry.href || "/use-cases"} 
        className="group block h-full"
      >
        <div className={cn(
          "relative h-full p-5 sm:p-6 rounded-2xl border border-border/50 overflow-hidden",
          "bg-card/50 backdrop-blur-sm",
          "hover:border-current/40 transition-all duration-300",
          "hover:shadow-lg",
          industry.color
        )}>
          {/* Gradient background on hover */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "bg-gradient-to-br",
            industry.gradient
          )} />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-start gap-4 mb-3">
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                "bg-current/10 group-hover:bg-current/20 transition-colors",
                "group-hover:scale-110 transition-transform duration-300"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground mb-1 group-hover:text-current transition-colors">
                  {industry.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {industry.tagline}
                </p>
              </div>
            </div>
            
            {/* Example quote */}
            <div className={cn(
              "p-3 rounded-lg bg-background/50 border border-border/30",
              "group-hover:bg-background/70 transition-colors"
            )}>
              <p className="text-xs text-current/80 italic leading-relaxed">
                "{industry.example}"
              </p>
            </div>
            
            {/* Arrow indicator */}
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4 text-current" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function IndustryShowcase() {
  return (
    <section className="relative py-20 sm:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-14"
        >
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Sparkles className="w-3 h-3" />
            Universal Infrastructure
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            One CMPSBL,{" "}
            <span 
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Every Industry
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Persistent memory and dream cycles adapt to any domain. 
            From NPC brains to enterprise automation.
          </p>
        </motion.div>
        
        {/* Industry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10 sm:mb-12">
          {industries.map((industry, idx) => (
            <IndustryCard 
              key={industry.title} 
              industry={industry} 
              delay={idx * 0.05} 
            />
          ))}
        </div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button asChild size="lg" variant="outline" className="gap-2 h-12 px-8">
            <Link to="/use-cases">
              Explore All Use Cases
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
