/**
 * Explore — The Gateway Beyond
 * A masterpiece secondary home with modern CTAs and navigation
 */

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Brain, 
  Shield, 
  Zap, 
  Eye, 
  Moon, 
  Terminal, 
  MessageSquare,
  Sparkles,
  Play,
  ChevronDown,
  ExternalLink,
  Cpu,
  Database,
  Lock,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

// Animated gradient orb component
function GradientOrb({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
      className={cn(
        "absolute rounded-full blur-[100px] pointer-events-none",
        className
      )}
    />
  );
}

// Feature card with hover effects
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  href, 
  color,
  delay = 0
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  href: string;
  color: string;
  delay?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
    >
      <Link 
        to={href}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group block relative"
      >
        <div className={cn(
          "relative p-6 md:p-8 rounded-2xl border transition-all duration-500",
          "bg-card/50 backdrop-blur-sm",
          "hover:bg-card/80 hover:border-current/30",
          "hover:shadow-2xl hover:-translate-y-1",
          color
        )}>
          {/* Glow effect */}
          <div className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl -z-10",
            color.replace('text-', 'bg-').replace('border-', 'bg-')
          )} />
          
          {/* Icon */}
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-500",
            "bg-current/10 group-hover:bg-current/20 group-hover:scale-110",
            color
          )}>
            <Icon className="w-7 h-7" />
          </div>
          
          {/* Content */}
          <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-current transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {description}
          </p>
          
          {/* Arrow */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
            <ArrowRight className={cn(
              "w-4 h-4 transition-all duration-300",
              "group-hover:translate-x-1"
            )} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Large CTA block
function CTABlock({
  title,
  subtitle,
  href,
  primary = false,
  icon: Icon,
  delay = 0
}: {
  title: string;
  subtitle: string;
  href: string;
  primary?: boolean;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <Link to={href} className="group block">
        <div className={cn(
          "relative p-8 md:p-12 rounded-3xl border overflow-hidden transition-all duration-500",
          primary 
            ? "bg-gradient-to-br from-primary/20 via-primary/10 to-violet-500/10 border-primary/30 hover:border-primary/50"
            : "bg-card/50 border-border/50 hover:border-border",
          "hover:shadow-2xl hover:-translate-y-1"
        )}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />
          </div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-6",
                primary ? "bg-primary/20" : "bg-muted"
              )}>
                <Icon className={cn("w-6 h-6", primary ? "text-primary" : "text-muted-foreground")} />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
                {title}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {subtitle}
              </p>
            </div>
            
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
              primary ? "bg-primary text-primary-foreground" : "bg-muted",
              "group-hover:scale-110 group-hover:shadow-lg"
            )}>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Animated section divider
function SectionDivider() {
  return (
    <div className="relative py-16">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <motion.div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  
  const features = [
    {
      icon: Terminal,
      title: "Substrate OS",
      description: "Live cognitive dashboard with real-time telemetry, command interface, and system observability.",
      href: "/os",
      color: "text-cyan-500 border-cyan-500/20",
    },
    {
      icon: MessageSquare,
      title: "Decode",
      description: "Epistemic conversation interface. Ask questions, explore ideas, dream forward.",
      href: "/decode",
      color: "text-purple-500 border-purple-500/20",
    },
    {
      icon: Shield,
      title: "Defense",
      description: "Behavioral analysis, threat detection, and IP reputation for substrate protection.",
      href: "/substrate",
      color: "text-amber-500 border-amber-500/20",
    },
    {
      icon: Zap,
      title: "Nexus",
      description: "Multi-provider AI routing. Optimal model selection based on task, cost, and latency.",
      href: "/substrate",
      color: "text-green-500 border-green-500/20",
    },
    {
      icon: Eye,
      title: "Vision",
      description: "Unified observability layer with metrics, health monitoring, and audit trails.",
      href: "/substrate",
      color: "text-blue-500 border-blue-500/20",
    },
    {
      icon: Moon,
      title: "Dream-Eater",
      description: "Feed dreams to the substrate. Watch patterns emerge. Witness transformation.",
      href: "/feed-dream-eater",
      color: "text-violet-500 border-violet-500/20",
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden">
      <SEO 
        title="Explore — promptfluid®"
        description="Discover the cognitive orchestration substrate. Demo, proof mode, documentation, and live system access."
        canonical="https://promptfluid.com/explore"
      />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0">
          <GradientOrb className="w-[600px] h-[600px] -top-48 -left-48 bg-primary/30" delay={0} />
          <GradientOrb className="w-[500px] h-[500px] top-1/3 -right-48 bg-violet-500/20" delay={0.2} />
          <GradientOrb className="w-[400px] h-[400px] bottom-0 left-1/3 bg-cyan-500/15" delay={0.4} />
        </motion.div>
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 px-4 py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-foreground">promptfluid</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/decode">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Start Exploring
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-2" />
              Cognitive Infrastructure
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Discover the
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                Substrate
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Six interconnected modules working in harmony. Memory, routing, defense, 
              observability, and dream-state processing—all orchestrated.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/demo">
              <Button size="lg" className="gap-2 px-8 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90">
                <Play className="w-4 h-4" />
                Watch Demo
              </Button>
            </Link>
            <Link to="/proof">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                <Lock className="w-4 h-4" />
                Proof Mode
              </Button>
            </Link>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="text-xs uppercase tracking-widest">Explore Modules</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Modules</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each module operates independently while contributing to the collective intelligence.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard 
                key={feature.title}
                {...feature}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Primary CTAs */}
      <section className="relative z-10 px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience It</h2>
            <p className="text-muted-foreground">
              Live systems. Real infrastructure. No simulations.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <CTABlock
              title="Interactive Demo"
              subtitle="Walk through the substrate capabilities with guided examples and live interactions."
              href="/demo"
              icon={Play}
              primary
              delay={0}
            />
            <CTABlock
              title="Proof Mode"
              subtitle="Verify every claim. Cryptographic receipts for all AI outputs and system operations."
              href="/proof"
              icon={Lock}
              delay={0.1}
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <CTABlock
              title="Documentation"
              subtitle="Technical specifications and integration guides."
              href="/documentation"
              icon={Layers}
              delay={0.2}
            />
            <CTABlock
              title="Substrate Dashboard"
              subtitle="Real-time metrics and system visualization."
              href="/substrate"
              icon={Database}
              delay={0.3}
            />
            <CTABlock
              title="Changelog"
              subtitle="Track every evolution of the substrate."
              href="/changelog"
              icon={Cpu}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Stats / Trust Section */}
      <section className="relative z-10 px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "6", label: "Live Modules" },
              { value: "100+", label: "Projects Shipped" },
              { value: "24/7", label: "Autonomous Operation" },
              { value: "∞", label: "Dreams Consumed" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="p-12 md:p-16 rounded-3xl bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Begin?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start a conversation with Decode. Ask anything. Dream forward.
            </p>
            <Link to="/decode">
              <Button size="lg" className="px-10 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90">
                Enter the Substrate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <p>© {new Date().getFullYear()} promptfluid® — All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
