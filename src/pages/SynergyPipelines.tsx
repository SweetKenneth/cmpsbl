/**
 * Synergy Pipelines Discovery Page
 * SPARTA Epoch — FREE exploration layer with runnable code examples
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { useMetric } from "@/stores/publicMetricsStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Brain, 
  Zap, 
  Shield, 
  Eye, 
  Cpu,
  Network,
  Layers,
  Sparkles,
  Search,
  ArrowRight,
  ChevronDown,
  Combine,
  GitMerge,
  Workflow,
  ArrowUpRight,
  Play,
  Clock,
  AlertTriangle,
  Check,
  LucideIcon,
  Copy,
  Code,
  Terminal,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SYNERGY_DEFINITIONS } from "@/lib/capabilities/synergies/registry";
import { toast } from "sonner";

// Category colors and icons
const categoryConfig: Record<string, { 
  color: string; 
  bgColor: string; 
  icon: LucideIcon;
  gradient: string;
}> = {
  intelligence: { 
    color: "text-violet-400", 
    bgColor: "bg-violet-500/10 border-violet-500/30", 
    icon: Brain,
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent"
  },
  optimization: { 
    color: "text-cyan-400", 
    bgColor: "bg-cyan-500/10 border-cyan-500/30", 
    icon: Zap,
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent"
  },
  security: { 
    color: "text-red-400", 
    bgColor: "bg-red-500/10 border-red-500/30", 
    icon: Shield,
    gradient: "from-red-500/20 via-orange-500/10 to-transparent"
  },
  resilience: { 
    color: "text-emerald-400", 
    bgColor: "bg-emerald-500/10 border-emerald-500/30", 
    icon: Layers,
    gradient: "from-emerald-500/20 via-green-500/10 to-transparent"
  },
  accessibility: { 
    color: "text-amber-400", 
    bgColor: "bg-amber-500/10 border-amber-500/30", 
    icon: Eye,
    gradient: "from-amber-500/20 via-yellow-500/10 to-transparent"
  },
  automation: { 
    color: "text-pink-400", 
    bgColor: "bg-pink-500/10 border-pink-500/30", 
    icon: Workflow,
    gradient: "from-pink-500/20 via-rose-500/10 to-transparent"
  },
  orchestration: { 
    color: "text-blue-400", 
    bgColor: "bg-blue-500/10 border-blue-500/30", 
    icon: Network,
    gradient: "from-blue-500/20 via-indigo-500/10 to-transparent"
  },
};

// Module colors for visual distinction
const moduleColors: Record<string, string> = {
  BRAIN: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  CORTEX: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  DECODE: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  NEXUS: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  VISION: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  DEFENSE: "bg-red-500/20 text-red-300 border-red-500/40",
  DREAM: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  RIPPLE: "bg-teal-500/20 text-teal-300 border-teal-500/40",
  SYSTEM: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  CORE: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  MODERNIZER: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  ACCESS: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  INTEGRATION: "bg-lime-500/20 text-lime-300 border-lime-500/40",
  INCLUSIVE: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
};

// Generate code snippet for a synergy
function generateSynergyCode(synergy: typeof SYNERGY_DEFINITIONS[0]): string {
  const modules = synergy.modules.filter(m => m.required).map(m => m.name.toLowerCase());
  const primaryModule = synergy.modules.find(m => m.role === 'primary')?.name.toLowerCase() || modules[0];
  
  return `import { substrate } from './lib/substrate';

// ${synergy.name}
// ${synergy.description}
async function ${synergy.id.replace(/-/g, '_')}(input: string) {
  // Step 1: ${synergy.modules[0]?.name || 'Primary'} processing
  const result = await substrate.synergy.run('${synergy.id}', {
    input,
    modules: [${modules.map(m => `'${m}'`).join(', ')}],
    options: { dryRun: false }
  });
  
  return result.data;
}

// Usage
const output = await ${synergy.id.replace(/-/g, '_')}("your input here");
console.log('Result:', output);`;
}

function HeroSection() {
  const pipelinesCount = useMetric('synergyPipelinesCount');
  const modulesCount = useMetric('modulesCount');
  const executorsCount = useMetric('synergyExecutorsCount');
  
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Neural network visualization */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          {/* Connection lines */}
          {[...Array(20)].map((_, i) => (
            <motion.line
              key={i}
              x1={100 + Math.random() * 300}
              y1={100 + Math.random() * 400}
              x2={600 + Math.random() * 300}
              y2={100 + Math.random() * 400}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.6, 0.3] }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                delay: i * 0.2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--neon-cyan))" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Floating module orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {Object.entries(moduleColors).slice(0, 8).map(([module, _], i) => (
          <motion.div
            key={module}
            className={cn(
              "absolute w-16 h-16 rounded-full blur-xl opacity-40",
              i % 2 === 0 ? "bg-primary" : "bg-[hsl(var(--neon-cyan))]"
            )}
            style={{
              left: `${15 + (i % 4) * 25}%`,
              top: `${20 + Math.floor(i / 4) * 40}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 container max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <Badge 
            variant="outline" 
            className="mb-6 px-4 py-2 text-sm border-emerald-500/30 bg-emerald-500/5"
          >
            <Combine className="w-4 h-4 mr-2" />
            FREE — Synergy Pipelines
          </Badge>
          
          {/* Main title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="block text-foreground">Where Modules</span>
            <span className="block mt-2 bg-gradient-to-r from-primary via-[hsl(var(--neon-cyan))] to-primary bg-clip-text text-transparent">
              Become Greater
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
            Synergy Pipelines demonstrate powerful orchestration patterns. Explore freely — engines are the hardened, saved versions.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Pipelines are ephemeral: execution and inspection only. No save, register, or version capabilities.
          </p>
          
          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            {[
              { value: String(pipelinesCount), label: "Pipelines", icon: GitMerge },
              { value: String(modulesCount), label: "Modules", icon: Cpu },
              { value: "7", label: "Categories", icon: Layers },
              { value: String(executorsCount), label: "Executors", icon: Workflow },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </div>
          
          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => document.getElementById('explorer')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Pipelines
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2"
              asChild
            >
              <Link to="/os">
                Try in Terminal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10"
              asChild
            >
              <Link to="/docs/persistent-memory">
                <Brain className="w-4 h-4" />
                Add Persistent Memory (FREE)
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ConceptSection() {
  const concepts = [
    {
      icon: Combine,
      title: "Modular Fusion",
      description: "Each of our execution surfaces operates as an independent cognitive unit. When combined, they create capabilities that emerge from their interaction — not just the sum of their parts."
    },
    {
      icon: GitMerge,
      title: "Dynamic Discovery",
      description: "The Synergy Engine continuously discovers new pipeline combinations based on usage patterns, performance data, and emergent behaviors across the substrate."
    },
    {
      icon: Workflow,
      title: "Orchestrated Execution",
      description: "Pipelines chain module outputs into subsequent inputs, enabling complex multi-step cognitive workflows with full tracing and dry-run capabilities."
    },
  ];
  
  return (
    <section className="py-24 bg-muted/30">
      <div className="container max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            The Art of Cognitive Synergy
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Understanding how modular intelligence creates emergent capabilities
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {concepts.map((concept, i) => (
            <motion.div
              key={concept.title}
              className="relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <concept.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{concept.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{concept.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Visual diagram */}
        <div className="mt-16 p-8 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">Pipeline Execution Flow</h3>
            <p className="text-sm text-muted-foreground">How modules combine for emergent intelligence</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            {["DECODE", "→", "BRAIN", "→", "NEXUS", "→", "CORTEX", "→", "OUTPUT"].map((item, i) => (
              item === "→" ? (
                <ArrowRight key={i} className="w-5 h-5 text-primary hidden sm:block" />
              ) : item === "OUTPUT" ? (
                <div key={i} className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-[hsl(var(--neon-cyan))]/20 border border-primary/30">
                  <span className="text-sm font-medium text-primary">Enhanced Output</span>
                </div>
              ) : (
                <div key={i} className={cn("px-4 py-2 rounded-lg border", moduleColors[item] || "bg-muted")}>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              )
            ))}
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Each module enriches the data stream, creating capabilities none could achieve alone
          </p>
        </div>
      </div>
    </section>
  );
}

function SynergyExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSynergy, setExpandedSynergy] = useState<string | null>(null);
  
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    SYNERGY_DEFINITIONS.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      config: categoryConfig[name] || categoryConfig.intelligence,
    }));
  }, []);
  
  const filteredSynergies = useMemo(() => {
    return SYNERGY_DEFINITIONS.filter(synergy => {
      const matchesCategory = !selectedCategory || synergy.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        synergy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        synergy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        synergy.modules.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);
  
  return (
    <section id="explorer" className="py-24">
      <div className="container max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Pipeline Explorer
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse all 300 synergy pipelines across execution surfaces, filter by category, and discover how surfaces combine
          </p>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search pipelines, modules, or capabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All ({SYNERGY_DEFINITIONS.length})
            </Button>
            {categories.map(cat => {
              const Icon = cat.config.icon;
              return (
                <Button
                  key={cat.name}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.name)}
                  className="gap-2"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="capitalize hidden sm:inline">{cat.name}</span>
                  <span className="text-xs opacity-70">({cat.count})</span>
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* Results count */}
        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredSynergies.length} of {SYNERGY_DEFINITIONS.length} pipelines
        </div>
        
        {/* Pipeline grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredSynergies.map((synergy, i) => {
              const catConfig = categoryConfig[synergy.category] || categoryConfig.intelligence;
              const isExpanded = expandedSynergy === synergy.id;
              
              return (
                <motion.div
                  key={synergy.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className={cn(
                    "group relative p-5 rounded-xl border transition-all cursor-pointer",
                    "bg-card/50 backdrop-blur-sm hover:bg-card/80",
                    catConfig.bgColor,
                    isExpanded && "col-span-full md:col-span-2 lg:col-span-3"
                  )}
                  onClick={() => setExpandedSynergy(isExpanded ? null : synergy.id)}
                >
                  {/* Category gradient accent */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                    catConfig.gradient
                  )} />
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <catConfig.icon className={cn("w-5 h-5", catConfig.color)} />
                        <Badge variant="outline" className="text-xs capitalize">
                          {synergy.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {synergy.estimatedMs}ms
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {synergy.name}
                    </h3>
                    
                    {/* Description */}
                    <p className={cn(
                      "text-sm text-muted-foreground mb-4",
                      !isExpanded && "line-clamp-2"
                    )}>
                      {synergy.description}
                    </p>
                    
                    {/* Modules */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {synergy.modules.map(mod => (
                        <span
                          key={mod.name}
                          className={cn(
                            "px-2 py-1 text-xs rounded-md border font-medium",
                            moduleColors[mod.name] || "bg-muted",
                            !mod.required && "opacity-60"
                          )}
                        >
                          {mod.name}
                          {mod.role === 'primary' && (
                            <Sparkles className="w-3 h-3 inline ml-1" />
                          )}
                        </span>
                      ))}
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "flex items-center gap-1",
                          synergy.risk === 'low' ? "text-emerald-400" :
                          synergy.risk === 'medium' ? "text-amber-400" : "text-red-400"
                        )}>
                          <AlertTriangle className="w-3 h-3" />
                          {synergy.risk} risk
                        </span>
                        {synergy.reversible && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Check className="w-3 h-3" />
                            reversible
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {synergy.minModulesRequired}+ modules
                      </span>
                    </div>
                    
                    {/* Expanded content with CODE SNIPPETS */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 pt-6 border-t border-border/50 space-y-6"
                      >
                        {/* What this does */}
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            What this does
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {synergy.description}
                          </p>
                        </div>
                        
                        {/* When to use */}
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            When to use
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Use when you need {synergy.modules.filter(m => m.required).map(m => m.name).join(' + ')} to work together.
                            {synergy.risk === 'low' ? ' Safe for production.' : synergy.risk === 'medium' ? ' Test thoroughly before production.' : ' Requires careful monitoring.'}
                          </p>
                        </div>
                        
                        {/* Code Snippet */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <Code className="w-4 h-4 text-emerald-400" />
                              Code Snippet
                            </h4>
                            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                              <Combine className="w-3 h-3 mr-1" />
                              Composable
                            </Badge>
                          </div>
                          <div className="relative">
                            <pre className="bg-muted/80 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-border/50">
                              <code>{generateSynergyCode(synergy)}</code>
                            </pre>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute top-2 right-2 gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(generateSynergyCode(synergy));
                                toast.success("Code copied!");
                              }}
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </Button>
                          </div>
                        </div>
                        
                        {/* CLI Command */}
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-violet-400" />
                            CLI Command
                          </h4>
                          <div className="relative">
                            <pre className="bg-muted/80 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-border/50">
                              <code>synergy.run {synergy.id} --input '&#123;"query": "your input"&#125;'</code>
                            </pre>
                          </div>
                        </div>
                        
                        {/* Module Roles */}
                        <div>
                          <h4 className="font-medium mb-3">Module Roles</h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {synergy.modules.map(mod => (
                              <div 
                                key={mod.name}
                                className={cn(
                                  "p-3 rounded-lg border",
                                  moduleColors[mod.name] || "bg-muted"
                                )}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{mod.name}</span>
                                  <Badge variant="outline" className="text-[10px]">
                                    {mod.role}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {mod.required ? "Required for execution" : "Optional enhancement"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button size="sm" className="gap-2" asChild>
                            <Link to="/os">
                              <Play className="w-3.5 h-3.5" />
                              Execute in Terminal
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <Link to="/docs/substrate/capabilities">
                              View Documentation
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {filteredSynergies.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No pipelines match your search criteria</p>
            <Button 
              variant="ghost" 
              className="mt-4"
              onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-4xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Experience Cognitive Synergy
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Run pipelines directly from the terminal, chain multiple synergies together, 
            and watch as your system evolves through multi-module intelligence.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="gap-2" asChild>
              <Link to="/os">
                <Cpu className="w-5 h-5" />
                Open Substrate Terminal
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <Link to="/explore">
                <Layers className="w-5 h-5" />
                Explore
              </Link>
            </Button>
          </div>
          
          {/* Terminal preview */}
          <div className="mt-12 p-4 rounded-xl bg-black/80 border border-border/50 text-left font-mono text-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-muted-foreground text-xs">substrate-terminal</span>
            </div>
            <div className="space-y-1 text-xs">
              <p><span className="text-emerald-400">$</span> cortex.synergy.execute cognitive-fusion</p>
              <p className="text-muted-foreground">→ Initializing NEXUS multi-provider reasoning...</p>
              <p className="text-muted-foreground">→ Fusing with BRAIN memory context...</p>
              <p className="text-muted-foreground">→ Enhancing with VISION performance data...</p>
              <p className="text-emerald-400">✓ Pipeline complete: 600ms, confidence: 0.94</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function SynergyPipelines() {
  return (
    <>
      <SEO
        title="Synergy Pipelines — Cognitive Fusion | CMPSBL"
        description="Multi-module cognitive fusion pipelines combining execution surfaces for emergent AI capabilities. BRAIN, CORTEX, DECODE, and more in orchestrated composition."
        keywords={['synergy pipelines', 'cognitive fusion', 'multi-module AI', 'emergent intelligence', 'AI orchestration pipelines']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Explore', url: 'https://cmpsbl.com/explore' },
          { name: 'Synergy Pipelines', url: 'https://cmpsbl.com/synergy-pipelines' },
        ]}
      />
      
      <div className="min-h-screen bg-background">
        {/* Simple header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container max-w-7xl px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Combine className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">Synergy Pipelines</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Explore
              </Link>
              <Link to="/substrate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Substrate
              </Link>
              <Link to="/documentation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
              <Button size="sm" asChild>
                <Link to="/os">Open Terminal</Link>
              </Button>
            </nav>
            <Button variant="ghost" size="sm" className="md:hidden" asChild>
              <Link to="/os">Terminal</Link>
            </Button>
          </div>
        </header>
        
        <main className="pt-16">
          <HeroSection />
          <ConceptSection />
          <SynergyExplorer />
          <CTASection />
        </main>
        
        <EnhancedFooter />
      </div>
    </>
  );
}
