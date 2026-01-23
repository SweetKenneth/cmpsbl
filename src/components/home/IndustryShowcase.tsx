/**
 * Industry Showcase — Homepage section showing Substrate versatility
 * Displays use cases across Gaming, Enterprise, Healthcare, Legal, Education, Retail
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
  CheckCircle2,
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
  href?: string;
}

const industries: Industry[] = [
  {
    icon: Gamepad2,
    title: "Gaming",
    tagline: "NPCs that remember every player interaction",
    example: "\"You saved my village 3 sessions ago—take this reward.\"",
    color: "text-purple-500",
    href: "/gaming",
  },
  {
    icon: Building2,
    title: "Enterprise",
    tagline: "Operations that learn and optimize autonomously",
    example: "Q4 reports auto-generated based on historical patterns",
    color: "text-blue-500",
    href: "/use-cases",
  },
  {
    icon: Stethoscope,
    title: "Healthcare",
    tagline: "Patient journeys remembered across encounters",
    example: "Flagging drug interaction from 2 years ago during triage",
    color: "text-emerald-500",
    href: "/use-cases",
  },
  {
    icon: Scale,
    title: "Legal",
    tagline: "Case precedents learned from every outcome",
    example: "73% similar cases contested this clause successfully",
    color: "text-amber-500",
    href: "/use-cases",
  },
  {
    icon: GraduationCap,
    title: "Education",
    tagline: "Student progress tracked across semesters",
    example: "Adapting curriculum to each learner's pace",
    color: "text-cyan-500",
    href: "/use-cases",
  },
  {
    icon: ShoppingCart,
    title: "Retail",
    tagline: "Customer preferences remembered forever",
    example: "Pre-stocking items before seasonal demand",
    color: "text-rose-500",
    href: "/use-cases",
  },
  {
    icon: Phone,
    title: "Support",
    tagline: "Full context from every past interaction",
    example: "\"I see you called twice about this—escalating now.\"",
    color: "text-violet-500",
    href: "/use-cases",
  },
  {
    icon: Factory,
    title: "Manufacturing",
    tagline: "Equipment patterns trigger predictive maintenance",
    example: "Vibration signature matches pre-failure from 6mo ago",
    color: "text-orange-500",
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
          "h-full p-4 sm:p-5 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm",
          "hover:bg-card/60 hover:border-current/30 transition-all duration-300",
          industry.color
        )}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground mb-0.5 group-hover:text-current transition-colors">
                {industry.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {industry.tagline}
              </p>
              <p className="text-[10px] sm:text-xs text-current/70 italic line-clamp-2">
                {industry.example}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function IndustryShowcase() {
  return (
    <section className="relative py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <Badge variant="outline" className="mb-4">Universal Infrastructure</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            One Substrate, Every Industry
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Persistent memory and dream cycles adapt to any domain. 
            From NPC brains to enterprise automation.
          </p>
        </motion.div>
        
        {/* Industry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
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
          <Button asChild variant="outline" className="gap-2">
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
