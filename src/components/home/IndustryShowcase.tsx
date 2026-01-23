/**
 * Industry Showcase — Homepage section showing CMPSBL versatility
 * Premium cards with hover effects and clear industry-specific messaging
 */

import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
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
  Quote,
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
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      <Link 
        to={industry.href || "/use-cases"} 
        className="group block h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div 
          className={cn(
            "relative h-full p-5 sm:p-6 rounded-2xl border border-border/50 overflow-hidden",
            "bg-card/50 backdrop-blur-sm",
            "hover:border-current/50 transition-all duration-300",
            "hover:shadow-xl",
            industry.color
          )}
          animate={{ y: isHovered ? -4 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Gradient background on hover */}
          <motion.div 
            className={cn(
              "absolute inset-0",
              "bg-gradient-to-br",
              industry.gradient
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Glow effect */}
          <motion.div
            className="absolute -inset-px rounded-2xl opacity-0"
            style={{
              background: `linear-gradient(135deg, currentColor, transparent)`,
            }}
            animate={{ opacity: isHovered ? 0.1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-start gap-4 mb-4">
              <motion.div 
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  "bg-current/10 group-hover:bg-current/20 transition-colors"
                )}
                animate={{ scale: isHovered ? 1.1 : 1, rotate: isHovered ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground mb-1 group-hover:text-current transition-colors">
                  {industry.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {industry.tagline}
                </p>
              </div>
            </div>
            
            {/* Example quote - enhanced */}
            <div className={cn(
              "relative p-4 rounded-xl bg-background/60 border border-border/30",
              "group-hover:bg-background/80 transition-all duration-300",
              "group-hover:border-current/20"
            )}>
              <Quote className="absolute top-2 left-2 w-3 h-3 text-current/30" />
              <p className="text-xs text-foreground/80 italic leading-relaxed pl-4">
                {industry.example}
              </p>
            </div>
            
            {/* Arrow indicator with animation */}
            <motion.div 
              className="absolute top-0 right-0"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -5 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-4 h-4 text-current" />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function IndustryShowcase() {
  return (
    <section className="relative py-20 sm:py-32 px-4 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs">Universal Infrastructure</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 tracking-tight">
            One CMPSBL,{" "}
            <span 
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-magenta)))",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradientShift 4s ease-in-out infinite",
              }}
            >
              Every Industry
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Persistent memory and dream cycles adapt to any domain. 
            From <span className="text-foreground font-medium">NPC brains</span> to 
            <span className="text-foreground font-medium"> enterprise automation</span>.
          </p>
        </motion.div>
        
        {/* Industry Grid - enhanced spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-12 sm:mb-16">
          {industries.map((industry, idx) => (
            <IndustryCard 
              key={industry.title} 
              industry={industry} 
              delay={idx * 0.06} 
            />
          ))}
        </div>
        
        {/* CTA with gradient border */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button 
            asChild 
            size="lg" 
            className="gap-2 h-12 px-8 bg-gradient-to-r from-primary via-violet-600 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
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
