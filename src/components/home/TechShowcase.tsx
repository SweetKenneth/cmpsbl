/**
 * Tech Showcase — Interactive demonstration of CMPSBL capabilities
 * Premium terminal-style code display with syntax highlighting
 */

import { useState, useEffect } from "react";
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
  Code,
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

// Syntax highlighting helper
function highlightCode(code: string) {
  return code
    .replace(/(\/\/.*)/g, '<span class="text-slate-500">$1</span>')
    .replace(/(\bawait\b|\bconst\b|\blet\b|\bvar\b)/g, '<span class="text-purple-400">$1</span>')
    .replace(/(\bcmpsbl\b)/g, '<span class="text-cyan-400 font-semibold">$1</span>')
    .replace(/(\.brain|\.dream|\.nexus|\.remember|\.recall|\.cycle|\.route)/g, '<span class="text-blue-400">$1</span>')
    .replace(/(".*?")/g, '<span class="text-amber-300">$1</span>')
    .replace(/(\d+)/g, '<span class="text-orange-400">$1</span>')
    .replace(/(true|false|null)/g, '<span class="text-rose-400">$1</span>');
}

export function TechShowcase() {
  const [activeTab, setActiveTab] = useState("memory");
  const [copied, setCopied] = useState(false);
  const [typedLines, setTypedLines] = useState(0);
  
  const activeExample = codeExamples.find(e => e.id === activeTab) || codeExamples[0];
  const codeLines = activeExample.code.split('\n');
  
  // Typing effect when tab changes
  useEffect(() => {
    setTypedLines(0);
    const interval = setInterval(() => {
      setTypedLines(prev => {
        if (prev >= codeLines.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [activeTab, codeLines.length]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(activeExample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <section className="relative py-20 sm:py-32 px-4 overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px), 
              linear-gradient(90deg, hsl(var(--neon-cyan) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5">
            <Code className="w-3 h-3 text-primary" />
            <span className="text-xs">See It In Action</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 tracking-tight">
            Simple{" "}
            <span 
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-green)), hsl(var(--neon-cyan)))",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradientShift 4s ease-in-out infinite",
              }}
            >
              Integration
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A few lines of code to add 
            <span className="text-foreground font-medium"> persistent memory</span>, 
            <span className="text-foreground font-medium"> dream cycles</span>, and 
            <span className="text-foreground font-medium"> intelligent routing</span> to any application.
          </p>
        </motion.div>
        
        {/* Enhanced Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10">
          {codeExamples.map((example, idx) => (
            <motion.button
              key={example.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveTab(example.id)}
              className={cn(
                "relative flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-300",
                activeTab === example.id
                  ? `bg-gradient-to-r ${example.gradient} text-white border-transparent shadow-lg scale-105`
                  : "bg-card/50 border-border/50 text-muted-foreground hover:bg-card/80 hover:border-border"
              )}
            >
              <example.icon className="w-4 h-4" />
              <span className="text-sm font-semibold">{example.title}</span>
              {activeTab === example.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-gradient-to-r opacity-20"
                  style={{ background: `linear-gradient(135deg, currentColor, transparent)` }}
                />
              )}
            </motion.button>
          ))}
        </div>
        
        {/* Premium Code Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="rounded-2xl border border-white/10 bg-[#0d1117] backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Header bar - macOS style */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#161b22]">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors cursor-pointer" />
                </div>
                <div className="flex items-center gap-2 ml-2 px-3 py-1 rounded-md bg-white/5">
                  <Terminal className="w-3 h-3 text-white/40" />
                  <span className="text-xs text-white/40 font-mono">cmpsbl-example.ts</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 rounded-md"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-green-400" />
                      <span className="text-green-400">Copied!</span>
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
            
            {/* Code content with line numbers */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-6 overflow-x-auto"
              >
                <div className="flex">
                  {/* Line numbers */}
                  <div className="pr-4 border-r border-white/10 select-none">
                    {codeLines.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "text-xs font-mono text-white/20 text-right leading-relaxed h-6",
                          idx < typedLines && "text-white/30"
                        )}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                  
                  {/* Code */}
                  <div className="pl-4 flex-1">
                    {codeLines.slice(0, typedLines).map((line, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.1 }}
                        className="text-sm font-mono leading-relaxed h-6"
                        dangerouslySetInnerHTML={{ __html: highlightCode(line) || '&nbsp;' }}
                      />
                    ))}
                    {typedLines < codeLines.length && (
                      <span className="inline-block w-2 h-5 bg-cyan-400 animate-pulse ml-1" />
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Floating description card */}
          <motion.div
            key={activeTab + "-desc"}
            initial={{ opacity: 0, x: 30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute -right-4 top-1/2 -translate-y-1/2 hidden xl:block"
          >
            <div className={cn(
              "p-5 rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl max-w-[220px]",
              "border-border/50"
            )}>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                `bg-gradient-to-br ${activeExample.gradient}`
              )}>
                <activeExample.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-foreground mb-1">{activeExample.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{activeExample.description}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
