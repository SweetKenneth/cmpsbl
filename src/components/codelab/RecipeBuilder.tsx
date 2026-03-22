/**
 * RecipeBuilder — Visual workflow composer for common substrate patterns
 * Drag-and-drop recipe creation with auto-generated code
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Trash2, ArrowDown, Copy, Check, Play, Code, Sparkles,
  Brain, Shield, MessageSquare, Zap, Eye, Moon, ChefHat, Wand2,
  FileCode, Download, Layers, ArrowRight, GripVertical
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RecipeStep {
  id: string;
  module: string;
  action: string;
  params: Record<string, string>;
  description: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: RecipeStep[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
}

const STARTER_RECIPES: Recipe[] = [
  {
    id: "memory-chat",
    name: "Memory-Aware Chatbot",
    description: "Build a chatbot that remembers context across sessions",
    category: "chatbot",
    difficulty: "beginner",
    estimatedTime: "15 min",
    steps: [
      { id: "1", module: "brain", action: "query", params: { query_text: "Previous conversation context" }, description: "Retrieve relevant memories" },
      { id: "2", module: "decode", action: "chat", params: { message: "{{user_input}}" }, description: "Process user message with context" },
      { id: "3", module: "brain", action: "remember", params: { content: "{{response}}", memory_type: "experience" }, description: "Store new interaction" },
    ]
  },
  {
    id: "secure-api",
    name: "Secure API Gateway",
    description: "Rate-limited, threat-analyzed API endpoint",
    category: "security",
    difficulty: "intermediate",
    estimatedTime: "20 min",
    steps: [
      { id: "1", module: "defense", action: "analyze", params: { ip: "{{request.ip}}" }, description: "Check for threats" },
      { id: "2", module: "access", action: "validate", params: { key: "{{api_key}}" }, description: "Validate API key" },
      { id: "3", module: "access", action: "quota", params: {}, description: "Check rate limits" },
      { id: "4", module: "nexus", action: "route", params: { task: "{{request.body}}" }, description: "Process request" },
    ]
  },
  {
    id: "smart-content",
    name: "AI Content Generator",
    description: "Generate content with learning and optimization",
    category: "ai",
    difficulty: "intermediate",
    estimatedTime: "25 min",
    steps: [
      { id: "1", module: "brain", action: "query", params: { query_text: "Similar content patterns" }, description: "Find successful patterns" },
      { id: "2", module: "nexus", action: "text", params: { prompt: "{{user_prompt}}", model: "openai" }, description: "Generate content" },
      { id: "3", module: "brain", action: "remember", params: { content: "{{output}}", memory_type: "insight" }, description: "Learn from output" },
      { id: "4", module: "vision", action: "metrics", params: {}, description: "Track performance" },
    ]
  },
  {
    id: "dream-learning",
    name: "Self-Improving System",
    description: "Nocturnal processing for pattern discovery",
    category: "advanced",
    difficulty: "advanced",
    estimatedTime: "30 min",
    steps: [
      { id: "1", module: "brain", action: "reflect", params: {}, description: "Synthesize learnings" },
      { id: "2", module: "dream", action: "cycle", params: {}, description: "Run dream cycle" },
      { id: "3", module: "evolution", action: "scan", params: { module: "brain" }, description: "Scan for improvements" },
      { id: "4", module: "system", action: "backup", params: {}, description: "Backup before mutations" },
    ]
  },
];

const AVAILABLE_STEPS = [
  { module: "brain", action: "query", icon: Brain, color: "text-neon-cyan", description: "Search memories" },
  { module: "brain", action: "remember", icon: Brain, color: "text-neon-cyan", description: "Store memory" },
  { module: "brain", action: "reflect", icon: Brain, color: "text-neon-cyan", description: "Reflect & learn" },
  { module: "nexus", action: "text", icon: Zap, color: "text-neon-green", description: "Generate text" },
  { module: "nexus", action: "route", icon: Zap, color: "text-neon-green", description: "Auto-route task" },
  { module: "decode", action: "chat", icon: MessageSquare, color: "text-neon-purple", description: "Chat interface" },
  { module: "decode", action: "intent", icon: MessageSquare, color: "text-neon-purple", description: "Extract intent" },
  { module: "defense", action: "analyze", icon: Shield, color: "text-neon-amber", description: "Threat analysis" },
  { module: "defense", action: "reputation", icon: Shield, color: "text-neon-amber", description: "Check reputation" },
  { module: "vision", action: "health", icon: Eye, color: "text-neon-blue", description: "System health" },
  { module: "vision", action: "metrics", icon: Eye, color: "text-neon-blue", description: "Get metrics" },
  { module: "dream", action: "cycle", icon: Moon, color: "text-neon-magenta", description: "Dream cycle" },
];

const MODULE_ICONS: Record<string, React.ElementType> = {
  brain: Brain,
  nexus: Zap,
  decode: MessageSquare,
  defense: Shield,
  vision: Eye,
  dream: Moon,
  system: Layers,
  access: Shield,
  core: Layers,
  evolution: Sparkles,
};

const MODULE_COLORS: Record<string, string> = {
  brain: "text-neon-cyan",
  nexus: "text-neon-green",
  decode: "text-neon-purple",
  defense: "text-neon-amber",
  vision: "text-neon-blue",
  dream: "text-neon-magenta",
  system: "text-destructive",
  access: "text-neon-amber",
  core: "text-slate-500",
  evolution: "text-neon-green",
};

export function RecipeBuilder() {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [customSteps, setCustomSteps] = useState<RecipeStep[]>([]);
  const [recipeName, setRecipeName] = useState("My Recipe");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"templates" | "builder" | "code">("templates");

  const addStep = (module: string, action: string, description: string) => {
    const newStep: RecipeStep = {
      id: Date.now().toString(),
      module,
      action,
      params: {},
      description,
    };
    setCustomSteps(prev => [...prev, newStep]);
    toast.success(`Added ${module}.${action}`);
  };

  const removeStep = (id: string) => {
    setCustomSteps(prev => prev.filter(s => s.id !== id));
  };

  const updateStepParam = (stepId: string, paramName: string, value: string) => {
    setCustomSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, params: { ...step.params, [paramName]: value } }
        : step
    ));
  };

  const loadRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setCustomSteps(recipe.steps);
    setRecipeName(recipe.name);
    setActiveTab("builder");
    toast.success(`Loaded "${recipe.name}"`);
  };

  const generateCode = () => {
    const steps = customSteps.length > 0 ? customSteps : currentRecipe?.steps || [];
    if (steps.length === 0) return "// Add steps to generate code";

    const code = `import { substrate } from "@/lib/substrate";

/**
 * ${recipeName}
 * Generated by CodeLab Recipe Builder
 */
export async function execute(input: Record<string, any>) {
  const results: any[] = [];
  
${steps.map((step, i) => {
  const params = Object.entries(step.params)
    .map(([k, v]) => `    ${k}: ${v.startsWith("{{") ? `input.${v.slice(2, -2)}` : `"${v}"`}`)
    .join(",\n");
  
  return `  // Step ${i + 1}: ${step.description}
  const result${i + 1} = await substrate.invoke({
    module: "${step.module}",
    action: "${step.action}",
    payload: {
${params || "      // No parameters"}
    }
  });
  results.push(result${i + 1});
`;
}).join("\n")}
  return { success: true, results };
}`;

    return code;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId("code");
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadCode = () => {
    const code = generateCode();
    const blob = new Blob([code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${recipeName.toLowerCase().replace(/\s+/g, "-")}.ts`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded recipe code");
  };

  const currentSteps = customSteps.length > 0 ? customSteps : currentRecipe?.steps || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-amber to-neon-amber flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Recipe Builder</h2>
            <p className="text-muted-foreground">
              Compose workflows visually and export production-ready code
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setCustomSteps([]);
              setCurrentRecipe(null);
              setRecipeName("My Recipe");
            }}
          >
            <Plus className="w-4 h-4" />
            New Recipe
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
          <TabsList className="inline-flex w-auto min-w-max sm:grid sm:w-full sm:grid-cols-3 sm:max-w-md">
            <TabsTrigger value="templates" className="gap-2 whitespace-nowrap px-4">
              <Sparkles className="w-4 h-4" />
              <span className="hidden xs:inline">Starter</span> Recipes
            </TabsTrigger>
            <TabsTrigger value="builder" className="gap-2 whitespace-nowrap px-4">
              <Wand2 className="w-4 h-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2 whitespace-nowrap px-4">
              <FileCode className="w-4 h-4" />
              Code
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Starter Recipes Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STARTER_RECIPES.map(recipe => (
              <Card
                key={recipe.id}
                className="p-4 cursor-pointer hover:border-primary/50 transition-all group"
                onClick={() => loadRecipe(recipe)}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="capitalize text-xs">
                    {recipe.category}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs",
                      recipe.difficulty === "beginner" && "bg-neon-green/10 text-neon-green",
                      recipe.difficulty === "intermediate" && "bg-neon-amber/10 text-neon-amber",
                      recipe.difficulty === "advanced" && "bg-neon-magenta/10 text-neon-magenta"
                    )}
                  >
                    {recipe.difficulty}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {recipe.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {recipe.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{recipe.steps.length} steps</span>
                  <span>{recipe.estimatedTime}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50 flex gap-1">
                  {recipe.steps.slice(0, 3).map((step, i) => {
                    const Icon = MODULE_ICONS[step.module] || Layers;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "w-6 h-6 rounded flex items-center justify-center bg-muted/50",
                          MODULE_COLORS[step.module]
                        )}
                        title={`${step.module}.${step.action}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    );
                  })}
                  {recipe.steps.length > 3 && (
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-muted/50 text-xs text-muted-foreground">
                      +{recipe.steps.length - 3}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Builder Tab */}
        <TabsContent value="builder" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Available Steps */}
            <Card className="p-4 lg:col-span-1">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Steps
              </h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {AVAILABLE_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <Button
                        key={i}
                        variant="outline"
                        className="w-full justify-start gap-3 h-auto py-3"
                        onClick={() => addStep(step.module, step.action, step.description)}
                      >
                        <Icon className={cn("w-4 h-4 shrink-0", step.color)} />
                        <div className="text-left">
                          <div className="font-mono text-sm">{step.module}.{step.action}</div>
                          <div className="text-xs text-muted-foreground">{step.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>

            {/* Recipe Steps */}
            <Card className="p-4 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <Input
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="font-semibold text-lg border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                  placeholder="Recipe Name"
                />
                <Badge variant="secondary">{currentSteps.length} steps</Badge>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {currentSteps.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Add steps from the left panel to build your recipe</p>
                    </div>
                  ) : (
                    currentSteps.map((step, index) => {
                      const Icon = MODULE_ICONS[step.module] || Layers;
                      return (
                        <div key={step.id}>
                          <Card className="p-4 border-l-4 border-l-primary/50">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Icon className={cn("w-4 h-4", MODULE_COLORS[step.module])} />
                                  <code className="font-mono text-sm font-semibold">
                                    {step.module}.{step.action}
                                  </code>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                                <div className="space-y-2">
                                  {Object.entries(step.params).map(([key, value]) => (
                                    <div key={key} className="flex gap-2">
                                      <Input
                                        placeholder={key}
                                        value={value}
                                        onChange={(e) => updateStepParam(step.id, key, e.target.value)}
                                        className="text-sm font-mono h-8"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                                onClick={() => removeStep(step.id)}
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </Card>
                          {index < currentSteps.length - 1 && (
                            <div className="flex justify-center py-1">
                              <ArrowDown className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </TabsContent>

        {/* Code Tab */}
        <TabsContent value="code" className="mt-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Code className="w-4 h-4" />
                Generated Code
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => copyCode(generateCode())}>
                  {copiedId === "code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={downloadCode}>
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
            <pre className="bg-muted/50 p-4 rounded-lg text-sm font-mono overflow-auto max-h-[500px]">
              {generateCode()}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
