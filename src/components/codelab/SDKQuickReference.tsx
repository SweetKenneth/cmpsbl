/**
 * SDKQuickReference — Interactive searchable SDK cheatsheet
 * Quick access to all module actions with copy-paste snippets
 */

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Copy, Check, Code, Zap, ChevronDown, ChevronRight,
  Brain, Shield, MessageSquare, Eye, Moon, Settings, Network,
  Layers, Activity, Lock, Sparkles, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SDKAction {
  module: string;
  action: string;
  description: string;
  params?: { name: string; type: string; required?: boolean }[];
  example: string;
  returns: string;
  tags: string[];
}

const SDK_ACTIONS: SDKAction[] = [
  // BRAIN MODULE
  {
    module: "brain",
    action: "query",
    description: "Search memories using semantic similarity",
    params: [
      { name: "query_text", type: "string", required: true },
      { name: "limit", type: "number" },
      { name: "tier", type: "'hot' | 'warm' | 'cold'" }
    ],
    example: `await substrate.brain.query("What did the user prefer?")`,
    returns: "{ memories: Memory[], total: number }",
    tags: ["memory", "search", "semantic"]
  },
  {
    module: "brain",
    action: "remember",
    description: "Store a new memory with automatic tiering",
    params: [
      { name: "content", type: "string", required: true },
      { name: "memory_type", type: "'fact' | 'insight' | 'experience'", required: true },
      { name: "importance", type: "number" }
    ],
    example: `await substrate.brain.remember("User prefers dark mode", "fact")`,
    returns: "{ id: string, tier: string }",
    tags: ["memory", "store", "learning"]
  },
  {
    module: "brain",
    action: "reflect",
    description: "Trigger a reflection cycle to synthesize learnings",
    example: `await substrate.brain.reflect()`,
    returns: "{ insights: Insight[], consolidations: number }",
    tags: ["learning", "synthesis", "cognitive"]
  },
  {
    module: "brain",
    action: "dream",
    description: "Initiate dream cycle for pattern discovery",
    example: `await substrate.brain.dream()`,
    returns: "{ patterns: Pattern[], mutations: number }",
    tags: ["dream", "patterns", "evolution"]
  },
  // NEXUS MODULE
  {
    module: "nexus",
    action: "text",
    description: "Generate text using multi-provider routing",
    params: [
      { name: "prompt", type: "string", required: true },
      { name: "model", type: "string" },
      { name: "max_tokens", type: "number" }
    ],
    example: `await substrate.nexus.text("Summarize this document", { model: "openai" })`,
    returns: "{ text: string, tokens: number, provider: string }",
    tags: ["ai", "generation", "text"]
  },
  {
    module: "nexus",
    action: "route",
    description: "Auto-route task to optimal provider",
    params: [
      { name: "task", type: "string", required: true },
      { name: "priority", type: "'speed' | 'quality' | 'cost'" }
    ],
    example: `await substrate.nexus.route("complex reasoning task", { priority: "quality" })`,
    returns: "{ provider: string, response: any }",
    tags: ["routing", "ai", "optimization"]
  },
  {
    module: "nexus",
    action: "providers",
    description: "List available AI providers and their status",
    example: `await substrate.nexus.providers()`,
    returns: "{ providers: Provider[], active: number }",
    tags: ["providers", "status"]
  },
  // DECODE MODULE
  {
    module: "decode",
    action: "chat",
    description: "Conversational interface with intent understanding",
    params: [
      { name: "message", type: "string", required: true },
      { name: "context", type: "object" }
    ],
    example: `await substrate.decode.chat("Help me build a chatbot")`,
    returns: "{ response: string, intent: Intent, suggestions: string[] }",
    tags: ["chat", "conversation", "intent"]
  },
  {
    module: "decode",
    action: "intent",
    description: "Extract structured intent from natural language",
    params: [
      { name: "message", type: "string", required: true }
    ],
    example: `await substrate.decode.intent("Schedule a meeting tomorrow at 3pm")`,
    returns: "{ action: string, entities: Entity[], confidence: number }",
    tags: ["nlp", "intent", "parsing"]
  },
  // DEFENSE MODULE
  {
    module: "defense",
    action: "analyze",
    description: "Analyze request for security threats",
    params: [
      { name: "request", type: "Request", required: true }
    ],
    example: `await substrate.defense.analyze({ ip: "1.2.3.4", headers: req.headers })`,
    returns: "{ risk_score: number, threats: Threat[], action: 'allow' | 'block' | 'challenge' }",
    tags: ["security", "threat", "analysis"]
  },
  {
    module: "defense",
    action: "reputation",
    description: "Check IP/user reputation score",
    params: [
      { name: "ip_address", type: "string", required: true }
    ],
    example: `await substrate.defense.reputation("1.2.3.4")`,
    returns: "{ score: number, history: Event[], verdict: string }",
    tags: ["reputation", "ip", "trust"]
  },
  // VISION MODULE
  {
    module: "vision",
    action: "health",
    description: "Get comprehensive system health",
    example: `await substrate.vision.health()`,
    returns: "{ modules: ModuleHealth[], overall: number, alerts: Alert[] }",
    tags: ["health", "monitoring", "status"]
  },
  {
    module: "vision",
    action: "metrics",
    description: "Get real-time performance metrics",
    params: [
      { name: "period", type: "'1h' | '24h' | '7d'" }
    ],
    example: `await substrate.vision.metrics({ period: "24h" })`,
    returns: "{ latency: Stats, throughput: Stats, errors: Stats }",
    tags: ["metrics", "performance", "analytics"]
  },
  {
    module: "vision",
    action: "pulse",
    description: "Quick heartbeat check",
    example: `await substrate.vision.pulse()`,
    returns: "{ alive: boolean, uptime: number }",
    tags: ["health", "quick", "heartbeat"]
  },
  // DREAM MODULE
  {
    module: "dream",
    action: "cycle",
    description: "Trigger nocturnal processing cycle",
    example: `await substrate.dream.cycle()`,
    returns: "{ processed: number, mutations: Mutation[] }",
    tags: ["dream", "processing", "night"]
  },
  {
    module: "dream",
    action: "mood",
    description: "Get or set Dream-Eater mood",
    params: [
      { name: "mood", type: "'curious' | 'hungry' | 'content' | 'restless'" }
    ],
    example: `await substrate.dream.mood("curious")`,
    returns: "{ current: string, history: MoodEvent[] }",
    tags: ["mood", "state", "personality"]
  },
  // SYSTEM MODULE
  {
    module: "system",
    action: "status",
    description: "Get overall system status",
    example: `await substrate.system.status()`,
    returns: "{ status: string, version: string, uptime: number }",
    tags: ["system", "status", "info"]
  },
  {
    module: "system",
    action: "backup",
    description: "Create system backup snapshot",
    example: `await substrate.system.backup()`,
    returns: "{ backup_id: string, size: number, timestamp: string }",
    tags: ["backup", "snapshot", "admin"]
  },
  // CORE MODULE
  {
    module: "core",
    action: "schedule",
    description: "Schedule a task for execution",
    params: [
      { name: "task", type: "string", required: true },
      { name: "delay_ms", type: "number" }
    ],
    example: `await substrate.core.schedule("cleanup", { delay_ms: 5000 })`,
    returns: "{ job_id: string, scheduled_at: string }",
    tags: ["scheduling", "tasks", "jobs"]
  },
  {
    module: "core",
    action: "circuit",
    description: "Check safety switch status",
    example: `await substrate.core.circuit()`,
    returns: "{ breakers: CircuitBreaker[], open: number }",
    tags: ["circuit", "resilience", "health"]
  },
  // RIPPLE MODULE
  {
    module: "ripple",
    action: "publish",
    description: "Publish event to topic",
    params: [
      { name: "topic", type: "string", required: true },
      { name: "message", type: "any", required: true }
    ],
    example: `await substrate.ripple.publish("user.created", { userId: "123" })`,
    returns: "{ event_id: string, subscribers: number }",
    tags: ["events", "pubsub", "messaging"]
  },
  {
    module: "ripple",
    action: "subscribe",
    description: "Subscribe to event topic",
    params: [
      { name: "topic", type: "string", required: true },
      { name: "handler", type: "function" }
    ],
    example: `await substrate.ripple.subscribe("user.created", handleUserCreated)`,
    returns: "{ subscription_id: string }",
    tags: ["events", "subscribe", "handlers"]
  },
];

const MODULE_META: Record<string, { icon: React.ElementType; color: string }> = {
  brain: { icon: Brain, color: "text-neon-cyan" },
  nexus: { icon: Zap, color: "text-neon-green" },
  decode: { icon: MessageSquare, color: "text-neon-purple" },
  defense: { icon: Shield, color: "text-neon-amber" },
  vision: { icon: Eye, color: "text-neon-blue" },
  dream: { icon: Moon, color: "text-neon-magenta" },
  system: { icon: Settings, color: "text-destructive" },
  core: { icon: Settings, color: "text-slate-500" },
  ripple: { icon: Network, color: "text-primary" },
};

export function SDKQuickReference() {
  const [search, setSearch] = useState("");
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("all");

  const filteredActions = useMemo(() => {
    return SDK_ACTIONS.filter(action => {
      const matchesSearch = search === "" || 
        action.action.toLowerCase().includes(search.toLowerCase()) ||
        action.description.toLowerCase().includes(search.toLowerCase()) ||
        action.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        action.module.toLowerCase().includes(search.toLowerCase());
      
      const matchesModule = selectedModule === "all" || action.module === selectedModule;
      
      return matchesSearch && matchesModule;
    });
  }, [search, selectedModule]);

  const groupedActions = useMemo(() => {
    return filteredActions.reduce((acc, action) => {
      if (!acc[action.module]) acc[action.module] = [];
      acc[action.module].push(action);
      return acc;
    }, {} as Record<string, SDKAction[]>);
  }, [filteredActions]);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const modules = ["all", ...Object.keys(MODULE_META)];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">SDK Quick Reference</h2>
            <p className="text-muted-foreground">
              {SDK_ACTIONS.length} actions across {Object.keys(MODULE_META).length} modules
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search actions, descriptions, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
          <div className="flex gap-1 min-w-max">
            {modules.map(mod => {
              const meta = MODULE_META[mod];
              const Icon = meta?.icon || Layers;
              return (
                <Button
                  key={mod}
                  variant={selectedModule === mod ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedModule(mod)}
                  className={cn(
                    "gap-1.5 shrink-0 capitalize whitespace-nowrap",
                    selectedModule === mod && mod !== "all" && meta?.color
                  )}
                >
                  {mod !== "all" && <Icon className="w-3.5 h-3.5" />}
                  {mod}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {Object.entries(groupedActions).map(([module, actions]) => {
            const meta = MODULE_META[module];
            const Icon = meta?.icon || Code;
            
            return (
              <div key={module} className="space-y-3">
                <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                  <Icon className={cn("w-5 h-5", meta?.color)} />
                  <h3 className="font-semibold capitalize">{module}</h3>
                  <Badge variant="secondary" className="text-xs">{actions.length}</Badge>
                </div>
                
                <div className="space-y-2">
                  {actions.map(action => {
                    const key = `${action.module}.${action.action}`;
                    const isExpanded = expandedAction === key;
                    
                    return (
                      <Card
                        key={key}
                        className={cn(
                          "p-4 cursor-pointer transition-all",
                          isExpanded && "ring-1 ring-primary/50"
                        )}
                        onClick={() => setExpandedAction(isExpanded ? null : key)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="font-mono font-semibold text-primary">
                                {module}.{action.action}()
                              </code>
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyCode(action.example, key);
                            }}
                          >
                            {copiedId === key ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                            {/* Parameters */}
                            {action.params && action.params.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2">Parameters</h4>
                                <div className="space-y-1">
                                  {action.params.map(param => (
                                    <div key={param.name} className="flex items-center gap-2 text-sm font-mono">
                                      <span className={param.required ? "text-neon-amber" : "text-muted-foreground"}>
                                        {param.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">:</span>
                                      <span className="text-neon-cyan">{param.type}</span>
                                      {param.required && (
                                        <Badge variant="outline" className="text-[10px] h-4 px-1">required</Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Example */}
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Example</h4>
                              <pre className="bg-muted/50 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                                {action.example}
                              </pre>
                            </div>
                            
                            {/* Returns */}
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Returns</h4>
                              <code className="text-xs font-mono text-neon-green">{action.returns}</code>
                            </div>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                              {action.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {filteredActions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No actions found matching "{search}"</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
