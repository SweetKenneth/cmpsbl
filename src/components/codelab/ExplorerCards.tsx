/**
 * Surface A — Explorer Cards
 * One card per substrate module with execution, parameters, and code export
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Brain, Shield, MessageSquare, Zap, Eye, Moon, Settings,
  Play, Copy, Check, ExternalLink, Loader2, AlertCircle,
  CheckCircle2, Code
} from "lucide-react";
import { substrate, SubstrateModule } from "@/lib/substrate";
import { toast } from "sonner";

interface ModuleConfig {
  id: SubstrateModule;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  actions: {
    name: string;
    description: string;
    params?: { name: string; type: string; required?: boolean; placeholder?: string }[];
  }[];
}

const modules: ModuleConfig[] = [
  // ═══ KERNEL LAYER ═══
  {
    id: "core",
    name: "Core",
    description: "Kernel scheduling, lifecycle, safety switches, routing",
    icon: Settings,
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    actions: [
      { name: "status", description: "Get core kernel status" },
      { name: "schedule", description: "Schedule a task", params: [{ name: "task", type: "string", required: true }, { name: "delay_ms", type: "string", placeholder: "1000" }] },
      { name: "boot", description: "Boot sequence status" },
      { name: "circuit", description: "Safety switch status" },
    ],
  },
  {
    id: "ripple",
    name: "Ripple",
    description: "Pub/sub messaging, event queues, inter-system communication",
    icon: MessageSquare,
    color: "text-primary",
    bgColor: "bg-primary/10",
    actions: [
      { name: "status", description: "Get message bus status" },
      { name: "publish", description: "Publish event", params: [{ name: "topic", type: "string", required: true }, { name: "message", type: "string", required: true }] },
      { name: "subscribe", description: "Subscribe to topic", params: [{ name: "topic", type: "string", required: true }] },
      { name: "queue", description: "Queue status" },
    ],
  },
  {
    id: "access",
    name: "Access",
    description: "API key management, rate limiting, quotas, billing",
    icon: Shield,
    color: "text-neon-amber",
    bgColor: "bg-neon-amber/10",
    actions: [
      { name: "status", description: "Get access layer status" },
      { name: "validate", description: "Validate API key", params: [{ name: "key", type: "string", required: true }] },
      { name: "quota", description: "Check quota usage" },
      { name: "usage", description: "Get usage stats" },
    ],
  },
  // ═══ COGNITIVE LAYER ═══
  {
    id: "brain",
    name: "Brain",
    description: "Memory, learning cycles, reflection, and cognitive synthesis",
    icon: Brain,
    color: "text-neon-cyan",
    bgColor: "bg-neon-cyan/10",
    actions: [
      { name: "status", description: "Get BRAIN system status" },
      { name: "query", description: "Query memories", params: [{ name: "query_text", type: "string", required: true, placeholder: "What do you remember about..." }] },
      { name: "remember", description: "Store a memory", params: [{ name: "content", type: "string", required: true }, { name: "memory_type", type: "string", required: true, placeholder: "fact|insight|experience" }] },
      { name: "reflect", description: "Trigger reflection cycle" },
      { name: "dream", description: "Initiate dream cycle" },
    ],
  },
  {
    id: "decode",
    name: "Decode",
    description: "Intent decoding, cognitive interpretation, proposals",
    icon: MessageSquare,
    color: "text-neon-purple",
    bgColor: "bg-neon-purple/10",
    actions: [
      { name: "status", description: "Get DECODE system status" },
      { name: "chat", description: "Chat with interpreter", params: [{ name: "message", type: "string", required: true, placeholder: "Your message..." }] },
      { name: "intent", description: "Extract intent", params: [{ name: "message", type: "string", required: true }] },
      { name: "propose", description: "Submit proposal", params: [{ name: "idea", type: "string", required: true }] },
    ],
  },
  {
    id: "dream",
    name: "Dream",
    description: "Dream-Eater operations, mood, mutations, nocturnal processing",
    icon: Moon,
    color: "text-neon-magenta",
    bgColor: "bg-neon-magenta/10",
    actions: [
      { name: "status", description: "Get dream-eater status" },
      { name: "mood", description: "Get/set mood", params: [{ name: "mood", type: "string", placeholder: "curious|hungry|content" }] },
      { name: "cycle", description: "Trigger dream cycle" },
      { name: "interpret", description: "Interpret a dream", params: [{ name: "dream_text", type: "string", required: true }] },
    ],
  },
  // ═══ OPERATIONAL LAYER ═══
  {
    id: "defense",
    name: "Defense",
    description: "Bot detection, threat analysis, security posture",
    icon: Shield,
    color: "text-neon-amber",
    bgColor: "bg-neon-amber/10",
    actions: [
      { name: "status", description: "Get DEFENSE system status" },
      { name: "analyze", description: "Analyze request", params: [{ name: "ip", type: "string", placeholder: "IP address" }] },
      { name: "reputation", description: "Check IP reputation", params: [{ name: "ip_address", type: "string", required: true }] },
      { name: "posture", description: "Get security posture" },
      { name: "limits", description: "Check rate limits" },
    ],
  },
  {
    id: "nexus",
    name: "Nexus",
    description: "Multi-provider AI routing, text and image generation",
    icon: Zap,
    color: "text-neon-green",
    bgColor: "bg-neon-green/10",
    actions: [
      { name: "status", description: "Get NEXUS system status" },
      { name: "text", description: "Generate text", params: [{ name: "prompt", type: "string", required: true }, { name: "model", type: "string", placeholder: "openai|anthropic|google" }] },
      { name: "route", description: "Auto-route task", params: [{ name: "task", type: "string", required: true }] },
      { name: "providers", description: "List available providers" },
    ],
  },
  {
    id: "vision",
    name: "Vision",
    description: "Observability, metrics, health monitoring",
    icon: Eye,
    color: "text-neon-blue",
    bgColor: "bg-neon-blue/10",
    actions: [
      { name: "health", description: "Get system health" },
      { name: "metrics", description: "Get system metrics" },
      { name: "pulse", description: "Quick heartbeat check" },
      { name: "dashboard", description: "Full dashboard data" },
      { name: "introspection", description: "Deep substrate introspection" },
    ],
  },
  // ═══ ADMINISTRATIVE LAYER ═══
  {
    id: "system",
    name: "System",
    description: "Administration, backup, restore, configuration",
    icon: Settings,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    actions: [
      { name: "status", description: "Get system status" },
      { name: "health", description: "Full health diagnostics" },
      { name: "diagnostics", description: "Complete diagnostics" },
      { name: "version", description: "Get substrate version" },
      { name: "backup", description: "Create backup snapshot" },
    ],
  },
  {
    id: "evolution",
    name: "Evolution",
    description: "Self-improvement proposals, architecture scanning, upgrades",
    icon: Zap,
    color: "text-neon-green",
    bgColor: "bg-neon-green/10",
    actions: [
      { name: "status", description: "Get evolution status" },
      { name: "scan", description: "Scan for improvements", params: [{ name: "system", type: "string", placeholder: "brain|defense|nexus" }] },
      { name: "jobs", description: "List recent scan jobs" },
      { name: "quota", description: "Check scan quota" },
    ],
  },
];

interface Props {
  onOpenWorkbench: (module: SubstrateModule) => void;
}

export function ExplorerCards({ onOpenWorkbench }: Props) {
  const [executing, setExecuting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [params, setParams] = useState<Record<string, Record<string, string>>>({});
  const [selectedAction, setSelectedAction] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const executeAction = async (module: ModuleConfig, actionName: string) => {
    const key = `${module.id}-${actionName}`;
    setExecuting(key);
    
    try {
      const actionParams = params[key] || {};
      const payload = Object.keys(actionParams).length > 0 ? actionParams : undefined;
      
      const response = await substrate.invoke({
        module: module.id,
        action: actionName,
        payload,
      });
      
      setResults(prev => ({ ...prev, [key]: response }));
      
      if (response.success) {
        toast.success(`${module.name}.${actionName} executed successfully`);
      } else {
        toast.error(response.error || "Execution failed");
      }
    } catch (error) {
      setResults(prev => ({ ...prev, [key]: { success: false, error: String(error) } }));
      toast.error("Execution failed");
    } finally {
      setExecuting(null);
    }
  };

  const generateSnippet = (module: ModuleConfig, actionName: string, format: string) => {
    const actionParams = params[`${module.id}-${actionName}`] || {};
    const payloadStr = Object.keys(actionParams).length > 0 
      ? JSON.stringify(actionParams, null, 2) 
      : "{}";

    switch (format) {
      case "curl":
        return `curl -X POST \\
  "https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-substrate" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ANON_KEY" \\
  -d '{
    "module": "${module.id}",
    "action": "${actionName}",
    "payload": ${payloadStr}
  }'`;
      
      case "js":
        return `const response = await fetch(
  "https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-substrate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      module: "${module.id}",
      action: "${actionName}",
      payload: ${payloadStr}
    }),
  }
);
const data = await response.json();`;

      case "ts":
        return `import { substrate } from "@/lib/substrate";

const response = await substrate.${module.id}.${actionName}(${
  Object.keys(actionParams).length > 0 
    ? Object.values(actionParams).map(v => `"${v}"`).join(", ")
    : ""
});

if (response.success) {
  console.log(response.data);
}`;

      case "supabase":
        return `import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.functions.invoke("pf-substrate", {
  body: {
    module: "${module.id}",
    action: "${actionName}",
    payload: ${payloadStr}
  }
});`;

      default:
        return "";
    }
  };

  const copySnippet = (snippet: string, key: string) => {
    navigator.clipboard.writeText(snippet);
    setCopied(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module) => {
        const currentAction = selectedAction[module.id] || module.actions[0].name;
        const action = module.actions.find(a => a.name === currentAction) || module.actions[0];
        const key = `${module.id}-${currentAction}`;
        const result = results[key];
        const isExecuting = executing === key;

        return (
          <Card key={module.id} className="p-4 sm:p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${module.bgColor} flex items-center justify-center shrink-0`}>
                <module.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${module.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg">{module.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{module.description}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">
                {result ? (
                  (result as { success?: boolean }).success ? (
                    <CheckCircle2 className="w-3 h-3 text-neon-green" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-destructive" />
                  )
                ) : (
                  <span className="text-muted-foreground">Ready</span>
                )}
              </Badge>
            </div>

            {/* Action Selector */}
            <div className="space-y-3 mb-4">
              <Label className="text-xs text-muted-foreground">Action</Label>
              <Select
                value={currentAction}
                onValueChange={(v) => setSelectedAction(prev => ({ ...prev, [module.id]: v }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {module.actions.map((a) => (
                    <SelectItem key={a.name} value={a.name}>
                      {a.name} — {a.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parameters */}
            {action.params && action.params.length > 0 && (
              <div className="space-y-3 mb-4">
                {action.params.map((param) => (
                  <div key={param.name}>
                    <Label className="text-xs text-muted-foreground">
                      {param.name} {param.required && <span className="text-destructive">*</span>}
                    </Label>
                    {param.type === "string" && param.name.includes("content") || param.name.includes("message") || param.name.includes("text") ? (
                      <Textarea
                        placeholder={param.placeholder || param.name}
                        className="mt-1 text-sm"
                        rows={2}
                        value={params[key]?.[param.name] || ""}
                        onChange={(e) => setParams(prev => ({
                          ...prev,
                          [key]: { ...prev[key], [param.name]: e.target.value }
                        }))}
                      />
                    ) : (
                      <Input
                        placeholder={param.placeholder || param.name}
                        className="mt-1 text-sm"
                        value={params[key]?.[param.name] || ""}
                        onChange={(e) => setParams(prev => ({
                          ...prev,
                          [key]: { ...prev[key], [param.name]: e.target.value }
                        }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Execute Button */}
            <Button
              onClick={() => executeAction(module, currentAction)}
              disabled={isExecuting}
              className="w-full mb-4"
              size="sm"
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Execute
            </Button>

            {/* Result Preview */}
            {result && (
              <div className="bg-muted/50 rounded-lg p-3 mb-4 max-h-32 overflow-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(result, null, 2).slice(0, 500)}
                  {JSON.stringify(result).length > 500 && "..."}
                </pre>
              </div>
            )}

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-2 mt-auto">
              {["curl", "js", "ts", "supabase"].map((format) => (
                <Dialog key={format}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs flex-1 min-w-[60px]">
                      {format.toUpperCase()}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {module.name}.{currentAction} — {format.toUpperCase()}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="relative">
                      <pre className="bg-muted/50 p-4 rounded-lg text-xs sm:text-sm font-mono overflow-auto max-h-96">
                        {generateSnippet(module, currentAction, format)}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copySnippet(generateSnippet(module, currentAction, format), `${key}-${format}`)}
                      >
                        {copied === `${key}-${format}` ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => onOpenWorkbench(module.id)}
              >
                <Code className="w-3 h-3 mr-1" />
                Open
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
