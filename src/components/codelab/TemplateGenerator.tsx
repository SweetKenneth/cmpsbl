/**
 * Surface D — Template Generator
 * Describe your use case, generate a working template
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Copy, Check, Download, Loader2, 
  MessageSquare, Shield, Brain, Zap, Eye, Moon
} from "lucide-react";
import { toast } from "sonner";

interface Template {
  title: string;
  description: string;
  modules: string[];
  code: string;
}

const presetTemplates: Template[] = [
  {
    title: "AI Chatbot with Memory",
    description: "A chatbot that remembers conversations and learns from interactions",
    modules: ["decode", "brain"],
    code: `// AI Chatbot with Memory
import { substrate } from './lib/substrate';

async function chat(message: string, sessionId: string) {
  // Send message through decode
  const response = await substrate.decode.chat(message, sessionId);
  
  if (response.success) {
    // Store the interaction in brain memory
    await substrate.brain.remember(
      \`User: \${message}\\nAssistant: \${response.data.reply}\`,
      "conversation"
    );
    
    return response.data.reply;
  }
  
  throw new Error(response.error);
}

// Recall past conversations
async function recallContext(topic: string) {
  const memories = await substrate.brain.query(topic);
  return memories.data;
}

// Trigger learning cycle
async function learn() {
  await substrate.brain.reflect();
}
`
  },
  {
    title: "Bot Protection Layer",
    description: "Protect your API endpoints from malicious bots and attacks",
    modules: ["defense"],
    code: `// Bot Protection Layer
import { substrate } from './lib/substrate';

interface RequestContext {
  ip: string;
  userAgent: string;
  fingerprint?: Record<string, unknown>;
}

async function validateRequest(ctx: RequestContext) {
  // Analyze the request for bot activity
  const analysis = await substrate.defense.analyze(
    ctx.fingerprint || {},
    ctx.ip
  );
  
  if (!analysis.success) {
    throw new Error("Defense module unavailable");
  }
  
  const { risk_score, action, reason } = analysis.data;
  
  if (action === "block") {
    console.warn(\`Blocked request from \${ctx.ip}: \${reason}\`);
    return { allowed: false, reason };
  }
  
  if (action === "challenge") {
    // Require CAPTCHA or additional verification
    return { allowed: true, requireChallenge: true };
  }
  
  return { allowed: true };
}

// Check IP reputation
async function checkIP(ip: string) {
  const rep = await substrate.defense.reputation(ip);
  return rep.data;
}
`
  },
  {
    title: "Multi-Model AI Router",
    description: "Route AI tasks to the best available model automatically",
    modules: ["nexus"],
    code: `// Multi-Model AI Router
import { substrate } from './lib/substrate';

async function generateText(prompt: string, preferredModel?: string) {
  // Let nexus route to the best available model
  const response = await substrate.nexus.text(prompt, preferredModel);
  
  if (!response.success) {
    // Fallback: try auto-routing
    const routed = await substrate.nexus.route(\`text: \${prompt}\`);
    return routed.data;
  }
  
  return response.data;
}

async function generateImage(prompt: string) {
  const response = await substrate.nexus.image(prompt);
  return response.data;
}

// Get available providers
async function getProviders() {
  const providers = await substrate.nexus.providers();
  return providers.data?.providers || [];
}

// Check routing stats
async function getStats() {
  const stats = await substrate.nexus.routeStats();
  return stats.data;
}
`
  },
  {
    title: "Real-time Dashboard",
    description: "Monitor substrate health and metrics in real-time",
    modules: ["vision"],
    code: `// Real-time Dashboard
import { substrate } from './lib/substrate';
import { useEffect, useState } from 'react';

function useSubstrateHealth(refreshInterval = 10000) {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      const [healthRes, metricsRes] = await Promise.all([
        substrate.vision.health(),
        substrate.vision.metrics()
      ]);
      
      if (healthRes.success) setHealth(healthRes.data);
      if (metricsRes.success) setMetrics(metricsRes.data);
    }
    
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);
  
  return { health, metrics };
}

// Quick pulse check
async function pulse() {
  const res = await substrate.vision.pulse();
  return res.data;
}

// Full dashboard data
async function getDashboard() {
  const res = await substrate.vision.dashboard();
  return res.data;
}
`
  },
  {
    title: "Dream-Powered Creativity",
    description: "Use the Dream-Eater for creative content generation",
    modules: ["dream", "brain"],
    code: `// Dream-Powered Creativity
import { substrate } from './lib/substrate';

async function dreamCycle() {
  // Check dream-eater mood
  const status = await substrate.dream.status();
  console.log("Dream-Eater mood:", status.data?.mood);
  
  // Trigger a dream cycle
  const dream = await substrate.dream.cycle();
  
  // Store dream insights in brain
  if (dream.success && dream.data?.insight) {
    await substrate.brain.remember(
      dream.data.insight,
      "dream_insight",
      0.8
    );
  }
  
  return dream.data;
}

// Interpret a user-submitted dream
async function interpretDream(dreamText: string) {
  const interpretation = await substrate.dream.interpret(dreamText);
  return interpretation.data;
}

// Feed the dream-eater
async function feedDream(content: string) {
  // Dreams are consumed and processed
  return await substrate.decode.dream();
}
`
  }
];

export function TemplateGenerator() {
  const [useCase, setUseCase] = useState("");
  const [generatedTemplate, setGeneratedTemplate] = useState<Template | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateTemplate = async () => {
    if (!useCase.trim()) {
      toast.error("Please describe your use case");
      return;
    }

    setGenerating(true);
    
    // Simple heuristic-based template generation
    // In production, this could use the nexus module for AI generation
    setTimeout(() => {
      const lowerCase = useCase.toLowerCase();
      let template: Template;
      
      if (lowerCase.includes("chat") || lowerCase.includes("conversation") || lowerCase.includes("assistant")) {
        template = presetTemplates[0];
      } else if (lowerCase.includes("bot") || lowerCase.includes("security") || lowerCase.includes("protect")) {
        template = presetTemplates[1];
      } else if (lowerCase.includes("ai") || lowerCase.includes("model") || lowerCase.includes("generate")) {
        template = presetTemplates[2];
      } else if (lowerCase.includes("monitor") || lowerCase.includes("dashboard") || lowerCase.includes("health")) {
        template = presetTemplates[3];
      } else if (lowerCase.includes("dream") || lowerCase.includes("creative") || lowerCase.includes("content")) {
        template = presetTemplates[4];
      } else {
        // Default to chatbot template
        template = {
          ...presetTemplates[0],
          title: "Custom Template",
          description: `Template for: ${useCase}`,
        };
      }
      
      setGeneratedTemplate(template);
      setGenerating(false);
      toast.success("Template generated!");
    }, 1500);
  };

  const copyTemplate = () => {
    if (generatedTemplate) {
      navigator.clipboard.writeText(generatedTemplate.code);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadTemplate = () => {
    if (generatedTemplate) {
      const blob = new Blob([generatedTemplate.code], { type: "text/typescript" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `substrate-template-${Date.now()}.ts`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const moduleIcons: Record<string, React.ElementType> = {
    brain: Brain,
    decode: MessageSquare,
    defense: Shield,
    nexus: Zap,
    vision: Eye,
    dream: Moon,
  };

  return (
    <div className="space-y-6">
      {/* Generator Input */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Template Generator
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Describe your use case and we'll generate a working template using substrate modules.
        </p>
        <Textarea
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          placeholder="e.g., I want to build a chatbot that remembers conversations and learns from user interactions..."
          className="min-h-[100px] mb-4"
        />
        <Button onClick={generateTemplate} disabled={generating}>
          {generating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Generate Template
        </Button>
      </Card>

      {/* Generated Template */}
      {generatedTemplate && (
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-lg">{generatedTemplate.title}</h3>
              <p className="text-sm text-muted-foreground">{generatedTemplate.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyTemplate}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            {generatedTemplate.modules.map((mod) => {
              const Icon = moduleIcons[mod] || Zap;
              return (
                <Badge key={mod} variant="outline" className="gap-1">
                  <Icon className="w-3 h-3" />
                  {mod}
                </Badge>
              );
            })}
          </div>
          
          <pre className="bg-muted/30 p-4 rounded-lg text-xs sm:text-sm font-mono overflow-auto max-h-96">
            {generatedTemplate.code}
          </pre>
        </Card>
      )}

      {/* Preset Templates */}
      <div>
        <h3 className="font-semibold mb-4">Preset Templates</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {presetTemplates.map((template, index) => (
            <Card
              key={index}
              className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setGeneratedTemplate(template)}
            >
              <h4 className="font-medium mb-1">{template.title}</h4>
              <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
              <div className="flex gap-1">
                {template.modules.map((mod) => {
                  const Icon = moduleIcons[mod] || Zap;
                  return (
                    <Badge key={mod} variant="secondary" className="gap-1 text-xs">
                      <Icon className="w-3 h-3" />
                      {mod}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
