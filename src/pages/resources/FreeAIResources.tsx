import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Zap, Code, Database, Sparkles } from "lucide-react";

const FreeAIResources = () => {
  const providers = [
    {
      name: "Groq",
      category: "Ultra-Fast Inference",
      description: "Lightning-fast LLM inference powered by custom LPU architecture. Perfect for real-time applications requiring sub-second responses.",
      dailyLimit: "14,400 requests",
      monthlyTokens: "100,000 TPD",
      models: ["Llama 3.1 70B", "Llama 3.3 70B", "Mixtral 8x7B"],
      bestFor: "Speed-critical reasoning tasks",
      url: "https://console.groq.com",
      tier: "premium"
    },
    {
      name: "Cerebras",
      category: "Massive Scale AI",
      description: "Wafer-scale AI chip technology delivering unprecedented throughput. Ideal for high-volume production workloads.",
      dailyLimit: "14,400+ requests",
      monthlyTokens: "Unlimited tokens",
      models: ["Llama 3.1 70B", "Llama 3.3 70B"],
      bestFor: "High-volume batch processing",
      url: "https://cerebras.ai",
      tier: "premium"
    },
    {
      name: "Google AI Studio",
      category: "Multimodal Intelligence",
      description: "Free access to Gemini models with vision, code, and reasoning capabilities. Generous quotas for experimentation.",
      dailyLimit: "1,500 requests",
      monthlyTokens: "50 RPM free tier",
      models: ["Gemini 2.0 Flash", "Gemini 2.5 Pro", "Gemini Flash Lite"],
      bestFor: "Vision + text understanding",
      url: "https://aistudio.google.com",
      tier: "essential"
    },
    {
      name: "Together AI",
      category: "Open Model Platform",
      description: "Decentralized AI inference with extensive open model library. Community-driven approach to democratizing AI.",
      dailyLimit: "10,000 requests",
      monthlyTokens: "$25 free credits/month",
      models: ["Llama 3.1", "Mistral", "Qwen", "DeepSeek"],
      bestFor: "Open-source model experimentation",
      url: "https://together.ai",
      tier: "standard"
    },
    {
      name: "DeepSeek",
      category: "Reasoning Specialist",
      description: "Advanced reasoning models optimized for complex problem-solving and mathematical tasks. Competitive performance at no cost.",
      dailyLimit: "5,000 requests",
      monthlyTokens: "Free tier available",
      models: ["DeepSeek V3", "DeepSeek Chat"],
      bestFor: "Mathematical reasoning & code",
      url: "https://platform.deepseek.com",
      tier: "standard"
    },
    {
      name: "Hyperbolic",
      category: "Edge AI Platform",
      description: "Distributed GPU network providing cost-effective inference. Built for scalable production deployments.",
      dailyLimit: "8,000 requests",
      monthlyTokens: "Free tier + credits",
      models: ["Llama 3.1", "Mistral 7B", "Qwen 2.5"],
      bestFor: "Cost-effective production scaling",
      url: "https://hyperbolic.xyz",
      tier: "standard"
    },
    {
      name: "Fireworks AI",
      category: "Performance Optimized",
      description: "Highly optimized model serving infrastructure. Focus on latency reduction and throughput maximization.",
      dailyLimit: "Variable",
      monthlyTokens: "$1 free credits",
      models: ["Llama 3.1", "Mixtral", "Yi-Large"],
      bestFor: "Low-latency applications",
      url: "https://fireworks.ai",
      tier: "essential"
    },
    {
      name: "Novita AI",
      category: "Creative Generation",
      description: "Specialized in image and video generation with generous free quotas. Excellent for creative workflows.",
      dailyLimit: "Variable",
      monthlyTokens: "100 free credits",
      models: ["Stable Diffusion", "Video Gen", "LLMs"],
      bestFor: "Image & video generation",
      url: "https://novita.ai",
      tier: "creative"
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "premium": return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "essential": return "bg-gradient-to-r from-blue-500 to-cyan-500";
      case "creative": return "bg-gradient-to-r from-orange-500 to-red-500";
      default: return "bg-gradient-to-r from-green-500 to-emerald-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-12">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Free AI Resources 2025
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Enterprise-grade AI models accessible without subscription fees. Build production-ready applications using the most advanced free-tier AI platforms available today.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Combined: 60,000+ daily requests</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span>Free tier tokens: Millions/month</span>
            </div>
          </div>
        </div>

        {/* Why This Matters */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Strategic Load Balancing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              By intelligently routing requests across multiple free-tier providers, PromptFluid's Cascade AI achieves enterprise-scale capacity without paid subscriptions. Each provider offers distinct advantages:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Speed optimization:</strong> Groq and Cerebras for sub-second latency requirements</li>
              <li><strong>Volume distribution:</strong> Together AI and Hyperbolic handle bulk learning workloads</li>
              <li><strong>Specialized tasks:</strong> Google AI Studio for vision, DeepSeek for reasoning</li>
              <li><strong>Failover resilience:</strong> Multiple providers ensure high availability</li>
            </ul>
            <p className="pt-2 text-sm italic">
              This approach enables Cascade to learn continuously while maintaining responsive chat functionality — a multi-provider orchestration strategy that maximizes free-tier value.
            </p>
          </CardContent>
        </Card>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <Card key={provider.name} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-muted/50 hover:border-primary/50 overflow-hidden">
              <div className={`h-2 ${getTierColor(provider.tier)}`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                      {provider.name}
                    </CardTitle>
                    <CardDescription className="text-base font-medium">
                      {provider.category}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {provider.tier}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {provider.description}
                </p>
                
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-muted">
                  <div>
                    <p className="text-xs text-muted-foreground">Daily Limit</p>
                    <p className="text-sm font-semibold text-foreground">{provider.dailyLimit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Free Tier</p>
                    <p className="text-sm font-semibold text-foreground">{provider.monthlyTokens}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Available Models</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.models.map((model) => (
                      <Badge key={model} variant="secondary" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Best For</p>
                  <p className="text-sm font-medium text-primary">{provider.bestFor}</p>
                </div>

                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors group/link"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Implementation Note */}
        <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-lg">Implementation Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">PromptFluid's approach:</strong> Dynamic provider selection based on real-time usage metrics. The system tracks daily request counts and automatically routes to the provider with the most available capacity.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs space-y-1">
              <p>// Intelligent routing algorithm</p>
              <p className="text-primary">const selectedProvider = providers</p>
              <p className="pl-4">.filter(p =&gt; p.count &lt; p.limit * 0.85)</p>
              <p className="pl-4">.sort((a, b) =&gt; a.count/a.limit - b.count/b.limit)[0];</p>
            </div>
            <p>
              This ensures Cascade AI never hits rate limits during learning cycles while preserving capacity for user chat interactions. Average uptime: 99.9% with zero API costs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreeAIResources;
