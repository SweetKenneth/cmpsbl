/**
 * Tech Showcase — Interactive demonstration of CMPSBL capabilities
 * Shows code examples and live visualizations
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Moon, 
  Zap, 
  Terminal,
  Copy,
  Check,
  Play,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const codeExamples = [
  {
    id: "memory",
    icon: Brain,
    title: "Persistent Memory",
    description: "Store and recall context across sessions",
    color: "text-cyan-500",
    gradient: "from-cyan-500 to-blue-600",
    code: `// Store a memory with semantic context
await cmpsbl.brain.remember({
  entity_id: "user_jane_doe",
  memory: {
    type: "preference",
    content: "Prefers dark mode and concise responses",
    emotional_weight: 0.9,
    tags: ["ui", "communication", "style"]
  }
});

// Recall relevant memories later
const context = await cmpsbl.brain.recall({
  entity_id: "user_jane_doe",
  query: "How does this user prefer to communicate?",
  limit: 5
});`,
  },
  {
    id: "dream",
    icon: Moon,
    title: "Dream Cycles",
    description: "Consolidate learnings during idle time",
    color: "text-violet-500",
    gradient: "from-violet-500 to-purple-600",
    code: `// Trigger a dream cycle for memory consolidation
const dreamResult = await cmpsbl.dream.cycle({
  entity_ids: ["npc_merchant_01", "npc_guard_05"],
  mode: "consolidate",
  options: {
    extract_patterns: true,
    prune_weak_memories: true,
    min_confidence: 0.3
  }
});

// Check what patterns were discovered
console.log(dreamResult.patterns_extracted);
// ["player_prefers_stealth", "avoids_combat", "collects_rare_items"]`,
  },
  {
    id: "routing",
    icon: Zap,
    title: "Smart Routing",
    description: "Optimal AI provider selection",
    color: "text-green-500",
    gradient: "from-green-500 to-emerald-600",
    code: `// Let CMPSBL choose the best provider
const response = await cmpsbl.nexus.route({
  task: "complex_reasoning",
  prompt: userMessage,
  constraints: {
    max_latency_ms: 2000,
    max_cost_cents: 5,
    min_quality: "high"
  },
  fallback_chain: ["gpt-4", "claude-3", "gemini-pro"]
});

// Response includes provider used and metrics
console.log(response.provider); // "claude-3"
console.log(response.latency_ms); // 847`,
  },
];

export function TechShowcase() {
  const [activeTab, setActiveTab] = useState("memory");
  const [copied, setCopied] = useState(false);
  
  const activeExample = codeExamples.find(e => e.id === activeTab) || codeExamples[0];
  
  const handleCopy = () => {
    navigator.clipboard.writeText(activeExample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <section className="relative py-20 sm:py-28 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-14"
        >
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Terminal className="w-3 h-3" />
            See It In Action
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Simple{" "}
            <span 
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-green)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Integration
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            A few lines of code to add persistent memory, dream cycles, 
            and intelligent routing to any application.
          </p>
        </motion.div>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {codeExamples.map((example) => (
            <button
              key={example.id}
              onClick={() => setActiveTab(example.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300",
                activeTab === example.id
                  ? `bg-gradient-to-r ${example.gradient} text-white border-transparent shadow-lg`
                  : "bg-card/50 border-border/50 text-muted-foreground hover:bg-card/80"
              )}
            >
              <example.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{example.title}</span>
            </button>
          ))}
        </div>
        
        {/* Code Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="rounded-2xl border border-border/50 bg-black/80 backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-white/40 ml-2">example.ts</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-green-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Code content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6 overflow-x-auto"
              >
                <pre className="text-sm leading-relaxed">
                  <code className="text-green-400 font-mono">
                    {activeExample.code}
                  </code>
                </pre>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Description card */}
          <motion.div
            key={activeTab + "-desc"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:block"
          >
            <div className={cn(
              "p-4 rounded-xl border bg-card/90 backdrop-blur-sm shadow-lg max-w-[200px]",
              activeExample.color
            )}>
              <activeExample.icon className="w-8 h-8 mb-2" />
              <h4 className="font-bold text-foreground mb-1">{activeExample.title}</h4>
              <p className="text-xs text-muted-foreground">{activeExample.description}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
